import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  createAppSidebarScriptFragments,
  createAppSidebarStyleFragments,
} from "./index.mjs";

const fragments = createAppSidebarScriptFragments({
  metronomeSidebarEntryScript: "        function renderSidebarMetronomeRunEntry() {}\n",
  metronomeRunActionMenuScript: "        function renderMetronomeRunActionMenu() {}\n",
  configurePrimaryEntries: "              { id: \"configure-test\", label: \"Configure Test\" },\n",
  configureGovernanceEntries: "              { id: \"governance-test\", label: \"Governance Test\" },\n",
  configureInfrastructureEntries: "              { id: \"infrastructure-test\", label: \"Infrastructure Test\" },\n",
  developPrimaryEntries: "              { id: \"develop-test\", label: \"Develop Test\" },\n",
  createPrimaryEntries: "              { id: \"create-test\", label: \"Create Test\" },\n",
});

assert.deepEqual(Object.keys(fragments), [
  "layoutState",
  "modeState",
  "refs",
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
assert.ok(fragments.modeSelector.includes('label: "Create"'));
assert.ok(fragments.modeSelector.includes('label: "Configure"'));
assert.ok(fragments.modeSelector.includes('label: "Develop"'));
assert.ok(!fragments.modeSelector.includes("ActiveIcon"));
assert.ok(fragments.modeSelector.includes("OptionIcon"));
assert.match(fragments.navigationItems, /id: "new-thread"[\s\S]*active: showInitialThreadWelcome/);
assert.match(
  fragments.navigationItems,
  /id: "new-thread"[\s\S]*id: "projects"[\s\S]*id: "files"[\s\S]*id: "create-services-label"[\s\S]*label: "Services"[\s\S]*id: "create-test"/,
);
assert.ok(fragments.sidebar.includes("renderAppSidebarModeSelector()"));
assert.ok(fragments.sidebar.includes("function renderAppSidebar()"));
assert.ok(fragments.sidebar.includes('className: "app-sidebar-top-actions"'));
assert.ok(fragments.sidebar.includes("onClick: openThreadSearch"));
assert.ok(fragments.sidebar.includes("onClick: () => setSidebarOpen(false)"));
assert.match(fragments.sidebar, /React\.createElement\(PanelLeft,/);
assert.doesNotMatch(fragments.sidebar, /React\.createElement\(PanelLeftClose,/);
assert.ok(fragments.sidebar.includes('className: "sidebar-organization-profile-button"'));
assert.ok(fragments.sidebar.includes('renderAccountAvatar("sidebar-organization-avatar"'));
assert.ok(fragments.sidebar.includes('className: "sidebar-rail-account"'));
assert.ok(fragments.sidebar.includes("sidebar-organization-menu-button"));
assert.ok(!fragments.sidebar.includes("playground-sidebar-brand-close-icon"));
assert.doesNotMatch(fragments.sidebar, /sidebar-workspace-row/);
assert.doesNotThrow(() => new Function(`
  function appSidebarHost() {
    ${Object.values(fragments).join("\n")}
  }
`));

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
assert.match(styles.foundation, /background: rgba\(255, 255, 255, 0\.05\)/);
assert.match(styles.foundation, /\.sidebar-organization-profile-button/);
assert.match(styles.foundation, /\.sidebar-action-subtitle[\s\S]*color: rgba\(255, 255, 255, 0\.5\);[\s\S]*font-weight: 400;/);
assert.match(styles.foundation, /\.sidebar-action-subtitle[\s\S]*font-size: 11px;/);
assert.match(styles.foundation, /\.sidebar-action-subtitle,\s*\.sidebar-thread-section-title[\s\S]*font-size: 11px;[\s\S]*font-weight: 400;/);
assert.match(styles.foundation, /\.sidebar-thread-section-chevron[\s\S]*color: rgba\(255, 255, 255, 0\.5\);/);
assert.doesNotMatch(styles.foundation, /\.sidebar-workspace-trigger/);
assert.match(styles.foundation, /\.metronome-test/);

const demoServerSource = await fs.readFile(
  new URL("../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.ok(demoServerSource.includes("createAppSidebarScriptFragments"));
assert.ok(demoServerSource.includes("${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.sidebar}"));
assert.ok(demoServerSource.includes("renderAppSidebar()"));
assert.ok(!demoServerSource.includes("function renderExpandedSidebarContent()"));
assert.doesNotMatch(demoServerSource, /className: "sidebar-workspace-row"/);

console.log("App Sidebar ownership, mode selector, styles, and browser syntax passed.");
