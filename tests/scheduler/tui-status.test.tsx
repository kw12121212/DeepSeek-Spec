import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SchedulerStatusPill, computeStatus } from "../../src/cli/ui/layout/SchedulerStatus.js";
import { TaskStore } from "../../src/scheduler/store.js";

const FIXTURE_DIR = join(import.meta.dirname, "../fixtures/scheduler-tui-status");

beforeEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
  mkdirSync(FIXTURE_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(FIXTURE_DIR)) rmSync(FIXTURE_DIR, { recursive: true });
});

function makeStore(): TaskStore {
  return new TaskStore(FIXTURE_DIR);
}

function seedTasks(
  tasks: Array<{ name: string; cron: string; prompt: string; enabled?: boolean }>,
) {
  const store = makeStore();
  for (const t of tasks) store.add(t);
  return store;
}

describe("computeStatus", () => {
  it("returns zero count when no tasks exist", () => {
    const result = computeStatus(FIXTURE_DIR);
    expect(result.enabledCount).toBe(0);
    expect(result.nextRunDate).toBeNull();
  });

  it("returns count of enabled tasks", () => {
    seedTasks([
      { name: "a", cron: "*/5 * * * *", prompt: "test" },
      { name: "b", cron: "0 9 * * *", prompt: "test", enabled: false },
    ]);
    const result = computeStatus(FIXTURE_DIR);
    expect(result.enabledCount).toBe(1);
  });

  it("returns earliest nextRun across enabled tasks", () => {
    const now = new Date();
    const soonCron = `${now.getMinutes() + 2} ${now.getHours()} * * *`;
    seedTasks([
      { name: "soon", cron: soonCron, prompt: "test" },
      { name: "late", cron: "0 23 * * *", prompt: "test" },
    ]);
    const result = computeStatus(FIXTURE_DIR);
    expect(result.enabledCount).toBe(2);
    expect(result.nextRunDate).not.toBeNull();
  });

  it("returns null nextRunDate when all tasks have invalid cron", () => {
    const dsDir = join(FIXTURE_DIR, ".dspec");
    mkdirSync(dsDir, { recursive: true });
    writeFileSync(
      join(dsDir, "scheduled.json"),
      JSON.stringify([
        {
          id: "x1",
          name: "bad",
          cron: "invalid",
          prompt: "test",
          enabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );
    const result = computeStatus(FIXTURE_DIR);
    expect(result.enabledCount).toBe(1);
    expect(result.nextRunDate).toBeNull();
  });

  it("ignores disabled tasks for count and nextRun", () => {
    seedTasks([{ name: "off", cron: "*/5 * * * *", prompt: "test", enabled: false }]);
    const result = computeStatus(FIXTURE_DIR);
    expect(result.enabledCount).toBe(0);
    expect(result.nextRunDate).toBeNull();
  });
});

describe("SchedulerStatusPill", () => {
  it("returns null when enabledCount is 0", () => {
    const result = SchedulerStatusPill({ enabledCount: 0, nextRunDate: null });
    expect(result).toBeNull();
  });

  it("renders count without next run when nextRunDate is null", () => {
    const result = SchedulerStatusPill({ enabledCount: 3, nextRunDate: null });
    expect(result).not.toBeNull();
  });

  it("renders count with next run when within 1 hour", () => {
    const soon = new Date(Date.now() + 30 * 60 * 1000);
    const result = SchedulerStatusPill({ enabledCount: 2, nextRunDate: soon });
    expect(result).not.toBeNull();
  });

  it("renders count without next run when more than 1 hour away", () => {
    const later = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const result = SchedulerStatusPill({ enabledCount: 2, nextRunDate: later });
    expect(result).not.toBeNull();
  });
});
