import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const domainRoot = path.dirname(fileURLToPath(import.meta.url));

/** Prompt catalog/detail controller kept separate from the legacy shell. */
export const PROMPTS_PAGE_SCRIPT = fs.readFileSync(
  path.join(domainRoot, "controller/prompts-page.js"),
  "utf8",
);
