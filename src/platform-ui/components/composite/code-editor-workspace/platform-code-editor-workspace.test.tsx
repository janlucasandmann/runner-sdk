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

  it("renders footer actions through the shared button primitives", () => {
    const onRevert = vi.fn();
    const onSave = vi.fn();
    render(
      <PlatformCodeEditorWorkspace
        files={[]}
        status="Ready"
        actions={[
          {
            id: "revert",
            label: "Revert",
            onClick: onRevert,
          },
          {
            id: "save",
            label: "Save",
            variant: "primary",
            onClick: onSave,
          },
        ]}
      />,
    );

    const revertButton = screen.getByRole("button", { name: "Revert" });
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(revertButton.getAttribute("data-platform-button-variant")).toBe("secondary");
    expect(saveButton.getAttribute("data-platform-button-variant")).toBe("primary");

    fireEvent.click(revertButton);
    fireEvent.click(saveButton);
    expect(onRevert).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
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
});
