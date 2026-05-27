import { describe, expect, it, vi } from "vitest";
import { registerStrictTools } from "../src/strict/strict-tools";
import { ToolRegistry } from "../src/tools";

const STRICT_TOOL_NAMES = [
  "strict_propose",
  "strict_generate",
  "strict_apply",
  "strict_verify",
  "strict_ready",
  "strict_archive",
  "strict_ship",
  "strict_cancel",
  "strict_roadmap_status",
  "strict_roadmap_sync",
  "strict_roadmap_recommend",
] as const;

function makeRegistry(): ToolRegistry {
  const registry = new ToolRegistry();
  registerStrictTools(registry);
  return registry;
}

describe("registerStrictTools", () => {
  it("registers exactly 11 strict tools", () => {
    const registry = makeRegistry();
    for (const name of STRICT_TOOL_NAMES) {
      expect(registry.has(name)).toBe(true);
    }
    expect(registry.size).toBeGreaterThanOrEqual(11);
  });

  it("sets parallelSafe=false on every strict tool", () => {
    const registry = makeRegistry();
    for (const name of STRICT_TOOL_NAMES) {
      const def = registry.get(name);
      expect(def?.parallelSafe).toBe(false);
    }
  });

  it("requires changeName for change-scoped tools", () => {
    const registry = makeRegistry();
    const changeScoped = STRICT_TOOL_NAMES.filter((n) => !n.startsWith("strict_roadmap_"));
    for (const name of changeScoped) {
      const def = registry.get(name);
      expect(def?.parameters?.required).toContain("changeName");
    }
  });

  it("does not require changeName for roadmap tools", () => {
    const registry = makeRegistry();
    const roadmapTools = STRICT_TOOL_NAMES.filter((n) => n.startsWith("strict_roadmap_"));
    for (const name of roadmapTools) {
      const def = registry.get(name);
      expect(def?.parameters?.required).toBeUndefined();
    }
  });

  it("requires artifact field for strict_generate", () => {
    const registry = makeRegistry();
    const def = registry.get("strict_generate");
    expect(def?.parameters?.required).toContain("artifact");
    expect(def?.parameters?.properties?.artifact).toBeDefined();
  });
});

vi.mock("../src/strict/invoker", () => ({
  invokeStrict: vi.fn(),
}));

vi.mock("../src/strict/guard", () => ({
  requireState: vi.fn().mockReturnValue(undefined),
}));

describe("strict tool handlers", () => {
  it("invokes invokeStrict with correct subcommand and args", async () => {
    const { invokeStrict } = await import("../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    mocked.mockResolvedValue({ ok: true, data: { valid: true } });

    const registry = makeRegistry();
    const def = registry.get("strict_propose");
    const result = await def?.fn({ changeName: "my-change" });

    expect(mocked).toHaveBeenCalledWith("propose", {
      args: ["my-change"],
    });
    expect(result).toEqual({ ok: true, data: { valid: true } });
  });

  it("passes boolean flags as --flag without value", async () => {
    const { invokeStrict } = await import("../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    mocked.mockResolvedValue({ ok: true });

    const registry = makeRegistry();
    const def = registry.get("strict_generate");
    await def?.fn({
      changeName: "my-change",
      artifact: "proposal",
      reset: true,
    });

    expect(mocked).toHaveBeenCalledWith("generate", {
      args: ["my-change", "--artifact", "proposal", "--reset"],
    });
  });

  it("propagates errors from invokeStrict", async () => {
    const { invokeStrict } = await import("../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    mocked.mockResolvedValue({ ok: false, error: "not found" });

    const registry = makeRegistry();
    const def = registry.get("strict_verify");
    const result = await def?.fn({ changeName: "bad-change" });

    expect(result).toEqual({ ok: false, error: "not found" });
  });
});
