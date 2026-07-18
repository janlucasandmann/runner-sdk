// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlatformDefaultPermissionSet } from "../../../platform-ui/pages/permissions/index.js";
import { TagDetailPage } from "./tag-detail-page.js";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fill: vi.fn(),
    rect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
  } as never);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(performance.now() + 300);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("TagDetailPage", () => {
  it("composes the shared detail shell and canonical Tag tabs", () => {
    const onTabChange = vi.fn();
    const { container } = render(
      <TagDetailPage
        header={<h1>Email</h1>}
        tabBarActions={<button type="button">Disconnect</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        sidebar={<div>Tag properties</div>}
        activeTab="general"
        onTabChange={onTabChange}
      >
        <div>Tag analytics</div>
      </TagDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "General",
      "Permissions",
      "Setup",
    ]);
    expect(screen.getByRole("button", { name: "Disconnect" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).not.toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Setup" }));
    expect(onTabChange).toHaveBeenCalledWith("setup");
  });

  it("renders the centralized permissions page on the permissions tab", () => {
    const { container } = render(
      <TagDetailPage
        header={<h1>Email</h1>}
        sidebar={<div>Tag properties</div>}
        activeTab="permissions"
        onTabChange={vi.fn()}
        permissions={{
          permissionSet: createPlatformDefaultPermissionSet("agent"),
          subjectType: "agent",
          onRingAccessChange: vi.fn(),
        }}
      >
        <div>Legacy permissions content</div>
      </TagDetailPage>,
    );

    expect(container.querySelectorAll("[data-platform-permissions-page='true']")).toHaveLength(1);
    expect(screen.queryByText("Legacy permissions content")).toBeNull();
  });
});
