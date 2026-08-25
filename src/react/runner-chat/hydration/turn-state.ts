import type { RunnerLog } from "../../../types.js";
import { hasActiveDeepResearchLogGroup } from "../../../platform-ui/components/thread-components/log-boxes/index.js";
import { stripRunnerSystemTags as stripSystemTags } from "../../runner-markdown.js";
import { parseIsoTimestampMs, parseSecondsFromClock } from "../time-utils.js";
import type { RunnerTurn, RunnerTurnStatus } from "../turn-types.js";
import {
  isPendingPermissionThreadLifecycleStatus,
  isRunningThreadLifecycleStatus,
  isTerminalThreadLifecycleStatus,
  normalizeThreadLifecycleStatus,
  terminalTurnStatusFromThreadStatus,
} from "./lifecycle-status.js";

export function isTerminalTurnStatus(status: RunnerTurnStatus): boolean {
  return status === "completed" || status === "failed" || status === "cancelled";
}

export function isRunningTurnStatus(status: RunnerTurnStatus): boolean {
  return status === "running";
}

export function isActiveTurnStatus(status: RunnerTurnStatus): boolean {
  return status === "running" || status === "permission_asked";
}

export function isTurnResponseLog(log: RunnerLog): boolean {
  return log.eventType === "agent_message" || log.eventType === "llm_response";
}

export interface RunnerBatchQueueReceipt {
  batchJobId: string | null;
  admissionReason: string | null;
  batchStatus: string | null;
  batchStartPolicy: string | null;
}

export function getRunnerBatchQueueReceiptLabel(
  receipt: RunnerBatchQueueReceipt,
): string {
  if (receipt.admissionReason === "runtime_execution_capacity_exhausted") {
    return "Moved to Batches because runtime capacity is full · starts automatically when capacity is available";
  }
  if (
    receipt.batchStatus === "queued"
    || receipt.batchStartPolicy === "when_capacity_available"
  ) {
    return "Queued in Batches · starts automatically when capacity is available";
  }
  return "Saved in Batches · start this job when you are ready";
}

export function getTurnBatchQueueReceipt(
  turn: RunnerTurn,
): RunnerBatchQueueReceipt | null {
  if (turn.logs.some(isTurnResponseLog)) return null;
  let queueIndex = -1;
  for (let index = turn.logs.length - 1; index >= 0; index -= 1) {
    const log = turn.logs[index];
    if (
      log?.eventType === "batch_queued"
      || log?.metadata?.batchStatus === "queued"
    ) {
      queueIndex = index;
      break;
    }
  }
  const metadataBatchJobId = typeof turn.messageMetadata?.batchJobId === "string"
    ? turn.messageMetadata.batchJobId
    : null;
  const metadataQueued = turn.messageMetadata?.batchStatus === "queued";
  if (queueIndex === -1 && !metadataQueued && !metadataBatchJobId) return null;
  if (
    queueIndex >= 0
    && turn.logs.slice(queueIndex + 1).some((log) => log.eventType !== "batch_queued")
  ) {
    return null;
  }
  const queueLog = queueIndex >= 0 ? turn.logs[queueIndex] : null;
  return {
    batchJobId: typeof queueLog?.metadata?.batchJobId === "string"
      ? queueLog.metadata.batchJobId
      : metadataBatchJobId,
    admissionReason: typeof queueLog?.metadata?.admissionReason === "string"
      ? queueLog.metadata.admissionReason
      : typeof turn.messageMetadata?.admissionReason === "string"
        ? turn.messageMetadata.admissionReason
        : null,
    batchStatus: typeof queueLog?.metadata?.batchStatus === "string"
      ? queueLog.metadata.batchStatus
      : typeof turn.messageMetadata?.batchStatus === "string"
        ? turn.messageMetadata.batchStatus
        : null,
    batchStartPolicy: typeof queueLog?.metadata?.batchStartPolicy === "string"
      ? queueLog.metadata.batchStartPolicy
      : typeof turn.messageMetadata?.batchStartPolicy === "string"
        ? turn.messageMetadata.batchStartPolicy
        : null,
  };
}

export function getTurnAssistantMessageText(turn: RunnerTurn): string {
  return turn.logs
    .filter(isTurnResponseLog)
    .map((log) => stripSystemTags(log.message || "").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export function turnPresentation(turn: RunnerTurn): RunnerTurn["presentation"] {
  if (turn.presentation) {
    return turn.presentation;
  }
  return /^\/btw\b/i.test(turn.prompt.trim()) ? "btw" : "default";
}

export function getTurnLatestProgressTimestampMs(turn: RunnerTurn): number {
  let latestTimestampMs = turn.completedAtMs ?? turn.startedAtMs;
  for (const log of turn.logs) {
    const createdAtMs = parseIsoTimestampMs(log.createdAt);
    if (createdAtMs !== null) {
      latestTimestampMs = Math.max(latestTimestampMs, createdAtMs);
      continue;
    }
    const absoluteTimestampMs = parseIsoTimestampMs(log.time);
    if (absoluteTimestampMs !== null) {
      latestTimestampMs = Math.max(latestTimestampMs, absoluteTimestampMs);
      continue;
    }
    const relativeSeconds = log.time ? parseSecondsFromClock(log.time) : null;
    if (relativeSeconds !== null) {
      latestTimestampMs = Math.max(
        latestTimestampMs,
        turn.startedAtMs + relativeSeconds * 1000,
      );
    }
  }
  return latestTimestampMs;
}

export function turnHasVisibleExecutionProgress(turn: RunnerTurn): boolean {
  return turn.logs.length > 0 || getTurnAssistantMessageText(turn).trim().length > 0;
}

function threadLifecycleIsTerminal(meta?: {
  threadStatus?: string | null;
  completedAtMs?: number | null;
}): boolean {
  const normalizedStatus = normalizeThreadLifecycleStatus(meta?.threadStatus);
  if (isPendingPermissionThreadLifecycleStatus(normalizedStatus)) {
    return false;
  }
  if (isRunningThreadLifecycleStatus(normalizedStatus)) {
    return false;
  }
  return (
    isTerminalThreadLifecycleStatus(meta?.threadStatus) ||
    meta?.completedAtMs != null
  );
}

export function settleHydratedTerminalThreadTurns(
  turns: RunnerTurn[],
  meta?: {
    threadStatus?: string | null;
    completedAtMs?: number | null;
  },
): RunnerTurn[] {
  if (!threadLifecycleIsTerminal(meta)) {
    return turns;
  }

  const terminalStatus = terminalTurnStatusFromThreadStatus(meta?.threadStatus);
  let changed = false;
  const nextTurns = turns.map((turn) => {
    if (turn.status !== "queued" && !isActiveTurnStatus(turn.status)) {
      return turn;
    }
    changed = true;
    return {
      ...turn,
      status: terminalStatus,
      completedAtMs:
        turn.completedAtMs ??
        meta?.completedAtMs ??
        getTurnLatestProgressTimestampMs(turn),
    };
  });
  return changed ? nextTurns : turns;
}

function hydratedThreadStatusIsRunning(meta?: {
  threadStatus?: string | null;
  completedAtMs?: number | null;
}): boolean {
  const normalizedStatus = normalizeThreadLifecycleStatus(meta?.threadStatus);
  if (isRunningThreadLifecycleStatus(normalizedStatus)) {
    return true;
  }
  if (normalizedStatus) {
    return false;
  }
  if (!meta || !("completedAtMs" in meta)) {
    return false;
  }
  return meta.completedAtMs == null;
}

function findLatestUnansweredUserTurnIndex(turns: RunnerTurn[]): number {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (
      !turn ||
      turnPresentation(turn) === "context-action-notice" ||
      !turn.prompt.trim()
    ) {
      continue;
    }
    return turn.logs.some(isTurnResponseLog) ? -1 : index;
  }
  return -1;
}

function findStaleCompletedAtRunningTurnIndex(
  turns: RunnerTurn[],
  meta?: {
    threadStatus?: string | null;
    completedAtMs?: number | null;
  },
): number {
  const completedAtMs = meta?.completedAtMs;
  const normalizedStatus = normalizeThreadLifecycleStatus(meta?.threadStatus);
  if (
    completedAtMs == null ||
    isRunningThreadLifecycleStatus(normalizedStatus) ||
    isPendingPermissionThreadLifecycleStatus(normalizedStatus)
  ) {
    return -1;
  }
  const index = findLatestUnansweredUserTurnIndex(turns);
  if (index === -1) {
    return -1;
  }
  const turn = turns[index];
  return turn && turn.startedAtMs > completedAtMs + 1000 ? index : -1;
}

export function applyHydratedRunningThreadState(
  turns: RunnerTurn[],
  meta?: {
    threadStatus?: string | null;
    completedAtMs?: number | null;
  },
): RunnerTurn[] {
  if (turns.length === 0) {
    return turns;
  }

  let batchQueueChanged = false;
  const batchQueuedTurns = turns.map((turn) => {
    if (!getTurnBatchQueueReceipt(turn) || turn.status === "queued") return turn;
    batchQueueChanged = true;
    return { ...turn, status: "queued" as const, completedAtMs: undefined };
  });
  if (batchQueueChanged) return batchQueuedTurns;

  const staleRunningIndex = findStaleCompletedAtRunningTurnIndex(turns, meta);
  const terminalSettledTurns =
    staleRunningIndex === -1 ? settleHydratedTerminalThreadTurns(turns, meta) : turns;
  if (terminalSettledTurns !== turns) {
    return terminalSettledTurns;
  }

  let activeDeepResearchIndex = -1;
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (turn && hasActiveDeepResearchLogGroup(turn.logs)) {
      activeDeepResearchIndex = index;
      break;
    }
  }
  if (
    !hydratedThreadStatusIsRunning(meta) &&
    !isPendingPermissionThreadLifecycleStatus(meta?.threadStatus) &&
    activeDeepResearchIndex === -1 &&
    staleRunningIndex === -1
  ) {
    return turns;
  }

  const targetIndex =
    activeDeepResearchIndex !== -1
      ? activeDeepResearchIndex
      : staleRunningIndex !== -1
        ? staleRunningIndex
        : turns.length - 1;
  const targetTurn = turns[targetIndex];
  if (
    !targetTurn ||
    targetTurn.status === "failed" ||
    targetTurn.status === "cancelled"
  ) {
    return turns;
  }

  const targetPermissionAsked = isPendingPermissionThreadLifecycleStatus(
    meta?.threadStatus,
  );
  if (
    targetTurn.completedAtMs == null &&
    (targetTurn.status === "running" ||
      (targetPermissionAsked && targetTurn.status === "permission_asked"))
  ) {
    return turns;
  }

  const nextTurns = turns.slice();
  nextTurns[targetIndex] = {
    ...targetTurn,
    status: targetPermissionAsked ? "permission_asked" : "running",
    completedAtMs: undefined,
  };
  return nextTurns;
}
