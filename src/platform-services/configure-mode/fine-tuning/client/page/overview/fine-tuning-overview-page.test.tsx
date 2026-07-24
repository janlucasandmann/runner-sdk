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
  it("uses the Teams overview composition and shared minimal table", async () => {
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
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Fine-tuning jobs" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-minimalistic-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(
      screen.getByRole("navigation", { name: "Fine-tuning jobs pagination" }),
    ).not.toBeNull();
    expect(
      (screen.getByRole("combobox", { name: "Rows per page" }) as HTMLSelectElement).value,
    ).toBe("20");
    expect(screen.getByText("1-1 of 1")).not.toBeNull();
    expect(screen.getByText("All Fine-tuning Jobs")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search fine-tuning jobs")).not.toBeNull();

    await user.click(await screen.findByRole("button", { name: "Fine-Tune" }));
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Improve Support Agent"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });

  it("uses the centralized empty state when no fine-tuning jobs exist", () => {
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
      screen.getByRole("navigation", { name: "Fine-tuning jobs pagination" }),
    ).not.toBeNull();
    expect(screen.getByText("0-0 of 0")).not.toBeNull();
    expect(screen.getByText("No fine-tuning jobs yet")).not.toBeNull();
    expect(
      screen.getByText(
        "Fine-tuning jobs will appear here after you improve an agent with evaluated evidence.",
      ),
    ).not.toBeNull();
  });
});
