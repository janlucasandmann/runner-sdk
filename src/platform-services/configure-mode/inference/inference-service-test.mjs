import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  INFERENCE_APP_SCRIPT_FRAGMENTS,
  INFERENCE_DOMAIN_SCRIPT_FRAGMENTS,
  INFERENCE_PAGE_CASE_SCRIPT,
  INFERENCE_PAGE_CSS,
  INFERENCE_PAGE_SCRIPT_FRAGMENTS,
  INFERENCE_STYLE_FRAGMENTS,
  createInferenceService,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(INFERENCE_PAGE_CSS, /\.playground-settings-inference-endpoint-card/);
assert.match(INFERENCE_PAGE_CSS, /\.playground-settings-runtime-grid/);
assert.match(INFERENCE_PAGE_CSS, /\.playground-settings-local-runners-card/);
assert.match(INFERENCE_PAGE_CSS, /\.inference-create-endpoint-modal/);
assert.equal(Object.keys(INFERENCE_STYLE_FRAGMENTS).length, 4);
assert.match(
  INFERENCE_STYLE_FRAGMENTS.endpoint,
  /\.inference-endpoint-detail\s*\{[\s\S]*?width:\s*min\(100%, var\(--playground-centered-page-max-width, var\(--platform-page-content-max-width, 87\.5rem\)\)\);[\s\S]*?max-width:\s*var\(--playground-centered-page-max-width, var\(--platform-page-content-max-width, 87\.5rem\)\);/,
);
assert.match(
  INFERENCE_STYLE_FRAGMENTS.endpoint,
  /\.playground-settings-page\.is-inference-detail \.playground-settings-detail-scroll\s*\{[\s\S]*?max-width:\s*var\(--playground-centered-page-max-width, var\(--platform-page-content-max-width, 87\.5rem\)\);/,
);
assert.match(
  INFERENCE_STYLE_FRAGMENTS.endpoint,
  /\.inference-endpoint-detail \.inference-endpoint-detail__settings-content\.playground-server-detail-content,[\s\S]*?\.inference-endpoint-detail \.inference-endpoint-detail__settings-layout\.playground-server-settings-tab\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;/,
);

assert.match(INFERENCE_DOMAIN_SCRIPT_FRAGMENTS.constants, /SETTINGS_DEFAULT_INFERENCE_SETTINGS/);
assert.match(INFERENCE_DOMAIN_SCRIPT_FRAGMENTS.settings, /function normalizeDemoSettingsInferenceSettings/);
assert.match(INFERENCE_DOMAIN_SCRIPT_FRAGMENTS.modelOptions, /function buildDemoInferenceModelOptions/);
assert.match(INFERENCE_DOMAIN_SCRIPT_FRAGMENTS.runtime, /function normalizeSettingsRuntimeTargetsPayload/);
const inferenceDomain = new Function(`
  ${Object.values(INFERENCE_DOMAIN_SCRIPT_FRAGMENTS).join("\n")}
  return {
    normalizeDemoSettingsInferenceSettings,
    mergeDemoInferenceModelLists,
    parseDemoInferenceModelInput,
    buildDemoInferenceApiKeyPreview,
    buildDemoInferenceModelOptions,
    normalizeSettingsRuntimeTargetsPayload,
    normalizeSettingsLocalRunnerDevice,
  };
`)();
assert.deepEqual(
  inferenceDomain.parseDemoInferenceModelInput("gpt-5.4-mini, qwen-3\ngpt-5.4-mini"),
  ["gpt-5.4-mini", "qwen-3"],
);
assert.equal(inferenceDomain.buildDemoInferenceApiKeyPreview("sk-example-secret-value"), "sk-example...");
assert.equal(
  inferenceDomain.normalizeDemoSettingsInferenceSettings({ providerType: "", availableModels: [" a ", "", "b"] }).providerType,
  "openai-compatible",
);
assert.deepEqual(
  inferenceDomain.normalizeDemoSettingsInferenceSettings({ availableModels: [" a ", "", "b"] }).availableModels,
  ["a", "b"],
);
assert.ok(inferenceDomain.buildDemoInferenceModelOptions("ollama", "custom-model").includes("llama3.3"));
assert.equal(
  inferenceDomain.normalizeSettingsRuntimeTargetsPayload({ runtimeTargets: [{ kind: "cloud", status: "available" }] })[0]?.label,
  "Cloud Runtime",
);
assert.equal(
  inferenceDomain.normalizeSettingsLocalRunnerDevice({ id: "device_1", hostname: "studio" })?.name,
  "studio",
);

assert.equal(Object.keys(INFERENCE_PAGE_SCRIPT_FRAGMENTS).length, 3);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.setup, /case "inference"/);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.localRunners, /settingsLocalRunnersSection/);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.view, /InferenceOverviewPage/);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.view, /InferenceEndpointDetailPage/);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.view, /deploymentProfile: platformDeploymentProfile/);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.view, /usageThreads: realThreads/);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.view, /analyticsLoading: isThreadsLoading/);
assert.match(INFERENCE_PAGE_SCRIPT_FRAGMENTS.view, /analyticsTimeframe: settingsInferenceAnalyticsTimeframe/);
assert.doesNotMatch(INFERENCE_PAGE_SCRIPT_FRAGMENTS.view, /inferenceRuntimeContent|runtimeContent:/);
assert.match(INFERENCE_PAGE_CASE_SCRIPT, /settingsInferenceSelectedEndpointId/);
assert.doesNotThrow(() => new Function(`
  function renderInferenceCase(section) {
    let detailContent = null;
    switch (section) {
      ${INFERENCE_PAGE_CASE_SCRIPT}
      default:
        break;
    }
    return detailContent;
  }
`));

assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.state, /settingsInferenceSettings/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.state, /settingsInferenceSelectedEndpointId/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.state, /settingsInferenceDetailTab/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.state, /settingsInferenceAnalyticsTimeframe/);
assert.equal(INFERENCE_APP_SCRIPT_FRAGMENTS.refs, "");
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.runtimeLifecycle, /handleSettingsCreateWorkspaceBinding/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.navigation, /function openInferencePage/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.loadLifecycle, /activePage === "inference"/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferenceConnectionTest/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferenceOwnerCandidatesRequest/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferenceOwnerTransfer/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferenceAccessMetadataChange/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferenceTeamShareCreate/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferenceTeamShareRemove/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /endpointInputValue/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /apiKey: apiKey \|\| undefined/);
assert.equal(INFERENCE_APP_SCRIPT_FRAGMENTS.cleanup, "");
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyCapture, /page: "inference"/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyCapture, /endpointId: settingsInferenceSelectedEndpointId/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyCapture, /detailTab: settingsInferenceDetailTab/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "inference"/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyRestore, /detailTab: entry\.detailTab/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Inference"/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformSwitch/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /General/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /Settings/);
assert.doesNotMatch(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Runtime"/);
assert.doesNotMatch(
  INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation,
  /\{ value: "models", label: "Models" \}/,
);
assert.doesNotMatch(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /Inference activity time frame/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /PlatformResourceVersionLabel/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /PlatformVersionPublishControl/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferencePublishVersion/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /openSettingsInferenceSaveDialog/);
assert.match(
  INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation,
  /isInferenceOverview\s*\?\s*\[\{ label: "Inference" \}\]/,
);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-inference-overview-controls/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.configureHomeEntry, /Configure Inference/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "inference"/);
assert.doesNotThrow(() => new Function(`
  function inferenceHostIntegration() {
    ${INFERENCE_APP_SCRIPT_FRAGMENTS.state}
    ${INFERENCE_APP_SCRIPT_FRAGMENTS.refs}
    ${INFERENCE_APP_SCRIPT_FRAGMENTS.runtimeLifecycle}
    ${INFERENCE_APP_SCRIPT_FRAGMENTS.navigation}
    const loadInference = () => {
      ${INFERENCE_APP_SCRIPT_FRAGMENTS.loadLifecycle}
    };
    ${INFERENCE_APP_SCRIPT_FRAGMENTS.handlers}
    const cleanupInference = () => {
      ${INFERENCE_APP_SCRIPT_FRAGMENTS.cleanup}
    };
    const captureInferenceHistory = () => {
      ${INFERENCE_APP_SCRIPT_FRAGMENTS.historyCapture}
      return null;
    };
    const restoreInferenceHistory = (entry) => {
      ${INFERENCE_APP_SCRIPT_FRAGMENTS.historyRestore}
    };
    ${INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation}
    const quickLinks = [${INFERENCE_APP_SCRIPT_FRAGMENTS.configureHomeEntry}];
    const sidebarEntries = [${INFERENCE_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { loadInference, cleanupInference, captureInferenceHistory, restoreInferenceHistory, quickLinks, sidebarEntries };
  }
`));

const platformEntrySource = await readPlatformCompositionSource();
const overviewPageSource = await fs.readFile(
  new URL("./client/page/overview/inference-overview-page.tsx", import.meta.url),
  "utf8",
);
const detailPageSource = await fs.readFile(
  new URL("./client/page/detail/inference-endpoint-detail-page.tsx", import.meta.url),
  "utf8",
);
const accessSettingsSource = await fs.readFile(
  new URL("./client/page/detail/inference-endpoint-access-settings.tsx", import.meta.url),
  "utf8",
);
const billingCatalogSource = await fs.readFile(
  new URL("../../../../apps/platform/shared/billing/playground-billing-catalog.mjs", import.meta.url),
  "utf8",
);

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/inference\/index\.mjs"/);
assert.match(platformEntrySource, /inferenceService:\s*createInferenceService\(/);
assert.match(platformEntrySource, /inferenceService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{INFERENCE_PAGE_CSS\}/);
assert.match(platformEntrySource, /\$\{INFERENCE_DOMAIN_SCRIPT_FRAGMENTS\.settings\}/);
assert.match(platformEntrySource, /\$\{INFERENCE_APP_SCRIPT_FRAGMENTS\.runtimeLifecycle\}/);
assert.match(platformEntrySource, /\$\{INFERENCE_APP_SCRIPT_FRAGMENTS\.handlers\}/);
assert.match(platformEntrySource, /inferencePageCaseScript: INFERENCE_PAGE_CASE_SCRIPT/);
assert.match(platformEntrySource, /InferenceOverviewPage/);
assert.match(platformEntrySource, /InferenceEndpointDetailPage/);
assert.match(platformEntrySource, /renderSettingsSurface\(\{ section: "inference", hideHeader: true \}\)/);
assert.match(platformEntrySource, /hasInferenceVersionsDrawerSlot = activePage === "inference"/);
assert.match(
  platformEntrySource,
  /hasInferenceVersionsDrawerSlot\s*&&\s*settingsInferenceVersionsOpen/,
);
assert.match(platformEntrySource, /id: "playground-agent-versions-drawer-root"/);
assert.match(platformEntrySource, /configureInfrastructureEntries:[\s\S]*?INFERENCE_APP_SCRIPT_FRAGMENTS\.sidebarEntry/);
assert.doesNotMatch(platformEntrySource, /function normalizeDemoSettingsInferenceSettings\(/);
assert.doesNotMatch(platformEntrySource, /function normalizeSettingsLocalRunnerListPayload\(/);
assert.doesNotMatch(platformEntrySource, /function openInferencePage\(/);
assert.doesNotMatch(platformEntrySource, /function renderInferencePageNav\(/);
assert.doesNotMatch(platformEntrySource, /const handleSettingsInferenceConnectionTest =/);
assert.doesNotMatch(platformEntrySource, /case "inference":/);
assert.doesNotMatch(billingCatalogSource, /POST \/api\/real\/billing\/inference\/test/);
assert.match(overviewPageSource, /ResourceOverviewPage/);
assert.match(overviewPageSource, /InferenceOverviewGuide/);
assert.match(overviewPageSource, /CreateInferenceEndpointModal/);
assert.match(overviewPageSource, /pagination: false/);
assert.match(detailPageSource, /PlatformServiceDetailPage/);
assert.match(detailPageSource, /PlatformAnalyticsSection/);
assert.match(detailPageSource, /buildInferenceEndpointAnalytics/);
assert.match(detailPageSource, /renderModelsSection/);
assert.doesNotMatch(detailPageSource, /renderRuntime|runtimeContent|Workspace Bindings|Local Runtime/);
assert.match(detailPageSource, /PlatformSettingsSection/);
assert.match(detailPageSource, /PlatformSettingsDataTable/);
assert.match(detailPageSource, /PlatformConfirmationModal/);
assert.match(detailPageSource, /PlatformResourceDetailSidebar/);
assert.match(detailPageSource, /PlatformDeploymentMap/);
assert.match(detailPageSource, /InferenceEndpointAccessSettings/);
assert.match(detailPageSource, /platform-service-detail-identity/);
assert.match(detailPageSource, /aria-label="Inference endpoint name"/);
assert.match(detailPageSource, /aria-label="Inference endpoint description"/);
assert.match(detailPageSource, /Inference activity time frame/);
assert.match(detailPageSource, /PlatformVersionSaveDialog/);
assert.match(detailPageSource, /PlatformVersionHistorySidebar/);
assert.match(
  detailPageSource,
  /sidebarCollapsed=\{versionsOpen\s*\|\|/,
);
assert.match(detailPageSource, /usePlatformVersionNavigationGuard/);
assert.match(accessSettingsSource, /PlatformResourceAccessSettings/);
assert.match(accessSettingsSource, /subjectType="inference_endpoint"/);
assert.match(accessSettingsSource, /teamSubjectType="inference_endpoint_team_role"/);
assert.match(detailPageSource, /mode="split-action"/);
assert.match(detailPageSource, /popupAriaLabel="Inference endpoint actions"/);

const proxyCalls = [];
const proxyGetCalls = [];
const inferenceService = createInferenceService({
  proxyUpstreamGet: (...args) => proxyGetCalls.push(args),
  proxyUpstreamJsonRequest: (...args) => proxyCalls.push(args),
});

let handled = inferenceService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/inference/test"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.length, 1);
assert.equal(proxyCalls[0]?.[2], "/billing/inference/test");
assert.equal(proxyCalls[0]?.[3], "POST");

handled = inferenceService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/billing/inference/test"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.length, 2);

handled = inferenceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/inference/endpoints"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.length, 2);
assert.equal(proxyGetCalls.length, 1);
assert.equal(proxyGetCalls[0]?.[2], "/billing/inference/endpoints");

handled = inferenceService.handleRequest(
  { method: "PATCH", headers: {} },
  {},
  new URL("http://localhost/api/real/inference/endpoints/inference_123"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.at(-1)?.[2], "/billing/inference/endpoints/inference_123");
assert.equal(proxyCalls.at(-1)?.[3], "PATCH");

handled = inferenceService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/inference/endpoints/inference_123/test"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.at(-1)?.[2], "/billing/inference/endpoints/inference_123/test");
assert.equal(proxyCalls.at(-1)?.[3], "POST");

handled = inferenceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/runtime-targets"),
);
assert.equal(handled, true);
assert.equal(proxyGetCalls.at(-1)?.[2], "/runtime-targets");

handled = inferenceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/devices"),
);
assert.equal(handled, true);
assert.equal(proxyGetCalls.at(-1)?.[2], "/devices");

handled = inferenceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/workspace-bindings"),
);
assert.equal(handled, true);
assert.equal(proxyGetCalls.at(-1)?.[2], "/workspace-bindings");

handled = inferenceService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/workspace-bindings"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.at(-1)?.[2], "/workspace-bindings");
assert.equal(proxyCalls.at(-1)?.[3], "POST");

handled = inferenceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/local-runner-pairing-tokens/token_123"),
);
assert.equal(handled, true);
assert.equal(proxyGetCalls.at(-1)?.[2], "/local-runner-pairing-tokens/token_123");

handled = inferenceService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/local-runner-pairing-tokens"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.at(-1)?.[2], "/local-runner-pairing-tokens");
assert.equal(proxyCalls.at(-1)?.[3], "POST");

handled = inferenceService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/models"),
);
assert.equal(handled, false);

assert.throws(
  () => createInferenceService({}),
  /Inference service requires the proxyUpstreamGet adapter/,
);

console.log("Inference domain, browser syntax, shell integration, and route contracts passed.");
