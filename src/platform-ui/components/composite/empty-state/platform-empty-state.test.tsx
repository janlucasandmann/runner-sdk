// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { KeyRound } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";
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
});
