import { APP_SIDEBAR_COMPONENT_SCRIPT } from "./app-sidebar.mjs";
import { APP_SIDEBAR_MODE_SELECTOR_SCRIPT } from "./mode-selector.mjs";
import { createAppSidebarNavigationScript } from "./navigation.mjs";
import { APP_SIDEBAR_STATUS_INDICATORS_SCRIPT } from "./status-indicators.mjs";
import { createAppSidebarThreadListScript } from "./thread-list.mjs";

export function createAppSidebarComponentScriptFragments(options = {}) {
  return Object.freeze({
    threadList: createAppSidebarThreadListScript(options),
    statusIndicators: APP_SIDEBAR_STATUS_INDICATORS_SCRIPT,
    modeSelector: APP_SIDEBAR_MODE_SELECTOR_SCRIPT,
    navigationItems: createAppSidebarNavigationScript(options),
    sidebar: APP_SIDEBAR_COMPONENT_SCRIPT,
  });
}

export {
  APP_SIDEBAR_COMPONENT_SCRIPT,
  APP_SIDEBAR_MODE_SELECTOR_SCRIPT,
  APP_SIDEBAR_STATUS_INDICATORS_SCRIPT,
  createAppSidebarNavigationScript,
  createAppSidebarThreadListScript,
};
