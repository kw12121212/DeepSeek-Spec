import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { attemptTransition, readCurrentState } from "../src/strict/lifecycle.js";

let fixtureDir: string;

function makeProposalYaml(status: string): string {
  return `schema: strict-spec-driven/change-proposal/v1
change:
  id: test-change
  status: ${status}
`;
}

function makeFixture(status: string): string {
  fixtureDir = join(tmpdir(), `lifecycle-test-${Date.now()}`);
  const changeDir = join(fixtureDir, ".strict-spec-driven/changes/test-change");
  mkdirSync(changeDir, { recursive: true });
  writeFileSync(join(changeDir, "proposal.yaml"), makeProposalYaml(status));
  return fixtureDir;
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

describe("readCurrentState", () => {
  afterEach(cleanup);

  it("reads applied state from proposal.yaml", () => {
    const root = makeFixture("applied");
    expect(readCurrentState(root, "test-change")).toBe("applied");
  });

  it("reads proposed state from proposal.yaml", () => {
    const root = makeFixture("proposed");
    expect(readCurrentState(root, "test-change")).toBe("proposed");
  });

  it("throws when proposal.yaml does not exist", () => {
    fixtureDir = join(tmpdir(), `lifecycle-test-${Date.now()}`);
    mkdirSync(fixtureDir, { recursive: true });
    expect(() => readCurrentState(fixtureDir, "nonexistent")).toThrow();
  });
});

describe("attemptTransition — valid transitions", () => {
  afterEach(cleanup);

  it("proposed -> applied", () => {
    const root = makeFixture("proposed");
    attemptTransition(root, "test-change", "proposed", "applied");
    expect(readCurrentState(root, "test-change")).toBe("applied");
  });

  it("proposed -> canceled", () => {
    const root = makeFixture("proposed");
    attemptTransition(root, "test-change", "proposed", "canceled");
    expect(readCurrentState(root, "test-change")).toBe("canceled");
  });

  it("applied -> verified", () => {
    const root = makeFixture("applied");
    attemptTransition(root, "test-change", "applied", "verified");
    expect(readCurrentState(root, "test-change")).toBe("verified");
  });

  it("verified -> reviewed", () => {
    const root = makeFixture("verified");
    attemptTransition(root, "test-change", "verified", "reviewed");
    expect(readCurrentState(root, "test-change")).toBe("reviewed");
  });

  it("reviewed -> archived", () => {
    const root = makeFixture("reviewed");
    attemptTransition(root, "test-change", "reviewed", "archived");
    expect(readCurrentState(root, "test-change")).toBe("archived");
  });

  it("archived -> shipped", () => {
    const root = makeFixture("archived");
    attemptTransition(root, "test-change", "archived", "shipped");
    expect(readCurrentState(root, "test-change")).toBe("shipped");
  });
});

describe("attemptTransition — invalid transitions", () => {
  afterEach(cleanup);

  it("applied -> proposed is invalid", () => {
    const root = makeFixture("applied");
    expect(() => attemptTransition(root, "test-change", "applied", "proposed")).toThrow(
      /invalid transition/,
    );
    expect(readCurrentState(root, "test-change")).toBe("applied");
  });

  it("proposed -> reviewed is invalid", () => {
    const root = makeFixture("proposed");
    expect(() => attemptTransition(root, "test-change", "proposed", "reviewed")).toThrow(
      /invalid transition/,
    );
    expect(readCurrentState(root, "test-change")).toBe("proposed");
  });

  it("verified -> applied is invalid", () => {
    const root = makeFixture("verified");
    expect(() => attemptTransition(root, "test-change", "verified", "applied")).toThrow(
      /invalid transition/,
    );
    expect(readCurrentState(root, "test-change")).toBe("verified");
  });
});

describe("attemptTransition — terminal states", () => {
  afterEach(cleanup);

  it("shipped rejects all transitions", () => {
    const root = makeFixture("shipped");
    expect(() => attemptTransition(root, "test-change", "shipped", "proposed")).toThrow(
      /terminal state/,
    );
    expect(readCurrentState(root, "test-change")).toBe("shipped");
  });

  it("canceled rejects all transitions", () => {
    const root = makeFixture("canceled");
    expect(() => attemptTransition(root, "test-change", "canceled", "proposed")).toThrow(
      /terminal state/,
    );
    expect(readCurrentState(root, "test-change")).toBe("canceled");
  });
});
