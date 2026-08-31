// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiKeyCreateDialog, ApiKeyRevealDialog } from "./api-key-management-dialogs.js";

beforeEach(() => {
  vi.stubGlobal("scrollBy", vi.fn());
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
    value: () => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 20,
      width: 0,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("API key management dialogs", () => {
  it("submits the selected scope through the typed create contract", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<ApiKeyCreateDialog open submitting={false} onClose={vi.fn()} onSubmit={onSubmit} />);

    const nameInput = screen.getByRole("searchbox", { name: "API key name" });
    const dialog = screen.getByRole("dialog");

    expect(dialog.classList.contains("platform-api-key-create-modal")).toBe(true);
    expect(dialog.querySelector(".platform-api-key-create-modal__icon")).toBeTruthy();
    expect(nameInput.closest(".platform-modal-header.is-search")).toBeTruthy();
    expect(dialog.querySelector(".platform-api-key-create-modal__body")).toBeTruthy();
    expect(dialog.querySelector(".platform-api-key-create-modal__footer")).toBeTruthy();

    const descriptionEditor = screen.getByRole("textbox", { name: "API key description" });
    const centralizedEditor = descriptionEditor.closest("[data-platform-instructions-editor='true']");
    expect(centralizedEditor?.getAttribute("data-platform-instructions-editor-variant")).toBe(
      "minimalistic-ui",
    );
    expect(dialog.querySelector(".platform-api-key-create-modal__description-editor textarea")).toBeNull();

    await user.type(nameInput, "Read-only integration");
    await user.click(descriptionEditor);
    await user.keyboard("Used by the reporting service");
    await user.click(screen.getByRole("button", { name: /Read Only/ }));
    await user.click(screen.getByRole("button", { name: "Create Key" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Read-only integration",
      description: "Used by the reporting service",
      permissions: ["projects:read", "threads:read", "security:read", "evidence:read", "billing:read"],
    });
  });

  it("uses the native create action for Command+Enter", () => {
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<ApiKeyCreateDialog open submitting={false} onClose={vi.fn()} onSubmit={onSubmit} />);

    const nameInput = screen.getByRole("searchbox", { name: "API key name" });
    fireEvent.keyDown(nameInput, { key: "Enter", metaKey: true });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(nameInput, { target: { value: "Automation" } });
    fireEvent.keyDown(nameInput, { key: "Enter", metaKey: true });

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Automation",
      description: "",
      permissions: ["*"],
    });
  });

  it("copies a revealed secret without exposing another command surface", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();

    render(
      <ApiKeyRevealDialog
        state={{
          id: "key_1",
          name: "Automation",
          key: "tb_secret",
          loading: false,
          error: "",
          copied: false,
        }}
        onClose={vi.fn()}
        onCopy={onCopy}
      />,
    );

    expect(screen.getByDisplayValue("tb_secret")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Copy API key" }));
    expect(onCopy).toHaveBeenCalledOnce();
  });
});
