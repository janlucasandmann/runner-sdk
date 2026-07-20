// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { KeyRound, Plus } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformEmptyState } from "./platform-empty-state.js";

afterEach(cleanup);

describe("PlatformEmptyState", () => {
  it("renders the shared icon, title, and description composition", () => {
    const { container } = render(
      <PlatformEmptyState
        icon={KeyRound}
        title="No API keys yet"
        description="Create an API key to authenticate requests."
      />,
    );

    expect(container.querySelector(".platform-empty-state")).not.toBeNull();
    expect(container.querySelector(".lucide-key-round")).not.toBeNull();
    expect(screen.getByText("No API keys yet")).not.toBeNull();
    expect(screen.getByText("Create an API key to authenticate requests.")).not.toBeNull();
  });

  it("renders and invokes an optional centralized primary action", () => {
    const onClick = vi.fn();
    const { container } = render(
      <PlatformEmptyState
        icon={KeyRound}
        title="No API keys yet"
        description="Create an API key to authenticate requests."
        primaryAction={{
          label: "Create API key",
          icon: Plus,
          onClick,
        }}
      />,
    );

    const action = screen.getByRole("button", { name: "Create API key" });
    expect(action.classList.contains("is-primary")).toBe(true);
    expect(container.querySelector(".platform-empty-state__primary-action .lucide-plus")).not.toBeNull();
    fireEvent.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
