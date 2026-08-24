import assert from "node:assert/strict";
import test from "node:test";

import { mergeUpstreamRequestPath } from "./core-gateway.mjs";

test("upstream query forwarding preserves every parameter exactly once", () => {
  assert.equal(
    mergeUpstreamRequestPath(
      "/threads?appId=runner_project_calendar&limit=200",
      new URL("http://platform.test/api/real/threads?appId=runner_project_calendar&limit=200"),
    ),
    "/threads?appId=runner_project_calendar&limit=200",
  );
});

test("upstream query forwarding merges route and request parameters", () => {
  assert.equal(
    mergeUpstreamRequestPath(
      "/schedules/executions?limit=100",
      new URL("http://platform.test/api/real/schedules/executions?contextId=project_1&limit=100"),
    ),
    "/schedules/executions?limit=100&contextId=project_1",
  );
});

test("upstream query forwarding preserves intentional multi-value parameters", () => {
  assert.equal(
    mergeUpstreamRequestPath(
      "/threads?status=running",
      new URL("http://platform.test/api/real/threads?status=running&status=completed"),
    ),
    "/threads?status=running&status=completed",
  );
});
