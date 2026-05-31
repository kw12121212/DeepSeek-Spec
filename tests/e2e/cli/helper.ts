import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { hasE2eConfig, readE2eConfig } from "../helpers/config";

const BINARY_FALLBACK = "node dist/cli/index.js";
const CONFIG_PATH = resolve(import.meta.dirname, "../e2e.config.json");

export interface SpawnResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

export function binaryExists(): boolean {
  if (!existsSync(CONFIG_PATH)) {
    return existsSync(resolve(import.meta.dirname, "../../../dist/cli/index.js"));
  }
  return hasE2eConfig();
}

export function getBinaryPath(): string[] {
  if (!existsSync(CONFIG_PATH)) return BINARY_FALLBACK.split(" ");
  const config = readE2eConfig();
  return config.binaryPath.split(" ");
}

export function spawnBinary(
  args: string[],
  options?: { cwd?: string; timeout?: number },
): Promise<SpawnResult> {
  const cmd = getBinaryPath();
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd[0], [...cmd.slice(1), ...args], {
      cwd: options?.cwd,
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    const timer = options?.timeout
      ? setTimeout(() => {
          proc.kill("SIGKILL");
          reject(new Error(`Process timed out after ${options.timeout}ms`));
        }, options.timeout)
      : null;

    proc.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({ exitCode: code, stdout, stderr });
    });

    proc.on("error", (err) => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
  });
}

export function requireLlmConfig(): void {
  if (!hasE2eConfig()) {
    throw new Error(
      "E2E config with real LLM credentials is required. Create tests/e2e/e2e.config.json with a valid apiKey.",
    );
  }
}
