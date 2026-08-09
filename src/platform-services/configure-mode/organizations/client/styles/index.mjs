import { ORGANIZATIONS_ACCESS_CONTROL_CSS } from "./access-control.mjs";
import { ORGANIZATIONS_BILLING_CSS } from "./billing.mjs";
import { ORGANIZATIONS_GENERAL_CSS } from "./general.mjs";
import { ORGANIZATIONS_MEMBERS_CSS } from "./members.mjs";
import { ORGANIZATIONS_SUBSCRIPTION_CSS } from "./subscription.mjs";

export const ORGANIZATIONS_STYLE_FRAGMENTS = Object.freeze({
  accessControl: ORGANIZATIONS_ACCESS_CONTROL_CSS,
  billing: ORGANIZATIONS_BILLING_CSS,
  general: ORGANIZATIONS_GENERAL_CSS,
  members: ORGANIZATIONS_MEMBERS_CSS,
  subscription: ORGANIZATIONS_SUBSCRIPTION_CSS,
});

export const ORGANIZATIONS_PAGE_CSS = Object.values(ORGANIZATIONS_STYLE_FRAGMENTS).join("");
