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
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.deepEqual(Object.keys(API_KEYS_STYLE_FRAGMENTS), ["table", "sharedComponents", "page"]);
assert.match(API_KEYS_STYLE_FRAGMENTS.table, /\.playground-settings-api-keys-table/);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.table,
  /\.playground-settings-api-keys-platform-table[\s\S]*?--platform-data-table-surface: transparent;[\s\S]*?background: transparent;/,
  "The embedded Settings API Keys table must keep its entire minimal surface transparent.",
);
assert.match(API_KEYS_STYLE_FRAGMENTS.sharedComponents, /\.playground-settings-scope-option/);
assert.doesNotMatch(
  API_KEYS_STYLE_FRAGMENTS.sharedComponents,
  /\.playground-settings-api-key-modal(?:-backdrop|-top|-body|-scopes|\s|\{)/,
  "Obsolete hand-built create-modal styles must not remain in the shared compatibility CSS.",
);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.sharedComponents,
  /\.playground-settings-created-key-title\s*\{[\s\S]*?font-weight: 400;[\s\S]*?color: #fff;/,
  "The created-key notice title must use the requested white regular-weight treatment.",
);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.sharedComponents,
  /\.playground-settings-created-key-value\.playground-settings-code\s*\{[\s\S]*?padding-right: 52px;[\s\S]*?color: rgba\(255, 255, 255, 0\.8\);/,
  "The created API key value must remain white at 80% opacity and reserve space for its copy control.",
);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.sharedComponents,
  /\.playground-settings-created-key-copy-button\.playground-settings-icon-button\s*\{[\s\S]*?position: absolute;[\s\S]*?right: 6px;/,
  "The created-key copy control must stay inside the secret field.",
);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.sharedComponents,
  /\.playground-settings-created-key-notice\s*\{[\s\S]*?position: relative;[\s\S]*?\.playground-settings-created-key-row\s*\{\s*display: block;/,
  "The created-key notice must not reserve a separate layout column for its dismiss control.",
);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.sharedComponents,
  /\.playground-settings-created-key-dismiss-button\.playground-settings-icon-button\s*\{[\s\S]*?position: absolute;[\s\S]*?top: 10px;[\s\S]*?right: 10px;/,
  "The created-key dismiss control must remain anchored inside the notice.",
);
assert.match(API_KEYS_STYLE_FRAGMENTS.page, /\.resource-overview-page\.is-develop-api-keys/);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.page,
  /\.platform-api-key-create-modal\.platform-modal-surface[\s\S]*?\.platform-modal-header\.is-search[\s\S]*?\.platform-api-key-create-modal__body\.platform-modal-body/,
  "The API-key creator must share the structured search-header modal composition used by New Issue.",
);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.page,
  /\.platform-api-key-create-modal__icon\s*\{[\s\S]*?background: transparent;[\s\S]*?color: #fff;/,
  "The API-key creator header icon must remain white on a transparent surface.",
);
assert.match(
  API_KEYS_STYLE_FRAGMENTS.page,
  /\.platform-api-key-create-modal \.platform-api-key-management-scopes legend\s*\{[\s\S]*?margin-bottom: 12px;[\s\S]*?color: #fff;/,
  "The Permissions title must use the requested white treatment and spacing.",
);
assert.equal(Object.values(API_KEYS_STYLE_FRAGMENTS).join(""), API_KEYS_PAGE_CSS);
assert.equal(
  await fs.readFile(
    new URL("./client/styles/api-keys.css", import.meta.url),
    "utf8",
  ),
  API_KEYS_PAGE_CSS,
  "The typed API Keys stylesheet must remain byte-identical to the compatibility style export.",
);

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
assert.match(
  API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.create,
  /handleSettingsCreateApiKey\(input = \{\}\)[\s\S]*?input\?\.name[\s\S]*?input\?\.permissions/,
  "The legacy runtime must accept the typed create-dialog payload instead of owning duplicate form state.",
);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.revoke, /handleSettingsRevokeApiKey/);
assert.doesNotMatch(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle, /activePage === "develop" \|\|/);
assert.match(API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle, /activePage === "develop-api-keys"/);
assert.match(
  API_KEYS_RUNTIME_SCRIPT_FRAGMENTS.loadLifecycle,
  /settingsModalOpen && settingsSection === "api"/,
  "Opening the global Settings API Keys tab must load the key catalog.",
);
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
assert.match(API_KEYS_APP_SCRIPT_FRAGMENTS.uiState, /settingsApiKeyRevealModal/);
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
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase, /case "api"/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase, /ariaLabel: "API keys"/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase, /playground-shell-settings-modal-api-keys-header/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase, /"Create API key"/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase, /handleSettingsCreateApiKey/);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /const apiKeyDialog = React\.createElement\(ApiKeyCreateDialog, \{[\s\S]*?onSubmit: \(input\) => handleSettingsCreateApiKey\(input\)/,
  "The Settings API-key creator must use the centralized dialog component.",
);
assert.doesNotMatch(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /React\.createElement\(PlatformModal(?:Backdrop|Surface)/,
  "The Settings page must not rebuild modal primitives locally.",
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /React\.createElement\(PlatformDataTable, \{[\s\S]*?layout: "fill",\s*variant: "minimalistic-ui",\s*sticky: false,\s*pagination: false/,
  "The Settings API Keys catalog must use the centralized minimal table variant.",
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /getRowActions: \(apiKeyRecord\) => \[[\s\S]*?id: "show",\s*label: "Show API key",\s*icon: Eye,[\s\S]*?id: "delete",[\s\S]*?danger: true,\s*separatorBefore: true/,
  "Every API-key row menu must expose Show and Delete actions through the table ellipsis.",
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /separatorBefore: true,\s*disabled: apiKeyRecord\?\.canRevoke === false \|\| settingsRevokingKeyId === apiKeyRecord\.id/,
  "Protected API keys must keep the Delete option visible but disabled.",
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /getRowAriaLabel: \(apiKeyRecord\) => apiKeyRecord\.name \|\| "API Key"/,
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /const openSettingsApiKeyRevealModal = async \(apiKeyRecord\)[\s\S]*?\/api\/aios\/user\/api-keys\/[\s\S]*?\/reveal/,
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /const apiKeyRevealDialog = React\.createElement\(PlatformModal, \{\s*open: Boolean\(settingsApiKeyRevealModal\)/,
  "Showing a key from Settings must use a dedicated centralized reveal modal.",
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /className: "playground-settings-created-key-secret"[\s\S]*?className: "playground-settings-code playground-settings-created-key-value"[\s\S]*?className: "playground-settings-icon-button playground-settings-created-key-copy-button"/,
  "The Settings success notice must place the copy control inside its API key field.",
);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /"aria-label": "Copy newly created API key"[\s\S]*?className: "playground-settings-icon-button playground-settings-created-key-dismiss-button"[\s\S]*?"aria-label": "Dismiss created API key"/,
  "The Settings success notice controls must remain accessible.",
);
assert.doesNotMatch(API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase, /label: [^\n]*"Revoke key"/);
assert.doesNotMatch(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
  /header: "Last used"/,
  "The Settings tab must not include API-key usage data.",
);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /function renderApiKeysManagementPanel/);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /React\.createElement\(DevelopApiKeysOverviewPage/);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.management,
  /const apiKeyDialog = React\.createElement\(ApiKeyCreateDialog, \{[\s\S]*?onSubmit: \(input\) => handleSettingsCreateApiKey\(input\)/,
  "The full API Keys page must use the same centralized create dialog as Settings.",
);
assert.match(API_KEYS_PAGE_SCRIPT_FRAGMENTS.management, /openApiKeyRevealModal/);
assert.match(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.management,
  /const apiKeyRevealDialogContent = developApiKeyRevealModal[\s\S]*?React\.createElement\(PlatformModal, \{[\s\S]*?title: developApiKeyRevealModal\.apiKeyRecord\?\.name/,
);
assert.doesNotMatch(
  API_KEYS_PAGE_SCRIPT_FRAGMENTS.management,
  /const apiKeyRevealDialogContent = developApiKeyRevealModal[\s\S]*?React\.createElement\(PlatformModal(?:Backdrop|Surface)/,
);
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

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /develop-mode\/api-keys\/index\.mjs/);
assert.match(platformEntrySource, /apiKeysService:\s*createApiKeysService\(/);
assert.match(platformEntrySource, /apiKeysService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{API_KEYS_DOMAIN_SCRIPT_FRAGMENTS\.scopePresets\}/);
assert.match(platformEntrySource, /\$\{API_KEYS_RUNTIME_SCRIPT_FRAGMENTS\.loading\}/);
assert.match(platformEntrySource, /\$\{API_KEYS_PAGE_SCRIPT_FRAGMENTS\.management\}/);
assert.match(platformEntrySource, /DevelopApiKeysOverviewPage/);
assert.match(platformEntrySource, /ApiKeyCreateDialog/);
assert.doesNotMatch(platformEntrySource, /const SETTINGS_API_KEY_SCOPE_PRESETS =/);
assert.doesNotMatch(platformEntrySource, /const loadSettingsApiKeys = useCallback/);
assert.doesNotMatch(platformEntrySource, /function openDevelopApiKeysPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderApiKeysManagementPanel\(/);
assert.doesNotMatch(platformEntrySource, /url\.pathname === "\/api\/aios\/user\/api-keys"/);

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
  ["GET", "/api/real/api-keys", "/api/user/api-keys", "GET"],
  ["POST", "/api/real/api-keys", "/api/user/api-keys", "POST"],
  ["POST", "/api/real/api-keys/key_123/revoke", "/api/user/api-keys/key_123/revoke", "POST"],
  ["GET", "/api/real/api-keys/key_123/reveal", "/api/user/api-keys/key_123/reveal", "GET"],
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
