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

  it("supports database tabs that auto-collapse the sidebar on Data", () => {
    const tabs = [
      { id: "data", label: "Data" },
      { id: "usage", label: "Usage" },
      { id: "settings", label: "Settings" },
    ] as const;
    const onTabChange = vi.fn();
    const { container, rerender } = render(
      <DevelopServerDetailPage
        tabs={tabs}
        activeTab="data"
        onTabChange={onTabChange}
        sidebar={<div>Database owner</div>}
        sidebarToggle={<button type="button">Toggle database properties</button>}
        sidebarAutoCollapseTabs={["data"]}
        contentClassName="is-database-data-tab"
      >
        <div>Database records</div>
      </DevelopServerDetailPage>,
    );

    expect(screen.getByRole("complementary", { hidden: true }).getAttribute("data-collapsed")).toBe("true");
    expect(screen.queryByRole("button", { name: "Toggle database properties" })).toBeNull();
    expect(container.querySelector(".resource-detail-page__content")?.classList.contains("is-database-data-tab")).toBe(true);

    rerender(
      <DevelopServerDetailPage
        tabs={tabs}
        activeTab="usage"
        onTabChange={onTabChange}
        sidebar={<div>Database owner</div>}
        sidebarToggle={<button type="button">Toggle database properties</button>}
        sidebarAutoCollapseTabs={["data"]}
      >
        <div>Database usage</div>
      </DevelopServerDetailPage>,
    );

    expect(screen.getByRole("complementary").getAttribute("data-collapsed")).toBe("false");
    expect(screen.getByRole("button", { name: "Toggle database properties" })).not.toBeNull();
  });

  it("owns the complete canonical settings layout when a resource settings contract is supplied", () => {
    const { container } = render(
      <DevelopServerDetailPage
        activeTab="settings"
        onTabChange={vi.fn()}
        sidebar={<div>Legacy properties</div>}
        settings={{
          identity: {
            icon: <span>D</span>,
            title: "Customer Database",
            description: "Customer records",
            readOnly: true,
          },
          details: {
            variant: "standard",
            customAttributes: [{ id: "provider", label: "Provider", value: "Firestore" }],
            updatedAt: "2026-08-30T10:00:00.000Z",
            creator: { value: "creator", name: "Creator" },
            owner: { value: "owner", name: "Owner" },
            scope: {},
            primaryActions: [{ id: "browse", label: "Browse Data", onSelect: () => undefined }],
          },
          access: <div>Database access</div>,
        }}
      >
        <div>Legacy settings</div>
      </DevelopServerDetailPage>,
    );

    expect(container.querySelector("[data-platform-resource-settings-page='true']")).not.toBeNull();
    expect(screen.getByDisplayValue("Customer Database")).not.toBeNull();
    expect(screen.getByText("Database access")).not.toBeNull();
    expect(screen.queryByText("Legacy settings")).toBeNull();
    expect(screen.queryByText("Legacy properties")).toBeNull();
  });
});
