import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));
export const SKILLS_CONTROLLER_FRAGMENT_PATHS = Object.freeze([
  "controller/01-state-and-data.js",
  "controller/02-actions-and-editors.js",
  "controller/03-rendering-and-composition.js",
]);

/** Quarantined legacy skills controller while typed skill routes take ownership. */
export const SKILLS_PAGE_SCRIPT = SKILLS_CONTROLLER_FRAGMENT_PATHS
  .map((relativePath) => fs.readFileSync(
    path.join(domainRoot, relativePath),
    "utf8",
  ))
  .join("");
