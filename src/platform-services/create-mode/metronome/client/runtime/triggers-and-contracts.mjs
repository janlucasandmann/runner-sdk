import { joinLegacyBrowserSourceFragments } from "../../../../legacy-browser-source.mjs";
import { METRONOME_TRIGGERS_01_FRAGMENT } from "./triggers-and-contracts/01-trigger-contracts.mjs";
import { METRONOME_TRIGGERS_02_FRAGMENT } from "./triggers-and-contracts/02-dynamic-content-and-resources.mjs";

export const METRONOME_TRIGGERS_FRAGMENT_PATHS = Object.freeze([
  "triggers-and-contracts/01-trigger-contracts.mjs",
  "triggers-and-contracts/02-dynamic-content-and-resources.mjs",
]);

export const METRONOME_TRIGGERS_RUNTIME_SCRIPT =
  joinLegacyBrowserSourceFragments([
    METRONOME_TRIGGERS_01_FRAGMENT,
    METRONOME_TRIGGERS_02_FRAGMENT,
  ]);
