// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ResourceDetailPage } from "./resource-detail-page.js";

afterEach(cleanup);

describe("ResourceDetailPage", () => {
  it("renders the canonical detail layout without owning back navigation", () => {
    const { container } = render(
      <ResourceDetailPage
        title="Agent Atlas"
        tabs={[{ id: "general", label: "General" }, { id: "insights", label: "Insights" }]}
        activeTab="general"
        onTabChange={vi.fn()}
        tabBarActions={<button type="button">Versions</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        sidebar={<div>About Atlas</div>}
        sidebarAriaLabel="Agent settings"
      >
        <div>Instructions</div>
      </ResourceDetailPage>,
    );

    const page = container.querySelector("[data-resource-detail-page='true']");
    expect(page).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Agent Atlas", level: 1 })).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Resource sections" })).not.toBeNull();
    expect(screen.getByRole("tabpanel", { name: "General" })).not.toBeNull();
    expect(screen.getByRole("complementary", { name: "Agent settings" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Versions" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: /back/i })).toBeNull();
    expect(Array.from(page?.children || []).map((child) => child.className.split(" ")[0])).toEqual([
      "resource-detail-page__header",
      "platform-detail-tab-bar",
      "resource-detail-page__content",
      "platform-detail-sidebar",
    ]);
    const tabBarActions = container.querySelector(".resource-detail-page__tab-bar-actions");
    expect(Array.from(tabBarActions?.children || []).map((child) => child.textContent)).toEqual([
      "Versions",
      "Toggle sidebar",
    ]);
  });

  it("supports detail screens without a tab bar", () => {
    const { container } = render(
      <ResourceDetailPage
        header={<h1>Ticket 010</h1>}
        sidebar={<div>Ticket properties</div>}
      >
        <div>Ticket description</div>
      </ResourceDetailPage>,
    );

    const page = container.querySelector("[data-resource-detail-page='true']");
    expect(page?.classList.contains("is-tabless")).toBe(true);
    expect(container.querySelector("[data-platform-detail-tab-bar='true']")).toBeNull();
    expect(container.querySelector(".resource-detail-page__content")?.getAttribute("role")).toBeNull();
    expect(screen.getByText("Ticket description")).not.toBeNull();
    expect(screen.getByText("Ticket properties")).not.toBeNull();
  });

  it("temporarily collapses the sidebar on designated tabs without replacing its preference", () => {
    const renderPage = (activeTab: "general" | "code", sidebarCollapsed = false) => (
      <ResourceDetailPage
        title="Webhook Function"
        tabs={[{ id: "general", label: "General" }, { id: "code", label: "Code" }]}
        activeTab={activeTab}
        onTabChange={vi.fn()}
        sidebarToggle={<button type="button">Toggle properties</button>}
        sidebar={<div>Function properties</div>}
        sidebarCollapsed={sidebarCollapsed}
        sidebarAutoCollapseTabs={["code"]}
      >
        <div>{activeTab} content</div>
      </ResourceDetailPage>
    );
    const { container, rerender } = render(renderPage("general"));

    expect(screen.getByRole("complementary").getAttribute("data-collapsed")).toBe("false");
    expect(screen.getByRole("button", { name: "Toggle properties" })).not.toBeNull();

    rerender(renderPage("code"));
    expect(screen.getByRole("complementary", { hidden: true }).getAttribute("data-collapsed")).toBe("true");
    expect(container.querySelector(".resource-detail-page")?.classList.contains("is-sidebar-auto-collapsed")).toBe(true);
    expect(screen.queryByRole("button", { name: "Toggle properties" })).toBeNull();

    rerender(renderPage("general"));
    expect(screen.getByRole("complementary").getAttribute("data-collapsed")).toBe("false");
    expect(screen.getByRole("button", { name: "Toggle properties" })).not.toBeNull();

    rerender(renderPage("code", true));
    rerender(renderPage("general", true));
    expect(screen.getByRole("complementary", { hidden: true }).getAttribute("data-collapsed")).toBe("true");
  });
});
