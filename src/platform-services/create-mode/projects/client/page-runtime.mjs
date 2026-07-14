import { PROJECTS_PAGE_ACTIONS_SCRIPT } from "./page/actions.mjs";
import { PROJECTS_PAGE_CONNECTORS_SCRIPT } from "./page/connectors.mjs";
import { PROJECTS_PAGE_DATA_SCRIPT } from "./page/data.mjs";
import { PROJECTS_PAGE_SHELL_SCRIPT } from "./page/shell.mjs";
import { PROJECTS_PAGE_VIEWS_SCRIPT } from "./page/views.mjs";

export const PROJECTS_PAGE_RUNTIME_SCRIPT = [
  PROJECTS_PAGE_SHELL_SCRIPT,
  PROJECTS_PAGE_DATA_SCRIPT,
  PROJECTS_PAGE_ACTIONS_SCRIPT,
  PROJECTS_PAGE_CONNECTORS_SCRIPT,
  PROJECTS_PAGE_VIEWS_SCRIPT,
].join("");
