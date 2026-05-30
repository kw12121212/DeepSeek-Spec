import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type HistoryEntry, HistoryStore } from "../../src/scheduler/history.js";

const FIXTURE_DIR = join(import.meta.dirname, "../fixtures/scheduler-history");

function makeStore(): HistoryStore {
  return new HistoryStore(FIXTURE_DIR);
}

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    taskId: "task1",
    taskName: "test-task",
    startedAt: "2026-01-01T00:00:00.000Z",
    finishedAt: "2026-01-01T00:00:05.000Z",
    status: "success",
    duration: 5000,
    outputSnippet: "done",
    ...overrides,
  };
}

beforeEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(FIXTURE_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
});

describe("HistoryStore", () => {
  describe("load", () => {
    it("returns empty array when file does not exist", () => {
      expect(makeStore().load()).toEqual([]);
    });

    it("returns empty array for malformed JSON", () => {
      mkdirSync(join(FIXTURE_DIR, ".dspec"), { recursive: true });
      writeFileSync(join(FIXTURE_DIR, ".dspec", "scheduled-history.json"), "not json", "utf8");
      expect(makeStore().load()).toEqual([]);
    });

    it("returns empty array for non-array JSON", () => {
      mkdirSync(join(FIXTURE_DIR, ".dspec"), { recursive: true });
      writeFileSync(join(FIXTURE_DIR, ".dspec", "scheduled-history.json"), '{"foo":1}', "utf8");
      expect(makeStore().load()).toEqual([]);
    });
  });

  describe("append and retrieve", () => {
    it("persists entries and loads them back", () => {
      const store = makeStore();
      const entry = makeEntry();
      store.append(entry);

      const loaded = new HistoryStore(FIXTURE_DIR).load();
      expect(loaded).toHaveLength(1);
      expect(loaded[0]!.taskId).toBe("task1");
      expect(loaded[0]!.taskName).toBe("test-task");
      expect(loaded[0]!.status).toBe("success");
      expect(loaded[0]!.duration).toBe(5000);
    });

    it("preserves all fields on round-trip", () => {
      const store = makeStore();
      const entry = makeEntry({
        taskId: "abc",
        taskName: "my-task",
        startedAt: "2026-05-30T12:00:00.000Z",
        finishedAt: "2026-05-30T12:00:03.500Z",
        status: "error",
        duration: 3500,
        outputSnippet: "something failed",
      });
      store.append(entry);

      const loaded = new HistoryStore(FIXTURE_DIR).load();
      expect(loaded[0]).toEqual({
        ...entry,
        outputSnippet: "something failed",
      });
    });
  });

  describe("snippet truncation", () => {
    it("truncates outputSnippet to 200 characters", () => {
      const store = makeStore();
      const longSnippet = "x".repeat(300);
      store.append(makeEntry({ outputSnippet: longSnippet }));

      const loaded = store.load();
      expect(loaded[0]!.outputSnippet).toHaveLength(200);
    });

    it("preserves snippets at or under 200 characters", () => {
      const store = makeStore();
      const snippet = "a".repeat(200);
      store.append(makeEntry({ outputSnippet: snippet }));

      const loaded = store.load();
      expect(loaded[0]!.outputSnippet).toBe(snippet);
    });
  });

  describe("getByTaskId", () => {
    it("returns entries for the specified task only", () => {
      const store = makeStore();
      store.append(makeEntry({ taskId: "a", startedAt: "2026-01-01T01:00:00.000Z" }));
      store.append(makeEntry({ taskId: "b", startedAt: "2026-01-01T02:00:00.000Z" }));
      store.append(makeEntry({ taskId: "a", startedAt: "2026-01-01T03:00:00.000Z" }));

      const result = store.getByTaskId("a");
      expect(result).toHaveLength(2);
      expect(result.every((e) => e.taskId === "a")).toBe(true);
    });

    it("returns entries in reverse chronological order", () => {
      const store = makeStore();
      store.append(makeEntry({ taskId: "a", startedAt: "2026-01-01T01:00:00.000Z" }));
      store.append(makeEntry({ taskId: "a", startedAt: "2026-01-01T02:00:00.000Z" }));
      store.append(makeEntry({ taskId: "a", startedAt: "2026-01-01T03:00:00.000Z" }));

      const result = store.getByTaskId("a");
      expect(result[0]!.startedAt).toBe("2026-01-01T03:00:00.000Z");
      expect(result[1]!.startedAt).toBe("2026-01-01T02:00:00.000Z");
    });

    it("respects the limit parameter (default 20)", () => {
      const store = makeStore();
      for (let i = 0; i < 30; i++) {
        store.append(
          makeEntry({
            taskId: "a",
            startedAt: `2026-01-01T${String(i).padStart(2, "0")}:00:00.000Z`,
          }),
        );
      }

      const result = store.getByTaskId("a");
      expect(result).toHaveLength(20);

      const result5 = store.getByTaskId("a", 5);
      expect(result5).toHaveLength(5);
    });

    it("returns empty array for unknown task", () => {
      const store = makeStore();
      store.append(makeEntry({ taskId: "a" }));
      expect(store.getByTaskId("unknown")).toEqual([]);
    });
  });

  describe("getAll", () => {
    it("returns entries across all tasks in reverse chronological order", () => {
      const store = makeStore();
      store.append(makeEntry({ taskId: "a", startedAt: "2026-01-01T01:00:00.000Z" }));
      store.append(makeEntry({ taskId: "b", startedAt: "2026-01-01T03:00:00.000Z" }));
      store.append(makeEntry({ taskId: "a", startedAt: "2026-01-01T02:00:00.000Z" }));

      const result = store.getAll();
      expect(result).toHaveLength(3);
      expect(result[0]!.startedAt).toBe("2026-01-01T03:00:00.000Z");
      expect(result[1]!.startedAt).toBe("2026-01-01T02:00:00.000Z");
      expect(result[2]!.startedAt).toBe("2026-01-01T01:00:00.000Z");
    });

    it("respects the limit parameter (default 50)", () => {
      const store = makeStore();
      for (let i = 0; i < 60; i++) {
        store.append(
          makeEntry({
            taskId: `t${i % 3}`,
            startedAt: `2026-01-0${Math.floor(i / 24) + 1}T${String(i % 24).padStart(2, "0")}:00:00.000Z`,
          }),
        );
      }

      expect(store.getAll()).toHaveLength(50);
      expect(store.getAll(10)).toHaveLength(10);
    });
  });

  describe("pruning", () => {
    it("prunes entries beyond 500 per task at append time", () => {
      const store = makeStore();
      for (let i = 0; i < 501; i++) {
        store.append(
          makeEntry({
            taskId: "a",
            startedAt: `2026-01-${String(Math.floor(i / 24) + 1).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:00:00.000Z`,
          }),
        );
      }

      const entries = store.load().filter((e) => e.taskId === "a");
      expect(entries).toHaveLength(500);
    });

    it("keeps the most recent entries when pruning", () => {
      const store = makeStore();
      for (let i = 0; i < 502; i++) {
        store.append(
          makeEntry({
            taskId: "a",
            outputSnippet: `entry-${i}`,
            startedAt: `2026-01-${String(Math.min(Math.floor(i / 24) + 1, 28)).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:00:00.000Z`,
          }),
        );
      }

      const entries = store.load().filter((e) => e.taskId === "a");
      const firstEntry = entries.find((e) => e.outputSnippet === "entry-0");
      expect(firstEntry).toBeUndefined();
      const secondEntry = entries.find((e) => e.outputSnippet === "entry-1");
      expect(secondEntry).toBeUndefined();
      const thirdEntry = entries.find((e) => e.outputSnippet === "entry-2");
      expect(thirdEntry).toBeDefined();
      const lastEntry = entries.find((e) => e.outputSnippet === "entry-501");
      expect(lastEntry).toBeDefined();
    });

    it("prunes independently per task", () => {
      const store = makeStore();
      for (let i = 0; i < 501; i++) {
        store.append(
          makeEntry({
            taskId: "a",
            startedAt: `2026-01-${String(Math.floor(i / 24) + 1).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:00:00.000Z`,
          }),
        );
      }
      store.append(makeEntry({ taskId: "b", startedAt: "2026-05-01T00:00:00.000Z" }));

      expect(store.load().filter((e) => e.taskId === "a")).toHaveLength(500);
      expect(store.load().filter((e) => e.taskId === "b")).toHaveLength(1);
    });

    it("prune() is idempotent", () => {
      const store = makeStore();
      for (let i = 0; i < 100; i++) {
        store.append(
          makeEntry({
            taskId: "a",
            startedAt: `2026-01-${String(Math.floor(i / 24) + 1).padStart(2, "0")}T${String(i % 24).padStart(2, "0")}:00:00.000Z`,
          }),
        );
      }

      store.prune();
      store.prune();
      expect(store.load()).toHaveLength(100);
    });
  });
});
