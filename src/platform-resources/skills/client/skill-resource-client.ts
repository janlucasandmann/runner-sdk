import type {
  PlatformApiClient,
} from "../../../platform-app/runtime/platform-api-client.js";

export interface SkillResourceRepository {
  list(signal?: AbortSignal): Promise<unknown[]>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function unwrapSkillList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  for (const candidate of [
    record.skills,
    record.resources,
    record.items,
    record.data,
  ]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

export function createSkillResourceRepository(
  apiClient: Pick<PlatformApiClient, "get">,
): SkillResourceRepository {
  return Object.freeze({
    async list(signal?: AbortSignal) {
      return unwrapSkillList(await apiClient.get("/skills", { signal }));
    },
  });
}
