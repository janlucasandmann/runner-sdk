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
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("EvaluationsOverviewPage", () => {
  it("uses the Teams overview composition and shared minimal table", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
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
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-evaluations")).not.toBeNull();
    expect(container.querySelector("[data-platform-page-hero='true']")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Measure agent performance with confidence" }),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Evaluations" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-minimalistic-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.getByText("All Evaluations")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search evaluations")).not.toBeNull();

    await user.click(await screen.findByRole("button", { name: "Evaluation" }));
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Support Quality"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });
});
