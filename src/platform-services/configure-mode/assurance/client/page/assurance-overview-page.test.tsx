// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type AssurancePolicyOverviewRow,
  AssuranceOverviewPage,
} from "./assurance-overview-page.js";

const CONTROLS_PORTAL_ID = "assurance-overview-test-controls";

const rows: readonly AssurancePolicyOverviewRow[] = [
  {
    id: "policy-release",
    name: "Release assurance",
    projectLabel: "Runner",
    gateCount: 4,
    runCount: 2,
    passedRunCount: 1,
    blockedRunCount: 0,
    lastRunStatus: "passed",
    updatedAt: 1_720_000_000_000,
    updatedLabel: "Jul 3, 2024",
  },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("AssuranceOverviewPage", () => {
  it("uses the Evaluations overview composition and shared catalog table", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const onOpen = vi.fn();
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);
    const { container } = render(
      <AssuranceOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={onOpen}
        onCreate={onCreate}
      />,
    );

    expect(
      container.querySelector(".resource-overview-page.is-assurance"),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Ship only what the evidence proves.",
      }),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(0);
    expect(container.querySelector(".platform-data-table.is-catalog-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__group-header")).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.queryByText("All Assurance Policies")).toBeNull();
    expect(screen.queryByRole("button", { name: "Decision" })).toBeNull();
    expect(screen.getByPlaceholderText("Search Assurance Policies")).not.toBeNull();
    const policyRow = screen.getByRole("row", { name: "Release assurance" });
    const policyCell = policyRow.querySelector(
      '.platform-data-table__cell[data-column-id="name"]',
    );
    expect(
      policyCell?.querySelector(".resource-overview-identity__visual"),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Assurance Policy" }));
    expect(onCreate).toHaveBeenCalledOnce();
    await user.click(screen.getByText("Release assurance"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });
});
