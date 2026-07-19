// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PlatformVersionSaveDialog } from "./platform-version-save-dialog.js";

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(performance.now());
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformVersionSaveDialog", () => {
  it("reviews changes and submits the selected version destination", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <PlatformVersionSaveDialog
        open
        currentVersion={2}
        nextVersion={3}
        currentDescription="Existing description"
        changes={[
          { id: "workflow", label: "workflow.json", content: <div>Workflow diff</div> },
          { id: "nodes", label: "nodes.py", content: <div>Node diff</div> },
        ]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Review changes" })).not.toBeNull();
    expect(screen.queryByText("Choose how to save these changes before publishing.")).toBeNull();
    expect(screen.queryByText("Save destination")).toBeNull();
    const dialogHeader = document.querySelector('[data-platform-modal-part="header"]');
    expect(dialogHeader?.querySelector('[role="radiogroup"]')).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Create new version" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("Workflow diff")).not.toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Select changed file" }));
    const fileMenu = screen.getByRole("menu", { name: "Select changed file" });
    expect(fileMenu.classList.contains("is-minimal")).toBe(true);
    fireEvent.click(screen.getByRole("menuitemradio", { name: "nodes.py" }));
    expect(screen.getByText("Node diff")).not.toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Current version" }));
    const description = screen.getByRole("textbox", {
      name: "Version description (optional)",
    }) as HTMLTextAreaElement;
    expect(
      document.querySelector(".platform-version-save-dialog__description-editor")
        ?.classList.contains("is-minimalistic-ui"),
    ).toBe(true);
    expect(description.value).toBe("Existing description");
    fireEvent.change(description, { target: { value: "Updated production version" } });
    fireEvent.click(screen.getByRole("radio", { name: "Create new version" }));
    expect(description.value).toBe("");
    fireEvent.change(description, { target: { value: "New version draft" } });
    fireEvent.click(screen.getByRole("radio", { name: "Current version" }));
    expect(description.value).toBe("Updated production version");
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        mode: "current",
        description: "Updated production version",
      });
    });
  });

  it("requires a new version when no current version exists", () => {
    render(
      <PlatformVersionSaveDialog
        open
        currentVersion={null}
        nextVersion={0}
        initialMode="current"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const currentOption = screen.getByRole("radio", { name: "Current version" });
    expect((currentOption as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("radio", { name: "Create new version" }).getAttribute("aria-checked")).toBe("true");
  });

  it("hydrates version metadata that arrives after opening without replacing typed drafts", () => {
    const { rerender } = render(
      <PlatformVersionSaveDialog
        open
        currentVersion={2}
        nextVersion={3}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const description = screen.getByRole("textbox", {
      name: "Version description (optional)",
    }) as HTMLTextAreaElement;
    fireEvent.change(description, { target: { value: "Unsaved new version description" } });

    rerender(
      <PlatformVersionSaveDialog
        open
        currentVersion={2}
        nextVersion={3}
        currentDescription="Loaded current version description"
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Current version" }));
    expect(description.value).toBe("Loaded current version description");
    fireEvent.click(screen.getByRole("radio", { name: "Create new version" }));
    expect(description.value).toBe("Unsaved new version description");
  });

  it("keeps the dialog open and shows mutation failures", async () => {
    render(
      <PlatformVersionSaveDialog
        open
        currentVersion={0}
        nextVersion={1}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockRejectedValue(new Error("Publish failed."))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Publish failed.");
    expect(screen.getByRole("dialog", { name: "Review changes" })).not.toBeNull();
  });
});
