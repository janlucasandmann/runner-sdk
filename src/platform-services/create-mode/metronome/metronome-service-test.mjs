import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  METRONOME_APP_SCRIPT_FRAGMENTS,
  METRONOME_DOMAIN_RUNTIME_SCRIPT,
  METRONOME_PAGE_CSS,
  METRONOME_PAGE_RUNTIME_SCRIPT,
  METRONOME_PAGE_SCRIPT,
  METRONOME_SHELL_RUNTIME_SCRIPT,
  METRONOME_SHELL_STYLE_FRAGMENTS,
  METRONOME_STYLE_FRAGMENTS,
  createMetronomeService,
} from "./index.mjs";

assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /function getMetronomeNodeIOContract/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /function PlaygroundMetronomePage/);
assert.match(METRONOME_PAGE_SCRIPT, /function PlaygroundMetronomePage/);
assert.match(METRONOME_PAGE_CSS, /playground-metronome/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /playground-metronome/);
assert.match(METRONOME_SHELL_RUNTIME_SCRIPT, /function getThreadMetronomeMetadata/);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.sidebar, /sidebar-metronome-run/);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.runTrace, /playground-metronome-run-thread/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.state, /metronomeRunTraceState/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /function openMetronomePage/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /function renderMetronomeRunTraceThreadSurface/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /function renderSidebarMetronomeRunEntry/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.teamSharing, /function buildTeamPageMetronomeWorkflowShareMetadata/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /function renderMetronomeTopNavActions/);

const demoServerSource = await fs.readFile(new URL("../../../../examples/demo-server.mjs", import.meta.url), "utf8");
assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/create-mode\/metronome\/index\.mjs"/);
assert.match(demoServerSource, /metronomeService\.handleRequest\(req, res, url\)/);
assert.doesNotMatch(demoServerSource, /function PlaygroundMetronomePage/);
assert.doesNotMatch(demoServerSource, /function getThreadMetronomeMetadata/);
assert.doesNotMatch(demoServerSource, /function openMetronomePage/);
assert.doesNotMatch(demoServerSource, /function renderMetronomeRunTraceThreadSurface/);
assert.doesNotMatch(demoServerSource, /function renderSidebarMetronomeRunEntry/);
assert.doesNotMatch(demoServerSource, /^\s*\.sidebar-metronome-run-group\s*\{/m);
assert.doesNotMatch(demoServerSource, /pathname\.match\(\/\^\\\/api\\\/real\\\/metronomes/);

const calls = [];
const metronomeService = createMetronomeService({
  proxyUpstreamGet: (...args) => {
    calls.push({ adapter: "get", args });
  },
  proxyUpstreamJsonRequest: (...args) => {
    calls.push({ adapter: "json", args });
  },
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = metronomeService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/metronomes?limit=20&projectId=project_1");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/metronomes?limit=20&projectId=project_1");

result = dispatch("GET", "/api/real/metronomes/workflow%201/runs/run%2F1/timeline");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/metronomes/workflow%201/runs/run%2F1/timeline");

result = dispatch("POST", "/api/real/metronomes/workflow_1/runs");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/metronomes/workflow_1/runs");
assert.equal(result.call.args[3], "POST");

result = dispatch("PATCH", "/api/real/metronomes/workflow_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("DELETE", "/api/real/metronomes/workflow_1/runs/run_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/projects");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

result = dispatch("OPTIONS", "/api/real/metronomes");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

assert.throws(
  () => createMetronomeService({ proxyUpstreamJsonRequest() {} }),
  /proxyUpstreamGet adapter/,
);
assert.throws(
  () => createMetronomeService({ proxyUpstreamGet() {} }),
  /proxyUpstreamJsonRequest adapter/,
);

console.log("Metronome service module and route contracts passed.");
