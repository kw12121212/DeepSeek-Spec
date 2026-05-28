import { describe, expect, it, vi } from "vitest";

vi.mock("../src/config.js", () => ({
  loadGlmApiKey: vi.fn(),
  loadGlmBaseUrl: vi.fn(),
}));

import { GLMClient } from "../src/adapters/model-glm.js";
import { loadGlmApiKey, loadGlmBaseUrl } from "../src/config.js";

const mockLoadGlmApiKey = vi.mocked(loadGlmApiKey);
const mockLoadGlmBaseUrl = vi.mocked(loadGlmBaseUrl);

function makeClient(opts: { apiKey?: string; baseUrl?: string } = {}) {
  mockLoadGlmApiKey.mockReturnValue(opts.apiKey ?? "test-zhipu-key");
  mockLoadGlmBaseUrl.mockReturnValue(opts.baseUrl ?? undefined);
  return new GLMClient({ fetch: vi.fn() as unknown as typeof fetch });
}

describe("GLMClient construction", () => {
  it("uses default baseUrl https://open.bigmodel.cn/api/paas/v4", () => {
    const client = makeClient();
    expect(client.baseUrl).toBe("https://open.bigmodel.cn/api/paas/v4");
  });

  it("uses explicit baseUrl when provided", () => {
    const client = makeClient({ baseUrl: "https://custom.api.com/v4" });
    expect(client.baseUrl).toBe("https://custom.api.com/v4");
  });

  it("uses baseUrl from loadGlmBaseUrl when no explicit override", () => {
    mockLoadGlmApiKey.mockReturnValue("key");
    mockLoadGlmBaseUrl.mockReturnValue("https://from-config.com/v4");
    const client = new GLMClient({ fetch: vi.fn() as unknown as typeof fetch });
    expect(client.baseUrl).toBe("https://from-config.com/v4");
  });

  it("strips trailing slashes from baseUrl", () => {
    const client = makeClient({ baseUrl: "https://api.example.com/v4/" });
    expect(client.baseUrl).toBe("https://api.example.com/v4");
  });

  it("uses apiKey from options when provided", () => {
    const client = makeClient({ apiKey: "explicit-key" });
    expect(client.apiKey).toBe("explicit-key");
  });

  it("falls back to loadGlmApiKey when no explicit apiKey", () => {
    mockLoadGlmApiKey.mockReturnValue("config-key");
    mockLoadGlmBaseUrl.mockReturnValue(undefined);
    const client = new GLMClient({ fetch: vi.fn() as unknown as typeof fetch });
    expect(client.apiKey).toBe("config-key");
  });

  it("throws when no API key is available", () => {
    mockLoadGlmApiKey.mockReturnValue(undefined);
    mockLoadGlmBaseUrl.mockReturnValue(undefined);
    expect(() => new GLMClient()).toThrow("Zhipu API key is not set");
  });
});

describe("GLMClient authHeaders", () => {
  it("sends raw Bearer token matching base class behavior", () => {
    const client = makeClient({ apiKey: "abc123.secret456" });
    const headers = (client as unknown as { authHeaders(): Record<string, string> }).authHeaders();
    expect(headers).toEqual({ Authorization: "Bearer abc123.secret456" });
  });
});

describe("GLMClient capabilities", () => {
  it("defaults to supportsThinking=false and supportsReasoningContent=false", () => {
    const client = makeClient();
    expect(client.capabilities.supportsThinking).toBe(false);
    expect(client.capabilities.supportsReasoningContent).toBe(false);
  });
});

describe("GLMClient providerLabel", () => {
  it("returns 'GLM'", () => {
    const client = makeClient();
    expect(client.providerLabel()).toBe("GLM");
  });
});
