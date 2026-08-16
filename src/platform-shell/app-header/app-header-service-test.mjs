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
assert.match(fragments.searchProjection, /function resolveGlobalServiceSearchQuery\(value\)/);
assert.match(fragments.searchProjection, /normalizedValue\.startsWith\("\/"\)/);
assert.match(fragments.searchProjection, /const isGlobalServiceSearchQuery = globalServiceSearchQuery !== null/);
assert.match(fragments.searchProjection, /\|\| isGlobalServiceSearchQuery[\s\S]*?loadThreadSearchResourceMode/);
assert.match(fragments.searchProjection, /&& !isGlobalServiceSearchQuery[\s\S]*?&& searchQuery/);
const serviceQueryResolverSource = fragments.searchProjection.match(
  /function resolveGlobalServiceSearchQuery\(value\) \{[\s\S]*?\n        \}/,
)?.[0];
assert.ok(serviceQueryResolverSource);
const resolveGlobalServiceSearchQuery = new Function(
  `${serviceQueryResolverSource}
  return resolveGlobalServiceSearchQuery;
  `,
)();
assert.equal(resolveGlobalServiceSearchQuery("agents"), null);
assert.equal(resolveGlobalServiceSearchQuery("/"), "");
assert.equal(resolveGlobalServiceSearchQuery(" /  agent runtime "), "agent runtime");
assert.match(fragments.searchProjection, /function resolveExactThreadSearchId\(value\)/);
assert.match(fragments.searchProjection, /\/\^thread_\[A-Za-z0-9_-\]\+\$\//);
assert.match(
  fragments.searchProjection,
  /proxyBackendBase \+ "\/threads\/" \+ encodeURIComponent\(exactThreadId\)/,
);
assert.match(
  fragments.searchProjection,
  /!\(exactThreadId && response\.status === 404\)/,
);
assert.match(fragments.searchProjection, /exactThreadId \? 0 : 180/);
const exactThreadIdResolverSource = fragments.searchProjection.match(
  /function resolveExactThreadSearchId\(value\) \{[\s\S]*?\n        \}/,
)?.[0];
assert.ok(exactThreadIdResolverSource);
const resolveExactThreadSearchId = new Function(
  `${exactThreadIdResolverSource}
  return resolveExactThreadSearchId;
  `,
)();
assert.equal(resolveExactThreadSearchId("thread_abc-123_XYZ"), "thread_abc-123_XYZ");
assert.equal(resolveExactThreadSearchId("  thread_abc-123_XYZ  "), "thread_abc-123_XYZ");
assert.equal(resolveExactThreadSearchId("thread_"), "");
assert.equal(resolveExactThreadSearchId("https://example.com/thread_abc"), "");
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
assert.match(fragments.navigation, /openProjectIssueComposerFromHeader\(\)/);
assert.doesNotMatch(fragments.navigation, /openTopNavIssueComposer\(\)/);
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
assert.match(fragments.breadcrumbBar, /item\.leading != null/);
assert.match(fragments.breadcrumbBar, /playground-top-nav-path-leading/);
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
assert.match(fragments.accountMenu, /variant: "minimal"/);
assert.match(fragments.accountMenu, /className: "tb-popup-row account-menu-account-button"/);
assert.match(fragments.accountMenu, /className: "tb-popup-row account-menu-item"/);
assert.match(fragments.accountMenu, /React\.createElement\(Settings,/);
assert.doesNotMatch(fragments.accountMenu, /React\.createElement\(Settings2,/);
assert.doesNotMatch(fragments.accountMenu, /openCalendarPage/);
assert.doesNotMatch(fragments.accountMenu, /"Calendar"/);
assert.match(fragments.notificationsPopup, /function renderAppHeaderNotificationsPopup/);
assert.match(fragments.notificationsPopup, /React\.createElement\(PlatformPopup,/);
assert.match(fragments.notificationsPopup, /variant: "minimal"/);
assert.match(fragments.notificationsPopup, /surfaceClassName: "notification-menu"/);
assert.match(fragments.notificationsPopup, /item\.kind === "task_activity"/);
assert.match(fragments.notificationsPopup, /handleOpenTaskActivityNotification\(item\)/);
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
assert.match(fragments.searchModal, /getGlobalServiceNavigationItems\(globalServiceSearchQuery\)/);
assert.match(fragments.searchModal, /id: serviceItem\.globalSearchId/);
assert.match(fragments.searchModal, /label: "Services"/);
assert.match(fragments.searchModal, /actionsHidden: true/);
assert.match(fragments.searchModal, /handleGlobalServiceNavigationItemClick\(resultId\)/);
assert.match(fragments.searchModal, /title: "No services found"/);
assert.match(
  fragments.searchModal,
  /resolveExactThreadSearchId\(nextQuery\)[\s\S]*?threadSearchMode !== "threads"/,
);
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
assert.match(fragments.searchModal, /title: "Thread not found"/);
assert.match(fragments.searchModal, /description: "Check the thread ID and try again\."/);
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
assert.match(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path-leading\s*\{[\s\S]*?flex: 0 0 auto/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path-item-group/);
assert.match(
  APP_HEADER_STYLE_FRAGMENTS.header,
  /\.playground-top-nav-path-item\s*\{[\s\S]*?max-width: none;[\s\S]*?flex: 0 0 auto;[\s\S]*?text-overflow: clip;/,
);
assert.match(
  APP_HEADER_STYLE_FRAGMENTS.header,
  /\.playground-top-nav-path-item\.is-current\s*\{[\s\S]*?max-width: min\(360px, 42vw\);[\s\S]*?flex: 0 1 auto;[\s\S]*?text-overflow: ellipsis;/,
);
assert.match(
  APP_HEADER_STYLE_FRAGMENTS.header,
  /\.playground-top-nav-path-item\.is-current \.playground-top-nav-path-label\s*\{[\s\S]*?flex: 1 1 auto;[\s\S]*?text-overflow: ellipsis;/,
);
assert.doesNotMatch(APP_HEADER_STYLE_FRAGMENTS.header, /\.playground-top-nav-path-icon/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.accountMenu, /\.account-menu/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.notificationsPopup, /\.notification-menu/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.notificationsPopup, /\.notification-menu-footer[\s\S]*border-top: 1px solid rgba\(255, 255, 255, 0\.075\)/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.searchModal, /\.platform-loading-state/);
assert.match(APP_HEADER_STYLE_FRAGMENTS.searchModal, /\.platform-global-search-modal/);
assert.match(
  APP_HEADER_STYLE_FRAGMENTS.searchModal,
  /\.platform-modal-backdrop\.platform-global-search-modal__backdrop\s*\{[\s\S]*?z-index:\s*10040;/,
);
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
assert.match(
  platformEntrySource,
  /function renderInitialThreadWelcomeNav\(\) \{[\s\S]*?className: "playground-thread-welcome-navbar",[\s\S]*?hidePath: true/,
);
assert.doesNotMatch(
  platformEntrySource,
  /className: "playground-thread-welcome-navbar",\s*pathItems:/,
);
assert.doesNotMatch(platformEntrySource, /React\.createElement\("div", \{ className: "playground-content-nav" \}/);
assert.match(platformEntrySource, /const \[showSubscriptionSuccessModal, setShowSubscriptionSuccessModal\]/);
assert.doesNotMatch(platformEntrySource, /function renderUnifiedTopNav\(/);
assert.doesNotMatch(platformEntrySource, /function renderThreadSearchPalette\(/);
assert.doesNotMatch(platformEntrySource, /function renderNotificationMenu\(/);
assert.doesNotMatch(platformEntrySource, /renderAppHeaderSidebarToggle\(\)/);
assert.match(platformEntrySource, /function getThreadPagePathItems\(\)/);
assert.match(
  platformEntrySource,
  /function renderThreadTitleActionMenu\(\) \{[\s\S]*?return React\.createElement\(PlatformResourceHeaderActions,[\s\S]*?React\.createElement\(PlatformResourceActionsMenu, \{[\s\S]*?onOpenChange: handleThreadNavMenuOpenChange,[\s\S]*?resourceLabel: "Thread"/,
);
assert.match(
  platformEntrySource,
  /function renderThreadTitleActionMenu\(\) \{\s*if \(!selectedThreadNavRecord\?\.id\) \{/,
  "The thread title menu must remain available while a thread side-detail drawer is open.",
);
assert.doesNotMatch(
  platformEntrySource,
  /function renderThreadTitleActionMenu\(\) \{\s*if \([^)]*isThreadSideDetailOpen/,
  "Thread side-detail state must not hide the thread title menu.",
);
assert.equal(
  platformEntrySource.match(/playground-thread-nav-popup-shell/g)?.length,
  1,
  "The thread actions popup must be owned only by the active breadcrumb item.",
);
assert.match(
  platformEntrySource,
  /label: selectedThreadTitle \|\| "Current thread",[\s\S]*?trailing: threadTitleActionMenu/,
);
assert.match(
  platformEntrySource,
  /label: selectedThreadProjectName,[\s\S]*?trailing: selectedThreadTaskTicketNumber \? null : threadTitleActionMenu,[\s\S]*?className: "playground-project-breadcrumb-icon"[\s\S]*?onClick: openSelectedThreadProject/,
);
assert.match(
  platformEntrySource,
  /label: selectedThreadTaskTicketNumber,[\s\S]*?trailing: threadTitleActionMenu,[\s\S]*?className: "playground-tasks-backlog-project-icon is-" \+ selectedThreadTaskType[\s\S]*?onClick: openSelectedThreadTaskDetail/,
);
assert.match(
  platformEntrySource,
  /const selectedThreadTaskTicketNumber = selectedThreadTaskPreview\?\.taskId[\s\S]*?formatPlaygroundProjectTicketNumber\([\s\S]*?name: selectedThreadProjectName/,
);
assert.match(platformEntrySource, /pathItems: getThreadPagePathItems\(\)/);
assert.match(
  platformEntrySource,
  /const activeProjectSectionId = String\(tasksHeaderState\.sectionId \|\| ""\)\.trim\(\)\.toLowerCase\(\);[\s\S]*?activeProjectSectionId === "milestones"/,
);
assert.match(
  platformEntrySource,
  /onClick: isProjectMilestonesView[\s\S]*?navigateToProjectSection\("general"\)[\s\S]*?\[\{ label: "Milestones" \}\]/,
);
assert.match(
  platformEntrySource,
  /setTasksPageNavigationRequest\(\{[\s\S]*?taskId,[\s\S]*?taskDetailMode: "screen",[\s\S]*?\}\);[\s\S]*?setActivePage\("tasks"\)/,
);
assert.match(
  platformEntrySource,
  /setTasksHeaderState\(\{[\s\S]*?projectId,[\s\S]*?taskId,[\s\S]*?detailMode: "task",[\s\S]*?\}\);[\s\S]*?setTasksPageNavigationRequest/,
);
assert.match(
  platformEntrySource,
  /taskDetailMode: "screen",[\s\S]*?projectRecord: directProjectRecord,[\s\S]*?taskRecord: directTaskRecord/,
);
assert.match(
  platformEntrySource,
  /const openSelectedThreadProject = useCallback\(\(\) => \{[\s\S]*?setTasksHeaderState\(\{[\s\S]*?projectId,[\s\S]*?taskId: "",[\s\S]*?detailMode: "",[\s\S]*?\}\);[\s\S]*?setTasksPageNavigationRequest\(\{[\s\S]*?projectRecord: directProjectRecord,[\s\S]*?\}\);[\s\S]*?setActivePage\("tasks"\)/,
);
assert.match(
  platformEntrySource,
  /taskId: entry\.taskId \|\| "",[\s\S]*?taskDetailMode: entry\.detailMode === "task" \? "screen" : ""/,
);

console.log("App Header component ownership, styles, icon contract, and browser syntax passed.");
