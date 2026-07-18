// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerFileBrowserPreview } from "./use-file-browser-preview.js";

describe("useRunnerFileBrowserPreview", () => {
  it("loads and truncates connector text previews", async () => {
    const fetchConnectorContent = vi.fn().mockResolvedValue({
      content: "x".repeat(5_100),
      encoding: "text",
      mimeType: "text/plain",
    });
    const item = {
      id: "document-1",
      name: "notes.txt",
      mimeType: "text/plain",
    };
    const { result } = renderHook(() =>
      useRunnerFileBrowserPreview({
        apiKey: "",
        backendUrl: "",
        fetchConnectorContent,
        item,
        source: "google-drive",
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchConnectorContent).toHaveBeenCalledOnce();
    expect(result.current.kind).toBe("text");
    expect(result.current.content).toHaveLength(5_000);
  });

  it("discards stale connector responses when the selected item changes", async () => {
    let resolveFirst: ((value: { content: string; encoding: "text" }) => void) | null = null;
    const fetchConnectorContent = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<{ content: string; encoding: "text" }>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({ content: "second", encoding: "text" });
    const firstItem = {
      id: "first",
      name: "first.txt",
      mimeType: "text/plain",
    };
    const secondItem = {
      id: "second",
      name: "second.txt",
      mimeType: "text/plain",
    };
    const { result, rerender } = renderHook(
      ({ item }) =>
        useRunnerFileBrowserPreview({
          apiKey: "",
          backendUrl: "",
          fetchConnectorContent,
          item,
          source: "github",
        }),
      { initialProps: { item: firstItem } },
    );

    rerender({ item: secondItem });
    await waitFor(() => expect(result.current.content).toBe("second"));
    act(() => resolveFirst?.({ content: "first", encoding: "text" }));
    expect(result.current.content).toBe("second");
  });
});
