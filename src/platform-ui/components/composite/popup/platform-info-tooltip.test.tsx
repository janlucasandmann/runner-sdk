// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformInfoTooltip } from "./platform-info-tooltip.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PlatformInfoTooltip", () => {
  it("opens the centralized explanatory surface on hover and keeps runtime guidance separate", () => {
    vi.useFakeTimers();
    render(
      <PlatformInfoTooltip
        ariaLabel="About iteration budget"
        title="Iteration budget"
        description="Maximum number of cycles."
        runtime="Checked before the next cycle starts."
      />,
    );

    const trigger = screen.getByRole("button", { name: "About iteration budget" });
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.mouseEnter(trigger);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toContain("Iteration budget");
    expect(tooltip.textContent).toContain("Maximum number of cycles.");
    expect(tooltip.textContent).toContain("At runtime");
    expect(tooltip.textContent).toContain("Checked before the next cycle starts.");
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);

    fireEvent.mouseLeave(trigger);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("supports keyboard focus and Escape dismissal", () => {
    render(
      <PlatformInfoTooltip ariaLabel="About passing score" description="Minimum verified score." />,
    );

    const trigger = screen.getByRole("button", { name: "About passing score" });
    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip").textContent).toContain("Minimum verified score.");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
