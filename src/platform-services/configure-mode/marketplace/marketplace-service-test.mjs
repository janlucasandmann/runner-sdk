import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  MARKETPLACE_APP_SCRIPT_FRAGMENTS,
  MARKETPLACE_PAGE_CSS,
  MARKETPLACE_PAGE_SCRIPT,
  MARKETPLACE_PAGE_SCRIPT_FRAGMENTS,
  MARKETPLACE_STYLE_FRAGMENTS,
  MARKETPLACE_TEMPLATE_CATALOG,
  MARKETPLACE_TEMPLATE_TYPES,
  createMarketplaceDomainScriptFragments,
  createMarketplaceService,
} from "./index.mjs";

assert.equal(MARKETPLACE_TEMPLATE_CATALOG.length, 12);
assert.equal(MARKETPLACE_TEMPLATE_TYPES.length, 7);
assert.equal(MARKETPLACE_TEMPLATE_TYPES[0]?.id, "all");
assert.ok(MARKETPLACE_TEMPLATE_CATALOG.some(({ id }) => id === "customer-support-email-metronome"));
assert.ok(Object.isFrozen(MARKETPLACE_TEMPLATE_CATALOG));

assert.match(MARKETPLACE_PAGE_CSS, /\.playground-resource-templates-page/);
assert.match(MARKETPLACE_PAGE_CSS, /\.playground-resource-templates-resource-table/);
assert.match(MARKETPLACE_PAGE_CSS, /\.playground-resource-templates-modal/);
assert.equal(Object.values(MARKETPLACE_STYLE_FRAGMENTS).join(""), MARKETPLACE_PAGE_CSS);

assert.match(MARKETPLACE_PAGE_SCRIPT, /function renderTemplateFilterOption/);
assert.match(MARKETPLACE_PAGE_SCRIPT, /function renderTemplatesTable/);
assert.match(MARKETPLACE_PAGE_SCRIPT, /function renderTemplateModal/);
assert.match(MARKETPLACE_PAGE_SCRIPT, /Start from reusable project resources/);
assert.equal(Object.values(MARKETPLACE_PAGE_SCRIPT_FRAGMENTS).join(""), MARKETPLACE_PAGE_SCRIPT);
assert.doesNotThrow(() => new Function(MARKETPLACE_PAGE_SCRIPT));

const domainFragments = createMarketplaceDomainScriptFragments({
  serialize: (value) => JSON.stringify(value).replace(/</g, "\\u003c"),
});
assert.match(domainFragments.catalog, /const PLAYGROUND_RESOURCE_TEMPLATE_DATA/);
assert.match(domainFragments.catalog, /const PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA/);
assert.match(domainFragments.metadata, /function buildPlaygroundResourceTemplatePreviewMetadata/);
assert.match(domainFragments.serverFiles, /function getPlaygroundResourceTemplatePreviewServerFiles/);
assert.match(domainFragments.database, /function getPlaygroundResourceTemplatePreviewDatabaseDocuments/);
assert.match(domainFragments.resources, /function buildPlaygroundResourceTemplatePreviewResources/);
assert.doesNotThrow(() => new Function(Object.values(domainFragments).join("")));

assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.previewResources, /resourceTemplatePreviewResources/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.state, /resourceTemplateTypeFilter/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.lifecycle, /resourceTemplateHeroCount/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.navigation, /function openResourceTemplatesPage/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.historyCapture, /page: "resource-templates"/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "resource-templates"/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.selectedTitle, /return "Marketplace"/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Marketplace"/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.pageView, /function renderResourceTemplatesPage/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /label: "Marketplace"/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: LibraryBig/);
assert.match(MARKETPLACE_APP_SCRIPT_FRAGMENTS.topNavIcon, /normalizedLabel === "marketplace"/);
assert.doesNotThrow(() => new Function(`
  function marketplaceHostIntegration() {
    ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.previewResources}
    ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.state}
    ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.lifecycle}
    ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.navigation}
    const captureMarketplaceHistory = () => {
      ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.historyCapture}
      return null;
    };
    const restoreMarketplaceHistory = (entry) => {
      ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.historyRestore}
    };
    const getMarketplaceTitle = () => {
      ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.selectedTitle}
      return "";
    };
    const getMarketplaceIcon = (normalizedLabel) => {
      ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.topNavIcon}
      return null;
    };
    ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.topNavigation}
    ${MARKETPLACE_APP_SCRIPT_FRAGMENTS.pageView}
    const sidebarEntries = [${MARKETPLACE_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { captureMarketplaceHistory, restoreMarketplaceHistory, getMarketplaceTitle, getMarketplaceIcon, sidebarEntries };
  }
`));

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);

assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/configure-mode\/marketplace\/index\.mjs"/);
assert.match(demoServerSource, /const MARKETPLACE_DOMAIN_SCRIPT_FRAGMENTS = createMarketplaceDomainScriptFragments\(/);
assert.match(demoServerSource, /const marketplaceService = createMarketplaceService\(/);
assert.match(demoServerSource, /marketplaceService\.handleRequest\(req, res, url\)/);
assert.match(demoServerSource, /\$\{MARKETPLACE_PAGE_CSS\}/);
assert.match(demoServerSource, /\$\{MARKETPLACE_PAGE_SCRIPT\}/);
assert.match(demoServerSource, /\$\{MARKETPLACE_DOMAIN_SCRIPT_FRAGMENTS\.catalog\}/);
assert.match(demoServerSource, /\$\{MARKETPLACE_APP_SCRIPT_FRAGMENTS\.pageView\}/);
assert.match(demoServerSource, /\$\{MARKETPLACE_APP_SCRIPT_FRAGMENTS\.sidebarEntry\}/);
assert.doesNotMatch(demoServerSource, /demo-resource-templates(?:-page)?\.mjs/);
assert.doesNotMatch(demoServerSource, /function openResourceTemplatesPage\(/);
assert.doesNotMatch(demoServerSource, /function renderResourceTemplatesPage\(/);
assert.doesNotMatch(demoServerSource, /function renderResourceTemplatesPageNav\(/);
assert.doesNotMatch(demoServerSource, /const PLAYGROUND_RESOURCE_TEMPLATE_DATA = \[/);

const sentResponses = [];
const marketplaceService = createMarketplaceService({
  sendJson: (...args) => sentResponses.push(args),
});

let handled = marketplaceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/marketplace/templates"),
);
assert.equal(handled, true);
assert.equal(sentResponses.length, 1);
assert.equal(sentResponses[0]?.[1], 200);
assert.equal(sentResponses[0]?.[2]?.object, "list");
assert.strictEqual(sentResponses[0]?.[2]?.data, MARKETPLACE_TEMPLATE_CATALOG);
assert.strictEqual(sentResponses[0]?.[2]?.templates, MARKETPLACE_TEMPLATE_CATALOG);
assert.strictEqual(sentResponses[0]?.[2]?.types, MARKETPLACE_TEMPLATE_TYPES);

handled = marketplaceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/resource-templates"),
);
assert.equal(handled, true);
assert.equal(sentResponses.length, 2);

handled = marketplaceService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/marketplace/templates"),
);
assert.equal(handled, false);
assert.equal(sentResponses.length, 2);

handled = marketplaceService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/models"),
);
assert.equal(handled, false);

assert.throws(
  () => createMarketplaceService({}),
  /Marketplace service requires the sendJson adapter/,
);

console.log("Marketplace catalog ownership, browser syntax, shell integration, and route contracts passed.");
