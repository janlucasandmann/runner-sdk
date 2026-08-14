import assert from "node:assert/strict";
import test from "node:test";

import { createPromptsService } from "./server/index.mjs";

function createHarness() {
  const calls = [];
  const service = createPromptsService({
    proxyUpstreamGet: (...args) => calls.push({ type: "get", args }),
    proxyUpstreamJsonRequest: (...args) => calls.push({ type: "json", args }),
  });
  return { calls, service };
}

test("prompts service forwards list and detail reads to the control API", () => {
  const { calls, service } = createHarness();
  const req = { method: "GET" };
  const res = {};

  assert.equal(
    service.handleRequest(req, res, new URL("https://platform.test/api/real/prompts?limit=20")),
    true,
  );
  assert.equal(
    service.handleRequest(req, res, new URL("https://platform.test/api/real/prompts/prompt%20one")),
    true,
  );
  assert.deepEqual(calls, [
    { type: "get", args: [req, res, "/prompts"] },
    { type: "get", args: [req, res, "/prompts/prompt%20one"] },
  ]);
});

test("prompts service forwards mutations without retaining local state", () => {
  const { calls, service } = createHarness();
  const res = {};
  const requests = [
    ["POST", "/api/real/prompts", "/prompts"],
    ["PATCH", "/api/real/prompts/prompt-1", "/prompts/prompt-1"],
    ["POST", "/api/real/prompts/prompt-1/versions", "/prompts/prompt-1/versions"],
    [
      "PATCH",
      "/api/real/prompts/prompt-1/versions/version-2",
      "/prompts/prompt-1/versions/version-2",
    ],
    [
      "POST",
      "/api/real/prompts/prompt-1/versions/version-2/publish",
      "/prompts/prompt-1/versions/version-2/publish",
    ],
    ["DELETE", "/api/real/prompts/prompt-1", "/prompts/prompt-1"],
  ];

  for (const [method, pathname] of requests) {
    assert.equal(
      service.handleRequest({ method }, res, new URL(`https://platform.test${pathname}`)),
      true,
    );
  }

  assert.deepEqual(
    calls.map(({ type, args }) => [type, args[2], args[3]]),
    requests.map(([method, , upstreamPath]) => ["json", upstreamPath, method]),
  );
});

test("prompts service declines unrelated paths and unsupported methods", () => {
  const { calls, service } = createHarness();
  assert.equal(
    service.handleRequest(
      { method: "GET" },
      {},
      new URL("https://platform.test/api/real/agents"),
    ),
    false,
  );
  assert.equal(
    service.handleRequest(
      { method: "PUT" },
      {},
      new URL("https://platform.test/api/real/prompts/prompt-1"),
    ),
    false,
  );
  assert.deepEqual(calls, []);
});

test("prompts service requires both upstream transport adapters", () => {
  assert.throws(
    () => createPromptsService({ proxyUpstreamJsonRequest() {} }),
    /proxyUpstreamGet adapter/,
  );
  assert.throws(
    () => createPromptsService({ proxyUpstreamGet() {} }),
    /proxyUpstreamJsonRequest adapter/,
  );
});
