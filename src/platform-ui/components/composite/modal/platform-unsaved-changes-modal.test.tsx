// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PlatformUnsavedChangesModal } from "./platform-unsaved-changes-modal.js";

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

describe("PlatformUnsavedChangesModal", () => {
  it("keeps or discards changes through explicit actions", () => {
    const onStay = vi.fn();
    const onLeave = vi.fn();

    render(
      <PlatformUnsavedChangesModal
        open
        description="Atlas has unsaved changes."
        onStay={onStay}
        onLeave={onLeave}
      />,
    );

    expect(screen.getByRole("alertdialog")).not.toBeNull();
    expect(screen.getByText("Atlas has unsaved changes.")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Stay on page" }));
    expect(onStay).toHaveBeenCalledTimes(1);
    expect(onLeave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Leave without saving" }));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("treats escape as staying on the page", () => {
    const onStay = vi.fn();

    render(
      <PlatformUnsavedChangesModal
        open
        onStay={onStay}
        onLeave={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onStay).toHaveBeenCalledTimes(1);
  });
});
