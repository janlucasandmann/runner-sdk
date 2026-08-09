import { ORGANIZATIONS_PAGE_IDENTITY_AND_BILLING_SCRIPT } from "./identity-and-billing.mjs";
import { ORGANIZATIONS_PAGE_IDENTITY_ACCESS_SCRIPT } from "./identity-access.mjs";
import { ORGANIZATIONS_PAGE_MEMBERS_SCRIPT } from "./members.mjs";
import { ORGANIZATIONS_PAGE_ROLES_AND_VIEW_SCRIPT } from "./roles-and-view.mjs";
import { ORGANIZATIONS_PAGE_SETUP_SCRIPT } from "./setup.mjs";
import { ORGANIZATIONS_PAGE_SUBSCRIPTION_SCRIPT } from "./subscription.mjs";

export function createOrganizationsPageScriptFragments() {
  return Object.freeze({
    setup: ORGANIZATIONS_PAGE_SETUP_SCRIPT,
    subscription: ORGANIZATIONS_PAGE_SUBSCRIPTION_SCRIPT,
    identityAndBilling: ORGANIZATIONS_PAGE_IDENTITY_AND_BILLING_SCRIPT,
    identityAccess: ORGANIZATIONS_PAGE_IDENTITY_ACCESS_SCRIPT,
    members: ORGANIZATIONS_PAGE_MEMBERS_SCRIPT,
    rolesAndView: ORGANIZATIONS_PAGE_ROLES_AND_VIEW_SCRIPT,
  });
}
