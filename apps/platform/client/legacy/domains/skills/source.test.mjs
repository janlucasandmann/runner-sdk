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
  "02549e000220b1a91339eef4c40033610a6abcceaf60428b13f845c6b6c72a08",
  "The Skills fragment composition must remain byte-compatible with the reviewed controller.",
);
assert.match(SKILLS_PAGE_SCRIPT, /requestedAction === "create"/);
assert.match(SKILLS_PAGE_SCRIPT, /createAndOpenCustomSkill\(\)/);
assert.match(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]*src: COMPUTER_AGENTS_CREATOR_PROFILE_URL/,
);
assert.doesNotMatch(
  SKILLS_PAGE_SCRIPT,
  /systemSkillFamilyId === "computer_agents"[\s\S]{0,300}src: RUNNER_TRANSPARENT_LOGO_URL/,
);

console.log("Legacy Skills controller composition passed.");
