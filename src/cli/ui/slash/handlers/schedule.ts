import { t } from "@/i18n/index.js";
import { HistoryStore } from "@/scheduler/history.js";
import { TaskStore } from "@/scheduler/store.js";
import type { SlashHandler } from "../dispatch.js";

const schedule: SlashHandler = (args) => {
  const subcommand = args[0];
  if (subcommand === "history") {
    return handleHistory(args.slice(1));
  }
  return { info: t("scheduler.historyUsage") };
};

function handleHistory(args: string[]): { info: string } {
  if (args.length === 0) {
    return { info: t("scheduler.historyUsage") };
  }

  const identifier = args[0]!;
  const projectRoot = process.cwd();
  const taskStore = new TaskStore(projectRoot);
  const task = taskStore.getById(identifier) ?? taskStore.getByName(identifier);

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
