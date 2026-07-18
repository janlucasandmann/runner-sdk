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
    expectedSha256: "a5e3b3cd6171e52b552e9d67f10344da90ac03d92487578b251a26351384fa1a",
    fragmentGroups: [{
      baseUrl: projectsClientUrl,
      paths: PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview runtime",
    source: PROJECT_OVERVIEW_SCRIPT,
    expectedSha256: "06623463067aca819aba592062d620d9b1775f65bd6c4945e0b79131dfad13e9",
    fragmentGroups: [{
      baseUrl: projectsOverviewUrl,
      paths: PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview styles",
    source: PROJECT_OVERVIEW_CSS,
    expectedSha256: "5e18726190503dc134c38aa2b556a9ec4389a105d6eb2b7c705daa816c18adaa",
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
    expectedSha256: "36b127d400caef9b8b5b2e83adf4c6a12dcddf309a77b221232d4a8a81cc1ce9",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_SHELL_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects views runtime",
    source: PROJECTS_PAGE_VIEWS_SCRIPT,
    expectedSha256: "0808bb7d6cd296af7eb702097b00a5842e798366afbbfcf89cf61abd28b4f139",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects core styles",
    source: PROJECTS_CORE_CSS,
    expectedSha256: "5813bf8e174a3a3f25958f68c351069a630ba14ea405b4252213a49457651b7e",
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
assert.match(PROJECT_OVERVIEW_SCRIPT, /tabBarActions: activeProjectOverviewHomeTab === "general"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /headerActions: React\.createElement\(PlatformSecondaryButton/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /ariaLabel: "Project threads",\s*variant: "minimalistic-ui"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /useCentralSearch: true,\s*useCentralNewSelector: true,\s*useCentralFilterPopup: true/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /viewMode: "list"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /toolbarTitle: "All Resources",\s*showViewToggle: false/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /renderNewMenuItems: renderProjectOverviewResourceNewMenuItems/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /hasMoreProjectThreads\s*\? React\.createElement\("div", \{ className: "playground-project-overview-threads-load-more"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /trailing: React\.createElement\(PlatformSecondaryButton/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformLoadingState/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /message: "Loading projects\.\.\."/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformSearch/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformPopup/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(ListFilter/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /variant: "minimal"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformModal, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "New Project"/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /"All Projects"/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /title: "Sort projects"/);
assert.match(PROJECTS_STYLES, /playground-project-overview/);
assert.match(PROJECTS_STYLE_FRAGMENTS.core, /playground-tasks-page/);
assert.match(PROJECTS_STYLE_FRAGMENTS.connectorBrowser, /playground-tasks-connector-browser-portal/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /React\.createElement\(PlatformSearch, \{\s*className: "playground-project-resources-central-search"/);
assert.match(platformEntrySource, /React\.createElement\(PlatformButtonSelector, \{\s*mode: "popup",\s*buttonVariant: "secondary"[\s\S]*?popupVariant: "minimal"/);
assert.match(platformEntrySource, /React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal",\s*placement: "bottom-start"/);
assert.match(platformEntrySource, /React\.createElement\(ListFilter, \{ width: 14/);
assert.match(platformEntrySource, /playground-project-resources-toolbar-title-group/);
assert.match(platformEntrySource, /renderSharedFilterControl\(\)[\s\S]*?renderSharedNewControl\(\),\s*renderSharedSearchControl\(\)/);
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
