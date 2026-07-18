import { readFileSync } from "node:fs";

const platformLoadingStateCss = readFileSync(
  new URL(
    "../../../../platform-ui/components/composite/loading-state/loading-state.css",
    import.meta.url,
  ),
  "utf8",
);
const platformGlobalSearchModalCss = readFileSync(
  new URL("../../global-search-modal/global-search-modal.css", import.meta.url),
  "utf8",
);

export const APP_HEADER_SEARCH_MODAL_CSS = `${platformLoadingStateCss}\n\n${platformGlobalSearchModalCss}`;
