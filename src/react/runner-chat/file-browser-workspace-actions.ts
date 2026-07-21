import { buildRunnerHeaders, sanitizeBackendUrl } from "./api-utils.js";
import { normalizeRunnerWorkspaceFolderPath, type RunnerChatFileNode } from "./workspace-files.js";

interface RunnerWorkspaceFileActionOptions {
  apiKey: string;
  backendUrl: string;
  environmentId: string;
  fetchImpl?: typeof fetch;
  item: RunnerChatFileNode;
  requestHeaders?: HeadersInit;
}

export interface RunnerWorkspaceFileRenameOptions extends RunnerWorkspaceFileActionOptions {
  nextName: string;
}

export interface RunnerWorkspaceFileActionResult {
  parentId: string | null;
  sourcePath: string;
  targetPath?: string;
}

function getRunnerWorkspaceItemPath(item: RunnerChatFileNode): string {
  return normalizeRunnerWorkspaceFolderPath(item.path || item.id);
}

function getRunnerWorkspaceParentPath(path: string): string | null {
  const segments = normalizeRunnerWorkspaceFolderPath(path).split("/").filter(Boolean);
  segments.pop();
  return segments.length > 0 ? segments.join("/") : null;
}

function encodeRunnerWorkspaceFilePath(path: string): string {
  return normalizeRunnerWorkspaceFolderPath(path)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function readRunnerWorkspaceActionPayload(
  response: Response,
): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) return {};
  try {
    const payload: unknown = JSON.parse(text);
    return payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  } catch {
    return { message: text };
  }
}

function getRunnerWorkspaceActionError(payload: Record<string, unknown>, fallback: string): string {
  return String(payload.message || payload.error || fallback);
}

function validateRunnerWorkspaceActionOptions({
  backendUrl,
  environmentId,
  item,
}: RunnerWorkspaceFileActionOptions): {
  normalizedBackendUrl: string;
  normalizedEnvironmentId: string;
  sourcePath: string;
} {
  const normalizedBackendUrl = sanitizeBackendUrl(backendUrl);
  const normalizedEnvironmentId = String(environmentId || "").trim();
  const sourcePath = getRunnerWorkspaceItemPath(item);
  if (!normalizedBackendUrl) throw new Error("A backend URL is required.");
  if (!normalizedEnvironmentId) throw new Error("Select a computer before changing files.");
  if (!sourcePath) throw new Error("The selected file has no workspace path.");
  return { normalizedBackendUrl, normalizedEnvironmentId, sourcePath };
}

export async function renameRunnerWorkspaceFile({
  apiKey,
  backendUrl,
  environmentId,
  fetchImpl = globalThis.fetch,
  item,
  nextName,
  requestHeaders,
}: RunnerWorkspaceFileRenameOptions): Promise<RunnerWorkspaceFileActionResult> {
  const { normalizedBackendUrl, normalizedEnvironmentId, sourcePath } =
    validateRunnerWorkspaceActionOptions({
      apiKey,
      backendUrl,
      environmentId,
      fetchImpl,
      item,
      requestHeaders,
    });
  const normalizedName = String(nextName || "").trim();
  if (!normalizedName || normalizedName === "." || normalizedName === "..") {
    throw new Error("Enter a valid file name.");
  }
  if (/[\\/]/.test(normalizedName)) {
    throw new Error("File names cannot contain path separators.");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("File operations are unavailable.");
  }

  const parentId = getRunnerWorkspaceParentPath(sourcePath);
  const targetPath = [parentId, normalizedName].filter(Boolean).join("/");
  if (targetPath === sourcePath) {
    return { parentId, sourcePath, targetPath };
  }
  const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
  headers.set("Content-Type", "application/json");
  const response = await fetchImpl(
    `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/files/move`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ sourcePath, destPath: targetPath }),
    },
  );
  const payload = await readRunnerWorkspaceActionPayload(response);
  if (!response.ok) {
    throw new Error(getRunnerWorkspaceActionError(payload, `Failed to rename ${item.name}.`));
  }
  return { parentId, sourcePath, targetPath };
}

export async function deleteRunnerWorkspaceFile({
  apiKey,
  backendUrl,
  environmentId,
  fetchImpl = globalThis.fetch,
  item,
  requestHeaders,
}: RunnerWorkspaceFileActionOptions): Promise<RunnerWorkspaceFileActionResult> {
  const { normalizedBackendUrl, normalizedEnvironmentId, sourcePath } =
    validateRunnerWorkspaceActionOptions({
      apiKey,
      backendUrl,
      environmentId,
      fetchImpl,
      item,
      requestHeaders,
    });
  if (typeof fetchImpl !== "function") {
    throw new Error("File operations are unavailable.");
  }
  const response = await fetchImpl(
    `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/files/${encodeRunnerWorkspaceFilePath(sourcePath)}`,
    {
      method: "DELETE",
      headers: buildRunnerHeaders(requestHeaders, apiKey.trim()),
    },
  );
  const payload = await readRunnerWorkspaceActionPayload(response);
  if (!response.ok) {
    throw new Error(getRunnerWorkspaceActionError(payload, `Failed to delete ${item.name}.`));
  }
  return {
    parentId: getRunnerWorkspaceParentPath(sourcePath),
    sourcePath,
  };
}

export function remapRunnerWorkspaceItemPath(
  item: RunnerChatFileNode,
  sourcePath: string,
  targetPath: string,
): RunnerChatFileNode {
  const normalizedSourcePath = normalizeRunnerWorkspaceFolderPath(sourcePath);
  const normalizedTargetPath = normalizeRunnerWorkspaceFolderPath(targetPath);
  const normalizedItemPath = normalizeRunnerWorkspaceFolderPath(item.path || item.id);
  if (
    normalizedItemPath !== normalizedSourcePath &&
    !normalizedItemPath.startsWith(`${normalizedSourcePath}/`)
  ) {
    return item;
  }
  const nextPath = `${normalizedTargetPath}${normalizedItemPath.slice(normalizedSourcePath.length)}`;
  const nextParentId = getRunnerWorkspaceParentPath(nextPath);
  return {
    ...item,
    id: nextPath,
    path: `/${nextPath}`,
    parentId: nextParentId,
    name: nextPath.split("/").filter(Boolean).pop() || item.name,
  };
}

export function isRunnerWorkspacePathWithin(candidatePath: string, parentPath: string): boolean {
  const normalizedCandidate = normalizeRunnerWorkspaceFolderPath(candidatePath);
  const normalizedParent = normalizeRunnerWorkspaceFolderPath(parentPath);
  return (
    normalizedCandidate === normalizedParent ||
    normalizedCandidate.startsWith(`${normalizedParent}/`)
  );
}
