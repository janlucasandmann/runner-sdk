import type {
  KnowledgeDocument,
  KnowledgeDocumentCreateInput,
  KnowledgeDocumentUpdateInput,
  KnowledgeLibrary,
  KnowledgeLibraryCreateInput,
  KnowledgeLibraryVersion,
  KnowledgeProposal,
  KnowledgeProposalInput,
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

function readCollection(value: unknown, keys: readonly string[]): unknown[] {
  if (Array.isArray(value)) return value;
  const source = asRecord(value);
  const containers = [
    source,
    asRecord(source.data),
    asRecord(source.result),
    asRecord(source.payload),
  ];
  for (const container of containers) {
    for (const key of keys) {
      if (Array.isArray(container[key])) return container[key] as unknown[];
    }
    if (Array.isArray(container.data)) return container.data as unknown[];
  }
  return [];
}

const MEMBER_IDENTITY_NESTED_KEYS = [
  "user",
  "profile",
  "account",
  "member",
  "identity",
  "metadata",
] as const;

function collectIdentitySources(
  value: unknown,
  depth = 0,
  seen = new Set<unknown>(),
): Record<string, unknown>[] {
  const source = asRecord(value);
  if (!Object.keys(source).length || seen.has(source) || depth > 3) return [];
  seen.add(source);
  return [
    source,
    ...MEMBER_IDENTITY_NESTED_KEYS.flatMap((key) => (
      collectIdentitySources(source[key], depth + 1, seen)
    )),
  ];
}

function readIdentityString(value: unknown, keys: readonly string[]): string {
  const sources = collectIdentitySources(value);
  for (const key of keys) {
    for (const source of sources) {
      const candidate = source[key];
      if (typeof candidate !== "string" && typeof candidate !== "number") continue;
      const normalized = String(candidate).trim();
      if (normalized) return normalized;
    }
  }
  return "";
}

function getIdentityKeys(value: unknown): string[] {
  return [...new Set([
    readIdentityString(value, ["userId", "user_id", "uid", "accountId", "account_id"]),
    readIdentityString(value, ["email", "emailAddress", "email_address", "mail"]),
    readIdentityString(value, ["id", "memberId", "member_id"]),
  ].map((candidate) => candidate.toLowerCase()).filter(Boolean))];
}

function readProfileRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.map(asRecord).filter((record) => Object.keys(record).length > 0);
  const source = asRecord(value);
  return Object.entries(source).flatMap(([key, record]) => {
    const normalized = asRecord(record);
    if (!Object.keys(normalized).length) return [];
    return [{ id: key, ...normalized }];
  });
}

function mergeMemberProfiles(members: readonly unknown[], ...payloads: readonly unknown[]): unknown[] {
  const profileByKey = new Map<string, Record<string, unknown>>();
  payloads.forEach((payload) => {
    const source = asRecord(payload);
    const data = asRecord(source.data);
    [
      source.profiles,
      source.memberProfiles,
      source.member_profiles,
      source.users,
      source.accounts,
      Array.isArray(source.data) ? source.data : undefined,
      data.profiles,
      data.memberProfiles,
      data.member_profiles,
      data.users,
      data.accounts,
    ].flatMap(readProfileRecords).forEach((profile) => {
      getIdentityKeys(profile).forEach((key) => profileByKey.set(key, profile));
    });
  });
  return members.map((member) => {
    const profile = getIdentityKeys(member)
      .map((key) => profileByKey.get(key))
      .find(Boolean);
    if (!profile) return member;
    const source = asRecord(member);
    return {
      ...source,
      profile: { ...asRecord(source.profile), ...profile },
      user: { ...asRecord(source.user), ...profile },
    };
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to encode the Knowledge attachment."));
        return;
      }
      const separatorIndex = reader.result.indexOf(",");
      resolve(separatorIndex >= 0 ? reader.result.slice(separatorIndex + 1) : reader.result);
    };
    reader.onerror = () => reject(
      reader.error || new Error("Failed to encode the Knowledge attachment."),
    );
    reader.readAsDataURL(blob);
  });
}

export interface KnowledgeEditorAttachment {
  src: string;
  name: string;
  size: number;
  mimeType: string;
  attachmentId: string;
  metadata: Record<string, unknown>;
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

  async createVersion(
    libraryId: string,
    input: { description?: string } = {},
  ): Promise<KnowledgeLibrary> {
    const path = `/knowledge/${encodeURIComponent(libraryId)}/versions`;
    const description = String(input.description || "").trim().slice(0, 240);
    const create = (body: Record<string, unknown>) => this.request<{ library: KnowledgeLibrary }>(
      path,
      { method: "POST", body: JSON.stringify(body) },
      "Failed to create the Knowledge version.",
    );
    try {
      return (await create(description ? { description } : {})).library;
    } catch (error) {
      // Older appliance APIs created Knowledge versions before descriptions were added to the
      // contract. Preserve forward-compatible saving without hiding unrelated validation errors.
      if (
        description
        && error instanceof KnowledgeApiError
        && error.status === 400
        && /unsupported fields?.*description|description.*unsupported/i.test(error.message)
      ) {
        return (await create({})).library;
      }
      throw error;
    }
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

  async createProposal(
    libraryId: string,
    input: KnowledgeProposalInput,
  ): Promise<KnowledgeProposal> {
    const operation = input.operation || "create_document";
    // Create is kept backwards compatible with older appliances that predate
    // operation-aware proposals. Newer control planes accept update/archive
    // proposals and require the explicit operation/document revision fields.
    const body = {
      ...(operation !== "create_document" ? { operation } : {}),
      ...(input.documentId !== undefined ? { documentId: input.documentId } : {}),
      ...(input.baseVersionId !== undefined ? { baseVersionId: input.baseVersionId } : {}),
      ...(input.baseRevisionId !== undefined ? { baseRevisionId: input.baseRevisionId } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.summary !== undefined ? { summary: input.summary } : {}),
      ...(input.markdown !== undefined ? { markdown: input.markdown } : {}),
      ...(input.parentDocumentId !== undefined ? { parentDocumentId: input.parentDocumentId } : {}),
      ...(input.provenance !== undefined ? { provenance: input.provenance } : {}),
      ...(input.threadId !== undefined ? { threadId: input.threadId } : {}),
    };
    const payload = await this.request<{
      proposal?: KnowledgeProposal;
      data?: KnowledgeProposal;
      status?: string;
      operation?: string;
      documentId?: string;
      library?: KnowledgeLibrary;
      version?: KnowledgeLibraryVersion;
      document?: KnowledgeDocument;
    }>(
      `/knowledge/${encodeURIComponent(libraryId)}/proposals`,
      { method: "POST", body: JSON.stringify(body) },
      "Failed to create the Knowledge proposal.",
    );
    const proposal = payload.proposal || payload.data;
    if (proposal && typeof proposal === "object") {
      return proposal;
    }
    if (
      String(payload.status || "").trim().toLowerCase() === "draft"
      && payload.library
      && payload.version
    ) {
      const responseOperation = payload.operation === "update_document"
        || payload.operation === "archive_document"
        ? payload.operation
        : operation;
      return {
        ...(payload.document?.id ? { id: payload.document.id } : {}),
        libraryId,
        operation: responseOperation,
        status: "draft",
        ...(payload.document?.id || payload.documentId
          ? { documentId: payload.document?.id || payload.documentId } : {}),
        library: payload.library,
        version: payload.version,
        ...(payload.document ? { document: payload.document } : {}),
        ...(payload.document?.provenance ? { provenance: payload.document.provenance } : {}),
      };
    }
    throw new KnowledgeApiError(
      "Knowledge proposal creation succeeded but no proposal was returned.",
      502,
      "knowledge_proposal_missing",
    );
  }

  async uploadEditorAttachments(files: File[]): Promise<KnowledgeEditorAttachment[]> {
    return Promise.all(files.map(async (file) => {
      const payload = await this.request<{ attachment?: Record<string, unknown> }>(
        "/attachments/upload",
        {
          method: "POST",
          body: JSON.stringify({
            filename: file.name || "attachment",
            mimeType: file.type || "application/octet-stream",
            data: await blobToBase64(file),
          }),
        },
        "Failed to upload the Knowledge attachment.",
      );
      const attachment = asRecord(payload.attachment);
      const attachmentId = String(attachment.id || attachment.attachmentId || "").trim();
      if (!attachmentId) {
        throw new KnowledgeApiError(
          "Attachment upload succeeded but the attachment data is missing.",
          502,
          "knowledge_attachment_missing",
        );
      }
      return {
        src: `${this.baseUrl}/attachments/${encodeURIComponent(attachmentId)}`,
        name: String(attachment.filename || attachment.name || file.name || "Attachment").trim()
          || "Attachment",
        size: Number(attachment.size || attachment.byteSize || file.size || 0),
        mimeType: String(
          attachment.mimeType
          || attachment.contentType
          || file.type
          || "application/octet-stream",
        ).trim() || "application/octet-stream",
        attachmentId,
        metadata: attachment,
      };
    }));
  }

  async resolveEditorAttachmentPreview(
    file: Pick<KnowledgeEditorAttachment, "src">,
    signal: AbortSignal,
  ): Promise<Blob | null> {
    const source = String(file.src || "").trim();
    if (!source) return null;
    const response = await fetch(source, {
      credentials: "include",
      cache: "no-store",
      headers: { ...this.headers },
      signal,
    });
    if (!response.ok) {
      throw new KnowledgeApiError(
        "Failed to load the Knowledge attachment preview.",
        response.status,
        "knowledge_attachment_preview_failed",
      );
    }
    return response.blob();
  }

  async listOrganizationMembers(organizationId: string): Promise<unknown[]> {
    const payload = await this.request<unknown>(
      `/organizations/${encodeURIComponent(organizationId)}/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account`,
      {},
      "Failed to load organization members.",
    );
    const members = readCollection(payload, [
      "members",
      "organizationMembers",
      "organization_members",
    ]);
    if (!members.length) return [];
    let profilePayload: unknown = null;
    try {
      profilePayload = await this.request<unknown>(
        `/organizations/${encodeURIComponent(organizationId)}/member-profiles/lookup`,
        { method: "POST", body: JSON.stringify({ members }) },
        "Failed to load organization member profiles.",
      );
    } catch {
      // The membership response remains usable when an older backend does not
      // expose the optional profile-directory lookup yet.
    }
    return mergeMemberProfiles(members, payload, profilePayload);
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
