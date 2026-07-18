import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  SKILLS_CONTROLLER_FRAGMENT_PATHS,
  SKILLS_PAGE_SCRIPT,
} from "./source.mjs";

assert.deepEqual(
  SKILLS_CONTROLLER_FRAGMENT_PATHS,
  [
    "controller/01-state-and-data.js",
    "controller/02-actions-and-editors.js",
    "controller/03-rendering-and-composition.js",
  ],
);
assert.equal(
  createHash("sha256").update(SKILLS_PAGE_SCRIPT).digest("hex"),
  "e863104964aa7c0d2a2f9374a4e89981cc7766f1e1df575bf26dbf179fe28333",
  "The Skills fragment composition must remain byte-compatible with the reviewed controller.",
);
assert.match(SKILLS_PAGE_SCRIPT, /requestedAction === "create"/);
assert.match(SKILLS_PAGE_SCRIPT, /openSkillComposer\(\)/);

console.log("Legacy Skills controller composition passed.");
