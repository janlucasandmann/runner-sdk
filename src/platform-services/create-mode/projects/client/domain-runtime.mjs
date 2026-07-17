import {
  CALENDAR_DOMAIN_RUNTIME_SCRIPT,
  CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT,
  CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT,
} from "../../calendar/client/domain/index.mjs";
import {
  joinLegacyBrowserSourceFragments,
  renderLegacyBrowserSourceTemplate,
} from "../../../legacy-browser-source.mjs";
import { PROJECTS_DOMAIN_RUNTIME_01_FRAGMENT } from "./domain-runtime/01-project-and-task-model.mjs";
import { PROJECTS_DOMAIN_RUNTIME_02_FRAGMENT } from "./domain-runtime/02-task-data-and-calendar.mjs";

export const PROJECTS_DOMAIN_RUNTIME_FRAGMENT_PATHS = Object.freeze([
  "domain-runtime/01-project-and-task-model.mjs",
  "domain-runtime/02-task-data-and-calendar.mjs",
]);

const projectsDomainRuntimeTemplate = joinLegacyBrowserSourceFragments([
  PROJECTS_DOMAIN_RUNTIME_01_FRAGMENT,
  PROJECTS_DOMAIN_RUNTIME_02_FRAGMENT,
]);

export const PROJECTS_DOMAIN_RUNTIME_SCRIPT =
  renderLegacyBrowserSourceTemplate(
    projectsDomainRuntimeTemplate,
    {
      CALENDAR_DOMAIN_RUNTIME_SCRIPT,
      CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT,
      CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT,
    },
  );
