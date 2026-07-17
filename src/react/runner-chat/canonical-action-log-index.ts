import type { RunnerLog } from "../../types.js";
import type { RunnerThreadAction } from "../../thread/types.js";
import type { RunnerTurn } from "./turn-types.js";

export interface RunnerOriginalActionLogEntry {
  log: RunnerLog;
  turn: RunnerTurn;
  logIndex: number;
}

export interface RunnerOriginalActionLogIndex {
  byIdentity: Map<string, RunnerOriginalActionLogEntry>;
  entries: RunnerOriginalActionLogEntry[];
}

function normalizeIdentity(value: unknown): string {
  return String(value || "").trim();
}

export function buildRunnerOriginalActionLogIndex(
  turns: readonly RunnerTurn[],
): RunnerOriginalActionLogIndex {
  const byIdentity = new Map<string, RunnerOriginalActionLogEntry>();
  const entries: RunnerOriginalActionLogEntry[] = [];
  const addIdentity = (
    value: unknown,
    entry: RunnerOriginalActionLogEntry,
  ) => {
    const normalized = normalizeIdentity(value);
    if (normalized && !byIdentity.has(normalized)) {
      byIdentity.set(normalized, entry);
    }
  };

  for (const turn of turns) {
    turn.logs.forEach((log, logIndex) => {
      const entry = { log, turn, logIndex };
      const metadata = (log.metadata || {}) as Record<string, unknown>;
      entries.push(entry);
      for (const identity of [
        metadata.toolId,
        metadata.tool_id,
        metadata.actionId,
        metadata.action_id,
        metadata.logId,
        metadata.log_id,
        metadata.stepId,
        metadata.step_id,
        metadata.eventId,
        metadata.event_id,
      ]) {
        addIdentity(identity, entry);
      }
    });
  }

  return { byIdentity, entries };
}

export function resolveRunnerOriginalActionLog(
  action: RunnerThreadAction,
  index: RunnerOriginalActionLogIndex,
): RunnerOriginalActionLogEntry | null {
  const metadata = (action.metadata || {}) as Record<string, unknown>;
  const identities = [
    action.id,
    action.sourceEventId,
    metadata.toolId,
    metadata.tool_id,
    metadata.actionId,
    metadata.action_id,
    metadata.logId,
    metadata.log_id,
    metadata.stepId,
    metadata.step_id,
    metadata.eventId,
    metadata.event_id,
  ];
  for (const identity of identities) {
    const normalized = normalizeIdentity(identity);
    const exact = normalized ? index.byIdentity.get(normalized) : null;
    if (exact) return exact;
  }

  const actionMessage = String(action.summary || action.title || "")
    .replace(/\s+/g, " ")
    .trim();
  const actionEventType = String(
    metadata.legacyEventType || metadata.eventType || action.type || "",
  ).trim();
  const actionToolName = String(
    action.toolName || metadata.toolName || metadata.tool_name || "",
  ).trim();
  const actionInput =
    action.input
    && typeof action.input === "object"
    && !Array.isArray(action.input)
      ? (action.input as Record<string, unknown>)
      : null;
  const actionCommand = String(
    metadata.command || actionInput?.command || "",
  ).trim();
  const actionCreatedAtMs = Date.parse(action.createdAt || "");
  let bestMatch: {
    entry: RunnerOriginalActionLogEntry;
    score: number;
  } | null = null;

  for (const entry of index.entries) {
    const logMetadata = (entry.log.metadata || {}) as Record<string, unknown>;
    const logMessage = String(entry.log.message || "")
      .replace(/\s+/g, " ")
      .trim();
    const logToolName = String(
      logMetadata.toolName || logMetadata.tool_name || "",
    ).trim();
    const logCommand = String(logMetadata.command || "").trim();
    let score = 0;
    if (actionMessage && logMessage === actionMessage) score += 8;
    if (actionEventType && entry.log.eventType === actionEventType) score += 4;
    if (actionToolName && logToolName === actionToolName) score += 5;
    if (actionCommand && logCommand === actionCommand) score += 10;
    const logCreatedAtMs = Date.parse(entry.log.createdAt || "");
    if (Number.isFinite(actionCreatedAtMs) && Number.isFinite(logCreatedAtMs)) {
      const deltaMs = Math.abs(actionCreatedAtMs - logCreatedAtMs);
      if (deltaMs <= 1_000) score += 4;
      else if (deltaMs <= 30_000) score += 1;
    }
    if (score > (bestMatch?.score || 0)) {
      bestMatch = { entry, score };
    }
  }

  return bestMatch && bestMatch.score >= 8 ? bestMatch.entry : null;
}
