import assert from "node:assert/strict";
import test from "node:test";
import {
  appendGithubOAuthResultToRedirectTarget,
  buildGithubAuthorizationUrl,
  createGithubPkceChallenge,
} from "./github-oauth.mjs";

test("GitHub authorization uses account selection and PKCE", () => {
  const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
  const challenge = createGithubPkceChallenge(verifier);
  const authUrl = new URL(buildGithubAuthorizationUrl({
    clientId: "client_123",
    redirectUri: "http://localhost:4177/api/github/callback",
    state: "state_123",
    scope: "repo read:user",
    pkceChallenge: challenge,
  }));

  assert.equal(challenge, "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  assert.equal(authUrl.origin, "https://github.com");
  assert.equal(authUrl.pathname, "/login/oauth/authorize");
  assert.equal(authUrl.searchParams.get("prompt"), "select_account");
  assert.equal(authUrl.searchParams.get("allow_signup"), "false");
  assert.equal(authUrl.searchParams.get("code_challenge"), challenge);
  assert.equal(authUrl.searchParams.get("code_challenge_method"), "S256");
});

test("GitHub callback results preserve the exact connector return route", () => {
  const target =
    "http://localhost:4177/?connectorAuthReturn=1"
    + "&connectorAuthProvider=github"
    + "&connectorAuthView=plugins"
    + "&connectorAuthResource=github"
    + "&connectorAuthTab=authentication"
    + "&connectorAuthSavedAt=1785318000000";
  const success = new URL(appendGithubOAuthResultToRedirectTarget(target, {
    result: "success",
  }));
  const denied = new URL(appendGithubOAuthResultToRedirectTarget(target, {
    result: "error",
    error: "access_denied",
  }));

  assert.equal(success.searchParams.get("connectorAuthResult"), "success");
  assert.equal(success.searchParams.has("connectorAuthError"), false);
  assert.equal(denied.searchParams.get("connectorAuthResult"), "error");
  assert.equal(denied.searchParams.get("connectorAuthError"), "access_denied");
  assert.equal(denied.searchParams.get("connectorAuthResource"), "github");
  assert.equal(denied.searchParams.get("connectorAuthTab"), "authentication");
});

test("GitHub callback leaves unrelated redirect targets untouched", () => {
  const target = "http://localhost:4177/?connectorMode=project&connectorProjectId=project_1";
  assert.equal(
    appendGithubOAuthResultToRedirectTarget(target, {
      result: "error",
      error: "access_denied",
    }),
    target,
  );
});
