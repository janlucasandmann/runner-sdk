import assert from "node:assert/strict";
import test from "node:test";

import {
  buildJiraAuthorizationUrl,
  isJiraApiRequestPath,
  JIRA_OAUTH_DEFAULT_SCOPE,
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
