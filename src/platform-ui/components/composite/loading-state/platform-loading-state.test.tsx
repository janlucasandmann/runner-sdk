// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformLoadingState } from "./platform-loading-state.js";

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("PlatformLoadingState", () => {
  it("renders the shared dot loader beside its message", () => {
    vi.useFakeTimers();
    const { container } = render(
      <PlatformLoadingState message="Loading projects..." />,
    );

    const status = screen.getByRole("status", { name: "Loading projects..." });
    const dots = Array.from(
      container.querySelectorAll<HTMLElement>(".platform-loading-state__loader > span > span"),
    );
    const initialOpacities = dots.map((dot) => dot.style.opacity);

    expect(status.classList.contains("is-centered")).toBe(false);
    expect(screen.getByText("Loading projects...")).not.toBeNull();
    expect(dots).toHaveLength(9);

    act(() => vi.advanceTimersByTime(62));

    expect(dots.map((dot) => dot.style.opacity)).not.toEqual(initialOpacities);
  });

  it("supports a centered page-level presentation", () => {
    render(
      <PlatformLoadingState
        className="projects-loading-state"
        message="Loading projects..."
        centered
      />,
    );

    const status = screen.getByRole("status", { name: "Loading projects..." });
    expect(status.classList.contains("platform-loading-state")).toBe(true);
    expect(status.classList.contains("is-centered")).toBe(true);
    expect(status.classList.contains("projects-loading-state")).toBe(true);
  });
});
