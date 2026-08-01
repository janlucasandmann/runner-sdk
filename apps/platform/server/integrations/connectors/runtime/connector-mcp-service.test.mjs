import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import {
  createConnectorMcpService,
} from "./connector-mcp-service.mjs";

const GRANT = Object.freeze({
  threadId: "thread_test",
  connectorId: "jira",
  provider: "jira",
  organizationId: "org_test",
  credentialId: "credential_test",
  credentialSource: "organization_default",
  allowedActions: Object.freeze(["create_issue"]),
  approvalRequiredActions: Object.freeze(["delete_issue"]),
});

test("connector MCP exposes only granted tools and invokes allowed actions", async () => {
  const calls = [];
  const service = createTestService(calls);
  const listed = await request(service, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {},
  });
  assert.deepEqual(
    listed.body.result.tools.map((tool) => tool.name),
    ["create_issue", "delete_issue"],
  );
  assert.match(
    listed.body.result.tools[1].description,
    /requires explicit approval/i,
  );

  const called = await request(service, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "create_issue",
      arguments: { summary: "Test" },
    },
  });
  assert.equal(called.body.result.isError, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "create_issue");
});

test("connector MCP fails closed for approval-required and denied actions", async () => {
  const calls = [];
  const service = createTestService(calls);
  const approval = await request(service, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "delete_issue", arguments: {} },
  });
  assert.equal(approval.body.result.isError, true);
  assert.equal(
    approval.body.result.structuredContent.error.code,
    "connector_approval_required",
  );

  const denied = await request(service, {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "transition_issue", arguments: {} },
  });
  assert.equal(denied.body.result.isError, true);
  assert.equal(
    denied.body.result.structuredContent.error.code,
    "connector_action_denied",
  );
  assert.equal(calls.length, 0);
});

test("connector MCP canonicalizes one unambiguous tool alias to the signed action", async () => {
  const calls = [];
  const service = createTestService(calls);
  const called = await request(service, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "createIssue",
      arguments: { summary: "Alias" },
    },
  });

  assert.equal(called.body.result.isError, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].name, "create_issue");
});

test("connector MCP unwraps and repairs omitted optional values from raw tool arguments", async () => {
  const calls = [];
  const service = createTestService(calls);
  const called = await request(service, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "create_issue",
      arguments: {
        raw: '{"assigneeAccountId": , "description":"literal: ,", "projectKey":"KAN", "summary":"Acceptance"}',
      },
    },
  });

  assert.equal(called.body.result.isError, false);
  assert.deepEqual(calls[0].arguments, {
    assigneeAccountId: null,
    description: "literal: ,",
    projectKey: "KAN",
    summary: "Acceptance",
  });
});

test("connector MCP rejects arbitrary malformed raw tool arguments", async () => {
  const calls = [];
  const service = createTestService(calls);
  const called = await request(service, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "create_issue",
      arguments: { raw: "not-json" },
    },
  });

  assert.equal(called.body.result.isError, true);
  assert.equal(
    called.body.result.structuredContent.error.code,
    "connector_arguments_invalid",
  );
  assert.equal(calls.length, 0);
});

test("connector MCP preserves raw when the connector tool declares that argument", async () => {
  const calls = [];
  const service = createTestService(calls, {
    ...GRANT,
    allowedActions: ["create_issue"],
  }, [
    {
      name: "create_issue",
      description: "Create",
      inputSchema: {
        type: "object",
        properties: { raw: { type: "string" } },
      },
    },
  ]);
  const called = await request(service, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "create_issue",
      arguments: { raw: "connector-native-input" },
    },
  });

  assert.equal(called.body.result.isError, false);
  assert.deepEqual(calls[0].arguments, { raw: "connector-native-input" });
});

test("connector MCP rejects ambiguous semantic aliases", async () => {
  const calls = [];
  const grant = {
    ...GRANT,
    allowedActions: ["foo_bar", "foobar"],
    approvalRequiredActions: [],
  };
  const service = createTestService(calls, grant, [
    { name: "foo_bar", description: "One", inputSchema: { type: "object" } },
    { name: "foobar", description: "Two", inputSchema: { type: "object" } },
  ]);
  const called = await request(service, {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: "foo-bar", arguments: {} },
  });

  assert.equal(called.body.result.isError, true);
  assert.equal(
    called.body.result.structuredContent.error.code,
    "connector_action_denied",
  );
  assert.equal(calls.length, 0);
});

function createTestService(calls, grant = GRANT, definitions = [
    { name: "create_issue", description: "Create", inputSchema: { type: "object" } },
    { name: "delete_issue", description: "Delete", inputSchema: { type: "object" } },
  ]) {
  return createConnectorMcpService({
    grantService: {
      async verify(token) {
        assert.equal(token, "signed-grant");
        return grant;
      },
    },
    adapterRegistry: {
      get(id) {
        assert.equal(id, "jira");
        return {
          listTools(actionIds) {
            const allowed = new Set(actionIds);
            return definitions.filter((item) => allowed.has(item.name));
          },
          async invoke(input) {
            calls.push(input);
            return { key: "TEST-1" };
          },
        };
      },
    },
    logger: null,
  });
}

async function request(service, payload) {
  const req = Readable.from([Buffer.from(JSON.stringify(payload))]);
  req.method = "POST";
  req.headers = { authorization: "Bearer signed-grant" };
  const result = await new Promise((resolve) => {
    const response = {
      statusCode: 0,
      headers: {},
      writeHead(statusCode, headers) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(body) {
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: body ? JSON.parse(String(body)) : null,
        });
      },
    };
    assert.equal(
      service.handleRequest(
        req,
        response,
        new URL("https://platform.test/api/aios/connectors/mcp"),
      ),
      true,
    );
  });
  return result;
}
