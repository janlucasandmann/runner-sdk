import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentRoot = path.join(packageRoot, "src", "platform-ui", "components");
const primitiveComponents = ["button", "label", "search", "switch"];
const compositeComponents = ["analytics", "data-table", "detail-sidebar", "detail-tab-bar", "instructions-editor", "modal", "popup", "widgets"];
const retiredRootComponents = [...primitiveComponents, ...compositeComponents];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules") continue;
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath));
    } else if (/\.(?:js|mjs|ts|tsx|md)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

const failures = [];
for (const componentName of primitiveComponents) {
  if (!await pathExists(path.join(componentRoot, "ui", componentName, "index.ts"))) {
    failures.push(`ui/${componentName} is missing its index.ts`);
  }
}
for (const componentName of compositeComponents) {
  if (!await pathExists(path.join(componentRoot, "composite", componentName, "index.ts"))) {
    failures.push(`composite/${componentName} is missing its index.ts`);
  }
}
for (const componentName of retiredRootComponents) {
  if (await pathExists(path.join(componentRoot, componentName))) {
    failures.push(`components/${componentName} must move into ui or composite`);
  }
}

const uiFiles = await collectFiles(path.join(componentRoot, "ui"));
for (const filePath of uiFiles) {
  const source = await fs.readFile(filePath, "utf8");
  if (source.includes("/composite/") || source.includes("../composite")) {
    failures.push(`${path.relative(packageRoot, filePath)} makes a primitive depend on a composite`);
  }
}

const runtimeFiles = [
  ...await collectFiles(path.join(packageRoot, "src")),
  ...await collectFiles(path.join(packageRoot, "examples")),
];
const retiredImportPattern = /platform-ui\/components\/(?:analytics|button|label|search|switch|data-table|modal|popup|widgets)(?:\/|["'])|(?:^|\.)\.\/[^"']*components\/(?:analytics|button|label|search|switch|data-table|modal|popup|widgets)(?:\/|["'])/m;
for (const filePath of runtimeFiles) {
  if (filePath.endsWith(path.join("src", "react", "runner-chat-css.ts"))) continue;
  const source = await fs.readFile(filePath, "utf8");
  if (retiredImportPattern.test(source)) {
    failures.push(`${path.relative(packageRoot, filePath)} references a retired direct component path`);
  }
}

const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, "package.json"), "utf8"));
const canonicalExports = new Map([
  ["./platform-ui/components/ui/button", "./dist/platform-ui/components/ui/button/index.js"],
  ["./platform-ui/components/ui/label", "./dist/platform-ui/components/ui/label/index.js"],
  ["./platform-ui/components/ui/search", "./dist/platform-ui/components/ui/search/index.js"],
  ["./platform-ui/components/ui/switch", "./dist/platform-ui/components/ui/switch/index.js"],
  ["./platform-ui/components/composite/analytics", "./dist/platform-ui/components/composite/analytics/index.js"],
  ["./platform-ui/components/composite/data-table", "./dist/platform-ui/components/composite/data-table/index.js"],
  ["./platform-ui/components/composite/detail-sidebar", "./dist/platform-ui/components/composite/detail-sidebar/index.js"],
  ["./platform-ui/components/composite/detail-tab-bar", "./dist/platform-ui/components/composite/detail-tab-bar/index.js"],
  ["./platform-ui/components/composite/instructions-editor", "./dist/platform-ui/components/composite/instructions-editor/index.js"],
  ["./platform-ui/components/composite/modal", "./dist/platform-ui/components/composite/modal/index.js"],
  ["./platform-ui/components/composite/popup", "./dist/platform-ui/components/composite/popup/index.js"],
  ["./platform-ui/components/composite/widgets", "./dist/platform-ui/components/composite/widgets/index.js"],
]);
for (const [exportName, expectedPath] of canonicalExports) {
  if (packageJson.exports?.[exportName]?.default !== expectedPath) {
    failures.push(`${exportName} must target ${expectedPath}`);
  }
}

const compatibilityExports = new Map([
  ["./platform-ui/components/button", canonicalExports.get("./platform-ui/components/ui/button")],
  ["./platform-ui/components/label", canonicalExports.get("./platform-ui/components/ui/label")],
  ["./platform-ui/components/search", canonicalExports.get("./platform-ui/components/ui/search")],
  ["./platform-ui/components/switch", canonicalExports.get("./platform-ui/components/ui/switch")],
  ["./platform-ui/components/data-table", canonicalExports.get("./platform-ui/components/composite/data-table")],
  ["./platform-ui/components/modal", canonicalExports.get("./platform-ui/components/composite/modal")],
  ["./platform-ui/components/popup", canonicalExports.get("./platform-ui/components/composite/popup")],
  ["./platform-ui/components/widgets", canonicalExports.get("./platform-ui/components/composite/widgets")],
]);
for (const [exportName, expectedPath] of compatibilityExports) {
  if (packageJson.exports?.[exportName]?.default !== expectedPath) {
    failures.push(`compatibility export ${exportName} must target ${expectedPath}`);
  }
}

if (failures.length > 0) {
  throw new Error(`Platform component invariant failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}

console.log(
  `Platform component invariant passed (${primitiveComponents.length} UI, ${compositeComponents.length} composite).`
);
