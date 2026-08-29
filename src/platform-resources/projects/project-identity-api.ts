import {
  normalizePlatformProjectIdentity,
  type PlatformProjectIdentity,
  type PlatformProjectReference,
} from "./project-identity.js";

function normalizeBaseUrl(value: string) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export class PlatformProjectIdentityApi {
  private readonly baseUrl: string;
  private readonly headers: Readonly<Record<string, string>>;

  constructor(baseUrl: string, headers: Readonly<Record<string, string>> = {}) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.headers = headers;
  }

  async get(
    projectId: string,
    fallback?: PlatformProjectReference | null,
  ): Promise<PlatformProjectIdentity> {
    const normalizedProjectId = String(projectId || "").trim();
    if (!this.baseUrl || !normalizedProjectId) {
      throw new Error("A project identity endpoint and project id are required.");
    }
    const response = await fetch(
      `${this.baseUrl}/projects/${encodeURIComponent(normalizedProjectId)}?view=metadata`,
      {
        credentials: "include",
        cache: "no-store",
        headers: this.headers,
      },
    );
    const raw = await response.text().catch(() => "");
    let payload: unknown = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = { message: raw };
    }
    if (!response.ok) {
      const source = asRecord(payload);
      throw new Error(String(source.message || source.error || "Failed to load project identity."));
    }
    const source = asRecord(payload);
    const identity = normalizePlatformProjectIdentity(source.project || source.data || source, fallback);
    if (!identity) throw new Error("The project identity response was incomplete.");
    return identity;
  }
}
