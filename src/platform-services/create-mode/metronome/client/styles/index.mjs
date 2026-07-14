import { METRONOME_EDITOR_CSS } from "./editor.mjs";
import { METRONOME_INSPECTOR_CSS } from "./inspector.mjs";
import { METRONOME_MODALS_CSS } from "./modals.mjs";
import { METRONOME_OVERVIEW_CSS } from "./overview.mjs";
import { METRONOME_RUNS_CSS } from "./runs.mjs";

export const METRONOME_STYLE_FRAGMENTS = Object.freeze({
  overview: METRONOME_OVERVIEW_CSS,
  editor: METRONOME_EDITOR_CSS,
  inspector: METRONOME_INSPECTOR_CSS,
  runs: METRONOME_RUNS_CSS,
  modals: METRONOME_MODALS_CSS,
});

export const METRONOME_PAGE_CSS = Object.values(METRONOME_STYLE_FRAGMENTS).join("\n");
