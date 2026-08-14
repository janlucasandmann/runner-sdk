import type {
  ExternalAgentBinding,
  ExternalAgentEventRecord,
  ExternalAgentIdentity,
  ExternalAgentInstallation,
  ExternalAgentProvider,
} from "../../../platform-integrations/external-agents/contracts.js";

export interface ExternalAgentInstallationSetup {
  callbackUrl: string;
  callbackUrlWithToken?: string;
  nativeCallbackUrl?: string;
  provider: ExternalAgentProvider;
  tenantId: string;
  verification: "bearer_token" | "hmac_sha256";
  verificationSecret?: string;
}

export interface ExternalAgentInstallationView
  extends ExternalAgentInstallation {
  callbackUrl?: string;
}

export interface ExternalAgentGatewayHealth {
  started?: boolean;
  stopping?: boolean;
  installations?: number;
  bindings?: number;
  events?: Readonly<Record<string, number>>;
  deliveries?: Readonly<Record<string, number>>;
}

export interface ExternalAgentOrganizationMember {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  role: string;
}

export interface ExternalAgentTriggerSnapshot {
  installations: ExternalAgentInstallationView[];
  bindings: ExternalAgentBinding[];
  identities: ExternalAgentIdentity[];
  events: ExternalAgentEventRecord[];
  health: ExternalAgentGatewayHealth;
  members: ExternalAgentOrganizationMember[];
}

export interface CreateExternalAgentInstallationInput {
  provider: ExternalAgentProvider;
  tenantId: string;
  credentialId: string;
  displayName?: string;
  siteUrl?: string;
  appActorId?: string;
  mentionAliases?: readonly string[];
}

export interface CreateExternalAgentBindingInput {
  installationId: string;
  externalProjectId?: string;
  displayName?: string;
  agentId: string;
  agentName?: string;
  environmentId?: string;
  projectId?: string;
  triggerModes: readonly ("mention" | "assignment" | "command")[];
  permissionMode: "linked_member" | "external_requester";
  allowedExternalUserIds?: readonly string[];
}

export interface CreateExternalAgentIdentityInput {
  installationId: string;
  providerUserId: string;
  platformUserId: string;
  displayName?: string;
  email?: string;
}

export class ExternalAgentTriggerClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ExternalAgentTriggerClientError";
    this.status = status;
    this.code = code;
  }
}

type FetchImplementation = typeof fetch;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nestedRecord(
  record: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null {
  return asRecord(record?.[key]);
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = text(value);
    if (normalized) return normalized;
  }
  return "";
}

function readCollection<T>(value: unknown, key: string): T[] {
  const record = asRecord(value);
  const collection = record?.[key];
  return Array.isArray(collection) ? (collection as T[]) : [];
}

function normalizeMemberSource(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (!record) return [];
  for (const key of ["members", "organizationMembers", "organization_members", "data"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
}

export function normalizeExternalAgentOrganizationMembers(
  value: unknown,
): ExternalAgentOrganizationMember[] {
  const seen = new Set<string>();
  return normalizeMemberSource(value).flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const user = nestedRecord(record, "user");
    const profile = nestedRecord(record, "profile");
    const account = nestedRecord(record, "account");
    const id = firstText(
      record.userId,
      record.uid,
      user?.id,
      user?.uid,
      profile?.userId,
      account?.id,
      record.id,
    );
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const email = firstText(
      record.email,
      user?.email,
      profile?.email,
      account?.email,
    );
    return [{
      id,
      name: firstText(
        record.displayName,
        record.name,
        user?.displayName,
        user?.name,
        profile?.displayName,
        profile?.name,
        account?.name,
        email,
        id,
      ),
      email,
      photoUrl: firstText(
        record.photoUrl,
        record.photoURL,
        record.avatarUrl,
        user?.photoUrl,
        user?.photoURL,
        user?.avatarUrl,
        profile?.photoUrl,
        profile?.photoURL,
        account?.avatarUrl,
      ),
      role: firstText(record.role, record.organizationRole, record.accessLevel),
    }];
  });
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export class ExternalAgentTriggerClient {
  readonly managementBaseUrl: string;
  readonly organizationApiBaseUrl: string;
  readonly organizationId: string;
  readonly fetchImplementation: FetchImplementation;

  constructor({
    organizationId,
    managementBaseUrl = "/api/integrations/external-agents",
    organizationApiBaseUrl = "/api/real",
    fetchImplementation = globalThis.fetch,
  }: {
    organizationId: string;
    managementBaseUrl?: string;
    organizationApiBaseUrl?: string;
    fetchImplementation?: FetchImplementation;
  }) {
    this.organizationId = organizationId.trim();
    this.managementBaseUrl = managementBaseUrl;
    this.organizationApiBaseUrl = organizationApiBaseUrl;
    // Native browser fetch validates its receiver. If it is stored directly on
    // this client and later called as a method, the receiver becomes the client
    // instance and browsers throw `Illegal invocation` before sending a request.
    this.fetchImplementation = fetchImplementation.bind(globalThis);
  }

  async load(provider: ExternalAgentProvider): Promise<ExternalAgentTriggerSnapshot> {
    const [installations, bindings, identities, events, health, members] =
      await Promise.all([
        this.managementRequest<unknown>("installations?limit=100"),
        this.managementRequest<unknown>("bindings?limit=500"),
        this.managementRequest<unknown>("identities?limit=500"),
        this.managementRequest<unknown>("events?limit=100"),
        this.managementRequest<ExternalAgentGatewayHealth>("health"),
        this.loadOrganizationMembers().catch(() => []),
      ]);
    return {
      installations: readCollection<ExternalAgentInstallationView>(
        installations,
        "installations",
      ).filter((item) => item.provider === provider),
      bindings: readCollection<ExternalAgentBinding>(bindings, "bindings")
        .filter((item) => item.provider === provider),
      identities: readCollection<ExternalAgentIdentity>(identities, "identities")
        .filter((item) => item.provider === provider),
      events: readCollection<ExternalAgentEventRecord>(events, "events")
        .filter((item) => item.envelope?.provider === provider),
      health,
      members,
    };
  }

  async createInstallation(
    input: CreateExternalAgentInstallationInput,
  ): Promise<{
    installation: ExternalAgentInstallationView;
    setup: ExternalAgentInstallationSetup;
  }> {
    return this.managementRequest("installations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateInstallation(
    installationId: string,
    input: Partial<CreateExternalAgentInstallationInput> & {
      enabled?: boolean;
      rotateWebhookSecret?: boolean;
    },
  ): Promise<{
    installation: ExternalAgentInstallationView;
    setup?: ExternalAgentInstallationSetup;
  }> {
    return this.managementRequest(`installations/${installationId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  async deleteInstallation(installationId: string): Promise<void> {
    await this.managementRequest(`installations/${installationId}`, {
      method: "DELETE",
    });
  }

  async createBinding(
    input: CreateExternalAgentBindingInput,
  ): Promise<{ binding: ExternalAgentBinding }> {
    return this.managementRequest("bindings", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async updateBinding(
    bindingId: string,
    input: Partial<CreateExternalAgentBindingInput> & { enabled?: boolean },
  ): Promise<{ binding: ExternalAgentBinding }> {
    return this.managementRequest(`bindings/${bindingId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  async deleteBinding(bindingId: string): Promise<void> {
    await this.managementRequest(`bindings/${bindingId}`, { method: "DELETE" });
  }

  async createIdentity(
    input: CreateExternalAgentIdentityInput,
  ): Promise<{ identity: ExternalAgentIdentity }> {
    return this.managementRequest("identities", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async deleteIdentity(identityId: string): Promise<void> {
    await this.managementRequest(`identities/${identityId}`, { method: "DELETE" });
  }

  async replayEvent(eventId: string): Promise<void> {
    await this.managementRequest(`events/${eventId}/replay`, { method: "POST" });
  }

  private async loadOrganizationMembers(): Promise<ExternalAgentOrganizationMember[]> {
    if (!this.organizationId) return [];
    const response = await this.request<unknown>(
      joinUrl(
        this.organizationApiBaseUrl,
        `organizations/${encodeURIComponent(this.organizationId)}/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account`,
      ),
    );
    return normalizeExternalAgentOrganizationMembers(response);
  }

  private managementRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.organizationId) {
      throw new ExternalAgentTriggerClientError(
        400,
        "organization_required",
        "Choose an organization before configuring agent triggers.",
      );
    }
    return this.request<T>(joinUrl(this.managementBaseUrl, path), init, true);
  }

  private async request<T>(
    url: string,
    init: RequestInit = {},
    organizationScoped = false,
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    if (organizationScoped) {
      headers.set("X-Computer-Agents-Organization", this.organizationId);
    }
    const response = await this.fetchImplementation(url, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
    if (response.status === 204) return undefined as T;
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const record = asRecord(payload);
      throw new ExternalAgentTriggerClientError(
        response.status,
        firstText(record?.error, record?.code, "request_failed"),
        firstText(record?.message, `Request failed with status ${response.status}.`),
      );
    }
    return payload as T;
  }
}
