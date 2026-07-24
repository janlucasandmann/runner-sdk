// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { PlatformVersionSaveDialog } from "./platform-version-save-dialog.js";

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(performance.now());
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: () => document.querySelector("[contenteditable='true']") || document.body,
  });
  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value: () => [],
  });
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value: () => ({ left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformVersionSaveDialog", () => {
  it("reviews changes and submits the selected version destination", async () => {
    const user = userEvent.setup({ delay: 1 });
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
    let description = screen.getByRole("textbox", {
      name: "Version description (optional)",
    });
    expect(
      document.querySelector(".platform-version-save-dialog__description-editor")
        ?.classList.contains("is-minimalistic-ui"),
    ).toBe(true);
    expect(description.textContent).toBe("Existing description");
    await user.click(description);
    await user.keyboard("{Control>}a{/Control}");
    await user.paste("Updated production version");
    fireEvent.click(screen.getByRole("radio", { name: "Create new version" }));
    description = screen.getByRole("textbox", { name: "Version description (optional)" });
    expect(description.textContent).toBe("");
    await user.click(description);
    await user.paste("New version draft");
    fireEvent.click(screen.getByRole("radio", { name: "Current version" }));
    description = screen.getByRole("textbox", { name: "Version description (optional)" });
    expect(description.textContent).toBe("Updated production version");
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

  it("hydrates version metadata that arrives after opening without replacing typed drafts", async () => {
    const user = userEvent.setup({ delay: 1 });
    const { rerender } = render(
      <PlatformVersionSaveDialog
        open
        currentVersion={2}
        nextVersion={3}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    let description = screen.getByRole("textbox", {
      name: "Version description (optional)",
    });
    await user.click(description);
    await user.paste("Unsaved new version description");

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
    description = screen.getByRole("textbox", { name: "Version description (optional)" });
    expect(description.textContent).toBe("Loaded current version description");
    fireEvent.click(screen.getByRole("radio", { name: "Create new version" }));
    description = screen.getByRole("textbox", { name: "Version description (optional)" });
    expect(description.textContent).toBe("Unsaved new version description");
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
