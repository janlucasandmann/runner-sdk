import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS,
  SETTINGS_MODAL_CSS,
  createSettingsModalPageScript,
} from "./index.mjs";

assert.deepEqual(Object.keys(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS), ["state", "navigation"]);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state, /settingsModalOpen/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /function openSettingsModal/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /openOrganizationBillingPage/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal\.platform-modal-surface/);

const pageScript = createSettingsModalPageScript({
  inferencePageCaseScript: "",
  apiKeysLegacySettingsCase: "",
  webhooksDocumentationUrl: "https://example.test/developers/webhooks",
});
assert.match(pageScript, /function renderSettingsSurface/);
assert.match(pageScript, /function renderSettingsModal/);
assert.match(pageScript, /React\.createElement\(PlatformModal,/);
assert.match(pageScript, /React\.createElement\(PlatformModalHeader,/);
assert.match(pageScript, /React\.createElement\(PlatformModalBody,/);
assert.doesNotMatch(pageScript, /function renderSettingsPage/);
assert.doesNotThrow(() => new Function(`
  function settingsModalHost() {
    ${SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state}
    ${SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation}
    ${pageScript}
  }
`));

const demoServerSource = await fs.readFile(
  new URL("../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.match(demoServerSource, /from "\.\.\/src\/platform-shell\/index\.mjs"/);
assert.match(demoServerSource, /const SETTINGS_MODAL_PAGE_SCRIPT = createSettingsModalPageScript\(/);
assert.match(demoServerSource, /\$\{SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS\.state\}/);
assert.match(demoServerSource, /\$\{SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS\.navigation\}/);
assert.match(demoServerSource, /\$\{SETTINGS_MODAL_PAGE_SCRIPT\}/);
assert.match(demoServerSource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.accountMenu\}/);
assert.match(demoServerSource, /renderSettingsModal\(\)/);
assert.doesNotMatch(demoServerSource, /function renderSettingsPage\(/);
assert.doesNotMatch(demoServerSource, /activePage === "settings"/);
assert.doesNotMatch(demoServerSource, /id: "settings",\s+label: "Settings",\s+Icon: Settings2/);

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
