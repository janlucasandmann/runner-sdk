import { METRONOME_DRAWER_CSS } from "./drawer-styles.mjs";
import { METRONOME_SIDEBAR_CSS } from "./sidebar-styles.mjs";
import { METRONOME_RUN_TRACE_CSS } from "./run-trace-styles.mjs";
import { METRONOME_THREAD_LIFECYCLE_SCRIPT } from "./thread-lifecycle.mjs";
import { METRONOME_SHELL_RUNTIME_SCRIPT as METRONOME_RUN_TRACE_RUNTIME_SCRIPT } from "./run-trace-runtime.mjs";

export const METRONOME_SHELL_RUNTIME_SCRIPT = [
  METRONOME_THREAD_LIFECYCLE_SCRIPT,
  METRONOME_RUN_TRACE_RUNTIME_SCRIPT,
].join("\n");

export {
  canonicalizeMetronomeThreadLifecycleStatus,
  classifyMetronomeThreadLifecycleStatus,
  mergeMetronomeThreadLifecycleRecordLists,
  mergeMetronomeThreadLifecycleRecords,
  normalizeMetronomeThreadLifecycleStatus,
  resolveMetronomeThreadLifecycle,
} from "./thread-lifecycle.mjs";

/** Shell-level style slots preserve their original shared stylesheet order. */
export const METRONOME_SHELL_STYLE_FRAGMENTS = Object.freeze({
  sidebar: METRONOME_SIDEBAR_CSS,
  drawer: METRONOME_DRAWER_CSS,
  runTrace: METRONOME_RUN_TRACE_CSS,
});
