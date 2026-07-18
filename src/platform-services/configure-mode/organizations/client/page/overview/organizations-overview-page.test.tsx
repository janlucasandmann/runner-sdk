// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  type OrganizationOverviewRow,
  OrganizationsOverviewPage,
} from "./organizations-overview-page.js";

const CONTROLS_PORTAL_ID = "organizations-overview-test-controls";

const rows: readonly OrganizationOverviewRow[] = [
  {
    id: "org-platform",
    name: "Platform Organization",
    roleLabel: "Owner",
    type: "company",
    typeLabel: "Company",
    isActive: true,
    canRename: true,
  },
  {
    id: "org-personal",
    name: "Personal Organization",
    roleLabel: "Member",
    type: "personal",
    typeLabel: "Personal",
    isActive: false,
    canRename: false,
  },
];

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("OrganizationsOverviewPage", () => {
  it("uses the same shared overview composition as Teams", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCreate = vi.fn();
    const onOpenDocumentation = vi.fn();
    const controls = document.createElement("div");
    controls.id = CONTROLS_PORTAL_ID;
    document.body.append(controls);

    const { container } = render(
      <OrganizationsOverviewPage
        rows={rows}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={onOpen}
        onCreate={onCreate}
        onActivate={vi.fn()}
        onRename={vi.fn()}
        onOpenDocumentation={onOpenDocumentation}
      />,
    );

    expect(container.querySelector(".resource-overview-page.is-organizations")).not.toBeNull();
    expect(container.querySelector("[data-platform-page-hero='true']")).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Coordinate work across organizations" }),
    ).not.toBeNull();
    expect(container.querySelectorAll(".platform-ui-card")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Organizations" })).not.toBeNull();
    expect(container.querySelector(".platform-data-table.is-minimalistic-ui")).not.toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(screen.getByText("All Organizations")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search organizations")).not.toBeNull();

    const createButton = await screen.findByRole("button", { name: "New Organization" });
    await user.click(createButton);
    expect(onCreate).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Organization Documentation" }));
    expect(onOpenDocumentation).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Platform Organization"));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });
});
