// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PlatformConfirmationModal } from "./platform-confirmation-modal.js";

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

describe("PlatformConfirmationModal", () => {
  it("provides a reusable cancel and confirm flow", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <PlatformConfirmationModal
        open
        title="Delete Agent?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        tone="destructive"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const dialog = screen.getByRole("alertdialog");
    expect(dialog.classList.contains("platform-confirmation-modal")).toBe(true);
    expect(screen.getByText("This action cannot be undone.")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
  });

  it("keeps the dialog open and exposes mutation failures", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Agent deletion failed."));

    render(
      <PlatformConfirmationModal
        open
        title="Delete Agent?"
        confirmLabel="Delete"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Agent deletion failed.");
    expect(screen.getByRole("alertdialog")).not.toBeNull();
    expect((screen.getByRole("button", { name: "Delete" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it("treats Escape as cancellation", () => {
    const onCancel = vi.fn();

    render(
      <PlatformConfirmationModal open title="Continue?" onCancel={onCancel} onConfirm={vi.fn()} />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
