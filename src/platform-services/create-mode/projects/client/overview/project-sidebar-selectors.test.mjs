import assert from "node:assert/strict";
import test from "node:test";

import { PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT } from "./runtime/sidebar-and-composition.mjs";
import { PROJECT_OVERVIEW_RESOURCES_CREATORS_FRAGMENT } from "./runtime/resources-and-creators.mjs";
import { PROJECTS_ACTIONS_02_FRAGMENT } from "../page/actions/02-autosave-and-project-actions.mjs";
import { PROJECTS_DATA_04_FRAGMENT } from "../page/data/04-task-overlay-lifecycle.mjs";
import { PROJECTS_SHELL_01_FRAGMENT } from "../page/shell/01-state-and-loading.mjs";
import { PROJECTS_VIEWS_03_FRAGMENT } from "../page/views/03-overview-and-task-previews.mjs";

test("project Progress selectors share the ticket shortcut and searchable-popup contract", () => {
  assert.match(
    PROJECTS_SHELL_01_FRAGMENT,
    /projectOverviewSidebarPrioritySearchQuery, setProjectOverviewSidebarPrioritySearchQuery/,
  );
  assert.match(
    PROJECTS_SHELL_01_FRAGMENT,
    /projectOverviewSidebarComputerSearchQuery, setProjectOverviewSidebarComputerSearchQuery/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /placeholder: "Change status\.\.\."[\s\S]*?shortcut: "S"/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /placeholder: "Change priority\.\.\."[\s\S]*?shortcut: "P"/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /visiblePriorityOptions\.map[\s\S]*?renderPlaygroundTaskPriorityGlyph\(option\.id\)[\s\S]*?trailing: option\.shortcut/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /playground-tasks-detail-status-selector-popup playground-project-overview-status-selector-popup/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /playground-tasks-detail-priority-selector-popup playground-project-overview-priority-selector-popup/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /placeholder: "Change computer\.\.\."[\s\S]*?visibleComputerOptions\.map/,
  );
  assert.doesNotMatch(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /description: environment\?\.isDefault \? "Default computer"/,
  );
});

test("project computer changes explicitly offer clone and change-only paths", () => {
  assert.match(
    PROJECT_OVERVIEW_RESOURCES_CREATORS_FRAGMENT,
    /function getProjectOverviewSidebarEnvironmentValue[\s\S]*?projectComposerDefaultEnvironmentId[\s\S]*?getProjectOverviewEnvironmentId\(projectComposerAvailableEnvironments\[0\]\)/,
  );
  assert.match(
    PROJECTS_ACTIONS_02_FRAGMENT,
    /function getProjectOverviewEnvironmentId[\s\S]*?"environmentId"[\s\S]*?"computerId"[\s\S]*?"id"/,
  );
  assert.match(
    PROJECTS_ACTIONS_02_FRAGMENT,
    /function requestProjectOverviewComputerChange\(nextEnvironmentId, selectedEnvironmentRecord = null\)[\s\S]*?setProjectComputerChangeDialog/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /onValueChange: \(nextEnvironmentId, option\)[\s\S]*?option\?\.data\?\.environment[\s\S]*?data: \{ environment \}/,
  );
  assert.match(
    PROJECTS_ACTIONS_02_FRAGMENT,
    /function confirmProjectOverviewComputerChange\(cloneProjectDirectory\)[\s\S]*?cloneProjectDirectory: cloneProjectDirectory === true/,
  );
  assert.match(
    PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
    /React\.createElement\(PlatformConfirmationModal,[\s\S]*?confirmLabel: "Clone and change"[\s\S]*?secondaryActionLabel: "Change only"/,
  );
});

test("project Progress shortcuts open selectors and commit numbered choices", () => {
  assert.match(
    PROJECTS_DATA_04_FRAGMENT,
    /function handleProjectOverviewSidebarShortcut\(event\)/,
  );
  assert.match(
    PROJECTS_DATA_04_FRAGMENT,
    /key === "s"[\s\S]*?"status"[\s\S]*?key === "p"[\s\S]*?"priority"/,
  );
  assert.match(
    PROJECTS_DATA_04_FRAGMENT,
    /projectOverviewSidebarPropertyPopover === "status"[\s\S]*?PLAYGROUND_PROJECT_STATUS_OPTIONS\[Number\(key\) - 1\][\s\S]*?selectProjectOverviewSidebarStatus/,
  );
  assert.match(
    PROJECTS_DATA_04_FRAGMENT,
    /projectOverviewSidebarPropertyPopover === "priority"[\s\S]*?PLAYGROUND_TASK_PRIORITY_OPTIONS\[Number\(key\) - 1\][\s\S]*?selectProjectOverviewSidebarPriority/,
  );
  assert.match(
    PROJECTS_ACTIONS_02_FRAGMENT,
    /function selectProjectOverviewSidebarStatus[\s\S]*?setProjectOverviewSidebarStatusSearchQuery\(""\)[\s\S]*?updateProjectOverviewSidebarProjectProperty/,
  );
  assert.match(
    PROJECTS_ACTIONS_02_FRAGMENT,
    /function selectProjectOverviewSidebarPriority[\s\S]*?setProjectOverviewSidebarPrioritySearchQuery\(""\)[\s\S]*?updateProjectOverviewSidebarProjectProperty/,
  );
});

test("ticket sidebar hydration uses the centralized centered loading state", () => {
  assert.match(
    PROJECTS_VIEWS_03_FRAGMENT,
    /React\.createElement\(PlatformLoadingState, \{[\s\S]*?playground-tasks-detail-sidebar-loading-state[\s\S]*?message: "Loading ticket\.\.\."[\s\S]*?centered: true/,
  );
  assert.doesNotMatch(
    PROJECTS_VIEWS_03_FRAGMENT,
    /React\.createElement\(Loader2, \{ className: "playground-files-state-loader"/,
  );
});
