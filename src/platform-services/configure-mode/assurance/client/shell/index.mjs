import { ASSURANCE_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { ASSURANCE_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { ASSURANCE_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { ASSURANCE_APP_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { ASSURANCE_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { ASSURANCE_APP_STATE_SCRIPT } from "./state.mjs";
import { ASSURANCE_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const ASSURANCE_APP_SCRIPT_FRAGMENTS = Object.freeze({
  historyCapture: ASSURANCE_APP_HISTORY_CAPTURE_SCRIPT,
  historyRestore: ASSURANCE_APP_HISTORY_RESTORE_SCRIPT,
  navigation: ASSURANCE_APP_NAVIGATION_SCRIPT,
  pageView: ASSURANCE_APP_PAGE_VIEW_SCRIPT,
  sidebarEntry: ASSURANCE_APP_SIDEBAR_ENTRY_SCRIPT,
  state: ASSURANCE_APP_STATE_SCRIPT,
  topNavigation: ASSURANCE_APP_TOP_NAVIGATION_SCRIPT,
});
