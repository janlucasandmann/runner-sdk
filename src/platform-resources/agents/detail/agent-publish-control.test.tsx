// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Bookmark, GitBranchPlus } from "lucide-react";
import { AgentPublishControl } from "./agent-publish-control.js";

afterEach(cleanup);

describe("AgentPublishControl", () => {
  it("uses the central primary split-action button selector", () => {
    const { container } = render(
      <AgentPublishControl
        open={false}
        actions={[]}
        onOpenChange={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Save and publish agent changes" }).dataset.platformButtonVariant).toBe("primary");
    expect(screen.getByRole("button", { name: "Version save options" }).dataset.platformButtonVariant).toBe("primary");
    expect(container.querySelector(".platform-button-selector.is-mode-split-action")).not.toBeNull();
  });

  it("delegates publish, menu, and version action behavior to the host", () => {
    const onOpenChange = vi.fn();
    const onPublish = vi.fn();
    const onSaveVersion = vi.fn();
    const { rerender } = render(
      <AgentPublishControl
        open={false}
        actions={[{
          id: "save-version",
          label: "Save to new Version",
          icon: GitBranchPlus,
          onClick: onSaveVersion,
        }]}
        onOpenChange={onOpenChange}
        onPublish={onPublish}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save and publish agent changes" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onPublish).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Version save options" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <AgentPublishControl
        open
        actions={[{
          id: "save-version",
          label: "Save to new Version",
          icon: GitBranchPlus,
          onClick: onSaveVersion,
        }]}
        onOpenChange={onOpenChange}
        onPublish={onPublish}
      />,
    );
    expect(screen.getByRole("menu", { name: "Version save options" }).classList.contains("is-portaled")).toBe(true);
    fireEvent.click(screen.getByRole("menuitem", { name: "Save to new Version" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onSaveVersion).toHaveBeenCalledTimes(1);
  });

  it("supports the shared agent save-changes presentation", () => {
    render(
      <AgentPublishControl
        open={false}
        actions={[]}
        label="Save Changes"
        leading={<Bookmark data-testid="save-changes-icon" />}
        publishAriaLabel="Save agent changes"
        onOpenChange={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Save agent changes" }).textContent).toContain("Save Changes");
    expect(screen.getByTestId("save-changes-icon")).not.toBeNull();
  });
});
