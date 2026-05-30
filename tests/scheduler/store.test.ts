import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TaskStore } from "../../src/scheduler/store.js";

const FIXTURE_DIR = join(import.meta.dirname, "../fixtures/scheduler-store");

function makeStore(): TaskStore {
  return new TaskStore(FIXTURE_DIR);
}

beforeEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(FIXTURE_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
});

describe("TaskStore", () => {
  describe("load", () => {
    it("returns empty array when file does not exist", () => {
      expect(makeStore().load()).toEqual([]);
    });

    it("returns empty array for malformed JSON", () => {
      mkdirSync(join(FIXTURE_DIR, ".dspec"), { recursive: true });
      writeFileSync(join(FIXTURE_DIR, ".dspec", "scheduled.json"), "not json", "utf8");
      expect(makeStore().load()).toEqual([]);
    });

    it("returns empty array for non-array JSON", () => {
      mkdirSync(join(FIXTURE_DIR, ".dspec"), { recursive: true });
      writeFileSync(join(FIXTURE_DIR, ".dspec", "scheduled.json"), '{"foo":1}', "utf8");
      expect(makeStore().load()).toEqual([]);
    });
  });

  describe("add and load round-trip", () => {
    it("persists a task and loads it back", () => {
      const store = makeStore();
      const task = store.add({ name: "test", cron: "* * * * *", prompt: "hello" });
      expect(task.id).toHaveLength(8);
      expect(task.name).toBe("test");
      expect(task.cron).toBe("* * * * *");
      expect(task.prompt).toBe("hello");
      expect(task.enabled).toBe(true);
      expect(task.createdAt).toBeTruthy();
      expect(task.updatedAt).toBeTruthy();

      const loaded = store.load();
      expect(loaded).toHaveLength(1);
      expect(loaded[0]!.id).toBe(task.id);
    });

    it("defaults enabled to true", () => {
      const store = makeStore();
      const task = store.add({ name: "t", cron: "* * * * *", prompt: "p" });
      expect(task.enabled).toBe(true);
    });

    it("respects explicit enabled=false", () => {
      const store = makeStore();
      const task = store.add({ name: "t", cron: "* * * * *", prompt: "p", enabled: false });
      expect(task.enabled).toBe(false);
    });
  });

  describe("update", () => {
    it("merges partial fields and updates updatedAt", () => {
      const store = makeStore();
      const task = store.add({ name: "orig", cron: "* * * * *", prompt: "p" });
      const originalCreatedAt = task.createdAt;

      const updated = store.update(task.id, { name: "changed", enabled: false });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe("changed");
      expect(updated!.enabled).toBe(false);
      expect(updated!.createdAt).toBe(originalCreatedAt);
      expect(updated!.updatedAt).not.toBe(task.updatedAt);
    });

    it("returns null for nonexistent id", () => {
      expect(makeStore().update("nope", { name: "x" })).toBeNull();
    });
  });

  describe("remove", () => {
    it("removes an existing task and returns true", () => {
      const store = makeStore();
      const task = store.add({ name: "t", cron: "* * * * *", prompt: "p" });
      expect(store.remove(task.id)).toBe(true);
      expect(store.load()).toHaveLength(0);
    });

    it("returns false for nonexistent id", () => {
      expect(makeStore().remove("nope")).toBe(false);
    });
  });

  describe("getById", () => {
    it("finds task by id", () => {
      const store = makeStore();
      const task = store.add({ name: "t", cron: "* * * * *", prompt: "p" });
      expect(store.getById(task.id)?.name).toBe("t");
    });

    it("returns null for nonexistent id", () => {
      expect(makeStore().getById("nope")).toBeNull();
    });
  });

  describe("getByName", () => {
    it("finds task by name", () => {
      const store = makeStore();
      store.add({ name: "unique", cron: "* * * * *", prompt: "p" });
      expect(store.getByName("unique")?.id).toBeTruthy();
    });

    it("returns null for nonexistent name", () => {
      expect(makeStore().getByName("nope")).toBeNull();
    });
  });

  describe("getEnabled", () => {
    it("returns only enabled tasks", () => {
      const store = makeStore();
      store.add({ name: "on", cron: "* * * * *", prompt: "p", enabled: true });
      store.add({ name: "off", cron: "* * * * *", prompt: "p", enabled: false });
      const enabled = store.getEnabled();
      expect(enabled).toHaveLength(1);
      expect(enabled[0]!.name).toBe("on");
    });
  });

  describe("atomic write", () => {
    it("returns empty array when tmp exists but main file is missing", () => {
      const dsDir = join(FIXTURE_DIR, ".dspec");
      mkdirSync(dsDir, { recursive: true });
      writeFileSync(join(dsDir, "scheduled.json.tmp"), "[]", "utf8");
      expect(makeStore().load()).toEqual([]);
    });
  });
});
