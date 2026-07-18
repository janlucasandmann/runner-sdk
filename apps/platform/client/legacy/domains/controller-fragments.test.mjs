import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AGENTS_CONTROLLER_FRAGMENT_PATHS } from "./agents/source.mjs";
import { ONBOARDING_CONTROLLER_FRAGMENT_PATHS } from "./onboarding/source.mjs";
import { SKILLS_CONTROLLER_FRAGMENT_PATHS } from "./skills/source.mjs";
import { PLATFORM_SHELL_CONTROLLER_FRAGMENT_PATHS } from "./shell/source.mjs";

const domainsRoot = path.dirname(fileURLToPath(import.meta.url));
const suites = [
  {
    domain: "agents",
    paths: AGENTS_CONTROLLER_FRAGMENT_PATHS,
    budget: 6_200,
  },
  {
    domain: "shell",
    paths: PLATFORM_SHELL_CONTROLLER_FRAGMENT_PATHS,
    budget: 6_200,
  },
  {
    domain: "skills",
    paths: SKILLS_CONTROLLER_FRAGMENT_PATHS,
    budget: 1_400,
  },
  {
    domain: "onboarding",
    paths: ONBOARDING_CONTROLLER_FRAGMENT_PATHS,
    budget: 1_000,
  },
];

for (const suite of suites) {
  assert.ok(
    suite.paths.length >= (
      suite.domain === "skills"
        ? 3
        : suite.domain === "onboarding"
          ? 2
          : 5
    ),
    `${suite.domain} must remain decomposed into responsibility fragments.`,
  );
  for (const relativePath of suite.paths) {
    const source = await fs.readFile(
      path.join(domainsRoot, suite.domain, relativePath),
      "utf8",
    );
    const lineCount = source.split("\n").length;
    assert.ok(
      lineCount <= suite.budget,
      `${suite.domain}/${relativePath} exceeded ${suite.budget} lines (${lineCount}).`,
    );
  }
}

console.log(
  "Legacy agent, onboarding, shell, and skills controller fragment budgets passed.",
);
