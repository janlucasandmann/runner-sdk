// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Bot, Monitor, Sparkles } from "lucide-react";
import { ConfigureHomeOverviewPage } from "./configure-home-overview-page.js";

afterEach(cleanup);

describe("ConfigureHomeOverviewPage", () => {
  it("uses the canonical overview shell with teaser cards and compact header actions", async () => {
    const user = userEvent.setup();
    const controls = document.createElement("div");
    controls.id = "configure-home-test-controls";
    document.body.appendChild(controls);

    const { container } = render(
      <ConfigureHomeOverviewPage
        cards={[
          { id: "agents", title: "Agents", description: "Workspace agents", value: "3", icon: Bot, onClick: vi.fn() },
          { id: "computers", title: "Computers", description: "Persistent computers", value: "2", icon: Monitor, onClick: vi.fn() },
          { id: "skills", title: "Skills", description: "Agent capabilities", value: "8", icon: Sparkles, onClick: vi.fn() },
        ]}
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
        onOpenPricing={vi.fn()}
        onOpenDocumentation={vi.fn()}
        onOpenNotification={vi.fn()}
        canOpenNotification={() => true}
        getNotificationActions={() => []}
        controlsPortalId={controls.id}
      />,
    );

    expect(container.querySelectorAll(".resource-overview-page")).toHaveLength(1);
    expect(container.querySelector(".platform-analytics")).toBeNull();
    const teaser = screen.getByRole("region", { name: "Workspace resources" });
    expect(within(teaser).getAllByRole("button")).toHaveLength(3);
    expect(screen.getByRole("table", { name: "Notifications" })).not.toBeNull();
    expect(within(controls).queryByRole("button", { name: "Mark all read" })).toBeNull();
    expect(screen.queryByText("Review product updates, human tasks, team invitations, and permission requests.")).toBeNull();

    const optionsButton = within(controls).getByRole("button", { name: "Configure options" });
    await user.click(optionsButton);
    const menu = screen.getByRole("menu", { name: "Configure resources" });
    expect(within(menu).getByRole("menuitem", { name: "Pricing" })).not.toBeNull();
    expect(within(menu).getByRole("menuitem", { name: "Documentation" })).not.toBeNull();

    controls.remove();
  });
});
