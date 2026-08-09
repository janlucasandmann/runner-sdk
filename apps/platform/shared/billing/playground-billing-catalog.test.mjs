import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import {
  PLAYGROUND_BILLING_CATALOG_SCRIPT,
  PLAYGROUND_BILLING_FALLBACK_CATALOG,
} from "./playground-billing-catalog.mjs";

const canonicalPlanIds = ["sandbox", "builder", "team", "enterprise"];
const paidPlanIds = ["builder", "team", "enterprise"];

test("billing fallback exposes four canonical plans", () => {
  assert.deepEqual(
    PLAYGROUND_BILLING_FALLBACK_CATALOG.plans.map((plan) => plan.id),
    canonicalPlanIds,
  );
  assert.equal(
    PLAYGROUND_BILLING_FALLBACK_CATALOG.plans.find((plan) => plan.id === "sandbox")?.name,
    "Pay-as-you-go",
  );
  assert.equal(
    PLAYGROUND_BILLING_FALLBACK_CATALOG.plans.find((plan) => plan.id === "enterprise")?.name,
    "Enterprise",
  );
});

test("subscription chooser exposes only the three paid plans", () => {
  const icon = () => null;
  const context = vm.createContext({
    Battery: icon,
    BatteryLow: icon,
    BatteryMedium: icon,
    BatteryFull: icon,
    Coins: icon,
    User: icon,
    Layers: icon,
    Shield: icon,
    HardDrive: icon,
    Sparkles: icon,
    SETTINGS_CT_PER_DOLLAR: 1_000,
    formatSettingsComputeTokens: (value) => String(value),
  });

  vm.runInContext(
    `${PLAYGROUND_BILLING_CATALOG_SCRIPT}\nthis.__billingResult = {\n  planIds: SETTINGS_PLAN_CATALOG.map((plan) => plan.id),\n  optionIds: getSettingsPlanOptions().map((plan) => plan.id),\n  legacyBusinessId: normalizeSettingsTierId("business"),\n};`,
    context,
  );

  assert.deepEqual(Array.from(context.__billingResult.planIds), canonicalPlanIds);
  assert.deepEqual(Array.from(context.__billingResult.optionIds), paidPlanIds);
  assert.equal(context.__billingResult.legacyBusinessId, "enterprise");
});
