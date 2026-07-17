import { stripRunnerSystemTags as stripSystemTags } from "../runner-markdown.js";
import {
  getRecordArray,
  getRecordNumber,
  getRecordObject,
  getRecordString,
  normalizeRecordObject,
} from "./record-utils.js";

export interface RunnerEmailPromptDisplay {
  content: string;
  emailFrom: string;
  isEmailPrompt: boolean;
}

export interface RunnerEmailDeliveryAttachmentFile {
  filename: string;
  workspacePath?: string;
  mimeType?: string;
  sizeBytes?: number;
  url?: string;
  reason?: string;
  kind?: "attachment" | "download_link";
}

export interface RunnerEmailDeliveryDisplay {
  label: string;
  detail: string;
  className: string;
  attachmentCount: number;
  downloadLinkCount: number;
  attachmentFiles: RunnerEmailDeliveryAttachmentFile[];
}

function cleanRunnerEmailPromptContent(value: string): string {
  return value
    .replace(/\n*\[Email task from:\s*[^\]\r\n]+\]\s*$/i, "")
    .replace(/\n*\[Email task from:\s*[^\]\r\n]+\]\s*/gi, "\n")
    .replace(/\n{1,3}Attached files:\s*(?:\r?\n\s*(?:-\s*)?.+)+\s*$/i, "")
    .trim();
}

function getRunnerEmailMetadataDisplay(metadata?: Record<string, unknown> | null): {
  emailFrom: string;
  isEmailPrompt: boolean;
} {
  if (!metadata) {
    return { emailFrom: "", isEmailPrompt: false };
  }

  const emailRecord = getRecordObject(metadata, ["email", "emailMetadata", "email_metadata"]);
  const emailFrom =
    getRecordString(emailRecord, ["from", "fromEmail", "from_email", "sender", "senderEmail", "sender_email", "replyTo", "reply_to"]) ||
    getRecordString(metadata, ["emailFrom", "email_from", "fromEmail", "from_email", "replyToEmail", "reply_to_email", "senderEmail", "sender_email"]);
  const source = getRecordString(metadata, ["source", "channel", "appId", "app_id"]).trim().toLowerCase();
  const isEmailPrompt =
    Boolean(emailRecord) ||
    Boolean(emailFrom) ||
    source === "email" ||
    source === "mail" ||
    source === "incoming_email";

  return {
    emailFrom: emailFrom || (isEmailPrompt ? "email" : ""),
    isEmailPrompt,
  };
}

export function isRunnerEmailMetadata(metadata?: Record<string, unknown> | null): boolean {
  return getRunnerEmailMetadataDisplay(metadata).isEmailPrompt;
}

export function normalizeRunnerTurnMessageMetadata(
  messageMetadata?: Record<string, unknown> | null,
  threadMetadata?: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (isRunnerEmailMetadata(messageMetadata)) {
    if (isRunnerEmailMetadata(threadMetadata)) {
      const threadEmail = getRecordObject(threadMetadata, ["email", "emailMetadata", "email_metadata"]);
      const messageEmail = getRecordObject(messageMetadata, ["email", "emailMetadata", "email_metadata"]);
      return {
        ...(threadMetadata || {}),
        ...(messageMetadata || {}),
        email: {
          ...(threadEmail || {}),
          ...(messageEmail || {}),
        },
      };
    }
    return messageMetadata || null;
  }
  if (isRunnerEmailMetadata(threadMetadata)) {
    return {
      ...(threadMetadata || {}),
      ...(messageMetadata || {}),
    };
  }
  return messageMetadata || null;
}

export function getRunnerEmailAttachmentFilename(value: string): string {
  const normalized = String(value || "").trim().replace(/[?#].*$/, "");
  const segments = normalized.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] || normalized || "Attachment";
}

function normalizeRunnerEmailAttachmentIdentityPart(value: string): string {
  return String(value || "")
    .trim()
    .replace(/[?#].*$/, "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .toLowerCase();
}

function getRunnerEmailDeliveryAttachmentIdentityKeys(
  file: RunnerEmailDeliveryAttachmentFile
): string[] {
  const keys = new Set<string>();
  const workspacePath = normalizeRunnerEmailAttachmentIdentityPart(file.workspacePath || "");
  const url = normalizeRunnerEmailAttachmentIdentityPart(file.url || "");
  const filename = normalizeRunnerEmailAttachmentIdentityPart(file.filename || "");
  if (workspacePath) {
    keys.add(`path:${workspacePath}`);
  }
  if (url) {
    keys.add(`url:${url}`);
  }
  if (filename) {
    keys.add(`filename:${filename}`);
  }
  return Array.from(keys);
}

function mergeRunnerEmailDeliveryAttachmentFile(
  existing: RunnerEmailDeliveryAttachmentFile,
  incoming: RunnerEmailDeliveryAttachmentFile
): RunnerEmailDeliveryAttachmentFile {
  const kind = existing.kind === "attachment" || incoming.kind === "attachment"
    ? "attachment"
    : existing.kind || incoming.kind;
  return {
    filename: existing.filename || incoming.filename,
    ...(existing.workspacePath || incoming.workspacePath ? { workspacePath: existing.workspacePath || incoming.workspacePath } : {}),
    ...(existing.mimeType || incoming.mimeType ? { mimeType: existing.mimeType || incoming.mimeType } : {}),
    ...(typeof existing.sizeBytes === "number" || typeof incoming.sizeBytes === "number"
      ? { sizeBytes: typeof existing.sizeBytes === "number" ? existing.sizeBytes : incoming.sizeBytes }
      : {}),
    ...(existing.url || incoming.url ? { url: existing.url || incoming.url } : {}),
    ...(existing.reason || incoming.reason ? { reason: existing.reason || incoming.reason } : {}),
    ...(kind ? { kind } : {}),
  };
}

function normalizeRunnerEmailDeliveryAttachmentFile(
  value: unknown,
  kind: RunnerEmailDeliveryAttachmentFile["kind"] = "attachment"
): RunnerEmailDeliveryAttachmentFile | null {
  if (typeof value === "string" && value.trim()) {
    const workspacePath = value.trim();
    return {
      filename: getRunnerEmailAttachmentFilename(workspacePath),
      workspacePath,
      kind,
    };
  }
  const record = normalizeRecordObject(value);
  if (!record) {
    return null;
  }
  const workspacePath = getRecordString(record, ["workspacePath", "workspace_path", "path", "filePath", "file_path"]);
  const filename =
    getRecordString(record, ["filename", "fileName", "file_name", "name"]) ||
    getRunnerEmailAttachmentFilename(workspacePath || getRecordString(record, ["url", "href"]));
  if (!filename) {
    return null;
  }
  const sizeBytes = getRecordNumber(record, ["sizeBytes", "size_bytes", "bytes", "size"]);
  const mimeType = getRecordString(record, ["mimeType", "mime_type", "contentType", "content_type"]);
  const url = getRecordString(record, ["url", "href"]);
  const reason = getRecordString(record, ["reason"]);
  return {
    filename,
    ...(workspacePath ? { workspacePath } : {}),
    ...(mimeType ? { mimeType } : {}),
    ...(typeof sizeBytes === "number" ? { sizeBytes } : {}),
    ...(url ? { url } : {}),
    ...(reason ? { reason } : {}),
    kind,
  };
}

function extractRunnerEmailAttachmentFilesFromSummary(summaryText?: string | null): RunnerEmailDeliveryAttachmentFile[] {
  const content = String(summaryText || "");
  if (!content.includes("email-attachments")) {
    return [];
  }
  const files: RunnerEmailDeliveryAttachmentFile[] = [];
  const pattern = /<!--\s*email-attachments\s*:\s*([\s\S]*?)\s*-->/gi;
  for (const match of content.matchAll(pattern)) {
    const rawManifest = String(match[1] || "").trim();
    if (!rawManifest) {
      continue;
    }
    try {
      const parsed = JSON.parse(rawManifest);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      for (const entry of entries) {
        const file = normalizeRunnerEmailDeliveryAttachmentFile(entry, "attachment");
        if (file) {
          files.push(file);
        }
      }
    } catch {
      for (const path of rawManifest.match(/\/workspace\/[^"',\]\s]+/g) || []) {
        const file = normalizeRunnerEmailDeliveryAttachmentFile(path, "attachment");
        if (file) {
          files.push(file);
        }
      }
    }
  }
  return dedupeRunnerEmailDeliveryAttachmentFiles(files);
}

function dedupeRunnerEmailDeliveryAttachmentFiles(
  files: RunnerEmailDeliveryAttachmentFile[]
): RunnerEmailDeliveryAttachmentFile[] {
  const keyToIndex = new Map<string, number>();
  const deduped: RunnerEmailDeliveryAttachmentFile[] = [];
  for (const file of files) {
    const keys = getRunnerEmailDeliveryAttachmentIdentityKeys(file);
    let existingIndex: number | undefined;
    for (const key of keys) {
      const index = keyToIndex.get(key);
      if (typeof index === "number") {
        existingIndex = index;
        break;
      }
    }
    if (typeof existingIndex === "number") {
      deduped[existingIndex] = mergeRunnerEmailDeliveryAttachmentFile(deduped[existingIndex], file);
      for (const key of getRunnerEmailDeliveryAttachmentIdentityKeys(deduped[existingIndex])) {
        keyToIndex.set(key, existingIndex);
      }
      continue;
    }
    const nextIndex = deduped.length;
    deduped.push(file);
    for (const key of keys) {
      keyToIndex.set(key, nextIndex);
    }
  }
  return deduped;
}

export function getRunnerEmailDeliveryDisplay(
  metadata?: Record<string, unknown> | null,
  summaryText?: string | null
): RunnerEmailDeliveryDisplay | null {
  if (!metadata) {
    return null;
  }

  const emailRecord = getRecordObject(metadata, ["email", "emailMetadata", "email_metadata"]);
  const deliveryRecord =
    getRecordObject(metadata, ["emailDelivery", "email_delivery"]) ||
    getRecordObject(emailRecord, ["delivery", "emailDelivery", "email_delivery"]);
  if (!deliveryRecord) {
    return null;
  }

  const status = getRecordString(deliveryRecord, ["status", "deliveryStatus", "delivery_status"]).trim().toLowerCase();
  if (!status) {
    return null;
  }

  const attachmentCount = getRecordNumber(deliveryRecord, ["attachmentCount", "attachment_count"]);
  const downloadLinkCount = getRecordNumber(deliveryRecord, ["downloadLinkCount", "download_link_count"]);
  const issue = getRecordString(deliveryRecord, ["issue", "deliveryIssue", "delivery_issue", "error"]);
  const metadataAttachmentFiles = getRecordArray(deliveryRecord, ["attachmentFiles", "attachment_files", "attachments"])
    .map((entry) => normalizeRunnerEmailDeliveryAttachmentFile(entry, "attachment"))
    .filter((file): file is RunnerEmailDeliveryAttachmentFile => Boolean(file));
  const metadataDownloadLinks = getRecordArray(deliveryRecord, ["downloadLinks", "download_links"])
    .map((entry) => normalizeRunnerEmailDeliveryAttachmentFile(entry, "download_link"))
    .filter((file): file is RunnerEmailDeliveryAttachmentFile => Boolean(file));
  const manifestAttachmentFiles = extractRunnerEmailAttachmentFilesFromSummary(summaryText);
  const attachmentFiles = dedupeRunnerEmailDeliveryAttachmentFiles([
    ...metadataAttachmentFiles,
    ...metadataDownloadLinks,
    ...manifestAttachmentFiles,
  ]);
  const dedupedAttachmentCount = attachmentFiles.filter((file) => (file.kind || "attachment") === "attachment").length;
  const dedupedDownloadLinkCount = attachmentFiles.filter((file) => file.kind === "download_link").length;
  const effectiveAttachmentCount = Math.max(
    0,
    Math.round(dedupedAttachmentCount || attachmentCount || metadataAttachmentFiles.length || manifestAttachmentFiles.length || 0)
  );
  const effectiveDownloadLinkCount = Math.max(0, Math.round(dedupedDownloadLinkCount || downloadLinkCount || metadataDownloadLinks.length || 0));
  const detailParts: string[] = [];
  if (issue && ["deferred", "failed", "bounced", "dropped", "spam_report"].includes(status)) {
    detailParts.push(issue);
  }
  if (effectiveDownloadLinkCount > 0) {
    detailParts.push(`${effectiveDownloadLinkCount} download link${effectiveDownloadLinkCount === 1 ? "" : "s"}`);
  }

  switch (status) {
    case "delivered":
    case "opened":
    case "clicked":
      return {
        label: status === "delivered" ? "Email delivered" : "Email reply delivered",
        detail: detailParts.join(" | "),
        className: "is-delivered",
        attachmentCount: effectiveAttachmentCount,
        downloadLinkCount: effectiveDownloadLinkCount,
        attachmentFiles,
      };
    case "sending":
    case "accepted":
    case "processed":
      return {
        label: "Email reply sent",
        detail: detailParts.join(" | "),
        className: "is-pending",
        attachmentCount: effectiveAttachmentCount,
        downloadLinkCount: effectiveDownloadLinkCount,
        attachmentFiles,
      };
    case "deferred":
      return {
        label: "Email delivery delayed",
        detail: detailParts.join(" | "),
        className: "is-issue",
        attachmentCount: effectiveAttachmentCount,
        downloadLinkCount: effectiveDownloadLinkCount,
        attachmentFiles,
      };
    case "failed":
      return {
        label: "Email send failed",
        detail: detailParts.join(" | "),
        className: "is-issue",
        attachmentCount: effectiveAttachmentCount,
        downloadLinkCount: effectiveDownloadLinkCount,
        attachmentFiles,
      };
    case "bounced":
      return {
        label: "Email bounced",
        detail: detailParts.join(" | "),
        className: "is-issue",
        attachmentCount: effectiveAttachmentCount,
        downloadLinkCount: effectiveDownloadLinkCount,
        attachmentFiles,
      };
    case "dropped":
      return {
        label: "Email dropped",
        detail: detailParts.join(" | "),
        className: "is-issue",
        attachmentCount: effectiveAttachmentCount,
        downloadLinkCount: effectiveDownloadLinkCount,
        attachmentFiles,
      };
    case "spam_report":
      return {
        label: "Spam report received",
        detail: detailParts.join(" | "),
        className: "is-issue",
        attachmentCount: effectiveAttachmentCount,
        downloadLinkCount: effectiveDownloadLinkCount,
        attachmentFiles,
      };
    default:
      return null;
  }
}

export function getRunnerEmailPromptDisplay(prompt: string, metadata?: Record<string, unknown> | null): RunnerEmailPromptDisplay {
  const strippedPrompt = stripSystemTags(String(prompt || ""));
  const emailMatch = strippedPrompt.match(/\[Email task from:\s*([^\]\r\n]+)\]\s*$/i);
  const metadataDisplay = getRunnerEmailMetadataDisplay(metadata);
  const emailFrom = emailMatch ? emailMatch[1].trim() : metadataDisplay.emailFrom;
  if (!emailFrom) {
    return {
      content: strippedPrompt,
      emailFrom: "",
      isEmailPrompt: false,
    };
  }

  return {
    content: cleanRunnerEmailPromptContent(strippedPrompt),
    emailFrom,
    isEmailPrompt: true,
  };
}
