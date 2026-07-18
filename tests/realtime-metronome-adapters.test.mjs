import assert from "node:assert/strict";
import {
  RUNNER_REALTIME_WORKER_TOOL_NAMES,
  createRunnerRealtimeCommunicatorSession,
  createRunnerRealtimeWorkerToolExecutor,
} from "../dist/realtime/index.js";
import {
  adaptMetronomeRunToThreadItems,
} from "../dist/thread/adapters/index.js";

const now = "2026-07-10T08:10:00.000Z";
let providerListener = null;
let interruptCount = 0;
const submittedToolResults = [];
const connectedCredentials = [];

const connection = {
  id: "connection-1",
  providerSessionId: "provider-session-1",
  subscribe(listener) {
    providerListener = listener;
    return () => {
      providerListener = null;
    };
  },
  sendInputAudio() {},
  commitInputAudio() {},
  sendText() {},
  setInputMuted() {},
  submitToolResult(result) {
    submittedToolResults.push(result);
  },
  interruptOutput() {
    interruptCount += 1;
  },
  close() {},
};

const provider = {
  id: "test-realtime",
  async connect(input) {
    connectedCredentials.push(input.credential);
    return connection;
  },
};

const workerRequests = [];
const toolExecutor = createRunnerRealtimeWorkerToolExecutor({
  async dispatch(request) {
    workerRequests.push({ kind: "dispatch", request });
    return {
      kind: "worker.dispatch",
      accepted: true,
      runId: "worker-run-1",
      status: "queued",
      routingReceiptId: "receipt-dispatch-1",
    };
  },
  async steer(request) {
    workerRequests.push({ kind: "steer", request });
    return {
      kind: "worker.steer",
      accepted: true,
      runId: request.runId,
      status: "queued",
      deliveryMode: request.deliveryMode,
      routingReceiptId: "receipt-steer-1",
    };
  },
});

const sessionEvents = [];
const session = createRunnerRealtimeCommunicatorSession({
  sessionId: "local-session-1",
  now: () => now,
  config: {
    threadId: "thread-voice-1",
    communicatorParticipantId: "communicator-1",
    provider: "test-realtime",
    bargeIn: { enabled: true, interruptOnSpeechStarted: true },
  },
  provider,
  credentialBroker: {
    async requestCredential(request) {
      assert.equal(request.threadId, "thread-voice-1");
      return {
        source: "server",
        id: "credential-1",
        mediaSessionId: "media-session-1",
        provider: "test-realtime",
        value: "ephemeral-secret",
        issuedAt: "2026-07-10T08:00:00.000Z",
        expiresAt: "2026-07-10T09:00:00.000Z",
      };
    },
  },
  toolExecutor,
});
session.subscribe((event) => sessionEvents.push(event));

await session.connect();
assert.equal(session.getSnapshot().status, "connected");
assert.equal(session.getSnapshot().mediaSessionId, "media-session-1");
assert.equal("runId" in session.getSnapshot(), false, "media sessions must not masquerade as worker runs");
assert.equal(connectedCredentials[0].source, "server");

providerListener({
  type: "transcript.delta",
  transcriptId: "human-utterance-1",
  speaker: "human",
  source: "input_audio",
  delta: "Please check ",
  occurredAt: now,
});
providerListener({
  type: "transcript.delta",
  transcriptId: "human-utterance-1",
  speaker: "human",
  source: "input_audio",
  delta: "the migration",
  occurredAt: now,
});
assert.equal(session.getSnapshot().transcripts.itemsById["human-utterance-1"].state, "partial");
assert.equal(session.getSnapshot().transcripts.itemsById["human-utterance-1"].text, "Please check the migration");
providerListener({
  type: "transcript.final",
  transcriptId: "human-utterance-1",
  speaker: "human",
  source: "input_audio",
  text: "Please check the migration.",
  messageId: "message-voice-1",
  occurredAt: now,
});
assert.equal(session.getSnapshot().transcripts.itemsById["human-utterance-1"].state, "final");
assert.equal(session.getSnapshot().transcripts.itemsById["human-utterance-1"].messageId, "message-voice-1");

providerListener({ type: "speech.output.started", transcriptId: "communicator-utterance-1", occurredAt: now });
providerListener({ type: "speech.input.started", transcriptId: "human-utterance-2", occurredAt: now });
assert.equal(interruptCount, 1, "barge-in should stop communicator audio");
assert.equal(session.getSnapshot().outputSpeechActive, false);
assert.ok(sessionEvents.some((event) => event.type === "speech.output_interrupted" && event.reason === "barge_in"));

providerListener({
  type: "tool.call",
  call: {
    id: "tool-call-dispatch",
    name: RUNNER_REALTIME_WORKER_TOOL_NAMES.dispatch,
    arguments: { instructions: "Inspect the migration", sourceMessageId: "message-voice-1" },
  },
  occurredAt: now,
});
providerListener({
  type: "tool.call",
  call: {
    id: "tool-call-dispatch",
    name: RUNNER_REALTIME_WORKER_TOOL_NAMES.dispatch,
    arguments: { instructions: "Inspect the migration", sourceMessageId: "message-voice-1" },
  },
  occurredAt: now,
});
providerListener({
  type: "tool.call",
  call: {
    id: "tool-call-steer",
    name: RUNNER_REALTIME_WORKER_TOOL_NAMES.steer,
    arguments: { runId: "worker-run-1", content: "Keep Node 18 support", deliveryMode: "checkpoint" },
  },
  occurredAt: now,
});
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(workerRequests.length, 2, "duplicate provider tool events must execute only once");
assert.equal(workerRequests[0].request.threadId, "thread-voice-1");
assert.equal(workerRequests[0].request.requestedByParticipantId, "communicator-1");
assert.equal(workerRequests[1].request.deliveryMode, "checkpoint");
assert.equal(submittedToolResults.length, 2);
assert.equal(submittedToolResults[0].output.runId, "worker-run-1");
assert.ok(sessionEvents.some((event) => event.type === "tool.completed"));

await session.close();
assert.equal(session.getSnapshot().status, "closed");

let resolveLateConnection;
let lateConnectionCloseCount = 0;
const lateConnection = {
  ...connection,
  id: "late-connection",
  subscribe() {
    return () => {};
  },
  close() {
    lateConnectionCloseCount += 1;
  },
};
const connectingSession = createRunnerRealtimeCommunicatorSession({
  sessionId: "closing-race-session",
  now: () => now,
  config: {
    threadId: "thread-voice-race",
    communicatorParticipantId: "communicator-1",
    provider: "delayed-provider",
  },
  credentialBroker: {
    async requestCredential() {
      return {
        source: "server",
        id: "credential-race",
        mediaSessionId: "media-session-race",
        provider: "delayed-provider",
        value: "ephemeral-secret",
        issuedAt: "2026-07-10T08:00:00.000Z",
        expiresAt: "2026-07-10T09:00:00.000Z",
      };
    },
  },
  provider: {
    id: "delayed-provider",
    connect() {
      return new Promise((resolve) => {
        resolveLateConnection = resolve;
      });
    },
  },
});
const lateConnectPromise = connectingSession.connect();
await new Promise((resolve) => setTimeout(resolve, 0));
await connectingSession.close("test_close_during_connect");
resolveLateConnection(lateConnection);
await assert.rejects(lateConnectPromise, /closed while connecting/);
assert.equal(connectingSession.getSnapshot().status, "closed", "a late connection must not reopen a closed media session");
assert.equal(lateConnectionCloseCount, 1, "a late provider connection must be cleaned up");

const metronome = adaptMetronomeRunToThreadItems({
  threadId: "workflow-thread-1",
  workflowId: "workflow-1",
  workflowName: "Daily migration check",
  sourceThreadId: "trigger-thread-1",
  sourceMessageId: "trigger-message-1",
  sequenceStart: 40,
  now,
  run: {
    id: "occurrence-1",
    metronomeId: "workflow-1",
    triggerType: "periodic",
    status: "completed",
    createdAt: "2026-07-10T08:00:00.000Z",
    startedAt: "2026-07-10T08:00:01.000Z",
    completedAt: "2026-07-10T08:04:00.000Z",
    output: { summary: "Migration checks passed" },
  },
  nodes: [
    { id: "node-trigger", kind: "trigger", label: "Daily schedule" },
    { id: "node-worker", kind: "action", label: "Inspect migration", description: "Validate compatibility" },
  ],
  timeline: [
    {
      id: "step-trigger",
      nodeId: "node-trigger",
      kind: "trigger",
      status: "completed",
      summary: "Schedule fired",
      startedAt: "2026-07-10T08:00:01.000Z",
      completedAt: "2026-07-10T08:00:02.000Z",
      permissionRing: 1,
    },
    {
      id: "step-worker",
      nodeId: "node-worker",
      kind: "action",
      status: "completed",
      summary: "Compatibility tests passed",
      startedAt: "2026-07-10T08:00:02.000Z",
      completedAt: "2026-07-10T08:03:59.000Z",
      permissionRing: 2,
    },
  ],
  childThreads: [{
    threadId: "execution-thread-1",
    runId: "worker-run-from-metronome",
    nodeId: "node-worker",
    stepId: "step-worker",
    title: "Inspect migration",
    summary: "Compatibility tests passed",
    status: "completed",
    createdAt: "2026-07-10T08:00:02.000Z",
    completedAt: "2026-07-10T08:03:59.000Z",
  }],
});

assert.equal(metronome.parentRun.runKind, "workflow");
assert.equal(metronome.parentRun.origin.kind, "metronome");
assert.equal(metronome.parentRun.origin.sourceThreadId, "trigger-thread-1");
assert.equal(metronome.parentRun.origin.sourceMessageId, "trigger-message-1");
assert.equal(metronome.parentRun.highestPermissionRing, 2);
assert.equal(metronome.activityGroups.length, 2);
assert.equal(metronome.actions.length, 2);
assert.deepEqual(
  metronome.activityGroups.map((group) => group.actionIds),
  metronome.actions.map((action) => [action.id]),
  "each workflow step group must expand to its canonical action",
);
assert.ok(metronome.actions.every((action) => action.activityGroupId));
assert.ok(metronome.actions.every((action) => action.sourceEventId));
assert.equal(metronome.parentRun.actionGroupIds.length, 2);
assert.equal(metronome.childRuns.length, 1);
assert.equal(metronome.childRuns[0].parentRunId, metronome.parentRun.id);
assert.equal(metronome.childRuns[0].threadId, "workflow-thread-1");
assert.equal(metronome.childRuns[0].metadata.executionThreadId, "execution-thread-1");
assert.ok(metronome.events.some((event) => event.type === "workflow.child_run.linked"));
assert.ok(metronome.events.some((event) => event.type === "workflow.run.completed"));
assert.ok(metronome.events.filter((event) => event.type.startsWith("workflow.node.")).every((event) => event.causationId));
assert.equal(new Set(metronome.items.map((item) => item.sequence)).size, metronome.items.length);
assert.equal(metronome.latestSequence, Math.max(...metronome.items.map((item) => item.sequence)));

console.log("realtime and Metronome adapter tests passed");
