import { execFile } from "node:child_process";
import { type InvokeResult, type Subcommand, invokeStrict } from "./invoker.js";
import { milestoneAdvance } from "./milestone-advance.js";
import { propose } from "./propose.js";

export type PipelineStep =
  | "recommend"
  | "propose"
  | "apply"
  | "verify"
  | "review"
  | "archive"
  | "ship";

const STEPS: readonly PipelineStep[] = [
  "recommend",
  "apply",
  "verify",
  "review",
  "archive",
  "ship",
] as const;

const FREEFORM_STEPS: readonly PipelineStep[] = [
  "propose",
  "apply",
  "verify",
  "review",
  "archive",
  "ship",
] as const;

const STEP_SUBCOMMANDS: Record<PipelineStep, Subcommand> = {
  recommend: "roadmap-recommend",
  propose: "propose",
  apply: "apply",
  verify: "verify",
  review: "ready",
  archive: "archive",
  ship: "ship",
};

export interface StepResult {
  step: PipelineStep;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface PipelineResult {
  completed: StepResult[];
  failed?: StepResult;
  synced: boolean;
}

export interface PipelineOptions {
  changeName: string;
  from?: PipelineStep;
  cwd?: string;
  verifyCommand?: string;
  gateCheckFn?: () => Promise<{ ok: boolean; error?: string }>;
}

function runGateCheck(cwd: string, command: string): Promise<{ ok: boolean; error?: string }> {
  const [cmd, ...rest] = command.split(" ");
  return new Promise((resolve) => {
    execFile(
      cmd!,
      rest,
      { cwd, maxBuffer: 10 * 1024 * 1024 },
      (err: Error | null, _stdout: string, stderr: string) => {
        if (err) {
          resolve({ ok: false, error: stderr.trim() || err.message });
          return;
        }
        resolve({ ok: true });
      },
    );
  });
}

export interface FreeformPipelineOptions {
  changeName: string;
  description: string;
  from?: PipelineStep;
  cwd?: string;
  verifyCommand?: string;
  gateCheckFn?: () => Promise<{ ok: boolean; error?: string }>;
}

export async function runAutoPipeline(options: PipelineOptions): Promise<PipelineResult> {
  const {
    changeName,
    from,
    cwd = process.cwd(),
    verifyCommand = "npm run verify",
    gateCheckFn,
  } = options;

  const startIdx = from ? STEPS.indexOf(from) : 0;
  if (startIdx < 0) {
    const failedStep = from as PipelineStep;
    return {
      completed: [],
      failed: { step: failedStep, ok: false, error: `unknown step '${failedStep}'` },
      synced: false,
    };
  }

  const completed: StepResult[] = [];
  let synced = false;

  for (let i = startIdx; i < STEPS.length; i++) {
    const step = STEPS[i] as PipelineStep;
    const subcommand: Subcommand = STEP_SUBCOMMANDS[step];

    let result: InvokeResult;
    if (step === "recommend") {
      result = await invokeStrict("roadmap-recommend", { cwd });
    } else {
      result = await invokeStrict(subcommand, { args: [changeName], cwd });
    }

    if (!result.ok) {
      return {
        completed,
        failed: { step, ok: false, error: result.error },
        synced,
      };
    }

    const stepResult: StepResult = { step, ok: true, data: result.data };

    if (step !== "ship") {
      const gate = gateCheckFn ? await gateCheckFn() : await runGateCheck(cwd, verifyCommand);
      if (!gate.ok) {
        return {
          completed,
          failed: { step, ok: false, error: `gate check failed: ${gate.error}` },
          synced,
        };
      }
    }

    completed.push(stepResult);

    if (step === "archive") {
      const syncResult = await invokeStrict("roadmap-sync", { cwd });
      synced = syncResult.ok;
      const advance = milestoneAdvance(cwd, changeName);
      if (advance.advanced) {
        const reSync = await invokeStrict("roadmap-sync", { cwd });
        synced = reSync.ok;
      }
    }
  }

  return { completed, synced };
}

export async function runFreeformPipeline(
  options: FreeformPipelineOptions,
): Promise<PipelineResult> {
  const {
    changeName,
    description,
    from,
    cwd = process.cwd(),
    verifyCommand = "npm run verify",
    gateCheckFn,
  } = options;

  const startIdx = from ? FREEFORM_STEPS.indexOf(from) : 0;
  if (startIdx < 0) {
    return {
      completed: [],
      failed: { step: from!, ok: false, error: `unknown step '${from}'` },
      synced: false,
    };
  }

  const completed: StepResult[] = [];
  let synced = false;

  for (let i = startIdx; i < FREEFORM_STEPS.length; i++) {
    const step = FREEFORM_STEPS[i]!;

    let stepOk = true;
    let stepError: string | undefined;
    let stepData: unknown;

    if (step === "propose") {
      const proposeResult = await propose(cwd, { changeName, description });
      if (!proposeResult.ok) {
        stepOk = false;
        stepError = proposeResult.error;
      } else {
        stepData = proposeResult;
      }
    } else {
      const subcommand = STEP_SUBCOMMANDS[step];
      const result = await invokeStrict(subcommand, { args: [changeName], cwd });
      stepOk = result.ok;
      stepError = result.error;
      stepData = result.data;
    }

    if (!stepOk) {
      return {
        completed,
        failed: { step, ok: false, error: stepError! },
        synced,
      };
    }

    const stepResult: StepResult = { step, ok: true, data: stepData };

    if (step !== "ship") {
      const gate = gateCheckFn ? await gateCheckFn() : await runGateCheck(cwd, verifyCommand);
      if (!gate.ok) {
        return {
          completed,
          failed: { step, ok: false, error: `gate check failed: ${gate.error}` },
          synced,
        };
      }
    }

    completed.push(stepResult);

    if (step === "archive") {
      const syncResult = await invokeStrict("roadmap-sync", { cwd });
      synced = syncResult.ok;
      const advance = milestoneAdvance(cwd, changeName);
      if (advance.advanced) {
        const reSync = await invokeStrict("roadmap-sync", { cwd });
        synced = reSync.ok;
      }
    }
  }

  return { completed, synced };
}
