import assert from "node:assert/strict";
import {
  RunnerClient,
  adaptLegacyThreadData,
  createInitialRunnerThreadProjection,
  normalizeRunnerThreadTimelinePage,
  projectRunnerThreadTimelinePage,
  reduceRunnerThreadEvent,
  reduceRunnerThreadEvents,
  selectRunnerThreadActivityGroups,
  selectRunnerThreadPendingPermissions,
  selectRunnerThreadRunLiveSummary,
  selectRunnerThreadRunProjection,
  selectRunnerThreadTimelineItems,
} from "../dist/index.js";

const threadId = "thread-domain-test";
const createdAt = "2026-07-10T08:00:00.000Z";

let projection = createInitialRunnerThreadProjection(threadId);
projection = reduceRunnerThreadEvent(projection, {
  kind: "event",
  id: "event-run-started",
  threadId,
  runId: "run-1",
  sequence: 1,
  type: "run.started",
  producer: { type: "worker", id: "worker-1" },
  payloadVersion: 1,
  payload: {
    run: {
      id: "run-1",
      threadId,
      sequence: 1,
      kind: "worker",
      status: "running",
      currentSummary: "Inspecting the authentication flow",
      trigger: { type: "message", messageId: "message-1" },
      createdAt,
    },
  },
  occurredAt: createdAt,
  createdAt,
});
assert.equal(projection.runsById["run-1"].status, "running");

projection = reduceRunnerThreadEvent(projection, {
  kind: "activity_group",
  id: "group-1",
  threadId,
  runId: "run-1",
  sequence: 2,
  version: 2,
  status: "open",
  title: "Inspecting authentication",
  liveSummary: "Tracing how tokens are refreshed",
  actionIds: [],
  startSequence: 2,
  endSequence: null,
  highestPermissionRing: 2,
  createdAt,
});
projection = reduceRunnerThreadEvent(projection, {
  kind: "activity_group",
  id: "group-1",
  threadId,
  runId: "run-1",
  sequence: 2,
  version: 1,
  status: "open",
  title: "Stale title",
  liveSummary: "Stale summary",
  actionIds: [],
  startSequence: 2,
  endSequence: null,
  createdAt,
});
assert.equal(projection.activityGroupsById["group-1"].version, 2);
assert.equal(selectRunnerThreadRunLiveSummary(projection, "run-1"), "Tracing how tokens are refreshed");
assert.equal(selectRunnerThreadRunProjection(projection, "run-1").phase, "Inspecting authentication");

projection = reduceRunnerThreadEvent(projection, {
  kind: "permission",
  id: "permission-1",
  threadId,
  runId: "run-1",
  sequence: 3,
  actionId: "action-permission-1",
  activityGroupId: "group-1",
  status: "pending",
  permissionRing: 3,
  toolName: "deploy",
  requestedAt: createdAt,
  createdAt,
});
projection = reduceRunnerThreadEvent(projection, {
  kind: "event",
  id: "event-permission-resolved",
  threadId,
  runId: "run-1",
  sequence: 4,
  type: "permission.resolved",
  producer: { type: "policy" },
  payloadVersion: 1,
  payload: {
    permission: {
      id: "permission-1",
      status: "approved",
      decision: "allow",
      resolvedAt: "2026-07-10T08:01:00.000Z",
    },
  },
  occurredAt: "2026-07-10T08:01:00.000Z",
  createdAt: "2026-07-10T08:01:00.000Z",
});
assert.equal(projection.permissionsById["permission-1"].status, "approved");
assert.equal(projection.permissionsById["permission-1"].permissionRing, 3);
assert.equal(projection.permissionsById["permission-1"].toolName, "deploy");
assert.equal(projection.permissionsById["permission-1"].actionId, "action-permission-1");
assert.equal(projection.permissionsById["permission-1"].activityGroupId, "group-1");
assert.equal(projection.permissionsById["permission-1"].sequence, 3, "resolution must preserve the original request position");
assert.equal(projection.permissionsById["permission-1"].createdAt, createdAt);
assert.equal(selectRunnerThreadPendingPermissions(projection).length, 0);
assert.ok(selectRunnerThreadTimelineItems(projection).length >= 5);

const legacy = adaptLegacyThreadData({
  threadId: "legacy-thread",
  startedAt: createdAt,
  messages: [
    { id: "legacy-user", role: "user", content: "Fix authentication", createdAt },
  ],
  logs: [
    { time: "00:00:01", message: "Inspecting the token refresh path", type: "info", eventType: "planning" },
    {
      time: "00:00:02",
      message: "Read auth configuration",
      type: "success",
      eventType: "command_execution",
      metadata: { command: "read auth", permissionRing: 1 },
    },
    {
      time: "00:00:03",
      message: "Checked deployment configuration",
      type: "success",
      eventType: "command_execution",
      metadata: { command: "check deploy", permissionRing: 3 },
    },
    { time: "00:00:04", message: "The refresh path is missing expiry validation", type: "info", eventType: "reasoning" },
    {
      time: "00:00:05",
      message: "Updated auth.ts",
      type: "success",
      eventType: "file_change",
      metadata: { filePaths: ["src/auth.ts"], permissionRing: 1 },
    },
    { time: "00:00:06", message: "Authentication fixed", type: "success", eventType: "turn_completed" },
  ],
});
const legacyGroups = selectRunnerThreadActivityGroups(legacy.projection, { runId: "legacy:legacy-thread:run" });
assert.equal(legacyGroups.length, 2, "reasoning should split fallback phases");
assert.equal(legacyGroups[0].actionIds.length, 2, "ring changes must not split a causal phase");
assert.equal(legacyGroups[0].highestPermissionRing, 3);
assert.ok(legacyGroups.every((group) => group.liveSummary));
assert.ok(Object.values(legacy.projection.actionsById).every((action) => action.activityGroupId));

const unknownRingLegacy = adaptLegacyThreadData({
  threadId: "legacy-unknown-ring",
  logs: [{
    time: "00:00:01",
    message: "Permission requested: custom_tool",
    type: "warning",
    eventType: "permission_request",
    metadata: { permissionRequestId: "unknown-ring-permission", status: "pending", toolName: "custom_tool" },
  }],
});
assert.equal(
  unknownRingLegacy.projection.permissionsById["unknown-ring-permission"].permissionRing,
  null,
  "legacy permissions must not silently default unknown risk to Ring 1",
);

const backendTimelineFixture = {
  threadId: "backend-shape-thread",
  data: [
    {
      id: "legacy:message:backend-user-message",
      threadId: "backend-shape-thread",
      kind: "message",
      sequence: null,
      runId: "backend-run-1",
      source: "legacy_message",
      createdAt,
      payload: {
        messageId: "backend-user-message",
        role: "user",
        content: "Inspect the authentication failure",
        eventType: "user_message",
        level: "info",
        durationMs: null,
        inputTokens: null,
        outputTokens: null,
        actionsCount: null,
        metadata: {},
        legacy: true,
      },
    },
    {
      id: "legacy:log:command-1",
      threadId: "backend-shape-thread",
      kind: "action",
      sequence: null,
      runId: "backend-run-1",
      source: "legacy_log",
      createdAt: "2026-07-10T08:00:01.000Z",
      payload: {
        role: "assistant",
        content: "Inspected the auth configuration",
        eventType: "command_execution",
        level: "success",
        metadata: { toolName: "bash", command: "inspect auth", permissionRing: 2, activityGroupId: "backend-group-1" },
        legacy: true,
      },
    },
    {
      id: "legacy:step:step-1",
      threadId: "backend-shape-thread",
      kind: "step",
      sequence: null,
      runId: "backend-run-1",
      source: "legacy_step",
      createdAt: "2026-07-10T08:00:02.000Z",
      payload: {
        stepId: "step-1",
        stepSequence: 41,
        sourceMessageId: "backend-user-message",
        stepKind: "file_change",
        eventType: "file_change",
        title: "Updated auth.ts",
        snapshotBeforeId: "snapshot-before",
        snapshotAfterId: "snapshot-after",
        metadata: { status: "completed" },
        legacy: true,
      },
    },
    {
      id: "backend-event-1",
      threadId: "backend-shape-thread",
      kind: "event",
      sequence: 1,
      runId: "backend-run-1",
      source: "v2",
      createdAt: "2026-07-10T08:00:03.000Z",
      payload: {
        type: "message.routed",
        producerType: "human",
        producerId: "backend-user-1",
        visibility: "user",
        payloadVersion: 1,
        data: { messageId: "backend-user-message", summary: "Routed the request to the worker" },
        sourceType: "message",
        sourceId: "backend-user-message",
        runSequence: 1,
      },
    },
  ],
  runs: [{
    id: "backend-run-1",
    threadId: "backend-shape-thread",
    kind: "worker",
    status: "running",
    triggerMessageId: "backend-user-message",
    parentRunId: null,
    externalRunId: "external-run-1",
    agentId: "agent-1",
    environmentId: "environment-1",
    initiatedByType: "human",
    initiatedById: "backend-user-1",
    leaseOwner: "worker-process-1",
    leaseExpiresAt: "2026-07-10T08:05:00.000Z",
    heartbeatAt: "2026-07-10T08:00:03.000Z",
    attempt: 1,
    maxAttempts: 3,
    startedAt: createdAt,
    completedAt: null,
    error: null,
    usage: {},
    metadata: { agentName: "Code Worker" },
    createdAt,
    updatedAt: "2026-07-10T08:00:03.000Z",
  }],
  runProjections: [{
    runId: "backend-run-1",
    threadId: "backend-shape-thread",
    currentSummary: "Tracing the failed token refresh",
    phase: "Investigation",
    status: "running",
    highestRing: 2,
    lastEventSequence: 1,
    activityGroupCount: 1,
    actionCount: 2,
    observerStatus: "active",
    observerRevision: 3,
    metadata: {},
    createdAt,
    updatedAt: "2026-07-10T08:00:03.000Z",
  }],
  deliveries: [{
    id: "backend-delivery-1",
    threadId: "backend-shape-thread",
    messageId: "backend-user-message",
    runId: "backend-run-1",
    targetType: "worker",
    targetId: "agent-1",
    mode: "checkpoint",
    status: "queued",
    intent: "instruction",
    confidence: 0.98,
    reason: "Explicit worker instruction",
    deliveredAtSequence: null,
    deliveredAt: null,
    metadata: {},
    createdAt: "2026-07-10T08:00:03.000Z",
    updatedAt: "2026-07-10T08:00:03.000Z",
  }],
  activityGroups: [{
    id: "backend-group-1",
    threadId: "backend-shape-thread",
    runId: "backend-run-1",
    parentGroupId: null,
    ordinal: 1,
    depth: 0,
    status: "active",
    title: "Investigating token refresh",
    summary: "Tracing the failed token refresh",
    rationale: "The failure occurs during refresh",
    startSequence: 1,
    endSequence: null,
    highestRing: 2,
    actionCount: 2,
    evidenceEventIds: ["backend-event-1"],
    observerStatus: "active",
    revision: 3,
    supersededById: null,
    metadata: {},
    createdAt: "2026-07-10T08:00:03.000Z",
    updatedAt: "2026-07-10T08:00:03.000Z",
  }],
  latestSequence: 1,
  nextCursor: "1",
  streamCursor: "1",
  olderCursor: "1",
  hasOlder: true,
  hasNewer: false,
};

const backendPage = normalizeRunnerThreadTimelinePage(backendTimelineFixture, { threadId: "backend-shape-thread" });
assert.equal(backendPage.latestSequence, 1);
assert.equal(backendPage.nextCursor, "1");
assert.equal(backendPage.streamCursor, "1");
assert.equal(backendPage.olderCursor, "1");
assert.equal(backendPage.hasMore, true, "legacy hasMore aliases the older-page flag");
assert.equal(backendPage.hasOlder, true);
assert.equal(backendPage.hasNewer, false);
assert.equal(backendPage.items.filter((item) => item.kind === "run").length, 1);
assert.equal(backendPage.items.filter((item) => item.kind === "activity_group").length, 1);
assert.equal(backendPage.items.filter((item) => item.kind === "routing_receipt").length, 1);
assert.equal(backendPage.items.find((item) => item.kind === "message").content, "Inspect the authentication failure");
assert.equal(backendPage.items.find((item) => item.kind === "action" && item.id === "legacy:log:command-1").permissionRing, 2);
assert.equal(backendPage.items.find((item) => item.kind === "action" && item.id === "step-1").snapshotAfterId, "snapshot-after");
const backendRun = backendPage.items.find((item) => item.kind === "run");
assert.equal(backendRun.currentSummary, "Tracing the failed token refresh");
assert.equal(backendRun.projection.phase, "Investigation");
assert.equal(backendRun.projection.counters.actionCount, 2);
const backendGroup = backendPage.items.find((item) => item.kind === "activity_group");
assert.equal(backendGroup.liveSummary, "Tracing the failed token refresh");
assert.equal(backendGroup.status, "open");
assert.equal(backendGroup.highestPermissionRing, 2);
assert.deepEqual(backendGroup.eventIds, ["backend-event-1"]);
assert.ok(backendGroup.actionIds.includes("legacy:log:command-1"));
const backendDelivery = backendPage.items.find((item) => item.kind === "routing_receipt");
assert.equal(backendDelivery.route, "worker");
assert.equal(backendDelivery.deliveryMode, "checkpoint");
const backendMessage = backendPage.items.find((item) => item.kind === "message");
assert.match(backendMessage.authorParticipantId, /human:backend-user-1$/);
assert.ok(backendPage.participants.some((participant) => participant.id === backendMessage.authorParticipantId));
assert.equal(new Set(backendPage.items.map((item) => `${item.kind}:${item.id}`)).size, backendPage.items.length);
const backendProjection = projectRunnerThreadTimelinePage(createInitialRunnerThreadProjection("backend-shape-thread"), backendPage);
assert.equal(backendProjection.messagesById["backend-user-message"].content, "Inspect the authentication failure");
assert.equal(backendProjection.latestSequence, 1);
assert.equal(backendProjection.streamCursor, "1");
assert.equal(backendProjection.olderCursor, "1");
assert.equal(backendProjection.hasOlder, true);

const fiftyLegacyRows = Array.from({ length: 50 }, (_, index) => ({
  id: `legacy:message:cursor-${index}`,
  threadId: "cursor-regression-thread",
  kind: "message",
  sequence: null,
  runId: null,
  source: "legacy_message",
  createdAt: new Date(Date.parse(createdAt) + index).toISOString(),
  payload: { messageId: `cursor-${index}`, role: "user", content: `Legacy ${index}`, metadata: {}, legacy: true },
}));
const legacyCursorPage = normalizeRunnerThreadTimelinePage({
  threadId: "cursor-regression-thread",
  data: fiftyLegacyRows,
  runs: [],
  runProjections: [],
  deliveries: [],
  activityGroups: [],
  latestSequence: 0,
  hasMore: false,
});
let cursorProjection = projectRunnerThreadTimelinePage(createInitialRunnerThreadProjection("cursor-regression-thread"), legacyCursorPage);
assert.equal(cursorProjection.latestSequence, 0, "legacy rows must not advance the durable event cursor");
cursorProjection = reduceRunnerThreadEvent(cursorProjection, {
  kind: "event",
  id: "first-v2-event",
  threadId: "cursor-regression-thread",
  runId: null,
  sequence: 1,
  type: "thread.started",
  producer: { type: "system" },
  payload: {},
  occurredAt: "2026-07-10T08:01:00.000Z",
  createdAt: "2026-07-10T08:01:00.000Z",
});
assert.equal(cursorProjection.latestSequence, 1);
assert.ok(cursorProjection.eventsById["first-v2-event"]);

let anchorProjection = reduceRunnerThreadEvent(createInitialRunnerThreadProjection("anchor-thread"), {
  kind: "run",
  id: "anchored-run",
  threadId: "anchor-thread",
  sequence: 1,
  runKind: "worker",
  status: "running",
  currentSummary: "Starting",
  origin: { kind: "message" },
  createdAt,
});
anchorProjection = reduceRunnerThreadEvent(anchorProjection, {
  kind: "event",
  id: "projection-update-event",
  threadId: "anchor-thread",
  runId: "anchored-run",
  sequence: 25,
  type: "thread.run.projection.updated",
  producer: { type: "observer" },
  payload: {
    runId: "anchored-run",
    status: "running",
    currentSummary: "Running the integration suite",
    projection: {
      runId: "anchored-run",
      threadId: "anchor-thread",
      sequence: 25,
      status: "running",
      summary: "Running the integration suite",
      freshnessSequence: 24,
      updatedAt: "2026-07-10T08:01:00.000Z",
    },
  },
  occurredAt: "2026-07-10T08:01:00.000Z",
  createdAt: "2026-07-10T08:01:00.000Z",
});
assert.equal(anchorProjection.runsById["anchored-run"].sequence, 1, "live summaries must not move the run card");
assert.equal(anchorProjection.runsById["anchored-run"].currentSummary, "Running the integration suite");
assert.equal(anchorProjection.timeline.find((item) => item.kind === "run" && item.id === "anchored-run").sequence, 1);
assert.equal(anchorProjection.latestSequence, 25);
assert.equal(
  projection.timeline.find((item) => item.kind === "permission" && item.id === "permission-1").sequence,
  3,
  "permission resolution must not move its timeline anchor",
);

let insertionProjection = createInitialRunnerThreadProjection("timeline-insertion-thread");
const insertionEvent = (id, sequence) => ({
  kind: "event",
  id,
  threadId: "timeline-insertion-thread",
  runId: null,
  sequence,
  type: "run.progress",
  producer: { type: "worker" },
  payload: {},
  occurredAt: new Date(Date.parse(createdAt) + sequence * 1_000).toISOString(),
  createdAt: new Date(Date.parse(createdAt) + sequence * 1_000).toISOString(),
});
insertionProjection = reduceRunnerThreadEvents(insertionProjection, [
  insertionEvent("event-1", 1),
  insertionEvent("event-3", 3),
  insertionEvent("event-2", 2),
]);
assert.deepEqual(
  insertionProjection.timeline.map((item) => item.id),
  ["event-1", "event-2", "event-3"],
  "out-of-order replay events are inserted into the sorted timeline",
);
const insertionTimeline = insertionProjection.timeline;
insertionProjection = reduceRunnerThreadEvent(insertionProjection, insertionEvent("event-3", 30));
assert.strictEqual(
  insertionProjection.timeline,
  insertionTimeline,
  "replayed entities reuse their immutable timeline anchor without rebuilding the timeline",
);
assert.equal(insertionProjection.eventsById["event-3"].sequence, 3);

let sustainedProjection = reduceRunnerThreadEvent(createInitialRunnerThreadProjection("sustained-update-thread"), {
  kind: "run",
  id: "sustained-run",
  threadId: "sustained-update-thread",
  sequence: 1,
  runKind: "worker",
  status: "running",
  currentSummary: "Step 1",
  origin: { kind: "message" },
  createdAt,
});
const sustainedTimeline = sustainedProjection.timeline;
const sustainedStartedAt = performance.now();
sustainedProjection = reduceRunnerThreadEvents(
  sustainedProjection,
  Array.from({ length: 39_999 }, (_, index) => ({
    kind: "run",
    id: "sustained-run",
    threadId: "sustained-update-thread",
    sequence: index + 2,
    runKind: "worker",
    status: "running",
    currentSummary: `Step ${index + 2}`,
    origin: { kind: "message" },
    createdAt,
  })),
);
const sustainedDurationMs = performance.now() - sustainedStartedAt;
assert.strictEqual(sustainedProjection.timeline, sustainedTimeline);
assert.equal(sustainedProjection.timeline.length, 1);
assert.equal(sustainedProjection.timeline[0].sequence, 1);
assert.equal(sustainedProjection.runsById["sustained-run"].sequence, 1);
assert.equal(sustainedProjection.runsById["sustained-run"].currentSummary, "Step 40000");
assert.equal(sustainedProjection.latestSequence, 40_000);
assert.ok(
  sustainedDurationMs < 10_000,
  `40k mutable projection updates should stay well below the old full-sort path (${Math.round(sustainedDurationMs)}ms)`,
);

let communicatorReplayProjection = createInitialRunnerThreadProjection("communicator-replay-thread");
communicatorReplayProjection = reduceRunnerThreadEvent(communicatorReplayProjection, {
  kind: "event",
  id: "communicator-replay-event",
  threadId: "communicator-replay-thread",
  runId: null,
  sequence: 1,
  type: "communicator.message.created",
  producer: { type: "communicator", id: "communicator-replay-1" },
  payload: {
    message: {
      id: "communicator-replay-message",
      content: "The worker is running the compatibility tests.",
      modality: "text",
    },
  },
  occurredAt: createdAt,
  createdAt,
});
const communicatorReplayMessage = communicatorReplayProjection.messagesById["communicator-replay-message"];
assert.ok(communicatorReplayMessage.authorParticipantId, "SSE-projected messages inherit the event producer identity");
assert.equal(communicatorReplayProjection.participantsById[communicatorReplayMessage.authorParticipantId].kind, "communicator");

const mixedChronologyPage = normalizeRunnerThreadTimelinePage({
  threadId: "mixed-chronology-thread",
  data: [
    {
      id: "mixed-event-1",
      threadId: "mixed-chronology-thread",
      kind: "event",
      sequence: 1,
      runId: null,
      source: "v2",
      createdAt: "2026-07-10T08:00:00.000Z",
      payload: { type: "thread.started", producerType: "system", payloadVersion: 1, data: {} },
    },
    {
      id: "legacy:message:mixed-message",
      threadId: "mixed-chronology-thread",
      kind: "message",
      sequence: null,
      runId: null,
      source: "legacy_message",
      createdAt: "2026-07-10T08:00:01.000Z",
      payload: { messageId: "mixed-message", role: "user", content: "A legacy message between events", legacy: true },
    },
    {
      id: "mixed-event-2",
      threadId: "mixed-chronology-thread",
      kind: "event",
      sequence: 2,
      runId: null,
      source: "v2",
      createdAt: "2026-07-10T08:00:02.000Z",
      payload: { type: "thread.updated", producerType: "system", payloadVersion: 1, data: {} },
    },
  ],
  latestSequence: 2,
  hasOlder: false,
  hasNewer: false,
});
assert.deepEqual(
  mixedChronologyPage.items.map((item) => `${item.kind}:${item.id}`),
  ["event:mixed-event-1", "message:mixed-message", "event:mixed-event-2"],
  "sequence-zero legacy rows retain merged backend chronology",
);
const mixedChronologyProjection = projectRunnerThreadTimelinePage(
  createInitialRunnerThreadProjection("mixed-chronology-thread"),
  mixedChronologyPage,
);
assert.equal(mixedChronologyProjection.latestSequence, 2);
assert.deepEqual(
  selectRunnerThreadTimelineItems(mixedChronologyProjection).map((item) => `${item.kind}:${item.id}`),
  ["event:mixed-event-1", "message:mixed-message", "event:mixed-event-2"],
);

function jsonResponse(value) {
  return new Response(JSON.stringify(value), { status: 200, headers: { "Content-Type": "application/json" } });
}

function sseResponse(events) {
  const body = events.map((event) => `id: ${event.sequence}\ndata: ${JSON.stringify(event)}\n\n`).join("");
  return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(body));
      controller.close();
    },
  }), { status: 200, headers: { "Content-Type": "text/event-stream" } });
}

const requestedUrls = [];
const client = new RunnerClient(async (url, init = {}) => {
  requestedUrls.push({ url: String(url), init });
  if (String(url).includes("/timeline")) {
    return jsonResponse({
      threadId,
      items: [{ kind: "run", id: "run-1", threadId, sequence: 1, runKind: "worker", status: "running", origin: { kind: "message" }, createdAt }],
      latestSequence: 1,
      streamCursor: "1",
      olderCursor: "1",
      hasOlder: true,
      hasNewer: false,
    });
  }
  if (String(url).includes("/events")) {
    return sseResponse([{
      id: "event-stream-1",
      threadId,
      runId: "run-1",
      sequence: 5,
      type: "run.progress",
      producerType: "worker",
      payloadVersion: 1,
      payload: { summary: "Running tests" },
      occurredAt: createdAt,
      createdAt,
    }]);
  }
  if (String(url).includes("/activity/classify")) {
    return jsonResponse({
      threadId,
      decision: {
        intent: "status_question",
        route: "communicator",
        confidence: 1,
        reason: "The message asks about current work",
      },
      targetRunId: "run-1",
      targetRunStatus: "running",
      targetRunActive: true,
      suggestedTransport: "activity_message",
      shouldPersistWithActivityEndpoint: true,
      persisted: false,
    });
  }
  if (String(url).includes("/activity/messages")) {
    const body = JSON.parse(String(init.body || "{}"));
    return jsonResponse({
      object: "thread_activity_message",
      message: { id: "message-routed", threadId, role: "user", content: body.content, createdAt },
      delivery: {
        id: "delivery-routed",
        threadId,
        messageId: "message-routed",
        runId: "run-routed",
        targetType: "worker",
        targetId: "agent-routed",
        mode: "checkpoint",
        status: "queued",
        intent: "instruction",
        confidence: 0.99,
        reason: "Explicit worker route",
        createdAt,
      },
      event: {
        id: "event-routed",
        threadId,
        runId: "run-routed",
        sequence: 6,
        type: "message.routed",
        producerType: "human",
        producerId: "user-routed",
        visibility: "user",
        payloadVersion: 1,
        payload: { messageId: "message-routed" },
        occurredAt: createdAt,
        createdAt,
      },
      run: { id: "run-routed", threadId, kind: "worker", status: "queued", triggerMessageId: "message-routed", agentId: "agent-routed", createdAt },
      routeDecision: {
        intent: "instruction",
        route: "worker_checkpoint",
        reason: "Explicit worker route",
        confidence: 0.99,
      },
      communicator: {
        message: { id: "communicator-message", threadId, role: "assistant", content: "I queued that for the worker.", createdAt },
        event: {
          id: "communicator-event",
          threadId,
          runId: null,
          sequence: 7,
          type: "communicator.message.created",
          producerType: "communicator",
          producerId: "communicator-1",
          visibility: "user",
          payloadVersion: 1,
          payload: { messageId: "communicator-message" },
          occurredAt: createdAt,
          createdAt,
        },
        evidence: [{ runId: "run-routed", sequence: 6 }],
      },
      accepted: true,
      delivered: false,
      effectApplied: false,
      executionStarted: false,
      coordinatorRequired: true,
      limitation: "Coordinator injection is not active yet.",
    });
  }
  if (String(url).includes("/steering")) {
    return jsonResponse({
      delivery: { id: "steering-delivery", threadId, messageId: "steering-message", runId: "run-routed", targetType: "worker", targetId: "agent-routed", mode: "interrupt", status: "queued", createdAt },
      event: { id: "steering-event", threadId, runId: "run-routed", sequence: 8, type: "run.steering.queued", producerType: "human", payload: {}, occurredAt: createdAt, createdAt },
      accepted: true,
      delivered: false,
      effectApplied: false,
      executionStarted: false,
      coordinatorRequired: true,
      limitation: "Coordinator injection is not active yet.",
    });
  }
  return jsonResponse({ data: [] });
});

const timelinePage = await client.listThreadTimeline({ backendUrl: "https://runner.test", threadId, after: 0 });
assert.equal(timelinePage.items[0].kind, "run");
await client.listThreadTimeline({ backendUrl: "https://runner.test", threadId, includeLegacy: false });
const canonicalOnlyTimelineRequest = requestedUrls.find(
  (request) => request.url.includes("/timeline?") && request.url.includes("includeLegacy=0"),
);
assert.ok(canonicalOnlyTimelineRequest, "the canonical projection can exclude legacy mirror rows");
await client.listThreadTimeline({ backendUrl: "https://runner.test", threadId, before: 1, cursor: "1" });
const olderTimelineRequest = requestedUrls.find((request) => request.url.includes("/timeline?") && request.url.includes("before=1"));
assert.ok(olderTimelineRequest.url.includes("cursor=1"));
assert.ok(!olderTimelineRequest.url.includes("after=1"), "timeline cursor is an older-page cursor, not an SSE replay cursor");

const streamedEvents = [];
let streamOpenCount = 0;
for await (const event of client.streamThreadEvents({
  backendUrl: "https://runner.test",
  threadId,
  cursor: "4",
  onOpen: () => { streamOpenCount += 1; },
})) {
  streamedEvents.push(event);
}
assert.equal(streamOpenCount, 1, "stream readiness must be observable before the first durable event");
assert.equal(streamedEvents[0].sequence, 5);
assert.equal(streamedEvents[0].producer.type, "worker");
const streamRequest = requestedUrls.find((request) => request.url.includes("/events?"));
assert.equal(new Headers(streamRequest.init.headers).get("Last-Event-ID"), "4");
assert.ok(streamRequest.url.includes("after=4"));
assert.ok(!streamRequest.url.includes("cursor=4"));

const classification = await client.classifyThreadActivityMessage({
  backendUrl: "https://runner.test",
  threadId,
  message: { content: "What is the worker doing right now?" },
});
assert.equal(classification.decision.route, "communicator");
assert.equal(classification.decision.deliveryMode, "fyi");
assert.equal(classification.targetRunId, "run-1");
assert.equal(classification.targetRunActive, true);
assert.equal(classification.persisted, false, "routing preflight must never mutate the thread");
const classificationRequest = requestedUrls.find((request) => request.url.includes("/activity/classify"));
assert.equal(JSON.parse(String(classificationRequest.init.body)).content, "What is the worker doing right now?");

const routed = await client.postThreadRoutedMessage({
  backendUrl: "https://runner.test",
  threadId,
  message: { content: "Keep the API compatible", deliveryMode: "checkpoint", intendedRoute: "worker" },
});
assert.equal(routed.message.content, "Keep the API compatible");
assert.equal(routed.routingReceipt?.status, "queued");
assert.equal(routed.delivery?.route, "worker");
assert.equal(routed.routeDecision?.route, "worker");
assert.equal(routed.routeDecision?.deliveryMode, "checkpoint");
assert.equal(routed.routeDecision?.metadata.rawRoute, "worker_checkpoint");
assert.match(routed.message.authorParticipantId, /human:user-routed$/);
assert.equal(routed.communicator?.message.content, "I queued that for the worker.");
assert.match(routed.communicator?.message.authorParticipantId, /communicator:communicator-1$/);
assert.equal(routed.communicator?.event?.sequence, 7);
assert.equal(routed.events?.length, 2);
assert.equal(routed.coordinatorRequired, true);
assert.ok(requestedUrls.some((request) => request.url.includes(`/threads/${threadId}/activity/messages`)));
const routedRequest = requestedUrls.find((request) => request.url.includes(`/threads/${threadId}/activity/messages`));
const routedRequestBody = JSON.parse(String(routedRequest.init.body));
assert.equal(routedRequestBody.intendedRoute, "worker");
assert.equal(routedRequestBody.targetType, "worker");
assert.equal(routedRequestBody.deliveryMode, "checkpoint");
assert.equal(routedRequestBody.mode, "checkpoint");

const steeringResult = await client.steerThreadRun({
  backendUrl: "https://runner.test",
  threadId,
  runId: "run-routed",
  steering: { content: "Keep the public API stable", deliveryMode: "interrupt" },
});
assert.equal(steeringResult.run, null, "steering must not synthesize a queued run when the backend returns no run");
assert.equal(steeringResult.routingReceipt?.deliveryMode, "interrupt");
assert.equal(steeringResult.accepted, true);
assert.equal(steeringResult.effectApplied, false, "a queued command must not be presented as applied");
assert.equal(steeringResult.coordinatorRequired, true);
assert.match(steeringResult.limitation, /Coordinator injection/);
const steeringRequest = requestedUrls.find((request) => request.url.includes("/runs/run-routed/steering"));
const steeringRequestBody = JSON.parse(String(steeringRequest.init.body));
assert.equal(steeringRequestBody.deliveryMode, "interrupt");
assert.equal(steeringRequestBody.mode, "interrupt");

console.log("thread domain tests passed");
