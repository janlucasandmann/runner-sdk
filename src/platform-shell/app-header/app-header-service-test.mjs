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
assert.match(fragments.state, /threadSearchMode/);
assert.match(fragments.state, /threadSearchAllActionsVisible/);
assert.match(fragments.state, /threadSearchFileInventoryByEnvironmentId/);
assert.match(fragments.state, /threadSearchResourceDataByMode/);
assert.match(fragments.state, /threads: \{ scopeKey: "", query: "", items: \[\], total: 0 \}/);
assert.match(fragments.refs, /threadSearchFileInventoryByEnvironmentIdRef/);
assert.match(fragments.refs, /threadSearchFileInventoryScopeKeyRef/);
assert.match(fragments.refs, /threadSearchResourceLoadedAtByModeRef/);
assert.match(fragments.refs, /threadSearchResourceLatestRequestKeyRef/);
assert.match(fragments.refs, /threadSearchThreadAbortControllerRef/);
assert.match(fragments.refs, /threadSearchThreadResultsCacheRef/);
assert.doesNotMatch(fragments.refs, /threadSearchInputRef/);
assert.match(fragments.searchProjection, /const loadThreadSearchFileInventory = useCallback/);
assert.match(fragments.searchProjection, /const loadThreadSearchResourceMode = useCallback/);
assert.match(fragments.searchProjection, /threadSearchMode !== "files"/);
assert.match(fragments.searchProjection, /fetchMetronomeWorkflowsFromApi/);
assert.match(fragments.searchProjection, /proxyBackendBase \+ "\/threads\/search"/);
assert.match(fragments.searchProjection, /const THREAD_SEARCH_RESULT_LIMIT = 20/);
assert.match(fragments.searchProjection, /limit: THREAD_SEARCH_RESULT_LIMIT/);
assert.match(fragments.searchProjection, /\.slice\(0, THREAD_SEARCH_RESULT_LIMIT\)/);
assert.match(fragments.searchProjection, /threadSearchThreadAbortControllerRef\.current\?\.abort\(\)/);
assert.match(fragments.searchProjection, /threadSearchThreadResultsCacheRef\.current/);
assert.match(fragments.navigation, /function handleThreadSearchTicketSelect/);
assert.match(fragments.navigation, /function handleThreadSearchAgentSelect/);
assert.match(fragments.navigation, /function handleThreadSearchWorkflowSelect/);
assert.match(fragments.navigation, /function getThreadSearchModeForCurrentPage/);
assert.match(fragments.navigation, /activePageRef\.current/);
assert.match(fragments.navigation, /resourcesViewRef\.current/);
assert.match(fragments.navigation, /\["tasks", "calendar", "projects", "project", "tickets"\]/);
assert.doesNotMatch(fragments.navigation, /if \(activePage === "files"\)/);
assert.match(fragments.navigation, /function handleThreadSearchAction/);
assert.match(fragments.navigation, /openMetronomePage\(\{ createWorkflow: true \}\)/);
assert.match(fragments.navigation, /action: "create-file"/);
assert.match(fragments.navigation, /openTopNavIssueComposer\(\)/);
assert.match(fragments.navigation, /openPlatformResourceCreationModal\("agent"\)/);
assert.match(fragments.navigation, /function openThreadSearchResultInNewTab/);
assert.match(fragments.navigation, /function renameThreadSearchResult/);
assert.match(fragments.navigation, /function deleteThreadSearchResult/);
assert.match(fragments.navigation, /THREAD_SEARCH_RESULT_TARGET_QUERY_PARAM/);
assert.doesNotMatch(fragments.navigation, /window\.confirm/);
assert.match(fragments.lifecycle, /consumeThreadSearchResultNavigationTarget/);
assert.match(fragments.lifecycle, /applyPlatformNavigationEntry\(navigationTarget\)/);
assert.match(fragments.breadcrumbBar, /function renderAppHeaderBreadcrumbs/);
assert.doesNotMatch(fragments.breadcrumbBar, /getAppHeaderBreadcrumbIcon/);
assert.doesNotMatch(fragments.breadcrumbBar, /item\.Icon/);
assert.doesNotMatch(fragments.breadcrumbBar, /playground-top-nav-path-icon/);
assert.match(fragments.breadcrumbBar, /\["create", "configure", "develop"\]\.includes\(firstItemLabel\)/);
assert.match(fragments.breadcrumbBar, /safeItems\.slice\(1\)/);
assert.match(fragments.breadcrumbBar, /item\.node != null\s*\? item\.node/);
assert.match(fragments.breadcrumbBar, /item\.trailing/);
assert.match(fragments.breadcrumbBar, /playground-top-nav-path-item-group/);
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
assert.match(fragments.notificationsPopup, /React\.createElement\(PlatformPopup,/);
assert.match(fragments.notificationsPopup, /variant: "minimal"/);
assert.match(fragments.notificationsPopup, /surfaceClassName: "notification-menu"/);
assert.doesNotMatch(fragments.notificationsPopup, /React\.createElement\(PlatformPopupSurface,/);
assert.match(fragments.notificationsPopup, /React\.createElement\(PlatformEmptyState,/);
assert.match(fragments.notificationsPopup, /React\.createElement\(PlatformSecondaryButton,/);
assert.match(fragments.notificationsPopup, /React\.createElement\(PlatformPrimaryButton,/);
assert.doesNotMatch(fragments.notificationsPopup, /description: "You're all caught up\."/);
assert.doesNotMatch(fragments.notificationsPopup, /className: "notification-menu-empty"/);
assert.doesNotMatch(fragments.notificationsPopup, /className: "notification-menu-mark-read/);
assert.match(fragments.searchModal, /function renderAppHeaderSearchModal/);
assert.match(fragments.searchModal, /React\.createElement\(PlatformGlobalSearchModal,/);
assert.match(fragments.searchModal, /mode: threadSearchMode/);
assert.match(fragments.searchModal, /resultGroups,/);
assert.match(fragments.searchModal, /React\.createElement\(PlaygroundFileIcon,/);
assert.match(fragments.searchModal, /getPlaygroundAgentProfilePhotoUrl\(agent\)/);
assert.match(fragments.searchModal, /getPlaygroundAgentModelMeta/);
assert.match(fragments.searchModal, /getPlaygroundAgentModelProviderIcon/);
assert.match(fragments.searchModal, /platform-global-search-modal__agent-model-icon/);
assert.match(fragments.searchModal, /isPlaygroundSubtaskRecord\(task\)/);
assert.match(fragments.searchModal, /onShowAllActions:/);
assert.match(fragments.searchModal, /id: "create-file"/);
assert.match(fragments.searchModal, /id: "create-ticket"/);
assert.match(fragments.searchModal, /id: "create-agent"/);
assert.match(fragments.searchModal, /id: "create-workflow"/);
assert.match(fragments.searchModal, /id: "sign-out"/);
assert.match(fragments.searchModal, /emptyTitle: emptyStateCopy\.title/);
assert.match(fragments.searchModal, /emptyDescription: emptyStateCopy\.description/);
assert.match(fragments.searchModal, /onResultOpenInNewTab:/);
assert.match(fragments.searchModal, /onResultRename:/);
assert.match(fragments.searchModal, /onResultDelete:/);
assert.match(fragments.searchModal, /renameDisabled: !actionAvailability\.canRename/);
assert.match(fragments.searchModal, /deleteDisabled: !actionAvailability\.canDelete/);
assert.doesNotMatch(fragments.searchModal, /subtitle:/);
assert.doesNotMatch(fragments.searchModal, /PlatformModalBackdrop/);
assert.doesNotMatch(fragments.searchModal, /PlatformModalSurface/);
assert.doesNotMatch(fragments.lifecycle, /threadSearchInputRef/);
assert.doesNotThrow(() => new Function(`
  function appHeaderHost() {
    ${Object.values(fragments).join("\n")}
  }
`));

const activePageRef = { current: "thread" };
const resourcesViewRef = { current: "agents" };
const resolveSearchMode = new Function(
  "activePageRef",
  "resourcesViewRef",
  `${fragments.navigation}
  return getThreadSearchModeForCurrentPage;
  `,
)(activePageRef, resourcesViewRef);

assert.equal(resolveSearchMode(), "threads");
activePageRef.current = "tasks";
assert.equal(resolveSearchMode(), "tickets");
activePageRef.current = "calendar";
assert.equal(resolveSearchMode(), "tickets");
activePageRef.current = "files";
assert.equal(resolveSearchMode(), "files");
activePageRef.current = "metronome";
assert.equal(resolveSearchMode(), "workflows");
activePageRef.current = "resources";
resourcesViewRef.current = "agents";
assert.equal(resolveSearchMode(), "agents");
resourcesViewRef.current = "computers";
assert.equal(resolveSearchMode(), "threads");

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
assert.match(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path-item-group/);
assert.doesNotMatch(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path-icon/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.accountMenu, /\.account-menu/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.notificationsPopup, /\.notification-menu/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.notificationsPopup, /\.notification-menu-footer[\s\S]*border-top: 1px solid rgba\(255, 255, 255, 0\.075\)/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.searchModal, /\.platform-loading-state/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.searchModal, /\.platform-global-search-modal/);
assert.equal(Object.values(APP_HEADER_STYLE_FRAGMENTS).join(""), APP_HEADER_STYLES);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /createAppHeaderScriptFragments/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.appHeader\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.breadcrumbBar\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.accountMenu\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.notificationsPopup\}/);
assert.match(platformEntrySource, /\$\{APP_HEADER_APP_SCRIPT_FRAGMENTS\.searchModal\}/);
assert.doesNotMatch(platformEntrySource, /const \[threadSearchFileInventoryByEnvironmentId,/);
assert.doesNotMatch(platformEntrySource, /const loadThreadSearchFileInventory = useCallback/);
assert.doesNotMatch(platformEntrySource, /SEARCH_THREAD_EXPANDED_FETCH_LIMIT/);
assert.doesNotMatch(platformEntrySource, /refreshThreads\(SEARCH_THREAD_EXPANDED_FETCH_LIMIT\)/);
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
