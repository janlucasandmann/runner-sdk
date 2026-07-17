import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS } from "./index.mjs";
import { readPlatformCompositionSourceSync } from "../../../apps/platform/testing/platform-composition-source.mjs";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "../../..");
const platformEntrySource = readPlatformCompositionSourceSync();

assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.navigation, /requestPlatformNavigation/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.navigation, /registerPlatformNavigationGuard/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.navigation, /requestPlatformStateChange/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.lifecycle, /beforeunload/);
assert.match(PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.modal, /PlatformUnsavedChangesModal/);
assert.match(platformEntrySource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.state\}/);
assert.match(platformEntrySource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.navigation\}/);
assert.match(platformEntrySource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.lifecycle\}/);
assert.match(platformEntrySource, /\$\{PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS\.modal\}/);
assert.match(platformEntrySource, /onNavigationGuardChange:\s*registerPlatformNavigationGuard/);
assert.match(platformEntrySource, /onNavigationRequest:\s*requestPlatformNavigation/);
assert.match(platformEntrySource, /const hasUnsavedAgentChanges = Boolean/);
assert.match(platformEntrySource, /requestAgentNavigation\(\(\) => performAgentSelect/);
assert.match(platformEntrySource, /requestPlatformNavigation\(\s*\(\) => applyPlatformNavigationEntry\(entry\)/);
assert.match(platformEntrySource, /function handleOpenAgentsShortcut\(\) \{\s*openResourcesView\("agents", \{ forceOverview: true \}\)/);
assert.match(platformEntrySource, /function handleOpenEnvironmentsShortcut\(\) \{\s*openResourcesView\("computers", \{ forceOverview: true \}\)/);
assert.match(platformEntrySource, /function handleOpenTasksShortcut\(\) \{\s*setTasksProjectBackRequestToken/);
assert.match(platformEntrySource, /function handleOpenFilesShortcut\(\) \{\s*setFilesPageNavigationRequest/);
assert.match(platformEntrySource, /const returnToResourcesOverview = \(\) => openResourcesView\(activeResourcesView, \{\s*forceOverview: true,\s*preserveSidebarMode: true,\s*serverKind: activeResourcesServerKind,\s*\}\)/);
assert.equal(
  platformEntrySource.match(/label: resourcesOverviewTitle,\s*onClick: returnToResourcesOverview/g)?.length,
  2,
);
assert.match(platformEntrySource, /const agentsTopNavActions = topNavActionsContainer\s*&& !shouldShowAgentsHome\s*&& !agentCreationSetupOpen\s*&& !agentVersionsSidebarOpen/);
assert.match(platformEntrySource, /function renderAgentPublishAction\(\) \{\s*const canShowPublish = Boolean\(\s*!shouldShowAgentsHome/);
assert.match(platformEntrySource, /function performShowAgentsHome\(\) \{\s*discardUnsavedAgentDraft\(\);\s*resetEditorAuxiliaryState\(\);\s*finishCloseAgentSendToTeamModal\(\);\s*finishCloseAgentAddSquadModal\(\);\s*finishCloseAgentCreationPermissionModal\(\);/);
assert.match(platformEntrySource, /function resetEditorAuxiliaryState\(\) \{[\s\S]*?setAgentPublishMenuOpen\(false\);[\s\S]*?setAgentVersionSelectorMenuOpen\(false\);[\s\S]*?setAgentVersionChangesState\(null\);/);

console.log("navigation guard service tests passed");
