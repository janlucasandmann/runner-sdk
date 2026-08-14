import { describe, expect, it } from "vitest";

import {
  serializePlatformInstructionsEditorFileMarkdown,
  serializePlatformInstructionsEditorImageMarkdown,
} from "../../platform-ui/components/composite/instructions-editor/index.js";
import {
  parseRunnerPromptEmbeddedAttachments,
  resolveRunnerPromptAttachmentSourceUrl,
} from "./prompt-attachments.js";

describe("parseRunnerPromptEmbeddedAttachments", () => {
  it("collects durable prompt files and images for a worker run", () => {
    const markdown = [
      "Use the attached reference files.",
      serializePlatformInstructionsEditorFileMarkdown({
        src: "/api/real/attachments/report-1",
        name: "report.pdf",
        size: 42,
        mimeType: "application/pdf",
        attachmentId: "report-1",
      }),
      serializePlatformInstructionsEditorImageMarkdown({
        src: "/api/real/attachments/diagram-1",
        name: "diagram.png",
        alt: "diagram.png",
        size: 84,
        mimeType: "image/png",
        attachmentId: "diagram-1",
      }),
    ].join("\n\n");

    expect(parseRunnerPromptEmbeddedAttachments(markdown)).toEqual([
      {
        attachmentId: "diagram-1",
        filename: "diagram.png",
        mimeType: "image/png",
        size: 84,
        type: "image",
        url: "/api/real/attachments/diagram-1",
      },
      {
        attachmentId: "report-1",
        filename: "report.pdf",
        mimeType: "application/pdf",
        size: 42,
        type: "document",
        url: "/api/real/attachments/report-1",
      },
    ]);
  });

  it("deduplicates attachments and ignores ordinary remote images", () => {
    const markdown = [
      "![Remote](https://example.com/image.png)",
      serializePlatformInstructionsEditorFileMarkdown({
        src: "/api/real/attachments/shared-1",
        name: "shared.txt",
        attachmentId: "shared-1",
      }),
      serializePlatformInstructionsEditorImageMarkdown({
        src: "/api/real/attachments/shared-1",
        name: "shared.png",
        alt: "shared.png",
        mimeType: "image/png",
        attachmentId: "shared-1",
      }),
    ].join("\n\n");

    expect(parseRunnerPromptEmbeddedAttachments(markdown)).toHaveLength(1);
    expect(parseRunnerPromptEmbeddedAttachments(markdown)[0]?.attachmentId)
      .toBe("shared-1");
  });
});

describe("resolveRunnerPromptAttachmentSourceUrl", () => {
  it("accepts authenticated attachment routes on the application or Runner origin", () => {
    expect(resolveRunnerPromptAttachmentSourceUrl(
      "/api/real/attachments/image-1",
      "image-1",
      { applicationUrl: "https://platform.example/prompts/prompt-1" },
    )).toBe("https://platform.example/api/real/attachments/image-1");

    expect(resolveRunnerPromptAttachmentSourceUrl(
      "https://runner.example/v1/attachments/image-1",
      "image-1",
      {
        applicationUrl: "https://platform.example/prompts/prompt-1",
        backendUrl: "https://runner.example/v1",
      },
    )).toBe("https://runner.example/v1/attachments/image-1");
  });

  it("rejects external, malformed, or mismatched attachment sources", () => {
    const options = {
      applicationUrl: "https://platform.example/prompts/prompt-1",
      backendUrl: "https://runner.example/v1",
    };
    expect(resolveRunnerPromptAttachmentSourceUrl(
      "https://untrusted.example/attachments/image-1",
      "image-1",
      options,
    )).toBeNull();
    expect(resolveRunnerPromptAttachmentSourceUrl(
      "/api/real/files/image-1",
      "image-1",
      options,
    )).toBeNull();
    expect(resolveRunnerPromptAttachmentSourceUrl(
      "/api/real/attachments/image-2",
      "image-1",
      options,
    )).toBeNull();
  });
});
