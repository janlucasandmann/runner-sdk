import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

/** Quarantined onboarding modal while account setup moves to typed routes. */
export const ONBOARDING_SCRIPT = fs.readFileSync(
  path.join(domainRoot, "onboarding.js"),
  "utf8",
);
