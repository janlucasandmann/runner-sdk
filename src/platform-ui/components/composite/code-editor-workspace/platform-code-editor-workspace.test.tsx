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

  it("supports sidebar actions and nested file disclosures", () => {
    render(
      <PlatformCodeEditorWorkspace
        files={[
          {
            id: "src",
            label: "src",
            leading: <span>Open</span>,
            depth: 2,
          },
        ]}
        sidebarActions={<button type="button">Add file</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Add file" })).not.toBeNull();
    const file = screen.getByRole("button", { name: "src" });
    expect(file.style.paddingInlineStart).toBe("46px");
    expect(screen.getByText("Open")).not.toBeNull();
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
