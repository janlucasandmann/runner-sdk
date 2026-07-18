// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import {
  createRunnerGithubSelectionAttachment,
  createRunnerImplicitAttachments,
  createRunnerIntegrationAttachment,
  createRunnerWorkspaceAttachment,
} from "./attachment-factories.js";

describe("attachment factories", () => {
  it("creates a resolved workspace attachment from file metadata", () => {
    const attachment = createRunnerWorkspaceAttachment({
      backendUrl: "https://runner.example",
      item: {
        id: "reports/result.pdf",
        name: "result.pdf",
        path: "/reports/result.pdf",
        mimeType: "application/pdf",
        size: 42,
      },
      now: () => new Date("2026-01-02T03:04:05.000Z"),
      sourceEnvironmentId: "environment-1",
    });

    expect(attachment.source).toBe("workspace");
    expect(attachment.type).toBe("document");
    expect(attachment.uploadStatus).toBe("uploaded");
    expect(attachment.resolvedAttachment).toEqual(
      expect.objectContaining({
        filename: "result.pdf",
        size: 42,
        sourceEnvironmentId: "environment-1",
        workspacePath: "reports/result.pdf",
      }),
    );
  });

  it("filters invalid implicit entries and preserves image previews", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => new Blob(["image"], { type: "image/png" }),
    });

    const attachments = await createRunnerImplicitAttachments(
      [
        { url: "", filename: "ignored.png" },
        { url: "https://assets.example/image.png", filename: "image.png" },
      ],
      fetchImpl,
    );

    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(attachments).toEqual([
      expect.objectContaining({
        previewUrl: "https://assets.example/image.png",
        source: "local",
        type: "image",
      }),
    ]);
  });

  it("creates GitHub selection metadata and uploaded connector previews", async () => {
    const githubAttachment = createRunnerGithubSelectionAttachment({
      getSelectedBranch: () => "develop",
      item: {
        id: "repo",
        name: "platform",
        repoFullName: "company/platform",
        isFolder: true,
      },
      now: () => new Date("2026-01-02T03:04:05.000Z"),
      pendingPreparation: true,
      targetEnvironmentId: "environment-1",
    });
    expect(githubAttachment).toEqual(
      expect.objectContaining({
        githubRef: "develop",
        githubSelectionType: "repo",
        uploadStatus: "uploading",
      }),
    );

    const uploadContent = vi.fn().mockResolvedValue({
      id: "uploaded",
      filename: "image.png",
      mimeType: "image/png",
      size: 3,
      type: "image",
      uploadedAt: "2026-01-02T03:04:05.000Z",
    });
    const integrationAttachment = await createRunnerIntegrationAttachment({
      apiKey: "key",
      backendUrl: "https://runner.example",
      fetchFileContent: async () => ({
        content: "YWJj",
        encoding: "base64",
        mimeType: "image/png",
        name: "image.png",
      }),
      item: { id: "image", name: "image.png" },
      source: "google-drive",
      targetEnvironmentId: "environment-1",
      uploadContent,
    });

    expect(uploadContent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: "YWJj",
        environmentId: "environment-1",
      }),
    );
    expect(integrationAttachment.previewUrl).toBe("data:image/png;base64,YWJj");
  });
});
