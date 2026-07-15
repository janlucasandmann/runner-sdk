import { DEVELOP_HOME_CONTENT_CSS } from "./content.mjs";
import { DEVELOP_HOME_FOUNDATION_CSS } from "./foundation.mjs";

export const DEVELOP_HOME_STYLE_FRAGMENTS = Object.freeze({
  foundation: DEVELOP_HOME_FOUNDATION_CSS,
  content: DEVELOP_HOME_CONTENT_CSS,
});

export const DEVELOP_HOME_PAGE_CSS = Object.values(DEVELOP_HOME_STYLE_FRAGMENTS).join("");
