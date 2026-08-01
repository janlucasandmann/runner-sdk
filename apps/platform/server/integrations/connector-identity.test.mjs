import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalizeConnectorId,
  createConnectorActionPrefix,
  getConnectorCredentialProviderId,
  listConnectorIdentityAliases,
} from "./connector-identity.mjs";

test("Atlassian and Jira share one connector identity", () => {
  assert.equal(canonicalizeConnectorId("atlassian"), "jira");
  assert.equal(canonicalizeConnectorId("jira"), "jira");
  assert.deepEqual(listConnectorIdentityAliases("atlassian"), [
    "jira",
    "atlassian",
  ]);
  assert.equal(getConnectorCredentialProviderId("atlassian"), "jira");
  assert.equal(createConnectorActionPrefix("atlassian"), "jira_action_");
});

test("unknown valid connector IDs remain stable", () => {
  assert.equal(canonicalizeConnectorId("custom-service"), "custom-service");
  assert.deepEqual(listConnectorIdentityAliases("custom-service"), [
    "custom-service",
  ]);
  assert.equal(
    getConnectorCredentialProviderId("custom-service"),
    "custom-service",
  );
});
