import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export type ChangeState =
  | "proposed"
  | "applied"
  | "verified"
  | "reviewed"
  | "archived"
  | "shipped"
  | "canceled";

const TERMINAL_STATES: ReadonlySet<ChangeState> = new Set(["shipped", "canceled"]);

const VALID_TRANSITIONS = new Map<ChangeState, Set<ChangeState>>([
  ["proposed", new Set(["applied", "canceled"])],
  ["applied", new Set(["verified"])],
  ["verified", new Set(["reviewed"])],
  ["reviewed", new Set(["archived"])],
  ["archived", new Set(["shipped"])],
]);

export class TransitionError extends Error {
  constructor(
    public readonly from: ChangeState,
    public readonly to: ChangeState,
    reason: string,
  ) {
    super(reason);
    this.name = "TransitionError";
  }
}

function changeDir(projectRoot: string, changeName: string): string {
  return resolve(projectRoot, ".strict-spec-driven/changes", changeName);
}

function proposalPath(projectRoot: string, changeName: string): string {
  return join(changeDir(projectRoot, changeName), "proposal.yaml");
}

interface ProposalYaml {
  change?: {
    id?: string;
    status?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function readProposal(projectRoot: string, changeName: string): ProposalYaml {
  const path = proposalPath(projectRoot, changeName);
  if (!existsSync(path)) {
    throw new TransitionError(
      "proposed" as ChangeState,
      "proposed" as ChangeState,
      `proposal.yaml not found for change '${changeName}'`,
    );
  }
  const raw = readFileSync(path, "utf-8");
  return parseYaml(raw) ?? {};
}

function writeState(projectRoot: string, changeName: string, state: ChangeState): void {
  const path = proposalPath(projectRoot, changeName);
  const proposal = readProposal(projectRoot, changeName);
  if (!proposal.change) proposal.change = {};
  proposal.change.status = state;
  writeFileSync(path, stringifyYaml(proposal), "utf-8");
}

export function readCurrentState(projectRoot: string, changeName: string): ChangeState {
  const proposal = readProposal(projectRoot, changeName);
  const status = proposal.change?.status;
  if (!status || typeof status !== "string") {
    throw new TransitionError(
      "proposed" as ChangeState,
      "proposed" as ChangeState,
      `change.status not found in proposal.yaml for '${changeName}'`,
    );
  }
  return status as ChangeState;
}

export function attemptTransition(
  projectRoot: string,
  changeName: string,
  from: ChangeState,
  to: ChangeState,
): void {
  if (TERMINAL_STATES.has(from)) {
    throw new TransitionError(
      from,
      to,
      `'${from}' is a terminal state — no further transitions allowed`,
    );
  }

  const allowed = VALID_TRANSITIONS.get(from);
  if (!allowed || !allowed.has(to)) {
    throw new TransitionError(from, to, `invalid transition '${from}' -> '${to}'`);
  }

  writeState(projectRoot, changeName, to);
}
