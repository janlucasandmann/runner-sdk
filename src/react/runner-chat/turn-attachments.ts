import {
  buildRunnerPreviewHtmlPreviewUrl,
  buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl,
  isRunnerPreviewHtmlFile,
  normalizeRunnerPreviewWorkspacePath,
  resolveRunnerPreviewAssetUrl,
  type RunnerImageUnderstandingPreviewData,
  type RunnerImageUnderstandingPreviewItem,
  type RunnerMediaGenerationPromptPreviewData,
  type RunnerPreviewAttachment,
  type RunnerWebSearchPreviewData,
  type RunnerWebSearchPreviewImage,
  type RunnerWebSearchPreviewSource,
} from "../runner-document-preview.js";
import type {
  LocalAttachment,
  RunnerAttachment,
  RunnerTurnAttachment,
} from "./attachment-types.js";
import { attachmentTypeForFile } from "./attachment-utils.js";

function generateAttachmentId(): string {
  return `att-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function resolveAttachmentAssetUrl(
  url: string | undefined,
  backendUrl?: string,
  attachmentId?: string
): string | undefined {
  return resolveRunnerPreviewAssetUrl(url, backendUrl, attachmentId);
}

function normalizeImageUnderstandingPreviewItem(
  value: unknown,
  backendUrl?: string,
  attachmentId?: string
): RunnerImageUnderstandingPreviewItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as {
    path?: unknown;
    name?: unknown;
    url?: unknown;
  };
  const path =
    typeof candidate.path === "string" ? candidate.path.trim() : "";
  const url =
    resolveAttachmentAssetUrl(
      typeof candidate.url === "string" ? candidate.url : undefined,
      backendUrl,
      attachmentId
    ) || undefined;
  const name =
    typeof candidate.name === "string" && candidate.name.trim()
      ? candidate.name.trim()
      : path
        ? path.split("/").pop() || "image"
        : "image";
  if (!path && !url) {
    return null;
  }
  return { path, name, url };
}

function normalizeImageUnderstandingPreviewData(
  value: unknown,
  backendUrl?: string,
  attachmentId?: string
): RunnerImageUnderstandingPreviewData | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const candidate = value as {
    imageName?: unknown;
    images?: unknown;
    resultText?: unknown;
    isError?: unknown;
  };
  const images = Array.isArray(candidate.images)
    ? candidate.images
        .map((entry) =>
          normalizeImageUnderstandingPreviewItem(
            entry,
            backendUrl,
            attachmentId
          )
        )
        .filter(
          (entry): entry is RunnerImageUnderstandingPreviewItem =>
            Boolean(entry)
        )
    : [];
  const resultText =
    typeof candidate.resultText === "string"
      ? candidate.resultText
      : "";
  if (images.length === 0 && !resultText.trim()) {
    return undefined;
  }
  return {
    imageName:
      typeof candidate.imageName === "string" &&
      candidate.imageName.trim()
        ? candidate.imageName.trim()
        : images.length === 1
          ? images[0]?.name || "image"
          : `${images.length || "No"} images`,
    images,
    resultText,
    isError: candidate.isError === true,
  };
}

function normalizeWebSearchPreviewSource(
  value: unknown
): RunnerWebSearchPreviewSource | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as {
    url?: unknown;
    title?: unknown;
    domain?: unknown;
    snippet?: unknown;
    thumbnail?: unknown;
  };
  const url =
    typeof candidate.url === "string" ? candidate.url.trim() : "";
  if (!url) {
    return null;
  }
  return {
    url,
    title:
      typeof candidate.title === "string"
        ? candidate.title.trim()
        : url,
    domain:
      typeof candidate.domain === "string" &&
      candidate.domain.trim()
        ? candidate.domain.trim()
        : undefined,
    snippet:
      typeof candidate.snippet === "string" &&
      candidate.snippet.trim()
        ? candidate.snippet.trim()
        : undefined,
    thumbnail:
      typeof candidate.thumbnail === "string" &&
      candidate.thumbnail.trim()
        ? candidate.thumbnail.trim()
        : undefined,
  };
}

function normalizeWebSearchPreviewImage(
  value: unknown
): RunnerWebSearchPreviewImage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as {
    url?: unknown;
    thumbnail?: unknown;
    title?: unknown;
    source?: unknown;
  };
  const url =
    typeof candidate.url === "string" && candidate.url.trim()
      ? candidate.url.trim()
      : typeof candidate.thumbnail === "string" &&
          candidate.thumbnail.trim()
        ? candidate.thumbnail.trim()
        : "";
  if (!url) {
    return null;
  }
  return {
    url,
    thumbnail:
      typeof candidate.thumbnail === "string" &&
      candidate.thumbnail.trim()
        ? candidate.thumbnail.trim()
        : undefined,
    title:
      typeof candidate.title === "string" &&
      candidate.title.trim()
        ? candidate.title.trim()
        : undefined,
    source:
      typeof candidate.source === "string" &&
      candidate.source.trim()
        ? candidate.source.trim()
        : undefined,
  };
}

function normalizeWebSearchPreviewData(
  value: unknown
): RunnerWebSearchPreviewData | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const candidate = value as {
    query?: unknown;
    summary?: unknown;
    sources?: unknown;
    images?: unknown;
    rawJsonText?: unknown;
    isError?: unknown;
    errorMessage?: unknown;
  };
  const sources = Array.isArray(candidate.sources)
    ? candidate.sources
        .map(normalizeWebSearchPreviewSource)
        .filter(
          (source): source is RunnerWebSearchPreviewSource =>
            Boolean(source)
        )
    : [];
  const images = Array.isArray(candidate.images)
    ? candidate.images
        .map(normalizeWebSearchPreviewImage)
        .filter(
          (image): image is RunnerWebSearchPreviewImage =>
            Boolean(image)
        )
    : [];
  const summary =
    typeof candidate.summary === "string" && candidate.summary.trim()
      ? candidate.summary
      : null;
  const rawJsonText =
    typeof candidate.rawJsonText === "string"
      ? candidate.rawJsonText
      : "";
  const errorMessage =
    typeof candidate.errorMessage === "string"
      ? candidate.errorMessage
      : "";
  if (
    sources.length === 0 &&
    images.length === 0 &&
    !summary &&
    !rawJsonText &&
    !errorMessage
  ) {
    return undefined;
  }
  return {
    query:
      typeof candidate.query === "string" && candidate.query.trim()
        ? candidate.query.trim()
        : null,
    summary,
    sources,
    images,
    rawJsonText,
    isError: candidate.isError === true,
    errorMessage,
  };
}

function normalizeMediaGenerationPromptPreviewData(
  value: unknown
): RunnerMediaGenerationPromptPreviewData | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const candidate = value as {
    title?: unknown;
    prompt?: unknown;
  };
  const prompt =
    typeof candidate.prompt === "string" && candidate.prompt.trim()
      ? candidate.prompt.trim()
      : "";
  if (!prompt) {
    return undefined;
  }
  return {
    title:
      typeof candidate.title === "string" && candidate.title.trim()
        ? candidate.title.trim()
        : "Generation Prompt",
    prompt,
  };
}

export function isRunnerTurnDisplayHiddenAttachment(
  value: unknown
): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as {
    file?: File;
    filename?: unknown;
    name?: unknown;
    mimeType?: unknown;
    hiddenFromTurnDisplay?: unknown;
    runnerAttachmentRole?: unknown;
    purpose?: unknown;
  };
  if (candidate.hiddenFromTurnDisplay === true) {
    return true;
  }
  const role = String(
    candidate.runnerAttachmentRole || candidate.purpose || ""
  )
    .trim()
    .toLowerCase();
  if (role === "image_edit_mask" || role === "image-edit-mask") {
    return true;
  }
  const filename = String(
    typeof candidate.filename === "string"
      ? candidate.filename
      : typeof candidate.name === "string"
        ? candidate.name
        : candidate.file?.name || ""
  )
    .trim()
    .toLowerCase();
  const mimeType = String(
    typeof candidate.mimeType === "string"
      ? candidate.mimeType
      : candidate.file?.type || ""
  )
    .trim()
    .toLowerCase();
  return (
    filename.endsWith("-selected-region-mask.png") &&
    (!mimeType || mimeType === "image/png")
  );
}

export function normalizeTurnAttachment(
  value: unknown,
  backendUrl?: string
): RunnerTurnAttachment | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as {
    id?: unknown;
    filename?: unknown;
    name?: unknown;
    mimeType?: unknown;
    type?: unknown;
    uploadStatus?: unknown;
    url?: unknown;
    previewUrl?: unknown;
    htmlPreviewUrl?: unknown;
    htmlSandbox?: unknown;
    environmentId?: unknown;
    workspacePath?: unknown;
    sourcePath?: unknown;
    gcsPath?: unknown;
    integrationSource?: unknown;
    githubRepoFullName?: unknown;
    githubRef?: unknown;
    githubItemPath?: unknown;
    githubSelectionType?: unknown;
    hiddenFromTurnDisplay?: unknown;
    runnerAttachmentRole?: unknown;
    purpose?: unknown;
    previewKindOverride?: unknown;
    imageGenerationPromptPreview?: unknown;
    imageUnderstandingPreview?: unknown;
    webSearchPreview?: unknown;
    videoGenerationPromptPreview?: unknown;
  };
  if (isRunnerTurnDisplayHiddenAttachment(candidate)) {
    return null;
  }
  const attachmentId =
    typeof candidate.id === "string" && candidate.id.trim()
      ? candidate.id.trim()
      : generateAttachmentId();
  const filename =
    typeof candidate.filename === "string" &&
    candidate.filename.trim()
      ? candidate.filename.trim()
      : typeof candidate.name === "string" && candidate.name.trim()
        ? candidate.name.trim()
        : "";
  if (!filename) {
    return null;
  }
  const mimeType =
    typeof candidate.mimeType === "string" &&
    candidate.mimeType.trim()
      ? candidate.mimeType.trim()
      : "application/octet-stream";
  const type: RunnerAttachment["type"] =
    candidate.type === "image" || candidate.type === "document"
      ? candidate.type
      : attachmentTypeForFile(mimeType, filename);
  const url = resolveAttachmentAssetUrl(
    typeof candidate.url === "string" ? candidate.url : undefined,
    backendUrl,
    attachmentId
  );
  const previewUrl =
    type === "image"
      ? resolveAttachmentAssetUrl(
          typeof candidate.previewUrl === "string"
            ? candidate.previewUrl
            : typeof candidate.url === "string"
              ? candidate.url
              : undefined,
          backendUrl,
          attachmentId
        )
      : undefined;
  const environmentId =
    typeof candidate.environmentId === "string" &&
    candidate.environmentId.trim()
      ? candidate.environmentId.trim()
      : undefined;
  const workspacePath =
    typeof candidate.workspacePath === "string" &&
    candidate.workspacePath.trim()
      ? normalizeRunnerPreviewWorkspacePath(candidate.workspacePath)
      : typeof candidate.sourcePath === "string" &&
          candidate.sourcePath.trim()
        ? normalizeRunnerPreviewWorkspacePath(candidate.sourcePath)
        : undefined;
  const explicitHtmlPreviewUrl =
    typeof candidate.htmlPreviewUrl === "string" &&
    candidate.htmlPreviewUrl.trim()
      ? resolveAttachmentAssetUrl(
          candidate.htmlPreviewUrl,
          backendUrl,
          attachmentId
        )
      : undefined;
  const threadHtmlPreviewUrl =
    buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl(
      typeof candidate.previewUrl === "string" &&
        candidate.previewUrl.trim()
        ? candidate.previewUrl
        : typeof candidate.url === "string"
          ? candidate.url
          : undefined,
      filename,
      mimeType
    );
  const environmentHtmlPreviewUrl =
    isRunnerPreviewHtmlFile(filename, mimeType) &&
    environmentId &&
    workspacePath
      ? buildRunnerPreviewHtmlPreviewUrl(
          backendUrl,
          environmentId,
          workspacePath
        ) || undefined
      : undefined;
  const htmlPreviewUrl =
    explicitHtmlPreviewUrl ||
    resolveAttachmentAssetUrl(
      threadHtmlPreviewUrl,
      backendUrl,
      attachmentId
    ) ||
    environmentHtmlPreviewUrl;
  const imageUnderstandingPreview =
    candidate.previewKindOverride === "image-understanding"
      ? normalizeImageUnderstandingPreviewData(
          candidate.imageUnderstandingPreview,
          backendUrl,
          attachmentId
        )
      : undefined;
  const webSearchPreview =
    candidate.previewKindOverride === "web-search"
      ? normalizeWebSearchPreviewData(candidate.webSearchPreview)
      : undefined;
  const imageGenerationPromptPreview =
    candidate.previewKindOverride === "image-generation-prompt"
      ? normalizeMediaGenerationPromptPreviewData(
          candidate.imageGenerationPromptPreview
        )
      : undefined;
  const videoGenerationPromptPreview =
    candidate.previewKindOverride === "video-generation-prompt"
      ? normalizeMediaGenerationPromptPreviewData(
          candidate.videoGenerationPromptPreview
        )
      : undefined;

  return {
    id: attachmentId,
    filename,
    mimeType,
    type,
    uploadStatus:
      candidate.uploadStatus === "idle" ||
      candidate.uploadStatus === "uploading" ||
      candidate.uploadStatus === "uploaded" ||
      candidate.uploadStatus === "failed"
        ? candidate.uploadStatus
        : undefined,
    runnerAttachmentRole:
      typeof candidate.runnerAttachmentRole === "string" &&
      candidate.runnerAttachmentRole.trim()
        ? candidate.runnerAttachmentRole.trim()
        : undefined,
    url,
    previewUrl,
    htmlPreviewUrl,
    htmlSandbox:
      typeof candidate.htmlSandbox === "string"
        ? candidate.htmlSandbox
        : candidate.htmlSandbox === null
          ? null
          : undefined,
    environmentId,
    workspacePath,
    gcsPath:
      typeof candidate.gcsPath === "string" &&
      candidate.gcsPath.trim()
        ? candidate.gcsPath.trim()
        : undefined,
    integrationSource:
      candidate.integrationSource === "google-drive" ||
      candidate.integrationSource === "one-drive" ||
      candidate.integrationSource === "github"
        ? candidate.integrationSource
        : undefined,
    githubRepoFullName:
      typeof candidate.githubRepoFullName === "string" &&
      candidate.githubRepoFullName.trim()
        ? candidate.githubRepoFullName.trim()
        : undefined,
    githubRef:
      typeof candidate.githubRef === "string" &&
      candidate.githubRef.trim()
        ? candidate.githubRef.trim()
        : candidate.githubRef === null
          ? null
          : undefined,
    githubItemPath:
      typeof candidate.githubItemPath === "string" &&
      candidate.githubItemPath.trim()
        ? candidate.githubItemPath.trim()
        : undefined,
    githubSelectionType:
      candidate.githubSelectionType === "repo" ||
      candidate.githubSelectionType === "file"
        ? candidate.githubSelectionType
        : undefined,
    previewKindOverride: imageUnderstandingPreview
      ? "image-understanding"
      : webSearchPreview
        ? "web-search"
        : imageGenerationPromptPreview
          ? "image-generation-prompt"
          : videoGenerationPromptPreview
            ? "video-generation-prompt"
            : undefined,
    imageGenerationPromptPreview,
    imageUnderstandingPreview,
    webSearchPreview,
    videoGenerationPromptPreview,
  };
}

export function normalizeTurnAttachments(
  value: unknown,
  backendUrl?: string
): RunnerTurnAttachment[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const normalized = value
    .map((entry) => normalizeTurnAttachment(entry, backendUrl))
    .filter(
      (attachment): attachment is RunnerTurnAttachment =>
        Boolean(attachment)
    );
  return normalized.length > 0 ? normalized : null;
}

export function buildTurnAttachmentsFromRunnerAttachments(
  attachments: RunnerAttachment[] | undefined,
  backendUrl?: string
): RunnerTurnAttachment[] | null {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  return normalizeTurnAttachments(attachments, backendUrl);
}

export function buildTurnAttachmentsFromLocalAttachments(
  attachments: LocalAttachment[]
): RunnerTurnAttachment[] | null {
  const visibleAttachments = attachments.filter(
    (attachment) =>
      !isRunnerTurnDisplayHiddenAttachment(attachment)
  );
  if (visibleAttachments.length === 0) {
    return null;
  }
  return visibleAttachments.map((attachment) => ({
    id: attachment.id,
    filename: attachment.file.name,
    mimeType:
      attachment.file.type || "application/octet-stream",
    type: attachment.type,
    previewUrl: attachment.previewUrl,
    integrationSource: attachment.integrationSource,
    githubRepoFullName: attachment.githubRepoFullName,
    githubRef: attachment.githubRef,
    githubItemPath: attachment.githubItemPath,
    githubSelectionType: attachment.githubSelectionType,
    uploadStatus: attachment.uploadStatus,
    runnerAttachmentRole: attachment.runnerAttachmentRole,
  }));
}

function turnAttachmentMatchKey(
  filename: string,
  mimeType: string,
  type: RunnerAttachment["type"]
): string {
  return `${filename}\u0000${mimeType}\u0000${type}`;
}

export function isRunnerEmailContextAttachment(
  value: unknown
): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const file =
    candidate.file &&
    typeof candidate.file === "object"
      ? (candidate.file as Record<string, unknown>)
      : null;
  const metadata =
    candidate.metadata &&
    typeof candidate.metadata === "object"
      ? (candidate.metadata as Record<string, unknown>)
      : null;
  const strings: string[] = [];
  const addString = (entry: unknown) => {
    if (typeof entry === "string" && entry.trim()) {
      strings.push(entry.trim().toLowerCase());
    }
  };
  [
    candidate.runnerAttachmentRole,
    candidate.purpose,
    candidate.attachmentRole,
    candidate.contextType,
    candidate.sourceType,
    candidate.workspacePath,
    candidate.sourcePath,
    candidate.gcsPath,
    candidate.filename,
    candidate.name,
    file?.name,
    file?.type,
    metadata?.runnerAttachmentRole,
    metadata?.purpose,
    metadata?.attachmentRole,
    metadata?.contextType,
    metadata?.sourceType,
    metadata?.workspacePath,
    metadata?.sourcePath,
    metadata?.gcsPath,
  ].forEach(addString);

  const roleMatch = strings.some(
    (entry) =>
      entry === "email_context" ||
      entry === "email-context" ||
      entry === "email history" ||
      entry === "email_history" ||
      entry === "forwarded_email" ||
      entry === "forwarded-email" ||
      entry === "forwarded_email_context" ||
      entry === "forwarded-email-context"
  );
  if (roleMatch) {
    return true;
  }
  const filename = String(
    typeof candidate.filename === "string"
      ? candidate.filename
      : typeof candidate.name === "string"
        ? candidate.name
        : file?.name || ""
  )
    .trim()
    .toLowerCase();
  const mimeType = String(
    typeof candidate.mimeType === "string"
      ? candidate.mimeType
      : file?.type || ""
  )
    .trim()
    .toLowerCase();
  const looksLikeGeneratedEmailContextHtml =
    /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-.+\.html$/.test(
      filename
    ) &&
    (!mimeType ||
      mimeType === "text/html" ||
      mimeType === "application/html");
  if (looksLikeGeneratedEmailContextHtml) {
    return true;
  }
  return strings.some(
    (entry) =>
      entry.includes("/workspace/email/") ||
      (entry.includes("/email/") && entry.endsWith(".html"))
  );
}

export function buildTurnAttachmentsForExecution(
  attachmentEntries: LocalAttachment[],
  resolvedAttachments: RunnerAttachment[] | undefined,
  backendUrl?: string
): RunnerTurnAttachment[] | null {
  const localTurnAttachments =
    buildTurnAttachmentsFromLocalAttachments(attachmentEntries);
  const hiddenDisplayKeys = new Set(
    attachmentEntries
      .filter((attachment) =>
        isRunnerTurnDisplayHiddenAttachment(attachment)
      )
      .map((attachment) =>
        turnAttachmentMatchKey(
          attachment.file.name,
          attachment.file.type || "application/octet-stream",
          attachment.type
        )
      )
  );
  const resolvedTurnAttachments = (
    buildTurnAttachmentsFromRunnerAttachments(
      resolvedAttachments,
      backendUrl
    ) || []
  ).filter(
    (attachment) =>
      !hiddenDisplayKeys.has(
        turnAttachmentMatchKey(
          attachment.filename,
          attachment.mimeType,
          attachment.type
        )
      )
  );
  const visibleResolvedTurnAttachments =
    resolvedTurnAttachments.length
      ? resolvedTurnAttachments
      : null;

  if (
    !visibleResolvedTurnAttachments ||
    visibleResolvedTurnAttachments.length === 0
  ) {
    return localTurnAttachments;
  }
  if (!localTurnAttachments || localTurnAttachments.length === 0) {
    return visibleResolvedTurnAttachments;
  }

  const resolvedBuckets = new Map<
    string,
    RunnerTurnAttachment[]
  >();
  for (const attachment of visibleResolvedTurnAttachments) {
    const key = turnAttachmentMatchKey(
      attachment.filename,
      attachment.mimeType,
      attachment.type
    );
    const bucket = resolvedBuckets.get(key);
    if (bucket) {
      bucket.push(attachment);
    } else {
      resolvedBuckets.set(key, [attachment]);
    }
  }

  const merged = localTurnAttachments.map((attachment) => {
    const key = turnAttachmentMatchKey(
      attachment.filename,
      attachment.mimeType,
      attachment.type
    );
    const bucket = resolvedBuckets.get(key);
    const resolvedAttachment = bucket?.shift();
    if (!resolvedAttachment) {
      return attachment;
    }
    if (attachment.type === "image" && attachment.previewUrl) {
      return {
        ...resolvedAttachment,
        previewUrl: attachment.previewUrl,
      };
    }
    return resolvedAttachment;
  });

  for (const bucket of resolvedBuckets.values()) {
    merged.push(...bucket);
  }
  return merged;
}

export function pickTurnAttachments(
  preferred?: RunnerTurnAttachment[] | null,
  fallback?: RunnerTurnAttachment[] | null
): RunnerTurnAttachment[] | null {
  if (preferred && preferred.length > 0) {
    return preferred;
  }
  if (fallback && fallback.length > 0) {
    return fallback;
  }
  return null;
}

export function mergeRunnerTurnAttachments(
  ...attachmentLists: Array<
    RunnerTurnAttachment[] | null | undefined
  >
): RunnerTurnAttachment[] | null {
  const merged: RunnerTurnAttachment[] = [];
  const seen = new Set<string>();
  for (const attachmentList of attachmentLists) {
    if (!attachmentList || attachmentList.length === 0) {
      continue;
    }
    for (const attachment of attachmentList) {
      const key = [
        attachment.id,
        attachment.workspacePath,
        attachment.url,
        attachment.previewUrl,
        attachment.filename,
        attachment.mimeType,
      ]
        .map((value) => String(value || ""))
        .join("\u0000");
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(attachment);
    }
  }
  return merged.length > 0 ? merged : null;
}

export function mergeRunnerAttachments(
  ...attachmentLists: Array<
    RunnerAttachment[] | null | undefined
  >
): RunnerAttachment[] | undefined {
  const merged: RunnerAttachment[] = [];
  const seen = new Set<string>();
  for (const attachmentList of attachmentLists) {
    if (!attachmentList || attachmentList.length === 0) {
      continue;
    }
    for (const attachment of attachmentList) {
      const key = [
        attachment.id,
        attachment.workspacePath,
        attachment.url,
        attachment.filename,
        attachment.mimeType,
      ]
        .map((value) => String(value || ""))
        .join("\u0000");
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push(attachment);
    }
  }
  return merged.length > 0 ? merged : undefined;
}

export function isRunnerImagePreviewAttachment(
  attachment?: RunnerPreviewAttachment | null
): attachment is RunnerPreviewAttachment {
  if (!attachment) {
    return false;
  }
  const mimeType = String(attachment.mimeType || "").toLowerCase();
  return (
    attachment.type === "image" || mimeType.startsWith("image/")
  );
}

export function buildRunnerAttachmentFromPreviewAttachment(
  attachment?: RunnerPreviewAttachment | null
): RunnerAttachment | null {
  if (!isRunnerImagePreviewAttachment(attachment)) {
    return null;
  }
  const filename =
    String(attachment.filename || "image").trim() || "image";
  const mimeType =
    String(attachment.mimeType || "image/png").trim() ||
    "image/png";
  const url = String(
    attachment.url || attachment.previewUrl || ""
  ).trim();
  return {
    id: String(
      attachment.id || attachment.workspacePath || filename
    ),
    filename,
    mimeType,
    size: Number((attachment as RunnerAttachment).size || 0),
    type: "image",
    uploadedAt: String(
      (attachment as RunnerAttachment).uploadedAt ||
        new Date().toISOString()
    ),
    ...(url ? { url } : {}),
    ...(attachment.previewUrl
      ? { previewUrl: attachment.previewUrl }
      : {}),
    ...(attachment.workspacePath
      ? { workspacePath: attachment.workspacePath }
      : {}),
    ...(attachment.environmentId
      ? { environmentId: attachment.environmentId }
      : {}),
    ...(attachment.integrationSource
      ? { integrationSource: attachment.integrationSource }
      : {}),
    ...(attachment.githubRepoFullName
      ? { githubRepoFullName: attachment.githubRepoFullName }
      : {}),
    ...(attachment.githubRef !== undefined
      ? { githubRef: attachment.githubRef }
      : {}),
    ...(attachment.githubItemPath
      ? { githubItemPath: attachment.githubItemPath }
      : {}),
    ...(attachment.githubSelectionType
      ? { githubSelectionType: attachment.githubSelectionType }
      : {}),
  };
}
