import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { propose } from "../src/strict/propose.js";

let fixtureDir: string;

function makeFixture(): string {
  fixtureDir = join(tmpdir(), `propose-test-${Date.now()}`);
  const changesDir = join(fixtureDir, ".strict-spec-driven/changes");
  mkdirSync(changesDir, { recursive: true });
  return fixtureDir;
}

function makeExistingChange(root: string, name: string): void {
  const dir = join(root, ".strict-spec-driven/changes", name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "proposal.yaml"), "schema: v1\n");
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

vi.mock("../src/strict/invoker", () => ({
  invokeStrict: vi.fn(),
}));

describe("propose — duplicate guard", () => {
  afterEach(cleanup);

  it("rejects when change directory already exists", async () => {
    const root = makeFixture();
    makeExistingChange(root, "existing-change");
    const result = await propose(root, {
      changeName: "existing-change",
      description: "some description",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("already exists");
    }
  });
});

describe("propose — missing description", () => {
  afterEach(cleanup);

  it("rejects when description is empty", async () => {
    const root = makeFixture();
    const result = await propose(root, {
      changeName: "new-change",
      description: "",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("description is required");
    }
  });

  it("rejects when description is whitespace only", async () => {
    const root = makeFixture();
    const result = await propose(root, {
      changeName: "new-change",
      description: "   ",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("description is required");
    }
  });
});

describe("propose — happy path", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("scaffolds change via invokeStrict and validates directory", async () => {
    const { invokeStrict } = await import("../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    const root = makeFixture();
    const changeDir = resolve(root, ".strict-spec-driven/changes/my-change");
    mocked.mockImplementation(async () => {
      mkdirSync(changeDir, { recursive: true });
      return { ok: true };
    });

    const result = await propose(root, {
      changeName: "my-change",
      description: "Add a new feature",
    });

    expect(mocked).toHaveBeenCalledWith("propose", { args: ["my-change"] });
    expect(result).toEqual({
      ok: true,
      changeName: "my-change",
      directory: changeDir,
    });
  });
});

describe("propose — scaffold failure", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("returns error when invokeStrict fails", async () => {
    const { invokeStrict } = await import("../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    mocked.mockResolvedValue({ ok: false, error: "CLI error" });

    const root = makeFixture();
    const result = await propose(root, {
      changeName: "my-change",
      description: "A feature",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("CLI error");
    }
  });

  it("returns error when scaffold directory is not created", async () => {
    const { invokeStrict } = await import("../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    mocked.mockResolvedValue({ ok: true });

    const root = makeFixture();
    const result = await propose(root, {
      changeName: "missing-change",
      description: "A feature",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("did not create directory");
    }
  });
});

describe("strict_propose tool handler", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("calls propose directly and returns result", async () => {
    const { invokeStrict } = await import("../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    const { registerStrictTools } = await import("../src/strict/strict-tools.js");
    const { ToolRegistry } = await import("../src/tools.js");
    const root = makeFixture();
    const changeDir = resolve(root, ".strict-spec-driven/changes/t1");
    mocked.mockImplementation(async () => {
      mkdirSync(changeDir, { recursive: true });
      return { ok: true };
    });
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);

    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const tool = registry.get("strict_propose");
    const result = await tool!.fn({
      changeName: "t1",
      description: "test change",
    });

    expect(result).toEqual({
      ok: true,
      changeName: "t1",
      directory: changeDir,
    });
    cwdSpy.mockRestore();
  });

  it("returns error for duplicate change", async () => {
    const { registerStrictTools } = await import("../src/strict/strict-tools.js");
    const { ToolRegistry } = await import("../src/tools.js");
    const root = makeFixture();
    makeExistingChange(root, "dup");
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);

    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const tool = registry.get("strict_propose");
    const result = await tool!.fn({
      changeName: "dup",
      description: "test",
    });

    expect(result).toEqual({ ok: false, error: expect.stringContaining("already exists") });
    cwdSpy.mockRestore();
  });

  it("returns error for missing description", async () => {
    const { registerStrictTools } = await import("../src/strict/strict-tools.js");
    const { ToolRegistry } = await import("../src/tools.js");
    const root = makeFixture();
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);

    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const tool = registry.get("strict_propose");
    const result = await tool!.fn({ changeName: "nope" });

    expect(result).toEqual({
      ok: false,
      error: expect.stringContaining("description is required"),
    });
    cwdSpy.mockRestore();
  });

  it("has description as a required parameter", async () => {
    const { registerStrictTools } = await import("../src/strict/strict-tools.js");
    const { ToolRegistry } = await import("../src/tools.js");
    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const def = registry.get("strict_propose");
    expect(def?.parameters?.required).toContain("changeName");
    expect(def?.parameters?.required).toContain("description");
    expect(def?.parameters?.properties?.description).toBeDefined();
  });
});
