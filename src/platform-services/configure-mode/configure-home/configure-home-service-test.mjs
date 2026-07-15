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

assert.deepEqual(Object.keys(CONFIGURE_HOME_STYLE_FRAGMENTS), [
  "foundation",
  "overviewCards",
  "notificationPage",
  "notificationsTable",
]);
assert.match(CONFIGURE_HOME_STYLE_FRAGMENTS.foundation, /\.playground-configure-home/);
assert.match(CONFIGURE_HOME_STYLE_FRAGMENTS.overviewCards, /\.playground-configure-overview-card/);
assert.match(CONFIGURE_HOME_STYLE_FRAGMENTS.notificationPage, /\.playground-configure-notifications-section/);
assert.match(CONFIGURE_HOME_STYLE_FRAGMENTS.notificationsTable, /\.playground-configure-notifications-table-section/);
assert.equal(Object.values(CONFIGURE_HOME_STYLE_FRAGMENTS).join(""), CONFIGURE_HOME_PAGE_CSS);

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
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.navigation, /function openConfigureHome/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "configure"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle, /activePage === "configure"/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderConfigureHomeNav/);
assert.match(CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "configure-home"/);
assert.doesNotThrow(() => new Function(`
  function configureHomeShellHost() {
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationsState}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.state}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationStorageKey}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.notificationNavigation}
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.navigation}
    const restoreHistory = (entry) => {
      ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.historyRestore}
    };
    const getTitle = () => {
      ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle}
      return "";
    };
    ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation}
    const sidebarEntries = [${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { restoreHistory, getTitle, sidebarEntries };
  }
`));

const pricingUrl = "https://platform.example.test/pricing";
const pageFragments = createConfigureHomePageScriptFragments({ pricingUrl });
assert.deepEqual(Object.keys(pageFragments), [
  "notificationsSection",
  "home",
]);
assert.match(pageFragments.notificationsSection, /function renderConfigureNotificationsSection/);
assert.match(pageFragments.home, /function renderConfigureHomePage/);
assert.match(pageFragments.home, new RegExp(JSON.stringify(pricingUrl).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&")));
assert.doesNotThrow(() => new Function(Object.values(pageFragments).join("")));

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/configure-mode\/configure-home\/index\.mjs"/);
assert.match(demoServerSource, /const CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS = createConfigureHomePageScriptFragments\(/);
assert.match(demoServerSource, /const configureHomeService = createConfigureHomeService\(/);
assert.match(demoServerSource, /configureHomeService\.handleRequest\(req, res, url\)/);
assert.match(demoServerSource, /\$\{CONFIGURE_HOME_STYLE_FRAGMENTS\.foundation\}/);
assert.match(demoServerSource, /\$\{CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS\.storage\}/);
assert.match(demoServerSource, /\$\{CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS\.notificationProjection\}/);
assert.match(demoServerSource, /\$\{CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS\.home\}/);
assert.match(demoServerSource, /\$\{CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS\.sidebarEntry\}/);
assert.doesNotMatch(demoServerSource, /^\s*\.playground-configure-home \{/m);
assert.doesNotMatch(demoServerSource, /function readStoredNotificationIds\(/);
assert.doesNotMatch(demoServerSource, /const notificationItems = useMemo\(/);
assert.doesNotMatch(demoServerSource, /function handleMarkAllNotificationsRead\(/);
assert.doesNotMatch(demoServerSource, /function renderNotificationMenu\(/);
assert.doesNotMatch(demoServerSource, /function renderConfigureHomePage\(/);
assert.doesNotMatch(demoServerSource, /function renderConfigureHomeNav\(/);
assert.doesNotMatch(demoServerSource, /url\.pathname === "\/api\/real\/notifications\/in-app"/);

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
