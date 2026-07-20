// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  PlatformFileExplorerModal,
  PlatformFileExplorerThumbnail,
} from "./platform-file-explorer-modal.js";

describe("PlatformFileExplorerModal", () => {
  it("composes the shared modal with matched sidebar and content headers", () => {
    const onClose = vi.fn();
    const onPreviewClose = vi.fn();
    render(
      <PlatformFileExplorerModal
        open
        visible
        portal={false}
        title="Attach files"
        sidebarHeader={<input aria-label="Search files" />}
        sidebar={<div>Sources</div>}
        contentHeader={<div>Workspace / output</div>}
        preview={<div>Preview</div>}
        previewTitle="File preview"
        footer={<button type="button">Attach</button>}
        onClose={onClose}
        onPreviewClose={onPreviewClose}
      >
        <div>Files</div>
      </PlatformFileExplorerModal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Attach files" });
    expect(dialog.classList.contains("platform-file-explorer-modal")).toBe(true);
    expect(dialog.querySelector("[data-platform-modal-part='sidebar']")?.textContent)
      .toContain("Sources");
    expect(screen.getByRole("textbox", { name: "Search files" })).toBeTruthy();
    expect(
      dialog.querySelector(".platform-modal-sidebar__title")?.textContent,
    ).not.toContain("Attach files");
    expect(dialog.querySelector(".platform-file-explorer__main")?.textContent)
      .toContain("Files");
    const preview = dialog.querySelector(".platform-file-explorer__preview");
    const content = dialog.querySelector("[data-platform-modal-part='content']");
    expect(preview?.textContent)
      .toContain("Preview");
    expect(content?.contains(preview)).toBe(false);
    expect(preview?.textContent).toContain("File preview");
    expect(
      dialog.querySelectorAll("[data-platform-modal-pane-part='header']"),
    ).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Close file preview" }));
    expect(onPreviewClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Close file explorer" }));
    expect(onClose).toHaveBeenCalledWith("close-button");
  });

  it("falls back from a thumbnail to its source file and then the file icon", () => {
    const { container } = render(
      <PlatformFileExplorerThumbnail
        src="/thumbnail/image.png"
        fallbackSrc="/download/image.png"
        alt="Image"
        fallback={<span>File icon</span>}
      />,
    );

    const image = screen.getByRole("img", { name: "Image" });
    expect(image.classList.contains("platform-file-explorer__thumbnail")).toBe(true);
    fireEvent.error(image);
    expect(screen.getByRole("img", { name: "Image" }).getAttribute("src"))
      .toBe("/download/image.png");
    fireEvent.error(screen.getByRole("img", { name: "Image" }));
    expect(container.textContent).toContain("File icon");
  });
});
