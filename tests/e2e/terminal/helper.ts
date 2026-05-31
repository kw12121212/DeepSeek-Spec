import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { stripAnsi } from "../helpers/ansi-stripper";
import { hasE2eConfig, readE2eConfig } from "../helpers/config";
import { createFixtureWorktree } from "../helpers/fixture";

const CONFIG_PATH = resolve(import.meta.dirname, "../e2e.config.json");

let ptyModule: typeof import("node-pty") | null = null;

async function loadPty() {
  if (!ptyModule) {
    ptyModule = await import("node-pty");
  }
  return ptyModule;
}

export interface PtyHandle {
  pty: import("node-pty").IPty;
  output: string;
  waitUntil(pattern: RegExp, timeoutMs?: number): Promise<string>;
  kill(): void;
  worktree: { dir: string; cleanup: () => void };
}

export function shouldSkip(): boolean {
  return !existsSync(CONFIG_PATH) || !hasE2eConfig();
}

export async function spawnPty(args: string[], opts?: { cwd?: string }): Promise<PtyHandle> {
  const config = readE2eConfig();
  const pty = await loadPty();
  const worktree = opts?.cwd ? { dir: opts.cwd, cleanup: () => {} } : createFixtureWorktree();

  const cmd = config.binaryPath.split(" ");

  const proc = pty.spawn(cmd[0], [...cmd.slice(1), ...args], {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: worktree.dir,
    env: {
      ...process.env,
      DSPEC_API_KEY: config.apiKey,
      DSPEC_BASE_URL: config.baseUrl ?? "",
      DSPEC_MODEL: config.model,
    },
  });

  let output = "";

  proc.onData((data: string) => {
    output += data;
  });

  const defaultTimeout = config.timeout;

  async function waitUntil(pattern: RegExp, timeoutMs?: number): Promise<string> {
    const deadline = Date.now() + (timeoutMs ?? defaultTimeout);
    return new Promise<string>((resolve, reject) => {
      const check = () => {
        const stripped = stripAnsi(output);
        if (pattern.test(stripped)) {
          resolve(stripped);
          return;
        }
        if (Date.now() >= deadline) {
          reject(
            new Error(
              `Timeout waiting for ${pattern} in PTY output.\nLast output:\n${stripped.slice(-500)}`,
            ),
          );
          return;
        }
        setTimeout(check, 200);
      };
      check();
    });
  }

  function kill() {
    proc.kill();
    worktree.cleanup();
  }

  return { pty: proc, output, waitUntil, kill, worktree };
}
