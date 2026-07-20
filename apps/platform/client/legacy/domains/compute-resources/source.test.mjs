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
