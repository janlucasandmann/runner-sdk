import { APP_SIDEBAR_RESPONSIVE_RULES } from "./responsive.mjs";
import { createAppSidebarFoundationStyles } from "./sidebar.mjs";

export function createAppSidebarStyleFragments(options = {}) {
  return Object.freeze({
    foundation: createAppSidebarFoundationStyles(options),
    responsive: APP_SIDEBAR_RESPONSIVE_RULES,
  });
}

export {
  APP_SIDEBAR_RESPONSIVE_RULES,
  createAppSidebarFoundationStyles,
};
