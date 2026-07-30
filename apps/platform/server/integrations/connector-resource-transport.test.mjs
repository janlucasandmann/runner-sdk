import assert from "node:assert/strict";
import test from "node:test";

import {
  buildHostedResourcePath,
  buildRunnerResourceUrl,
  createConnectorResourceTransport,
} from "./connector-resource-transport.mjs";

test("uses the runner API key for protected connector resource reads", async () => {
  const calls = [];
  const transport = createConnectorResourceTransport({
    async fetchImpl(url, init) {
      calls.push({ url, init });
      return new Response("{}", { status: 200 });
    },
    async fetchAiosCloud() {
      throw new Error("session cloud transport should not be used");
    },
    withProxyOrganizationHeader(_req, _body, headers) {
      return {
        ...headers,
        "X-Computer-Agents-Organization": "org_1",
      };
    },
  });

  await transport(
    { headers: {} },
    "/agents/agent_1",
    {
      method: "GET",
      headers: { accept: "application/json" },
    },
    {
      upstreamUrl: "https://api.example.test/v1/",
      apiKey: "api_key_1",
    },
  );

  assert.equal(
    calls[0].url,
    "https://api.example.test/v1/agents/agent_1",
  );
  assert.equal(calls[0].init.headers["X-API-Key"], "api_key_1");
  assert.equal(
    calls[0].init.headers["X-Computer-Agents-Organization"],
    "org_1",
  );
});

test("uses the authenticated cloud transport when no API key is present", async () => {
  const calls = [];
  const transport = createConnectorResourceTransport({
    async fetchImpl() {
      throw new Error("direct runner transport should not be used");
    },
    async fetchAiosCloud(req, path, init) {
      calls.push({ req, path, init });
      return new Response("{}", { status: 200 });
    },
    async fetchAiosApi() {
      throw new Error("legacy hosted fallback should not be used");
    },
    withProxyOrganizationHeader(_req, _body, headers) {
      return headers;
    },
  });
  const req = { headers: { cookie: "session=1" } };

  await transport(req, "/threads/thread_1", { method: "GET" }, {});

  assert.equal(calls[0].req, req);
  assert.equal(calls[0].path, "/threads/thread_1");
});

test("falls back to the hosted resource route only for session cloud 404s", async () => {
  const calls = [];
  const transport = createConnectorResourceTransport({
    async fetchImpl() {
      throw new Error("direct runner transport should not be used");
    },
    async fetchAiosCloud(_req, path) {
      calls.push(["cloud", path]);
      return new Response("{}", { status: 404 });
    },
    async fetchAiosApi(_req, path) {
      calls.push(["hosted", path]);
      return new Response("{}", { status: 200 });
    },
    withProxyOrganizationHeader(_req, _body, headers) {
      return headers;
    },
  });

  const response = await transport(
    { headers: {} },
    "/agents/agent_1",
    { method: "GET" },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, [
    ["cloud", "/agents/agent_1"],
    ["hosted", "/api/agents/agent_1"],
  ]);
});

test("preserves the runner API base path when joining resource URLs", () => {
  assert.equal(
    buildRunnerResourceUrl(
      "https://api.example.test/v1/",
      "/projects/project_1",
    ),
    "https://api.example.test/v1/projects/project_1",
  );
});

test("builds hosted resource paths without dropping the API prefix", () => {
  assert.equal(
    buildHostedResourcePath("/projects/project_1"),
    "/api/projects/project_1",
  );
});
