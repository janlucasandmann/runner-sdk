import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = path.join(repositoryRoot, "src");
const platformUiRoot = path.join(sourceRoot, "platform-ui");
const runnerRoot = path.join(sourceRoot, "react");
const forbiddenPlatformUiRoots = [
  path.join(sourceRoot, "platform-app"),
  path.join(sourceRoot, "platform-resources"),
  path.join(sourceRoot, "platform-services"),
  path.join(sourceRoot, "platform-shell"),
];

async function collectSourceFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
    } else if (
      entry.isFile() &&
      /\.(?:ts|tsx)$/.test(entry.name) &&
      !entry.name.includes(".test.") &&
      !entry.name.includes(".spec.")
    ) {
      files.push(entryPath);
    }
  }
  return files;
}

function isInside(candidate, directory) {
  const relative = path.relative(directory, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveImport(sourceFile, specifier) {
  if (!specifier.startsWith(".")) return null;
  return path.resolve(path.dirname(sourceFile), specifier);
}

const importPattern = /(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g;
const violations = [];

for (const sourceFile of await collectSourceFiles(platformUiRoot)) {
  const relativeSource = path.relative(repositoryRoot, sourceFile);
  const source = await fs.readFile(sourceFile, "utf8");

  for (const match of source.matchAll(importPattern)) {
    const resolvedImport = resolveImport(sourceFile, match[1]);
    if (!resolvedImport) continue;

    if (forbiddenPlatformUiRoots.some((root) => isInside(resolvedImport, root))) {
      violations.push(`${relativeSource} imports owning domain ${match[1]}`);
    }

    if (isInside(resolvedImport, runnerRoot)) {
      violations.push(`${relativeSource} imports Runner compatibility module ${match[1]}`);
    }
  }
}

assert.deepEqual(
  violations,
  [],
  `Platform UI import boundaries were violated:\n${violations.join("\n")}`,
);

console.log(
  "Platform UI import boundaries passed with no owning-domain or Runner " +
    "compatibility imports.",
);
