import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { requireState } from "./guard.js";
import { readCurrentState } from "./lifecycle.js";

export interface ModifyFields {
  what?: string[];
  why?: string[];
  scope_in?: string[];
  scope_out?: string[];
}

export interface ModifyArgs {
  changeName: string;
  fields: ModifyFields;
  confirm: boolean;
}

export interface ScopeSummary {
  what: string[];
  why: string[];
  scope_in: string[];
  scope_out: string[];
}

export interface ModifySuccess {
  ok: true;
  changeName: string;
  previousState: string;
  scope: ScopeSummary;
  warning?: string;
}

export type ModifyResult = ModifySuccess | { ok: false; error: string };

function changeDir(projectRoot: string, changeName: string): string {
  return resolve(projectRoot, ".strict-spec-driven/changes", changeName);
}

function proposalPath(projectRoot: string, changeName: string): string {
  return join(changeDir(projectRoot, changeName), "proposal.yaml");
}

function designPath(projectRoot: string, changeName: string): string {
  return join(changeDir(projectRoot, changeName), "design.yaml");
}

function readYamlFile(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf-8");
  return (parseYaml(raw) ?? {}) as Record<string, unknown>;
}

function extractScope(proposal: Record<string, unknown>): ScopeSummary {
  const summary = (proposal.summary ?? {}) as Record<string, unknown>;
  const scope = (proposal.scope ?? {}) as Record<string, unknown>;
  return {
    what: Array.isArray(summary.what) ? summary.what : [],
    why: Array.isArray(summary.why) ? summary.why : [],
    scope_in: Array.isArray(scope.in) ? scope.in : [],
    scope_out: Array.isArray(scope.out) ? scope.out : [],
  };
}

export function modifyChange(projectRoot: string, args: ModifyArgs): ModifyResult {
  const dir = changeDir(projectRoot, args.changeName);
  if (!existsSync(dir)) {
    return { ok: false, error: `change '${args.changeName}' does not exist` };
  }

  const stateError = requireState(projectRoot, args.changeName, "proposed", "applied");
  if (stateError) {
    return { ok: false, error: stateError };
  }

  if (!args.confirm) {
    return {
      ok: false,
      error: "confirmation is required to modify a change — set confirm to true",
    };
  }

  const currentState = readCurrentState(projectRoot, args.changeName);
  const pp = proposalPath(projectRoot, args.changeName);
  const dp = designPath(projectRoot, args.changeName);

  const proposal = readYamlFile(pp);

  if (!proposal.summary) proposal.summary = {};
  if (!proposal.scope) proposal.scope = {};

  if (args.fields.what?.length) {
    (proposal.summary as Record<string, unknown>).what = args.fields.what;
  }
  if (args.fields.why?.length) {
    (proposal.summary as Record<string, unknown>).why = args.fields.why;
  }
  if (args.fields.scope_in?.length) {
    (proposal.scope as Record<string, unknown>).in = args.fields.scope_in;
  }
  if (args.fields.scope_out?.length) {
    (proposal.scope as Record<string, unknown>).out = args.fields.scope_out;
  }

  writeFileSync(pp, stringifyYaml(proposal), "utf-8");

  const design = readYamlFile(dp);
  if (Object.keys(design).length > 0) {
    writeFileSync(dp, stringifyYaml(design), "utf-8");
  }

  const updatedScope = extractScope(readYamlFile(pp));

  const result: ModifySuccess = {
    ok: true,
    changeName: args.changeName,
    previousState: currentState,
    scope: updatedScope,
  };

  if (currentState === "applied") {
    result.warning =
      "change was in applied state — modifications may require re-apply to update implementation";
  }

  return result;
}
