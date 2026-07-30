import assert from "node:assert/strict";
import test from "node:test";

import {
  ConnectorRuntimeGrantError,
  createConnectorRuntimeGrantService,
} from "./connector-runtime-grants.mjs";

const SECRET = "connector-runtime-test-signing-key-1234567890";

test("connector runtime grants round-trip without provider tokens", async () => {
  const service = createConnectorRuntimeGrantService({
    secret: SECRET,
    now: () => 1_000_000,
    ttlMs: 60_000,
  });
  const token = await service.issue({
    threadId: "thread_test",
    connectorId: "jira",
    provider: "jira",
    organizationId: "org_test",
    credentialId: "credential_test",
    credentialSource: "project",
    projectId: "project_test",
    allowedActions: ["create_issue"],
    approvalRequiredActions: ["delete_issue"],
    policyVersion: 1,
    accessToken: "must-not-leak",
  });
  assert.equal(token.includes("must-not-leak"), false);
  const grant = await service.verify(token);
  assert.equal(grant.threadId, "thread_test");
  assert.equal(grant.credentialSource, "project");
  assert.equal(grant.projectId, "project_test");
  assert.deepEqual(grant.allowedActions, ["create_issue"]);
  assert.equal("accessToken" in grant, false);
});

test("connector runtime grants reject tampering and expiry", async () => {
  let now = 1_000_000;
  const service = createConnectorRuntimeGrantService({
    secret: SECRET,
    now: () => now,
    ttlMs: 60_000,
  });
  const token = await service.issue({
    threadId: "thread_test",
    connectorId: "jira",
    provider: "jira",
    organizationId: "org_test",
    credentialId: "credential_test",
    credentialSource: "organization_default",
    allowedActions: ["get_myself"],
  });
  await assert.rejects(
    service.verify(`${token.slice(0, -1)}x`),
    ConnectorRuntimeGrantError,
  );
  now += 61_000;
  await assert.rejects(
    service.verify(token),
    (error) => error?.code === "connector_runtime_grant_expired",
  );
});
