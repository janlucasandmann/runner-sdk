import assert from "node:assert/strict";
import test from "node:test";

import {
  createAtlassianConnectorAdapter,
} from "./atlassian-connector-adapter.mjs";

test("Atlassian adapter creates Jira issues with the resolved scoped credential", async () => {
  const requests = [];
  const adapter = createAtlassianConnectorAdapter({
    async resolveCredential(input) {
      assert.deepEqual(input, {
        organizationId: "org_test",
        credentialId: "credential_project",
        envFileCandidates: [],
      });
      return {
        credentialId: "credential_project",
        token: {
          accessToken: "provider-token",
          cloudId: "cloud-123",
        },
      };
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({
        id: "10001",
        key: "TEST-1",
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  const result = await adapter.invoke({
    grant: {
      organizationId: "org_test",
      credentialId: "credential_project",
    },
    name: "create_issue",
    arguments: {
      projectKey: "TEST",
      issueType: "Task",
      summary: "Connector runtime test",
      description: "Created through the connected Atlassian account.",
    },
  });
  assert.equal(result.key, "TEST-1");
  assert.equal(
    requests[0].url,
    "https://api.atlassian.com/ex/jira/cloud-123/rest/api/3/issue",
  );
  assert.equal(requests[0].init.method, "POST");
  assert.equal(
    requests[0].init.headers.Authorization,
    "Bearer provider-token",
  );
  const body = JSON.parse(requests[0].init.body);
  assert.equal(body.fields.project.key, "TEST");
  assert.equal(body.fields.issuetype.name, "Task");
  assert.equal(body.fields.description.type, "doc");
});

test("Atlassian adapter only lists requested capabilities", () => {
  const adapter = createAtlassianConnectorAdapter({
    async resolveCredential() {
      throw new Error("not used");
    },
    fetchImpl: async () => {
      throw new Error("not used");
    },
  });
  assert.deepEqual(
    adapter.listTools(["get_myself", "create_issue", "not_real"])
      .map((tool) => tool.name),
    ["get_myself", "create_issue"],
  );
});

test("Atlassian adapter exposes its complete server-owned capability catalog", () => {
  const adapter = createAtlassianConnectorAdapter({
    async resolveCredential() {
      throw new Error("not used");
    },
    fetchImpl: async () => {
      throw new Error("not used");
    },
  });
  const capabilities = adapter.listCapabilities();
  assert.ok(capabilities.length > 20);
  assert.deepEqual(
    capabilities.find((capability) => capability.id === "get_myself"),
    { id: "get_myself", access: "read-only" },
  );
  assert.deepEqual(
    capabilities.find((capability) => capability.id === "create_issue"),
    { id: "create_issue", access: "interactive" },
  );
  assert.deepEqual(
    capabilities.find(
      (capability) => capability.id === "confluence_create_page",
    ),
    { id: "confluence_create_page", access: "interactive" },
  );
});
