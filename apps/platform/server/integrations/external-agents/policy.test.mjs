import assert from "node:assert/strict";
import test from "node:test";

import { normalizeExternalAgentEnvelope } from "./domain.mjs";
import { createExternalAgentPolicy } from "./policy.mjs";

const installation = Object.freeze({
  id: "installation_jira",
  organizationId: "organization_1",
  provider: "jira",
  tenantId: "tenant_jira",
  appActorId: "jira_app_actor",
  enabled: true,
});

const baseBinding = Object.freeze({
  id: "binding_1",
  installationId: "installation_jira",
  triggerModes: ["mention"],
  permissionMode: "linked_member",
  allowedExternalUserIds: [],
  allowedOrganizationRoles: ["owner", "admin", "member"],
  enabled: true,
});

const envelope = normalizeExternalAgentEnvelope({
  eventId: "event_1",
  provider: "jira",
  transport: "jira_webhook",
  installationId: "installation_jira",
  tenantId: "tenant_jira",
  eventType: "comment_created",
  trigger: "mention",
  conversationKey: "jira_conversation_1",
  actor: { providerUserId: "jira_user_1", displayName: "Jira User" },
  resource: { type: "issue", id: "jira_issue_1", key: "OPS-1", projectId: "jira_project_ops" },
  visibleMessage: "Investigate this issue",
});

test("linked external identities require an active organization membership", async () => {
  const policy = createExternalAgentPolicy({
    resolveOrganizationMembers: async () => [{ userId: "platform_user_1", role: "member", status: "active" }],
  });
  const result = await policy.authorize({
    envelope,
    installation,
    binding: baseBinding,
    identity: { platformUserId: "platform_user_1" },
  });

  assert.equal(result.mode, "linked_member");
  await assert.rejects(
    policy.authorize({ envelope, installation, binding: baseBinding, identity: null }),
    (error) => error.code === "external_identity_link_required",
  );
});

test("external requester mode requires and enforces an explicit provider-user allowlist", async () => {
  const policy = createExternalAgentPolicy({ resolveOrganizationMembers: async () => [] });
  const allowedBinding = {
    ...baseBinding,
    permissionMode: "external_requester",
    allowedExternalUserIds: ["jira_user_1"],
  };
  const result = await policy.authorize({
    envelope,
    installation,
    binding: allowedBinding,
    identity: null,
  });

  assert.equal(result.mode, "external_requester");
  await assert.rejects(
    policy.authorize({
      envelope: { ...envelope, actor: { ...envelope.actor, providerUserId: "jira_user_2" } },
      installation,
      binding: allowedBinding,
      identity: null,
    }),
    (error) => error.code === "external_actor_not_allowed",
  );
});
