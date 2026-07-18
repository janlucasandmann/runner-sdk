import { createConfigureHomePageScript } from "./home.mjs";
import { CONFIGURE_NOTIFICATIONS_PAGE_SCRIPT } from "./notifications.mjs";
import { CONFIGURE_HOME_NOTIFICATIONS_SECTION_SCRIPT } from "./notifications-section.mjs";

export function createConfigureHomePageScriptFragments(options = {}) {
  return Object.freeze({
    notificationsSection: CONFIGURE_HOME_NOTIFICATIONS_SECTION_SCRIPT,
    home: createConfigureHomePageScript(options.pricingUrl),
    notifications: CONFIGURE_NOTIFICATIONS_PAGE_SCRIPT,
  });
}
