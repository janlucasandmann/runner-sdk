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
  it("uses the centralized Settings page and standard details sidebar", () => {
    const { container } = render(
      <AgentDetailPage
        sidebar={<div>Legacy agent sidebar</div>}
        activeTab="settings"
        settings={{
          className: "playground-agent-resource-settings",
          identity: {
            icon: <span>AG</span>,
            title: "Research Agent",
            description: "Researches product strategy",
          },
          details: {
            variant: "standard",
            customAttributes: [{ id: "created", label: "Created", value: "Aug 24" }],
            updatedAt: "2026-08-25T09:30:00.000Z",
            creator: { value: "creator-1", name: "Creator Name" },
            owner: { value: "owner-1", name: "Owner Name" },
            scope: false,
            primaryActions: [{ id: "start", label: "Start a Thread", onSelect: vi.fn() }],
          },
          access: <section>Agent access</section>,
          detailsSidebarAriaLabel: "Agent settings",
        }}
      >
        <div>Legacy settings content</div>
      </AgentDetailPage>,
    );

    const settingsPage = container.querySelector(
      "[data-platform-resource-settings-page='true']",
    );
    expect(settingsPage).not.toBeNull();
    expect(settingsPage?.classList.contains("playground-agent-resource-settings")).toBe(true);
    expect(
      container.querySelector("[data-platform-resource-settings-sidebar-content='true']"),
    ).not.toBeNull();
    expect(screen.getByRole("complementary", { name: "Agent settings" })).not.toBeNull();
    expect(screen.getByText("Created")).not.toBeNull();
    expect(screen.getByText("Updated")).not.toBeNull();
    expect(screen.getByText("Creator")).not.toBeNull();
    expect(screen.getByText("Owner")).not.toBeNull();
    expect(screen.queryByText("Legacy agent sidebar")).toBeNull();
    expect(screen.queryByText("Legacy settings content")).toBeNull();
  });

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
