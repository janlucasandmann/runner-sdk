import { createAppHeaderComponentScriptFragments } from "./components/index.mjs";
import { APP_HEADER_SEARCH_PROJECTION_SCRIPT } from "./runtime/index.mjs";
import {
  APP_HEADER_LIFECYCLE_SCRIPT,
  APP_HEADER_NAVIGATION_SCRIPT,
  APP_HEADER_REFS_SCRIPT,
  APP_HEADER_STATE_SCRIPT,
} from "./shell/index.mjs";

export {
  APP_HEADER_STYLES,
  APP_HEADER_STYLE_FRAGMENTS,
} from "./styles/index.mjs";

export function createAppHeaderScriptFragments(options = {}) {
  const components = createAppHeaderComponentScriptFragments(options);
  return Object.freeze({
    state: APP_HEADER_STATE_SCRIPT,
    refs: APP_HEADER_REFS_SCRIPT,
    navigation: APP_HEADER_NAVIGATION_SCRIPT,
    lifecycle: APP_HEADER_LIFECYCLE_SCRIPT,
    searchProjection: APP_HEADER_SEARCH_PROJECTION_SCRIPT,
    ...components,
  });
}

export {
  APP_HEADER_LIFECYCLE_SCRIPT,
  APP_HEADER_NAVIGATION_SCRIPT,
  APP_HEADER_REFS_SCRIPT,
  APP_HEADER_SEARCH_PROJECTION_SCRIPT,
  APP_HEADER_STATE_SCRIPT,
  createAppHeaderComponentScriptFragments,
};
