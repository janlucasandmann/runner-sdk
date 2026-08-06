import { isRunnerDocumentPreviewable } from "../runner-document-preview.js";
import type {
  LocalAttachment,
  RunnerAttachment,
  RunnerTurnAttachment,
} from "./attachment-types.js";

export type RunnerBrowserFileType =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "code"
  | "spreadsheet"
  | "document"
  | "file";

export interface RunnerGithubRepoReference {
  repoFullName: string;
  repoName: string;
  branch: string;
}

interface RunnerGithubSelectionOption {
  id: string;
  name?: string;
}

export function getBrowserFileType(
  mimeType?: string,
  name?: string
): RunnerBrowserFileType {
  if (!mimeType && !name) {
    return "file";
  }

  const ext = name?.split(".").pop()?.toLowerCase() || "";
  if (
    mimeType?.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(ext)
  ) {
    return "image";
  }
  if (
    mimeType?.startsWith("video/") ||
    ["mp4", "mov", "avi", "webm"].includes(ext)
  ) {
    return "video";
  }
  if (
    mimeType?.startsWith("audio/") ||
    ["mp3", "wav", "ogg", "m4a"].includes(ext)
  ) {
    return "audio";
  }
  if (ext === "pdf") {
    return "pdf";
  }
  if (
    [
      "ts",
      "tsx",
      "js",
      "jsx",
      "json",
      "css",
      "html",
      "py",
      "go",
      "rs",
      "java",
      "cpp",
      "c",
      "h",
    ].includes(ext)
  ) {
    return "code";
  }
  if (["xlsx", "xls", "csv"].includes(ext)) {
    return "spreadsheet";
  }
  if (["doc", "docx", "txt", "md"].includes(ext)) {
    return "document";
  }
  return "file";
}

export function attachmentTypeForFile(
  mimeType?: string,
  name?: string
): RunnerAttachment["type"] {
  return getBrowserFileType(mimeType, name) === "image"
    ? "image"
    : "document";
}

export function isLocalAttachmentRecord(
  attachment: LocalAttachment | RunnerTurnAttachment
): attachment is LocalAttachment {
  return "file" in attachment;
}

export function getGithubAttachmentRepoFullName(
  attachment: LocalAttachment | RunnerTurnAttachment
): string {
  return String(attachment.githubRepoFullName || "").trim();
}

export function getGithubAttachmentPath(
  attachment: LocalAttachment | RunnerTurnAttachment
): string {
  return String(attachment.githubItemPath || "").trim();
}

export function getGithubAttachmentRef(
  attachment: LocalAttachment | RunnerTurnAttachment
): string {
  return String(attachment.githubRef || "").trim();
}

export function isGithubAttachmentSelection(
  attachment: LocalAttachment | RunnerTurnAttachment
): boolean {
  if (
    attachment.integrationSource !== "github" ||
    !getGithubAttachmentRepoFullName(attachment)
  ) {
    return false;
  }
  const workspacePath = isLocalAttachmentRecord(attachment)
    ? attachment.resolvedAttachment?.workspacePath || ""
    : attachment.workspacePath || "";
  return (
    attachment.githubSelectionType === "repo" ||
    attachment.githubSelectionType === "file" ||
    String(workspacePath).startsWith("/workspace/GitHub/")
  );
}

export function getGithubRepoName(repoFullName: string): string {
  const normalized = String(repoFullName || "").trim();
  if (!normalized) {
    return "repository";
  }
  return normalized.split("/").pop() || normalized;
}

export function buildSelectedGithubRepoReference(
  attachments: LocalAttachment[],
  options: {
    repositories: RunnerGithubSelectionOption[];
    contexts: RunnerGithubSelectionOption[];
    selectedRepositoryId: string;
    selectedContextId: string;
  },
): RunnerGithubRepoReference | null {
  const githubAttachments = attachments.filter(
    (attachment) =>
      attachment.integrationSource === "github"
      && attachment.githubRepoFullName,
  );
  if (githubAttachments.length > 0) {
    const repoFullNames = Array.from(new Set(
      githubAttachments
        .map((attachment) =>
          String(attachment.githubRepoFullName || "").trim())
        .filter(Boolean),
    ));
    if (repoFullNames.length === 1) {
      const repoFullName = repoFullNames[0];
      const branch =
        githubAttachments
          .map((attachment) => String(attachment.githubRef || "").trim())
          .find(Boolean)
        || options.contexts.find(
          (context) => context.id === options.selectedContextId,
        )?.name
        || options.selectedContextId;
      if (branch) {
        return {
          repoFullName,
          repoName: getGithubRepoName(repoFullName),
          branch,
        };
      }
    }
  }

  const selectedRepository = options.repositories.find(
    (repository) => repository.id === options.selectedRepositoryId,
  );
  if (!selectedRepository) {
    return null;
  }
  const branch =
    options.contexts.find(
      (context) => context.id === options.selectedContextId,
    )?.name
    || options.selectedContextId;
  if (!branch) {
    return null;
  }
  return {
    repoFullName: selectedRepository.id,
    repoName: selectedRepository.name || selectedRepository.id,
    branch,
  };
}

export function getGithubAttachmentDisplayName(
  attachment: LocalAttachment | RunnerTurnAttachment
): string {
  const repoName = getGithubRepoName(
    getGithubAttachmentRepoFullName(attachment)
  );
  const selectionPath = getGithubAttachmentPath(attachment);
  if (!selectionPath) {
    return repoName;
  }
  const selectionName =
    selectionPath.split("/").filter(Boolean).pop() || selectionPath;
  return `${repoName}/${selectionName}`;
}

export function getAttachmentDisplayName(
  attachment: LocalAttachment | RunnerTurnAttachment
): string {
  if (isGithubAttachmentSelection(attachment)) {
    return getGithubAttachmentDisplayName(attachment);
  }
  return isLocalAttachmentRecord(attachment)
    ? attachment.file.name
    : attachment.filename;
}

export function getAttachmentPreviewUrl(
  attachment: LocalAttachment | RunnerTurnAttachment
): string | undefined {
  return isLocalAttachmentRecord(attachment)
    ? attachment.previewUrl
    : attachment.previewUrl || attachment.url;
}

function encodeGithubBrowserSegment(
  value: string | null | undefined
): string {
  return encodeURIComponent(String(value || "").trim());
}

function decodeGithubBrowserSegment(
  value: string | null | undefined
): string {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

export function createGithubBrowserRepoFolderId(
  repoFullName: string,
  ref?: string | null
): string {
  return `github-repo:${encodeGithubBrowserSegment(repoFullName)}:${encodeGithubBrowserSegment(ref || "")}`;
}

export function createGithubBrowserNodeId(
  repoFullName: string,
  path: string,
  ref?: string | null
): string {
  return `github-node:${encodeGithubBrowserSegment(repoFullName)}:${encodeGithubBrowserSegment(ref || "")}:${encodeGithubBrowserSegment(path || "")}`;
}

export function parseGithubBrowserFolderId(
  folderId: string | null | undefined
): {
  repoFullName: string;
  path: string;
  ref: string;
  isRoot: boolean;
} {
  if (!folderId || folderId === "root") {
    return { repoFullName: "", path: "", ref: "", isRoot: true };
  }

  if (folderId.startsWith("github-repo:")) {
    const value = folderId.slice("github-repo:".length);
    const separatorIndex = value.indexOf(":");
    if (separatorIndex === -1) {
      return {
        repoFullName: value,
        path: "",
        ref: "",
        isRoot: false,
      };
    }
    return {
      repoFullName: decodeGithubBrowserSegment(
        value.slice(0, separatorIndex)
      ),
      path: "",
      ref: decodeGithubBrowserSegment(value.slice(separatorIndex + 1)),
      isRoot: false,
    };
  }

  if (folderId.startsWith("github-node:")) {
    const value = folderId.slice("github-node:".length);
    const firstSeparatorIndex = value.indexOf(":");
    if (firstSeparatorIndex === -1) {
      return {
        repoFullName: value,
        path: "",
        ref: "",
        isRoot: false,
      };
    }
    const secondSeparatorIndex = value.indexOf(
      ":",
      firstSeparatorIndex + 1
    );
    if (secondSeparatorIndex === -1) {
      return {
        repoFullName: value.slice(0, firstSeparatorIndex),
        path: value.slice(firstSeparatorIndex + 1),
        ref: "",
        isRoot: false,
      };
    }
    return {
      repoFullName: decodeGithubBrowserSegment(
        value.slice(0, firstSeparatorIndex)
      ),
      ref: decodeGithubBrowserSegment(
        value.slice(firstSeparatorIndex + 1, secondSeparatorIndex)
      ),
      path: decodeGithubBrowserSegment(
        value.slice(secondSeparatorIndex + 1)
      ),
      isRoot: false,
    };
  }

  return { repoFullName: "", path: "", ref: "", isRoot: true };
}

export function isAttachmentDocumentPreviewable(
  attachment: RunnerTurnAttachment
): boolean {
  if (isGithubAttachmentSelection(attachment)) {
    return false;
  }
  if (
    attachment.previewKindOverride === "image-understanding" &&
    attachment.imageUnderstandingPreview
  ) {
    return true;
  }
  if (
    attachment.previewKindOverride === "web-search" &&
    attachment.webSearchPreview
  ) {
    return true;
  }
  if (
    attachment.previewKindOverride === "connector-action" &&
    attachment.connectorActionPreview
  ) {
    return true;
  }
  if (
    attachment.previewKindOverride === "image-generation-prompt" &&
    attachment.imageGenerationPromptPreview
  ) {
    return true;
  }
  if (
    attachment.previewKindOverride === "video-generation-prompt" &&
    attachment.videoGenerationPromptPreview
  ) {
    return true;
  }
  if (
    attachment.type === "image" ||
    String(attachment.mimeType || "").toLowerCase().startsWith("image/")
  ) {
    return true;
  }
  return isRunnerDocumentPreviewable(attachment);
}
