// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NotificationsOverviewPage } from "./notifications-overview-page.js";

afterEach(cleanup);

describe("NotificationsOverviewPage", () => {
  it("renders notification controls and rows on a dedicated overview page", () => {
    const { container } = render(
      <NotificationsOverviewPage
        notifications={[{
          id: "notification-1",
          kind: "permission",
          kindLabel: "Permission request",
          label: "Permission needed",
          text: "Deploy API",
          statusLabel: "Needs decision",
          unread: true,
          createdAtLabel: "Now",
          createdAtTimestamp: Date.now(),
        }]}
        totalNotificationCount={1}
        searchValue=""
        onSearchChange={vi.fn()}
        filterValue="all"
        onFilterChange={vi.fn()}
        sortValue="newest"
        onSortChange={vi.fn()}
        onOpenNotification={vi.fn()}
        canOpenNotification={() => true}
        getNotificationActions={() => []}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-notifications")).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-catalog-ui")).not.toBeNull();
    expect(screen.getByText("Stay current on work that needs your attention")).not.toBeNull();
    expect(screen.getByRole("table", { name: "Notifications" })).not.toBeNull();
    expect(screen.getByPlaceholderText("Search notifications")).not.toBeNull();
    expect(screen.getByText("Permission needed")).not.toBeNull();
    const tableTitle = screen.getByRole("heading", {
      name: "Notifications",
      level: 2,
    });
    expect(tableTitle.nextElementSibling).toBe(
      screen.getByRole("button", { name: "Filter" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Select all visible rows" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("checkbox", { name: "Select Permission needed" }),
    ).not.toBeNull();
    expect(
      container.querySelector(".resource-overview-identity__visual"),
    ).toBeNull();
  });

  it("uses the canonical notification empty state", () => {
    const { container } = render(
      <NotificationsOverviewPage
        notifications={[]}
        totalNotificationCount={0}
        searchValue=""
        onSearchChange={vi.fn()}
        filterValue="all"
        onFilterChange={vi.fn()}
        sortValue="newest"
        onSortChange={vi.fn()}
        onOpenNotification={vi.fn()}
        canOpenNotification={() => true}
        getNotificationActions={() => []}
      />,
    );

    expect(
      container.querySelector(".platform-empty-state"),
    ).not.toBeNull();
    expect(container.querySelector(".lucide-bell")).not.toBeNull();
    expect(screen.getByText("No notifications yet")).not.toBeNull();
    expect(screen.getByText(
      "Notifications come from agent activity, permission requests, team invitations, and product updates.",
    )).not.toBeNull();
  });

  it("renders at most 20 notification rows initially", () => {
    const notifications = Array.from({ length: 21 }, (_, index) => ({
      id: `notification-${index + 1}`,
      kind: "inbox",
      kindLabel: "Agent run",
      label: `Notification ${index + 1}`,
      text: "Completed work",
      unread: true,
      createdAtLabel: "Now",
      createdAtTimestamp: 21 - index,
    }));

    render(
      <NotificationsOverviewPage
        notifications={notifications}
        totalNotificationCount={notifications.length}
        searchValue=""
        onSearchChange={vi.fn()}
        filterValue="all"
        onFilterChange={vi.fn()}
        sortValue="newest"
        onSortChange={vi.fn()}
        onOpenNotification={vi.fn()}
        canOpenNotification={() => true}
        getNotificationActions={() => []}
      />,
    );

    expect(screen.getByText("Notification 20")).not.toBeNull();
    expect(screen.queryByText("Notification 21")).toBeNull();
  });
});
