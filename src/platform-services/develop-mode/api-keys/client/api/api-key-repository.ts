import type {
  PlatformApiClient,
} from "../../../../../platform-runtime/platform-api-client.js";

export interface CreateApiKeyInput {
  name: string;
  description?: string;
  permissions: readonly string[];
}

export interface CreatedApiKey {
  id: string;
  key: string;
  record: unknown;
}

export interface ApiKeyRepository {
  list(signal?: AbortSignal): Promise<unknown[]>;
  create(input: CreateApiKeyInput): Promise<CreatedApiKey>;
  reveal(keyId: string, signal?: AbortSignal): Promise<string>;
  revoke(keyId: string): Promise<void>;
  readAnalytics(period: "day" | "week" | "month", signal?: AbortSignal): Promise<unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function unwrapApiKeys(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const candidate of [record.keys, record.items, record.data]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function requireKeyId(value: string): string {
  const keyId = String(value || "").trim();
  if (!keyId) throw new Error("An API key id is required.");
  return keyId;
}

export function createApiKeyRepository(
  apiClient: Pick<PlatformApiClient, "get" | "post">,
): ApiKeyRepository {
  return Object.freeze({
    async list(signal?: AbortSignal) {
      return unwrapApiKeys(await apiClient.get("/api-keys", { signal }));
    },

    async create(input: CreateApiKeyInput) {
      const payload = asRecord(await apiClient.post("/api-keys", {
        name: String(input.name || "").trim(),
        ...(String(input.description || "").trim()
          ? { description: String(input.description).trim() }
          : {}),
        permissions: [...input.permissions],
      }));
      return {
        id: String(payload.id || "").trim(),
        key: String(payload.key || "").trim(),
        record: payload,
      };
    },

    async reveal(keyId: string, signal?: AbortSignal) {
      const payload = asRecord(await apiClient.get(
        `/api-keys/${encodeURIComponent(requireKeyId(keyId))}/reveal`,
        { signal },
      ));
      const key = String(payload.key || "").trim();
      if (!key) throw new Error("The API key value is unavailable.");
      return key;
    },

    async revoke(keyId: string) {
      await apiClient.post(
        `/api-keys/${encodeURIComponent(requireKeyId(keyId))}/revoke`,
        {},
      );
    },

    readAnalytics(
      period: "day" | "week" | "month",
      signal?: AbortSignal,
    ) {
      return apiClient.get("/api-keys/analytics/overview", {
        query: { period },
        signal,
      });
    },
  });
}
