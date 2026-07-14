import { METRONOME_DRAWER_CSS } from "./drawer-styles.mjs";
import { METRONOME_SIDEBAR_CSS } from "./sidebar-styles.mjs";
import { METRONOME_RUN_TRACE_CSS } from "./run-trace-styles.mjs";

export { METRONOME_SHELL_RUNTIME_SCRIPT } from "./run-trace-runtime.mjs";

/** Shell-level style slots preserve their original shared stylesheet order. */
export const METRONOME_SHELL_STYLE_FRAGMENTS = Object.freeze({
  sidebar: METRONOME_SIDEBAR_CSS,
  drawer: METRONOME_DRAWER_CSS,
  runTrace: METRONOME_RUN_TRACE_CSS,
});
