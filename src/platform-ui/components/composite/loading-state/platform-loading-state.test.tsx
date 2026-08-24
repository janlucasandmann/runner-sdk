// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PlatformLoadingState } from "./platform-loading-state.js";

afterEach(() => {
  cleanup();
});

describe("PlatformLoadingState", () => {
  it("renders only the shared white spinner while retaining an accessible label", () => {
    const { container } = render(<PlatformLoadingState message="Loading projects..." />);

    const status = screen.getByRole("status", { name: "Loading projects..." });
    const spinner = container.querySelector<HTMLImageElement>(".platform-loading-state__spinner");

    expect(status.classList.contains("is-centered")).toBe(false);
    expect(screen.queryByText("Loading projects...")).toBeNull();
    expect(spinner?.getAttribute("src")).toBe("/img/spinner.svg");
    expect(spinner?.getAttribute("width")).toBe("24");
    expect(spinner?.getAttribute("height")).toBe("24");
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

  it("can render inline without duplicating the loading implementation", () => {
    render(<PlatformLoadingState as="span" message="Loading image..." />);

    const status = screen.getByRole("status", { name: "Loading image..." });
    expect(status.tagName).toBe("SPAN");
    expect(status.classList.contains("platform-loading-state")).toBe(true);
  });
});
