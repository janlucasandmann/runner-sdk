import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createAdminGateway } from "./admin-gateway.mjs";

function createResponseRecorder() {
  return {
    status: null,
    headers: {},
    payload: null,
    body: "",
    writeHead(status, headers = {}) {
      this.status = status;
      this.headers = headers;
    },
    end(body = "") {
      this.body = String(body);
    },
  };
}

function createGateway({
  deploymentVmAdminClient,
  deploymentTopology = "on_prem",
  email = "member@example.test",
  feedbackSummaryAllowedEmail = "operator@example.test",
  feedbackSummaryAdminEnvFileCandidates = [],
  hasSession = true,
  onServeProductUsageSummary = () => undefined,
  parseUpstreamUrl = () => "http://127.0.0.1:3001/v1",
} = {}) {
  return createAdminGateway({
    aiosOrigin: "https://hosted.example.test",
    deploymentVmAdminClient,
    deploymentTopology,
    deploymentVmNameOverride: "",
    deploymentVmNamePrefix: "",
    deploymentVmProject: "",
    feedbackSummaryAdminEnvFileCandidates,
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
    parseUpstreamUrl,
    platformOrigin: "https://platform.example.test",
    port: 4177,
    sendJson(res, status, payload) {
      res.status = status;
      res.payload = payload;
      return true;
    },
    serveAdminAccessDeniedPage(res) {
      res.status = 403;
      res.payload = { error: "Forbidden" };
    },
    serveFeedbackSummaryPage() {},
    serveProductUsageSummaryPageV2: onServeProductUsageSummary,
  });
}

test("loads all usage-summary administrators from the runtime environment files", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "platform-admin-runtime-"));
  const envFile = path.join(root, ".env.dev");
  await writeFile(
    envFile,
    "PLATFORM_ADMIN_EMAIL=operator@example.test\nPLATFORM_ADMIN_EMAILS=operator@example.test,second@example.test\n",
    "utf8",
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  let served = false;
  const gateway = createGateway({
    email: "second@example.test",
    feedbackSummaryAllowedEmail: "",
    feedbackSummaryAdminEnvFileCandidates: [envFile],
    onServeProductUsageSummary() {
      served = true;
    },
  });
  const response = createResponseRecorder();

  await gateway.handleProductUsageSummaryPageRequest(
    { headers: {}, url: "/usage-summary" },
    response,
  );

  assert.equal(served, true);
  assert.equal(response.status, null);
});

test("shows a stable access-denied page instead of looping for another account", async () => {
  const gateway = createGateway({ email: "other@example.test" });
  const response = createResponseRecorder();

  await gateway.handleProductUsageSummaryPageRequest(
    { headers: {}, url: "/usage-summary" },
    response,
  );

  assert.equal(response.status, 403);
  assert.deepEqual(response.payload, { error: "Forbidden" });
});

test("returns a successful usage payload from the deployment VM fallback", async () => {
  const previousAdminKey = process.env.ADMIN_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.ADMIN_API_KEY = "test-admin-key";
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: "Unauthorized" }),
    {
      status: 401,
      headers: { "content-type": "application/json" },
    },
  );
  const fallbackCalls = [];
  const gateway = createGateway({
    email: "operator@example.test",
    parseUpstreamUrl: () => "https://api.computer-agents.com/v1",
    deploymentVmAdminClient: {
      async fetchFeedbackSummaryViaDeploymentVm() {
        throw new Error("feedback fallback must not run");
      },
      async fetchProductUsageSummaryViaDeploymentVm(query) {
        fallbackCalls.push(query);
        return {
          status: 200,
          parsed: { summary: { activeUsers: 22 } },
        };
      },
    },
  });
  const response = createResponseRecorder();

  try {
    await gateway.proxyProductUsageSummaryGet(
      {
        headers: {},
        url: "/api/real/admin/product-usage-summary?days=7&section=overview",
      },
      response,
    );

    assert.equal(response.status, 200);
    assert.equal(response.payload.summary.activeUsers, 22);
    assert.deepEqual(response.payload.viewer, {
      email: "operator@example.test",
    });
    assert.deepEqual(fallbackCalls, ["?days=7&section=overview"]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousAdminKey === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = previousAdminKey;
  }
});

test("fails closed instead of redirecting in a loop when the admin identity is missing", async () => {
  const gateway = createGateway({
    feedbackSummaryAllowedEmail: "",
    feedbackSummaryAdminEnvFileCandidates: [],
  });
  const response = createResponseRecorder();

  await gateway.handleProductUsageSummaryPageRequest(
    { headers: {}, url: "/usage-summary" },
    response,
  );

  assert.equal(response.status, 503);
  assert.equal(
    response.payload.message,
    "PLATFORM_ADMIN_EMAIL or PLATFORM_ADMIN_EMAILS is missing on the platform server.",
  );
});

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
