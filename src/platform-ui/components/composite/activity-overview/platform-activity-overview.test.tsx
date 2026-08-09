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
    ).toHaveLength(0);
    expect(
      container.querySelector(
        ".platform-activity-overview__minimap-texture-bar",
      ),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(
        ".platform-activity-overview__navigator-guide",
      ),
    ).toHaveLength(5);
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
    expect(screen.getByText("Created CA-012").getAttribute("title"))
      .toBe("Created CA-012");
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

  it("renders semantic tool icons and an activity-group rail", () => {
    const { container } = render(
      <PlatformActivityOverviewCard
        title="Searched the web for release notes"
        leadingIcon={<span data-testid="semantic-tool-icon">Search</span>}
        permissionIcon={<span>Permission ring</span>}
        actorAvatar={<span>CA</span>}
        groupLabel="Researching release behavior"
        groupRailColor="#85df7b"
        aria-label="Inspect web search"
      />,
    );

    const card = screen.getByRole("button", { name: "Inspect web search" });
    const rail = container.querySelector<HTMLElement>(
      ".platform-activity-overview-card__group-rail",
    );
    expect(card.classList.contains("has-group-rail")).toBe(true);
    expect(screen.getByTestId("semantic-tool-icon")).not.toBeNull();
    expect(card.textContent).not.toContain("Permission ring");
    expect(rail?.getAttribute("title")).toBe("Researching release behavior");
    expect(
      card.style.getPropertyValue(
        "--platform-activity-overview-group-rail-color",
      ),
    ).toBe("#85df7b");
  });

  it("renders tool-call duration and status beside the label", () => {
    const { container } = render(
      <PlatformActivityOverviewCard
        title="Run local commands"
        leadingIcon={<span data-testid="tool-icon">Tool</span>}
        metadata="306 ms"
        status="success"
        className="is-tool-call"
        aria-label="Run local commands"
      />,
    );

    expect(screen.getByText("306 ms")).not.toBeNull();
    expect(
      container.querySelector(".platform-activity-overview-card__status"),
    ).not.toBeNull();
  });

  it("renders transparent leaf cards without changing their semantics", () => {
    render(
      <PlatformActivityOverviewCard
        title="Ran focused tests"
        permissionIcon={<span>Ring</span>}
        actorAvatar={<span>CA</span>}
        variant="plain"
        aria-label="Ran focused tests"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Ran focused tests" }).classList.contains("is-plain"),
    ).toBe(true);
  });

  it("renders accessible expansion controls and a rail for visible descendants", () => {
    const onToggle = vi.fn();
    const { container } = render(
      <PlatformActivityOverview
        items={[
          {
            id: "plan",
            label: "Inspect the repository",
            startAt: 30,
            hierarchy: {
              order: 0,
              depth: 0,
              expandable: true,
              expanded: true,
              onToggle,
            },
          },
          {
            id: "group",
            label: "Reading source files",
            startAt: 10,
            hierarchy: {
              parentId: "plan",
              order: 1,
              depth: 1,
            },
          },
        ]}
      />,
    );

    const rows = Array.from(
      container.querySelectorAll(".platform-activity-overview__row"),
    );
    expect(rows[0]?.textContent).toContain("Inspect the repository");
    expect(rows[1]?.textContent).toContain("Reading source files");
    expect(
      container.querySelector(".platform-activity-overview__tree-rail"),
    ).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Collapse activity" }),
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("insets nested chart cards so descendants never start at their parent edge", () => {
    const { container } = render(
      <PlatformActivityOverview
        items={[
          {
            id: "group",
            label: "Action group",
            content: <span>Action group</span>,
            startAt: 0,
            hierarchy: { depth: 0, order: 0 },
          },
          {
            id: "tool",
            label: "Tool call",
            content: <span>Tool call</span>,
            startAt: 1,
            hierarchy: { parentId: "group", depth: 1, order: 1 },
          },
        ]}
      />,
    );

    const nestedCard = Array.from(
      container.querySelectorAll<HTMLElement>(
        ".platform-activity-overview__custom-item",
      ),
    ).find((card) => card.textContent?.includes("Tool call"));
    expect(
      nestedCard?.style.getPropertyValue(
        "--platform-activity-overview-item-indent",
      ),
    ).toBe("8px");
  });

  it("starts parent chart scopes at the earliest descendant", () => {
    const { container } = render(
      <PlatformActivityOverview
        items={[
          {
            id: "group",
            label: "Action group",
            content: <span>Action group</span>,
            startAt: 100,
            hierarchy: { depth: 0, order: 0 },
          },
          {
            id: "tool",
            label: "Tool call",
            content: <span>Tool call</span>,
            startAt: 10,
            endAt: 20,
            hierarchy: { parentId: "group", depth: 1, order: 1 },
          },
        ]}
      />,
    );

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>(
        ".platform-activity-overview__custom-item",
      ),
    );
    expect(cards[0]?.style.getPropertyValue("--platform-activity-overview-item-left")).toBe(
      cards[1]?.style.getPropertyValue("--platform-activity-overview-item-left"),
    );
  });

  it("reclaims collapsed descendant rows for following activity", () => {
    const baseItems = [
      {
        id: "group",
        label: "Action group",
        content: <span>Action group</span>,
        startAt: 0,
        hierarchy: { expandable: true, expanded: true, order: 0, depth: 0 },
      },
      {
        id: "tool",
        label: "Tool call",
        content: <span>Tool call</span>,
        startAt: 1,
        hierarchy: { parentId: "group", order: 1, depth: 1 },
      },
      {
        id: "following",
        label: "Following activity",
        content: <span>Following activity</span>,
        startAt: 2,
        hierarchy: { order: 2, depth: 0 },
      },
    ];
    const { container, rerender } = render(
      <PlatformActivityOverview items={baseItems} />,
    );
    const findRowTop = (label: string) => Array.from(
      container.querySelectorAll<HTMLElement>(".platform-activity-overview__row"),
    ).find((row) => row.textContent?.includes(label))?.style.top;
    const expandedFollowingTop = findRowTop("Following activity");

    rerender(
      <PlatformActivityOverview
        items={baseItems.map((item) => (
          item.id === "group"
            ? { ...item, hierarchy: { ...item.hierarchy, expanded: false } }
            : item.id === "tool"
              ? { ...item, hidden: true }
              : item
        ))}
      />,
    );

    const collapsedFollowingTop = findRowTop("Following activity");
    expect(expandedFollowingTop).toBe("134px");
    expect(collapsedFollowingTop).toBe("76px");
    expect(container.textContent).not.toContain("Tool call");
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
    const findRowTop = (label: string) => Array.from(
      container.querySelectorAll<HTMLElement>(".platform-activity-overview__row"),
    ).find((row) => row.textContent?.includes(label))?.style.top;
    const middleRowTop = findRowTop("Middle");
    const lateRowTop = findRowTop("Late");
    vi.spyOn(minimap, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 60,
      top: 0,
      right: 100,
      bottom: 60,
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
    expect(findRowTop("Middle")).toBe(middleRowTop);
    expect(findRowTop("Late")).toBe(lateRowTop);
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

  it("pans the selected time window when the scrollable timeline moves", () => {
    const onTimeRangeChange = vi.fn();
    const { container } = render(
      <PlatformActivityOverview
        timelineLayout="scroll"
        items={[
          { id: "early", label: "Early", startAt: 0 },
          { id: "middle", label: "Middle", startAt: 50 },
          { id: "late", label: "Late", startAt: 100 },
        ]}
        onTimeRangeChange={onTimeRangeChange}
      />,
    );
    const viewport = container.querySelector<HTMLElement>(
      ".platform-activity-overview__viewport",
    );
    const minimap = container.querySelector<HTMLElement>(
      ".platform-activity-overview__minimap",
    );
    const startHandle = screen.getByRole("slider", {
      name: "Activity range start",
    });
    expect(viewport).not.toBeNull();
    expect(minimap).not.toBeNull();
    if (!viewport || !minimap) {
      throw new Error("Expected the scrollable activity timeline.");
    }
    Object.defineProperty(viewport, "clientWidth", {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(viewport, "scrollWidth", {
      configurable: true,
      value: 400,
    });
    vi.spyOn(minimap, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 60,
      top: 0,
      right: 100,
      bottom: 60,
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

    Object.defineProperty(viewport, "scrollLeft", {
      configurable: true,
      writable: true,
      value: 150,
    });
    fireEvent.scroll(viewport);

    expect(onTimeRangeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        startPercent: 12.5,
        endPercent: 87.5,
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
