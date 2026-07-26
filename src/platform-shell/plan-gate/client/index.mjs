import { PLAN_GATE_HOST_SCRIPT } from "./shell/host.mjs";
import { PLAN_GATE_LIFECYCLE_SCRIPT } from "./shell/lifecycle.mjs";
import { PLAN_GATE_STATE_SCRIPT } from "./shell/state.mjs";

export const PLAN_GATE_APP_SCRIPT_FRAGMENTS = Object.freeze({
  state: PLAN_GATE_STATE_SCRIPT,
  lifecycle: PLAN_GATE_LIFECYCLE_SCRIPT,
  host: PLAN_GATE_HOST_SCRIPT,
});

