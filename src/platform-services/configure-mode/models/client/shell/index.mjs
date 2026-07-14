import { MODELS_APP_CATALOG_LIFECYCLE_SCRIPT } from "./catalog-lifecycle.mjs";
import { MODELS_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { MODELS_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { MODELS_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { createModelsAppPageViewScript } from "./page-view.mjs";
import { MODELS_APP_RESOLVED_CATALOG_SCRIPT } from "./resolved-catalog.mjs";
import { MODELS_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { MODELS_APP_STATE_SCRIPT } from "./state.mjs";
import { createModelsAppTopNavigationScript } from "./top-navigation.mjs";

export function createModelsAppScriptFragments(options = {}) {
  return Object.freeze({
    state: MODELS_APP_STATE_SCRIPT,
    resolvedCatalog: MODELS_APP_RESOLVED_CATALOG_SCRIPT,
    catalogLifecycle: MODELS_APP_CATALOG_LIFECYCLE_SCRIPT,
    navigation: MODELS_APP_NAVIGATION_SCRIPT,
    historyCapture: MODELS_APP_HISTORY_CAPTURE_SCRIPT,
    historyRestore: MODELS_APP_HISTORY_RESTORE_SCRIPT,
    topNavigation: createModelsAppTopNavigationScript(options),
    pageView: createModelsAppPageViewScript(options),
    sidebarEntry: MODELS_APP_SIDEBAR_ENTRY_SCRIPT,
  });
}
