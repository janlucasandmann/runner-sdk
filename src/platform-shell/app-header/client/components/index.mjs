import { APP_HEADER_ACCOUNT_MENU_SCRIPT } from "./account-menu.mjs";
import { APP_HEADER_COMPONENT_SCRIPT } from "./app-header.mjs";
import { createAppHeaderBreadcrumbBarScript } from "./breadcrumb-bar.mjs";
import { APP_HEADER_NOTIFICATIONS_POPUP_SCRIPT } from "./notifications-popup.mjs";
import { APP_HEADER_SEARCH_MODAL_SCRIPT } from "./search-modal.mjs";

export function createAppHeaderComponentScriptFragments(options = {}) {
  return Object.freeze({
    breadcrumbBar: createAppHeaderBreadcrumbBarScript(options),
    appHeader: APP_HEADER_COMPONENT_SCRIPT,
    accountMenu: APP_HEADER_ACCOUNT_MENU_SCRIPT,
    notificationsPopup: APP_HEADER_NOTIFICATIONS_POPUP_SCRIPT,
    searchModal: APP_HEADER_SEARCH_MODAL_SCRIPT,
  });
}

export {
  APP_HEADER_ACCOUNT_MENU_SCRIPT,
  APP_HEADER_COMPONENT_SCRIPT,
  APP_HEADER_NOTIFICATIONS_POPUP_SCRIPT,
  APP_HEADER_SEARCH_MODAL_SCRIPT,
  createAppHeaderBreadcrumbBarScript,
};
