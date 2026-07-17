import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readPlatformCompositionSource } from "../apps/platform/testing/platform-composition-source.mjs";

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
  "src/platform-resources/computers/detail/index.ts",
  "src/platform-resources/computers/detail/README.md",
  "src/platform-resources/computers/detail/computer-detail-page.tsx",
  "src/platform-resources/computers/detail/computer-detail-page.test.tsx",
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
  path.join(packageRoot, "apps", "platform", "server", "index.mjs"),
];
for (const filePath of sourceFiles) {
  if (!await pathExists(filePath)) continue;
  const source = await fs.readFile(filePath, "utf8");
  if (source.includes("platform-ui/resources")) {
    failures.push(`${path.relative(packageRoot, filePath)} references the retired platform-ui/resources path`);
  }
}

const platformEntrySource = await readPlatformCompositionSource();
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
  if (platformEntrySource.includes(retiredIdentifier)) {
    failures.push(`apps/platform/server/index.mjs still owns retired agent-detail behavior: ${retiredIdentifier}`);
  }
}
if (await pathExists(path.join(packageRoot, "img", "agent-backgrounds"))) {
  failures.push("img/agent-backgrounds must not exist; agent detail pages no longer render wallpapers");
}
if (!platformEntrySource.includes("React.createElement(AgentPublishControl")) {
  failures.push("the platform application must consume the modular AgentPublishControl");
}
if (platformEntrySource.includes("renderAgentPublishControlTrigger")) {
  failures.push("the platform application must not own the AgentPublishControl trigger");
}
if (!platformEntrySource.includes("React.createElement(PlatformPermissionsPage")) {
  failures.push("the platform application must consume the modular PlatformPermissionsPage");
}
const rolePermissionsConsumers = [
  "src/platform-services/configure-mode/organizations/client/page/roles-and-view.mjs",
  "src/platform-services/configure-mode/teams/client/page/roles-and-view.mjs",
  "src/platform-services/create-mode/projects/client/overview/runtime/sidebar-and-composition.mjs",
  "apps/platform/client/legacy/domains/compute-resources/controller/database-detail-view.js",
  "apps/platform/client/legacy/domains/compute-resources/controller/server-detail-view.js",
];
for (const consumerPath of rolePermissionsConsumers) {
  const absoluteConsumerPath = path.join(packageRoot, consumerPath);
  if (!await pathExists(absoluteConsumerPath)) {
    failures.push(`${consumerPath} is missing`);
    continue;
  }
  const consumerSource = await fs.readFile(absoluteConsumerPath, "utf8");
  if (!consumerSource.includes("React.createElement(PlatformRolePermissionsPage")) {
    failures.push(`${consumerPath} must consume the modular PlatformRolePermissionsPage`);
  }
}
if (!platformEntrySource.includes("permissions: {")) {
  failures.push("the platform application must bind agent permissions through AgentDetailPage");
}
if (!/key: "agent-insights-threads-" \+ selectedAgentThreadId,[\s\S]{0,240}?variant: "minimalistic-ui"/.test(platformEntrySource)) {
  failures.push("agent detail Insights must use the minimalistic PlatformDataTable variant");
}
const agentInsightsTableStart = platformEntrySource.indexOf('key: "agent-insights-threads-" + selectedAgentThreadId');
const agentInsightsTableToolbar = agentInsightsTableStart >= 0
  ? platformEntrySource.indexOf("toolbar:", agentInsightsTableStart)
  : -1;
if (
  agentInsightsTableStart < 0
  || agentInsightsTableToolbar < 0
  || platformEntrySource.slice(agentInsightsTableStart, agentInsightsTableToolbar).includes("pagination:")
) {
  failures.push("agent detail Insights must not render a table pagination footer");
}
const agentAnalyticsStart = platformEntrySource.indexOf("const agentUsageChartSection = React.createElement(PlatformAnalyticsSection");
const agentAnalyticsEnd = agentAnalyticsStart >= 0
  ? platformEntrySource.indexOf("const renderAgentAboutRow", agentAnalyticsStart)
  : -1;
const agentAnalyticsSource = agentAnalyticsStart >= 0 && agentAnalyticsEnd > agentAnalyticsStart
  ? platformEntrySource.slice(agentAnalyticsStart, agentAnalyticsEnd)
  : "";
if (!agentAnalyticsSource.includes("timeframe: {")) {
  failures.push("agent detail Insights analytics must delegate its timeframe selector to PlatformAnalyticsSection");
}
if (
  !platformEntrySource.includes('{ id: "day", label: "24H", bucketCount: 1 }')
  || !platformEntrySource.includes('{ id: "week", label: "7D", bucketCount: 7 }')
  || !platformEntrySource.includes('{ id: "month", label: "30D", bucketCount: 30 }')
) {
  failures.push("agent detail Insights analytics must use the standard 24H, 7D, and 30D timeframes");
}
const agentPerformanceKpiStart = platformEntrySource.indexOf("const agentDetailPerformanceKpis =");
const agentPerformanceKpiEnd = agentPerformanceKpiStart >= 0
  ? platformEntrySource.indexOf("const maxAgentDetailPerformanceValue", agentPerformanceKpiStart)
  : -1;
const agentPerformanceKpiSource = agentPerformanceKpiStart >= 0 && agentPerformanceKpiEnd > agentPerformanceKpiStart
  ? platformEntrySource.slice(agentPerformanceKpiStart, agentPerformanceKpiEnd)
  : "";
if (
  !agentPerformanceKpiSource.includes('label: "Consumed Tokens"')
  || agentPerformanceKpiSource.includes('label: "Avg cost / Run"')
) {
  failures.push("agent detail Insights analytics must report consumed tokens instead of average run cost");
}
if (agentAnalyticsSource.includes('className: "playground-project-overview-progress-combo-ranges"')) {
  failures.push("agent detail Insights must not render a local analytics timeframe control");
}
if (agentAnalyticsSource.includes("headerActions:") || agentAnalyticsSource.includes("chartContent:")) {
  failures.push("agent detail Insights analytics must use the shared PlatformAnalyticsSection header and chart renderer");
}
if (!/const agentInsightsSection = React\.createElement\(React\.Fragment, null,\s*agentUsageChartSection,\s*agentThreadsSection/.test(platformEntrySource)) {
  failures.push("agent detail Insights must render the centralized analytics section above the threads table");
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
  if (platformEntrySource.includes(retiredPermissionRenderer)) {
    failures.push(`apps/platform/server/index.mjs still owns retired permission-page UI: ${retiredPermissionRenderer}`);
  }
}

const agentDetailPageSource = await fs.readFile(
  path.join(packageRoot, "src", "platform-resources", "agents", "detail", "agent-detail-page.tsx"),
  "utf8",
);
if (!agentDetailPageSource.includes("AgentPermissionsPage")) {
  failures.push("AgentDetailPage must own its permissions-tab composition");
}

const computerDetailPageSource = await fs.readFile(
  path.join(packageRoot, "src", "platform-resources", "computers", "detail", "computer-detail-page.tsx"),
  "utf8",
);
if (!computerDetailPageSource.includes("ResourceDetailPage")) {
  failures.push("ComputerDetailPage must compose the shared ResourceDetailPage");
}
const computerDetailControllerSource = await fs.readFile(
  path.join(packageRoot, "apps", "platform", "client", "legacy", "domains", "compute-resources", "controller", "computer-detail-view.js"),
  "utf8",
);
if (!computerDetailControllerSource.includes("React.createElement(ComputerDetailPage")) {
  failures.push("the computer detail controller must consume the modular ComputerDetailPage");
}
if (!computerDetailControllerSource.includes("React.createElement(PlatformAnalyticsSection")) {
  failures.push("computer detail analytics must use PlatformAnalyticsSection");
}
if (!computerDetailControllerSource.includes("React.createElement(PlatformInstructionsEditor")) {
  failures.push("computer descriptions must use PlatformInstructionsEditor");
}
for (const retiredComputerDetailRenderer of [
  "renderEnvironmentDetailTimescaleControl",
  "renderEnvironmentDetailActivityChart",
  "environmentDescriptionFormatActions",
]) {
  if (computerDetailControllerSource.includes(retiredComputerDetailRenderer)) {
    failures.push(`computer detail still owns retired shared UI: ${retiredComputerDetailRenderer}`);
  }
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
