import assert from "node:assert/strict";
import test from "node:test";

import { createPublicApiRoutes } from "./public-api-routes.mjs";

test("public API routes are available only when the appliance gateway is enabled", () => {
  let calls = 0;
  const request = {};
  const response = {};
  const url = new URL("https://platform.example/v1/threads");

  const cloudRoute = createPublicApiRoutes({
    publicApiEnabled: false,
    proxyPublicApiRequest() {
      calls += 1;
    },
  });
  assert.equal(cloudRoute(request, response, url), false);
  assert.equal(calls, 0);

  const applianceRoute = createPublicApiRoutes({
    publicApiEnabled: true,
    proxyPublicApiRequest() {
      calls += 1;
    },
  });
  assert.equal(applianceRoute(request, response, url), true);
  assert.equal(calls, 1);
});
