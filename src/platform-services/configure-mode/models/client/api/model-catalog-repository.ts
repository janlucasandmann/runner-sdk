import type {
  PlatformApiClient,
} from "../../../../../platform-app/runtime/platform-api-client.js";

export interface ModelCatalogRepository {
  listAgentModels(signal?: AbortSignal): Promise<unknown[]>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function unwrapModels(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const candidate of [record.models, record.items, record.data]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

export function createModelCatalogRepository(
  apiClient: Pick<PlatformApiClient, "get">,
): ModelCatalogRepository {
  return Object.freeze({
    async listAgentModels(signal?: AbortSignal) {
      return unwrapModels(await apiClient.get("/agents/models", { signal }));
    },
  });
}
