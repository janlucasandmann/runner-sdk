import { ONBOARDING_DOMAIN_SCRIPT } from "./domain/index.mjs";
import { ONBOARDING_MODAL_SCRIPT } from "./page/index.mjs";
import { ONBOARDING_SHELL_SCRIPT_FRAGMENTS } from "./shell/index.mjs";
import { ONBOARDING_CSS } from "./styles/index.mjs";

export const ONBOARDING_PAGE_SCRIPT = [
  ONBOARDING_DOMAIN_SCRIPT,
  ONBOARDING_MODAL_SCRIPT,
].join("\n");

export const ONBOARDING_APP_SCRIPT_FRAGMENTS = Object.freeze({
  ...ONBOARDING_SHELL_SCRIPT_FRAGMENTS,
});

export {
  ONBOARDING_CSS,
  ONBOARDING_DOMAIN_SCRIPT,
  ONBOARDING_MODAL_SCRIPT,
  ONBOARDING_SHELL_SCRIPT_FRAGMENTS,
};

