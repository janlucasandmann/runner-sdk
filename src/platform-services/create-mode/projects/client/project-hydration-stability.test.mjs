import assert from "node:assert/strict";

import { PROJECTS_DOMAIN_RUNTIME_SCRIPT } from "./domain-runtime.mjs";
import { PROJECTS_DATA_03_FRAGMENT } from "./page/data/03-project-persistence.mjs";
import { PROJECTS_SHELL_01_FRAGMENT } from "./page/shell/01-state-and-loading.mjs";
import { PROJECTS_VIEWS_03_FRAGMENT } from "./page/views/03-overview-and-task-previews.mjs";
import { PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT } from "./overview/runtime/sidebar-and-composition.mjs";
import { PROJECT_UPDATES_RUNTIME_FRAGMENT } from "./project-updates/runtime.mjs";

const scopeStart = PROJECTS_DOMAIN_RUNTIME_SCRIPT.indexOf("const PLAYGROUND_PROJECT_RECORD_SCOPE_RANK");
const scopeEnd = PROJECTS_DOMAIN_RUNTIME_SCRIPT.indexOf("function parsePlaygroundProjectListResponse", scopeStart);
assert.ok(scopeStart >= 0 && scopeEnd > scopeStart, "project record scope helpers must remain in the assembled runtime");

const scopeHelpers = Function(
  `"use strict";\n${PROJECTS_DOMAIN_RUNTIME_SCRIPT.slice(scopeStart, scopeEnd)}\nreturn {\n`
    + "getPlaygroundProjectRecordScope,\n"
    + "getPlaygroundProjectRecordScopeRank,\n"
    + "isPlaygroundProjectDetailRecord,\n"
    + "isPlaygroundProjectStableRecord,\n"
    + "};",
)();

assert.equal(scopeHelpers.getPlaygroundProjectRecordScope(null), "unknown");
assert.equal(scopeHelpers.getPlaygroundProjectRecordScope({ id: "project_1" }), "unknown");
assert.equal(scopeHelpers.getPlaygroundProjectRecordScope({ object: "project.overview" }), "overview");
assert.equal(scopeHelpers.getPlaygroundProjectRecordScope({ __projectRecordScope: "navigation" }), "navigation");
assert.equal(scopeHelpers.getPlaygroundProjectRecordScope({ __projectRecordScope: "detail" }), "detail");
assert.equal(scopeHelpers.getPlaygroundProjectRecordScopeRank({ __projectRecordScope: "detail" }), 3);
assert.equal(scopeHelpers.isPlaygroundProjectStableRecord({ __projectRecordScope: "overview" }), true);
assert.equal(scopeHelpers.isPlaygroundProjectStableRecord({ __projectRecordScope: "navigation" }), false);
assert.equal(scopeHelpers.isPlaygroundProjectDetailRecord({ __projectRecordScope: "overview" }), false);
assert.equal(scopeHelpers.isPlaygroundProjectDetailRecord({ __projectRecordScope: "detail" }), true);

assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function parsePlaygroundProjectListResponse[\s\S]*?isOverviewRecord: true,[\s\S]*?__projectRecordScope: "overview"/,
  "list records must be explicitly marked as overview projections",
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function getPlaygroundProjectResponseRecord[\s\S]*?__projectRecordScope:[\s\S]*?\? "overview"[\s\S]*?: "detail"/,
  "detail responses must be distinguished from partial list records",
);
assert.match(
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  /function mergePlaygroundProjectRecordsByFidelity[\s\S]*?preferredRank >= otherRank[\s\S]*?mergePlaygroundProjectRecords\(otherProject, preferredProject\)/,
  "project projections must merge through one fidelity-aware boundary",
);
assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /mergePlaygroundProjectRecordsByFidelity\(detailProject, selectedProjectSnapshot\)/,
  "project selection must prefer the highest-fidelity record",
);
assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /if \(!isPlaygroundProjectDetailRecord\(selectedProject\)\) \{[\s\S]*?return "Loading project\.\.\."/,
  "project titles must not render from partial projections",
);
assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /const mergedProject = mergePlaygroundProjectRecords\(normalizedProject, current\)[\s\S]*?description: current\.description/,
  "authoritative project fields must refresh while preserving only an actively edited description",
);
assert.doesNotMatch(
  PROJECTS_SHELL_01_FRAGMENT,
  /String\(current\.description \|\| ""\) === String\(normalizedProject\.description \|\| ""\)[\s\S]{0,120}return current/,
  "an equal description must not suppress project name or identity hydration",
);
assert.match(
  PROJECTS_DATA_03_FRAGMENT,
  /function hasCachedProjectWorkspace[\s\S]*?isPlaygroundProjectDetailRecord\(project\)/,
  "navigation and overview placeholders must never mask a failed detail load",
);
assert.match(
  PROJECTS_DATA_03_FRAGMENT,
  /mergePlaygroundProjectRecordsByFidelity\(project, existingProject\)/,
  "a later overview refresh must never overwrite authoritative project details",
);
assert.match(
  PROJECTS_DATA_03_FRAGMENT,
  /const \[workGraphResult, releasesResponse, sprintsResponse, threadsResponse, projectResult\] = await Promise\.all/,
  "workspace data and authoritative project config must settle together",
);
assert.match(
  PROJECTS_DATA_03_FRAGMENT,
  /cache: "no-store"/,
  "project detail hydration must bypass stale browser caches",
);
assert.match(
  PROJECTS_VIEWS_03_FRAGMENT,
  /selectedProjectDetailsReady = isPlaygroundProjectDetailRecord\(selectedProject\)[\s\S]*?!selectedProjectDetailsReady/,
  "the project workspace must not render fallback identities while detail hydration is pending",
);
assert.match(
  PROJECT_UPDATES_RUNTIME_FRAGMENT,
  /const hasStoredCreationUpdate =[\s\S]*?if \(hasStoredCreationUpdate\) \{[\s\S]*?return null;/,
  "a persisted creation update must suppress the duplicate synthetic activity line",
);
assert.match(
  PROJECT_UPDATES_RUNTIME_FRAGMENT,
  /isGenericProjectOverviewIdentityName\(explicitAuthorName\)[\s\S]*?projectCreationAuthorName/,
  "legacy generic creation-author labels must yield to resolved project identity",
);
assert.match(
  PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
  /isCurrentOwner \? currentUserName[\s\S]*?resolvedOwnerCandidate\?\.name[\s\S]*?!storedNameIsGeneric/,
  "the owner sidebar must prefer live account identity over generic stored labels",
);
assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /\/owner-candidates[\s\S]*?setProjectOverviewOwnerCandidatesState\(\{[\s\S]*?status: "ready"/,
  "project owner identities must hydrate proactively",
);
assert.doesNotMatch(
  PROJECTS_SHELL_01_FRAGMENT,
  /requestProjectOverviewOwnerCandidates\(/,
  "the stable project shell must not call helpers declared in late view fragments",
);
assert.doesNotMatch(
  PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
  /useEffect\s*\(/,
  "late project overview composition must not introduce conditional React hooks",
);

console.log("Project hydration stability contracts passed.");
