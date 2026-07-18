// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetronomesOverviewPage } from "./metronomes-overview-page.js";
import {
  createMetronomesOverviewAnalytics,
  type MetronomeOverviewRow,
} from "./metronomes-overview-model.js";

const CONTROLS_PORTAL_ID = "metronome-overview-test-controls";
const analytics = {
  title: "Metronome activity",
  metrics: [
    { id: "workflows", label: "Metronomes", value: "2", color: "#8fc4ff" },
    { id: "active", label: "Active", value: "1", color: "#7effff" },
  ],
  labels: [],
  series: [],
};

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
        analytics={analytics}
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
  it("composes the shared analytics, table, pagination, and app-header controls", () => {
    const onCreate = vi.fn();
    const { container } = renderPage({ onCreate });

    expect(container.querySelector(".resource-overview-page.is-metronomes")).not.toBeNull();
    expect(container.querySelector(".platform-analytics")).not.toBeNull();
    expect(
      container.querySelector(".platform-data-table.is-fill-layout.is-minimalistic-ui"),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "All Workflows", level: 2 })).not.toBeNull();
    expect(screen.getByRole("navigation", { name: "Metronomes pagination" })).not.toBeNull();
    expect(screen.getByText("1-2 of 2")).not.toBeNull();

    const controls = screen.getByTestId("overview-controls");
    expect(
      within(controls).getByRole("radiogroup", { name: "Analytics time frame" }),
    ).not.toBeNull();
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

  it("derives instant overview analytics from loaded workflow metadata", () => {
    const analytics = createMetronomesOverviewAnalytics({
      rows: [
        rows[0],
        rows[1],
        {
          ...rows[1],
          id: "removed",
          name: "Removed",
          isTeamShared: true,
          isHiddenTeamShared: true,
          runsToday: 100,
          waitingApprovals: 100,
        },
      ],
      period: "day",
      now: new Date("2026-07-18T12:00:00Z"),
    });

    expect(analytics.metrics.map((metric) => metric.value)).toEqual(["2", "1", "4", "1"]);
    expect(analytics.labels).toHaveLength(24);
    expect(analytics.series).toHaveLength(1);
    expect(analytics.series[0].values.reduce((sum, value) => sum + value, 0)).toBe(1);
  });
});
