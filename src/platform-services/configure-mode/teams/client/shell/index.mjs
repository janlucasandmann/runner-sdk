import { TEAMS_DIALOG_LIFECYCLE_SCRIPT } from "./dialog-lifecycle.mjs";
import { TEAMS_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { TEAMS_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { TEAMS_LOAD_LIFECYCLE_SCRIPT } from "./load-lifecycle.mjs";
import { TEAMS_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { TEAMS_RESOURCE_LIFECYCLE_SCRIPT } from "./resource-lifecycle.mjs";
import { TEAMS_ROLE_LIFECYCLE_SCRIPT } from "./role-lifecycle.mjs";
import { TEAMS_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { TEAMS_STATE_DIALOGS_SCRIPT } from "./state-dialogs.mjs";
import { TEAMS_STATE_PRIMARY_SCRIPT } from "./state-primary.mjs";
import { TEAMS_TABLE_LIFECYCLE_SCRIPT } from "./table-lifecycle.mjs";
import { TEAMS_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const TEAMS_APP_SCRIPT_FRAGMENTS = Object.freeze({
  statePrimary: TEAMS_STATE_PRIMARY_SCRIPT,
  stateDialogs: TEAMS_STATE_DIALOGS_SCRIPT,
  roleLifecycle: TEAMS_ROLE_LIFECYCLE_SCRIPT,
  tableLifecycle: TEAMS_TABLE_LIFECYCLE_SCRIPT,
  dialogLifecycle: TEAMS_DIALOG_LIFECYCLE_SCRIPT,
  resourceLifecycle: TEAMS_RESOURCE_LIFECYCLE_SCRIPT,
  navigation: TEAMS_NAVIGATION_SCRIPT,
  loadLifecycle: TEAMS_LOAD_LIFECYCLE_SCRIPT,
  historyCapture: TEAMS_HISTORY_CAPTURE_SCRIPT,
  historyRestore: TEAMS_HISTORY_RESTORE_SCRIPT,
  topNavigation: TEAMS_TOP_NAVIGATION_SCRIPT,
  adminSidebarEntry: TEAMS_SIDEBAR_ENTRY_SCRIPT,
});
