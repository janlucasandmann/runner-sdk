import { describe, expect, it } from "vitest";
import {
  buildRunnerImageSelectionInpaintPrompt,
  createRunnerImageSelectionMaskFile,
  requiresAuthenticatedAttachmentPreview,
} from "./image-selection.js";

const attachment = {
  id: "image",
  filename: "product hero.png",
  mimeType: "image/png",
  size: 100,
  type: "image" as const,
  uploadedAt: "2026-07-16T10:00:00.000Z",
  workspacePath: "/workspace/assets/product.png",
};

describe("image selection", () => {
  it("builds a grounded inpaint instruction", () => {
    const prompt = buildRunnerImageSelectionInpaintPrompt(
      attachment,
      "product_hero-selected-region-mask.png",
    );
    expect(prompt).toContain(
      "Source image workspace path: /workspace/assets/product.png",
    );
    expect(prompt).toContain(
      "Mask attachment filename: product_hero-selected-region-mask.png",
    );
    expect(prompt).toContain("Only change the masked region.");
  });

  it("recognizes previews that require API authentication", () => {
    expect(requiresAuthenticatedAttachmentPreview(
      "/api/attachments/attachment_1",
    )).toBe(true);
    expect(requiresAuthenticatedAttachmentPreview(
      "https://api.example.com/attachments/attachment_1",
      "https://api.example.com/",
    )).toBe(true);
    expect(requiresAuthenticatedAttachmentPreview(
      "https://cdn.example.com/public.png",
      "https://api.example.com",
    )).toBe(false);
  });

  it("does not create a mask without usable selection geometry", async () => {
    await expect(createRunnerImageSelectionMaskFile({
      attachmentId: "image",
      naturalSize: { width: 0, height: 0 },
      strokes: [],
    }, attachment)).resolves.toBeNull();
  });
});
