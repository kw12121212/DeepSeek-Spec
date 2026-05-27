import { t } from "@/i18n/index.js";
import { SkillStore } from "@/skills.js";
import type { SlashHandler } from "../dispatch.js";

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

function makeStrictHandler(cmd: string): SlashHandler {
  return (args, _loop, ctx) => {
    const store = new SkillStore({ projectRoot: ctx.codeRoot });
    const skillName = cmd;
    const found = store.read(skillName);
    if (!found) {
      return { info: t("handlers.skill.runNotFound", { name: skillName }) };
    }
    const extra = args.join(" ").trim();
    const header = `# Skill: ${found.name}${found.description ? `\n> ${found.description}` : ""}`;
    const argsLine = extra ? `\n\nArguments: ${extra}` : "";
    const payload = `${header}\n\n${found.body}${argsLine}`;
    return {
      info: t("handlers.skill.runInfo", {
        name: found.name,
        args: extra ? ` — ${extra}` : "",
      }),
      resubmit: payload,
    };
  };
}

export const handlers: Record<string, SlashHandler> = Object.fromEntries(
  STRICT_COMMANDS.map((cmd) => [cmd, makeStrictHandler(cmd)]),
);
