import {
  buildRunnerPreviewAttachmentFromPath,
  type RunnerPreviewAttachment,
} from "../document-preview/preview-contracts.js";
import type { RunnerLog } from "../../../../types.js";
import { extractReadFilePath, formatBytes, stripShellInlineComments } from "./command-parsing.js";
import { resolveCommandOutputText } from "./structured-command-output.js";

export interface ListFileItem {
  name: string;
  type: "file" | "folder";
  path?: string;
  size?: string;
  sizeBytes?: number | null;
  isHidden: boolean;
}

const DEFAULT_LIST_FILES_DIRECTORY = "/workspace";
// biome-ignore lint/complexity/useRegexLiterals: The constructor keeps the ESC control byte out of regex source syntax.
const ANSI_ESCAPE_PATTERN = new RegExp("\\u001b\\[[0-9;?]*[ -/]*[@-~]", "g");

function stripListFileAnsiSequences(value: string): string {
  return value.replace(ANSI_ESCAPE_PATTERN, "");
}

function isUsableListDirectoryCandidate(value?: string | null): value is string {
  const trimmed = String(value || "").trim();
  return Boolean(
    trimmed && !trimmed.startsWith("-") && !/^#+$/.test(trimmed) && !trimmed.includes("#"),
  );
}

function isFindingFilesCommand(command?: string): boolean {
  if (!command) return false;
  return /(?:^|\n)\s*\$?\s*Finding:\s*\S+/i.test(command);
}

function isListFilesCommand(command?: string): boolean {
  if (!command) return false;
  if (isFindingFilesCommand(command)) return true;
  return [
    /app-platform(?:\.py)?\s+files\s+list\b/i,
    /(?:^|[;&|]\s*)\$?\s*(?:ls|ll)\b(?:\s|$)/i,
    /\bfind\s+(?!.*\s-exec\s)/i,
    /\brg\s+--files\b/i,
    /\bgit\s+ls-files\b/i,
  ].some((pattern) => pattern.test(command));
}

function extractFindingFilesPattern(command?: string): string | null {
  if (!command) return null;
  const match = command.match(/(?:^|\n)\s*\$?\s*Finding:\s*(.+?)(?:\r?\n|$)/i);
  const candidate = match?.[1]?.trim();
  return candidate || null;
}

function extractShellCdPath(command?: string): string | null {
  if (!command) return null;
  const normalizedCommand = stripShellInlineComments(command);
  const patterns = [/(?:^|[;&|]\s*)cd\s+["']([^"']+)["']/, /(?:^|[;&|]\s*)cd\s+([^\s|&;>"']+)/];
  for (const pattern of patterns) {
    const match = normalizedCommand.match(pattern);
    const candidate = match?.[1]?.trim();
    if (isUsableListDirectoryCandidate(candidate)) {
      return candidate;
    }
  }
  return null;
}

function resolveListedDirectoryPath(command: string | undefined, listedPath: string): string {
  const normalizedListedPath = listedPath.trim();
  if (
    !normalizedListedPath ||
    normalizedListedPath.startsWith("/") ||
    normalizedListedPath.startsWith("~")
  ) {
    return normalizedListedPath;
  }

  const cdPath = extractShellCdPath(command);
  if (!cdPath?.startsWith("/")) {
    return normalizedListedPath;
  }

  if (normalizedListedPath === ".") {
    return cdPath;
  }

  return `${cdPath.replace(/\/+$/, "")}/${normalizedListedPath.replace(/^\.\//, "")}`;
}

export function extractListFilesDirectoryPath(command?: string): string | null {
  if (!command) return null;
  const normalizedCommand = stripShellInlineComments(command);
  const findingPattern = extractFindingFilesPattern(normalizedCommand);
  if (findingPattern) return findingPattern;
  const cdPath = extractShellCdPath(normalizedCommand);
  const defaultDirectory = cdPath?.startsWith("/") ? cdPath : DEFAULT_LIST_FILES_DIRECTORY;
  const patterns = [
    /\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?["']([^"']+)["']/,
    /\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /\bfind\s+["']([^"']+)["']/,
    /\bfind\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
    /\brg\s+--files\s+["']([^"']+)["']/,
    /\brg\s+--files\s+([^\s|&;>"']+)\s*(?:[|&;>]|$)/,
  ];
  for (const pattern of patterns) {
    const match = normalizedCommand.match(pattern);
    const candidate = match?.[1]?.trim();
    if (isUsableListDirectoryCandidate(candidate)) {
      return resolveListedDirectoryPath(normalizedCommand, candidate);
    }
  }
  const workspacePath = normalizedCommand.match(/(?:^|\s)(\/workspace(?:\/[^"'\s|&;>#]+)*)/);
  if (isUsableListDirectoryCandidate(workspacePath?.[1])) {
    return workspacePath[1];
  }
  return isListFilesCommand(normalizedCommand) ? defaultDirectory : null;
}

function isLikelyFileListLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("total ")) {
    return false;
  }
  if (/^[dl-][rwx-]{9}\s+/.test(trimmed)) {
    return true;
  }
  if (/^(?:\.{1,2}\/|\/workspace\/|~\/)[^\s]+$/.test(trimmed)) {
    return true;
  }
  if (/^[^\s]+\.[A-Za-z0-9]{1,12}$/.test(trimmed)) {
    return true;
  }
  return /^[A-Za-z0-9._@+-]+\/$/.test(trimmed);
}

function isLikelyFileListOutput(output: string): boolean {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("total "));
  if (lines.length < 2) {
    return false;
  }

  const fileLikeCount = lines.filter(isLikelyFileListLine).length;
  return fileLikeCount >= Math.min(3, lines.length) && fileLikeCount / lines.length >= 0.7;
}

export function isListFilesLog(log?: RunnerLog): boolean {
  if (!log || (log.eventType !== "command_execution" && log.eventType !== "mcp_tool_call")) {
    return false;
  }
  const command = [log.metadata?.command, log.message]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join("\n");
  if (isListFilesCommand(command)) {
    return true;
  }

  const output = resolveCommandOutputText(log.metadata?.output, "stdout");
  return !extractReadFilePath(command) && isLikelyFileListOutput(output);
}

export function normalizeListFileName(name: string): string {
  return stripListFileAnsiSequences(name).trim().replace(/^\.\//, "");
}

function parseListFileSizeBytes(value: string): number | null {
  const normalized = value.trim();
  if (!normalized || normalized === "-") return null;
  const numericBytes = Number(normalized);
  if (Number.isFinite(numericBytes)) return numericBytes;
  const match = normalized.match(/^(\d+(?:\.\d+)?)([KMGTPE])B?$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2]?.toUpperCase() || "";
  const multipliers: Record<string, number> = {
    K: 1024,
    M: 1024 ** 2,
    G: 1024 ** 3,
    T: 1024 ** 4,
    P: 1024 ** 5,
    E: 1024 ** 6,
  };
  const multiplier = multipliers[unit];
  return Number.isFinite(amount) && multiplier ? Math.round(amount * multiplier) : null;
}

function getListFileDisplayName(pathOrName: string): string {
  const normalized = normalizeListFileName(pathOrName).replace(/\/+$/, "");
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] || normalized;
}

function normalizeListFilesPreviewDirectoryPath(directoryPath?: string | null): string {
  const normalizedPath = String(directoryPath || "").trim();
  if (!normalizedPath || normalizedPath === "." || /[*?[\]{}]/.test(normalizedPath)) {
    return DEFAULT_LIST_FILES_DIRECTORY;
  }
  if (normalizedPath.startsWith("/workspace")) {
    return normalizedPath.replace(/\/+$/, "") || DEFAULT_LIST_FILES_DIRECTORY;
  }
  if (normalizedPath.startsWith("/") || normalizedPath.startsWith("~")) {
    return DEFAULT_LIST_FILES_DIRECTORY;
  }
  return `${DEFAULT_LIST_FILES_DIRECTORY}/${normalizedPath.replace(/^\/+|\/+$/g, "")}`;
}

export function buildListFilesPreviewAttachment(
  directoryPath: string | null,
  backendUrl?: string,
  environmentId?: string | null,
): RunnerPreviewAttachment {
  const workspacePath = normalizeListFilesPreviewDirectoryPath(directoryPath);
  const baseAttachment = buildRunnerPreviewAttachmentFromPath(workspacePath, {
    backendUrl,
    environmentId,
    idPrefix: "list-files",
  });
  return {
    ...baseAttachment,
    filename:
      workspacePath === DEFAULT_LIST_FILES_DIRECTORY
        ? "workspace"
        : getListFileDisplayName(workspacePath),
    mimeType: "inode/directory",
    type: "document",
    previewKindOverride: "directory",
    isFolder: true,
    workspacePath,
  };
}

function normalizeListFileWorkspaceRelativePath(pathOrName: string): string {
  let normalized = String(pathOrName || "")
    .trim()
    .replace(/\\/g, "/");
  if (!normalized) return "";
  normalized = normalized.replace(/^\/workspace\/?/, "");
  normalized = normalized.replace(/^workspace\/?/, "");
  normalized = normalized.replace(/^\.\//, "");
  return normalized.replace(/^\/+|\/+$/g, "");
}

function isHiddenListFileName(name: string): boolean {
  const normalized = normalizeListFileName(name);
  const firstSegment = normalized.split("/").find(Boolean) || normalized;
  return firstSegment.startsWith(".") && firstSegment !== "." && firstSegment !== "..";
}

function isListLongFormatPermissions(value?: string): boolean {
  return /^[bcdlps-][rwxstST-]{9}[+@.]?$/.test(String(value || ""));
}

function isLikelyLongListMetadataLine(line: string): boolean {
  return line.split(/\s+/).some(isListLongFormatPermissions);
}

function parseLongListOutputLine(line: string): ListFileItem | null {
  const tokens = line.split(/\s+/).filter(Boolean);
  const permissionsIndex = tokens.findIndex(isListLongFormatPermissions);
  if (permissionsIndex < 0) return null;

  const permissions = tokens[permissionsIndex] || "";
  const fields = tokens.slice(permissionsIndex + 1);
  if (fields.length < 7) return null;

  let sizeToken = fields[3] || "";
  let nameStartIndex = /^\d{4}-\d{2}-\d{2}$/.test(fields[4] || "") ? 6 : 7;
  if (/^[\d.]+,$/.test(sizeToken) && fields.length >= 8) {
    sizeToken = "";
    nameStartIndex += 1;
  }

  const rawName = fields
    .slice(nameStartIndex)
    .join(" ")
    .replace(/\s+->\s+.+$/, "");
  const normalizedPath = normalizeListFileName(rawName);
  const displayName = getListFileDisplayName(normalizedPath);
  if (!displayName || displayName === "." || displayName === "..") {
    return null;
  }

  const sizeBytes = sizeToken ? parseListFileSizeBytes(sizeToken) : null;
  return {
    name: displayName,
    path: normalizedPath,
    type: permissions.startsWith("d") ? "folder" : "file",
    size: sizeBytes == null ? "" : formatBytes(sizeBytes),
    sizeBytes,
    isHidden: isHiddenListFileName(normalizedPath),
  };
}

function dedupeListFileItems(items: ListFileItem[]): ListFileItem[] {
  const byPath = new Map<string, ListFileItem>();
  for (const item of items) {
    const normalizedPath = normalizeListFileWorkspaceRelativePath(item.path || item.name);
    const key = normalizedPath.toLowerCase() || item.name.toLowerCase();
    const existing = byPath.get(key);
    if (!existing) {
      byPath.set(key, item);
      continue;
    }
    const existingHasSize = existing.sizeBytes != null || Boolean(existing.size);
    const nextHasSize = item.sizeBytes != null || Boolean(item.size);
    if (!existingHasSize && nextHasSize) {
      byPath.set(key, item);
    }
  }
  return Array.from(byPath.values());
}

function buildStructuredListItem(
  pathOrName: string,
  metadata?: Record<string, unknown>,
): ListFileItem | null {
  const path = normalizeListFileName(pathOrName);
  const name = getListFileDisplayName(path);
  if (!name || name === "." || name === "..") return null;
  const typeValue = String(metadata?.type || metadata?.kind || "").toLowerCase();
  const sizeValue = metadata?.sizeBytes ?? metadata?.size ?? metadata?.bytes;
  const sizeBytes =
    typeof sizeValue === "number"
      ? sizeValue
      : typeof sizeValue === "string"
        ? parseListFileSizeBytes(sizeValue)
        : null;
  return {
    name,
    path,
    type: typeValue === "directory" || typeValue === "folder" ? "folder" : "file",
    size: sizeBytes == null ? "" : formatBytes(sizeBytes),
    sizeBytes,
    isHidden: isHiddenListFileName(path),
  };
}

function parseStructuredListEntry(entry: unknown): ListFileItem | null {
  if (typeof entry === "string") {
    return buildStructuredListItem(entry);
  }
  if (!entry || typeof entry !== "object") return null;
  const record = entry as Record<string, unknown>;
  const rawPath = String(record.path || record.name || record.filename || record.file || "").trim();
  return rawPath ? buildStructuredListItem(rawPath, record) : null;
}

function parseStructuredListOutput(output: string): ListFileItem[] | null {
  const visit = (value: unknown): ListFileItem[] | null => {
    if (value == null) return null;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
        return null;
      }
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (Array.isArray(value)) {
      const items = value
        .map(parseStructuredListEntry)
        .filter((item): item is ListFileItem => Boolean(item));
      return items.length > 0 ? dedupeListFileItems(items) : null;
    }
    if (typeof value !== "object") return null;

    const record = value as Record<string, unknown>;
    const listCandidate = record.filenames ?? record.files ?? record.paths ?? record.matches;
    if (Array.isArray(listCandidate)) {
      return dedupeListFileItems(
        listCandidate
          .map(parseStructuredListEntry)
          .filter((item): item is ListFileItem => Boolean(item)),
      );
    }

    if (
      Object.hasOwn(record, "numFiles") ||
      Object.hasOwn(record, "truncated") ||
      Object.hasOwn(record, "durationMs")
    ) {
      return [];
    }

    const nestedCandidates = [
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
    ];
    for (const candidate of nestedCandidates) {
      const nested = visit(candidate);
      if (nested) return nested;
    }
    return null;
  };

  return visit(output);
}

function isNoFilesFoundListOutput(output: string): boolean {
  const lines = stripListFileAnsiSequences(output)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return (
    lines.length > 0 && lines.every((line) => /^(?:No files found|Folder is empty)\.?$/i.test(line))
  );
}

export function parseListFilesOutput(output: string): ListFileItem[] {
  if (isNoFilesFoundListOutput(output)) {
    return [];
  }

  const structuredItems = parseStructuredListOutput(output);
  if (structuredItems) {
    return structuredItems.sort((left, right) => {
      if (left.type !== right.type) {
        return left.type === "folder" ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });
  }

  if (!output.trim()) return [];
  const lines = output.trim().split("\n");
  const items: ListFileItem[] = [];
  for (const line of lines) {
    const trimmed = stripListFileAnsiSequences(line).trim();
    if (!trimmed || trimmed.startsWith("total ")) continue;
    const detailed = parseLongListOutputLine(trimmed);
    if (detailed) {
      items.push(detailed);
      continue;
    }
    if (isLikelyLongListMetadataLine(trimmed)) {
      continue;
    }
    const names = trimmed.split(/\s+/);
    for (const rawName of names) {
      const path = normalizeListFileName(rawName);
      const name = getListFileDisplayName(path);
      if (!name || name === "." || name === "..") continue;
      const isLikelyFolder =
        !name.includes(".") ||
        [
          "node_modules",
          "src",
          "dist",
          "build",
          "public",
          "assets",
          "components",
          "lib",
          "utils",
        ].includes(name);
      items.push({
        name,
        path,
        type: isLikelyFolder ? "folder" : "file",
        isHidden: isHiddenListFileName(path),
      });
    }
  }
  return dedupeListFileItems(items).sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "folder" ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}

export function getListFileCountLabel(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? "Item" : "Items"}`;
}
