import { OpenAICompatClient } from "./adapters/model-openai-compat.js";
import { loadRateLimit, resolveBaseUrlEnv } from "./config.js";
import type { RetryOptions } from "./retry.js";
import type { ChatMessage, ChatRequestOptions, ToolCall, ToolSpec } from "./types.js";

export { Usage } from "./types.js";
export type { ChatResponse, StreamChunk } from "./types.js";

export interface BalanceInfo {
  currency: string;
  total_balance: string;
  granted_balance?: string;
  topped_up_balance?: string;
}

export interface UserBalance {
  is_available: boolean;
  balance_infos: BalanceInfo[];
}

export function pickPrimaryBalance(infos: ReadonlyArray<BalanceInfo>): BalanceInfo | null {
  if (infos.length === 0) return null;
  let best = infos[0]!;
  for (let i = 1; i < infos.length; i++) {
    if (Number(infos[i]!.total_balance) > Number(best.total_balance)) best = infos[i]!;
  }
  return best;
}

export interface ModelInfo {
  id: string;
  object: "model";
  owned_by: string;
}

export interface ModelList {
  object: "list";
  data: ModelInfo[];
}

export interface DeepSeekClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
  rateLimit?: { rpm?: number };
  retry?: RetryOptions;
}

function replaceLoneSurrogates(value: string): string {
  let out = "";
  let last = 0;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        i++;
      } else {
        out += value.slice(last, i);
        out += "�";
        last = i + 1;
      }
      continue;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      out += value.slice(last, i);
      out += "�";
      last = i + 1;
    }
  }
  if (last === 0) return value;
  return out + value.slice(last);
}

function sanitizeJsonTransportValue(value: unknown): unknown {
  if (typeof value === "string") return replaceLoneSurrogates(value);
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeJsonTransportValue(item));
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = sanitizeJsonTransportValue(item);
  }
  return out;
}

function stringifyJsonTransport(value: unknown): string {
  return JSON.stringify(sanitizeJsonTransportValue(value));
}

export class DeepSeekClient extends OpenAICompatClient {
  override readonly capabilities = { supportsThinking: true, supportsReasoningContent: true };

  constructor(opts: DeepSeekClientOptions = {}) {
    const apiKey = opts.apiKey ?? process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error(
        "DEEPSEEK_API_KEY is not set. Put it in .env or pass apiKey to DeepSeekClient.",
      );
    }
    const rpm = opts.rateLimit?.rpm ?? loadRateLimit()?.rpm;
    super({
      apiKey,
      baseUrl: opts.baseUrl ?? resolveBaseUrlEnv() ?? "https://api.deepseek.com",
      timeoutMs: opts.timeoutMs ?? 660_000,
      fetch: opts.fetch,
      retry: opts.retry,
      minRequestIntervalMs: rpm ? Math.ceil(60_000 / rpm) : 0,
    });
  }

  override buildPayload(opts: ChatRequestOptions, stream: boolean) {
    const payload = super.buildPayload(opts, stream);
    if (opts.thinking && !this._isAzureEndpoint()) {
      payload.extra_body = { thinking: { type: opts.thinking } };
    }
    if (opts.reasoningEffort) {
      payload.reasoning_effort = opts.reasoningEffort;
    }
    return payload;
  }

  override serializeBody(payload: unknown): string {
    return stringifyJsonTransport(payload);
  }

  override parseChoice(choice: any) {
    return {
      content: choice.content ?? "",
      reasoningContent: choice.reasoning_content ?? null,
      toolCalls: choice.tool_calls ?? [],
    };
  }

  override parseStreamDelta(delta: any, json: any) {
    const chunk = super.parseStreamDelta(delta, json);
    if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
      chunk.reasoningDelta = delta.reasoning_content;
    }
    return chunk;
  }

  override providerLabel(): string {
    return "DeepSeek";
  }

  private _isAzureEndpoint(): boolean {
    try {
      const host = new URL(this.baseUrl).hostname;
      return host === "azure.com" || host.endsWith(".azure.com");
    } catch {
      return false;
    }
  }

  async getBalance(opts: { signal?: AbortSignal } = {}): Promise<UserBalance | null> {
    try {
      const resp = await this._fetch(`${this.baseUrl}/user/balance`, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: opts.signal,
      });
      if (!resp.ok) return null;
      const data = (await resp.json()) as UserBalance;
      if (!data || !Array.isArray(data.balance_infos)) return null;
      return data;
    } catch {
      return null;
    }
  }

  async listModels(opts: { signal?: AbortSignal } = {}): Promise<ModelList | null> {
    try {
      const resp = await this._fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: opts.signal,
      });
      if (!resp.ok) return null;
      const data = (await resp.json()) as ModelList;
      if (!data || !Array.isArray(data.data)) return null;
      return data;
    } catch {
      return null;
    }
  }
}

export type { ChatMessage, ToolCall, ToolSpec };
