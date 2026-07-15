import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  APP_HEADER_STYLE_FRAGMENTS,
  APP_HEADER_STYLES,
  createAppHeaderScriptFragments,
} from "./index.mjs";

const fragments = createAppHeaderScriptFragments();

assert.deepEqual(Object.keys(fragments), [
  "state",
  "refs",
  "navigation",
  "lifecycle",
  "searchProjection",
  "breadcrumbBar",
  "appHeader",
  "accountMenu",
  "notificationsPopup",
  "searchModal",
]);
assert.match(fragments.state, /accountMenuOpen/);
assert.match(fragments.state, /notificationsOpen/);
assert.match(fragments.state, /threadSearchOpen/);
assert.match(fragments.breadcrumbBar, /function renderAppHeaderBreadcrumbs/);
assert.doesNotMatch(fragments.breadcrumbBar, /getAppHeaderBreadcrumbIcon/);
assert.doesNotMatch(fragments.breadcrumbBar, /item\.Icon/);
assert.doesNotMatch(fragments.breadcrumbBar, /playground-top-nav-path-icon/);
assert.match(fragments.breadcrumbBar, /\["create", "configure", "develop"\]\.includes\(firstItemLabel\)/);
assert.match(fragments.breadcrumbBar, /safeItems\.slice\(1\)/);
assert.match(fragments.appHeader, /function renderAppHeader\(/);
assert.doesNotMatch(fragments.appHeader, /function renderAppHeaderSearchButton\(/);
assert.doesNotMatch(fragments.appHeader, /function renderAppHeaderSidebarToggle\(/);
assert.doesNotMatch(fragments.appHeader, /function renderAppHeaderAccountButton\(/);
assert.doesNotMatch(fragments.appHeader, /renderAppHeaderSearchButton\(\)/);
assert.doesNotMatch(fragments.appHeader, /renderAppHeaderSidebarToggle\(\)/);
assert.doesNotMatch(fragments.appHeader, /renderAppHeaderAccountButton\(\)/);
assert.match(fragments.accountMenu, /function renderAppHeaderAccountMenu/);
assert.match(fragments.accountMenu, /React\.createElement\(PlatformPopup,/);
assert.match(fragments.accountMenu, /React\.createElement\(Settings,/);
assert.doesNotMatch(fragments.accountMenu, /React\.createElement\(Settings2,/);
assert.doesNotMatch(fragments.accountMenu, /openCalendarPage/);
assert.doesNotMatch(fragments.accountMenu, /"Calendar"/);
assert.match(fragments.notificationsPopup, /function renderAppHeaderNotificationsPopup/);
assert.match(fragments.searchModal, /function renderAppHeaderSearchModal/);
assert.doesNotThrow(() => new Function(`
  function appHeaderHost() {
    ${Object.values(fragments).join("\n")}
  }
`));

assert.deepEqual(Object.keys(APP_HEADER_STYLE_FRAGMENTS), [
  "header",
  "overlayScrims",
  "accountMenu",
  "notificationsScrim",
  "notificationsPopup",
  "searchModal",
]);
assert.match(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path-label[\s\S]*font-size: 14px/);
assert.doesNotMatch(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path-icon/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.accountMenu, /\.account-menu/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.notificationsPopup, /\.notification-menu/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.searchModal, /\.thread-search-modal/);
assert.equal(Object.values(APP_HEADER_STYLE_FRAGMENTS).join(""), APP_HEADER_STYLES);

const demoServerSource = await fs.readFile(
  new URL("../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.match(demoServerSource, /createAppHeaderScriptFragments/);
assert.match(demoServerSource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.appHeader\}/);
assert.match(demoServerSource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.breadcrumbBar\}/);
assert.match(demoServerSource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.accountMenu\}/);
assert.match(demoServerSource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.notificationsPopup\}/);
assert.match(demoServerSource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.searchModal\}/);
assert.match(demoServerSource, /renderAppHeader\(\{\s*className: "playground-thread-navbar"/);
assert.match(demoServerSource, /pathItems: \[\{ label: "Create" \}, \{ label: "New Thread" \}\]/);
assert.doesNotMatch(demoServerSource, /React\.createElement\("div", \{ className: "playground-content-nav" \}/);
assert.match(demoServerSource, /const \[showPlaygroundOnboarding, setShowPlaygroundOnboarding\]/);
assert.match(demoServerSource, /const \[showSubscriptionSuccessModal, setShowSubscriptionSuccessModal\]/);
assert.doesNotMatch(demoServerSource, /function renderUnifiedTopNav\(/);
assert.doesNotMatch(demoServerSource, /function renderThreadSearchPalette\(/);
assert.doesNotMatch(demoServerSource, /function renderNotificationMenu\(/);
assert.doesNotMatch(demoServerSource, /renderAppHeaderSidebarToggle\(\)/);

console.log("App Header component ownership, styles, icon contract, and browser syntax passed.");
