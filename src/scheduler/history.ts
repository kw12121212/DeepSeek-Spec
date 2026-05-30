import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { atomicWriteSync } from "../core/atomic-write.js";

export interface HistoryEntry {
  taskId: string;
  taskName: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "error";
  duration: number;
  outputSnippet: string;
}

const MAX_SNIPPET = 200;
const MAX_PER_TASK = 500;

export class HistoryStore {
  private readonly filePath: string;
  private readonly tmpPath: string;

  constructor(projectRoot: string) {
    const dsDir = join(projectRoot, ".dspec");
    this.filePath = join(dsDir, "scheduled-history.json");
    this.tmpPath = join(dsDir, "scheduled-history.json.tmp");
  }

  load(): HistoryEntry[] {
    if (!existsSync(this.filePath)) return [];
    try {
      const raw = readFileSync(this.filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as HistoryEntry[];
    } catch {
      return [];
    }
  }

  append(entry: HistoryEntry): void {
    const entries = this.load();
    const truncated: HistoryEntry = {
      ...entry,
      outputSnippet: entry.outputSnippet.slice(0, MAX_SNIPPET),
    };
    entries.push(truncated);
    this.pruneInMemory(entries);
    this.save(entries);
  }

  getByTaskId(taskId: string, limit = 20): HistoryEntry[] {
    return this.load()
      .filter((e) => e.taskId === taskId)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
  }

  getAll(limit = 50): HistoryEntry[] {
    return this.load()
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
  }

  prune(): void {
    const entries = this.load();
    this.pruneInMemory(entries);
    this.save(entries);
  }

  private pruneInMemory(entries: HistoryEntry[]): void {
    const counts = new Map<string, number>();
    for (let i = entries.length - 1; i >= 0; i--) {
      const id = entries[i]!.taskId;
      const count = (counts.get(id) ?? 0) + 1;
      counts.set(id, count);
      if (count > MAX_PER_TASK) {
        entries.splice(i, 1);
      }
    }
  }

  private save(entries: HistoryEntry[]): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    atomicWriteSync(this.filePath, `${JSON.stringify(entries, null, 2)}\n`, this.tmpPath);
  }
}
