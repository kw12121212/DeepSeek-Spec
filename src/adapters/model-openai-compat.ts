import { type EventSourceMessage, createParser } from "eventsource-parser";
import type { ModelClient } from "../ports/model-client.js";
import { type RetryOptions, fetchWithRetry } from "../retry.js";
import { type ChatRequestOptions, type ChatResponse, type StreamChunk, Usage } from "../types.js";

export interface OpenAICompatClientOptions {
  apiKey: string;
  baseUrl: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
  retry?: RetryOptions;
  minRequestIntervalMs?: number;
}

export class OpenAICompatClient implements ModelClient {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly retry: RetryOptions;
  readonly capabilities: { supportsThinking: boolean; supportsReasoningContent: boolean } = {
    supportsThinking: false,
    supportsReasoningContent: false,
  };
  protected readonly _fetch: typeof fetch;
  protected readonly minRequestIntervalMs: number;
  private nextRequestAt = 0;

  constructor(opts: OpenAICompatClientOptions) {
    this.apiKey = opts.apiKey;
    let url = opts.baseUrl;
    while (url.endsWith("/")) url = url.slice(0, -1);
    this.baseUrl = url;
    this.timeoutMs = opts.timeoutMs ?? 120_000;
    this._fetch = opts.fetch ?? globalThis.fetch.bind(globalThis);
    this.retry = opts.retry ?? {};
    this.minRequestIntervalMs = opts.minRequestIntervalMs ?? 0;
  }

  protected async waitForRateLimit(signal?: AbortSignal): Promise<void> {
    if (this.minRequestIntervalMs <= 0) return;
    const now = Date.now();
    const waitMs = Math.max(0, this.nextRequestAt - now);
    this.nextRequestAt = Math.max(now, this.nextRequestAt) + this.minRequestIntervalMs;
    if (waitMs <= 0) return;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, waitMs);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  }

  protected buildPayload(opts: ChatRequestOptions, stream: boolean): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      model: opts.model,
      messages: opts.messages,
      stream,
    };
    if (stream) payload.stream_options = { include_usage: true };
    if (opts.tools?.length) payload.tools = opts.tools;
    if (opts.temperature !== undefined) payload.temperature = opts.temperature;
    if (opts.maxTokens !== undefined) payload.max_tokens = opts.maxTokens;
    if (opts.responseFormat) payload.response_format = opts.responseFormat;
    return payload;
  }

  protected serializeBody(payload: unknown): string {
    return JSON.stringify(payload);
  }

  protected authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  protected parseChoice(
    choice: any,
  ): Pick<ChatResponse, "content" | "reasoningContent" | "toolCalls"> {
    return {
      content: choice.content ?? "",
      reasoningContent: null,
      toolCalls: choice.tool_calls ?? [],
    };
  }

  protected parseStreamDelta(delta: any, json: any): StreamChunk {
    const chunk: StreamChunk = {
      raw: json,
      finishReason: json.choices?.[0]?.finish_reason ?? undefined,
    };
    if (typeof delta.content === "string" && delta.content.length > 0) {
      chunk.contentDelta = delta.content;
    }
    if (Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0) {
      const tc = delta.tool_calls[0];
      chunk.toolCallDelta = {
        index: tc.index ?? 0,
        id: tc.id,
        name: tc.function?.name,
        argumentsDelta: tc.function?.arguments,
      };
    }
    const rawUsage = json.usage ?? (Usage.hasApiUsage(json) ? json : undefined);
    if (rawUsage) {
      chunk.usage = Usage.fromApi(rawUsage);
    }
    return chunk;
  }

  protected providerLabel(): string {
    return "OpenAI-compat";
  }

  async chat(opts: ChatRequestOptions): Promise<ChatResponse> {
    const ctrl = new AbortController();
    const timer = setTimeout(
      () =>
        ctrl.abort(
          new Error(`${this.providerLabel()} request timed out after ${this.timeoutMs}ms`),
        ),
      this.timeoutMs,
    );
    const signal = opts.signal ? AbortSignal.any([opts.signal, ctrl.signal]) : ctrl.signal;

    try {
      await this.waitForRateLimit(signal);
      const resp = await fetchWithRetry(
        this._fetch,
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: { ...this.authHeaders(), "Content-Type": "application/json" },
          body: this.serializeBody(this.buildPayload(opts, false)),
          signal,
        },
        { ...this.retry, signal },
      );
      if (!resp.ok) {
        throw new Error(`${this.providerLabel()} ${resp.status}: ${await resp.text()}`);
      }
      const data: any = await resp.json();
      const choice = data.choices?.[0]?.message ?? {};
      const parsed = this.parseChoice(choice);
      return {
        content: parsed.content,
        reasoningContent: parsed.reasoningContent,
        toolCalls: parsed.toolCalls,
        usage: Usage.fromApi(data.usage ?? data),
        raw: data,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async *stream(opts: ChatRequestOptions): AsyncGenerator<StreamChunk> {
    const ctrl = new AbortController();
    const timer = setTimeout(
      () =>
        ctrl.abort(new Error(`${this.providerLabel()} stream timed out after ${this.timeoutMs}ms`)),
      this.timeoutMs,
    );
    const signal = opts.signal ? AbortSignal.any([opts.signal, ctrl.signal]) : ctrl.signal;

    let resp: Response;
    try {
      await this.waitForRateLimit(signal);
      resp = await fetchWithRetry(
        this._fetch,
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            ...this.authHeaders(),
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: this.serializeBody(this.buildPayload(opts, true)),
          signal,
        },
        { ...this.retry, signal },
      );
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
    if (!resp.ok || !resp.body) {
      clearTimeout(timer);
      throw new Error(
        `${this.providerLabel()} ${resp.status}: ${await resp.text().catch(() => "")}`,
      );
    }

    const queue: StreamChunk[] = [];
    let done = false;
    const self = this;
    const parser = createParser({
      onEvent(ev: EventSourceMessage) {
        if (!ev.data || ev.data === "[DONE]") {
          done = true;
          return;
        }
        try {
          const json = JSON.parse(ev.data);
          const delta = json.choices?.[0]?.delta ?? {};
          queue.push(self.parseStreamDelta(delta, json));
        } catch {
          /* skip malformed sse frame */
        }
      },
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift()!;
          continue;
        }
        if (done) break;
        let value: Uint8Array | undefined;
        let streamDone: boolean;
        try {
          ({ value, done: streamDone } = await reader.read());
        } catch (readErr) {
          const cause = readErr instanceof Error ? readErr : new Error(String(readErr));
          const code = "code" in cause && typeof cause.code === "string" ? cause.code : undefined;
          throw Object.assign(new Error(`SSE body read failed: ${cause.message}`), {
            phase: "stream_body_read" as const,
            code,
          });
        }
        if (streamDone) break;
        parser.feed(decoder.decode(value, { stream: true }));
      }
      while (queue.length > 0) yield queue.shift()!;
    } finally {
      clearTimeout(timer);
      reader.releaseLock();
    }
  }
}
