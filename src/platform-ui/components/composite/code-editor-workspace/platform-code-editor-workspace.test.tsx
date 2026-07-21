// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformCodeEditorWorkspace } from "./platform-code-editor-workspace.js";

afterEach(cleanup);

describe("PlatformCodeEditorWorkspace", () => {
  it("owns file selection, editor content, and the status footer", () => {
    const onFileSelect = vi.fn();
    render(
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
    expect(screen.getByText("Unsaved changes")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "requirements.txt" }));
    expect(onFileSelect).toHaveBeenCalledWith("requirements.txt");
  });

  it("renders history controls through the shared icon-button primitive", () => {
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
    expect((redoButton as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(undoButton);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).not.toHaveBeenCalled();
  });

  it("places editor actions in the tab bar and keeps nested file disclosures", () => {
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
        tabBarActions={<button type="button">Add file</button>}
      />,
    );

    const addFileButton = screen.getByRole("button", { name: "Add file" });
    expect(
      addFileButton.closest(".platform-code-editor-tab-bar__actions"),
    ).not.toBeNull();
    expect(container.querySelector(".platform-code-editor-workspace__sidebar-heading")).toBeNull();
    expect(screen.queryByText("Explorer")).toBeNull();
    expect(screen.getByRole("searchbox", { name: "Search code files" })).not.toBeNull();
    const file = screen.getByRole("button", { name: "src" });
    expect(file.style.paddingInlineStart).toBe("");
    expect(screen.getByText("Open")).not.toBeNull();
  });

  it("filters code files through the shared search primitive", () => {
    render(
      <PlatformCodeEditorWorkspace
        files={[
          { id: "src/main.ts", label: "main.ts" },
          { id: "README.md", label: "README.md" },
        ]}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search code files" }), {
      target: { value: "main" },
    });

    expect(screen.getByRole("button", { name: "main.ts" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "README.md" })).toBeNull();
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

  it("opens explorer files as persistent editor tabs and keeps folders explorer-only", () => {
    const onFileSelect = vi.fn();
    render(
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

    expect(screen.getByRole("tab", { name: "main.ts" })).not.toBeNull();
    expect(screen.queryByRole("tab", { name: "src" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "styles.css" }));
    expect(screen.getByRole("tab", { name: "main.ts" })).not.toBeNull();
    expect(screen.getByRole("tab", { name: "styles.css" })).not.toBeNull();
    expect(onFileSelect).toHaveBeenLastCalledWith("styles.css");

    fireEvent.click(screen.getByRole("button", { name: "src" }));
    expect(screen.queryByRole("tab", { name: "src" })).toBeNull();
    expect(onFileSelect).toHaveBeenLastCalledWith("src");
  });

  it("moves to the adjacent file after closing the active tab", () => {
    const onFileSelect = vi.fn();
    const { rerender } = render(
      <PlatformCodeEditorWorkspace
        files={[
          { id: "main.ts", label: "main.ts" },
          { id: "styles.css", label: "styles.css" },
        ]}
        activeFileId="main.ts"
        onFileSelect={onFileSelect}
        editor={<textarea aria-label="Source code" />}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "styles.css" }));
    rerender(
      <PlatformCodeEditorWorkspace
        files={[
          { id: "main.ts", label: "main.ts" },
          { id: "styles.css", label: "styles.css" },
        ]}
        activeFileId="styles.css"
        onFileSelect={onFileSelect}
        editor={<textarea aria-label="Source code" />}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close styles.css" }));
    expect(screen.queryByRole("tab", { name: "styles.css" })).toBeNull();
    expect(onFileSelect).toHaveBeenLastCalledWith("main.ts");
  });

  it("supports VS Code-style keyboard navigation, middle-click close, and dirty markers", () => {
    const onFileSelect = vi.fn();
    const { container } = render(
      <PlatformCodeEditorWorkspace
        files={[
          { id: "main.ts", label: "main.ts", dirty: true },
          { id: "styles.css", label: "styles.css" },
        ]}
        defaultOpenFileIds={["styles.css"]}
        activeFileId="main.ts"
        onFileSelect={onFileSelect}
        editor={<textarea aria-label="Source code" />}
      />,
    );

    const mainTab = screen.getByRole("tab", { name: "main.ts" });
    fireEvent.keyDown(mainTab, { key: "ArrowRight" });
    expect(onFileSelect).toHaveBeenLastCalledWith("styles.css");
    expect(
      container.querySelector(".platform-code-editor-tab-bar__item.is-dirty"),
    ).not.toBeNull();

    const stylesTabItem = screen
      .getByRole("tab", { name: "styles.css" })
      .closest(".platform-code-editor-tab-bar__item");
    expect(stylesTabItem).not.toBeNull();
    fireEvent(
      stylesTabItem as Element,
      new MouseEvent("auxclick", { bubbles: true, button: 1 }),
    );
    expect(screen.queryByRole("tab", { name: "styles.css" })).toBeNull();
  });

  it("centers the shared loading indicator while files are loading", () => {
    render(
      <PlatformCodeEditorWorkspace
        files={[{ id: "main.ts", label: "main.ts" }]}
        isLoadingFiles
        loadingFilesMessage="Loading source files..."
      />,
    );

    expect(
      screen.getByRole("status", { name: "Loading source files..." }),
    ).not.toBeNull();
    expect(screen.queryByRole("button", { name: "main.ts" })).toBeNull();
    expect(
      (screen.getByRole("searchbox", { name: "Search code files" }) as HTMLInputElement)
        .disabled,
    ).toBe(true);
  });

  it("can omit the footer for embedded editor surfaces", () => {
    const { container } = render(<PlatformCodeEditorWorkspace files={[]} showFooter={false} />);

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
