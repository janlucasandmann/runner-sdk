// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PlatformCalendarWidget,
  PlatformDefaultWidget,
  PlatformProjectWidget,
  PlatformProjectWidgetTask,
  PlatformProjectWidgetTaskList,
  PlatformUsageWidget,
  type PlatformCalendarWidgetView,
} from "./index.js";

afterEach(cleanup);

describe("PlatformDefaultWidget", () => {
  it("provides the shared shell and keyboard activation", () => {
    const onActivate = vi.fn();
    render(
      <PlatformDefaultWidget
        className="custom-widget"
        aria-label="Open widget"
        onActivate={onActivate}
      />
    );

    const widget = screen.getByRole("button", { name: "Open widget" });
    expect(widget.className).toBe("playground-thread-widget custom-widget is-clickable");
    expect(widget.tabIndex).toBe(0);

    fireEvent.keyDown(widget, { key: "Enter" });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});

describe("PlatformProjectWidget", () => {
  it("preserves project widget selectors, progress variables, and nested actions", () => {
    const onActivate = vi.fn();
    const onSwitchProject = vi.fn();
    const onOpenTask = vi.fn();
    const { container } = render(
      <PlatformProjectWidget
        title="Equal Care"
        wallpaperUrl="/img/bg/projects/mountains.webp"
        hasProject
        openTaskCount={3}
        totalTaskCount={5}
        aria-label="Open project backlog"
        onActivate={onActivate}
        onSwitchProject={onSwitchProject}
      >
        <PlatformProjectWidgetTaskList>
          <PlatformProjectWidgetTask
            title="Extract evidence"
            ticketNumber="EC-12"
            priority={<span data-testid="priority" />}
            onOpen={onOpenTask}
          />
        </PlatformProjectWidgetTaskList>
      </PlatformProjectWidget>
    );

    const widget = screen.getByRole("button", { name: "Open project backlog" });
    expect(widget.className).toBe(
      "playground-thread-widget playground-thread-widget-tasks playground-thread-home-project-widget is-clickable"
    );
    expect(container.querySelector(".playground-thread-widget-tasks-media")?.getAttribute("style"))
      .toContain("/img/bg/projects/mountains.webp");
    expect(
      (container.querySelector(".playground-thread-widget-tasks-progress") as HTMLElement)
        .style.getPropertyValue("--playground-project-task-progress")
    ).toBe("40%");

    fireEvent.click(screen.getByRole("button", { name: "Switch project" }));
    expect(onSwitchProject).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Extract evidence" }));
    expect(onOpenTask).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();
  });
});

describe("PlatformCalendarWidget", () => {
  it("preserves calendar selectors and owns local date navigation", () => {
    const onOpenCalendar = vi.fn();
    const buildView = vi.fn((dateKey: string): PlatformCalendarWidgetView => ({
      selectedDate: new Date(`${dateKey}T12:00:00`),
      selectedKey: dateKey,
      monthLabel: "July 2026",
      days: [{
        dateKey,
        weekdayLabel: "Tu",
        dayNumber: "14",
        isSelected: true,
        isToday: true,
        ariaLabel: "Show schedule for Tuesday, July 14",
      }],
      items: [{ id: "event-1", title: "Daily briefing", timeLabel: "9:00 AM" }],
    }));

    const { container } = render(
      <PlatformCalendarWidget
        initialDateKey="2026-07-14"
        buildView={buildView}
        onOpenCalendar={onOpenCalendar}
      />
    );

    const widget = container.querySelector(".playground-thread-widget-today") as HTMLElement;
    expect(widget.className).toBe("playground-thread-widget playground-thread-widget-today");
    expect(widget.dataset.selectedDateKey).toBe("2026-07-14");

    fireEvent.click(screen.getByRole("button", { name: "Next week" }));
    expect(buildView).toHaveBeenLastCalledWith("2026-07-21");

    fireEvent.click(screen.getByRole("button", { name: /Daily briefing/ }));
    expect(onOpenCalendar).toHaveBeenCalledTimes(1);
  });
});

describe("PlatformUsageWidget", () => {
  it("preserves usage selectors without adding the clickable presentation class", () => {
    const onActivate = vi.fn();
    const { container } = render(
      <PlatformUsageWidget
        aria-label="Open usage cost details"
        onActivate={onActivate}
        percentageLabel="75%"
        caption="$12.50 left"
        remaining="75.00%"
        meterBars={[20, 40, 60]}
      />
    );

    const widget = screen.getByRole("button", { name: "Open usage cost details" });
    expect(widget.className).toBe("playground-thread-widget playground-thread-widget-usage");
    expect(widget.style.getPropertyValue("--usage-remaining")).toBe("75.00%");
    expect(container.querySelectorAll(".playground-thread-widget-usage-bar")).toHaveLength(3);

    fireEvent.keyDown(widget, { key: " " });
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});
