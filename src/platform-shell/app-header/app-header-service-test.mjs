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
assert.match(fragments.state, /resourceAccessNavigationState/);
assert.match(fragments.state, /threadSearchOpen/);
assert.match(fragments.state, /threadSearchMode/);
assert.match(fragments.state, /threadSearchResourceTypeFilter/);
assert.match(fragments.state, /threadSearchAllActionsVisible/);
assert.match(fragments.state, /threadSearchFileInventoryByEnvironmentId/);
assert.match(fragments.state, /threadSearchResourceDataByMode/);
assert.match(fragments.state, /threads: \{ scopeKey: "", query: "", items: \[\], total: 0 \}/);
assert.match(fragments.state, /knowledge: \{ scopeKey: "", items: \[\] \}/);
assert.match(fragments.refs, /threadSearchFileInventoryByEnvironmentIdRef/);
assert.match(fragments.refs, /threadSearchFileInventoryScopeKeyRef/);
assert.match(fragments.refs, /threadSearchResourceLoadedAtByModeRef/);
assert.match(fragments.refs, /threadSearchResourceLatestRequestKeyRef/);
assert.match(fragments.refs, /threadSearchThreadAbortControllerRef/);
assert.match(fragments.refs, /threadSearchThreadResultsCacheRef/);
assert.match(fragments.refs, /threadSearchKnowledgeSelectHandlerRef/);
assert.match(fragments.refs, /threadSearchFileSelectHandlerRef/);
assert.match(fragments.refs, /threadSearchWorkflowSelectHandlerRef/);
assert.match(fragments.refs, /threadSearchServerResourceSelectHandlerRef/);
assert.doesNotMatch(fragments.refs, /threadSearchInputRef/);
assert.match(fragments.searchProjection, /const loadThreadSearchFileInventory = useCallback/);
assert.match(fragments.searchProjection, /const loadThreadSearchResourceMode = useCallback/);
assert.match(fragments.searchProjection, /threadSearchMode !== "files"/);
assert.match(fragments.searchProjection, /fetchMetronomeWorkflowsFromApi/);
assert.match(fragments.searchProjection, /proxyBackendBase \+ "\/knowledge"/);
assert.match(fragments.searchProjection, /filteredThreadSearchKnowledgeItems/);
assert.match(fragments.searchProjection, /filteredThreadSearchServerResourceItems/);
assert.match(fragments.searchProjection, /isThreadSearchImageFileEntry/);
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
assert.match(fragments.navigation, /function openKnowledgeSearch/);
assert.match(fragments.navigation, /function openFileSearch/);
assert.match(fragments.navigation, /function openWorkflowSearch/);
assert.match(fragments.navigation, /function openServerResourceSearch/);
assert.match(fragments.navigation, /function handleThreadSearchKnowledgeSelect/);
assert.match(fragments.navigation, /openKnowledgeLibraryPage/);
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
assert.match(fragments.lifecycle, /platform:resource-access-navigation-change/);
assert.match(fragments.lifecycle, /const principalKind = detail\.principalKind === "system" \? "system" : "team"/);
assert.match(fragments.lifecycle, /principalProfileImageUrl/);
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
assert.match(fragments.breadcrumbBar, /String\(item\.className \|\| ""\)/);
assert.match(fragments.breadcrumbBar, /playground-top-nav-path-item-group/);
assert.match(fragments.appHeader, /function renderAppHeader\(/);
assert.match(
  fragments.appHeader,
  /const basePathItems = typeof resolveProjectResourceBreadcrumbItems === "function"[\s\S]*?const resolvedPathItems = resourceAccessNavigationState[\s\S]*?nextPathItems\.push\([\s\S]*?principalBreadcrumbLabel[\s\S]*?renderAppHeaderBreadcrumbs\(resolvedPathItems\)/,
);
assert.match(
  fragments.appHeader,
  /onClick: \(\) => resourceAccessNavigationState\.onClose\?\.\(\)/,
);
assert.match(fragments.appHeader, /platform-resource-access-breadcrumb-avatar/);
assert.match(fragments.appHeader, /principalProfileImageUrl/);
assert.match(fragments.appHeader, /principalName \+ " Access"/);
assert.match(fragments.appHeader, /label: principalBreadcrumbLabel/);
assert.match(fragments.appHeader, /leading: principalLeading/);
assert.match(
  fragments.appHeader,
  /resourceAccessNavigationState[\s\S]*?\? null[\s\S]*?: options\.center \|\| null/,
);
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
assert.match(fragments.notificationsPopup, /notificationPopupItems\.map\(renderNotificationItem\)/);
assert.doesNotMatch(fragments.notificationsPopup, /notificationItems\.map\(renderNotificationItem\)/);
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
assert.match(fragments.searchModal, /React\.createElement\(PlaygroundFileIcon,/);
assert.match(fragments.searchModal, /mode: threadSearchMode/);
assert.match(fragments.searchModal, /getGlobalServiceNavigationItems\(globalServiceSearchQuery\)/);
assert.match(fragments.searchModal, /id: serviceItem\.globalSearchId/);
assert.match(fragments.searchModal, /label: "Services"/);
assert.match(fragments.searchModal, /label: "Knowledge"/);
assert.match(fragments.searchModal, /handleThreadSearchKnowledgeSelect/);
assert.match(fragments.searchModal, /handleThreadSearchServerResourceSelect/);
assert.match(fragments.searchModal, /selectedServerResourceMeta/);
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
assert.match(fragments.searchModal, /React\.createElement\(Metronome, \{/);
assert.doesNotMatch(fragments.searchModal, /React\.createElement\(Workflow, \{/);
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
assert.match(APP_HEADER_STYLES, /\.platform-resource-access-breadcrumb-avatar/);
assert.match(APP_HEADER_STYLES, /\.platform-resource-access-breadcrumb-avatar__image/);
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
  /const activeMetronomeRunPresentation = useMemo\(\(\) => \{[\s\S]*?getMetronomeTaskLoopPresentation\(metronomeRunTraceSelection,[\s\S]*?label: activeMetronomeRunPresentation\.label,[\s\S]*?className: "playground-tasks-backlog-project-icon is-loop"[\s\S]*?React\.createElement\(RefreshCw/,
);
assert.match(
  platformEntrySource,
  /activeMetronomeRunPresentation\?\.isMissionControl[\s\S]*?label: activeMetronomeRunPresentation\.label[\s\S]*?className: "playground-tasks-backlog-project-icon is-mission-control"[\s\S]*?React\.createElement\(RefreshCcwDot/,
);
assert.match(
  platformEntrySource,
  /const selectedMetronomeRunOriginThread = useMemo\(\(\) => \{[\s\S]*?findMetronomeRunOriginThread\(metronomeRunTraceSelection, realThreads\)[\s\S]*?const selectedThreadNavRecord = useMemo\(\(\) => \{[\s\S]*?selectedMetronomeRunOriginThread\?\.id/,
  "Workflow overview threads must resolve their persisted origin thread for shared header actions.",
);
assert.match(
  platformEntrySource,
  /function renderThreadTitleActionMenu\(\) \{[\s\S]*?threadCanMutate = Boolean\(showThreadNavMutationActions && selectedThreadNavRecord\?\.id\)[\s\S]*?openThreadRenameDialog\(selectedThreadNavRecord\)[\s\S]*?handleThreadDelete\(selectedThreadNavRecord\.id\)/,
  "Workflow overview threads must reuse the normal thread action popup against their origin thread.",
);
assert.match(
  platformEntrySource,
  /const hasThreadTarget = \([\s\S]*?\) \|\| Boolean\(metronomeRunTraceSelection\?\.key\);[\s\S]*?if \(activePage !== "thread" \|\| hasThreadSideDetailOpen \|\| !hasThreadTarget\)/,
  "The shared thread action popup must remain open on synthetic workflow overview threads.",
);
assert.doesNotMatch(
  platformEntrySource,
  /selectedMetronomeRunEntry\?\.key\s*\? React\.createElement\("button", \{[\s\S]{0,900}"aria-label": "Metronome run actions"/,
  "Workflow overview threads must not render a second run-actions button on the right side of the app header.",
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
assert.match(
  platformEntrySource,
  /const selectedThreadTaskPreviewForDisplay = useMemo\([\s\S]*?ticketNumber: displayTicketNumber[\s\S]*?threadTaskPreview: selectedThreadTaskPreviewForDisplay \|\| undefined/,
  "Thread ticket cards must render the same project-prefixed ticket number as the project details surface.",
);
const threadTaskPreviewFunctionStart = platformEntrySource.indexOf("function getThreadTaskPreview(thread)");
const threadTaskPreviewFunctionEnd = platformEntrySource.indexOf("function getThreadMissionControlMetadata(thread)", threadTaskPreviewFunctionStart);
assert.ok(threadTaskPreviewFunctionStart >= 0 && threadTaskPreviewFunctionEnd > threadTaskPreviewFunctionStart);
const getThreadTaskPreview = new Function(
  `${platformEntrySource.slice(threadTaskPreviewFunctionStart, threadTaskPreviewFunctionEnd)}\nreturn getThreadTaskPreview;`,
)();
assert.deepEqual(
  getThreadTaskPreview({
    id: "thread_mention_1",
    projectId: "project_1",
    environmentId: "env_1",
    metadata: {
      projectMention: {
        source: {
          type: "ticket_comment",
          ticketId: "task_1",
          projectId: "project_1",
        },
      },
    },
  }),
  {
    taskId: "task_1",
    projectId: "project_1",
    projectName: "",
    threadId: "thread_mention_1",
    ticketNumber: "",
    title: "Ticket",
    description: "",
    taskColor: "gray",
    status: "todo",
    priority: "medium",
    taskType: "task",
    environmentId: "env_1",
    runKind: "mention",
    showPromptPreview: true,
    requiresHydration: true,
  },
);
assert.match(
  platformEntrySource,
  /const selectedThreadTaskPreviewHydrationThreadId = String\([\s\S]*?activeRunnerThreadId[\s\S]*?\|\| currentThreadId[\s\S]*?\|\| selectedThreadTaskPreview\?\.threadId/,
  "Ticket-comment Threads must hydrate from their durable Thread id even when no runner execution is attached.",
);
assert.match(
  platformEntrySource,
  /\+ "\?view=preview"[\s\S]*?credentials: "include"/,
  "Ticket cards must use the lightweight canonical Task read with the signed-in session.",
);
assert.match(
  platformEntrySource,
  /const retryDelays = \[0, 400, 1200, 3000\][\s\S]*?selectedThreadTaskPreviewFetchKeysRef\.current\.delete\(previewFetchKey\)/,
  "Development effect replay and transient reads must not permanently poison the Task-preview hydration key.",
);
assert.match(
  platformEntrySource,
  /const selectedThreadTaskPreviewHydrationPending = Boolean\([\s\S]*?selectedThreadTaskPreview\?\.requiresHydration === true[\s\S]*?const selectedThreadInitialSurfaceLoading = Boolean\([\s\S]*?isThreadsLoading[\s\S]*?!selectedKnownThread[\s\S]*?initialSurfaceLoading: selectedThreadInitialSurfaceLoading/,
  "Thread surfaces must remain behind the shared loader until shell metadata and any canonical Task preview are ready.",
);
assert.match(
  platformEntrySource,
  /requiresHydration: false,[\s\S]*?const mergeThreadTaskPreviewRecord[\s\S]*?requiresHydration: incoming\.requiresHydration === true/,
  "Canonical Task hydration must clear the compatibility preview's render-blocking marker.",
);
assert.match(
  platformEntrySource,
  /const incomingIsCompatibilityFallback = incoming\.requiresHydration === true;[\s\S]*?if \(incomingIsCompatibilityFallback && baseIsCanonicalPreview\)[\s\S]*?requiresHydration: false/,
  "A stale legacy mention placeholder must never downgrade an already-hydrated Task preview.",
);
assert.match(
  platformEntrySource,
  /const shouldPreserveCanonicalTaskPreview = Boolean\([\s\S]*?existingTaskPreview\.requiresHydration !== true[\s\S]*?incomingTaskPreview\?\.requiresHydration === true[\s\S]*?taskPreview: existingTaskPreview/,
  "Periodic Thread overview refreshes must preserve locally hydrated canonical Task metadata.",
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
  /className: "playground-tasks-nav playground-tasks-project-nav-switch",\s*value: isProjectSettingsView \? "" : activeProjectView/,
  "Project Settings must leave Progress, Backlog, and Resources unselected in the shared header switch.",
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
