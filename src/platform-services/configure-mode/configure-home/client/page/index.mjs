import { createConfigureHomePageScript } from "./home.mjs";
import { CONFIGURE_HOME_NOTIFICATIONS_SECTION_SCRIPT } from "./notifications-section.mjs";

export function createConfigureHomePageScriptFragments(options = {}) {
  return Object.freeze({
    notificationsSection: CONFIGURE_HOME_NOTIFICATIONS_SECTION_SCRIPT,
    home: createConfigureHomePageScript(options.pricingUrl),
  });
}
