import { readFileSync } from "node:fs";

export const APP_HEADER_SEARCH_MODAL_CSS = readFileSync(
  new URL("../../global-search-modal/global-search-modal.css", import.meta.url),
  "utf8",
);
