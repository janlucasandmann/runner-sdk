import { CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS } from "../../../calendar/client/projects-integration/page-shell/index.mjs";
import {
  flattenLegacyBrowserSourceBindings,
  joinLegacyBrowserSourceFragments,
  renderLegacyBrowserSourceTemplate,
} from "../../../../legacy-browser-source.mjs";
import { PROJECTS_SHELL_01_FRAGMENT } from "./shell/01-state-and-loading.mjs";
import { PROJECTS_CONNECTOR_CREDENTIAL_STATE_FRAGMENT } from "./shell/connector-credential-state.mjs";
import { PROJECTS_SHELL_02_FRAGMENT } from "./shell/02-editor-and-project-state.mjs";
import { PROJECTS_SHELL_03_FRAGMENT } from "./shell/03-derived-task-state.mjs";
import { PROJECTS_SHELL_04_FRAGMENT } from "./shell/04-release-state-and-navigation.mjs";

export const PROJECTS_PAGE_SHELL_FRAGMENT_PATHS = Object.freeze([
  "shell/01-state-and-loading.mjs",
  "shell/02-editor-and-project-state.mjs",
  "shell/03-derived-task-state.mjs",
  "shell/04-release-state-and-navigation.mjs",
  "shell/connector-credential-state.mjs",
]);

const projectsPageShellTemplate = joinLegacyBrowserSourceFragments([
  PROJECTS_SHELL_01_FRAGMENT,
  PROJECTS_SHELL_02_FRAGMENT,
  PROJECTS_SHELL_03_FRAGMENT,
  PROJECTS_SHELL_04_FRAGMENT,
  PROJECTS_CONNECTOR_CREDENTIAL_STATE_FRAGMENT,
]);

export const PROJECTS_PAGE_SHELL_SCRIPT =
  renderLegacyBrowserSourceTemplate(
    projectsPageShellTemplate,
    flattenLegacyBrowserSourceBindings(
      CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS,
      "CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS",
    ),
  );
