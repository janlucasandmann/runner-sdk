import { BATCHES_APP_STATE_SCRIPT } from "./state.mjs";
import { BATCHES_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

/** Batches-owned fragments mounted into the shared legacy application shell. */
export const BATCHES_APP_SCRIPT_FRAGMENTS = Object.freeze({
  state: BATCHES_APP_STATE_SCRIPT,
  topNavigation: BATCHES_APP_TOP_NAVIGATION_SCRIPT,
});
