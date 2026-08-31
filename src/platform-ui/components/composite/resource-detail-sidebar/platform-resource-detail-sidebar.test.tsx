// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PlatformResourceDetailSidebar } from "./platform-resource-detail-sidebar.js";
import { PlatformResourceSettingsDetailsSidebar } from "./platform-resource-settings-details-sidebar.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("PlatformResourceDetailSidebar", () => {
  it("renders extensible attributes and the shared owner selector", async () => {
    const user = userEvent.setup();
    const onTransfer = vi.fn().mockResolvedValue(undefined);
    render(
      <PlatformResourceDetailSidebar
        attributes={[{ id: "updated", label: "Updated", value: "Just now" }]}
        creator={{ value: "creator-1", name: "Creator Name" }}
        owner={{ value: "owner-1", name: "Owner Name" }}
        ownerOptions={[
          { value: "owner-1", name: "Owner Name" },
          { value: "owner-2", name: "Next Owner" },
        ]}
        onOwnerTransfer={onTransfer}
        additionalAttributes={[{ id: "id", label: "ID", value: "resource-1" }]}
      />,
    );

    expect(screen.getByText("Updated")).toBeTruthy();
    expect(screen.getByText("Creator Name")).toBeTruthy();
    expect(screen.getByText("Owner Name")).toBeTruthy();
    expect(screen.getByText("resource-1").closest("details")?.open).toBe(false);

    await user.click(screen.getByText("More details"));
    expect(screen.getByText("resource-1")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Choose owner" }));
    await user.click(await screen.findByRole("option", { name: "Next Owner" }));
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(screen.getByText(/irreversible/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Transfer Ownership" }));
    expect(onTransfer).toHaveBeenCalledWith("owner-2", expect.objectContaining({ name: "Next Owner" }));
  });

  it("does not render an email address as the primary creator identity", () => {
    render(
      <PlatformResourceDetailSidebar
        creator={{
          value: "creator-1",
          name: "jane.doe@example.com",
          email: "jane.doe@example.com",
        }}
      />,
    );

    expect(screen.getByText("Jane Doe")).toBeTruthy();
    expect(screen.queryByText("jane.doe@example.com")).toBeNull();
  });

  it("keeps custom rows above invariant Settings details and owns the scope and action UI", async () => {
    const user = userEvent.setup();
    const onScopeChange = vi.fn();
    const onStart = vi.fn();
    const { container } = render(
      <PlatformResourceSettingsDetailsSidebar
        customAttributes={[{ id: "status", label: "Status", value: "Ready" }]}
        updatedAt="2020-04-15T10:30:00.000Z"
        creator={{ value: "creator-1", name: "Creator Name" }}
        owner={{ value: "owner-1", name: "Owner Name" }}
        scope={{
          values: [],
          options: [
            { value: "project-1", label: "Project Alpha" },
            { value: "project-2", label: "Project Beta" },
          ],
          onValuesChange: onScopeChange,
        }}
        primaryActions={[{ id: "start", label: "Start Thread", onSelect: onStart }]}
      />,
    );

    expect(
      [...container.querySelectorAll(".platform-service-detail-page__property-label")]
        .map((label) => label.textContent),
    ).toEqual(["Status", "Scope", "Updated", "Creator", "Owner"]);
    expect(screen.getByText(/2020/)).toBeTruthy();
    const primaryAction = screen.getByRole("button", { name: "Start Thread" });
    expect(primaryAction.querySelector("svg")).toBeNull();
    await user.click(primaryAction);
    expect(onStart).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Choose resource scope" }));
    expect(
      screen.getByRole("option", { name: "Independent" }).getAttribute("aria-selected"),
    ).toBe("true");
    await user.click(screen.getByRole("option", { name: "Project Alpha" }));
    expect(onScopeChange).toHaveBeenCalledWith(["project-1"]);
  });

  it("uses an icon-free primary split action when multiple actions exist", () => {
    const { container } = render(
      <PlatformResourceSettingsDetailsSidebar
        updatedAt="2020-04-15T10:30:00.000Z"
        creator={{ value: "creator-1", name: "Creator Name" }}
        owner={{ value: "owner-1", name: "Owner Name" }}
        scope={false}
        primaryActions={[
          { id: "run", label: "Run", onSelect: vi.fn() },
          { id: "preview", label: "Preview", onSelect: vi.fn() },
        ]}
      />,
    );

    expect(
      container.querySelector(".platform-button-selector__action")?.querySelector("svg"),
    ).toBeNull();
    expect(screen.queryByText("Scope")).toBeNull();
  });

  it("shows the selected Project icon before a single-project Scope label", () => {
    const { container } = render(
      <PlatformResourceSettingsDetailsSidebar
        updatedAt="2020-04-15T10:30:00.000Z"
        creator={{ value: "creator-1", name: "Creator Name" }}
        owner={{ value: "owner-1", name: "Owner Name" }}
        scope={{
          values: ["project-1"],
          options: [{
            value: "project-1",
            label: "Project Alpha",
            leading: <span data-testid="project-alpha-icon">A</span>,
          }],
          onValuesChange: vi.fn(),
        }}
        primaryActions={[{ id: "start", label: "Start Thread", onSelect: vi.fn() }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Choose resource scope" });
    expect(trigger.textContent).toContain("Project Alpha");
    expect(
      container.querySelector(".platform-resource-settings-details__scope-leading"),
    ).not.toBeNull();
    expect(screen.getByTestId("project-alpha-icon").closest("button")).toBe(trigger);
  });
});
