import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TaskExecutor } from "../../src/scheduler/executor.js";
import type { ScheduledTask } from "../../src/scheduler/store.js";

let mockRunBehavior: "success" | "error" | "hang" = "success";
let mockAbortResolver: (() => void) | null = null;

vi.mock("../../src/loop.js", () => ({
  CacheFirstLoop: class {
    abort() {
      mockAbortResolver?.();
    }
    async run(_input: string, onEvent?: (ev: { role: string; content: string }) => void) {
      if (mockRunBehavior === "error") throw new Error("API down");
      if (mockRunBehavior === "hang") {
        onEvent?.({ role: "assistant_final", content: "" });
        await new Promise<void>((resolve) => {
          mockAbortResolver = resolve;
        });
        return "";
      }
      onEvent?.({ role: "assistant_final", content: "mock output" });
      return "mock output";
    }
  },
}));

vi.mock("../../src/memory/runtime.js", () => ({
  ImmutablePrefix: class {
    system = "";
    constructor(opts: { system: string }) {
      this.system = opts.system;
    }
  },
}));

const TMP_DIR = join(import.meta.dirname, "__executor_tmp__");

function makeTask(overrides?: Partial<ScheduledTask>): ScheduledTask {
  return {
    id: "test-01",
    name: "test-task",
    cron: "* * * * *",
    prompt: "do something",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeClient() {
  return {
    chat: vi.fn(),
    stream: vi.fn(),
    capabilities: { supportsThinking: false, supportsReasoningContent: false },
  };
}

function makeTools() {
  return { specs: () => [], get: () => undefined, isParallelSafe: () => false };
}

function makeExecutor(opts?: { timeoutMs?: number; maxIters?: number }) {
  return new TaskExecutor({
    client: makeClient() as never,
    tools: makeTools() as never,
    projectRoot: TMP_DIR,
    buildSystemPrompt: () => "system prompt",
    ...opts,
  });
}

describe("TaskExecutor", () => {
  beforeEach(() => {
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true });
    mkdirSync(TMP_DIR, { recursive: true });
    mockRunBehavior = "success";
    mockAbortResolver = null;
  });

  afterEach(() => {
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true });
  });

  it("returns success with non-empty snippet on successful execution", async () => {
    const executor = makeExecutor();
    const result = await executor.runWithResult(makeTask());

    expect(result.status).toBe("success");
    expect(result.outputSnippet).toBe("mock output");
    expect(result.taskId).toBe("test-01");
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(result.startedAt).toBeTruthy();
    expect(result.finishedAt).toBeTruthy();
  });

  it("returns error with error message when loop throws", async () => {
    mockRunBehavior = "error";
    const executor = makeExecutor();
    const result = await executor.runWithResult(makeTask());

    expect(result.status).toBe("error");
    expect(result.outputSnippet).toBe("API down");
  });

  it("writes session files to .dspec/scheduled-sessions/ not user sessions dir", async () => {
    const executor = makeExecutor();
    await executor.runWithResult(makeTask());

    const sessionDir = join(TMP_DIR, ".dspec", "scheduled-sessions", "test-01");
    expect(existsSync(sessionDir)).toBe(true);

    const userSessionDir = join(TMP_DIR, ".dspec", "sessions");
    expect(existsSync(userSessionDir)).toBe(false);
  });

  it("aborts execution on timeout and returns error", async () => {
    mockRunBehavior = "hang";

    const executor = makeExecutor({ timeoutMs: 50 });

    const result = await executor.runWithResult(makeTask());

    expect(result.status).toBe("error");
    expect(result.outputSnippet).toContain("timed out");
  });

  it("cleans up old session files keeping last 5", async () => {
    const executor = makeExecutor();
    const task = makeTask({ id: "cleanup-test" });

    for (let i = 0; i < 7; i++) {
      await executor.runWithResult(task);
      await new Promise((r) => setTimeout(r, 2));
    }

    const dir = join(TMP_DIR, ".dspec", "scheduled-sessions", "cleanup-test");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(files.length).toBe(5);
  });
});
