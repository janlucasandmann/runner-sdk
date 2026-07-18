import {
  normalizeRunnerPreviewWorkspacePath,
  type RunnerDocumentPreviewKind,
  type RunnerPreviewAttachment,
  type RunnerPreviewDirectoryEntry,
} from "./preview-contracts.js";
import { getRunnerSpreadsheetFormat } from "./spreadsheet-utils.js";

export interface AttachmentDocumentPreviewState {
  status: "idle" | "loading" | "ready" | "error";
  kind: RunnerDocumentPreviewKind | null;
  blob?: Blob | null;
  text?: string | null;
  error?: string | null;
}

export interface AttachmentDirectoryPreviewState {
  status: "idle" | "loading" | "ready" | "error" | "not-directory";
  folderPath: string;
  entries: RunnerPreviewDirectoryEntry[];
  error?: string | null;
}

export interface RunnerPreviewEditableCodeSource {
  key: string;
  text: string;
  language?: string;
  filename: string;
  mimeType: string;
  canSave: boolean;
}

export function getRunnerPreviewTextMimeType(
  filename?: string | null,
  mimeType?: string | null,
  language?: string | null,
): string {
  const normalizedMimeType = String(mimeType || "").trim();
  if (normalizedMimeType) return normalizedMimeType;
  const extension =
    String(filename || "")
      .trim()
      .toLowerCase()
      .split(".")
      .pop() || "";
  if (extension === "csv") return "text/csv;charset=utf-8";
  if (extension === "tsv") {
    return "text/tab-separated-values;charset=utf-8";
  }
  if (extension === "md" || extension === "markdown" || language === "markdown") {
    return "text/markdown;charset=utf-8";
  }
  if (extension === "html" || extension === "htm" || language === "html") {
    return "text/html;charset=utf-8";
  }
  if (extension === "json" || language === "json") {
    return "application/json;charset=utf-8";
  }
  return "text/plain;charset=utf-8";
}

export function isRunnerPreviewEditableTextDocumentKind(
  kind: RunnerDocumentPreviewKind | null,
): boolean {
  return kind === "text" || kind === "markdown" || kind === "html";
}

export function isRunnerPreviewEditableSpreadsheetCode(
  filename?: string | null,
  mimeType?: string | null,
): boolean {
  const format = getRunnerSpreadsheetFormat(filename, mimeType);
  return format === "csv" || format === "tsv";
}

export function isRunnerPreviewImageAttachment(attachment: RunnerPreviewAttachment): boolean {
  return (
    attachment.type === "image" ||
    String(attachment.mimeType || "")
      .toLowerCase()
      .startsWith("image/")
  );
}

export function getRunnerPreviewAttachmentEnvironmentId(
  attachment: RunnerPreviewAttachment,
  explicitEnvironmentId?: string | null,
): string {
  const directEnvironmentId = String(
    explicitEnvironmentId || attachment.environmentId || "",
  ).trim();
  if (directEnvironmentId) {
    return directEnvironmentId;
  }
  const idMatch = String(attachment.id || "").match(
    /^[^:]+:([^:]+):(?:\/workspace\/|workspace\/|.+)/,
  );
  return String(idMatch?.[1] || "").trim();
}

export function getRunnerPreviewAttachmentWorkspacePath(
  attachment: RunnerPreviewAttachment,
): string {
  const directWorkspacePath = normalizeRunnerPreviewWorkspacePath(attachment.workspacePath);
  if (directWorkspacePath) {
    return `/workspace/${directWorkspacePath}`;
  }
  const idMatch = String(attachment.id || "").match(/:(\/workspace\/.+)$/);
  return String(idMatch?.[1] || "").trim();
}

export function toAbsoluteRunnerWorkspacePath(path: string): string {
  const normalizedPath = normalizeRunnerPreviewWorkspacePath(path);
  return normalizedPath ? `/workspace/${normalizedPath}` : "/workspace";
}

export function formatRunnerPreviewFileSize(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "";
  }
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let nextValue = value / 1024;
  let unitIndex = 0;
  while (nextValue >= 1024 && unitIndex < units.length - 1) {
    nextValue /= 1024;
    unitIndex += 1;
  }
  return `${nextValue.toFixed(nextValue >= 10 ? 0 : 1).replace(/\.0$/, "")} ${units[unitIndex]}`;
}

export function formatRunnerPreviewFileDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function isRunnerPreviewImageEntry(entry: RunnerPreviewDirectoryEntry): boolean {
  const mimeType = String(entry.mimeType || "").toLowerCase();
  const name = String(entry.name || "").toLowerCase();
  return mimeType.startsWith("image/") || /\.(?:png|jpe?g|gif|webp|svg|avif|bmp)$/.test(name);
}
