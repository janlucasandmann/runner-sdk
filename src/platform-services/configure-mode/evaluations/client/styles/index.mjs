import { EVALUATIONS_STYLE_DETAIL } from "./detail.mjs";
import { EVALUATIONS_STYLE_DIALOGS } from "./dialogs.mjs";
import { EVALUATIONS_STYLE_FOUNDATION } from "./foundation.mjs";
import { EVALUATIONS_STYLE_TABLES } from "./tables.mjs";

export const EVALUATIONS_STYLE_FRAGMENTS = Object.freeze({
  foundation: EVALUATIONS_STYLE_FOUNDATION,
  tables: EVALUATIONS_STYLE_TABLES,
  detail: EVALUATIONS_STYLE_DETAIL,
  dialogs: EVALUATIONS_STYLE_DIALOGS,
});

export const PLAYGROUND_EVALUATIONS_CSS = Object.values(
  EVALUATIONS_STYLE_FRAGMENTS,
).join("");

