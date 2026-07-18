import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  ONBOARDING_CONTROLLER_FRAGMENT_PATHS,
  ONBOARDING_SCRIPT,
} from "./source.mjs";

assert.deepEqual(
  ONBOARDING_CONTROLLER_FRAGMENT_PATHS,
  [
    "controller/01-state-and-lifecycle.js",
    "controller/02-rendering-and-composition.js",
  ],
);
assert.equal(
  createHash("sha256").update(ONBOARDING_SCRIPT).digest("hex"),
  "2567d9f98061f09bb886873e241f93e4b66ba9e56e911607dab4c9ca08938abf",
  "The onboarding fragments must remain byte-compatible with the reviewed controller.",
);

console.log("Legacy onboarding controller composition passed.");
