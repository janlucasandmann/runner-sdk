import { API_KEYS_DATA_STATE_SCRIPT } from "./data-state.mjs";
import { API_KEYS_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { API_KEYS_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { API_KEYS_SELECTED_TITLE_SCRIPT } from "./selected-title.mjs";
import { API_KEYS_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { API_KEYS_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";
import { API_KEYS_UI_STATE_SCRIPT } from "./ui-state.mjs";

export const API_KEYS_APP_SCRIPT_FRAGMENTS = Object.freeze({
  uiState: API_KEYS_UI_STATE_SCRIPT,
  dataState: API_KEYS_DATA_STATE_SCRIPT,
  navigation: API_KEYS_NAVIGATION_SCRIPT,
  historyRestore: API_KEYS_HISTORY_RESTORE_SCRIPT,
  selectedTitle: API_KEYS_SELECTED_TITLE_SCRIPT,
  topNavigation: API_KEYS_TOP_NAVIGATION_SCRIPT,
  sidebarEntry: API_KEYS_SIDEBAR_ENTRY_SCRIPT,
});
