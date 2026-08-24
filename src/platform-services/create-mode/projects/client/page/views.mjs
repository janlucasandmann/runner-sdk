import { CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS } from "../../../calendar/client/projects-integration/page-views/index.mjs";
import {
  flattenLegacyBrowserSourceBindings,
  joinLegacyBrowserSourceFragments,
  renderLegacyBrowserSourceTemplate,
} from "../../../../legacy-browser-source.mjs";
import { PROJECT_OVERVIEW_SCRIPT } from "../overview/index.mjs";
import { PROJECTS_VIEWS_01_FRAGMENT } from "./views/01-project-and-backlog-views.mjs";
import { PROJECTS_VIEWS_02_FRAGMENT } from "./views/02-project-details-and-calendar.mjs";
import { PROJECTS_VIEWS_03_FRAGMENT } from "./views/03-overview-and-task-previews.mjs";
import { PROJECTS_VIEWS_04_FRAGMENT } from "./views/04-task-detail-and-modals.mjs";
import { PROJECT_ACTIVITY_CARD_SCRIPT } from "./views/project-activity-card.mjs";
import { PROJECT_ACTIVITY_FILTER_SCRIPT } from "./views/project-activity-filter.mjs";
import { PROJECT_ACTIVITY_LINE_SCRIPT } from "./views/project-activity-line.mjs";
import { PROJECT_ACTIVITY_LIST_SCRIPT } from "./views/project-activity-list.mjs";
import { PROJECT_ACTIVITY_RANGE_SCRIPT } from "./views/project-activity-range.mjs";

export const PROJECTS_PAGE_VIEWS_FRAGMENT_PATHS = Object.freeze([
  "views/01-project-and-backlog-views.mjs",
  "views/02-project-details-and-calendar.mjs",
  "views/03-overview-and-task-previews.mjs",
  "views/04-task-detail-and-modals.mjs",
]);

const projectsPageViewsTemplate = joinLegacyBrowserSourceFragments([
  PROJECTS_VIEWS_01_FRAGMENT,
  PROJECTS_VIEWS_02_FRAGMENT,
  PROJECTS_VIEWS_03_FRAGMENT,
  PROJECTS_VIEWS_04_FRAGMENT,
]);

export const PROJECTS_PAGE_VIEWS_SCRIPT =
  renderLegacyBrowserSourceTemplate(
    projectsPageViewsTemplate,
    {
      ...flattenLegacyBrowserSourceBindings(
        CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS,
        "CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS",
      ),
      PROJECT_ACTIVITY_CARD_SCRIPT,
      PROJECT_ACTIVITY_FILTER_SCRIPT,
      PROJECT_ACTIVITY_LINE_SCRIPT,
      PROJECT_ACTIVITY_LIST_SCRIPT,
      PROJECT_ACTIVITY_RANGE_SCRIPT,
      PROJECT_OVERVIEW_SCRIPT,
    },
  );
