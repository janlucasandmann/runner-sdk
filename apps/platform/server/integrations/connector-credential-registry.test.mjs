import assert from "node:assert/strict";
import test from "node:test";

import {
  createConnectorCredentialRegistry,
  getConnectorCredentialRegistryPaths,
} from "./connector-credential-registry.mjs";

function createStorage() {
  const records = new Map();
  return {
    records,
    async getDocument(path) {
      return records.has(path) ? structuredClone(records.get(path)) : null;
    },
    async setDocument(path, value) {
      records.set(path, structuredClone(value));
    },
    async deleteDocument(path) {
      records.delete(path);
    },
    async listDocuments(path) {
      const prefix = `${path}/`;
      return [...records.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([, value]) => structuredClone(value));
    },
  };
}

test("the first organization credential becomes the default", async () => {
  const storage = createStorage();
  const registry = createConnectorCredentialRegistry(storage);

  await registry.register({
    organizationId: "org_1",
    provider: "jira",
    credentialId: "cred_1",
    ownerUserId: "user_1",
    name: "Work Jira",
  });
  await registry.register({
    organizationId: "org_1",
    provider: "jira",
    credentialId: "cred_2",
    ownerUserId: "user_2",
    name: "Partner Jira",
  });

  const resolved = await registry.resolve({
    organizationId: "org_1",
    provider: "jira",
  });
  assert.equal(resolved.credentialId, "cred_1");
  assert.equal(resolved.ownerUserId, "user_1");
  assert.deepEqual(
    (await registry.list({
      organizationId: "org_1",
      provider: "jira",
    })).map((credential) => [credential.credentialId, credential.isDefault]),
    [["cred_1", true], ["cred_2", false]],
  );
});

test("an explicit missing credential never falls back to the default", async () => {
  const storage = createStorage();
  const registry = createConnectorCredentialRegistry(storage);
  await registry.register({
    organizationId: "org_1",
    provider: "github",
    credentialId: "cred_default",
    ownerUserId: "user_1",
  });

  const resolved = await registry.resolve({
    organizationId: "org_1",
    provider: "github",
    credentialId: "cred_missing",
  });
  assert.equal(resolved, null);
});

test("an explicitly selected organization credential becomes the default", async () => {
  const storage = createStorage();
  const registry = createConnectorCredentialRegistry(storage);
  await registry.register({
    organizationId: "org_1",
    provider: "jira",
    credentialId: "cred_1",
    ownerUserId: "user_1",
  });
  await registry.register({
    organizationId: "org_1",
    provider: "jira",
    credentialId: "cred_2",
    ownerUserId: "user_1",
    makeDefault: true,
  });

  assert.equal(
    (await registry.resolve({
      organizationId: "org_1",
      provider: "jira",
    })).credentialId,
    "cred_2",
  );
});

test("deleting a default credential promotes the next organization credential", async () => {
  const storage = createStorage();
  const registry = createConnectorCredentialRegistry(storage);
  await registry.register({
    organizationId: "org_1",
    provider: "github",
    credentialId: "cred_1",
    ownerUserId: "user_1",
    createdAt: 1,
  });
  await registry.register({
    organizationId: "org_1",
    provider: "github",
    credentialId: "cred_2",
    ownerUserId: "user_2",
    createdAt: 2,
  });

  const result = await registry.unregister({
    organizationId: "org_1",
    provider: "github",
    credentialId: "cred_1",
  });
  assert.equal(result.defaultCredentialId, "cred_2");
  assert.equal(
    (await registry.resolve({
      organizationId: "org_1",
      provider: "github",
    })).credentialId,
    "cred_2",
  );
});

test("lists credential providers without exposing credential records", async () => {
  const storage = createStorage();
  const registry = createConnectorCredentialRegistry(storage);
  await registry.register({
    organizationId: "org_1",
    provider: "jira",
    credentialId: "jira_credential",
    ownerUserId: "user_1",
  });
  await registry.register({
    organizationId: "org_1",
    provider: "github",
    credentialId: "github_credential",
    ownerUserId: "user_1",
  });
  await registry.register({
    organizationId: "org_2",
    provider: "slack",
    credentialId: "slack_credential",
    ownerUserId: "user_2",
  });

  assert.deepEqual(
    (await registry.listProviders({ organizationId: "org_1" }))
      .map(({ provider, defaultCredentialId }) => ({
        provider,
        defaultCredentialId,
      })),
    [
      {
        provider: "github",
        defaultCredentialId: "github_credential",
      },
      {
        provider: "jira",
        defaultCredentialId: "jira_credential",
      },
    ],
  );
});

test("registry paths isolate organization and provider scopes", () => {
  assert.deepEqual(
    getConnectorCredentialRegistryPaths({
      organizationId: "org/1",
      provider: "jira",
      credentialId: "cred_1",
    }),
    {
      providerPath:
        "organization_connector_credentials/org%2F1/providers/jira",
      credentialCollectionPath:
        "organization_connector_credentials/org%2F1/providers/jira/credentials",
      credentialPath:
        "organization_connector_credentials/org%2F1/providers/jira/credentials/cred_1",
    },
  );
});
