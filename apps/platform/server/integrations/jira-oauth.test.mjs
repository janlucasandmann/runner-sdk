import assert from "node:assert/strict";
import test from "node:test";

import {
  buildJiraAuthorizationUrl,
  isJiraApiRequestPath,
  JIRA_OAUTH_DEFAULT_SCOPE,
  normalizeJiraToken,
  resolveJiraOAuthConfiguration,
} from "./jira-oauth.mjs";

test("matches only Jira API routes", () => {
  assert.equal(isJiraApiRequestPath("/api/jira/callback"), true);
  assert.equal(isJiraApiRequestPath("/api/aios/jira/login"), true);
  assert.equal(isJiraApiRequestPath("/api/aios/jira/user"), true);
  assert.equal(isJiraApiRequestPath("/api/github/callback"), false);
  assert.equal(isJiraApiRequestPath("/jira"), false);
});

test("builds the Atlassian authorization-code request", () => {
  const url = new URL(buildJiraAuthorizationUrl({
    clientId: "jira-client",
    redirectUri: "https://platform.example.test/api/jira/callback",
    state: "oauth-state",
  }));

  assert.equal(url.origin, "https://auth.atlassian.com");
  assert.equal(url.pathname, "/authorize");
  assert.equal(url.searchParams.get("audience"), "api.atlassian.com");
  assert.equal(url.searchParams.get("client_id"), "jira-client");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://platform.example.test/api/jira/callback",
  );
  assert.equal(url.searchParams.get("state"), "oauth-state");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.equal(url.searchParams.get("scope"), JIRA_OAUTH_DEFAULT_SCOPE);
});

test("preserves the existing Jira refresh token when Atlassian omits a replacement", () => {
  const token = normalizeJiraToken({
    access_token: "refreshed-access-token",
    expires_in: 3600,
  }, {
    cloudId: "cloud-123",
    refreshToken: "existing-refresh-token",
  });

  assert.equal(token.accessToken, "refreshed-access-token");
  assert.equal(token.refreshToken, "existing-refresh-token");
  assert.equal(token.cloudId, "cloud-123");
});

test("resolves a complete Atlassian OAuth client through supported aliases", async () => {
  const keys = [
    "JIRA_OAUTH_CLIENT_ID",
    "JIRA_OAUTH_CLIENT_SECRET",
    "JIRA_OAUTH_REDIRECT_URI",
    "ATLASSIAN_OAUTH_CLIENT_ID",
    "ATLASSIAN_OAUTH_CLIENT_SECRET",
    "ATLASSIAN_OAUTH_REDIRECT_URI",
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  keys.forEach((key) => delete process.env[key]);
  process.env.ATLASSIAN_OAUTH_CLIENT_ID = "atlassian-client";
  process.env.ATLASSIAN_OAUTH_CLIENT_SECRET = "atlassian-secret";
  process.env.ATLASSIAN_OAUTH_REDIRECT_URI =
    "https://platform.example.test/api/jira/callback";

  try {
    const configuration = await resolveJiraOAuthConfiguration({
      platformOrigin: "https://ignored.example.test",
    });
    assert.equal(configuration.configured, true);
    assert.equal(configuration.clientId, "atlassian-client");
    assert.equal(configuration.clientSecret, "atlassian-secret");
    assert.equal(
      configuration.redirectUri,
      "https://platform.example.test/api/jira/callback",
    );
    assert.deepEqual(configuration.missing, []);
  } finally {
    keys.forEach((key) => {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    });
  }
});

test("reports every missing Jira OAuth credential before authorization starts", async () => {
  const keys = [
    "JIRA_OAUTH_CLIENT_ID",
    "JIRA_OAUTH_CLIENT_SECRET",
    "ATLASSIAN_OAUTH_CLIENT_ID",
    "ATLASSIAN_OAUTH_CLIENT_SECRET",
    "ATLASSIAN_CLIENT_ID",
    "ATLASSIAN_CLIENT_SECRET",
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  keys.forEach((key) => delete process.env[key]);

  try {
    const configuration = await resolveJiraOAuthConfiguration({
      platformOrigin: "http://localhost:4177",
    });
    assert.equal(configuration.configured, false);
    assert.deepEqual(configuration.missing, [
      "JIRA_OAUTH_CLIENT_ID",
      "JIRA_OAUTH_CLIENT_SECRET",
    ]);
    assert.equal(
      configuration.redirectUri,
      "http://localhost:4177/api/jira/callback",
    );
  } finally {
    keys.forEach((key) => {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    });
  }
});
