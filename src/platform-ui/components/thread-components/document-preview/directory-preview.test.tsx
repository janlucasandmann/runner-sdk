// @vitest-environment jsdom

import { cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunnerPreviewAttachment, RunnerPreviewDirectoryEntry } from "./preview-contracts.js";
import { RunnerDirectoryPreview, useRunnerDirectoryPreview } from "./directory-preview.js";

function createAttachment(
  overrides: Partial<RunnerPreviewAttachment> = {},
): RunnerPreviewAttachment {
  return {
    id: "workspace-file:env_123:/workspace/reports",
    filename: "reports",
    mimeType: "inode/directory",
    type: "document",
    isFolder: true,
    workspacePath: "/workspace/reports",
    ...overrides,
  };
}

function createEntry(
  overrides: Partial<RunnerPreviewDirectoryEntry> = {},
): RunnerPreviewDirectoryEntry {
  return {
    id: "entry_123",
    name: "report.md",
    path: "/workspace/reports/report.md",
    isFolder: false,
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("directory preview", () => {
  it("preserves file-open, folder-toggle, and folder-open interactions", () => {
    const folder = createEntry({
      id: "folder_1",
      name: "archive",
      path: "/workspace/reports/archive",
      isFolder: true,
    });
    const file = createEntry({
      id: "file_1",
      size: 1536,
      modifiedTime: "2026-07-17T09:00:00.000Z",
    });
    const child = createEntry({
      id: "file_2",
      name: "old-report.png",
      path: "/workspace/reports/archive/old-report.png",
      mimeType: "image/png",
    });
    const onEntryOpen = vi.fn();
    const onFolderToggle = vi.fn();

    render(
      <RunnerDirectoryPreview
        activeDirectoryAbsolutePath="/workspace/reports"
        directoryPath="reports"
        state={{
          status: "ready",
          folderPath: "reports",
          entries: [folder, file],
        }}
        entriesByPath={{
          reports: [folder, file],
          "reports/archive": [child],
        }}
        loadingPaths={[]}
        errorsByPath={{}}
        expandedPaths={["reports/archive"]}
        onEntryOpen={onEntryOpen}
        onFolderToggle={onFolderToggle}
      />,
    );

    expect(screen.getByText("/workspace/reports")).toBeTruthy();
    expect(screen.getByText("1.5 KB", { exact: false })).toBeTruthy();
    expect(screen.getByText("old-report.png")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /report\.md/i }));
    expect(onEntryOpen).toHaveBeenCalledWith(file);

    const folderButton = screen.getByRole("button", { name: /archive/i });
    fireEvent.click(folderButton);
    expect(onFolderToggle).toHaveBeenCalledWith(folder);
    fireEvent.doubleClick(folderButton);
    expect(onEntryOpen).toHaveBeenCalledWith(folder);
  });

  it("loads and normalizes an explicit directory through the controller", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(
          JSON.stringify({
            files: [
              {
                path: "/workspace/reports/report.md",
                type: "file",
                size: 256,
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() =>
      useRunnerDirectoryPreview({
        attachment: createAttachment(),
        attachmentPreviewKind: "directory",
        backendUrl: "https://platform.example.test",
        environmentId: "env_123",
        isImageAttachment: false,
        requestHeaders: new Headers({ authorization: "Bearer test" }),
      }),
    );

    await waitFor(() => {
      expect(result.current.shouldRenderDirectoryPreview).toBe(true);
      expect(result.current.previewProps.state.status).toBe("ready");
    });
    expect(result.current.previewProps.state.entries).toEqual([
      expect.objectContaining({
        name: "report.md",
        path: "reports/report.md",
        isFolder: false,
      }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/environments/env_123/files");
  });

  it("lets unsupported files fall through when the directory probe returns 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: "Not a folder" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          }),
      ),
    );

    const { result } = renderHook(() =>
      useRunnerDirectoryPreview({
        attachment: createAttachment({
          isFolder: false,
          filename: "unknown.resource",
          mimeType: "application/octet-stream",
        }),
        attachmentPreviewKind: "unsupported",
        backendUrl: "https://platform.example.test",
        environmentId: "env_123",
        isImageAttachment: false,
        requestHeaders: new Headers(),
      }),
    );

    await waitFor(() => {
      expect(result.current.previewProps.state.status).toBe("not-directory");
    });
    expect(result.current.shouldRenderDirectoryPreview).toBe(false);
  });
});
