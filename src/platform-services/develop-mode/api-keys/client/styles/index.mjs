import { API_KEYS_PAGE_CSS_FRAGMENT } from "./page.mjs";
import { API_KEYS_SHARED_COMPONENTS_CSS } from "./shared-components.mjs";
import { API_KEYS_TABLE_CSS } from "./table.mjs";

export const API_KEYS_STYLE_FRAGMENTS = Object.freeze({
  table: API_KEYS_TABLE_CSS,
  sharedComponents: API_KEYS_SHARED_COMPONENTS_CSS,
  page: API_KEYS_PAGE_CSS_FRAGMENT,
});

export const API_KEYS_PAGE_CSS = Object.values(API_KEYS_STYLE_FRAGMENTS).join("");
