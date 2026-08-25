import type { RunnerLog } from "../../../types.js";
import type { RunnerTurnStatus } from "../turn-types.js";

export function normalizeThreadLifecycleStatus(
  status: string | null | undefined,
): string {
  return typeof status === "string" ? status.trim().toLowerCase() : "";
}

export function isRunningThreadLifecycleStatus(
  status: string | null | undefined,
): boolean {
  return [
    "queued",
    "pending",
    "starting",
    "running",
    "created",
    "ready",
  ].includes(normalizeThreadLifecycleStatus(status));
}

export function isPendingPermissionThreadLifecycleStatus(
  status: string | null | undefined,
): boolean {
  const normalizedStatus = normalizeThreadLifecycleStatus(status);
  return (
    normalizedStatus === "permission_asked" ||
    normalizedStatus === "permission asked"
  );
}

export function isTerminalThreadLifecycleStatus(
  status: string | null | undefined,
): boolean {
  return [
    "completed",
    "complete",
    "done",
    "succeeded",
    "success",
    "finished",
    "failed",
    "cancelled",
    "canceled",
    "archived",
    "deleted",
  ].includes(normalizeThreadLifecycleStatus(status));
}

export function resolveHydratedThreadLifecycleStatus(
  status: string | null | undefined,
  completedAtMs?: number | null,
): string | null {
  const normalizedStatus = normalizeThreadLifecycleStatus(status);
  if (isPendingPermissionThreadLifecycleStatus(normalizedStatus)) {
    return "permission_asked";
  }
  if (isRunningThreadLifecycleStatus(normalizedStatus)) {
    return normalizedStatus;
  }
  if (completedAtMs != null && !isTerminalThreadLifecycleStatus(normalizedStatus)) {
    return "completed";
  }
  return typeof status === "string" && status.trim() ? status.trim() : null;
}

export function terminalTurnStatusFromThreadStatus(
  status: string | null | undefined,
): RunnerTurnStatus {
  const normalizedStatus = normalizeThreadLifecycleStatus(status);
  if (normalizedStatus === "failed") {
    return "failed";
  }
  if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") {
    return "cancelled";
  }
  return "completed";
}

export function buildFailedThreadFallbackLogs(params: {
  logs: RunnerLog[];
  threadStatus: string | null | undefined;
  title?: string | null;
  task?: string | null;
  lastMessagePreview?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}): RunnerLog[] {
  if (
    params.logs.length > 0 ||
    normalizeThreadLifecycleStatus(params.threadStatus) !== "failed"
  ) {
    return params.logs;
  }

  const task = typeof params.task === "string" ? params.task.trim() : "";
  const preview =
    typeof params.lastMessagePreview === "string"
      ? params.lastMessagePreview.trim()
      : "";
  const scheduleId =
    params.metadata &&
    typeof params.metadata === "object" &&
    !Array.isArray(params.metadata) &&
    typeof params.metadata.scheduleId === "string"
      ? params.metadata.scheduleId.trim()
      : "";
  const title = typeof params.title === "string" ? params.title.trim() : "";
  const isScheduledThread = Boolean(scheduleId || /^scheduled:/i.test(title));
  const fallbackTime =
    (typeof params.completedAt === "string" && params.completedAt.trim()) ||
    (typeof params.updatedAt === "string" && params.updatedAt.trim()) ||
    new Date().toISOString();

  return [
    {
      createdAt: fallbackTime,
      time: fallbackTime,
      message:
        preview && preview !== task
          ? preview
          : isScheduledThread
            ? "Scheduled task failed before working logs were recorded."
            : "Thread failed before working logs were recorded.",
      type: "error",
      metadata: {
        status: "failed",
        error: {
          source: isScheduledThread ? "scheduled_task" : "thread",
          synthetic: true,
          ...(scheduleId ? { scheduleId } : {}),
        },
      },
    },
  ];
}
