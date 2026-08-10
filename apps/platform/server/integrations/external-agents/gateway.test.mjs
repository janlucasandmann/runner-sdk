import assert from "node:assert/strict";
import test from "node:test";

import { normalizeExternalAgentEnvelope } from "./domain.mjs";
import { createExternalAgentGateway } from "./gateway.mjs";
import { createInMemoryExternalAgentRepository } from "./repository.mjs";

function createEnvelope(eventId, providerUserId, visibleMessage) {
  return normalizeExternalAgentEnvelope({
    eventId,
    provider: "jira",
    transport: "jira_webhook",
    installationId: "installation_jira",
    tenantId: "tenant_jira",
    eventType: "comment_created",
    trigger: "mention",
    occurredAt: "2026-08-10T08:00:00.000Z",
    conversationKey: "jira_conversation_issue_100",
    actor: { providerUserId, displayName: providerUserId },
    resource: {
      type: "issue",
      id: "jira_issue_100",
      key: "OPS-100",
      title: "Investigate failed deployment",
      projectId: "jira_project_ops",
    },
    visibleMessage,
  });
}

test("different commenters on one work item continue one thread with exactly-once delivery", async (t) => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [{
      id: "installation_jira",
      organizationId: "organization_1",
      provider: "jira",
      tenantId: "tenant_jira",
      enabled: true,
    }],
    bindings: [{
      id: "binding_1",
      organizationId: "organization_1",
      installationId: "installation_jira",
      provider: "jira",
      externalProjectId: "jira_project_ops",
      agentId: "agent_1",
      triggerModes: ["mention"],
      enabled: true,
    }],
    identities: [],
  });
  const createCalls = [];
  const turnCalls = [];
  const deliveryCalls = [];
  const gateway = createExternalAgentGateway({
    repository,
    policy: { authorize: async () => ({ mode: "external_requester" }) },
    threadInvoker: {
      async createThread(input) {
        createCalls.push(input);
        return { id: "thread_external_1" };
      },
      async runTurn(input) {
        turnCalls.push(input);
        return { summary: `Completed ${input.envelope.eventId}` };
      },
    },
    deliveryService: {
      async deliver(input) {
        deliveryCalls.push(input);
        return { providerCommentId: `comment_${input.delivery.eventId}` };
      },
    },
    pollIntervalMs: 5,
    logger: { info() {}, warn() {}, error() {} },
  });
  t.after(() => gateway.stop());

  const first = createEnvelope("jira_delivery_1", "jira_user_1", "Investigate the failure");
  const second = createEnvelope("jira_delivery_2", "jira_user_2", "Now apply the approved fix");
  assert.equal((await gateway.ingest(first)).duplicate, false);
  await waitFor(async () => (await repository.snapshot()).events[0]?.status === "completed");
  assert.equal((await gateway.ingest(second)).duplicate, false);
  await waitFor(async () => {
    const snapshot = await repository.snapshot();
    return snapshot.events.length === 2
      && snapshot.events.every((event) => event.status === "completed")
      && snapshot.deliveries.every((delivery) => delivery.status === "completed");
  });

  const duplicate = await gateway.ingest(second);
  await new Promise((resolve) => setTimeout(resolve, 20));
  const snapshot = await repository.snapshot();

  assert.equal(duplicate.duplicate, true);
  assert.equal(createCalls.length, 1);
  assert.equal(turnCalls.length, 2);
  assert.deepEqual(turnCalls.map((call) => call.threadId), ["thread_external_1", "thread_external_1"]);
  assert.equal(deliveryCalls.length, 2);
  assert.equal(snapshot.conversations.length, 1);
  assert.equal(snapshot.conversations[0].threadId, "thread_external_1");
  assert.equal(snapshot.events.every((event) => event.organizationId === "organization_1"), true);
});

test("health metrics are scoped to the requested organization", async () => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [
      { id: "installation_1", organizationId: "organization_1" },
      { id: "installation_2", organizationId: "organization_2" },
    ],
    bindings: [
      { id: "binding_1", organizationId: "organization_1", installationId: "installation_1" },
      { id: "binding_2", organizationId: "organization_2", installationId: "installation_2" },
    ],
    events: [
      { id: "event_1", organizationId: "organization_1", status: "completed" },
      { id: "event_2", organizationId: "organization_2", status: "failed" },
    ],
    deliveries: [
      { id: "delivery_1", installationId: "installation_1", status: "completed" },
      { id: "delivery_2", installationId: "installation_2", status: "pending" },
    ],
  });
  const gateway = createExternalAgentGateway({
    repository,
    policy: { authorize: async () => ({}) },
    threadInvoker: { createThread: async () => ({ id: "thread_1" }) },
    deliveryService: { deliver: async () => ({}) },
  });

  const health = await gateway.getHealth("organization_1");

  assert.equal(health.installations, 1);
  assert.equal(health.bindings, 1);
  assert.deepEqual(health.events, { completed: 1 });
  assert.deepEqual(health.deliveries, { completed: 1 });
});

test("an in-flight run cannot enqueue a reply after its binding is disabled", async (t) => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [{
      id: "installation_jira",
      organizationId: "organization_1",
      provider: "jira",
      tenantId: "tenant_jira",
      enabled: true,
    }],
    bindings: [{
      id: "binding_1",
      organizationId: "organization_1",
      installationId: "installation_jira",
      provider: "jira",
      externalProjectId: "jira_project_ops",
      agentId: "agent_1",
      triggerModes: ["mention"],
      enabled: true,
    }],
  });
  let releaseRun;
  const runStarted = new Promise((resolve) => {
    releaseRun = resolve;
  });
  let confirmRunStarted;
  const started = new Promise((resolve) => {
    confirmRunStarted = resolve;
  });
  const gateway = createExternalAgentGateway({
    repository,
    policy: { authorize: async () => ({ mode: "external_requester" }) },
    threadInvoker: {
      async createThread() { return { id: "thread_external_1" }; },
      async runTurn() {
        confirmRunStarted();
        await runStarted;
        return { summary: "This result must not be delivered" };
      },
    },
    deliveryService: { async deliver() { return {}; } },
    pollIntervalMs: 5,
    logger: { info() {}, warn() {}, error() {} },
  });
  t.after(() => gateway.stop());

  await gateway.ingest(createEnvelope("jira_delivery_cancelled", "jira_user_1", "Run this"));
  await started;
  await repository.transact((store) => {
    store.bindings[0].enabled = false;
  });
  releaseRun();
  await waitFor(async () => (await repository.snapshot()).events[0]?.status === "denied");

  const snapshot = await repository.snapshot();
  assert.equal(snapshot.events[0].errorCode, "external_configuration_unavailable");
  assert.equal(snapshot.tasks[0].status, "denied");
  assert.equal(snapshot.deliveries.length, 0);
});

async function waitFor(predicate, timeoutMs = 2_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("Timed out waiting for the external-agent gateway.");
}
