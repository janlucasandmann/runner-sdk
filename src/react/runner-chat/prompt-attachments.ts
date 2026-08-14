import {
  parsePlatformInstructionsEditorFileMarkdown,
  parsePlatformInstructionsEditorImageMarkdown,
} from "../../platform-ui/components/composite/instructions-editor/index.js";

export interface RunnerPromptEmbeddedAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
  type: "image" | "document";
  url: string;
}

export interface RunnerPromptAttachmentSourceOptions {
  applicationUrl?: string;
  backendUrl?: string;
}

function normalizeAttachmentSize(value: unknown) {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : 0;
}

function resolveUrl(value: string, baseUrl: string): URL | null {
  try {
    return new URL(value, baseUrl);
  } catch {
    return null;
  }
}

/**
 * Resolve a persisted prompt attachment URL without turning arbitrary Markdown
 * URLs into authenticated fetches. Saved prompt assets must point at an
 * attachment endpoint on either the application origin or the configured
 * Runner backend, and the final path segment must match the persisted ID.
 */
export function resolveRunnerPromptAttachmentSourceUrl(
  sourceUrl: unknown,
  attachmentId: unknown,
  options: RunnerPromptAttachmentSourceOptions = {},
): string | null {
  const normalizedSourceUrl = String(sourceUrl || "").trim();
  const normalizedAttachmentId = String(attachmentId || "").trim();
  if (!normalizedSourceUrl || !normalizedAttachmentId) {
    return null;
  }

  const applicationUrl = String(
    options.applicationUrl
      || globalThis.location?.href
      || "http://localhost/",
  ).trim();
  const application = resolveUrl(applicationUrl, "http://localhost/");
  if (!application) {
    return null;
  }
  const source = resolveUrl(normalizedSourceUrl, application.href);
  if (!source) {
    return null;
  }

  const allowedOrigins = new Set([application.origin]);
  const backendUrl = String(options.backendUrl || "").trim();
  if (backendUrl) {
    const backend = resolveUrl(backendUrl, application.href);
    if (backend) {
      allowedOrigins.add(backend.origin);
    }
  }
  if (!allowedOrigins.has(source.origin)) {
    return null;
  }

  const pathSegments = source.pathname.split("/").filter(Boolean);
  const encodedId = pathSegments.at(-1) || "";
  const resourceName = pathSegments.at(-2) || "";
  let decodedId = "";
  try {
    decodedId = decodeURIComponent(encodedId);
  } catch {
    return null;
  }
  if (resourceName !== "attachments" || decodedId !== normalizedAttachmentId) {
    return null;
  }

  return source.href;
}

export function parseRunnerPromptEmbeddedAttachments(
  markdown: unknown,
): RunnerPromptEmbeddedAttachment[] {
  const attachments: RunnerPromptEmbeddedAttachment[] = [];
  const seenAttachmentIds = new Set<string>();
  const appendAttachment = (
    attachment: RunnerPromptEmbeddedAttachment,
  ) => {
    if (
      !attachment.attachmentId
      || !attachment.url
      || seenAttachmentIds.has(attachment.attachmentId)
    ) {
      return;
    }
    seenAttachmentIds.add(attachment.attachmentId);
    attachments.push(attachment);
  };

  parsePlatformInstructionsEditorImageMarkdown(markdown).forEach((image) => {
    const attachmentId = String(image.attachmentId || "").trim();
    const url = String(image.src || "").trim();
    if (!attachmentId || !url) return;
    appendAttachment({
      attachmentId,
      filename: String(image.alt || "Image").trim() || "Image",
      mimeType: String(image.mimeType || "image/*").trim() || "image/*",
      size: normalizeAttachmentSize(image.fileSize),
      type: "image",
      url,
    });
  });

  parsePlatformInstructionsEditorFileMarkdown(markdown).forEach(({ file }) => {
    const attachmentId = String(file.attachmentId || "").trim();
    const url = String(file.src || "").trim();
    if (!attachmentId || !url) return;
    appendAttachment({
      attachmentId,
      filename: String(file.name || "Attachment").trim() || "Attachment",
      mimeType: String(file.mimeType || "application/octet-stream").trim()
        || "application/octet-stream",
      size: normalizeAttachmentSize(file.size),
      type: String(file.mimeType || "").toLowerCase().startsWith("image/")
        ? "image"
        : "document",
      url,
    });
  });

  return attachments;
}
