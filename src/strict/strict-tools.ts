import type { ToolRegistry } from "../tools.js";
import type { JSONSchema } from "../types.js";
import { type Subcommand, invokeStrict } from "./invoker.js";

interface StrictToolArgs {
  changeName?: string;
  [key: string]: unknown;
}

type StrictToolDef = {
  subcommand: Subcommand;
  description: string;
  requiresChangeName: boolean;
};

const STRICT_TOOLS: StrictToolDef[] = [
  {
    subcommand: "propose",
    description:
      "Scaffold a new strict-spec change directory under .strict-spec-driven/changes/<name>/ with proposal, design, tasks, questions, and specs/ artifacts.",
    requiresChangeName: true,
  },
  {
    subcommand: "generate",
    description:
      "Generate a strict-spec artifact (proposal, design, questions, or delta-spec) for an existing change using named CLI arguments.",
    requiresChangeName: true,
  },
  {
    subcommand: "apply",
    description:
      "Mark the next pending implementation task as in_progress, then completed. Mutates tasks.yaml.",
    requiresChangeName: true,
  },
  {
    subcommand: "verify",
    description:
      "Verify a strict change against its specs and task completion. Reports blockers and diagnostics.",
    requiresChangeName: true,
  },
  {
    subcommand: "ready",
    description:
      "Check whether a strict change is ready for implementation. Reports deterministic handoff blockers.",
    requiresChangeName: true,
  },
  {
    subcommand: "archive",
    description:
      "Archive a completed strict change: freeze its artifacts and reconcile roadmap milestone status.",
    requiresChangeName: true,
  },
  {
    subcommand: "ship",
    description:
      "Ship a strict change by staging and committing its implementation and spec artifacts via git.",
    requiresChangeName: true,
  },
  {
    subcommand: "cancel",
    description:
      "Cancel an in-progress strict change and revert any uncommitted file changes under its change directory.",
    requiresChangeName: true,
  },
  {
    subcommand: "roadmap-status",
    description:
      "Report the current status of all roadmap milestones and planned changes. Read-only.",
    requiresChangeName: false,
  },
  {
    subcommand: "roadmap-sync",
    description:
      "Reconcile roadmap YAML state against active and archived strict changes. Mutates roadmap files.",
    requiresChangeName: false,
  },
  {
    subcommand: "roadmap-recommend",
    description:
      "Recommend the next strict roadmap-backed change based on dependency analysis and completion state.",
    requiresChangeName: false,
  },
];

function buildCliArgs(args: StrictToolArgs): string[] {
  const cliArgs: string[] = [];
  if (args.changeName) cliArgs.push(args.changeName);

  for (const [key, value] of Object.entries(args)) {
    if (key === "changeName") continue;
    if (value === undefined || value === null) continue;
    if (typeof value === "boolean") {
      if (value) cliArgs.push(`--${key}`);
    } else {
      cliArgs.push(`--${key}`, String(value));
    }
  }

  return cliArgs;
}

function makeHandler(subcommand: Subcommand) {
  return async (args: StrictToolArgs): Promise<unknown> => {
    const cliArgs = buildCliArgs(args);
    return invokeStrict(subcommand, { args: cliArgs });
  };
}

export function registerStrictTools(registry: ToolRegistry): ToolRegistry {
  for (const def of STRICT_TOOLS) {
    const toolName = `strict_${def.subcommand.replace(/-/g, "_")}`;
    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];

    if (def.requiresChangeName) {
      properties.changeName = {
        type: "string",
        description: "Name of the strict-spec change to operate on.",
      };
      required.push("changeName");
    }

    if (def.subcommand === "generate") {
      properties.artifact = {
        type: "string",
        description: "Artifact type to generate: proposal, design, questions, or delta-spec.",
      };
      required.push("artifact");
    }

    const parameters: JSONSchema = {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };

    registry.register({
      name: toolName,
      description: def.description,
      parameters,
      parallelSafe: false,
      fn: makeHandler(def.subcommand),
    });
  }

  return registry;
}
