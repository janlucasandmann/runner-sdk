// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { GitBranchPlus } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformVersionPublishControl } from "./platform-version-publish-control.js";

afterEach(cleanup);

describe("PlatformVersionPublishControl", () => {
  it("uses the central primary split selector and minimal popup", () => {
    const onOpenChange = vi.fn();
    const onPublish = vi.fn();
    const onCreateVersion = vi.fn();
    const { rerender } = render(
      <PlatformVersionPublishControl
        open={false}
        actions={[{
          id: "new-version",
          label: "Create new version",
          icon: GitBranchPlus,
          onClick: onCreateVersion,
        }]}
        onOpenChange={onOpenChange}
        onPublish={onPublish}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save and publish changes" }));
    expect(onPublish).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Version save options" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <PlatformVersionPublishControl
        open
        actions={[{
          id: "new-version",
          label: "Create new version",
          icon: GitBranchPlus,
          onClick: onCreateVersion,
        }]}
        onOpenChange={onOpenChange}
        onPublish={onPublish}
      />,
    );

    const menu = screen.getByRole("menu", { name: "Version save options" });
    expect(menu.closest(".platform-popup-surface")?.getAttribute("data-platform-popup-variant")).toBe("minimal");
    fireEvent.click(screen.getByRole("menuitem", { name: "Create new version" }));
    expect(onCreateVersion).toHaveBeenCalledTimes(1);
  });
});
