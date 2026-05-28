import { describe, expect, it, vi } from "vitest";
import { OpenAICompatClient } from "../../src/adapters/model-openai-compat.js";

type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function makeStreamFetch(chunks: string[]): FetchFn {
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
  }) as unknown as FetchFn;
}

function makeFetchReturning(body: Record<string, unknown>, status = 200): FetchFn {
  return vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  ) as unknown as FetchFn;
}

function makeClient(fetchFn: FetchFn) {
  return new OpenAICompatClient({
    apiKey: "test-key",
    baseUrl: "https://api.example.com",
    fetch: fetchFn as typeof globalThis.fetch,
    retry: { maxAttempts: 1 },
    timeoutMs: 5_000,
  });
}

async function collectStream(
  client: OpenAICompatClient,
  opts: Parameters<typeof client.stream>[0],
) {
  const chunks: any[] = [];
  for await (const chunk of client.stream(opts)) {
    chunks.push(chunk);
  }
  return chunks;
}

describe("OpenAICompatClient regression: streaming fidelity", () => {
  it("parses standard OpenAI SSE content deltas correctly", async () => {
    const fetchFn = makeStreamFetch([
      'data: {"choices":[{"delta":{"content":"hel"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetchFn);
    const chunks = await collectStream(client, {
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(chunks).toHaveLength(2);
    expect(chunks[0].contentDelta).toBe("hel");
    expect(chunks[1].contentDelta).toBe("lo");
  });

  it("assembles multi-chunk content into full text", async () => {
    const fetchFn = makeStreamFetch([
      'data: {"choices":[{"delta":{"content":"The "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"quick "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"fox"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetchFn);
    const chunks = await collectStream(client, {
      model: "test-model",
      messages: [{ role: "user", content: "write" }],
    });

    const assembled = chunks.map((c) => c.contentDelta ?? "").join("");
    expect(assembled).toBe("The quick fox");
  });

  it("parses tool_call deltas with incremental arguments", async () => {
    const fetchFn = makeStreamFetch([
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_1","function":{"name":"edit","arguments":""}}]}}]}\n\n',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\"file\\":\\""}}]}}]}\n\n',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"a.ts\\"}"}}]}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetchFn);
    const chunks = await collectStream(client, {
      model: "test-model",
      messages: [{ role: "user", content: "edit" }],
    });

    const toolChunks = chunks.filter((c) => c.toolCallDelta);
    const args = toolChunks.map((c) => c.toolCallDelta!.argumentsDelta ?? "").join("");
    expect(JSON.parse(args)).toEqual({ file: "a.ts" });
    expect(toolChunks[0].toolCallDelta!.id).toBe("call_1");
    expect(toolChunks[0].toolCallDelta!.name).toBe("edit");
  });

  it("parses usage from final streaming chunk", async () => {
    const fetchFn = makeStreamFetch([
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
      'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":100,"completion_tokens":50,"total_tokens":150}}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetchFn);
    const chunks = await collectStream(client, {
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    });

    const usageChunk = chunks.find((c) => c.usage);
    expect(usageChunk).toBeTruthy();
    expect(usageChunk!.usage!.promptTokens).toBe(100);
    expect(usageChunk!.usage!.completionTokens).toBe(50);
    expect(usageChunk!.usage!.totalTokens).toBe(150);
  });

  it("reports finish_reason from streaming response", async () => {
    const fetchFn = makeStreamFetch([
      'data: {"choices":[{"delta":{"content":"done"}}]}\n\n',
      'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetchFn);
    const chunks = await collectStream(client, {
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    });

    const finish = chunks.find((c) => c.finishReason);
    expect(finish?.finishReason).toBe("stop");
  });
});

describe("OpenAICompatClient regression: chat() non-streaming", () => {
  it("returns parsed ChatResponse with content and usage", async () => {
    const fetchFn = makeFetchReturning({
      choices: [
        {
          message: {
            content: "Hello from chat",
            tool_calls: [],
          },
        },
      ],
      usage: { prompt_tokens: 8, completion_tokens: 3, total_tokens: 11 },
    });
    const client = makeClient(fetchFn);

    const resp = await client.chat({
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(resp.content).toBe("Hello from chat");
    expect(resp.toolCalls).toEqual([]);
    expect(resp.usage.promptTokens).toBe(8);
    expect(resp.usage.completionTokens).toBe(3);
  });

  it("returns tool_calls from non-streaming response", async () => {
    const fetchFn = makeFetchReturning({
      choices: [
        {
          message: {
            content: null,
            tool_calls: [
              {
                id: "call_2",
                type: "function",
                function: { name: "run", arguments: '{"cmd":"ls"}' },
              },
            ],
          },
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    });
    const client = makeClient(fetchFn);

    const resp = await client.chat({
      model: "test-model",
      messages: [{ role: "user", content: "list" }],
    });

    expect(resp.content).toBe("");
    expect(resp.toolCalls).toHaveLength(1);
    expect(resp.toolCalls[0].id).toBe("call_2");
    expect(resp.toolCalls[0].function.name).toBe("run");
  });

  it("throws on non-ok response", async () => {
    const fetchFn = makeFetchReturning({ error: "bad" }, 500);
    const client = makeClient(fetchFn);

    await expect(
      client.chat({ model: "test", messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toThrow("OpenAI-compat 500");
  });
});

describe("OpenAICompatClient regression: error handling", () => {
  it("throws on non-ok streaming response", async () => {
    const fetchFn = vi.fn(
      async () => new Response("server error", { status: 503 }),
    ) as unknown as FetchFn;
    const client = makeClient(fetchFn);

    await expect(
      (async () => {
        for await (const _ of client.stream({
          model: "test",
          messages: [{ role: "user", content: "hi" }],
        })) {
          /* drain */
        }
      })(),
    ).rejects.toThrow("OpenAI-compat 503");
  });

  it("skips malformed SSE frames without crashing", async () => {
    const fetchFn = makeStreamFetch([
      'data: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
      "data: not-json\n\n",
      'data: {"choices":[{"delta":{"content":"!"}}]}\n\n',
      "data: [DONE]\n\n",
    ]);
    const client = makeClient(fetchFn);
    const chunks = await collectStream(client, {
      model: "test-model",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(chunks).toHaveLength(2);
    expect(chunks[0].contentDelta).toBe("ok");
    expect(chunks[1].contentDelta).toBe("!");
  });
});

describe("OpenAICompatClient regression: auth and request shape", () => {
  it("sends Bearer token in Authorization header", async () => {
    const fetchFn = makeFetchReturning({
      choices: [{ message: { content: "ok" } }],
      usage: {},
    });
    const client = makeClient(fetchFn);

    await client.chat({ model: "test", messages: [{ role: "user", content: "hi" }] });

    expect(fetchFn).toHaveBeenCalledWith(
      "https://api.example.com/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
        }),
      }),
    );
  });

  it("sends POST method with JSON content type", async () => {
    const fetchFn = makeFetchReturning({
      choices: [{ message: { content: "ok" } }],
      usage: {},
    });
    const client = makeClient(fetchFn);

    await client.chat({ model: "test", messages: [{ role: "user", content: "hi" }] });

    expect(fetchFn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});
