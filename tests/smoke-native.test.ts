import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "..");

describe("smoke-native", () => {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));

  it("reads expected version from package.json", () => {
    expect(pkg.version).toBeTruthy();
    expect(typeof pkg.version).toBe("string");
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("smoke-native script is registered in package.json", () => {
    expect(pkg.scripts["smoke:native"]).toBe("node scripts/smoke-native.mjs");
  });

  it("smoke-native.mjs source contains --target argument parsing", () => {
    const src = readFileSync(resolve(ROOT, "scripts", "smoke-native.mjs"), "utf8");
    expect(src).toContain("--target");
    expect(src).toContain("EXPECTED_VERSION");
    expect(src).toContain("--help");
  });
});
