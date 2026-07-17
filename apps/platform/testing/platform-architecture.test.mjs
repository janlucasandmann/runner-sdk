import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createLegacyPlatformApplication } from "../client/legacy/create-legacy-platform-application.mjs";
import { createPlatformDocumentAssets } from "../server/platform-assets.mjs";

const platformRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const packageRoot = path.resolve(platformRoot, "../..");
const serverEntryPath = path.join(platformRoot, "server", "index.mjs");
const serverEntrySource = await fs.readFile(serverEntryPath, "utf8");
const serverEntryLines = serverEntrySource.split("\n").length;
const legacyDocumentPath = path.join(
  platformRoot,
  "client",
  "legacy",
  "create-legacy-platform-document.mjs",
);
const legacyDocumentSource = await fs.readFile(legacyDocumentPath, "utf8");
const legacyDocumentLines = legacyDocumentSource.split("\n").length;
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
  legacyDocumentLines <= 55_000,
  `Legacy document renderer exceeded 55,000 lines (${legacyDocumentLines}).`,
);
assert.doesNotMatch(legacyDocumentSource, /function PlaygroundEnvironmentsPage/);
assert.doesNotMatch(legacyDocumentSource, /function PlaygroundAgentsPage/);
assert.doesNotMatch(legacyDocumentSource, /function PlaygroundSkillsPage/);
assert.doesNotMatch(legacyDocumentSource, /function LegacyPlatformApp/);
assert.doesNotMatch(serverEntrySource, /<!doctype html>/i);
assert.doesNotMatch(serverEntrySource, /async function proxyUpstream/);
assert.doesNotMatch(serverEntrySource, /url\.pathname\.match/);
assert.match(serverEntrySource, /createLegacyPlatformApplication/);
assert.match(serverEntrySource, /createPlatformGateway/);
assert.match(serverEntrySource, /createPlatformRequestHandler/);

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

const runnerChatBudget = await readSourceBudget("src/react/runner-chat.tsx", 12_000);
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
  "src/react/runner-chat/canonical-action-log-index.ts",
  "src/react/runner-chat/canonical-thread-surface.tsx",
  "src/react/runner-chat/file-browser-dialog.tsx",
  "src/react/runner-chat/file-browser-source.ts",
  "src/react/runner-chat/legacy-timeline.ts",
  "src/react/runner-chat/legacy-timeline-presentation.ts",
  "src/react/runner-chat/public-types.ts",
  "src/react/runner-chat/thread-history.ts",
  "src/react/runner-chat/turn-status-presentation.ts",
  "src/react/runner-chat/turn-timeline-state.ts",
  "src/react/runner-chat/use-log-auto-scroll.ts",
  "src/react/runner-chat/use-thinking-status.ts",
  "src/react/runner-chat/use-thread-history-rail.ts",
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
  "canonical-action-log-index",
  "public-types",
  "turn-status-presentation",
  "turn-timeline-state",
  "use-log-auto-scroll",
  "use-thinking-status",
  "use-thread-history-rail",
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
for (const modulePath of await collectSourceFiles(path.join(packageRoot, "src", "react", "thread"))) {
  await readSourceBudget(path.relative(packageRoot, modulePath), 600);
}

for (const retiredPath of [
  "examples/demo-server.mjs",
  "examples/served.html",
  "examples/served_inline_check.js",
  "examples/inline_check.js",
  "src/react/runner-log-boxes",
  "apps/platform/client/legacy/domains/compute-resources/compute-resources-page.js",
  "apps/platform/client/legacy/domains/agents/agents-page.template.js",
  "apps/platform/client/legacy/domains/shell/platform-shell.template.js",
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

const documentHtml = createLegacyPlatformApplication({
  aiosOrigin: "http://localhost:3001",
  defaultUpstreamOrigin: "https://api.computer-agents.com/v1",
  platformOrigin: "http://localhost:4177",
});
const assets = createPlatformDocumentAssets(documentHtml);

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
  `Brotli compatibility runtime exceeded 1.5 MB (${assets.metrics.moduleBrotliBytes}).`,
);

console.log(
  `Platform architecture budgets passed (${serverEntryLines} entry lines, `
  + `${runnerChatBudget.lines} RunnerChat lines, `
  + `${runnerLogBoxesBudget.lines} log-renderer lines, `
  + `${documentPreviewDrawerBudget.lines} document-preview lines, `
  + `${assets.metrics.documentBytes}B HTML, `
  + `${assets.metrics.cssBrotliBytes}B CSS br, `
  + `${assets.metrics.moduleBrotliBytes}B JS br).`,
);
