import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveEnginePath } from "../src/strict/engine-path";

describe("strict-engine-bundle", () => {
  it("resolveEnginePath returns an absolute path that exists on disk", () => {
    const enginePath = resolveEnginePath();
    expect(enginePath).toMatch(/vendor\/strict-spec-driven\.js$/);
    expect(enginePath.startsWith("/")).toBe(true);
    expect(existsSync(enginePath)).toBe(true);
  });

  it("vendor/strict-spec-driven.js is a non-trivial JS file", () => {
    const content = readFileSync(resolveEnginePath(), "utf-8");
    expect(content.length).toBeGreaterThan(1000);
    expect(content).toContain("function");
  });
});
