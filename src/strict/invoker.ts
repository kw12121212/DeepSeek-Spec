import { execFile } from "node:child_process";
import { resolveEnginePath } from "./engine-path";

export type Subcommand =
  | "init"
  | "propose"
  | "generate"
  | "apply"
  | "verify"
  | "ready"
  | "archive"
  | "ship"
  | "cancel"
  | "roadmap-status"
  | "roadmap-sync"
  | "roadmap-recommend";

export interface InvokeResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface InvokeOptions {
  args?: string[];
  cwd?: string;
}

export function invokeStrict(
  subcommand: Subcommand,
  options?: InvokeOptions,
): Promise<InvokeResult> {
  const enginePath = resolveEnginePath();
  const args = [enginePath, subcommand, ...(options?.args ?? [])];
  const cwd = options?.cwd ?? process.cwd();

  return new Promise((resolve) => {
    execFile("node", args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, error: stderr.trim() || error.message });
        return;
      }

      const trimmed = stdout.trim();
      if (!trimmed) {
        resolve({ ok: true });
        return;
      }

      try {
        resolve({ ok: true, data: JSON.parse(trimmed) });
      } catch {
        resolve({ ok: true, data: trimmed });
      }
    });
  });
}
