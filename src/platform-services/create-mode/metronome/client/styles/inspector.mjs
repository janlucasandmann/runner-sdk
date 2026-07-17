import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { METRONOME_INSPECTOR_CSS_01_FRAGMENT } from "./inspector/01-foundation-and-fields.mjs";
import { METRONOME_INSPECTOR_CSS_02_FRAGMENT } from "./inspector/02-selectors-and-editors.mjs";
import { METRONOME_INSPECTOR_CSS_03_FRAGMENT } from "./inspector/03-modals-and-responsive.mjs";

export const METRONOME_INSPECTOR_CSS_FRAGMENT_PATHS = Object.freeze([
  "inspector/01-foundation-and-fields.mjs",
  "inspector/02-selectors-and-editors.mjs",
  "inspector/03-modals-and-responsive.mjs",
]);

export const METRONOME_INSPECTOR_CSS =
  joinLegacyBrowserSourceFragments([
    METRONOME_INSPECTOR_CSS_01_FRAGMENT,
    METRONOME_INSPECTOR_CSS_02_FRAGMENT,
    METRONOME_INSPECTOR_CSS_03_FRAGMENT,
  ]);
