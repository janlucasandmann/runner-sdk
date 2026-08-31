// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Code2, Rocket } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProjectOverviewRow } from "./projects-overview-model.js";
import { ProjectsOverviewPage } from "./projects-overview-page.js";

const rows: ProjectOverviewRow[] = [
  {
    id: "equal-care",
    name: "Equal Care",
    description: "Extract grounded evidence from publications.",
    icon: <Rocket width={16} height={16} strokeWidth={1.8} />,
    projectTypeLabel: "Research",
    status: "on_track",
    statusLabel: "On track",
    statusRank: 2,
    ownerName: "Jan Luca Sandmann",
    ownerFallback: "JL",
    updatedAt: Date.parse("2026-08-18T08:00:00Z"),
    updatedLabel: "Yesterday",
    updatedTitle: "Aug 18, 2026",
  },
  {
    id: "platform",
    name: "Computer Agents Platform",
    description: "Build the agent platform.",
    icon: <Code2 width={16} height={16} strokeWidth={1.8} />,
    projectTypeLabel: "Software",
    status: "in_progress",
    statusLabel: "In progress",
    statusRank: 1,
    ownerName: "Computer Agents",
    ownerAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
    updatedAt: Date.parse("2026-08-19T08:00:00Z"),
    updatedLabel: "Today",
    updatedTitle: "Aug 19, 2026",
  },
];

function renderPage(
  overrides: Partial<React.ComponentProps<typeof ProjectsOverviewPage>> = {},
) {
  return render(
    <ProjectsOverviewPage
      rows={rows}
      onOpen={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      {...overrides}
    />,
  );
}

afterEach(cleanup);

describe("ProjectsOverviewPage", () => {
  it("uses the same shared catalog composition as the Metronome overview", () => {
    const { container } = renderPage();

    expect(container.querySelector(".resource-overview-page.is-projects")).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Plan, build, and deliver shared work with agents",
      }),
    ).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-catalog-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(container.querySelector(".playground-tasks-project-grid")).toBeNull();
    expect(screen.getByRole("columnheader", { name: /owner/i })).not.toBeNull();
    expect(screen.getByRole("columnheader", { name: /updated/i })).not.toBeNull();
    expect(screen.queryByRole("button", { name: /filter/i })).toBeNull();
    expect(
      screen
        .getByRole("row", { name: "Equal Care" })
        .querySelector(".resource-overview-identity__visual.is-project .lucide-rocket"),
    ).not.toBeNull();
    expect(screen.getByText("Extract grounded evidence from publications.")).not.toBeNull();
    expect(
      screen
        .getByRole("row", { name: "Computer Agents Platform" })
        .querySelector(".resource-overview-identity__visual.is-creator img")
        ?.getAttribute("src"),
    ).toBe("/img/agent-profile-pics/ca-profilepic.jpg");

    const updatedHeader = screen.getByRole("columnheader", { name: /updated/i });
    expect(updatedHeader.getAttribute("aria-sort")).toBe("descending");
  });

  it("opens projects and exposes the shared row action menu", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderPage({ onOpen, onEdit, onDelete });

    await user.click(screen.getByRole("row", { name: "Equal Care" }));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);

    await user.click(screen.getByRole("button", { name: "Open actions for Equal Care" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledWith(rows[0]);

    await user.click(screen.getByRole("button", { name: "Open actions for Equal Care" }));
    const deleteAction = screen.getByRole("menuitem", { name: "Delete" });
    expect(deleteAction.classList.contains("is-danger")).toBe(true);
    await user.click(deleteAction);
    expect(onDelete).toHaveBeenCalledWith([rows[0]]);
  });

  it("filters projects with the table-owned search control", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText("Search projects"), "Equal Care");
    expect(screen.getByText("Equal Care")).not.toBeNull();
    expect(screen.queryByText("Computer Agents Platform")).toBeNull();
  });
});
