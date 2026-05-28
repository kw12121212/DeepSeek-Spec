import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import { cancelChange } from "../../src/strict/cancel.js";
import { attemptTransition, readCurrentState } from "../../src/strict/lifecycle.js";
import { modifyChange } from "../../src/strict/modify.js";
import { propose } from "../../src/strict/propose.js";

vi.mock("../../src/strict/invoker", () => ({
  invokeStrict: vi.fn(),
}));

let fixtureDir: string;

function makeProposalYaml(status: string, extra?: Record<string, unknown>): string {
  const base: Record<string, unknown> = {
    schema: "strict-spec-driven/change-proposal/v1",
    change: { id: "e2e-change", status },
    summary: { what: ["E2E test"], why: ["Validate pipeline"] },
    scope: { in: ["tests/"], out: ["src/"] },
  };
  if (extra) Object.assign(base, extra);
  return stringifyYaml(base);
}

function makeDesignYaml(): string {
  return stringifyYaml({
    schema: "strict-spec-driven/change-design/v1",
    approach: "E2E test approach",
    decisions: [],
  });
}

function makeTasksYaml(): string {
  return stringifyYaml({
    schema: "strict-spec-driven/task-list/v2",
    change: "e2e-change",
    sections: {
      Implementation: { "do-work": { text: "Do the work", status: "pending" } },
      Testing: { "run-test": { text: "Run test", status: "pending", command: "echo ok" } },
      Verification: { "verify-scope": { text: "Verify", status: "pending" } },
    },
    testing_gates: { validation_task: "run-test", unit_test_task: "run-test" },
  });
}

function makeQuestionsYaml(): string {
  return stringifyYaml({
    schema: "strict-spec-driven/change-questions/v1",
    open: [],
    resolved: [],
  });
}

function scaffoldChange(root: string, name: string, status: string): string {
  const dir = join(root, ".strict-spec-driven/changes", name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "proposal.yaml"), makeProposalYaml(status));
  writeFileSync(join(dir, "design.yaml"), makeDesignYaml());
  writeFileSync(join(dir, "tasks.yaml"), makeTasksYaml());
  writeFileSync(join(dir, "questions.yaml"), makeQuestionsYaml());
  mkdirSync(join(dir, "specs"), { recursive: true });
  return dir;
}

function createFixture(): string {
  fixtureDir = join(tmpdir(), `e2e-freeform-${Date.now()}`);
  mkdirSync(join(fixtureDir, ".strict-spec-driven/changes"), { recursive: true });
  return fixtureDir;
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

describe("E2E freeform pipeline — init and propose", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("propose creates change directory with all artifacts", async () => {
    const { invokeStrict } = await import("../../src/strict/invoker");
    const mocked = vi.mocked(invokeStrict);
    const root = createFixture();
    const changeDir = resolve(root, ".strict-spec-driven/changes/my-feature");

    mocked.mockImplementation(async (subcommand) => {
      if (subcommand === "propose") {
        scaffoldChange(root, "my-feature", "proposed");
      }
      return { ok: true };
    });

    const result = await propose(root, {
      changeName: "my-feature",
      description: "Add feature X",
    });

    expect(result).toEqual({
      ok: true,
      changeName: "my-feature",
      directory: changeDir,
    });
    expect(existsSync(join(changeDir, "proposal.yaml"))).toBe(true);
    expect(existsSync(join(changeDir, "design.yaml"))).toBe(true);
    expect(existsSync(join(changeDir, "tasks.yaml"))).toBe(true);
    expect(existsSync(join(changeDir, "questions.yaml"))).toBe(true);
    expect(existsSync(join(changeDir, "specs"))).toBe(true);
    expect(readCurrentState(root, "my-feature")).toBe("proposed");
  });

  it("propose rejects duplicate change name", async () => {
    const root = createFixture();
    scaffoldChange(root, "dup-change", "proposed");

    const result = await propose(root, {
      changeName: "dup-change",
      description: "Duplicate",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("already exists");
    }
  });
});

describe("E2E freeform pipeline — apply and modify", () => {
  afterEach(cleanup);

  it("transitions proposed -> applied", () => {
    const root = createFixture();
    scaffoldChange(root, "feat-x", "proposed");

    attemptTransition(root, "feat-x", "proposed", "applied");
    expect(readCurrentState(root, "feat-x")).toBe("applied");
  });

  it("modify updates proposal.yaml when confirmed in proposed state", () => {
    const root = createFixture();
    scaffoldChange(root, "feat-y", "proposed");

    const result = modifyChange(root, {
      changeName: "feat-y",
      fields: {
        what: ["Updated feature"],
        why: ["New reason"],
      },
      confirm: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.scope.what).toEqual(["Updated feature"]);
      expect(result.scope.why).toEqual(["New reason"]);
    }
  });

  it("modify without confirm returns error", () => {
    const root = createFixture();
    scaffoldChange(root, "feat-z", "proposed");

    const result = modifyChange(root, {
      changeName: "feat-z",
      fields: { what: ["Updated"] },
      confirm: false,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("confirmation is required");
    }
  });

  it("modify on applied state includes warning", () => {
    const root = createFixture();
    scaffoldChange(root, "feat-w", "applied");

    const result = modifyChange(root, {
      changeName: "feat-w",
      fields: { what: ["Updated"] },
      confirm: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warning).toContain("re-apply");
    }
  });
});

describe("E2E freeform pipeline — verify, review, archive, ship", () => {
  afterEach(cleanup);

  it("transitions through proposed->applied->verified->reviewed->archived->shipped", () => {
    const root = createFixture();
    scaffoldChange(root, "full-cycle", "proposed");

    attemptTransition(root, "full-cycle", "proposed", "applied");
    expect(readCurrentState(root, "full-cycle")).toBe("applied");

    attemptTransition(root, "full-cycle", "applied", "verified");
    expect(readCurrentState(root, "full-cycle")).toBe("verified");

    attemptTransition(root, "full-cycle", "verified", "reviewed");
    expect(readCurrentState(root, "full-cycle")).toBe("reviewed");

    attemptTransition(root, "full-cycle", "reviewed", "archived");
    expect(readCurrentState(root, "full-cycle")).toBe("archived");

    attemptTransition(root, "full-cycle", "archived", "shipped");
    expect(readCurrentState(root, "full-cycle")).toBe("shipped");
  });

  it("rejects invalid transition from verified back to applied", () => {
    const root = createFixture();
    scaffoldChange(root, "bad-step", "verified");

    expect(() => attemptTransition(root, "bad-step", "verified", "applied")).toThrow(
      /invalid transition/,
    );
    expect(readCurrentState(root, "bad-step")).toBe("verified");
  });

  it("rejects transition from terminal shipped state", () => {
    const root = createFixture();
    scaffoldChange(root, "done-deal", "shipped");

    expect(() => attemptTransition(root, "done-deal", "shipped", "proposed")).toThrow(
      /terminal state/,
    );
  });
});

describe("E2E freeform pipeline — cancel", () => {
  afterEach(cleanup);

  it("cancels a second proposed change and removes directory", () => {
    const root = createFixture();
    scaffoldChange(root, "primary", "applied");
    const secondDir = scaffoldChange(root, "second-change", "proposed");

    expect(existsSync(secondDir)).toBe(true);

    const result = cancelChange(root, "second-change", true);

    expect(result).toEqual({
      ok: true,
      previousState: "proposed",
      directoryRemoved: true,
    });
    expect(existsSync(secondDir)).toBe(false);
  });

  it("cancels an applied change without removing directory", () => {
    const root = createFixture();
    const changeDir = scaffoldChange(root, "cancel-applied", "applied");

    const result = cancelChange(root, "cancel-applied", false);

    expect(result).toEqual({
      ok: true,
      previousState: "applied",
      directoryRemoved: false,
    });
    expect(readCurrentState(root, "cancel-applied")).toBe("canceled");
    expect(existsSync(changeDir)).toBe(true);
  });

  it("rejects cancel from verified state", () => {
    const root = createFixture();
    scaffoldChange(root, "no-cancel", "verified");

    const result = cancelChange(root, "no-cancel");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("verified");
    }
  });
});
