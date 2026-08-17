import type {
  KnowledgeDocument,
  KnowledgeDocumentCreateInput,
  KnowledgeDocumentUpdateInput,
  KnowledgeLibrary,
  KnowledgeLibraryCreateInput,
  KnowledgeLibraryVersion,
  KnowledgeSearchResult,
} from "../domain/index.js";

export class KnowledgeApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, status: number, code = "") {
    super(message);
    this.name = "KnowledgeApiError";
    this.status = status;
    this.code = code;
  }
}

function normalizeBaseUrl(value: string) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  const raw = await response.text().catch(() => "");
  let payload: unknown = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { message: raw };
  }
  if (!response.ok) {
    const source = asRecord(payload);
    throw new KnowledgeApiError(
      String(source.message || source.error || fallback),
      response.status,
      String(source.code || ""),
    );
  }
  return payload as T;
}

export class KnowledgeApi {
  private readonly baseUrl: string;
  private readonly headers: Readonly<Record<string, string>>;

  constructor(baseUrl: string, headers: Readonly<Record<string, string>> = {}) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.headers = headers;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    fallback = "Knowledge request failed.",
  ): Promise<T> {
    if (!this.baseUrl) throw new KnowledgeApiError("Knowledge backend is unavailable.", 503);
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...options,
      headers: {
        ...this.headers,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    return readResponse<T>(response, fallback);
  }

  async listLibraries(): Promise<KnowledgeLibrary[]> {
    const payload = await this.request<{ data?: KnowledgeLibrary[]; libraries?: KnowledgeLibrary[] }>(
      "/knowledge",
      {},
      "Failed to load Knowledge libraries.",
    );
    return Array.isArray(payload.libraries)
      ? payload.libraries
      : Array.isArray(payload.data)
        ? payload.data
        : [];
  }

  async getLibrary(id: string): Promise<KnowledgeLibrary> {
    const payload = await this.request<{ library: KnowledgeLibrary }>(
      `/knowledge/${encodeURIComponent(id)}`,
      {},
      "Failed to load the Knowledge library.",
    );
    return payload.library;
  }

  async createLibrary(input: KnowledgeLibraryCreateInput): Promise<KnowledgeLibrary> {
    const payload = await this.request<{ library: KnowledgeLibrary }>(
      "/knowledge",
      { method: "POST", body: JSON.stringify(input) },
      "Failed to create the Knowledge library.",
    );
    return payload.library;
  }

  async updateLibrary(
    id: string,
    input: Partial<Pick<KnowledgeLibrary, "name" | "description" | "metadata" | "permissionSet">>,
  ): Promise<KnowledgeLibrary> {
    const payload = await this.request<{ library: KnowledgeLibrary }>(
      `/knowledge/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
      "Failed to update the Knowledge library.",
    );
    return payload.library;
  }

  async deleteLibrary(id: string): Promise<void> {
    await this.request(
      `/knowledge/${encodeURIComponent(id)}`,
      { method: "DELETE" },
      "Failed to delete the Knowledge library.",
    );
  }

  async createDocument(
    libraryId: string,
    input: KnowledgeDocumentCreateInput,
  ): Promise<{ library: KnowledgeLibrary; document: KnowledgeDocument; version: KnowledgeLibraryVersion }> {
    return this.request(
      `/knowledge/${encodeURIComponent(libraryId)}/documents`,
      { method: "POST", body: JSON.stringify(input) },
      "Failed to create the Knowledge document.",
    );
  }

  async updateDocument(
    libraryId: string,
    documentId: string,
    input: KnowledgeDocumentUpdateInput,
  ): Promise<{ library: KnowledgeLibrary; document: KnowledgeDocument; version: KnowledgeLibraryVersion }> {
    return this.request(
      `/knowledge/${encodeURIComponent(libraryId)}/documents/${encodeURIComponent(documentId)}`,
      { method: "PATCH", body: JSON.stringify(input) },
      "Failed to save the Knowledge document.",
    );
  }

  async archiveDocument(libraryId: string, documentId: string): Promise<void> {
    await this.request(
      `/knowledge/${encodeURIComponent(libraryId)}/documents/${encodeURIComponent(documentId)}`,
      { method: "DELETE" },
      "Failed to archive the Knowledge document.",
    );
  }

  async createVersion(libraryId: string): Promise<KnowledgeLibrary> {
    const payload = await this.request<{ library: KnowledgeLibrary }>(
      `/knowledge/${encodeURIComponent(libraryId)}/versions`,
      { method: "POST", body: JSON.stringify({}) },
      "Failed to create the Knowledge version.",
    );
    return payload.library;
  }

  async getVersion(
    libraryId: string,
    versionId: string,
  ): Promise<{ version: KnowledgeLibraryVersion; documents: KnowledgeDocument[] }> {
    return this.request(
      `/knowledge/${encodeURIComponent(libraryId)}/versions/${encodeURIComponent(versionId)}`,
      {},
      "Failed to load the Knowledge version.",
    );
  }

  async publishVersion(libraryId: string, versionId: string): Promise<KnowledgeLibrary> {
    const payload = await this.request<{ library: KnowledgeLibrary }>(
      `/knowledge/${encodeURIComponent(libraryId)}/versions/${encodeURIComponent(versionId)}/publish`,
      { method: "POST", body: JSON.stringify({}) },
      "Failed to publish the Knowledge version.",
    );
    return payload.library;
  }

  async search(query: string, libraryIds: readonly string[] = []): Promise<KnowledgeSearchResult[]> {
    const payload = await this.request<{ data?: KnowledgeSearchResult[] }>(
      "/knowledge/search",
      { method: "POST", body: JSON.stringify({ query, libraryIds, limit: 20 }) },
      "Failed to search Knowledge.",
    );
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async listOrganizationMembers(organizationId: string): Promise<unknown[]> {
    const payload = await this.request<unknown>(
      `/organizations/${encodeURIComponent(organizationId)}/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account`,
      {},
      "Failed to load organization members.",
    );
    if (Array.isArray(payload)) return payload;
    const source = asRecord(payload);
    for (const key of ["data", "members", "organizationMembers", "organization_members"]) {
      if (Array.isArray(source[key])) return source[key] as unknown[];
    }
    return [];
  }

  async addTeamShare(
    teamId: string,
    libraryId: string,
    metadata: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const payload = await this.request<{ data?: Record<string, unknown> }>(
      `/teams/${encodeURIComponent(teamId)}/resource-shares`,
      {
        method: "POST",
        body: JSON.stringify({
          resourceType: "knowledge_library",
          resourceId: libraryId,
          accessLevel: "use",
          metadata,
        }),
      },
      "Failed to grant team access.",
    );
    return asRecord(payload.data);
  }

  async removeTeamShare(teamId: string, shareId: string): Promise<void> {
    await this.request(
      `/teams/${encodeURIComponent(teamId)}/resource-shares/${encodeURIComponent(shareId)}`,
      { method: "DELETE" },
      "Failed to remove team access.",
    );
  }
}
