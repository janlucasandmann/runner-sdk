import { INFERENCE_APP_CLEANUP_SCRIPT } from "./cleanup.mjs";
import { INFERENCE_APP_CONFIGURE_HOME_ENTRY_SCRIPT } from "./configure-home-entry.mjs";
import { INFERENCE_APP_HANDLERS_SCRIPT } from "./handlers.mjs";
import { INFERENCE_APP_HISTORY_CAPTURE_SCRIPT } from "./history-capture.mjs";
import { INFERENCE_APP_HISTORY_RESTORE_SCRIPT } from "./history-restore.mjs";
import { INFERENCE_APP_LOAD_LIFECYCLE_SCRIPT } from "./load-lifecycle.mjs";
import { INFERENCE_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { INFERENCE_APP_REFS_SCRIPT } from "./refs.mjs";
import { INFERENCE_APP_RUNTIME_LIFECYCLE_SCRIPT } from "./runtime-lifecycle.mjs";
import { INFERENCE_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { INFERENCE_APP_STATE_SCRIPT } from "./state.mjs";
import { INFERENCE_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

export const INFERENCE_APP_SCRIPT_FRAGMENTS = Object.freeze({
  state: INFERENCE_APP_STATE_SCRIPT,
  refs: INFERENCE_APP_REFS_SCRIPT,
  runtimeLifecycle: INFERENCE_APP_RUNTIME_LIFECYCLE_SCRIPT,
  navigation: INFERENCE_APP_NAVIGATION_SCRIPT,
  loadLifecycle: INFERENCE_APP_LOAD_LIFECYCLE_SCRIPT,
  handlers: INFERENCE_APP_HANDLERS_SCRIPT,
  cleanup: INFERENCE_APP_CLEANUP_SCRIPT,
  historyCapture: INFERENCE_APP_HISTORY_CAPTURE_SCRIPT,
  historyRestore: INFERENCE_APP_HISTORY_RESTORE_SCRIPT,
  topNavigation: INFERENCE_APP_TOP_NAVIGATION_SCRIPT,
  configureHomeEntry: INFERENCE_APP_CONFIGURE_HOME_ENTRY_SCRIPT,
  sidebarEntry: INFERENCE_APP_SIDEBAR_ENTRY_SCRIPT,
});
