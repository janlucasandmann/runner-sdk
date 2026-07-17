import type { RunnerLog } from "../../types.js";
import { getTurnLatestProgressTimestampMs } from "./hydration/turn-state.js";
import { isRunningTurnStatus } from "./hydration/turn-state.js";
import type { RunnerTurn } from "./turn-types.js";

export function getRunnerTurnDurationSeconds(
  turn: RunnerTurn,
  nowMs: number,
): number {
  const explicitDurationSeconds =
    typeof turn.durationSeconds === "number"
    && Number.isFinite(turn.durationSeconds)
      ? Math.max(0, Math.round(turn.durationSeconds))
      : null;
  if (explicitDurationSeconds !== null && explicitDurationSeconds > 0) {
    return explicitDurationSeconds;
  }

  const derivedEndMs = isRunningTurnStatus(turn.status)
    ? nowMs
    : Math.max(
        turn.completedAtMs ?? turn.startedAtMs,
        getTurnLatestProgressTimestampMs(turn),
      );
  const derivedDurationSeconds = Math.max(
    0,
    Math.round((derivedEndMs - turn.startedAtMs) / 1000),
  );
  return derivedDurationSeconds > 0
    ? derivedDurationSeconds
    : (explicitDurationSeconds ?? derivedDurationSeconds);
}

function cleanLiveSummary(value: unknown): string | null {
  const normalized =
    typeof value === "string"
      ? value
          .replace(/\s+/g, " ")
          .replace(/^(?:status|progress|working)\s*:\s*/i, "")
          .trim()
      : "";
  if (!normalized) return null;
  const sentence =
    normalized.length > 132
      ? `${normalized.slice(0, 129).trimEnd()}…`
      : normalized;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export function getRunnerTurnLiveWorkSummary(
  turn: RunnerTurn,
): string | null {
  for (const log of [...turn.logs].reverse()) {
    const metadata = (log.metadata || {}) as Record<string, unknown>;
    const explicitSummary =
      cleanLiveSummary(metadata.liveSummary)
      || cleanLiveSummary(metadata.observerSummary)
      || cleanLiveSummary(metadata.thinkingSummary)
      || cleanLiveSummary(
        (
          metadata.deepResearch as
            | { thinkingSummary?: unknown }
            | undefined
        )?.thinkingSummary,
      );
    if (explicitSummary) return explicitSummary;
  }

  const actionSummary = [...turn.logs]
    .reverse()
    .find((log) => log.isActionSummary || log.eventType === "action_summary");
  const actionSummaryText = cleanLiveSummary(actionSummary?.message);
  if (actionSummaryText) return actionSummaryText;

  const latestUsefulLog = [...turn.logs].reverse().find((log: RunnerLog) => {
    if (!log.message?.trim()) return false;
    if (
      log.eventType === "agent_message"
      || log.eventType === "llm_response"
      || log.eventType === "user_message"
    ) {
      return false;
    }
    if (log.eventType === "permission_request") return false;
    if (log.isReasoning && log.message.length > 180) return false;
    return true;
  });
  return cleanLiveSummary(latestUsefulLog?.message);
}
