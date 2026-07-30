import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { PROJECT_MILESTONES_RUNTIME_FRAGMENT } from "../project-milestones/runtime.mjs";
import { PROJECT_UPDATES_RUNTIME_FRAGMENT } from "../project-updates/runtime.mjs";
import { PROJECT_SUMMARY_RUNTIME_FRAGMENT } from "../project-summary/runtime.mjs";
import { PROJECT_OVERVIEW_ACTIVITY_ANALYTICS_FRAGMENT } from "./runtime/activity-and-analytics.mjs";
import { PROJECT_OVERVIEW_CONNECTOR_CREDENTIAL_ROUTING_FRAGMENT } from "./runtime/connector-credential-routing.mjs";
import { PROJECT_OVERVIEW_FILES_ACTIVITY_FRAGMENT } from "./runtime/files-and-activity.mjs";
import { PROJECT_OVERVIEW_METRICS_FILES_FRAGMENT } from "./runtime/metrics-files-and-foundation.mjs";
import { PROJECT_OVERVIEW_RESOURCES_CREATORS_FRAGMENT } from "./runtime/resources-and-creators.mjs";
import { PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT } from "./runtime/sidebar-and-composition.mjs";

export const PROJECT_OVERVIEW_SCRIPT_FRAGMENT_PATHS = Object.freeze([
  "runtime/connector-credential-routing.mjs",
  "runtime/metrics-files-and-foundation.mjs",
  "../project-milestones/runtime.mjs",
  "../project-updates/runtime.mjs",
  "../project-summary/runtime.mjs",
  "runtime/files-and-activity.mjs",
  "runtime/activity-and-analytics.mjs",
  "runtime/resources-and-creators.mjs",
  "runtime/sidebar-and-composition.mjs",
]);

export const PROJECT_OVERVIEW_SCRIPT = joinLegacyBrowserSourceFragments([
  PROJECT_OVERVIEW_CONNECTOR_CREDENTIAL_ROUTING_FRAGMENT,
  PROJECT_OVERVIEW_METRICS_FILES_FRAGMENT,
  PROJECT_MILESTONES_RUNTIME_FRAGMENT,
  PROJECT_UPDATES_RUNTIME_FRAGMENT,
  PROJECT_SUMMARY_RUNTIME_FRAGMENT,
  PROJECT_OVERVIEW_FILES_ACTIVITY_FRAGMENT,
  PROJECT_OVERVIEW_ACTIVITY_ANALYTICS_FRAGMENT,
  PROJECT_OVERVIEW_RESOURCES_CREATORS_FRAGMENT,
  PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT,
]);
