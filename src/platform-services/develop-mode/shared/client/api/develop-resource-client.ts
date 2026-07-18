import {
  createPlatformApiClient,
  type PlatformApiClient,
} from "../../../../../platform-runtime/platform-api-client.js";

export type DevelopMutableResourceType = "server" | "database";

export interface DevelopResourceClientOptions {
  backendUrl: string;
  requestHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
}

export interface SaveDevelopResourceOptions
  extends DevelopResourceClientOptions {
  resourceType: DevelopMutableResourceType;
  resourceId?: string | null;
  draftId?: string | null;
  payload: unknown;
}

export interface DeleteDevelopResourceOptions
  extends DevelopResourceClientOptions {
  resourceType: DevelopMutableResourceType;
  resourceId: string;
}

export interface DevelopResourceMutationResult {
  data: Record<string, unknown>;
  isNew: boolean;
}

export interface SaveDevelopResourceInput {
  resourceType: DevelopMutableResourceType;
  resourceId?: string | null;
  draftId?: string | null;
  payload: unknown;
}

export interface DevelopResourceRepository {
  list(
    resourceType: DevelopMutableResourceType,
    options?: { kind?: string; signal?: AbortSignal },
  ): Promise<unknown[]>;
  save(input: SaveDevelopResourceInput): Promise<DevelopResourceMutationResult>;
  delete(
    resourceType: DevelopMutableResourceType,
    resourceId: string,
  ): Promise<Record<string, unknown>>;
}

function resourcePath(
  resourceType: DevelopMutableResourceType,
  resourceId?: string | null,
): string {
  const collection = resourceType === "database" ? "databases" : "servers";
  const normalizedId = String(resourceId || "").trim();
  return normalizedId
    ? `/${collection}/${encodeURIComponent(normalizedId)}`
    : `/${collection}`;
}

function toJsonRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function toResourceList(
  value: unknown,
  resourceType: DevelopMutableResourceType,
): unknown[] {
  if (Array.isArray(value)) return value;
  const record = toJsonRecord(value);
  const candidates = resourceType === "database"
    ? [record.databases, record.items, record.data]
    : [record.servers, record.resources, record.items, record.data];
  return candidates.find(Array.isArray) as unknown[] | undefined || [];
}

export function createDevelopResourceRepository(
  apiClient: Pick<
    PlatformApiClient,
    "delete" | "get" | "patch" | "post"
  >,
): DevelopResourceRepository {
  const repository: DevelopResourceRepository = {
    async list(resourceType, options = {}) {
      const value = await apiClient.get(resourcePath(resourceType), {
        query: resourceType === "server" && options.kind
          ? { kind: options.kind }
          : undefined,
        signal: options.signal,
      });
      return toResourceList(value, resourceType);
    },

    async save(input: SaveDevelopResourceInput) {
      const resourceId = String(input.resourceId || "").trim();
      const draftId = String(input.draftId || "").trim();
      const isNew = !resourceId || Boolean(draftId && resourceId === draftId);
      const path = resourcePath(
        input.resourceType,
        isNew ? null : resourceId,
      );
      const data = isNew
        ? await apiClient.post(path, input.payload)
        : await apiClient.patch(path, input.payload);
      return { data: toJsonRecord(data), isNew };
    },

    async delete(
      resourceType: DevelopMutableResourceType,
      resourceId: string,
    ) {
      const normalizedResourceId = String(resourceId || "").trim();
      if (!normalizedResourceId) {
        throw new Error("A resource id is required.");
      }
      return toJsonRecord(await apiClient.delete(
        resourcePath(resourceType, normalizedResourceId),
      ));
    },
  };
  return Object.freeze(repository);
}

export async function saveDevelopResource(
  options: SaveDevelopResourceOptions,
): Promise<DevelopResourceMutationResult> {
  const repository = createDevelopResourceRepository(createPlatformApiClient({
    baseUrl: options.backendUrl,
    fetchImpl: options.fetchImpl,
    getHeaders: () => options.requestHeaders,
    credentials: "same-origin",
  }));
  return repository.save(options);
}

export async function deleteDevelopResource(
  options: DeleteDevelopResourceOptions,
): Promise<Record<string, unknown>> {
  const repository = createDevelopResourceRepository(createPlatformApiClient({
    baseUrl: options.backendUrl,
    fetchImpl: options.fetchImpl,
    getHeaders: () => options.requestHeaders,
    credentials: "same-origin",
  }));
  return repository.delete(options.resourceType, options.resourceId);
}
