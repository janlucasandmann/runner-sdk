import { CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS } from "../../../calendar/client/projects-integration/page-data/index.mjs";
import {
  flattenLegacyBrowserSourceBindings,
  joinLegacyBrowserSourceFragments,
  renderLegacyBrowserSourceTemplate,
} from "../../../../legacy-browser-source.mjs";
import { PROJECTS_DATA_01_FRAGMENT } from "./data/01-project-and-attachment-data.mjs";
import { PROJECTS_DATA_02_FRAGMENT } from "./data/02-editor-and-file-data.mjs";
import { PROJECTS_DATA_03_FRAGMENT } from "./data/03-project-persistence.mjs";
import { PROJECTS_DATA_04_FRAGMENT } from "./data/04-task-overlay-lifecycle.mjs";

export const PROJECTS_PAGE_DATA_FRAGMENT_PATHS = Object.freeze([
  "data/01-project-and-attachment-data.mjs",
  "data/02-editor-and-file-data.mjs",
  "data/03-project-persistence.mjs",
  "data/04-task-overlay-lifecycle.mjs",
]);

const projectsPageDataTemplate = joinLegacyBrowserSourceFragments([
  PROJECTS_DATA_01_FRAGMENT,
  PROJECTS_DATA_02_FRAGMENT,
  PROJECTS_DATA_03_FRAGMENT,
  PROJECTS_DATA_04_FRAGMENT,
]);

export const PROJECTS_PAGE_DATA_SCRIPT =
  renderLegacyBrowserSourceTemplate(
    projectsPageDataTemplate,
    flattenLegacyBrowserSourceBindings(
      CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS,
      "CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS",
    ),
  );
