import { collectRunnerConnectorIdsFromStructuredEvidence } from "../../thread/message-connector-metadata.js";
import { selectRunnerThreadRunWorkingLabel } from "../../thread/selectors.js";
import type { RunnerThreadMessage, RunnerThreadProjection } from "../../thread/types.js";
import type { RunnerTurn } from "./turn-types.js";

const CONNECTOR_METADATA_KEYS = [
  "runnerConnectorIds",
  "runner_connector_ids",
  "connectorIds",
  "connector_ids",
  "connectors",
] as const;

function hasConnectorMetadata(metadata: Record<string, unknown> | null | undefined): boolean {
  if (!metadata) return false;
  return CONNECTOR_METADATA_KEYS.some((key) => {
    const value = metadata[key];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && typeof value === "object");
  });
}

function normalizeMessageContent(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isHumanMessage(message: RunnerThreadMessage, projection: RunnerThreadProjection): boolean {
  const kind = projection.participantsById[message.authorParticipantId]?.kind
    .trim()
    .toLowerCase();
  return !kind || kind === "human" || kind === "user";
}

function findCanonicalMessageForTurn(
  turn: RunnerTurn,
  projection: RunnerThreadProjection,
  humanMessages: RunnerThreadMessage[],
): RunnerThreadMessage | null {
  const sourceMessageId = String(turn.sourceMessageId || "").trim();
  if (sourceMessageId && projection.messagesById[sourceMessageId]) {
    return projection.messagesById[sourceMessageId] || null;
  }
  if (projection.messagesById[turn.id]) return projection.messagesById[turn.id] || null;

  const prompt = normalizeMessageContent(turn.prompt);
  if (!prompt) return null;
  const matchingMessages = humanMessages.filter(
    (message) => normalizeMessageContent(message.content) === prompt,
  );
  if (matchingMessages.length === 0) return null;
  if (matchingMessages.length === 1) return matchingMessages[0] || null;

  const startedAtMs = Number(turn.startedAtMs);
  if (!Number.isFinite(startedAtMs)) return null;
  const closest = matchingMessages
    .map((message) => ({ message, distance: Math.abs(Date.parse(message.createdAt) - startedAtMs) }))
    .filter(({ distance }) => Number.isFinite(distance) && distance <= 120_000)
    .sort((left, right) => left.distance - right.distance)[0];
  return closest?.message || null;
}

function metadataRunId(value: Record<string, unknown> | null | undefined): string {
  if (!value) return "";
  return String(value.runId || value.run_id || "").trim();
}

function compareRunCandidates(
  leftId: string,
  rightId: string,
  projection: RunnerThreadProjection,
): number {
  const left = projection.runsById[leftId];
  const right = projection.runsById[rightId];
  const leftWorker = left?.runKind === "worker" ? 1 : 0;
  const rightWorker = right?.runKind === "worker" ? 1 : 0;
  if (leftWorker !== rightWorker) return rightWorker - leftWorker;
  return (right?.sequence || 0) - (left?.sequence || 0);
}

/**
 * Resolves legacy transcript turns to canonical runs without relying on display
 * text. Persisted message links win, with structured legacy IDs and source
 * message references retained as compatibility fallbacks.
 */
export function buildRunnerTurnRunIdIndex(
  turns: readonly RunnerTurn[],
  projection: RunnerThreadProjection,
): ReadonlyMap<string, string> {
  if (turns.length === 0) return new Map();
  const humanMessages = Object.values(projection.messagesById).filter((message) =>
    isHumanMessage(message, projection),
  );
  const runs = Object.values(projection.runsById);
  const runIdByTurnId = new Map<string, string>();
  const claimedRunIds = new Set<string>();

  for (const turn of turns) {
    const message = findCanonicalMessageForTurn(turn, projection, humanMessages);
    const sourceMessageIds = new Set(
      [
        turn.sourceMessageId,
        turn.id,
        message?.id,
        message?.sourceMessageId,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    );
    const candidateIds = new Set<string>();

    for (const runId of message?.linkedRunIds || []) {
      if (projection.runsById[runId]) candidateIds.add(runId);
    }
    const turnRunId = metadataRunId(turn.messageMetadata);
    if (projection.runsById[turnRunId]) candidateIds.add(turnRunId);
    for (const log of turn.logs) {
      const logRunId = metadataRunId(log.metadata as Record<string, unknown> | null | undefined);
      if (projection.runsById[logRunId]) candidateIds.add(logRunId);
    }
    for (const run of runs) {
      const runSourceMessageIds = [
        run.sourceMessageId,
        run.origin?.sourceMessageId,
        run.origin?.kind === "message" ? run.origin.id : null,
      ]
        .map((value) => String(value || "").trim())
        .filter(Boolean);
      if (runSourceMessageIds.some((id) => sourceMessageIds.has(id))) {
        candidateIds.add(run.id);
      }
    }

    const selectedRunId = [...candidateIds]
      .sort((left, right) => compareRunCandidates(left, right, projection))[0];
    if (selectedRunId) {
      runIdByTurnId.set(turn.id, selectedRunId);
      claimedRunIds.add(selectedRunId);
    }
  }

  const unresolvedRunningTurns = turns.filter(
    (turn) => turn.status === "running" && !runIdByTurnId.has(turn.id),
  );
  const unclaimedRunningWorkerRuns = runs.filter(
    (run) =>
      run.runKind === "worker" &&
      ["queued", "pending", "running", "parked", "waiting", "waiting_permission", "requires_action"].includes(run.status) &&
      !claimedRunIds.has(run.id),
  );
  if (unresolvedRunningTurns.length === 1 && unclaimedRunningWorkerRuns.length === 1) {
    const unresolvedTurn = unresolvedRunningTurns[0];
    const unclaimedRun = unclaimedRunningWorkerRuns[0];
    if (unresolvedTurn && unclaimedRun) {
      runIdByTurnId.set(unresolvedTurn.id, unclaimedRun.id);
    }
  }

  return runIdByTurnId;
}

/** Returns observer-owned live status text for each bridged legacy turn. */
export function buildRunnerTurnWorkingLabelIndex(
  turns: readonly RunnerTurn[],
  projection: RunnerThreadProjection,
): ReadonlyMap<string, string> {
  const runIdByTurnId = buildRunnerTurnRunIdIndex(turns, projection);
  const labelByTurnId = new Map<string, string>();
  for (const [turnId, runId] of runIdByTurnId) {
    const label = selectRunnerThreadRunWorkingLabel(projection, runId);
    if (label) labelByTurnId.set(turnId, label);
  }
  return labelByTurnId;
}

/**
 * Bridges canonical message metadata into the legacy transcript surface. The
 * platform intentionally keeps legacy chat presentation while using the v2
 * timeline for Activity, so both surfaces must share the persisted message
 * identity instead of maintaining separate connector rendering paths.
 */
export function buildRunnerTurnMessageMetadataIndex(
  turns: readonly RunnerTurn[],
  projection: RunnerThreadProjection,
): ReadonlyMap<string, Record<string, unknown>> {
  if (turns.length === 0) return new Map();
  const humanMessages = Object.values(projection.messagesById).filter((message) =>
    isHumanMessage(message, projection),
  );

  const metadataByTurnId = new Map<string, Record<string, unknown>>();
  for (const turn of turns) {
    if (hasConnectorMetadata(turn.messageMetadata)) continue;
    const message = findCanonicalMessageForTurn(turn, projection, humanMessages);
    const messageMetadata = message?.metadata || null;
    if (hasConnectorMetadata(messageMetadata)) {
      metadataByTurnId.set(turn.id, {
        ...messageMetadata,
        ...(turn.messageMetadata || {}),
      });
      continue;
    }

    // Long historical runs can push their source message outside the first
    // canonical timeline page. Legacy hydration still scopes structured tool
    // logs to the correct turn, so recover from those records without reading
    // either user or assistant prose.
    const connectorIds = new Set<string>();
    for (const log of turn.logs) {
      collectRunnerConnectorIdsFromStructuredEvidence(
        { eventType: log.eventType, metadata: log.metadata },
        connectorIds,
      );
    }
    if (connectorIds.size === 0) continue;
    metadataByTurnId.set(turn.id, {
      ...(turn.messageMetadata || {}),
      runnerConnectorIds: Array.from(connectorIds),
      connectorMetadataSource: "structured_turn_evidence",
    });
  }
  return metadataByTurnId;
}
