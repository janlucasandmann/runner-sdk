import { ORGANIZATIONS_ACCESS_CONTROL_CSS } from "./access-control.mjs";
import { ORGANIZATIONS_BILLING_CSS } from "./billing.mjs";
import { ORGANIZATIONS_OVERVIEW_CSS } from "./overview.mjs";

export const ORGANIZATIONS_STYLE_FRAGMENTS = Object.freeze({
  accessControl: ORGANIZATIONS_ACCESS_CONTROL_CSS,
  billing: ORGANIZATIONS_BILLING_CSS,
  overview: ORGANIZATIONS_OVERVIEW_CSS,
});

export const ORGANIZATIONS_PAGE_CSS = Object.values(ORGANIZATIONS_STYLE_FRAGMENTS).join("");
