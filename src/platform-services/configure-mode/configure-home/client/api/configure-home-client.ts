import type {
  PlatformApiClient,
} from "../../../../../platform-runtime/platform-api-client.js";

export interface ConfigureHomeRepository {
  listNotifications(signal?: AbortSignal): Promise<unknown[]>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function unwrapNotifications(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const candidate of [
    record.notifications,
    record.items,
    record.data,
  ]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

export function createConfigureHomeRepository(
  apiClient: Pick<PlatformApiClient, "get">,
): ConfigureHomeRepository {
  return Object.freeze({
    async listNotifications(signal?: AbortSignal) {
      return unwrapNotifications(
        await apiClient.get("/notifications/in-app", { signal }),
      );
    },
  });
}
