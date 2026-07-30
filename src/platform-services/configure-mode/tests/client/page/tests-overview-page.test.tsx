// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
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
});
