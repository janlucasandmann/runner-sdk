import { CONFIGURE_HOME_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { CONFIGURE_HOME_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { CONFIGURE_HOME_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { CONFIGURE_HOME_NOTIFICATION_NAVIGATION_SCRIPT } from "./notification-navigation.mjs";
import { CONFIGURE_HOME_NOTIFICATION_STORAGE_KEY_SCRIPT } from "./notification-storage-key.mjs";
import { CONFIGURE_HOME_NOTIFICATIONS_STATE_SCRIPT } from "./notifications-state.mjs";
import { CONFIGURE_HOME_SELECTED_TITLE_SCRIPT } from "./selected-title.mjs";
import { CONFIGURE_HOME_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { CONFIGURE_HOME_STATE_SCRIPT } from "./state.mjs";
import { CONFIGURE_HOME_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS = Object.freeze({
  notificationsState: CONFIGURE_HOME_NOTIFICATIONS_STATE_SCRIPT,
  state: CONFIGURE_HOME_STATE_SCRIPT,
  notificationStorageKey: CONFIGURE_HOME_NOTIFICATION_STORAGE_KEY_SCRIPT,
  notificationNavigation: CONFIGURE_HOME_NOTIFICATION_NAVIGATION_SCRIPT,
  navigation: CONFIGURE_HOME_NAVIGATION_SCRIPT,
  historyCapture: CONFIGURE_HOME_HISTORY_CAPTURE_SCRIPT,
  historyRestore: CONFIGURE_HOME_HISTORY_RESTORE_SCRIPT,
  selectedTitle: CONFIGURE_HOME_SELECTED_TITLE_SCRIPT,
  topNavigation: CONFIGURE_HOME_TOP_NAVIGATION_SCRIPT,
  sidebarEntry: CONFIGURE_HOME_SIDEBAR_ENTRY_SCRIPT,
});
