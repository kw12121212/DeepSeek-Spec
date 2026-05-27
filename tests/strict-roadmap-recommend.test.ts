import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { roadmapRecommend } from "../src/strict/roadmap-recommend.js";

let fixtureDir: string;

function makeFixture(): string {
  fixtureDir = join(tmpdir(), `roadmap-recommend-test-${Date.now()}`);
  return fixtureDir;
}

function cleanup() {
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
}

function writeYaml(path: string, content: string) {
  mkdirSync(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  writeFileSync(path, content);
}

describe("roadmapRecommend", () => {
  afterEach(cleanup);

  it("returns no-eligible when INDEX.yaml is missing", () => {
    const root = makeFixture();
    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("INDEX.yaml");
  });

  it("returns no-eligible when milestones are all complete", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "roadmap/INDEX.yaml"),
      `milestones:
  m1:
    title: M1
    path: roadmap/milestones/m1.yaml
    status: complete
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone: { m1: { title: M1 } }
status: complete
planned_changes: {}
`,
    );
    mkdirSync(join(strictDir, "roadmap/planned-changes"), { recursive: true });

    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("no unblocked");
  });

  it("returns first eligible planned change with resolved deps", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "roadmap/INDEX.yaml"),
      `milestones:
  m1:
    title: M1
    path: roadmap/milestones/m1.yaml
    status: complete
  m2:
    title: M2
    path: roadmap/milestones/m2.yaml
    status: proposed
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m2.yaml"),
      `milestone: { m2: { title: M2 } }
status: proposed
planned_changes: {}
`,
    );

    writeYaml(
      join(strictDir, "changes/archive/2026-01-01-dep-a/proposal.yaml"),
      `change: { id: dep-a, status: archived }
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m2-blocked.yaml"),
      `planned_change:
  id: blocked-change
  milestone: m2
  depends_on: [dep-missing]
status: planned
summary: A blocked change
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m2-eligible.yaml"),
      `planned_change:
  id: eligible-change
  milestone: m2
  depends_on: [dep-a]
status: planned
summary: An eligible change
`,
    );

    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(true);
    expect(result.recommendation?.id).toBe("eligible-change");
    expect(result.recommendation?.milestone).toBe("m2");
    expect(result.recommendation?.summary).toBe("An eligible change");
    expect(result.recommendation?.path).toContain("m2-eligible.yaml");
  });

  it("skips planned changes with unresolved depends_on", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "roadmap/INDEX.yaml"),
      `milestones:
  m1:
    title: M1
    path: roadmap/milestones/m1.yaml
    status: proposed
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone: { m1: { title: M1 } }
status: proposed
planned_changes: {}
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-blocked.yaml"),
      `planned_change:
  id: blocked-change
  milestone: m1
  depends_on: [missing-dep]
status: planned
summary: Blocked
`,
    );

    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("no unblocked");
  });

  it("resolves dependency from active change with shipped status", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "roadmap/INDEX.yaml"),
      `milestones:
  m1:
    title: M1
    path: roadmap/milestones/m1.yaml
    status: proposed
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone: { m1: { title: M1 } }
status: proposed
planned_changes: {}
`,
    );

    writeYaml(
      join(strictDir, "changes/dep-shipped/proposal.yaml"),
      `change: { id: dep-shipped, status: shipped }
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-eligible.yaml"),
      `planned_change:
  id: eligible
  milestone: m1
  depends_on: [dep-shipped]
status: planned
summary: Eligible via shipped dep
`,
    );

    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(true);
    expect(result.recommendation?.id).toBe("eligible");
  });

  it("resolves dependency from archived directory", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "roadmap/INDEX.yaml"),
      `milestones:
  m1:
    title: M1
    path: roadmap/milestones/m1.yaml
    status: proposed
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone: { m1: { title: M1 } }
status: proposed
planned_changes: {}
`,
    );

    mkdirSync(join(strictDir, "changes/archive/2026-01-01-my-dep"), { recursive: true });

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-eligible.yaml"),
      `planned_change:
  id: eligible
  milestone: m1
  depends_on: [my-dep]
status: planned
summary: Eligible via archived dep
`,
    );

    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(true);
    expect(result.recommendation?.id).toBe("eligible");
  });

  it("skips planned changes with non-planned status", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "roadmap/INDEX.yaml"),
      `milestones:
  m1:
    title: M1
    path: roadmap/milestones/m1.yaml
    status: proposed
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone: { m1: { title: M1 } }
status: proposed
planned_changes: {}
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-complete.yaml"),
      `planned_change:
  id: already-done
  milestone: m1
status: complete
summary: Already done
`,
    );

    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(false);
  });

  it("returns first eligible in milestone order", () => {
    const root = makeFixture();
    const strictDir = join(root, ".strict-spec-driven");

    writeYaml(
      join(strictDir, "roadmap/INDEX.yaml"),
      `milestones:
  m1:
    title: M1
    path: roadmap/milestones/m1.yaml
    status: proposed
  m2:
    title: M2
    path: roadmap/milestones/m2.yaml
    status: proposed
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m1.yaml"),
      `milestone: { m1: { title: M1 } }
status: proposed
planned_changes: {}
`,
    );
    writeYaml(
      join(strictDir, "roadmap/milestones/m2.yaml"),
      `milestone: { m2: { title: M2 } }
status: proposed
planned_changes: {}
`,
    );

    writeYaml(
      join(strictDir, "roadmap/planned-changes/m1-first.yaml"),
      `planned_change:
  id: first
  milestone: m1
status: planned
summary: First
`,
    );
    writeYaml(
      join(strictDir, "roadmap/planned-changes/m2-second.yaml"),
      `planned_change:
  id: second
  milestone: m2
status: planned
summary: Second
`,
    );

    const result = roadmapRecommend(root);
    expect(result.eligible).toBe(true);
    expect(result.recommendation?.id).toBe("first");
  });
});
