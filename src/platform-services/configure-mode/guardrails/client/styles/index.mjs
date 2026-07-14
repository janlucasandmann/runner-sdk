import { GUARDRAILS_AGENT_INTEGRATION_CSS } from "./agent-integration.mjs";
import { GUARDRAILS_PAGE_CSS } from "./page/index.mjs";
import { GUARDRAILS_VERSION_CHANGES_CSS } from "./version-changes.mjs";

export {
  GUARDRAILS_PAGE_CSS,
  GUARDRAILS_PAGE_CSS_FRAGMENTS,
} from "./page/index.mjs";

export const GUARDRAILS_STYLE_FRAGMENTS = Object.freeze({
  page: GUARDRAILS_PAGE_CSS,
  versionChanges: GUARDRAILS_VERSION_CHANGES_CSS,
  agentIntegration: GUARDRAILS_AGENT_INTEGRATION_CSS,
});
