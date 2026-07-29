import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));
export const SKILLS_CONTROLLER_FRAGMENT_PATHS = Object.freeze([
  "controller/01-state-and-data.js",
  "controller/02-actions-and-editors.js",
  "controller/03-title-actions-and-sharing.js",
  "controller/03-detail-identity-and-settings.js",
  "controller/03-rendering-and-composition.js",
  "controller/03-versioning-and-shortcuts.js",
]);

/** Quarantined legacy skills controller while typed skill routes take ownership. */
const skillsControllerFragments = SKILLS_CONTROLLER_FRAGMENT_PATHS
  .map((relativePath) => fs.readFileSync(
    path.join(domainRoot, relativePath),
    "utf8",
  ));

const [
  skillStateAndDataSource,
  skillActionsAndEditorsSource,
  skillTitleActionsAndSharingSource,
  skillDetailIdentityAndSettingsSource,
  skillRenderingAndCompositionSource,
  skillVersioningAndShortcutsSource,
] = skillsControllerFragments;
const skillTitleActionsInsertionMarker = "          function renderCurrentSkillDetail() {";
const skillVersioningInsertionMarker = "          function renderSkillEnvironmentFilePicker() {";

if (!skillRenderingAndCompositionSource.includes(skillTitleActionsInsertionMarker)) {
  throw new Error("Skills title-actions insertion boundary is missing.");
}
if (!skillRenderingAndCompositionSource.includes(skillVersioningInsertionMarker)) {
  throw new Error("Skills versioning insertion boundary is missing.");
}

const skillRenderingWithTitleActions = skillRenderingAndCompositionSource.replace(
  skillTitleActionsInsertionMarker,
  skillTitleActionsAndSharingSource
    + skillDetailIdentityAndSettingsSource
    + skillTitleActionsInsertionMarker,
);

export const SKILLS_PAGE_SCRIPT = [
  skillStateAndDataSource,
  skillActionsAndEditorsSource,
  skillRenderingWithTitleActions.replace(
    skillVersioningInsertionMarker,
    skillVersioningAndShortcutsSource + skillVersioningInsertionMarker,
  ),
].join("");
