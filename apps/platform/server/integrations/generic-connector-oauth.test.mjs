import assert from "node:assert/strict";
import test from "node:test";
import { getGenericConnectorProvider } from "./connector-provider-registry.mjs";
import {
  buildGenericConnectorAuthorizationUrl,
  buildGenericConnectorProfileRequest,
  buildGenericConnectorTokenRequest,
  isGenericConnectorApiRequestPath,
  normalizeDirectConnectorCredential,
} from "./generic-connector-oauth.mjs";

test("generic connector routes only match registered providers", () => {
  assert.equal(isGenericConnectorApiRequestPath("/api/aios/connectors/slack/login"), true);
  assert.equal(isGenericConnectorApiRequestPath("/api/connectors/stripe/credentials"), true);
  assert.equal(isGenericConnectorApiRequestPath("/api/aios/connectors/unknown/login"), false);
  assert.equal(isGenericConnectorApiRequestPath("/api/aios/connectors/slack/token"), false);
});

test("generic OAuth URLs preserve provider parameters, requested scopes, and PKCE", () => {
  const provider = getGenericConnectorProvider("google-calendar");
  const authUrl = new URL(
    buildGenericConnectorAuthorizationUrl({
      provider,
      clientId: "client-id",
      redirectUri: "https://platform.example.com/api/aios/connectors/google-calendar/callback",
      state: "state-value",
      scope: "openid email https://www.googleapis.com/auth/calendar.readonly",
      pkceVerifier: "pkce-verifier",
    }),
  );

  assert.equal(authUrl.origin, "https://accounts.google.com");
  assert.equal(authUrl.searchParams.get("client_id"), "client-id");
  assert.equal(authUrl.searchParams.get("state"), "state-value");
  assert.equal(authUrl.searchParams.get("access_type"), "offline");
  assert.equal(authUrl.searchParams.get("code_challenge_method"), "S256");
  assert.ok(authUrl.searchParams.get("code_challenge"));
});

test("Dropbox OAuth requests offline access with the configured connector scopes", () => {
  const provider = getGenericConnectorProvider("dropbox");
  const scope = provider.scopes.join(" ");
  const authUrl = new URL(
    buildGenericConnectorAuthorizationUrl({
      provider,
      clientId: "dropbox-app-key",
      redirectUri: "http://localhost:4177/api/aios/connectors/dropbox/callback",
      state: "dropbox-state",
      scope,
      pkceVerifier: "dropbox-pkce-verifier",
    }),
  );

  assert.equal(authUrl.origin, "https://www.dropbox.com");
  assert.equal(authUrl.pathname, "/oauth2/authorize");
  assert.equal(authUrl.searchParams.get("token_access_type"), "offline");
  assert.equal(authUrl.searchParams.get("force_reapprove"), "false");
  assert.equal(authUrl.searchParams.get("scope"), scope);
  assert.equal(authUrl.searchParams.get("code_challenge_method"), "S256");
  assert.ok(authUrl.searchParams.get("code_challenge"));
});

test("Slack requests bot and user scopes while Asana and Figma use PKCE", () => {
  const slack = getGenericConnectorProvider("slack");
  const slackUrl = new URL(
    buildGenericConnectorAuthorizationUrl({
      provider: slack,
      clientId: "slack-client",
      redirectUri: "http://localhost:4177/api/aios/connectors/slack/callback",
      state: "slack-state",
      scope: slack.scopes.join(" "),
    }),
  );
  assert.equal(slackUrl.searchParams.get("scope"), slack.scopes.join(" "));
  assert.equal(slackUrl.searchParams.get("user_scope"), "search:read");

  for (const providerId of ["asana", "figma"]) {
    const provider = getGenericConnectorProvider(providerId);
    const authUrl = new URL(
      buildGenericConnectorAuthorizationUrl({
        provider,
        clientId: `${providerId}-client`,
        redirectUri: `http://localhost:4177/api/aios/connectors/${providerId}/callback`,
        state: `${providerId}-state`,
        scope: provider.scopes.join(provider.scopeSeparator),
        pkceVerifier: `${providerId}-pkce-verifier`,
      }),
    );
    assert.equal(authUrl.searchParams.get("code_challenge_method"), "S256");
    assert.ok(authUrl.searchParams.get("code_challenge"));
  }
});

test("token exchange honors provider-specific client authentication", () => {
  const figmaRequest = buildGenericConnectorTokenRequest({
    provider: getGenericConnectorProvider("figma"),
    code: "authorization-code",
    clientId: "figma-client",
    clientSecret: "figma-secret",
    redirectUri: "https://platform.example.com/callback",
  });
  const figmaBody = new URLSearchParams(figmaRequest.body);
  assert.equal(
    figmaRequest.headers.Authorization,
    `Basic ${Buffer.from("figma-client:figma-secret").toString("base64")}`,
  );
  assert.equal(figmaBody.has("client_id"), false);
  assert.equal(figmaBody.has("client_secret"), false);

  const googleRequest = buildGenericConnectorTokenRequest({
    provider: getGenericConnectorProvider("google-calendar"),
    code: "authorization-code",
    clientId: "google-client",
    clientSecret: "google-secret",
    redirectUri: "https://platform.example.com/callback",
    pkceVerifier: "pkce-verifier",
  });
  const googleBody = new URLSearchParams(googleRequest.body);
  assert.equal(googleRequest.headers.Authorization, undefined);
  assert.equal(googleBody.get("client_id"), "google-client");
  assert.equal(googleBody.get("client_secret"), "google-secret");
  assert.equal(googleBody.get("code_verifier"), "pkce-verifier");

  const dropboxRequest = buildGenericConnectorTokenRequest({
    provider: getGenericConnectorProvider("dropbox"),
    code: "dropbox-authorization-code",
    clientId: "dropbox-app-key",
    clientSecret: "dropbox-app-secret",
    redirectUri: "http://localhost:4177/api/aios/connectors/dropbox/callback",
    pkceVerifier: "dropbox-pkce-verifier",
  });
  const dropboxBody = new URLSearchParams(dropboxRequest.body);
  assert.equal(dropboxBody.get("client_id"), "dropbox-app-key");
  assert.equal(dropboxBody.get("client_secret"), "dropbox-app-secret");
  assert.equal(dropboxBody.get("code_verifier"), "dropbox-pkce-verifier");
});

test("provider profile requests always use the canonical Bearer scheme", () => {
  const boxRequest = buildGenericConnectorProfileRequest(getGenericConnectorProvider("box"), {
    access_token: "box-access-token",
    token_type: "bearer",
  });
  assert.equal(boxRequest.headers.Authorization, "Bearer box-access-token");

  const slackRequest = buildGenericConnectorProfileRequest(getGenericConnectorProvider("slack"), {
    access_token: "slack-bot-token",
    token_type: "bot",
  });
  assert.equal(slackRequest.headers.Authorization, "Bearer slack-bot-token");
});

test("direct credentials receive a narrow, explicit provider access ceiling", () => {
  const serviceAccount = {
    type: "service_account",
    project_id: "example-project",
    client_email: "runner@example-project.iam.gserviceaccount.com",
    private_key: "private-key",
  };
  const bigqueryRead = normalizeDirectConnectorCredential(getGenericConnectorProvider("bigquery"), {
    serviceAccountJson: JSON.stringify(serviceAccount),
    permissionClass: "read_only",
  });
  assert.equal(bigqueryRead.token.permissionClass, "read_only");
  assert.equal(bigqueryRead.token.scope, "https://www.googleapis.com/auth/bigquery.readonly");

  const bigqueryWrite = normalizeDirectConnectorCredential(
    getGenericConnectorProvider("bigquery"),
    {
      serviceAccountJson: JSON.stringify(serviceAccount),
      permissionClass: "read_write",
    },
  );
  assert.equal(bigqueryWrite.token.permissionClass, "read_write");
  assert.equal(bigqueryWrite.token.scope, "https://www.googleapis.com/auth/bigquery");

  const stripe = normalizeDirectConnectorCredential(getGenericConnectorProvider("stripe"), {
    apiKey: "rk_test_secret",
    permissionClass: "read_only",
  });
  assert.equal(stripe.token.permissionClass, "read_only");
  assert.equal(stripe.token.scope, "read_only");
});
