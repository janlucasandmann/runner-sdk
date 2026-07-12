import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  matchDemoThreadV2ProxyRoute,
  shouldRetryUpstreamWithAiosSession,
  wantsDemoThreadEventStream,
} from "./demo-thread-v2-proxy.mjs";

const threadId = "thread_a%2Fb";
const expectedThreadId = "thread_a%2Fb";
const cases = [
  ["GET", `/${["api", "real", "threads", threadId, "timeline"].join("/")}`, "json", `/threads/${expectedThreadId}/timeline`],
  ["GET", `/api/real/threads/${threadId}/events`, "event-stream-or-json", `/threads/${expectedThreadId}/events`],
  ["GET", `/api/real/threads/${threadId}/runs`, "json", `/threads/${expectedThreadId}/runs`],
  ["GET", `/api/real/threads/${threadId}/activity-groups`, "json", `/threads/${expectedThreadId}/activity-groups`],
  ["GET", `/api/real/threads/${threadId}/actions`, "json", `/threads/${expectedThreadId}/actions`],
  ["POST", `/api/real/threads/${threadId}/activity/classify`, "json", `/threads/${expectedThreadId}/activity/classify`],
  ["POST", `/api/real/threads/${threadId}/activity/messages`, "json", `/threads/${expectedThreadId}/activity/messages`],
  ["POST", `/api/real/threads/${threadId}/runs/run_1%2F2/steering`, "json", `/threads/${expectedThreadId}/runs/run_1%2F2/steering`],
  ["POST", `/api/real/threads/${threadId}/runs/run_1%2F2/control`, "json", `/threads/${expectedThreadId}/runs/run_1%2F2/control`],
];

for (const [method, pathname, transport, upstreamPath] of cases) {
  assert.deepEqual(matchDemoThreadV2ProxyRoute(method, pathname), { method, transport, upstreamPath });
}

assert.equal(matchDemoThreadV2ProxyRoute("POST", "/api/real/threads/thread-1/timeline"), null);
assert.equal(matchDemoThreadV2ProxyRoute("GET", "/api/real/threads/thread-1/messages"), null);
assert.equal(matchDemoThreadV2ProxyRoute("GET", "/api/real/threads/%E0%A4%A/timeline"), null);
assert.equal(matchDemoThreadV2ProxyRoute("GET", "/api/real/projects/project-1"), null);

assert.equal(wantsDemoThreadEventStream({ headers: {} }, new URL("http://localhost/events?stream=1")), true);
assert.equal(wantsDemoThreadEventStream({ headers: { accept: "text/event-stream" } }, new URL("http://localhost/events")), true);
assert.equal(wantsDemoThreadEventStream({ headers: { accept: "application/json" } }, new URL("http://localhost/events")), false);

assert.equal(shouldRetryUpstreamWithAiosSession({ status: 401, usedApiKey: true, hasSession: true }), true);
assert.equal(shouldRetryUpstreamWithAiosSession({ status: 403, usedApiKey: true, hasSession: true }), true);
assert.equal(shouldRetryUpstreamWithAiosSession({ status: 403, usedApiKey: true, hasSession: false }), false);
assert.equal(shouldRetryUpstreamWithAiosSession({ status: 403, usedApiKey: false, hasSession: true }), false);
assert.equal(shouldRetryUpstreamWithAiosSession({ status: 500, usedApiKey: true, hasSession: true }), false);

const demoServerSource = await readFile(new URL("./demo-server.mjs", import.meta.url), "utf8");
const threadSelectionStart = demoServerSource.indexOf("        function handleThreadSelect(threadId) {");
const threadSelectionEnd = demoServerSource.indexOf("        function closeThreadActionMenu()", threadSelectionStart);
assert.notEqual(threadSelectionStart, -1);
assert.notEqual(threadSelectionEnd, -1);
const threadSelectionSource = demoServerSource.slice(threadSelectionStart, threadSelectionEnd);
assert.match(threadSelectionSource, /setSidebarWorkspaceMode\("work"\)/);
assert.match(threadSelectionSource, /setContentMode\("chat"\)/);
assert.match(threadSelectionSource, /setThreadSubagentDetailOpen\(false\)/);
assert.match(threadSelectionSource, /setThreadDeepResearchDetailOpen\(false\)/);
assert.match(threadSelectionSource, /setThreadDocumentPreviewOpen\(false\)/);
assert.match(threadSelectionSource, /refreshThreads\(undefined, threadId, \{ silent: true \}\)/);

const upstreamGetStart = demoServerSource.indexOf("async function proxyUpstreamGet(req, res, upstreamPath, options = {}) {");
const upstreamGetEnd = demoServerSource.indexOf("const PROXY_TRACE_RING_DEFINITIONS", upstreamGetStart);
assert.notEqual(upstreamGetStart, -1);
assert.notEqual(upstreamGetEnd, -1);
assert.match(
  demoServerSource.slice(upstreamGetStart, upstreamGetEnd),
  /shouldRetryUpstreamWithAiosSession[\s\S]*fetchAiosCloud/,
);

console.log("Demo Thread v2 proxy contract test passed.");
