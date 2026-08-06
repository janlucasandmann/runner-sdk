import { getPlatformConnectorCatalogEntry } from "../../../platform-integrations/connectors/index.js";
import { fetchPlatformPluginConnectionStatus } from "./plugin-connection-client.js";
import { getPlatformPluginConnectionIdentity } from "./plugin-connection-registry.js";
import type {
  PlatformPluginFileAccount,
  PlatformPluginFileConnectionId,
  PlatformPluginFileContent,
  PlatformPluginFileItem,
  PlatformPluginFileRequestOptions,
  PlatformPluginFileSourceDefinition,
  PlatformPluginFileSourceStatus,
} from "./plugin-connection-types.js";

const PLATFORM_PLUGIN_FILE_CONNECTION_IDS = Object.freeze([
  "github",
  "google-drive",
  "one-drive",
] as const satisfies readonly PlatformPluginFileConnectionId[]);

function getDefaultFetch() {
  if (typeof fetch !== "function") {
    throw new Error("File connector requests require a fetch implementation.");
  }
  return fetch.bind(globalThis);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getOrganizationScopedRequest(
  path: string,
  options: PlatformPluginFileRequestOptions,
): { headers?: Record<string, string>; path: string } {
  const organizationId = stringValue(options.organizationId);
  const credentialId = stringValue(options.credentialId);
  if (!organizationId && !credentialId) return { path };
  const url = new URL(path, "http://platform.local");
  if (organizationId) url.searchParams.set("organizationId", organizationId);
  if (credentialId) url.searchParams.set("credentialId", credentialId);
  return {
    path: `${url.pathname}${url.search}`,
    ...(organizationId
      ? { headers: { "X-Computer-Agents-Organization": organizationId } }
      : {}),
  };
}

function getPlatformPluginFileAccounts(
  status: Awaited<ReturnType<typeof fetchPlatformPluginConnectionStatus>>,
  fallbackIdentity: string,
): PlatformPluginFileAccount[] {
  const accounts = (status.credentials || [])
    .filter((credential) => credential.status !== "invalid")
    .map((credential) => ({
      id: credential.id,
      name: credential.name || credential.identity || "Connected account",
      identity: credential.identity || credential.name || fallbackIdentity || "Connected",
      isDefault: credential.id === status.defaultCredentialId || credential.isDefault,
      status: credential.status,
    }));
  if (accounts.length > 0 || !status.connected) return accounts;
  return [{
    id: "",
    name: "Connected account",
    identity: fallbackIdentity || "Connected",
    isDefault: true,
    status: "valid",
  }];
}

async function readJsonResponse(response: Response, fallbackMessage: string): Promise<unknown> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const record = asRecord(payload);
    throw new Error(stringValue(record.error) || stringValue(record.message) || fallbackMessage);
  }
  return payload;
}

function encodeGitHubFolderSegment(value: unknown): string {
  return encodeURIComponent(stringValue(value));
}

function decodeGitHubFolderSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function createPlatformGitHubRepositoryFolderId(
  repositoryFullName: string,
  ref = "",
): string {
  return `github-repo:${encodeGitHubFolderSegment(repositoryFullName)}:${encodeGitHubFolderSegment(ref)}`;
}

export function createPlatformGitHubNodeId(
  repositoryFullName: string,
  path: string,
  ref = "",
): string {
  return `github-node:${encodeGitHubFolderSegment(repositoryFullName)}:${encodeGitHubFolderSegment(ref)}:${encodeGitHubFolderSegment(path)}`;
}

export function parsePlatformGitHubFolderId(folderId: string): {
  repositoryFullName: string;
  path: string;
  ref: string;
  isRoot: boolean;
} {
  const normalizedFolderId = stringValue(folderId);
  if (!normalizedFolderId || normalizedFolderId === "root") {
    return { repositoryFullName: "", path: "", ref: "", isRoot: true };
  }

  const prefix = normalizedFolderId.startsWith("github-repo:")
    ? "github-repo:"
    : normalizedFolderId.startsWith("github-node:")
      ? "github-node:"
      : "";
  if (!prefix) {
    return { repositoryFullName: "", path: "", ref: "", isRoot: true };
  }

  const segments = normalizedFolderId.slice(prefix.length).split(":");
  return {
    repositoryFullName: decodeGitHubFolderSegment(segments[0] || ""),
    ref: decodeGitHubFolderSegment(segments[1] || ""),
    path: prefix === "github-node:"
      ? decodeGitHubFolderSegment(segments.slice(2).join(":"))
      : "",
    isRoot: false,
  };
}

function getGitHubRepositoryPath(repositoryFullName: string): string {
  return repositoryFullName
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function normalizeDriveFile(
  providerId: "google-drive" | "one-drive",
  value: unknown,
): PlatformPluginFileItem {
  const file = asRecord(value);
  const mimeType = stringValue(file.mimeType);
  return {
    id: stringValue(file.id),
    providerId,
    name: stringValue(file.name) || "Untitled file",
    path: stringValue(file.id),
    isFolder: providerId === "google-drive"
      ? Boolean(file.isFolder) || mimeType === "application/vnd.google-apps.folder"
      : Boolean(file.isFolder),
    size: numberValue(file.size),
    ...(stringValue(file.modifiedTime) ? { modifiedTime: stringValue(file.modifiedTime) } : {}),
    ...(stringValue(file.createdTime) ? { createdTime: stringValue(file.createdTime) } : {}),
    ...(mimeType ? { mimeType } : {}),
    ...(stringValue(file.thumbnailLink) ? { previewUrl: stringValue(file.thumbnailLink) } : {}),
    ...(stringValue(file.webUrl) ? { webUrl: stringValue(file.webUrl) } : {}),
  };
}

export function listPlatformPluginFileSourceDefinitions(): readonly PlatformPluginFileSourceDefinition[] {
  return PLATFORM_PLUGIN_FILE_CONNECTION_IDS.map((id) => {
    const catalogEntry = getPlatformConnectorCatalogEntry(id);
    return Object.freeze({
      id,
      label: catalogEntry?.label || id,
      logoUrl: catalogEntry?.logoUrl || "",
    });
  });
}

export async function fetchPlatformPluginFileSourceStatuses(
  options: PlatformPluginFileRequestOptions = {},
): Promise<PlatformPluginFileSourceStatus[]> {
  const definitions = listPlatformPluginFileSourceDefinitions();
  return Promise.all(definitions.map(async (definition) => {
    try {
      const status = await fetchPlatformPluginConnectionStatus(definition.id, options);
      const identity = getPlatformPluginConnectionIdentity(definition.id, status);
      const accounts = getPlatformPluginFileAccounts(status, identity);
      const defaultCredentialId = accounts.some((account) => account.id === status.defaultCredentialId)
        ? status.defaultCredentialId
        : accounts.find((account) => account.isDefault)?.id || accounts[0]?.id || "";
      return {
        ...definition,
        accounts,
        connected: status.connected,
        ...(defaultCredentialId ? { defaultCredentialId } : {}),
        identity,
      };
    } catch (error) {
      return {
        ...definition,
        accounts: [],
        connected: false,
        identity: "Unavailable",
        error: error instanceof Error ? error.message : `Unable to read ${definition.label}.`,
      };
    }
  }));
}

async function fetchDriveFiles(
  providerId: "google-drive" | "one-drive",
  folderId: string,
  options: PlatformPluginFileRequestOptions,
): Promise<PlatformPluginFileItem[]> {
  const request = options.fetch || getDefaultFetch();
  const apiSegment = providerId === "one-drive" ? "onedrive" : "google-drive";
  const scopedRequest = getOrganizationScopedRequest(
    `/api/aios/${apiSegment}/files?folderId=${encodeURIComponent(folderId || "root")}`,
    options,
  );
  const response = await request(scopedRequest.path, {
    method: "GET",
    credentials: "include",
    headers: scopedRequest.headers,
    signal: options.signal,
  });
  const payload = asRecord(await readJsonResponse(response, `Unable to load ${providerId} files.`));
  return (Array.isArray(payload.files) ? payload.files : [])
    .map((file) => normalizeDriveFile(providerId, file))
    .filter((file) => Boolean(file.id));
}

async function fetchGitHubFiles(
  folderId: string,
  options: PlatformPluginFileRequestOptions,
): Promise<PlatformPluginFileItem[]> {
  const request = options.fetch || getDefaultFetch();
  const parsedFolder = parsePlatformGitHubFolderId(folderId);
  if (parsedFolder.isRoot) {
    const scopedRequest = getOrganizationScopedRequest("/api/aios/github/repos?per_page=100", options);
    const response = await request(scopedRequest.path, {
      method: "GET",
      credentials: "include",
      headers: scopedRequest.headers,
      signal: options.signal,
    });
    const payload = asRecord(await readJsonResponse(response, "Unable to load GitHub repositories."));
    return (Array.isArray(payload.repos) ? payload.repos : []).map((value) => {
      const repository = asRecord(value);
      const repositoryFullName = stringValue(repository.full_name);
      const ref = stringValue(repository.default_branch);
      return {
        id: createPlatformGitHubRepositoryFolderId(repositoryFullName, ref),
        providerId: "github" as const,
        name: stringValue(repository.name) || repositoryFullName || "Repository",
        path: "",
        isFolder: true,
        size: 0,
        repoFullName: repositoryFullName,
        ...(ref ? { ref } : {}),
        ...(stringValue(repository.html_url) ? { webUrl: stringValue(repository.html_url) } : {}),
      };
    }).filter((item) => Boolean(item.repoFullName));
  }

  const params = new URLSearchParams();
  if (parsedFolder.path) params.set("path", parsedFolder.path);
  if (parsedFolder.ref) params.set("ref", parsedFolder.ref);
  const repositoryPath = getGitHubRepositoryPath(parsedFolder.repositoryFullName);
  const scopedRequest = getOrganizationScopedRequest(
    `/api/aios/github/repos/${repositoryPath}/contents${params.toString() ? `?${params.toString()}` : ""}`,
    options,
  );
  const response = await request(scopedRequest.path, {
    method: "GET",
    credentials: "include",
    headers: scopedRequest.headers,
    signal: options.signal,
  });
  const rawPayload = await readJsonResponse(response, "Unable to load GitHub files.");
  const payload = asRecord(rawPayload);
  const items = Array.isArray(rawPayload)
    ? rawPayload
    : Array.isArray(payload.contents)
      ? payload.contents
      : [];
  const ref = stringValue(payload.ref) || parsedFolder.ref;
  return items.map((value) => {
    const item = asRecord(value);
    const path = stringValue(item.path);
    const isFolder = stringValue(item.type) === "dir";
    return {
      id: createPlatformGitHubNodeId(parsedFolder.repositoryFullName, path, ref),
      providerId: "github" as const,
      name: stringValue(item.name) || path || "Untitled file",
      path,
      isFolder,
      size: numberValue(item.size),
      repoFullName: parsedFolder.repositoryFullName,
      ...(ref ? { ref } : {}),
      ...(stringValue(item.html_url) ? { webUrl: stringValue(item.html_url) } : {}),
    };
  }).filter((item) => Boolean(item.path));
}

export async function fetchPlatformPluginFiles(
  providerId: PlatformPluginFileConnectionId,
  folderId = "root",
  options: PlatformPluginFileRequestOptions = {},
): Promise<PlatformPluginFileItem[]> {
  if (providerId === "github") return fetchGitHubFiles(folderId, options);
  return fetchDriveFiles(providerId, folderId, options);
}

export async function fetchPlatformPluginFileContent(
  item: PlatformPluginFileItem,
  options: PlatformPluginFileRequestOptions = {},
): Promise<PlatformPluginFileContent> {
  if (item.isFolder) throw new Error("Folders do not have downloadable file content.");
  const request = options.fetch || getDefaultFetch();
  let requestUrl = "";
  if (item.providerId === "github") {
    if (!item.repoFullName || !item.path) throw new Error("Missing GitHub file metadata.");
    const params = new URLSearchParams({ path: item.path });
    if (item.ref) params.set("ref", item.ref);
    requestUrl = `/api/aios/github/repos/${getGitHubRepositoryPath(item.repoFullName)}/download?${params.toString()}`;
  } else {
    const apiSegment = item.providerId === "one-drive" ? "onedrive" : "google-drive";
    requestUrl = `/api/aios/${apiSegment}/download?fileId=${encodeURIComponent(item.id)}`;
  }
  const scopedRequest = getOrganizationScopedRequest(requestUrl, options);
  const response = await request(scopedRequest.path, {
    method: "GET",
    credentials: "include",
    headers: scopedRequest.headers,
    signal: options.signal,
  });
  const payload = asRecord(await readJsonResponse(response, `Unable to load ${item.name}.`));
  return {
    content: stringValue(payload.content),
    encoding: stringValue(payload.encoding) === "utf8" ? "utf8" : "base64",
    name: stringValue(payload.name) || item.name,
    ...(stringValue(payload.mimeType) || item.mimeType
      ? { mimeType: stringValue(payload.mimeType) || item.mimeType }
      : {}),
  };
}
