import { describe, expect, it } from "vitest";
import { GLMClient } from "../../src/adapters/model-glm.js";
import { hasRealLlmConfig, readRealLlmConfig } from "./helpers/config.js";

describe.skipIf(!hasRealLlmConfig())("GLM real-LLM errors", () => {
  it("throws readable error on invalid API key", { timeout: 30_000 }, async () => {
    const config = readRealLlmConfig();
    const client = new GLMClient({
      apiKey: "invalid.key123",
      baseUrl: config.baseUrl,
    });
    await expect(
      client.chat({
        model: config.model,
        messages: [{ role: "user", content: "ping" }],
      }),
    ).rejects.toThrow(/40[13]/);
  });
});
