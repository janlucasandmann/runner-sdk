import { TESTS_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { TESTS_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { TESTS_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { TESTS_APP_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { TESTS_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { TESTS_APP_STATE_SCRIPT } from "./state.mjs";
import { TESTS_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const TESTS_APP_SCRIPT_FRAGMENTS = Object.freeze({
  historyCapture: TESTS_APP_HISTORY_CAPTURE_SCRIPT,
  historyRestore: TESTS_APP_HISTORY_RESTORE_SCRIPT,
  navigation: TESTS_APP_NAVIGATION_SCRIPT,
  pageView: TESTS_APP_PAGE_VIEW_SCRIPT,
  sidebarEntry: TESTS_APP_SIDEBAR_ENTRY_SCRIPT,
  state: TESTS_APP_STATE_SCRIPT,
  topNavigation: TESTS_APP_TOP_NAVIGATION_SCRIPT,
});
