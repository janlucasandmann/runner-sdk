// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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
  it("uses the centralized empty state when no evaluations exist", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const { container } = render(
      <EvaluationsOverviewPage
        rows={[]}
        onOpen={vi.fn()}
        onCreate={onCreate}
        onRename={vi.fn()}
        onRun={vi.fn()}
        onDelete={vi.fn()}
        onDeleteMany={vi.fn()}
      />,
    );

    expect(
      container.querySelector(".platform-empty-state"),
    ).not.toBeNull();
    expect(screen.getByText("No evaluations yet")).not.toBeNull();
    expect(
      screen.getByText(
        "Create an evaluation to measure agent quality against repeatable cases and criteria.",
      ),
    ).not.toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Create Evaluation" }),
    );
    expect(onCreate).toHaveBeenCalledOnce();
  });

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
    expect(screen.queryByRole("columnheader", { name: "Evaluator" })).toBeNull();
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

  it("reveals evaluations in shared 20 then 10 row increments on page scroll", async () => {
    const evaluationRows: EvaluationOverviewRow[] = Array.from(
      { length: 35 },
      (_, index) => ({
        ...rows[0],
        id: `evaluation-${index + 1}`,
        name: `Evaluation ${String(index + 1).padStart(2, "0")}`,
        updatedAt: 35 - index,
      }),
    );
    const { container } = render(
      <EvaluationsOverviewPage
        rows={evaluationRows}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onRun={vi.fn()}
        onDelete={vi.fn()}
        onDeleteMany={vi.fn()}
      />,
    );
    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 0, writable: true },
      getBoundingClientRect: {
        configurable: true,
        value: () => ({
          top: 200,
          right: 800,
          bottom: 760,
          left: 0,
          width: 800,
          height: 560,
          x: 0,
          y: 200,
          toJSON: () => ({}),
        }),
      },
    });

    expect(screen.getByText("Evaluation 20")).not.toBeNull();
    expect(screen.queryByText("Evaluation 21")).toBeNull();

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.getByText("Evaluation 30")).not.toBeNull();
    });
    expect(screen.queryByText("Evaluation 31")).toBeNull();
  });

  it("requests the next remote evaluation page when the visible page reaches the boundary", async () => {
    const onLoadMore = vi.fn().mockResolvedValue(undefined);
    const evaluationRows: EvaluationOverviewRow[] = Array.from(
      { length: 20 },
      (_, index) => ({
        ...rows[0],
        id: `remote-evaluation-${index + 1}`,
        name: `Remote Evaluation ${index + 1}`,
        updatedAt: 20 - index,
      }),
    );
    const { container } = render(
      <EvaluationsOverviewPage
        rows={evaluationRows}
        incrementalLoading={{ hasMore: true, onLoadMore }}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onRun={vi.fn()}
        onDelete={vi.fn()}
        onDeleteMany={vi.fn()}
      />,
    );
    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 0, writable: true },
      getBoundingClientRect: {
        configurable: true,
        value: () => ({
          top: 200,
          right: 800,
          bottom: 760,
          left: 0,
          width: 800,
          height: 560,
          x: 0,
          y: 200,
          toJSON: () => ({}),
        }),
      },
    });

    fireEvent.scroll(window);

    await waitFor(() => expect(onLoadMore).toHaveBeenCalledOnce());
  });
});
