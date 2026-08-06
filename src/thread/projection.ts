import { enrichRunnerThreadMessageConnectorMetadata } from "./message-connector-metadata.js";
import {
  normalizeRunnerThreadAction,
  normalizeRunnerThreadActivityGroup,
  normalizeRunnerThreadMessage,
  normalizeRunnerThreadParticipant,
  normalizeRunnerThreadPermissionRequest,
  normalizeRunnerThreadRoutingReceipt,
  normalizeRunnerThreadRun,
  normalizeRunnerThreadTimelineItem,
} from "./normalize.js";
import type {
  RunnerThreadActivityGroup,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadProjectionEvent,
  RunnerThreadProjectionMutation,
  RunnerThreadProjectionSeed,
  RunnerThreadRunProjection,
  RunnerThreadTimelineItem,
  RunnerThreadTimelineItemKind,
  RunnerThreadTimelinePage,
  RunnerThreadTimelineReference,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isProjectionMutation(value: RunnerThreadProjectionEvent): value is RunnerThreadProjectionMutation {
  return isRecord(value) && typeof value.operation === "string";
}

function timelineKey(kind: RunnerThreadTimelineItemKind, id: string): string {
  return `${kind}:${id}`;
}

function timelineReference(item: RunnerThreadTimelineItem): RunnerThreadTimelineReference {
  return {
    kind: item.kind,
    id: item.id,
    sequence: item.sequence,
    createdAt: item.createdAt,
  };
}

function compareTimelineReferences(left: RunnerThreadTimelineReference, right: RunnerThreadTimelineReference): number {
  const leftTime = Date.parse(left.createdAt || "");
  const rightTime = Date.parse(right.createdAt || "");
  // Legacy compatibility rows intentionally retain sequence 0 so that they can
  // never advance the durable SSE cursor. Order a mixed legacy/canonical pair
  // by its server timestamp while retaining sequence authority for v2 pairs.
  if ((left.sequence === 0 || right.sequence === 0) && Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
    return leftTime - rightTime;
  }
  if (left.sequence !== right.sequence) return left.sequence - right.sequence;
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) return leftTime - rightTime;
  return timelineKey(left.kind, left.id).localeCompare(timelineKey(right.kind, right.id));
}

function upsertTimelineReference(
  timeline: RunnerThreadTimelineReference[],
  reference: RunnerThreadTimelineReference,
  hasExistingAnchor = false,
): RunnerThreadTimelineReference[] {
  // Timeline anchors are immutable: live projection updates change the entity
  // in its lookup table, but must not move its original position in the
  // conversation. Callers already know whether the entity exists, so avoid an
  // otherwise-linear id scan on the hottest SSE path.
  if (hasExistingAnchor) return timeline;

  const last = timeline[timeline.length - 1];
  if (!last || compareTimelineReferences(last, reference) <= 0) {
    return [...timeline, reference];
  }

  // Historical pages and reconnect replays can arrive before the current tail.
  // Insert into the already-sorted array instead of filtering and sorting the
  // entire timeline for every event.
  let low = 0;
  let high = timeline.length;
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (compareTimelineReferences(timeline[middle], reference) <= 0) low = middle + 1;
    else high = middle;
  }
  return [...timeline.slice(0, low), reference, ...timeline.slice(low)];
}

function mergeMetadata(
  previous: Record<string, unknown> | null | undefined,
  next: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!previous && !next) return null;
  return { ...(previous || {}), ...(next || {}) };
}

function mergeRunProjection(
  previous: RunnerThreadRunProjection | null | undefined,
  next: RunnerThreadRunProjection | null | undefined,
): RunnerThreadRunProjection | null {
  if (!previous && !next) return null;
  if (!previous) return next || null;
  if (!next) return previous;
  return {
    ...previous,
    ...next,
    summary: next.summary || previous.summary,
    counters: previous.counters || next.counters ? { ...(previous.counters || {}), ...(next.counters || {}) } : null,
    metadata: mergeMetadata(previous.metadata, next.metadata),
  };
}

function mergeActivityGroup(previous: RunnerThreadActivityGroup | undefined, next: RunnerThreadActivityGroup): RunnerThreadActivityGroup {
  if (!previous) return next;
  if (next.version < previous.version) return previous;
  return {
    ...previous,
    ...next,
    sequence: previous.sequence,
    childGroupIds: Array.from(new Set([...(previous.childGroupIds || []), ...(next.childGroupIds || [])])),
    actionIds: Array.from(new Set([...(previous.actionIds || []), ...(next.actionIds || [])])),
    eventIds: Array.from(new Set([...(previous.eventIds || []), ...(next.eventIds || [])])),
    metrics: previous.metrics || next.metrics ? { ...(previous.metrics || {}), ...(next.metrics || {}) } : null,
    metadata: mergeMetadata(previous.metadata, next.metadata),
  };
}

function mergePermission(
  previous: RunnerThreadPermissionRequest | undefined,
  next: RunnerThreadPermissionRequest,
): RunnerThreadPermissionRequest {
  if (!previous) return next;
  return {
    ...previous,
    ...next,
    sequence: previous.sequence,
    permissionRing: (Math.max(previous.permissionRing || 0, next.permissionRing || 0) || null) as RunnerThreadPermissionRequest["permissionRing"],
    actionId: next.actionId ?? previous.actionId,
    activityGroupId: next.activityGroupId ?? previous.activityGroupId,
    sourceEventId: next.sourceEventId ?? previous.sourceEventId,
    ringLabel: next.ringLabel ?? previous.ringLabel,
    ringDescription: next.ringDescription ?? previous.ringDescription,
    actionType: next.actionType ?? previous.actionType,
    actionLabel: next.actionLabel ?? previous.actionLabel,
    actionDescription: next.actionDescription ?? previous.actionDescription,
    toolName: next.toolName ?? previous.toolName,
    input: next.input ?? previous.input,
    reason: next.reason ?? previous.reason,
    requestedMode: next.requestedMode ?? previous.requestedMode,
    currentMode: next.currentMode ?? previous.currentMode,
    decisionByParticipantId: next.decisionByParticipantId ?? previous.decisionByParticipantId,
    decisionReason: next.decisionReason ?? previous.decisionReason,
    snapshotBeforeId: next.snapshotBeforeId ?? previous.snapshotBeforeId,
    snapshotAfterId: next.snapshotAfterId ?? previous.snapshotAfterId,
    diffReference: next.diffReference ?? previous.diffReference,
    requestedAt: previous.requestedAt,
    createdAt: previous.createdAt,
    grantScope: next.grantScope || previous.grantScope,
    metadata: mergeMetadata(previous.metadata, next.metadata),
  };
}

function upsertTimelineItem(projection: RunnerThreadProjection, rawItem: RunnerThreadTimelineItem): RunnerThreadProjection {
  const item = normalizeRunnerThreadTimelineItem(rawItem, {
    threadId: projection.threadId || rawItem.threadId,
    sequence: rawItem.sequence,
    createdAt: rawItem.createdAt,
  });
  const threadId = projection.threadId || item.threadId;
  const common = {
    ...projection,
    threadId,
    latestSequence: Math.max(projection.latestSequence, item.sequence),
  };
  const anchoredTimeline = (entity: RunnerThreadTimelineItem, hasExistingAnchor = false) => (
    upsertTimelineReference(projection.timeline, timelineReference(entity), hasExistingAnchor)
  );

  if (item.kind === "message") {
    const previous = projection.messagesById[item.id];
    const mergedMessage = previous ? {
      ...previous,
      ...item,
      sequence: previous.sequence,
      createdAt: previous.createdAt,
      linkedRunIds: Array.from(new Set([...(previous.linkedRunIds || []), ...(item.linkedRunIds || [])])),
      metadata: mergeMetadata(previous.metadata, item.metadata),
    } : item;
    return {
      ...common,
      timeline: anchoredTimeline(mergedMessage, Boolean(previous)),
      messagesById: {
        ...projection.messagesById,
        [item.id]: mergedMessage,
      },
    };
  }
  if (item.kind === "run") {
    const previous = projection.runsById[item.id];
    const projectedGroups = Object.values(projection.activityGroupsById)
      .filter((group) => group.runId === item.id && group.status !== "superseded")
      .sort((left, right) => left.startSequence - right.startSequence || left.version - right.version);
    const latestProjectedGroup = projectedGroups[projectedGroups.length - 1] || null;
    const projectedHighestRing = projectedGroups.reduce<1 | 2 | 3 | null>((highest, group) => (
      group.highestPermissionRing && (!highest || group.highestPermissionRing > highest) ? group.highestPermissionRing : highest
    ), item.highestPermissionRing || previous?.highestPermissionRing || null);
    const mergedRun = previous ? {
      ...previous,
      ...item,
      sequence: previous.sequence,
      createdAt: previous.createdAt,
      origin: { ...previous.origin, ...item.origin, metadata: mergeMetadata(previous.origin.metadata, item.origin.metadata) },
      lease: previous.lease || item.lease ? { ...(previous.lease || {}), ...(item.lease || {}) } : null,
      projection: mergeRunProjection(previous.projection, item.projection),
      actionGroupIds: Array.from(new Set([...(previous.actionGroupIds || []), ...(item.actionGroupIds || []), ...projectedGroups.map((group) => group.id)])),
      metadata: mergeMetadata(previous.metadata, item.metadata),
    } : {
      ...item,
      actionGroupIds: Array.from(new Set([...(item.actionGroupIds || []), ...projectedGroups.map((group) => group.id)])),
    };
    const finalRun = {
      ...mergedRun,
      currentSummary: latestProjectedGroup?.liveSummary || mergedRun.currentSummary,
      highestPermissionRing: projectedHighestRing,
      projection: latestProjectedGroup ? {
        runId: item.id,
        threadId: item.threadId,
        sequence: latestProjectedGroup.sequence,
        status: item.status,
        phase: latestProjectedGroup.title,
        summary: latestProjectedGroup.liveSummary,
        freshnessSequence: latestProjectedGroup.endSequence ?? latestProjectedGroup.startSequence,
        freshnessAt: latestProjectedGroup.updatedAt || latestProjectedGroup.createdAt,
        highestPermissionRing: projectedHighestRing,
        counters: {
          ...(mergedRun.projection?.counters || {}),
          activityGroupCount: projectedGroups.length,
          actionCount: Object.values(projection.actionsById).filter((action) => action.runId === item.id).length,
          pendingPermissionCount: Object.values(projection.permissionsById).filter((permission) => permission.runId === item.id && permission.status === "pending").length,
        },
        observerModel: latestProjectedGroup.observerModel || mergedRun.projection?.observerModel || null,
        metadata: mergeMetadata(mergedRun.projection?.metadata, { sourceActivityGroupId: latestProjectedGroup.id }),
        updatedAt: latestProjectedGroup.updatedAt || latestProjectedGroup.createdAt,
      } : mergedRun.projection,
    };
    return {
      ...common,
      timeline: anchoredTimeline(finalRun, Boolean(previous)),
      runsById: {
        ...projection.runsById,
        [item.id]: finalRun,
      },
    };
  }
  if (item.kind === "event") {
    const previous = projection.eventsById[item.id];
    const mergedEvent = previous ? {
      ...previous,
      ...item,
      sequence: previous.sequence,
      createdAt: previous.createdAt,
    } : item;
    return {
      ...common,
      timeline: anchoredTimeline(mergedEvent, Boolean(previous)),
      eventsById: { ...projection.eventsById, [item.id]: mergedEvent },
    };
  }
  if (item.kind === "action") {
    const previous = projection.actionsById[item.id];
    const mergedAction = previous ? {
      ...previous,
      ...item,
      sequence: previous.sequence,
      createdAt: previous.createdAt,
      touchedResources: item.touchedResources?.length ? item.touchedResources : previous.touchedResources,
      metadata: mergeMetadata(previous.metadata, item.metadata),
    } : item;
    const run = item.runId ? projection.runsById[item.runId] : null;
    const nextRing = item.permissionRing && (!run?.highestPermissionRing || item.permissionRing > run.highestPermissionRing)
      ? item.permissionRing
      : run?.highestPermissionRing;
    return {
      ...common,
      timeline: anchoredTimeline(mergedAction, Boolean(previous)),
      runsById: run ? {
        ...projection.runsById,
        [run.id]: { ...run, highestPermissionRing: nextRing || null },
      } : projection.runsById,
      actionsById: {
        ...projection.actionsById,
        [item.id]: mergedAction,
      },
    };
  }
  if (item.kind === "activity_group") {
    const previous = projection.activityGroupsById[item.id];
    const mergedGroups = {
      ...projection.activityGroupsById,
      [item.id]: mergeActivityGroup(previous, item),
    };
    const run = item.runId ? projection.runsById[item.runId] : null;
    const runGroups = Object.values(mergedGroups)
      .filter((group) => group.runId === item.runId && group.status !== "superseded")
      .sort((left, right) => left.startSequence - right.startSequence || left.version - right.version);
    const latestGroup = runGroups[runGroups.length - 1] || null;
    const highestGroupRing = runGroups.reduce<1 | 2 | 3 | null>((highest, group) => (
      group.highestPermissionRing && (!highest || group.highestPermissionRing > highest) ? group.highestPermissionRing : highest
    ), run?.highestPermissionRing || null);
    const mergedGroup = mergedGroups[item.id];
    return {
      ...common,
      timeline: anchoredTimeline(mergedGroup, Boolean(previous)),
      runsById: run ? {
        ...projection.runsById,
        [run.id]: {
          ...run,
          currentSummary: latestGroup?.liveSummary || run.currentSummary,
          actionGroupIds: Array.from(new Set([...(run.actionGroupIds || []), ...runGroups.map((group) => group.id)])),
          highestPermissionRing: highestGroupRing,
          projection: latestGroup ? {
            runId: run.id,
            threadId: run.threadId,
            sequence: latestGroup.sequence,
            status: run.status,
            phase: latestGroup.title,
            summary: latestGroup.liveSummary,
            freshnessSequence: latestGroup.endSequence ?? latestGroup.startSequence,
            freshnessAt: latestGroup.updatedAt || latestGroup.createdAt,
            highestPermissionRing: highestGroupRing,
            counters: {
              ...(run.projection?.counters || {}),
              activityGroupCount: runGroups.length,
              actionCount: Object.values(projection.actionsById).filter((action) => action.runId === run.id).length,
              pendingPermissionCount: Object.values(projection.permissionsById).filter((permission) => permission.runId === run.id && permission.status === "pending").length,
            },
            observerModel: latestGroup.observerModel || run.projection?.observerModel || null,
            metadata: mergeMetadata(run.projection?.metadata, { sourceActivityGroupId: latestGroup.id }),
            updatedAt: latestGroup.updatedAt || latestGroup.createdAt,
          } : run.projection,
          updatedAt: latestGroup?.updatedAt || run.updatedAt,
        },
      } : projection.runsById,
      activityGroupsById: mergedGroups,
    };
  }
  if (item.kind === "routing_receipt") {
    const previous = projection.routingReceiptsById[item.id];
    const mergedReceipt = previous ? {
      ...previous,
      ...item,
      sequence: previous.sequence,
      createdAt: previous.createdAt,
      metadata: mergeMetadata(previous.metadata, item.metadata),
    } : item;
    const message = item.messageId ? projection.messagesById[item.messageId] : null;
    return {
      ...common,
      timeline: anchoredTimeline(mergedReceipt, Boolean(previous)),
      messagesById: message ? {
        ...projection.messagesById,
        [message.id]: {
          ...message,
          routingReceiptId: item.id,
          linkedRunIds: Array.from(new Set([...(message.linkedRunIds || []), ...(item.runId ? [item.runId] : [])])),
        },
      } : projection.messagesById,
      routingReceiptsById: {
        ...projection.routingReceiptsById,
        [item.id]: mergedReceipt,
      },
    };
  }
  const permissionRun = item.runId ? projection.runsById[item.runId] : null;
  const permissionRing = item.permissionRing && (!permissionRun?.highestPermissionRing || item.permissionRing > permissionRun.highestPermissionRing)
    ? item.permissionRing
    : permissionRun?.highestPermissionRing;
  const previousPermission = projection.permissionsById[item.id];
  const mergedPermission = mergePermission(previousPermission, item);
  return {
    ...common,
    timeline: anchoredTimeline(mergedPermission, Boolean(previousPermission)),
    runsById: permissionRun ? {
      ...projection.runsById,
      [permissionRun.id]: { ...permissionRun, highestPermissionRing: permissionRing || null },
    } : projection.runsById,
    permissionsById: {
      ...projection.permissionsById,
      [item.id]: mergedPermission,
    },
  };
}

function removeTimelineItem(
  projection: RunnerThreadProjection,
  kind: RunnerThreadTimelineItemKind,
  id: string,
): RunnerThreadProjection {
  const timeline = projection.timeline.filter((item) => item.kind !== kind || item.id !== id);
  if (kind === "message") {
    const { [id]: _removed, ...messagesById } = projection.messagesById;
    return { ...projection, messagesById, timeline };
  }
  if (kind === "run") {
    const { [id]: _removed, ...runsById } = projection.runsById;
    return { ...projection, runsById, timeline };
  }
  if (kind === "event") {
    const { [id]: _removed, ...eventsById } = projection.eventsById;
    return { ...projection, eventsById, timeline };
  }
  if (kind === "action") {
    const { [id]: _removed, ...actionsById } = projection.actionsById;
    return { ...projection, actionsById, timeline };
  }
  if (kind === "activity_group") {
    const { [id]: _removed, ...activityGroupsById } = projection.activityGroupsById;
    return { ...projection, activityGroupsById, timeline };
  }
  if (kind === "routing_receipt") {
    const { [id]: _removed, ...routingReceiptsById } = projection.routingReceiptsById;
    return { ...projection, routingReceiptsById, timeline };
  }
  const { [id]: _removed, ...permissionsById } = projection.permissionsById;
  return { ...projection, permissionsById, timeline };
}

function embeddedRecord(payload: UnknownRecord, keys: string[]): UnknownRecord | null {
  for (const key of keys) {
    if (isRecord(payload[key])) return payload[key] as UnknownRecord;
  }
  return null;
}

function looksLikeEntityPayload(type: string, entityName: string): boolean {
  const normalizedType = type.toLowerCase().replace(/[.-]/g, "_");
  return normalizedType === entityName || normalizedType.startsWith(`${entityName}_`) || normalizedType.includes(`_${entityName}_`);
}

function hasAnyPayloadKey(payload: UnknownRecord, keys: string[]): boolean {
  return keys.some((key) => payload[key] !== undefined && payload[key] !== null);
}

function participantKindForProducer(type: string): string {
  const normalized = type.trim().toLowerCase();
  if (normalized === "user" || normalized === "human") return "human";
  if (normalized === "assistant" || normalized === "agent") return "worker";
  return normalized || "system";
}

function applyEmbeddedEventEntities(projection: RunnerThreadProjection, event: Extract<RunnerThreadTimelineItem, { kind: "event" }>): RunnerThreadProjection {
  const payload = event.payload;
  const defaults = { threadId: event.threadId, runId: event.runId, sequence: event.sequence, createdAt: event.occurredAt };
  let next = projection;

  const participant = embeddedRecord(payload, ["participant", "author", "actor"]);
  if (participant && looksLikeEntityPayload(event.type, "participant")) {
    const normalized = normalizeRunnerThreadParticipant(participant, defaults);
    next = {
      ...next,
      participantsById: { ...next.participantsById, [normalized.id]: { ...next.participantsById[normalized.id], ...normalized } },
    };
  }

  const embeddedMessage = embeddedRecord(payload, ["message", "threadMessage", "thread_message"]);
  const message = embeddedMessage
    ?? (looksLikeEntityPayload(event.type, "message") && hasAnyPayloadKey(payload, ["content", "message", "text", "body"]) ? payload : null);
  if (message && Object.keys(message).length) {
    const messageId = typeof message.id === "string" ? message.id : typeof message.messageId === "string" ? message.messageId : "";
    const existingMessage = messageId ? next.messagesById[messageId] : null;
    const explicitAuthorParticipantId = typeof message.authorParticipantId === "string" && message.authorParticipantId.trim()
      ? message.authorParticipantId.trim()
      : typeof message.author_participant_id === "string" && message.author_participant_id.trim()
        ? message.author_participant_id.trim()
        : null;
    const authorParticipantId = explicitAuthorParticipantId
      || existingMessage?.authorParticipantId
      || event.actorParticipantId
      || event.producer.participantId
      || null;
    if (authorParticipantId && !next.participantsById[authorParticipantId]) {
      const participantKind = participantKindForProducer(event.producer.type);
      const normalizedParticipant = normalizeRunnerThreadParticipant({
        id: authorParticipantId,
        threadId: event.threadId,
        kind: participantKind,
        displayName: participantKind === "human"
          ? "User"
          : participantKind === "worker"
            ? "Worker"
            : participantKind.charAt(0).toUpperCase() + participantKind.slice(1),
        userId: participantKind === "human" ? event.producer.id : null,
        agentId: participantKind === "worker" || participantKind === "communicator" || participantKind === "observer"
          ? event.producer.id
          : null,
        metadata: { source: "event_producer", sourceEventId: event.id },
      }, defaults);
      next = {
        ...next,
        participantsById: { ...next.participantsById, [normalizedParticipant.id]: normalizedParticipant },
      };
    }
    next = upsertTimelineItem(next, normalizeRunnerThreadMessage({
      ...existingMessage,
      ...message,
      ...(authorParticipantId ? { authorParticipantId } : {}),
    }, defaults));
  }

  const embeddedRun = embeddedRecord(payload, ["run", "threadRun", "thread_run"]);
  const run = embeddedRun
    ?? (looksLikeEntityPayload(event.type, "run") && hasAnyPayloadKey(payload, ["status", "state", "currentSummary", "current_summary", "summary", "phase"]) ? payload : null);
  if (run && Object.keys(run).length) {
    const referencedRunId = typeof run.id === "string" ? run.id : typeof run.runId === "string" ? run.runId : event.runId || "";
    const existingRun = referencedRunId ? next.runsById[referencedRunId] : null;
    const runPayload = {
      ...existingRun,
      ...run,
      ...(referencedRunId ? { id: referencedRunId } : {}),
      ...(existingRun?.origin && !run.origin && !run.trigger ? { origin: existingRun.origin } : {}),
    };
    next = upsertTimelineItem(next, normalizeRunnerThreadRun(runPayload, defaults));
  }

  const group = embeddedRecord(payload, ["activityGroup", "activity_group", "actionGroup", "action_group", "group"])
    ?? ((looksLikeEntityPayload(event.type, "activity_group") || looksLikeEntityPayload(event.type, "action_group"))
      && hasAnyPayloadKey(payload, ["id", "activityGroupId", "activity_group_id", "groupId", "group_id"])
      ? payload
      : null);
  if (group && Object.keys(group).length) next = upsertTimelineItem(next, normalizeRunnerThreadActivityGroup(group, defaults));

  const action = embeddedRecord(payload, ["action", "threadAction", "thread_action"])
    ?? (looksLikeEntityPayload(event.type, "action")
      && !looksLikeEntityPayload(event.type, "action_group")
      && hasAnyPayloadKey(payload, ["id", "actionId", "action_id", "toolName", "tool_name", "title"])
      ? payload
      : null);
  if (action && Object.keys(action).length) next = upsertTimelineItem(next, normalizeRunnerThreadAction(action, defaults));

  const receipt = embeddedRecord(payload, ["routingReceipt", "routing_receipt", "receipt", "deliveryReceipt", "delivery_receipt"])
    ?? ((looksLikeEntityPayload(event.type, "routing_receipt") || looksLikeEntityPayload(event.type, "delivery_receipt"))
      && hasAnyPayloadKey(payload, ["messageId", "message_id"])
      ? payload
      : null);
  if (receipt && Object.keys(receipt).length) next = upsertTimelineItem(next, normalizeRunnerThreadRoutingReceipt(receipt, defaults));

  const permission = embeddedRecord(payload, ["permission", "permissionRequest", "permission_request"])
    ?? (looksLikeEntityPayload(event.type, "permission")
      && hasAnyPayloadKey(payload, ["id", "permissionRequestId", "permission_request_id", "requestId", "request_id"])
      ? payload
      : null);
  if (permission && Object.keys(permission).length) next = upsertTimelineItem(next, normalizeRunnerThreadPermissionRequest(permission, defaults));

  return next;
}

/** Creates an empty normalized projection, optionally seeded with canonical items. */
export function createInitialRunnerThreadProjection(
  seed: RunnerThreadProjectionSeed | string = {},
): RunnerThreadProjection {
  const normalizedSeed: RunnerThreadProjectionSeed = typeof seed === "string" ? { threadId: seed } : seed;
  let projection: RunnerThreadProjection = {
    schemaVersion: 1,
    threadId: normalizedSeed.threadId || "",
    latestSequence: 0,
    participantsById: {},
    messagesById: {},
    runsById: {},
    eventsById: {},
    actionsById: {},
    activityGroupsById: {},
    routingReceiptsById: {},
    permissionsById: {},
    timeline: [],
    nextCursor: normalizedSeed.nextCursor ?? null,
    streamCursor: normalizedSeed.streamCursor ?? normalizedSeed.nextCursor ?? null,
    olderCursor: normalizedSeed.olderCursor ?? null,
    hasMore: normalizedSeed.hasMore ?? false,
    hasOlder: normalizedSeed.hasOlder ?? normalizedSeed.hasMore ?? false,
    hasNewer: normalizedSeed.hasNewer ?? false,
  };

  for (const rawParticipant of normalizedSeed.participants || []) {
    const participant = normalizeRunnerThreadParticipant(rawParticipant, { threadId: projection.threadId });
    projection = {
      ...projection,
      threadId: projection.threadId || participant.threadId || "",
      participantsById: { ...projection.participantsById, [participant.id]: participant },
    };
  }
  for (const item of normalizedSeed.items || []) projection = upsertTimelineItem(projection, item);
  return projection;
}

/**
 * Applies one canonical item or projection mutation. When the input is a raw
 * event, embedded run/message/action/group/permission records are projected too.
 */
export function reduceRunnerThreadEvent(
  projection: RunnerThreadProjection,
  event: RunnerThreadProjectionEvent,
): RunnerThreadProjection {
  if (isProjectionMutation(event)) {
    if (event.operation === "participant.upsert") {
      const participant = normalizeRunnerThreadParticipant(event.participant, { threadId: projection.threadId });
      return {
        ...projection,
        threadId: projection.threadId || participant.threadId || "",
        participantsById: {
          ...projection.participantsById,
          [participant.id]: { ...projection.participantsById[participant.id], ...participant },
        },
      };
    }
    if (event.operation === "timeline.remove") return removeTimelineItem(projection, event.itemKind, event.itemId);
    if (event.operation === "timeline.reset") {
      return createInitialRunnerThreadProjection({
        threadId: event.threadId || projection.threadId,
        participants: event.participants || Object.values(projection.participantsById),
        items: event.items,
        nextCursor: projection.nextCursor,
        streamCursor: projection.streamCursor,
        olderCursor: projection.olderCursor,
        hasMore: projection.hasMore,
        hasOlder: projection.hasOlder,
        hasNewer: projection.hasNewer,
      });
    }
    if (event.operation === "cursor.update") {
      return {
        ...projection,
        latestSequence: event.latestSequence === undefined
          ? projection.latestSequence
          : Math.max(projection.latestSequence, event.latestSequence),
        nextCursor: event.nextCursor === undefined ? projection.nextCursor : event.nextCursor,
        streamCursor: event.streamCursor === undefined ? projection.streamCursor : event.streamCursor,
        olderCursor: event.olderCursor === undefined ? projection.olderCursor : event.olderCursor,
        hasMore: event.hasMore === undefined ? projection.hasMore : event.hasMore,
        hasOlder: event.hasOlder === undefined ? projection.hasOlder : event.hasOlder,
        hasNewer: event.hasNewer === undefined ? projection.hasNewer : event.hasNewer,
      };
    }
    return upsertTimelineItem(projection, event.item);
  }

  const item = normalizeRunnerThreadTimelineItem(event, {
    threadId: projection.threadId || event.threadId,
    sequence: event.sequence,
    createdAt: event.createdAt,
  });
  const withItem = upsertTimelineItem(projection, item);
  return item.kind === "event" ? applyEmbeddedEventEntities(withItem, item) : withItem;
}

export function reduceRunnerThreadEvents(
  projection: RunnerThreadProjection,
  events: Iterable<RunnerThreadProjectionEvent>,
): RunnerThreadProjection {
  let next = projection;
  for (const event of events) next = reduceRunnerThreadEvent(next, event);
  return next;
}

export function projectRunnerThreadTimelinePage(
  projection: RunnerThreadProjection,
  page: RunnerThreadTimelinePage,
): RunnerThreadProjection {
  let next = projection.threadId || !page.threadId
    ? projection
    : { ...projection, threadId: page.threadId };
  for (const participant of page.participants || []) {
    next = reduceRunnerThreadEvent(next, { operation: "participant.upsert", participant });
  }
  next = reduceRunnerThreadEvents(next, page.items);
  next = reduceRunnerThreadEvent(next, {
    operation: "cursor.update",
    latestSequence: page.latestSequence,
    nextCursor: page.nextCursor,
    streamCursor: page.streamCursor,
    olderCursor: page.olderCursor,
    hasMore: page.hasMore,
    hasOlder: page.hasOlder,
    hasNewer: page.hasNewer,
  });
  return enrichRunnerThreadMessageConnectorMetadata(next);
}
