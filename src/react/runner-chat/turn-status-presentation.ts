import { getTurnLatestProgressTimestampMs, isRunningTurnStatus } from "./hydration/turn-state.js";
import { formatElapsedDurationLabel } from "./time-utils.js";
import type { RunnerTurn } from "./turn-types.js";
import { normalizeRunnerThreadWorkingLabel } from "../../thread/working-label.js";

export function getRunnerTurnDurationSeconds(turn: RunnerTurn, nowMs: number): number {
  const explicitDurationSeconds =
    typeof turn.durationSeconds === "number" && Number.isFinite(turn.durationSeconds)
      ? Math.max(0, Math.round(turn.durationSeconds))
      : null;
  if (explicitDurationSeconds !== null && explicitDurationSeconds > 0) {
    return explicitDurationSeconds;
  }

  const derivedEndMs = isRunningTurnStatus(turn.status)
    ? nowMs
    : Math.max(turn.completedAtMs ?? turn.startedAtMs, getTurnLatestProgressTimestampMs(turn));
  const derivedDurationSeconds = Math.max(0, Math.round((derivedEndMs - turn.startedAtMs) / 1000));
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
  return normalizeRunnerThreadWorkingLabel(normalized);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isOrchestratorOwnedMetadata(metadata: Record<string, unknown>): boolean {
  const actor = asRecord(metadata.actor);
  const actorKind = String(actor?.kind || "")
    .trim()
    .toLowerCase();
  if (actorKind === "orchestrator") return true;

  const source = String(metadata.source || metadata.producerType || metadata.producer_type || "")
    .trim()
    .toLowerCase();
  return /observer|orchestrator|communicator|supervision|chronicle/.test(source);
}

function explicitLiveSummary(metadata: Record<string, unknown>): string | null {
  // Observer-named fields are already an ownership contract. Generic status
  // fields only participate when their producer is explicitly orchestration.
  const observerSummary =
    cleanLiveSummary(metadata.observerSummary) || cleanLiveSummary(metadata.observer_summary);
  if (observerSummary) return observerSummary;

  if (isOrchestratorOwnedMetadata(metadata)) {
    for (const key of [
      "workingLabel",
      "working_label",
      "workingSummary",
      "working_summary",
      "headerSummary",
      "header_summary",
      "statusMessage",
      "status_message",
      "liveSummary",
      "live_summary",
      "thinkingSummary",
      "thinking_summary",
    ]) {
      const summary = cleanLiveSummary(metadata[key]);
      if (summary) return summary;
    }
  }

  const deepResearch = asRecord(metadata.deepResearch ?? metadata.deep_research);
  return cleanLiveSummary(deepResearch?.thinkingSummary ?? deepResearch?.thinking_summary);
}

export function getRunnerTurnLiveWorkSummary(turn: RunnerTurn): string | null {
  for (const log of [...turn.logs].reverse()) {
    const metadata = (log.metadata || {}) as Record<string, unknown>;
    const explicitSummary = explicitLiveSummary(metadata);
    if (explicitSummary) return explicitSummary;
  }
  return null;
}

export function getRunnerTurnWorkHeadline(
  turn: RunnerTurn,
  nowMs: number,
  canonicalWorkingLabel?: string | null,
): string {
  if (turn.status === "permission_asked") {
    return "Waiting for permission";
  }
  if (isRunningTurnStatus(turn.status)) {
    const liveSummary = cleanLiveSummary(canonicalWorkingLabel) || getRunnerTurnLiveWorkSummary(turn);
    return liveSummary || "Working...";
  }
  return `Worked for ${formatElapsedDurationLabel(getRunnerTurnDurationSeconds(turn, nowMs))}`;
}
