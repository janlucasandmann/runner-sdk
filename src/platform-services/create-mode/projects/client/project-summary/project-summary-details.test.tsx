// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Database } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectSummaryDetails } from "./project-summary-details.js";

afterEach(cleanup);

describe("ProjectSummaryDetails", () => {
  it("renders accessible resources and milestones in dedicated rows", () => {
    const onResourceSelect = vi.fn();
    const onMilestoneSelect = vi.fn();
    const database = {
      id: "database-1",
      name: "Evidence DB",
      icon: <Database aria-hidden="true" />,
    };
    const milestone = {
      id: "milestone-1",
      name: "Pilot Ready",
      progressPercent: 60,
    };

    render(
      <ProjectSummaryDetails
        resources={[database]}
        milestones={[milestone]}
        onResourceSelect={onResourceSelect}
        onMilestoneSelect={onMilestoneSelect}
      />,
    );

    expect(screen.getByText("Resources")).not.toBeNull();
    expect(screen.getByText("Milestones")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Evidence DB" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Pilot Ready, 60% complete" }),
    );
    expect(onResourceSelect).toHaveBeenCalledWith(database);
    expect(onMilestoneSelect).toHaveBeenCalledWith(milestone);
  });

  it("renders concise empty states", () => {
    render(<ProjectSummaryDetails resources={[]} />);

    expect(screen.getByText("No resources connected")).not.toBeNull();
    expect(screen.getByText("No milestones yet")).not.toBeNull();
  });

  it("limits row content and exposes shared section navigation actions", () => {
    const onResourcesSelect = vi.fn();
    const onMilestonesSelect = vi.fn();
    render(
      <ProjectSummaryDetails
        resources={[
          { id: "resource-1", name: "Resource One" },
          { id: "resource-2", name: "Resource Two" },
          { id: "resource-3", name: "Resource Three" },
          { id: "resource-4", name: "Resource Four" },
        ]}
        milestones={[
          { id: "milestone-1", name: "Milestone One", progressPercent: 10 },
          { id: "milestone-2", name: "Milestone Two", progressPercent: 20 },
          { id: "milestone-3", name: "Milestone Three", progressPercent: 30 },
          { id: "milestone-4", name: "Milestone Four", progressPercent: 40 },
        ]}
        onResourcesSelect={onResourcesSelect}
        onMilestonesSelect={onMilestonesSelect}
      />,
    );

    expect(screen.queryByText("Resource Four")).toBeNull();
    expect(screen.queryByText("Milestone Four")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Resources" }));
    fireEvent.click(screen.getByRole("button", { name: "Show all resources" }));
    fireEvent.click(screen.getByRole("button", { name: "Milestones" }));
    fireEvent.click(screen.getByRole("button", { name: "Show all milestones" }));

    expect(onResourcesSelect).toHaveBeenCalledTimes(2);
    expect(onMilestonesSelect).toHaveBeenCalledTimes(2);
  });
});
