import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { GLMClient } from "../../src/adapters/model-glm.js";
import { loadGlmApiKey, loadGlmBaseUrl } from "../../src/config.js";

vi.mock("../../src/config.js", () => ({
  loadGlmApiKey: vi.fn(),
  loadGlmBaseUrl: vi.fn(),
}));

const mockLoadGlmApiKey = vi.mocked(loadGlmApiKey);
const mockLoadGlmBaseUrl = vi.mocked(loadGlmBaseUrl);

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(__dirname, "fixtures", "glm");

function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, name), "utf8");
}

type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function makeStreamFetchFromFixture(fixtureName: string): FetchFn {
  const raw = loadFixture(fixtureName);
  return vi.fn(async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(raw));
        controller.close();
      },
    });
    return new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  }) as unknown as FetchFn;
}

function makeStreamFetchWithError(status: number, body: string): FetchFn {
  return vi.fn(async () => new Response(body, { status })) as unknown as FetchFn;
}

function makeGLMClient(fetchFn: FetchFn) {
  mockLoadGlmApiKey.mockReturnValue("test-zhipu-key");
  mockLoadGlmBaseUrl.mockReturnValue(undefined);
  return new GLMClient({ fetch: fetchFn as typeof globalThis.fetch, timeoutMs: 5_000 });
}

async function collectStream(client: GLMClient, opts: Parameters<typeof client.stream>[0]) {
  const chunks: ReturnType<typeof client.stream> extends AsyncGenerator<infer T> ? T[] : never = [];
  for await (const chunk of client.stream(opts)) {
    chunks.push(chunk as any);
  }
  return chunks;
}

describe("GLM integration: basic chat", () => {
  it("assembles streaming content deltas into complete response", async () => {
    const fetch = makeStreamFetchFromFixture("basic-chat.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "hi" }],
    });

    const assembled = chunks.map((c) => c.contentDelta ?? "").join("");
    expect(assembled).toBe("Hello world!");
  });

  it("receives usage tracking in final chunk", async () => {
    const fetch = makeStreamFetchFromFixture("usage-tracking.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "hi" }],
    });

    const usageChunk = chunks.find((c) => c.usage);
    expect(usageChunk).toBeTruthy();
    expect(usageChunk!.usage!.promptTokens).toBe(42);
    expect(usageChunk!.usage!.completionTokens).toBe(18);
    expect(usageChunk!.usage!.totalTokens).toBe(60);
  });
});

describe("GLM integration: streaming fidelity", () => {
  it("delta chunk boundaries match fixture SSE lines", async () => {
    const fetch = makeStreamFetchFromFixture("basic-chat.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(chunks).toHaveLength(4);
    expect(chunks[0].contentDelta).toBe("Hello");
    expect(chunks[1].contentDelta).toBe(" world");
    expect(chunks[2].contentDelta).toBe("!");
    expect(chunks[3].contentDelta).toBeUndefined();
    expect(chunks[3].finishReason).toBe("stop");
  });
});

describe("GLM integration: tool-call invocation", () => {
  it("parses tool-call name and JSON arguments", async () => {
    const fetch = makeStreamFetchFromFixture("tool-call.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "read the file" }],
      tools: [
        {
          type: "function",
          function: { name: "read_file", description: "Read a file", parameters: {} },
        },
      ],
    });

    const toolChunks = chunks.filter((c) => c.toolCallDelta);
    expect(toolChunks.length).toBeGreaterThanOrEqual(1);

    const first = toolChunks[0];
    expect(first.toolCallDelta!.id).toBe("call_glm_001");
    expect(first.toolCallDelta!.name).toBe("read_file");

    const assembledArgs = toolChunks.map((c) => c.toolCallDelta!.argumentsDelta ?? "").join("");
    expect(assembledArgs).toBe('{"filepath":"src/index.ts"}');
  });

  it("finish_reason is tool_calls for tool-call responses", async () => {
    const fetch = makeStreamFetchFromFixture("tool-call.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "read" }],
    });

    const finishChunk = chunks.find((c) => c.finishReason);
    expect(finishChunk).toBeTruthy();
    expect(finishChunk!.finishReason).toBe("tool_calls");
  });
});

describe("GLM integration: parallel tool calls", () => {
  it("assembles arguments for multiple tool_calls in a single response", async () => {
    const fetch = makeStreamFetchFromFixture("parallel-tool-calls.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "read both files" }],
    });

    const toolChunks = chunks.filter((c) => c.toolCallDelta);
    expect(toolChunks.length).toBeGreaterThanOrEqual(2);

    const byIndex = new Map<number, string[]>();
    for (const c of toolChunks) {
      const idx = c.toolCallDelta!.index;
      if (!byIndex.has(idx)) byIndex.set(idx, []);
      byIndex.get(idx)!.push(c.toolCallDelta!.argumentsDelta ?? "");
    }

    expect(byIndex.size).toBe(2);
    const args0 = byIndex.get(0)!.join("");
    const args1 = byIndex.get(1)!.join("");
    expect(JSON.parse(args0)).toEqual({ file: "a.ts" });
    expect(JSON.parse(args1)).toEqual({ file: "b.ts" });
  });
});

describe("GLM integration: stop reasons", () => {
  it('finish_reason "stop" for normal completions', async () => {
    const fetch = makeStreamFetchFromFixture("stop-reason-stop.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "short" }],
    });

    const finish = chunks.find((c) => c.finishReason);
    expect(finish?.finishReason).toBe("stop");
  });

  it('finish_reason "tool_calls" for tool-use completions', async () => {
    const fetch = makeStreamFetchFromFixture("stop-reason-tool-calls.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "run" }],
    });

    const finish = chunks.find((c) => c.finishReason);
    expect(finish?.finishReason).toBe("tool_calls");
  });
});

describe("GLM integration: empty content", () => {
  it("tool-call-only turn with null content field", async () => {
    const fetch = makeStreamFetchFromFixture("empty-content.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "search" }],
    });

    const contentChunks = chunks.filter((c) => c.contentDelta);
    expect(contentChunks).toHaveLength(0);

    const toolChunks = chunks.filter((c) => c.toolCallDelta);
    expect(toolChunks.length).toBeGreaterThanOrEqual(1);
    expect(toolChunks[0].toolCallDelta!.name).toBe("search");
  });
});

describe("GLM integration: long response", () => {
  it("multi-KB content streamed in full without truncation", async () => {
    const fetch = makeStreamFetchFromFixture("long-response.sse");
    const client = makeGLMClient(fetch);
    const chunks = await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "long" }],
    });

    const assembled = chunks.map((c) => c.contentDelta ?? "").join("");
    expect(assembled.length).toBeGreaterThan(500);
    expect(assembled).toContain("Lorem ipsum");
    expect(assembled).toContain("ullamco laboris");
  });
});

describe("GLM integration: JWT auth / Bearer token", () => {
  it("sends Authorization Bearer header with raw API key", async () => {
    mockLoadGlmApiKey.mockReturnValue("my-id.my-secret");
    mockLoadGlmBaseUrl.mockReturnValue(undefined);
    const fetchFn = makeStreamFetchFromFixture("basic-chat.sse");
    const client = new GLMClient({ fetch: fetchFn as typeof globalThis.fetch, timeoutMs: 5_000 });

    await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "hi" }],
    });

    expect(fetchFn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-id.my-secret",
        }),
      }),
    );
  });
});

describe("GLM integration: error responses", () => {
  it("throws on 401 auth error", async () => {
    const fetch = makeStreamFetchWithError(401, '{"error":{"message":"Invalid API key"}}');
    const client = makeGLMClient(fetch);

    await expect(
      (async () => {
        for await (const _ of client.stream({
          model: "glm-4",
          messages: [{ role: "user", content: "hi" }],
        })) {
          /* drain */
        }
      })(),
    ).rejects.toThrow("GLM 401");
  });

  it("throws on 429 rate limit", async () => {
    const fetch = makeStreamFetchWithError(429, '{"error":{"message":"Rate limit exceeded"}}');
    const client = makeGLMClient(fetch);

    await expect(
      (async () => {
        for await (const _ of client.stream({
          model: "glm-4",
          messages: [{ role: "user", content: "hi" }],
        })) {
          /* drain */
        }
      })(),
    ).rejects.toThrow("GLM 429");
  });

  it("throws on context-length exceeded", async () => {
    const fetch = makeStreamFetchWithError(
      400,
      '{"error":{"message":"maximum context length exceeded"}}',
    );
    const client = makeGLMClient(fetch);

    await expect(
      (async () => {
        for await (const _ of client.stream({
          model: "glm-4",
          messages: [{ role: "user", content: "huge" }],
        })) {
          /* drain */
        }
      })(),
    ).rejects.toThrow("GLM 400");
  });
});

describe("GLM integration: no thinking params", () => {
  it("request body does not contain thinking or reasoning_effort fields", async () => {
    const fetchFn = makeStreamFetchFromFixture("basic-chat.sse");
    const client = makeGLMClient(fetchFn);

    await collectStream(client, {
      model: "glm-4",
      messages: [{ role: "user", content: "hi" }],
    });

    const mockFn = fetchFn as ReturnType<typeof vi.fn>;
    const call = mockFn.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(call[1].body as string);
    expect(body).not.toHaveProperty("thinking");
    expect(body).not.toHaveProperty("reasoning_effort");
  });

  it("capabilities do not support thinking", () => {
    const client = makeGLMClient(vi.fn() as unknown as FetchFn);
    expect(client.capabilities.supportsThinking).toBe(false);
    expect(client.capabilities.supportsReasoningContent).toBe(false);
  });
});
