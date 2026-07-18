// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectDetailPage } from "./project-detail-page.js";

afterEach(cleanup);

describe("ProjectDetailPage", () => {
  it("composes the shared detail shell and canonical project tabs", () => {
    const onTabChange = vi.fn();
    const { container } = render(
      <ProjectDetailPage
        header={<h1>Launch Project</h1>}
        headerActions={<button type="button">Mission Control</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        sidebar={<div>Project properties</div>}
        activeTab="general"
        onTabChange={onTabChange}
      >
        <div>Project analytics</div>
      </ProjectDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-tab-bar='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "General",
      "Resources",
      "Strategy",
      "Settings",
    ]);

    fireEvent.click(screen.getByRole("tab", { name: "Strategy" }));
    expect(onTabChange).toHaveBeenCalledWith("strategy");
    expect(screen.getByRole("button", { name: "Mission Control" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).not.toBeNull();
  });

  it("hides Settings when the viewer cannot access project settings", () => {
    render(
      <ProjectDetailPage
        header={<h1>Launch Project</h1>}
        sidebar={<div>Project properties</div>}
        activeTab="general"
        onTabChange={vi.fn()}
        showSettings={false}
      >
        <div>Project analytics</div>
      </ProjectDetailPage>,
    );

    expect(screen.queryByRole("tab", { name: "Settings" })).toBeNull();
  });
});
