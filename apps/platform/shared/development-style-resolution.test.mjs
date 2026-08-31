import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PLATFORM_PAGE_STYLE_SOURCE_PATHS,
  loadPlatformPageStyleBundle,
} from "./development-style-resolution.mjs";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

assert.equal(
  new Set(PLATFORM_PAGE_STYLE_SOURCE_PATHS).size,
  PLATFORM_PAGE_STYLE_SOURCE_PATHS.length,
  "The canonical page-style source contract must not contain duplicates.",
);

await Promise.all(
  PLATFORM_PAGE_STYLE_SOURCE_PATHS.map(async (relativePath) => {
    await fs.access(path.resolve(packageRoot, relativePath));
  }),
);

const pageStyles = await loadPlatformPageStyleBundle(packageRoot);
assert.match(
  pageStyles,
  /\.platform-resource-settings-page\s*\{[\s\S]{0,500}grid-template-columns:/,
  "The canonical page bundle must include the Settings content/sidebar grid.",
);
assert.match(
  pageStyles,
  /\.platform-resource-settings-page__sidebar\s*\{/,
  "The canonical page bundle must include Settings sidebar layout rules.",
);

const assetGenerator = await fs.readFile(
  path.resolve(packageRoot, "scripts/runner-chat-assets.mjs"),
  "utf8",
);
assert.match(
  assetGenerator,
  /loadPlatformPageStyleBundle\(packageRoot\)/,
  "The production asset generator must consume the canonical page-style bundle.",
);
assert.match(
  assetGenerator,
  /distPlatformPagesCssPath,[\s\S]{0,80}platformPagesCssText/,
  "The production page artifact must be written from the canonical bundle.",
);

console.log("Platform page style composition contract passed.");
