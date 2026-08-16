import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { createInMemoryExternalAgentRepository } from "./repository.mjs";
import {
  createExternalAgentService,
  resolvePlatformDataPath,
} from "./service.mjs";
import { sealWebhookSecret } from "./verification.mjs";

const ENCRYPTION_KEY = "external-agent-test-encryption-key";
const WEBHOOK_SECRET = "jira-webhook-secret";

test("platform state uses durable server storage outside the release", () => {
  assert.equal(
    resolvePlatformDataPath("external-agents.json", {
      env: { PLATFORM_DATA_ROOT: "/var/lib/computer-agents/platform" },
      cwd: "/opt/computer-agents/current/repos/runner-web-sdk",
    }),
    "/var/lib/computer-agents/platform/external-agents.json",
  );
  assert.equal(
    resolvePlatformDataPath("external-agents.json", {
      env: {},
      cwd: "/workspace/runner-web-sdk",
      homeDirectory: "/home/platform",
    }),
    "/home/platform/.computer-agents/platform/external-agents.json",
  );
  assert.equal(
    resolvePlatformDataPath("external-agents.json", {
      env: {},
      cwd: "/another/release",
      homeDirectory: "/home/platform",
    }),
    "/home/platform/.computer-agents/platform/external-agents.json",
  );
});

test("the public Jira webhook route verifies before durably accepting an event", async () => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [{
      id: "installation_jira",
      organizationId: "organization_1",
      provider: "jira",
      tenantId: "tenant_jira",
      appActorId: "jira_app_actor",
      mentionAliases: ["computer agents"],
      webhookSecret: sealWebhookSecret(WEBHOOK_SECRET, ENCRYPTION_KEY),
      enabled: true,
    }],
  });
  const service = createService(repository);
  const payload = {
    cloudId: "tenant_jira",
    webhookEvent: "comment_created",
    timestamp: 1_786_000_000_000,
    user: { accountId: "jira_user_1" },
    issue: {
      id: "jira_issue_1",
      key: "OPS-1",
      fields: { summary: "Investigate", project: { id: "jira_project_ops" } },
    },
    comment: { id: "comment_1", body: "/ca investigate this issue" },
  };

  const accepted = await dispatch(service, {
    path: "/api/integrations/external-agents/webhooks/jira/installation_jira",
    body: payload,
    headers: { authorization: `Bearer ${WEBHOOK_SECRET}` },
  });
  const rejected = await dispatch(service, {
    path: "/api/integrations/external-agents/webhooks/jira/installation_jira",
    body: payload,
    headers: { authorization: "Bearer incorrect" },
  });
  const snapshot = await repository.snapshot();

  assert.equal(accepted.status, 202);
  assert.equal(accepted.body.accepted, true);
  assert.equal(rejected.status, 401);
  assert.equal(rejected.body.error, "webhook_signature_invalid");
  assert.equal(snapshot.events.length, 1);
  assert.equal(snapshot.events[0].organizationId, "organization_1");
});

function createService(repository) {
  const gateway = {
    async ingest(envelope) {
      return repository.ingestEvent(envelope, { organizationId: "organization_1" });
    },
    async getHealth() { return {}; },
    start() {},
    async stop() {},
    wake() {},
  };
  return createExternalAgentService({
    repository,
    gateway,
    policy: { authorize: async () => ({ mode: "linked_member" }) },
    threadInvoker: { createThread: async () => ({ id: "thread_1" }) },
    deliveryService: { deliver: async () => ({}) },
    membershipService: {
      authorizeRequest: async () => ({ role: "owner" }),
      resolveOrganizationMembers: async () => [],
    },
    encryptionKey: ENCRYPTION_KEY,
    sendJson(response, status, body, headers = {}) {
      response.writeHead(status, { "content-type": "application/json", ...headers });
      response.end(JSON.stringify(body));
    },
    logger: { info() {}, warn() {}, error() {} },
  });
}

async function dispatch(service, { path, body, headers = {} }) {
  const request = Readable.from([Buffer.from(JSON.stringify(body))]);
  request.method = "POST";
  request.headers = Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
  let resolveResponse;
  const completed = new Promise((resolve) => { resolveResponse = resolve; });
  const response = {
    status: 0,
    headers: {},
    chunks: [],
    writeHead(status, responseHeaders = {}) {
      this.status = status;
      this.headers = responseHeaders;
    },
    end(chunk = "") {
      if (chunk) this.chunks.push(Buffer.from(chunk));
      resolveResponse();
    },
  };
  const url = new URL(path, "https://platform.example.test");
  assert.equal(service.handleRequest(request, response, url), true);
  await completed;
  const text = Buffer.concat(response.chunks).toString("utf8");
  return {
    status: response.status,
    body: text ? JSON.parse(text) : {},
  };
}
