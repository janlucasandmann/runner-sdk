import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { METRONOME_INSPECTOR_01_FRAGMENT } from "./inspector/01-rich-fields.mjs";
import { METRONOME_INSPECTOR_02_FRAGMENT } from "./inspector/02-triggers-and-conditions.mjs";
import { METRONOME_INSPECTOR_03_FRAGMENT } from "./inspector/03-agent-and-resource-settings.mjs";
import { METRONOME_INSPECTOR_04_FRAGMENT } from "./inspector/04-integration-and-composition.mjs";

export const METRONOME_PAGE_INSPECTOR_FRAGMENT_PATHS = Object.freeze([
  "inspector/01-rich-fields.mjs",
  "inspector/02-triggers-and-conditions.mjs",
  "inspector/03-agent-and-resource-settings.mjs",
  "inspector/04-integration-and-composition.mjs",
]);

export const METRONOME_PAGE_INSPECTOR_SCRIPT =
  joinLegacyBrowserSourceFragments([
    METRONOME_INSPECTOR_01_FRAGMENT,
    METRONOME_INSPECTOR_02_FRAGMENT,
    METRONOME_INSPECTOR_03_FRAGMENT,
    METRONOME_INSPECTOR_04_FRAGMENT,
  ]);
