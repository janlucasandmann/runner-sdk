import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS,
  COMPUTE_RESOURCES_PAGE_SCRIPT,
} from "./source.mjs";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

assert.equal(COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.length, 12);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function PlaygroundEnvironmentsPage/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentServerEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentDatabaseEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderCurrentEnvironmentEditor/);
assert.match(COMPUTE_RESOURCES_PAGE_SCRIPT, /function renderEmbeddedResourcesOverviewSection/);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /React\.createElement\(PlatformCodeEditorWorkspace, \{[\s\S]{0,600}variant: isFunctionServer \? "default" : "full-screen"/,
  "Function code tabs must use the normal workspace while web apps retain the full-screen variant.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /historyControls: \{[\s\S]{0,220}onUndo: handleServerFileEditorUndo,[\s\S]{0,120}onRedo: handleServerFileEditorRedo/,
  "Source code workspaces must expose real Undo and Redo controls.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /isLoadingFiles: isLoadingCurrentServerFiles,[\s\S]{0,120}loadingFilesMessage: "Loading files\.\.\."/,
  "Source code workspaces must delegate file loading feedback to the shared workspace.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const sourceServerCodeSidebarActions = React\.createElement\(PlatformButtonSelector,[\s\S]{0,500}label: "Add File"[\s\S]{0,500}buttonVariant: "secondary"[\s\S]{0,300}buttonSize: "compact"[\s\S]{0,300}popupVariant: "minimal"/,
  "Source code workspaces must use the shared secondary Add File selector and minimal popup.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-server-code-add-file-selector"/,
  "The source-code Add File selector must expose its scoped transparent-background hook.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-servers-code-editor-status-actions"/,
  "Source code tabs must not recreate the legacy Revert and Save footer.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /if \(!\["function", "web_app"\]\.includes\(activeServerKind\)\)[\s\S]{0,500}void loadServerContext\(selectedServerId\)/,
  "Connectable server details must load their runtime context before Settings is opened.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverDetailsRequestRef = useRef\(new Map\(\)\);[\s\S]*?const authoritativeServerDetailIdsRef = useRef\(new Set\(\)\);[\s\S]*?ttlMs: 0,[\s\S]*?priority: "high"/,
  "Server details must use a race-safe, uncached, high-priority request path.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const serverVersionApiClient = useMemo\(\(\) => new RunnerClient\([\s\S]*?cache: "no-store",[\s\S]*?priority: "high"/,
  "Function source versions must load through an uncached, high-priority client.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /buildPlaygroundServerBindingsUrl[\s\S]{0,300}cache: "no-store",[\s\S]{0,120}priority: "high"[\s\S]*?buildPlaygroundServerContextUrl[\s\S]{0,300}cache: "no-store",[\s\S]{0,120}priority: "high"/,
  "Function connections and runtime context must load uncached at high priority.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /if \(authoritativeServerDetailIdsRef\.current\.has\(server\.id\)\) return;/,
  "Overview payloads must not overwrite an authoritative server detail snapshot.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /loadServerAnalytics\(selectedServerId[\s\S]{0,160}\.finally\(\(\) => loadServerDetails\(selectedServerId\)\)/,
  "Operational analytics must never gate the authoritative server configuration.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /void loadServerDetails\(selectedServerId\);[\s\S]{0,500}void loadServerBindings\(selectedServerId\);/,
  "Server details and bindings must start independently on resource selection.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /authoritativeServerBindingIdsRef\.current\.add\(normalizedServerId\);[\s\S]*?if \(!authoritativeServerBindingIdsRef\.current\.has\(normalizedServerId\)\)/,
  "Runtime context must not replace a dedicated authoritative bindings response.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /function preserveAuthoritativeServerOperationalState[\s\S]*?serviceUrl: authoritative\.serviceUrl,[\s\S]*?status: authoritative\.status,[\s\S]*?function mergeAuthoritativeServerRecordWithLoadedVersions/,
  "Version hydration must preserve authoritative deployment state.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const latestServer = current\[normalizedServerId\] \|\| initialServer;[\s\S]*?preserveAuthoritativeServerOperationalState\([\s\S]*?createServerVersionSelectedResource\(\s*current,/,
  "Late version responses must merge with the latest server record instead of a captured list snapshot.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /const abortController = new AbortController\(\);[\s\S]*?fetchServerVersionsApi\(normalizedServerId,[\s\S]*?signal: abortController\.signal[\s\S]*?abortController\.abort\(\)/,
  "Obsolete Function source version requests must be cancelled on navigation.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: "Custom domains",[\s\S]{0,220}variant: "minimalistic-ui",[\s\S]{0,220}pagination: false/,
  "Function and web app custom domains must use the embedded minimal PlatformDataTable.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /toolbar: \{\s*title: "Custom Domains",\s*primaryAction: \{\s*label: "Add Domain"/,
  "Custom domains must keep their add action in the centralized table toolbar.",
);
assert.doesNotMatch(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /className: "playground-server-custom-domain-card"/,
  "Custom domains must not recreate legacy card rows outside PlatformDataTable.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /ariaLabel: serverKindLabel \+ " team access",[\s\S]{0,220}variant: "minimalistic-ui",[\s\S]{0,180}pagination: false/,
  "Function and web app access management must use the embedded minimal PlatformDataTable.",
);
assert.match(
  COMPUTE_RESOURCES_PAGE_SCRIPT,
  /toolbar: \{\s*title: isFunctionServer \? "Manage " \+ serverKindLabel \+ " Access" : null,[\s\S]{0,4000}const serverTeamAccessPlatformSection = isFunctionServer\s*\? serverTeamAccessTable/,
  "Function access management must bypass the legacy access-card wrappers and keep its title in the table toolbar.",
);

const serverVersionControllerIndex = COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.indexOf(
  "controller/server-versioning-and-composers.js",
);
const authoritativeServerVersioningIndex = COMPUTE_RESOURCES_CONTROLLER_FRAGMENT_PATHS.indexOf(
  "controller/server-authoritative-versioning.js",
);
assert.ok(
  serverVersionControllerIndex >= 0
  && authoritativeServerVersioningIndex > serverVersionControllerIndex,
  "Authoritative server hooks must run after serverVersionController is initialized.",
);

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
