import type { RunnerThreadMessage, RunnerThreadProjection } from "./types.js";

const CONNECTOR_IDS_METADATA_KEY = "runnerConnectorIds";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeConnectorId(value: unknown): string {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^(?:mcp__)?connector[_:-]+/, "")
    .replace(/^integration[_:-]+/, "");
  return /^[a-z0-9][a-z0-9_-]*$/.test(normalized) ? normalized : "";
}

function connectorIdFromServerName(value: unknown): string {
  const serverName = String(value || "")
    .trim()
    .toLowerCase();
  if (!/^(?:mcp__)?connector[_:-]+/.test(serverName)) return "";
  return normalizeConnectorId(serverName);
}

function connectorIdFromToolName(value: unknown): string {
  const toolName = String(value || "")
    .trim()
    .toLowerCase();
  const match = /^mcp__connector_(.+?)__/.exec(toolName);
  return normalizeConnectorId(match?.[1]);
}

function addConnectorId(target: Set<string>, value: unknown): void {
  const connectorId = normalizeConnectorId(value);
  if (connectorId) target.add(connectorId);
}

function addConnectorIds(target: Set<string>, value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) addConnectorId(target, item);
    return;
  }
  addConnectorId(target, value);
}

function addConnectorPayloadIds(target: Set<string>, value: unknown): void {
  if (!isRecord(value)) return;
  for (const [connectorId, configuration] of Object.entries(value)) {
    if (isRecord(configuration) && configuration.enabled === false) continue;
    addConnectorId(target, connectorId);
  }
}

function normalizedFieldName(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

/**
 * Reads connector identity only from explicit structured fields. User-visible
 * prose is deliberately ignored so a message mentioning a provider cannot
 * manufacture a connector chip.
 */
export function collectRunnerConnectorIdsFromStructuredEvidence(
  value: unknown,
  target = new Set<string>(),
  depth = 0,
): Set<string> {
  if (depth > 8 || !isRecord(value)) return target;

  for (const [rawKey, fieldValue] of Object.entries(value)) {
    const key = normalizedFieldName(rawKey);
    if (
      [
        "runnerconnectorids",
        "connectorids",
        "selectedconnectorids",
        "authorizedconnectorids",
      ].includes(key)
    ) {
      addConnectorIds(target, fieldValue);
    } else if (["connectorid", "integrationid"].includes(key)) {
      addConnectorId(target, fieldValue);
    } else if (["servername", "mcpservername", "connectorservername"].includes(key)) {
      const connectorId = connectorIdFromServerName(fieldValue);
      if (connectorId) target.add(connectorId);
    } else if (["toolname", "mcptoolname"].includes(key)) {
      const connectorId = connectorIdFromToolName(fieldValue);
      if (connectorId) target.add(connectorId);
    } else if (key === "connectors") {
      addConnectorPayloadIds(target, fieldValue);
    }

    if (isRecord(fieldValue)) {
      collectRunnerConnectorIdsFromStructuredEvidence(fieldValue, target, depth + 1);
    } else if (Array.isArray(fieldValue)) {
      for (const item of fieldValue) {
        if (isRecord(item))
          collectRunnerConnectorIdsFromStructuredEvidence(item, target, depth + 1);
      }
    }
  }

  return target;
}

function directMessageConnectorIds(message: RunnerThreadMessage): string[] {
  return directConnectorIdsFromMetadata(message.metadata);
}

function directConnectorIdsFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string[] {
  if (!metadata) return [];
  const connectorIds = new Set<string>();
  addConnectorIds(
    connectorIds,
    metadata[CONNECTOR_IDS_METADATA_KEY] ??
      metadata.runner_connector_ids ??
      metadata.connectorIds ??
      metadata.connector_ids,
  );
  addConnectorPayloadIds(connectorIds, metadata.connectors);
  return Array.from(connectorIds);
}

/**
 * Adds connector IDs recovered from structured execution records to message
 * metadata. Directly persisted message metadata remains authoritative.
 */
export function enrichRunnerMessageConnectorMetadataFromStructuredEvidence(
  metadata: Record<string, unknown> | null | undefined,
  evidence: readonly unknown[],
  source = "structured_turn_evidence",
): Record<string, unknown> | null {
  if (directConnectorIdsFromMetadata(metadata).length > 0) {
    return metadata || null;
  }

  const connectorIds = new Set<string>();
  for (const value of evidence) {
    collectRunnerConnectorIdsFromStructuredEvidence(value, connectorIds);
  }
  if (connectorIds.size === 0) return metadata || null;

  return {
    ...(metadata || {}),
    [CONNECTOR_IDS_METADATA_KEY]: Array.from(connectorIds),
    connectorMetadataSource: source,
  };
}

function addRunConnectorEvidence(
  connectorIdsByRun: Map<string, Set<string>>,
  runId: string | null | undefined,
  ...evidence: unknown[]
): void {
  if (!runId) return;
  const connectorIds = connectorIdsByRun.get(runId) || new Set<string>();
  for (const value of evidence)
    collectRunnerConnectorIdsFromStructuredEvidence(value, connectorIds);
  if (connectorIds.size > 0) connectorIdsByRun.set(runId, connectorIds);
}

function addMessageRunLink(
  runIdsByMessage: Map<string, Set<string>>,
  messageId: string | null | undefined,
  runId: string | null | undefined,
): void {
  if (!messageId || !runId) return;
  const runIds = runIdsByMessage.get(messageId) || new Set<string>();
  runIds.add(runId);
  runIdsByMessage.set(messageId, runIds);
}

/**
 * Restores connector chips for historical messages whose original metadata was
 * not persisted. Evidence is scoped through the message's run, preventing a
 * connector used by another turn from leaking into this message.
 */
export function enrichRunnerThreadMessageConnectorMetadata(
  projection: RunnerThreadProjection,
): RunnerThreadProjection {
  const connectorIdsByRun = new Map<string, Set<string>>();
  const runIdsByMessage = new Map<string, Set<string>>();
  const sourceMessageIds = new Set<string>();

  for (const message of Object.values(projection.messagesById)) {
    for (const runId of message.linkedRunIds || [])
      addMessageRunLink(runIdsByMessage, message.id, runId);
  }

  for (const run of Object.values(projection.runsById)) {
    const sourceMessageId = run.sourceMessageId || run.origin.sourceMessageId || null;
    if (sourceMessageId) sourceMessageIds.add(sourceMessageId);
    addMessageRunLink(runIdsByMessage, sourceMessageId, run.id);
    addRunConnectorEvidence(
      connectorIdsByRun,
      run.id,
      run.metadata,
      run.origin.metadata,
      run.projection?.metadata,
    );
  }

  for (const receipt of Object.values(projection.routingReceiptsById)) {
    addMessageRunLink(runIdsByMessage, receipt.messageId, receipt.runId);
    addRunConnectorEvidence(connectorIdsByRun, receipt.runId, receipt.metadata);
  }

  for (const event of Object.values(projection.eventsById)) {
    addRunConnectorEvidence(connectorIdsByRun, event.runId, event.payload);
  }

  for (const action of Object.values(projection.actionsById)) {
    addRunConnectorEvidence(connectorIdsByRun, action.runId, {
      toolName: action.toolName,
      metadata: action.metadata,
    });
  }

  let messagesById = projection.messagesById;
  for (const message of Object.values(projection.messagesById)) {
    if (directMessageConnectorIds(message).length > 0) continue;
    const participantKind =
      projection.participantsById[message.authorParticipantId]?.kind.toLowerCase();
    if (
      participantKind &&
      participantKind !== "human" &&
      participantKind !== "user" &&
      !sourceMessageIds.has(message.id)
    )
      continue;

    const connectorIds = new Set<string>();
    for (const runId of runIdsByMessage.get(message.id) || []) {
      for (const connectorId of connectorIdsByRun.get(runId) || []) connectorIds.add(connectorId);
    }
    if (connectorIds.size === 0) continue;

    if (messagesById === projection.messagesById) messagesById = { ...projection.messagesById };
    messagesById[message.id] = {
      ...message,
      metadata: {
        ...(message.metadata || {}),
        [CONNECTOR_IDS_METADATA_KEY]: Array.from(connectorIds),
        connectorMetadataSource: "structured_run_evidence",
      },
    };
  }

  return messagesById === projection.messagesById ? projection : { ...projection, messagesById };
}
