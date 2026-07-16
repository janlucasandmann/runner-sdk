import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resourceRoot = path.join(packageRoot, "src", "platform-resources");
const developModeRoot = path.join(packageRoot, "src", "platform-services", "develop-mode");
const legacyResourceRoot = path.join(packageRoot, "src", "platform-ui", "resources");
const requiredResources = ["agents", "computers", "plugins", "skills", "tags"];
const requiredDevelopServices = [
  "api-keys",
  "web-apps",
  "apis",
  "functions",
  "databases",
  "authentication",
  "agent-runtime",
  "voice-agents",
  "secrets",
  "payments",
];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(root) {
  if (!await pathExists(root)) return [];
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

const failures = [];
if (!await pathExists(resourceRoot)) {
  failures.push("src/platform-resources is missing");
}
if (await pathExists(legacyResourceRoot)) {
  failures.push("src/platform-ui/resources must not exist");
}

for (const resource of requiredResources) {
  const resourceIndex = path.join(resourceRoot, resource, "index.ts");
  const overviewIndex = path.join(resourceRoot, resource, "overview", "index.ts");
  if (!await pathExists(resourceIndex)) failures.push(`platform-resources/${resource}/index.ts is missing`);
  if (!await pathExists(overviewIndex)) failures.push(`platform-resources/${resource}/overview/index.ts is missing`);
}

for (const file of [
  "src/platform-ui/pages/details/index.ts",
  "src/platform-ui/pages/details/resource-detail-page.tsx",
  "src/platform-ui/pages/permissions/index.ts",
  "src/platform-ui/pages/permissions/README.md",
  "src/platform-ui/pages/permissions/permission-catalog.ts",
  "src/platform-ui/pages/permissions/permission-model.ts",
  "src/platform-ui/pages/permissions/permission-policy.ts",
  "src/platform-ui/pages/permissions/permission-ring-visuals.tsx",
  "src/platform-ui/pages/permissions/permission-types.ts",
  "src/platform-ui/pages/permissions/platform-permissions-page.test.tsx",
  "src/platform-ui/pages/permissions/platform-permissions-page.tsx",
  "src/platform-ui/pages/permissions/platform-role-permissions-page.tsx",
  "src/platform-ui/pages/permissions/permission-page.css",
  "src/platform-ui/components/composite/detail-tab-bar/index.ts",
  "src/platform-ui/components/composite/detail-sidebar/index.ts",
  "src/platform-ui/components/composite/instructions-editor/index.ts",
  "src/platform-resources/agents/detail/index.ts",
  "src/platform-resources/agents/detail/README.md",
  "src/platform-resources/agents/detail/agent-detail-page.tsx",
  "src/platform-resources/agents/detail/agent-permissions-page.tsx",
  "src/platform-resources/agents/detail/agent-permissions-page.test.tsx",
  "src/platform-resources/agents/detail/agent-publish-control.tsx",
  "src/platform-resources/agents/detail/agent-publish-control.css",
  "src/platform-services/configure-mode/configure-home/client/page/configure-home-overview-page.tsx",
]) {
  if (!await pathExists(path.join(packageRoot, file))) {
    failures.push(`${file} is missing`);
  }
}

for (const service of requiredDevelopServices) {
  for (const file of [
    "README.md",
    "index.ts",
    "client/index.ts",
    "client/domain/index.ts",
    "client/page/index.ts",
  ]) {
    if (!await pathExists(path.join(developModeRoot, service, file))) {
      failures.push(`platform-services/develop-mode/${service}/${file} is missing`);
    }
  }
}

for (const file of [
  "shared/index.ts",
  "shared/client/index.ts",
  "shared/client/domain/index.ts",
  "shared/client/domain/resource-overview-model.ts",
  "shared/client/domain/resource-overview-types.ts",
  "shared/client/page/index.ts",
  "shared/client/page/resource-overview-page.tsx",
  "service-registry.tsx",
]) {
  if (!await pathExists(path.join(developModeRoot, file))) {
    failures.push(`platform-services/develop-mode/${file} is missing`);
  }
}

if (await pathExists(path.join(developModeRoot, "resources"))) {
  failures.push("platform-services/develop-mode/resources must not exist; each Develop service owns its pages");
}

const sourceFiles = [
  ...await collectFiles(path.join(packageRoot, "src")),
  path.join(packageRoot, "examples", "demo-server.mjs"),
];
for (const filePath of sourceFiles) {
  if (!await pathExists(filePath)) continue;
  const source = await fs.readFile(filePath, "utf8");
  if (source.includes("platform-ui/resources")) {
    failures.push(`${path.relative(packageRoot, filePath)} references the retired platform-ui/resources path`);
  }
}

const demoServerPath = path.join(packageRoot, "examples", "demo-server.mjs");
const demoServerSource = await fs.readFile(demoServerPath, "utf8");
for (const retiredIdentifier of [
  "setAgentInstructionsHistory",
  "setIsAgentInstructionsEditing",
  "agentInstructionsTextareaRef",
  "agentInstructionsSectionRef",
  "getPlaygroundAgentBackgroundImageUrl",
  "is-agent-background-active",
  "--playground-agent-detail-bg-image",
  "PLAYGROUND_SPARK_AGENT_BACKGROUND_URL",
  "PLAYGROUND_FORGE_AGENT_BACKGROUND_URL",
  "PLAYGROUND_FOUNDRY_AGENT_BACKGROUND_URL",
]) {
  if (demoServerSource.includes(retiredIdentifier)) {
    failures.push(`examples/demo-server.mjs still owns retired agent-detail behavior: ${retiredIdentifier}`);
  }
}
if (await pathExists(path.join(packageRoot, "img", "agent-backgrounds"))) {
  failures.push("img/agent-backgrounds must not exist; agent detail pages no longer render wallpapers");
}
if (!demoServerSource.includes("React.createElement(AgentPublishControl")) {
  failures.push("examples/demo-server.mjs must consume the modular AgentPublishControl");
}
if (demoServerSource.includes("renderAgentPublishControlTrigger")) {
  failures.push("examples/demo-server.mjs must not own the AgentPublishControl trigger");
}
if (!demoServerSource.includes("React.createElement(PlatformPermissionsPage")) {
  failures.push("examples/demo-server.mjs must consume the modular PlatformPermissionsPage");
}
if (!demoServerSource.includes("React.createElement(PlatformRolePermissionsPage")) {
  failures.push("examples/demo-server.mjs must consume the modular PlatformRolePermissionsPage");
}
if (!demoServerSource.includes("permissions: {")) {
  failures.push("examples/demo-server.mjs must bind agent permissions through AgentDetailPage");
}
if (!/key: "agent-insights-threads-" \+ selectedAgentThreadId,[\s\S]{0,240}?variant: "minimalistic-ui"/.test(demoServerSource)) {
  failures.push("agent detail Insights must use the minimalistic PlatformDataTable variant");
}
const agentInsightsTableStart = demoServerSource.indexOf('key: "agent-insights-threads-" + selectedAgentThreadId');
const agentInsightsTableToolbar = agentInsightsTableStart >= 0
  ? demoServerSource.indexOf("toolbar:", agentInsightsTableStart)
  : -1;
if (
  agentInsightsTableStart < 0
  || agentInsightsTableToolbar < 0
  || demoServerSource.slice(agentInsightsTableStart, agentInsightsTableToolbar).includes("pagination:")
) {
  failures.push("agent detail Insights must not render a table pagination footer");
}
for (const retiredPermissionRenderer of [
  "const PLAYGROUND_PERMISSION_ACCESS_OPTIONS =",
  "const PLAYGROUND_PERMISSION_RING_DEFINITIONS =",
  "const PLAYGROUND_PERMISSION_ACTION_DEFINITIONS =",
  "function normalizePlaygroundPermissionSet",
  "function renderPlaygroundPermissionsPage",
  "function renderPlaygroundPermissionMiniRingIcon",
  "function updateAgentPermissionRingAccess",
  "function updateAgentPermissionActionRing",
  "function updateAgentPermissionActionAccess",
  "const agentPermissionsContent =",
  "const agentPermissionsSection =",
  "function PlaygroundPermissionRingsChart",
  "function drawPlaygroundPermissionMiniRingIcon",
  "function renderPlaygroundPermissionAccessSelect",
  "function renderPlaygroundPermissionPanel",
  "function renderPlaygroundPermissionRingSelect",
  "function renderPlaygroundPermissionRingsOverview",
  "function renderAgentPermissionAccessSelect",
  "function renderAgentPermissionRingSelect",
  "function renderAgentPermissionsList",
  ".playground-permission-rings-overview {",
]) {
  if (demoServerSource.includes(retiredPermissionRenderer)) {
    failures.push(`examples/demo-server.mjs still owns retired permission-page UI: ${retiredPermissionRenderer}`);
  }
}

const agentDetailPageSource = await fs.readFile(
  path.join(packageRoot, "src", "platform-resources", "agents", "detail", "agent-detail-page.tsx"),
  "utf8",
);
if (!agentDetailPageSource.includes("AgentPermissionsPage")) {
  failures.push("AgentDetailPage must own its permissions-tab composition");
}

const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, "package.json"), "utf8"));
const canonicalExport = packageJson.exports?.["./platform-resources"];
const compatibilityExport = packageJson.exports?.["./platform-ui/resources"];
const developModeExport = packageJson.exports?.["./platform-services/develop-mode"];
const permissionsPageExport = packageJson.exports?.["./platform-ui/pages/permissions"];
const permissionsPageStylesExport = packageJson.exports?.["./platform-ui/pages/permissions/styles.css"];
const expectedModulePath = "./dist/platform-resources/index.js";
if (canonicalExport?.default !== expectedModulePath) {
  failures.push("package export ./platform-resources must target dist/platform-resources/index.js");
}
if (compatibilityExport?.default !== expectedModulePath) {
  failures.push("legacy package export ./platform-ui/resources must target the canonical platform-resources output");
}
if (developModeExport?.default !== "./dist/platform-services/develop-mode/index.js") {
  failures.push("package export ./platform-services/develop-mode must target the develop-mode service output");
}
if (permissionsPageExport?.default !== "./dist/platform-ui/pages/permissions/index.js") {
  failures.push("package export ./platform-ui/pages/permissions must target the canonical permissions page output");
}
if (permissionsPageStylesExport?.default !== "./dist/platform-ui/pages/permissions/permission-page.css") {
  failures.push("package export ./platform-ui/pages/permissions/styles.css must target the canonical permissions stylesheet");
}

if (failures.length > 0) {
  throw new Error(`Platform resource invariant failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}

console.log(`Platform resource invariant passed (${requiredResources.length} resource domains and ${requiredDevelopServices.length} Develop services checked).`);
