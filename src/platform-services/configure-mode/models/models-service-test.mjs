import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  MODELS_AGENT_SCRIPT_FRAGMENTS,
  MODELS_PAGE_CSS,
  MODELS_PAGE_SCRIPT,
  MODELS_PAGE_SCRIPT_FRAGMENTS,
  MODELS_STYLE_FRAGMENTS,
  createModelsAppScriptFragments,
  createModelsService,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(MODELS_PAGE_CSS, /\.playground-models-page/);
assert.match(MODELS_PAGE_CSS, /\.playground-models-overview-table-section/);
assert.match(MODELS_PAGE_CSS, /\.playground-models-featured-card/);
assert.match(MODELS_PAGE_CSS, /\.resource-overview-page\.is-models-overview/);
assert.match(MODELS_PAGE_CSS, /\.models-overview-details-modal__facts/);
assert.match(MODELS_PAGE_CSS, /\.models-overview-details-modal__documentation/);
assert.equal(Object.values(MODELS_STYLE_FRAGMENTS).join(""), MODELS_PAGE_CSS);
assert.equal(
  await fs.readFile(
    new URL("./client/styles/models.css", import.meta.url),
    "utf8",
  ),
  MODELS_PAGE_CSS,
  "The typed Models stylesheet must remain byte-identical to the compatibility style export.",
);

assert.match(MODELS_PAGE_SCRIPT, /function normalizePlaygroundManagedModelsTab/);
assert.match(MODELS_PAGE_SCRIPT, /function loadPlaygroundManagedAgentModelCatalog/);
assert.match(MODELS_PAGE_SCRIPT, /function getPlaygroundManagedModelDetails/);
assert.match(MODELS_PAGE_SCRIPT, /PLAYGROUND_MANAGED_MODEL_AVAILABILITY_BY_ID/);
assert.match(MODELS_PAGE_SCRIPT, /@cf\/moonshotai\/kimi-k2\.7-code/);
assert.match(MODELS_PAGE_SCRIPT, /alibaba\/qwen3\.5-397b-a17b/);
assert.match(MODELS_PAGE_SCRIPT, /function renderPlaygroundManagedModelsTable/);
assert.match(MODELS_PAGE_SCRIPT, /function renderPlaygroundModelsPage/);
assert.match(MODELS_PAGE_SCRIPT, /React\.createElement\(ModelsOverviewPage/);
assert.doesNotMatch(MODELS_PAGE_SCRIPT_FRAGMENTS.view, /React\.createElement\(PlatformDataTable/);
assert.doesNotMatch(MODELS_PAGE_SCRIPT_FRAGMENTS.view, /playground-files-browser-header playground-models-browser-header/);
assert.doesNotMatch(MODELS_PAGE_SCRIPT_FRAGMENTS.view, /playground-models-overview-category-switch/);
assert.doesNotMatch(MODELS_PAGE_SCRIPT_FRAGMENTS.view, /if \(!isAgentTab \|\| featuredModels\.length === 0\)/);
assert.match(MODELS_PAGE_SCRIPT_FRAGMENTS.view, /if \(featuredModels\.length === 0\) return null/);
assert.doesNotThrow(() => new Function(MODELS_PAGE_SCRIPT));
assert.equal(Object.values(MODELS_PAGE_SCRIPT_FRAGMENTS).join(""), MODELS_PAGE_SCRIPT);
assert.match(MODELS_PAGE_SCRIPT_FRAGMENTS.catalog, /getPlaygroundManagedVideoModelOptions/);
assert.match(MODELS_PAGE_SCRIPT_FRAGMENTS.query, /getPlaygroundManagedModelsProviderFilterOptions/);
assert.match(MODELS_PAGE_SCRIPT_FRAGMENTS.presentation, /sortPlaygroundManagedModels/);
assert.match(MODELS_PAGE_SCRIPT_FRAGMENTS.view, /renderPlaygroundManagedModelsTable/);

const pricingUrl = "https://platform.example.test/pricing";
const developersUrl = "https://platform.example.test/developers";
const appFragments = createModelsAppScriptFragments({ pricingUrl, developersUrl });
assert.match(appFragments.state, /modelsPageAgentModelOptions/);
assert.match(appFragments.resolvedCatalog, /resolvedModelsPageAgentModelOptions/);
assert.match(appFragments.catalogLifecycle, /loadModelsPageAgentModelCatalog/);
assert.match(appFragments.navigation, /function openModelsPage/);
assert.match(appFragments.historyCapture, /modelsTab: modelsPageTab/);
assert.match(appFragments.historyRestore, /entry\.page === "models"/);
assert.match(appFragments.topNavigation, /function renderModelsPageNav/);
assert.match(appFragments.topNavigation, new RegExp(JSON.stringify(pricingUrl).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(appFragments.topNavigation, new RegExp(JSON.stringify(developersUrl).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(appFragments.pageView, /function renderModelsPage/);
assert.match(appFragments.pageView, new RegExp(JSON.stringify(pricingUrl).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(appFragments.pageView, /onCreateAgent: \(modelId\) => openAgentCreationInResources/);
assert.match(appFragments.pageView, /sidebarMode: "configure"/);
assert.match(appFragments.sidebarEntry, /id: "models"/);
assert.doesNotThrow(() => new Function(`
  function modelsHostIntegration() {
    ${appFragments.state}
    ${appFragments.resolvedCatalog}
    ${appFragments.catalogLifecycle}
    ${appFragments.navigation}
    const captureHistory = () => {
      ${appFragments.historyCapture}
      return null;
    };
    const restoreHistory = (entry) => {
      ${appFragments.historyRestore}
    };
    ${appFragments.topNavigation}
    ${appFragments.pageView}
    const sidebarEntries = [${appFragments.sidebarEntry}];
    return { captureHistory, restoreHistory, sidebarEntries };
  }
`));

assert.match(MODELS_AGENT_SCRIPT_FRAGMENTS.props, /onOpenModelsPage/);
assert.match(MODELS_AGENT_SCRIPT_FRAGMENTS.catalogState, /agentModelOptions/);
assert.match(MODELS_AGENT_SCRIPT_FRAGMENTS.resolvedCatalog, /resolvedAgentModelOptions/);
assert.match(MODELS_AGENT_SCRIPT_FRAGMENTS.catalogLoader, /function|loadAgentModelCatalog/);
assert.match(MODELS_AGENT_SCRIPT_FRAGMENTS.catalogLifecycle, /loadAgentModelCatalog\(\)/);
assert.match(MODELS_AGENT_SCRIPT_FRAGMENTS.overviewAction, /onOpenModelsPage\(\)/);
assert.match(MODELS_AGENT_SCRIPT_FRAGMENTS.hostProps, /onOpenModelsPage: \(\) => openModelsPage\(\)/);

const platformEntrySource = await readPlatformCompositionSource();

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/models\/index\.mjs"/);
assert.match(platformEntrySource, /const MODELS_APP_SCRIPT_FRAGMENTS = createModelsAppScriptFragments\(/);
assert.match(platformEntrySource, /modelsService:\s*createModelsService\(/);
assert.match(
  platformEntrySource,
  /import \{[^}]*ModelsOverviewPage[^}]*\} from "\/dist\/platform-app\/routing\/platform-lazy-pages\.js"/,
);
assert.match(platformEntrySource, /modelsService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{MODELS_PAGE_CSS\}/);
assert.match(platformEntrySource, /\$\{MODELS_PAGE_SCRIPT\}/);
assert.match(platformEntrySource, /\$\{MODELS_APP_SCRIPT_FRAGMENTS\.pageView\}/);
assert.match(platformEntrySource, /const \[agentCreationPageModelId, setAgentCreationPageModelId\] = useState\(""\)/);
assert.match(platformEntrySource, /createAgentModelId: agentCreationPageModelId/);
assert.match(platformEntrySource, /draft: \{ model: normalizedModelId \}/);
assert.doesNotMatch(platformEntrySource, /demo-models-page\.mjs/);
assert.doesNotMatch(platformEntrySource, /function openModelsPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderModelsPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderModelsPageNav\(/);
assert.doesNotMatch(platformEntrySource, /url\.pathname === "\/api\/real\/agents\/models"/);

const modelsOverviewPageSource = await fs.readFile(
  new URL("./client/page/models-overview-page.tsx", import.meta.url),
  "utf8",
);
assert.match(modelsOverviewPageSource, /ResourceOverviewPage<TRow>/);
assert.match(modelsOverviewPageSource, /<PlatformDetailTabBar/);
assert.match(modelsOverviewPageSource, /variant="minimal"/);
assert.match(modelsOverviewPageSource, /heroContent=\{featuredContent\}/);
assert.match(modelsOverviewPageSource, /leading: tabBar/);
assert.match(modelsOverviewPageSource, /pagination: false/);
assert.match(modelsOverviewPageSource, /getRowActions/);
assert.match(modelsOverviewPageSource, /label: "Create Agent"/);
assert.match(modelsOverviewPageSource, /label: "View Details"/);
assert.match(modelsOverviewPageSource, /<ModelDetailsModal/);

const modelDetailsModalSource = await fs.readFile(
  new URL("./client/page/model-details-modal.tsx", import.meta.url),
  "utf8",
);
assert.match(modelDetailsModalSource, /<PlatformModal/);
assert.match(modelDetailsModalSource, /Availability/);
assert.match(modelDetailsModalSource, /Provider documentation/);

const proxyCalls = [];
const modelsService = createModelsService({
  proxyUpstreamGet: (...args) => proxyCalls.push(args),
});

let handled = modelsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/agents/models"),
);
assert.equal(handled, true);
assert.equal(proxyCalls.length, 1);
assert.equal(proxyCalls[0]?.[2], "/agents/models");

handled = modelsService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/agents/models"),
);
assert.equal(handled, false);
assert.equal(proxyCalls.length, 1);

handled = modelsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/agents"),
);
assert.equal(handled, false);

assert.throws(
  () => createModelsService({}),
  /Models service requires the proxyUpstreamGet adapter/,
);

console.log("Models service client ownership, browser syntax, shell integration, and route contracts passed.");
