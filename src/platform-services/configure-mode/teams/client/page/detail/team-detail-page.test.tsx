// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TeamDetailPage } from "./team-detail-page.js";

afterEach(cleanup);

describe("TeamDetailPage", () => {
  it("composes the shared detail shell, canonical tabs, and sidebar", () => {
    const { container } = render(
      <TeamDetailPage
        header={<h1>Platform Team</h1>}
        sidebarToggle={<button type="button">Toggle team sidebar</button>}
        sidebar={<div>Team owner</div>}
        activeTab="members"
        onTabChange={vi.fn()}
      >
        <div>Team members table</div>
      </TeamDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Members",
      "Resources",
      "Roles",
    ]);
    expect(screen.getByRole("button", { name: "Toggle team sidebar" })).not.toBeNull();
    expect(screen.getByText("Team members table")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
  });

  it("collapses the shared sidebar without removing team content", () => {
    const { container } = render(
      <TeamDetailPage
        header={<h1>Platform Team</h1>}
        sidebar={<div>Team owner</div>}
        activeTab="resources"
        onTabChange={vi.fn()}
        sidebarCollapsed
      >
        <div>Shared resources</div>
      </TeamDetailPage>,
    );

    expect(container.querySelector(".resource-detail-page")?.classList.contains("is-sidebar-collapsed")).toBe(true);
    expect(screen.getByText("Shared resources")).not.toBeNull();
  });

  it.each(["resources", "roles"] as const)(
    "temporarily collapses the sidebar on %s without changing the saved preference",
    (activeTab) => {
      const { container, rerender } = render(
        <TeamDetailPage
          header={<h1>Platform Team</h1>}
          sidebarToggle={<button type="button">Toggle team sidebar</button>}
          sidebar={<div>Team owner</div>}
          activeTab={activeTab}
          onTabChange={vi.fn()}
        >
          <div>Team section</div>
        </TeamDetailPage>,
      );

      expect(container.querySelector(".resource-detail-page")?.classList.contains("is-sidebar-auto-collapsed")).toBe(true);
      expect(screen.queryByRole("button", { name: "Toggle team sidebar" })).toBeNull();

      rerender(
        <TeamDetailPage
          header={<h1>Platform Team</h1>}
          sidebarToggle={<button type="button">Toggle team sidebar</button>}
          sidebar={<div>Team owner</div>}
          activeTab="members"
          onTabChange={vi.fn()}
        >
          <div>Team members</div>
        </TeamDetailPage>,
      );

      expect(container.querySelector(".resource-detail-page")?.classList.contains("is-sidebar-collapsed")).toBe(false);
      expect(screen.getByRole("button", { name: "Toggle team sidebar" })).not.toBeNull();
    },
  );

  it("portals resource actions into the app header target", async () => {
    const appHeaderTarget = document.createElement("div");
    appHeaderTarget.id = "team-detail-test-actions";
    document.body.appendChild(appHeaderTarget);

    render(
      <TeamDetailPage
        header={<h1>Platform Team</h1>}
        appHeaderActions={<button type="button">Add Resource</button>}
        appHeaderActionsPortalId={appHeaderTarget.id}
        sidebar={<div>Team owner</div>}
        activeTab="resources"
        onTabChange={vi.fn()}
      >
        <div>Shared resources</div>
      </TeamDetailPage>,
    );

    expect(await screen.findByRole("button", { name: "Add Resource" })).not.toBeNull();
    expect(appHeaderTarget.textContent).toContain("Add Resource");
    appHeaderTarget.remove();
  });
});
