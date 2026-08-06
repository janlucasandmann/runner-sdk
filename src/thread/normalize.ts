import type {
  RunnerThreadAction,
  RunnerThreadActionResource,
  RunnerThreadActivityGroup,
  RunnerThreadEvent,
  RunnerThreadEventPage,
  RunnerThreadMessage,
  RunnerThreadParticipant,
  RunnerThreadPermissionRequest,
  RunnerThreadPermissionRing,
  RunnerThreadProjection,
  RunnerThreadRoutingReceipt,
  RunnerThreadRun,
  RunnerThreadRunOrigin,
  RunnerThreadTimelineItem,
  RunnerThreadTimelinePage,
  RunnerThreadTimelineReference,
} from "./types.js";

const EPOCH_ISO = "1970-01-01T00:00:00.000Z";

type UnknownRecord = Record<string, unknown>;

export interface RunnerThreadNormalizationDefaults {
  threadId?: string;
  runId?: string | null;
  sequence?: number;
  createdAt?: string;
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function firstValue(record: UnknownRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function firstRecord(record: UnknownRecord, keys: string[]): UnknownRecord {
  const value = firstValue(record, keys);
  return asRecord(value);
}

function firstString(record: UnknownRecord, keys: string[], fallback = ""): string {
  const value = firstValue(record, keys);
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function firstNullableString(record: UnknownRecord, keys: string[]): string | null {
  const value = firstString(record, keys);
  return value || null;
}

function firstNumber(record: UnknownRecord, keys: string[], fallback = 0): number {
  const value = firstValue(record, keys);
  const numeric = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
  return Number.isFinite(numeric) ? numeric : fallback;
}

function firstBoolean(record: UnknownRecord, keys: string[], fallback = false): boolean {
  const value = firstValue(record, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => String(item || "").trim()).filter(Boolean)));
}

function finiteSequence(record: UnknownRecord, defaults: RunnerThreadNormalizationDefaults): number {
  return Math.max(0, Math.trunc(firstNumber(record, ["sequence", "seq", "eventSequence", "event_sequence"], defaults.sequence ?? 0)));
}

function dateString(record: UnknownRecord, keys: string[], fallback?: string): string {
  const value = firstString(record, keys, fallback || "");
  return value || fallback || EPOCH_ISO;
}

function nullableDateString(record: UnknownRecord, keys: string[]): string | null {
  return firstNullableString(record, keys);
}

function threadIdFor(record: UnknownRecord, defaults: RunnerThreadNormalizationDefaults): string {
  return firstString(record, ["threadId", "thread_id"], defaults.threadId || "");
}

function runIdFor(record: UnknownRecord, defaults: RunnerThreadNormalizationDefaults): string | null {
  return firstNullableString(record, ["runId", "run_id"]) ?? defaults.runId ?? null;
}

function normalizePermissionRing(value: unknown): RunnerThreadPermissionRing | null {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(/\D+/g, "")) : Number.NaN;
  return numeric === 1 || numeric === 2 || numeric === 3 ? numeric : null;
}

function permissionRingFor(record: UnknownRecord): RunnerThreadPermissionRing | null {
  const metadata = asRecord(record.metadata);
  return normalizePermissionRing(firstValue(record, ["permissionRing", "permission_ring", "highestPermissionRing", "highest_permission_ring", "highestRing", "highest_ring", "ringId", "ring_id", "ring"]))
    ?? normalizePermissionRing(firstValue(metadata, ["permissionRing", "permission_ring", "highestPermissionRing", "highest_permission_ring", "highestRing", "highest_ring", "ringId", "ring_id", "ring"]));
}

function normalizedMetadata(record: UnknownRecord): Record<string, unknown> | null {
  const metadata = firstValue(record, [
    "metadata",
    "messageMetadata",
    "message_metadata",
    "logMetadata",
    "log_metadata",
  ]);
  return isRecord(metadata) ? metadata : null;
}

function requiredId(record: UnknownRecord, prefixes: string[], fallbackPrefix: string, defaults: RunnerThreadNormalizationDefaults): string {
  const direct = firstString(record, prefixes);
  if (direct) return direct;
  return `${fallbackPrefix}:${threadIdFor(record, defaults) || "unknown"}:${finiteSequence(record, defaults)}`;
}

function normalizeResource(value: unknown): RunnerThreadActionResource | null {
  if (typeof value === "string") {
    const pathOrUrl = value.trim();
    if (!pathOrUrl) return null;
    return /^https?:\/\//i.test(pathOrUrl) ? { url: pathOrUrl } : { path: pathOrUrl };
  }
  if (!isRecord(value)) return null;
  return {
    kind: firstNullableString(value, ["kind", "type"]),
    id: firstNullableString(value, ["id", "resourceId", "resource_id"]),
    label: firstNullableString(value, ["label", "name", "title"]),
    path: firstNullableString(value, ["path", "filePath", "file_path"]),
    url: firstNullableString(value, ["url", "uri"]),
    metadata: normalizedMetadata(value),
  };
}

export function normalizeRunnerThreadParticipant(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadParticipant {
  const record = asRecord(raw);
  const kind = firstString(record, ["participantKind", "participant_kind", "kind", "role"], "human");
  const id = requiredId(record, ["id", "participantId", "participant_id"], "participant", defaults);
  return {
    id,
    threadId: firstNullableString(record, ["threadId", "thread_id"]) ?? defaults.threadId ?? null,
    kind,
    displayName: firstString(record, ["displayName", "display_name", "name", "label"], kind),
    userId: firstNullableString(record, ["userId", "user_id"]),
    agentId: firstNullableString(record, ["agentId", "agent_id"]),
    avatarUrl: firstNullableString(record, [
      "avatarUrl",
      "avatar_url",
      "photoUrl",
      "photo_url",
      "profileImageUrl",
      "profile_image_url",
      "agentAvatarUrl",
      "agent_avatar_url",
      "picture",
    ]),
    active: record.active === undefined ? undefined : firstBoolean(record, ["active"]),
    capabilities: stringArray(record.capabilities),
    metadata: normalizedMetadata(record),
    createdAt: nullableDateString(record, ["createdAt", "created_at"]),
    updatedAt: nullableDateString(record, ["updatedAt", "updated_at"]),
  };
}

export function normalizeRunnerThreadMessage(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadMessage {
  const record = asRecord(raw);
  const createdAt = dateString(record, ["createdAt", "created_at", "occurredAt", "occurred_at"], defaults.createdAt);
  const linkedRunIds = stringArray(firstValue(record, ["linkedRunIds", "linked_run_ids", "runIds", "run_ids"]));
  const eventRunId = runIdFor(record, defaults);
  if (eventRunId && !linkedRunIds.includes(eventRunId)) linkedRunIds.push(eventRunId);
  return {
    kind: "message",
    id: requiredId(record, ["id", "messageId", "message_id"], "message", defaults),
    threadId: threadIdFor(record, defaults),
    sequence: finiteSequence(record, defaults),
    authorParticipantId: firstString(record, ["authorParticipantId", "author_participant_id", "participantId", "participant_id", "authorId", "author_id"]),
    content: firstString(record, ["content", "message", "text", "body"]),
    modality: firstString(record, ["modality", "channel"], "text"),
    status: firstString(record, ["status"], "accepted"),
    intendedRoute: firstNullableString(record, ["intendedRoute", "intended_route", "route", "recipientKind", "recipient_kind"]),
    intendedRecipientId: firstNullableString(record, ["intendedRecipientId", "intended_recipient_id", "recipientParticipantId", "recipient_participant_id"]),
    deliveryMode: (firstNullableString(record, ["deliveryMode", "delivery_mode"]) as RunnerThreadMessage["deliveryMode"]),
    replyToMessageId: firstNullableString(record, ["replyToMessageId", "reply_to_message_id"]),
    replyToRunId: firstNullableString(record, ["replyToRunId", "reply_to_run_id"]),
    sourceMessageId: firstNullableString(record, ["sourceMessageId", "source_message_id"]),
    linkedRunIds,
    routingReceiptId: firstNullableString(record, ["routingReceiptId", "routing_receipt_id"]),
    metadata: normalizedMetadata(record),
    createdAt,
    updatedAt: nullableDateString(record, ["updatedAt", "updated_at"]),
  };
}

function normalizeRunOrigin(record: UnknownRecord): RunnerThreadRunOrigin {
  const origin = firstRecord(record, ["origin", "trigger"]);
  const rawTrigger = firstValue(record, ["trigger"]);
  const triggerMessageId = firstNullableString(record, ["triggerMessageId", "trigger_message_id", "sourceMessageId", "source_message_id"]);
  const kind = firstString(
    origin,
    ["kind", "type", "triggerType", "trigger_type"],
    firstString(record, ["initiatedByType", "initiated_by_type"], typeof rawTrigger === "string" ? rawTrigger : triggerMessageId ? "message" : "system"),
  );
  return {
    kind,
    id: firstNullableString(origin, ["id", "originId", "origin_id", "triggerId", "trigger_id"])
      ?? firstNullableString(record, ["initiatedById", "initiated_by_id"]),
    label: firstNullableString(origin, ["label", "name", "title"]),
    sourceThreadId: firstNullableString(origin, ["sourceThreadId", "source_thread_id", "threadId", "thread_id"]),
    sourceMessageId: firstNullableString(origin, ["sourceMessageId", "source_message_id", "messageId", "message_id"]) ?? triggerMessageId,
    scheduleId: firstNullableString(origin, ["scheduleId", "schedule_id"]),
    scheduleOccurrenceId: firstNullableString(origin, ["scheduleOccurrenceId", "schedule_occurrence_id", "occurrenceId", "occurrence_id"]),
    workflowId: firstNullableString(origin, ["workflowId", "workflow_id", "metronomeId", "metronome_id"]),
    workflowRunId: firstNullableString(origin, ["workflowRunId", "workflow_run_id", "metronomeRunId", "metronome_run_id"]),
    triggerType: firstNullableString(origin, ["triggerType", "trigger_type", "type"]),
    metadata: normalizedMetadata(origin),
  };
}

export function normalizeRunnerThreadRun(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadRun {
  const record = asRecord(raw);
  const rawKind = firstString(record, ["runKind", "run_kind", "kind", "type"], "worker");
  const runKind = rawKind === "run" ? firstString(record, ["type"], "worker") : rawKind;
  const nestedLeaseRecord = firstRecord(record, ["lease", "communicatorLease", "communicator_lease"]);
  const flatLeaseRecord = {
    ownerId: firstValue(record, ["leaseOwner", "lease_owner"]),
    expiresAt: firstValue(record, ["leaseExpiresAt", "lease_expires_at"]),
    heartbeatAt: firstValue(record, ["heartbeatAt", "heartbeat_at"]),
  };
  const leaseRecord = Object.keys(nestedLeaseRecord).length > 0
    ? nestedLeaseRecord
    : Object.values(flatLeaseRecord).some((value) => value !== undefined && value !== null)
      ? flatLeaseRecord
      : {};
  const projectionRecord = firstRecord(record, ["projection", "runProjection", "run_projection"]);
  const nestedProjectionCounters = firstRecord(projectionRecord, ["counters", "counts"]);
  const projectionCounters = Object.keys(nestedProjectionCounters).length > 0 ? nestedProjectionCounters : projectionRecord;
  const id = requiredId(record, ["id", "runId", "run_id"], "run", defaults);
  const threadId = threadIdFor(record, defaults);
  const sequence = finiteSequence(record, defaults);
  const status = firstString(record, ["status", "state"], "queued");
  const currentSummary = firstNullableString(record, ["currentSummary", "current_summary", "liveSummary", "live_summary"]);
  const updatedAt = nullableDateString(record, ["updatedAt", "updated_at"]);
  const hasProjection = Object.keys(projectionRecord).length > 0
    || currentSummary !== null
    || firstValue(record, ["phase", "freshnessSequence", "freshness_sequence"]) !== undefined;
  return {
    kind: "run",
    id,
    threadId,
    sequence,
    runKind,
    status,
    actorParticipantId: firstNullableString(record, ["actorParticipantId", "actor_participant_id", "participantId", "participant_id"]),
    parentRunId: firstNullableString(record, ["parentRunId", "parent_run_id"]),
    sourceMessageId: firstNullableString(record, ["sourceMessageId", "source_message_id", "messageId", "message_id", "triggerMessageId", "trigger_message_id"]),
    title: firstNullableString(record, ["title", "name"]),
    summary: firstNullableString(record, ["summary", "finalSummary", "final_summary"]),
    currentSummary,
    origin: normalizeRunOrigin(record),
    highestPermissionRing: permissionRingFor(record),
    actionGroupIds: stringArray(firstValue(record, ["actionGroupIds", "action_group_ids", "activityGroupIds", "activity_group_ids"])),
    lease: Object.keys(leaseRecord).length > 0 ? {
      ownerId: firstNullableString(leaseRecord, ["ownerId", "owner_id"]),
      ownerType: firstNullableString(leaseRecord, ["ownerType", "owner_type"]),
      acquiredAt: nullableDateString(leaseRecord, ["acquiredAt", "acquired_at"]),
      expiresAt: nullableDateString(leaseRecord, ["expiresAt", "expires_at"]),
      heartbeatAt: nullableDateString(leaseRecord, ["heartbeatAt", "heartbeat_at"]),
      metadata: normalizedMetadata(leaseRecord),
    } : null,
    projection: hasProjection ? {
      runId: firstString(projectionRecord, ["runId", "run_id"], id),
      threadId: firstString(projectionRecord, ["threadId", "thread_id"], threadId),
      sequence: Math.max(0, Math.trunc(firstNumber(projectionRecord, ["sequence"], sequence))),
      status: firstString(projectionRecord, ["status"], status),
      phase: firstNullableString(projectionRecord, ["phase"]),
      summary: firstString(projectionRecord, ["summary", "currentSummary", "current_summary"], currentSummary || ""),
      freshnessSequence: firstValue(projectionRecord, ["freshnessSequence", "freshness_sequence", "lastEventSequence", "last_event_sequence"]) === undefined
        ? null
        : Math.max(0, Math.trunc(firstNumber(projectionRecord, ["freshnessSequence", "freshness_sequence", "lastEventSequence", "last_event_sequence"], sequence))),
      freshnessAt: nullableDateString(projectionRecord, ["freshnessAt", "freshness_at"]),
      highestPermissionRing: permissionRingFor(projectionRecord) || permissionRingFor(record),
      counters: Object.keys(projectionCounters).length > 0 ? {
        activityGroupCount: firstNumber(projectionCounters, ["activityGroupCount", "activity_group_count"], 0),
        actionCount: firstNumber(projectionCounters, ["actionCount", "action_count"], 0),
        changeCount: firstNumber(projectionCounters, ["changeCount", "change_count"], 0),
        pendingPermissionCount: firstNumber(projectionCounters, ["pendingPermissionCount", "pending_permission_count"], 0),
        childRunCount: firstNumber(projectionCounters, ["childRunCount", "child_run_count"], 0),
      } : null,
      observerStatus: firstNullableString(projectionRecord, ["observerStatus", "observer_status"]),
      observerRevision: firstValue(projectionRecord, ["observerRevision", "observer_revision"]) === undefined
        ? null
        : Math.max(0, Math.trunc(firstNumber(projectionRecord, ["observerRevision", "observer_revision"], 0))),
      observerModel: firstNullableString(projectionRecord, ["observerModel", "observer_model", "model"]),
      metadata: normalizedMetadata(projectionRecord),
      updatedAt: dateString(projectionRecord, ["updatedAt", "updated_at", "freshnessAt", "freshness_at"], updatedAt || defaults.createdAt),
    } : null,
    metadata: {
      ...(normalizedMetadata(record) || {}),
      ...(firstValue(record, ["ordinal"]) !== undefined ? { ordinal: firstNumber(record, ["ordinal"], 0) } : {}),
      ...(firstValue(record, ["depth"]) !== undefined ? { depth: firstNumber(record, ["depth"], 0) } : {}),
      ...(firstValue(record, ["observerStatus", "observer_status"]) !== undefined
        ? { observerStatus: firstString(record, ["observerStatus", "observer_status"]) }
        : {}),
    },
    queuedAt: nullableDateString(record, ["queuedAt", "queued_at"]),
    startedAt: nullableDateString(record, ["startedAt", "started_at"]),
    parkedAt: nullableDateString(record, ["parkedAt", "parked_at"]),
    completedAt: nullableDateString(record, ["completedAt", "completed_at", "finishedAt", "finished_at"]),
    createdAt: dateString(record, ["createdAt", "created_at", "startedAt", "started_at"], defaults.createdAt),
    updatedAt,
  };
}

export function normalizeRunnerThreadEvent(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadEvent {
  const record = asRecord(raw);
  const producerRecord = firstRecord(record, ["producer"]);
  const payload = firstRecord(record, ["payload", "data"]);
  const occurredAt = dateString(record, ["occurredAt", "occurred_at", "timestamp", "createdAt", "created_at"], defaults.createdAt);
  const threadId = threadIdFor(record, defaults);
  const producerType = firstString(producerRecord, ["type", "kind"], firstString(record, ["producerType", "producer_type"], "system"));
  const producerId = firstNullableString(producerRecord, ["id"]) ?? firstNullableString(record, ["producerId", "producer_id"]);
  const explicitActorParticipantId = firstNullableString(record, ["actorParticipantId", "actor_participant_id"]);
  const producerParticipantId = firstNullableString(producerRecord, ["participantId", "participant_id"])
    ?? firstNullableString(record, ["producerParticipantId", "producer_participant_id"])
    ?? explicitActorParticipantId
    ?? (threadId ? compatibilityParticipantId(threadId, compatibilityParticipantKind(producerType), producerId || "") : null);
  return {
    kind: "event",
    id: requiredId(record, ["id", "eventId", "event_id"], "event", defaults),
    threadId,
    runId: runIdFor(record, defaults),
    sequence: finiteSequence(record, defaults),
    type: firstString(record, ["type", "eventType", "event_type"], "thread.event"),
    producer: {
      type: producerType,
      id: producerId,
      participantId: producerParticipantId,
    },
    actorParticipantId: explicitActorParticipantId ?? producerParticipantId,
    visibility: firstString(record, ["visibility"], "user"),
    payloadVersion: Math.max(1, Math.trunc(firstNumber(record, ["payloadVersion", "payload_version"], 1))),
    causationId: firstNullableString(record, ["causationId", "causation_id"]),
    correlationId: firstNullableString(record, ["correlationId", "correlation_id"]),
    title: firstNullableString(record, ["title", "label"]),
    summary: firstNullableString(record, ["summary", "message"]),
    permissionRing: permissionRingFor(record),
    policyDecision: firstNullableString(record, ["policyDecision", "policy_decision"]),
    snapshotBeforeId: firstNullableString(record, ["snapshotBeforeId", "snapshot_before_id"]),
    snapshotAfterId: firstNullableString(record, ["snapshotAfterId", "snapshot_after_id"]),
    payload,
    occurredAt,
    createdAt: dateString(record, ["createdAt", "created_at", "occurredAt", "occurred_at"], occurredAt),
  };
}

export function normalizeRunnerThreadAction(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadAction {
  const record = asRecord(raw);
  const resources = firstValue(record, ["touchedResources", "touched_resources", "resources"]);
  return {
    kind: "action",
    id: requiredId(record, ["id", "actionId", "action_id"], "action", defaults),
    threadId: threadIdFor(record, defaults),
    runId: runIdFor(record, defaults) || "",
    sequence: finiteSequence(record, defaults),
    activityGroupId: firstNullableString(record, ["activityGroupId", "activity_group_id", "groupId", "group_id"]),
    sourceEventId: firstNullableString(record, ["sourceEventId", "source_event_id", "eventId", "event_id"]),
    actorParticipantId: firstNullableString(record, ["actorParticipantId", "actor_participant_id"]),
    type: firstString(record, ["type", "actionType", "action_type", "eventType", "event_type"], "action"),
    title: firstString(record, ["title", "label", "name"], "Action"),
    summary: firstNullableString(record, ["summary", "message", "description"]),
    status: firstString(record, ["status", "state"], "completed"),
    toolName: firstNullableString(record, ["toolName", "tool_name", "tool"]),
    input: firstValue(record, ["input", "args", "arguments"]),
    output: firstValue(record, ["output", "result"]),
    permissionRing: permissionRingFor(record),
    policyDecision: firstNullableString(record, ["policyDecision", "policy_decision"]),
    touchedResources: Array.isArray(resources) ? resources.map(normalizeResource).filter((item): item is RunnerThreadActionResource => Boolean(item)) : [],
    snapshotBeforeId: firstNullableString(record, ["snapshotBeforeId", "snapshot_before_id"]),
    snapshotAfterId: firstNullableString(record, ["snapshotAfterId", "snapshot_after_id"]),
    metadata: normalizedMetadata(record),
    startedAt: nullableDateString(record, ["startedAt", "started_at"]),
    completedAt: nullableDateString(record, ["completedAt", "completed_at", "finishedAt", "finished_at"]),
    createdAt: dateString(record, ["createdAt", "created_at", "startedAt", "started_at"], defaults.createdAt),
    updatedAt: nullableDateString(record, ["updatedAt", "updated_at"]),
  };
}

function normalizeActivityGroupStatus(value: string, endSequence: number | null): string {
  const normalized = value.trim().toLowerCase();
  if (normalized === "pending" || normalized === "active" || normalized === "running") return "open";
  if (normalized === "completed" || normalized === "complete" || normalized === "done") return "sealed";
  return normalized || (endSequence === null ? "open" : "sealed");
}

export function normalizeRunnerThreadActivityGroup(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadActivityGroup {
  const record = asRecord(raw);
  const nestedMetrics = firstRecord(record, ["metrics", "usage"]);
  const metrics = Object.keys(nestedMetrics).length > 0 ? nestedMetrics : record;
  const startSequence = Math.max(0, Math.trunc(firstNumber(record, ["startSequence", "start_sequence", "sequence"], defaults.sequence ?? 0)));
  const endSequenceValue = firstValue(record, ["endSequence", "end_sequence"]);
  const endSequence = endSequenceValue === null || endSequenceValue === undefined
    ? null
    : Math.max(startSequence, Math.trunc(firstNumber(record, ["endSequence", "end_sequence"], startSequence)));
  return {
    kind: "activity_group",
    id: requiredId(record, ["id", "activityGroupId", "activity_group_id", "groupId", "group_id"], "activity-group", defaults),
    threadId: threadIdFor(record, defaults),
    runId: runIdFor(record, defaults) || "",
    sequence: finiteSequence(record, { ...defaults, sequence: startSequence }),
    version: Math.max(1, Math.trunc(firstNumber(record, ["version", "revision"], 1))),
    status: normalizeActivityGroupStatus(firstString(record, ["status", "state"]), endSequence),
    title: firstString(record, ["title", "label", "name"], "Work"),
    liveSummary: firstString(record, ["liveSummary", "live_summary", "summary", "description"]),
    rationale: firstNullableString(record, ["rationale", "reason", "why"]),
    parentGroupId: firstNullableString(record, ["parentGroupId", "parent_group_id"]),
    childGroupIds: stringArray(firstValue(record, ["childGroupIds", "child_group_ids"])),
    actionIds: stringArray(firstValue(record, ["actionIds", "action_ids"])),
    eventIds: stringArray(firstValue(record, ["eventIds", "event_ids", "evidenceEventIds", "evidence_event_ids"])),
    startSequence,
    endSequence,
    highestPermissionRing: permissionRingFor(record),
    supersedesGroupId: firstNullableString(record, ["supersedesGroupId", "supersedes_group_id"]),
    supersededByGroupId: firstNullableString(record, ["supersededByGroupId", "superseded_by_group_id", "supersededById", "superseded_by_id"]),
    observerModel: firstNullableString(record, ["observerModel", "observer_model", "model"]),
    metrics: Object.keys(metrics).length > 0 ? {
      actionCount: firstNumber(metrics, ["actionCount", "action_count"], 0),
      durationMs: firstNumber(metrics, ["durationMs", "duration_ms"], 0),
      inputTokens: firstNumber(metrics, ["inputTokens", "input_tokens"], 0),
      outputTokens: firstNumber(metrics, ["outputTokens", "output_tokens"], 0),
      costUsd: firstNumber(metrics, ["costUsd", "cost_usd"], 0),
      costCt: firstNumber(metrics, ["costCt", "cost_ct", "costCT"], 0),
    } : null,
    metadata: {
      ...(normalizedMetadata(record) || {}),
      ...(firstValue(record, ["ordinal"]) !== undefined ? { ordinal: firstNumber(record, ["ordinal"], 0) } : {}),
      ...(firstValue(record, ["depth"]) !== undefined ? { depth: firstNumber(record, ["depth"], 0) } : {}),
      ...(firstValue(record, ["observerStatus", "observer_status"]) !== undefined
        ? { observerStatus: firstString(record, ["observerStatus", "observer_status"]) }
        : {}),
    },
    createdAt: dateString(record, ["createdAt", "created_at", "startedAt", "started_at", "openedAt", "opened_at"], defaults.createdAt),
    updatedAt: nullableDateString(record, ["updatedAt", "updated_at", "completedAt", "completed_at", "endedAt", "ended_at"]),
    sealedAt: nullableDateString(record, ["sealedAt", "sealed_at", "completedAt", "completed_at", "endedAt", "ended_at"]),
  };
}

export function normalizeRunnerThreadRoutingReceipt(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadRoutingReceipt {
  const record = asRecord(raw);
  return {
    kind: "routing_receipt",
    id: requiredId(record, ["id", "routingReceiptId", "routing_receipt_id", "receiptId", "receipt_id"], "routing-receipt", defaults),
    threadId: threadIdFor(record, defaults),
    messageId: firstString(record, ["messageId", "message_id"]),
    sequence: finiteSequence(record, defaults),
    route: firstString(record, ["route", "routeKind", "route_kind", "targetType", "target_type"], "none"),
    deliveryMode: firstString(record, ["deliveryMode", "delivery_mode", "mode"], "fyi") as RunnerThreadRoutingReceipt["deliveryMode"],
    status: firstString(record, ["status", "state"], "classifying"),
    recipientParticipantId: firstNullableString(record, ["recipientParticipantId", "recipient_participant_id", "recipientId", "recipient_id", "targetId", "target_id"]),
    runId: runIdFor(record, defaults),
    intent: firstNullableString(record, ["intent", "purpose"]),
    reason: firstNullableString(record, ["reason", "rationale"]),
    confidence: firstValue(record, ["confidence"]) === undefined ? null : firstNumber(record, ["confidence"], 0),
    deliveredAtSequence: firstValue(record, ["deliveredAtSequence", "delivered_at_sequence"]) === undefined
      ? null
      : Math.max(0, Math.trunc(firstNumber(record, ["deliveredAtSequence", "delivered_at_sequence"], 0))),
    deliveredAtStepId: firstNullableString(record, ["deliveredAtStepId", "delivered_at_step_id"]),
    correctedFromReceiptId: firstNullableString(record, ["correctedFromReceiptId", "corrected_from_receipt_id"]),
    metadata: normalizedMetadata(record),
    createdAt: dateString(record, ["createdAt", "created_at"], defaults.createdAt),
    updatedAt: nullableDateString(record, ["updatedAt", "updated_at"]),
  };
}

export function normalizeRunnerThreadPermissionRequest(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadPermissionRequest {
  const record = asRecord(raw);
  const scope = firstRecord(record, ["grantScope", "grant_scope", "scope"]);
  const status = firstString(record, ["status", "decision"], "pending");
  const requestedAt = dateString(record, ["requestedAt", "requested_at", "createdAt", "created_at"], defaults.createdAt);
  const decisionValue = firstString(record, ["decision"]);
  return {
    kind: "permission",
    id: requiredId(record, ["id", "permissionRequestId", "permission_request_id", "requestId", "request_id"], "permission", defaults),
    threadId: threadIdFor(record, defaults),
    runId: runIdFor(record, defaults),
    sequence: finiteSequence(record, defaults),
    actionId: firstNullableString(record, ["actionId", "action_id"]),
    activityGroupId: firstNullableString(record, ["activityGroupId", "activity_group_id", "groupId", "group_id"]),
    sourceEventId: firstNullableString(record, ["sourceEventId", "source_event_id", "eventId", "event_id"]),
    status,
    permissionRing: permissionRingFor(record),
    ringLabel: firstNullableString(record, ["ringLabel", "ring_label", "permissionRingLabel", "permission_ring_label"]),
    ringDescription: firstNullableString(record, ["ringDescription", "ring_description", "permissionRingDescription", "permission_ring_description"]),
    actionType: firstNullableString(record, ["actionType", "action_type", "permissionActionId", "permission_action_id"]),
    actionLabel: firstNullableString(record, ["actionLabel", "action_label", "permissionActionLabel", "permission_action_label"]),
    actionDescription: firstNullableString(record, ["actionDescription", "action_description", "permissionActionDescription", "permission_action_description"]),
    toolName: firstNullableString(record, ["toolName", "tool_name", "tool"]),
    input: firstValue(record, ["input", "toolInput", "tool_input"]),
    reason: firstNullableString(record, ["reason"]),
    requestedMode: firstNullableString(record, ["requestedMode", "requested_mode", "requiredMode", "required_mode"]),
    currentMode: firstNullableString(record, ["currentMode", "current_mode"]),
    decision: decisionValue === "allow" || decisionValue === "approved"
      ? "allow"
      : decisionValue === "deny" || decisionValue === "denied"
        ? "deny"
        : null,
    decisionByParticipantId: firstNullableString(record, ["decisionByParticipantId", "decision_by_participant_id"]),
    decisionReason: firstNullableString(record, ["decisionReason", "decision_reason"]),
    grantScope: Object.keys(scope).length > 0 ? {
      kind: firstString(scope, ["kind", "type"], "once"),
      value: firstNullableString(scope, ["value", "id"]),
      label: firstNullableString(scope, ["label", "name"]),
      expiresAt: nullableDateString(scope, ["expiresAt", "expires_at"]),
      metadata: normalizedMetadata(scope),
    } : null,
    snapshotBeforeId: firstNullableString(record, ["snapshotBeforeId", "snapshot_before_id"]),
    snapshotAfterId: firstNullableString(record, ["snapshotAfterId", "snapshot_after_id"]),
    diffReference: firstNullableString(record, ["diffReference", "diff_reference", "diffUrl", "diff_url"]),
    metadata: normalizedMetadata(record),
    requestedAt,
    resolvedAt: nullableDateString(record, ["resolvedAt", "resolved_at"]),
    createdAt: dateString(record, ["createdAt", "created_at", "requestedAt", "requested_at"], requestedAt),
    updatedAt: nullableDateString(record, ["updatedAt", "updated_at"]),
  };
}

function normalizeItemKind(rawKind: string): RunnerThreadTimelineItem["kind"] | null {
  const kind = rawKind.trim().toLowerCase().replace(/[.-]/g, "_");
  if (kind === "message" || kind === "thread_message") return "message";
  if (kind === "run" || kind === "thread_run") return "run";
  if (kind === "event" || kind === "thread_event") return "event";
  if (kind === "action" || kind === "thread_action") return "action";
  if (kind === "activity_group" || kind === "action_group" || kind === "trace_cluster") return "activity_group";
  if (kind === "routing_receipt" || kind === "route_receipt" || kind === "delivery_receipt") return "routing_receipt";
  if (kind === "permission" || kind === "permission_request") return "permission";
  return null;
}

export function normalizeRunnerThreadTimelineItem(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadTimelineItem {
  const record = asRecord(raw);
  const explicitKind = normalizeItemKind(firstString(record, ["kind", "itemKind", "item_kind", "entityType", "entity_type"]));
  const inferredKind = explicitKind
    ?? (firstValue(record, ["liveSummary", "live_summary", "startSequence", "start_sequence"]) !== undefined ? "activity_group" : null)
    ?? (firstValue(record, ["permissionRequestId", "permission_request_id", "requestedAt", "requested_at"]) !== undefined ? "permission" : null)
    ?? (firstValue(record, ["routingReceiptId", "routing_receipt_id", "deliveryMode", "delivery_mode"]) !== undefined && firstValue(record, ["messageId", "message_id"]) !== undefined ? "routing_receipt" : null)
    ?? (firstValue(record, ["authorParticipantId", "author_participant_id", "content"]) !== undefined ? "message" : null)
    ?? (firstValue(record, ["runKind", "run_kind", "origin", "trigger"]) !== undefined && firstValue(record, ["status"]) !== undefined ? "run" : null)
    ?? (firstValue(record, ["actionId", "action_id", "toolName", "tool_name"]) !== undefined ? "action" : null)
    ?? "event";

  switch (inferredKind) {
    case "message": return normalizeRunnerThreadMessage(record, defaults);
    case "run": return normalizeRunnerThreadRun(record, defaults);
    case "action": return normalizeRunnerThreadAction(record, defaults);
    case "activity_group": return normalizeRunnerThreadActivityGroup(record, defaults);
    case "routing_receipt": return normalizeRunnerThreadRoutingReceipt(record, defaults);
    case "permission": return normalizeRunnerThreadPermissionRequest(record, defaults);
    default: return normalizeRunnerThreadEvent(record, defaults);
  }
}

function readArray(record: UnknownRecord, keys: string[]): unknown[] {
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

function unwrapRecord(raw: unknown): UnknownRecord {
  const record = asRecord(raw);
  if (isRecord(record.data)) return record.data;
  return record;
}

function timelineReference(item: RunnerThreadTimelineItem): RunnerThreadTimelineReference {
  return { kind: item.kind, id: item.id, sequence: item.sequence, createdAt: item.createdAt };
}

function compatibilityParticipantKind(value: string): RunnerThreadParticipant["kind"] {
  const normalized = value.trim().toLowerCase();
  if (normalized === "user" || normalized === "human") return "human";
  if (normalized === "assistant" || normalized === "agent" || normalized === "worker") return "worker";
  if (normalized === "communicator" || normalized === "observer") return normalized;
  if (normalized === "system" || normalized === "service") return normalized;
  return normalized || "human";
}

function compatibilityParticipantId(threadId: string, kind: RunnerThreadParticipant["kind"], authorityId = ""): string {
  const normalizedAuthorityId = authorityId.trim();
  return normalizedAuthorityId
    ? `${threadId}:participant:${kind}:${normalizedAuthorityId}`
    : `${threadId}:participant:${kind}`;
}

function upsertCompatibilityParticipant(
  participants: Map<string, RunnerThreadParticipant>,
  options: {
    threadId: string;
    roleOrType: string;
    authorityId?: string;
    displayName?: string;
    avatarUrl?: string;
  },
): RunnerThreadParticipant {
  const kind = compatibilityParticipantKind(options.roleOrType);
  const id = compatibilityParticipantId(options.threadId, kind, options.authorityId || "");
  const previous = participants.get(id);
  const participant: RunnerThreadParticipant = {
    id,
    threadId: options.threadId,
    kind,
    displayName: options.displayName?.trim()
      || (kind === "human" ? "User" : kind === "worker" ? "Worker" : kind === "communicator" ? "Communicator" : String(kind || "Participant")),
    userId: kind === "human" ? options.authorityId || null : null,
    agentId: kind === "worker" || kind === "communicator" || kind === "observer" ? options.authorityId || null : null,
    avatarUrl: options.avatarUrl?.trim() || previous?.avatarUrl || null,
    active: true,
    metadata: { ...(previous?.metadata || {}), source: "timeline_compatibility" },
    createdAt: previous?.createdAt || null,
    updatedAt: previous?.updatedAt || null,
  };
  const normalizedParticipant = { ...previous, ...participant };
  participants.set(id, normalizedParticipant);
  return normalizedParticipant;
}

function compatibilityRowSequence(record: UnknownRecord): number {
  const raw = firstValue(record, ["sequence", "seq"]);
  if (raw === null || raw === undefined || raw === "") return 0;
  return Math.max(0, Math.trunc(firstNumber(record, ["sequence", "seq"], 0)));
}

function compatibilityMessageId(payload: UnknownRecord, row: UnknownRecord): string {
  return firstString(payload, ["messageId", "message_id", "id"], firstString(row, ["id"]));
}

function normalizeCompatibilityTimelineRow(
  raw: unknown,
  defaults: RunnerThreadNormalizationDefaults,
  participants: Map<string, RunnerThreadParticipant>,
  producerParticipantByMessageId: Map<string, RunnerThreadParticipant>,
): RunnerThreadTimelineItem {
  const row = asRecord(raw);
  const payload = asRecord(row.payload);
  const threadId = firstString(row, ["threadId", "thread_id"], defaults.threadId || "");
  const runId = firstNullableString(row, ["runId", "run_id"]) ?? defaults.runId ?? null;
  const sequence = compatibilityRowSequence(row);
  const createdAt = dateString(row, ["createdAt", "created_at"], defaults.createdAt);
  const rawKind = firstString(row, ["kind"], "event").toLowerCase();
  const payloadMetadata = asRecord(payload.metadata);
  const compatibilityMetadata = {
    ...payloadMetadata,
    compatibilitySource: firstString(row, ["source"], "timeline"),
    legacy: payload.legacy === true,
  };

  if (rawKind === "message") {
    const role = firstString(payload, ["participantKind", "participant_kind", "role"], "user");
    const messageId = compatibilityMessageId(payload, row);
    const participant = producerParticipantByMessageId.get(messageId)
      || upsertCompatibilityParticipant(participants, {
        threadId,
        roleOrType: role,
        authorityId: firstString(payloadMetadata, ["participantId", "participant_id", "userId", "user_id", "agentId", "agent_id"]),
        displayName: firstString(payloadMetadata, ["participantName", "participant_name", "userName", "user_name", "agentName", "agent_name"]),
        avatarUrl: firstString(payloadMetadata, ["avatarUrl", "avatar_url", "photoUrl", "photo_url", "profileImageUrl", "profile_image_url", "agentAvatarUrl", "agent_avatar_url", "picture"]),
      });
    return normalizeRunnerThreadMessage({
      ...payload,
      id: messageId,
      threadId,
      runId,
      sequence,
      authorParticipantId: participant.id,
      content: firstString(payload, ["content", "message", "text"]),
      modality: firstString(payload, ["modality", "channel"], "text"),
      linkedRunIds: runId ? [runId] : [],
      createdAt,
      metadata: compatibilityMetadata,
    }, { threadId, runId, sequence, createdAt });
  }

  if (rawKind === "step") {
    return normalizeRunnerThreadAction({
      ...payload,
      id: firstString(payload, ["stepId", "step_id", "id"], firstString(row, ["id"])),
      threadId,
      runId,
      sequence,
      sourceEventId: firstString(row, ["id"]),
      activityGroupId: firstValue(payload, ["activityGroupId", "activity_group_id", "groupId", "group_id"])
        ?? firstValue(payloadMetadata, ["activityGroupId", "activity_group_id", "groupId", "group_id"]),
      type: firstString(payload, ["stepKind", "step_kind", "eventType", "event_type"], "step"),
      title: firstString(payload, ["title", "label"], "Step"),
      summary: firstString(payload, ["summary", "message"]),
      snapshotBeforeId: firstValue(payload, ["snapshotBeforeId", "snapshot_before_id"]),
      snapshotAfterId: firstValue(payload, ["snapshotAfterId", "snapshot_after_id"]),
      createdAt,
      metadata: {
        ...compatibilityMetadata,
        legacyStepSequence: firstNumber(payload, ["stepSequence", "step_sequence"], 0),
        sourceMessageId: firstNullableString(payload, ["sourceMessageId", "source_message_id"]),
      },
    }, { threadId, runId, sequence, createdAt });
  }

  if (rawKind === "action") {
    const eventType = firstString(payload, ["eventType", "event_type", "type"], "action");
    const actionSequence = sequence || Math.max(0, Math.trunc(firstNumber(payloadMetadata, [
      "runtimeSequence",
      "runtime_sequence",
      "actionSequence",
      "action_sequence",
      "sequence",
    ], 0)));
    if (eventType === "permission_request") {
      return normalizeRunnerThreadPermissionRequest({
        ...payloadMetadata,
        id: firstString(payloadMetadata, ["permissionRequestId", "permission_request_id", "requestId", "request_id"], firstString(row, ["id"])),
        threadId,
        runId,
        sequence: actionSequence,
        sourceEventId: firstString(row, ["id"]),
        activityGroupId: firstValue(payloadMetadata, ["activityGroupId", "activity_group_id", "groupId", "group_id"]),
        status: firstString(payloadMetadata, ["status", "decision"], "pending"),
        permissionRing: firstValue(payloadMetadata, ["permissionRing", "permission_ring", "permissionRingId", "permission_ring_id"]),
        toolName: firstValue(payloadMetadata, ["toolName", "tool_name"]),
        input: firstValue(payloadMetadata, ["input", "toolInput", "tool_input"]),
        reason: firstValue(payloadMetadata, ["reason"]),
        requestedAt: createdAt,
        createdAt,
        metadata: compatibilityMetadata,
      }, { threadId, runId, sequence: actionSequence, createdAt });
    }
    return normalizeRunnerThreadAction({
      ...payload,
      id: firstString(row, ["id"], firstString(payload, ["id"])),
      threadId,
      runId,
      sequence: actionSequence,
      sourceEventId: firstString(row, ["id"]),
      activityGroupId: firstValue(payload, ["activityGroupId", "activity_group_id", "groupId", "group_id"])
        ?? firstValue(payloadMetadata, ["activityGroupId", "activity_group_id", "groupId", "group_id"]),
      type: eventType,
      title: firstString(payload, ["title", "label"], firstString(payloadMetadata, ["permissionActionLabel", "toolName"], firstString(payload, ["content", "message"], "Action"))),
      summary: firstString(payload, ["summary", "content", "message"]),
      status: firstString(payloadMetadata, ["status"], firstString(payload, ["level"], "completed") === "error" ? "failed" : "completed"),
      toolName: firstValue(payloadMetadata, ["toolName", "tool_name"]),
      input: firstValue(payloadMetadata, ["toolInput", "tool_input", "input", "args"]),
      output: firstValue(payloadMetadata, ["output", "result"]),
      permissionRing: firstValue(payloadMetadata, ["permissionRing", "permission_ring", "ringId", "ring_id"]),
      touchedResources: firstValue(payloadMetadata, ["touchedResources", "touched_resources", "filePaths", "file_paths"]),
      createdAt,
      metadata: compatibilityMetadata,
    }, { threadId, runId, sequence: actionSequence, createdAt });
  }

  if (rawKind === "event") {
    const eventData = asRecord(firstValue(payload, ["data"]));
    const producerType = firstString(payload, ["producerType", "producer_type"], "system");
    const producerId = firstString(payload, ["producerId", "producer_id"]);
    const participant = upsertCompatibilityParticipant(participants, {
      threadId,
      roleOrType: producerType,
      authorityId: producerId,
      displayName: firstString(eventData, ["producerName", "producer_name", "actorName", "actor_name"]),
      avatarUrl: firstString(eventData, ["producerAvatarUrl", "producer_avatar_url", "actorAvatarUrl", "actor_avatar_url", "avatarUrl", "avatar_url", "photoUrl", "photo_url"]),
    });
    return normalizeRunnerThreadEvent({
      id: firstString(row, ["id"]),
      threadId,
      runId,
      sequence,
      type: firstString(payload, ["type", "eventType", "event_type"], "thread.event"),
      producer: { type: producerType, id: producerId || null, participantId: participant.id },
      actorParticipantId: participant.id,
      visibility: firstString(payload, ["visibility"], "user"),
      payloadVersion: firstNumber(payload, ["payloadVersion", "payload_version"], 1),
      title: firstValue(eventData, ["title", "label"]),
      summary: firstValue(eventData, ["summary", "message"]),
      permissionRing: firstValue(eventData, ["permissionRing", "permission_ring", "highestRing", "highest_ring"]),
      policyDecision: firstValue(eventData, ["policyDecision", "policy_decision"]),
      snapshotBeforeId: firstValue(eventData, ["snapshotBeforeId", "snapshot_before_id"]),
      snapshotAfterId: firstValue(eventData, ["snapshotAfterId", "snapshot_after_id"]),
      payload: {
        ...eventData,
        sourceType: firstValue(payload, ["sourceType", "source_type"]),
        sourceId: firstValue(payload, ["sourceId", "source_id"]),
        runSequence: firstValue(payload, ["runSequence", "run_sequence"]),
      },
      occurredAt: createdAt,
      createdAt,
    }, { threadId, runId, sequence, createdAt });
  }

  return normalizeRunnerThreadTimelineItem({ ...payload, ...row, sequence, createdAt }, { threadId, runId, sequence, createdAt });
}

function dedupeTimelineItems(items: RunnerThreadTimelineItem[]): RunnerThreadTimelineItem[] {
  const byKey = new Map<string, RunnerThreadTimelineItem>();
  for (const item of items) {
    const key = `${item.kind}:${item.id}`;
    const previous = byKey.get(key);
    if (!previous) {
      byKey.set(key, item);
      continue;
    }
    if (item.kind === "activity_group" && previous.kind === "activity_group" && item.version < previous.version) continue;
    if (item.kind === "permission" && previous.kind === "permission") {
      byKey.set(key, {
        ...previous,
        ...item,
        permissionRing: item.permissionRing || previous.permissionRing,
        toolName: item.toolName || previous.toolName,
        input: item.input ?? previous.input,
        reason: item.reason || previous.reason,
        requestedAt: previous.requestedAt,
        createdAt: previous.createdAt,
        metadata: { ...(previous.metadata || {}), ...(item.metadata || {}) },
      });
      continue;
    }
    byKey.set(key, item);
  }
  return Array.from(byKey.values()).sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || "");
    const rightTime = Date.parse(right.createdAt || "");
    if ((left.sequence === 0 || right.sequence === 0) && Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
      return leftTime - rightTime;
    }
    return left.sequence - right.sequence
      || left.createdAt.localeCompare(right.createdAt)
      || `${left.kind}:${left.id}`.localeCompare(`${right.kind}:${right.id}`);
  });
}

function normalizeProjection(raw: unknown, fallbackThreadId: string): RunnerThreadProjection | null {
  const record = asRecord(raw);
  if (!Object.keys(record).length) return null;
  const threadId = firstString(record, ["threadId", "thread_id"], fallbackThreadId);
  const participantsById = asRecord(firstValue(record, ["participantsById", "participants_by_id"]));
  const participants = readArray(record, ["participants"]);
  if (!participants.length) participants.push(...Object.values(participantsById));
  const entityMaps: Record<string, UnknownRecord> = {
    message: asRecord(firstValue(record, ["messagesById", "messages_by_id"])),
    run: asRecord(firstValue(record, ["runsById", "runs_by_id"])),
    event: asRecord(firstValue(record, ["eventsById", "events_by_id"])),
    action: asRecord(firstValue(record, ["actionsById", "actions_by_id"])),
    activity_group: asRecord(firstValue(record, ["activityGroupsById", "activity_groups_by_id"])),
    routing_receipt: asRecord(firstValue(record, ["routingReceiptsById", "routing_receipts_by_id"])),
    permission: asRecord(firstValue(record, ["permissionsById", "permissions_by_id"])),
  };
  const directItems = readArray(record, ["items"]);
  const timelineRows = readArray(record, ["timeline"]);
  const items = directItems.length ? directItems : timelineRows.map((row) => {
    const reference = asRecord(row);
    const kind = normalizeItemKind(firstString(reference, ["kind"]));
    const id = firstString(reference, ["id"]);
    return kind && id && entityMaps[kind]?.[id] ? entityMaps[kind][id] : row;
  });
  if (!items.length) {
    for (const entityMap of Object.values(entityMaps)) items.push(...Object.values(entityMap));
  }
  if (!participants.length && !items.length && firstNumber(record, ["schemaVersion", "schema_version"], 0) !== 1) return null;
  const normalizedItems = items.map((item, index) => normalizeRunnerThreadTimelineItem(item, { threadId, sequence: index + 1 }));
  const streamCursor = firstNullableString(record, ["streamCursor", "stream_cursor", "nextCursor", "next_cursor", "nextAfter", "next_after", "cursor"]);
  const olderCursor = firstNullableString(record, ["olderCursor", "older_cursor", "beforeCursor", "before_cursor"]);
  const legacyHasMore = firstBoolean(record, ["hasMore", "has_more"], false);
  const hasOlder = firstBoolean(record, ["hasOlder", "has_older"], legacyHasMore || Boolean(olderCursor));
  const projection: RunnerThreadProjection = {
    schemaVersion: 1,
    threadId,
    latestSequence: Math.max(firstNumber(record, ["latestSequence", "latest_sequence"], 0), ...normalizedItems.map((item) => item.sequence), 0),
    participantsById: {},
    messagesById: {},
    runsById: {},
    eventsById: {},
    actionsById: {},
    activityGroupsById: {},
    routingReceiptsById: {},
    permissionsById: {},
    timeline: normalizedItems.map(timelineReference),
    nextCursor: streamCursor,
    streamCursor,
    olderCursor,
    hasMore: firstBoolean(record, ["hasMore", "has_more"], hasOlder),
    hasOlder,
    hasNewer: firstBoolean(record, ["hasNewer", "has_newer"], false),
  };
  for (const participant of participants.map((item) => normalizeRunnerThreadParticipant(item, { threadId }))) {
    projection.participantsById[participant.id] = participant;
  }
  for (const item of normalizedItems) {
    if (item.kind === "message") projection.messagesById[item.id] = item;
    else if (item.kind === "run") projection.runsById[item.id] = item;
    else if (item.kind === "event") projection.eventsById[item.id] = item;
    else if (item.kind === "action") projection.actionsById[item.id] = item;
    else if (item.kind === "activity_group") projection.activityGroupsById[item.id] = item;
    else if (item.kind === "routing_receipt") projection.routingReceiptsById[item.id] = item;
    else projection.permissionsById[item.id] = item;
  }
  return projection;
}

export function normalizeRunnerThreadTimelinePage(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadTimelinePage {
  const record = unwrapRecord(raw);
  const threadId = firstString(record, ["threadId", "thread_id"], defaults.threadId || "");
  const projection = normalizeProjection(firstValue(record, ["projection"]), threadId);
  const participantMap = new Map<string, RunnerThreadParticipant>();
  for (const rawParticipant of readArray(record, ["participants"])) {
    const participant = normalizeRunnerThreadParticipant(rawParticipant, { threadId });
    participantMap.set(participant.id, participant);
  }

  const rawItems = readArray(record, ["items", "timeline", "events", "data"]);
  const rawRuns = readArray(record, ["runs"]);
  const compatibilityRunIdForRow = (rawItem: unknown): string | null => {
    const row = asRecord(rawItem);
    const payload = asRecord(row.payload);
    const metadata = asRecord(payload.metadata);
    const directRunId = firstNullableString(row, ["runId", "run_id"])
      ?? firstNullableString(payload, ["runId", "run_id"])
      ?? firstNullableString(metadata, ["runId", "run_id"]);
    if (directRunId) return directRunId;
    if (rawRuns.length === 1) {
      return firstNullableString(asRecord(rawRuns[0]), ["id", "runId", "run_id"]);
    }
    const occurredAt = Date.parse(dateString(row, ["createdAt", "created_at", "occurredAt", "occurred_at"]));
    if (!Number.isFinite(occurredAt)) return null;
    const matchingRun = rawRuns
      .map(asRecord)
      .filter((runRecord): runRecord is UnknownRecord => Boolean(runRecord))
      .filter((runRecord) => {
        const startedAt = Date.parse(dateString(runRecord, ["startedAt", "started_at", "createdAt", "created_at"]));
        const completedAtValue = firstNullableString(runRecord, ["completedAt", "completed_at", "updatedAt", "updated_at"]);
        const completedAt = completedAtValue ? Date.parse(completedAtValue) : Number.POSITIVE_INFINITY;
        return Number.isFinite(startedAt) && occurredAt >= startedAt && occurredAt <= completedAt;
      })
      .sort((left, right) => (
        Date.parse(dateString(right, ["startedAt", "started_at", "createdAt", "created_at"])) -
        Date.parse(dateString(left, ["startedAt", "started_at", "createdAt", "created_at"]))
      ))[0];
    return matchingRun ? firstNullableString(matchingRun, ["id", "runId", "run_id"]) : null;
  };
  const producerParticipantByMessageId = new Map<string, RunnerThreadParticipant>();
  for (const rawItem of rawItems) {
    const row = asRecord(rawItem);
    if (firstString(row, ["kind"]).toLowerCase() !== "event") continue;
    const payload = asRecord(row.payload);
    const eventData = asRecord(payload.data);
    const nestedMessage = firstRecord(eventData, ["message"]);
    const messageId = firstString(eventData, ["messageId", "message_id"], firstString(nestedMessage, ["id", "messageId", "message_id"]));
    if (!messageId) continue;
    const producerType = firstString(payload, ["producerType", "producer_type"], "system");
    const producerId = firstString(payload, ["producerId", "producer_id"]);
    const participant = upsertCompatibilityParticipant(participantMap, {
      threadId,
      roleOrType: producerType,
      authorityId: producerId,
      displayName: firstString(eventData, ["producerName", "producer_name", "authorName", "author_name"]),
      avatarUrl: firstString(eventData, ["producerAvatarUrl", "producer_avatar_url", "authorAvatarUrl", "author_avatar_url", "avatarUrl", "avatar_url", "photoUrl", "photo_url"]),
    });
    producerParticipantByMessageId.set(messageId, participant);
  }

  const canonicalItems: RunnerThreadTimelineItem[] = [];
  for (const rawItem of rawItems) {
    const item = normalizeCompatibilityTimelineRow(rawItem, {
      threadId,
      runId: compatibilityRunIdForRow(rawItem),
      sequence: 0,
    }, participantMap, producerParticipantByMessageId);
    canonicalItems.push(item);
    if (item.kind !== "event" || !item.type.toLowerCase().replace(/[.-]/g, "_").includes("action")) continue;
    const activityGroupId = firstNullableString(item.payload, ["activityGroupId", "activity_group_id", "groupId", "group_id"]);
    const actionId = firstString(item.payload, ["actionId", "action_id", "id"]);
    if (!activityGroupId || !actionId) continue;
    canonicalItems.push(normalizeRunnerThreadAction({
      ...item.payload,
      id: actionId,
      threadId,
      runId: item.runId,
      sequence: item.sequence,
      sourceEventId: item.id,
      activityGroupId,
      type: firstString(item.payload, ["actionType", "action_type", "type"], item.type),
      title: firstString(item.payload, ["title", "label", "toolName", "tool_name"], "Action"),
      summary: firstValue(item.payload, ["summary", "message"]),
      createdAt: item.createdAt,
    }, { threadId, runId: item.runId, sequence: item.sequence, createdAt: item.createdAt }));
  }
  if (!rawItems.length && projection) {
    canonicalItems.push(...projection.timeline.map((reference) => {
      if (reference.kind === "message") return projection.messagesById[reference.id];
      if (reference.kind === "run") return projection.runsById[reference.id];
      if (reference.kind === "event") return projection.eventsById[reference.id];
      if (reference.kind === "action") return projection.actionsById[reference.id];
      if (reference.kind === "activity_group") return projection.activityGroupsById[reference.id];
      if (reference.kind === "routing_receipt") return projection.routingReceiptsById[reference.id];
      return projection.permissionsById[reference.id];
    }).filter((item): item is RunnerThreadTimelineItem => Boolean(item)));
    for (const participant of Object.values(projection.participantsById)) participantMap.set(participant.id, participant);
  }

  const rawRunProjections = readArray(record, ["runProjections", "run_projections"]);
  const runProjectionById = new Map<string, UnknownRecord>();
  for (const rawRunProjection of rawRunProjections) {
    const runProjection = asRecord(rawRunProjection);
    const runId = firstString(runProjection, ["runId", "run_id", "id"]);
    if (runId) runProjectionById.set(runId, runProjection);
  }

  const seenRunIds = new Set<string>();
  for (const rawRun of rawRuns) {
    const runRecord = asRecord(rawRun);
    const runId = firstString(runRecord, ["id", "runId", "run_id"]);
    if (!runId) continue;
    seenRunIds.add(runId);
    const runProjection = runProjectionById.get(runId) || {};
    const agentId = firstString(runRecord, ["agentId", "agent_id"]);
    const runKind = firstString(runRecord, ["kind", "runKind", "run_kind"], "worker");
    const actor = upsertCompatibilityParticipant(participantMap, {
      threadId,
      roleOrType: runKind === "communicator" || runKind === "observer" ? runKind : "worker",
      authorityId: agentId,
      displayName: firstString(asRecord(runRecord.metadata), ["agentName", "agent_name"], runKind === "worker" ? "Worker" : runKind),
      avatarUrl: firstString(asRecord(runRecord.metadata), ["agentAvatarUrl", "agent_avatar_url", "profileImageUrl", "profile_image_url", "avatarUrl", "avatar_url", "photoUrl", "photo_url"]),
    });
    const triggerMessageId = firstString(runRecord, ["triggerMessageId", "trigger_message_id", "sourceMessageId", "source_message_id"]);
    const messageAnchor = triggerMessageId
      ? canonicalItems.find((item) => item.kind === "message" && item.id === triggerMessageId)
      : null;
    const runAnchor = canonicalItems.find((item) => (
      (item.kind === "action" || item.kind === "event" || item.kind === "activity_group" || item.kind === "permission") && item.runId === runId
    ));
    canonicalItems.push(normalizeRunnerThreadRun({
      ...runRecord,
      id: runId,
      threadId,
      sequence: firstValue(runRecord, ["sequence"]) ?? messageAnchor?.sequence ?? runAnchor?.sequence ?? 0,
      actorParticipantId: actor.id,
      sourceMessageId: triggerMessageId || null,
      status: firstString(runProjection, ["status"], firstString(runRecord, ["status"], "queued")),
      currentSummary: firstValue(runProjection, ["currentSummary", "current_summary"]),
      highestPermissionRing: firstValue(runProjection, ["highestRing", "highest_ring", "highestPermissionRing", "highest_permission_ring"]),
      projection: runProjection,
    }, { threadId, runId, sequence: 0 }));
  }
  for (const [runId, runProjection] of runProjectionById) {
    if (seenRunIds.has(runId)) continue;
    canonicalItems.push(normalizeRunnerThreadRun({
      id: runId,
      threadId,
      kind: "worker",
      status: firstString(runProjection, ["status"], "queued"),
      sequence: firstNumber(runProjection, ["lastEventSequence", "last_event_sequence"], 0),
      currentSummary: firstValue(runProjection, ["currentSummary", "current_summary"]),
      highestPermissionRing: firstValue(runProjection, ["highestRing", "highest_ring"]),
      projection: runProjection,
      createdAt: firstValue(runProjection, ["createdAt", "created_at"]),
      updatedAt: firstValue(runProjection, ["updatedAt", "updated_at"]),
    }, { threadId, runId, sequence: 0 }));
  }

  for (const rawDelivery of readArray(record, ["deliveries", "routingReceipts", "routing_receipts"])) {
    const delivery = asRecord(rawDelivery);
    const targetType = firstString(delivery, ["targetType", "target_type", "route"], "none");
    const targetId = firstString(delivery, ["targetId", "target_id"]);
    const recipient = targetType !== "none" ? upsertCompatibilityParticipant(participantMap, {
      threadId,
      roleOrType: targetType,
      authorityId: targetId,
    }) : null;
    const messageId = firstString(delivery, ["messageId", "message_id"]);
    const message = canonicalItems.find((item) => item.kind === "message" && item.id === messageId);
    canonicalItems.push(normalizeRunnerThreadRoutingReceipt({
      ...delivery,
      threadId,
      route: targetType,
      deliveryMode: firstValue(delivery, ["mode", "deliveryMode", "delivery_mode"]),
      recipientParticipantId: recipient?.id || null,
      sequence: firstValue(delivery, ["deliveredAtSequence", "delivered_at_sequence", "sequence"]) ?? message?.sequence ?? 0,
    }, { threadId, runId: firstNullableString(delivery, ["runId", "run_id"]), sequence: 0 }));
  }

  for (const rawGroup of readArray(record, ["activityGroups", "activity_groups", "groups"])) {
    const group = asRecord(rawGroup);
    const groupMetrics = firstRecord(group, ["metrics", "usage"]);
    canonicalItems.push(normalizeRunnerThreadActivityGroup({
      ...group,
      threadId,
      version: firstValue(group, ["revision", "version"]),
      liveSummary: firstValue(group, ["summary", "liveSummary", "live_summary"]),
      highestPermissionRing: firstValue(group, ["highestRing", "highest_ring", "highestPermissionRing", "highest_permission_ring"]),
      eventIds: firstValue(group, ["evidenceEventIds", "evidence_event_ids", "eventIds", "event_ids"]),
      metrics: {
        ...groupMetrics,
        actionCount: firstNumber(group, ["actionCount", "action_count"], firstNumber(groupMetrics, ["actionCount", "action_count"], 0)),
        durationMs: firstNumber(group, ["durationMs", "duration_ms"], firstNumber(groupMetrics, ["durationMs", "duration_ms"], 0)),
      },
      sequence: firstValue(group, ["startSequence", "start_sequence", "sequence"]) ?? 0,
    }, { threadId, runId: firstNullableString(group, ["runId", "run_id"]), sequence: 0 }));
  }

  const projectedActions = canonicalItems.filter((item): item is RunnerThreadAction => item.kind === "action");
  for (let index = 0; index < canonicalItems.length; index += 1) {
    const item = canonicalItems[index];
    if (item.kind !== "activity_group") continue;
    const evidenceIds = new Set(item.eventIds || []);
    const associatedActionIds = projectedActions
      .filter((action) => action.activityGroupId === item.id || Boolean(action.sourceEventId && evidenceIds.has(action.sourceEventId)))
      .map((action) => action.id);
    if (!associatedActionIds.length) continue;
    canonicalItems[index] = {
      ...item,
      actionIds: Array.from(new Set([...(item.actionIds || []), ...associatedActionIds])),
    };
  }

  const items = dedupeTimelineItems(canonicalItems);
  const participants = Array.from(participantMap.values());
  const explicitLatestSequence = firstValue(record, ["latestSequence", "latest_sequence", "lastSequence", "last_sequence"]);
  const projectionLatestSequence = rawRunProjections.reduce<number>((highest, rawRunProjection) => (
    Math.max(highest, firstNumber(asRecord(rawRunProjection), ["lastEventSequence", "last_event_sequence"], 0))
  ), 0);
  const latestSequence = explicitLatestSequence !== undefined && explicitLatestSequence !== null
    ? Math.max(0, Math.trunc(firstNumber(record, ["latestSequence", "latest_sequence", "lastSequence", "last_sequence"], 0)))
    : Math.max(projectionLatestSequence, ...items.map((item) => item.sequence), 0);
  const streamCursor = firstNullableString(record, ["streamCursor", "stream_cursor", "nextCursor", "next_cursor", "nextAfter", "next_after", "cursor"]);
  const olderCursor = firstNullableString(record, ["olderCursor", "older_cursor", "beforeCursor", "before_cursor"]);
  const legacyHasMore = firstBoolean(record, ["hasMore", "has_more"], false);
  const hasOlder = firstBoolean(record, ["hasOlder", "has_older"], legacyHasMore || Boolean(olderCursor));
  return {
    threadId,
    items,
    participants,
    latestSequence,
    nextCursor: streamCursor,
    streamCursor,
    olderCursor,
    hasMore: firstBoolean(record, ["hasMore", "has_more"], hasOlder),
    hasOlder,
    hasNewer: firstBoolean(record, ["hasNewer", "has_newer"], false),
    projection,
  };
}

export function normalizeRunnerThreadEventPage(raw: unknown, defaults: RunnerThreadNormalizationDefaults = {}): RunnerThreadEventPage {
  const record = unwrapRecord(raw);
  const threadId = firstString(record, ["threadId", "thread_id"], defaults.threadId || "");
  const events = readArray(record, ["events", "items", "data"]).map((item, index) => normalizeRunnerThreadEvent(item, {
    threadId,
    sequence: (defaults.sequence ?? 0) + index + 1,
  }));
  const streamCursor = firstNullableString(record, ["streamCursor", "stream_cursor", "nextCursor", "next_cursor", "nextAfter", "next_after", "cursor"]);
  const olderCursor = firstNullableString(record, ["olderCursor", "older_cursor", "beforeCursor", "before_cursor"]);
  const legacyHasMore = firstBoolean(record, ["hasMore", "has_more"], false);
  const hasOlder = firstBoolean(record, ["hasOlder", "has_older"], legacyHasMore || Boolean(olderCursor));
  return {
    threadId,
    events,
    latestSequence: Math.max(firstNumber(record, ["latestSequence", "latest_sequence"], 0), ...events.map((event) => event.sequence), 0),
    nextCursor: streamCursor,
    streamCursor,
    olderCursor,
    hasMore: firstBoolean(record, ["hasMore", "has_more"], hasOlder),
    hasOlder,
    hasNewer: firstBoolean(record, ["hasNewer", "has_newer"], false),
  };
}

export function unwrapRunnerThreadObject(raw: unknown, keys: string[]): UnknownRecord {
  const record = asRecord(raw);
  if (isRecord(record.data)) return record.data;
  for (const key of keys) {
    if (isRecord(record[key])) return record[key] as UnknownRecord;
  }
  return record;
}

export function unwrapRunnerThreadList(raw: unknown, keys: string[]): unknown[] {
  if (Array.isArray(raw)) return raw;
  const record = asRecord(raw);
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}
