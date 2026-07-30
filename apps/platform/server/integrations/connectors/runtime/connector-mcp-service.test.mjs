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

function createTestService(calls) {
  const definitions = [
    { name: "create_issue", description: "Create", inputSchema: { type: "object" } },
    { name: "delete_issue", description: "Delete", inputSchema: { type: "object" } },
  ];
  return createConnectorMcpService({
    grantService: {
      async verify(token) {
        assert.equal(token, "signed-grant");
        return GRANT;
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
