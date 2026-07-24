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
  const definition = getPlatformPluginConnectionDefinition(id);
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
  return normalizePlatformPluginConnectionStatus(id, payload);
}

export interface BeginPlatformPluginConnectionOptions
  extends PlatformPluginConnectionRequestOptions {
  redirectTo: string;
  scope?: string;
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
  options: PlatformPluginConnectionRequestOptions = {},
): Promise<void> {
  const definition = getPlatformPluginConnectionDefinition(id);
  const response = await (options.fetch || getDefaultFetch())(definition.disconnectPath, {
    method: "POST",
    credentials: "include",
    signal: options.signal,
  });
  await requireSuccessfulJson(response, `Unable to disconnect ${definition.label}.`);
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
