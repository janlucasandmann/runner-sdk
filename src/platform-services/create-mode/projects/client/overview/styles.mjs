import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { PROJECT_OVERVIEW_CSS_01_FRAGMENT } from "./styles/01-foundation.mjs";
import { PROJECT_OVERVIEW_CSS_02_FRAGMENT } from "./styles/02-analytics-and-charts.mjs";
import { PROJECT_OVERVIEW_CSS_03_FRAGMENT } from "./styles/03-resources-and-tables.mjs";
import { PROJECT_OVERVIEW_CSS_04_FRAGMENT } from "./styles/04-sidebar-and-responsive.mjs";

export const PROJECT_OVERVIEW_CSS_FRAGMENT_PATHS = Object.freeze([
  "styles/01-foundation.mjs",
  "styles/02-analytics-and-charts.mjs",
  "styles/03-resources-and-tables.mjs",
  "styles/04-sidebar-and-responsive.mjs",
]);

export const PROJECT_OVERVIEW_CSS = joinLegacyBrowserSourceFragments([
  PROJECT_OVERVIEW_CSS_01_FRAGMENT,
  PROJECT_OVERVIEW_CSS_02_FRAGMENT,
  PROJECT_OVERVIEW_CSS_03_FRAGMENT,
  PROJECT_OVERVIEW_CSS_04_FRAGMENT,
]);
