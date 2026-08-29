// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PlatformFileExplorerModal,
  PlatformFileExplorerThumbnail,
} from "./platform-file-explorer-modal.js";

describe("PlatformFileExplorerModal", () => {
  afterEach(() => cleanup());

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
        contentNavigation={<div>File filters</div>}
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
    expect(dialog.querySelector("[data-platform-modal-part='sidebar']")?.textContent).toContain(
      "Sources",
    );
    expect(screen.getByRole("textbox", { name: "Search files" })).toBeTruthy();
    expect(dialog.querySelector(".platform-modal-sidebar__title")?.textContent).not.toContain(
      "Attach files",
    );
    expect(dialog.querySelector(".platform-file-explorer__main")?.textContent).toContain("Files");
    const contentHeaderRow = dialog.querySelector(".platform-file-explorer__content-header-row");
    const contentNavigation = dialog.querySelector(".platform-file-explorer__content-navigation");
    expect(contentNavigation?.textContent).toContain("File filters");
    expect(contentHeaderRow?.contains(contentNavigation)).toBe(false);
    const preview = dialog.querySelector(".platform-file-explorer__preview");
    const content = dialog.querySelector("[data-platform-modal-part='content']");
    expect(preview?.textContent).toContain("Preview");
    expect(content?.contains(preview)).toBe(false);
    expect(preview?.textContent).toContain("File preview");
    expect(dialog.querySelectorAll("[data-platform-modal-pane-part='header']")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Close file preview" }));
    expect(onPreviewClose).toHaveBeenCalledTimes(1);

    expect(screen.queryByRole("button", { name: "Close file explorer" })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
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
    expect(screen.getByRole("img", { name: "Image" }).getAttribute("src")).toBe(
      "/download/image.png",
    );
    fireEvent.error(screen.getByRole("img", { name: "Image" }));
    expect(container.textContent).toContain("File icon");
  });

  it("closes the preview when the user points outside its protected areas", () => {
    const onPreviewClose = vi.fn();
    render(
      <PlatformFileExplorerModal
        open
        visible
        portal={false}
        title="Attach files"
        sidebar={<button type="button">Computer</button>}
        contentHeader={<button type="button">Header control</button>}
        preview={<div>Preview content</div>}
        onClose={vi.fn()}
        onPreviewClose={onPreviewClose}
      >
        <button type="button" data-platform-file-preview-anchor="true">
          Previewed file
        </button>
        <button type="button">File list background</button>
      </PlatformFileExplorerModal>,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "Header control" }));
    fireEvent.pointerDown(screen.getByRole("button", { name: "Previewed file" }));
    fireEvent.pointerDown(screen.getByText("Preview content"));
    expect(onPreviewClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByRole("button", { name: "File list background" }));
    expect(onPreviewClose).toHaveBeenCalledTimes(1);
  });

  it("can omit the sidebar header when controls move into the content header", () => {
    render(
      <PlatformFileExplorerModal
        open
        visible
        portal={false}
        title="Attach files"
        sidebarHeader={null}
        sidebar={<div>Sources</div>}
        contentHeader={<div>Workspace</div>}
        onClose={vi.fn()}
      >
        <div>Files</div>
      </PlatformFileExplorerModal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Attach files" });
    expect(
      dialog.querySelector(".platform-file-explorer__sidebar")?.classList.contains("has-no-header"),
    ).toBe(true);
    expect(dialog.classList.contains("has-no-navigation")).toBe(true);
  });

  it("can omit the complete sidebar without changing the shared explorer content", () => {
    render(
      <PlatformFileExplorerModal
        open
        visible
        portal={false}
        title="Attach files"
        sidebar={<div>Sources</div>}
        showSidebar={false}
        contentHeader={<div>GitHub account</div>}
        onClose={vi.fn()}
      >
        <div>Repositories</div>
      </PlatformFileExplorerModal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Attach files" });
    expect(dialog.querySelector("[data-platform-modal-part='sidebar']")).toBeNull();
    expect(
      dialog.querySelector(".platform-file-explorer")?.classList.contains("has-no-sidebar"),
    ).toBe(true);
    expect(dialog.textContent).toContain("Repositories");
  });
});
