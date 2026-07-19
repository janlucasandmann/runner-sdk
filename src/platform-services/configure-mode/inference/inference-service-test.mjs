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
assert.equal(Object.keys(INFERENCE_STYLE_FRAGMENTS).length, 3);

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
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.refs, /settingsInferenceAutosaveTimerRef/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.runtimeLifecycle, /handleSettingsCreateWorkspaceBinding/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.navigation, /function openInferencePage/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.loadLifecycle, /activePage === "inference"/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.handlers, /handleSettingsInferenceConnectionTest/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.cleanup, /settingsInferenceAutosaveTimerRef\.current/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyCapture, /page: "inference"/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyCapture, /endpointId: settingsInferenceSelectedEndpointId/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "inference"/);
assert.match(INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Inference"/);
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
assert.match(platformEntrySource, /configureInfrastructureEntries:[^\n]*INFERENCE_APP_SCRIPT_FRAGMENTS\.sidebarEntry/);
assert.doesNotMatch(platformEntrySource, /function normalizeDemoSettingsInferenceSettings\(/);
assert.doesNotMatch(platformEntrySource, /function normalizeSettingsLocalRunnerListPayload\(/);
assert.doesNotMatch(platformEntrySource, /function openInferencePage\(/);
assert.doesNotMatch(platformEntrySource, /function renderInferencePageNav\(/);
assert.doesNotMatch(platformEntrySource, /const handleSettingsInferenceConnectionTest =/);
assert.doesNotMatch(platformEntrySource, /case "inference":/);
assert.doesNotMatch(billingCatalogSource, /POST \/api\/real\/billing\/inference\/test/);
assert.match(overviewPageSource, /ResourceOverviewPage/);
assert.match(overviewPageSource, /InferenceOverviewGuide/);
assert.match(overviewPageSource, /pagination: false/);
assert.match(detailPageSource, /ResourceDetailPage/);
assert.match(detailPageSource, /PlatformSettingsSection/);
assert.match(detailPageSource, /PlatformSettingsDataTable/);
assert.match(detailPageSource, /PlatformConfirmationModal/);

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
