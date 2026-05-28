import { describe, expect, it } from "vitest";
import type { ModelClient, ProviderCapabilities } from "../src/ports/model-client.js";
import { ProviderRegistry } from "../src/providers/registry.js";

function stubClient(caps: Partial<ProviderCapabilities> = {}): ModelClient {
  return {
    // biome-ignore lint/correctness/useYield: stub — no values to yield
    async *stream() {},
    async chat() {
      throw new Error("stub");
    },
    capabilities: {
      supportsThinking: caps.supportsThinking ?? false,
      supportsReasoningContent: caps.supportsReasoningContent ?? false,
    },
  };
}

describe("ProviderRegistry", () => {
  it("registers and resolves a provider", () => {
    const registry = new ProviderRegistry();
    const client = stubClient();
    registry.register("deepseek", () => client, ["deepseek-v4-flash"]);
    expect(registry.resolve("deepseek")).toBe(client);
  });

  it("caches client instances per provider", () => {
    const registry = new ProviderRegistry();
    let calls = 0;
    const factory = () => {
      calls++;
      return stubClient();
    };
    registry.register("deepseek", factory, ["deepseek-v4-flash"]);
    const a = registry.resolve("deepseek");
    const b = registry.resolve("deepseek");
    expect(a).toBe(b);
    expect(calls).toBe(1);
  });

  it("throws on unknown provider", () => {
    const registry = new ProviderRegistry();
    expect(() => registry.resolve("missing")).toThrow("not registered");
  });

  it("validates known models", () => {
    const registry = new ProviderRegistry();
    registry.register("deepseek", () => stubClient(), ["deepseek-v4-flash", "deepseek-v4-pro"]);
    expect(() => registry.validateModel("deepseek", "deepseek-v4-flash")).not.toThrow();
  });

  it("rejects unknown models", () => {
    const registry = new ProviderRegistry();
    registry.register("deepseek", () => stubClient(), ["deepseek-v4-flash"]);
    expect(() => registry.validateModel("deepseek", "unknown-model")).toThrow("not supported");
  });

  it("reports supported models", () => {
    const registry = new ProviderRegistry();
    registry.register("glm", () => stubClient(), ["glm-4", "glm-4-flash"]);
    expect(registry.supportedModels("glm")).toEqual(["glm-4", "glm-4-flash"]);
  });

  it("reports empty for unregistered provider", () => {
    const registry = new ProviderRegistry();
    expect(registry.supportedModels("missing")).toEqual([]);
  });

  it("has() checks registration", () => {
    const registry = new ProviderRegistry();
    registry.register("deepseek", () => stubClient(), []);
    expect(registry.has("deepseek")).toBe(true);
    expect(registry.has("glm")).toBe(false);
  });

  it("validates model against unregistered provider throws", () => {
    const registry = new ProviderRegistry();
    expect(() => registry.validateModel("missing", "any")).toThrow("not registered");
  });
});

describe("ModelClient port", () => {
  it("DeepSeekClient implements ModelClient", async () => {
    const { DeepSeekClient } = await import("../src/client.js");
    // Can't construct without API key, but verify it's a class that
    // has the right shape.
    expect(DeepSeekClient.prototype.chat).toBeDefined();
    expect(DeepSeekClient.prototype.stream).toBeDefined();
  });

  it("ProviderCapabilities is boolean-typed", () => {
    const caps: ProviderCapabilities = {
      supportsThinking: true,
      supportsReasoningContent: false,
    };
    expect(typeof caps.supportsThinking).toBe("boolean");
    expect(typeof caps.supportsReasoningContent).toBe("boolean");
  });
});
