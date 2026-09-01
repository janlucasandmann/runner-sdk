// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformInfoTooltip } from "./platform-info-tooltip.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PlatformInfoTooltip", () => {
  it("renders the optional title and action around the required explanatory text", () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render(
      <PlatformInfoTooltip
        ariaLabel="About iteration budget"
        title="Iteration budget"
        description="Maximum number of cycles."
        action={{
          label: "Review with AI",
          icon: <span data-testid="action-icon">→</span>,
          onSelect,
        }}
      />,
    );

    const trigger = screen.getByRole("button", { name: "About iteration budget" });
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.mouseEnter(trigger);
    const tooltip = screen.getByRole("dialog", { name: "About iteration budget" });
    expect(tooltip.textContent).toContain("Iteration budget");
    expect(tooltip.textContent).toContain("Maximum number of cycles.");
    expect(screen.getByRole("button", { name: "Review with AI" })).toBeTruthy();
    expect(screen.getByTestId("action-icon")).toBeTruthy();
    expect(trigger.getAttribute("aria-controls")).toBe(tooltip.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(tooltip.getAttribute("data-platform-popup-placement")).toBe("bottom-center");

    fireEvent.click(screen.getByRole("button", { name: "Review with AI" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.mouseLeave(trigger);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports keyboard focus and Escape dismissal", () => {
    render(
      <PlatformInfoTooltip ariaLabel="About passing score" description="Minimum verified score." />,
    );

    const trigger = screen.getByRole("button", { name: "About passing score" });
    fireEvent.focus(trigger);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toContain("Minimum verified score.");
    expect(tooltip.querySelector(".platform-info-tooltip__title")).toBeNull();
    expect(tooltip.querySelector(".platform-info-tooltip__action")).toBeNull();
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
