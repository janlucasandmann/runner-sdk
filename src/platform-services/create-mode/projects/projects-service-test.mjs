import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT,
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  PROJECTS_STYLE_FRAGMENTS,
  PROJECTS_STYLES,
  createProjectsService,
} from "./index.mjs";
import { createProjectResourceIndexHandler } from "./server/resource-index.mjs";

assert.match(PROJECTS_DOMAIN_FOUNDATION_SCRIPT, /PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /normalizePlaygroundProjectRecord/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /buildPlaygroundProjectLinkedFilePathIndex/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /createPlaygroundProjectTeamRolePermissionSet/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function PlaygroundTasksPage/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderProjectOverviewView/);
assert.match(PROJECTS_STYLES, /playground-project-overview/);
assert.match(PROJECTS_STYLE_FRAGMENTS.core, /playground-tasks-page/);
assert.match(PROJECTS_STYLE_FRAGMENTS.connectorBrowser, /playground-tasks-connector-browser-portal/);

const demoServerSource = await fs.readFile(new URL("../../../../examples/demo-server.mjs", import.meta.url), "utf8");
assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/create-mode\/projects\/index\.mjs"/);
assert.doesNotMatch(demoServerSource, /function PlaygroundTasksPage/);
assert.doesNotMatch(demoServerSource, /async function proxyProjectResourceIndexGet/);
assert.doesNotMatch(demoServerSource, /async function proxyTaskStartThread/);
assert.doesNotMatch(demoServerSource, /async function fetchAiosTaskApi/);
assert.doesNotMatch(demoServerSource, /async function proxyUpstreamTaskJsonRequest/);
assert.doesNotMatch(demoServerSource, /PLAYGROUND_TASK_BACKLOG_THREAD_PREFIX/);
assert.doesNotMatch(demoServerSource, /function normalizePlaygroundProjectRecord/);
assert.doesNotMatch(demoServerSource, /function buildPlaygroundProjectLinkedFilePathIndex/);
assert.doesNotMatch(demoServerSource, /function createPlaygroundProjectTeamRolePermissionSet/);
assert.doesNotMatch(demoServerSource, /^\s*\.playground-tasks-page \{/m);
assert.doesNotMatch(demoServerSource, /^\s*\.playground-tasks-connector-browser-portal\.tb-runner-chat \{/m);

const calls = [];
const record = (adapter) => (...args) => {
  calls.push({ adapter, args });
};
const projectsService = createProjectsService({
  fetchAiosApi: async (...args) => {
    calls.push({ adapter: "api", args });
    return new Response("{}", { status: 200 });
  },
  fetchAiosCloud: async (...args) => {
    calls.push({ adapter: "cloud", args });
    return new Response("{}", { status: 200 });
  },
  fetchUpstreamJsonForProxyExactPath: async () => ({ status: 404, data: {} }),
  hasAiosSession: (req) => !String(req?.url || "").includes("/start-thread"),
  inferProxyContentTypeFromPath: () => "application/octet-stream",
  parseUpstreamUrl: () => "https://api.example.test/v1",
  proxyAiosJsonRequest: record("aios"),
  proxyUpstreamBinaryGet: record("binary"),
  proxyUpstreamGet: record("get"),
  proxyUpstreamJsonRequest: record("json"),
  proxyUpstreamRawRequest: record("raw"),
  readOptionalApiKey: () => "",
  readRequestBody: async () => ({}),
  sendJson: record("send"),
  withProxyOrganizationHeader: (_req, _body, headers) => headers,
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = projectsService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/projects");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects");

result = dispatch("PATCH", "/api/real/projects/project%201");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/projects/project%201");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("POST", "/api/aios/projects/project_1/skills");
assert.equal(result.call.adapter, "aios");
assert.equal(result.call.args[2], "/api/projects/project_1/skills");

result = dispatch("GET", "/api/aios/projects/project_1/costs/summary");
assert.equal(result.call.adapter, "aios");
assert.equal(result.call.args[2], "/api/projects/project_1/costs/summary");

result = dispatch("POST", "/api/real/projects/project_1/schedules/schedule_1/trigger");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

result = dispatch("GET", "/api/real/tasks/releases/release_1");
assert.equal(result.call.adapter, "cloud");
assert.equal(result.call.args[1], "/tasks/releases/release_1");
await new Promise((resolve) => setImmediate(resolve));

result = dispatch("POST", "/api/real/tasks/task_1/start-thread");
assert.equal(result.handled, true);
await Promise.resolve();
assert.equal(calls[0].adapter, "send");
assert.equal(calls[0].args[1], 401);

result = dispatch("GET", "/api/task-backlog/project_1/threads/taskbacklog_test/context");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "send");
assert.equal(result.call.args[1], 200);

result = dispatch("GET", "/api/real/agents");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

const upstreamResponses = new Map([
  ["/projects/project_1", {
    status: 200,
    data: {
      project: {
        id: "project_1",
        name: "Project One",
        defaultEnvironmentId: "environment_1",
        attachments: [
          { id: "file_1", source: "imagine", projectId: "project_1" },
          { id: "file_2", source: "upload", projectId: "project_1" },
        ],
        connectors: { github: { repo: "owner/repo" }, notion: false },
      },
    },
  }],
  ["/servers?projectId=project_1", {
    status: 200,
    data: { servers: [{ id: "server_1", projectId: "project_1" }, { id: "server_2", projectId: "project_2" }] },
  }],
  ["/metronomes?projectId=project_1", {
    status: 200,
    data: { metronomes: [{ id: "metronome_1", metadata: { projectId: "project_1" } }] },
  }],
]);
let response = null;
const handleResourceIndex = createProjectResourceIndexHandler({
  fetchUpstreamJsonForProxyExactPath: async (_req, upstreamPath) => upstreamResponses.get(upstreamPath) || { status: 404, data: {} },
  sendJson: (_res, status, data) => {
    response = { status, data };
    return response;
  },
});

await handleResourceIndex({}, {}, "project_1");
assert.equal(response.status, 200);
assert.equal(response.data.project.name, "Project One");
assert.equal(response.data.counts.files, 2);
assert.equal(response.data.counts.connectors, 1);
assert.deepEqual(response.data.servers.map((server) => server.id), ["server_1"]);
assert.deepEqual(response.data.metronomes.map((metronome) => metronome.id), ["metronome_1"]);
assert.deepEqual(response.data.imagineResources.map((resource) => resource.id), ["file_1"]);

console.log("Projects service module and route contracts passed.");
