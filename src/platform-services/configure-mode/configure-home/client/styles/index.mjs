import { CONFIGURE_HOME_FOUNDATION_CSS } from "./foundation.mjs";
import { CONFIGURE_HOME_NOTIFICATION_PAGE_CSS } from "./notification-page.mjs";
import { CONFIGURE_HOME_OVERVIEW_CARDS_CSS } from "./overview-cards.mjs";

export const CONFIGURE_HOME_STYLE_FRAGMENTS = Object.freeze({
  foundation: CONFIGURE_HOME_FOUNDATION_CSS,
  overviewCards: CONFIGURE_HOME_OVERVIEW_CARDS_CSS,
  notificationPage: CONFIGURE_HOME_NOTIFICATION_PAGE_CSS,
});

export const CONFIGURE_HOME_PAGE_CSS = Object.values(CONFIGURE_HOME_STYLE_FRAGMENTS).join("");
