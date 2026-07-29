// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PlatformActivityOverview,
  formatPlatformActivityOverviewDuration,
} from "./platform-activity-overview.js";
import { PlatformActivityOverviewCard } from "./platform-activity-overview-card.js";

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
    expect(
      container.querySelectorAll(
        ".platform-activity-overview__minimap-bar",
      ),
    ).toHaveLength(items.length);
    const navigator = container.querySelector(
      ".platform-activity-overview__navigator",
    );
    expect(navigator).not.toBeNull();
    expect(
      navigator?.querySelector(".platform-activity-overview__axis"),
    ).not.toBeNull();
    expect(navigator?.textContent).toContain("START");
    expect(
      container.querySelector(
        ".platform-activity-overview__viewport .platform-activity-overview__axis",
      ),
    ).toBeNull();
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

  it("anchors the latest start at the right edge regardless of earlier durations", () => {
    const { container } = render(
      <PlatformActivityOverview
        items={[
          {
            id: "long-running",
            label: "Long-running task",
            startAt: 1_000,
            endAt: 100_000,
          },
          {
            id: "latest",
            label: "Latest activity",
            startAt: 2_000,
            endAt: 2_100,
          },
        ]}
      />,
    );

    const latestItem = Array.from(
      container.querySelectorAll<HTMLElement>(
        ".platform-activity-overview__item",
      ),
    ).find((item) => item.textContent?.includes("Latest activity"));

    expect(latestItem).toBeDefined();
    expect(
      latestItem?.style.getPropertyValue(
        "--platform-activity-overview-item-left",
      ),
    ).toBe("100%");
  });

  it("fits the timeline to the viewport and renders shared custom content", () => {
    const { container } = render(
      <PlatformActivityOverview
        items={[
          {
            id: "ticket",
            label: "CA-12",
            content: (
              <div data-testid="shared-ticket-preview">
                Shared ticket preview
              </div>
            ),
            startAt: 1_000,
          },
        ]}
      />,
    );

    const overview = container.querySelector(
      ".platform-activity-overview",
    );
    const timeline = container.querySelector<HTMLElement>(
      ".platform-activity-overview__timeline",
    );

    expect(overview?.classList.contains("is-fit-timeline")).toBe(true);
    expect(timeline?.style.maxWidth).toBe("100%");
    expect(timeline?.style.minWidth).toBe("0");
    expect(screen.getByTestId("shared-ticket-preview")).not.toBeNull();
  });

  it("renders the shared permission-ring activity card", () => {
    render(
      <PlatformActivityOverviewCard
        title="Created CA-012"
        permissionRingId="ring_3"
        permissionIcon={<span data-testid="permission-ring">Ring</span>}
        actorAvatar={<img src="/actor.jpg" alt="" />}
        actorLabel="Forge"
        aria-label="Created CA-012 by Forge"
      />,
    );

    const card = screen.getByRole("button", {
      name: "Created CA-012 by Forge",
    });
    expect(card.classList.contains("is-ring-3")).toBe(true);
    expect(screen.getByText("Created CA-012")).not.toBeNull();
    expect(screen.getByTestId("permission-ring")).not.toBeNull();
  });

  it("exposes the selected state on the shared activity card", () => {
    render(
      <PlatformActivityOverviewCard
        title="Started CA-014"
        permissionIcon={<span>Ring</span>}
        actorAvatar={<span>CA</span>}
        selected
        aria-label="Started CA-014"
      />,
    );

    const card = screen.getByRole("button", {
      name: "Started CA-014",
    });
    expect(card.classList.contains("is-selected")).toBe(true);
    expect(card.getAttribute("aria-pressed")).toBe("true");
  });

  it("filters and rescales activity when either time-range edge moves", () => {
    const onTimeRangeChange = vi.fn();
    const { container } = render(
      <PlatformActivityOverview
        items={[
          { id: "early", label: "Early", startAt: 0 },
          { id: "middle", label: "Middle", startAt: 50 },
          { id: "late", label: "Late", startAt: 100 },
        ]}
        onTimeRangeChange={onTimeRangeChange}
      />,
    );
    const minimap = container.querySelector<HTMLElement>(
      ".platform-activity-overview__minimap",
    );
    const startHandle = screen.getByRole("slider", {
      name: "Activity range start",
    });
    const endHandle = screen.getByRole("slider", {
      name: "Activity range end",
    });
    expect(minimap).not.toBeNull();
    if (!minimap) {
      throw new Error("Expected the activity minimap to render.");
    }
    vi.spyOn(minimap, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 34,
      top: 0,
      right: 100,
      bottom: 34,
      left: 0,
      toJSON: () => ({}),
    });

    fireEvent(
      startHandle,
      new MouseEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: 0,
      }),
    );
    fireEvent(
      minimap,
      new MouseEvent("pointermove", {
        bubbles: true,
        buttons: 1,
        clientX: 25,
      }),
    );
    fireEvent(
      minimap,
      new MouseEvent("pointerup", {
        bubbles: true,
        clientX: 25,
      }),
    );

    expect(screen.queryByText("Early")).toBeNull();
    expect(screen.getByText("Middle")).not.toBeNull();
    expect(screen.getByText("Late")).not.toBeNull();
    expect(onTimeRangeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        startAt: 25,
        endAt: 100,
        startPercent: 25,
        endPercent: 100,
      }),
    );

    fireEvent.keyDown(endHandle, { key: "ArrowLeft" });
    expect(screen.queryByText("Late")).toBeNull();
    expect(onTimeRangeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        startPercent: 25,
        endPercent: 99,
      }),
    );

    fireEvent(
      endHandle,
      new MouseEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientX: 99,
      }),
    );
    fireEvent(
      minimap,
      new MouseEvent("pointermove", {
        bubbles: true,
        buttons: 1,
        clientX: 0,
      }),
    );
    fireEvent(
      minimap,
      new MouseEvent("pointerup", {
        bubbles: true,
        clientX: 0,
      }),
    );
    expect(onTimeRangeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        startPercent: 25,
        endPercent: 27,
      }),
    );
  });

  it("resizes by dragging the bottom separator and with keyboard steps", () => {
    const onHeightChange = vi.fn();
    const { container } = render(
      <PlatformActivityOverview
        items={items}
        resizable
        onHeightChange={onHeightChange}
      />,
    );
    const section = container.querySelector<HTMLElement>(
      ".platform-activity-overview",
    );
    expect(section).not.toBeNull();
    if (!section) {
      throw new Error("Expected the activity overview to render.");
    }
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 1_000,
      height: 400,
      top: 0,
      right: 1_000,
      bottom: 400,
      left: 0,
      toJSON: () => ({}),
    });

    const resizeHandle = screen.getByRole("separator", {
      name: "Resize activity chart",
    });
    fireEvent(
      resizeHandle,
      new MouseEvent("pointerdown", {
        bubbles: true,
        button: 0,
        clientY: 400,
      }),
    );
    fireEvent(
      resizeHandle,
      new MouseEvent("pointermove", {
        bubbles: true,
        buttons: 1,
        clientY: 460,
      }),
    );
    fireEvent(
      resizeHandle,
      new MouseEvent("pointerup", {
        bubbles: true,
        clientY: 460,
      }),
    );

    expect(onHeightChange).toHaveBeenCalledWith(460);

    fireEvent.keyDown(
      resizeHandle,
      { key: "ArrowDown" },
    );

    expect(onHeightChange).toHaveBeenCalledWith(412);
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
