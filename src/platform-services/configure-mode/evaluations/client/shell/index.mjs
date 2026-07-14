import { EVALUATIONS_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { EVALUATIONS_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { EVALUATIONS_APP_LIFECYCLE_SCRIPT } from "./lifecycle.mjs";
import { EVALUATIONS_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { EVALUATIONS_APP_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { EVALUATIONS_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { EVALUATIONS_APP_STATE_SCRIPT } from "./state.mjs";
import { EVALUATIONS_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const EVALUATIONS_APP_SCRIPT_FRAGMENTS = Object.freeze({
  historyCapture: EVALUATIONS_APP_HISTORY_CAPTURE_SCRIPT,
  historyRestore: EVALUATIONS_APP_HISTORY_RESTORE_SCRIPT,
  lifecycle: EVALUATIONS_APP_LIFECYCLE_SCRIPT,
  navigation: EVALUATIONS_APP_NAVIGATION_SCRIPT,
  pageView: EVALUATIONS_APP_PAGE_VIEW_SCRIPT,
  sidebarEntry: EVALUATIONS_APP_SIDEBAR_ENTRY_SCRIPT,
  state: EVALUATIONS_APP_STATE_SCRIPT,
  topNavigation: EVALUATIONS_APP_TOP_NAVIGATION_SCRIPT,
});

