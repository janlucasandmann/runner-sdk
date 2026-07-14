import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resourceRoot = path.join(packageRoot, "src", "platform-resources");
const legacyResourceRoot = path.join(packageRoot, "src", "platform-ui", "resources");
const requiredResources = ["agents", "computers", "plugins", "skills", "tags"];

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

const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, "package.json"), "utf8"));
const canonicalExport = packageJson.exports?.["./platform-resources"];
const compatibilityExport = packageJson.exports?.["./platform-ui/resources"];
const expectedModulePath = "./dist/platform-resources/index.js";
if (canonicalExport?.default !== expectedModulePath) {
  failures.push("package export ./platform-resources must target dist/platform-resources/index.js");
}
if (compatibilityExport?.default !== expectedModulePath) {
  failures.push("legacy package export ./platform-ui/resources must target the canonical platform-resources output");
}

if (failures.length > 0) {
  throw new Error(`Platform resource invariant failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}

console.log(`Platform resource invariant passed (${requiredResources.length} resource domains checked).`);
