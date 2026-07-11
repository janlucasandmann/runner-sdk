import http from "node:http";
import fs from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInitialRunnerThreadProjection, reduceRunnerThreadEvents } from "../dist/index.js";
import { RunnerThreadMessageView, RunnerThreadRunActivityCard } from "../dist/react/index.js";

const threadId = "thread-preview";
const createdAt = new Date(Date.now() - 8 * 60_000).toISOString();
const human = { id: "human", threadId, kind: "human", displayName: "You", createdAt };
const communicator = { id: "communicator", threadId, kind: "communicator", displayName: "Communicator", createdAt };
const worker = { id: "worker", threadId, kind: "worker", displayName: "Developer", createdAt };
const run = {
  kind: "run",
  id: "run-preview",
  threadId,
  sequence: 2,
  runKind: "worker",
  status: "running",
  actorParticipantId: worker.id,
  title: "Refactor the authentication flow",
  currentSummary: "Updating the authentication flow and validating affected tests",
  origin: { kind: "message", sourceMessageId: "message-1" },
  highestPermissionRing: 3,
  actionGroupIds: ["group-diagnose", "group-implement", "group-validate"],
  startedAt: createdAt,
  createdAt,
};

const items = [
  run,
  {
    kind: "activity_group", id: "group-diagnose", threadId, runId: run.id, sequence: 3, version: 1,
    status: "sealed", title: "Diagnose the refresh-token regression", liveSummary: "Identified a mismatched cookie scope",
    rationale: "The worker reproduced the expired-token request before changing code.", actionIds: ["action-read", "action-reproduce"],
    startSequence: 3, endSequence: 5, highestPermissionRing: 1, createdAt,
  },
  {
    kind: "activity_group", id: "group-implement", threadId, runId: run.id, sequence: 6, version: 2,
    status: "sealed", title: "Update token refresh behavior", liveSummary: "Preserved the public API while fixing cookie handling",
    actionIds: ["action-edit"], startSequence: 6, endSequence: 7, highestPermissionRing: 1, createdAt,
  },
  {
    kind: "activity_group", id: "group-validate", threadId, runId: run.id, sequence: 8, version: 3,
    status: "open", title: "Validate backward compatibility", liveSummary: "Running integration tests against existing clients",
    rationale: "The requested change must retain Node 18 and existing response types.", actionIds: ["action-test"],
    startSequence: 8, endSequence: null, highestPermissionRing: 1, createdAt,
  },
  {
    kind: "action", id: "action-read", threadId, runId: run.id, activityGroupId: "group-diagnose", sequence: 4,
    type: "file_read", title: "Inspect authentication middleware", summary: "Read the token and cookie configuration",
    status: "completed", toolName: "read", permissionRing: 1, createdAt,
  },
  {
    kind: "action", id: "action-reproduce", threadId, runId: run.id, activityGroupId: "group-diagnose", sequence: 5,
    type: "command_execution", title: "Reproduce expired-token request", summary: "Confirmed the cookie path mismatch",
    status: "completed", toolName: "bash", permissionRing: 1, createdAt,
  },
  {
    kind: "action", id: "action-edit", threadId, runId: run.id, activityGroupId: "group-implement", sequence: 7,
    type: "file_change", title: "Update refresh handler", summary: "Changed two files without altering exported types",
    status: "completed", toolName: "apply_patch", permissionRing: 1, createdAt,
  },
  {
    kind: "action", id: "action-test", threadId, runId: run.id, activityGroupId: "group-validate", sequence: 9,
    type: "command_execution", title: "Run authentication integration tests", summary: "24 tests passed; compatibility suite still running",
    status: "running", toolName: "bash", permissionRing: 1, input: { command: "npm test -- auth" }, createdAt,
  },
  {
    kind: "permission", id: "permission-preview", threadId, runId: run.id, activityGroupId: "group-validate", sequence: 10,
    status: "pending", permissionRing: 3, actionLabel: "Deploy the validated build",
    actionDescription: "Publish the current revision to the production environment after tests finish.", toolName: "deploy",
    input: { environment: "production", revision: "auth-refresh" }, requestedAt: createdAt, createdAt,
  },
];

const projection = reduceRunnerThreadEvents(
  createInitialRunnerThreadProjection({ threadId, participants: [human, communicator, worker] }),
  items,
);

const userMessage = {
  kind: "message", id: "message-1", threadId, sequence: 1, authorParticipantId: human.id,
  content: "Fix the authentication regression without changing the public API.", modality: "text", status: "delivered", createdAt,
};
const communicatorMessage = {
  kind: "message", id: "message-2", threadId, sequence: 11, authorParticipantId: communicator.id,
  content: "The worker has preserved the existing response types and is validating Node 18 compatibility now.",
  modality: "text", status: "delivered", createdAt: new Date().toISOString(),
};
const receipt = {
  kind: "routing_receipt", id: "receipt-preview", threadId, messageId: userMessage.id, sequence: 2,
  route: "worker", deliveryMode: "checkpoint", status: "delivered", deliveredAtSequence: 2, createdAt,
};

const app = React.createElement("main", { className: "tb-runner-chat tb-runner-thread preview-shell" },
  React.createElement("div", { className: "preview-heading" },
    React.createElement("span", null, "Thread"),
    React.createElement("span", { className: "preview-heading-muted" }, "Changes"),
  ),
  React.createElement("div", { className: "preview-content" },
    React.createElement(RunnerThreadMessageView, { message: userMessage, participant: human, receipt }),
    React.createElement(RunnerThreadRunActivityCard, { run: projection.runsById[run.id], projection, defaultExpanded: true }),
    React.createElement(RunnerThreadMessageView, { message: communicatorMessage, participant: communicator }),
  ),
);

const markup = renderToStaticMarkup(app);
const css = await fs.readFile(new URL("../dist/react/runner-chat.css", import.meta.url), "utf8");
const previewCss = `
  :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #101012; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; background: radial-gradient(circle at 50% -20%, #282332 0, #121214 42%, #0d0d0f 100%); }
  .preview-shell { width: min(100%, 980px); min-height: 100vh; height: auto; margin: 0 auto; padding: 20px 28px 80px; }
  .preview-heading { display: flex; justify-content: center; gap: 8px; margin-bottom: 32px; color: #f1f1f3; font-size: 12px; }
  .preview-heading span { border-radius: 8px; padding: 6px 12px; background: rgba(255,255,255,.08); }
  .preview-heading .preview-heading-muted { color: rgba(255,255,255,.42); background: transparent; }
  .preview-content { display: flex; flex-direction: column; gap: 24px; width: min(100%, 56rem); margin: 0 auto; }
`;
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thread v2 preview</title><style>${css}\n${previewCss}</style></head><body>${markup}</body></html>`;

const port = Number(process.env.THREAD_PREVIEW_PORT || 4179);
const server = http.createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(html);
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Thread v2 preview: http://127.0.0.1:${port}`);
});

