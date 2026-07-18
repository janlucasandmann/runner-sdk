import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));
export const ONBOARDING_CONTROLLER_FRAGMENT_PATHS = Object.freeze([
  "controller/01-state-and-lifecycle.js",
  "controller/02-rendering-and-composition.js",
]);

/** Quarantined onboarding modal while account setup moves to typed routes. */
export const ONBOARDING_SCRIPT = ONBOARDING_CONTROLLER_FRAGMENT_PATHS
  .map((relativePath) => fs.readFileSync(
    path.join(domainRoot, relativePath),
    "utf8",
  ))
  .join("");
