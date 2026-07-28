// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformCodeEditorWorkspace } from "./platform-code-editor-workspace.js";

afterEach(cleanup);

describe("PlatformCodeEditorWorkspace", () => {
  it("owns file selection, editor content, and the active-file header", () => {
    const onFileSelect = vi.fn();
    const { container } = render(
      <PlatformCodeEditorWorkspace
        ariaLabel="Workflow code"
        files={[
          { id: "main.py", label: "main.py", icon: <span>F</span> },
          { id: "requirements.txt", label: "requirements.txt" },
        ]}
        activeFileId="main.py"
        onFileSelect={onFileSelect}
        editor={<textarea aria-label="Source code" />}
        status="Unsaved changes"
      />,
    );

    expect(screen.getByRole("region", { name: "Workflow code" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "main.py" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByLabelText("Source code")).not.toBeNull();
    expect(
      container.querySelector(".platform-code-editor-workspace__editor-title")?.textContent,
    ).toBe("main.py");
    expect(screen.queryByText("Unsaved changes")).toBeNull();
    expect(container.querySelector(".platform-code-editor-workspace__footer")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "requirements.txt" }));
    expect(onFileSelect).toHaveBeenCalledWith("requirements.txt");
  });

  it("renders history controls in the active-file header through the shared icon buttons", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    render(
      <PlatformCodeEditorWorkspace
        files={[]}
        status="Ready"
        historyControls={{
          onUndo,
          onRedo,
          redoDisabled: true,
        }}
      />,
    );

    const undoButton = screen.getByRole("button", { name: "Undo" });
    const redoButton = screen.getByRole("button", { name: "Redo" });
    expect(undoButton.classList.contains("platform-icon-button")).toBe(true);
    expect(
      undoButton.closest(".platform-code-editor-workspace__editor-header"),
    ).not.toBeNull();
    expect((redoButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(undoButton);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).not.toHaveBeenCalled();
  });

  it("moves file creation into the Files header and keeps nested file disclosures", () => {
    const onCreateFile = vi.fn();
    const onUploadFiles = vi.fn();
    const onCreateFolder = vi.fn();
    const { container } = render(
      <PlatformCodeEditorWorkspace
        files={[
          {
            id: "src",
            label: "src",
            leading: <span>Open</span>,
            depth: 2,
          },
        ]}
        onCreateFile={onCreateFile}
        onUploadFiles={onUploadFiles}
        onCreateFolder={onCreateFolder}
      />,
    );

    expect(screen.getByText("Files")).not.toBeNull();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(container.querySelector(".platform-code-editor-tab-bar")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Add file" }));
    expect(screen.getByRole("menu").classList.contains("is-minimal")).toBe(true);
    fireEvent.click(screen.getByRole("menuitem", { name: "Create File" }));
    expect(onCreateFile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Add file" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Upload Files" }));
    expect(onUploadFiles).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Create folder" }));
    expect(onCreateFolder).toHaveBeenCalledTimes(1);

    const file = screen.getByRole("button", { name: "src" });
    expect(file.closest(".platform-code-editor-workspace__file")?.getAttribute("style")).toContain(
      "padding-inline-start: 44px",
    );
    expect(screen.getByText("Open")).not.toBeNull();
  });

  it("moves dragged files into folders and back to the sidebar root", () => {
    const onFilesMove = vi.fn();
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn(),
    };
    const { container } = render(
      <PlatformCodeEditorWorkspace
        files={[
          {
            id: "src",
            label: "src",
            ariaLabel: "src",
            isFolder: true,
            parentId: null,
          },
          {
            id: "index.ts",
            label: "index.ts",
            ariaLabel: "index.ts",
            parentId: null,
          },
          {
            id: "src/config.ts",
            label: "config.ts",
            ariaLabel: "config.ts",
            parentId: "src",
            depth: 1,
          },
        ]}
        onFilesMove={onFilesMove}
      />,
    );

    const indexRow = screen
      .getByRole("button", { name: "index.ts" })
      .closest(".platform-code-editor-workspace__file");
    const sourceRow = screen
      .getByRole("button", { name: "src" })
      .closest(".platform-code-editor-workspace__file");
    expect(indexRow?.getAttribute("draggable")).toBe("true");

    fireEvent.dragStart(indexRow as Element, { dataTransfer });
    fireEvent.dragOver(sourceRow as Element, { dataTransfer });
    expect(sourceRow?.classList.contains("is-drop-target")).toBe(true);
    fireEvent.drop(sourceRow as Element, { dataTransfer });
    expect(onFilesMove).toHaveBeenLastCalledWith({
      files: [expect.objectContaining({ id: "index.ts" })],
      destinationFolder: expect.objectContaining({ id: "src" }),
    });

    const nestedRow = screen
      .getByRole("button", { name: "config.ts" })
      .closest(".platform-code-editor-workspace__file");
    const sidebarHeader = container.querySelector(
      ".platform-code-editor-workspace__sidebar-header",
    );
    fireEvent.dragStart(nestedRow as Element, { dataTransfer });
    fireEvent.dragOver(sidebarHeader as Element, { dataTransfer });
    fireEvent.drop(sidebarHeader as Element, { dataTransfer });
    expect(onFilesMove).toHaveBeenLastCalledWith({
      files: [expect.objectContaining({ id: "src/config.ts" })],
      destinationFolder: null,
    });
  });

  it("does not allow a folder to be dropped into its own descendant", () => {
    const onFilesMove = vi.fn();
    const dataTransfer = {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn(),
    };
    render(
      <PlatformCodeEditorWorkspace
        files={[
          {
            id: "src",
            label: "src",
            ariaLabel: "src",
            isFolder: true,
            parentId: null,
          },
          {
            id: "src/nested",
            label: "nested",
            ariaLabel: "nested",
            isFolder: true,
            parentId: "src",
            depth: 1,
          },
        ]}
        onFilesMove={onFilesMove}
      />,
    );

    const sourceRow = screen
      .getByRole("button", { name: "src" })
      .closest(".platform-code-editor-workspace__file");
    const nestedRow = screen
      .getByRole("button", { name: "nested" })
      .closest(".platform-code-editor-workspace__file");
    fireEvent.dragStart(sourceRow as Element, { dataTransfer });
    fireEvent.dragOver(nestedRow as Element, { dataTransfer });
    fireEvent.drop(nestedRow as Element, { dataTransfer });

    expect(onFilesMove).not.toHaveBeenCalled();
  });

  it("uses shared checkboxes and minimal popup actions for single and multi-file operations", () => {
    const onFileRename = vi.fn();
    const onFilesDelete = vi.fn();
    render(
      <PlatformCodeEditorWorkspace
        files={[
          { id: "main.ts", label: "main.ts", ariaLabel: "main.ts" },
          { id: "styles.css", label: "styles.css", ariaLabel: "styles.css" },
        ]}
        onFileRename={onFileRename}
        onFilesDelete={onFilesDelete}
      />,
    );

    const mainFileButton = screen.getByRole("button", { name: "main.ts" });
    fireEvent.contextMenu(mainFileButton, { clientX: 120, clientY: 80 });

    const singleFileMenu = screen.getByRole("menu");
    const menuAnchor = document.body.querySelector(
      ".platform-code-editor-workspace__file-menu-anchor",
    ) as HTMLElement | null;
    expect(menuAnchor).not.toBeNull();
    expect(screen.getByRole("region", { name: "Code editor" }).contains(menuAnchor)).toBe(false);
    expect(menuAnchor?.style.left).toBe("120px");
    expect(menuAnchor?.style.top).toBe("80px");
    expect(singleFileMenu.classList.contains("is-minimal")).toBe(true);
    expect(screen.getByRole("menuitem", { name: "Rename" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Delete" })).not.toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onFileRename).toHaveBeenCalledWith(expect.objectContaining({ id: "main.ts" }));

    fireEvent.click(screen.getByRole("checkbox", { name: "Select main.ts" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select styles.css" }));
    fireEvent.click(screen.getByRole("button", { name: "Open actions for main.ts" }));

    expect(screen.queryByRole("menuitem", { name: "Rename" })).toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onFilesDelete).toHaveBeenCalledWith([
      expect.objectContaining({ id: "main.ts" }),
      expect.objectContaining({ id: "styles.css" }),
    ]);
  });

  it("keeps a single selected-file header without opening persistent tabs", () => {
    const onFileSelect = vi.fn();
    const { container, rerender } = render(
      <PlatformCodeEditorWorkspace
        files={[
          { id: "src", label: "src", openInTab: false },
          { id: "main.ts", label: "main.ts" },
          { id: "styles.css", label: "styles.css" },
        ]}
        activeFileId="main.ts"
        onFileSelect={onFileSelect}
        editor={<textarea aria-label="Source code" />}
      />,
    );

    expect(container.querySelector(".platform-code-editor-tab-bar")).toBeNull();
    expect(
      container.querySelector(".platform-code-editor-workspace__editor-title")?.textContent,
    ).toBe("main.ts");

    fireEvent.click(screen.getByRole("button", { name: "styles.css" }));
    expect(onFileSelect).toHaveBeenLastCalledWith("styles.css");
    rerender(
      <PlatformCodeEditorWorkspace
        files={[
          { id: "src", label: "src", openInTab: false },
          { id: "main.ts", label: "main.ts" },
          { id: "styles.css", label: "styles.css" },
        ]}
        activeFileId="styles.css"
        onFileSelect={onFileSelect}
        editor={<textarea aria-label="Source code" />}
      />,
    );
    expect(
      container.querySelector(".platform-code-editor-workspace__editor-title")?.textContent,
    ).toBe("styles.css");

    fireEvent.click(screen.getByRole("button", { name: "src" }));
    expect(onFileSelect).toHaveBeenLastCalledWith("src");
  });

  it("centers the shared loading indicator while files are loading", () => {
    render(
      <PlatformCodeEditorWorkspace
        files={[{ id: "main.ts", label: "main.ts" }]}
        isLoadingFiles
        loadingFilesMessage="Loading source files..."
        onCreateFile={() => undefined}
      />,
    );

    expect(
      screen.getByRole("status", { name: "Loading source files..." }),
    ).not.toBeNull();
    expect(screen.queryByRole("button", { name: "main.ts" })).toBeNull();
    expect((screen.getByRole("button", { name: "Add file" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("never renders the removed footer", () => {
    const { container } = render(
      <PlatformCodeEditorWorkspace files={[]} status="Ready" showFooter />,
    );

    expect(container.querySelector(".platform-code-editor-workspace__footer")).toBeNull();
  });

  it("exposes a full-screen variant that can fill its content container", () => {
    const { container } = render(<PlatformCodeEditorWorkspace files={[]} variant="full-screen" />);
    const workspace = container.querySelector(".platform-code-editor-workspace");

    expect(workspace?.classList.contains("is-full-screen")).toBe(true);
    expect(workspace?.getAttribute("data-platform-code-editor-workspace-variant")).toBe(
      "full-screen",
    );
  });

  it("isolates editor shortcuts without cancelling Backspace or Delete", () => {
    const onParentKeyDown = vi.fn();
    render(
      <div role="application" aria-label="Editor host" onKeyDown={onParentKeyDown}>
        <PlatformCodeEditorWorkspace
          files={[]}
          editor={<textarea aria-label="Editable source" defaultValue={"\n"} />}
        />
      </div>,
    );
    const editor = screen.getByLabelText("Editable source");
    const dispatchEditorKey = (key: "Backspace" | "Delete") => {
      const event = new KeyboardEvent("keydown", {
        key,
        code: key,
        bubbles: true,
        cancelable: true,
      });
      const stopImmediatePropagation = vi.spyOn(event, "stopImmediatePropagation");

      expect(editor.dispatchEvent(event)).toBe(true);
      expect(stopImmediatePropagation).not.toHaveBeenCalled();
    };

    dispatchEditorKey("Backspace");
    dispatchEditorKey("Delete");
    expect(onParentKeyDown).not.toHaveBeenCalled();
  });
});
