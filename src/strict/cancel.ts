import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { type ChangeState, attemptTransition, readCurrentState } from "./lifecycle.js";

export interface CancelResult {
  ok: true;
  previousState: ChangeState;
  directoryRemoved: boolean;
}

export interface CancelError {
  ok: false;
  error: string;
}

export type CancelOutcome = CancelResult | CancelError;

export function cancelChange(
  projectRoot: string,
  changeName: string,
  removeDir = false,
): CancelOutcome {
  const current = readCurrentState(projectRoot, changeName);
  if (current !== "proposed" && current !== "applied") {
    return {
      ok: false,
      error: `change '${changeName}' is in '${current}' state but requires 'proposed' or 'applied'`,
    };
  }

  attemptTransition(projectRoot, changeName, current, "canceled");

  let directoryRemoved = false;
  if (removeDir) {
    const dir = resolve(projectRoot, ".strict-spec-driven/changes", changeName);
    rmSync(dir, { recursive: true, force: true });
    directoryRemoved = true;
  }

  return { ok: true, previousState: current, directoryRemoved };
}
