import assert from "node:assert/strict";
import fs from "node:fs";

import { PROJECTS_ACTIONS_01_FRAGMENT } from "./01-draft-and-task-actions.mjs";
import { PROJECTS_PAGE_RUNTIME_SCRIPT } from "../../page-runtime.mjs";
import { PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT } from "../../project-activity-feed/runtime.mjs";
import { PROJECT_UPDATES_RUNTIME_FRAGMENT } from "../../project-updates/runtime.mjs";

const shellThreadLifecycleSource = fs.readFileSync(new URL(
  "../../../../../../../apps/platform/client/legacy/domains/shell/controller/data-lifecycle-and-navigation.template.js",
  import.meta.url,
), "utf8");
const shellCompositionSource = fs.readFileSync(new URL(
  "../../../../../../../apps/platform/client/legacy/domains/shell/controller/composition-and-modals.template.js",
  import.meta.url,
), "utf8");

const definition = "function getProjectMentionComposerProps()";
const ticketDetailCall = "...getProjectMentionComposerProps(),";

assert.match(PROJECTS_ACTIONS_01_FRAGMENT, new RegExp(definition.replace(/[()]/g, "\\$&")));
assert.doesNotMatch(
  PROJECT_UPDATES_RUNTIME_FRAGMENT,
  new RegExp(definition.replace(/[()]/g, "\\$&")),
  "The mention composer contract must not be nested inside renderProjectOverviewView.",
);
assert.ok(
  PROJECTS_PAGE_RUNTIME_SCRIPT.indexOf(definition)
    < PROJECTS_PAGE_RUNTIME_SCRIPT.indexOf(ticketDetailCall),
  "The shared mention composer contract must be declared before ticket-detail views use it.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /function getLocalProjectMentionCandidates\(\)/,
  "Mention options must include locally loaded project people and agents immediately.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /Array\.isArray\(sortedAgents\)/,
  "Mention options must include the loaded agent catalog.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /\["loading", "ready", "error"\]\.includes/,
  "A completed mention request must remain terminal instead of refetching on every render.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /\/mention-candidates/,
  "Mention candidates must use the project-scoped endpoint.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /mentionManageLabel: "Manage Access"/,
  "Mention composers must expose project access from their shared footer.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /setProjectOverviewHomeTab\("permissions"\)/,
  "The Manage Access footer must navigate to project access settings.",
);
assert.doesNotMatch(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /\.slice\(0,\s*12\)/,
  "Project mention options must not silently truncate accessible identities.",
);
assert.match(
  PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT,
  /ariaLabel: "Timeline event comment",[\s\S]*?autoFocus: true/,
  "Opening a timeline-card comment composer must focus it immediately.",
);
assert.match(
  PROJECT_UPDATES_RUNTIME_FRAGMENT,
  /ariaLabel: "Project update comment",[\s\S]*?autoFocus: true/,
  "Opening a project-update comment composer must focus it immediately.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /function reconcileProjectMentionDispatches\(responseData, options = \{\}\)/,
  "Structured Agent mentions must share one sidebar reconciliation path.",
);
assert.match(
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  /onBackgroundThreadCreated,[\s\S]*?function reconcileProjectMentionDispatches/,
  "The project page must receive an explicit background-Thread registration boundary.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /onBackgroundThreadCreated\(threadId, \{[\s\S]*?threadRecord,[\s\S]*?status: "queued"/,
  "Agent mention Threads must be registered immediately through the shell-owned sidebar boundary.",
);
assert.doesNotMatch(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /typeof (?:upsertRealThreadRecord|refreshThreads)/,
  "The project page must not silently depend on shell-local Thread functions outside its scope.",
);
assert.match(
  shellThreadLifecycleSource,
  /const handleBackgroundThreadCreated = useCallback[\s\S]*?upsertRealThreadRecord\(threadRecord,[\s\S]*?refreshThreads\(undefined, normalizedThreadId, \{ silent: true \}\)/,
  "The shell must insert background Threads immediately and reconcile them silently.",
);
assert.match(
  shellThreadLifecycleSource,
  /optimisticExecutionAdmission:\s*\{[\s\S]*?source:\s*"background_dispatch"[\s\S]*?registeredAt/,
  "Background Thread admission must retain an explicit local lifecycle marker while the durable worker is still queued.",
);
assert.match(
  shellThreadLifecycleSource,
  /getOptimisticThreadExecutionAdmission\(thread\)[\s\S]*?loadThreadGroundTruthStatus\(threadId\)[\s\S]*?setTimeout\(reconcileOptimisticThreads, 1000\)/,
  "Optimistic background Threads must reconcile independently of opening the Thread page.",
);
assert.equal(
  Array.from(shellCompositionSource.matchAll(/onBackgroundThreadCreated: handleBackgroundThreadCreated/g)).length,
  2,
  "Both full-page and drawer Project surfaces must receive the background-Thread boundary.",
);
assert.match(
  PROJECTS_ACTIONS_01_FRAGMENT,
  /reconcileProjectMentionDispatches\(data, \{[\s\S]*?type: "ticket_comment"/,
  "Ticket comments must surface dispatched Agent Threads immediately.",
);
assert.match(
  PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT,
  /reconcileProjectMentionDispatches\(data, \{[\s\S]*?type: "project_activity_comment"/,
  "Timeline comments must surface dispatched Agent Threads immediately.",
);
assert.match(
  PROJECT_UPDATES_RUNTIME_FRAGMENT,
  /reconcileProjectMentionDispatches\(data, \{[\s\S]*?type: "project_update"/,
  "Project updates must surface dispatched Agent Threads immediately.",
);
assert.match(
  PROJECT_UPDATES_RUNTIME_FRAGMENT,
  /reconcileProjectMentionDispatches\(data, \{[\s\S]*?type: "project_update_comment"/,
  "Project-update comments must surface dispatched Agent Threads immediately.",
);

console.log("Project mention runtime scope checks passed.");
