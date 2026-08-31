// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLATFORM_PERMISSION_ACCESS_OPTIONS } from "./permission-model.js";
import {
  PlatformPermissionsPage,
  PlatformPermissionsSettingsSummary,
} from "./platform-permissions-page.js";
import { PlatformRolePermissionsPage } from "./platform-role-permissions-page.js";

const rings = [
  {
    id: "ring_1",
    number: 1,
    label: "Ring 1",
    shortLabel: "Local",
    title: "Local workspace",
    description: "Local actions",
    defaultAccess: "full_access",
  },
  {
    id: "ring_2",
    number: 2,
    label: "Ring 2",
    shortLabel: "Shared",
    title: "Shared workspace",
    description: "Shared actions",
    defaultAccess: "ask_for_permission",
  },
] as const;

const actions = [
  {
    id: "workspace_read",
    ringId: "ring_1",
    label: "Read workspace",
    description: "Read local files",
  },
  {
    id: "team_member_invite",
    ringId: "ring_2",
    label: "Invite members",
    description: "Invite team members",
    subjectTypes: ["team_role"],
  },
] as const;

const canvasContext = {
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  clip: vi.fn(),
  createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fill: vi.fn(),
  rect: vi.fn(),
  restore: vi.fn(),
  save: vi.fn(),
  setTransform: vi.fn(),
  stroke: vi.fn(),
};

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(canvasContext as never);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(performance.now() + 300);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlatformPermissionsPage", () => {
  it("renders a compact read-only settings summary with a primary edit action", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const { container } = render(
      <PlatformPermissionsSettingsSummary
        title="Agent Permissions"
        tooltip="Explains Agent permissions."
        permissionSet={{
          subjectType: "agent",
          rings: {
            ring_1: { defaultAccess: "full_access" },
            ring_2: { defaultAccess: "ask_for_permission" },
          },
        }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        onEdit={onEdit}
      />,
    );

    expect(screen.getByRole("heading", { name: "Agent Permissions" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "About Agent Permissions" })).not.toBeNull();
    expect(
      container.querySelector("[data-platform-permissions-overview='compact']"),
    ).not.toBeNull();
    const editButton = screen.getByRole("button", { name: "Edit" });
    expect(editButton.getAttribute("data-platform-button-variant")).toBe("primary");
    expect(
      screen.getByRole("button", { name: "Ring 1 default permissions" }).hasAttribute("disabled"),
    ).toBe(true);

    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("supports editable ring selectors when a settings summary provides a change handler", async () => {
    const user = userEvent.setup();
    const onRingAccessChange = vi.fn();
    render(
      <PlatformPermissionsSettingsSummary
        title="Agent Permissions"
        permissionSet={{
          subjectType: "agent",
          rings: {
            ring_1: { defaultAccess: "full_access" },
            ring_2: { defaultAccess: "ask_for_permission" },
          },
        }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        onRingAccessChange={onRingAccessChange}
      />,
    );

    const ringSelector = screen.getByRole("button", { name: "Ring 1 default permissions" });
    expect(ringSelector.hasAttribute("disabled")).toBe(false);
    await user.click(ringSelector);
    await user.click(screen.getByRole("option", { name: "Read only" }));

    expect(onRingAccessChange).toHaveBeenCalledWith("ring_1", "read_only");
  });

  it("renders the canonical ring and action editor and emits changes", async () => {
    const user = userEvent.setup();
    const onRingAccessChange = vi.fn();
    const onActionRingChange = vi.fn();
    const onActionAccessChange = vi.fn();

    const { container } = render(
      <PlatformPermissionsPage
        permissionSet={{
          subjectType: "agent",
          rings: {
            ring_1: { defaultAccess: "full_access" },
            ring_2: { defaultAccess: "ask_for_permission" },
          },
          actions: {
            workspace_read: { ringId: "ring_1", access: "read_only" },
          },
        }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        actionDefinitions={actions}
        subjectType="agent"
        onRingAccessChange={onRingAccessChange}
        onActionRingChange={onActionRingChange}
        onActionAccessChange={onActionAccessChange}
      />,
    );

    expect(container.querySelector("[data-platform-permissions-page='true']")).not.toBeNull();
    expect(screen.getByText("Read workspace")).not.toBeNull();
    expect(screen.getByText("Override").getAttribute("data-platform-label-variant")).toBe("blue");
    expect(screen.queryByText("Invite members")).toBeNull();
    expect(container.querySelectorAll("[data-platform-settings-section-list='true']")).toHaveLength(
      1,
    );
    expect(container.querySelectorAll("[data-platform-settings-section='true']")).toHaveLength(2);
    expect(container.querySelectorAll(".platform-permissions-page__ring-table")).toHaveLength(2);
    expect(container.querySelectorAll(".platform-settings-data-table")).toHaveLength(2);
    expect(container.querySelectorAll(".platform-data-table.is-minimalistic-ui")).toHaveLength(2);
    expect(container.querySelector(".platform-data-table__toolbar")).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(container.querySelector(".platform-data-table__pagination")).toBeNull();
    expect(container.querySelector("select")).toBeNull();
    expect(container.querySelectorAll(".platform-selector")).toHaveLength(4);
    expect(container.querySelectorAll(".hugeicons-chevrons-up-down")).toHaveLength(4);

    const ringOneTable = screen.getByRole("table", { name: "Ring 1 permissions" });
    expect(
      ringOneTable.querySelector<HTMLElement>(".platform-data-table__header")?.style
        .gridTemplateColumns,
    ).toBe("minmax(0, 1fr) 104px 126px");
    expect(within(ringOneTable).getByRole("columnheader", { name: /Ring 1/ })).not.toBeNull();
    expect(within(ringOneTable).getByRole("columnheader", { name: "Ring" })).not.toBeNull();
    expect(within(ringOneTable).getByRole("columnheader", { name: "Permission" })).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Ring 1 default permissions" }));
    expect(document.body.querySelector(".platform-popup-surface.is-portaled")).not.toBeNull();
    expect(container.querySelector(".platform-popup-surface")).toBeNull();
    await user.click(screen.getByRole("option", { name: "Read only" }));

    await user.click(screen.getByRole("button", { name: "Read workspace ring" }));
    await user.click(screen.getByRole("option", { name: "Ring 2 · Shared" }));

    await user.click(screen.getByRole("button", { name: "Read workspace permissions" }));
    expect(
      screen
        .getByRole("listbox", { name: "Read workspace permissions options" })
        .closest(".platform-popup-surface")
        ?.getAttribute("data-platform-popup-placement"),
    ).toBe("bottom-end");
    await user.click(screen.getByRole("option", { name: "No access" }));

    expect(onRingAccessChange).toHaveBeenCalledWith("ring_1", "read_only");
    expect(onActionRingChange).toHaveBeenCalledWith("workspace_read", "ring_2");
    expect(onActionAccessChange).toHaveBeenCalledWith("workspace_read", "no_access");
  });

  it("renders one searchable action table with ordered ring sections", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <PlatformPermissionsPage
        permissionSet={{ subjectType: "team_role" }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        actionDefinitions={actions.map(({ subjectTypes: _subjectTypes, ...action }) => action)}
        subjectType="agent"
        actionTablePresentation="grouped-rings"
      />,
    );

    expect(container.querySelectorAll(".platform-settings-data-table")).toHaveLength(1);
    expect(container.querySelectorAll(".platform-data-table__group-header")).toHaveLength(2);
    expect(container.querySelector(".platform-data-table__group-chevron")).toBeNull();
    expect(
      container.querySelectorAll(
        ".platform-data-table__group-header .platform-permission-mini-ring-icon",
      ),
    ).toHaveLength(2);
    expect(
      container.querySelectorAll(".platform-data-table__group-indicator"),
    ).toHaveLength(0);
    expect(
      screen
        .getByRole("columnheader", { name: "Permission" })
        .classList.contains("platform-permissions-page__permission-column"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Read workspace permissions" })
        .closest(".platform-selector")
        ?.classList.contains("is-align-end"),
    ).toBe(true);
    expect(container.querySelector("[data-platform-settings-section-list='true']")).toBeNull();
    expect(screen.getByText("Read workspace")).not.toBeNull();
    expect(screen.getByText("Invite members")).not.toBeNull();

    await user.type(screen.getByRole("searchbox", { name: "Search permissions" }), "invite");

    await waitFor(() => {
      expect(screen.queryByText("Read workspace")).toBeNull();
      expect(screen.getByText("Invite members")).not.toBeNull();
      expect(container.querySelectorAll(".platform-data-table__group-header")).toHaveLength(1);
    });
  });

  it("renders role navigation around the shared editor", () => {
    const onValueChange = vi.fn();
    render(
      <PlatformRolePermissionsPage
        roles={[
          { id: "member", label: "Member", description: "Member access", meta: "3 assigned" },
          { id: "admin", label: "Admin", description: "Admin access", meta: "1 assigned" },
        ]}
        value="member"
        onValueChange={onValueChange}
        roleAriaLabel="Team roles"
        permissionSet={{ subjectType: "team_role" }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        actionDefinitions={actions}
        subjectType="team_role"
      />,
    );

    const memberRole = screen.getByRole("tab", { name: /Member/ });
    expect(within(memberRole).getByText("Member")).not.toBeNull();
    expect(within(memberRole).queryByText("3 assigned")).toBeNull();
    expect(within(memberRole).queryByText("Member access")).toBeNull();
    expect(
      within(screen.getByRole("tab", { name: /Admin/ })).queryByText("Admin access"),
    ).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /Admin/ }));
    expect(onValueChange).toHaveBeenCalledWith("admin");
    expect(screen.getByRole("heading", { name: "Member" })).not.toBeNull();
    expect(screen.getByText("Invite members")).not.toBeNull();
  });

  it("places role navigation inside the shared details sidebar", () => {
    const { container } = render(
      <PlatformRolePermissionsPage
        roles={[
          { id: "member", label: "Member" },
          { id: "admin", label: "Admin" },
        ]}
        value="member"
        onValueChange={vi.fn()}
        roleAriaLabel="Team roles"
        roleListPlacement="details-sidebar"
        roleListTitle="Details"
        permissionSet={{ subjectType: "team_role" }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        actionDefinitions={actions}
        subjectType="team_role"
      />,
    );

    const page = container.querySelector(
      '[data-platform-role-list-placement="details-sidebar"]',
    );
    expect(page).not.toBeNull();
    expect(
      page?.firstElementChild?.classList.contains(
        "platform-role-permissions-page__details-sidebar",
      ),
    ).toBe(true);
    const sidebar = page?.querySelector(
      ".platform-role-permissions-page__details-sidebar",
    );
    expect(sidebar?.getAttribute("data-platform-detail-sidebar")).toBe("true");
    expect(
      sidebar?.querySelector('[data-platform-ui-card-variant="sidebar"]'),
    ).not.toBeNull();
    expect(within(sidebar as HTMLElement).getByRole("heading", { name: "Details" })).not.toBeNull();
    expect(within(sidebar as HTMLElement).getByRole("tab", { name: "Member" })).not.toBeNull();
    expect(sidebar?.querySelector(".platform-role-permissions-page__role-icon")).not.toBeNull();
    expect(
      page?.lastElementChild?.classList.contains(
        "platform-role-permissions-page__content",
      ),
    ).toBe(true);
  });

  it("renders assigned member avatars and opens the shared minimal member popup", async () => {
    const user = userEvent.setup();
    render(
      <PlatformRolePermissionsPage
        roles={[
          {
            id: "member",
            label: "Member",
            assignedMembers: [
              { id: "ada", name: "Ada Lovelace", detail: "ada@example.com", avatarUrl: "/ada.png" },
              { id: "grace", name: "Grace Hopper", detail: "grace@example.com" },
            ],
          },
          { id: "owner", label: "Owner" },
        ]}
        value="member"
        onValueChange={vi.fn()}
        permissionSet={{ subjectType: "team_role" }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        actionDefinitions={actions}
        subjectType="team_role"
      />,
    );

    const trigger = screen.getByRole("button", { name: "Member assigned members" });
    expect(trigger.querySelectorAll("img")).toHaveLength(1);
    expect(screen.queryByText("2 assigned")).toBeNull();

    await user.click(trigger);

    const popup = screen.getByRole("dialog", { name: "Member members" });
    expect(popup.closest(".platform-popup-surface")?.classList.contains("is-minimal")).toBe(true);
    expect(within(popup).getByText("Ada Lovelace")).not.toBeNull();
    expect(within(popup).getByText("Grace Hopper")).not.toBeNull();
  });

  it("does not render an assigned-member control for an empty role", () => {
    render(
      <PlatformRolePermissionsPage
        roles={[{ id: "member", label: "Member", assignedMembers: [] }]}
        value="member"
        onValueChange={vi.fn()}
        permissionSet={{ subjectType: "team_role" }}
        accessOptions={PLATFORM_PERMISSION_ACCESS_OPTIONS}
        ringDefinitions={rings}
        actionDefinitions={actions}
        subjectType="team_role"
      />,
    );

    expect(screen.queryByRole("button", { name: "Member assigned members" })).toBeNull();
  });
});
