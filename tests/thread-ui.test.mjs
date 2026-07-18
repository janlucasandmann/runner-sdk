import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createInitialRunnerThreadProjection,
  reduceRunnerThreadEvents,
} from "../dist/index.js";
import {
  RunnerChat,
  RunnerThread,
  RunnerThreadActivityGroupTree,
  RunnerThreadRunActivityCard,
} from "../dist/react/index.js";
import {
  compactRunnerThreadLiveProjection,
  createRunnerThreadDetailRequestRegistry,
  fetchRunnerThreadActivityGroupActionBatch,
  fetchRunnerThreadRunDetailBatch,
  mergeRunnerThreadDetailItems,
} from "../dist/react/thread/run-detail-hydration.js";
import {
  calculateRunnerThreadTimelineProgress,
  formatRunnerThreadTimelineClock,
} from "../dist/react/thread/run-activity-card.js";
import { RunnerPageQueueReceipt } from "../dist/react/runner-chat/execution/page-queue-receipt.js";
import { isRunnerThreadProjectionRequestCurrent } from "../dist/react/thread/use-runner-thread-projection.js";
import {
  adaptRunnerThreadActionToRunnerLog,
  describeRunnerThreadAction,
} from "../dist/react/thread/activity-action-list.js";
import { RunnerWorkLogEntry } from "../dist/react/runner-log-boxes.js";

const threadId = "thread-ui-test";
const createdAt = "2026-07-10T08:00:00.000Z";

assert.equal(calculateRunnerThreadTimelineProgress({
  timelineTop: 100,
  timelineHeight: 1_000,
  stickyBottom: 100,
  viewportBottom: 600,
}), 0);
assert.equal(calculateRunnerThreadTimelineProgress({
  timelineTop: -150,
  timelineHeight: 1_000,
  stickyBottom: 100,
  viewportBottom: 600,
}), 0.5);
assert.equal(calculateRunnerThreadTimelineProgress({
  timelineTop: -400,
  timelineHeight: 1_000,
  stickyBottom: 100,
  viewportBottom: 600,
}), 1);
assert.equal(formatRunnerThreadTimelineClock(2_000), "00:02");
assert.equal(formatRunnerThreadTimelineClock(94_000), "01:34");
assert.equal(formatRunnerThreadTimelineClock(3_723_000), "01:02:03");

const runnerChatSource = await readFile(new URL("../src/react/runner-chat.tsx", import.meta.url), "utf8");
const canonicalThreadSurfaceSource = await readFile(
  new URL("../src/react/runner-chat/canonical-thread-surface.tsx", import.meta.url),
  "utf8",
);
assert.equal(
  (runnerChatSource.match(/renderAction=\{renderCanonicalThreadAction\}/g) || []).length,
  2,
  "RunnerChat must bind the original typed log renderer to both canonical and legacy surfaces",
);
assert.equal(
  (canonicalThreadSurfaceSource.match(/renderAction=\{renderAction\}/g) || []).length,
  4,
  "the canonical surface must carry its typed renderer through main and compatibility timelines",
);

assert.equal(describeRunnerThreadAction({
  status: "completed",
  type: "action_summary",
  title: "write_file",
  summary: "Writing: /workspace/jojojo.txt",
  input: { path: "/workspace/jojojo.txt", content: "hi" },
  output: JSON.stringify({ type: "create", filePath: "/workspace/jojojo.txt" }),
}), "Created jojojo.txt");
assert.equal(describeRunnerThreadAction({
  status: "completed",
  type: "command_execution",
  title: "bash",
  summary: "$ rm /workspace/jojojo.txt",
  input: { command: "rm /workspace/jojojo.txt" },
}), "Deleted jojojo.txt");
assert.equal(describeRunnerThreadAction({
  status: "completed",
  type: "command_execution",
  title: "command_execution",
  summary: "Completed command_execution",
  input: { command: "python3 /workspace/.claude/skills/web-search/scripts/search.py query" },
  output: JSON.stringify({ query: "how tall is Donald Trump" }),
}), "Searched the web for “how tall is Donald Trump”");

const clickableFileAction = {
  kind: "action",
  id: "clickable-file-action",
  threadId,
  runId: "run-1",
  sequence: 1,
  status: "completed",
  type: "action_summary",
  title: "write_file",
  summary: "Writing: /workspace/jojojo.txt",
  input: { path: "/workspace/jojojo.txt", content: "hi" },
  output: JSON.stringify({ type: "create", filePath: "/workspace/jojojo.txt" }),
  metadata: {
    source: "legacy_log",
    legacyEventType: "file_change",
    output: JSON.stringify({ type: "create", filePath: "/workspace/jojojo.txt", content: "hi" }),
    filePaths: ["/workspace/jojojo.txt"],
    changeKinds: ["created"],
  },
  permissionRing: 1,
  createdAt,
};
const restoredFileLog = adaptRunnerThreadActionToRunnerLog(clickableFileAction);
assert.equal(restoredFileLog.eventType, "file_change");
const restoredFileLogMarkup = renderToStaticMarkup(React.createElement(RunnerWorkLogEntry, {
  log: restoredFileLog,
  onPreviewDocument: () => undefined,
}));
assert.match(restoredFileLogMarkup, /tb-log-compact-action/);
assert.match(restoredFileLogMarkup, /Created file/);
assert.match(restoredFileLogMarkup, /\/workspace\/jojojo.txt/);
assert.doesNotMatch(restoredFileLogMarkup, />Details</);

const webSearchLogMarkup = renderToStaticMarkup(React.createElement(RunnerWorkLogEntry, {
  log: {
    time: "00:00:01",
    message: "Web search completed",
    type: "success",
    eventType: "command_execution",
    metadata: {
      command: 'python /workspace/.claude/skills/web-search/search.py "thread architecture"',
      output: JSON.stringify({
        query: "thread architecture",
        results: [{ title: "Thread architecture", url: "https://example.com/thread" }],
      }),
      exitCode: 0,
    },
  },
}));
assert.match(webSearchLogMarkup, /tb-log-web-search-compact/);
assert.match(webSearchLogMarkup, /thread architecture/);

const browserLogMarkup = renderToStaticMarkup(React.createElement(RunnerWorkLogEntry, {
  backendUrl: "https://runner.test",
  environmentId: "environment-1",
  log: {
    time: "00:00:02",
    message: "Captured the browser",
    type: "success",
    eventType: "command_execution",
    metadata: {
      command: "node /workspace/.claude/skills/browser/browser.mjs screenshot",
      output: JSON.stringify({
        ok: true,
        action: "screenshot",
        url: "https://example.com",
        title: "Example",
        screenshotPaths: ["/workspace/tmp/browser.png"],
      }),
      exitCode: 0,
    },
  },
}));
assert.match(browserLogMarkup, /tb-log-card-browser/);
assert.match(browserLogMarkup, /Capture screen/);
assert.match(browserLogMarkup, /example\.com/);

assert.equal(isRunnerThreadProjectionRequestCurrent("thread-a", 4, "thread-a", 4), true);
assert.equal(isRunnerThreadProjectionRequestCurrent("thread-a", 4, "thread-b", 4), false, "old-thread responses are stale");
assert.equal(isRunnerThreadProjectionRequestCurrent("thread-a", 4, "thread-a", 5), false, "pre-reconnect responses are stale");

const participants = [
  { id: "human", threadId, kind: "human", displayName: "You", createdAt },
  { id: "communicator", threadId, kind: "communicator", displayName: "Communicator", createdAt },
  { id: "worker", threadId, kind: "worker", displayName: "Developer", createdAt },
];

const run = {
  kind: "run",
  id: "run-1",
  threadId,
  sequence: 2,
  runKind: "worker",
  status: "running",
  actorParticipantId: "worker",
  sourceMessageId: "message-1",
  title: "Fix authentication",
  summary: null,
  currentSummary: "Updating the authentication flow and validating affected tests",
  origin: { kind: "message", sourceMessageId: "message-1" },
  highestPermissionRing: 3,
  actionGroupIds: ["group-1"],
  createdAt,
  startedAt: createdAt,
};

const items = [
  {
    kind: "message",
    id: "message-1",
    threadId,
    sequence: 1,
    authorParticipantId: "human",
    content: "Fix authentication without changing the public API.",
    modality: "text",
    status: "delivered",
    linkedRunIds: ["run-1"],
    routingReceiptId: "receipt-1",
    createdAt,
  },
  run,
  {
    kind: "routing_receipt",
    id: "receipt-1",
    threadId,
    messageId: "message-1",
    sequence: 3,
    route: "worker",
    deliveryMode: "checkpoint",
    status: "delivered",
    runId: "run-1",
    deliveredAtSequence: 3,
    createdAt,
  },
  {
    kind: "activity_group",
    id: "group-1",
    threadId,
    runId: "run-1",
    sequence: 4,
    version: 1,
    status: "open",
    title: "Validate backward compatibility",
    liveSummary: "Running integration tests against the existing API",
    rationale: "The public API must remain compatible.",
    actionIds: ["action-1"],
    startSequence: 4,
    endSequence: null,
    highestPermissionRing: 1,
    metrics: { actionCount: 1, durationMs: 3_000 },
    createdAt,
  },
  {
    kind: "action",
    id: "action-1",
    threadId,
    runId: "run-1",
    activityGroupId: "group-1",
    sequence: 5,
    type: "command_execution",
    title: "Run integration tests",
    summary: "Authentication integration suite passed",
    status: "completed",
    toolName: "bash",
    permissionRing: 1,
    input: { command: "npm test" },
    output: "24 tests passed",
    createdAt,
  },
  {
    kind: "permission",
    id: "permission-1",
    threadId,
    runId: "run-1",
    activityGroupId: "group-1",
    sequence: 6,
    status: "pending",
    permissionRing: 3,
    actionLabel: "Deploy the validated build",
    actionDescription: "Publish the current build to the production environment.",
    toolName: "deploy",
    input: { environment: "production" },
    requestedAt: createdAt,
    createdAt,
  },
];

const projection = reduceRunnerThreadEvents(
  createInitialRunnerThreadProjection({ threadId, participants }),
  items,
);

const collapsedMarkup = renderToStaticMarkup(React.createElement(RunnerThread, { projection }));
assert.match(collapsedMarkup, /class="tb-thread-user-message-time"/);
assert.match(collapsedMarkup, /dateTime="2026-07-10T08:00:00.000Z"/);
assert.ok(
  collapsedMarkup.indexOf("tb-thread-user-message-time") < collapsedMarkup.indexOf("Fix authentication without changing the public API"),
  "the centered user timestamp must render above its message",
);
assert.match(collapsedMarkup, /Validate backward compatibility/);
assert.doesNotMatch(
  collapsedMarkup,
  /Running integration tests against the existing API/,
  "the collapsed label must use the observer phase, not its action-level live summary",
);
assert.match(collapsedMarkup, /Permission required/);
assert.match(collapsedMarkup, /Ring 3/);
assert.equal((collapsedMarkup.match(/Permission required/g) || []).length, 1, "a promoted permission must not duplicate inside its run card");
assert.ok(
  collapsedMarkup.indexOf("Permission required") < collapsedMarkup.indexOf("Fix authentication without changing the public API"),
  "a pending permission must be promoted into the live supervision dock",
);
assert.match(collapsedMarkup, /Permission requested · Deploy the validated build/);
assert.ok(
  collapsedMarkup.indexOf("Permission requested · Deploy the validated build") > collapsedMarkup.lastIndexOf("tb-thread-run-card"),
  "the historical marker must preserve the request's causal trace position without duplicating its controls",
);
assert.doesNotMatch(collapsedMarkup, /24 tests passed/, "raw action output must not mount while the run is collapsed");

const noisyProjection = reduceRunnerThreadEvents(projection, Array.from({ length: 250 }, (_, index) => ({
  kind: "event",
  id: `noisy-action-event-${index + 1}`,
  threadId,
  runId: "run-1",
  sequence: 100 + index,
  type: "thread.action.started",
  producer: { type: "worker" },
  visibility: "run",
  summary: `Noisy action ${index + 1}`,
  payload: {
    actionId: `noisy-action-${index + 1}`,
    type: "command_execution",
    title: `Noisy action ${index + 1}`,
    status: "completed",
  },
  occurredAt: new Date(Date.parse(createdAt) + index).toISOString(),
  createdAt: new Date(Date.parse(createdAt) + index).toISOString(),
})));
const noisyCollapsedMarkup = renderToStaticMarkup(React.createElement(RunnerThread, {
  projection: noisyProjection,
  maxMountedTimelineItems: 20,
}));
assert.match(noisyCollapsedMarkup, /Validate backward compatibility/, "hidden run events must not evict the run card");
assert.equal((noisyCollapsedMarkup.match(/Permission required/g) || []).length, 1);
assert.doesNotMatch(noisyCollapsedMarkup, /Running integration tests against the existing API/);
assert.doesNotMatch(noisyCollapsedMarkup, /Noisy action 250/, "run-scoped events stay inside the collapsed run projection");

const permissionOutsideWindowProjection = reduceRunnerThreadEvents(
  projection,
  Array.from({ length: 250 }, (_, index) => ({
    kind: "message",
    id: `post-permission-message-${index + 1}`,
    threadId,
    sequence: 100 + index,
    authorParticipantId: "human",
    content: `Post-permission message ${index + 1}`,
    modality: "text",
    status: "delivered",
    createdAt: new Date(Date.parse(createdAt) + 10_000 + index).toISOString(),
  })),
);
const permissionOutsideWindowMarkup = renderToStaticMarkup(React.createElement(RunnerThread, {
  projection: permissionOutsideWindowProjection,
  maxMountedTimelineItems: 20,
}));
assert.match(permissionOutsideWindowMarkup, /Post-permission message 250/);
assert.doesNotMatch(permissionOutsideWindowMarkup, /Permission requested · Deploy the validated build/);
assert.equal(
  (permissionOutsideWindowMarkup.match(/Permission required/g) || []).length,
  1,
  "an unresolved permission remains mounted even when its historical anchor is outside the virtualized window",
);

const expandedMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: projection.runsById["run-1"],
  projection,
  fallbackAgentName: "Code Agent",
  fallbackWorkspaceName: "Authentication Project",
  defaultExpanded: true,
}));
assert.match(expandedMarkup, /Code Agent<\/span><span class="tb-thread-run-context-workspace"> on Authentication Project/);
assert.match(expandedMarkup, /Running integration tests against the existing API/);
assert.doesNotMatch(expandedMarkup, />Working</);
assert.doesNotMatch(expandedMarkup, />1 group</);
assert.match(expandedMarkup, /tb-thread-run-headline-copy">Validate backward compatibility\.\.\.<\/span>/);
assert.match(expandedMarkup, /tb-thread-run-dot-loader/);
assert.ok(
  expandedMarkup.indexOf("tb-thread-run-dot-loader") < expandedMarkup.indexOf("tb-thread-run-headline-copy"),
  "the active-run dot loader renders to the left of the working label",
);
assert.match(expandedMarkup, /class="tb-thread-run-supervision-header"/);
assert.match(expandedMarkup, /class="tb-thread-run-time-progress" role="progressbar"/);
assert.match(expandedMarkup, /aria-label="Position in work timeline"/);
assert.match(expandedMarkup, /class="tb-thread-run-time-progress-label">00:00 of 00:00<\/span>/);
assert.match(expandedMarkup, /tb-thread-permission-ring-icon is-ring-1/);
assert.match(expandedMarkup, /aria-label="Ring 1"/);
assert.doesNotMatch(expandedMarkup, /role="tab"[^>]*>Ring 3<\/button>/);
assert.match(
  expandedMarkup,
  /tb-thread-activity-group-duration">Worked for 3s<\/span><\/span><span class="tb-thread-activity-group-chevron"/,
  "the activity-group chevron sits immediately after its duration label",
);

assert.match(expandedMarkup, /tb-thread-activity-group-header" aria-expanded="false"/);
assert.doesNotMatch(expandedMarkup, /Run integration tests/);
assert.doesNotMatch(expandedMarkup, /Details/);
assert.doesNotMatch(expandedMarkup, /tb-thread-activity-group-rationale/);
assert.doesNotMatch(expandedMarkup, /The public API must remain compatible/);

const completedGroupProjection = {
  ...projection,
  activityGroupsById: {
    "group-1": { ...projection.activityGroupsById["group-1"], status: "sealed" },
  },
};
const timestampFallbackProjection = {
  ...completedGroupProjection,
  actionsById: {
    "action-1": {
      ...completedGroupProjection.actionsById["action-1"],
      startedAt: "2026-07-10T08:00:01.000Z",
      completedAt: "2026-07-10T08:00:09.000Z",
      createdAt: "2026-07-10T08:00:01.000Z",
    },
  },
  activityGroupsById: {
    "group-1": {
      ...completedGroupProjection.activityGroupsById["group-1"],
      metrics: { actionCount: 1, durationMs: 0 },
      createdAt: "2026-07-10T08:00:01.000Z",
      updatedAt: "2026-07-10T08:00:01.000Z",
      sealedAt: null,
    },
  },
};
const timestampFallbackMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: timestampFallbackProjection.runsById["run-1"],
  projection: timestampFallbackProjection,
  defaultExpanded: true,
}));
assert.match(timestampFallbackMarkup, /tb-thread-activity-group-duration">Worked for 8s<\/span>/);

const ringFilterGroups = [
  {
    ...timestampFallbackProjection.activityGroupsById["group-1"],
    id: "ring-1-group",
    title: "Local-only group",
    liveSummary: "Local-only work",
    highestPermissionRing: 1,
    actionIds: ["ring-1-action"],
    startSequence: 1,
  },
  {
    ...timestampFallbackProjection.activityGroupsById["group-1"],
    id: "ring-2-group",
    title: "External-read group",
    liveSummary: "External-read work",
    highestPermissionRing: 2,
    actionIds: ["ring-2-action"],
    startSequence: 2,
  },
];
const ringFilterActions = {
  "ring-1-action": {
    ...timestampFallbackProjection.actionsById["action-1"],
    id: "ring-1-action",
    activityGroupId: "ring-1-group",
    permissionRing: null,
  },
  "ring-2-action": {
    ...timestampFallbackProjection.actionsById["action-1"],
    id: "ring-2-action",
    activityGroupId: "ring-2-group",
    permissionRing: null,
  },
};
const ring2FilterMarkup = renderToStaticMarkup(React.createElement(RunnerThreadActivityGroupTree, {
  groups: ringFilterGroups,
  actionsById: ringFilterActions,
  permissions: [],
  filter: "ring2",
}));
assert.match(ring2FilterMarkup, /External-read work/);
assert.doesNotMatch(ring2FilterMarkup, /Local-only work/);
assert.match(ring2FilterMarkup, /ring-2-group|Ring 2/);
const completedGroupMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: completedGroupProjection.runsById["run-1"],
  projection: completedGroupProjection,
  defaultExpanded: true,
}));
assert.match(completedGroupMarkup, /tb-thread-activity-group-header" aria-expanded="false"/);
assert.doesNotMatch(completedGroupMarkup, /Run integration tests/, "completed activity groups are collapsed initially");

function renderLegacyGroupWithoutRing(title) {
  const legacyGroup = {
    ...projection.activityGroupsById["group-1"],
    id: `legacy-group-${title}`,
    title,
    liveSummary: title,
    highestPermissionRing: null,
    actionIds: [],
    metrics: { actionCount: 1 },
  };
  const legacyProjection = {
    ...projection,
    activityGroupsById: { [legacyGroup.id]: legacyGroup },
    actionsById: {},
    permissionsById: {},
  };
  return renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
    run: projection.runsById["run-1"],
    projection: legacyProjection,
    defaultExpanded: true,
  }));
}

const legacyLocalRingMarkup = renderLegacyGroupWithoutRing("Creating a file in the local workspace");
assert.match(legacyLocalRingMarkup, /tb-thread-permission-ring-icon is-ring-1/);
assert.match(legacyLocalRingMarkup, /lucide-arrow-down-to-line/);
assert.doesNotMatch(legacyLocalRingMarkup, /is-ring-unknown|Unclassified permission ring|lucide-shield/);

const legacySharedRingMarkup = renderLegacyGroupWithoutRing("Reading external documentation with WebFetch");
assert.match(legacySharedRingMarkup, /tb-thread-permission-ring-icon is-ring-2/);
assert.match(legacySharedRingMarkup, /lucide-user-round/);

const legacyPublicRingMarkup = renderLegacyGroupWithoutRing("Deploying the public release");
assert.match(legacyPublicRingMarkup, /tb-thread-permission-ring-icon is-ring-3/);
assert.match(legacyPublicRingMarkup, /lucide-arrow-up-from-line/);

const localQueueMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: {
    ...projection.runsById["run-1"],
    id: "page-queued-run",
    status: "queued",
    currentSummary: "Executing npm test -- --runInBand",
    summary: null,
    metadata: { pageResidentQueue: true, coordinatorDurable: false },
  },
  projection,
}));
assert.match(localQueueMarkup, /tb-thread-run-headline-copy">Queued in this page<\/span>/);
assert.doesNotMatch(localQueueMarkup, /tb-thread-run-dot-loader/);
assert.doesNotMatch(localQueueMarkup, /Executing npm test/, "worker progress must not become the working label");
const localQueueReceiptMarkup = renderToStaticMarkup(React.createElement(RunnerPageQueueReceipt));
assert.match(localQueueReceiptMarkup, /Queued in this page/);
assert.match(localQueueReceiptMarkup, /Not persisted/);

const explicitObserverProjection = {
  ...projection,
  runsById: {
    "observer-status-run": {
      ...projection.runsById["run-1"],
      id: "observer-status-run",
      currentSummary: "Executing curl -X POST against the test service",
      actionGroupIds: [],
    },
  },
  activityGroupsById: {},
  eventsById: {
    "observer-status-event": {
      kind: "event",
      id: "observer-status-event",
      threadId,
      runId: "observer-status-run",
      sequence: 7,
      type: "thread.run.projection.updated",
      producer: { type: "communicator" },
      visibility: "run",
      payload: {
        workingSummary: "Reviewing the authentication changes",
        currentSummary: "Executing curl -X POST against the test service",
      },
      occurredAt: createdAt,
      createdAt,
    },
  },
};
const explicitObserverMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: explicitObserverProjection.runsById["observer-status-run"],
  projection: explicitObserverProjection,
}));
assert.match(explicitObserverMarkup, /Reviewing the authentication changes/);
assert.doesNotMatch(explicitObserverMarkup, /Executing curl/, "explicit observer text must win over command-level summaries");

const progressOnlyRun = {
  ...run,
  id: "run-progress-only",
  status: "completed",
  title: "Answer directly",
  currentSummary: "Hi",
  actionGroupIds: [],
  highestPermissionRing: null,
  completedAt: new Date(Date.parse(createdAt) + 3_000).toISOString(),
};
const progressOnlyEvent = {
  kind: "event",
  id: "event-progress-only",
  threadId,
  runId: progressOnlyRun.id,
  sequence: 3,
  type: "thread.worker.progress",
  producer: { type: "worker" },
  visibility: "run",
  summary: "Analyzing context and deciding the next step.",
  payload: {
    summary: "Analyzing context and deciding the next step.",
    content: "raw private reasoning must not be rendered",
  },
  occurredAt: new Date(Date.parse(createdAt) + 2_000).toISOString(),
  createdAt: new Date(Date.parse(createdAt) + 2_000).toISOString(),
};
const progressOnlyProjection = {
  ...createInitialRunnerThreadProjection(threadId),
  participantsById: Object.fromEntries(participants.map((participant) => [participant.id, participant])),
  runsById: { [progressOnlyRun.id]: progressOnlyRun },
  eventsById: { [progressOnlyEvent.id]: progressOnlyEvent },
};
const progressOnlyMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: progressOnlyRun,
  projection: progressOnlyProjection,
  defaultExpanded: true,
  detailLoadState: { status: "loaded", error: null, loadedCount: 0 },
}));
assert.match(progressOnlyMarkup, /Completed without tool activity/);
assert.match(progressOnlyMarkup, /Worked for 3s/);
assert.match(progressOnlyMarkup, /Analyzing context and deciding the next step/);
assert.doesNotMatch(progressOnlyMarkup, /raw private reasoning/, "progress-only details must never render raw reasoning payloads");

const longRunMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: {
    ...progressOnlyRun,
    completedAt: new Date(Date.parse(createdAt) + 125_000).toISOString(),
  },
  projection: progressOnlyProjection,
}));
assert.match(longRunMarkup, /Worked for 2 min 5s/);
assert.doesNotMatch(localQueueMarkup, />Starting</, "a page-resident follow-up must not look durably started");

const loadingDetailsMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: projection.runsById["run-1"],
  projection,
  defaultExpanded: true,
  detailLoadState: { status: "loading", error: null },
  activityGroupActionStates: { "group-1": { status: "loading", error: null } },
}));
assert.match(loadingDetailsMarkup, /Loading detailed activity/);
assert.doesNotMatch(loadingDetailsMarkup, /Loading group actions/, "collapsed groups defer their action-level loading state");

const failedDetailsMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: projection.runsById["run-1"],
  projection,
  defaultExpanded: true,
  detailLoadState: { status: "error", error: "Detail endpoint unavailable" },
  onLoadDetails: async () => undefined,
}));
assert.match(failedDetailsMarkup, /Detail endpoint unavailable/);
assert.match(failedDetailsMarkup, /Retry/);

const requestRegistry = createRunnerThreadDetailRequestRegistry();
let registryLoads = 0;
let releaseRegistryLoad;
const registryBarrier = new Promise((resolve) => { releaseRegistryLoad = resolve; });
const firstRegistryRequest = requestRegistry.run("run-1", async () => {
  registryLoads += 1;
  await registryBarrier;
});
const duplicateRegistryRequest = requestRegistry.run("run-1", async () => {
  registryLoads += 1;
});
assert.strictEqual(firstRegistryRequest, duplicateRegistryRequest, "concurrent expansion requests share one promise");
releaseRegistryLoad();
await firstRegistryRequest;
await requestRegistry.run("run-1", async () => { registryLoads += 1; });
assert.equal(registryLoads, 1, "successful detail loads remain cached");
requestRegistry.reset();
await requestRegistry.run("run-1", async () => { registryLoads += 1; });
assert.equal(registryLoads, 2, "thread resets invalidate completed detail loads");

const actionRequests = [];
const hydrationClient = {
  async listThreadActivityGroups(options) {
    assert.equal(options.runId, "hydrated-run");
    assert.equal(options.limit, 500);
    return Array.from({ length: 501 }, (_, index) => ({
      id: `hydrated-group-${index + 1}`,
      sequence: index + 1,
      startSequence: index + 1,
    }));
  },
  async listThreadActions(options) {
    actionRequests.push({ after: options.after, groupId: options.groupId, limit: options.limit });
    if (options.groupId) {
      return Array.from({ length: 500 }, (_, index) => ({ id: `group-action-${index + 1}`, sequence: index + 1 }));
    }
    if (options.after === 500) {
      return Array.from({ length: 500 }, (_, index) => ({ id: `run-action-${index + 501}`, sequence: index + 501 }));
    }
    return Array.from({ length: 2 }, (_, index) => ({ id: `run-action-${index + 1_001}`, sequence: index + 1_001 }));
  },
};
const hydratedRunBatch = await fetchRunnerThreadRunDetailBatch(hydrationClient, {
  backendUrl: "https://runner.test",
  threadId,
}, "hydrated-run");
assert.equal(hydratedRunBatch.groupCount, 500, "run hydration keeps the group index bounded");
assert.equal(hydratedRunBatch.groupsTruncated, true);
assert.equal(hydratedRunBatch.actionCount, 502, "run action hydration advances through bounded pages");
assert.deepEqual(actionRequests.slice(0, 2), [
  { after: 500, groupId: undefined, limit: 500 },
  { after: 1_000, groupId: undefined, limit: 500 },
]);
const hydratedGroupBatch = await fetchRunnerThreadActivityGroupActionBatch(hydrationClient, {
  backendUrl: "https://runner.test",
  threadId,
}, "hydrated-group-1", "hydrated-run");
assert.equal(hydratedGroupBatch.actions.length, 500);
assert.equal(hydratedGroupBatch.truncated, true);
assert.deepEqual(actionRequests[2], { after: undefined, groupId: "hydrated-group-1", limit: 500 });

const detailTimelineBefore = projection.timeline;
const detailMergedProjection = mergeRunnerThreadDetailItems(projection, [{
  ...projection.actionsById["action-1"],
  id: "hydrated-action",
  sequence: 700,
  title: "Hydrated without a top-level anchor",
}]);
assert.strictEqual(detailMergedProjection.timeline, detailTimelineBefore, "nested detail hydration must not grow the global timeline");
assert.equal(detailMergedProjection.actionsById["hydrated-action"].metadata.detailHydrated, true);

const distinctCount = 40_000;
const distinctActions = Array.from({ length: distinctCount }, (_, index) => ({
  kind: "action",
  id: `distinct-action-${index}`,
  threadId: "distinct-live-thread",
  runId: "distinct-run",
  sequence: index + 1,
  sourceEventId: `distinct-event-${index}`,
  type: "command_execution",
  title: `Distinct action ${index}`,
  status: index === 0 ? "failed" : "completed",
  metadata: index === 1 ? { detailHydrated: true } : null,
  createdAt,
}));
const distinctEvents = Array.from({ length: distinctCount }, (_, index) => ({
  kind: "event",
  id: `distinct-event-${index}`,
  threadId: "distinct-live-thread",
  runId: "distinct-run",
  sequence: index + 1,
  type: "thread.action.completed",
  producer: { type: "worker" },
  payload: {},
  occurredAt: createdAt,
  createdAt,
}));
const distinctBase = createInitialRunnerThreadProjection("distinct-live-thread");
const distinctProjection = {
  ...distinctBase,
  actionsById: Object.fromEntries(distinctActions.map((action) => [action.id, action])),
  eventsById: Object.fromEntries(distinctEvents.map((event) => [event.id, event])),
  activityGroupsById: {
    "open-distinct-group": {
      kind: "activity_group",
      id: "open-distinct-group",
      threadId: "distinct-live-thread",
      runId: "distinct-run",
      sequence: 1,
      version: 1,
      status: "open",
      title: "Active phase",
      liveSummary: "Still working",
      actionIds: ["distinct-action-2"],
      eventIds: ["distinct-event-2"],
      startSequence: 1,
      endSequence: null,
      createdAt,
    },
  },
  timeline: [
    ...distinctEvents.map((event) => ({ kind: "event", id: event.id, sequence: event.sequence, createdAt })),
    ...distinctActions.map((action) => ({ kind: "action", id: action.id, sequence: action.sequence, createdAt })),
  ],
};
const compactStartedAt = performance.now();
const compactProjection = compactRunnerThreadLiveProjection(distinctProjection);
const compactDurationMs = performance.now() - compactStartedAt;
assert.ok(Object.keys(compactProjection.actionsById).length <= 1_003, "40k live actions compact to the latest window plus protected evidence");
assert.ok(Object.keys(compactProjection.eventsById).length <= 1_003, "40k live events compact to the latest window plus protected evidence");
assert.ok(compactProjection.actionsById["distinct-action-0"], "failed actions survive compaction");
assert.ok(compactProjection.actionsById["distinct-action-1"], "user-hydrated actions survive compaction");
assert.ok(compactProjection.actionsById["distinct-action-2"], "active-group actions survive compaction");
assert.ok(!compactProjection.actionsById["distinct-action-100"], "stale unprotected actions are evicted");
assert.equal(compactProjection.timeline.length, Object.keys(compactProjection.actionsById).length + Object.keys(compactProjection.eventsById).length);
assert.ok(compactDurationMs < 10_000, `40k distinct live details should compact promptly (${Math.round(compactDurationMs)}ms)`);

const deepItems = [];
for (let depth = 1; depth <= 5; depth += 1) {
  deepItems.push({
    kind: "activity_group",
    id: `deep-group-${depth}`,
    threadId,
    runId: "run-1",
    sequence: 10 + depth,
    version: 1,
    status: "open",
    title: `Nested phase ${depth}`,
    liveSummary: `Nested phase ${depth}`,
    parentGroupId: depth === 1 ? null : `deep-group-${depth - 1}`,
    actionIds: depth === 5 ? ["deep-action"] : [],
    startSequence: 10 + depth,
    endSequence: null,
    createdAt,
  });
}
deepItems.push({
  kind: "action",
  id: "deep-action",
  threadId,
  runId: "run-1",
  activityGroupId: "deep-group-5",
  sequence: 20,
  type: "subagent_invocation",
  title: "Deeply nested worker action",
  status: "completed",
  createdAt,
});
const deepProjection = reduceRunnerThreadEvents(projection, deepItems);
const deepMarkup = renderToStaticMarkup(React.createElement(RunnerThreadRunActivityCard, {
  run: deepProjection.runsById["run-1"],
  projection: deepProjection,
  defaultExpanded: true,
}));
assert.match(deepMarkup, /Nested phase 1/, "the root summary of deep activity remains visible while collapsed");
assert.doesNotMatch(deepMarkup, /Deeply nested worker action/, "deep action evidence stays collapsed initially");

const longProjection = reduceRunnerThreadEvents(
  createInitialRunnerThreadProjection({ threadId: "long-thread", participants: [participants[0]] }),
  Array.from({ length: 250 }, (_, index) => ({
    kind: "message",
    id: `long-message-${index + 1}`,
    threadId: "long-thread",
    sequence: index + 1,
    authorParticipantId: "human",
    content: `Long thread message ${index + 1}`,
    modality: "text",
    status: "delivered",
    createdAt: new Date(Date.parse(createdAt) + index).toISOString(),
  })),
);
const boundedMarkup = renderToStaticMarkup(React.createElement(RunnerThread, {
  projection: longProjection,
  maxMountedTimelineItems: 50,
}));
assert.match(boundedMarkup, /Long thread message 250/);
assert.doesNotMatch(boundedMarkup, /Long thread message 1</, "the initial DOM must remain bounded to the latest window");
assert.match(boundedMarkup, /Load earlier activity/);

const canonicalRunnerChatMarkup = renderToStaticMarkup(React.createElement(RunnerChat, {
  backendUrl: "https://runner.invalid",
  apiKey: "test-key",
  threadId: "canonical-thread",
  threadViewMode: "canonical",
}));
assert.match(canonicalRunnerChatMarkup, /Loading conversation…/, "RunnerChat must mount the canonical Thread v2 surface in canonical mode");
assert.doesNotMatch(canonicalRunnerChatMarkup, /No logs yet/, "the legacy turn placeholder must not leak into the canonical surface");

const compatibleRunnerChatMarkup = renderToStaticMarkup(React.createElement(RunnerChat, {
  backendUrl: "https://runner.invalid",
  apiKey: "test-key",
  threadId: "legacy-compatible-thread",
  threadViewMode: "auto",
}));
assert.match(compatibleRunnerChatMarkup, /No logs yet/, "auto mode must preserve the legacy renderer until canonical data is authoritative");

console.log("Thread UI rendering test passed.");
