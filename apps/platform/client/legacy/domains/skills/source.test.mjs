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
  "c28a6116fcac75cb324cc109995d1ac487de182f13f5c9f7118522878713c54f",
  "The Skills fragment composition must remain byte-compatible with the reviewed controller.",
);
assert.match(SKILLS_PAGE_SCRIPT, /requestedAction === "create"/);
assert.match(SKILLS_PAGE_SCRIPT, /openSkillComposer\(\)/);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]*src: COMPUTER_AGENTS_CREATOR_PROFILE_URL/,
);
assert.doesNotMatch(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]{0,300}src: RUNNER_TRANSPARENT_LOGO_URL/,
);

console.log("Legacy Skills controller composition passed.");
