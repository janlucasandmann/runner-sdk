import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS,
  SETTINGS_MODAL_CSS,
  createSettingsModalPageScript,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../apps/platform/testing/platform-composition-source.mjs";

assert.deepEqual(Object.keys(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS), ["state", "navigation"]);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state, /settingsModalOpen/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /function openSettingsModal/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /openOrganizationBillingPage/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /openDevelopWebhooksPage/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal\.platform-modal-surface/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal-navigation/);
assert.match(SETTINGS_MODAL_CSS, /background:\s*transparent !important/);

const pageScript = createSettingsModalPageScript({
  inferencePageCaseScript: "",
  apiKeysLegacySettingsCase: "",
  webhooksDocumentationUrl: "https://example.test/developers/webhooks",
});
assert.match(pageScript, /function renderSettingsSurface/);
assert.match(pageScript, /function renderSettingsModal/);
assert.match(pageScript, /React\.createElement\(PlatformModal,/);
assert.match(pageScript, /title: "Settings"/);
assert.match(pageScript, /closeButtonLabel: "Close settings"/);
assert.match(pageScript, /React\.createElement\(PlatformModalBody,/);
assert.match(pageScript, /className: "platform-modal-split-layout playground-shell-settings-modal-layout"/);
assert.match(pageScript, /\{ id: "profile", label: "Account", Icon: UserRound \}/);
assert.match(pageScript, /\{ id: "password", label: "Password", Icon: KeyRound \}/);
assert.match(pageScript, /\{ id: "delete", label: "Delete Account", Icon: Trash2, isDanger: true \}/);
assert.match(pageScript, /case "password":/);
assert.match(pageScript, /case "delete":/);
assert.equal(pageScript.match(/"Update Password"/g)?.length, 1);
assert.equal(pageScript.match(/"Delete My Account"/g)?.length, 1);
assert.doesNotMatch(pageScript, /function renderSettingsPage/);
assert.doesNotThrow(() => new Function(`
  function settingsModalHost() {
    ${SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state}
    ${SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation}
    ${pageScript}
  }
`));

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "[^"]*\/src\/platform-shell\/index\.mjs"/);
assert.match(platformEntrySource, /const SETTINGS_MODAL_PAGE_SCRIPT = createSettingsModalPageScript\(/);
assert.match(platformEntrySource, /\$\{SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS\.state\}/);
assert.match(platformEntrySource, /\$\{SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS\.navigation\}/);
assert.match(platformEntrySource, /\$\{SETTINGS_MODAL_PAGE_SCRIPT\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.accountMenu\}/);
assert.match(platformEntrySource, /renderSettingsModal\(\)/);
assert.doesNotMatch(platformEntrySource, /function renderSettingsPage\(/);
assert.doesNotMatch(platformEntrySource, /activePage === "settings"/);
assert.doesNotMatch(platformEntrySource, /id: "settings",\s+label: "Settings",\s+Icon: Settings2/);

const accountMenuSource = await fs.readFile(
  new URL("../app-header/client/components/account-menu.mjs", import.meta.url),
  "utf8",
);
assert.match(accountMenuSource, /onClick: openSettingsModal/);
assert.match(accountMenuSource, /React\.createElement\(Settings,/);

const organizationBillingSource = await fs.readFile(
  new URL("../../platform-services/configure-mode/organizations/client/page/identity-and-billing.mjs", import.meta.url),
  "utf8",
);
assert.match(organizationBillingSource, /renderSettingsSurface\(/);

console.log("Settings modal shell ownership, central modal usage, and route-removal contracts passed.");
