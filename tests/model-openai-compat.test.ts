import { describe, expect, it, vi } from "vitest";
import { OpenAICompatClient } from "../src/adapters/model-openai-compat.js";

function makeFetchReturning(body: Record<string, unknown>, status = 200): typeof fetch {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

function makeStreamFetch(chunks: string[]): typeof fetch {
  return vi.fn(async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
      },
    });
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }) as unknown as typeof fetch;
}

function makeClient(fetch: typeof fetch) {
  return new OpenAICompatClient({
    apiKey: "test-key",
    baseUrl: "https://api.example.com",
    fetch,
    retry: { maxAttempts: 1 },
    timeoutMs: 5_000,
  });
}

describe("OpenAICompatClient.chat()", () => {
  it("sends POST to /chat/completions and returns parsed response", async () => {
    const fetch = makeFetchReturning({
      choices: [{ message: { content: "hello world", tool_calls: [] } }],
      usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
    });
    const client = makeClient(fetch);

    const resp = await client.chat({
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(resp.content).toBe("hello world");
    expect(resp.reasoningContent).toBeNull();
    expect(resp.toolCalls).toEqual([]);
    expect(resp.usage.promptTokens).toBe(5);
    expect(resp.raw).toBeTruthy();

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("throws on non-ok response", async () => {
    const fetch = makeFetchReturning({ error: "bad" }, 400);
    const client = makeClient(fetch);

    await expect(
      client.chat({ model: "test", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow("OpenAI-compat 400");
  });
});

describe("OpenAICompatClient.stream()", () => {
  it("parses SSE chunks into StreamChunk objects", async () => {
    const fetch = makeStreamFetch([
      'data: {"choices":[{"delta":{"content":"hel"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetch);

    const chunks: any[] = [];
    for await (const chunk of client.stream({
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(2);
    expect(chunks[0].contentDelta).toBe("hel");
    expect(chunks[1].contentDelta).toBe("lo");
  });

  it("parses tool_call deltas", async () => {
    const fetch = makeStreamFetch([
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_1","function":{"name":"read_file","arguments":"{/s"}}]}}]}\n\n',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"path}"}}]}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetch);

    const chunks: any[] = [];
    for await (const chunk of client.stream({
      model: "test-model",
      messages: [{ role: "user", content: "read file" }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(2);
    expect(chunks[0].toolCallDelta).toEqual({
      index: 0,
      id: "call_1",
      name: "read_file",
      argumentsDelta: "{/s",
    });
    expect(chunks[1].toolCallDelta?.argumentsDelta).toBe("path}");
  });

  it("parses usage from final chunk", async () => {
    const fetch = makeStreamFetch([
      'data: {"choices":[{"delta":{"content":"hi"}}]}\n\n',
      'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":10,"completion_tokens":3,"total_tokens":13}}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetch);

    const chunks: any[] = [];
    for await (const chunk of client.stream({
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks[1].usage).toBeTruthy();
    expect(chunks[1].usage.promptTokens).toBe(10);
    expect(chunks[1].usage.completionTokens).toBe(3);
  });

  it("throws on non-ok response", async () => {
    const fetch = vi.fn(
      async () => new Response("bad request", { status: 500 }),
    ) as unknown as typeof fetch;
    const client = makeClient(fetch);

    await expect(
      (async () => {
        for await (const _ of client.stream({
          model: "test",
          messages: [{ role: "user", content: "hi" }],
        })) {
          /* drain */
        }
      })(),
    ).rejects.toThrow("OpenAI-compat 500");
  });
});

describe("OpenAICompatClient capabilities", () => {
  it("defaults to supportsThinking=false and supportsReasoningContent=false", () => {
    const client = makeClient(vi.fn() as unknown as typeof fetch);
    expect(client.capabilities.supportsThinking).toBe(false);
    expect(client.capabilities.supportsReasoningContent).toBe(false);
  });
});

describe("OpenAICompatClient rate limiting", () => {
  it("respects minRequestIntervalMs between requests", async () => {
    const fetch = makeFetchReturning({
      choices: [{ message: { content: "ok" } }],
      usage: {},
    });
    const client = new OpenAICompatClient({
      apiKey: "test-key",
      baseUrl: "https://api.example.com",
      fetch,
      retry: { maxAttempts: 1 },
      timeoutMs: 5_000,
      minRequestIntervalMs: 50,
    });

    const start = Date.now();
    await client.chat({ model: "test", messages: [{ role: "user", content: "a" }] });
    await client.chat({ model: "test", messages: [{ role: "user", content: "b" }] });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});
