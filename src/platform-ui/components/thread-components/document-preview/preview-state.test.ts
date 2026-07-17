import { describe, expect, it } from "vitest";
import type {
  RunnerPreviewAttachment,
  RunnerPreviewDirectoryEntry,
} from "../../../../react/runner-document-preview.js";
import {
  formatRunnerPreviewFileSize,
  getRunnerPreviewAttachmentEnvironmentId,
  getRunnerPreviewAttachmentWorkspacePath,
  getRunnerPreviewTextMimeType,
  isRunnerPreviewEditableSpreadsheetCode,
  isRunnerPreviewEditableTextDocumentKind,
  isRunnerPreviewImageAttachment,
  isRunnerPreviewImageEntry,
  toAbsoluteRunnerWorkspacePath,
} from "./preview-state.js";

function createAttachment(
  overrides: Partial<RunnerPreviewAttachment> = {},
): RunnerPreviewAttachment {
  return {
    id: "attachment_123",
    filename: "notes.txt",
    mimeType: "text/plain",
    type: "document",
    ...overrides,
  };
}

describe("document preview state", () => {
  it("infers text MIME types while preserving explicit MIME metadata", () => {
    expect(getRunnerPreviewTextMimeType("table.csv")).toBe("text/csv;charset=utf-8");
    expect(getRunnerPreviewTextMimeType("table.tsv")).toBe(
      "text/tab-separated-values;charset=utf-8",
    );
    expect(getRunnerPreviewTextMimeType("README.md")).toBe("text/markdown;charset=utf-8");
    expect(getRunnerPreviewTextMimeType("page.html")).toBe("text/html;charset=utf-8");
    expect(getRunnerPreviewTextMimeType("payload.json")).toBe("application/json;charset=utf-8");
    expect(getRunnerPreviewTextMimeType("unknown.bin")).toBe("text/plain;charset=utf-8");
    expect(getRunnerPreviewTextMimeType("payload.json", "application/vnd.example+json")).toBe(
      "application/vnd.example+json",
    );
  });

  it("classifies editable document and spreadsheet formats", () => {
    expect(isRunnerPreviewEditableTextDocumentKind("text")).toBe(true);
    expect(isRunnerPreviewEditableTextDocumentKind("markdown")).toBe(true);
    expect(isRunnerPreviewEditableTextDocumentKind("html")).toBe(true);
    expect(isRunnerPreviewEditableTextDocumentKind("pdf")).toBe(false);
    expect(isRunnerPreviewEditableTextDocumentKind(null)).toBe(false);

    expect(isRunnerPreviewEditableSpreadsheetCode("table.csv")).toBe(true);
    expect(isRunnerPreviewEditableSpreadsheetCode("table.tsv")).toBe(true);
    expect(isRunnerPreviewEditableSpreadsheetCode("table.xlsx")).toBe(false);
  });

  it("resolves environment identity by explicit, attachment, then encoded ID priority", () => {
    const attachment = createAttachment({
      id: "workspace-file:env_encoded:/workspace/report.md",
      environmentId: "env_attachment",
    });

    expect(getRunnerPreviewAttachmentEnvironmentId(attachment, "env_explicit")).toBe(
      "env_explicit",
    );
    expect(getRunnerPreviewAttachmentEnvironmentId(attachment)).toBe("env_attachment");
    expect(
      getRunnerPreviewAttachmentEnvironmentId(
        createAttachment({
          id: "workspace-file:env_encoded:/workspace/report.md",
        }),
      ),
    ).toBe("env_encoded");
  });

  it("normalizes direct and encoded workspace paths", () => {
    expect(
      getRunnerPreviewAttachmentWorkspacePath(
        createAttachment({ workspacePath: "reports/final.md" }),
      ),
    ).toBe("/workspace/reports/final.md");
    expect(
      getRunnerPreviewAttachmentWorkspacePath(
        createAttachment({
          id: "workspace-file:env_123:/workspace/reports/final.md",
        }),
      ),
    ).toBe("/workspace/reports/final.md");
    expect(toAbsoluteRunnerWorkspacePath("/workspace/reports/final.md")).toBe(
      "/workspace/reports/final.md",
    );
    expect(toAbsoluteRunnerWorkspacePath("reports/final.md")).toBe("/workspace/reports/final.md");
    expect(toAbsoluteRunnerWorkspacePath("")).toBe("/workspace");
  });

  it("formats file sizes without inventing values for missing metadata", () => {
    expect(formatRunnerPreviewFileSize()).toBe("");
    expect(formatRunnerPreviewFileSize(0)).toBe("");
    expect(formatRunnerPreviewFileSize(Number.NaN)).toBe("");
    expect(formatRunnerPreviewFileSize(512)).toBe("512 B");
    expect(formatRunnerPreviewFileSize(1536)).toBe("1.5 KB");
    expect(formatRunnerPreviewFileSize(2 * 1024 * 1024)).toBe("2 MB");
  });

  it("detects image attachments and directory entries from type, MIME, or extension", () => {
    expect(isRunnerPreviewImageAttachment(createAttachment({ type: "image", mimeType: "" }))).toBe(
      true,
    );
    expect(isRunnerPreviewImageAttachment(createAttachment({ mimeType: "image/webp" }))).toBe(true);
    expect(isRunnerPreviewImageAttachment(createAttachment())).toBe(false);

    const entry = (
      overrides: Partial<RunnerPreviewDirectoryEntry>,
    ): RunnerPreviewDirectoryEntry => ({
      id: "entry_123",
      name: "file.txt",
      path: "/workspace/file.txt",
      isFolder: false,
      ...overrides,
    });
    expect(isRunnerPreviewImageEntry(entry({ mimeType: "image/png" }))).toBe(true);
    expect(isRunnerPreviewImageEntry(entry({ name: "PHOTO.JPEG" }))).toBe(true);
    expect(isRunnerPreviewImageEntry(entry({ name: "notes.txt" }))).toBe(false);
  });
});
