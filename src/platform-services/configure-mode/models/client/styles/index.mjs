import { MODELS_STYLE_DETAILS_MODAL } from "./details-modal.mjs";
import { MODELS_STYLE_FEATURED } from "./featured.mjs";
import { MODELS_STYLE_FOUNDATION } from "./foundation.mjs";
import { MODELS_STYLE_OVERVIEW } from "./overview.mjs";

export const MODELS_STYLE_FRAGMENTS = Object.freeze({
  foundation: MODELS_STYLE_FOUNDATION,
  overview: MODELS_STYLE_OVERVIEW,
  featured: MODELS_STYLE_FEATURED,
  detailsModal: MODELS_STYLE_DETAILS_MODAL,
});

export const MODELS_PAGE_CSS = Object.values(MODELS_STYLE_FRAGMENTS).join("");
