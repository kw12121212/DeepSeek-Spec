import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cancelChange } from "../src/strict/cancel.js";
import { readCurrentState } from "../src/strict/lifecycle.js";

let fixtureDir: string;

function makeProposalYaml(status: string): string {
  return `schema: strict-spec-driven/change-proposal/v1
change:
  id: test-change
  status: ${status}
`;
}

function makeFixture(status: string): string {
  fixtureDir = join(tmpdir(), `cancel-test-${Date.now()}`);
  const changeDir = join(fixtureDir, ".strict-spec-driven/changes/test-change");
  mkdirSync(changeDir, { recursive: true });
  writeFileSync(join(changeDir, "proposal.yaml"), makeProposalYaml(status));
  return fixtureDir;
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

describe("cancelChange — valid transitions", () => {
  afterEach(cleanup);

  it("cancels from proposed state", () => {
    const root = makeFixture("proposed");
    const result = cancelChange(root, "test-change");
    expect(result).toEqual({ ok: true, previousState: "proposed", directoryRemoved: false });
    expect(readCurrentState(root, "test-change")).toBe("canceled");
  });

  it("cancels from applied state", () => {
    const root = makeFixture("applied");
    const result = cancelChange(root, "test-change");
    expect(result).toEqual({ ok: true, previousState: "applied", directoryRemoved: false });
    expect(readCurrentState(root, "test-change")).toBe("canceled");
  });
});

describe("cancelChange — rejected states", () => {
  afterEach(cleanup);

  it("rejects cancel from verified state", () => {
    const root = makeFixture("verified");
    const result = cancelChange(root, "test-change");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("verified");
    }
    expect(readCurrentState(root, "test-change")).toBe("verified");
  });

  it("rejects cancel from archived state", () => {
    const root = makeFixture("archived");
    const result = cancelChange(root, "test-change");
    expect(result.ok).toBe(false);
  });

  it("rejects cancel from shipped state", () => {
    const root = makeFixture("shipped");
    const result = cancelChange(root, "test-change");
    expect(result.ok).toBe(false);
  });

  it("rejects cancel from canceled state", () => {
    const root = makeFixture("canceled");
    const result = cancelChange(root, "test-change");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("canceled");
    }
  });
});

describe("cancelChange — directory removal", () => {
  afterEach(cleanup);

  it("removes directory when removeDir is true", () => {
    const root = makeFixture("proposed");
    const changeDir = join(root, ".strict-spec-driven/changes/test-change");
    expect(existsSync(changeDir)).toBe(true);

    const result = cancelChange(root, "test-change", true);
    expect(result).toEqual({ ok: true, previousState: "proposed", directoryRemoved: true });
    expect(existsSync(changeDir)).toBe(false);
  });

  it("keeps directory when removeDir is false (default)", () => {
    const root = makeFixture("proposed");
    const changeDir = join(root, ".strict-spec-driven/changes/test-change");

    const result = cancelChange(root, "test-change", false);
    expect(result).toEqual({ ok: true, previousState: "proposed", directoryRemoved: false });
    expect(existsSync(changeDir)).toBe(true);
  });
});

describe("strict_cancel tool handler", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("calls cancelChange directly and returns result", async () => {
    const { registerStrictTools } = await import("../src/strict/strict-tools.js");
    const { ToolRegistry } = await import("../src/tools.js");
    const root = makeFixture("proposed");
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);

    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const tool = registry.get("strict_cancel");
    const result = await tool!.fn({ changeName: "test-change" });

    expect(result).toEqual({ ok: true, previousState: "proposed", directoryRemoved: false });
    cwdSpy.mockRestore();
  });

  it("returns error for invalid state", async () => {
    const { registerStrictTools } = await import("../src/strict/strict-tools.js");
    const { ToolRegistry } = await import("../src/tools.js");
    const root = makeFixture("verified");
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);

    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const tool = registry.get("strict_cancel");
    const result = await tool!.fn({ changeName: "test-change" });

    expect(result).toEqual({ ok: false, error: expect.stringContaining("verified") });
    cwdSpy.mockRestore();
  });
});
