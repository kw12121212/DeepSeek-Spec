import { t } from "@/i18n/index.js";
import { describeCron, nextRun, parseCron } from "@/scheduler/cron-parser.js";
import { HistoryStore } from "@/scheduler/history.js";
import { TaskStore } from "@/scheduler/store.js";
import type { SlashHandler } from "../dispatch.js";

const schedule: SlashHandler = (args) => {
  const subcommand = args[0];
  if (subcommand === "add") return handleAdd(args.slice(1));
  if (subcommand === "list") return handleList();
  if (subcommand === "remove") return handleRemove(args.slice(1));
  if (subcommand === "enable") return handleToggle(args.slice(1), true);
  if (subcommand === "disable") return handleToggle(args.slice(1), false);
  if (subcommand === "history") return handleHistory(args.slice(1));
  return { info: t("scheduler.helpText") };
};

function parseAddArgs(args: string[]): { name: string; cron: string; prompt: string } | string {
  if (args.length < 4) return t("scheduler.addUsage");
  const cronIdx = args.indexOf("--cron");
  if (cronIdx === -1) return t("scheduler.addUsage");
  const name = args.slice(0, cronIdx).join(" ");
  if (!name) return t("scheduler.addUsage");
  const cron = args[cronIdx + 1];
  if (!cron) return t("scheduler.addUsage");
  const prompt = args.slice(cronIdx + 2).join(" ");
  if (!prompt) return t("scheduler.addUsage");
  return { name, cron, prompt };
}

function handleAdd(args: string[]): { info: string } {
  const parsed = parseAddArgs(args);
  if (typeof parsed === "string") return { info: parsed };
  const { name, cron, prompt } = parsed;
  try {
    parseCron(cron);
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    return { info: t("scheduler.addCronInvalid", { reason }) };
  }
  const description = describeCron(cron);
  const store = new TaskStore(process.cwd());
  const task = store.add({ name, cron, prompt, enabled: true });
  return {
    info: t("scheduler.addCreated", {
      name: task.name,
      id: task.id,
      description,
    }),
  };
}

function handleList(): { info: string } {
  const store = new TaskStore(process.cwd());
  const tasks = store.load();
  if (tasks.length === 0) return { info: t("scheduler.listEmpty") };
  const lines = tasks.map((task) => {
    const description = describeCron(task.cron);
    const enabled = task.enabled ? t("scheduler.listEnabled") : t("scheduler.listDisabled");
    const next = nextRun(task.cron, new Date());
    const nextStr = next.toISOString().replace("T", " ").slice(0, 16);
    const lastRun = task.updatedAt ? task.updatedAt.replace("T", " ").slice(0, 16) : "-";
    return t("scheduler.listRow", {
      name: task.name,
      cron: task.cron,
      description,
      enabled,
      nextRun: nextStr,
      lastRun,
    });
  });
  return { info: lines.join("\n") };
}

function resolveTask(store: TaskStore, identifier: string) {
  return store.getById(identifier) ?? store.getByName(identifier);
}

function handleRemove(args: string[]): { info: string } {
  if (args.length === 0) return { info: t("scheduler.removeUsage") };
  const identifier = args[0]!;
  const store = new TaskStore(process.cwd());
  const task = resolveTask(store, identifier);
  if (!task) return { info: t("scheduler.removeNotFound", { id: identifier }) };
  store.remove(task.id);
  return { info: t("scheduler.removeSuccess", { name: task.name }) };
}

function handleToggle(args: string[], enable: boolean): { info: string } {
  if (args.length === 0) return { info: t("scheduler.toggleUsage") };
  const identifier = args[0]!;
  const store = new TaskStore(process.cwd());
  const task = resolveTask(store, identifier);
  if (!task) return { info: t("scheduler.toggleNotFound", { id: identifier }) };
  store.update(task.id, { enabled: enable });
  return {
    info: t(enable ? "scheduler.enableSuccess" : "scheduler.disableSuccess", { name: task.name }),
  };
}

function handleHistory(args: string[]): { info: string } {
  if (args.length === 0) {
    return { info: t("scheduler.historyUsage") };
  }

  const identifier = args[0]!;
  const projectRoot = process.cwd();
  const taskStore = new TaskStore(projectRoot);
  const task = resolveTask(taskStore, identifier);

  if (!task) {
    return { info: t("scheduler.historyNotFound", { id: identifier }) };
  }

  const historyStore = new HistoryStore(projectRoot);
  const entries = historyStore.getByTaskId(task.id);

  if (entries.length === 0) {
    return { info: t("scheduler.historyNoTask", { name: task.name }) };
  }

  const lines = entries.map((entry) => {
    const statusIcon =
      entry.status === "success"
        ? t("scheduler.historyStatusSuccess")
        : t("scheduler.historyStatusError");
    const durationSec = (entry.duration / 1000).toFixed(1);
    return t("scheduler.historyEntry", {
      status: statusIcon,
      startedAt: entry.startedAt,
      duration: durationSec,
      snippet: entry.outputSnippet,
    });
  });

  return { info: `${task.name}:\n${lines.join("\n")}` };
}

export const handlers: Record<string, SlashHandler> = { schedule };
