import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { createPlatformConfig } from "./platform-config.mjs";

test("uses fail-closed administrator configuration and portable local roots", () => {
  const config = createPlatformConfig({});

  assert.equal(config.feedbackSummaryAllowedEmail, "");
  assert.ok(path.isAbsolute(config.aiosHostingRoot));
  assert.ok(path.isAbsolute(config.playgroundSystemSkillsRoot));
  assert.ok(config.githubOauthAllowedOrigins.includes("http://localhost:4177"));
});

test("normalizes explicit origins, paths, and administrator settings", () => {
  const config = createPlatformConfig({
    AIOS_HOSTING_ROOT: "./fixtures/hosting",
    COMPUTER_AGENTS_CLOUD_INFRASTRUCTURE_ROOT: "./fixtures/cloud",
    FEEDBACK_SUMMARY_ALLOWED_EMAIL: " Operator@Example.test ",
    GITHUB_OAUTH_ALLOWED_ORIGINS: "https://one.example, https://two.example ",
    PLATFORM_RUNTIME_ENV_FILES: [
      "./fixtures/first.env",
      "./fixtures/second.env",
    ].join(path.delimiter),
    PLATFORM_SYSTEM_SKILLS_ROOT: "./fixtures/skills",
  });

  assert.equal(config.feedbackSummaryAllowedEmail, "operator@example.test");
  assert.deepEqual(config.githubOauthAllowedOrigins, [
    "https://one.example",
    "https://two.example",
  ]);
  assert.deepEqual(config.feedbackSummaryAdminEnvFileCandidates, [
    path.resolve("./fixtures/first.env"),
    path.resolve("./fixtures/second.env"),
  ]);
  assert.equal(
    config.githubOauthEnvFileCandidates,
    config.feedbackSummaryAdminEnvFileCandidates,
  );
  assert.equal(
    config.playgroundSystemSkillsRoot,
    path.resolve("./fixtures/skills"),
  );
});
