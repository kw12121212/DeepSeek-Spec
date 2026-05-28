import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";
import { modifyChange } from "../src/strict/modify.js";
import { registerStrictTools } from "../src/strict/strict-tools.js";
import { ToolRegistry } from "../src/tools.js";

let fixtureDir: string;

function makeProposalYaml(status: string, extra?: Record<string, unknown>): string {
  const base: Record<string, unknown> = {
    schema: "strict-spec-driven/change-proposal/v1",
    change: { id: "test-change", status },
    summary: {
      what: ["Original what"],
      why: ["Original why"],
    },
    scope: {
      in: ["src/original.ts"],
      out: ["src/excluded.ts"],
    },
  };
  if (extra) {
    Object.assign(base, extra);
  }
  return require("yaml").stringify(base);
}

function makeDesignYaml(): string {
  return require("yaml").stringify({
    schema: "strict-spec-driven/change-design/v1",
    change: "test-change",
    approach: ["Original approach"],
    decisions: [],
  });
}

function makeFixture(
  status: string,
  options?: { noDesign?: boolean; extra?: Record<string, unknown> },
): string {
  fixtureDir = join(tmpdir(), `modify-test-${Date.now()}`);
  const changeDir = join(fixtureDir, ".strict-spec-driven/changes/test-change");
  mkdirSync(changeDir, { recursive: true });
  writeFileSync(join(changeDir, "proposal.yaml"), makeProposalYaml(status, options?.extra));
  if (!options?.noDesign) {
    writeFileSync(join(changeDir, "design.yaml"), makeDesignYaml());
  }
  return fixtureDir;
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

describe("modifyChange — valid modifications", () => {
  afterEach(cleanup);

  it("modifies what and why in proposed state", () => {
    const root = makeFixture("proposed");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["New what"], why: ["New why"] },
      confirm: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.scope.what).toEqual(["New what"]);
    expect(result.scope.why).toEqual(["New why"]);
    expect(result.scope.scope_in).toEqual(["src/original.ts"]);
    expect(result.previousState).toBe("proposed");
    expect(result.warning).toBeUndefined();
  });

  it("modifies scope_in and scope_out", () => {
    const root = makeFixture("proposed");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { scope_in: ["src/new.ts"], scope_out: ["src/out.ts"] },
      confirm: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.scope.scope_in).toEqual(["src/new.ts"]);
    expect(result.scope.scope_out).toEqual(["src/out.ts"]);
  });

  it("includes warning when change was in applied state", () => {
    const root = makeFixture("applied");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Updated what"] },
      confirm: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warning).toContain("re-apply");
    expect(result.previousState).toBe("applied");
  });

  it("actually writes modifications to proposal.yaml", () => {
    const root = makeFixture("proposed");
    modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Persisted what"] },
      confirm: true,
    });
    const pp = join(root, ".strict-spec-driven/changes/test-change/proposal.yaml");
    const written = parseYaml(readFileSync(pp, "utf-8")) as Record<string, unknown>;
    const summary = written.summary as Record<string, unknown>;
    expect(summary.what).toEqual(["Persisted what"]);
  });
});

describe("modifyChange — state rejections", () => {
  afterEach(cleanup);

  it("rejects modify in verified state", () => {
    const root = makeFixture("verified");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Attempt"] },
      confirm: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("verified");
  });

  it("rejects modify in archived state", () => {
    const root = makeFixture("archived");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Attempt"] },
      confirm: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("archived");
  });

  it("rejects modify in shipped state", () => {
    const root = makeFixture("shipped");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Attempt"] },
      confirm: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("shipped");
  });

  it("rejects modify in canceled state", () => {
    const root = makeFixture("canceled");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Attempt"] },
      confirm: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("canceled");
  });
});

describe("modifyChange — confirmation requirement", () => {
  afterEach(cleanup);

  it("rejects modify when confirm is false", () => {
    const root = makeFixture("proposed");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Attempt"] },
      confirm: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("confirm");
  });

  it("rejects modify when confirm is absent (default false)", () => {
    const root = makeFixture("proposed");
    const result = modifyChange(root, {
      changeName: "test-change",
      fields: { what: ["Attempt"] },
      confirm: false,
    });
    expect(result.ok).toBe(false);
  });
});

describe("modifyChange — nonexistent change", () => {
  afterEach(cleanup);

  it("rejects modify for nonexistent change", () => {
    fixtureDir = join(tmpdir(), `modify-test-${Date.now()}`);
    mkdirSync(fixtureDir, { recursive: true });
    const result = modifyChange(fixtureDir, {
      changeName: "no-such-change",
      fields: { what: ["Attempt"] },
      confirm: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("does not exist");
  });
});

describe("modifyChange — tool registration", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("strict_modify tool is registered and rejects invalid state", async () => {
    const root = makeFixture("verified");
    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);
    const tool = registry.get("strict_modify");
    const result = await tool!.fn({
      changeName: "test-change",
      fields_what: ["Attempt"],
      confirm: true,
    });
    expect(result).toEqual({ ok: false, error: expect.stringContaining("verified") });
    cwdSpy.mockRestore();
  });

  it("strict_modify tool works in proposed state", async () => {
    const root = makeFixture("proposed");
    const registry = new ToolRegistry();
    registerStrictTools(registry);
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(root);
    const tool = registry.get("strict_modify");
    const result = (await tool!.fn({
      changeName: "test-change",
      fields_what: ["New what via tool"],
      confirm: true,
    })) as { ok: boolean; scope?: { what: string[] } };
    expect(result.ok).toBe(true);
    expect(result.scope?.what).toEqual(["New what via tool"]);
    cwdSpy.mockRestore();
  });
});
