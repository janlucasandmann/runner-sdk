import assert from "node:assert/strict";

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
import {
  PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS,
} from "./client/domain-runtime.mjs";
import {
  PROJECT_OVERVIEW_SCRIPT,
  PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS,
} from "./client/overview/runtime.mjs";
import {
  PROJECT_OVERVIEW_CSS,
  PROJECT_OVERVIEW_CSS_FRAGMENT_PATHS,
} from "./client/overview/styles.mjs";
import {
  PROJECTS_PAGE_ACTIONS_FRAGMENT_PATHS,
  PROJECTS_PAGE_ACTIONS_SCRIPT,
} from "./client/page/actions.mjs";
import {
  PROJECTS_PAGE_DATA_FRAGMENT_PATHS,
  PROJECTS_PAGE_DATA_SCRIPT,
} from "./client/page/data.mjs";
import {
  PROJECTS_PAGE_SHELL_FRAGMENT_PATHS,
  PROJECTS_PAGE_SHELL_SCRIPT,
} from "./client/page/shell.mjs";
import {
  PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS,
  PROJECTS_PAGE_VIEWS_SCRIPT,
} from "./client/page/views.mjs";
import {
  PROJECTS_CORE_CSS,
  PROJECTS_CORE_CSS_FRAGMENT_PATHS,
} from "./client/styles/core.mjs";
import { assertLegacyBrowserSourceContract } from "../../../../apps/platform/testing/legacy-browser-source-contract.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

const projectsClientUrl = new URL("./client/", import.meta.url);
const projectsOverviewUrl = new URL("./client/overview/", import.meta.url);
const projectsPageUrl = new URL("./client/page/", import.meta.url);
const projectsStylesUrl = new URL("./client/styles/", import.meta.url);

await Promise.all([
  assertLegacyBrowserSourceContract({
    label: "Projects domain runtime",
    source: PROJECTS_DOMAIN_RUNTIME_SCRIPT,
    expectedSha256: "cc142c2d47678c8fc5ea665f80cb69fc2ecafceb4d899c6370c074cb045ad423",
    fragmentGroups: [{
      baseUrl: projectsClientUrl,
      paths: PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview runtime",
    source: PROJECT_OVERVIEW_SCRIPT,
    expectedSha256: "07e6050edf4c0385d4f1c8ca80a574724aff2b51ee72427c69f2c8c2cc6dba5a",
    fragmentGroups: [{
      baseUrl: projectsOverviewUrl,
      paths: PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview styles",
    source: PROJECT_OVERVIEW_CSS,
    expectedSha256: "f12e1c3e420cc14e5c8bac29f978d7c9eb67aa806df2cf5a84f8ea31380bd480",
    fragmentGroups: [{
      baseUrl: projectsOverviewUrl,
      paths: PROJECT_OVERVIEW_CSS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects actions runtime",
    source: PROJECTS_PAGE_ACTIONS_SCRIPT,
    expectedSha256: "27ebb7a9fb83ecb8a84c7e24dcdb75f7a2c5e3a8a616d50c797d619eb0ed9527",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_ACTIONS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects data runtime",
    source: PROJECTS_PAGE_DATA_SCRIPT,
    expectedSha256: "b0195f31038cb744a40d79e1dd14b60db7159ac17580cb107c89fe028c386321",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_DATA_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects shell runtime",
    source: PROJECTS_PAGE_SHELL_SCRIPT,
    expectedSha256: "39f04c7f3df004a810ed1770400f03c3db860d9ab3b356c61cceb8db4481e917",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_SHELL_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects views runtime",
    source: PROJECTS_PAGE_VIEWS_SCRIPT,
    expectedSha256: "0d730264ce1d6581b0ca0565100163ab561847041c9dbebf1fdf0af626b74c9f",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects core styles",
    source: PROJECTS_CORE_CSS,
    expectedSha256: "cee8e9ea367ebbd84a1368fd132929a0ed026740e1faf9302ba8c5a6283c5ccd",
    fragmentGroups: [{
      baseUrl: projectsStylesUrl,
      paths: PROJECTS_CORE_CSS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
]);

assert.match(PROJECTS_DOMAIN_FOUNDATION_SCRIPT, /PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID/);
assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /normalizePlaygroundProjectRecord/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /buildPlaygroundProjectLinkedFilePathIndex/);
assert.match(PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT, /createPlaygroundProjectTeamRolePermissionSet/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function PlaygroundTasksPage/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderProjectOverviewView/);
assert.match(PROJECTS_STYLES, /playground-project-overview/);
assert.match(PROJECTS_STYLE_FRAGMENTS.core, /playground-tasks-page/);
assert.match(PROJECTS_STYLE_FRAGMENTS.connectorBrowser, /playground-tasks-connector-browser-portal/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/projects\/index\.mjs"/);
assert.doesNotMatch(platformEntrySource, /function PlaygroundTasksPage/);
assert.doesNotMatch(platformEntrySource, /async function proxyProjectResourceIndexGet/);
assert.doesNotMatch(platformEntrySource, /async function proxyTaskStartThread/);
assert.doesNotMatch(platformEntrySource, /async function fetchAiosTaskApi/);
assert.doesNotMatch(platformEntrySource, /async function proxyUpstreamTaskJsonRequest/);
assert.doesNotMatch(platformEntrySource, /PLAYGROUND_TASK_BACKLOG_THREAD_PREFIX/);
assert.doesNotMatch(platformEntrySource, /function normalizePlaygroundProjectRecord/);
assert.doesNotMatch(platformEntrySource, /function buildPlaygroundProjectLinkedFilePathIndex/);
assert.doesNotMatch(platformEntrySource, /function createPlaygroundProjectTeamRolePermissionSet/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-tasks-page \{/m);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-tasks-connector-browser-portal\.tb-runner-chat \{/m);

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
