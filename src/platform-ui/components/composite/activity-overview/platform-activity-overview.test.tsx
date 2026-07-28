// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PlatformActivityOverview,
  formatPlatformActivityOverviewDuration,
} from "./platform-activity-overview.js";

afterEach(cleanup);

const items = [
  {
    id: "task-2",
    label: "CA-2 Verify release",
    startAt: "2026-07-27T10:00:02.000Z",
    endAt: "2026-07-27T10:00:02.200Z",
    status: "error" as const,
  },
  {
    id: "signal-1",
    label: "Moved to In Progress",
    startAt: "2026-07-27T10:00:01.000Z",
    kind: "signal" as const,
  },
  {
    id: "task-1",
    label: "CA-1 Build release",
    startAt: "2026-07-27T10:00:00.000Z",
    endAt: "2026-07-27T10:00:00.200Z",
    status: "success" as const,
  },
];

describe("PlatformActivityOverview", () => {
  it("orders work chronologically and renders the waterfall primitives", () => {
    const { container } = render(
      <PlatformActivityOverview items={items} />,
    );

    expect(screen.getByLabelText("Activity over time")).not.toBeNull();
    const rows = Array.from(
      container.querySelectorAll(".platform-activity-overview__row"),
    );
    expect(rows).toHaveLength(3);
    expect(rows[0]?.textContent).toContain("CA-1 Build release");
    expect(rows[1]?.textContent).toContain("Moved to In Progress");
    expect(rows[2]?.textContent).toContain("CA-2 Verify release");
    expect(
      container.querySelector(".platform-activity-overview__connectors"),
    ).toBeNull();
    expect(
      container.querySelector(".platform-activity-overview__minimap"),
    ).not.toBeNull();
  });

  it("activates interactive work items", () => {
    const handleActivate = vi.fn();
    render(
      <PlatformActivityOverview
        items={[
          {
            ...items[0],
            ariaLabel: "Open CA-2",
            onActivate: handleActivate,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open CA-2" }));
    expect(handleActivate).toHaveBeenCalledTimes(1);
  });

  it("uses the shared loading and empty states", () => {
    const { rerender } = render(
      <PlatformActivityOverview loading items={[]} />,
    );
    expect(screen.getByRole("status", { name: "Loading activity..." })).not.toBeNull();

    rerender(
      <PlatformActivityOverview
        items={[]}
        emptyTitle="No project work"
        emptyDescription="Ticket work will appear here."
      />,
    );
    expect(screen.getByText("No project work")).not.toBeNull();
    expect(screen.getByText("Ticket work will appear here.")).not.toBeNull();
  });

  it("formats compact and long durations", () => {
    expect(formatPlatformActivityOverviewDuration(200)).toBe("200 ms");
    expect(formatPlatformActivityOverviewDuration(2_500)).toBe("2.5 s");
    expect(formatPlatformActivityOverviewDuration(120_000)).toBe("2 min");
    expect(formatPlatformActivityOverviewDuration(172_800_000)).toBe("2 d");
  });
});
