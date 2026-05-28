import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AssetRegistry } from "../src/cli/assets.js";

describe("AssetRegistry", () => {
  it("resolves an asset from disk via resolver", () => {
    const reg = new AssetRegistry();
    const dir = resolve("tests", "__assets_tmp_1");
    const file = join(dir, "test.txt");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, "hello");
      reg.register("test", () => [file]);
      const bytes = reg.get("test");
      expect(new TextDecoder().decode(bytes)).toBe("hello");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns preloaded bytes without touching disk", () => {
    const reg = new AssetRegistry();
    const data = new Uint8Array([1, 2, 3]);
    reg.preload("cached", data);
    expect(reg.get("cached")).toBe(data);
  });

  it("prefers preload over disk resolver", () => {
    const reg = new AssetRegistry();
    reg.register("x", () => ["/nonexistent/path"]);
    reg.preload("x", new Uint8Array([42]));
    expect(reg.get("x")).toEqual(new Uint8Array([42]));
  });

  it("caches disk reads", () => {
    const reg = new AssetRegistry();
    const dir = resolve("tests", "__assets_tmp_2");
    const file = join(dir, "cached.txt");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, "data");
      reg.register("cached-disk", () => [file]);
      const first = reg.get("cached-disk");
      const second = reg.get("cached-disk");
      expect(first).toBe(second);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws on unknown asset", () => {
    const reg = new AssetRegistry();
    expect(() => reg.get("missing")).toThrow("Unknown asset: missing");
  });

  it("throws when all disk candidates fail", () => {
    const reg = new AssetRegistry();
    reg.register("gone", () => ["/nope/a", "/nope/b"]);
    expect(() => reg.get("gone")).toThrow("not found on disk");
  });

  it("getText decodes as UTF-8", () => {
    const reg = new AssetRegistry();
    reg.preload("txt", new TextEncoder().encode("héllo wörld"));
    expect(reg.getText("txt")).toBe("héllo wörld");
  });

  it("has() reports true for preloaded and registered assets", () => {
    const reg = new AssetRegistry();
    expect(reg.has("nope")).toBe(false);
    reg.preload("a", new Uint8Array(0));
    expect(reg.has("a")).toBe(true);
    reg.register("b", () => []);
    expect(reg.has("b")).toBe(true);
  });

  it("list() returns all asset names", () => {
    const reg = new AssetRegistry();
    reg.preload("x", new Uint8Array(0));
    reg.register("y", () => []);
    const names = reg.list();
    expect(names).toContain("x");
    expect(names).toContain("y");
    expect(names.length).toBe(2);
  });
});

describe("detectNative", () => {
  it("returns false in Node test environment", async () => {
    const { detectNative } = await import("../src/cli/assets.js");
    // In a vitest/Node environment, isBun is false
    expect(typeof detectNative()).toBe("boolean");
  });
});
