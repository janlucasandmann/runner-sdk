// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DevelopServerDetailPage } from "./develop-server-detail-page.js";

afterEach(cleanup);

describe("DevelopServerDetailPage", () => {
  it("uses the shared resource detail shell for source-backed services", () => {
    const onTabChange = vi.fn();
    const { container } = render(
      <DevelopServerDetailPage
        header={<h1>Customer Portal</h1>}
        sidebarToggle={<button type="button">Toggle properties</button>}
        sidebar={<div>Service URL</div>}
        activeTab="usage"
        onTabChange={onTabChange}
        sidebarAriaLabel="Customer Portal properties"
      >
        <div>Usage content</div>
      </DevelopServerDetailPage>,
    );

    expect(container.querySelector("[data-resource-detail-page='true']")).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Resource sections" })).not.toBeNull();
    expect(screen.getByRole("tabpanel", { name: "Usage" })).not.toBeNull();
    expect(screen.getByRole("complementary", { name: "Customer Portal properties" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Toggle properties" })).not.toBeNull();
    expect(screen.getByText("Usage content")).not.toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Code" }));
    expect(onTabChange).toHaveBeenCalledWith("code");
  });

  it("delegates collapsed sidebar behavior to the shared detail shell", () => {
    render(
      <DevelopServerDetailPage
        header={<h1>Webhook Function</h1>}
        sidebar={<div>Runtime</div>}
        sidebarCollapsed
        activeTab="usage"
        onTabChange={vi.fn()}
      >
        <div>Usage content</div>
      </DevelopServerDetailPage>,
    );

    const sidebar = screen.getByRole("complementary", { hidden: true });
    expect(sidebar.getAttribute("data-collapsed")).toBe("true");
    expect(sidebar.getAttribute("aria-hidden")).toBe("true");
  });

  it("marks the code layout for a bounded full-height editor", () => {
    const { container } = render(
      <DevelopServerDetailPage
        header={<h1>Webhook Function</h1>}
        sidebarToggle={<button type="button">Toggle properties</button>}
        sidebar={<div>Runtime</div>}
        activeTab="code"
        onTabChange={vi.fn()}
      >
        <div>Source editor</div>
      </DevelopServerDetailPage>,
    );

    expect(container.querySelector(".playground-server-detail-page.is-code-tab")).not.toBeNull();
    expect(container.querySelector(".playground-server-detail-page__content.is-code-tab")).not.toBeNull();
    expect(screen.getByRole("complementary", { hidden: true }).getAttribute("data-collapsed")).toBe("true");
    expect(screen.queryByRole("button", { name: "Toggle properties" })).toBeNull();
  });
});
