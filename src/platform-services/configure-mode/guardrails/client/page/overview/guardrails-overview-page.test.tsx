// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type GuardrailOverviewRow, GuardrailsOverviewPage } from "./guardrails-overview-page.js";

const CONTROLS_PORTAL_ID = "guardrails-overview-test-controls";

const rows: readonly GuardrailOverviewRow[] = [
  {
    id: "guardrail-default",
    name: "Platform Safety",
    type: "default",
    typeLabel: "Default",
    creatorLabel: "Computer Agents",
    creatorFallback: "CA",
    updatedAt: 1_720_000_000_000,
    updatedLabel: "Jul 3, 2024",
  },
  {
    id: "guardrail-custom",
    name: "Publishing Policy",
    type: "custom",
    typeLabel: "Custom",
    creatorLabel: "Jan",
    creatorFallback: "J",
    updatedAt: 1_710_000_000_000,
    updatedLabel: "Mar 9, 2024",
  },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("GuardrailsOverviewPage", () => {
  it("uses the Evaluations overview composition and shared catalog table", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);

    const { container } = render(
      <GuardrailsOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={onOpen}
        onCreate={onCreate}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-guardrails")).not.toBeNull();
    expect(container.querySelector("[data-platform-page-hero='true']")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Set reliable boundaries for agents" }),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(0);
    expect(screen.getByRole("table", { name: "Guardrail sets" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-catalog-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__group-header")).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.queryByText("All Guardrails")).toBeNull();
    expect(screen.getByPlaceholderText("Search guardrails")).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Type" })).toBeNull();
    const customRow = screen.getByRole("row", { name: "Publishing Policy" });
    const setCell = customRow.querySelector(
      '.platform-data-table__cell[data-column-id="name"]',
    );
    expect(
      setCell?.querySelector(".resource-overview-identity__visual"),
    ).toBeNull();

    await user.click(await screen.findByRole("button", { name: "New Set" }));
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Publishing Policy"));
    expect(onOpen).toHaveBeenCalledWith(rows[1]);
  });
});
