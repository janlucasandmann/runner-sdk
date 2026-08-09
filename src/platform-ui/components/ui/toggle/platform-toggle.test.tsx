// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformToggle } from "./platform-toggle.js";

afterEach(cleanup);

describe("PlatformToggle", () => {
  it("exposes controlled switch semantics", () => {
    const { rerender } = render(
      <PlatformToggle aria-label="Internet access" checked />,
    );

    const toggle = screen.getByRole("switch", { name: "Internet access" });
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(toggle.classList.contains("is-checked")).toBe(true);

    rerender(
      <PlatformToggle aria-label="Internet access" checked={false} />,
    );

    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(toggle.classList.contains("is-checked")).toBe(false);
  });

  it("requests the inverse checked state when activated", () => {
    const onCheckedChange = vi.fn();
    render(
      <PlatformToggle
        aria-label="Internet access"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );

    fireEvent.click(screen.getByRole("switch", { name: "Internet access" }));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not request changes while disabled", () => {
    const onCheckedChange = vi.fn();
    render(
      <PlatformToggle
        aria-label="Internet access"
        checked
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );

    fireEvent.click(screen.getByRole("switch", { name: "Internet access" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
