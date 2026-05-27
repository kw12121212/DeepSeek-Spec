import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export interface MilestoneAdvanceResult {
  advanced: boolean;
  milestoneId?: string;
  reason?: string;
}

interface ProposalYaml {
  roadmap?: {
    milestone?: string;
    planned_change?: string;
  };
  [key: string]: unknown;
}

interface PlannedChangeFile {
  planned_change: {
    id: string;
    milestone: string;
    [key: string]: unknown;
  };
  status: string;
  [key: string]: unknown;
}

interface MilestoneYaml {
  milestone: Record<string, { title: string }>;
  status: string;
  [key: string]: unknown;
}

function readYamlFile<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return parseYaml(readFileSync(path, "utf-8")) as T;
}

export function milestoneAdvance(projectRoot: string, changeName: string): MilestoneAdvanceResult {
  const strictDir = resolve(projectRoot, ".strict-spec-driven");
  const proposalFile = join(strictDir, "changes", changeName, "proposal.yaml");
  const proposal = readYamlFile<ProposalYaml>(proposalFile);

  if (!proposal?.roadmap?.milestone) {
    return { advanced: false, reason: "change has no roadmap milestone" };
  }

  const milestoneId = proposal.roadmap.milestone;
  const pcDir = join(strictDir, "roadmap/planned-changes");
  if (!existsSync(pcDir)) {
    return { advanced: false, reason: "no planned-changes directory" };
  }

  const files = readdirSync(pcDir).filter((f) => f.endsWith(".yaml") && !f.startsWith("."));

  const milestoneChanges: PlannedChangeFile[] = [];
  for (const file of files) {
    const raw = readYamlFile<PlannedChangeFile>(join(pcDir, file));
    if (raw?.planned_change?.milestone === milestoneId) {
      milestoneChanges.push(raw);
    }
  }

  if (milestoneChanges.length === 0) {
    return { advanced: false, reason: "no planned changes found for milestone" };
  }

  const allComplete = milestoneChanges.every((pc) => pc.status === "complete");
  if (!allComplete) {
    return {
      advanced: false,
      milestoneId,
      reason: "not all planned changes are complete",
    };
  }

  const milestonePath = join(strictDir, "roadmap/milestones", `${milestoneId}.yaml`);
  const milestoneYaml = readYamlFile<MilestoneYaml>(milestonePath);
  if (!milestoneYaml) {
    return { advanced: false, reason: `milestone YAML not found: ${milestoneId}` };
  }

  milestoneYaml.status = "complete";
  writeFileSync(milestonePath, stringifyYaml(milestoneYaml), "utf-8");

  return { advanced: true, milestoneId };
}
