// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PlatformStatusIndicator,
  PlatformStatusIndicatorStack,
} from "./platform-status-indicator.js";

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("PlatformStatusIndicator", () => {
  it("renders an accessible receipt with optional provider media", () => {
    render(<PlatformStatusIndicator title="GitHub connected" copy="octo-org" brand="github" />);

    expect(screen.getByRole("status")).not.toBeNull();
    expect(screen.getByText("GitHub connected")).not.toBeNull();
    expect(screen.getByText("octo-org")).not.toBeNull();
    expect(document.querySelector(".platform-status-indicator__logo")).not.toBeNull();
  });

  it("runs the shared dismissal transition before removing a receipt", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <PlatformStatusIndicator
        title="Batch job saved"
        copy="Kept on shelf in Batches."
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss Batch job saved" }));
    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByRole("status").classList.contains("is-exiting")).toBe(true);

    act(() => vi.advanceTimersByTime(180));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("filters dismissed stack items centrally", () => {
    render(
      <PlatformStatusIndicatorStack
        items={[
          { id: "github", title: "GitHub connected" },
          { id: "batch", title: "Batch job saved" },
        ]}
        dismissedIds={["github"]}
      />,
    );

    expect(screen.queryByText("GitHub connected")).toBeNull();
    expect(screen.getByText("Batch job saved")).not.toBeNull();
  });
});
