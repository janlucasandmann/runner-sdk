// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { LocalAttachment, RunnerAttachment } from "./attachment-types.js";
import { useRunnerAttachmentController } from "./use-attachment-controller.js";

function createResolvedAttachment(overrides: Partial<RunnerAttachment> = {}): RunnerAttachment {
  return {
    id: "attachment-1",
    filename: "report.txt",
    mimeType: "text/plain",
    size: 6,
    type: "document",
    uploadedAt: "2026-01-02T03:04:05.000Z",
    ...overrides,
  };
}

describe("useRunnerAttachmentController", () => {
  it("owns local preview creation, capacity, and cleanup", () => {
    const createObjectUrl = vi.fn(() => "blob:preview");
    const revokeObjectUrl = vi.fn();
    const { result, unmount } = renderHook(() =>
      useRunnerAttachmentController({
        apiKey: "",
        backendUrl: "",
        maxAttachments: 1,
        onTurnAttachmentPatch: vi.fn(),
        services: {
          createObjectUrl,
          revokeObjectUrl,
        },
      }),
    );
    const image = new File(["image"], "preview.png", {
      type: "image/png",
    });
    const ignored = new File(["text"], "ignored.txt", {
      type: "text/plain",
    });

    act(() => result.current.appendFiles([image, ignored]));

    expect(result.current.attachments).toHaveLength(1);
    expect(result.current.attachments[0]).toEqual(
      expect.objectContaining({
        file: image,
        previewUrl: "blob:preview",
        uploadStatus: "idle",
      }),
    );
    expect(createObjectUrl).toHaveBeenCalledOnce();

    unmount();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:preview");
  });

  it("uploads once and mirrors lifecycle patches into turn state", async () => {
    const onTurnAttachmentPatch = vi.fn();
    const uploaded = createResolvedAttachment();
    const uploadFiles = vi.fn().mockResolvedValue([uploaded]);
    const { result } = renderHook(() =>
      useRunnerAttachmentController({
        apiKey: "",
        backendUrl: "",
        maxAttachments: 5,
        onTurnAttachmentPatch,
        uploadFiles,
      }),
    );
    const file = new File(["report"], "report.txt", {
      type: "text/plain",
    });

    act(() => result.current.appendFiles([file]));
    await waitFor(() => expect(result.current.attachments[0]?.uploadStatus).toBe("uploaded"));

    const payload = await result.current.resolveAttachmentPayload(result.current.attachments);
    expect(payload).toEqual([uploaded]);
    expect(uploadFiles).toHaveBeenCalledOnce();
    expect(onTurnAttachmentPatch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ uploadStatus: "uploading" }),
    );
    expect(onTurnAttachmentPatch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ uploadStatus: "uploaded" }),
    );
  });

  it("deduplicates GitHub preparation for the same environment and ref", async () => {
    const startEnvironment = vi.fn().mockResolvedValue(undefined);
    const prepareGithubRepository = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useRunnerAttachmentController({
        apiKey: "key",
        backendUrl: "https://runner.example",
        maxAttachments: 5,
        onTurnAttachmentPatch: vi.fn(),
        selectedAgentId: "agent-1",
        services: {
          prepareGithubRepository,
          startEnvironment,
        },
        uploadEnvironmentId: "environment-1",
      }),
    );
    const resolvedAttachment = createResolvedAttachment({
      integrationSource: "github",
      githubRepoFullName: "company/platform",
      githubRef: "main",
    });
    const githubAttachment: LocalAttachment = {
      id: "github-1",
      file: new File([], "platform"),
      type: "document",
      source: "integration",
      integrationSource: "github",
      githubRepoFullName: "company/platform",
      githubRef: "main",
      resolvedAttachment,
      uploadStatus: "uploading",
    };

    await act(async () => {
      await Promise.all([
        result.current.beginAttachmentUpload(githubAttachment),
        result.current.beginAttachmentUpload(githubAttachment),
      ]);
    });

    expect(startEnvironment).toHaveBeenCalledOnce();
    expect(startEnvironment).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: "agent-1",
        environmentId: "environment-1",
        force: true,
      }),
    );
    expect(prepareGithubRepository).toHaveBeenCalledOnce();
    expect(githubAttachment.uploadStatus).toBe("uploaded");
  });
});
