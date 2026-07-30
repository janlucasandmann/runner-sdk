// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type EvaluationOverviewRow,
  EvaluationsOverviewPage,
} from "./evaluations-overview-page.js";

const CONTROLS_PORTAL_ID = "evaluations-overview-test-controls";

const rows: readonly EvaluationOverviewRow[] = [
  {
    id: "evaluation-support",
    name: "Support Quality",
    evaluatorLabel: "Spark",
    evaluatorType: "agent",
    evaluatorFallback: "S",
    caseCount: 12,
    runCount: 4,
    creatorLabel: "Jan",
    creatorFallback: "J",
    updatedAt: 1_720_000_000_000,
    updatedLabel: "Jul 3, 2024",
    canRun: true,
  },
  {
    id: "evaluation-code",
    name: "Code Quality",
    evaluatorLabel: "Exact match",
    evaluatorType: "exact",
    evaluatorFallback: "E",
    caseCount: 8,
    runCount: 2,
    creatorLabel: "Jan",
    creatorFallback: "J",
    updatedAt: 1_719_900_000_000,
    updatedLabel: "Jul 2, 2024",
    canRun: true,
  },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("EvaluationsOverviewPage", () => {
  it("uses the Skills overview composition and shared catalog table", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
    const onDeleteMany = vi.fn();
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);

    const { container } = render(
      <EvaluationsOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={onOpen}
        onCreate={onCreate}
        onRename={vi.fn()}
        onRun={vi.fn()}
        onDelete={vi.fn()}
        onDeleteMany={onDeleteMany}
      />,
    );

    expect(
      container.querySelector(".resource-overview-page.is-evaluations"),
    ).not.toBeNull();
    expect(
      container.querySelector("[data-platform-page-hero='true']"),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Measure agent performance with confidence",
      }),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(0);
    expect(screen.getByRole("table", { name: "Evaluations" })).not.toBeNull();
    expect(
      container.querySelector(".platform-data-table.is-catalog-ui"),
    ).not.toBeNull();
    expect(
      container.querySelector(".platform-data-table__group-header"),
    ).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.queryByText("All Evaluations")).toBeNull();
    expect(screen.getByPlaceholderText("Search evaluations")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Runs" })).toBeNull();
    expect(
      screen.getByRole("checkbox", { name: "Select all visible rows" }),
    ).not.toBeNull();
    const supportRow = screen.getByRole("row", { name: "Support Quality" });
    const evaluationCell = supportRow.querySelector(
      '.platform-data-table__cell[data-column-id="name"]',
    );
    expect(
      evaluationCell?.querySelector(".resource-overview-identity__visual"),
    ).toBeNull();
    expect(
      evaluationCell?.querySelector(".resource-overview-identity__title")
        ?.textContent,
    ).toBe("Support Quality");

    await user.click(await screen.findByRole("button", { name: "Evaluation" }));
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Support Quality"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);

    await user.click(
      screen.getByRole("checkbox", { name: "Select Support Quality" }),
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Select Code Quality" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Open actions for Support Quality" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "Delete selected" }));

    expect(onDeleteMany).toHaveBeenCalledOnce();
    expect(
      onDeleteMany.mock.calls[0]?.[0]
        .map((row: EvaluationOverviewRow) => row.id)
        .sort(),
    ).toEqual(["evaluation-code", "evaluation-support"]);
  });
});
