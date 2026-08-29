import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";
import {
  appendGithubOAuthResultToRedirectTarget,
  buildGithubAuthorizationUrl,
  createGithubPkceChallenge,
  handleGithubApiRequest,
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

test("GitHub login uses an appliance OIDC principal and durable local state", async () => {
  const environmentKeys = [
    "DEPLOYMENT_TOPOLOGY",
    "RUNNER_UPSTREAM_ORIGIN",
    "PLATFORM_CONTROL_PLANE_SECRET",
    "GITHUB_OAUTH_CLIENT_ID",
    "GITHUB_OAUTH_REDIRECT_URI",
  ];
  const previousEnvironment = Object.fromEntries(
    environmentKeys.map((key) => [key, process.env[key]]),
  );
  const previousFetch = globalThis.fetch;
  const observed = [];
  Object.assign(process.env, {
    DEPLOYMENT_TOPOLOGY: "on_prem",
    RUNNER_UPSTREAM_ORIGIN: "http://127.0.0.1:8080/v1",
    PLATFORM_CONTROL_PLANE_SECRET:
      "connector-control-secret-with-32-bytes-minimum",
    GITHUB_OAUTH_CLIENT_ID: "github-client-id",
    GITHUB_OAUTH_REDIRECT_URI:
      "https://stockifi.example.test/api/github/callback",
  });
  globalThis.fetch = async (input, init) => {
    observed.push({ input: String(input), init });
    return Response.json({ document: { fields: JSON.parse(init.body).fields } });
  };

  try {
    const body = JSON.stringify({
      redirectTo: "https://stockifi.example.test/?connectorAuthReturn=1",
      credentialId: "github_credential",
      credentialName: "Work GitHub",
      organizationId: "org_1",
    });
    const request = Readable.from([body]);
    request.method = "POST";
    request.url = "/api/aios/github/login";
    request.headers = {};
    const response = createResponseRecorder();
    let verified = 0;

    await handleGithubApiRequest({
      req: request,
      res: response,
      url: new URL(request.url, "https://stockifi.example.test"),
      platformOrigin: "https://stockifi.example.test",
      verifyUser: async () => {
        verified += 1;
        return { uid: "user_oidc_1", email: "user@example.test" };
      },
    });

    assert.equal(verified, 1);
    assert.equal(response.statusCode, 200);
    const payload = JSON.parse(response.body);
    const authUrl = new URL(payload.authUrl);
    assert.equal(authUrl.searchParams.get("client_id"), "github-client-id");
    assert.equal(
      authUrl.searchParams.get("redirect_uri"),
      "https://stockifi.example.test/api/github/callback",
    );
    assert.equal(observed.length, 1);
    assert.match(observed[0].input, /\/internal\/connector-storage\/documents$/);
    const persistedFields = JSON.parse(observed[0].init.body).fields;
    assert.equal(persistedFields.uid.stringValue, "user_oidc_1");
    assert.equal(persistedFields.provider.stringValue, "github");
  } finally {
    globalThis.fetch = previousFetch;
    for (const key of environmentKeys) {
      if (previousEnvironment[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnvironment[key];
    }
  }
});

function createResponseRecorder() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(body = "") {
      this.body = String(body);
    },
  };
}
