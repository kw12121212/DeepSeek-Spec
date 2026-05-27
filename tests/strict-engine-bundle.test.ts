import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveEnginePath } from "../src/strict/engine-path";
import { registerStrictTools } from "../src/strict/strict-tools";
import { ToolRegistry } from "../src/tools";

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

describe("roadmap tool registration", () => {
  function makeRegistry() {
    const registry = new ToolRegistry();
    registerStrictTools(registry);
    return registry;
  }

  it("registers strict_roadmap_status with parallelSafe=false and no changeName", () => {
    const registry = makeRegistry();
    const tool = registry.get("strict_roadmap_status");
    expect(tool).toBeDefined();
    expect(tool?.parallelSafe).toBe(false);
    const params = tool?.parameters as Record<string, unknown>;
    const props = params?.properties as Record<string, unknown> | undefined;
    expect(props?.changeName).toBeUndefined();
  });

  it("registers strict_roadmap_sync with parallelSafe=false and no changeName", () => {
    const registry = makeRegistry();
    const tool = registry.get("strict_roadmap_sync");
    expect(tool).toBeDefined();
    expect(tool?.parallelSafe).toBe(false);
    const params = tool?.parameters as Record<string, unknown>;
    const props = params?.properties as Record<string, unknown> | undefined;
    expect(props?.changeName).toBeUndefined();
  });

  it("registers strict_roadmap_recommend with parallelSafe=false and no changeName", () => {
    const registry = makeRegistry();
    const tool = registry.get("strict_roadmap_recommend");
    expect(tool).toBeDefined();
    expect(tool?.parallelSafe).toBe(false);
    const params = tool?.parameters as Record<string, unknown>;
    const props = params?.properties as Record<string, unknown> | undefined;
    expect(props?.changeName).toBeUndefined();
  });
});
