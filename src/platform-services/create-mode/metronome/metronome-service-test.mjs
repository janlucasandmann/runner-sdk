import assert from "node:assert/strict";

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
import {
  METRONOME_PAGE_CONTROLLER_FRAGMENT_PATHS,
  METRONOME_PAGE_CONTROLLER_SCRIPT,
} from "./client/page/controller.mjs";
import { METRONOME_PAGE_OVERVIEW_SCRIPT } from "./client/page/overview.mjs";
import {
  METRONOME_PAGE_INSPECTOR_FRAGMENT_PATHS,
  METRONOME_PAGE_INSPECTOR_SCRIPT,
} from "./client/page/inspector.mjs";
import {
  METRONOME_TEMPLATES_FRAGMENT_PATHS,
  METRONOME_TEMPLATES_RUNTIME_SCRIPT,
} from "./client/runtime/templates-and-graph.mjs";
import {
  METRONOME_TRIGGERS_FRAGMENT_PATHS,
  METRONOME_TRIGGERS_RUNTIME_SCRIPT,
} from "./client/runtime/triggers-and-contracts.mjs";
import {
  METRONOME_WORKFLOW_DOMAIN_FRAGMENT_PATHS,
  METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT,
} from "./client/runtime/workflow-domain.mjs";
import {
  METRONOME_INSPECTOR_CSS,
  METRONOME_INSPECTOR_CSS_FRAGMENT_PATHS,
} from "./client/styles/inspector.mjs";
import { assertLegacyBrowserSourceContract } from "../../../../apps/platform/testing/legacy-browser-source-contract.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

const metronomePageUrl = new URL("./client/page/", import.meta.url);
const metronomeRuntimeUrl = new URL("./client/runtime/", import.meta.url);
const metronomeStylesUrl = new URL("./client/styles/", import.meta.url);

await Promise.all([
  assertLegacyBrowserSourceContract({
    label: "Metronome controller runtime",
    source: METRONOME_PAGE_CONTROLLER_SCRIPT,
    expectedSha256: "12bfbb7493d0f4a1bc68ddc50a96d018e22c5ad6763fd6ca86426700a03e60a1",
    fragmentGroups: [{
      baseUrl: metronomePageUrl,
      paths: METRONOME_PAGE_CONTROLLER_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector runtime",
    source: METRONOME_PAGE_INSPECTOR_SCRIPT,
    expectedSha256: "be96b4eee6f520515937c1b5d838165fdd8253a8beb6dd465352a3622ad8bb6e",
    fragmentGroups: [{
      baseUrl: metronomePageUrl,
      paths: METRONOME_PAGE_INSPECTOR_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome templates runtime",
    source: METRONOME_TEMPLATES_RUNTIME_SCRIPT,
    expectedSha256: "16b230ef154671f13aa4eb2af6a443e9840d669cdba72ec3ddc929140c0f7552",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_TEMPLATES_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome triggers runtime",
    source: METRONOME_TRIGGERS_RUNTIME_SCRIPT,
    expectedSha256: "464398ea2b588f20de89812e18405d9650b1f53bb312ea1b00d0bffe389b254e",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_TRIGGERS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome workflow runtime",
    source: METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT,
    expectedSha256: "ad45b1c090ac5313cd9da7beb4a0952720e22ea482f1a255a06d11e3917c7eb1",
    fragmentGroups: [{
      baseUrl: metronomeRuntimeUrl,
      paths: METRONOME_WORKFLOW_DOMAIN_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
  assertLegacyBrowserSourceContract({
    label: "Metronome inspector styles",
    source: METRONOME_INSPECTOR_CSS,
    expectedSha256: "02baf153bb7a2fc8f394c52402b00a246301de140b705125b23dd40bfc83a8ca",
    fragmentGroups: [{
      baseUrl: metronomeStylesUrl,
      paths: METRONOME_INSPECTOR_CSS_FRAGMENT_PATHS,
    }],
    maxFragmentLines: 1_600,
  }),
]);

assert.match(METRONOME_DOMAIN_RUNTIME_SCRIPT, /function getMetronomeNodeIOContract/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /function PlaygroundMetronomePage/);
assert.match(METRONOME_PAGE_SCRIPT, /function PlaygroundMetronomePage/);
assert.match(METRONOME_PAGE_CSS, /playground-metronome/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /playground-metronome/);
assert.match(METRONOME_STYLE_FRAGMENTS.overview, /\.playground-metronome-page\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /\.playground-metronome-editor\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_STYLE_FRAGMENTS.editor, /\.playground-metronome-code-view\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_STYLE_FRAGMENTS.runs, /\.playground-metronome-runs-view\s*\{[\s\S]*?background:\s*#000/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-tasks-project-modal-label[\s\S]*font-weight:\s*400/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-environments-input,[\s\S]*border-radius:\s*8px/);
assert.match(METRONOME_INSPECTOR_CSS, /\.playground-environments-input,[\s\S]*background:\s*rgba\(255,\s*255,\s*255,\s*0\.1\)/);
assert.match(METRONOME_SHELL_RUNTIME_SCRIPT, /function getThreadMetronomeMetadata/);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.sidebar, /sidebar-metronome-run/);
assert.match(METRONOME_SHELL_STYLE_FRAGMENTS.runTrace, /playground-metronome-run-thread/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.state, /metronomeRunTraceState/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /function openMetronomePage/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runController, /createWorkflow/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.modeSwitch, /React\.createElement\(PlatformSwitch,[\s\S]*ariaLabel: "Metronome modes"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformSecondaryButton,[\s\S]*className: "playground-metronome-top-nav-run-button"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /lastHandledCreateWorkflowRequestTokenRef/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(MetronomesOverviewPage/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /playground-metronome-hero-slider/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformModal, \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /size: isCreate \? "small" : "medium"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /title: isCreate \? "Create Metronome Workflow" : "Edit Metronome"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const wallpaperOptions = isCreate \? \[\] : getMetronomeWorkflowWallpaperOptions\(\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /const openCreateWorkflowModal = useCallback\(\(\) => \{\s*setWorkflowNameDraft\(""\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /graphFactory: createTriggerOnlyMetronomeGraph/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSecondaryButton/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderMetronomeVersionSelector/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformButtonSelector,\s*\{\s*mode: "split-action",\s*buttonVariant: "primary"/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /function renderMetronomeBreadcrumbVersionSelector/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /React\.createElement\(PlatformPopup,[\s\S]*variant: "minimal"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /showVersions: !isActiveWorkflowBuiltIn/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /className: "playground-metronome-runs-platform-data-table",\s*surface: "plain",\s*variant: "minimalistic-ui",\s*sticky: false,\s*pagination: \{\}/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /toolbar: \{\s*title: "Runs",\s*search: \{/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /header: "Run ID"[\s\S]{0,180}accessor: \(run\) => String\(run\?\.id \|\| ""\)/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /status === "failed"\s*\? "red"/);
assert.match(METRONOME_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformLabel, \{ variant \}, label\)/);
assert.doesNotMatch(METRONOME_STYLE_FRAGMENTS.runs, /playground-metronome-run-status/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /playground-metronome-runs-header/);
assert.match(METRONOME_PAGE_OVERVIEW_SCRIPT, /const renderPalette = \(\) => React\.createElement\("aside"[\s\S]*playground-metronome-palette-list/);
assert.doesNotMatch(METRONOME_PAGE_OVERVIEW_SCRIPT, /playground-metronome-palette-(?:header|back-button|title)/);
assert.doesNotMatch(METRONOME_PAGE_RUNTIME_SCRIPT, /renderPlaygroundPlatformPopup/);
assert.match(METRONOME_TEMPLATES_RUNTIME_SCRIPT, /function createTriggerOnlyMetronomeGraph[\s\S]*nodes: \[trigger\],[\s\S]*edges: \[\]/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView, /function renderMetronomeRunTraceThreadSurface/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /function renderSidebarMetronomeRunEntry/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.teamSharing, /function buildTeamPageMetronomeWorkflowShareMetadata/);
assert.match(METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions, /function renderMetronomeTopNavActions/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/metronome\/index\.mjs"/);
assert.match(platformEntrySource, /metronomeService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /MetronomesOverviewPage/);
assert.match(platformEntrySource, /playground-metronome-overview-controls/);
assert.doesNotMatch(platformEntrySource, /function PlaygroundMetronomePage/);
assert.doesNotMatch(platformEntrySource, /function getThreadMetronomeMetadata/);
assert.doesNotMatch(platformEntrySource, /function openMetronomePage/);
assert.doesNotMatch(platformEntrySource, /function renderMetronomeRunTraceThreadSurface/);
assert.doesNotMatch(platformEntrySource, /function renderSidebarMetronomeRunEntry/);
assert.doesNotMatch(platformEntrySource, /^\s*\.sidebar-metronome-run-group\s*\{/m);
assert.doesNotMatch(platformEntrySource, /pathname\.match\(\/\^\\\/api\\\/real\\\/metronomes/);

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
