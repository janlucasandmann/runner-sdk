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
 * Composes the legacy application shell from domain-owned fragments. This is
 * the final compatibility boundary before those controllers become typed
 * routes and providers.
 */
export function createLegacyPlatformShellScript(bindings) {
  const {
    aiosOrigin,
    defaultUpstreamOrigin,
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
  return renderLegacySourceTemplate(
    source,
    flattenLegacySourceBindings(bindings),
  );
}
