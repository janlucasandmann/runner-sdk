import assert from "node:assert/strict";
import fs from "node:fs";

import { PLAN_GATE_APP_SCRIPT_FRAGMENTS } from "./index.mjs";

assert.deepEqual(Object.keys(PLAN_GATE_APP_SCRIPT_FRAGMENTS), [
  "state",
  "lifecycle",
  "host",
]);
assert.match(PLAN_GATE_APP_SCRIPT_FRAGMENTS.state, /platformPlanGateRequest/);
assert.match(PLAN_GATE_APP_SCRIPT_FRAGMENTS.lifecycle, /subscribePlatformPlanGateRequests/);
assert.match(PLAN_GATE_APP_SCRIPT_FRAGMENTS.lifecycle, /handleSettingsSubscribe/);
assert.match(PLAN_GATE_APP_SCRIPT_FRAGMENTS.host, /PlatformPlanGateModal/);

const platformEntrySource = fs.readFileSync(
  new URL("../../../apps/platform/client/legacy/create-legacy-platform-application.mjs", import.meta.url),
  "utf8",
);
assert.match(platformEntrySource, /PLAN_GATE_APP_SCRIPT_FRAGMENTS/);

console.log("Plan gate service contract verified.");

