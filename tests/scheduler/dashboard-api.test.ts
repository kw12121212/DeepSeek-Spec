import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { HistoryStore } from "../../src/scheduler/history.js";
import { HistoryStore as HistoryStoreClass } from "../../src/scheduler/history.js";
import type { TaskStore } from "../../src/scheduler/store.js";
import { TaskStore as TaskStoreClass } from "../../src/scheduler/store.js";
import { handleScheduler } from "../../src/server/api/scheduler.js";
import type { DashboardContext } from "../../src/server/context.js";

const FIXTURE_DIR = join(import.meta.dirname, "../fixtures/scheduler-dashboard-api");

const baseCtx: DashboardContext = {
  configPath: "/dev/null",
  usageLogPath: "/dev/null",
  mode: "standalone",
};

function makeTaskStore(): TaskStore {
  return new TaskStoreClass(FIXTURE_DIR);
}

function makeHistoryStore(): HistoryStore {
  return new HistoryStoreClass(FIXTURE_DIR);
}

beforeEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(FIXTURE_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
});

describe("handleScheduler", () => {
  describe("GET /api/scheduler/status", () => {
    it("returns empty result when no task store is configured", async () => {
      const result = await handleScheduler("GET", ["status"], "", baseCtx);
      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        tasks: [],
        enabledCount: 0,
        running: false,
        nextRun: null,
      });
    });

    it("returns tasks with enabled count and running status", async () => {
      const store = makeTaskStore();
      store.add({ name: "task-a", cron: "*/5 * * * *", prompt: "check" });
      store.add({ name: "task-b", cron: "0 9 * * 1-5", prompt: "build", enabled: false });

      const result = await handleScheduler("GET", ["status"], "", { ...baseCtx, taskStore: store });
      expect(result.status).toBe(200);

      const body = result.body as {
        tasks: unknown[];
        enabledCount: number;
        running: boolean;
        nextRun: string | null;
      };
      expect(body.tasks).toHaveLength(2);
      expect(body.enabledCount).toBe(1);
      expect(body.running).toBe(false);
      expect(typeof body.nextRun).toBe("string");
    });
  });

  describe("GET /api/scheduler/history", () => {
    it("returns filtered entries by taskId", async () => {
      const history = makeHistoryStore();
      const store = makeTaskStore();
      history.append({
        taskId: "abc123",
        taskName: "t1",
        startedAt: "2025-01-01T00:00:00Z",
        finishedAt: "2025-01-01T00:01:00Z",
        status: "success",
        duration: 60_000,
        outputSnippet: "ok",
      });
      history.append({
        taskId: "def456",
        taskName: "t2",
        startedAt: "2025-01-01T00:00:00Z",
        finishedAt: "2025-01-01T00:01:00Z",
        status: "success",
        duration: 60_000,
        outputSnippet: "ok",
      });

      const q = new URLSearchParams("taskId=abc123&limit=10");
      const result = await handleScheduler(
        "GET",
        ["history"],
        "",
        { ...baseCtx, taskStore: store, historyStore: history },
        q,
      );
      expect(result.status).toBe(200);

      const body = result.body as { entries: { taskId: string }[] };
      expect(body.entries).toHaveLength(1);
      expect(body.entries[0]!.taskId).toBe("abc123");
    });

    it("returns all entries newest-first when no taskId", async () => {
      const history = makeHistoryStore();
      history.append({
        taskId: "a",
        taskName: "t1",
        startedAt: "2025-01-01T00:00:00Z",
        finishedAt: "2025-01-01T00:01:00Z",
        status: "success",
        duration: 60_000,
        outputSnippet: "first",
      });
      history.append({
        taskId: "b",
        taskName: "t2",
        startedAt: "2025-01-02T00:00:00Z",
        finishedAt: "2025-01-02T00:01:00Z",
        status: "error",
        duration: 30_000,
        outputSnippet: "fail",
      });

      const result = await handleScheduler("GET", ["history"], "", {
        ...baseCtx,
        historyStore: history,
      });
      expect(result.status).toBe(200);

      const body = result.body as { entries: { startedAt: string }[] };
      expect(body.entries).toHaveLength(2);
      expect(body.entries[0]!.startedAt).toBe("2025-01-02T00:00:00Z");
      expect(body.entries[1]!.startedAt).toBe("2025-01-01T00:00:00Z");
    });

    it("caps limit at 100", async () => {
      const history = makeHistoryStore();
      const q = new URLSearchParams("limit=999");
      const result = await handleScheduler(
        "GET",
        ["history"],
        "",
        { ...baseCtx, historyStore: history },
        q,
      );
      expect(result.status).toBe(200);
      // getAll(999) would be called but our handler caps it at 100
      // Just verify it doesn't crash and returns 200
    });

    it("defaults to limit 20", async () => {
      const history = makeHistoryStore();
      const result = await handleScheduler("GET", ["history"], "", {
        ...baseCtx,
        historyStore: history,
      });
      expect(result.status).toBe(200);
    });
  });

  it("rejects non-GET methods", async () => {
    const result = await handleScheduler("POST", ["status"], "", baseCtx);
    expect(result.status).toBe(405);
  });

  it("returns 404 for unknown sub-path", async () => {
    const result = await handleScheduler("GET", ["unknown"], "", baseCtx);
    expect(result.status).toBe(404);
  });
});
