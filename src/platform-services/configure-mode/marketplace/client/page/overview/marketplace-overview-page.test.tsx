// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MarketplaceOverviewPage,
  type MarketplaceOverviewRow,
} from "./marketplace-overview-page.js";

const rows: readonly MarketplaceOverviewRow[] = [
  {
    id: "support-workflow",
    title: "Support Workflow",
    type: "metronome",
    typeLabel: "Metronome",
    featured: true,
    summary: "Handle support requests.",
    difficulty: "Intermediate",
    estimatedSetup: "8 min",
  },
  {
    id: "crm-database",
    title: "CRM Database",
    type: "database",
    typeLabel: "Database",
    difficulty: "Beginner",
    estimatedSetup: "5 min",
  },
];

afterEach(cleanup);

describe("MarketplaceOverviewPage", () => {
  it("uses the same shared hero, cards, overview shell, and table as Teams", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onPublish = vi.fn();
    const onFilterChange = vi.fn();

    const { container } = render(
      <MarketplaceOverviewPage
        rows={rows}
        types={[
          { id: "all", label: "All templates" },
          { id: "metronome", label: "Metronomes" },
          { id: "database", label: "Databases" },
        ]}
        searchValue=""
        onSearchChange={vi.fn()}
        filterValue="all"
        onFilterChange={onFilterChange}
        onOpen={onOpen}
        onPublish={onPublish}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-marketplace")).not.toBeNull();
    expect(container.querySelector("[data-platform-page-hero='true']")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Start from reusable resources" })).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Marketplace resources" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-minimalistic-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.getByText("All Resources")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search resources")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: /View Featured Resources/ }));
    expect(onFilterChange).toHaveBeenCalledWith("featured");

    await user.click(screen.getByText("Support Workflow"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);

    await user.click(screen.getByRole("button", { name: "Open actions for Support Workflow" }));
    await user.click(screen.getByRole("menuitem", { name: "Publish" }));
    expect(onPublish).toHaveBeenCalledWith(rows[0]);
  });
});
