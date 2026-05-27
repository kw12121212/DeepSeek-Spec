import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { milestoneAdvance } from "../src/strict/milestone-advance.js";

let fixtureDir: string;

function makeFixture(): string {
  fixtureDir = join(tmpdir(), `milestone-advance-test-${Date.now()}`);
  return fixtureDir;
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

function writeYaml(path: string, content: string) {
  mkdirSync(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  writeFileSync(path, content);
}

function readYaml(path: string): string | null {
  try {
    return require("node:fs").readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

describe("milestoneAdvance", () => {
  afterEach(cleanup);

  it("returns not advanced when change has no roadmap milestone", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");
    writeYaml(
      join(strictDir, "changes/my-change/proposal.yaml"),
      "change: { id: my-change, status: archived }\n",
    );

    const result = milestoneAdvance(root, "my-change");
    expect(result.advanced).toBe(false);
    expect(result.reason).toContain("no roadmap milestone");
  });

  it("returns not advanced when some planned changes are incomplete", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "changes/my-change/proposal.yaml"),
      `change: { id: my-change, status: archived }
roadmap:
  milestone: m1
  planned_change: pc-b
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-a.yaml"),
      `planned_change:
  id: pc-a
  milestone: m1
status: complete
`,
    );
    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-b.yaml"),
      `planned_change:
  id: pc-b
  milestone: m1
status: planned
`,
    );

    const result = milestoneAdvance(root, "my-change");
    expect(result.advanced).toBe(false);
    expect(result.milestoneId).toBe("m1");
    expect(result.reason).toContain("not all planned changes are complete");
  });

  it("advances milestone when all planned changes are complete", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "changes/my-change/proposal.yaml"),
      `change: { id: my-change, status: archived }
roadmap:
  milestone: m1
  planned_change: pc-b
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-a.yaml"),
      `planned_change:
  id: pc-a
  milestone: m1
status: complete
`,
    );
    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-b.yaml"),
      `planned_change:
  id: pc-b
  milestone: m1
status: complete
`,
    );

    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone:
  m1:
    title: M1
status: active
`,
    );

    const result = milestoneAdvance(root, "my-change");
    expect(result.advanced).toBe(true);
    expect(result.milestoneId).toBe("m1");

    const updated = readYaml(join(strictDir, "roadmap/milestones/m1.yaml"));
    expect(updated).toContain("status: complete");
  });

  it("ignores planned changes from other milestones", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "changes/my-change/proposal.yaml"),
      `change: { id: my-change, status: archived }
roadmap:
  milestone: m1
  planned_change: pc-a
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-a.yaml"),
      `planned_change:
  id: pc-a
  milestone: m1
status: complete
`,
    );
    writeYaml(
      join(strictDir, "roadmap/planned-changes/m2-b.yaml"),
      `planned_change:
  id: pc-b
  milestone: m2
status: planned
`,
    );

    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone:
  m1:
    title: M1
status: active
`,
    );

    const result = milestoneAdvance(root, "my-change");
    expect(result.advanced).toBe(true);
    expect(result.milestoneId).toBe("m1");
  });

  it("returns not advanced when no planned changes directory exists", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "changes/my-change/proposal.yaml"),
      `change: { id: my-change, status: archived }
roadmap:
  milestone: m1
`,
    );

    const result = milestoneAdvance(root, "my-change");
    expect(result.advanced).toBe(false);
    expect(result.reason).toContain("no planned-changes directory");
  });

  it("returns not advanced when milestone YAML is missing", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "changes/my-change/proposal.yaml"),
      `change: { id: my-change, status: archived }
roadmap:
  milestone: m-missing
  planned_change: pc-a
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m-a.yaml"),
      `planned_change:
  id: pc-a
  milestone: m-missing
status: complete
`,
    );

    const result = milestoneAdvance(root, "my-change");
    expect(result.advanced).toBe(false);
    expect(result.reason).toContain("milestone YAML not found");
  });
});
