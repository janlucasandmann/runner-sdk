import {
  createPlatformApiClient,
  type PlatformApiClient,
} from "../../../platform-app/runtime/platform-api-client.js";

export interface ComputerResourceClientOptions {
  backendUrl: string;
  requestHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
}

export interface SaveComputerResourceOptions
  extends ComputerResourceClientOptions {
  computerId?: string | null;
  draftId?: string | null;
  createPayload: unknown;
  updatePayload: unknown;
}

export interface SaveComputerResourceResult {
  data: Record<string, unknown>;
  createdData: Record<string, unknown> | null;
  computerId: string;
  isNew: boolean;
}

export interface SaveComputerResourceInput {
  computerId?: string | null;
  draftId?: string | null;
  createPayload: unknown;
  updatePayload: unknown;
}

export interface ComputerResourceRepository {
  list(signal?: AbortSignal): Promise<unknown[]>;
  save(input: SaveComputerResourceInput): Promise<SaveComputerResourceResult>;
  delete(computerId: string): Promise<Record<string, unknown>>;
}

function toJsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function toComputerList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = toJsonRecord(value);
  for (const candidate of [
    record.environments,
    record.computers,
    record.items,
    record.data,
  ]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function extractCreatedComputerId(data: Record<string, unknown>): string {
  const nested = data.environment
    && typeof data.environment === "object"
    && !Array.isArray(data.environment)
    ? data.environment as Record<string, unknown>
    : data.data && typeof data.data === "object" && !Array.isArray(data.data)
      ? data.data as Record<string, unknown>
      : data;
  return typeof nested.id === "string" ? nested.id.trim() : "";
}

async function requestComputerJson({
  apiClient,
  computerId,
  method,
  body,
}: {
  apiClient: Pick<PlatformApiClient, "delete" | "post" | "put">;
  computerId?: string;
  method: "POST" | "PUT" | "DELETE";
  body?: unknown;
}): Promise<Record<string, unknown>> {
  const normalizedId = String(computerId || "").trim();
  const path = `/environments${normalizedId ? `/${encodeURIComponent(normalizedId)}` : ""}`;
  if (method === "POST") {
    return toJsonRecord(await apiClient.post(path, body));
  }
  if (method === "PUT") {
    return toJsonRecord(await apiClient.put(path, body));
  }
  return toJsonRecord(await apiClient.delete(path));
}

export function createComputerResourceRepository(
  apiClient: Pick<
    PlatformApiClient,
    "delete" | "get" | "post" | "put"
  >,
): ComputerResourceRepository {
  const repository: ComputerResourceRepository = {
    async list(signal?: AbortSignal) {
      return toComputerList(await apiClient.get("/environments", { signal }));
    },

    async save(input: SaveComputerResourceInput) {
      const requestedId = String(input.computerId || "").trim();
      const draftId = String(input.draftId || "").trim();
      const isNew = !requestedId || Boolean(draftId && requestedId === draftId);
      let createdData: Record<string, unknown> | null = null;
      let computerId = requestedId;

      if (isNew) {
        createdData = await requestComputerJson({
          apiClient,
          computerId: undefined,
          method: "POST",
          body: input.createPayload,
        });
        computerId = extractCreatedComputerId(createdData);
        if (!computerId) {
          throw new Error("Environment creation response did not include an id.");
        }
      }

      const data = await requestComputerJson({
        apiClient,
        computerId,
        method: "PUT",
        body: input.updatePayload,
      });
      return {
        data,
        createdData,
        computerId,
        isNew,
      };
    },

    async delete(computerId: string) {
      const normalizedComputerId = String(computerId || "").trim();
      if (!normalizedComputerId) {
        throw new Error("A computer id is required.");
      }
      return requestComputerJson({
        apiClient,
        computerId: normalizedComputerId,
        method: "DELETE",
      });
    },
  };
  return Object.freeze(repository);
}

function createLegacyComputerResourceRepository({
  backendUrl,
  requestHeaders,
  fetchImpl,
}: ComputerResourceClientOptions): ComputerResourceRepository {
  return createComputerResourceRepository(createPlatformApiClient({
    baseUrl: backendUrl,
    fetchImpl,
    getHeaders: () => requestHeaders,
    credentials: "same-origin",
  }));
}

export async function saveComputerResource(
  options: SaveComputerResourceOptions,
): Promise<SaveComputerResourceResult> {
  try {
    return await createLegacyComputerResourceRepository(options).save(options);
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error(
      String(options.computerId || "").trim()
        ? "Failed to save environment."
        : "Failed to create environment.",
    );
  }
}

export async function deleteComputerResource(
  options: ComputerResourceClientOptions & { computerId: string },
): Promise<Record<string, unknown>> {
  try {
    return await createLegacyComputerResourceRepository(options)
      .delete(options.computerId);
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("Failed to delete environment.");
  }
}
