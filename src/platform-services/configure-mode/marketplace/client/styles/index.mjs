import { MARKETPLACE_STYLE_DIALOGS } from "./dialogs.mjs";
import { MARKETPLACE_STYLE_FOUNDATION } from "./foundation.mjs";
import { MARKETPLACE_STYLE_TABLE } from "./table.mjs";

export const MARKETPLACE_STYLE_FRAGMENTS = Object.freeze({
  foundation: MARKETPLACE_STYLE_FOUNDATION,
  table: MARKETPLACE_STYLE_TABLE,
  dialogs: MARKETPLACE_STYLE_DIALOGS,
});

export const MARKETPLACE_PAGE_CSS = Object.values(MARKETPLACE_STYLE_FRAGMENTS).join("");
