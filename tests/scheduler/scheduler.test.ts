import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TaskExecutorPort } from "../../src/scheduler/scheduler.js";
import { Scheduler } from "../../src/scheduler/scheduler.js";
import type { ScheduledTask, TaskStore } from "../../src/scheduler/store.js";

function makeTask(overrides?: Partial<ScheduledTask>): ScheduledTask {
  return {
    id: "test-01",
    name: "test-task",
    cron: "* * * * *",
    prompt: "hello",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeStore(tasks: ScheduledTask[]): TaskStore {
  return {
    load: () => tasks,
    save: () => {},
    add: () => makeTask(),
    update: () => null,
    remove: () => false,
    getById: () => null,
    getByName: () => null,
    getEnabled: () => tasks.filter((t) => t.enabled),
  } as unknown as TaskStore;
}

describe("Scheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    process.env.DSPEC_SCHEDULED_TICK_MS = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("tick fires a due task exactly once", async () => {
    const task = makeTask();
    const store = makeStore([task]);
    const executed: string[] = [];
    const executor: TaskExecutorPort = {
      async execute(t) {
        executed.push(t.id);
      },
    };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    await scheduler.tick();
    expect(executed).toEqual(["test-01"]);
  });

  it("tick does not fire a disabled task", async () => {
    const task = makeTask({ enabled: false });
    const store = makeStore([task]);
    const executed: string[] = [];
    const executor: TaskExecutorPort = {
      async execute(t) {
        executed.push(t.id);
      },
    };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    await scheduler.tick();
    expect(executed).toEqual([]);
  });

  it("tick does not fire the same task twice in the same minute", async () => {
    const task = makeTask();
    const store = makeStore([task]);
    const executed: string[] = [];
    const executor: TaskExecutorPort = {
      async execute(t) {
        executed.push(t.id);
      },
    };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    await scheduler.tick();
    await scheduler.tick();
    expect(executed).toEqual(["test-01"]);
  });

  it("stop clears the timer and resolves after in-flight completes", async () => {
    const task = makeTask();
    const store = makeStore([task]);
    let resolveExec: () => void = () => {};
    const executor: TaskExecutorPort = {
      async execute() {
        await new Promise<void>((r) => {
          resolveExec = r;
        });
      },
    };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    scheduler.start();

    const tickDone = scheduler.tick();
    const stopDone = scheduler.stop();
    resolveExec();
    await tickDone;
    await stopDone;

    expect(scheduler.getStatus().running).toBe(false);
  });

  it("start is a no-op when no enabled tasks exist", () => {
    const store = makeStore([]);
    const executor: TaskExecutorPort = { async execute() {} };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    scheduler.start();
    expect(scheduler.getStatus().running).toBe(false);
  });

  it("starts the tick loop when enabled tasks exist", () => {
    const task = makeTask();
    const store = makeStore([task]);
    const executor: TaskExecutorPort = { async execute() {} };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    scheduler.start();
    expect(scheduler.getStatus().running).toBe(true);
    scheduler.stop();
  });

  it("fires tasks non-blocking", async () => {
    const t1 = makeTask({ id: "a", cron: "* * * * *" });
    const t2 = makeTask({ id: "b", cron: "* * * * *" });
    const store = makeStore([t1, t2]);
    const order: string[] = [];
    const executor: TaskExecutorPort = {
      async execute(t) {
        order.push(`start-${t.id}`);
        await new Promise((r) => setTimeout(r, 10));
        order.push(`end-${t.id}`);
      },
    };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    await scheduler.tick();
    expect(order).toEqual(["start-a", "start-b"]);
  });

  it("getStatus reports activeCount for in-flight executions", async () => {
    const task = makeTask();
    const store = makeStore([task]);
    let resolveExec: () => void = () => {};
    const executor: TaskExecutorPort = {
      async execute() {
        await new Promise<void>((r) => {
          resolveExec = r;
        });
      },
    };
    const scheduler = new Scheduler(store, executor, { tickMs: 1000 });
    scheduler.start();
    void scheduler.tick();
    expect(scheduler.getStatus().activeCount).toBe(1);
    resolveExec();
    await vi.advanceTimersByTimeAsync(0);
    expect(scheduler.getStatus().activeCount).toBe(0);
    await scheduler.stop();
  });

  it("reads DSPEC_SCHEDULED_TICK_MS with minimum clamp", () => {
    process.env.DSPEC_SCHEDULED_TICK_MS = "5000";
    const task = makeTask();
    const store = makeStore([task]);
    const executor: TaskExecutorPort = { async execute() {} };
    const scheduler = new Scheduler(store, executor);
    scheduler.start();
    expect(scheduler.getStatus().running).toBe(true);
    scheduler.stop();
  });
});
