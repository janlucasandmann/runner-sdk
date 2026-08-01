import assert from "node:assert/strict";
import test from "node:test";

import { createOAuthCredentialRuntime } from "./connector-runtime-utils.mjs";

test("shared OAuth runtime deduplicates refresh and persists rotated tokens", async () => {
  let tokenRequests = 0;
  const persisted = [];
  const credential = {
    organizationId: "org_test",
    credentialId: "credential_test",
    credentialOwnerId: "user_test",
    name: "Test",
    identity: "user@example.com",
    profile: { id: "user-1" },
    token: {
      accessToken: "expired-access-token",
      refreshToken: "single-use-refresh-token",
      expiresAt: 1,
      scope: "read write",
    },
  };
  const runtime = createOAuthCredentialRuntime({
    provider: "example",
    clientIdEnv: "EXAMPLE_CLIENT_ID",
    clientSecretEnv: "EXAMPLE_CLIENT_SECRET",
    tokenUrl: "https://provider.example.com/oauth/token",
    resolveCredential: async () => credential,
    persistCredential: async (input) => {
      persisted.push(input);
    },
    getEnvironmentValue: async (key) =>
      key === "EXAMPLE_CLIENT_ID" ? "client-id" : "client-secret",
    fetchImpl: async (_input, init) => {
      tokenRequests += 1;
      const body = new URLSearchParams(init.body);
      assert.equal(body.get("refresh_token"), "single-use-refresh-token");
      return new Response(
        JSON.stringify({
          access_token: "fresh-access-token",
          refresh_token: "rotated-refresh-token",
          expires_in: 3600,
          scope: "read write",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    },
    now: () => 1_000_000,
  });

  const [first, second] = await Promise.all([
    runtime.resolve({
      organizationId: "org_test",
      credentialId: "credential_test",
    }),
    runtime.resolve({
      organizationId: "org_test",
      credentialId: "credential_test",
    }),
  ]);

  assert.equal(tokenRequests, 1);
  assert.equal(persisted.length, 1);
  assert.equal(first.accessToken, "fresh-access-token");
  assert.equal(second.accessToken, "fresh-access-token");
  assert.equal(persisted[0].token.refreshToken, "rotated-refresh-token");
  assert.equal(persisted[0].token.expiresAt, 4_600_000);
});
