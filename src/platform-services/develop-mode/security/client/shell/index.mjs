import { SECURITY_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { SECURITY_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { SECURITY_PAGE_VIEW_SCRIPT } from "./page-view.mjs";
import { SECURITY_SELECTED_TITLE_SCRIPT } from "./selected-title.mjs";
import { SECURITY_SETUP_RETURN_LIFECYCLE_SCRIPT } from "./setup-return-lifecycle.mjs";
import { SECURITY_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { createSecurityTopNavigationScript } from "./top-navigation.mjs";

export function createSecurityAppScriptFragments(options = {}) {
  return Object.freeze({
    navigation: SECURITY_NAVIGATION_SCRIPT,
    historyRestore: SECURITY_HISTORY_RESTORE_SCRIPT,
    selectedTitle: SECURITY_SELECTED_TITLE_SCRIPT,
    sidebarEntry: SECURITY_SIDEBAR_ENTRY_SCRIPT,
    topNavigation: createSecurityTopNavigationScript(options),
    pageView: SECURITY_PAGE_VIEW_SCRIPT,
    setupReturnLifecycle: SECURITY_SETUP_RETURN_LIFECYCLE_SCRIPT,
  });
}

export const SECURITY_APP_SCRIPT_FRAGMENTS =
  createSecurityAppScriptFragments();
