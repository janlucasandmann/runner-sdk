import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { METRONOME_WORKFLOW_DOMAIN_01_FRAGMENT } from "./workflow-domain/01-workflow-model-and-sharing.mjs";
import { METRONOME_WORKFLOW_DOMAIN_02_FRAGMENT } from "./workflow-domain/02-graph-runs-and-api.mjs";
import { METRONOME_WORKFLOW_DOMAIN_03_FRAGMENT } from "./workflow-domain/03-version-comparison.mjs";

export const METRONOME_WORKFLOW_DOMAIN_FRAGMENT_PATHS = Object.freeze([
  "workflow-domain/01-workflow-model-and-sharing.mjs",
  "workflow-domain/02-graph-runs-and-api.mjs",
  "workflow-domain/03-version-comparison.mjs",
]);

export const METRONOME_WORKFLOW_DOMAIN_RUNTIME_SCRIPT =
  joinLegacyBrowserSourceFragments([
    METRONOME_WORKFLOW_DOMAIN_01_FRAGMENT,
    METRONOME_WORKFLOW_DOMAIN_02_FRAGMENT,
    METRONOME_WORKFLOW_DOMAIN_03_FRAGMENT,
  ]);
