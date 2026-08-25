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
assert.match(
  SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state,
  /const settingsMarketingEmailsAvailable = platformDeploymentProfile\.topology !== "on_prem";/,
  "Marketing-email preferences must remain a shared settings feature gated by deployment topology.",
);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state, /SETTINGS_NOTIFICATION_PREFERENCE_DEFAULTS/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state, /settingsNotificationPreferences/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /function openSettingsModal/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /loadSettingsNotificationPreferences/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /updateSettingsNotificationPreference/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /notifications\/preferences/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state, /settingsDataControlCategory/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /deleteSettingsDataControlCategory/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /account\/data-controls/);
assert.doesNotMatch(
  SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation,
  /!hasRealAccess \|\| !effectiveApiKey/,
  "Session-authenticated settings must synchronize preferences even when the browser has no raw API key.",
);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /openOrganizationBillingPage/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /openDevelopWebhooksPage/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal\.platform-modal-surface/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal-navigation/);
assert.match(SETTINGS_MODAL_CSS, /background:\s*transparent !important/);
assert.match(
  SETTINGS_MODAL_CSS,
  /\.playground-shell-settings-modal input\[type="text"\][\s\S]*?border:\s*none !important;/,
  "Every text-like input in the settings modal must be borderless.",
);

const pageScript = createSettingsModalPageScript({
  inferencePageCaseScript: "",
  apiKeysLegacySettingsCase: "",
  webhooksDocumentationUrl: "https://example.test/developers/webhooks",
});
assert.match(pageScript, /function renderSettingsSurface/);
assert.match(pageScript, /function renderSettingsModal/);
assert.match(pageScript, /React\.createElement\(PlatformModal,/);
assert.match(pageScript, /title: "Settings"/);
assert.match(pageScript, /ariaLabel: "Settings"/);
assert.match(pageScript, /showHeader: false/);
assert.match(pageScript, /maxWidth: "950px"/);
assert.doesNotMatch(pageScript, /closeButtonLabel: "Close settings"/);
assert.match(pageScript, /React\.createElement\(PlatformModalBody,/);
assert.match(pageScript, /className: "platform-modal-split-layout playground-shell-settings-modal-layout"/);
assert.match(pageScript, /className: "playground-shell-settings-modal-account"/);
assert.match(
  pageScript,
  /renderAccountAvatar\(\s*"playground-shell-settings-modal-account-avatar",\s*"playground-shell-settings-modal-account-avatar-image",\s*accountInitials,\s*accountAvatarUrl\s*\)/,
  "The settings sidebar account summary must reuse the shell's normalized account avatar renderer.",
);
assert.match(pageScript, /className: "playground-shell-settings-modal-account-name"/);
assert.match(pageScript, /accountName \|\| "Account"/);
assert.match(pageScript, /className: "playground-shell-settings-modal-account-email"/);
assert.match(pageScript, /accountEmail \|\| "No email address"/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal-account-avatar/);
assert.match(pageScript, /className: "playground-shell-settings-modal-page-title" \}, "Account"/);
assert.match(pageScript, /className: "playground-shell-settings-modal-page-title" \}, "Password"/);
const emailFieldHeaderIndex = pageScript.indexOf('className: "playground-settings-email-field-header"');
const emailFieldLabelIndex = pageScript.indexOf('htmlFor: "settings-profile-email-address"', emailFieldHeaderIndex);
const emailVerifiedLabelIndex = pageScript.indexOf('"Email verified"', emailFieldLabelIndex);
const emailFieldInputIndex = pageScript.indexOf('id: "settings-profile-email-address"', emailVerifiedLabelIndex);
assert.ok(
  emailFieldHeaderIndex >= 0
    && emailFieldLabelIndex > emailFieldHeaderIndex
    && emailVerifiedLabelIndex > emailFieldLabelIndex
    && emailFieldInputIndex > emailVerifiedLabelIndex,
  "The email verification state must sit in the label row above the input.",
);
assert.match(SETTINGS_MODAL_CSS, /\.playground-settings-email-field-header[\s\S]{0,260}margin-bottom:\s*4px;/);
assert.match(SETTINGS_MODAL_CSS, /--platform-modal-sidebar-width:\s*240px/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal-page-title,[\s\S]*?font-size:\s*18px;[\s\S]*?font-weight:\s*400;/);
assert.match(
  pageScript,
  /React\.createElement\(PlatformAnalyticsChart, \{\s*analytics: activeUsageAnalyticsModel,\s*chartType: "bar",/,
  "Admin usage charts must render through the centralized Chart.js analytics component.",
);
assert.match(pageScript, /id: "models",\s*label: "Usage by Models"/);
assert.match(pageScript, /ariaLabel: "Compute token cost by LLM model"/);
assert.match(pageScript, /label: "Compute runtime"/);
assert.match(pageScript, /label: "Agent runs"/);
assert.match(pageScript, /label: "Inference tokens"/);
assert.match(pageScript, /label: "Computer runtime"/);
assert.match(pageScript, /label: "Resource runtime"/);
assert.match(pageScript, /valueKind: "duration"/);
assert.doesNotMatch(
  pageScript,
  /resolvedAgentModelOptions/,
  "The settings renderer must not reference agent-page component-local model options.",
);
assert.match(
  pageScript,
  /ariaLabel: "Usage consumers",[\s\S]{0,420}layout: "fill",\s*variant: "minimalistic-ui",\s*sticky: false,\s*pagination: \{\},\s*toolbar: \{\s*title: isComputeObservabilityUsage \? "Compute resources" : "Consumers",\s*search: \{\s*placeholder: "Search consumers",\s*ariaLabel: "Search usage consumers",\s*getSearchText:/,
  "Admin usage consumers must use the resource-overview minimal data table treatment.",
);
assert.match(
  pageScript,
  /React\.createElement\(PlatformLoadingState, \{\s*className: "playground-settings-usage-chart-loading-frame",\s*message: "Loading usage\.\.\.",\s*centered: true,/,
  "Admin usage charts must use the centralized loading indicator label.",
);
assert.match(pageScript, /\{ id: "profile", label: "Account", Icon: UserRound \}/);
assert.match(pageScript, /\{ id: "notifications", label: "Notifications", Icon: Bell \}/);
assert.match(pageScript, /\{ id: "password", label: "Password", Icon: KeyRound \}/);
assert.match(pageScript, /\{ id: "data-controls", label: "Data Controls", Icon: Database \}/);
assert.match(pageScript, /\{ id: "delete", label: "Delete Account", Icon: Trash2, isDanger: true \}/);
assert.match(pageScript, /case "password":/);
assert.doesNotMatch(pageScript, /"Update your account password"/);
assert.match(
  pageScript,
  /case "password":[\s\S]{0,500}className: "playground-settings-account-shell is-wide"/,
  "The password page must use the full settings content width.",
);
for (const passwordInputId of [
  "settings-password-current",
  "settings-password-new",
  "settings-password-confirm",
]) {
  const passwordInputIndex = pageScript.indexOf(`id: "${passwordInputId}"`);
  const precedingFieldSource = pageScript.slice(Math.max(0, passwordInputIndex - 260), passwordInputIndex);
  assert.ok(passwordInputIndex >= 0);
  assert.doesNotMatch(precedingFieldSource, /maxWidth/, `${passwordInputId} must span the full form width.`);
}
assert.match(
  pageScript,
  /React\.createElement\(PlatformPrimaryButton, \{[\s\S]{0,420}handleSettingsPasswordChange\(\)[\s\S]{0,260}"Update Password"/,
  "Password updates must use the centralized primary button.",
);
assert.match(pageScript, /case "notifications":/);
assert.match(pageScript, /case "data-controls":/);
assert.match(pageScript, /SETTINGS_DATA_CONTROL_ROWS\.map/);
assert.match(pageScript, /React\.createElement\(PlatformConfirmationModal,/);
assert.match(pageScript, /confirmLabel: "Delete all"/);
assert.match(SETTINGS_MODAL_CSS, /\.playground-shell-settings-modal-data-control-row/);
assert.match(pageScript, /React\.createElement\(PlatformToggle,/);
for (const preferenceId of [
  "agentRuns",
  "permissionRequests",
  "assignedWork",
  "taskActivity",
  "mentions",
  "invitations",
  "productUpdates",
]) {
  assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.state, new RegExp(`id: "${preferenceId}"`));
}
assert.match(pageScript, /settingsNotificationPreferenceRows\.map/);
assert.match(SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS.navigation, /notifications\/catalog/);
assert.match(
  pageScript,
  /className: "playground-settings-marketing-toggle-row"[\s\S]{0,900}React\.createElement\(PlatformToggle, \{[\s\S]{0,500}updateSettingsMarketingConsent\(checked \? "opted_in" : "opted_out"\)/,
  "Marketing consent must use one centralized toggle aligned to the right.",
);
assert.doesNotMatch(pageScript, /settingsMarketingConsentStatus === "opted_in" \? PlatformPrimaryButton : PlatformSecondaryButton/);
assert.match(pageScript, /case "delete":/);
assert.match(
  pageScript,
  /settingsMarketingEmailsAvailable\s+\? React\.createElement\("div", \{ className: "playground-settings-field"/,
  "The appliance must omit the complete Marketing Emails section instead of rendering a capability error.",
);
assert.match(
  pageScript,
  /settingsMarketingEmailsAvailable\s+\? renderSettingsInlineStatus\("error", settingsMarketingConsentError\)\s+: null/,
  "Hosted marketing-consent errors must not render on an appliance.",
);
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
assert.match(
  platformEntrySource,
  /const loadSettingsMarketingConsent = useCallback\(async function loadSettingsMarketingConsent\(\) \{\s*if \(!settingsMarketingEmailsAvailable \|\| !hasSessionAuth\)/,
  "Appliance settings must not request the hosted marketing-consent capability.",
);
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
