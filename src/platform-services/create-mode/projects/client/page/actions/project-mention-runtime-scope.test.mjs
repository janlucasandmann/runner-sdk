import assert from "node:assert/strict";

import { PROJECTS_ACTIONS_01_FRAGMENT } from "./01-draft-and-task-actions.mjs";
import { PROJECTS_PAGE_RUNTIME_SCRIPT } from "../../page-runtime.mjs";
import { PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT } from "../../project-activity-feed/runtime.mjs";
import { PROJECT_UPDATES_RUNTIME_FRAGMENT } from "../../project-updates/runtime.mjs";

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

console.log("Project mention runtime scope checks passed.");
