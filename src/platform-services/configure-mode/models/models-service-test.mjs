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

assert.match(MODELS_PAGE_CSS, /\.playground-models-page/);
assert.match(MODELS_PAGE_CSS, /\.playground-models-overview-table-section/);
assert.match(MODELS_PAGE_CSS, /\.playground-models-featured-card/);
assert.equal(Object.values(MODELS_STYLE_FRAGMENTS).join(""), MODELS_PAGE_CSS);

assert.match(MODELS_PAGE_SCRIPT, /function normalizePlaygroundManagedModelsTab/);
assert.match(MODELS_PAGE_SCRIPT, /function loadPlaygroundManagedAgentModelCatalog/);
assert.match(MODELS_PAGE_SCRIPT, /function renderPlaygroundManagedModelsTable/);
assert.match(MODELS_PAGE_SCRIPT, /function renderPlaygroundModelsPage/);
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

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);

assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/configure-mode\/models\/index\.mjs"/);
assert.match(demoServerSource, /const MODELS_APP_SCRIPT_FRAGMENTS = createModelsAppScriptFragments\(/);
assert.match(demoServerSource, /const modelsService = createModelsService\(/);
assert.match(demoServerSource, /modelsService\.handleRequest\(req, res, url\)/);
assert.match(demoServerSource, /\$\{MODELS_PAGE_CSS\}/);
assert.match(demoServerSource, /\$\{MODELS_PAGE_SCRIPT\}/);
assert.match(demoServerSource, /\$\{MODELS_APP_SCRIPT_FRAGMENTS\.pageView\}/);
assert.match(demoServerSource, /\$\{MODELS_AGENT_SCRIPT_FRAGMENTS\.overviewAction\}/);
assert.match(demoServerSource, /\$\{MODELS_AGENT_SCRIPT_FRAGMENTS\.catalogLoader\}/);
assert.doesNotMatch(demoServerSource, /demo-models-page\.mjs/);
assert.doesNotMatch(demoServerSource, /function openModelsPage\(/);
assert.doesNotMatch(demoServerSource, /function renderModelsPage\(/);
assert.doesNotMatch(demoServerSource, /function renderModelsPageNav\(/);
assert.doesNotMatch(demoServerSource, /url\.pathname === "\/api\/real\/agents\/models"/);

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
