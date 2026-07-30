// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FineTuningOverviewPage, type FineTuningOverviewRow } from "./fine-tuning-overview-page.js";

const CONTROLS_PORTAL_ID = "fine-tuning-overview-test-controls";

const rows: readonly FineTuningOverviewRow[] = [
  {
    id: "fine-tune-support",
    name: "Improve Support Agent",
    agentLabel: "Spark",
    agentFallback: "S",
    evaluationSetCount: 2,
    improvementScore: 0.18,
    improvementLabel: "72% -> 90% +18",
    conductorLabel: "Jan",
    conductorFallback: "J",
    status: "completed",
  },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("FineTuningOverviewPage", () => {
  it("uses the Evaluations overview composition and shared catalog table", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);

    const { container } = render(
      <FineTuningOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={onOpen}
        onCreate={onCreate}
        onDelete={vi.fn()}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-fine-tuning")).not.toBeNull();
    expect(container.querySelector("[data-platform-page-hero='true']")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Improve agents with evaluated evidence" }),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(0);
    expect(screen.getByRole("table", { name: "Fine-tuning jobs" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-catalog-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__group-header")).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(
      screen.queryByRole("navigation", { name: "Fine-tuning jobs pagination" }),
    ).toBeNull();
    expect(screen.queryByText("All Fine-tuning Jobs")).toBeNull();
    expect(screen.getByPlaceholderText("Search optimization jobs")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Status" })).toBeNull();
    const jobRow = screen.getByRole("row", { name: "Improve Support Agent" });
    const jobCell = jobRow.querySelector(
      '.platform-data-table__cell[data-column-id="name"]',
    );
    expect(
      jobCell?.querySelector(".resource-overview-identity__visual"),
    ).toBeNull();

    await user.click(await screen.findByRole("button", { name: "Optimize Agent" }));
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Improve Support Agent"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });

  it("uses the centralized empty state when no optimization jobs exist", () => {
    const { container } = render(
      <FineTuningOverviewPage
        rows={[]}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(container.querySelector(".platform-empty-state")).not.toBeNull();
    expect(
      screen.queryByRole("navigation", { name: "Fine-tuning jobs pagination" }),
    ).toBeNull();
    expect(screen.getByText("No optimization jobs yet")).not.toBeNull();
    expect(
      screen.getByText(
        "Fine-tuning jobs will appear here after you improve an agent with evaluated evidence.",
      ),
    ).not.toBeNull();
  });
});
