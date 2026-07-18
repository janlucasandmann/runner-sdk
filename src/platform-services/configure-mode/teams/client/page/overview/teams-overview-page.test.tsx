// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type TeamOverviewRow, TeamsOverviewPage } from "./teams-overview-page.js";

const CONTROLS_PORTAL_ID = "teams-overview-test-controls";

const rows: readonly TeamOverviewRow[] = [
  {
    id: "team-platform",
    name: "Platform Team",
    roleLabel: "Owner",
    ownerLabel: "Jan",
    ownership: "owned",
    createdAt: 1_720_000_000_000,
    createdLabel: "Jul 3",
    createdTitle: "July 3, 2024",
  },
  {
    id: "team-research",
    name: "Research Team",
    roleLabel: "Member",
    ownerLabel: "Alex",
    ownership: "member",
    createdAt: 1_710_000_000_000,
    createdLabel: "Mar 9",
    createdTitle: "March 9, 2024",
  },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("TeamsOverviewPage", () => {
  it("uses the shared hero, UI cards, overview shell, and minimal data table", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
    const onOpenDocumentation = vi.fn();
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);

    const { container } = render(
      <TeamsOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={onOpen}
        onCreate={onCreate}
        onRename={vi.fn()}
        onOpenDocumentation={onOpenDocumentation}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-teams")).not.toBeNull();
    expect(container.querySelector("[data-platform-page-hero='true']")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Coordinate work across teams" })).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Teams" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-minimalistic-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.getByText("All Teams")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search teams")).not.toBeNull();

    const createButton = await screen.findByRole("button", { name: "New Team" });
    await user.click(createButton);
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Team Documentation" }));
    expect(onOpenDocumentation).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Platform Team"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });
});
