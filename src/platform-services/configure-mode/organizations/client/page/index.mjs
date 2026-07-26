import { ORGANIZATIONS_PAGE_IDENTITY_AND_BILLING_SCRIPT } from "./identity-and-billing.mjs";
import { ORGANIZATIONS_PAGE_IDENTITY_ACCESS_SCRIPT } from "./identity-access.mjs";
import { ORGANIZATIONS_PAGE_MEMBERS_SCRIPT } from "./members.mjs";
import { createOrganizationsPageOverviewScript } from "./overview.mjs";
import { ORGANIZATIONS_PAGE_RESOURCES_SCRIPT } from "./resources.mjs";
import { ORGANIZATIONS_PAGE_ROLES_AND_VIEW_SCRIPT } from "./roles-and-view.mjs";
import { ORGANIZATIONS_PAGE_SETUP_SCRIPT } from "./setup.mjs";

export function createOrganizationsPageScriptFragments(options = {}) {
  return Object.freeze({
    setup: ORGANIZATIONS_PAGE_SETUP_SCRIPT,
    identityAndBilling: ORGANIZATIONS_PAGE_IDENTITY_AND_BILLING_SCRIPT,
    identityAccess: ORGANIZATIONS_PAGE_IDENTITY_ACCESS_SCRIPT,
    overview: createOrganizationsPageOverviewScript(options.documentationUrl),
    members: ORGANIZATIONS_PAGE_MEMBERS_SCRIPT,
    resources: ORGANIZATIONS_PAGE_RESOURCES_SCRIPT,
    rolesAndView: ORGANIZATIONS_PAGE_ROLES_AND_VIEW_SCRIPT,
  });
}
