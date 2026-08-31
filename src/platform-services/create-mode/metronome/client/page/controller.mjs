import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { METRONOME_CONTROLLER_THREAD_COMMAND_AVAILABILITY_FRAGMENT } from "./controller/00-thread-command-availability.mjs";
import { METRONOME_CONTROLLER_01_FRAGMENT } from "./controller/01-dynamic-content-and-state.mjs";
import { METRONOME_CONTROLLER_02_FRAGMENT } from "./controller/02-selection-and-lifecycle.mjs";

export const METRONOME_PAGE_CONTROLLER_FRAGMENT_PATHS = Object.freeze([
  "controller/00-thread-command-availability.mjs",
  "controller/01-dynamic-content-and-state.mjs",
  "controller/02-selection-and-lifecycle.mjs",
]);

export const METRONOME_PAGE_CONTROLLER_SCRIPT =
  joinLegacyBrowserSourceFragments([
    METRONOME_CONTROLLER_THREAD_COMMAND_AVAILABILITY_FRAGMENT,
    METRONOME_CONTROLLER_01_FRAGMENT,
    METRONOME_CONTROLLER_02_FRAGMENT,
  ]);
