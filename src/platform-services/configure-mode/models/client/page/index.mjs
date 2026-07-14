import { MODELS_PAGE_CATALOG_SCRIPT } from "./catalog.mjs";
import { MODELS_PAGE_PRESENTATION_SCRIPT } from "./presentation.mjs";
import { MODELS_PAGE_QUERY_SCRIPT } from "./query.mjs";
import { MODELS_PAGE_VIEW_SCRIPT } from "./view.mjs";

export const MODELS_PAGE_SCRIPT_FRAGMENTS = Object.freeze({
  catalog: MODELS_PAGE_CATALOG_SCRIPT,
  query: MODELS_PAGE_QUERY_SCRIPT,
  presentation: MODELS_PAGE_PRESENTATION_SCRIPT,
  view: MODELS_PAGE_VIEW_SCRIPT,
});

export const MODELS_PAGE_SCRIPT = Object.values(MODELS_PAGE_SCRIPT_FRAGMENTS).join("");
