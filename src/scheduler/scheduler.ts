import { matchesCron } from "./cron-parser.js";
import type { ScheduledTask } from "./store.js";
import type { TaskStore } from "./store.js";

export interface TaskExecutorPort {
  execute(task: ScheduledTask): Promise<void>;
}

const DEFAULT_TICK_MS = 30_000;
const MIN_TICK_MS = 10_000;
const STOP_TIMEOUT_MS = 30_000;

function getTickMs(): number {
  const env = process.env.DSPEC_SCHEDULED_TICK_MS;
  if (!env) return DEFAULT_TICK_MS;
  const parsed = Number.parseInt(env, 10);
  if (!Number.isFinite(parsed) || parsed < MIN_TICK_MS) return MIN_TICK_MS;
  return parsed;
}

function minuteKey(ts: number): number {
  return Math.floor(ts / 60_000);
}

export class Scheduler {
  private readonly store: TaskStore;
  private readonly executor: TaskExecutorPort;
  private readonly tickMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly lastFired = new Map<string, number>();
  private readonly inFlight = new Set<Promise<void>>();
  private nextTickAt: Date | null = null;

  constructor(store: TaskStore, executor: TaskExecutorPort, options?: { tickMs?: number }) {
    this.store = store;
    this.executor = executor;
    this.tickMs = options?.tickMs ?? getTickMs();
  }

  start(): void {
    if (this.timer !== null) return;
    if (this.store.getEnabled().length === 0) return;
    this.timer = setInterval(() => {
      void this.tick();
    }, this.tickMs);
    this.nextTickAt = new Date(Date.now() + this.tickMs);
  }

  async stop(): Promise<void> {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
      this.nextTickAt = null;
    }
    if (this.inFlight.size === 0) return;
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, STOP_TIMEOUT_MS));
    await Promise.race([Promise.all(this.inFlight), timeout]);
  }

  async tick(): Promise<void> {
    const now = new Date();
    const enabled = this.store.getEnabled();
    const nowMs = now.getTime();
    const currentMinute = minuteKey(nowMs);

    for (const task of enabled) {
      if (!matchesCron(task.cron, now)) continue;
      const lastMs = this.lastFired.get(task.id);
      if (lastMs !== undefined && minuteKey(lastMs) === currentMinute) continue;
      this.lastFired.set(task.id, nowMs);
      const p = this.executor.execute(task).then(
        () => {
          this.inFlight.delete(p);
        },
        () => {
          this.inFlight.delete(p);
        },
      );
      this.inFlight.add(p);
    }
    this.nextTickAt = new Date(Date.now() + this.tickMs);
  }

  getStatus(): {
    running: boolean;
    nextTick: Date | null;
    activeCount: number;
  } {
    return {
      running: this.timer !== null,
      nextTick: this.nextTickAt,
      activeCount: this.inFlight.size,
    };
  }
}
