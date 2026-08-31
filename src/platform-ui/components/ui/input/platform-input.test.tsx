// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformInput } from "./platform-input.js";

afterEach(() => cleanup());

describe("PlatformInput", () => {
  it("owns the shared text-input contract", () => {
    const onChange = vi.fn();
    render(
      <PlatformInput
        aria-label="Environment name"
        fullWidth
        invalid
        value="Default Fork"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Environment name" });
    expect(input.classList.contains("platform-input")).toBe(true);
    expect(input.classList.contains("is-full-width")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(input, { target: { value: "Research Fork" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
