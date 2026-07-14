import { TEAMS_FOUNDATION_CSS } from "./foundation.mjs";
import { TEAMS_RESPONSIVE_CSS } from "./responsive.mjs";
import { TEAMS_ROLES_AND_DIALOGS_CSS } from "./roles-and-dialogs.mjs";

export const TEAMS_STYLE_FRAGMENTS = Object.freeze({
  foundation: TEAMS_FOUNDATION_CSS,
  rolesAndDialogs: TEAMS_ROLES_AND_DIALOGS_CSS,
  responsive: TEAMS_RESPONSIVE_CSS,
});

export const TEAMS_PAGE_CSS = Object.values(TEAMS_STYLE_FRAGMENTS).join("");

