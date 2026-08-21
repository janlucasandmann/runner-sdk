// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PromptsOverviewPage } from "./index.js";

afterEach(cleanup);

describe("PromptsOverviewPage", () => {
  it("uses the canonical prompt icon for every prompt row", () => {
    const { container } = render(
      <PromptsOverviewPage
        rows={[{
          id: "prompt-1",
          name: "Release summary",
          description: "Summarize a release.",
          isActive: true,
          isCustom: true,
          creatorName: "Jane Doe",
          updatedLabel: "Today",
        }]}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Release summary")).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: "Creator" })).not.toBeNull();
    expect(
      container.querySelector(".resource-overview-identity__visual .lucide-message-square-text"),
    ).not.toBeNull();
  });

  it("renders the centralized empty state with a create action", () => {
    const onCreate = vi.fn();
    const { container } = render(
      <PromptsOverviewPage
        rows={[]}
        onOpen={vi.fn()}
        onCreate={onCreate}
        onEdit={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(container.querySelector(".platform-empty-state")).not.toBeNull();
    expect(screen.getByText("No prompts available.")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Create prompt" }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
