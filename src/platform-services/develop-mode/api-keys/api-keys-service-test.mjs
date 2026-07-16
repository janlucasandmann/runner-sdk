import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  API_KEYS_APP_SCRIPT_FRAGMENTS,
  API_KEYS_DOMAIN_SCRIPT_FRAGMENTS,
  API_KEYS_PAGE_CSS,
  API_KEYS_PAGE_SCRIPT_FRAGMENTS,
  API_KEYS_RUNTIME_SCRIPT_FRAGMENTS,
  API_KEYS_STYLE_FRAGMENTS,
  createApiKeysService,
} from "./index.mjs";

assert.deepEqual(Object.keys(API_KEYS_STYLE_FRAGMENTS), ["table", "sharedComponents", "page"]);
assert.match(API_KEYS_STYLE_FRAGMENTS.table, /\.playground-settings-api-keys-table/);
assert.match(API_KEYS_STYLE_FRAGMENTS.sharedComponents, /\.playground-settings-api-key-modal/);
assert.match(API_KEYS_STYLE_FRAGMENTS.page, /\.resource-overview-page\.is-develop-api-keys/);
assert.equal(Object.values(API_KEYS_STYLE_FRAGMENTS).join(""), API_KEYS_PAGE_CSS);

assert.deepEqual(Object.keys(API_KEYS_DOMAIN_SCRIPT_FRAGMENTS), ["scopePresets", "helpers"]);
assert.match(API_KEYS_DOMAIN_SCRIPT_FRAGMENTS.scopePresets, /SETTINGS_API_KEY_SCOPE_PRESETS/);
assert.match(API_KEYS_DOMAIN_SCRIPT_FRAGMENTS.helpers, /function getSettingsApiKeyScopeLabel/);
assert.match(API_KEYS_DOMAIN_SCRIPT_FRAGMENTS.helpers, /function isSettingsSystemManagedKey/);
assert.doesNotThrow(() => new Function(`
  function apiKeysDomainHost() {
    ${Object.values(API_KEYS_DOMAIN_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.deepEqual(Object.keys(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS), [
  "loading",
  "create",
  "revoke",
  "loadLifecycle",
  "projection",
]);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loading, /loadSettingsApiKeys/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loading, /settingsApiKeysSnapshotRef/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.create, /handleSettingsCreateApiKey/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.revoke, /handleSettingsRevokeApiKey/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle, /activePage === "develop"/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle, /activePage === "develop-api-keys"/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle, /activePage === "develop-webhooks"/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle, /loadSettingsTriggers/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle, /fetchApiKeysOverviewAnalytics/);
assert.doesNotThrow(() => new Function(`
  function apiKeysRuntimeHost() {
    ${Object.values(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.deepEqual(Object.keys(API_KEYS_APP_SCRIPT_FRAGMENTS), [
  "uiState",
  "dataState",
  "navigation",
  "historyRestore",
  "selectedTitle",
  "topNavigation",
  "sidebarEntry",
]);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.uiState, /developApiKeyRevealModal/);
assert.doesNotMatch(API_KEYS_APP_SCRIPT_FRAGMENTS.uiState, /developApiKeysSearchQuery/);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.dataState, /settingsApiKeysSnapshotRef/);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.dataState, /developApiKeysAnalyticsPeriod/);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.navigation, /function openDevelopApiKeysPage/);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-develop-api-keys-overview-controls/);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.topNavigation, /includeSearchDivider: true/);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "develop-api-keys"/);
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: KeyRound/);
assert.doesNotThrow(() => new Function(`
  function apiKeysShellHost() {
    ${API_KEYS_APP_SCRIPT_FRAGMENTS.uiState}
    ${API_KEYS_APP_SCRIPT_FRAGMENTS.dataState}
    ${API_KEYS_APP_SCRIPT_FRAGMENTS.navigation}
    const restore = (entry) => { ${API_KEYS_APP_SCRIPT_FRAGMENTS.historyRestore} };
    const title = () => { ${API_KEYS_APP_SCRIPT_FRAGMENTS.selectedTitle} return ""; };
    ${API_KEYS_APP_SCRIPT_FRAGMENTS.topNavigation}
    const entries = [${API_KEYS_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { restore, title, entries };
  }
`));

assert.deepEqual(Object.keys(API_KEYS_PAGE_SCRIPT_FRAGMENTS), ["legacyCard", "legacySettingsCase", "management"]);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /function renderApiKeysManagementPanel/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /React\.createElement\(DevelopApiKeysOverviewPage/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /openApiKeyRevealModal/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /const getApiKeyCreator/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /creatorAvatarUrl/);
assert.doesNotMatch(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /onShowUsage/);
assert.doesNotMatch(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /React\.createElement\(PlatformDataTable/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacyCard, /function renderSettingsApiKeyCard/);
assert.doesNotThrow(() => new Function(`
  ${API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacyCard}
  ${API_KEYS_PAGE_SCRIPT_FRAGMENTS.management}
  function legacySettingsProjection(effectiveSettingsSection) {
    switch (effectiveSettingsSection) {
      ${API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase}
      default: break;
    }
  }
`));

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.match(demoServerSource, /develop-mode\/api-keys\/index\.mjs/);
assert.match(demoServerSource, /const apiKeysService = createApiKeysService/);
assert.match(demoServerSource, /apiKeysService\.handleRequest\(req, res, url\)/);
assert.match(demoServerSource, /\$\{API_KEYS_DOMAIN_SCRIPT_FRAGMENTS\.scopePresets\}/);
assert.match(demoServerSource, /\$\{API_KEYS_RUNTIME_SCRIPT_FRAGMENTS\.loading\}/);
assert.match(demoServerSource, /\$\{API_KEYS_PAGE_SCRIPT_FRAGMENTS\.management\}/);
assert.match(demoServerSource, /DevelopApiKeysOverviewPage/);
assert.doesNotMatch(demoServerSource, /const SETTINGS_API_KEY_SCOPE_PRESETS =/);
assert.doesNotMatch(demoServerSource, /const loadSettingsApiKeys = useCallback/);
assert.doesNotMatch(demoServerSource, /function openDevelopApiKeysPage\(/);
assert.doesNotMatch(demoServerSource, /function renderApiKeysManagementPanel\(/);
assert.doesNotMatch(demoServerSource, /url\.pathname === "\/api\/aios\/user\/api-keys"/);

const proxyCalls = [];
const service = createApiKeysService({
  proxyAiosJsonRequest: (...args) => proxyCalls.push(args),
  proxyUpstreamGet: (...args) => proxyCalls.push(args),
});
const cases = [
  ["GET", "/api/aios/user/api-keys", "/api/user/api-keys", "GET"],
  ["POST", "/api/aios/user/api-keys", "/api/user/api-keys", "POST"],
  ["POST", "/api/aios/user/api-keys/key_123/revoke", "/api/user/api-keys/key_123/revoke", "POST"],
  ["GET", "/api/aios/user/api-keys/key_123/reveal", "/api/user/api-keys/key_123/reveal", "GET"],
];
for (const [method, path, upstreamPath, upstreamMethod] of cases) {
  const handled = service.handleRequest({ method }, {}, new URL("http://localhost" + path));
  assert.equal(handled, true);
  assert.equal(proxyCalls.at(-1)?.[2], upstreamPath);
  assert.equal(proxyCalls.at(-1)?.[3], upstreamMethod);
}
assert.equal(
  service.handleRequest(
    { method: "GET" },
    {},
    new URL("http://localhost/api/real/api-keys/analytics/overview?period=week"),
  ),
  true,
);
assert.equal(proxyCalls.at(-1)?.[2], "/api-keys/analytics/overview");
assert.equal(service.handleRequest({ method: "DELETE" }, {}, new URL("http://localhost/api/aios/user/api-keys")), false);
assert.equal(service.handleRequest({ method: "POST" }, {}, new URL("http://localhost/api/aios/user/api-keys/key_123/reveal")), false);
assert.equal(service.handleRequest({ method: "GET" }, {}, new URL("http://localhost/api/aios/user/profile")), false);
assert.throws(() => createApiKeysService({}), /API Keys service requires the proxyAiosJsonRequest adapter/);
assert.throws(
  () => createApiKeysService({ proxyAiosJsonRequest() {} }),
  /API Keys service requires the proxyUpstreamGet adapter/,
);

console.log("API Keys ownership, browser syntax, cached lifecycle, page projections, and proxy contracts passed.");
