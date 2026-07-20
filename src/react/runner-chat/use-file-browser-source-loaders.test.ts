// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerFileBrowserSourceLoaders } from "./use-file-browser-source-loaders.js";
import { useRunnerFileBrowserSourceState } from "./use-file-browser-source-state.js";

describe("useRunnerFileBrowserSourceLoaders", () => {
  it("loads the active workspace folder once and records it as loaded", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          files: [{ path: "/notes.txt", type: "file", size: 12 }],
        }),
    });
    const { result, rerender } = renderHook(() => {
      const sourceState = useRunnerFileBrowserSourceState();
      const loaders = useRunnerFileBrowserSourceLoaders({
        apiKey: "test-key",
        backendUrl: "https://runner.example",
        currentFolderId: null,
        currentSource: "workspace",
        fetchImpl,
        githubConnected: false,
        googleDriveConnected: false,
        hasApiKey: true,
        notionConnected: false,
        oneDriveConnected: false,
        open: true,
        sourceState,
        workspaceEnvironmentId: "environment-1",
      });
      return { loaders, sourceState };
    });

    await waitFor(() =>
      expect(result.current.sourceState.workspace.loadedFolderIds).toContain("root"),
    );
    rerender();

    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://runner.example/environments/environment-1/files?depth=1",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.current.sourceState.workspace.items).toEqual([
      expect.objectContaining({
        id: "notes.txt",
        name: "notes.txt",
        parentId: null,
      }),
    ]);
  });

  it("loads the initially selected environment after it resolves while the explorer is open", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          files: [{ path: "/initial.txt", type: "file", size: 24 }],
        }),
    });
    const { result, rerender } = renderHook(
      ({ workspaceEnvironmentId }: { workspaceEnvironmentId: string }) => {
        const sourceState = useRunnerFileBrowserSourceState();
        useRunnerFileBrowserSourceLoaders({
          apiKey: "test-key",
          backendUrl: "https://runner.example",
          currentFolderId: null,
          currentSource: "workspace",
          fetchImpl,
          githubConnected: false,
          googleDriveConnected: false,
          hasApiKey: true,
          notionConnected: false,
          oneDriveConnected: false,
          open: true,
          sourceState,
          workspaceEnvironmentId,
        });
        return sourceState;
      },
      { initialProps: { workspaceEnvironmentId: "" } },
    );

    await waitFor(() =>
      expect(result.current.workspace.error).toBe(
        "Select an environment to browse workspace files.",
      ),
    );
    expect(fetchImpl).not.toHaveBeenCalled();

    rerender({ workspaceEnvironmentId: "environment-initial" });

    await waitFor(() =>
      expect(result.current.workspace.loadedFolderIds).toContain("root"),
    );
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://runner.example/environments/environment-initial/files?depth=1",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.current.workspace.error).toBeNull();
  });

  it("does not retry an actual workspace request failure on every render", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("Workspace unavailable"));
    const { result, rerender } = renderHook(() => {
      const sourceState = useRunnerFileBrowserSourceState();
      useRunnerFileBrowserSourceLoaders({
        apiKey: "test-key",
        backendUrl: "https://runner.example",
        currentFolderId: null,
        currentSource: "workspace",
        fetchImpl,
        githubConnected: false,
        googleDriveConnected: false,
        hasApiKey: true,
        notionConnected: false,
        oneDriveConnected: false,
        open: true,
        sourceState,
        workspaceEnvironmentId: "environment-1",
      });
      return sourceState;
    });

    await waitFor(() =>
      expect(result.current.workspace.error).toBe("Workspace unavailable"),
    );
    rerender();

    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("replaces the workspace root when the selected environment changes", async () => {
    const fetchImpl = vi.fn(async (requestUrl: string | URL | Request) => {
      const url = String(requestUrl);
      const environmentName = url.includes("environment-2")
        ? "second.txt"
        : "first.txt";
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            files: [{ path: `/${environmentName}`, type: "file" }],
          }),
      };
    });
    const { result, rerender } = renderHook(
      ({ workspaceEnvironmentId }: { workspaceEnvironmentId: string }) => {
        const sourceState = useRunnerFileBrowserSourceState();
        useRunnerFileBrowserSourceLoaders({
          apiKey: "test-key",
          backendUrl: "https://runner.example",
          currentFolderId: null,
          currentSource: "workspace",
          fetchImpl: fetchImpl as typeof fetch,
          githubConnected: false,
          googleDriveConnected: false,
          hasApiKey: true,
          notionConnected: false,
          oneDriveConnected: false,
          open: true,
          sourceState,
          workspaceEnvironmentId,
        });
        return sourceState;
      },
      { initialProps: { workspaceEnvironmentId: "environment-1" } },
    );

    await waitFor(() =>
      expect(result.current.workspace.items).toEqual([
        expect.objectContaining({ name: "first.txt" }),
      ]),
    );

    rerender({ workspaceEnvironmentId: "environment-2" });

    await waitFor(() =>
      expect(result.current.workspace.items).toEqual([
        expect.objectContaining({ name: "second.txt" }),
      ]),
    );
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not spin on a connector error until the source is reset", async () => {
    const fetchGoogleDriveItems = vi.fn().mockRejectedValue(new Error("Drive unavailable"));
    const { result, rerender } = renderHook(() => {
      const sourceState = useRunnerFileBrowserSourceState();
      useRunnerFileBrowserSourceLoaders({
        apiKey: "",
        backendUrl: "",
        currentFolderId: null,
        currentSource: "google-drive",
        fetchGoogleDriveItems,
        githubConnected: false,
        googleDriveConnected: true,
        hasApiKey: false,
        notionConnected: false,
        oneDriveConnected: false,
        open: true,
        sourceState,
        workspaceEnvironmentId: "",
      });
      return sourceState;
    });

    await waitFor(() => expect(result.current.googleDrive.error).toBe("Drive unavailable"));
    rerender();

    expect(fetchGoogleDriveItems).toHaveBeenCalledOnce();
  });

  it("loads Notion databases without duplicating the in-flight request", async () => {
    const fetchNotionDatabases = vi
      .fn()
      .mockResolvedValue([{ id: "database-1", name: "Research" }]);
    const { result } = renderHook(() => {
      const sourceState = useRunnerFileBrowserSourceState();
      useRunnerFileBrowserSourceLoaders({
        apiKey: "",
        backendUrl: "",
        currentFolderId: null,
        currentSource: "notion",
        fetchNotionDatabases,
        githubConnected: false,
        googleDriveConnected: false,
        hasApiKey: false,
        notionConnected: true,
        oneDriveConnected: false,
        open: true,
        sourceState,
        workspaceEnvironmentId: "",
      });
      return sourceState;
    });

    await waitFor(() => expect(result.current.notion.loaded).toBe(true));

    expect(fetchNotionDatabases).toHaveBeenCalledOnce();
    expect(result.current.notion.databases).toEqual([{ id: "database-1", name: "Research" }]);
  });
});
