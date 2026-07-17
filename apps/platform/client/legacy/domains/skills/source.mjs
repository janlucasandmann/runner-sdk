import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

/** Quarantined legacy skills controller while typed skill routes take ownership. */
export const SKILLS_PAGE_SCRIPT = fs.readFileSync(
  path.join(domainRoot, "skills-page.js"),
  "utf8",
);
