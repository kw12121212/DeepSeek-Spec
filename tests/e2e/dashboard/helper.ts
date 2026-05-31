import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { stripAnsi } from "../helpers/ansi-stripper";
import { hasE2eConfig, readE2eConfig } from "../helpers/config";
import { createFixtureWorktree } from "../helpers/fixture";

const CONFIG_PATH = resolve(import.meta.dirname, "../e2e.config.json");
const DASHBOARD_URL_RE = /http:\/\/[\d.]+:\d+\/\?token=([a-f0-9]{64})/;
const STARTUP_TIMEOUT = 30_000;

export interface DashboardHandle {
  url: string;
  token: string;
  port: number;
  stop: () => void;
}

let ptyModule: typeof import("node-pty") | null = null;

async function loadPty() {
  if (!ptyModule) {
    ptyModule = await import("node-pty");
  }
  return ptyModule;
}

export function shouldSkip(): boolean {
  return !existsSync(CONFIG_PATH) || !hasE2eConfig();
}

export function requireDashboard(): void {
  if (shouldSkip()) {
    throw new Error(
      "E2E config with real LLM credentials is required. Create tests/e2e/e2e.config.json with a valid apiKey.",
    );
  }
  try {
    execSync("agent-browser --version", { stdio: "pipe" });
  } catch {
    throw new Error("agent-browser CLI is required but not found in PATH.");
  }
}

export async function startDashboard(opts?: { port?: number }): Promise<DashboardHandle> {
  const config = readE2eConfig();
  const pty = await loadPty();
  const worktree = createFixtureWorktree();

  const cmd = config.binaryPath.split(" ");
  const args = [...cmd.slice(1)];
  if (opts?.port) {
    args.push("--dashboard-port", String(opts.port));
  }

  const proc = pty.spawn(cmd[0], args, {
    name: "xterm-256color",
    cwd: worktree.dir,
    env: {
      ...process.env,
      DSPEC_API_KEY: config.apiKey,
      DSPEC_BASE_URL: config.baseUrl ?? "",
      DSPEC_MODEL: config.model,
    },
  });

  const url = await new Promise<string>((resolveUrl, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      proc.kill();
      worktree.cleanup();
      reject(new Error(`Dashboard did not start within ${STARTUP_TIMEOUT}ms`));
    }, STARTUP_TIMEOUT);

    proc.onData((data: string) => {
      output += stripAnsi(data);
      const match = DASHBOARD_URL_RE.exec(output);
      if (match) {
        clearTimeout(timer);
        resolveUrl(match[0]);
      }
    });

    proc.onExit(() => {
      clearTimeout(timer);
      reject(new Error("Dashboard process exited before URL was detected"));
    });
  });

  const tokenMatch = DASHBOARD_URL_RE.exec(url);
  const token = tokenMatch?.[1] ?? "";
  const portMatch = /:(\d+)\//.exec(url);
  const port = portMatch ? Number(portMatch[1]) : 0;

  return {
    url,
    token,
    port,
    stop: () => {
      proc.write("/exit\r");
      setTimeout(() => {
        proc.kill();
        worktree.cleanup();
      }, 3000);
    },
  };
}

export function authHeaders(token: string): Record<string, string> {
  return { "X-Dspec-Token": token };
}

export function apiUrl(dashboard: DashboardHandle, path: string): string {
  return `http://127.0.0.1:${dashboard.port}${path}`;
}
