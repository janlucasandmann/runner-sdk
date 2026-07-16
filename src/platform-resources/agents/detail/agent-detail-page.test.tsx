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
  it("composes the shared detail shell and canonical agent tabs", () => {
    const { container } = render(
      <AgentDetailPage
        header={<h1>Atlas</h1>}
        tabBarActions={<button type="button">Versions</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        sidebar={<div>Agent model</div>}
        activeTab="general"
        onTabChange={vi.fn()}
      >
        <div>Agent instructions</div>
      </AgentDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "General",
      "Insights",
      "Evaluation",
      "Guardrails",
      "Permissions",
    ]);
    expect(screen.getByRole("button", { name: "Versions" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
  });

  it("renders the agent-owned permissions page for the permissions tab", () => {
    const { container } = render(
      <AgentDetailPage
        header={<h1>Atlas</h1>}
        tabBarActions={<button type="button">Versions</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        sidebar={<div>Agent model</div>}
        activeTab="permissions"
        onTabChange={vi.fn()}
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
  });
});
