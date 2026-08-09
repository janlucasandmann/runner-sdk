import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";

import {
  SKILLS_CONTROLLER_FRAGMENT_PATHS,
  SKILLS_PAGE_SCRIPT,
} from "./source.mjs";

assert.deepEqual(
  SKILLS_CONTROLLER_FRAGMENT_PATHS,
  [
    "controller/01-state-and-data.js",
    "controller/02-actions-and-editors.js",
    "controller/03-title-actions-and-sharing.js",
    "controller/03-detail-identity-and-settings.js",
    "controller/03-rendering-and-composition.js",
    "controller/03-versioning-and-shortcuts.js",
  ],
);
assert.equal(
  createHash("sha256").update(SKILLS_PAGE_SCRIPT).digest("hex"),
  "d0d98dfbe04c4078b75427029afb536701ab4609470de388d998bdcb27635b9e",
  "The Skills fragment composition must remain byte-compatible with the reviewed controller.",
);

const skillsControllerAst = parse(SKILLS_PAGE_SCRIPT, {
  ecmaVersion: "latest",
  sourceType: "script",
});
const skillsPageController = skillsControllerAst.body.find((node) =>
  node.type === "FunctionDeclaration"
  && node.id?.name === "PlaygroundSkillsPage"
);
assert.ok(skillsPageController, "The composed Skills controller must define PlaygroundSkillsPage.");
const directSkillControllerFunctions = new Set(
  skillsPageController.body.body
    .filter((node) => node.type === "FunctionDeclaration")
    .map((node) => node.id?.name),
);
for (const functionName of [
  "getSelectedSkillSaveName",
  "buildSkillVersionDiffFilesFromSnapshots",
  "renderSkillIdentitySection",
  "renderSkillSettingsComposition",
  "renderSkillTitleActions",
  "renderSkillSendToTeamModal",
  "renderSkillVersionChangesSurface",
  "renderSkillVersionEditDialog",
  "renderSkillVersionSaveDialog",
]) {
  assert.ok(
    directSkillControllerFunctions.has(functionName),
    `${functionName} must remain in PlaygroundSkillsPage component scope.`,
  );
}

assert.match(SKILLS_PAGE_SCRIPT, /requestedAction === "create"/);
assert.match(SKILLS_PAGE_SCRIPT, /usePlatformVersionNavigationGuard/);
assert.match(SKILLS_PAGE_SCRIPT, /createAndOpenCustomSkill\(\)/);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /function hasSelectedSkillVersionChanges\(\)[\s\S]*!\s*getSelectedSkillSaveName\(\)/,
  "New skills must remain unsaveable until they have a non-empty name.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /permissionSet: selectedSkill\.permissionSet \|\| null/,
  "New skill payloads must not send an undefined permissionSet to Firestore.",
);
assert.doesNotMatch(
  SKILLS_PAGE_SCRIPT,
  /Untitled Skill/,
  "New skills must not silently substitute a name when saved.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]*src: COMPUTER_AGENTS_CREATOR_PROFILE_URL/,
);
assert.doesNotMatch(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]{0,300}src: RUNNER_TRANSPARENT_LOGO_URL/,
);

console.log("Legacy Skills controller composition passed.");
