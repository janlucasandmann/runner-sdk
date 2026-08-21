// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type TestPlanOverviewRow,
  TestsOverviewPage,
} from "./tests-overview-page.js";

const CONTROLS_PORTAL_ID = "tests-overview-test-controls";

const rows: readonly TestPlanOverviewRow[] = [
  {
    id: "plan-release",
    name: "Release checks",
    projectLabel: "Runner",
    caseCount: 6,
    runCount: 3,
    passedRunCount: 2,
    lastRunStatus: "passed",
    updatedAt: 1_720_000_000_000,
    updatedLabel: "Jul 3, 2024",
  },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("TestsOverviewPage", () => {
  it("uses the Evaluations overview composition and shared catalog table", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onOpen = vi.fn();
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);
    const { container } = render(
      <TestsOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={onOpen}
        onCreate={onCreate}
        onRun={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-tests")).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Prove every component works before delivery",
      }),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(0);
    expect(container.querySelector(".platform-data-table.is-catalog-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__group-header")).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.queryByText("All Test Plans")).toBeNull();
    expect(screen.queryByRole("button", { name: "Status" })).toBeNull();
    expect(screen.getByPlaceholderText("Search test plans")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Test Plan" }));
    expect(onCreate).toHaveBeenCalledOnce();
    await user.click(screen.getByText("Release checks"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });

  it("requests ten more tests when the initial twenty reach the scroll boundary", () => {
    const onLoadMore = vi.fn();
    const initialRows = Array.from({ length: 20 }, (_, index): TestPlanOverviewRow => ({
      ...rows[0],
      id: `plan-${index + 1}`,
      name: `Test plan ${index + 1}`,
      updatedAt: rows[0].updatedAt - index,
    }));
    const { container } = render(
      <TestsOverviewPage
        rows={initialRows}
        incrementalLoading={{
          hasMore: true,
          onLoadMore,
          loadingMessage: "Loading more tests...",
        }}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRun={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 600, writable: true },
    });

    fireEvent.scroll(scroll as HTMLElement);
    fireEvent.scroll(scroll as HTMLElement);

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
