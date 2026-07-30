import assert from "node:assert/strict";
import test from "node:test";

import {
  createConnectorRuntimeBridge,
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

test("connector runtime bridge canonicalizes Atlassian grants to Jira credentials", async () => {
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

  await bridge.addRuntimeServers({
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

  assert.equal(issued[0].connectorId, "atlassian");
  assert.equal(issued[0].provider, "jira");
  assert.equal(issued[0].credentialId, "credential_project");
  assert.equal(issued[0].projectId, "project_test");
});
