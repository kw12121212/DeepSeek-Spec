import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";

interface MilestoneEntry {
  title: string;
  path: string;
  status: string;
}

interface RoadmapIndex {
  milestones: Record<string, MilestoneEntry>;
}

interface PlannedChange {
  id: string;
  milestone: string;
  depends_on?: string[];
}

interface PlannedChangeFile {
  planned_change: PlannedChange;
  status: string;
  summary?: string;
}

export interface RecommendResult {
  eligible: boolean;
  recommendation?: {
    id: string;
    milestone: string;
    path: string;
    summary?: string;
  };
  reason?: string;
}

function readYamlFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return parseYaml(readFileSync(path, "utf-8")) as T;
}

function isDependencyResolved(strictDir: string, depId: string): boolean {
  const archiveDir = join(strictDir, "changes/archive");
  if (existsSync(archiveDir)) {
    const entries = readdirSync(archiveDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.endsWith(`-${depId}`)) return true;
    }
  }

  const proposalPath = join(strictDir, "changes", depId, "proposal.yaml");
  const raw = readYamlFile<Record<string, unknown>>(proposalPath);
  if (!raw) return false;
  const status = (raw.change as Record<string, unknown>)?.status;
  return status === "archived" || status === "shipped";
}

export function roadmapRecommend(projectRoot: string): RecommendResult {
  const strictDir = resolve(projectRoot, ".strict-spec-driven");
  const index = readYamlFile<RoadmapIndex>(join(strictDir, "roadmap/INDEX.yaml"));
  if (!index?.milestones) {
    return { eligible: false, reason: "roadmap INDEX.yaml not found or has no milestones" };
  }

  const pcDir = join(strictDir, "roadmap/planned-changes");
  if (!existsSync(pcDir)) {
    return { eligible: false, reason: "no planned-changes directory" };
  }

  const files = readdirSync(pcDir).filter((f) => f.endsWith(".yaml"));

  for (const [milestoneId, milestoneEntry] of Object.entries(index.milestones)) {
    if (milestoneEntry.status === "complete") continue;

    for (const file of files) {
      const raw = readYamlFile<PlannedChangeFile>(join(pcDir, file));
      if (!raw?.planned_change) continue;
      if (raw.planned_change.milestone !== milestoneId) continue;
      if (raw.status !== "planned") continue;

      const deps = raw.planned_change.depends_on ?? [];
      if (deps.length > 0 && !deps.every((d) => isDependencyResolved(strictDir, d))) continue;

      return {
        eligible: true,
        recommendation: {
          id: raw.planned_change.id,
          milestone: raw.planned_change.milestone,
          path: `roadmap/planned-changes/${file}`,
          summary: raw.summary,
        },
      };
    }
  }

  return { eligible: false, reason: "no unblocked planned change found" };
}
