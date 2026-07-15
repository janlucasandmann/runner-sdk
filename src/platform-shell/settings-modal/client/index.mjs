import {
  SETTINGS_MODAL_NAVIGATION_SCRIPT,
  SETTINGS_MODAL_STATE_SCRIPT,
} from "./shell/index.mjs";

export { createSettingsModalPageScript } from "./page/index.mjs";
export { SETTINGS_MODAL_CSS } from "./styles/index.mjs";

export const SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS = Object.freeze({
  state: SETTINGS_MODAL_STATE_SCRIPT,
  navigation: SETTINGS_MODAL_NAVIGATION_SCRIPT,
});

