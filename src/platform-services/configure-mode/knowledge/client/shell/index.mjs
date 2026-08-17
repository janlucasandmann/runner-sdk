import { KNOWLEDGE_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { KNOWLEDGE_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { KNOWLEDGE_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { KNOWLEDGE_APP_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { KNOWLEDGE_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { KNOWLEDGE_APP_STATE_SCRIPT } from "./state.mjs";
import { KNOWLEDGE_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const KNOWLEDGE_APP_SCRIPT_FRAGMENTS = Object.freeze({
  historyCapture: KNOWLEDGE_APP_HISTORY_CAPTURE_SCRIPT,
  historyRestore: KNOWLEDGE_APP_HISTORY_RESTORE_SCRIPT,
  navigation: KNOWLEDGE_APP_NAVIGATION_SCRIPT,
  pageView: KNOWLEDGE_APP_PAGE_VIEW_SCRIPT,
  sidebarEntry: KNOWLEDGE_APP_SIDEBAR_ENTRY_SCRIPT,
  state: KNOWLEDGE_APP_STATE_SCRIPT,
  topNavigation: KNOWLEDGE_APP_TOP_NAVIGATION_SCRIPT,
});

