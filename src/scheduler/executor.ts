import { mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { t } from "../i18n/index.js";
import { CacheFirstLoop } from "../loop.js";
import { ImmutablePrefix } from "../memory/runtime.js";
import type { ModelClient } from "../ports/model-client.js";
import type { ToolRegistry } from "../tools.js";
import type { TaskExecutorPort } from "./scheduler.js";
import type { ScheduledTask } from "./store.js";

const DEFAULT_TIMEOUT_MS = 300_000;
const DEFAULT_MAX_ITERS = 10;
const KEEP_SESSIONS = 5;

export interface TaskExecutionResult {
  taskId: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "error";
  outputSnippet: string;
  duration: number;
}

export interface TaskExecutorOptions {
  client: ModelClient;
  tools: ToolRegistry;
  projectRoot: string;
  buildSystemPrompt: () => string;
  maxIters?: number;
  timeoutMs?: number;
}

function getTimeoutMs(): number {
  const env = process.env.DSPEC_SCHEDULED_TIMEOUT_MS;
  if (!env) return DEFAULT_TIMEOUT_MS;
  const parsed = Number.parseInt(env, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function getMaxIters(): number {
  const env = process.env.DSPEC_SCHEDULED_MAX_ITERS;
  if (!env) return DEFAULT_MAX_ITERS;
  const parsed = Number.parseInt(env, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_ITERS;
}

export class TaskExecutor implements TaskExecutorPort {
  private readonly client: ModelClient;
  private readonly tools: ToolRegistry;
  private readonly sessionsDir: string;
  private readonly buildSystemPrompt: () => string;
  private readonly maxIters: number;
  private readonly timeoutMs: number;

  constructor(opts: TaskExecutorOptions) {
    this.client = opts.client;
    this.tools = opts.tools;
    this.sessionsDir = join(opts.projectRoot, ".dspec", "scheduled-sessions");
    this.buildSystemPrompt = opts.buildSystemPrompt;
    this.maxIters = opts.maxIters ?? getMaxIters();
    this.timeoutMs = opts.timeoutMs ?? getTimeoutMs();
  }

  async execute(task: ScheduledTask): Promise<void> {
    await this.runWithResult(task);
  }

  async runWithResult(task: ScheduledTask): Promise<TaskExecutionResult> {
    const startedAt = new Date().toISOString();
    const startMs = Date.now();

    try {
      const prefix = new ImmutablePrefix({
        system: this.buildSystemPrompt(),
        toolSpecs: this.tools.specs(),
      });

      const loop = new CacheFirstLoop({
        client: this.client,
        prefix,
        tools: this.tools,
      });

      let aborted = false;
      const timeout = setTimeout(() => {
        aborted = true;
        loop.abort();
      }, this.timeoutMs);

      let iterCount = 0;
      let finalOutput = "";

      try {
        finalOutput = await loop.run(task.prompt, (ev) => {
          if (ev.role === "assistant_final") {
            iterCount++;
            if (iterCount >= this.maxIters) {
              loop.abort();
            }
          }
        });
      } finally {
        clearTimeout(timeout);
      }

      const finishedAt = new Date().toISOString();
      const duration = Date.now() - startMs;

      if (aborted) {
        return this.writeSession(task, {
          taskId: task.id,
          startedAt,
          finishedAt,
          status: "error",
          outputSnippet: t("scheduler.executionTimedOut"),
          duration,
        });
      }

      return this.writeSession(task, {
        taskId: task.id,
        startedAt,
        finishedAt,
        status: "success",
        outputSnippet: finalOutput,
        duration,
      });
    } catch (err) {
      const finishedAt = new Date().toISOString();
      const duration = Date.now() - startMs;
      const message = err instanceof Error ? err.message : String(err);

      return this.writeSession(task, {
        taskId: task.id,
        startedAt,
        finishedAt,
        status: "error",
        outputSnippet: message,
        duration,
      });
    }
  }

  private writeSession(task: ScheduledTask, result: TaskExecutionResult): TaskExecutionResult {
    const dir = join(this.sessionsDir, task.id);
    mkdirSync(dir, { recursive: true });

    const ts = new Date(result.startedAt).getTime();
    const filePath = join(dir, `${ts}.json`);
    writeFileSync(filePath, `${JSON.stringify(result, null, 2)}\n`);

    this.cleanupOldSessions(dir);
    return result;
  }

  private cleanupOldSessions(dir: string): void {
    try {
      const files = readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => ({ name: f, mtime: statSync(join(dir, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);

      for (let i = KEEP_SESSIONS; i < files.length; i++) {
        unlinkSync(join(dir, files[i]!.name));
      }
    } catch {
      // best-effort
    }
  }
}
