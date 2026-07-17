import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { METRONOME_TEMPLATES_01_FRAGMENT } from "./templates-and-graph/01-palette-and-graph.mjs";
import { METRONOME_TEMPLATES_02_FRAGMENT } from "./templates-and-graph/02-workflow-templates.mjs";

export const METRONOME_TEMPLATES_FRAGMENT_PATHS = Object.freeze([
  "templates-and-graph/01-palette-and-graph.mjs",
  "templates-and-graph/02-workflow-templates.mjs",
]);

export const METRONOME_TEMPLATES_RUNTIME_SCRIPT =
  joinLegacyBrowserSourceFragments([
    METRONOME_TEMPLATES_01_FRAGMENT,
    METRONOME_TEMPLATES_02_FRAGMENT,
  ]);
