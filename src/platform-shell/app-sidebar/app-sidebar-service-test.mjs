import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  createAppSidebarScriptFragments,
  createAppSidebarStyleFragments,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../apps/platform/testing/platform-composition-source.mjs";

const fragments = createAppSidebarScriptFragments({
  metronomeSidebarEntryScript: "        function renderSidebarMetronomeRunEntry() {}\n",
  metronomeRunActionMenuScript: "        function renderMetronomeRunActionMenu() {}\n",
  configurePrimaryEntries: "              { id: \"configure-test\", label: \"Configure Test\" },\n",
  configureContextEntries: "              { id: \"context-test\", label: \"Context Test\" },\n",
  configureGovernanceEntries: "              { id: \"governance-test\", label: \"Governance Test\" },\n",
  configureInfrastructureEntries: "              { id: \"infrastructure-test\", label: \"Infrastructure Test\" },\n",
  developPrimaryEntries: "              { id: \"develop-test\", label: \"Develop Test\" },\n",
  developAgentServiceEntries: "              { id: \"security-agents-test\", label: \"Security Agents\" },\n",
  createPrimaryEntries: "              { id: \"create-test\", label: \"Create Test\" },\n",
  adminEntries: "              { id: \"admin-test\", label: \"Admin Test\" },\n",
});

assert.deepEqual(Object.keys(fragments), [
  "layoutState",
  "modeState",
  "refs",
  "keyboardLifecycle",
  "menuLifecycle",
  "pageModeLifecycle",
  "modeNavigation",
  "threadList",
  "statusIndicators",
  "modeSelector",
  "navigationItems",
  "sidebar",
]);
assert.ok(fragments.modeSelector.includes("function renderAppSidebarModeSelector"));
assert.ok(fragments.modeSelector.includes("React.createElement(PlatformPopup,"));
assert.ok(fragments.modeSelector.includes('variant: "minimal"'));
assert.match(fragments.modeSelector, /const shouldRenderModeMenu = sidebarWorkspaceMenuOpen \|\| renderedSidebarWorkspaceMenu/);
assert.match(fragments.modeSelector, /open: shouldRenderModeMenu/);
assert.doesNotMatch(fragments.modeState, /sidebarWorkspaceMenuPhase/);
assert.ok(fragments.modeSelector.includes('label: "Create"'));
assert.ok(fragments.modeSelector.includes('label: "Configure"'));
assert.ok(fragments.modeSelector.includes('label: "Develop"'));
assert.ok(fragments.modeSelector.includes('label: "Admin"'));
assert.ok(!fragments.modeSelector.includes("ActiveIcon"));
assert.ok(fragments.modeSelector.includes("OptionIcon"));
assert.match(fragments.navigationItems, /id: "new-thread"[\s\S]*active: showInitialThreadWelcome/);
assert.match(
  fragments.navigationItems,
  /id: "new-thread"[\s\S]*id: "projects"[\s\S]*id: "files"[\s\S]*id: "create-services-label"[\s\S]*label: "Services"[\s\S]*id: "create-test"/,
);
assert.match(
  fragments.navigationItems,
  /id: "tags"[\s\S]*label: "Connectors"[\s\S]*searchAliases: \["Tags", "Plugins", "Tags and Plugins"\][\s\S]*Icon: Plug[\s\S]*toolsView === "tags" \|\| toolsView === "plugins"/,
);
assert.match(
  fragments.navigationItems,
  /id: "skills"[\s\S]*id: "configure-context-label"[\s\S]*label: "Context"[\s\S]*id: "context-test"[\s\S]*id: "prompts"[\s\S]*id: "tags"[\s\S]*label: "Connectors"[\s\S]*id: "configure-governance-label"/,
);
assert.doesNotMatch(fragments.navigationItems, /id: "plugins"/);
assert.match(
  fragments.navigationItems,
  /id: "develop-agent-services-label"[\s\S]*label: "Agent Services"[\s\S]*\.\.\.agentDevelopServerPageItems[\s\S]*id: "security-agents-test"[\s\S]*label: "Security Agents"/,
);
assert.match(
  fragments.navigationItems,
  /function getSidebarNavigationItemsForMode\(targetMode = sidebarWorkspaceMode\)/,
);
assert.match(
  fragments.navigationItems,
  /normalizedTargetMode === "admin"[\s\S]*id: "admin-test"[\s\S]*label: "Admin Test"/,
);
assert.doesNotMatch(fragments.navigationItems, /id: "configure-resources-label"/);
assert.match(
  fragments.navigationItems,
  /function getGlobalServiceNavigationItems\(searchQuery = ""\)/,
);
const normalizeGlobalServiceSearchValueSource = fragments.navigationItems.match(
  /function normalizeGlobalServiceSearchValue\(value\) \{[\s\S]*?\n        \}/,
)?.[0];
const getGlobalServiceSearchMatchRankSource = fragments.navigationItems.match(
  /function getGlobalServiceSearchMatchRank\(searchQuery, itemLabel, itemId\) \{[\s\S]*?\n        \}/,
)?.[0];
assert.ok(normalizeGlobalServiceSearchValueSource);
assert.ok(getGlobalServiceSearchMatchRankSource);
const getGlobalServiceSearchMatchRank = new Function(
  `${normalizeGlobalServiceSearchValueSource}
  ${getGlobalServiceSearchMatchRankSource}
  return getGlobalServiceSearchMatchRank;
  `,
)();
assert.equal(getGlobalServiceSearchMatchRank("agents", "Agents", "agents"), 0);
assert.equal(getGlobalServiceSearchMatchRank("webapp", "Web Apps", "server-web-apps"), 1);
assert.equal(
  getGlobalServiceSearchMatchRank("fine tuning", "Agent Optimization", "fine-tuning"),
  0,
);
assert.equal(getGlobalServiceSearchMatchRank("plugins", "Tags and Plugins", "tags"), 3);
assert.equal(getGlobalServiceSearchMatchRank("missing", "Agents", "agents"), null);
assert.match(
  fragments.navigationItems,
  /getSidebarNavigationItemsForMode\(modeOption\.id\)/,
);
assert.match(
  fragments.navigationItems,
  /const excludedIds = new Set\(\["new-thread", "configure-home", "develop-home"\]\)/,
);
assert.match(
  fragments.navigationItems,
  /globalSearchId: "service:" \+ modeOption\.id \+ ":" \+ item\.id/,
);
assert.match(
  fragments.navigationItems,
  /function handleGlobalServiceNavigationItemClick\(globalSearchId\)/,
);
assert.match(
  fragments.navigationItems,
  /setSidebarWorkspaceMode\(serviceItem\.workspaceMode\)[\s\S]*serviceItem\.onClick\?\.\(\)/,
);
assert.match(fragments.navigationItems, /function handleSidebarNavigationItemClick\(item\)/);
assert.match(fragments.navigationItems, /requestPlatformNavigation\(item\?\.onClick\)/);
assert.doesNotMatch(fragments.navigationItems, /if \(item\.active\)/);
assert.match(
  fragments.navigationItems,
  /id: "skills",[\s\S]{0,100}Icon: SquareMousePointer/,
);
assert.match(fragments.threadList, /variant: "minimal"/);
assert.match(fragments.threadList, /const contextualActions = Array\.isArray\(threadActionMenuState\.menuActions\)/);
assert.match(fragments.threadList, /className: "tb-popup-row sidebar-thread-popup-row"/);
assert.match(
  fragments.threadList,
  /function getSidebarThreadProjectPresentation\(safeThread, taskPreview, safeThreadId\)[\s\S]*?getThreadMissionControlMetadata\(safeThread\)[\s\S]*?threadProjectRecordsById\[projectId\][\s\S]*?realProjects/,
);
assert.match(
  fragments.threadList,
  /mergePlaygroundProjectRecords\(listedProjectRecord, cachedProjectRecord\)[\s\S]*?getPlaygroundProjectIconConfig\([\s\S]*?resolvePlaygroundProjectIconId\([\s\S]*?missionControlMetadata\?\.projectIcon/,
);
assert.match(
  fragments.threadList,
  /className: "sidebar-thread-project-icon"[\s\S]*?style: threadProject\.color \? \{ color: threadProject\.color \} : undefined[\s\S]*?React\.createElement\(ThreadProjectIcon/,
);
assert.ok(fragments.sidebar.includes("renderAppSidebarModeSelector()"));
assert.ok(fragments.sidebar.includes("function renderAppSidebar()"));
assert.match(fragments.sidebar, /onClick: \(\) => handleSidebarNavigationItemClick\(item\)/);
assert.ok(fragments.sidebar.includes('className: "app-sidebar-top-actions"'));
assert.match(fragments.sidebar, /React\.createElement\(PlatformIconButton,[\s\S]*tooltip: "Search"/);
assert.match(fragments.sidebar, /"aria-keyshortcuts": "Meta\+K Control\+K"/);
assert.match(fragments.sidebar, /tooltipShortcut: "⌘ K"/);
assert.match(fragments.sidebar, /tooltip: "Close sidebar"/);
assert.match(fragments.sidebar, /"aria-keyshortcuts": "Meta\+B Control\+B"/);
assert.match(fragments.sidebar, /tooltipShortcut: "⌘ B"/);
assert.match(fragments.sidebar, /tooltipPlacement: "bottom"/);
assert.match(fragments.sidebar, /tooltipAlign: "end"/);
assert.ok(fragments.sidebar.includes("onClick: openThreadSearch"));
assert.ok(fragments.sidebar.includes("onClick: () => setSidebarOpen(false)"));
assert.match(fragments.keyboardLifecycle, /String\(event\.key \|\| ""\)\.toLowerCase\(\) !== "b"/);
assert.match(fragments.keyboardLifecycle, /setSidebarOpen\(\(current\) => !current\)/);
assert.match(fragments.keyboardLifecycle, /event\.preventDefault\(\)/);

let sidebarShortcutHandler = null;
let sidebarShortcutCleanup = null;
let sidebarShortcutOpen = true;
const sidebarShortcutWindow = {
  addEventListener(type, handler) {
    if (type === "keydown") sidebarShortcutHandler = handler;
  },
  removeEventListener(type, handler) {
    if (type === "keydown" && sidebarShortcutHandler === handler) sidebarShortcutHandler = null;
  },
};
new Function(
  "useEffect",
  "window",
  "setSidebarOpen",
  fragments.keyboardLifecycle,
)(
  (effect) => {
    sidebarShortcutCleanup = effect();
  },
  sidebarShortcutWindow,
  (update) => {
    sidebarShortcutOpen = typeof update === "function" ? update(sidebarShortcutOpen) : update;
  },
);
assert.equal(typeof sidebarShortcutHandler, "function");
let sidebarShortcutPrevented = false;
sidebarShortcutHandler({
  key: "b",
  metaKey: true,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  repeat: false,
  defaultPrevented: false,
  preventDefault() {
    sidebarShortcutPrevented = true;
  },
});
assert.equal(sidebarShortcutOpen, false);
assert.equal(sidebarShortcutPrevented, true);
sidebarShortcutHandler({
  key: "B",
  metaKey: false,
  ctrlKey: true,
  altKey: false,
  shiftKey: false,
  repeat: false,
  defaultPrevented: false,
  preventDefault() {},
});
assert.equal(sidebarShortcutOpen, true);
sidebarShortcutHandler({
  key: "b",
  metaKey: true,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  repeat: true,
  defaultPrevented: false,
  preventDefault() {},
});
assert.equal(sidebarShortcutOpen, true);
sidebarShortcutHandler({
  key: "b",
  metaKey: true,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  repeat: false,
  defaultPrevented: true,
  preventDefault() {},
});
assert.equal(sidebarShortcutOpen, true);
sidebarShortcutCleanup();
assert.equal(sidebarShortcutHandler, null);
assert.match(fragments.sidebar, /React\.createElement\(PanelLeft,/);
assert.doesNotMatch(fragments.sidebar, /React\.createElement\(PanelLeftClose,/);
assert.match(fragments.sidebar, /className: "sidebar-organization-card"[\s\S]*?onClick: \(\) => toggleAccountMenuFrom\("sidebar"\)/);
assert.match(fragments.sidebar, /"aria-label": "Open account menu for " \+ sidebarOrganizationDisplay\.name/);
assert.ok(fragments.sidebar.includes('renderAccountAvatar("sidebar-organization-avatar"'));
assert.ok(fragments.sidebar.includes('className: "sidebar-rail-account"'));
assert.ok(fragments.sidebar.includes('className: "sidebar-rail-section-spacer"'));
assert.ok(!fragments.sidebar.includes("sidebar-rail-plan"));
assert.ok(fragments.sidebar.includes("sidebar-organization-menu-button"));
assert.doesNotMatch(fragments.sidebar, /onClick: platformHasCapability\("subscriptions"\)\s*\? handleSidebarPlanAction/);
assert.ok(!fragments.sidebar.includes("playground-sidebar-brand-close-icon"));
assert.doesNotMatch(fragments.sidebar, /sidebar-workspace-row/);
assert.doesNotThrow(() => new Function(`
  function appSidebarHost() {
    ${Object.values(fragments).join("\n")}
  }
`));
const runtimeEvents = [];
const StubIcon = () => null;
const globalServiceRuntime = new Function(
  "scope",
  `with (scope) {
    ${fragments.navigationItems}
    return {
      getGlobalServiceNavigationItems,
      handleGlobalServiceNavigationItemClick,
    };
  }`,
)({
  sidebarWorkspaceMode: "work",
  activePage: "",
  configureHomeTab: "",
  isResourcesPage: false,
  activeResourcesView: "",
  activeResourcesServerKind: "",
  toolsView: "",
  showInitialThreadWelcome: false,
  hasShellAccess: true,
  Bot: StubIcon,
  Monitor: StubIcon,
  Plug: StubIcon,
  Tag: StubIcon,
  Layers: StubIcon,
  SquareMousePointer: StubIcon,
  MessageSquareText: StubIcon,
  SquarePen: StubIcon,
  Rocket: StubIcon,
  FolderOpen: StubIcon,
  Metronome: StubIcon,
  CalendarIcon: StubIcon,
  Circle: StubIcon,
  handleOpenAgentsShortcut: () => runtimeEvents.push("agents"),
  handleOpenEnvironmentsShortcut: () => runtimeEvents.push("computers"),
  handleOpenTagsShortcut: () => runtimeEvents.push("tags"),
  handleOpenSkillsShortcut: () => runtimeEvents.push("skills"),
  handleOpenPromptsShortcut: () => runtimeEvents.push("prompts"),
  handleNewThread: () => runtimeEvents.push("thread"),
  handleSignInWithComputerAgents: () => runtimeEvents.push("sign-in"),
  handleOpenTasksShortcut: () => runtimeEvents.push("projects"),
  handleOpenFilesShortcut: () => runtimeEvents.push("files"),
  openMetronomeOverviewPage: () => runtimeEvents.push("metronome"),
  openCalendarOverviewPage: () => runtimeEvents.push("calendar"),
  getDevelopServerPageItems: () => [
    { id: "functions", kind: "function", label: "Functions", Icon: StubIcon },
  ],
  openResourcesView: (view, options) => runtimeEvents.push(
    `${view}:${options?.serverKind || ""}`,
  ),
  requestPlatformNavigation: (callback) => callback?.(),
  setSidebarWorkspaceMode: (mode) => runtimeEvents.push(`mode:${mode}`),
  setSidebarWorkspaceMenuOpen: () => undefined,
});
assert.equal(globalServiceRuntime.getGlobalServiceNavigationItems("agents")[0]?.label, "Agents");
assert.equal(
  globalServiceRuntime.getGlobalServiceNavigationItems("agents")[0]?.workspaceMode,
  "configure",
);
assert.equal(
  globalServiceRuntime.getGlobalServiceNavigationItems("plugins")[0]?.label,
  "Connectors",
);
assert.equal(
  globalServiceRuntime.getGlobalServiceNavigationItems("admin test")[0]?.workspaceMode,
  "admin",
);
assert.equal(
  globalServiceRuntime.getGlobalServiceNavigationItems("functions")[0]?.globalSearchId,
  "service:develop:server-functions",
);
assert.equal(
  globalServiceRuntime.handleGlobalServiceNavigationItemClick(
    "service:develop:server-functions",
  ),
  true,
);
assert.deepEqual(runtimeEvents.slice(-2), ["mode:develop", "servers:function"]);

const styles = createAppSidebarStyleFragments({ metronomeSidebarCss: ".metronome-test {}" });
assert.deepEqual(Object.keys(styles), ["foundation", "responsive"]);
assert.match(styles.foundation, /\.app-sidebar-mode-trigger/);
assert.match(styles.foundation, /font-size: 14px/);
assert.match(styles.foundation, /font-weight: 400/);
assert.match(styles.foundation, /color: #fff/);
assert.match(styles.foundation, /--sidebar-link-color: #fff/);
assert.match(styles.foundation, /background: transparent/);
assert.match(styles.foundation, /border-radius: 0/);
assert.match(styles.foundation, /left: -41px/);
assert.match(styles.foundation, /width: 250px/);
assert.match(styles.foundation, /\.app-sidebar-top-actions/);
assert.match(styles.foundation, /margin-left: auto/);
assert.match(styles.foundation, /border-right: 1px solid rgba\(255, 255, 255, 0\.075\)/);
assert.match(styles.foundation, /\.playground-sidebar \{[\s\S]{0,520}background: #000;/);
assert.doesNotMatch(styles.foundation, /\.sidebar-organization-card:hover,\s*\.sidebar-organization-card\.is-open\s*\{\s*background:/);
assert.match(styles.foundation, /\.sidebar-organization-card:focus-visible/);
assert.match(styles.foundation, /\.sidebar-organization-card:hover \.sidebar-organization-menu-button/);
assert.match(styles.foundation, /\.sidebar-action-subtitle[\s\S]*color: rgba\(255, 255, 255, 0\.5\);[\s\S]*font-weight: 400;/);
assert.match(styles.foundation, /\.sidebar-action-subtitle[\s\S]*font-size: 11px;/);
assert.match(styles.foundation, /\.sidebar-action-subtitle,\s*\.sidebar-thread-section-title[\s\S]*font-size: 11px;[\s\S]*font-weight: 400;/);
assert.match(styles.foundation, /\.sidebar-thread-section-chevron[\s\S]*color: rgba\(255, 255, 255, 0\.5\);/);
assert.match(styles.foundation, /\.sidebar-rail-section-spacer[\s\S]*height: 8px;/);
assert.match(styles.foundation, /\.sidebar-rail-button\.is-active[\s\S]*border-radius: 8px;/);
assert.doesNotMatch(styles.foundation, /\.sidebar-rail-plan/);
assert.doesNotMatch(styles.foundation, /\.sidebar-workspace-trigger/);
assert.match(styles.foundation, /\.metronome-test/);

const platformEntrySource = await readPlatformCompositionSource();
assert.ok(platformEntrySource.includes("createAppSidebarScriptFragments"));
assert.ok(platformEntrySource.includes("${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.sidebar}"));
assert.ok(platformEntrySource.includes("renderAppSidebar()"));
assert.ok(!platformEntrySource.includes("function renderExpandedSidebarContent()"));
assert.doesNotMatch(platformEntrySource, /className: "sidebar-workspace-row"/);

console.log("App Sidebar ownership, mode selector, styles, and browser syntax passed.");
