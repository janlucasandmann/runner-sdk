import { DEVELOP_HOME_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { DEVELOP_HOME_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { DEVELOP_HOME_METRICS_STATE_SCRIPT } from "./metrics-state.mjs";
import { DEVELOP_HOME_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { DEVELOP_HOME_SELECTED_TITLE_SCRIPT } from "./selected-title.mjs";
import { DEVELOP_HOME_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { DEVELOP_HOME_STATE_SCRIPT } from "./state.mjs";
import { DEVELOP_HOME_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const DEVELOP_HOME_APP_SCRIPT_FRAGMENTS = Object.freeze({
  state: DEVELOP_HOME_STATE_SCRIPT,
  metricsState: DEVELOP_HOME_METRICS_STATE_SCRIPT,
  navigation: DEVELOP_HOME_NAVIGATION_SCRIPT,
  historyCapture: DEVELOP_HOME_HISTORY_CAPTURE_SCRIPT,
  historyRestore: DEVELOP_HOME_HISTORY_RESTORE_SCRIPT,
  selectedTitle: DEVELOP_HOME_SELECTED_TITLE_SCRIPT,
  topNavigation: DEVELOP_HOME_TOP_NAVIGATION_SCRIPT,
  sidebarEntry: DEVELOP_HOME_SIDEBAR_ENTRY_SCRIPT,
});
