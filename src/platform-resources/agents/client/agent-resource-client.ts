import type {
  PlatformApiClient,
} from "../../../platform-runtime/platform-api-client.js";

export interface AgentResourceRepository {
  list(signal?: AbortSignal): Promise<unknown[]>;
  delete(agentId: string): Promise<Record<string, unknown>>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function unwrapAgentList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const candidate of [
    record.agents,
    record.resources,
    record.items,
    record.data,
  ]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

export function createAgentResourceRepository(
  apiClient: Pick<PlatformApiClient, "delete" | "get">,
): AgentResourceRepository {
  return Object.freeze({
    async list(signal?: AbortSignal) {
      return unwrapAgentList(await apiClient.get("/agents", { signal }));
    },

    async delete(agentId: string) {
      const normalizedAgentId = String(agentId || "").trim();
      if (!normalizedAgentId) {
        throw new Error("An agent id is required.");
      }
      return asRecord(await apiClient.delete(
        `/agents/${encodeURIComponent(normalizedAgentId)}`,
      ));
    },
  });
}
