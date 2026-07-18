// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRunnerFileBrowserSourceState } from "./use-file-browser-source-state.js";

describe("useRunnerFileBrowserSourceState", () => {
  it("resets one source without discarding another source's data", () => {
    const { result } = renderHook(() => useRunnerFileBrowserSourceState());

    act(() => {
      result.current.workspace.setItems([{ id: "workspace-file", name: "workspace.txt" }]);
      result.current.workspace.setLoadedFolderIds(["root"]);
      result.current.googleDrive.setItems([{ id: "drive-file", name: "drive.txt" }]);
      result.current.googleDrive.setLoadedFolderIds(["root"]);
    });

    act(() => result.current.resetSource("workspace"));

    expect(result.current.workspace.items).toEqual([]);
    expect(result.current.workspace.loadedFolderIds).toEqual([]);
    expect(result.current.googleDrive.items).toEqual([{ id: "drive-file", name: "drive.txt" }]);
    expect(result.current.googleDrive.loadedFolderIds).toEqual(["root"]);
  });

  it("clears transient close state while retaining cached connector items", () => {
    const { result } = renderHook(() => useRunnerFileBrowserSourceState());

    act(() => {
      result.current.workspace.setItems([{ id: "workspace-file", name: "workspace.txt" }]);
      result.current.googleDrive.setItems([{ id: "drive-file", name: "drive.txt" }]);
      result.current.googleDrive.setError("Drive failed");
      result.current.googleDrive.setPickerLoading(true);
      result.current.github.setError("GitHub failed");
    });

    act(() => result.current.resetAfterClose());

    expect(result.current.workspace.items).toEqual([]);
    expect(result.current.googleDrive.items).toHaveLength(1);
    expect(result.current.googleDrive.error).toBeNull();
    expect(result.current.googleDrive.pickerLoading).toBe(false);
    expect(result.current.github.error).toBeNull();
  });
});
