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
    expectedSha256: "e4bba8d30a32a98d70b2d4955092da3f7d18c054af7804d8d7b79918d326f013",
    fragmentGroups: [{
      baseUrl: projectsOverviewUrl,
      paths: PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects overview styles",
    source: PROJECT_OVERVIEW_CSS,
    expectedSha256: "656bc9fce832f0ac121a7f6f46dfefc0e3e5645beca0322b45b35dac2e91e24e",
    fragmentGroups: [{
      baseUrl: projectsOverviewUrl,
      paths: PROJECT_OVERVIEW_CSS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects actions runtime",
    source: PROJECTS_PAGE_ACTIONS_SCRIPT,
    expectedSha256: "357a98a4345c49c9d41a3691bb0a8eed3b4e8bdb0c30f6d14dd3538bfd7f7dea",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_ACTIONS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects data runtime",
    source: PROJECTS_PAGE_DATA_SCRIPT,
    expectedSha256: "816c67fb0aec0c799c9e8cb84f6d9e9946a698f37bf29a5c88c0d6325a12ebad",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_DATA_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects shell runtime",
    source: PROJECTS_PAGE_SHELL_SCRIPT,
    expectedSha256: "6072497467cf83d0f8871c68a9113db35bf7825e5ee7f8f3363f09c4173ed922",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_SHELL_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects views runtime",
    source: PROJECTS_PAGE_VIEWS_SCRIPT,
    expectedSha256: "b5e383ecec791974a33d0874048b0b92e9954744da943c37379a851284367083",
    fragmentGroups: [{
      baseUrl: projectsPageUrl,
      paths: PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 2_500,
  }),
  assertLegacyBrowserSourceContract({
    label: "Projects core styles",
    source: PROJECTS_CORE_CSS,
    expectedSha256: "c813e57d55b8fcfe60340e55ba66fe70331471f4999b951fd3d6599cb212fe6d",
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
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-overview\s*\{\s*padding-top: 0 !important;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-environments-detail-scroll\.playground-tasks-project-workspace-scroll\.is-overview \.playground-project-overview-summary-title\s*\{\s*margin-top: 42px;/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /tabBarActions: activeProjectOverviewHomeTab === "general"/);
assert.equal((PROJECT_OVERVIEW_SCRIPT.match(/React\.createElement\(PlatformUiCard, \{/g) || []).length, 3);
assert.match(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Properties"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Resources"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /variant: "sidebar",\s*cardTitle: "Milestones"/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-sidebar-card\s*\{\s*overflow: visible;\s*\}/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /return React\.createElement\(PlatformSelector, \{/);
assert.equal(
  (PROJECT_OVERVIEW_SCRIPT.match(/renderProjectOverviewSidebarSelectControl\("(?:priority|lead|type|computer)"/g) || []).length,
  4,
);
assert.match(PROJECT_OVERVIEW_SCRIPT, /popupClassName: "playground-project-overview-sidebar-selector-popup"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /renderProjectOverviewSidebarSelectOption/);
assert.doesNotMatch(PROJECT_OVERVIEW_CSS, /playground-project-overview-sidebar-select-(?:shell|menu|option)/);
assert.doesNotMatch(PROJECTS_PAGE_SHELL_SCRIPT, /handleProjectOverviewSidebarPropertyPointerDown/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /headerActions: React\.createElement\(PlatformSecondaryButton/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /ariaLabel: "Project threads",\s*variant: "minimalistic-ui"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /useCentralSearch: true,\s*useCentralNewSelector: true,\s*useCentralFilterPopup: true/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /viewMode: "list"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /toolbarTitle: "All Resources",\s*showViewToggle: false/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /renderNewMenuItems: renderProjectOverviewResourceNewMenuItems/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /hasMoreProjectThreads\s*\? React\.createElement\("div", \{ className: "playground-project-overview-threads-load-more"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /trailing: React\.createElement\(PlatformSecondaryButton/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /function renderProjectOverviewRecommendedTemplatesEmptyState\(\) \{\s*return React\.createElement\("div", \{ className: "playground-project-resources-empty has-templates" \},\s*React\.createElement\("div", \{ className: "playground-project-resource-template-grid" \},\s*projectOverviewRecommendedTemplates\.map\(\(template\) => renderProjectOverviewTemplateCard\(template\)\)/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Recommended templates"/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /"Start with resources that fit this project type/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-resource-template-browse-button"[\s\S]*?React\.createElement\("span", null, "All Templates"\)/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-resource-template-actions\s*\{\s*display: flex;\s*justify-content: center;\s*margin-top: 12px;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-resource-template-card\s*\{\s*border: 1px solid rgba\(255, 255, 255, 0\.075\);\s*border-radius: 15px;\s*background: rgba\(255, 255, 255, 0\.075\);/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-tab \.platform-instructions-editor\s*\{\s*background: rgba\(255, 255, 255, 0\.075\);\s*border-radius: 15px;\s*border: 1px solid rgba\(255, 255, 255, 0\.075\);/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /const linkedTicketCompletionPercent = progressInfo\.tasks\.length > 0\s*\? Math\.round\(\(progressInfo\.doneTasks\.length \/ progressInfo\.tasks\.length\) \* 100\)\s*: 0;/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /const linkedTicketVisualPercent = linkedTicketCompletionPercent === 0\s*\? 2\s*: linkedTicketCompletionPercent;/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const linkedLabel = linkedMilestoneLabel/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-outcome-preview-progress\s*\{\s*width: 100px;\s*height: 4px;\s*flex: 0 0 100px;\s*overflow: hidden;\s*border-radius: 2px;\s*background: rgba\(255, 255, 255, 0\.1\);/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-outcome-preview-progress-fill\s*\{\s*display: block;\s*height: 100%;\s*border-radius: inherit;\s*background: #fff;/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /const content = React\.createElement\(PlatformModal, \{\s*open: Boolean\(projectOverviewOutcomeEditorState\) && !projectOverviewOutcomeEditorClosing,[\s\S]*?size: "medium",[\s\S]*?title: "Edit Outcome",\s*headerVariant: "search",\s*headerSearchProps: \{\s*icon: Award,[\s\S]*?value: draft\.title,[\s\S]*?onChange: \(event\) => updateProjectOverviewOutcomeEditorDraft\(\{ title: event\.target\.value \}\)/);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /playground-project-overview-outcome-title-field/);
assert.equal((PROJECTS_PAGE_ACTIONS_SCRIPT.match(/React\.createElement\(PlatformInstructionsEditor, \{/g) || []).length, 2);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Description",[\s\S]*?onChange: \(nextValue\) => updateProjectOverviewOutcomeEditorDraft\(\{ description: nextValue \}\)/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*variant: "minimalistic-ui",\s*title: "Success criteria",[\s\S]*?onChange: \(nextValue\) => updateProjectOverviewOutcomeEditorDraft\(\{ successCriteriaInput: nextValue \}\)/);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /function renderProjectOverviewOutcomeMarkdownEditor/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /React\.createElement\(Trash2, \{ width: 14, height: 14, strokeWidth: 1\.8, "aria-hidden": "true" \}\),\s*React\.createElement\("span", null, "Delete"\)/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-outcome-milestone-field > \.playground-tasks-detail-section-header\s*\{\s*margin-bottom: 12px;/);
assert.match(PROJECTS_PAGE_ACTIONS_SCRIPT, /footer: React\.createElement\(React\.Fragment, null,[\s\S]*?React\.createElement\(PlatformSecondaryButton,[\s\S]*?React\.createElement\(PlatformPrimaryButton/);
assert.doesNotMatch(PROJECTS_PAGE_ACTIONS_SCRIPT, /className: "playground-tasks-project-modal playground-mission-control-modal playground-project-overview-outcome-editor-modal"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /function renderProjectOverviewOutcomeEditorModal\(\) \{\s*return renderSharedProjectOverviewOutcomeEditorModal\(\{/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformPopup, \{\s*open: isActionMenuOpen,\s*variant: "minimal",\s*portal: true,\s*placement: "bottom-end"/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "Rename"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "View Details"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\("span", null, "Delete"\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /async function saveProjectOverviewOutcomeRename\(\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(X, \{ width: 13, height: 13, strokeWidth: 1\.9 \}\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(Check, \{ width: 13, height: 13, strokeWidth: 2 \}\)/);
assert.match(PROJECT_OVERVIEW_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*type: "button",\s*size: "small",\s*className: "playground-project-overview-add-outcome-button"[\s\S]*?React\.createElement\("span", null, "Outcome"\)/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /const strategyKpis =/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /className: "playground-project-overview-progress-combo-metrics"/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-progress-card\.playground-project-overview-progress-combo-card\s*\{\s*min-height: 0;\s*margin-bottom: 24px;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-tab \.playground-project-overview-progress-combo-card\s*\{\s*padding: 0;\s*border-radius: 0;/);
assert.match(PROJECT_OVERVIEW_CSS, /\.playground-project-overview-strategy-tab \.playground-project-overview-progress-combo-card::before\s*\{\s*content: none;\s*display: none;/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformLoadingState/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /message: "Loading projects\.\.\."/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /message: "Loading project\.\.\.",\s*centered: true/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /playground-tasks-loading-copy" \}, "Loading project/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*value: missionControlDocumentDraft[\s\S]*?historyKey: "full-strategy:" \+ selectedProject\.id/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(TicketDetailPage, \{/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(TicketDetailPage, \{\s*header: taskDetailNavbar,/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /details: renderTaskDetailFactsSection\(\{ contentOnly: true \}\)/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /threads: renderTaskDetailThreadsSection\(\{\s*contentOnly: true,/);
assert.match(PROJECTS_PAGE_VIEWS_SCRIPT, /React\.createElement\(PlatformInstructionsEditor, \{\s*value: String\(draftTask\.description \|\| ""\),[\s\S]*?historyKey: "ticket-description:" \+ draftTask\.id/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /onClick: \(\) => handleTaskDescriptionFormat\(action\.id\)/);
assert.doesNotMatch(PROJECT_OVERVIEW_SCRIPT, /title: "Strategy Notes"[\s\S]*?stickyHeader: false/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /historyKey: "full-strategy:" \+ selectedProject\.id,\s*stickyHeader: false/);
assert.doesNotMatch(PROJECTS_PAGE_VIEWS_SCRIPT, /renderMissionControlDocumentToolbarButton/);
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
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-frame\s*\{/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-page\s*\{/);
assert.match(PROJECTS_CORE_CSS, /\.playground-tasks-ticket-screen-panel\s+\.playground-ticket-detail-content\s+\.playground-environments-detail-scroll\.playground-tasks-detail-scroll\s*\{\s*padding-top: 0 !important;/);
assert.match(PROJECTS_CORE_CSS, /\.playground-ticket-detail-sidebar \.is-centralized-sidebar-content\s*\{/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /React\.createElement\(PlatformSearch, \{\s*className: "playground-project-resources-central-search"/);
assert.match(platformEntrySource, /React\.createElement\(PlatformButtonSelector, \{\s*mode: "popup",\s*buttonVariant: "secondary"[\s\S]*?popupVariant: "minimal"/);
assert.match(platformEntrySource, /React\.createElement\(PlatformPopup, \{[\s\S]*?variant: "minimal",\s*placement: "bottom-start"/);
assert.match(platformEntrySource, /import \{ PlatformUiCard \} from "\/dist\/platform-ui\/components\/composite\/ui-card\/index\.js";/);
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
