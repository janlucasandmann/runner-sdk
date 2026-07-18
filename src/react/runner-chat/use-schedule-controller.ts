import { useCallback, useEffect, useMemo, useState } from "react";

import type { RunnerChatScheduleConfig, RunnerChatSchedulePreset } from "./public-types.js";

export type RunnerScheduleType = "one-time" | "recurring";

export interface RunnerScheduledTask {
  scheduledTime: Date;
  scheduleType: RunnerScheduleType;
  cronExpression?: string;
}

export const DEFAULT_RUNNER_SCHEDULE_PRESETS: RunnerChatSchedulePreset[] = [
  { id: "daily", label: "Every day", cron: "0 9 * * *" },
  {
    id: "weekdays",
    label: "Every weekday",
    cron: "0 9 * * 1-5",
  },
  { id: "weekly", label: "Every week", cron: "0 9 * * 1" },
];

export function formatRunnerDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatRunnerScheduleChipLabel(
  schedule: Pick<RunnerScheduledTask, "scheduledTime" | "scheduleType">,
): string {
  if (schedule.scheduleType === "recurring") {
    return "Recurring";
  }

  return `${schedule.scheduledTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} ${schedule.scheduledTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export interface UseRunnerScheduleControllerOptions {
  config?: RunnerChatScheduleConfig;
  now?: () => Date;
  onInvalidSchedule?: (message: string) => void;
  onSubmitted?: () => void;
}

export function useRunnerScheduleController({
  config,
  now = () => new Date(),
  onInvalidSchedule,
  onSubmitted,
}: UseRunnerScheduleControllerOptions) {
  const schedulePresets = useMemo(
    () => (config?.presets?.length ? config.presets : DEFAULT_RUNNER_SCHEDULE_PRESETS),
    [config?.presets],
  );
  const [scheduleType, setScheduleType] = useState<RunnerScheduleType>("one-time");
  const [scheduledAtValue, setScheduledAtValue] = useState(() => {
    const initialDate = now();
    initialDate.setTime(initialDate.getTime() + 60 * 60 * 1000);
    return formatRunnerDateTimeLocalValue(initialDate);
  });
  const [selectedSchedulePresetId, setSelectedSchedulePresetId] = useState<string>(
    () => schedulePresets[0]?.id || "",
  );
  const [scheduledTask, setScheduledTask] = useState<RunnerScheduledTask | null>(null);

  useEffect(() => {
    setSelectedSchedulePresetId((current) => {
      if (current && schedulePresets.some((preset) => preset.id === current)) {
        return current;
      }
      return schedulePresets[0]?.id || "";
    });
  }, [schedulePresets]);

  const clearScheduledTask = useCallback(() => {
    setScheduledTask(null);
  }, []);

  const submitSchedule = useCallback((): boolean => {
    const scheduledTime = new Date(scheduledAtValue);
    if (Number.isNaN(scheduledTime.getTime())) {
      onInvalidSchedule?.("Pick a valid date and time for the schedule.");
      return false;
    }

    const selectedPreset = schedulePresets.find((preset) => preset.id === selectedSchedulePresetId);
    const nextSchedule: RunnerScheduledTask = {
      scheduledTime,
      scheduleType,
      ...(scheduleType === "recurring" && selectedPreset?.cron
        ? { cronExpression: selectedPreset.cron }
        : {}),
    };
    setScheduledTask(nextSchedule);
    config?.onQuickSchedule?.(nextSchedule);
    onSubmitted?.();
    return true;
  }, [
    config,
    onInvalidSchedule,
    onSubmitted,
    schedulePresets,
    scheduleType,
    scheduledAtValue,
    selectedSchedulePresetId,
  ]);

  return {
    clearScheduledTask,
    scheduleEnabled: Boolean(config?.enabled || scheduledTask),
    schedulePresets,
    scheduledAtValue,
    scheduledTask,
    scheduleType,
    selectedSchedulePresetId,
    setScheduledAtValue,
    setScheduleType,
    setSelectedSchedulePresetId,
    submitSchedule,
  };
}
