import {
  createPlatformApiClient,
  type PlatformApiClient,
} from "../../../platform-runtime/platform-api-client.js";

export interface ComputerResourceClientOptions {
  backendUrl: string;
  requestHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
}

export interface SaveComputerResourceOptions extends ComputerResourceClientOptions {
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

/**
 * The authoritative build source returned by the Computers API.
 *
 * `effectiveDockerfile` is the complete file used to build the container.
 * `dockerfileExtensions` remains separate because the current write contract
 * only persists the custom suffix, not an arbitrary replacement Dockerfile.
 */
export interface ComputerDockerfileSource {
  baseImage: string;
  dockerfileExtensions: string;
  effectiveDockerfile: string;
}

export interface LoadComputerDockerfileOptions extends ComputerResourceClientOptions {
  computerId: string;
  signal?: AbortSignal;
}

export interface ComputerResourceRepository {
  list(signal?: AbortSignal): Promise<unknown[]>;
  getDockerfile(
    computerId: string,
    signal?: AbortSignal,
  ): Promise<ComputerDockerfileSource>;
  save(input: SaveComputerResourceInput): Promise<SaveComputerResourceResult>;
  delete(computerId: string): Promise<Record<string, unknown>>;
}

function toJsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
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

function unwrapComputerDockerfileRecord(
  value: unknown,
): Record<string, unknown> {
  const record = toJsonRecord(value);
  for (const candidate of [record.dockerfile, record.data]) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return candidate as Record<string, unknown>;
    }
  }
  return record;
}

function joinDockerfileSections(baseImage: string, extensions: string): string {
  const normalizedBaseImage = baseImage.trim();
  const normalizedExtensions = extensions.trim();
  return (
    [
      normalizedBaseImage ? `FROM ${normalizedBaseImage}` : "",
      normalizedExtensions,
    ]
      .filter(Boolean)
      .join("\n\n") + (normalizedBaseImage || normalizedExtensions ? "\n" : "")
  );
}

export function normalizeComputerDockerfileSource(
  value: unknown,
): ComputerDockerfileSource {
  const record = unwrapComputerDockerfileRecord(value);
  const baseImage =
    typeof record.baseImage === "string"
      ? record.baseImage
      : typeof record.base_image === "string"
        ? record.base_image
        : "";
  const dockerfileExtensions =
    typeof record.dockerfileExtensions === "string"
      ? record.dockerfileExtensions
      : typeof record.dockerfile_extensions === "string"
        ? record.dockerfile_extensions
        : "";
  const providedEffectiveDockerfile =
    typeof record.effectiveDockerfile === "string"
      ? record.effectiveDockerfile
      : typeof record.effective_dockerfile === "string"
        ? record.effective_dockerfile
        : "";
  return Object.freeze({
    baseImage,
    dockerfileExtensions,
    effectiveDockerfile:
      providedEffectiveDockerfile ||
      joinDockerfileSections(baseImage, dockerfileExtensions),
  });
}

function extractCreatedComputerId(data: Record<string, unknown>): string {
  const nested =
    data.environment &&
    typeof data.environment === "object" &&
    !Array.isArray(data.environment)
      ? (data.environment as Record<string, unknown>)
      : data.data && typeof data.data === "object" && !Array.isArray(data.data)
        ? (data.data as Record<string, unknown>)
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
  apiClient: Pick<PlatformApiClient, "delete" | "get" | "post" | "put">,
): ComputerResourceRepository {
  const repository: ComputerResourceRepository = {
    async list(signal?: AbortSignal) {
      return toComputerList(await apiClient.get("/environments", { signal }));
    },

    async getDockerfile(computerId: string, signal?: AbortSignal) {
      const normalizedComputerId = String(computerId || "").trim();
      if (!normalizedComputerId) {
        throw new Error("A computer id is required.");
      }
      return normalizeComputerDockerfileSource(
        await apiClient.get(
          `/environments/${encodeURIComponent(normalizedComputerId)}/dockerfile`,
          { signal },
        ),
      );
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
          throw new Error(
            "Environment creation response did not include an id.",
          );
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
  return createComputerResourceRepository(
    createPlatformApiClient({
      baseUrl: backendUrl,
      fetchImpl,
      getHeaders: () => requestHeaders,
      credentials: "same-origin",
    }),
  );
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
    return await createLegacyComputerResourceRepository(options).delete(
      options.computerId,
    );
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("Failed to delete environment.");
  }
}

export async function loadComputerDockerfile(
  options: LoadComputerDockerfileOptions,
): Promise<ComputerDockerfileSource> {
  try {
    return await createLegacyComputerResourceRepository(options).getDockerfile(
      options.computerId,
      options.signal,
    );
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("Failed to load the computer Dockerfile.");
  }
}
