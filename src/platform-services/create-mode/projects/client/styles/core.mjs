import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { PROJECTS_CORE_CSS_01_FRAGMENT } from "./core/01-page-and-navigation.mjs";
import { PROJECTS_CORE_CSS_02_FRAGMENT } from "./core/02-task-and-editor.mjs";
import { PROJECTS_CORE_CSS_03_FRAGMENT } from "./core/03-dialogs-and-mission-control.mjs";

export const PROJECTS_CORE_CSS_FRAGMENT_PATHS = Object.freeze([
  "core/01-page-and-navigation.mjs",
  "core/02-task-and-editor.mjs",
  "core/03-dialogs-and-mission-control.mjs",
]);

export const PROJECTS_CORE_CSS = joinLegacyBrowserSourceFragments([
  PROJECTS_CORE_CSS_01_FRAGMENT,
  PROJECTS_CORE_CSS_02_FRAGMENT,
  PROJECTS_CORE_CSS_03_FRAGMENT,
]);
