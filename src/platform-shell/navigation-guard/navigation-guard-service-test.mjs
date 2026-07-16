import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS } from "./index.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");
const demoServerSource = fs.readFileSync(
  path.join(repositoryRoot, "examples/demo-server.mjs"),
  "utf8",
);

assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.navigation, /requestPlatformNavigation/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.navigation, /registerPlatformNavigationGuard/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.navigation, /requestPlatformStateChange/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.lifecycle, /beforeunload/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.modal, /PlatformUnsavedChangesModal/);
assert.match(demoServerSource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.state\}/);
assert.match(demoServerSource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.navigation\}/);
assert.match(demoServerSource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.lifecycle\}/);
assert.match(demoServerSource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.modal\}/);
assert.match(demoServerSource, /onNavigationGuardChange:\s*registerPlatformNavigationGuard/);
assert.match(demoServerSource, /onNavigationRequest:\s*requestPlatformNavigation/);
assert.match(demoServerSource, /const hasUnsavedAgentChanges = Boolean/);
assert.match(demoServerSource, /requestAgentNavigation\(\(\) => performAgentSelect/);
assert.match(demoServerSource, /requestPlatformNavigation\(\s*\(\) => applyPlatformNavigationEntry\(entry\)/);
assert.match(demoServerSource, /function handleOpenAgentsShortcut\(\) \{\s*openResourcesView\("agents", \{ forceOverview: true \}\)/);
assert.match(demoServerSource, /function handleOpenEnvironmentsShortcut\(\) \{\s*openResourcesView\("computers", \{ forceOverview: true \}\)/);
assert.match(demoServerSource, /function handleOpenTasksShortcut\(\) \{\s*setTasksProjectBackRequestToken/);
assert.match(demoServerSource, /function handleOpenFilesShortcut\(\) \{\s*setFilesPageNavigationRequest/);
assert.match(demoServerSource, /const returnToResourcesOverview = \(\) => openResourcesView\(activeResourcesView, \{\s*forceOverview: true,\s*preserveSidebarMode: true,\s*serverKind: activeResourcesServerKind,\s*\}\)/);
assert.equal(
  demoServerSource.match(/label: resourcesOverviewTitle,\s*onClick: returnToResourcesOverview/g)?.length,
  2,
);
assert.match(demoServerSource, /const agentsTopNavActions = topNavActionsContainer\s*&& !shouldShowAgentsHome\s*&& !agentCreationSetupOpen\s*&& !agentVersionsSidebarOpen/);
assert.match(demoServerSource, /function renderAgentPublishAction\(\) \{\s*const canShowPublish = Boolean\(\s*!shouldShowAgentsHome/);
assert.match(demoServerSource, /function performShowAgentsHome\(\) \{\s*discardUnsavedAgentDraft\(\);\s*resetEditorAuxiliaryState\(\);\s*finishCloseAgentSendToTeamModal\(\);\s*finishCloseAgentAddSquadModal\(\);\s*finishCloseAgentCreationPermissionModal\(\);/);
assert.match(demoServerSource, /function resetEditorAuxiliaryState\(\) \{[\s\S]*?setAgentPublishMenuOpen\(false\);[\s\S]*?setAgentVersionSelectorMenuOpen\(false\);[\s\S]*?setAgentVersionChangesState\(null\);/);

console.log("navigation guard service tests passed");
