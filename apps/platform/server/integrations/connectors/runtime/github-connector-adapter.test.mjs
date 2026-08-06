import assert from "node:assert/strict";
import test from "node:test";

import {
  createGithubConnectorAdapter,
} from "./github-connector-adapter.mjs";

const GRANT = Object.freeze({
  actorUserId: "user_test",
  organizationId: "org_test",
  credentialId: "credential_test",
});

test("GitHub adapter exposes the complete trusted capability manifest", () => {
  const adapter = createTestAdapter();
  const capabilities = adapter.listCapabilities();

  assert.equal(capabilities.length, 44);
  assert.deepEqual(
    capabilities.find((capability) => capability.id === "get_me"),
    { id: "get_me", access: "read-only" },
  );
  assert.deepEqual(
    capabilities.find((capability) => capability.id === "create_pull_request"),
    { id: "create_pull_request", access: "interactive" },
  );
});

test("GitHub adapter discovers only signed tools through the official remote MCP server", async () => {
  const requests = [];
  const adapter = createTestAdapter({
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      const body = JSON.parse(init.body);
      assert.equal(body.method, "tools/list");
      return sseResponse({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          tools: [
            {
              name: "get_me",
              description: "Return the authenticated GitHub user.",
              inputSchema: { type: "object", properties: {} },
            },
            {
              name: "search_repositories",
              description: "Search GitHub repositories.",
              inputSchema: {
                type: "object",
                properties: { query: { type: "string" } },
                required: ["query"],
              },
            },
            {
              name: "create_repository",
              description: "This unsigned tool must not escape discovery.",
              inputSchema: { type: "object" },
            },
          ],
        },
      });
    },
  });

  const tools = await adapter.listTools(
    ["get_me", "search_repositories", "not_real"],
    { grant: GRANT },
  );

  assert.deepEqual(tools.map((tool) => tool.name), [
    "get_me",
    "search_repositories",
  ]);
  assert.equal(tools[1].inputSchema.required[0], "query");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://api.githubcopilot.com/mcp/");
  assert.equal(requests[0].init.headers.Authorization, "Bearer provider-token");
  assert.equal(
    requests[0].init.headers["X-MCP-Tools"],
    "get_me,search_repositories",
  );

  const cached = await adapter.listTools(["search_repositories"], {
    grant: GRANT,
  });
  assert.deepEqual(cached.map((tool) => tool.name), ["search_repositories"]);
  assert.equal(requests.length, 1);
});

test("GitHub adapter invokes a signed remote tool with the server-side credential", async () => {
  const requests = [];
  const adapter = createTestAdapter({
    async fetchImpl(url, init) {
      requests.push({ url: String(url), init });
      const body = JSON.parse(init.body);
      assert.deepEqual(body, {
        jsonrpc: "2.0",
        id: "github-tools-call",
        method: "tools/call",
        params: {
          name: "get_me",
          arguments: {},
        },
      });
      return jsonResponse({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{ type: "text", text: '{"login":"octocat"}' }],
          structuredContent: { login: "octocat" },
          isError: false,
        },
      });
    },
  });

  const result = await adapter.invoke({
    grant: GRANT,
    name: "get_me",
    arguments: {},
  });

  assert.deepEqual(result, { login: "octocat" });
  assert.equal(requests[0].init.headers["X-MCP-Tools"], "get_me");
});

function createTestAdapter(overrides = {}) {
  return createGithubConnectorAdapter({
    async resolveCredential(input) {
      assert.deepEqual(input, {
        provider: "github",
        organizationId: "org_test",
        credentialId: "credential_test",
        requestingUserId: "user_test",
        envFileCandidates: [],
        encryptionKeyNames: [
          "GITHUB_TOKEN_ENCRYPTION_KEY",
          "CONNECTOR_TOKEN_ENCRYPTION_KEY",
        ],
      });
      return {
        credentialId: "credential_test",
        token: { accessToken: "provider-token" },
      };
    },
    async fetchImpl() {
      throw new Error("not used");
    },
    ...overrides,
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sseResponse(payload) {
  return new Response(`event: message\ndata: ${JSON.stringify(payload)}\n\n`, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}
