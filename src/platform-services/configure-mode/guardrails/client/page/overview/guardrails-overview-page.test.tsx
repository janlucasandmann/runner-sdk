// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type GuardrailOverviewRow, GuardrailsOverviewPage } from "./guardrails-overview-page.js";

const CONTROLS_PORTAL_ID = "guardrails-overview-test-controls";

const rows: readonly GuardrailOverviewRow[] = [
  {
    id: "guardrail-default",
    name: "Platform Safety",
    description: "Built-in platform safety constraints.",
    type: "default",
    typeLabel: "Default",
    creatorName: "Computer Agents",
    creatorAvatarUrl: "/computer-agents.png",
    creatorFallback: "CA",
    updatedAt: 1_720_000_000_000,
  },
  {
    id: "guardrail-custom",
    name: "Publishing Policy",
    description: "Checks publishing requests before execution.",
    type: "custom",
    typeLabel: "Custom",
    creatorName: "Jan",
    creatorAvatarUrl: "/jan.png",
    creatorFallback: "J",
    updatedAt: 1_710_000_000_000,
  },
  {
    id: "guardrail-custom-2",
    name: "Release Policy",
    description: "Protects production releases.",
    type: "custom",
    typeLabel: "Custom",
    creatorName: "Jan",
    creatorFallback: "J",
    updatedAt: 1_700_000_000_000,
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
    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual(["", "Name", "Creator", "Updated", ""]);
    const customRow = screen.getByRole("row", { name: "Publishing Policy" });
    const setCell = customRow.querySelector(
      '.platform-data-table__cell[data-column-id="name"]',
    );
    expect(
      setCell?.querySelector(".resource-overview-identity__visual"),
    ).not.toBeNull();
    expect(container.querySelector(".resource-overview-standard-name-cell")).not.toBeNull();
    expect(container.querySelector(".resource-overview-standard-creator-cell")).not.toBeNull();
    expect(screen.getByText("Checks publishing requests before execution.")).not.toBeNull();
    expect(container.querySelector('img[src="/jan.png"]')).not.toBeNull();

    await user.click(await screen.findByRole("button", { name: "New Set" }));
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Publishing Policy"));
    expect(onOpen).toHaveBeenCalledWith(rows[1]);
  });

  it("deletes all selected custom sets from a selected row menu", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <GuardrailsOverviewPage
        rows={rows}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(
      screen.getByRole("checkbox", { name: "Select Publishing Policy" }),
    );
    await user.click(
      screen.getByRole("checkbox", { name: "Select Release Policy" }),
    );
    fireEvent.contextMenu(
      screen.getByRole("row", { name: "Publishing Policy" }),
      { clientX: 120, clientY: 80 },
    );
    await user.click(
      screen.getByRole("menuitem", { name: "Delete selected" }),
    );

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledWith([rows[1], rows[2]]);
  });

  it("uses the centralized table loading state", () => {
    const { container } = render(
      <GuardrailsOverviewPage
        rows={[]}
        loading
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("status", { name: "Loading Guardrail sets…" }),
    ).not.toBeNull();
    expect(
      container.querySelector(
        '.platform-data-table__state.has-loading-state img[src="/img/spinner.svg"]',
      ),
    ).not.toBeNull();
  });
});
