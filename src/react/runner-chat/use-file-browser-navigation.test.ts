// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRunnerFileBrowserNavigation } from "./use-file-browser-navigation.js";

describe("useRunnerFileBrowserNavigation", () => {
  it("gates opening on an API key and resets navigation when closed", () => {
    const { result } = renderHook(() => useRunnerFileBrowserNavigation());

    act(() => {
      expect(result.current.requestOpen("github", false)).toBe(false);
    });
    expect(result.current.open).toBe(false);
    expect(result.current.apiKeyPromptOpen).toBe(true);

    act(() => result.current.closeApiKeyPrompt());
    act(() => {
      expect(result.current.requestOpen("github", true)).toBe(true);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.currentEntry).toEqual({
      source: "github",
      folderId: null,
    });

    act(() => result.current.navigateToFolder("repo/main"));
    expect(result.current.historyIndex).toBe(1);

    act(() => result.current.close());
    expect(result.current.open).toBe(false);
    expect(result.current.history).toEqual([]);
    expect(result.current.historyIndex).toBe(-1);
  });

  it("truncates forward history when navigating from an earlier entry", () => {
    const { result } = renderHook(() => useRunnerFileBrowserNavigation());

    act(() => {
      result.current.requestOpen("workspace", true);
    });
    act(() => result.current.navigateToFolder("one"));
    act(() => result.current.navigateToFolder("two"));
    act(() => result.current.goBack());
    act(() => result.current.navigateToFolder("replacement"));

    expect(result.current.history).toEqual([
      { source: "workspace", folderId: null },
      { source: "workspace", folderId: "one" },
      { source: "workspace", folderId: "replacement" },
    ]);
    expect(result.current.historyIndex).toBe(2);

    act(() => result.current.goForward());
    expect(result.current.historyIndex).toBe(2);
  });

  it("keeps source selections independent and supports targeted resets", () => {
    const { result } = renderHook(() => useRunnerFileBrowserNavigation());

    act(() => {
      result.current.toggleSelection("workspace", "src/index.ts");
      result.current.toggleSelection("github", "repo:file");
    });
    expect(result.current.selectedWorkspaceFileIds).toEqual(["src/index.ts"]);
    expect(result.current.selectedGithubFileIds).toEqual(["repo:file"]);

    act(() => result.current.clearSelection("workspace"));
    expect(result.current.selectedWorkspaceFileIds).toEqual([]);
    expect(result.current.selectedGithubFileIds).toEqual(["repo:file"]);

    act(() => result.current.clearSelection());
    expect(result.current.selectedGithubFileIds).toEqual([]);
  });
});
