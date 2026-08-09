// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetronomesOverviewPage } from "./metronomes-overview-page.js";
import { type MetronomeOverviewRow } from "./metronomes-overview-model.js";

const CONTROLS_PORTAL_ID = "metronome-overview-test-controls";

const rows: MetronomeOverviewRow[] = [
  {
    id: "loop",
    name: "Loop",
    status: "default",
    statusLabel: "Default",
    statusRank: 0,
    triggerLabel: "Manual",
    creatorName: "Computer Agents",
    creatorAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
    lastRunLabel: "Ready to run",
    sortTimestamp: 0,
    runsToday: 0,
    waitingApprovals: 0,
    isBuiltIn: true,
  },
  {
    id: "daily-review",
    name: "Daily review",
    status: "active",
    statusLabel: "Active",
    statusRank: 1,
    triggerLabel: "Schedule",
    creatorName: "Me",
    creatorFallback: "ME",
    lastRunLabel: "Jul 18",
    lastRunAt: Date.parse("2026-07-18T08:00:00Z"),
    sortTimestamp: Date.parse("2026-07-18T08:00:00Z"),
    runsToday: 4,
    waitingApprovals: 1,
  },
];

function renderPage(overrides: Partial<React.ComponentProps<typeof MetronomesOverviewPage>> = {}) {
  return render(
    <>
      <div id={CONTROLS_PORTAL_ID} data-testid="overview-controls" />
      <MetronomesOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onShare={vi.fn()}
        onDelete={vi.fn()}
        onRemoveShared={vi.fn()}
        onRestoreShared={vi.fn()}
        {...overrides}
      />
    </>,
  );
}

afterEach(cleanup);

describe("MetronomesOverviewPage", () => {
  it("matches the Tests overview composition without analytics or pagination", () => {
    const onCreate = vi.fn();
    const { container } = renderPage({ onCreate });

    expect(container.querySelector(".resource-overview-page.is-metronomes")).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Orchestrate reliable work from trigger to completion",
      }),
    ).not.toBeNull();
    expect(container.querySelector(".platform-analytics")).toBeNull();
    expect(container.querySelector(".platform-data-table.is-catalog-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Metronomes pagination" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "All Workflows" })).toBeNull();

    const controls = screen.getByTestId("overview-controls");
    expect(within(controls).queryByRole("radiogroup")).toBeNull();
    expect(within(controls).getByRole("button", { name: "Metronome" })).not.toBeNull();

    const lastRunHeader = screen.getByRole("columnheader", { name: /Last run/ });
    expect(lastRunHeader.getAttribute("aria-sort")).toBe("descending");
    expect(
      lastRunHeader
        .querySelector(".platform-data-table__sort-icon")
        ?.classList.contains("is-bottom-active"),
    ).toBe(true);
  });

  it("uses shared labels and keeps the default workflow duplicate-only", async () => {
    const user = userEvent.setup();
    const onDuplicate = vi.fn();
    renderPage({ onDuplicate });

    const greenLabels = Array.from(document.querySelectorAll(".platform-label.is-green")).map(
      (label) => label.textContent,
    );
    expect(screen.getByText("Default").getAttribute("data-platform-label-variant")).toBe("green");
    expect(greenLabels).toEqual(expect.arrayContaining(["Default", "Active"]));
    expect(
      screen
        .getByText("Computer Agents")
        .closest(".resource-overview-identity")
        ?.querySelector("img")
        ?.getAttribute("src"),
    ).toBe("/img/agent-profile-pics/ca-profilepic.jpg");

    await user.click(screen.getByRole("button", { name: "Open actions for Loop" }));
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).not.toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Delete" })).toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    expect(onDuplicate).toHaveBeenCalledWith(rows[0]);
  });
});
