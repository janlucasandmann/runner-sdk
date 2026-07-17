import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const platformRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function isCompositionSource(filePath) {
  return (
    (filePath.endsWith(".mjs") && !filePath.endsWith(".test.mjs"))
    || filePath.endsWith(".template.js")
  );
}

function sortCompositionPaths(left, right) {
  const leftRelative = path.relative(platformRoot, left);
  const rightRelative = path.relative(platformRoot, right);
  if (leftRelative === "server/index.mjs") return -1;
  if (rightRelative === "server/index.mjs") return 1;
  return leftRelative.localeCompare(rightRelative);
}

function collectCompositionPathsSync(directoryPath) {
  const paths = [];
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      paths.push(...collectCompositionPathsSync(entryPath));
    } else if (entry.isFile() && isCompositionSource(entryPath)) {
      paths.push(entryPath);
    }
  }
  return paths;
}

async function collectCompositionPaths(directoryPath) {
  const paths = [];
  for (const entry of await fsPromises.readdir(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await collectCompositionPaths(entryPath));
    } else if (entry.isFile() && isCompositionSource(entryPath)) {
      paths.push(entryPath);
    }
  }
  return paths;
}

function getCompositionRoots() {
  return [
    path.join(platformRoot, "server"),
    path.join(platformRoot, "client", "legacy"),
  ];
}

/**
 * Temporary source-level compatibility contract for the fragment-based shell.
 *
 * Tests should prefer direct module behavior. This reader exists only for
 * invariants that still need to inspect the quarantined legacy composition
 * while the typed application replaces it route by route.
 */
export async function readPlatformCompositionSource() {
  const paths = (
    await Promise.all(getCompositionRoots().map(collectCompositionPaths))
  ).flat().sort(sortCompositionPaths);
  const sources = await Promise.all(paths.map(async (filePath) => {
    const source = await fsPromises.readFile(filePath, "utf8");
    return `\n/* ${path.relative(platformRoot, filePath)} */\n${source}`;
  }));
  return sources.join("\n");
}

export function readPlatformCompositionSourceSync() {
  return getCompositionRoots()
    .flatMap(collectCompositionPathsSync)
    .sort(sortCompositionPaths)
    .map((filePath) => (
      `\n/* ${path.relative(platformRoot, filePath)} */\n${fs.readFileSync(filePath, "utf8")}`
    ))
    .join("\n");
}
