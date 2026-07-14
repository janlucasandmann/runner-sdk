import { GUARDRAILS_AGENT_DOMAIN_SCRIPT } from "./domain/index.mjs";
import { GUARDRAILS_AGENT_PAGE_SCRIPT } from "./page/index.mjs";
import { GUARDRAILS_AGENT_STATE_SCRIPT } from "./state.mjs";
import { GUARDRAILS_AGENT_VERSION_DIFF_ITEMS_SCRIPT } from "./version-diff-items.mjs";
import { GUARDRAILS_AGENT_VERSION_DIFF_PAYLOAD_SCRIPT } from "./version-diff-payload.mjs";

export {
  GUARDRAILS_AGENT_DOMAIN_SCRIPT,
  GUARDRAILS_AGENT_DOMAIN_SCRIPT_FRAGMENTS,
} from "./domain/index.mjs";
export {
  GUARDRAILS_AGENT_PAGE_SCRIPT,
  GUARDRAILS_AGENT_PAGE_SCRIPT_FRAGMENTS,
} from "./page/index.mjs";

/** Guardrails-owned fragments mounted inside the Agents editor. */
export const GUARDRAILS_AGENT_SCRIPT_FRAGMENTS = Object.freeze({
  domain: GUARDRAILS_AGENT_DOMAIN_SCRIPT,
  state: GUARDRAILS_AGENT_STATE_SCRIPT,
  versionDiffItems: GUARDRAILS_AGENT_VERSION_DIFF_ITEMS_SCRIPT,
  versionDiffPayload: GUARDRAILS_AGENT_VERSION_DIFF_PAYLOAD_SCRIPT,
  page: GUARDRAILS_AGENT_PAGE_SCRIPT,
});
