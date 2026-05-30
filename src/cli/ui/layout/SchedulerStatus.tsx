import { Text } from "ink";
// biome-ignore lint/style/useImportType: tsconfig jsx=react needs React in value scope for JSX compilation
import React from "react";
import { useEffect, useState } from "react";
import { t } from "../../../i18n/index.js";
import { nextRun } from "../../../scheduler/cron-parser.js";
import { TaskStore } from "../../../scheduler/store.js";
import { FG, TONE } from "../theme/tokens.js";

const POLL_MS = 30_000;
const NEXT_RUN_THRESHOLD_MS = 3_600_000;

export function useSchedulerStatus(workspace: string): {
  enabledCount: number;
  nextRunDate: Date | null;
} {
  const [status, setStatus] = useState<{ enabledCount: number; nextRunDate: Date | null }>(() =>
    computeStatus(workspace),
  );

  useEffect(() => {
    const update = () => setStatus(computeStatus(workspace));
    update();
    const id = setInterval(update, POLL_MS);
    return () => clearInterval(id);
  }, [workspace]);

  return status;
}

export function computeStatus(workspace: string): {
  enabledCount: number;
  nextRunDate: Date | null;
} {
  const store = new TaskStore(workspace);
  const enabled = store.getEnabled();
  if (enabled.length === 0) return { enabledCount: 0, nextRunDate: null };

  const now = new Date();
  let earliest: Date | null = null;
  for (const task of enabled) {
    try {
      const next = nextRun(task.cron, now);
      if (!earliest || next < earliest) earliest = next;
    } catch {
      // skip tasks with invalid cron
    }
  }
  return { enabledCount: enabled.length, nextRunDate: earliest };
}

export function SchedulerStatusPill({
  enabledCount,
  nextRunDate,
}: {
  enabledCount: number;
  nextRunDate: Date | null;
}): React.ReactElement | null {
  if (enabledCount === 0) return null;

  const showNext =
    nextRunDate !== null && nextRunDate.getTime() - Date.now() <= NEXT_RUN_THRESHOLD_MS;

  return (
    <>
      <Text color={TONE.accent} wrap="truncate">
        {"⏱ "}
      </Text>
      <Text color={FG.body} wrap="truncate">
        {t("statusBar.schedulerCount", { count: enabledCount })}
      </Text>
      {showNext && (
        <Text color={FG.sub} wrap="truncate">
          {` (${t("statusBar.schedulerNext", { time: formatHHMM(nextRunDate!) })})`}
        </Text>
      )}
    </>
  );
}

function formatHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
