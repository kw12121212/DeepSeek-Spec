import { afterEach, describe, expect, it } from "vitest";
import { loadActiveProvider, modelToProvider } from "../../src/config.js";
import type { ModelClient, ProviderCapabilities } from "../../src/ports/model-client.js";
import { ProviderRegistry } from "../../src/providers/registry.js";

function stubClient(caps: Partial<ProviderCapabilities> = {}): ModelClient {
  return {
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

describe("ProviderRegistry: resolve", () => {
  it("resolves deepseek to registered DeepSeekClient factory", () => {
    const registry = new ProviderRegistry();
    const client = stubClient({ supportsThinking: true, supportsReasoningContent: true });
    registry.register("deepseek", () => client, ["deepseek-v4-flash", "deepseek-v4-pro"]);
    expect(registry.resolve("deepseek")).toBe(client);
  });

  it("resolves glm to registered GLMClient factory", () => {
    const registry = new ProviderRegistry();
    const client = stubClient();
    registry.register("glm", () => client, ["glm-4", "glm-5.1"]);
    expect(registry.resolve("glm")).toBe(client);
  });

  it("caches instances across multiple resolve calls", () => {
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

  it("throws for unregistered provider", () => {
    const registry = new ProviderRegistry();
    expect(() => registry.resolve("missing")).toThrow("not registered");
  });
});

describe("ProviderRegistry: validateModel", () => {
  it("accepts known models for deepseek", () => {
    const registry = new ProviderRegistry();
    registry.register("deepseek", () => stubClient(), ["deepseek-v4-flash", "deepseek-v4-pro"]);
    expect(() => registry.validateModel("deepseek", "deepseek-v4-flash")).not.toThrow();
    expect(() => registry.validateModel("deepseek", "deepseek-v4-pro")).not.toThrow();
  });

  it("accepts known models for glm", () => {
    const registry = new ProviderRegistry();
    registry.register("glm", () => stubClient(), ["glm-4.7", "glm-5.1", "glm-5-turbo"]);
    expect(() => registry.validateModel("glm", "glm-5.1")).not.toThrow();
  });

  it("rejects unknown model for registered provider", () => {
    const registry = new ProviderRegistry();
    registry.register("glm", () => stubClient(), ["glm-4"]);
    expect(() => registry.validateModel("glm", "unknown-model")).toThrow("not supported");
  });

  it("throws for unregistered provider", () => {
    const registry = new ProviderRegistry();
    expect(() => registry.validateModel("missing", "any")).toThrow("not registered");
  });
});

describe("ProviderRegistry: modelToProvider mapping", () => {
  it('maps deepseek-* to "deepseek"', () => {
    expect(modelToProvider("deepseek-v4-pro")).toBe("deepseek");
    expect(modelToProvider("deepseek-v4-flash")).toBe("deepseek");
  });

  it('maps glm-* to "glm"', () => {
    expect(modelToProvider("glm-4")).toBe("glm");
    expect(modelToProvider("glm-5.1")).toBe("glm");
    expect(modelToProvider("glm-5-turbo")).toBe("glm");
  });

  it("falls back to active provider for unknown prefix", () => {
    expect(modelToProvider("unknown-model", "glm")).toBe("glm");
    expect(modelToProvider("unknown-model", "deepseek")).toBe("deepseek");
  });

  it("falls back to loadActiveProvider when no explicit provider given", () => {
    const orig = process.env.REASONIX_PROVIDER;
    process.env.REASONIX_PROVIDER = "glm";
    try {
      expect(modelToProvider("mystery-model")).toBe("glm");
    } finally {
      if (orig === undefined) {
        process.env.REASONIX_PROVIDER = undefined;
      } else {
        process.env.REASONIX_PROVIDER = orig;
      }
    }
  });
});

describe("ProviderRegistry: loadActiveProvider", () => {
  const origProvider = process.env.REASONIX_PROVIDER;

  afterEach(() => {
    if (origProvider === undefined) {
      process.env.REASONIX_PROVIDER = undefined;
    } else {
      process.env.REASONIX_PROVIDER = origProvider;
    }
  });

  it("returns glm when REASONIX_PROVIDER env is glm", () => {
    process.env.REASONIX_PROVIDER = "glm";
    expect(loadActiveProvider()).toBe("glm");
  });

  it("returns deepseek when REASONIX_PROVIDER env is deepseek", () => {
    process.env.REASONIX_PROVIDER = "deepseek";
    expect(loadActiveProvider()).toBe("deepseek");
  });

  it("defaults to deepseek when env is unset", () => {
    process.env.REASONIX_PROVIDER = undefined;
    expect(loadActiveProvider()).toBe("deepseek");
  });

  it("ignores invalid env values and falls back to deepseek", () => {
    process.env.REASONIX_PROVIDER = "claude";
    expect(loadActiveProvider()).toBe("deepseek");
  });
});

describe("ProviderRegistry: capability flags", () => {
  it("deepseek client has supportsThinking=true", () => {
    const registry = new ProviderRegistry();
    registry.register(
      "deepseek",
      () => stubClient({ supportsThinking: true, supportsReasoningContent: true }),
      [],
    );
    const client = registry.resolve("deepseek");
    expect(client.capabilities.supportsThinking).toBe(true);
    expect(client.capabilities.supportsReasoningContent).toBe(true);
  });

  it("glm client has supportsThinking=false", () => {
    const registry = new ProviderRegistry();
    registry.register("glm", () => stubClient(), []);
    const client = registry.resolve("glm");
    expect(client.capabilities.supportsThinking).toBe(false);
    expect(client.capabilities.supportsReasoningContent).toBe(false);
  });
});

describe("ProviderRegistry: supportedModels and has", () => {
  it("returns registered models for a provider", () => {
    const registry = new ProviderRegistry();
    registry.register("glm", () => stubClient(), ["glm-4.7", "glm-5.1"]);
    expect(registry.supportedModels("glm")).toEqual(["glm-4.7", "glm-5.1"]);
  });

  it("returns empty for unregistered provider", () => {
    const registry = new ProviderRegistry();
    expect(registry.supportedModels("missing")).toEqual([]);
  });

  it("has() returns true for registered provider", () => {
    const registry = new ProviderRegistry();
    registry.register("deepseek", () => stubClient(), []);
    expect(registry.has("deepseek")).toBe(true);
    expect(registry.has("glm")).toBe(false);
  });
});
