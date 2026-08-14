import {
  buildRunnerPreviewAttachmentFromPath,
  normalizeRunnerPreviewWorkspacePath,
} from "../runner-document-preview.js";
import {
  blobToBase64,
  normalizeBase64Content,
  uploadAttachmentContent,
  type RunnerChatFetchedFileContent,
} from "./attachment-api.js";
import type {
  LocalAttachment,
  RunnerAttachment,
  RunnerChatImplicitAttachment,
} from "./attachment-types.js";
import { attachmentTypeForFile, getGithubRepoName } from "./attachment-utils.js";
import { generateRunnerClientId } from "./id-utils.js";
import type { RunnerChatFileNode } from "./workspace-files.js";
import type { RunnerChatConnectorFetchOptions } from "./public-types.js";

export interface CreateRunnerWorkspaceAttachmentOptions {
  backendUrl: string;
  item: RunnerChatFileNode;
  now?: () => Date;
  sourceEnvironmentId: string;
}

export function createRunnerWorkspaceAttachment({
  backendUrl,
  item,
  now = () => new Date(),
  sourceEnvironmentId,
}: CreateRunnerWorkspaceAttachmentOptions): LocalAttachment {
  const workspacePath = normalizeRunnerPreviewWorkspacePath(item.path || item.id);
  if (!workspacePath) {
    throw new Error(`Failed to prepare ${item.name} for attachment.`);
  }

  const filename =
    String(item.name || workspacePath.split("/").filter(Boolean).pop() || "file").trim() || "file";
  const previewAttachment = buildRunnerPreviewAttachmentFromPath(workspacePath, {
    backendUrl,
    environmentId: sourceEnvironmentId,
    idPrefix: "workspace",
  });
  const mimeType =
    String(item.mimeType || previewAttachment.mimeType || "application/octet-stream").trim() ||
    "application/octet-stream";
  const type = attachmentTypeForFile(mimeType, filename);
  const resolvedAttachment: RunnerAttachment = {
    ...previewAttachment,
    id: previewAttachment.id,
    filename,
    mimeType,
    size: typeof item.size === "number" && Number.isFinite(item.size) ? item.size : 0,
    type,
    uploadedAt: String(item.modifiedTime || item.createdTime || now().toISOString()),
    workspacePath,
    sourcePath: workspacePath,
    sourceEnvironmentId,
  };
  const file = new File([""], filename, { type: mimeType });

  return {
    id: generateRunnerClientId("workspace"),
    file,
    type,
    previewUrl:
      type === "image" ? previewAttachment.previewUrl || previewAttachment.url : undefined,
    source: "workspace",
    sourceEnvironmentId,
    resolvedAttachment,
    uploadStatus: "uploaded",
    uploadError: null,
  };
}

export interface CreateRunnerImplicitAttachmentOptions {
  fetchImpl?: typeof fetch;
  item: RunnerChatImplicitAttachment;
}

export async function createRunnerImplicitAttachment({
  fetchImpl = globalThis.fetch,
  item,
}: CreateRunnerImplicitAttachmentOptions): Promise<LocalAttachment> {
  const sourceUrl = String(item.url || "").trim();
  const filename = String(item.filename || "").trim() || "attachment";
  if (!sourceUrl) {
    throw new Error(`Failed to prepare ${filename}: missing attachment URL.`);
  }

  const response = await fetchImpl(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename} (${response.status}).`);
  }

  const blob = await response.blob();
  const mimeType =
    String(item.mimeType || blob.type || "application/octet-stream").trim() ||
    "application/octet-stream";
  const file = new File([blob], filename, { type: mimeType });
  const type =
    item.type === "image" || item.type === "document"
      ? item.type
      : attachmentTypeForFile(mimeType, filename);

  return {
    id: generateRunnerClientId("implicit"),
    file,
    type,
    previewUrl: type === "image" ? sourceUrl : undefined,
    source: "local",
    hiddenFromTurnDisplay: Boolean(item.hiddenFromTurnDisplay),
    runnerAttachmentRole: item.runnerAttachmentRole,
    uploadStatus: "idle",
    uploadError: null,
  };
}

export async function createRunnerImplicitAttachments(
  items: readonly RunnerChatImplicitAttachment[],
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<LocalAttachment[]> {
  const normalizedItems = items
    .filter((item) => item && String(item.url || "").trim())
    .map((item) => ({
      ...item,
      filename: String(item.filename || "").trim() || "attachment",
    }));
  return Promise.all(
    normalizedItems.map((item) => createRunnerImplicitAttachment({ fetchImpl, item })),
  );
}

export interface CreateRunnerIntegrationAttachmentOptions {
  apiKey: string;
  backendUrl: string;
  fetchFileContent: (
    file: RunnerChatFileNode,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatFetchedFileContent>;
  accountId?: string;
  item: RunnerChatFileNode;
  requestHeaders?: HeadersInit;
  source: "google-drive" | "one-drive" | "github";
  targetEnvironmentId: string;
  uploadContent?: typeof uploadAttachmentContent;
}

export async function createRunnerIntegrationAttachment({
  apiKey,
  backendUrl,
  fetchFileContent,
  accountId,
  item,
  requestHeaders,
  source,
  targetEnvironmentId,
  uploadContent = uploadAttachmentContent,
}: CreateRunnerIntegrationAttachmentOptions): Promise<LocalAttachment> {
  const payload = await fetchFileContent(item, accountId ? { accountId } : undefined);
  const filename = String(payload?.name || item.name || "file").trim() || "file";
  const mimeType =
    String(payload?.mimeType || item.mimeType || "application/octet-stream").trim() ||
    "application/octet-stream";
  const type = attachmentTypeForFile(mimeType, filename);
  const encodedData =
    payload?.encoding === "text"
      ? await blobToBase64(
          new Blob([typeof payload?.content === "string" ? payload.content : ""], {
            type: mimeType,
          }),
        )
      : normalizeBase64Content(typeof payload?.content === "string" ? payload.content : "");
  const resolvedAttachment = await uploadContent({
    backendUrl,
    apiKey: apiKey.trim(),
    requestHeaders,
    filename,
    mimeType,
    data: encodedData,
    environmentId: targetEnvironmentId,
  });
  const file = new File([""], filename, { type: mimeType });
  const resolvedImagePreviewUrl =
    payload?.encoding === "text"
      ? undefined
      : encodedData
        ? `data:${mimeType};base64,${encodedData}`
        : item.previewUrl;

  return {
    id: generateRunnerClientId("integration"),
    file,
    type,
    previewUrl: type === "image" ? resolvedImagePreviewUrl : undefined,
    source: "integration",
    sourceEnvironmentId: targetEnvironmentId,
    integrationSource: source,
    githubRepoFullName: source === "github" ? item.repoFullName : undefined,
    githubRef: source === "github" ? item.ref || null : undefined,
    resolvedAttachment,
    uploadStatus: "uploaded",
    uploadError: null,
  };
}

export interface CreateRunnerGithubSelectionAttachmentOptions {
  getSelectedBranch: (repoFullName: string, fallbackRef?: string | null) => string;
  item: RunnerChatFileNode;
  now?: () => Date;
  pendingPreparation?: boolean;
  targetEnvironmentId: string;
}

export function createRunnerGithubSelectionAttachment({
  getSelectedBranch,
  item,
  now = () => new Date(),
  pendingPreparation,
  targetEnvironmentId,
}: CreateRunnerGithubSelectionAttachmentOptions): LocalAttachment {
  const repoFullName = String(item.repoFullName || "").trim();
  if (!repoFullName) {
    throw new Error("Missing GitHub repository metadata.");
  }

  const repoName = getGithubRepoName(repoFullName);
  const selectedBranch = getSelectedBranch(repoFullName, item.ref);
  const normalizedItemPath = String(item.path || "")
    .trim()
    .replace(/^\/+/, "");
  const selectionType: "repo" | "file" = item.isFolder && !normalizedItemPath ? "repo" : "file";
  const displayName =
    selectionType === "repo"
      ? repoName
      : `${repoName}/${(
          normalizedItemPath.split("/").filter(Boolean).pop() || item.name || "file"
        ).trim()}`;
  const workspacePath = `/workspace/GitHub/${repoName}${
    normalizedItemPath ? `/${normalizedItemPath}` : ""
  }`;
  const selectionMimeType = "application/x-github-selection";
  const file = new File([""], displayName, { type: selectionMimeType });
  const resolvedAttachment: RunnerAttachment = {
    id: generateRunnerClientId("integration"),
    filename: displayName,
    mimeType: selectionMimeType,
    size: 0,
    type: "document",
    uploadedAt: now().toISOString(),
    url: "",
    gcsPath: "",
    workspacePath,
    integrationSource: "github",
    githubRepoFullName: repoFullName,
    githubRef: selectedBranch,
    githubItemPath: normalizedItemPath || undefined,
    githubSelectionType: selectionType,
  };

  return {
    id: generateRunnerClientId("integration"),
    file,
    type: "document",
    source: "integration",
    sourceEnvironmentId: targetEnvironmentId,
    integrationSource: "github",
    githubRepoFullName: repoFullName,
    githubRef: selectedBranch,
    githubItemPath: normalizedItemPath || undefined,
    githubSelectionType: selectionType,
    resolvedAttachment,
    uploadStatus: pendingPreparation ? "uploading" : "uploaded",
    uploadError: null,
  };
}
