import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createRunnerChatCssHmrPlugin,
  RUNNER_CHAT_CSS_HMR_MODULE_ID,
} from "./runner-chat-css-hmr.mjs";
import {
  resolveRunnerChatStyleSourcePaths,
} from "../../../scripts/runner-chat-style-sources.mjs";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const plugin = createRunnerChatCssHmrPlugin({ packageRoot });
const resolvedId = plugin.resolveId(
  "./runner-chat-css.js",
  path.join(packageRoot, "src/react/runner-chat-styles.ts"),
);

assert.equal(plugin.apply, "serve");
assert.equal(resolvedId, `\0${RUNNER_CHAT_CSS_HMR_MODULE_ID}`);
assert.equal(
  plugin.resolveId(
    "./runner-chat-css.js",
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

console.log("RunnerChat source-CSS HMR contracts passed.");
