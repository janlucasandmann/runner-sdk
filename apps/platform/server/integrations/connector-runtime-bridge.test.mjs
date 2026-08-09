import assert from "node:assert/strict";
import test from "node:test";

import {
  createConnectorRuntimeBridge,
  resolveRuntimeOrigin,
} from "./connector-runtime-bridge.mjs";

test("connector runtime bridge injects one scoped MCP server per connector", async () => {
  const issued = [];
  const bridge = createConnectorRuntimeBridge({
    platformOrigin: "https://platform.example.test",
    grantService: {
      async issue(input) {
        issued.push(input);
        return `grant-${input.connectorId}`;
      },
    },
    logger: null,
  });
  const payload = await bridge.addRuntimeServers({
    threadId: "thread_test",
    payload: {
      content: "Create the issue.",
      connectors: {
        jira: {
          agentId: "agent_test",
          agentName: "Spark",
          actorUserId: "user_test",
          organizationId: "org_test",
          credentialId: "credential_project",
          credentialResolution: {
            source: "project",
            projectId: "project_test",
          },
          allowedActions: ["create_issue"],
          approvalRequiredActions: [],
          policyVersion: 1,
        },
      },
    },
  });
  assert.equal(issued.length, 1);
  assert.equal(issued[0].agentId, "agent_test");
  assert.equal(issued[0].agentName, "Spark");
  assert.equal(issued[0].actorUserId, "user_test");
  assert.equal(issued[0].credentialSource, "project");
  assert.equal(issued[0].projectId, "project_test");
  assert.deepEqual(payload.mcpServers, [{
    type: "http",
    name: "connector_jira",
    url: "https://platform.example.test/api/aios/connectors/mcp",
    bearerToken: "grant-jira",
    enabled: true,
    platformManaged: true,
  }]);
  assert.equal(JSON.stringify(payload).includes("accessToken"), false);
});

test("connector runtime bridge leaves connector-free requests unchanged", async () => {
  const bridge = createConnectorRuntimeBridge({
    platformOrigin: "https://platform.example.test",
    grantService: {
      async issue() {
        throw new Error("should not issue");
      },
    },
    logger: null,
  });
  const payload = { content: "Hello" };
  assert.equal(
    await bridge.addRuntimeServers({ threadId: "thread_test", payload }),
    payload,
  );
});

test("connector runtime bridge canonicalizes Atlassian grants and MCP identity to Jira", async () => {
  const issued = [];
  const bridge = createConnectorRuntimeBridge({
    platformOrigin: "https://platform.example.test",
    grantService: {
      async issue(input) {
        issued.push(input);
        return "grant-atlassian";
      },
    },
    logger: null,
  });

  const payload = await bridge.addRuntimeServers({
    threadId: "thread_atlassian",
    payload: {
      connectors: {
        atlassian: {
          organizationId: "org_test",
          credentialId: "credential_project",
          credentialResolution: {
            source: "project",
            projectId: "project_test",
          },
          allowedActions: ["create_issue"],
          approvalRequiredActions: [],
          policyVersion: 1,
        },
      },
    },
  });

  assert.equal(issued[0].connectorId, "jira");
  assert.equal(issued[0].provider, "jira");
  assert.equal(issued[0].credentialId, "credential_project");
  assert.equal(issued[0].projectId, "project_test");
  assert.equal(payload.mcpServers[0].name, "connector_jira");
});

test("connector runtime bridge rejects loopback origins that containers cannot reach", async () => {
  await assert.rejects(
    resolveRuntimeOrigin({
      platformOrigin: "http://localhost:4177",
      envFileCandidates: [],
    }),
    /must be reachable from the agent runtime/,
  );
});

test("connector runtime bridge accepts a container-reachable development origin", async () => {
  assert.equal(
    await resolveRuntimeOrigin({
      platformOrigin: "http://host.docker.internal:4177",
      envFileCandidates: [],
    }),
    "http://host.docker.internal:4177/",
  );
});
