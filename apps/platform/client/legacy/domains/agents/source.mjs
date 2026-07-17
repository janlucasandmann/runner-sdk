import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderLegacySourceTemplate } from "../../source-template.mjs";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

export const AGENTS_CONTROLLER_FRAGMENT_PATHS = Object.freeze([
  "controller/bootstrap-and-lifecycle.template.js",
  "controller/composer-and-overview.template.js",
  "controller/mutations-access-and-versioning.template.js",
  "controller/dialogs-and-detail-view.template.js",
  "controller/assistant-and-composition.template.js",
]);

const agentsPageTemplate = AGENTS_CONTROLLER_FRAGMENT_PATHS
  .map((relativePath) => fs.readFileSync(
    path.join(domainRoot, relativePath),
    "utf8",
  ))
  .join("");

/** Quarantined legacy agent controller while typed agent routes take ownership. */
export function createAgentsPageScript({
  defaultUpstreamOrigin,
  evaluations,
  guardrails,
  models,
}) {
  return renderLegacySourceTemplate(
    agentsPageTemplate.replaceAll(
      "${JSON.stringify(defaultUpstreamOrigin)}",
      JSON.stringify(defaultUpstreamOrigin),
    ),
    {
      "EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.props": evaluations.props,
      "EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.refs": evaluations.refs,
      "EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.state": evaluations.state,
      "EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.lifecycle": evaluations.lifecycle,
      "EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.view": evaluations.view,
      "EVALUATIONS_AGENT_SCRIPT_FRAGMENTS.modal": evaluations.modal,
      "GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.state": guardrails.state,
      "GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.versionDiffItems": guardrails.versionDiffItems,
      "GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.versionDiffPayload": guardrails.versionDiffPayload,
      "GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.page": guardrails.page,
      "MODELS_AGENT_SCRIPT_FRAGMENTS.props": models.props,
      "MODELS_AGENT_SCRIPT_FRAGMENTS.catalogState": models.catalogState,
      "MODELS_AGENT_SCRIPT_FRAGMENTS.resolvedCatalog": models.resolvedCatalog,
      "MODELS_AGENT_SCRIPT_FRAGMENTS.catalogLoader": models.catalogLoader,
      "MODELS_AGENT_SCRIPT_FRAGMENTS.catalogLifecycle": models.catalogLifecycle,
    },
  );
}
