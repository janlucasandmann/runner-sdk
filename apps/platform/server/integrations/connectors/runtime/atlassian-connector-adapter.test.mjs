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
      agentId: "agent_spark",
      agentName: "Spark",
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
  assert.deepEqual(body.historyMetadata, {
    activityDescription: "Created by Spark through Computer Agents",
    actor: {
      id: "agent_spark",
      displayName: "Spark",
      type: "computer-agents-agent",
    },
    generator: {
      id: "computer-agents",
      displayName: "Computer Agents",
      type: "computer-agents-application",
    },
    type: "computer-agents:agent-action",
  });
  assert.deepEqual(body.properties, [{
    key: "computer-agents.attribution",
    value: {
      agentId: "agent_spark",
      agentName: "Spark",
      source: "computer-agents",
    },
  }]);
});

test("Atlassian adapter leaves legacy issue creation un-attributed", async () => {
  let requestBody;
  const adapter = createAtlassianConnectorAdapter({
    async resolveCredential() {
      return {
        token: {
          accessToken: "provider-token",
          cloudId: "cloud-123",
        },
      };
    },
    async fetchImpl(_url, init) {
      requestBody = JSON.parse(init.body);
      return new Response(JSON.stringify({ id: "10002", key: "TEST-2" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  await adapter.invoke({
    grant: {
      organizationId: "org_test",
      credentialId: "credential_project",
    },
    name: "create_issue",
    arguments: {
      projectKey: "TEST",
      issueType: "Task",
      summary: "Legacy connector runtime test",
    },
  });

  assert.equal("historyMetadata" in requestBody, false);
  assert.equal("properties" in requestBody, false);
});

test("Atlassian adapter stores and expands invisible Jira comment properties", async () => {
  const requests = [];
  const adapter = createAtlassianConnectorAdapter({
    async resolveCredential() {
      return {
        token: {
          accessToken: "provider-token",
          cloudId: "cloud-123",
        },
      };
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ comments: [] }), {
        status: init.method === "POST" ? 201 : 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  const grant = {
    organizationId: "org_test",
    credentialId: "credential_project",
  };

  await adapter.invoke({
    grant,
    name: "list_comments",
    arguments: {
      issueIdOrKey: "TEST-1",
      maxResults: 100,
      expand: "properties",
    },
  });
  await adapter.invoke({
    grant,
    name: "add_comment",
    arguments: {
      issueIdOrKey: "TEST-1",
      body: "Completed without a visible retry marker.",
      properties: [{
        key: "computer-agents.delivery",
        value: { eventId: "event_1", kind: "completion" },
      }],
    },
  });

  assert.equal(
    requests[0].url,
    "https://api.atlassian.com/ex/jira/cloud-123/rest/api/3/issue/TEST-1/comment?maxResults=100&expand=properties",
  );
  assert.deepEqual(JSON.parse(requests[1].init.body).properties, [{
    key: "computer-agents.delivery",
    value: { eventId: "event_1", kind: "completion" },
  }]);
});

test("Atlassian adapter refreshes once and retries an expired provider token", async () => {
  const resolverRequests = [];
  const requests = [];
  const adapter = createAtlassianConnectorAdapter({
    async resolveCredential(input) {
      resolverRequests.push(input);
      return {
        token: {
          accessToken: resolverRequests.length === 1
            ? "expired-provider-token"
            : "refreshed-provider-token",
          cloudId: "cloud-123",
        },
      };
    },
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      if (requests.length === 1) {
        return new Response(JSON.stringify({
          errorMessages: ["Token expired"],
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({
        accountId: "jira-account-1",
        displayName: "Agent account",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });

  const result = await adapter.invoke({
    grant: {
      organizationId: "org_test",
      credentialId: "credential_project",
    },
    name: "get_myself",
    arguments: {},
  });

  assert.equal(result.displayName, "Agent account");
  assert.equal(resolverRequests.length, 2);
  assert.deepEqual(resolverRequests[0], {
    organizationId: "org_test",
    credentialId: "credential_project",
    envFileCandidates: [],
  });
  assert.deepEqual(resolverRequests[1], {
    organizationId: "org_test",
    credentialId: "credential_project",
    envFileCandidates: [],
    forceRefresh: true,
  });
  assert.equal(
    requests[1].init.headers.Authorization,
    "Bearer refreshed-provider-token",
  );
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
