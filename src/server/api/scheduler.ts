import { nextRun } from "../../scheduler/cron-parser.js";
import type { DashboardContext } from "../context.js";
import type { ApiResult } from "../router.js";

const MAX_HISTORY_LIMIT = 100;
const DEFAULT_HISTORY_LIMIT = 20;

export async function handleScheduler(
  method: string,
  rest: string[],
  _body: string,
  ctx: DashboardContext,
  query: URLSearchParams = new URLSearchParams(),
): Promise<ApiResult> {
  if (method !== "GET") {
    return { status: 405, body: { error: "GET only" } };
  }

  const sub = rest[0];

  if (sub === "status") return schedulerStatus(ctx);
  if (sub === "history") return schedulerHistory(ctx, query);

  return { status: 404, body: { error: `no such scheduler endpoint: /${sub}` } };
}

function schedulerStatus(ctx: DashboardContext): ApiResult {
  if (!ctx.taskStore) {
    return { status: 200, body: { tasks: [], enabledCount: 0, running: false, nextRun: null } };
  }

  const tasks = ctx.taskStore.load();
  const enabled = tasks.filter((t) => t.enabled);
  const running = ctx.scheduler?.getStatus().running ?? false;

  let earliest: Date | null = null;
  for (const t of enabled) {
    try {
      const nr = nextRun(t.cron, new Date());
      if (!earliest || nr < earliest) earliest = nr;
    } catch {
      // invalid cron — skip
    }
  }

  return {
    status: 200,
    body: {
      tasks,
      enabledCount: enabled.length,
      running,
      nextRun: earliest?.toISOString() ?? null,
    },
  };
}

function schedulerHistory(ctx: DashboardContext, query: URLSearchParams): ApiResult {
  if (!ctx.historyStore) {
    return { status: 200, body: { entries: [] } };
  }

  const rawLimit = Number.parseInt(query.get("limit") ?? "", 10);
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(rawLimit, MAX_HISTORY_LIMIT)
      : DEFAULT_HISTORY_LIMIT;

  const taskId = query.get("taskId");

  const entries = taskId
    ? ctx.historyStore.getByTaskId(taskId, limit)
    : ctx.historyStore.getAll(limit);

  return { status: 200, body: { entries } };
}
