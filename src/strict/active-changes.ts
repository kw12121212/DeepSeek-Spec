import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { ChangeState } from "./lifecycle.js";

const TERMINAL_STATES: ReadonlySet<ChangeState> = new Set(["shipped", "canceled"]);

export interface ActiveChange {
  name: string;
  state: ChangeState;
}

export function listActiveStrictChanges(projectRoot: string): ActiveChange[] {
  const changesDir = resolve(projectRoot, ".strict-spec-driven/changes");
  if (!existsSync(changesDir)) return [];

  const entries = readdirSync(changesDir, { withFileTypes: true });
  const results: ActiveChange[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "archive") continue;

    const proposalFile = join(changesDir, entry.name, "proposal.yaml");
    if (!existsSync(proposalFile)) continue;

    const raw = readFileSync(proposalFile, "utf-8");
    const parsed = parseYaml(raw) as { change?: { status?: string } } | null;
    const state = parsed?.change?.status;

    if (!state || typeof state !== "string") continue;
    if (TERMINAL_STATES.has(state as ChangeState)) continue;

    results.push({ name: entry.name, state: state as ChangeState });
  }

  return results;
}
