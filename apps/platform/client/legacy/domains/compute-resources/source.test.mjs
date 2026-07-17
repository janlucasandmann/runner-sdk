import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS,
  COMPUTE_RESOURCES_PAGE_SCRIPT,
} from "./source.mjs";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

assert.equal(COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.length, 10);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function PlaygroundEnvironmentsPage/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentServerEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentDatabaseEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentEnvironmentEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderEmbeddedResourcesOverviewSection/);

for (const relativePath of COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS) {
  const source = await fs.readFile(path.join(domainRoot, relativePath), "utf8");
  const lineCount = source.split("\n").length;
  assert.ok(
    lineCount <= 7_200,
    `${relativePath} exceeded the 7,200-line compatibility budget (${lineCount}).`,
  );
}

console.log(
  `Compute compatibility controller assembled from `
  + `${COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.length} bounded fragments.`,
);
