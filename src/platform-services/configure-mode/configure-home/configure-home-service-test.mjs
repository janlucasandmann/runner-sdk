import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS,
  CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS,
  CONFIGURE_HOME_PAGE_CSS,
  CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS,
  CONFIGURE_HOME_STYLE_FRAGMENTS,
  createConfigureHomePageScriptFragments,
  createConfigureHomeService,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.deepEqual(Object.keys(CONFIGURE_HOME_STYLE_FRAGMENTS), [
  "notificationPage",
]);
assert.match(CONFIGURE_HOME_STYLE_FRAGMENTS.notificationPage, /\.configure-home-notification__identity/);
assert.equal(Object.values(CONFIGURE_HOME_STYLE_FRAGMENTS).join(""), CONFIGURE_HOME_PAGE_CSS);
assert.equal(
  await fs.readFile(
    new URL("./client/styles/configure-home.css", import.meta.url),
    "utf8",
  ),
  CONFIGURE_HOME_PAGE_CSS,
  "The typed Configure Home stylesheet must remain byte-identical to the compatibility style export.",
);

assert.match(CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS.constants, /PLAYGROUND_NOTIFICATION_READ_STORAGE_PREFIX/);
assert.match(CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS.storage, /function readStoredNotificationIds/);
assert.match(CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS.storage, /function buildNotificationReadStorageKey/);
assert.match(CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS.records, /function normalizeInAppNotificationRecord/);
assert.match(CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS.records, /function normalizeTeamInvitationNotificationRecord/);
assert.doesNotThrow(() => new Function(`
  function configureHomeDomainHost() {
    ${Object.values(CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.match(CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationProjection, /const notificationItems = useMemo/);
assert.match(CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationProjection, /const visibleNotificationPageItems = useMemo/);
assert.match(CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationLoadLifecycle, /loadProductNotifications/);
assert.match(CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationLoadLifecycle, /loadThreadPermissionNotifications/);
assert.match(CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationActions, /function handleMarkAllNotificationsRead/);
assert.match(CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationActions, /function handleOrganizationInvitationDecision/);
assert.doesNotThrow(() => new Function(`
  function configureHomeRuntimeHost() {
    ${Object.values(CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationsState, /productNotifications/);
assert.doesNotMatch(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationsState, /notificationsOpen/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.state, /configureHomeTab/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationStorageKey, /notificationReadStorageKey/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationNavigation, /function openNotificationsPage/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationNavigation, /setConfigureHomeTab\("notifications"\)/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.navigation, /function openConfigureHome/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyCapture, /mode: configureHomeTab === "notifications"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "configure"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.mode === "notifications"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle, /configureHomeTab === "notifications"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderConfigureHomeNav/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderConfigureHomeCreateSelector/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformButtonSelector/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /buttonVariant: "primary"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /popupVariant: "minimal"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "New"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /closeOnSelect: true/);
for (const label of ["Agent", "Computer", "Skill", "Team", "Organization"]) {
  assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, new RegExp(`label: "${label}"`));
}
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /normalizedTargetId === "agent" \|\| normalizedTargetId === "computer"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /openPlatformResourceCreationModal\(normalizedTargetId\)/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /openToolsView\("skills", \{ create: true/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "configure-home"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "configure-notifications"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: Bell/);
assert.doesNotThrow(() => new Function(`
  function configureHomeShellHost() {
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationsState}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.state}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationStorageKey}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationNavigation}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.navigation}
    const captureHistory = () => {
      ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyCapture}
      return { page: "" };
    };
    const restoreHistory = (entry) => {
      ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyRestore}
    };
    const getTitle = () => {
      ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle}
      return "";
    };
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation}
    const sidebarEntries = [${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { captureHistory, restoreHistory, getTitle, sidebarEntries };
  }
`));

const pricingUrl = "https://platform.example.test/pricing";
const pageFragments = createConfigureHomePageScriptFragments({ pricingUrl });
assert.deepEqual(Object.keys(pageFragments), [
  "notificationsSection",
  "home",
  "notifications",
]);
assert.match(pageFragments.notificationsSection, /function getConfigureHomeNotificationActions/);
assert.match(pageFragments.home, /function renderConfigureHomePage/);
assert.match(pageFragments.home, /ConfigureHomeOverviewPage/);
assert.match(pageFragments.home, /onOpenNotifications: openNotificationsPage/);
assert.match(pageFragments.home, /onOpenEvaluations: openEvaluationsOverviewPage/);
assert.match(pageFragments.home, /onOpenGuardrails: openGuardrailsOverviewPage/);
assert.doesNotMatch(pageFragments.home, /NotificationsOverviewPage/);
assert.doesNotMatch(pageFragments.home, /visibleNotificationPageItems/);
assert.match(pageFragments.notifications, /function renderConfigureNotificationsPage/);
assert.match(pageFragments.notifications, /NotificationsOverviewPage/);
assert.doesNotMatch(pageFragments.home, /PlatformDataTable/);
assert.match(pageFragments.home, new RegExp(JSON.stringify(pricingUrl).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&")));
assert.doesNotThrow(() => new Function(Object.values(pageFragments).join("")));

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/configure-home\/index\.mjs"/);
assert.match(platformEntrySource, /const CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS = createConfigureHomePageScriptFragments\(/);
assert.match(platformEntrySource, /configureHomeService:\s*createConfigureHomeService\(/);
assert.match(
  platformEntrySource,
  /import \{[^}]*ConfigureHomeOverviewPage[^}]*\} from "\/dist\/platform-shell\/presentation\/platform-pages\.js"/,
);
assert.match(platformEntrySource, /configureHomeService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS\.storage\}/);
assert.match(platformEntrySource, /\$\{CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS\.notificationProjection\}/);
assert.match(platformEntrySource, /\$\{CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS\.home\}/);
assert.match(platformEntrySource, /\$\{CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS\.notifications\}/);
assert.match(platformEntrySource, /configurePrimaryEntries: CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS\.sidebarEntry/);
assert.doesNotMatch(platformEntrySource, /^\s*\.configure-home-overview__teaser \{/m);
assert.doesNotMatch(platformEntrySource, /function readStoredNotificationIds\(/);
assert.doesNotMatch(platformEntrySource, /const notificationItems = useMemo\(/);
assert.doesNotMatch(platformEntrySource, /function handleMarkAllNotificationsRead\(/);
assert.doesNotMatch(platformEntrySource, /function renderNotificationMenu\(/);
assert.doesNotMatch(platformEntrySource, /function renderConfigureHomePage\(/);
assert.doesNotMatch(platformEntrySource, /function renderConfigureHomeNav\(/);
assert.doesNotMatch(platformEntrySource, /url\.pathname === "\/api\/real\/notifications\/in-app"/);

const proxyCalls = [];
const configureHomeService = createConfigureHomeService({
  proxyUpstreamGet: (...args) => proxyCalls.push(args),
});
let handled = configureHomeService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/notifications/in-app?limit=10"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[0]?.[2], "/notifications/in-app");
assert.deepEqual(proxyCalls[0]?.[3], { emptyOn404: true });

handled = configureHomeService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/notifications/in-app"),
);
assert.equal(handled, false);
handled = configureHomeService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/notifications/email"),
);
assert.equal(handled, false);
assert.throws(
  () => createConfigureHomeService({}),
  /Configure Home service requires the proxyUpstreamGet adapter/,
);

console.log("Configure Home client ownership, browser syntax, notification projection, and route contracts passed.");
