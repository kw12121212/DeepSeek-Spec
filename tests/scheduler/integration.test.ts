import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CacheFirstLoop } from "../../src/loop.js";
import { ImmutablePrefix } from "../../src/memory/runtime.js";
import type { ModelClient } from "../../src/ports/model-client.js";
import { ToolRegistry } from "../../src/tools.js";

function makePrefix(): ImmutablePrefix {
  return new ImmutablePrefix({ system: "test system", toolSpecs: [] });
}

function makeClient(): ModelClient {
  return {
    chat: vi.fn().mockResolvedValue({
      content: "ok",
      reasoningContent: "",
      toolCalls: [],
      usage: { promptTokens: 10, completionTokens: 5 },
    }),
    stream: vi.fn(),
    capabilities: { supportsThinking: false, supportsReasoningContent: false },
  } as unknown as ModelClient;
}

function makeTools(): ToolRegistry {
  return new ToolRegistry();
}

describe("scheduler loop wiring", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "dspec-sched-int-"));
  });

  afterEach(() => {
    if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
  });

  it("does not start scheduler when no schedulerRoot provided", async () => {
    const loop = new CacheFirstLoop({
      client: makeClient(),
      prefix: makePrefix(),
      tools: makeTools(),
    });

    await expect(loop.shutdown()).resolves.toBeUndefined();
  });

  it("does not start scheduler when schedulerRoot has no enabled tasks", async () => {
    const loop = new CacheFirstLoop({
      client: makeClient(),
      prefix: makePrefix(),
      tools: makeTools(),
      schedulerRoot: tmpDir,
    });

    await expect(loop.shutdown()).resolves.toBeUndefined();
  });

  it("starts scheduler when enabled tasks exist in store", async () => {
    const dsDir = join(tmpDir, ".dspec");
    mkdirSync(dsDir, { recursive: true });
    writeFileSync(
      join(dsDir, "scheduled.json"),
      JSON.stringify([
        {
          id: "abc12345",
          name: "test",
          cron: "*/5 * * * *",
          prompt: "check",
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );

    const loop = new CacheFirstLoop({
      client: makeClient(),
      prefix: makePrefix(),
      tools: makeTools(),
      schedulerRoot: tmpDir,
    });

    await loop.shutdown();
  });

  it("shutdown resolves when no scheduler is present", async () => {
    const loop = new CacheFirstLoop({
      client: makeClient(),
      prefix: makePrefix(),
      tools: makeTools(),
    });

    await expect(loop.shutdown()).resolves.toBeUndefined();
  });

  it("session isolation: scheduled-sessions dir is separate from user sessions", async () => {
    const dsDir = join(tmpDir, ".dspec");
    const schedDir = join(dsDir, "scheduled-sessions");
    const taskDir = join(schedDir, "task-1");
    const { mkdirSync } = await import("node:fs");
    mkdirSync(taskDir, { recursive: true });
    writeFileSync(join(taskDir, "1000.json"), "{}");

    const { listSessions } = await import("../../src/memory/session.js");
    const sessions = listSessions({ workspaceFilter: tmpDir });

    expect(sessions.length).toBe(0);
  });
});
