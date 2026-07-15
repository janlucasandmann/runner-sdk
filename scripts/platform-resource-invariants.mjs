import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resourceRoot = path.join(packageRoot, "src", "platform-resources");
const developModeRoot = path.join(packageRoot, "src", "platform-services", "develop-mode");
const legacyResourceRoot = path.join(packageRoot, "src", "platform-ui", "resources");
const requiredResources = ["agents", "computers", "plugins", "skills", "tags"];
const requiredDevelopServices = [
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
  "src/platform-ui/components/composite/detail-tab-bar/index.ts",
  "src/platform-ui/components/composite/detail-sidebar/index.ts",
  "src/platform-ui/components/composite/instructions-editor/index.ts",
  "src/platform-resources/agents/detail/index.ts",
  "src/platform-resources/agents/detail/agent-detail-page.tsx",
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

const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, "package.json"), "utf8"));
const canonicalExport = packageJson.exports?.["./platform-resources"];
const compatibilityExport = packageJson.exports?.["./platform-ui/resources"];
const developModeExport = packageJson.exports?.["./platform-services/develop-mode"];
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

if (failures.length > 0) {
  throw new Error(`Platform resource invariant failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}

console.log(`Platform resource invariant passed (${requiredResources.length} resource domains and ${requiredDevelopServices.length} Develop services checked).`);
