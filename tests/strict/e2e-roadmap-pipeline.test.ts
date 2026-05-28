import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import { attemptTransition, readCurrentState } from "../../src/strict/lifecycle.js";
import { roadmapRecommend } from "../../src/strict/roadmap-recommend.js";

vi.mock("../../src/strict/invoker", () => ({
  invokeStrict: vi.fn(),
}));

const FIXTURE_ROOT = resolve(import.meta.dirname, "../fixtures/e2e-roadmap-fixture");

function copyFixtureToTemp(): string {
  const { tmpdir } = require("node:os");
  const { cpSync } = require("node:fs");
  const dest = join(tmpdir(), `e2e-roadmap-${Date.now()}`);
  cpSync(FIXTURE_ROOT, dest, { recursive: true });
  return dest;
}

let tempDir: string;

function cleanup() {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
}

function makeProposalYaml(status: string, changeName = "fixture-change"): string {
  return stringifyYaml({
    schema: "strict-spec-driven/change-proposal/v1",
    change: { id: "fixture-change", status },
    summary: { what: ["E2E roadmap test"], why: ["Validate roadmap pipeline"] },
    scope: { in: ["tests/"], out: ["src/"] },
    roadmap: { milestone: "0001-e2e-fixture", planned_change: "fixture-change" },
  });
}

function makeDesignYaml(): string {
  return stringifyYaml({
    schema: "strict-spec-driven/change-design/v1",
    change: "fixture-change",
    approach: "E2E test approach",
    decisions: [],
  });
}

function makeTasksYaml(): string {
  return stringifyYaml({
    schema: "strict-spec-driven/task-list/v2",
    change: "fixture-change",
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
    schema: "strict-spec-driven/question-list/v1",
    change: "fixture-change",
    open: [],
    resolved: [],
  });
}

function scaffoldChange(root: string, name: string, status: string): string {
  const dir = join(root, ".strict-spec-driven/changes", name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "proposal.yaml"), makeProposalYaml(status, name));
  writeFileSync(join(dir, "design.yaml"), makeDesignYaml());
  writeFileSync(join(dir, "tasks.yaml"), makeTasksYaml());
  writeFileSync(join(dir, "questions.yaml"), makeQuestionsYaml());
  mkdirSync(join(dir, "specs"), { recursive: true });
  return dir;
}

describe("E2E roadmap pipeline — recommend", () => {
  afterEach(cleanup);

  it("roadmap-recommend picks the planned change from fixture", () => {
    tempDir = copyFixtureToTemp();

    const result = roadmapRecommend(tempDir);

    expect(result.eligible).toBe(true);
    expect(result.recommendation).toBeDefined();
    expect(result.recommendation?.id).toBe("fixture-change");
    expect(result.recommendation?.milestone).toBe("0001-e2e-fixture");
  });

  it("roadmap-recommend returns ineligible when no planned changes exist", () => {
    tempDir = copyFixtureToTemp();
    const pcDir = join(tempDir, ".strict-spec-driven/roadmap/planned-changes");
    rmSync(pcDir, { recursive: true, force: true });

    const result = roadmapRecommend(tempDir);

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("no planned-changes directory");
  });
});

describe("E2E roadmap pipeline — apply and state transitions", () => {
  afterEach(cleanup);

  it("scaffolded change transitions proposed -> applied", () => {
    tempDir = copyFixtureToTemp();
    scaffoldChange(tempDir, "fixture-change", "proposed");

    attemptTransition(tempDir, "fixture-change", "proposed", "applied");

    expect(readCurrentState(tempDir, "fixture-change")).toBe("applied");
  });

  it("apply modifies files and state is applied", () => {
    tempDir = copyFixtureToTemp();
    const changeDir = scaffoldChange(tempDir, "fixture-change", "proposed");

    attemptTransition(tempDir, "fixture-change", "proposed", "applied");

    expect(readCurrentState(tempDir, "fixture-change")).toBe("applied");
    expect(existsSync(join(changeDir, "proposal.yaml"))).toBe(true);
  });
});

describe("E2E roadmap pipeline — verify, review, archive, ship", () => {
  afterEach(cleanup);

  it("transitions through full lifecycle: proposed->applied->verified->reviewed->archived->shipped", () => {
    tempDir = copyFixtureToTemp();
    scaffoldChange(tempDir, "full-cycle", "proposed");

    attemptTransition(tempDir, "full-cycle", "proposed", "applied");
    expect(readCurrentState(tempDir, "full-cycle")).toBe("applied");

    attemptTransition(tempDir, "full-cycle", "applied", "verified");
    expect(readCurrentState(tempDir, "full-cycle")).toBe("verified");

    attemptTransition(tempDir, "full-cycle", "verified", "reviewed");
    expect(readCurrentState(tempDir, "full-cycle")).toBe("reviewed");

    attemptTransition(tempDir, "full-cycle", "reviewed", "archived");
    expect(readCurrentState(tempDir, "full-cycle")).toBe("archived");

    attemptTransition(tempDir, "full-cycle", "archived", "shipped");
    expect(readCurrentState(tempDir, "full-cycle")).toBe("shipped");
  });

  it("rejects invalid transition from verified back to applied", () => {
    tempDir = copyFixtureToTemp();
    scaffoldChange(tempDir, "bad-step", "verified");

    expect(() => attemptTransition(tempDir, "bad-step", "verified", "applied")).toThrow(
      /invalid transition/,
    );
    expect(readCurrentState(tempDir, "bad-step")).toBe("verified");
  });

  it("rejects transition from terminal shipped state", () => {
    tempDir = copyFixtureToTemp();
    scaffoldChange(tempDir, "done-deal", "shipped");

    expect(() => attemptTransition(tempDir, "done-deal", "shipped", "proposed")).toThrow(
      /terminal state/,
    );
  });
});

describe("E2E roadmap pipeline — INDEX.yaml milestone status", () => {
  afterEach(cleanup);

  it("milestone status can be updated in INDEX.yaml after archive", () => {
    tempDir = copyFixtureToTemp();
    const indexYamlPath = join(tempDir, ".strict-spec-driven/roadmap/INDEX.yaml");

    const index = require("yaml").parse(readFileSync(indexYamlPath, "utf-8"));
    expect(index.milestones["0001-e2e-fixture"].status).toBe("proposed");

    index.milestones["0001-e2e-fixture"].status = "complete";
    writeFileSync(indexYamlPath, require("yaml").stringify(index));

    const updated = require("yaml").parse(readFileSync(indexYamlPath, "utf-8"));
    expect(updated.milestones["0001-e2e-fixture"].status).toBe("complete");
  });
});
