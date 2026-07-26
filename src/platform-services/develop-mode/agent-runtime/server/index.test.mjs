import assert from "node:assert/strict";
import test from "node:test";

import { createAgentRuntimeService } from "./index.mjs";

function createResponseRecorder() {
  return {};
}

test("Agent Runtime service forwards canonical list and run requests", async () => {
  const calls = [];
  const service = createAgentRuntimeService({
    proxyUpstreamGet(req, res, path) {
      calls.push({ method: "GET", path });
    },
    proxyUpstreamJsonRequest(req, res, path, method) {
      calls.push({ method, path });
    },
  });
  const response = createResponseRecorder();

  assert.equal(
    service.handleRequest(
      { method: "GET" },
      response,
      new URL("http://platform.local/api/real/agent-runtimes?limit=20"),
    ),
    true,
  );
  assert.equal(
    service.handleRequest(
      { method: "GET" },
      response,
      new URL(
        "http://platform.local/api/real/agent-runtimes/runtime%2Fone/runs?limit=20",
      ),
    ),
    true,
  );

  assert.deepEqual(calls, [
    { method: "GET", path: "/agent-runtimes?limit=20" },
    {
      method: "GET",
      path: "/agent-runtimes/runtime%2Fone/runs?limit=20",
    },
  ]);
});

test("Agent Runtime service forwards lifecycle mutations without query leakage", () => {
  const calls = [];
  const service = createAgentRuntimeService({
    proxyUpstreamGet() {},
    proxyUpstreamJsonRequest(req, res, path, method) {
      calls.push({ method, path });
    },
  });
  const response = createResponseRecorder();

  for (const action of ["deploy", "decommission"]) {
    assert.equal(
      service.handleRequest(
        { method: "POST" },
        response,
        new URL(
          `http://platform.local/api/real/agent-runtimes/runtime%2Fone/${action}?ignored=true`,
        ),
      ),
      true,
    );
  }

  assert.deepEqual(calls, [
    {
      method: "POST",
      path: "/agent-runtimes/runtime%2Fone/deploy",
    },
    {
      method: "POST",
      path: "/agent-runtimes/runtime%2Fone/decommission",
    },
  ]);
});

test("Agent Runtime service rejects unrelated and unsupported requests", () => {
  const service = createAgentRuntimeService({
    proxyUpstreamGet() {},
    proxyUpstreamJsonRequest() {},
  });
  const response = createResponseRecorder();

  assert.equal(
    service.handleRequest(
      { method: "GET" },
      response,
      new URL("http://platform.local/api/real/servers"),
    ),
    false,
  );
  assert.equal(
    service.handleRequest(
      { method: "PUT" },
      response,
      new URL("http://platform.local/api/real/agent-runtimes/runtime-one"),
    ),
    false,
  );
});

test("Agent Runtime service safely forwards malformed encoded identifiers", () => {
  const calls = [];
  const service = createAgentRuntimeService({
    proxyUpstreamGet(req, res, path) {
      calls.push(path);
    },
    proxyUpstreamJsonRequest() {},
  });

  assert.equal(
    service.handleRequest(
      { method: "GET" },
      createResponseRecorder(),
      {
        pathname: "/api/real/agent-runtimes/runtime%broken",
        search: "",
      },
    ),
    true,
  );
  assert.deepEqual(calls, ["/agent-runtimes/runtime%25broken"]);
});
