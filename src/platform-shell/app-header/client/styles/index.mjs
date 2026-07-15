import { APP_HEADER_ACCOUNT_MENU_CSS } from "./account-menu.mjs";
import { APP_HEADER_CSS } from "./header.mjs";
import { APP_HEADER_NOTIFICATIONS_POPUP_CSS } from "./notifications-popup.mjs";
import { APP_HEADER_NOTIFICATIONS_SCRIM_CSS } from "./notifications-scrim.mjs";
import { APP_HEADER_OVERLAY_SCRIMS_CSS } from "./overlay-scrims.mjs";
import { APP_HEADER_SEARCH_MODAL_CSS } from "./search-modal.mjs";

export const APP_HEADER_STYLE_FRAGMENTS = Object.freeze({
  header: APP_HEADER_CSS,
  overlayScrims: APP_HEADER_OVERLAY_SCRIMS_CSS,
  accountMenu: APP_HEADER_ACCOUNT_MENU_CSS,
  notificationsScrim: APP_HEADER_NOTIFICATIONS_SCRIM_CSS,
  notificationsPopup: APP_HEADER_NOTIFICATIONS_POPUP_CSS,
  searchModal: APP_HEADER_SEARCH_MODAL_CSS,
});

export const APP_HEADER_STYLES = Object.values(APP_HEADER_STYLE_FRAGMENTS).join("");

export {
  APP_HEADER_ACCOUNT_MENU_CSS,
  APP_HEADER_CSS,
  APP_HEADER_NOTIFICATIONS_POPUP_CSS,
  APP_HEADER_NOTIFICATIONS_SCRIM_CSS,
  APP_HEADER_OVERLAY_SCRIMS_CSS,
  APP_HEADER_SEARCH_MODAL_CSS,
};
