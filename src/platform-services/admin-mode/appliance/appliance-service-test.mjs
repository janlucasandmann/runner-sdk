import assert from "node:assert/strict";
import test from "node:test";
import {
  APPLIANCE_ADMIN_LIFECYCLE_SCRIPT,
  APPLIANCE_ADMIN_PAGE_SCRIPT,
  APPLIANCE_ADMIN_SIDEBAR_ENTRY_SCRIPT,
  APPLIANCE_ADMIN_STATE_SCRIPT,
  APPLIANCE_ADMIN_CSS,
} from "./index.mjs";

test("appliance admin service stays appliance-only and uses the protected overview route", () => {
  assert.match(APPLIANCE_ADMIN_SIDEBAR_ENTRY_SCRIPT, /label: "Appliance"/);
  assert.match(APPLIANCE_ADMIN_LIFECYCLE_SCRIPT, /platformDeploymentProfile\.topology !== "on_prem"/);
  assert.match(APPLIANCE_ADMIN_LIFECYCLE_SCRIPT, /\/api\/real\/admin\/appliance-overview/);
  assert.match(APPLIANCE_ADMIN_LIFECYCLE_SCRIPT, /Number\(payload\.schemaVersion\) !== 1/);
  assert.match(APPLIANCE_ADMIN_STATE_SCRIPT, /applianceOverviewAbortControllerRef/);
});

test("appliance page exposes aggregate capacity and usage without host identities", () => {
  assert.match(APPLIANCE_ADMIN_PAGE_SCRIPT, /Inference Tokens/);
  assert.match(APPLIANCE_ADMIN_PAGE_SCRIPT, /Running Containers/);
  assert.match(APPLIANCE_ADMIN_PAGE_SCRIPT, /Available Storage/);
  assert.match(APPLIANCE_ADMIN_PAGE_SCRIPT, /Unified memory/);
  assert.doesNotMatch(APPLIANCE_ADMIN_PAGE_SCRIPT, /hostname|networkAddresses|mounts/i);
  assert.match(APPLIANCE_ADMIN_CSS, /platform-appliance-overview__metrics/);
});
