import { makeSkillHandler } from "./skill.js";

const STRICT_COMMANDS = [
  "strict-init",
  "strict-propose",
  "strict-apply",
  "strict-verify",
  "strict-review",
  "strict-archive",
  "strict-ship",
  "strict-cancel",
  "strict-brainstorm",
  "strict-modify",
  "strict-roadmap-recommend",
  "strict-auto",
] as const;

export const handlers: Record<string, ReturnType<typeof makeSkillHandler>> = Object.fromEntries(
  STRICT_COMMANDS.map((cmd) => [cmd, makeSkillHandler(cmd)]),
);
