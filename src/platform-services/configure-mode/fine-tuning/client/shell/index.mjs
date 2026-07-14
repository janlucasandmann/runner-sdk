import { FINE_TUNING_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { FINE_TUNING_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { FINE_TUNING_APP_LIFECYCLE_SCRIPT } from "./lifecycle.mjs";
import { FINE_TUNING_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { FINE_TUNING_APP_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { FINE_TUNING_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { FINE_TUNING_APP_STATE_SCRIPT } from "./state.mjs";
import { FINE_TUNING_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const FINE_TUNING_APP_SCRIPT_FRAGMENTS = Object.freeze({
  historyCapture: FINE_TUNING_APP_HISTORY_CAPTURE_SCRIPT,
  historyRestore: FINE_TUNING_APP_HISTORY_RESTORE_SCRIPT,
  lifecycle: FINE_TUNING_APP_LIFECYCLE_SCRIPT,
  navigation: FINE_TUNING_APP_NAVIGATION_SCRIPT,
  pageView: FINE_TUNING_APP_PAGE_VIEW_SCRIPT,
  sidebarEntry: FINE_TUNING_APP_SIDEBAR_ENTRY_SCRIPT,
  state: FINE_TUNING_APP_STATE_SCRIPT,
  topNavigation: FINE_TUNING_APP_TOP_NAVIGATION_SCRIPT,
});

