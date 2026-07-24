// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { createPlatformDefaultPermissionSet } from "../../../platform-ui/pages/permissions/index.js";
import { AgentDetailPage } from "./agent-detail-page.js";

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

describe("AgentDetailPage", () => {
  it("composes the shared detail shell without local header navigation", () => {
    const { container } = render(
      <AgentDetailPage
        sidebar={<div>Agent model</div>}
        activeTab="general"
      >
        <div>Agent instructions</div>
      </AgentDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(0);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(
      container
        .querySelector("[data-platform-detail-sidebar='true']")
        ?.classList.contains("playground-ticket-detail-sidebar"),
    ).toBe(true);
    expect(container.querySelector(".resource-detail-page__header")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByRole("button", { name: "Toggle sidebar" })).toBeNull();
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
  });

  it("renders the agent-owned permissions page for the permissions tab", () => {
    const { container } = render(
      <AgentDetailPage
        sidebar={<div>Agent model</div>}
        activeTab="permissions"
        permissions={{
          permissionSet: createPlatformDefaultPermissionSet("agent"),
          onPermissionSetChange: vi.fn(),
        }}
      >
        <div>Legacy permissions content</div>
      </AgentDetailPage>,
    );

    expect(container.querySelectorAll("[data-platform-permissions-page='true']")).toHaveLength(1);
    expect(screen.queryByText("Legacy permissions content")).toBeNull();
    expect(screen.queryByRole("tab", { name: "Permissions" })).toBeNull();
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(0);
  });
});
