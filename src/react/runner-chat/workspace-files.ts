import { buildRunnerPreviewDownloadUrl } from "../runner-document-preview.js";
import { sanitizeBackendUrl } from "./api-utils.js";
import { getBrowserFileType } from "./attachment-utils.js";
import type { RunnerWorkspaceSelectorMode } from "./voice-audio.js";

const RUNNER_CHAT_WORKSPACE_SELECTION_STORAGE_KEY_PREFIX =
  "tb_runner_chat_workspace_selection_v1";

export interface RunnerChatFileNode {
  id: string;
  name: string;
  parentId?: string | null;
  isFolder?: boolean;
  hasChildren?: boolean;
  mimeType?: string;
  size?: number;
  modifiedTime?: string;
  createdTime?: string;
  previewUrl?: string;
  path?: string;
  repoFullName?: string;
  ref?: string;
}

export interface RunnerChatNotionDatabase {
  id: string;
  name: string;
  icon?: string | null;
}

export interface RunnerWorkspaceSelection {
  mode: RunnerWorkspaceSelectorMode;
  environmentId: string;
  projectId: string;
}

export function buildWorkspaceSelectionStorageKey(
  appId: string,
  backendUrl: string,
): string {
  return `${RUNNER_CHAT_WORKSPACE_SELECTION_STORAGE_KEY_PREFIX}:${appId || "runner-web-sdk"}:${sanitizeBackendUrl(backendUrl) || "default"}`;
}

export function normalizeWorkspaceSelectorMode(
  value: unknown,
): RunnerWorkspaceSelectorMode {
  return value === "projects" ? "projects" : "computers";
}

export function loadPersistedWorkspaceSelection(
  storageKey: string,
): RunnerWorkspaceSelection | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    return {
      mode: normalizeWorkspaceSelectorMode(record.mode),
      environmentId:
        typeof record.environmentId === "string" ? record.environmentId.trim() : "",
      projectId: typeof record.projectId === "string" ? record.projectId.trim() : "",
    };
  } catch {
    return null;
  }
}

export function persistWorkspaceSelection(
  storageKey: string,
  selection: {
    mode: RunnerWorkspaceSelectorMode;
    environmentId?: string | null;
    projectId?: string | null;
  },
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        mode: selection.mode,
        environmentId: String(selection.environmentId || "").trim(),
        projectId: String(selection.projectId || "").trim(),
      }),
    );
  } catch {
    // Persistence is opportunistic; the in-memory selector remains usable.
  }
}

export function normalizeEnvironmentWorkspaceItems(input: unknown): RunnerChatFileNode[] {
  const rawItems = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as { data?: unknown[] }).data)
      ? (input as { data: unknown[] }).data
      : input && typeof input === "object" && Array.isArray((input as { files?: unknown[] }).files)
        ? (input as { files: unknown[] }).files
        : [];

  return rawItems
    .map((entry): RunnerChatFileNode | null => {
      if (!entry || typeof entry !== "object") return null;
      const file = entry as Record<string, unknown>;
      const modifiedTime =
        typeof file.modifiedAt === "string"
          ? file.modifiedAt
          : typeof file.lastModified === "string"
            ? file.lastModified
            : typeof file.modifiedTime === "string"
              ? file.modifiedTime
              : typeof file.updatedAt === "string"
                ? file.updatedAt
                : undefined;
      const createdTime =
        typeof file.createdAt === "string"
          ? file.createdAt
          : typeof file.createdTime === "string"
            ? file.createdTime
            : undefined;
      const rawPath = typeof file.path === "string" ? file.path : "";
      const normalizedPath = rawPath.replace(/^\/+/, "").replace(/\/+$/, "");
      const explicitName = typeof file.name === "string" ? file.name : "";
      const name = explicitName || normalizedPath.split("/").filter(Boolean).pop() || "";
      if (!name) return null;

      const parentSegments = normalizedPath.split("/").filter(Boolean);
      parentSegments.pop();
      const parentId = parentSegments.length ? parentSegments.join("/") : null;
      const type = typeof file.type === "string" ? file.type : "";
      const isFolder = type === "directory" || type === "folder";
      const hasChildren =
        typeof file.hasChildren === "boolean"
          ? file.hasChildren
          : typeof file.childCount === "number"
            ? file.childCount > 0
            : undefined;

      return {
        id: normalizedPath || name,
        name,
        path: `/${normalizedPath}`,
        parentId,
        isFolder,
        hasChildren,
        mimeType: typeof file.mimeType === "string" ? file.mimeType : undefined,
        size: typeof file.size === "number" ? file.size : undefined,
        modifiedTime,
        createdTime,
      };
    })
    .filter((item): item is RunnerChatFileNode => item !== null);
}

export function isBrowserFilePreviewable(file: RunnerChatFileNode): boolean {
  const fileType = getBrowserFileType(file.mimeType, file.name);
  return fileType === "image"
    || fileType === "video"
    || fileType === "code"
    || fileType === "document"
    || file.name.endsWith(".txt")
    || file.name.endsWith(".md")
    || file.name.endsWith(".json");
}

export function buildEnvironmentFileDownloadUrl(
  backendUrl: string,
  environmentId: string,
  filePath?: string,
): string | null {
  return buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath);
}

export function buildEnvironmentFileThumbnailUrl(
  backendUrl: string,
  environmentId: string,
  filePath?: string,
  size = 64,
): string | null {
  const normalizedBackendUrl = sanitizeBackendUrl(backendUrl);
  const normalizedEnvironmentId = String(environmentId || "").trim();
  const encodedPath = normalizeRunnerWorkspaceFolderPath(filePath)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  if (!normalizedBackendUrl || !normalizedEnvironmentId || !encodedPath) {
    return null;
  }
  const normalizedSize = Math.max(
    16,
    Math.min(256, Number.parseInt(String(size || 64), 10) || 64),
  );
  return (
    `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}`
    + `/files/thumbnail/${encodedPath}?w=${normalizedSize}&h=${normalizedSize}`
  );
}

export function normalizeRunnerWorkspaceFolderPath(folderPath?: string | null): string {
  return String(folderPath || "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

export function buildEnvironmentFileListUrl(
  backendUrl: string,
  environmentId: string,
  folderPath = "",
  depth = 1,
): string | null {
  const normalizedBackendUrl = sanitizeBackendUrl(backendUrl);
  const normalizedEnvironmentId = String(environmentId || "").trim();
  if (!normalizedBackendUrl || !normalizedEnvironmentId) {
    return null;
  }
  const normalizedFolderPath = normalizeRunnerWorkspaceFolderPath(folderPath);
  const params = new URLSearchParams();
  params.set("depth", String(depth));
  if (normalizedFolderPath) {
    params.set("path", normalizedFolderPath);
  }
  return `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/files?${params.toString()}`;
}

export function mergeDriveFolderItems(
  current: RunnerChatFileNode[],
  folderId: string,
  nextItems: RunnerChatFileNode[],
): RunnerChatFileNode[] {
  const normalizedParentId = folderId === "root" ? null : folderId;
  const remaining = current.filter((item) => (item.parentId ?? null) !== normalizedParentId);
  const normalizedNext = nextItems.map((item) => ({
    ...item,
    parentId: item.parentId ?? normalizedParentId,
  }));

  return [...remaining, ...normalizedNext];
}

export function notionDatabasesToFileItems(
  databases: RunnerChatNotionDatabase[],
): RunnerChatFileNode[] {
  return [
    {
      id: "__entire_workspace__",
      name: "Entire workspace",
      mimeType: "application/x-notion-workspace",
      isFolder: false,
    },
    ...databases.map((database) => ({
      id: database.id,
      name: database.name,
      mimeType: "application/x-notion-database",
      isFolder: false,
    })),
  ];
}

export function fileItemsForParent(
  items: RunnerChatFileNode[],
  parentId: string | null,
): RunnerChatFileNode[] {
  return items.filter((item) => (item.parentId ?? null) === parentId);
}

export function childFolderPath(
  items: RunnerChatFileNode[],
  rootLabel: string,
  folderId: string | null,
): Array<{ id: string | null; name: string }> {
  const path: Array<{ id: string | null; name: string }> = [
    { id: null, name: rootLabel },
  ];
  if (!folderId) return path;

  const byId = new Map(items.map((item) => [item.id, item] as const));
  const stack: RunnerChatFileNode[] = [];
  let current = byId.get(folderId);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    stack.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  for (const folder of stack) {
    path.push({ id: folder.id, name: folder.name });
  }
  return path;
}

export function formatBrowserFileSize(bytes?: number): string {
  if (!bytes || bytes < 1) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatBrowserFileDate(
  isoString?: string,
  nowMs = Date.now(),
): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = nowMs - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
