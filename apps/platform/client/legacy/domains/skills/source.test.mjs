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
  "2a9ddc4d76c6ff15fed9478ae5289a0d46e9a72354eae118fd1164c5a19cf782",
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
assert.match(
  SKILLS_PAGE_SCRIPT,
  /const isRestoringRequestedSkill = requestedAction === "open"[\s\S]{0,260}!skillsLoaded \|\| skillsLoading[\s\S]{0,120}if \(isRestoringRequestedSkill\)[\s\S]{0,80}return;/,
  "Restored Skill deep links must remain in detail mode while their asynchronous catalog entry hydrates.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /const isRestoredSkillSelection = requestedAction === "open"[\s\S]{0,220}requestedSkillId === selectedSkillId[\s\S]{0,180}openSkillRequest\?\.skillTab === "settings"[\s\S]{0,80}\? "settings"[\s\S]{0,80}: "code"/,
  "A restored Skill selection must preserve its Settings tab so nested access details can remount.",
);
assert.match(SKILLS_PAGE_SCRIPT, /usePlatformVersionNavigationGuard/);
assert.match(SKILLS_PAGE_SCRIPT, /createAndOpenCustomSkill\(\)/);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /function hasSelectedSkillVersionChanges\(\)[\s\S]*!\s*getSelectedSkillSaveName\(\)/,
  "New skills must remain unsaveable until they have a non-empty name.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /function getSelectedSkillVersion\(targetSkill = selectedSkill\)[\s\S]{0,420}skillVersionState\.skillId[\s\S]{0,120}targetSkill\.id[\s\S]{0,120}return null;/,
  "Skill version lookup must reject a stale baseline from a previously opened Skill.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /function hasSelectedSkillVersionChanges\(\)[\s\S]{0,420}selectedSkill\.isDraft[\s\S]{0,240}skillVersionState\.status === "ready"[\s\S]{0,180}skillVersionState\.skillId[\s\S]{0,160}selectedSkill\.id[\s\S]{0,120}getSelectedSkillVersion\(\)[\s\S]{0,180}if \(!selectedSkillVersionBaselineReady\)[\s\S]{0,80}return false;/,
  "Existing Skills must stay clean until their matching authoritative version baseline is ready.",
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
  /async function createSkillSourceFile\(\)[\s\S]*?let normalizedPath = "untitled\.js";[\s\S]*?return nextFile\.id;/,
  "New skill source files must return their id so the shared editor can focus inline naming.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /async function renameSkillWorkspaceEntry\(workspaceFile, nextLabel\)[\s\S]*?normalizeHistoryPath\(nextLabel\)/,
  "Skill source renames must persist the shared editor's inline label.",
);
assert.doesNotMatch(
  SKILLS_PAGE_SCRIPT,
  /window\.prompt\("File path"/,
  "Creating a skill source file must start inline naming instead of opening a browser prompt.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]*src: COMPUTER_AGENTS_CREATOR_PROFILE_URL/,
);
assert.doesNotMatch(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]{0,300}src: RUNNER_TRANSPARENT_LOGO_URL/,
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /const \[skillOverviewScope, setSkillOverviewScope\] = useState\("all"\)[\s\S]*const scopedOverviewSkills = useMemo[\s\S]*normalizedScope === "created"[\s\S]*!isCreatedByCurrentUser/,
  "Skill overview scope must separate custom Skills created by the viewer from Skills shared with them.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /const rows = scopedOverviewSkills\.map[\s\S]{0,240}getSelectedSkillOwnerIdentity\(skill\)[\s\S]{0,1400}ownerName: String\(ownerIdentity\?\.name[\s\S]{0,200}ownerAvatarUrl: String\(ownerIdentity\?\.avatarUrl/,
  "Skill overview rows must carry the authoritative owner identity.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /React\.createElement\(SkillsOverviewPage,[\s\S]{0,900}selection: \{[\s\S]{0,120}enabled: true,[\s\S]{0,160}ariaLabel: \(skill\) => `Select \$\{skill\.name\}`/,
  "The Skills overview must enable the centralized multi-row selection column.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /const explicitOwnerName = readSkillCreatorString\(\[nestedOwner\],[\s\S]{0,180}\) \|\| readSkillCreatorString\(\[skill, metadata\], \[[\s\S]{0,80}"ownerName"/,
  "Skill owner resolution must never treat the Skill name as the owner's user name.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /React\.createElement\(PlatformResourceHeaderActions[\s\S]{0,180}React\.createElement\(PlatformResourceActionsMenu,[\s\S]{0,300}resourceLabel: "Skill"[\s\S]{0,900}React\.createElement\(PlatformResourceActionsInformation[\s\S]{0,1400}PlatformResourceVersionHistoryMenuItem/,
  "Skill title actions must use the same centralized resource action menu as Test details.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /React\.createElement\(PlatformServiceDetailPropertyList[\s\S]{0,1500}label: "Creator"[\s\S]{0,1500}label: "Owner"/,
  "Skill Settings must use the centralized service detail property list for its sidebar.",
);
assert.doesNotMatch(
  SKILLS_PAGE_SCRIPT,
  /React\.createElement\(PlatformServiceDetailProperty, \{[\s\S]{0,120}label: "Region"/,
  "Skill Settings must not repeat deployment region in its properties sidebar.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /label: "Owner"[\s\S]{0,700}React\.createElement\(PlatformOwnerSelector,[\s\S]{0,900}onTransfer: transferSelectedSkillOwner/,
  "Skill Settings must use the centralized owner selector and authoritative transfer flow.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /React\.createElement\(PlatformPrimaryButton,[\s\S]{0,500}onClick: \(\) => onTestSkill\?\.\(selectedSkill\)[\s\S]{0,100}"Test Skill"/,
  "Skill Settings must expose its full-width Test Skill handoff action.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /\/api\/real\/organizations\/[\s\S]{0,180}\/members\?includeProfiles=1/,
  "The Skill owner selector must load organization members from trusted server state.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /addTeams: selectedSkill\.isCustom[\s\S]{0,200}teams: availableSkillAccessTeams[\s\S]{0,500}onRequestTeams: onWorkspaceTeamsRequest[\s\S]{0,500}onAddTeam: \(team\)/,
  "Skill Settings must delegate Add Teams loading, identity rendering, and mutations to the centralized access component.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /if \(accessDetailFocused\)[\s\S]{0,500}sidebar: null/,
  "A focused Skill access page must omit the ordinary Settings sidebar and deployment map.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /renderSkillSettingsComposition\([\s\S]{0,250}Boolean\(selectedSkillAccessTeam\)/,
  "A selected Skill team must open a focused access page without the Settings sidebar or deployment map.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /React\.createElement\(PlatformResourceAccessSettings, \{[\s\S]{0,500}resourceLabel: "Skill"[\s\S]{0,1800}selectedPrincipalId: skillAccessPrincipalId/,
  "Skill team access must flow through the centralized resource-access detail route.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /teamMembers: workspaceTeamMembers[\s\S]{0,220}teamMembersTeamId: workspaceTeamMembersTeamId[\s\S]{0,300}onRequestTeamMembers:/,
  "Skill team access must hydrate role-member identities for the centralized participant stack.",
);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /onViewTeam: onViewTeam[\s\S]{0,180}onViewTeam\(String\(team\?\.id/,
  "Skill team access must expose the centralized View Team handoff.",
);

console.log("Legacy Skills controller composition passed.");
