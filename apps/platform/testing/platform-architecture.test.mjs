import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createLegacyPlatformApplicationSources,
} from "../client/legacy/create-legacy-platform-application.mjs";
import { createPlatformDocumentAssets } from "../server/platform-assets.mjs";
import {
  RUNNER_CHAT_STYLE_SOURCE_PATHS,
} from "../../../scripts/runner-chat-style-sources.mjs";

const platformRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packageRoot = path.resolve(platformRoot, "../..");
const serverEntryPath = path.join(platformRoot, "server", "index.mjs");
const serverEntrySource = await fs.readFile(serverEntryPath, "utf8");
const serverEntryLines = serverEntrySource.split("\n").length;
const legacySourcesPath = path.join(
  platformRoot,
  "client",
  "legacy",
  "create-legacy-platform-sources.mjs",
);
const legacySourcesSource = await fs.readFile(legacySourcesPath, "utf8");
const legacySourcesLines = legacySourcesSource.split("\n").length;
const computeControllerRoot = path.join(
  platformRoot,
  "client",
  "legacy",
  "domains",
  "compute-resources",
  "controller",
);
const packageJson = JSON.parse(
  await fs.readFile(path.join(packageRoot, "package.json"), "utf8"),
);
const pageRoutesSource = await fs.readFile(
  path.join(platformRoot, "server", "routes", "page-and-static-routes.mjs"),
  "utf8",
);
const viteConfigSource = await fs.readFile(
  path.join(platformRoot, "vite.config.mjs"),
  "utf8",
);

async function readSourceBudget(relativePath, maxLines) {
  const absolutePath = path.join(packageRoot, relativePath);
  const source = await fs.readFile(absolutePath, "utf8");
  const lines = source.split("\n").length;
  assert.ok(
    lines <= maxLines,
    `${relativePath} exceeded ${maxLines.toLocaleString()} lines (${lines.toLocaleString()}).`,
  );
  return { source, lines };
}

async function collectSourceFiles(directory, extensions = new Set([".ts", ".tsx"])) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(entryPath, extensions));
    } else if (
      entry.isFile()
      && extensions.has(path.extname(entry.name))
      && !entry.name.includes(".test.")
      && !entry.name.includes(".spec.")
      && !entry.name.endsWith("-test.mjs")
    ) {
      files.push(entryPath);
    }
  }
  return files;
}

assert.equal(packageJson.name, "@computer-agents/platform");
assert.equal(packageJson.private, true);
assert.match(
  packageJson.scripts?.build || "",
  /^npm run clean && /,
  "Production builds must remove stale compiler output before emitting artifacts.",
);
assert.ok(
  serverEntryLines <= 500,
  `Platform composition root exceeded 500 lines (${serverEntryLines}).`,
);
assert.ok(
  legacySourcesLines <= 150,
  `Legacy source composition exceeded 150 lines (${legacySourcesLines}).`,
);
assert.doesNotMatch(legacySourcesSource, /<!doctype html>|<style>|<script\b/i);
assert.doesNotMatch(serverEntrySource, /<!doctype html>/i);
assert.doesNotMatch(serverEntrySource, /async function proxyUpstream/);
assert.doesNotMatch(serverEntrySource, /url\.pathname\.match/);
assert.match(serverEntrySource, /createLegacyPlatformApplicationSources/);
assert.match(serverEntrySource, /createPlatformGateway/);
assert.match(serverEntrySource, /createPlatformRequestHandler/);
assert.match(pageRoutesSource, /isRetiredPlatformDocumentPath/);
assert.match(pageRoutesSource, /new URL\("\/", platformOrigin\)/);
assert.match(pageRoutesSource, /url\.pathname === "\/"/);
assert.doesNotMatch(pageRoutesSource, /servePlatformClient/);
assert.doesNotMatch(pageRoutesSource, /platformViteOrigin/);
assert.match(viteConfigSource, /base:\s*"\/"/);
assert.match(viteConfigSource, /appType:\s*"custom"/);
assert.match(viteConfigSource, /platform-hmr-only-navigation/);
assert.doesNotMatch(viteConfigSource, /\bbuild\s*:/);
assert.equal(packageJson.exports?.["./platform-app"], undefined);
assert.equal(packageJson.scripts?.["platform:client:build"], undefined);
assert.equal(packageJson.scripts?.["platform:client:typecheck"], undefined);

const computeControllerEntries = await fs.readdir(
  computeControllerRoot,
  { withFileTypes: true },
);
assert.ok(
  computeControllerEntries.length >= 8,
  "The legacy compute controller must remain decomposed by responsibility.",
);
for (const entry of computeControllerEntries) {
  if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
  const source = await fs.readFile(
    path.join(computeControllerRoot, entry.name),
    "utf8",
  );
  const lines = source.split("\n").length;
  assert.ok(
    lines <= 7_200,
    `Compute controller fragment ${entry.name} exceeded 7,200 lines (${lines}).`,
  );
}

for (const domain of ["agents", "shell"]) {
  const controllerRoot = path.join(
    platformRoot,
    "client",
    "legacy",
    "domains",
    domain,
    "controller",
  );
  const entries = await fs.readdir(controllerRoot, { withFileTypes: true });
  assert.ok(
    entries.filter((entry) => entry.isFile()).length >= 5,
    `The legacy ${domain} controller must remain decomposed.`,
  );
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    const source = await fs.readFile(path.join(controllerRoot, entry.name), "utf8");
    const lines = source.split("\n").length;
    assert.ok(
      lines <= 6_200,
      `${domain} controller fragment ${entry.name} exceeded 6,200 lines (${lines}).`,
    );
  }
}

const adminModulePaths = (
  await fs.readdir(path.join(platformRoot, "server", "admin"))
)
  .filter((name) => name.endsWith(".mjs") && !name.endsWith(".test.mjs"))
  .map((name) => path.join(platformRoot, "server", "admin", name));
for (const adminModulePath of adminModulePaths) {
  const source = await fs.readFile(adminModulePath, "utf8");
  assert.doesNotMatch(
    source,
    /<!doctype html>/i,
    `${path.basename(adminModulePath)} must not embed an HTML document.`,
  );
}

const serverModulePaths = [];
async function collectServerModules(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectServerModules(entryPath);
    } else if (
      entry.isFile()
      && entry.name.endsWith(".mjs")
      && !entry.name.endsWith(".test.mjs")
    ) {
      serverModulePaths.push(entryPath);
    }
  }
}
await collectServerModules(path.join(platformRoot, "server"));
for (const serverModulePath of serverModulePaths) {
  const source = await fs.readFile(serverModulePath, "utf8");
  const lines = source.split("\n").length;
  assert.ok(
    lines <= 1_200,
    `${path.relative(platformRoot, serverModulePath)} exceeded 1,200 lines (${lines}).`,
  );
}

let boundedOwnedSourceCount = 0;
for (const relativeRoot of [
  "src/platform-runtime",
  "src/platform-resources",
  "src/platform-services",
  "src/platform-shell",
  "src/platform-ui",
]) {
  for (const modulePath of await collectSourceFiles(
    path.join(packageRoot, relativeRoot),
    new Set([".css", ".js", ".mjs", ".ts", ".tsx"]),
  )) {
    const relativePath = path.relative(packageRoot, modulePath);
    if (
      relativePath
      === "src/platform-ui/components/thread-components/styles/thread-component-css.ts"
    ) {
      continue;
    }
    await readSourceBudget(relativePath, 3_000);
    boundedOwnedSourceCount += 1;
  }
}
await readSourceBudget("src/client.ts", 3_300);

const runnerChatBudget = await readSourceBudget("src/react/runner-chat.tsx", 7_800);
const runnerChatFeatureStylePaths = [
  "src/react/runner-chat.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-core.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-resources.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-specialists.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-output.css",
  "src/react/runner-chat/styles/message-and-attachments.css",
  "src/platform-ui/components/thread-components/document-preview/document-preview.css",
  "src/react/runner-chat/styles/composer.css",
  "src/react/runner-chat/styles/dialogs-and-file-browser.css",
];
const runnerChatFeatureStyleStart = RUNNER_CHAT_STYLE_SOURCE_PATHS.indexOf(
  runnerChatFeatureStylePaths[0],
);
assert.notEqual(
  runnerChatFeatureStyleStart,
  -1,
  "The RunnerChat feature cascade must include its shell stylesheet.",
);
assert.deepEqual(
  RUNNER_CHAT_STYLE_SOURCE_PATHS.slice(
    runnerChatFeatureStyleStart,
    runnerChatFeatureStyleStart + runnerChatFeatureStylePaths.length,
  ),
  runnerChatFeatureStylePaths,
  "RunnerChat feature styles must retain their explicit cascade order.",
);
for (const relativePath of runnerChatFeatureStylePaths) {
  await readSourceBudget(relativePath, 3_000);
}
const runnerLogBoxesBudget = await readSourceBudget(
  "src/platform-ui/components/thread-components/log-boxes/runner-log-boxes.tsx",
  2_800,
);
const runnerLogBoxesCompatibilityBudget = await readSourceBudget(
  "src/react/runner-log-boxes.tsx",
  12,
);
const documentPreviewDrawerBudget = await readSourceBudget(
  "src/platform-ui/components/thread-components/document-preview/document-preview-drawer.tsx",
  1_800,
);
const documentPreviewDrawerCompatibilityBudget = await readSourceBudget(
  "src/react/runner-document-preview-drawer.tsx",
  12,
);
for (const relativePath of [
  "src/react/dot-loader.tsx",
  "src/react/runner-agents-list-log-box.tsx",
  "src/react/runner-chat-animations.ts",
  "src/react/runner-chat-css.ts",
  "src/react/runner-chat-styles.ts",
  "src/react/runner-document-preview.ts",
  "src/react/runner-environments-list-log-box.tsx",
  "src/react/runner-file-diff-surface.tsx",
  "src/react/runner-git-commit-log-box.tsx",
  "src/react/runner-git-diff-log-box.tsx",
  "src/react/runner-git-log-utils.ts",
  "src/react/runner-git-status-log-box.tsx",
  "src/react/runner-image-edit-overlays.tsx",
  "src/react/runner-image-preview-surface.tsx",
  "src/react/runner-lazy-media-preview.tsx",
  "src/react/runner-log-card.tsx",
  "src/react/runner-markdown.tsx",
  "src/react/runner-presentation-preview.tsx",
  "src/react/runner-presentation-utils.ts",
  "src/react/runner-projects-list-log-box.tsx",
  "src/react/runner-resources-list-log-box.tsx",
  "src/react/runner-spreadsheet-preview.tsx",
  "src/react/runner-spreadsheet-utils.ts",
  "src/react/runner-threads-list-log-box.tsx",
]) {
  const compatibilityFacade = await readSourceBudget(relativePath, 8);
  assert.match(
    compatibilityFacade.source,
    /platform-ui\/components\//,
    `${relativePath} must delegate to its platform-owned implementation.`,
  );
  assert.doesNotMatch(
    compatibilityFacade.source,
    /\bfunction\b|\bclass\b/,
    `${relativePath} must not regain implementation details.`,
  );
}
assert.match(
  runnerLogBoxesCompatibilityBudget.source,
  /platform-ui\/components\/thread-components\/log-boxes/,
  "The former log-box path must remain a compatibility facade only.",
);
assert.doesNotMatch(
  runnerLogBoxesCompatibilityBudget.source,
  /\bfunction\b|\bclass\b/,
  "The former log-box path must not regain implementation details.",
);
assert.match(
  documentPreviewDrawerCompatibilityBudget.source,
  /platform-ui\/components\/thread-components\/document-preview/,
  "The former document-preview drawer path must remain a compatibility facade only.",
);
assert.doesNotMatch(
  documentPreviewDrawerCompatibilityBudget.source,
  /\bfunction\b|\bclass\b/,
  "The former document-preview drawer path must not regain implementation details.",
);
for (const relativePath of [
  "src/react/runner-chat/attachment-preview-chip.tsx",
  "src/react/runner-chat/attachment-factories.ts",
  "src/react/runner-chat/canonical-action-log-index.ts",
  "src/react/runner-chat/canonical-thread-surface.tsx",
  "src/react/runner-chat/composer-selector-controls.tsx",
  "src/react/runner-chat/communicator-router.ts",
  "src/react/runner-chat/editable-turn-boundary.ts",
  "src/react/runner-chat/execution/active-run-instruction.ts",
  "src/react/runner-chat/file-browser-dialog.tsx",
  "src/react/runner-chat/file-browser-item.tsx",
  "src/react/runner-chat/file-browser-source.ts",
  "src/react/runner-chat/legacy-timeline.ts",
  "src/react/runner-chat/legacy-timeline-presentation.ts",
  "src/react/runner-chat/permission-decision.ts",
  "src/react/runner-chat/public-types.ts",
  "src/react/runner-chat/thread-history.ts",
  "src/react/runner-chat/thread-context-action.ts",
  "src/react/runner-chat/thread-context-control.tsx",
  "src/react/runner-chat/timeline-renderer.tsx",
  "src/react/runner-chat/turn-status-presentation.ts",
  "src/react/runner-chat/turn-timeline-state.ts",
  "src/react/runner-chat/use-log-auto-scroll.ts",
  "src/react/runner-chat/use-agent-selection-controller.ts",
  "src/react/runner-chat/use-custom-skills-controller.ts",
  "src/react/runner-chat/use-deep-research-sessions-controller.ts",
  "src/react/runner-chat/use-integration-selection-controller.ts",
  "src/react/runner-chat/use-run-stop-controller.ts",
  "src/react/runner-chat/use-schedule-controller.ts",
  "src/react/runner-chat/use-file-browser-source-loaders.ts",
  "src/react/runner-chat/use-file-browser-source-state.ts",
  "src/react/runner-chat/use-file-browser-attachment-controller.ts",
  "src/react/runner-chat/use-file-drop-controller.ts",
  "src/react/runner-chat/use-attachment-controller.ts",
  "src/react/runner-chat/use-fork-configuration-controller.ts",
  "src/react/runner-chat/use-github-branch-selection.ts",
  "src/react/runner-chat/use-enabled-skills-controller.ts",
  "src/react/runner-chat/use-external-composer-command-staging.ts",
  "src/react/runner-chat/use-thinking-status.ts",
  "src/react/runner-chat/use-staged-composer-commands.ts",
  "src/react/runner-chat/use-thread-context-controller.ts",
  "src/react/runner-chat/use-thread-history-rail.ts",
  "src/react/runner-chat/use-turn-notice-controller.ts",
  "src/react/runner-chat/use-workspace-selection-controller.ts",
  "src/react/runner-chat/voice-mode-presentation.tsx",
  "src/react/runner-chat/workflow-dialogs.tsx",
  "src/platform-ui/components/thread-components/log-boxes/log-entry-types.ts",
  "src/platform-ui/components/thread-components/log-boxes/list-files-state.ts",
  "src/platform-ui/components/thread-components/log-boxes/list-files-view.tsx",
  "src/platform-ui/components/thread-components/log-boxes/metronome-workflow-state.ts",
  "src/platform-ui/components/thread-components/log-boxes/metronome-workflow-view.tsx",
  "src/platform-ui/components/thread-components/log-boxes/permission-request-view.tsx",
  "src/platform-ui/components/thread-components/log-boxes/platform-action-view.tsx",
  "src/platform-ui/components/thread-components/log-boxes/visual-interaction-view.tsx",
  "src/platform-ui/components/thread-components/log-boxes/web-activity-view.tsx",
  "src/platform-ui/components/thread-components/document-preview/directory-preview.tsx",
  "src/platform-ui/components/thread-components/document-preview/document-preview-drawer.tsx",
  "src/platform-ui/components/thread-components/document-preview/image-preview-state.ts",
  "src/platform-ui/components/thread-components/document-preview/pdf-preview-state.ts",
  "src/platform-ui/components/thread-components/document-preview/pdf-preview.tsx",
  "src/platform-ui/components/thread-components/document-preview/preview-state.ts",
  "src/platform-ui/components/thread-components/document-preview/specialized-preview-view.tsx",
  "src/react/thread/live-supervision-dock.tsx",
  "src/react/thread/pending-permissions-dock.tsx",
]) {
  await fs.access(path.join(packageRoot, relativePath));
}
for (const extractedRunnerChatModule of [
  "attachment-preview-chip",
  "attachment-factories",
  "canonical-action-log-index",
  "composer-selector-controls",
  "communicator-router",
  "editable-turn-boundary",
  "execution/active-run-instruction",
  "file-browser-item",
  "permission-decision",
  "public-types",
  "thread-context-action",
  "thread-context-control",
  "timeline-renderer",
  "turn-status-presentation",
  "turn-timeline-state",
  "use-composer-popup-controller",
  "use-composer-quoted-selection",
  "use-document-preview-controller",
  "use-file-browser-navigation",
  "use-file-browser-preview",
  "use-file-browser-source-loaders",
  "use-file-browser-source-state",
  "use-file-browser-attachment-controller",
  "use-file-drop-controller",
  "use-attachment-controller",
  "use-fork-configuration-controller",
  "use-github-branch-selection",
  "use-enabled-skills-controller",
  "use-external-composer-command-staging",
  "use-agent-selection-controller",
  "use-custom-skills-controller",
  "use-deep-research-sessions-controller",
  "use-integration-selection-controller",
  "use-run-stop-controller",
  "use-schedule-controller",
  "use-log-auto-scroll",
  "use-thinking-status",
  "use-thread-feedback-controller",
  "use-thread-history-rail",
  "use-staged-composer-commands",
  "use-thread-context-controller",
  "use-turn-notice-controller",
  "use-workspace-selection-controller",
  "voice-mode-presentation",
]) {
  assert.match(
    runnerChatBudget.source,
    new RegExp(`runner-chat/${extractedRunnerChatModule}\\.js`),
    `RunnerChat must compose the extracted ${extractedRunnerChatModule} module.`,
  );
}
for (const extractedLogRendererModule of [
  "list-files-state",
  "list-files-view",
  "metronome-workflow-view",
  "permission-request-view",
]) {
  assert.match(
    runnerLogBoxesBudget.source,
    new RegExp(`\\./${extractedLogRendererModule}\\.js`),
    `The log renderer must compose the extracted ${extractedLogRendererModule} module.`,
  );
}
for (const extractedDocumentPreviewModule of [
  "directory-preview",
  "image-preview-state",
  "pdf-preview",
  "preview-state",
  "specialized-preview-view",
]) {
  assert.match(
    documentPreviewDrawerBudget.source,
    new RegExp(`\\./${extractedDocumentPreviewModule}\\.js`),
    `The document-preview drawer must compose the extracted ${extractedDocumentPreviewModule} module.`,
  );
}
for (const [relativePath, maxLines] of new Map([
  [
    "src/platform-ui/components/thread-components/document-preview/directory-preview.tsx",
    550,
  ],
  [
    "src/platform-ui/components/thread-components/document-preview/image-preview-state.ts",
    180,
  ],
  [
    "src/platform-ui/components/thread-components/document-preview/pdf-preview.tsx",
    450,
  ],
  [
    "src/platform-ui/components/thread-components/document-preview/pdf-preview-state.ts",
    80,
  ],
  [
    "src/platform-ui/components/thread-components/document-preview/preview-state.ts",
    180,
  ],
  [
    "src/platform-ui/components/thread-components/document-preview/specialized-preview-view.tsx",
    250,
  ],
])) {
  await readSourceBudget(relativePath, maxLines);
}
for (const [viewPath, stateModule] of [
  [
    "src/platform-ui/components/thread-components/document-preview/directory-preview.tsx",
    "preview-state",
  ],
  [
    "src/platform-ui/components/thread-components/document-preview/pdf-preview.tsx",
    "pdf-preview-state",
  ],
]) {
  const viewSource = await fs.readFile(path.join(packageRoot, viewPath), "utf8");
  assert.match(
    viewSource,
    new RegExp(`\\./${stateModule}\\.js`),
    `${viewPath} must consume its extracted state module.`,
  );
}
for (const [relativePath, maxLines] of new Map([
  [
    "src/platform-ui/components/thread-components/log-boxes/list-files-state.ts",
    550,
  ],
  [
    "src/platform-ui/components/thread-components/log-boxes/list-files-view.tsx",
    90,
  ],
  [
    "src/platform-ui/components/thread-components/log-boxes/metronome-workflow-state.ts",
    425,
  ],
  [
    "src/platform-ui/components/thread-components/log-boxes/metronome-workflow-view.tsx",
    325,
  ],
  [
    "src/platform-ui/components/thread-components/log-boxes/permission-request-view.tsx",
    425,
  ],
])) {
  await readSourceBudget(relativePath, maxLines);
}
for (const [viewPath, stateModule] of [
  [
    "src/platform-ui/components/thread-components/log-boxes/list-files-view.tsx",
    "list-files-state",
  ],
  [
    "src/platform-ui/components/thread-components/log-boxes/metronome-workflow-view.tsx",
    "metronome-workflow-state",
  ],
]) {
  const viewSource = await fs.readFile(path.join(packageRoot, viewPath), "utf8");
  assert.match(
    viewSource,
    new RegExp(`\\./${stateModule}\\.js`),
    `${viewPath} must consume its extracted state module.`,
  );
}

for (const modulePath of await collectSourceFiles(path.join(packageRoot, "src", "react", "runner-chat"))) {
  const relativePath = path.relative(packageRoot, modulePath);
  const { source } = await readSourceBudget(relativePath, 1_000);
  assert.doesNotMatch(
    source,
    /from\s+["']\.\.\/runner-chat\.js["']/,
    `${relativePath} must consume leaf contracts instead of importing the RunnerChat composition root.`,
  );
}
for (const modulePath of await collectSourceFiles(path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "thread-components",
  "log-boxes",
))) {
  if (path.basename(modulePath) === "runner-log-boxes.tsx") continue;
  await readSourceBudget(path.relative(packageRoot, modulePath), 3_000);
}
for (const modulePath of await collectSourceFiles(path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "thread-components",
  "document-preview",
))) {
  await readSourceBudget(path.relative(packageRoot, modulePath), 1_800);
}
for (const modulePath of await collectSourceFiles(path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "thread-components",
  "shared",
))) {
  await readSourceBudget(path.relative(packageRoot, modulePath), 800);
}
await readSourceBudget(
  "src/platform-ui/components/ui/dot-loader/platform-dot-loader.tsx",
  100,
);
for (const modulePath of await collectSourceFiles(path.join(packageRoot, "src", "react", "thread"))) {
  await readSourceBudget(path.relative(packageRoot, modulePath), 600);
}

for (const retiredPath of [
  "examples/demo-server.mjs",
  "examples/served.html",
  "examples/served_inline_check.js",
  "examples/inline_check.js",
  "examples/history-api-test.mjs",
  "examples/metronome-dynamic-content-runtime-test.mjs",
  "examples/realtime-metronome-adapters-test.mjs",
  "examples/smoke-test.mjs",
  "examples/thread-domain-test.mjs",
  "examples/thread-ui-test.mjs",
  "apps/platform/client/legacy/create-legacy-platform-document.mjs",
  "src/react/runner-log-boxes",
  "src/react/assets",
  "apps/platform/client/legacy/domains/onboarding/onboarding.js",
  "apps/platform/client/legacy/domains/skills/skills-page.js",
  "apps/platform/client/legacy/domains/compute-resources/compute-resources-page.js",
  "apps/platform/client/legacy/domains/agents/agents-page.template.js",
  "apps/platform/client/legacy/domains/shell/platform-shell.template.js",
  "apps/platform/client/index.html",
  "apps/platform/client/src",
  "apps/platform/client/tsconfig.json",
  "apps/platform/server/routes/platform-client-route-contract.mjs",
  "src/platform-app",
]) {
  await assert.rejects(
    fs.access(path.join(packageRoot, retiredPath)),
    /ENOENT/,
    `${retiredPath} must stay removed.`,
  );
}

const vitestConfigSource = await fs.readFile(
  path.join(packageRoot, "vitest.config.mjs"),
  "utf8",
);
assert.match(vitestConfigSource, /\*\*\/dist\/\*\*/);
assert.match(vitestConfigSource, /\*\*\/\*\.test\.mjs/);

const platformSources = createLegacyPlatformApplicationSources({
  aiosOrigin: "http://localhost:3001",
  defaultUpstreamOrigin: "https://api.computer-agents.com/v1",
  platformOrigin: "http://localhost:4177",
});
const assets = await createPlatformDocumentAssets(platformSources);
const assembledStyleLines = platformSources.styleSource.split("\n").length;
const assembledModuleLines = platformSources.moduleSource.split("\n").length;

assert.ok(
  assets.metrics.documentBytes <= 10_000,
  `HTML shell exceeded 10 KB (${assets.metrics.documentBytes}).`,
);
assert.ok(
  assets.metrics.cssBrotliBytes <= 250_000,
  `Brotli CSS exceeded 250 KB (${assets.metrics.cssBrotliBytes}).`,
);
assert.ok(
  assets.metrics.moduleBrotliBytes <= 1_500_000,
  `Brotli platform runtime exceeded 1.5 MB (${assets.metrics.moduleBrotliBytes}).`,
);
assert.ok(
  assembledStyleLines <= 76_000,
  `Platform stylesheet exceeded 76,000 assembled lines (${assembledStyleLines}).`,
);
assert.ok(
  assembledModuleLines <= 209_000,
  `Platform browser program exceeded 209,000 assembled lines (${assembledModuleLines}).`,
);

console.log(
  `Platform architecture budgets passed (${serverEntryLines} entry lines, `
  + `${runnerChatBudget.lines} RunnerChat lines, `
  + `${runnerLogBoxesBudget.lines} log-renderer lines, `
  + `${documentPreviewDrawerBudget.lines} document-preview lines, `
  + `${boundedOwnedSourceCount} bounded owned sources, `
  + `${assembledModuleLines} assembled JS lines, `
  + `${assembledStyleLines} assembled CSS lines, `
  + `${assets.metrics.documentBytes}B HTML, `
  + `${assets.metrics.cssBrotliBytes}B CSS br, `
  + `${assets.metrics.moduleBrotliBytes}B JS br).`,
);
