import { type ChangeState, readCurrentState } from "./lifecycle.js";

export function requireState(
  projectRoot: string,
  changeName: string,
  ...requiredStates: ChangeState[]
): string | undefined {
  const current = readCurrentState(projectRoot, changeName);
  if (requiredStates.includes(current)) return undefined;
  return `change '${changeName}' is in '${current}' state but requires '${requiredStates.join("' or '")}'`;
}
