import { createAppSidebarComponentScriptFragments } from "./components/index.mjs";
import {
  APP_SIDEBAR_LAYOUT_STATE_SCRIPT,
  APP_SIDEBAR_KEYBOARD_LIFECYCLE_SCRIPT,
  APP_SIDEBAR_MENU_LIFECYCLE_SCRIPT,
  APP_SIDEBAR_MODE_NAVIGATION_SCRIPT,
  APP_SIDEBAR_MODE_STATE_SCRIPT,
  APP_SIDEBAR_PAGE_MODE_LIFECYCLE_SCRIPT,
  APP_SIDEBAR_REFS_SCRIPT,
} from "./shell/index.mjs";

export { createAppSidebarStyleFragments } from "./styles/index.mjs";

export function createAppSidebarScriptFragments(options = {}) {
  return Object.freeze({
    layoutState: APP_SIDEBAR_LAYOUT_STATE_SCRIPT,
    modeState: APP_SIDEBAR_MODE_STATE_SCRIPT,
    refs: APP_SIDEBAR_REFS_SCRIPT,
    keyboardLifecycle: APP_SIDEBAR_KEYBOARD_LIFECYCLE_SCRIPT,
    menuLifecycle: APP_SIDEBAR_MENU_LIFECYCLE_SCRIPT,
    pageModeLifecycle: APP_SIDEBAR_PAGE_MODE_LIFECYCLE_SCRIPT,
    modeNavigation: APP_SIDEBAR_MODE_NAVIGATION_SCRIPT,
    ...createAppSidebarComponentScriptFragments(options),
  });
}

export {
  APP_SIDEBAR_LAYOUT_STATE_SCRIPT,
  APP_SIDEBAR_KEYBOARD_LIFECYCLE_SCRIPT,
  APP_SIDEBAR_MENU_LIFECYCLE_SCRIPT,
  APP_SIDEBAR_MODE_NAVIGATION_SCRIPT,
  APP_SIDEBAR_MODE_STATE_SCRIPT,
  APP_SIDEBAR_PAGE_MODE_LIFECYCLE_SCRIPT,
  APP_SIDEBAR_REFS_SCRIPT,
  createAppSidebarComponentScriptFragments,
};
