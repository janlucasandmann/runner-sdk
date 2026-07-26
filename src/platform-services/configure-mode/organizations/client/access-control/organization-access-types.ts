export type OrganizationIdentityProvider = "entra" | "oidc";
export type OrganizationIdentityConnectionStatus = "active" | "disabled";
export type OrganizationMemberRole =
  | "owner"
  | "admin"
  | "billing"
  | "developer"
  | "member"
  | "viewer";

export interface OrganizationIdentityClaimMappings {
  subject: string;
  email: string;
  displayName: string;
  groups: string;
}

export interface OrganizationIdentityConnection {
  id: string;
  organizationId: string;
  provider: OrganizationIdentityProvider;
  displayName: string;
  issuer: string;
  tenantId: string;
  clientId: string;
  discoveryUrl: string;
  status: OrganizationIdentityConnectionStatus;
  scimTokenPrefix: string;
  scimTokenCreatedAt: string;
  defaultMemberRole: OrganizationMemberRole;
  claimMappings: OrganizationIdentityClaimMappings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationIdentityConnectionInput {
  provider: OrganizationIdentityProvider;
  displayName: string;
  issuer?: string;
  tenantId?: string;
  clientId: string;
  discoveryUrl?: string;
  defaultMemberRole: Extract<OrganizationMemberRole, "viewer" | "member" | "developer">;
  claimMappings?: Partial<OrganizationIdentityClaimMappings>;
}

export interface OrganizationIdentityGroupMapping {
  id: string;
  organizationId: string;
  connectionId: string;
  externalGroupId: string;
  externalGroupName: string;
  teamId: string;
  organizationRole: OrganizationMemberRole | "";
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationIdentityGroupMappingInput {
  externalGroupId: string;
  externalGroupName?: string;
  teamId?: string;
  organizationRole?: OrganizationMemberRole | "";
}

export interface OrganizationScimToken {
  token: string;
  prefix: string;
  createdAt: string;
}

export interface OrganizationIdentityValidation {
  valid: boolean;
  issuer?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
  error?: string;
  [key: string]: unknown;
}

export type AuthorizationApprovalStatus =
  | "pending"
  | "approved"
  | "denied"
  | "expired"
  | "cancelled";

export interface OrganizationAuthorizationApproval {
  id: string;
  principalKind: string;
  principalId: string;
  actionId: string;
  resourceType: string;
  resourceId: string;
  status: AuthorizationApprovalStatus;
  requestedAt: string;
  expiresAt: string;
  resolvedAt: string;
  resolutionReason: string;
}

export type AuthorizationDelegationStatus = "active" | "revoked" | "expired";

export interface OrganizationAuthorizationDelegation {
  id: string;
  delegatePrincipalKind: string;
  delegatePrincipalId: string;
  delegatorPrincipalId: string;
  agentId: string;
  agentVersionId: string;
  allowedActions: string[];
  resourceConstraints: {
    types: string[];
    ids: string[];
  };
  status: AuthorizationDelegationStatus;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string;
}

export interface OrganizationAuthorizationDelegationInput {
  delegatePrincipalId: string;
  agentVersionId?: string;
  allowedActions: string[];
  resourceConstraints: {
    types: string[];
    ids: string[];
  };
  contextConstraints?: Record<string, unknown> | null;
  expiresAt: string;
}

export interface OrganizationAuthorizationDecisionStep {
  source: string;
  effect: string;
  reasonCode: string;
  detail: string;
  principalId: string;
  teamId: string;
}

export interface OrganizationAuthorizationDecision {
  id: string;
  principalKind: string;
  principalId: string;
  actorUserId: string;
  agentId: string;
  agentVersionId: string;
  delegationId: string;
  policyVersionId: string;
  actionId: string;
  resourceType: string;
  resourceId: string;
  effect: string;
  allowed: boolean;
  approvalRequired: boolean;
  reasonCode: string;
  steps: OrganizationAuthorizationDecisionStep[];
  createdAt: string;
}

export interface OrganizationAccessTeam {
  id: string;
  name: string;
  profileImageUrl: string;
}

export interface OrganizationAccessAgent {
  id: string;
  name: string;
  profileImageUrl: string;
  versionId: string;
}

export interface OrganizationAccessResource {
  id: string;
  type: string;
  name: string;
}

export type OrganizationAccessSection =
  | "identity"
  | "approvals"
  | "delegations"
  | "audit";

