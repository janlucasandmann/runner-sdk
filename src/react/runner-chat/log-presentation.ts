import type { RunnerLog } from "../../types.js";
import {
  getRunnerLogAbsoluteTimestampMs,
} from "./conversation-messages.js";
import {
  formatElapsedDurationLabel,
  parseSecondsFromClock,
} from "./time-utils.js";

export function runnerExecutionStatusTone(
  status: "idle" | "running" | "success" | "failed" | "cancelled",
): "neutral" | "success" | "error" {
  if (status === "success") return "success";
  if (status === "failed") return "error";
  return "neutral";
}

export function getRunnerLogTimestampMs(
  log: RunnerLog,
  relativeBaseMs?: number | null,
): number | null {
  const absoluteTimestampMs = getRunnerLogAbsoluteTimestampMs(log);
  if (absoluteTimestampMs !== null) {
    return absoluteTimestampMs;
  }

  const relativeSeconds = log.time ? parseSecondsFromClock(log.time) : null;
  if (
    relativeSeconds !== null
    && relativeBaseMs != null
    && Number.isFinite(relativeBaseMs)
  ) {
    return relativeBaseMs + relativeSeconds * 1000;
  }
  return null;
}

export function getRunnerLogRelativeSeconds(
  log: RunnerLog,
  startedAtMs?: number | null,
): number | null {
  const absoluteTimestampMs = getRunnerLogAbsoluteTimestampMs(log);
  if (
    absoluteTimestampMs !== null
    && startedAtMs != null
    && Number.isFinite(startedAtMs)
  ) {
    return Math.max(0, Math.round((absoluteTimestampMs - startedAtMs) / 1000));
  }

  const clockSeconds = log.time ? parseSecondsFromClock(log.time) : null;
  return clockSeconds !== null ? Math.max(0, clockSeconds) : null;
}

export function getRunnerLogRangeDurationLabel(
  startLog: RunnerLog,
  endLog: RunnerLog,
  relativeBaseMs?: number | null,
): string | undefined {
  const startMs = getRunnerLogTimestampMs(startLog, relativeBaseMs);
  const endMs = getRunnerLogTimestampMs(endLog, relativeBaseMs);
  if (startMs === null || endMs === null) {
    return undefined;
  }
  return formatElapsedDurationLabel(Math.max(0, (endMs - startMs) / 1000));
}

export function toRunnerLogDurationLabel(
  log: RunnerLog,
  startedAtMs?: number | null,
): string | undefined {
  const relativeSeconds = getRunnerLogRelativeSeconds(log, startedAtMs);
  if (relativeSeconds !== null) {
    return formatElapsedDurationLabel(relativeSeconds);
  }

  const durationMs =
    typeof log.metadata?.durationMs === "number"
      ? log.metadata.durationMs
      : typeof (log.metadata as { duration_ms?: unknown } | undefined)
          ?.duration_ms === "number"
        ? (log.metadata as { duration_ms: number }).duration_ms
        : undefined;
  if (typeof durationMs === "number" && durationMs >= 0) {
    return formatElapsedDurationLabel(
      Math.max(1, Math.round(durationMs / 1000)),
    );
  }
  if (log.time) return log.time;
  return undefined;
}

export function isBtwTurnPrompt(prompt: string): boolean {
  return /^\/btw\b/i.test(prompt.trim());
}
