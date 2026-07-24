import assert from "node:assert/strict";
import test from "node:test";

import {
  createServerDetailBootstrapGateway,
  normalizeServerDetailBootstrapIncludes,
} from "./server-detail-bootstrap.mjs";

test("server detail bootstrap chooses minimal defaults per resource kind", () => {
  assert.deepEqual(
    normalizeServerDetailBootstrapIncludes("", "function"),
    ["bindings", "context", "versions"],
  );
  assert.deepEqual(
    normalizeServerDetailBootstrapIncludes("", "auth"),
    ["auth-users"],
  );
  assert.deepEqual(
    normalizeServerDetailBootstrapIncludes("runs,unknown,runs", "agent_runtime"),
    ["runs"],
  );
});

test("server detail bootstrap parallelizes requested resources and preserves partial results", async () => {
  const requestedPaths = [];
  let sent = null;
  const sendServerDetailBootstrap = createServerDetailBootstrapGateway({
    async fetchUpstreamOverviewJson(_req, path) {
      requestedPaths.push(path);
      if (path.endsWith("/bindings")) {
        return { status: 503, data: { message: "Bindings unavailable" } };
      }
      if (path.endsWith("/context")) {
        return { status: 200, data: { bindings: [], runtime: { nodejs: "22" } } };
      }
      return { status: 200, data: { server: { id: "srv_1", kind: "function" } } };
    },
    sendJson(_res, status, payload, headers = {}) {
      sent = { status, payload, headers };
      return true;
    },
  });

  await sendServerDetailBootstrap({}, {}, "srv_1", {
    kind: "function",
    include: "context,bindings",
  });

  assert.equal(sent.status, 200);
  assert.deepEqual(requestedPaths.sort(), [
    "/servers/srv_1",
    "/servers/srv_1/bindings",
    "/servers/srv_1/context",
  ]);
  assert.deepEqual(sent.payload.resources.context, {
    bindings: [],
    runtime: { nodejs: "22" },
  });
  assert.equal(sent.payload.resources.bindings, null);
  assert.equal(sent.payload.errors.bindings.status, 503);
  assert.match(sent.headers["Server-Timing"], /server;dur=/);
  assert.match(sent.headers["Server-Timing"], /total;dur=/);
});

test("server detail bootstrap forwards bounded collection limits", async () => {
  const requestedPaths = [];
  const sendServerDetailBootstrap = createServerDetailBootstrapGateway({
    async fetchUpstreamOverviewJson(_req, path) {
      requestedPaths.push(path);
      return { status: 200, data: path.endsWith("/servers/srv_2") ? { id: "srv_2" } : {} };
    },
    sendJson() {
      return true;
    },
  });

  await sendServerDetailBootstrap({}, {}, "srv_2", {
    include: "auth-users,runs",
    authUsersLimit: 999,
    runsLimit: 0,
  });

  assert.ok(requestedPaths.includes("/servers/srv_2/auth-users?limit=200"));
  assert.ok(requestedPaths.includes("/servers/srv_2/runs?limit=1"));
});
