// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { LocalAttachment, RunnerAttachment } from "./attachment-types.js";
import {
  type UseRunnerFileBrowserAttachmentControllerOptions,
  useRunnerFileBrowserAttachmentController,
} from "./use-file-browser-attachment-controller.js";

function createLocalAttachment(id = "local-1"): LocalAttachment {
  return {
    id,
    file: new File(["content"], "report.txt"),
    source: "workspace",
    type: "document",
  };
}

function createResolvedAttachment(): RunnerAttachment {
  return {
    id: "resolved-1",
    filename: "report.txt",
    mimeType: "text/plain",
    size: 7,
    type: "document",
    uploadedAt: "2026-01-02T03:04:05.000Z",
  };
}

function createOptions(
  overrides: Partial<UseRunnerFileBrowserAttachmentControllerOptions> = {},
): UseRunnerFileBrowserAttachmentControllerOptions {
  return {
    activeWorkspaceEnvironmentId: "environment-1",
    addAttachments: vi.fn(),
    apiKey: "key",
    attachmentCount: 0,
    backendUrl: "https://runner.example",
    beginAttachmentUpload: vi.fn(),
    closeInputPopups: vi.fn(),
    getGithubSelectedBranch: () => "main",
    githubItems: [],
    googleDriveItems: [],
    maxAttachments: 5,
    oneDriveItems: [],
    onError: vi.fn(),
    onWorkspaceError: vi.fn(),
    resolveUploadEnvironmentId: () => "environment-1",
    selectedGithubFileIds: [],
    selectedGoogleDriveFileIds: [],
    selectedOneDriveFileIds: [],
    selectedWorkspaceFileIds: [],
    setSelectedGithubFileIds: vi.fn(),
    setSelectedGoogleDriveFileIds: vi.fn(),
    setSelectedOneDriveFileIds: vi.fn(),
    setSelectedWorkspaceFileIds: vi.fn(),
    workspaceItems: [],
    ...overrides,
  };
}

describe("useRunnerFileBrowserAttachmentController", () => {
  it("attaches selected workspace files and clears selection", async () => {
    const attachment = createLocalAttachment();
    const addAttachments = vi.fn();
    const closeInputPopups = vi.fn();
    const setSelectedWorkspaceFileIds = vi.fn();
    const createWorkspaceAttachment = vi.fn(() => attachment);
    const options = createOptions({
      addAttachments,
      closeInputPopups,
      selectedWorkspaceFileIds: ["report"],
      services: { createWorkspaceAttachment },
      setSelectedWorkspaceFileIds,
      workspaceConfig: { onAttach: vi.fn() },
      workspaceItems: [
        {
          id: "report",
          name: "report.txt",
          path: "/report.txt",
        },
      ],
    });
    const { result } = renderHook(() => useRunnerFileBrowserAttachmentController(options));

    let attached = false;
    await act(async () => {
      attached = await result.current.attachWorkspaceFiles();
    });

    expect(attached).toBe(true);
    expect(addAttachments).toHaveBeenCalledWith([attachment]);
    expect(setSelectedWorkspaceFileIds).toHaveBeenCalledWith([]);
    expect(closeInputPopups).toHaveBeenCalledOnce();
    expect(result.current.isAttaching).toBe(false);
  });

  it("rejects GitHub selections spanning multiple repositories", async () => {
    const onError = vi.fn();
    const options = createOptions({
      githubItems: [
        {
          id: "one",
          name: "one",
          repoFullName: "company/one",
        },
        {
          id: "two",
          name: "two",
          repoFullName: "company/two",
        },
      ],
      onError,
      selectedGithubFileIds: ["one", "two"],
    });
    const { result } = renderHook(() => useRunnerFileBrowserAttachmentController(options));

    let attached = true;
    await act(async () => {
      attached = await result.current.attachIntegrationFiles("github");
    });

    expect(attached).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      "Attach files from a single GitHub repository per message.",
    );
  });

  it("prepares GitHub attachments in the selected environment", async () => {
    const attachment = createLocalAttachment("github-1");
    attachment.source = "integration";
    attachment.integrationSource = "github";
    const beginAttachmentUpload = vi.fn(() => Promise.resolve(createResolvedAttachment()));
    const addAttachments = vi.fn();
    const createGithubAttachment = vi.fn(() => attachment);
    const options = createOptions({
      addAttachments,
      beginAttachmentUpload,
      githubConfig: { onAttach: vi.fn() },
      githubItems: [
        {
          id: "repo",
          name: "platform",
          repoFullName: "company/platform",
          isFolder: true,
        },
      ],
      selectedGithubFileIds: ["repo"],
      services: { createGithubAttachment },
    });
    const { result } = renderHook(() => useRunnerFileBrowserAttachmentController(options));

    await act(async () => {
      await result.current.attachIntegrationFiles("github");
    });

    expect(addAttachments).toHaveBeenCalledWith([attachment]);
    expect(beginAttachmentUpload).toHaveBeenCalledWith(attachment, {
      environmentIdOverride: "environment-1",
    });
  });
});
