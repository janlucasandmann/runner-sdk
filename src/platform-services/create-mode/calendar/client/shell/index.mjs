import { CALENDAR_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { CALENDAR_APP_STATE_SCRIPT } from "./state.mjs";
import { CALENDAR_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const CALENDAR_SHELL_SCRIPT_FRAGMENTS = Object.freeze({
  state: CALENDAR_APP_STATE_SCRIPT,
  navigation: CALENDAR_NAVIGATION_SCRIPT,
  topNavigation: CALENDAR_APP_TOP_NAVIGATION_SCRIPT,
});
