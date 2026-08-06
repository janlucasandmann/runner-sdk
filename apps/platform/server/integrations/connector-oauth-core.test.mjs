import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import test from "node:test";

import {
  listConnectorCredentialLoadCandidateIds,
  listOrganizationConnectorCredentials,
  resolveConnectorCredentialForOrganization,
  saveConnectorCredential,
} from "./connector-oauth-core.mjs";

test("connector credential loading keeps the default first and then tries newest fallbacks", () => {
  const store = {
    defaultCredentialId: "credential_old_default",
    credentials: {
      credential_old_default: {
        id: "credential_old_default",
        updatedAt: 100,
      },
      credential_newest: {
        id: "credential_newest",
        updatedAt: 300,
      },
      credential_middle: {
        id: "credential_middle",
        updatedAt: 200,
      },
    },
  };

  assert.deepEqual(listConnectorCredentialLoadCandidateIds(store), [
    "credential_old_default",
    "credential_newest",
    "credential_middle",
  ]);
  assert.deepEqual(
    listConnectorCredentialLoadCandidateIds(store, "credential_middle"),
    ["credential_middle"],
  );
});

test("organization credential resolution survives encryption-key rotation", async () => {
  const previousFetch = globalThis.fetch;
  const documents = new Map();
  const oldKeyName = `TEST_CONNECTOR_OLD_KEY_${Date.now()}`;
  const newKeyName = `TEST_CONNECTOR_NEW_KEY_${Date.now()}`;
  process.env[oldKeyName] = randomBytes(32).toString("base64");
  globalThis.fetch = createFirestoreFetch(documents);

  try {
    await saveConnectorCredential({
      provider: "jira",
      uid: "user_1",
      credentialId: "credential_old",
      organizationId: "org_1",
      identity: "Old account",
      token: { accessToken: "old-token", scope: "read:jira-work" },
      makeDefault: true,
      envFileCandidates: [],
      encryptionKeyNames: [oldKeyName],
    });

    process.env[newKeyName] = randomBytes(32).toString("base64");
    await saveConnectorCredential({
      provider: "jira",
      uid: "user_1",
      credentialId: "credential_new",
      organizationId: "org_1",
      identity: "New account",
      token: { accessToken: "new-token", scope: "read:jira-work" },
      makeDefault: true,
      envFileCandidates: [],
      encryptionKeyNames: [newKeyName],
    });

    delete process.env[newKeyName];
    const resolved = await resolveConnectorCredentialForOrganization({
      provider: "jira",
      organizationId: "org_1",
      requestingUserId: "user_1",
      envFileCandidates: [],
      encryptionKeyNames: [newKeyName, oldKeyName],
    });

    assert.equal(resolved.credentialId, "credential_old");
    assert.equal(resolved.token.accessToken, "old-token");
    const credentials = await listOrganizationConnectorCredentials({
      organizationId: "org_1",
      provider: "jira",
      envFileCandidates: [],
    });
    assert.equal(
      credentials.find((credential) => credential.isDefault)?.id,
      "credential_old",
    );
  } finally {
    delete process.env[oldKeyName];
    delete process.env[newKeyName];
    globalThis.fetch = previousFetch;
  }
});

function createFirestoreFetch(documents) {
  return async (input, init = {}) => {
    const url = new URL(String(input));
    if (url.hostname === "metadata.google.internal") {
      return jsonResponse({ access_token: "test-access-token", expires_in: 3600 });
    }
    const marker = "/documents/";
    const markerIndex = url.pathname.indexOf(marker);
    if (url.hostname !== "firestore.googleapis.com" || markerIndex === -1) {
      throw new Error(`Unexpected test request: ${url}`);
    }
    const documentPath = url.pathname.slice(markerIndex + marker.length);
    const method = String(init.method || "GET").toUpperCase();
    if (method === "GET" && url.searchParams.has("pageSize")) {
      const prefix = `${documentPath}/`;
      const listed = [...documents.entries()]
        .filter(([path]) => {
          const suffix = path.startsWith(prefix) ? path.slice(prefix.length) : "";
          return suffix && !suffix.includes("/");
        })
        .map(([path, document]) => ({
          ...structuredClone(document),
          name: `projects/test/databases/(default)/documents/${path}`,
        }));
      return jsonResponse({ documents: listed });
    }
    if (method === "GET") {
      return documents.has(documentPath)
        ? jsonResponse(structuredClone(documents.get(documentPath)))
        : jsonResponse({ error: "not found" }, 404);
    }
    if (method === "PATCH") {
      const body = JSON.parse(String(init.body || "{}"));
      const current = documents.get(documentPath) || { fields: {} };
      const document = {
        ...current,
        fields: {
          ...(current.fields || {}),
          ...(body.fields || {}),
        },
      };
      documents.set(documentPath, document);
      return jsonResponse(structuredClone(document));
    }
    if (method === "DELETE") {
      documents.delete(documentPath);
      return new Response(null, { status: 204 });
    }
    throw new Error(`Unexpected Firestore test method: ${method}`);
  };
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}
