import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { listActiveStrictChanges } from "../src/strict/active-changes.js";

let fixtureDir: string;

function makeProposalYaml(status: string): string {
  return `schema: strict-spec-driven/change-proposal/v1
change:
  id: test-change
  status: ${status}
`;
}

function makeChangeDir(root: string, name: string, status: string): void {
  const dir = join(root, ".strict-spec-driven/changes", name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "proposal.yaml"), makeProposalYaml(status));
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

describe("listActiveStrictChanges", () => {
  afterEach(cleanup);

  it("returns empty array when changes directory does not exist", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    mkdirSync(fixtureDir, { recursive: true });
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([]);
  });

  it("returns empty array when changes directory is empty", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    mkdirSync(join(fixtureDir, ".strict-spec-driven/changes"), { recursive: true });
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([]);
  });

  it("detects an active change in proposed state", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "my-change", "proposed");
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([{ name: "my-change", state: "proposed" }]);
  });

  it("detects an active change in applied state", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "active-work", "applied");
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([{ name: "active-work", state: "applied" }]);
  });

  it("returns multiple active changes", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "change-a", "proposed");
    makeChangeDir(fixtureDir, "change-b", "verified");
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toHaveLength(2);
    const names = result.map((c) => c.name);
    expect(names).toContain("change-a");
    expect(names).toContain("change-b");
  });

  it("excludes shipped terminal state", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "done-change", "shipped");
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([]);
  });

  it("excludes canceled terminal state", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "canceled-change", "canceled");
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([]);
  });

  it("skips directories without proposal.yaml", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    const dir = join(fixtureDir, ".strict-spec-driven/changes/no-proposal");
    mkdirSync(dir, { recursive: true });
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([]);
  });

  it("skips the archive subdirectory", () => {
    fixtureDir = join(tmpdir(), `active-changes-test-${Date.now()}`);
    makeChangeDir(fixtureDir, "archive/old-change", "shipped");
    const result = listActiveStrictChanges(fixtureDir);
    expect(result).toEqual([]);
  });
});
