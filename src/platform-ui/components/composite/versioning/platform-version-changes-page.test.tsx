// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformVersionChangesPage } from "./platform-version-changes-page.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformVersionChangesPage", () => {
  it("renders prompt-style header spacing and centralized minimal selectors", () => {
    const onLeftVersionChange = vi.fn();
    const onRightVersionChange = vi.fn();
    const options = [
      { value: "version-2", label: "v2 | Current" },
      { value: "version-1", label: "v1 | Initial" },
    ];

    render(
      <PlatformVersionChangesPage
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
