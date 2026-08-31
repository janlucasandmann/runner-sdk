// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformVersionChangesModal } from "./platform-version-changes-modal.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformVersionChangesModal", () => {
  it("renders the large centralized modal with minimal version selectors", () => {
    const onLeftVersionChange = vi.fn();
    const onRightVersionChange = vi.fn();
    const options = [
      { value: "version-2", label: "v2 | Current" },
      { value: "version-1", label: "v1 | Initial" },
    ];

    render(
      <PlatformVersionChangesModal
        open
        onClose={vi.fn()}
        title="Changes"
        subtitle="Compare saved prompt versions."
        leftSelector={{
          value: "version-1",
          options,
          ariaLabel: "Select base version",
          onValueChange: onLeftVersionChange,
        }}
        rightSelector={{
          value: "version-2",
          options,
          ariaLabel: "Select target version",
          onValueChange: onRightVersionChange,
        }}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Changes" });
    expect(dialog.classList.contains("is-size-full")).toBe(true);
    expect(screen.getByRole("heading", { name: "Changes" })).not.toBeNull();
    expect(screen.getByText("Compare saved prompt versions.")).not.toBeNull();
    expect(screen.getByText("Versions")).not.toBeNull();
    expect(
      screen.getByLabelText("Select base version").closest(".platform-selector"),
    ).not.toBeNull();
    expect(
      screen.getByLabelText("Select target version").closest(".platform-selector"),
    ).not.toBeNull();

    fireEvent.click(screen.getByLabelText("Select base version"));
    fireEvent.click(screen.getByRole("option", { name: "v2 | Current" }));
    expect(onLeftVersionChange).toHaveBeenCalledWith("version-2");
    expect(onRightVersionChange).not.toHaveBeenCalled();
  });
});
