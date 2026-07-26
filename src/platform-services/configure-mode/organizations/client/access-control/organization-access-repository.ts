import {
  normalizeOrganizationAccessAgent,
  normalizeOrganizationAccessTeam,
  normalizeOrganizationAuthorizationApproval,
  normalizeOrganizationAuthorizationDecision,
  normalizeOrganizationAuthorizationDelegation,
  normalizeOrganizationIdentityConnection,
  normalizeOrganizationIdentityGroupMapping,
  readOrganizationAccessCollection,
} from "./organization-access-normalization.js";
import type {
  AuthorizationApprovalStatus,
  OrganizationAccessAgent,
  OrganizationAccessTeam,
  OrganizationAuthorizationApproval,
  OrganizationAuthorizationDecision,
  OrganizationAuthorizationDelegation,
  OrganizationAuthorizationDelegationInput,
  OrganizationIdentityConnection,
  OrganizationIdentityConnectionInput,
  OrganizationIdentityGroupMapping,
  OrganizationIdentityGroupMappingInput,
  OrganizationIdentityValidation,
  OrganizationScimToken,
} from "./organization-access-types.js";

export interface OrganizationAccessRepositoryOptions {
  apiBase?: string;
  organizationId: string;
  requestHeaders?: Record<string, string>;
  fetcher?: typeof fetch;
}

export interface OrganizationAccessRepository {
  listConnections(): Promise<OrganizationIdentityConnection[]>;
  createConnection(
    input: OrganizationIdentityConnectionInput,
  ): Promise<OrganizationIdentityConnection>;
  updateConnection(
    connectionId: string,
    input: Partial<OrganizationIdentityConnectionInput> & {
      status?: "active" | "disabled";
    },
  ): Promise<OrganizationIdentityConnection>;
  disableConnection(connectionId: string): Promise<OrganizationIdentityConnection>;
  validateConnection(connectionId: string): Promise<OrganizationIdentityValidation>;
  rotateScimToken(connectionId: string): Promise<OrganizationScimToken>;
  revokeScimToken(connectionId: string): Promise<void>;
  listGroupMappings(
    connectionId: string,
  ): Promise<OrganizationIdentityGroupMapping[]>;
  saveGroupMapping(
    connectionId: string,
    input: OrganizationIdentityGroupMappingInput,
  ): Promise<OrganizationIdentityGroupMapping>;
  deleteGroupMapping(connectionId: string, mappingId: string): Promise<void>;
  listTeams(): Promise<OrganizationAccessTeam[]>;
  listAgents(): Promise<OrganizationAccessAgent[]>;
  listApprovals(status?: AuthorizationApprovalStatus | ""): Promise<OrganizationAuthorizationApproval[]>;
  resolveApproval(
    approvalId: string,
    status: Extract<AuthorizationApprovalStatus, "approved" | "denied" | "cancelled">,
    reason?: string,
  ): Promise<OrganizationAuthorizationApproval>;
  listDelegations(status?: "active" | "revoked" | "expired" | ""): Promise<OrganizationAuthorizationDelegation[]>;
  createDelegation(
    input: OrganizationAuthorizationDelegationInput,
  ): Promise<OrganizationAuthorizationDelegation>;
  revokeDelegation(delegationId: string, reason?: string): Promise<void>;
  listDecisions(): Promise<OrganizationAuthorizationDecision[]>;
}

interface ApiEnvelope {
  data?: unknown;
  error?: unknown;
  message?: unknown;
  warning?: unknown;
  success?: unknown;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function responseMessage(payload: ApiEnvelope, status: number): string {
  return (
    String(payload.message || "").trim() ||
    String(payload.error || "").trim() ||
    `Request failed with status ${status}.`
  );
}

export function createOrganizationAccessRepository({
  apiBase = "/api/real",
  organizationId,
  requestHeaders = {},
  fetcher = fetch,
}: OrganizationAccessRepositoryOptions): OrganizationAccessRepository {
  const base = trimTrailingSlash(apiBase || "/api/real");
  const organizationHeaders = {
    ...requestHeaders,
    "x-computer-agents-organization": organizationId,
  };

  async function request(
    path: string,
    init: RequestInit = {},
  ): Promise<ApiEnvelope> {
    const hasBody = init.body !== undefined && init.body !== null;
    const response = await fetcher(`${base}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...init,
      headers: {
        ...organizationHeaders,
        ...(hasBody ? { "content-type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    });
    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope;
    if (!response.ok) throw new Error(responseMessage(payload, response.status));
    return payload;
  }

  return {
    async listConnections() {
      const payload = await request("/identity-connections");
      return readOrganizationAccessCollection(payload.data).map(
        normalizeOrganizationIdentityConnection,
      );
    },
    async createConnection(input) {
      const payload = await request("/identity-connections", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return normalizeOrganizationIdentityConnection(payload.data);
    },
    async updateConnection(connectionId, input) {
      const payload = await request(
        `/identity-connections/${encodeURIComponent(connectionId)}`,
        {
          method: "PATCH",
          body: JSON.stringify(input),
        },
      );
      return normalizeOrganizationIdentityConnection(payload.data);
    },
    async disableConnection(connectionId) {
      const payload = await request(
        `/identity-connections/${encodeURIComponent(connectionId)}`,
        { method: "DELETE" },
      );
      return normalizeOrganizationIdentityConnection(payload.data);
    },
    async validateConnection(connectionId) {
      const payload = await request(
        `/identity-connections/${encodeURIComponent(connectionId)}/validate`,
        { method: "POST", body: JSON.stringify({}) },
      );
      return (payload.data || {}) as OrganizationIdentityValidation;
    },
    async rotateScimToken(connectionId) {
      const payload = await request(
        `/identity-connections/${encodeURIComponent(connectionId)}/scim-token`,
        { method: "POST", body: JSON.stringify({}) },
      );
      return payload.data as OrganizationScimToken;
    },
    async revokeScimToken(connectionId) {
      await request(
        `/identity-connections/${encodeURIComponent(connectionId)}/scim-token`,
        { method: "DELETE" },
      );
    },
    async listGroupMappings(connectionId) {
      const payload = await request(
        `/identity-connections/${encodeURIComponent(connectionId)}/group-mappings`,
      );
      return readOrganizationAccessCollection(payload.data).map(
        normalizeOrganizationIdentityGroupMapping,
      );
    },
    async saveGroupMapping(connectionId, input) {
      const payload = await request(
        `/identity-connections/${encodeURIComponent(connectionId)}/group-mappings`,
        { method: "POST", body: JSON.stringify(input) },
      );
      return normalizeOrganizationIdentityGroupMapping(payload.data);
    },
    async deleteGroupMapping(connectionId, mappingId) {
      await request(
        `/identity-connections/${encodeURIComponent(connectionId)}/group-mappings/${encodeURIComponent(mappingId)}`,
        { method: "DELETE" },
      );
    },
    async listTeams() {
      const payload = await request("/teams");
      return readOrganizationAccessCollection(payload.data).map(
        normalizeOrganizationAccessTeam,
      );
    },
    async listAgents() {
      const payload = await request("/agents?limit=200");
      return readOrganizationAccessCollection(payload.data).map(
        normalizeOrganizationAccessAgent,
      );
    },
    async listApprovals(status = "") {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const payload = await request(`/authorization/approvals${query}`);
      return readOrganizationAccessCollection(payload.data).map(
        normalizeOrganizationAuthorizationApproval,
      );
    },
    async resolveApproval(approvalId, status, reason = "") {
      const payload = await request(
        `/authorization/approvals/${encodeURIComponent(approvalId)}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({ status, reason: reason || undefined }),
        },
      );
      return normalizeOrganizationAuthorizationApproval(payload.data);
    },
    async listDelegations(status = "") {
      const query = status ? `?status=${encodeURIComponent(status)}` : "";
      const payload = await request(`/authorization/delegations${query}`);
      return readOrganizationAccessCollection(payload.data).map(
        normalizeOrganizationAuthorizationDelegation,
      );
    },
    async createDelegation(input) {
      const payload = await request("/authorization/delegations", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return normalizeOrganizationAuthorizationDelegation(payload.data);
    },
    async revokeDelegation(delegationId, reason = "") {
      await request(
        `/authorization/delegations/${encodeURIComponent(delegationId)}`,
        {
          method: "DELETE",
          body: JSON.stringify({ reason: reason || undefined }),
        },
      );
    },
    async listDecisions() {
      const payload = await request("/authorization/decisions?limit=200");
      return readOrganizationAccessCollection(payload.data).map(
        normalizeOrganizationAuthorizationDecision,
      );
    },
  };
}

