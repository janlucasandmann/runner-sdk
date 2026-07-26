import type {
  OrganizationAccessAgent,
  OrganizationAccessResource,
  OrganizationAccessTeam,
  OrganizationAuthorizationApproval,
  OrganizationAuthorizationDecision,
  OrganizationAuthorizationDecisionStep,
  OrganizationAuthorizationDelegation,
  OrganizationIdentityClaimMappings,
  OrganizationIdentityConnection,
  OrganizationIdentityGroupMapping,
} from "./organization-access-types.js";

export function asOrganizationAccessRecord(
  value: unknown,
): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstText(
  source: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))]
    : [];
}

export function readOrganizationAccessCollection(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const source = asOrganizationAccessRecord(value);
  for (const key of ["data", "items", "rows", "results"]) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
  }
  return [];
}

export function normalizeOrganizationIdentityConnection(
  value: unknown,
): OrganizationIdentityConnection {
  const source = asOrganizationAccessRecord(value);
  const claims = asOrganizationAccessRecord(
    source.claimMappings || source.claim_mappings,
  );
  const claimMappings: OrganizationIdentityClaimMappings = {
    subject: firstText(claims, ["subject"]) || "sub",
    email: firstText(claims, ["email"]) || "email",
    displayName: firstText(claims, ["displayName", "display_name"]) || "name",
    groups: firstText(claims, ["groups"]) || "groups",
  };
  return {
    id: firstText(source, ["id"]),
    organizationId: firstText(source, ["organizationId", "organization_id"]),
    provider:
      firstText(source, ["provider"]).toLowerCase() === "entra"
        ? "entra"
        : "oidc",
    displayName:
      firstText(source, ["displayName", "display_name", "name"]) ||
      "Identity provider",
    issuer: firstText(source, ["issuer"]),
    tenantId: firstText(source, ["tenantId", "tenant_id"]),
    clientId: firstText(source, ["clientId", "client_id"]),
    discoveryUrl: firstText(source, ["discoveryUrl", "discovery_url"]),
    status:
      firstText(source, ["status"]).toLowerCase() === "disabled"
        ? "disabled"
        : "active",
    scimTokenPrefix: firstText(source, [
      "scimTokenPrefix",
      "scim_token_prefix",
    ]),
    scimTokenCreatedAt: firstText(source, [
      "scimTokenCreatedAt",
      "scim_token_created_at",
    ]),
    defaultMemberRole: (firstText(source, [
      "defaultMemberRole",
      "default_member_role",
    ]) || "member") as OrganizationIdentityConnection["defaultMemberRole"],
    claimMappings,
    createdAt: firstText(source, ["createdAt", "created_at"]),
    updatedAt: firstText(source, ["updatedAt", "updated_at"]),
  };
}

export function normalizeOrganizationIdentityGroupMapping(
  value: unknown,
): OrganizationIdentityGroupMapping {
  const source = asOrganizationAccessRecord(value);
  return {
    id: firstText(source, ["id"]),
    organizationId: firstText(source, ["organizationId", "organization_id"]),
    connectionId: firstText(source, ["connectionId", "connection_id"]),
    externalGroupId: firstText(source, [
      "externalGroupId",
      "external_group_id",
    ]),
    externalGroupName: firstText(source, [
      "externalGroupName",
      "external_group_name",
    ]),
    teamId: firstText(source, ["teamId", "team_id"]),
    organizationRole: firstText(source, [
      "organizationRole",
      "organization_role",
    ]) as OrganizationIdentityGroupMapping["organizationRole"],
    createdAt: firstText(source, ["createdAt", "created_at"]),
    updatedAt: firstText(source, ["updatedAt", "updated_at"]),
  };
}

export function normalizeOrganizationAuthorizationApproval(
  value: unknown,
): OrganizationAuthorizationApproval {
  const source = asOrganizationAccessRecord(value);
  return {
    id: firstText(source, ["id"]),
    principalKind: firstText(source, ["principalKind", "principal_kind"]),
    principalId: firstText(source, ["principalId", "principal_id"]),
    actionId: firstText(source, ["actionId", "action_id"]),
    resourceType: firstText(source, ["resourceType", "resource_type"]),
    resourceId: firstText(source, ["resourceId", "resource_id"]),
    status: (firstText(source, ["status"]) ||
      "pending") as OrganizationAuthorizationApproval["status"],
    requestedAt: firstText(source, ["requestedAt", "requested_at"]),
    expiresAt: firstText(source, ["expiresAt", "expires_at"]),
    resolvedAt: firstText(source, ["resolvedAt", "resolved_at"]),
    resolutionReason: firstText(source, [
      "resolutionReason",
      "resolution_reason",
    ]),
  };
}

export function normalizeOrganizationAuthorizationDelegation(
  value: unknown,
): OrganizationAuthorizationDelegation {
  const source = asOrganizationAccessRecord(value);
  const constraints = asOrganizationAccessRecord(
    source.resourceConstraints || source.resource_constraints,
  );
  return {
    id: firstText(source, ["id"]),
    delegatePrincipalKind: firstText(source, [
      "delegatePrincipalKind",
      "delegate_principal_kind",
    ]),
    delegatePrincipalId: firstText(source, [
      "delegatePrincipalId",
      "delegate_principal_id",
    ]),
    delegatorPrincipalId: firstText(source, [
      "delegatorPrincipalId",
      "delegator_principal_id",
    ]),
    agentId: firstText(source, ["agentId", "agent_id"]),
    agentVersionId: firstText(source, ["agentVersionId", "agent_version_id"]),
    allowedActions: textArray(
      source.allowedActions || source.allowed_actions,
    ),
    resourceConstraints: {
      types: textArray(constraints.types),
      ids: textArray(constraints.ids),
    },
    status: (firstText(source, ["status"]) ||
      "active") as OrganizationAuthorizationDelegation["status"],
    issuedAt: firstText(source, ["issuedAt", "issued_at"]),
    expiresAt: firstText(source, ["expiresAt", "expires_at"]),
    revokedAt: firstText(source, ["revokedAt", "revoked_at"]),
  };
}

export function normalizeOrganizationAuthorizationDecision(
  value: unknown,
): OrganizationAuthorizationDecision {
  const source = asOrganizationAccessRecord(value);
  const steps = Array.isArray(source.steps)
    ? source.steps.map((step): OrganizationAuthorizationDecisionStep => {
        const item = asOrganizationAccessRecord(step);
        return {
          source: firstText(item, ["source"]),
          effect: firstText(item, ["effect"]),
          reasonCode: firstText(item, ["reasonCode", "reason_code"]),
          detail: firstText(item, ["detail"]),
          principalId: firstText(item, ["principalId", "principal_id"]),
          teamId: firstText(item, ["teamId", "team_id"]),
        };
      })
    : [];
  return {
    id: firstText(source, ["id"]),
    principalKind: firstText(source, ["principalKind", "principal_kind"]),
    principalId: firstText(source, ["principalId", "principal_id"]),
    actorUserId: firstText(source, ["actorUserId", "actor_user_id"]),
    agentId: firstText(source, ["agentId", "agent_id"]),
    agentVersionId: firstText(source, ["agentVersionId", "agent_version_id"]),
    delegationId: firstText(source, ["delegationId", "delegation_id"]),
    policyVersionId: firstText(source, [
      "policyVersionId",
      "policy_version_id",
    ]),
    actionId: firstText(source, ["actionId", "action_id"]),
    resourceType: firstText(source, ["resourceType", "resource_type"]),
    resourceId: firstText(source, ["resourceId", "resource_id"]),
    effect: firstText(source, ["effect"]),
    allowed: source.allowed === true,
    approvalRequired:
      source.approvalRequired === true || source.approval_required === true,
    reasonCode: firstText(source, ["reasonCode", "reason_code"]),
    steps,
    createdAt: firstText(source, ["createdAt", "created_at"]),
  };
}

export function normalizeOrganizationAccessTeam(
  value: unknown,
): OrganizationAccessTeam {
  const source = asOrganizationAccessRecord(value);
  const metadata = asOrganizationAccessRecord(source.metadata);
  return {
    id: firstText(source, ["id", "teamId", "team_id"]),
    name: firstText(source, ["name", "displayName", "display_name"]) || "Team",
    profileImageUrl:
      firstText(source, [
        "profileImageUrl",
        "profile_image_url",
        "avatarUrl",
        "avatar_url",
      ]) ||
      firstText(metadata, [
        "profileImageUrl",
        "profile_image_url",
        "avatarUrl",
        "avatar_url",
      ]),
  };
}

export function normalizeOrganizationAccessAgent(
  value: unknown,
): OrganizationAccessAgent {
  const source = asOrganizationAccessRecord(value);
  const metadata = asOrganizationAccessRecord(source.metadata);
  return {
    id: firstText(source, ["id", "agentId", "agent_id"]),
    name:
      firstText(source, ["name", "displayName", "display_name"]) || "Agent",
    profileImageUrl:
      firstText(source, [
        "profileImageUrl",
        "profile_image_url",
        "avatarUrl",
        "avatar_url",
      ]) ||
      firstText(metadata, [
        "profileImageUrl",
        "profile_image_url",
        "avatarUrl",
        "avatar_url",
      ]),
    versionId: firstText(source, [
      "publishedVersionId",
      "published_version_id",
      "versionId",
      "version_id",
    ]),
  };
}

export function normalizeOrganizationAccessResource(
  value: unknown,
): OrganizationAccessResource {
  const source = asOrganizationAccessRecord(value);
  const resource = asOrganizationAccessRecord(source.resource);
  return {
    id:
      firstText(source, ["resourceId", "resource_id", "id"]) ||
      firstText(resource, ["id"]),
    type:
      firstText(source, ["resourceType", "resource_type", "type"]) ||
      firstText(resource, ["type"]),
    name:
      firstText(source, ["name", "title", "resourceName", "resource_name"]) ||
      firstText(resource, ["name", "title"]) ||
      "Resource",
  };
}

