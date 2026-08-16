import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  flattenLegacySourceBindings,
  renderLegacySourceTemplate,
} from "../../source-template.mjs";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));
export const PLATFORM_SHELL_CONTROLLER_FRAGMENT_PATHS = Object.freeze([
  "controller/bootstrap-account-and-connectors.template.js",
  "controller/data-lifecycle-and-navigation.template.js",
  "controller/settings-tools-and-rendering.template.js",
  "controller/application-lifecycle-and-history.template.js",
  "controller/composition-and-modals.template.js",
]);

const shellTemplate = PLATFORM_SHELL_CONTROLLER_FRAGMENT_PATHS
  .map((relativePath) => fs.readFileSync(
    path.join(domainRoot, relativePath),
    "utf8",
  ))
  .join("");

function replaceSerializedExpression(source, expression, value) {
  return source.replaceAll(
    `\${JSON.stringify(${expression})}`,
    JSON.stringify(value),
  );
}

/**
 * Composes the platform application shell from domain-owned fragments.
 */
export function createLegacyPlatformShellScript(bindings) {
  const {
    aiosOrigin,
    defaultUpstreamOrigin,
    deploymentProfileEnvelope,
    platformOrigin,
  } = bindings;
  let source = shellTemplate;
  source = replaceSerializedExpression(
    source,
    "defaultUpstreamOrigin",
    defaultUpstreamOrigin,
  );
  source = replaceSerializedExpression(source, "aiosOrigin", aiosOrigin);
  source = replaceSerializedExpression(source, "platformOrigin", platformOrigin);
  for (const suffix of [
    "/developers",
    "/developers/quickstart",
    "/developers/run-and-scale/webhooks",
    "/support",
    "/tutorials/event-driven-triggers",
  ]) {
    source = replaceSerializedExpression(
      source,
      `aiosOrigin + ${JSON.stringify(suffix)}`,
      `${aiosOrigin}${suffix}`,
    );
  }
  const serializedDeploymentProfileEnvelope = JSON.stringify(
    deploymentProfileEnvelope || {
      profile: {
        schemaVersion: 2,
        profileId: "cloud-saas-v1",
        edition: "cloud",
        stage: "prod",
        topology: "gcp_saas",
        readiness: "available",
        capabilities: {
          platform: true,
          agentExecution: true,
          schedules: true,
          metronomes: true,
          localInference: false,
          deployableResources: true,
          modelManagement: true,
          modelSelection: true,
          subscriptions: true,
          billing: true,
          pricing: true,
          commercialUsageLimits: true,
        },
        product: {
          inference: { mode: "managed_catalog", fixedModelId: null },
          agents: {
            visibleBuiltIns: ["spark", "forge", "foundry"],
            defaultBuiltIn: "spark",
            defaultTeam: {
              enabled: true,
              builtIns: ["spark", "forge", "foundry"],
            },
            customAgents: true,
          },
          commerce: {
            mode: "subscription",
            entitlementSource: "subscription_catalog",
            commercialLimits: true,
          },
          usage: { mode: "billable" },
        },
      },
      hash: "compatibility-default",
      source: "legacy_source_default",
    },
  )
    .replace(/</g, "\\u003C")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  const deploymentProfileRuntime = `
        const platformDeploymentProfileEnvelope = Object.freeze(${serializedDeploymentProfileEnvelope});
        const platformDeploymentProfile = platformDeploymentProfileEnvelope.profile;
        function platformHasCapability(capability) {
          return platformDeploymentProfile.capabilities?.[capability] === true;
        }
        function platformHasBuiltInAgent(agentId) {
          return platformDeploymentProfile.product?.agents?.visibleBuiltIns?.includes(agentId) === true;
        }
`;
  return deploymentProfileRuntime + renderLegacySourceTemplate(
    source,
    flattenLegacySourceBindings(bindings),
  );
}
