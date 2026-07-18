// @vitest-environment jsdom

import { act, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { RunnerTurnAttachment } from "./attachment-types.js";
import { useRunnerDocumentPreviewController } from "./use-document-preview-controller.js";

const attachment: RunnerTurnAttachment = {
  id: "attachment_1",
  filename: "diagram.png",
  mimeType: "image/png",
  type: "image",
  previewUrl: "/preview/diagram.png",
};

afterEach(() => {
  document.body.className = "";
  vi.restoreAllMocks();
});

describe("useRunnerDocumentPreviewController", () => {
  it("owns preview lifecycle and document-level presentation state", () => {
    const onBeforeOpen = vi.fn();
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerDocumentPreviewController({
        onBeforeOpen,
        onOpenChange,
      }),
    );

    act(() => result.current.toggleAttachment(attachment));

    expect(onBeforeOpen).toHaveBeenCalledOnce();
    expect(result.current.attachment).toEqual(attachment);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(document.body.classList.contains("tb-runner-document-preview-active")).toBe(true);

    act(() => result.current.toggleMaximized());
    expect(result.current.maximized).toBe(true);
    expect(document.body.classList.contains("tb-runner-document-preview-maximized")).toBe(true);

    act(() => result.current.setActionMenuOpen(true));
    fireEvent.pointerDown(document.body);
    expect(result.current.actionMenuOpen).toBe(false);

    act(() => result.current.close());
    expect(result.current.attachment).toBeNull();
    expect(result.current.maximized).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("normalizes an external attachment once for each request token", () => {
    const onBeforeOpen = vi.fn();
    const { result, rerender } = renderHook(
      ({ token }) =>
        useRunnerDocumentPreviewController({
          backendUrl: "https://runner.example.test",
          initialAttachment: attachment,
          initialAttachmentToken: token,
          onBeforeOpen,
        }),
      { initialProps: { token: "request_1" } },
    );

    expect(result.current.attachment?.id).toBe("attachment_1");
    expect(onBeforeOpen).toHaveBeenCalledOnce();

    rerender({ token: "request_1" });
    expect(onBeforeOpen).toHaveBeenCalledOnce();

    rerender({ token: "request_2" });
    expect(onBeforeOpen).toHaveBeenCalledTimes(2);
  });
});
