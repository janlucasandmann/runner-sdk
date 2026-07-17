import { describe, expect, it } from "vitest";
import {
  buildFailedThreadFallbackLogs,
  isPendingPermissionThreadLifecycleStatus,
  isRunningThreadLifecycleStatus,
  isTerminalThreadLifecycleStatus,
  resolveHydratedThreadLifecycleStatus,
  terminalTurnStatusFromThreadStatus,
} from "./lifecycle-status.js";

describe("runner hydration lifecycle status", () => {
  it("normalizes pending permission, running, and terminal states", () => {
    expect(isPendingPermissionThreadLifecycleStatus("Permission Asked")).toBe(true);
    expect(isRunningThreadLifecycleStatus("starting")).toBe(true);
    expect(isTerminalThreadLifecycleStatus("succeeded")).toBe(true);
    expect(resolveHydratedThreadLifecycleStatus("active", Date.now())).toBe("completed");
    expect(resolveHydratedThreadLifecycleStatus("permission asked", Date.now())).toBe(
      "permission_asked",
    );
    expect(terminalTurnStatusFromThreadStatus("cancelled")).toBe("cancelled");
  });

  it("creates an actionable fallback when a failed thread has no logs", () => {
    const fallback = buildFailedThreadFallbackLogs({
      logs: [],
      threadStatus: "failed",
      title: "Scheduled: daily import",
      metadata: { scheduleId: "schedule-1" },
      completedAt: "2026-07-16T10:00:00.000Z",
    });

    expect(fallback).toHaveLength(1);
    expect(fallback[0]).toMatchObject({
      type: "error",
      message: "Scheduled task failed before working logs were recorded.",
      metadata: {
        error: {
          source: "scheduled_task",
          synthetic: true,
          scheduleId: "schedule-1",
        },
      },
    });
  });

  it("preserves real logs instead of adding a fallback", () => {
    const logs = [{ time: "00:01", type: "info" as const, message: "Started" }];
    expect(buildFailedThreadFallbackLogs({ logs, threadStatus: "failed" })).toBe(logs);
  });
});
