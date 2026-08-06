import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGenericConnectorCallbackUrl,
  GENERIC_CONNECTOR_PROVIDER_IDS,
  getGenericConnectorProvider,
  listGenericConnectorProviders,
} from "./connector-provider-registry.mjs";

const EXPECTED_PROVIDERS = [
  "asana",
  "bigquery",
  "box",
  "dropbox",
  "figma",
  "google-calendar",
  "linear",
  "microsoft-teams",
  "outlook",
  "outlook-calendar",
  "sharepoint",
  "slack",
  "stripe",
  "supabase",
];

test("generic connector registry exposes each provider exactly once", () => {
  assert.deepEqual([...GENERIC_CONNECTOR_PROVIDER_IDS].sort(), EXPECTED_PROVIDERS);
  assert.equal(listGenericConnectorProviders().length, EXPECTED_PROVIDERS.length);
});

test("provider metadata is normalized and immutable", () => {
  const slack = getGenericConnectorProvider("slack");
  assert.equal(slack.authentication, "oauth2");
  assert.equal(slack.scopeSeparator, " ");
  assert.equal(Object.isFrozen(slack), true);
  assert.equal(Object.isFrozen(slack.scopes), true);
  assert.equal(Object.isFrozen(slack.authorizeParams), true);

  const stripe = getGenericConnectorProvider("stripe");
  assert.equal(stripe.authentication, "api-key");
  assert.deepEqual(stripe.credentialFields, ["apiKey"]);

  const bigquery = getGenericConnectorProvider("bigquery");
  assert.equal(bigquery.authentication, "service-account");
  assert.deepEqual(bigquery.credentialFields, ["serviceAccountJson"]);
  assert.equal(bigquery.defaultPermissionClass, "read_only");
  assert.equal(
    bigquery.scopesByPermissionClass.read_only,
    "https://www.googleapis.com/auth/bigquery.readonly",
  );
  assert.equal(
    bigquery.scopesByPermissionClass.read_write,
    "https://www.googleapis.com/auth/bigquery",
  );
  assert.equal(Object.isFrozen(bigquery.scopesByPermissionClass), true);

  const linear = getGenericConnectorProvider("linear");
  assert.equal(linear.scopeSeparator, ",");

  const dropbox = getGenericConnectorProvider("dropbox");
  assert.equal(dropbox.clientIdEnv, "DROPBOX_OAUTH_CLIENT_ID");
  assert.equal(dropbox.clientSecretEnv, "DROPBOX_OAUTH_CLIENT_SECRET");
  assert.equal(dropbox.callbackUrlEnv, "DROPBOX_OAUTH_CALLBACK_URL");
  assert.equal(dropbox.authorizeParams.token_access_type, "offline");
  assert.equal(dropbox.pkce, true);
  assert.deepEqual(dropbox.scopes, [
    "account_info.read",
    "files.metadata.read",
    "files.content.read",
    "sharing.read",
    "files.metadata.write",
    "files.content.write",
    "sharing.write",
  ]);

  const figma = getGenericConnectorProvider("figma");
  assert.equal(figma.scopeSeparator, ",");
  assert.equal(figma.tokenAuth, "basic");
  assert.equal(figma.tokenUrl, "https://api.figma.com/v1/oauth/token");
  assert.equal(figma.refreshUrl, "https://api.figma.com/v1/oauth/refresh");

  const teams = getGenericConnectorProvider("microsoft-teams");
  assert.ok(teams.scopes.includes("TeamMember.Read.All"));
  assert.ok(teams.scopes.includes("Channel.Create"));
  assert.ok(teams.scopes.includes("ChannelSettings.ReadWrite.All"));
  assert.ok(teams.scopes.includes("Channel.Delete.All"));
});

test("generic callback URLs are provider-specific and honor deployment overrides", () => {
  const linear = getGenericConnectorProvider("linear");
  assert.equal(
    buildGenericConnectorCallbackUrl(linear, "https://platform.example.com"),
    "https://platform.example.com/api/aios/connectors/linear/callback",
  );
  assert.equal(
    buildGenericConnectorCallbackUrl(
      linear,
      "https://platform.example.com",
      "https://oauth.example.com/linear",
    ),
    "https://oauth.example.com/linear",
  );
});
