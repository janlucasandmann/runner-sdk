import { CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS } from "../../../calendar/client/projects-integration/page-actions/index.mjs";
import {
  flattenLegacyBrowserSourceBindings,
  joinLegacyBrowserSourceFragments,
  renderLegacyBrowserSourceTemplate,
} from "../../../../legacy-browser-source.mjs";
import { PROJECTS_ACTIONS_01_FRAGMENT } from "./actions/01-draft-and-task-actions.mjs";
import { PROJECTS_ACTIONS_02_FRAGMENT } from "./actions/02-autosave-and-project-actions.mjs";
import { PROJECTS_ACTIONS_03_FRAGMENT } from "./actions/03-teams-and-mission-control.mjs";
import { PROJECTS_ACTIONS_04_FRAGMENT } from "./actions/04-task-lifecycle.mjs";
import { PROJECTS_ACTIONS_05_FRAGMENT } from "./actions/05-reviews-and-full-auto.mjs";

export const PROJECTS_PAGE_ACTIONS_FRAGMENT_PATHS = Object.freeze([
  "actions/01-draft-and-task-actions.mjs",
  "actions/02-autosave-and-project-actions.mjs",
  "actions/03-teams-and-mission-control.mjs",
  "actions/04-task-lifecycle.mjs",
  "actions/05-reviews-and-full-auto.mjs",
]);

const projectsPageActionsTemplate = joinLegacyBrowserSourceFragments([
  PROJECTS_ACTIONS_01_FRAGMENT,
  PROJECTS_ACTIONS_02_FRAGMENT,
  PROJECTS_ACTIONS_03_FRAGMENT,
  PROJECTS_ACTIONS_04_FRAGMENT,
  PROJECTS_ACTIONS_05_FRAGMENT,
]);

export const PROJECTS_PAGE_ACTIONS_SCRIPT =
  renderLegacyBrowserSourceTemplate(
    projectsPageActionsTemplate,
    flattenLegacyBrowserSourceBindings(
      CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS,
      "CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS",
    ),
  );
