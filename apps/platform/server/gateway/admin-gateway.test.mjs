import assert from "node:assert/strict";
import test from "node:test";

import { createAdminGateway } from "./admin-gateway.mjs";

function createResponseRecorder() {
  return {
    status: null,
    payload: null,
  };
}

function createGateway({
  deploymentTopology = "on_prem",
  email = "member@example.test",
  feedbackSummaryAllowedEmail = "operator@example.test",
  hasSession = true,
} = {}) {
  return createAdminGateway({
    aiosOrigin: "https://hosted.example.test",
    deploymentTopology,
    deploymentVmNameOverride: "",
    deploymentVmNamePrefix: "",
    deploymentVmProject: "",
    feedbackSummaryAdminEnvFileCandidates: [],
    feedbackSummaryAllowedEmail,
    fetchAiosApi: async () => new Response("{}", { status: 401 }),
    hasAiosSession: () => hasSession,
    identityService: {
      provider: "oidc",
      async readSession() {
        return hasSession && email
          ? { profile: { email }, principal: {} }
          : null;
      },
    },
    normalizeBackendUrl: (value) => String(value || ""),
    parseUpstreamUrl: () => "http://127.0.0.1:3001/v1",
    platformOrigin: "https://platform.example.test",
    port: 4177,
    sendJson(res, status, payload) {
      res.status = status;
      res.payload = payload;
      return true;
    },
    serveFeedbackSummaryPage() {},
    serveProductUsageSummaryPageV2() {},
  });
}

test("allows every signed-in appliance user to read the appliance overview", async () => {
  const previousAdminKey = process.env.ADMIN_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.ADMIN_API_KEY = "test-admin-key";
  const upstreamRequests = [];
  globalThis.fetch = async (url, init) => {
    upstreamRequests.push({ url: String(url), init });
    return new Response(JSON.stringify({ deployment: { releaseId: "release-1" } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    for (const feedbackSummaryAllowedEmail of ["operator@example.test", ""]) {
      const gateway = createGateway({ feedbackSummaryAllowedEmail });
      const response = createResponseRecorder();

      await gateway.proxyApplianceOverviewGet({ headers: {}, url: "/api/real/admin/appliance-overview" }, response);

      assert.equal(response.status, 200);
      assert.equal(response.payload.deployment.releaseId, "release-1");
    }

    assert.equal(upstreamRequests.length, 2);
    for (const request of upstreamRequests) {
      assert.equal(request.url, "http://127.0.0.1:3001/admin/appliance-overview");
      assert.equal(request.init.headers.Authorization, "Bearer test-admin-key");
      assert.equal(request.init.headers["X-Admin-Key"], "test-admin-key");
    }
  } finally {
    globalThis.fetch = previousFetch;
    if (previousAdminKey === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = previousAdminKey;
  }
});

test("still requires a signed-in session for appliance information", async () => {
  const gateway = createGateway({ hasSession: false, email: "" });
  const response = createResponseRecorder();

  await gateway.proxyApplianceOverviewGet({ headers: {}, url: "/api/real/admin/appliance-overview" }, response);

  assert.equal(response.status, 401);
  assert.equal(response.payload.message, "Sign in to view appliance information.");
});

test("does not expose appliance information in cloud topology", async () => {
  const gateway = createGateway({ deploymentTopology: "cloud" });
  const response = createResponseRecorder();

  await gateway.proxyApplianceOverviewGet({ headers: {}, url: "/api/real/admin/appliance-overview" }, response);

  assert.equal(response.status, 404);
  assert.equal(response.payload.message, "The appliance overview is only available on an on-prem deployment.");
});
