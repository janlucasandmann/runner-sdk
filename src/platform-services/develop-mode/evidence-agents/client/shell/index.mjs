import { EVIDENCE_AGENTS_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { EVIDENCE_AGENTS_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { EVIDENCE_AGENTS_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { EVIDENCE_AGENTS_SELECTED_TITLE_SCRIPT } from "./selected-title.mjs";
import { EVIDENCE_AGENTS_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { EVIDENCE_AGENTS_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS = Object.freeze({
  navigation: EVIDENCE_AGENTS_NAVIGATION_SCRIPT,
  historyRestore: EVIDENCE_AGENTS_HISTORY_RESTORE_SCRIPT,
  selectedTitle: EVIDENCE_AGENTS_SELECTED_TITLE_SCRIPT,
  sidebarEntry: EVIDENCE_AGENTS_SIDEBAR_ENTRY_SCRIPT,
  topNavigation: EVIDENCE_AGENTS_TOP_NAVIGATION_SCRIPT,
  pageView: EVIDENCE_AGENTS_PAGE_VIEW_SCRIPT,
});
