import assert from "node:assert/strict";
import test from "node:test";

import { createDeployableAppRoutes } from "./deployable-app-routes.mjs";

test("deployable application routes own only enabled application paths", () => {
  let calls = 0;
  const enabled = createDeployableAppRoutes({
    deployableAppGatewayEnabled: true,
    proxyDeployableAppRequest() {
      calls += 1;
    },
  });
  assert.equal(
    enabled({}, {}, new URL("https://platform.example/runtime/apps/srv_test")),
    true,
  );
  assert.equal(calls, 1);
  assert.equal(
    enabled({}, {}, new URL("https://platform.example/runtime/apps")),
    false,
  );
  assert.equal(calls, 1);

  const disabled = createDeployableAppRoutes({
    deployableAppGatewayEnabled: false,
    proxyDeployableAppRequest() {
      calls += 1;
    },
  });
  assert.equal(
    disabled({}, {}, new URL("https://platform.example/runtime/apps/srv_test")),
    false,
  );
  assert.equal(calls, 1);
});
