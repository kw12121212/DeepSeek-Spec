import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasRealLlmConfig, readRealLlmConfig } from "./real-llm/helpers/config.js";

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

const { readFileSync, existsSync } = await import("node:fs");

describe("real-llm config helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("hasRealLlmConfig", () => {
    it("returns false when config file does not exist", () => {
      vi.mocked(existsSync).mockReturnValue(false);
      expect(hasRealLlmConfig()).toBe(false);
    });

    it("returns false when config is invalid", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue("{}");
      expect(hasRealLlmConfig()).toBe(false);
    });

    it("returns true when config is valid", () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          zhipuApiKey: "abc123.secret456",
          model: "glm-4.7",
        }),
      );
      expect(hasRealLlmConfig()).toBe(true);
    });
  });

  describe("readRealLlmConfig", () => {
    it("throws when zhipuApiKey is missing", () => {
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ model: "glm-4.7" }));
      expect(() => readRealLlmConfig()).toThrow("zhipuApiKey is required");
    });

    it("throws when zhipuApiKey does not match id.secret pattern", () => {
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          zhipuApiKey: "not-a-valid-key",
          model: "glm-4.7",
        }),
      );
      expect(() => readRealLlmConfig()).toThrow("id.secret pattern");
    });

    it("throws when model is missing", () => {
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ zhipuApiKey: "abc.secret" }));
      expect(() => readRealLlmConfig()).toThrow("model is required");
    });

    it("returns config with required fields", () => {
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          zhipuApiKey: "abc123.secret456",
          model: "glm-4.7",
        }),
      );
      const config = readRealLlmConfig();
      expect(config).toEqual({
        zhipuApiKey: "abc123.secret456",
        model: "glm-4.7",
        baseUrl: undefined,
      });
    });

    it("returns config with optional baseUrl", () => {
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          zhipuApiKey: "abc.secret",
          model: "glm-4.7",
          baseUrl: "https://custom.api.com/v4",
        }),
      );
      const config = readRealLlmConfig();
      expect(config.baseUrl).toBe("https://custom.api.com/v4");
    });
  });
});
