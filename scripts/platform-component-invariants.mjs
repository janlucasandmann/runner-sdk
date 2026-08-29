import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentRoot = path.join(packageRoot, "src", "platform-ui", "components");
const primitiveComponents = [
  "button",
  "checkbox",
  "icon-button",
  "label",
  "search",
  "selector",
  "switch",
  "ticket-item",
  "toggle",
  "version-label",
];
const compositeComponents = [
  "analytics",
  "attachments",
  "code-editor-workspace",
  "code-preview-box",
  "connector-action-detail",
  "data-table",
  "deployment-map",
  "detail-sidebar",
  "detail-tab-bar",
  "diff-viewer",
  "empty-state",
  "floating-sidebar",
  "instructions-editor",
  "loading-state",
  "modal",
  "page-hero",
  "popup",
  "resource-action-modals",
  "resource-detail-sidebar",
  "resource-header-actions",
  "settings-section",
  "subtasks",
  "ui-card",
  "version-history-sidebar",
  "versioning",
  "widgets",
];
const threadComponents = ["document-preview", "log-boxes"];
const retiredRootComponents = [...primitiveComponents, ...compositeComponents];
const allowedUiCompositeDependencies = new Map([
  ["selector", new Set(["popup"])],
  // Ticket rows own their standardized action-menu trigger and positioning so
  // every overview inherits the same multi-select and keyboard behavior.
  ["ticket-item", new Set(["popup"])],
]);

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
      files.push(...(await collectFiles(entryPath)));
    } else if (/\.(?:js|mjs|ts|tsx|md)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }
  return files;
}

const failures = [];
for (const componentName of primitiveComponents) {
  if (!(await pathExists(path.join(componentRoot, "ui", componentName, "index.ts")))) {
    failures.push(`ui/${componentName} is missing its index.ts`);
  }
}
for (const componentName of compositeComponents) {
  if (!(await pathExists(path.join(componentRoot, "composite", componentName, "index.ts")))) {
    failures.push(`composite/${componentName} is missing its index.ts`);
  }
}
for (const componentName of threadComponents) {
  if (
    !(await pathExists(path.join(componentRoot, "thread-components", componentName, "index.ts")))
  ) {
    failures.push(`thread-components/${componentName} is missing its index.ts`);
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
  const relativeUiPath = path.relative(path.join(componentRoot, "ui"), filePath);
  const componentName = relativeUiPath.split(path.sep)[0];
  const allowedDependencies = allowedUiCompositeDependencies.get(componentName) || new Set();
  const compositeImports = Array.from(source.matchAll(/(?:\/|\.\.\/)composite\/([^/"']+)/g)).map(
    (match) => match[1],
  );
  const forbiddenDependencies = compositeImports.filter(
    (dependency) => !allowedDependencies.has(dependency),
  );
  if (forbiddenDependencies.length > 0) {
    failures.push(
      `${path.relative(packageRoot, filePath)} makes a primitive depend on a composite`,
    );
  }
}

const runtimeFiles = [
  ...(await collectFiles(path.join(packageRoot, "src"))),
  ...(await collectFiles(path.join(packageRoot, "examples"))),
];
const retiredImportPattern =
  /platform-ui\/components\/(?:analytics|button|label|search|selector|switch|data-table|modal|popup|widgets)(?:\/|["'])|(?:^|\.)\.\/[^"']*components\/(?:analytics|button|label|search|selector|switch|data-table|modal|popup|widgets)(?:\/|["'])/m;
for (const filePath of runtimeFiles) {
  if (
    filePath.endsWith(
      path.join(
        "src",
        "platform-ui",
        "components",
        "thread-components",
        "styles",
        "thread-component-css.ts",
      ),
    )
  )
    continue;
  const source = await fs.readFile(filePath, "utf8");
  if (retiredImportPattern.test(source)) {
    failures.push(
      `${path.relative(packageRoot, filePath)} references a retired direct component path`,
    );
  }
}

const packageJson = JSON.parse(await fs.readFile(path.join(packageRoot, "package.json"), "utf8"));
const canonicalExports = new Map([
  ["./platform-ui/components/ui/button", "./dist/platform-ui/components/ui/button/index.js"],
  [
    "./platform-ui/components/ui/checkbox",
    "./dist/platform-ui/components/ui/checkbox/index.js",
  ],
  [
    "./platform-ui/components/ui/icon-button",
    "./dist/platform-ui/components/ui/icon-button/index.js",
  ],
  ["./platform-ui/components/ui/label", "./dist/platform-ui/components/ui/label/index.js"],
  [
    "./platform-ui/components/ui/version-label",
    "./dist/platform-ui/components/ui/version-label/index.js",
  ],
  ["./platform-ui/components/ui/search", "./dist/platform-ui/components/ui/search/index.js"],
  ["./platform-ui/components/ui/selector", "./dist/platform-ui/components/ui/selector/index.js"],
  ["./platform-ui/components/ui/switch", "./dist/platform-ui/components/ui/switch/index.js"],
  ["./platform-ui/components/ui/toggle", "./dist/platform-ui/components/ui/toggle/index.js"],
  [
    "./platform-ui/components/ui/ticket-item",
    "./dist/platform-ui/components/ui/ticket-item/index.js",
  ],
  [
    "./platform-ui/components/composite/analytics",
    "./dist/platform-ui/components/composite/analytics/index.js",
  ],
  [
    "./platform-ui/components/composite/attachments",
    "./dist/platform-ui/components/composite/attachments/index.js",
  ],
  [
    "./platform-ui/components/composite/subtasks",
    "./dist/platform-ui/components/composite/subtasks/index.js",
  ],
  [
    "./platform-ui/components/composite/code-editor-workspace",
    "./dist/platform-ui/components/composite/code-editor-workspace/index.js",
  ],
  [
    "./platform-ui/components/composite/code-preview-box",
    "./dist/platform-ui/components/composite/code-preview-box/index.js",
  ],
  [
    "./platform-ui/components/composite/connector-action-detail",
    "./dist/platform-ui/components/composite/connector-action-detail/index.js",
  ],
  [
    "./platform-ui/components/composite/data-table",
    "./dist/platform-ui/components/composite/data-table/index.js",
  ],
  [
    "./platform-ui/components/composite/deployment-map",
    "./dist/platform-ui/components/composite/deployment-map/index.js",
  ],
  [
    "./platform-ui/components/composite/detail-sidebar",
    "./dist/platform-ui/components/composite/detail-sidebar/index.js",
  ],
  [
    "./platform-ui/components/composite/detail-tab-bar",
    "./dist/platform-ui/components/composite/detail-tab-bar/index.js",
  ],
  [
    "./platform-ui/components/composite/diff-viewer",
    "./dist/platform-ui/components/composite/diff-viewer/index.js",
  ],
  [
    "./platform-ui/components/composite/empty-state",
    "./dist/platform-ui/components/composite/empty-state/index.js",
  ],
  [
    "./platform-ui/components/composite/floating-sidebar",
    "./dist/platform-ui/components/composite/floating-sidebar/index.js",
  ],
  [
    "./platform-ui/components/composite/instructions-editor",
    "./dist/platform-ui/components/composite/instructions-editor/index.js",
  ],
  [
    "./platform-ui/components/composite/loading-state",
    "./dist/platform-ui/components/composite/loading-state/index.js",
  ],
  [
    "./platform-ui/components/composite/modal",
    "./dist/platform-ui/components/composite/modal/index.js",
  ],
  [
    "./platform-ui/components/composite/page-hero",
    "./dist/platform-ui/components/composite/page-hero/index.js",
  ],
  [
    "./platform-ui/components/composite/popup",
    "./dist/platform-ui/components/composite/popup/index.js",
  ],
  [
    "./platform-ui/components/composite/resource-action-modals",
    "./dist/platform-ui/components/composite/resource-action-modals/index.js",
  ],
  [
    "./platform-ui/components/composite/resource-detail-sidebar",
    "./dist/platform-ui/components/composite/resource-detail-sidebar/index.js",
  ],
  [
    "./platform-ui/components/composite/resource-header-actions",
    "./dist/platform-ui/components/composite/resource-header-actions/index.js",
  ],
  [
    "./platform-ui/components/composite/settings-section",
    "./dist/platform-ui/components/composite/settings-section/index.js",
  ],
  [
    "./platform-ui/components/composite/ui-card",
    "./dist/platform-ui/components/composite/ui-card/index.js",
  ],
  [
    "./platform-ui/components/composite/version-history-sidebar",
    "./dist/platform-ui/components/composite/version-history-sidebar/index.js",
  ],
  [
    "./platform-ui/components/composite/versioning",
    "./dist/platform-ui/components/composite/versioning/index.js",
  ],
  [
    "./platform-ui/components/composite/widgets",
    "./dist/platform-ui/components/composite/widgets/index.js",
  ],
  [
    "./platform-ui/components/thread-components",
    "./dist/platform-ui/components/thread-components/index.js",
  ],
  [
    "./platform-ui/components/thread-components/document-preview",
    "./dist/platform-ui/components/thread-components/document-preview/index.js",
  ],
  [
    "./platform-ui/components/thread-components/log-boxes",
    "./dist/platform-ui/components/thread-components/log-boxes/index.js",
  ],
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
  [
    "./platform-ui/components/selector",
    canonicalExports.get("./platform-ui/components/ui/selector"),
  ],
  ["./platform-ui/components/switch", canonicalExports.get("./platform-ui/components/ui/switch")],
  [
    "./platform-ui/components/data-table",
    canonicalExports.get("./platform-ui/components/composite/data-table"),
  ],
  [
    "./platform-ui/components/modal",
    canonicalExports.get("./platform-ui/components/composite/modal"),
  ],
  [
    "./platform-ui/components/popup",
    canonicalExports.get("./platform-ui/components/composite/popup"),
  ],
  [
    "./platform-ui/components/widgets",
    canonicalExports.get("./platform-ui/components/composite/widgets"),
  ],
]);
for (const [exportName, expectedPath] of compatibilityExports) {
  if (packageJson.exports?.[exportName]?.default !== expectedPath) {
    failures.push(`compatibility export ${exportName} must target ${expectedPath}`);
  }
}

if (failures.length > 0) {
  throw new Error(
    `Platform component invariant failed:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
  );
}

console.log(
  `Platform component invariant passed (${primitiveComponents.length} UI, ${compositeComponents.length} composite, ${threadComponents.length} thread).`,
);
