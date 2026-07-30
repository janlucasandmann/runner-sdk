import {
  getPlatformPluginConnectionDefinition,
  normalizePlatformPluginConnectionStatus,
} from "./plugin-connection-registry.js";
import type {
  PlatformGitHubRepositoryBranch,
  PlatformPluginConnectionId,
  PlatformPluginConnectionStart,
  PlatformPluginConnectionStatus,
} from "./plugin-connection-types.js";

type PluginFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

// Connector identity rarely changes without an explicit connect/disconnect
// mutation (both invalidate this cache). A longer read window prevents page
// navigation and React remounts from repeatedly hitting every provider.
const STATUS_CACHE_TTL_MS = 30_000;
const connectionStatusCache = new Map<
  PlatformPluginConnectionId,
  { expiresAt: number; status: PlatformPluginConnectionStatus }
>();
const connectionStatusRequests = new Map<
  PlatformPluginConnectionId,
  Promise<PlatformPluginConnectionStatus>
>();

function invalidatePlatformPluginConnectionStatus(
  id: PlatformPluginConnectionId,
): void {
  connectionStatusCache.delete(id);
  connectionStatusRequests.delete(id);
}

export class PlatformPluginConnectionRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, options: { status?: number; code?: string } = {}) {
    super(message);
    this.name = "PlatformPluginConnectionRequestError";
    this.status = options.status || 0;
    this.code = options.code || "PLUGIN_CONNECTION_REQUEST_FAILED";
  }
}

function getDefaultFetch(): PluginFetch {
  if (typeof globalThis.fetch !== "function") {
    throw new PlatformPluginConnectionRequestError("The browser fetch API is unavailable.");
  }
  return globalThis.fetch.bind(globalThis);
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const payload = await response.json().catch(() => ({}));
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? (payload as Record<string, unknown>)
    : {};
}

async function requireSuccessfulJson(
  response: Response,
  fallbackMessage: string,
): Promise<Record<string, unknown>> {
  const payload = await readJson(response);
  if (response.ok) return payload;
  const message = [payload.message, payload.error].find(
    (value) => typeof value === "string" && value.trim(),
  );
  throw new PlatformPluginConnectionRequestError(
    typeof message === "string" ? message : fallbackMessage,
    {
      status: response.status,
      code: typeof payload.code === "string" ? payload.code : undefined,
    },
  );
}

export interface PlatformPluginConnectionRequestOptions {
  fetch?: PluginFetch;
  signal?: AbortSignal;
}

export async function fetchPlatformPluginConnectionStatus(
  id: PlatformPluginConnectionId,
  options: PlatformPluginConnectionRequestOptions = {},
): Promise<PlatformPluginConnectionStatus> {
  // Explicit fetch implementations and abort signals are request-scoped
  // (primarily tests and detail flows), so they must not share lifecycle.
  const canShareRequest = !options.fetch && !options.signal;
  if (canShareRequest) {
    const cached = connectionStatusCache.get(id);
    if (cached && cached.expiresAt > Date.now()) return cached.status;
    const pending = connectionStatusRequests.get(id);
    if (pending) return pending;
  }

  const definition = getPlatformPluginConnectionDefinition(id);
  const request = (async () => {
    const response = await (options.fetch || getDefaultFetch())(definition.statusPath, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: options.signal,
    });
    const payload = await requireSuccessfulJson(
      response,
      `Unable to read the ${definition.label} connection.`,
    );
    const status = normalizePlatformPluginConnectionStatus(id, payload);
    if (canShareRequest) {
      connectionStatusCache.set(id, {
        expiresAt: Date.now() + STATUS_CACHE_TTL_MS,
        status,
      });
    }
    return status;
  })();
  if (!canShareRequest) return request;

  connectionStatusRequests.set(id, request);
  try {
    return await request;
  } finally {
    if (connectionStatusRequests.get(id) === request) {
      connectionStatusRequests.delete(id);
    }
  }
}

export interface BeginPlatformPluginConnectionOptions
  extends PlatformPluginConnectionRequestOptions {
  redirectTo: string;
  scope?: string;
  credentialId?: string;
  credentialName?: string;
  organizationId?: string;
}

export interface SavePlatformPluginCredentialsOptions
  extends PlatformPluginConnectionRequestOptions {
  credentialId?: string;
  credentialName: string;
  organizationId?: string;
  values: Record<string, unknown>;
}

export async function beginPlatformPluginConnection(
  id: PlatformPluginConnectionId,
  options: BeginPlatformPluginConnectionOptions,
): Promise<PlatformPluginConnectionStart> {
  const definition = getPlatformPluginConnectionDefinition(id);
  const response = await (options.fetch || getDefaultFetch())(definition.loginPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    signal: options.signal,
    body: JSON.stringify({
      redirectTo: options.redirectTo,
      ...(options.scope?.trim() ? { scope: options.scope.trim() } : {}),
      ...(options.credentialId?.trim() ? { credentialId: options.credentialId.trim() } : {}),
      ...(options.credentialName?.trim() ? { credentialName: options.credentialName.trim() } : {}),
      ...(options.organizationId?.trim() ? { organizationId: options.organizationId.trim() } : {}),
    }),
  });
  const payload = await requireSuccessfulJson(
    response,
    `Unable to start the ${definition.label} connection.`,
  );
  const authUrl = typeof payload.authUrl === "string" ? payload.authUrl.trim() : "";
  if (!authUrl) {
    throw new PlatformPluginConnectionRequestError(
      `${definition.label} did not return an authorization URL.`,
      { status: response.status, code: "PLUGIN_AUTH_URL_MISSING" },
    );
  }
  return {
    authUrl,
    ...(typeof payload.state === "string" ? { state: payload.state } : {}),
  };
}

export async function disconnectPlatformPluginConnection(
  id: PlatformPluginConnectionId,
  options: PlatformPluginConnectionRequestOptions & { credentialId?: string } = {},
): Promise<void> {
  invalidatePlatformPluginConnectionStatus(id);
  const definition = getPlatformPluginConnectionDefinition(id);
  const response = await (options.fetch || getDefaultFetch())(definition.disconnectPath, {
    method: "POST",
    headers: options.credentialId?.trim() ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    signal: options.signal,
    body: options.credentialId?.trim()
      ? JSON.stringify({ credentialId: options.credentialId.trim() })
      : undefined,
  });
  await requireSuccessfulJson(response, `Unable to disconnect ${definition.label}.`);
  invalidatePlatformPluginConnectionStatus(id);
}

export async function savePlatformPluginCredentials(
  id: PlatformPluginConnectionId,
  options: SavePlatformPluginCredentialsOptions,
): Promise<PlatformPluginConnectionStatus> {
  invalidatePlatformPluginConnectionStatus(id);
  const definition = getPlatformPluginConnectionDefinition(id);
  if (!["api-key", "service-account"].includes(definition.authentication)) {
    throw new PlatformPluginConnectionRequestError(
      `${definition.label} uses ${definition.authentication} authentication.`,
      { code: "PLUGIN_CREDENTIAL_AUTH_UNSUPPORTED" },
    );
  }
  const response = await (options.fetch || getDefaultFetch())(
    definition.credentialsPath,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: options.signal,
      body: JSON.stringify({
        credentialName: options.credentialName,
        values: options.values,
        ...(options.credentialId?.trim()
          ? { credentialId: options.credentialId.trim() }
          : {}),
        ...(options.organizationId?.trim()
          ? { organizationId: options.organizationId.trim() }
          : {}),
      }),
    },
  );
  const payload = await requireSuccessfulJson(
    response,
    `Unable to save ${definition.label} credentials.`,
  );
  const status = normalizePlatformPluginConnectionStatus(id, payload);
  invalidatePlatformPluginConnectionStatus(id);
  return status;
}

function requireGitHubRepositoryFullName(value: string): [owner: string, repository: string] {
  const parts = String(value || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length !== 2) {
    throw new PlatformPluginConnectionRequestError(
      "A GitHub repository must use the owner/repository format.",
      { code: "GITHUB_REPOSITORY_INVALID" },
    );
  }
  return [parts[0], parts[1]];
}

export async function fetchPlatformGitHubRepositoryBranches(
  fullName: string,
  options: PlatformPluginConnectionRequestOptions = {},
): Promise<PlatformGitHubRepositoryBranch[]> {
  const [owner, repository] = requireGitHubRepositoryFullName(fullName);
  const path = `/api/aios/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/branches`;
  const response = await (options.fetch || getDefaultFetch())(path, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    signal: options.signal,
  });
  const payload = await requireSuccessfulJson(
    response,
    `Unable to load branches for ${owner}/${repository}.`,
  );
  const branches = Array.isArray(payload.branches) ? payload.branches : [];
  return branches.flatMap((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const branch = value as Record<string, unknown>;
    const name = typeof branch.name === "string" ? branch.name.trim() : "";
    return name ? [{ name, protected: Boolean(branch.protected) }] : [];
  });
}
