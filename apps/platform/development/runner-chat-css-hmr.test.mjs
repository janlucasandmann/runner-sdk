import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createRunnerChatCssHmrPlugin,
  RUNNER_CHAT_CSS_HMR_MODULE_ID,
} from "./runner-chat-css-hmr.mjs";
import {
  loadRunnerChatCssBundle,
  resolveRunnerChatStyleSourcePaths,
} from "../../../scripts/runner-chat-style-sources.mjs";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const plugin = createRunnerChatCssHmrPlugin({ packageRoot });
const resolvedId = plugin.resolveId(
  "./thread-component-css.js",
  path.join(
    packageRoot,
    "src/platform-ui/components/thread-components/styles/thread-component-styles.ts",
  ),
);

assert.equal(plugin.apply, "serve");
assert.equal(resolvedId, `\0${RUNNER_CHAT_CSS_HMR_MODULE_ID}`);
assert.equal(
  plugin.resolveId(
    "./thread-component-css.js",
    path.join(packageRoot, "src/react/runner-chat.tsx"),
  ),
  null,
);

const moduleSource = plugin.load(resolvedId);
assert.match(moduleSource, /export let runnerChatCss/);
assert.match(moduleSource, /import\.meta\.hot\.accept/);
assert.match(moduleSource, /runner-web-sdk-chat-styles-v3/);
assert.match(moduleSource, /runner-chat\.css\?inline/);
assert.match(moduleSource, /runner-thread\.css\?inline/);

for (const sourcePath of resolveRunnerChatStyleSourcePaths(packageRoot)) {
  await fs.access(sourcePath);
}

const generatedCssModulePath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "thread-components",
  "styles",
  "thread-component-css.ts",
);
const sourceCss = await loadRunnerChatCssBundle(packageRoot);
const serializedCss = sourceCss
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");
const expectedGeneratedCssModule = [
  "// This file is generated from RunnerChat and shared platform component CSS by scripts/runner-chat-assets.mjs.",
  "// Edit the CSS sources instead of modifying this file directly.",
  "",
  `export const runnerChatCss = String.raw\`${serializedCss}\`;`,
  "",
].join("\n");
assert.equal(
  await fs.readFile(generatedCssModulePath, "utf8"),
  expectedGeneratedCssModule,
  "The committed thread CSS module must match the ordered editable sources.",
);

console.log("RunnerChat source-CSS HMR and generated-source contracts passed.");
