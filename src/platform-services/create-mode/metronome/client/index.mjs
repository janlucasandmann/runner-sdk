import { METRONOME_PAGE_RUNTIME_SCRIPT } from "./page/index.mjs";
import { METRONOME_DOMAIN_RUNTIME_SCRIPT } from "./runtime/index.mjs";

export { METRONOME_STYLE_FRAGMENTS, METRONOME_PAGE_CSS } from "./styles/index.mjs";
export {
  METRONOME_SHELL_RUNTIME_SCRIPT,
  METRONOME_SHELL_STYLE_FRAGMENTS,
} from "./integrations/index.mjs";
export { METRONOME_APP_SCRIPT_FRAGMENTS } from "./shell/index.mjs";
export { METRONOME_DOMAIN_RUNTIME_SCRIPT } from "./runtime/index.mjs";
export { METRONOME_PAGE_RUNTIME_SCRIPT } from "./page/index.mjs";

/** Complete browser runtime in the legacy evaluation order. */
export const METRONOME_PAGE_SCRIPT = [
  METRONOME_DOMAIN_RUNTIME_SCRIPT,
  METRONOME_PAGE_RUNTIME_SCRIPT,
].join("\n");
