import type { ToolRegistry } from "../tools.js";
import type { JSONSchema } from "../types.js";
import { type PipelineStep, runAutoPipeline, runFreeformPipeline } from "./auto-pipeline.js";
import { brainstorm } from "./brainstorm.js";
import { cancelChange } from "./cancel.js";
import { requireState } from "./guard.js";
import { type Subcommand, invokeStrict } from "./invoker.js";
import type { ChangeState } from "./lifecycle.js";
import { propose } from "./propose.js";
import { roadmapRecommend } from "./roadmap-recommend.js";

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
    requiresChangeName: false,
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
  {
    subcommand: "brainstorm",
    description:
      "Interactive brainstorming tool that refines a rough idea into a structured change summary. Multi-call protocol: returns questions for the agent to relay, or a structured summary for user confirmation.",
    requiresChangeName: false,
  },
  {
    subcommand: "auto-pipeline",
    description:
      "Run the full roadmap-driven auto pipeline (recommend->apply->verify->review->archive->ship) in one call with gate checks between steps.",
    requiresChangeName: true,
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

const STATE_GUARDS: Partial<Record<Subcommand, ChangeState[]>> = {
  apply: ["proposed"],
  generate: ["proposed"],
  verify: ["applied"],
  archive: ["reviewed"],
  ship: ["archived"],
  cancel: ["proposed", "applied"],
};

function makeHandler(subcommand: Subcommand) {
  const requiredStates = STATE_GUARDS[subcommand];
  return async (args: StrictToolArgs): Promise<unknown> => {
    if (requiredStates && args.changeName) {
      const error = requireState(process.cwd(), args.changeName, ...requiredStates);
      if (error) return { ok: false, error };
    }
    if (subcommand === "propose") {
      return propose(process.cwd(), {
        changeName: args.changeName ?? "",
        description: typeof args.description === "string" ? args.description : "",
      });
    }
    if (subcommand === "cancel") {
      return cancelChange(process.cwd(), args.changeName ?? "", args.removeDir === true);
    }
    if (subcommand === "roadmap-recommend") {
      return roadmapRecommend(process.cwd());
    }
    if (subcommand === "brainstorm") {
      return brainstorm({
        idea: typeof args.idea === "string" ? args.idea : undefined,
        history: Array.isArray(args.history) ? args.history : undefined,
        summary: args.summary,
      });
    }
    if (subcommand === "auto-pipeline") {
      if (typeof args.description === "string" && args.description.trim()) {
        return runFreeformPipeline({
          changeName: args.changeName ?? "",
          description: args.description,
          from: typeof args.from === "string" ? (args.from as PipelineStep) : undefined,
        });
      }
      return runAutoPipeline({
        changeName: args.changeName ?? "",
        from: typeof args.from === "string" ? (args.from as PipelineStep) : undefined,
      });
    }
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

    if (def.subcommand === "brainstorm") {
      properties.idea = {
        type: "string",
        description: "Rough free-text idea to refine.",
      };
      properties.history = {
        type: "array",
        description: "Accumulated Q&A pairs from previous brainstorm turns.",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
        },
      };
      properties.summary = {
        type: "object",
        description: "Partial or complete structured summary for validation.",
        properties: {
          title: { type: "string" },
          goal: { type: "string" },
          scope: {
            type: "object",
            properties: {
              in: { type: "array", items: { type: "string" } },
              out: { type: "array", items: { type: "string" } },
            },
          },
          done_criteria: { type: "array", items: { type: "string" } },
        },
      };
    }

    if (def.subcommand === "propose") {
      properties.changeName = {
        type: "string",
        description: "Name for the new strict-spec change.",
      };
      properties.description = {
        type: "string",
        description: "Free-text description of what the change should accomplish.",
      };
      required.push("changeName");
      required.push("description");
    }

    if (def.subcommand === "auto-pipeline") {
      properties.from = {
        type: "string",
        description:
          "Resume from a specific pipeline step (recommend, apply, verify, review, archive, ship). Default starts from recommend.",
      };
      properties.description = {
        type: "string",
        description:
          "Free-text description for the freeform variant. If provided, runs propose->apply->verify->review->archive->ship instead of the roadmap-driven pipeline.",
      };
    }

    if (def.subcommand === "cancel") {
      properties.removeDir = {
        type: "boolean",
        description: "Remove the change directory after cancellation. Defaults to false.",
      };
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
