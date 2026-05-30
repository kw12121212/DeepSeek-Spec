import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handlers } from "../../src/cli/ui/slash/handlers/schedule.js";
import { TaskStore } from "../../src/scheduler/store.js";

const FIXTURE_DIR = join(import.meta.dirname, "../fixtures/schedule-command");

const schedule = handlers.schedule!;

function runSchedule(args: string[]) {
  return schedule(args, {} as never, {} as never);
}

beforeEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(FIXTURE_DIR, { recursive: true });
  vi.spyOn(process, "cwd").mockReturnValue(FIXTURE_DIR);
});

afterEach(() => {
  vi.restoreAllMocks();
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
});

describe("/schedule command", () => {
  describe("add", () => {
    it("creates a task and confirms with name and cron description", () => {
      const result = runSchedule([
        "add",
        "daily-build",
        "--cron",
        "0 9 * * 1-5",
        "check build status",
      ]);
      expect(result.info).toContain("daily-build");
      expect(result.info).toContain("weekdays at 09:00");

      const store = new TaskStore(FIXTURE_DIR);
      const tasks = store.load();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]!.name).toBe("daily-build");
      expect(tasks[0]!.cron).toBe("0 9 * * 1-5");
      expect(tasks[0]!.prompt).toBe("check build status");
      expect(tasks[0]!.enabled).toBe(true);
    });

    it("rejects invalid cron expression", () => {
      const result = runSchedule(["add", "bad", "--cron", "invalid", "prompt"]);
      expect(result.info).toContain("Invalid cron expression");
      expect(result.info).toContain("5 fields");
    });

    it("shows usage when args are missing", () => {
      const result = runSchedule(["add"]);
      expect(result.info).toContain("Usage:");
    });
  });

  describe("list", () => {
    it("shows empty message when no tasks", () => {
      const result = runSchedule(["list"]);
      expect(result.info).toContain("No scheduled tasks");
    });

    it("shows tasks in table format", () => {
      const store = new TaskStore(FIXTURE_DIR);
      store.add({
        name: "task-a",
        cron: "*/5 * * * *",
        prompt: "do thing",
      });
      store.add({
        name: "task-b",
        cron: "0 9 * * *",
        prompt: "other thing",
      });

      const result = runSchedule(["list"]);
      expect(result.info).toContain("task-a");
      expect(result.info).toContain("task-b");
      expect(result.info).toContain("*/5 * * * *");
      expect(result.info).toContain("0 9 * * *");
    });
  });

  describe("remove", () => {
    it("removes a task by id", () => {
      const store = new TaskStore(FIXTURE_DIR);
      const task = store.add({
        name: "to-remove",
        cron: "0 9 * * *",
        prompt: "x",
      });

      const result = runSchedule(["remove", task.id]);
      expect(result.info).toContain("to-remove");
      expect(result.info).toContain("removed");

      expect(store.load()).toHaveLength(0);
    });

    it("removes a task by name", () => {
      const store = new TaskStore(FIXTURE_DIR);
      store.add({ name: "named-task", cron: "0 9 * * *", prompt: "x" });

      const result = runSchedule(["remove", "named-task"]);
      expect(result.info).toContain("named-task");
      expect(store.load()).toHaveLength(0);
    });

    it("shows error for unknown task", () => {
      const result = runSchedule(["remove", "nonexistent"]);
      expect(result.info).toContain("No task found");
    });

    it("shows usage when no arg", () => {
      const result = runSchedule(["remove"]);
      expect(result.info).toContain("Usage:");
    });
  });

  describe("enable/disable", () => {
    it("enables a disabled task", () => {
      const store = new TaskStore(FIXTURE_DIR);
      const task = store.add({
        name: "disabled-task",
        cron: "0 9 * * *",
        prompt: "x",
        enabled: false,
      });

      const result = runSchedule(["enable", task.id]);
      expect(result.info).toContain("disabled-task");
      expect(result.info).toContain("enabled");

      const updated = store.getById(task.id);
      expect(updated!.enabled).toBe(true);
    });

    it("disables an enabled task", () => {
      const store = new TaskStore(FIXTURE_DIR);
      const task = store.add({
        name: "enabled-task",
        cron: "0 9 * * *",
        prompt: "x",
      });

      const result = runSchedule(["disable", task.id]);
      expect(result.info).toContain("enabled-task");
      expect(result.info).toContain("disabled");

      const updated = store.getById(task.id);
      expect(updated!.enabled).toBe(false);
    });

    it("shows error for unknown task", () => {
      const result = runSchedule(["enable", "nope"]);
      expect(result.info).toContain("No task found");
    });

    it("shows usage when no arg", () => {
      const result = runSchedule(["enable"]);
      expect(result.info).toContain("Usage:");
    });
  });

  describe("no subcommand", () => {
    it("shows help text", () => {
      const result = runSchedule([]);
      expect(result.info).toContain("add");
      expect(result.info).toContain("list");
      expect(result.info).toContain("remove");
      expect(result.info).toContain("enable");
      expect(result.info).toContain("disable");
      expect(result.info).toContain("history");
    });
  });
});
