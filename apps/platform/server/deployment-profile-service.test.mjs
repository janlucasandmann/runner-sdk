import assert from "node:assert/strict";
import test from "node:test";

import {
  DeploymentProfileIntegrityError,
  createCloudCompatibilityDeploymentProfile,
  hashPublicDeploymentProfile,
  loadPublicDeploymentProfile,
  validatePublicDeploymentProfileEnvelope,
} from "./deployment-profile-service.mjs";

function dgxEnvelope() {
  const profile = {
    schemaVersion: 2,
    profileId: "dgx-spark-appliance-v1",
    edition: "appliance",
    stage: "prod",
    topology: "on_prem",
    readiness: "foundation",
    capabilities: {
      platform: true,
      agentExecution: true,
      schedules: true,
      metronomes: true,
      localInference: true,
      deployableResources: false,
      modelManagement: false,
      modelSelection: false,
      subscriptions: false,
      billing: false,
      pricing: false,
      commercialUsageLimits: false,
    },
    product: {
      inference: {
        mode: "deployment_fixed",
        fixedModelId: "deepseek-v4-flash",
      },
      agents: {
        visibleBuiltIns: ["spark"],
        defaultBuiltIn: "spark",
        defaultTeam: { enabled: false, builtIns: [] },
        customAgents: true,
      },
      commerce: {
        mode: "none",
        entitlementSource: "deployment_license",
        commercialLimits: false,
      },
      usage: { mode: "observability_only" },
    },
  };
  return { profile, hash: hashPublicDeploymentProfile(profile) };
}

test("validates and freezes the sanitized DGX Spark profile", () => {
  const validated = validatePublicDeploymentProfileEnvelope(dgxEnvelope(), {
    expectedProfileId: "dgx-spark-appliance-v1",
    expectedTopology: "on_prem",
    expectedStage: "prod",
  });
  assert.equal(validated.profile.product.inference.fixedModelId, "deepseek-v4-flash");
  assert.deepEqual(validated.profile.product.agents.visibleBuiltIns, ["spark"]);
  assert.equal(Object.isFrozen(validated.profile.product.agents), true);
});

test("rejects a profile whose payload does not match its integrity hash", () => {
  const envelope = dgxEnvelope();
  envelope.profile.capabilities.billing = true;
  assert.throws(
    () => validatePublicDeploymentProfileEnvelope(envelope),
    DeploymentProfileIntegrityError,
  );
});

test("loads the versioned profile endpoint and rejects profile drift", async () => {
  let requestedUrl = "";
  const loaded = await loadPublicDeploymentProfile({
    upstreamOrigin: "http://127.0.0.1:8080/v1",
    expectedProfileId: "dgx-spark-appliance-v1",
    expectedTopology: "on_prem",
    expectedStage: "prod",
    fetchImpl: async (url) => {
      requestedUrl = String(url);
      return { ok: true, json: async () => dgxEnvelope() };
    },
  });
  assert.equal(requestedUrl, "http://127.0.0.1:8080/v1/deployment-profile");
  assert.equal(loaded.source, "control_api");

  await assert.rejects(
    loadPublicDeploymentProfile({
      upstreamOrigin: "http://127.0.0.1:8080/v1",
      expectedProfileId: "cloud-saas-v1",
      expectedTopology: "gcp_saas",
      expectedStage: "prod",
      fetchImpl: async () => ({ ok: true, json: async () => dgxEnvelope() }),
    }),
    DeploymentProfileIntegrityError,
  );
});

test("uses the cloud compatibility profile only when the endpoint is unavailable", async () => {
  const fallbackEnvelope = createCloudCompatibilityDeploymentProfile("dev");
  const loaded = await loadPublicDeploymentProfile({
    upstreamOrigin: "https://api.example.test/v1",
    expectedProfileId: "cloud-saas-v1",
    expectedTopology: "gcp_saas",
    expectedStage: "dev",
    fallbackEnvelope,
    fetchImpl: async () => {
      throw new Error("offline");
    },
  });
  assert.equal(loaded.source, "compatibility_fallback");
  assert.equal(loaded.profile.capabilities.billing, true);
});
