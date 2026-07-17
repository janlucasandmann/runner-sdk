import type {
  RunnerImageMaskStroke,
  RunnerImageNaturalSize,
} from "../runner-image-edit-overlays.js";
import {
  normalizeRunnerPreviewWorkspacePath,
} from "../runner-document-preview.js";
import type { RunnerAttachment } from "./attachment-types.js";
import { sanitizeBackendUrl } from "./api-utils.js";

export interface RunnerImagePreviewSelectionState {
  attachmentId: string;
  naturalSize: RunnerImageNaturalSize;
  strokes: RunnerImageMaskStroke[];
}

export function drawRunnerImageSelectionMaskStroke(
  ctx: CanvasRenderingContext2D,
  stroke: RunnerImageMaskStroke,
): void {
  const points = Array.isArray(stroke.points) ? stroke.points : [];
  if (!points.length) {
    return;
  }
  const lineWidth = Math.max(2, Number(stroke.brushSize || 1));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "rgba(0, 0, 0, 1)";
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  if (points.length === 1) {
    const point = points[0];
    ctx.beginPath();
    ctx.arc(
      Number(point?.x || 0),
      Number(point?.y || 0),
      lineWidth / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(Number(points[0]?.x || 0), Number(points[0]?.y || 0));
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(
      Number(points[index]?.x || 0),
      Number(points[index]?.y || 0),
    );
  }
  ctx.stroke();
}

export function createRunnerImageSelectionMaskFile(
  selection: RunnerImagePreviewSelectionState,
  sourceAttachment: RunnerAttachment,
): Promise<File | null> {
  return new Promise((resolve, reject) => {
    const width = Math.round(Number(selection.naturalSize?.width || 0));
    const height = Math.round(Number(selection.naturalSize?.height || 0));
    const strokes = Array.isArray(selection.strokes) ? selection.strokes : [];
    if (
      !width
      || !height
      || !strokes.length
      || typeof document === "undefined"
      || typeof globalThis.File !== "function"
    ) {
      resolve(null);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(null);
      return;
    }
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "destination-out";
    strokes.forEach((stroke) => {
      drawRunnerImageSelectionMaskStroke(ctx, stroke);
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to create image edit mask."));
        return;
      }
      const rawBaseName = String(sourceAttachment.filename || "image");
      const lastDotIndex = rawBaseName.lastIndexOf(".");
      const baseNameWithoutExtension =
        lastDotIndex > 0 ? rawBaseName.slice(0, lastDotIndex) : rawBaseName;
      const normalizedBaseName = baseNameWithoutExtension
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        || "image";
      resolve(new globalThis.File(
        [blob],
        `${normalizedBaseName}-selected-region-mask.png`,
        { type: "image/png" },
      ));
    }, "image/png");
  });
}

export function buildRunnerImageSelectionInpaintPrompt(
  sourceAttachment: RunnerAttachment,
  maskFilename: string,
): string {
  const sourceWorkspacePath = normalizeRunnerPreviewWorkspacePath(
    sourceAttachment.workspacePath,
  );
  return [
    "<system>",
    "The user painted a selected region on the source image before submitting this prompt.",
    "Treat the request as an image editing/inpainting task and use the Image Generation skill.",
    "Use the source image with --input and the selected-region mask with --mask.",
    `Source image filename: ${String(sourceAttachment.filename || "image").trim()}`,
    sourceWorkspacePath
      ? `Source image workspace path: /workspace/${sourceWorkspacePath}`
      : "",
    maskFilename ? `Mask attachment filename: ${maskFilename}` : "",
    maskFilename
      ? "The mask attachment is available in the thread attachments alongside the source image."
      : "",
    "The mask is an OpenAI edit mask: transparent pixels mark exactly the selected area to change, and opaque pixels must be preserved.",
    "Only change the masked region. Preserve everything outside the selected region unless the user explicitly asks otherwise.",
    "</system>",
  ].filter(Boolean).join("\n");
}

export function requiresAuthenticatedAttachmentPreview(
  url: string | undefined,
  backendUrl?: string,
): boolean {
  if (!url) {
    return false;
  }
  const normalizedUrl = url.trim();
  if (!normalizedUrl) {
    return false;
  }
  const normalizedBackendUrl = backendUrl ? sanitizeBackendUrl(backendUrl) : "";
  const normalizedPath = normalizedUrl.replace(/^https?:\/\/[^/]+/i, "");
  const isEnvironmentDownload =
    /(?:^|\/)(?:api\/)?environments\/[^/]+\/files\/download\//.test(
      normalizedPath,
    );
  return (
    normalizedUrl.startsWith("/attachments/")
    || normalizedUrl.startsWith("/api/attachments/")
    || normalizedUrl.startsWith("/api/real/attachments/")
    || isEnvironmentDownload
    || (
      normalizedBackendUrl
      ? normalizedUrl.startsWith(`${normalizedBackendUrl}/attachments/`)
      : false
    )
  );
}
