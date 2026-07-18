import { CONFIGURE_HOME_NOTIFICATION_PAGE_CSS } from "./notification-page.mjs";

export const CONFIGURE_HOME_STYLE_FRAGMENTS = Object.freeze({
  notificationPage: CONFIGURE_HOME_NOTIFICATION_PAGE_CSS,
});

export const CONFIGURE_HOME_PAGE_CSS = Object.values(CONFIGURE_HOME_STYLE_FRAGMENTS).join("");
