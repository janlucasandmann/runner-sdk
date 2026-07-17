import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  APP_HEADER_STYLE_FRAGMENTS,
  APP_HEADER_STYLES,
  createAppHeaderScriptFragments,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../apps/platform/testing/platform-composition-source.mjs";

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
assert.match(fragments.appHeader, /React\.createElement\(PlatformSecondaryButton,/);
assert.match(fragments.appHeader, /className: "playground-top-nav-private-chat-control"/);
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

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /createAppHeaderScriptFragments/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.appHeader\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.breadcrumbBar\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.accountMenu\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.notificationsPopup\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.searchModal\}/);
assert.match(platformEntrySource, /renderAppHeader\(\{\s*className: "playground-thread-navbar"/);
assert.match(platformEntrySource, /pathItems: \[\{ label: "Create" \}, \{ label: "New Thread" \}\]/);
assert.doesNotMatch(platformEntrySource, /React\.createElement\("div", \{ className: "playground-content-nav" \}/);
assert.match(platformEntrySource, /const \[showPlaygroundOnboarding, setShowPlaygroundOnboarding\]/);
assert.match(platformEntrySource, /const \[showSubscriptionSuccessModal, setShowSubscriptionSuccessModal\]/);
assert.doesNotMatch(platformEntrySource, /function renderUnifiedTopNav\(/);
assert.doesNotMatch(platformEntrySource, /function renderThreadSearchPalette\(/);
assert.doesNotMatch(platformEntrySource, /function renderNotificationMenu\(/);
assert.doesNotMatch(platformEntrySource, /renderAppHeaderSidebarToggle\(\)/);

console.log("App Header component ownership, styles, icon contract, and browser syntax passed.");
