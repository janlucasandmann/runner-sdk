import {
  buildRunnerHeaders,
  sanitizeBackendUrl,
} from "./api-utils.js";
import type { RunnerAttachment } from "./attachment-types.js";
import { attachmentTypeForFile } from "./attachment-utils.js";

export interface RunnerChatFetchedFileContent {
  content: string;
  mimeType?: string;
  encoding?: "base64" | "text";
  name?: string;
}

interface RunnerFetchedFileDescriptor {
  name: string;
  mimeType?: string;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to encode attachment"));
        return;
      }
      const commaIndex = reader.result.indexOf(",");
      resolve(
        commaIndex >= 0
          ? reader.result.slice(commaIndex + 1)
          : reader.result
      );
    };
    reader.onerror = () =>
      reject(reader.error || new Error("Failed to encode attachment"));
    reader.readAsDataURL(blob);
  });
}

export function normalizeBase64Content(value: string): string {
  const rawValue = String(value || "");
  const normalizedInput = rawValue.includes("base64,")
    ? rawValue.slice(rawValue.indexOf("base64,") + "base64,".length)
    : rawValue;
  const sanitizedValue = normalizedInput
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const paddingLength =
    sanitizedValue.length % 4 === 0
      ? 0
      : 4 - (sanitizedValue.length % 4);
  return sanitizedValue + "=".repeat(paddingLength);
}

function decodeBase64ToUint8Array(value: string): Uint8Array {
  const normalizedValue = normalizeBase64Content(value);
  const binaryString = atob(normalizedValue);
  const bytes = new Uint8Array(binaryString.length);
  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }
  return bytes;
}

export function decodeBase64TextContent(value: string): string {
  try {
    return new TextDecoder().decode(decodeBase64ToUint8Array(value));
  } catch {
    return String(value || "");
  }
}

export function buildFileFromFetchedContent(
  item: RunnerFetchedFileDescriptor,
  payload: RunnerChatFetchedFileContent
): {
  file: File;
  type: RunnerAttachment["type"];
  previewUrl?: string;
} {
  const filename =
    String(payload?.name || item.name || "file").trim() || "file";
  const mimeType =
    String(
      payload?.mimeType ||
        item.mimeType ||
        "application/octet-stream"
    ).trim() || "application/octet-stream";
  const blob =
    payload?.encoding === "text"
      ? new Blob(
          [
            typeof payload?.content === "string"
              ? payload.content
              : "",
          ],
          { type: mimeType }
        )
      : new Blob(
          [
            new Uint8Array(
              Array.from(
                decodeBase64ToUint8Array(
                  typeof payload?.content === "string"
                    ? payload.content
                    : ""
                )
              )
            ),
          ],
          { type: mimeType }
        );
  const file = new File([blob], filename, { type: mimeType });
  const type = attachmentTypeForFile(mimeType, filename);
  return {
    file,
    type,
    previewUrl:
      type === "image" ? URL.createObjectURL(blob) : undefined,
  };
}

export async function uploadAttachment(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  file: File;
  environmentId?: string;
}): Promise<RunnerAttachment> {
  return uploadAttachmentContent({
    backendUrl: params.backendUrl,
    apiKey: params.apiKey,
    requestHeaders: params.requestHeaders,
    filename: params.file.name,
    mimeType: params.file.type || "application/octet-stream",
    data: await blobToBase64(params.file),
    environmentId: params.environmentId,
  });
}

export async function uploadAttachmentContent(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  filename: string;
  mimeType: string;
  data: string;
  environmentId?: string;
}): Promise<RunnerAttachment> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(
    params.requestHeaders,
    params.apiKey
  );
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${backendUrl}/attachments/upload`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      filename: params.filename,
      mimeType: params.mimeType || "application/octet-stream",
      data: params.data,
      ...(params.environmentId
        ? { environmentId: params.environmentId }
        : {}),
    }),
  });

  const body = await response.text();
  let parsed: {
    attachment?: RunnerAttachment;
    message?: string;
    error?: string;
  } = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { message: body };
  }

  if (!response.ok) {
    throw new Error(
      parsed.message ||
        parsed.error ||
        `Failed to upload attachment (${response.status})`
    );
  }

  const attachment = parsed.attachment;
  if (
    !attachment ||
    typeof attachment !== "object" ||
    typeof attachment.id !== "string"
  ) {
    throw new Error(
      "Attachment upload succeeded but response.attachment is missing"
    );
  }

  return {
    ...attachment,
    url: `${backendUrl}/attachments/${encodeURIComponent(attachment.id)}`,
  };
}
