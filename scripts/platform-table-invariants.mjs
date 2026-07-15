import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoots = ["examples", "src"];
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const directTableAllowlist = [
  "tb-message-markdown-table",
  // Markdown documents contain semantic content tables, not resource-data tables.
  "platform-markdown__table",
  "playground-files-empty-folder-table",
];
const legacyTableClassNames = [
  "playground-project-overview-threads-table-header",
  "playground-project-overview-threads-table-row",
  "playground-guardrails-table-header",
  "playground-guardrails-table-row",
  "playground-evaluations-cases-header",
  "playground-evaluations-cases-row",
  "playground-settings-api-keys-table-header",
  "playground-settings-api-keys-table-row",
];

async function collectSourceFiles(relativeDirectory) {
  const directory = path.join(packageRoot, relativeDirectory);
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") return [];
      return collectSourceFiles(relativePath);
    }
    return sourceExtensions.has(path.extname(entry.name)) ? [relativePath] : [];
  }));
  return nested.flat();
}

function getLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function collectDirectTableViolations(relativePath, source) {
  const violations = [];
  const createElementPattern = /React\.createElement\(\s*["']table["']/g;
  for (const match of source.matchAll(createElementPattern)) {
    const context = source.slice(match.index, match.index + 260);
    if (directTableAllowlist.some((className) => context.includes(className))) continue;
    violations.push(`${relativePath}:${getLineNumber(source, match.index)} creates a table outside PlatformDataTable`);
  }
  if (relativePath.startsWith(`src${path.sep}platform-ui${path.sep}`)) {
    const jsxPattern = /<table(?:\s|>)/g;
    for (const match of source.matchAll(jsxPattern)) {
      const context = source.slice(match.index, match.index + 260);
      if (directTableAllowlist.some((className) => context.includes(className))) continue;
      violations.push(`${relativePath}:${getLineNumber(source, match.index)} renders a JSX table outside PlatformDataTable`);
    }
  }
  return violations;
}

function collectLegacyRendererViolations(relativePath, source) {
  const violations = [];
  for (const className of legacyTableClassNames) {
    let index = source.indexOf(className);
    while (index >= 0) {
      const nearbySource = source.slice(Math.max(0, index - 220), index + className.length + 40);
      if (nearbySource.includes("React.createElement")) {
        violations.push(`${relativePath}:${getLineNumber(source, index)} renders legacy table class ${className}`);
      }
      index = source.indexOf(className, index + className.length);
    }
  }
  return violations;
}

const sourceFiles = (await Promise.all(scanRoots.map(collectSourceFiles))).flat();
const violations = [];
for (const relativePath of sourceFiles) {
  const source = await fs.readFile(path.join(packageRoot, relativePath), "utf8");
  violations.push(...collectDirectTableViolations(relativePath, source));
  violations.push(...collectLegacyRendererViolations(relativePath, source));
}

if (violations.length) {
  console.error("Platform table invariant failed:\n" + violations.map((violation) => `- ${violation}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Platform table invariant passed (${sourceFiles.length} source files checked).`);
}
