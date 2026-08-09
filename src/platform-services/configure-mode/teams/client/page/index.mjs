import { TEAMS_PAGE_MEMBERS_SCRIPT } from "./members.mjs";
import { createTeamsPageOverviewScript } from "./overview.mjs";
import { TEAMS_PAGE_RESOURCES_FOUNDATION_SCRIPT } from "./resources-foundation.mjs";
import { TEAMS_PAGE_RESOURCES_VIEW_SCRIPT } from "./resources-view.mjs";
import { TEAMS_PAGE_ROLES_AND_VIEW_SCRIPT } from "./roles-and-view.mjs";
import { TEAMS_PAGE_SETUP_SCRIPT } from "./setup.mjs";

export function createTeamsPageScriptFragments(options = {}) {
  return Object.freeze({
    setup: TEAMS_PAGE_SETUP_SCRIPT,
    overview: createTeamsPageOverviewScript(),
    members: TEAMS_PAGE_MEMBERS_SCRIPT,
    resourcesFoundation: TEAMS_PAGE_RESOURCES_FOUNDATION_SCRIPT,
    resourcesView: TEAMS_PAGE_RESOURCES_VIEW_SCRIPT,
    rolesAndView: TEAMS_PAGE_ROLES_AND_VIEW_SCRIPT,
  });
}
