import assert from "node:assert/strict";
import test from "node:test";

import { createAgentResourceRoutes } from "./agent-resource-routes.mjs";
import { createComputeResourceRoutes } from "./compute-resource-routes.mjs";
import { createDatabaseRoutes } from "./database-routes.mjs";
import { createPlatformResourceRoutes } from "./platform-resource-routes.mjs";
import { createThreadRoutes } from "./thread-routes.mjs";

function captureUpstreamPath(createHandler, requestUrl, extraBindings = {}) {
  const upstreamPaths = [];
  const handler = createHandler({
    proxyUpstreamGet(_req, _res, upstreamPath) {
      upstreamPaths.push(upstreamPath);
    },
    ...extraBindings,
  });

  const handled = handler(
    { method: "GET" },
    {},
    new URL(requestUrl),
  );

  assert.equal(handled, true);
  assert.equal(upstreamPaths.length, 1);
  return upstreamPaths[0];
}

test("collection gateways preserve paging and projection query parameters", () => {
  assert.equal(
    captureUpstreamPath(
      createThreadRoutes,
      "http://platform.test/api/real/threads?limit=20&offset=40",
    ),
    "/threads?limit=20&offset=40",
  );
  assert.equal(
    captureUpstreamPath(
      createAgentResourceRoutes,
      "http://platform.test/api/real/agents?view=overview&limit=100",
      { modelsService: { handleRequest: () => false } },
    ),
    "/agents?view=overview&limit=100",
  );
  assert.equal(
    captureUpstreamPath(
      createComputeResourceRoutes,
      "http://platform.test/api/real/environments?limit=50",
    ),
    "/environments?limit=50",
  );
  assert.equal(
    captureUpstreamPath(
      createDatabaseRoutes,
      "http://platform.test/api/real/databases?limit=25",
    ),
    "/databases?limit=25",
  );
  assert.equal(
    captureUpstreamPath(
      createPlatformResourceRoutes,
      "http://platform.test/api/real/skills?limit=100",
      { matchPlaygroundBillingProxyRoute: () => null },
    ),
    "/v1/skills?limit=100",
  );
});

test("account data-control deletes are forwarded to the authenticated control API", () => {
  const calls = [];
  const handler = createPlatformResourceRoutes({
    matchPlaygroundBillingProxyRoute: () => null,
    proxyUpstreamGet() {},
    proxyUpstreamJsonRequest(_req, _res, upstreamPath, method) {
      calls.push({ upstreamPath, method });
    },
  });

  const handled = handler(
    { method: "DELETE" },
    {},
    new URL("http://platform.test/api/real/account/data-controls/knowledge-libraries"),
  );

  assert.equal(handled, true);
  assert.deepEqual(calls, [{
    upstreamPath: "/account/data-controls/knowledge-libraries",
    method: "DELETE",
  }]);
});
