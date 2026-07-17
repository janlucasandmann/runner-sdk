import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const distributionRoot = path.join(repositoryRoot, "dist");
const packageJson = JSON.parse(
  await fs.readFile(path.join(repositoryRoot, "package.json"), "utf8"),
);

async function collectFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function collectExportTargets(value, targets = new Set()) {
  if (typeof value === "string") {
    if (value.startsWith("./dist/")) targets.add(value);
    return targets;
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      collectExportTargets(nestedValue, targets);
    }
  }

  return targets;
}

const distributionFiles = await collectFiles(distributionRoot);
const emittedTests = distributionFiles
  .map((file) => path.relative(repositoryRoot, file))
  .filter(
    (file) =>
      /(?:^|\/)__tests__(?:\/|$)/.test(file) ||
      /\.(?:test|spec)\.(?:[cm]?js|d\.ts)(?:\.map)?$/.test(file) ||
      /-test\.(?:[cm]?js|d\.ts)(?:\.map)?$/.test(file),
  );

assert.deepEqual(
  emittedTests,
  [],
  `Production build contains test artifacts:\n${emittedTests.join("\n")}`,
);

const exportTargets = collectExportTargets({
  main: packageJson.main,
  types: packageJson.types,
  exports: packageJson.exports,
});
const missingExportTargets = [];

for (const target of exportTargets) {
  try {
    await fs.access(path.join(repositoryRoot, target));
  } catch {
    missingExportTargets.push(target);
  }
}

assert.deepEqual(
  missingExportTargets,
  [],
  `Package exports reference missing build artifacts:\n${missingExportTargets.join("\n")}`,
);

console.log(
  `Build artifacts verified: ${distributionFiles.length} files, ` +
    `${exportTargets.size} package targets, no emitted tests.`,
);
