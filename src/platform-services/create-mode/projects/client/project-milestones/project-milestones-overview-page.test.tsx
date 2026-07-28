// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlatformAnalyticsModel } from "../../../../../platform-ui/components/composite/analytics/index.js";
import {
  ProjectMilestonesOverviewPage,
  type ProjectMilestonesOverviewRow,
} from "./project-milestones-overview-page.js";

const analytics: PlatformAnalyticsModel = {
  title: "Milestone progress",
  labels: [],
  metrics: [
    { id: "total", label: "Milestones", value: 1, color: "#7effff" },
  ],
  series: [],
  hasData: false,
};

const milestone: ProjectMilestonesOverviewRow = {
  id: "milestone-pilot",
  name: "Pilot Ready",
  statusLabel: "Active",
  statusVariant: "blue",
  statusRank: 2,
  progressPercent: 60,
  ticketCount: 5,
  completedTicketCount: 3,
  targetLabel: "Aug 15, 2026",
  updatedLabel: "Jul 27, 2026",
  updatedTimestamp: Date.UTC(2026, 6, 27),
};

afterEach(() => {
  cleanup();
});

describe("ProjectMilestonesOverviewPage", () => {
  it("opens milestones and exposes the create action", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onOpen = vi.fn();

    render(
      <ProjectMilestonesOverviewPage
        rows={[milestone]}
        analytics={analytics}
        onCreate={onCreate}
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText("All Milestones")).not.toBeNull();
    expect(screen.getByLabelText("60% complete")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Milestone" }));
    await user.click(screen.getByText("Pilot Ready"));

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(milestone);
  });
});
