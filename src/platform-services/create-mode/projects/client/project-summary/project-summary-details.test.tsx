// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Database } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectSummaryDetails } from "./project-summary-details.js";

afterEach(cleanup);

describe("ProjectSummaryDetails", () => {
  it("renders accessible teams and resources in dedicated rows", () => {
    const onResourceSelect = vi.fn();
    const database = {
      id: "database-1",
      name: "Evidence DB",
      icon: <Database aria-hidden="true" />,
    };

    render(
      <ProjectSummaryDetails
        teams={[
          {
            id: "team-1",
            name: "Research",
            imageUrl: "/img/research.webp",
          },
        ]}
        resources={[database]}
        onResourceSelect={onResourceSelect}
      />,
    );

    expect(screen.getByText("Teams")).not.toBeNull();
    expect(screen.getByText("Research")).not.toBeNull();
    expect(screen.getByText("Resources")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Evidence DB" }));
    expect(onResourceSelect).toHaveBeenCalledWith(database);
  });

  it("renders concise empty states", () => {
    render(<ProjectSummaryDetails teams={[]} resources={[]} />);

    expect(screen.getByText("No teams have access")).not.toBeNull();
    expect(screen.getByText("No resources connected")).not.toBeNull();
  });

  it("limits row content and exposes shared section navigation actions", () => {
    const onTeamsSelect = vi.fn();
    const onResourcesSelect = vi.fn();
    render(
      <ProjectSummaryDetails
        teams={[
          { id: "team-1", name: "Team One" },
          { id: "team-2", name: "Team Two" },
          { id: "team-3", name: "Team Three" },
          { id: "team-4", name: "Team Four" },
        ]}
        resources={[
          { id: "resource-1", name: "Resource One" },
          { id: "resource-2", name: "Resource Two" },
          { id: "resource-3", name: "Resource Three" },
          { id: "resource-4", name: "Resource Four" },
        ]}
        onTeamsSelect={onTeamsSelect}
        onResourcesSelect={onResourcesSelect}
      />,
    );

    expect(screen.queryByText("Team Four")).toBeNull();
    expect(screen.queryByText("Resource Four")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Teams" }));
    fireEvent.click(screen.getByRole("button", { name: "Show all teams" }));
    fireEvent.click(screen.getByRole("button", { name: "Resources" }));
    fireEvent.click(screen.getByRole("button", { name: "Show all resources" }));

    expect(onTeamsSelect).toHaveBeenCalledTimes(2);
    expect(onResourcesSelect).toHaveBeenCalledTimes(2);
  });
});
