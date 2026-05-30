import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { atomicWriteSync } from "../core/atomic-write.js";

export interface ScheduledTask {
  id: string;
  name: string;
  cron: string;
  prompt: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export class TaskStore {
  private readonly filePath: string;
  private readonly tmpPath: string;

  constructor(projectRoot: string) {
    const dsDir = join(projectRoot, ".dspec");
    this.filePath = join(dsDir, "scheduled.json");
    this.tmpPath = join(dsDir, "scheduled.json.tmp");
  }

  load(): ScheduledTask[] {
    if (!existsSync(this.filePath)) return [];
    try {
      const raw = readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as ScheduledTask[];
    } catch {
      return [];
    }
  }

  save(tasks: ScheduledTask[]): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    atomicWriteSync(this.filePath, `${JSON.stringify(tasks, null, 2)}\n`, this.tmpPath);
  }

  add(task: { name: string; cron: string; prompt: string; enabled?: boolean }): ScheduledTask {
    const existing = this.load();
    const now = new Date().toISOString();
    const newTask: ScheduledTask = {
      id: randomUUID().slice(0, 8),
      name: task.name,
      cron: task.cron,
      prompt: task.prompt,
      enabled: task.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    };
    existing.push(newTask);
    this.save(existing);
    return newTask;
  }

  update(
    id: string,
    patch: Partial<Omit<ScheduledTask, "id" | "createdAt">>,
  ): ScheduledTask | null {
    const tasks = this.load();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    const updated = {
      ...tasks[idx]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    tasks[idx] = updated;
    this.save(tasks);
    return updated;
  }

  remove(id: string): boolean {
    const tasks = this.load();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) return false;
    this.save(filtered);
    return true;
  }

  getById(id: string): ScheduledTask | null {
    return this.load().find((t) => t.id === id) ?? null;
  }

  getByName(name: string): ScheduledTask | null {
    return this.load().find((t) => t.name === name) ?? null;
  }

  getEnabled(): ScheduledTask[] {
    return this.load().filter((t) => t.enabled);
  }
}
