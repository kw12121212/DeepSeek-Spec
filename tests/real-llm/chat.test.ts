import { describe, expect, it } from "vitest";
import { createRealLlmClient, readRealLlmConfig } from "./helpers/config.js";

const config = readRealLlmConfig();

describe("GLM real-LLM chat", () => {
  it("returns non-empty content for a simple prompt", { timeout: 30_000 }, async () => {
    const client = createRealLlmClient();
    const res = await client.chat({
      model: config.model,
      messages: [{ role: "user", content: "Say hello in one word." }],
    });
    expect(typeof res.content).toBe("string");
    expect(res.content.length).toBeGreaterThan(0);
  });

  it("includes usage with positive token counts", { timeout: 30_000 }, async () => {
    const client = createRealLlmClient();
    const res = await client.chat({
      model: config.model,
      messages: [{ role: "user", content: "Say hello in one word." }],
    });
    expect(res.usage.promptTokens).toBeGreaterThan(0);
    expect(res.usage.completionTokens).toBeGreaterThan(0);
  });

  it("finishReason is stop", { timeout: 30_000 }, async () => {
    const client = createRealLlmClient();
    const res = await client.chat({
      model: config.model,
      messages: [{ role: "user", content: "Say hello in one word." }],
    });
    expect((res.raw as any).choices?.[0]?.finish_reason).toBe("stop");
  });

  it("multi-turn maintains context", { timeout: 30_000 }, async () => {
    const client = createRealLlmClient();
    const first = await client.chat({
      model: config.model,
      messages: [{ role: "user", content: "My name is TestBot." }],
    });

    const second = await client.chat({
      model: config.model,
      messages: [
        { role: "user", content: "My name is TestBot." },
        { role: "assistant", content: first.content },
        { role: "user", content: "What is my name?" },
      ],
    });

    expect(second.content.toLowerCase()).toContain("testbot");
  });
});
