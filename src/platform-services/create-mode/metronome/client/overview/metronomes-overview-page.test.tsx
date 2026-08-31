// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetronomesOverviewPage } from "./metronomes-overview-page.js";
import { type MetronomeOverviewRow } from "./metronomes-overview-model.js";

const CONTROLS_PORTAL_ID = "metronome-overview-test-controls";

const rows: MetronomeOverviewRow[] = [
  {
    id: "loop",
    name: "Loop",
    description: "A built-in continuous workflow.",
    status: "default",
    statusLabel: "Default",
    statusRank: 0,
    triggerLabel: "Manual",
    ownerName: "Computer Agents",
    ownerAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
    creatorName: "Computer Agents",
    creatorAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
    updatedAt: Date.parse("2026-07-01T08:00:00Z"),
    lastRunLabel: "Ready to run",
    sortTimestamp: 0,
    runsToday: 0,
    waitingApprovals: 0,
    visualKind: "loop",
    isBuiltIn: true,
  },
  {
    id: "daily-review",
    name: "Daily review",
    description: "Reviews open work every morning.",
    status: "active",
    statusLabel: "Active",
    statusRank: 1,
    triggerLabel: "Schedule",
    ownerName: "Jan Luca Sandmann",
    ownerFallback: "JL",
    creatorName: "Review Agent",
    creatorAvatarUrl: "/review-agent.png",
    updatedAt: Date.parse("2026-07-18T07:00:00Z"),
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
  it("uses the Project visual language for Loop and Mission Control workflows", () => {
    const missionControlRow: MetronomeOverviewRow = {
      ...rows[1],
      id: "mission-control",
      name: "Mission Control",
      visualKind: "mission-control",
    };
    const { container } = renderPage({ rows: [rows[0], missionControlRow] });

    const loopVisual = screen.getByText("Loop")
      .closest(".resource-overview-identity")
      ?.querySelector(".resource-overview-identity__visual.is-loop");
    const missionControlVisual = screen.getByText("Mission Control")
      .closest(".resource-overview-identity")
      ?.querySelector(".resource-overview-identity__visual.is-mission-control");

    expect(loopVisual?.querySelector(".lucide-refresh-cw")).not.toBeNull();
    expect(missionControlVisual?.querySelector(".lucide-refresh-ccw-dot")).not.toBeNull();
    expect(container.querySelectorAll(".resource-overview-identity__visual.is-metronome"))
      .toHaveLength(2);
  });

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
    expect(screen.queryByRole("button", { name: /filter/i })).toBeNull();
    expect(screen.queryByRole("columnheader", { name: /trigger/i })).toBeNull();
    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual(["", "Name", "Creator", "Updated", ""]);
    expect(screen.queryByRole("columnheader", { name: /owner/i })).toBeNull();
    expect(screen.getByText("Review Agent")).not.toBeNull();
    expect(container.querySelector('img[src="/review-agent.png"]')).not.toBeNull();
    expect(container.querySelector(".resource-overview-standard-name-cell")).not.toBeNull();
    expect(container.querySelector(".resource-overview-standard-creator-cell")).not.toBeNull();
    expect(screen.getByText("Reviews open work every morning.")).not.toBeNull();
    expect(screen.queryByText("Me")).toBeNull();

    const updatedHeader = screen.getByRole("columnheader", { name: /Updated/ });
    expect(updatedHeader.getAttribute("aria-sort")).toBe("descending");
    expect(
      updatedHeader
        .querySelector(".platform-data-table__sort-icon")
        ?.classList.contains("is-bottom-active"),
    ).toBe(true);
  });

  it("uses the shared creator cell and keeps the default workflow duplicate-only", async () => {
    const user = userEvent.setup();
    const onDuplicate = vi.fn();
    renderPage({ onDuplicate });

    expect(
      screen
        .getByText("Computer Agents")
        .closest(".resource-overview-identity")
        ?.querySelector("img")
        ?.getAttribute("src"),
    ).toBe("/img/agent-profile-pics/ca-profilepic.jpg");
    expect(
      screen
        .getByText("Computer Agents")
        .closest(".resource-overview-identity")
        ?.querySelector(".resource-overview-identity__visual.is-creator.is-size-standard"),
    ).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Open actions for Loop" }));
    expect(screen.getByRole("menuitem", { name: "Edit" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Duplicate" })).not.toBeNull();
    expect(
      (screen.getByRole("menuitem", { name: "Share" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("menuitem", { name: "Delete" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await user.click(screen.getByRole("menuitem", { name: "Duplicate" }));
    expect(onDuplicate).toHaveBeenCalledWith(rows[0]);
  });

  it("shows 20 workflows initially and reveals the next 10 at the table bottom", async () => {
    let resolveLoadMore: (() => void) | undefined;
    const onLoadMore = vi.fn(
      () => new Promise<void>((resolve) => {
        resolveLoadMore = resolve;
      }),
    );
    const manyRows: MetronomeOverviewRow[] = Array.from({ length: 25 }, (_, index) => ({
      id: `workflow-${index + 1}`,
      name: `Workflow ${String(index + 1).padStart(2, "0")}`,
      description: `Workflow ${index + 1} description`,
      status: "active",
      statusLabel: "Active",
      statusRank: 1,
      triggerLabel: "Manual",
      ownerName: "Jan Luca Sandmann",
      ownerFallback: "JL",
      creatorName: "Jan Luca Sandmann",
      creatorFallback: "JL",
      updatedAt: 25 - index,
      lastRunLabel: "Never",
      sortTimestamp: 25 - index,
      runsToday: 0,
      waitingApprovals: 0,
    }));
    const { container } = renderPage({
      rows: manyRows,
      hasMore: true,
      onLoadMore,
    });

    expect(screen.getByText("Workflow 20")).not.toBeNull();
    expect(screen.queryByText("Workflow 21")).toBeNull();
    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 600, writable: true },
    });

    fireEvent.scroll(scroll as HTMLElement);
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));
    expect(
      screen.getByRole("status", { name: "Loading more workflows..." }),
    ).not.toBeNull();

    resolveLoadMore?.();
    await waitFor(() => expect(screen.getByText("Workflow 25")).not.toBeNull());
    expect(
      screen.queryByRole("status", { name: "Loading more workflows..." }),
    ).toBeNull();
  });

  it("uses the centralized table loading state", () => {
    const { container } = renderPage({ rows: [], loading: true });

    expect(
      screen.getByRole("status", { name: "Loading Metronomes…" }),
    ).not.toBeNull();
    expect(
      container.querySelector(
        '.platform-data-table__state.has-loading-state img[src="/img/spinner.svg"]',
      ),
    ).not.toBeNull();
  });
});
