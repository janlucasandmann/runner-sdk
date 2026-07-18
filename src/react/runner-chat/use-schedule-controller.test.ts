// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  formatRunnerScheduleChipLabel,
  useRunnerScheduleController,
} from "./use-schedule-controller.js";

describe("useRunnerScheduleController", () => {
  it("submits recurring schedules through the configured callback", () => {
    const onQuickSchedule = vi.fn();
    const onSubmitted = vi.fn();
    const { result } = renderHook(() =>
      useRunnerScheduleController({
        config: {
          presets: [
            {
              id: "weekday",
              label: "Weekdays",
              cron: "0 9 * * 1-5",
            },
          ],
          onQuickSchedule,
        },
        now: () => new Date("2026-01-02T08:00:00.000Z"),
        onSubmitted,
      }),
    );

    act(() => {
      result.current.setScheduleType("recurring");
      result.current.setScheduledAtValue("2026-01-05T09:30");
    });
    act(() => {
      expect(result.current.submitSchedule()).toBe(true);
    });

    expect(onQuickSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        cronExpression: "0 9 * * 1-5",
        scheduleType: "recurring",
      }),
    );
    expect(onSubmitted).toHaveBeenCalledOnce();
    expect(result.current.scheduleEnabled).toBe(true);
    const scheduledTask = result.current.scheduledTask;
    if (!scheduledTask) throw new Error("Expected a scheduled task.");
    expect(formatRunnerScheduleChipLabel(scheduledTask)).toBe("Recurring");
  });

  it("rejects invalid local date values without submitting", () => {
    const onInvalidSchedule = vi.fn();
    const onSubmitted = vi.fn();
    const { result } = renderHook(() =>
      useRunnerScheduleController({
        onInvalidSchedule,
        onSubmitted,
      }),
    );

    act(() => result.current.setScheduledAtValue("not-a-date"));
    act(() => {
      expect(result.current.submitSchedule()).toBe(false);
    });

    expect(onInvalidSchedule).toHaveBeenCalledWith("Pick a valid date and time for the schedule.");
    expect(onSubmitted).not.toHaveBeenCalled();
    expect(result.current.scheduledTask).toBeNull();
  });

  it("repairs a stale selected preset when configuration changes", async () => {
    const { result, rerender } = renderHook(
      ({ presetId }: { presetId: string }) =>
        useRunnerScheduleController({
          config: {
            presets: [
              {
                id: presetId,
                label: presetId,
                cron: "0 9 * * *",
              },
            ],
          },
        }),
      { initialProps: { presetId: "daily" } },
    );

    expect(result.current.selectedSchedulePresetId).toBe("daily");
    rerender({ presetId: "weekly" });
    await waitFor(() => expect(result.current.selectedSchedulePresetId).toBe("weekly"));
  });
});
