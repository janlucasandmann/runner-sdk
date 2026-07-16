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
});
