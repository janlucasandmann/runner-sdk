// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PlatformActivityWorkspace } from "./platform-activity-workspace.js";

const activityItem = {
  id: "activity-1",
  label: "Created PRO-001",
  startAt: "2030-07-25T08:00:00.000Z",
};

const timelineItem = {
  id: "activity-1",
  summary: "Spark created PRO-001",
  preview: <div>Ticket creation details</div>,
};

afterEach(cleanup);

describe("PlatformActivityWorkspace", () => {
  it("composes the shared activity overview and inspector timeline", () => {
    render(
      <PlatformActivityWorkspace
        overviewProps={{
          ariaLabel: "Thread activity over time",
          items: [activityItem],
          timelineLayout: "fit",
        }}
        timelineProps={{
          inspectorTitle: "Inspector",
          items: [timelineItem],
          layout: "inspector",
          title: "Activity",
        }}
      />,
    );

    expect(screen.getByRole("region", { name: "Thread activity over time" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Activity" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Inspector" })).toBeTruthy();
    expect(screen.getByText("Ticket creation details")).toBeTruthy();
  });

  it("uses the shared loading state without mounting the timeline", () => {
    render(
      <PlatformActivityWorkspace
        overviewProps={{ items: [activityItem] }}
        timelineLoading
        timelineLoadingMessage="Loading thread activity..."
        timelineProps={{ items: [timelineItem], layout: "inspector" }}
      />,
    );

    expect(screen.getByText("Loading thread activity...")).toBeTruthy();
    expect(screen.queryByText("Ticket creation details")).toBeNull();
  });
});
