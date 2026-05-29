import { describe, expect, it } from "vitest";
import { collectStream } from "./helpers/collect.js";
import { createRealLlmClient, readRealLlmConfig } from "./helpers/config.js";

const config = readRealLlmConfig();

describe("GLM real-LLM stream", () => {
  it(
    "streaming yields contentDelta chunks that assemble into full response",
    { timeout: 30_000 },
    async () => {
      const client = createRealLlmClient();
      const gen = client.stream({
        model: config.model,
        messages: [{ role: "user", content: "Say hello in one word." }],
      });
      const chunks = await collectStream(gen);
      const full = chunks.map((c) => c.contentDelta ?? "").join("");
      expect(full.length).toBeGreaterThan(0);
    },
  );

  it("streaming includes usage in a late chunk", { timeout: 30_000 }, async () => {
    const client = createRealLlmClient();
    const gen = client.stream({
      model: config.model,
      messages: [{ role: "user", content: "Say hello in one word." }],
    });
    const chunks = await collectStream(gen);
    const withUsage = chunks.filter((c) => c.usage !== undefined);
    expect(withUsage.length).toBeGreaterThan(0);
    const usage = withUsage[withUsage.length - 1].usage!;
    expect(usage.promptTokens).toBeGreaterThan(0);
    expect(usage.completionTokens).toBeGreaterThan(0);
  });

  it("final chunk has finishReason", { timeout: 30_000 }, async () => {
    const client = createRealLlmClient();
    const gen = client.stream({
      model: config.model,
      messages: [{ role: "user", content: "Say hello in one word." }],
    });
    const chunks = await collectStream(gen);
    const withFinish = chunks.filter((c) => c.finishReason !== undefined);
    expect(withFinish.length).toBeGreaterThan(0);
  });
});
