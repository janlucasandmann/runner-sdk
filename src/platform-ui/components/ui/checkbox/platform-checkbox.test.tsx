// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformCheckbox } from "./platform-checkbox.js";

afterEach(cleanup);

describe("PlatformCheckbox", () => {
  it("exposes checked and indeterminate checkbox semantics", () => {
    const { rerender } = render(
      <PlatformCheckbox aria-label="Select row" checked />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Select row" });
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.classList.contains("is-selected")).toBe(true);

    rerender(
      <PlatformCheckbox
        aria-label="Select row"
        checked={false}
        indeterminate
      />,
    );

    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
    expect(checkbox.classList.contains("is-partial")).toBe(true);
  });

  it("retains native button interaction and disabled behavior", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <PlatformCheckbox aria-label="Select file" onClick={onClick} />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select file" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <PlatformCheckbox
        aria-label="Select file"
        onClick={onClick}
        disabled
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Select file" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
