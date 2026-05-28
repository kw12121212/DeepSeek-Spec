import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("native-detect", () => {
  it("resolveDataFile returns absolute path in Node mode", async () => {
    const { resolveDataFile } = await import("../src/cli/native-detect.js");
    const result = resolveDataFile("data/test.txt");
    expect(result).toBe(resolve(result));
    expect(result.endsWith("data/test.txt")).toBe(true);
  });

  it("resolveAsset delegates to assets.get", async () => {
    const [{ resolveAsset }, { assets }] = await Promise.all([
      import("../src/cli/native-detect.js"),
      import("../src/cli/assets.js"),
    ]);
    assets.preload("test-asset", new Uint8Array([1, 2, 3]));
    const bytes = resolveAsset("test-asset");
    expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("detectNativeContext returns isNative false and valid assetRoot in Node mode", async () => {
    const { detectNativeContext } = await import("../src/cli/native-detect.js");
    const ctx = detectNativeContext();
    expect(ctx.isNative).toBe(false);
    expect(ctx.assetRoot).toBeTruthy();
    expect(resolve(ctx.assetRoot)).toBe(ctx.assetRoot);
  });

  it("detectNativeContext caches the result", async () => {
    const { detectNativeContext } = await import("../src/cli/native-detect.js");
    const a = detectNativeContext();
    const b = detectNativeContext();
    expect(a).toBe(b);
  });

  it("IS_NATIVE is false in test environment", async () => {
    const { IS_NATIVE } = await import("../src/cli/native-detect.js");
    expect(IS_NATIVE).toBe(false);
  });

  it("detectNative is re-exported from assets", async () => {
    const { detectNative } = await import("../src/cli/native-detect.js");
    expect(typeof detectNative).toBe("function");
    expect(detectNative()).toBe(false);
  });
});
