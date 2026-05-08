export type RunnerDocumentPreviewKind = "pdf" | "text" | "html" | "markdown" | "docx" | "directory" | "unsupported";

export interface RunnerPreviewAttachment {
  id: string;
  filename: string;
  mimeType: string;
  type: "image" | "document";
  previewKindOverride?: RunnerDocumentPreviewKind;
  environmentId?: string;
  isFolder?: boolean;
  uploadStatus?: "idle" | "uploading" | "uploaded" | "failed";
  url?: string;
  previewUrl?: string;
  workspacePath?: string;
  integrationSource?: "google-drive" | "one-drive" | "github";
  githubRepoFullName?: string;
  githubRef?: string | null;
  githubItemPath?: string;
  githubSelectionType?: "repo" | "file";
  htmlPreviewUrl?: string;
  htmlSandbox?: string | null;
}

export interface RunnerPreviewDirectoryEntry {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  size?: number;
  modifiedTime?: string;
  createdTime?: string;
  mimeType?: string;
  hasChildren?: boolean;
}

const RUNNER_PREVIEW_MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  css: "text/css",
  csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "text/javascript",
  json: "application/json",
  log: "text/plain",
  markdown: "text/markdown",
  md: "text/markdown",
  pdf: "application/pdf",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain",
  webp: "image/webp",
  xhtml: "application/xhtml+xml",
  xml: "application/xml",
  yaml: "text/yaml",
  yml: "text/yaml",
};

function getRunnerPreviewExtension(filename?: string | null): string {
  return String(filename || "").split(".").pop()?.toLowerCase() || "";
}

export function sanitizeRunnerPreviewBackendUrl(url?: string | null): string {
  return String(url || "").trim().replace(/\/+$/, "");
}

function escapeRunnerPreviewHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildRunnerPreviewHtmlDocument(source: string, baseUrl?: string | null): string {
  const normalizedSource = String(source || "");
  const baseTag = baseUrl ? `<base href="${escapeRunnerPreviewHtmlAttribute(baseUrl)}" />` : "";
  const shellStyles =
    '<style>html,body{margin:0;padding:0;background:#fff;color:#111;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}img,svg,video,canvas,iframe{max-width:100%;height:auto;}pre{white-space:pre-wrap;word-break:break-word;}table{max-width:100%;border-collapse:collapse;}*{box-sizing:border-box;}</style>';

  if (/<head[\s>]/i.test(normalizedSource)) {
    return normalizedSource.replace(/<head(\s[^>]*)?>/i, (match) => `${match}${baseTag}${shellStyles}`);
  }

  if (/<html[\s>]/i.test(normalizedSource)) {
    return normalizedSource.replace(/<html(\s[^>]*)?>/i, (match) => `${match}<head>${baseTag}${shellStyles}</head>`);
  }

  return `<!doctype html><html><head><meta charset="utf-8" />${baseTag}${shellStyles}</head><body>${normalizedSource}</body></html>`;
}

export function getRunnerPreviewHeaderValue(headers: HeadersInit | undefined, name: string): string {
  if (!headers) return "";

  if (headers instanceof Headers) {
    return headers.get(name)?.trim() || "";
  }

  if (Array.isArray(headers)) {
    const match = headers.find(([key]) => key.toLowerCase() === name.toLowerCase());
    return typeof match?.[1] === "string" ? match[1].trim() : "";
  }

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== name.toLowerCase()) continue;
    return Array.isArray(value) ? String(value[0] || "").trim() : String(value || "").trim();
  }

  return "";
}

export function buildRunnerPreviewHeaders(requestHeaders: HeadersInit | undefined, apiKey?: string | null): Headers {
  const headers = new Headers(requestHeaders || {});
  const normalizedApiKey = String(apiKey || "").trim();
  if (normalizedApiKey) {
    headers.set("X-API-Key", normalizedApiKey);
  }
  return headers;
}

function buildRunnerPreviewSyntheticDownloadUrl(
  backendUrl?: string | null,
  attachmentId?: string | null
): string | undefined {
  const normalizedAttachmentId = String(attachmentId || "").trim();
  if (!normalizedAttachmentId) {
    return undefined;
  }

  const syntheticMatch = normalizedAttachmentId.match(/^[^:]+:([^:]+):(\/workspace\/.+)$/);
  if (!syntheticMatch) {
    return undefined;
  }

  const environmentId = String(syntheticMatch[1] || "").trim();
  const workspacePath = String(syntheticMatch[2] || "").trim();
  return buildRunnerPreviewDownloadUrl(backendUrl, environmentId, workspacePath) || undefined;
}

export function resolveRunnerPreviewAssetUrl(
  url: string | undefined,
  backendUrl?: string | null,
  attachmentId?: string | null
): string | undefined {
  const normalizedUrl = typeof url === "string" ? url.trim() : "";
  if (normalizedUrl) {
    if (/^(?:blob:|data:|https?:\/\/)/i.test(normalizedUrl)) {
      return normalizedUrl;
    }
    if (normalizedUrl.startsWith("/api/real/attachments/") || normalizedUrl.startsWith("/api/task-backlog/")) {
      return normalizedUrl;
    }
    if (backendUrl) {
      const normalizedBackendUrl = sanitizeRunnerPreviewBackendUrl(backendUrl);
      if (normalizedUrl.startsWith("/api/attachments/")) {
        return `${normalizedBackendUrl}/attachments${normalizedUrl.slice("/api/attachments".length)}`;
      }
      if (normalizedUrl.startsWith("/attachments/")) {
        return `${normalizedBackendUrl}${normalizedUrl}`;
      }
      if (normalizedUrl.startsWith("/")) {
        return `${normalizedBackendUrl}${normalizedUrl}`;
      }
      return `${normalizedBackendUrl}/${normalizedUrl.replace(/^\.?\//, "")}`;
    }
    return normalizedUrl;
  }
  const syntheticDownloadUrl = buildRunnerPreviewSyntheticDownloadUrl(backendUrl, attachmentId);
  if (syntheticDownloadUrl) {
    return syntheticDownloadUrl;
  }
  if (backendUrl && attachmentId) {
    return `${sanitizeRunnerPreviewBackendUrl(backendUrl)}/attachments/${encodeURIComponent(String(attachmentId))}`;
  }
  return undefined;
}

export function normalizeRunnerPreviewPath(filePath?: string | null): string | null {
  if (!filePath) return null;
  const normalized = String(filePath).trim().replace(/^['"`]+|['"`]+$/g, "");
  if (!normalized) return null;
  return normalized.startsWith("/workspace/") ? normalized : `/workspace/${normalized.replace(/^\/+/, "")}`;
}

export function normalizeRunnerPreviewWorkspacePath(filePath?: string | null): string {
  const raw = String(filePath || "").trim().replace(/^['"`]+|['"`]+$/g, "");
  if (!raw) return "";
  let normalized = raw.split("\\").join("/");
  while (normalized.startsWith("/")) {
    normalized = normalized.slice(1);
  }
  if (normalized.startsWith("workspace/")) {
    normalized = normalized.slice("workspace/".length);
  }
  return normalized.replace(/\/+$/, "");
}

export function getRunnerPreviewFilename(filePath: string): string {
  const segments = filePath.split("/").filter(Boolean);
  return segments[segments.length - 1] || filePath;
}

export function inferRunnerPreviewMimeType(filePath: string): string {
  const extension = getRunnerPreviewExtension(getRunnerPreviewFilename(filePath));
  if (extension && RUNNER_PREVIEW_MIME_TYPES_BY_EXTENSION[extension]) {
    return RUNNER_PREVIEW_MIME_TYPES_BY_EXTENSION[extension];
  }
  if (/\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(filePath)) {
    return "image/*";
  }
  if (/\.pdf$/i.test(filePath)) {
    return "application/pdf";
  }
  if (
    [
      "ts",
      "tsx",
      "mts",
      "cts",
      "jsx",
      "mjs",
      "cjs",
      "py",
      "sh",
      "bash",
      "zsh",
      "go",
      "rs",
      "java",
      "c",
      "cpp",
      "h",
      "hpp",
      "scss",
      "sass",
      "less",
      "sql",
      "rb",
      "php",
    ].includes(extension)
  ) {
    return "text/plain";
  }
  return "application/octet-stream";
}

export function inferRunnerPreviewAttachmentType(filePath: string): RunnerPreviewAttachment["type"] {
  return inferRunnerPreviewMimeType(filePath).startsWith("image/") ? "image" : "document";
}

export function buildRunnerPreviewDownloadUrl(
  backendUrl?: string | null,
  environmentId?: string | null,
  filePath?: string | null
): string | null {
  const normalizedBackendUrl = sanitizeRunnerPreviewBackendUrl(backendUrl);
  let normalizedPath = String(filePath || "").trim().replace(/^\/+/, "");
  if (normalizedPath.startsWith("workspace/")) {
    normalizedPath = normalizedPath.slice("workspace/".length);
  }
  if (!normalizedBackendUrl || !environmentId || !normalizedPath) {
    return null;
  }
  const encodedPath = normalizedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${normalizedBackendUrl}/environments/${encodeURIComponent(environmentId)}/files/download/${encodedPath}`;
}

export function buildRunnerPreviewDirectoryListUrl(
  backendUrl?: string | null,
  environmentId?: string | null,
  folderPath?: string | null,
  depth = 1
): string | null {
  const normalizedBackendUrl = sanitizeRunnerPreviewBackendUrl(backendUrl);
  const normalizedEnvironmentId = String(environmentId || "").trim();
  if (!normalizedBackendUrl || !normalizedEnvironmentId) {
    return null;
  }
  const normalizedFolderPath = normalizeRunnerPreviewWorkspacePath(folderPath);
  const params = new URLSearchParams();
  params.set("depth", String(depth));
  if (normalizedFolderPath) {
    params.set("path", normalizedFolderPath);
  }
  return `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/files?${params.toString()}`;
}

function getRunnerPreviewDirectoryParentPath(filePath: string): string {
  const segments = normalizeRunnerPreviewWorkspacePath(filePath).split("/").filter(Boolean);
  segments.pop();
  return segments.join("/");
}

export function normalizeRunnerPreviewDirectoryEntries(
  input: unknown,
  currentFolderPath?: string | null
): RunnerPreviewDirectoryEntry[] {
  const rawItems = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as { data?: unknown[] }).data)
      ? (input as { data: unknown[] }).data
      : input && typeof input === "object" && Array.isArray((input as { files?: unknown[] }).files)
        ? (input as { files: unknown[] }).files
        : input && typeof input === "object" && Array.isArray((input as { items?: unknown[] }).items)
          ? (input as { items: unknown[] }).items
          : [];
  const normalizedFolderPath = normalizeRunnerPreviewWorkspacePath(currentFolderPath);

  return rawItems
    .map((entry): RunnerPreviewDirectoryEntry | null => {
      if (!entry || typeof entry !== "object") return null;
      const file = entry as Record<string, unknown>;
      const rawPath = typeof file.path === "string"
        ? file.path
        : typeof file.workspacePath === "string"
          ? file.workspacePath
          : "";
      let normalizedPath = normalizeRunnerPreviewWorkspacePath(rawPath);
      const explicitName = typeof file.name === "string" ? file.name.trim() : "";
      if (!normalizedPath && explicitName) {
        normalizedPath = normalizeRunnerPreviewWorkspacePath([normalizedFolderPath, explicitName].filter(Boolean).join("/"));
      } else if (
        normalizedFolderPath &&
        normalizedPath &&
        !normalizedPath.startsWith(`${normalizedFolderPath}/`) &&
        !normalizedPath.includes("/")
      ) {
        normalizedPath = `${normalizedFolderPath}/${normalizedPath}`;
      }
      if (!normalizedPath || normalizedPath === normalizedFolderPath) return null;
      if (normalizedFolderPath && getRunnerPreviewDirectoryParentPath(normalizedPath) !== normalizedFolderPath) return null;

      const name = explicitName || normalizedPath.split("/").filter(Boolean).pop() || normalizedPath;
      const type = typeof file.type === "string" ? file.type.trim().toLowerCase() : "";
      const mimeType = typeof file.mimeType === "string" ? file.mimeType : "";
      const isFolder =
        file.isDirectory === true ||
        file.isFolder === true ||
        type === "directory" ||
        type === "folder" ||
        mimeType === "inode/directory";
      const size = typeof file.size === "number" && Number.isFinite(file.size) ? file.size : undefined;
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
      const hasChildren =
        typeof file.hasChildren === "boolean"
          ? file.hasChildren
          : typeof file.childCount === "number"
            ? file.childCount > 0
            : undefined;
      return {
        id: normalizedPath,
        name,
        path: normalizedPath,
        isFolder,
        size,
        modifiedTime,
        createdTime,
        mimeType,
        hasChildren,
      };
    })
    .filter((entry): entry is RunnerPreviewDirectoryEntry => entry !== null)
    .sort((left, right) => {
      if (left.isFolder !== right.isFolder) return left.isFolder ? -1 : 1;
      return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
    });
}

export function buildRunnerPreviewAttachmentFromPath(
  filePath: string,
  options?: {
    backendUrl?: string | null;
    environmentId?: string | null;
    idPrefix?: string;
  }
): RunnerPreviewAttachment {
  const normalizedPath = normalizeRunnerPreviewPath(filePath) || filePath;
  const filename = getRunnerPreviewFilename(normalizedPath);
  const mimeType = inferRunnerPreviewMimeType(normalizedPath);
  const previewUrl = buildRunnerPreviewDownloadUrl(options?.backendUrl, options?.environmentId, normalizedPath) || undefined;
  return {
    id: `${options?.idPrefix || "preview"}:${options?.environmentId || "unknown"}:${normalizedPath}`,
    filename,
    mimeType,
    type: inferRunnerPreviewAttachmentType(normalizedPath),
    environmentId: options?.environmentId || undefined,
    url: previewUrl,
    previewUrl,
  };
}

export function getRunnerDocumentPreviewKind(input: {
  filename: string;
  mimeType?: string | null;
  isFolder?: boolean | null;
}): RunnerDocumentPreviewKind {
  const extension = getRunnerPreviewExtension(input.filename);
  const mimeType = String(input.mimeType || "").toLowerCase();

  if (input.isFolder || mimeType === "inode/directory") {
    return "directory";
  }
  if (mimeType === "application/pdf" || extension === "pdf") {
    return "pdf";
  }
  if (mimeType === "text/markdown" || ["md", "markdown", "mdx"].includes(extension)) {
    return "markdown";
  }
  if (mimeType === "text/html" || mimeType === "application/xhtml+xml" || ["html", "htm", "xhtml"].includes(extension)) {
    return "html";
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    extension === "docx"
  ) {
    return "docx";
  }
  if (
    mimeType.startsWith("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("javascript") ||
    mimeType.includes("ecmascript") ||
    [
      "txt",
      "csv",
      "log",
      "yaml",
      "yml",
      "ini",
      "toml",
      "json",
      "xml",
      "ts",
      "tsx",
      "mts",
      "cts",
      "js",
      "jsx",
      "mjs",
      "cjs",
      "py",
      "go",
      "rs",
      "java",
      "c",
      "cpp",
      "h",
      "hpp",
      "css",
      "scss",
      "sass",
      "less",
      "sql",
      "rb",
      "php",
      "sh",
      "bash",
      "zsh",
    ].includes(extension)
  ) {
    return "text";
  }
  return "unsupported";
}

export function isRunnerDocumentPreviewable(input: { filename: string; mimeType?: string | null }): boolean {
  return getRunnerDocumentPreviewKind(input) !== "unsupported";
}
