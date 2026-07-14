import { MARKETPLACE_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { MARKETPLACE_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { MARKETPLACE_APP_LIFECYCLE_SCRIPT } from "./lifecycle.mjs";
import { MARKETPLACE_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { MARKETPLACE_APP_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { MARKETPLACE_APP_PREVIEW_RESOURCES_SCRIPT } from "./preview-resources.mjs";
import { MARKETPLACE_APP_SELECTED_TITLE_SCRIPT } from "./selected-title.mjs";
import { MARKETPLACE_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { MARKETPLACE_APP_STATE_SCRIPT } from "./state.mjs";
import { MARKETPLACE_APP_TOP_NAV_ICON_SCRIPT } from "./top-nav-icon.mjs";
import { MARKETPLACE_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const MARKETPLACE_APP_SCRIPT_FRAGMENTS = Object.freeze({
  previewResources: MARKETPLACE_APP_PREVIEW_RESOURCES_SCRIPT,
  state: MARKETPLACE_APP_STATE_SCRIPT,
  lifecycle: MARKETPLACE_APP_LIFECYCLE_SCRIPT,
  navigation: MARKETPLACE_APP_NAVIGATION_SCRIPT,
  historyCapture: MARKETPLACE_APP_HISTORY_CAPTURE_SCRIPT,
  historyRestore: MARKETPLACE_APP_HISTORY_RESTORE_SCRIPT,
  selectedTitle: MARKETPLACE_APP_SELECTED_TITLE_SCRIPT,
  topNavIcon: MARKETPLACE_APP_TOP_NAV_ICON_SCRIPT,
  topNavigation: MARKETPLACE_APP_TOP_NAVIGATION_SCRIPT,
  pageView: MARKETPLACE_APP_PAGE_VIEW_SCRIPT,
  sidebarEntry: MARKETPLACE_APP_SIDEBAR_ENTRY_SCRIPT,
});
