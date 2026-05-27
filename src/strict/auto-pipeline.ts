import { execFile } from "node:child_process";
import { type InvokeResult, type Subcommand, invokeStrict } from "./invoker.js";

export type PipelineStep = "recommend" | "apply" | "verify" | "review" | "archive" | "ship";

const STEPS: readonly PipelineStep[] = [
  "recommend",
  "apply",
  "verify",
  "review",
  "archive",
  "ship",
] as const;

const STEP_SUBCOMMANDS: Record<PipelineStep, Subcommand> = {
  recommend: "roadmap-recommend",
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
    }
  }

  return { completed, synced };
}
