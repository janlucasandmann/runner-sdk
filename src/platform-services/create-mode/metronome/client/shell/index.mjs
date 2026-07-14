import { METRONOME_APP_STATE_SCRIPT } from "./state.mjs";
import { METRONOME_APP_MENU_STATE_SCRIPT } from "./menu-state.mjs";
import { METRONOME_APP_ORIGIN_THREADS_SCRIPT } from "./origin-threads.mjs";
import { METRONOME_APP_TEAM_SHARING_SCRIPT } from "./team-sharing.mjs";
import { METRONOME_APP_LIFECYCLE_SCRIPT } from "./lifecycle.mjs";
import { METRONOME_APP_RUN_CONTROLLER_SCRIPT } from "./run-controller.mjs";
import { METRONOME_APP_RUN_MENU_CONTROLS_SCRIPT } from "./run-menu-controls.mjs";
import { METRONOME_APP_RUN_ACTIONS_SCRIPT } from "./run-actions.mjs";
import { METRONOME_APP_SIDEBAR_STATE_SCRIPT } from "./sidebar-state.mjs";
import { METRONOME_APP_RUN_TRACE_VIEW_SCRIPT } from "./run-trace-view.mjs";
import { METRONOME_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { METRONOME_APP_RUN_ACTION_MENU_SCRIPT } from "./run-action-menu.mjs";
import { METRONOME_APP_MODE_SWITCH_SCRIPT } from "./mode-switch.mjs";
import { METRONOME_APP_TOP_NAV_ACTIONS_SCRIPT } from "./top-nav-actions.mjs";

/** Metronome-owned fragments mounted inside the shared demo application shell. */
export const METRONOME_APP_SCRIPT_FRAGMENTS = Object.freeze({
  state: METRONOME_APP_STATE_SCRIPT,
  menuState: METRONOME_APP_MENU_STATE_SCRIPT,
  originThreads: METRONOME_APP_ORIGIN_THREADS_SCRIPT,
  teamSharing: METRONOME_APP_TEAM_SHARING_SCRIPT,
  lifecycle: METRONOME_APP_LIFECYCLE_SCRIPT,
  runController: METRONOME_APP_RUN_CONTROLLER_SCRIPT,
  runMenuControls: METRONOME_APP_RUN_MENU_CONTROLS_SCRIPT,
  runActions: METRONOME_APP_RUN_ACTIONS_SCRIPT,
  sidebarState: METRONOME_APP_SIDEBAR_STATE_SCRIPT,
  runTraceView: METRONOME_APP_RUN_TRACE_VIEW_SCRIPT,
  sidebarEntry: METRONOME_APP_SIDEBAR_ENTRY_SCRIPT,
  runActionMenu: METRONOME_APP_RUN_ACTION_MENU_SCRIPT,
  modeSwitch: METRONOME_APP_MODE_SWITCH_SCRIPT,
  topNavActions: METRONOME_APP_TOP_NAV_ACTIONS_SCRIPT,
});
