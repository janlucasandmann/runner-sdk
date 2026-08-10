import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { createExternalAgentManagementController } from "./management.mjs";
import { createInMemoryExternalAgentRepository } from "./repository.mjs";

const ORGANIZATION_ID = "organization_1";
const ENCRYPTION_KEY = "external-agent-management-test-key";

test("installation setup reveals its generated webhook secret once and never persists plaintext", async () => {
  const repository = createInMemoryExternalAgentRepository();
  const controller = createController(repository);
  const created = await controller.handle(
    request("POST", {
      provider: "jira",
      tenantId: "jira-cloud-1",
      credentialId: "credential-jira-1",
      displayName: "Operations Jira",
    }),
    url("/api/integrations/external-agents/installations"),
  );

  assert.equal(created.status, 201);
  assert.match(created.body.setup.verificationSecret, /^[A-Za-z0-9_-]{32,}$/);
  assert.equal(created.body.installation.webhookSecret, undefined);
  assert.equal(created.body.installation.secretRef, undefined);

  const snapshot = await repository.snapshot();
  assert.equal(snapshot.installations.length, 1);
  assert.notEqual(snapshot.installations[0].webhookSecret, created.body.setup.verificationSecret);
  assert.deepEqual(
    Object.keys(snapshot.installations[0].webhookSecret).sort(),
    ["algorithm", "ciphertext", "iv", "tag", "version"],
  );
  assert.equal(snapshot.installations[0].webhookSecret.algorithm, "aes-256-gcm");

  const fetched = await controller.handle(
    request("GET"),
    url(`/api/integrations/external-agents/installations/${snapshot.installations[0].id}`),
  );
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.webhookSecret, undefined);
});

test("bindings reject connector actions that the provider adapter does not expose", async () => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [{
      id: "installation_jira",
      organizationId: ORGANIZATION_ID,
      provider: "jira",
      tenantId: "jira-cloud-1",
      credentialId: "credential-jira-1",
      enabled: true,
    }],
  });
  const controller = createController(repository);
  const bindingBody = {
    installationId: "installation_jira",
    externalProjectId: "OPS",
    agentId: "agent_ops",
    agentName: "Operations Agent",
    triggerModes: ["mention", "assignment"],
    allowedConnectorActions: ["get_issue", "invent_action"],
  };

  await assert.rejects(
    controller.handle(
      request("POST", bindingBody),
      url("/api/integrations/external-agents/bindings"),
    ),
    (error) => error?.code === "external_connector_action_invalid" && error?.statusCode === 400,
  );

  const created = await controller.handle(
    request("POST", {
      ...bindingBody,
      allowedConnectorActions: ["get_issue", "add_comment"],
    }),
    url("/api/integrations/external-agents/bindings"),
  );
  assert.equal(created.status, 201);
  assert.deepEqual(created.body.binding.allowedConnectorActions, ["get_issue", "add_comment"]);
});

test("binding updates cannot create an ambiguous enabled project route", async () => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [{
      id: "installation_jira",
      organizationId: ORGANIZATION_ID,
      provider: "jira",
      tenantId: "jira-cloud-1",
      credentialId: "credential-jira-1",
      enabled: true,
    }],
  });
  const controller = createController(repository);
  const createBinding = (externalProjectId, agentId) => controller.handle(
    request("POST", {
      installationId: "installation_jira",
      externalProjectId,
      agentId,
      triggerModes: ["mention"],
      allowedConnectorActions: ["get_issue"],
    }),
    url("/api/integrations/external-agents/bindings"),
  );
  const first = await createBinding("OPS", "agent_ops");
  const second = await createBinding("SUP", "agent_support");

  await assert.rejects(
    controller.handle(
      request("PATCH", { externalProjectId: "OPS" }),
      url(`/api/integrations/external-agents/bindings/${second.body.binding.id}`),
    ),
    (error) => error?.code === "external_binding_exists" && error?.statusCode === 409,
  );

  const snapshot = await repository.snapshot();
  assert.equal(snapshot.bindings.find((item) => item.id === first.body.binding.id)?.externalProjectId, "OPS");
  assert.equal(snapshot.bindings.find((item) => item.id === second.body.binding.id)?.externalProjectId, "SUP");
});

test("disabling a binding atomically cancels only work routed through that binding", async () => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [{
      id: "installation_jira",
      organizationId: ORGANIZATION_ID,
      provider: "jira",
      tenantId: "jira-cloud-1",
      credentialId: "credential-jira-1",
      enabled: true,
    }],
    bindings: [
      {
        id: "binding_ops",
        organizationId: ORGANIZATION_ID,
        installationId: "installation_jira",
        provider: "jira",
        externalProjectId: "OPS",
        agentId: "agent_ops",
        triggerModes: ["mention"],
        allowedConnectorActions: ["get_issue"],
        permissionMode: "linked_member",
        enabled: true,
      },
      {
        id: "binding_support",
        organizationId: ORGANIZATION_ID,
        installationId: "installation_jira",
        provider: "jira",
        externalProjectId: "SUP",
        agentId: "agent_support",
        triggerModes: ["mention"],
        allowedConnectorActions: ["get_issue"],
        permissionMode: "linked_member",
        enabled: true,
      },
    ],
    events: [
      {
        id: "event_ops",
        status: "pending",
        envelope: { installationId: "installation_jira", provider: "jira", resource: { projectId: "OPS" } },
      },
      {
        id: "event_support",
        status: "pending",
        envelope: { installationId: "installation_jira", provider: "jira", resource: { projectId: "SUP" } },
      },
    ],
    tasks: [
      { id: "task_ops", eventId: "event_ops", status: "pending" },
      { id: "task_support", eventId: "event_support", status: "pending" },
    ],
    deliveries: [
      { id: "delivery_ops", bindingId: "binding_ops", status: "pending" },
      { id: "delivery_support", bindingId: "binding_support", status: "pending" },
    ],
  });
  const controller = createController(repository);

  const result = await controller.handle(
    request("PATCH", { enabled: false }),
    url("/api/integrations/external-agents/bindings/binding_ops"),
  );
  const snapshot = await repository.snapshot();

  assert.equal(result.status, 200);
  assert.equal(result.body.binding.enabled, false);
  assert.equal(snapshot.events.find((item) => item.id === "event_ops")?.status, "denied");
  assert.equal(snapshot.tasks.find((item) => item.id === "task_ops")?.status, "denied");
  assert.equal(snapshot.deliveries.find((item) => item.id === "delivery_ops")?.status, "failed");
  assert.equal(snapshot.events.find((item) => item.id === "event_support")?.status, "pending");
  assert.equal(snapshot.tasks.find((item) => item.id === "task_support")?.status, "pending");
  assert.equal(snapshot.deliveries.find((item) => item.id === "delivery_support")?.status, "pending");
});

test("installation aliases are canonicalized and duplicate setup is rejected atomically", async () => {
  const repository = createInMemoryExternalAgentRepository();
  const controller = createController(repository);
  const body = {
    provider: "jira",
    tenantId: "jira-cloud-1",
    credentialId: "credential-jira-1",
    mentionAliases: ["@computer-agents", "computer agents"],
  };

  const results = await Promise.allSettled([
    controller.handle(request("POST", body), url("/api/integrations/external-agents/installations")),
    controller.handle(request("POST", body), url("/api/integrations/external-agents/installations")),
  ]);
  const fulfilled = results.filter((result) => result.status === "fulfilled");
  const rejected = results.filter((result) => result.status === "rejected");
  const snapshot = await repository.snapshot();

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.equal(rejected[0].reason?.code, "external_installation_exists");
  assert.deepEqual(snapshot.installations[0].mentionAliases, ["computer-agents", "computer agents"]);
});

test("health requests pass their organization scope to the gateway", async () => {
  const repository = createInMemoryExternalAgentRepository();
  let requestedOrganizationId = "";
  const controller = createController(repository, {
    async getHealth(organizationId) {
      requestedOrganizationId = organizationId;
      return { installations: 0 };
    },
    wake() {},
  });

  const result = await controller.handle(
    request("GET"),
    url("/api/integrations/external-agents/health"),
  );

  assert.equal(result.status, 200);
  assert.equal(requestedOrganizationId, ORGANIZATION_ID);
});

test("failed provider deliveries can be inspected and replayed through the management plane", async () => {
  const repository = createInMemoryExternalAgentRepository({
    installations: [{
      id: "installation_jira",
      organizationId: ORGANIZATION_ID,
      provider: "jira",
      tenantId: "jira-cloud-1",
      enabled: true,
    }],
    bindings: [{
      id: "binding_ops",
      organizationId: ORGANIZATION_ID,
      installationId: "installation_jira",
      provider: "jira",
      externalProjectId: "OPS",
      agentId: "agent_ops",
      enabled: true,
    }],
    deliveries: [{
      id: "delivery_failed",
      organizationId: ORGANIZATION_ID,
      installationId: "installation_jira",
      bindingId: "binding_ops",
      eventId: "event_ops",
      kind: "completion",
      provider: "jira",
      status: "failed",
      attempts: 8,
      errorCode: "provider_unavailable",
      errorMessage: "Jira was unavailable.",
      createdAt: "2026-08-10T08:00:00.000Z",
      updatedAt: "2026-08-10T08:01:00.000Z",
    }],
  });
  let wakeCalls = 0;
  const controller = createController(repository, {
    async getHealth() { return {}; },
    wake() { wakeCalls += 1; },
  });

  const listed = await controller.handle(
    request("GET"),
    url("/api/integrations/external-agents/deliveries"),
  );
  const replayed = await controller.handle(
    request("POST"),
    url("/api/integrations/external-agents/deliveries/delivery_failed/replay"),
  );
  const snapshot = await repository.snapshot();

  assert.equal(listed.status, 200);
  assert.equal(listed.body.deliveries.length, 1);
  assert.equal(replayed.status, 202);
  assert.equal(replayed.body.delivery.status, "pending");
  assert.equal(snapshot.deliveries[0].attempts, 0);
  assert.equal(snapshot.deliveries[0].errorCode, undefined);
  assert.equal(wakeCalls, 1);
});

function createController(repository, gateway = undefined) {
  return createExternalAgentManagementController({
    repository,
    gateway: gateway || {
      async getHealth() { return {}; },
      wake() {},
    },
    membershipService: {
      async authorizeRequest() { return { role: "owner" }; },
      async resolveOrganizationMembers() { return []; },
    },
    adapterRegistry: {
      listCapabilities(provider) {
        return provider === "jira"
          ? [{ id: "get_issue" }, { id: "add_comment" }]
          : [];
      },
    },
    encryptionKey: ENCRYPTION_KEY,
    platformOrigin: "https://platform.example.test",
  });
}

function request(method, body = undefined) {
  const source = body === undefined ? [] : [Buffer.from(JSON.stringify(body))];
  const req = Readable.from(source);
  req.method = method;
  req.headers = { "x-computer-agents-organization": ORGANIZATION_ID };
  return req;
}

function url(pathname) {
  return new URL(pathname, "https://platform.example.test");
}
