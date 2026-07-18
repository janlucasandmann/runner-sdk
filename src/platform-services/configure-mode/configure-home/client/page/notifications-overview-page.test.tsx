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

    expect(container.querySelector(".is-configure-notifications")).not.toBeNull();
    expect(screen.getByRole("table", { name: "Notifications" })).not.toBeNull();
    expect(screen.getByPlaceholderText("Search notifications")).not.toBeNull();
    expect(screen.getByText("Permission needed")).not.toBeNull();
  });

  it("uses the notification-specific empty state", () => {
    render(
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

    expect(screen.getByText("No notifications yet")).not.toBeNull();
    expect(screen.getByText(
      "Notifications come from agent activity, permission requests, team invitations, and product updates.",
    )).not.toBeNull();
  });
});
