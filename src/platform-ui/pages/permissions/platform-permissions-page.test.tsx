// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { PlatformPermissionsPage } from "./platform-permissions-page.js";
import { PlatformRolePermissionsPage } from "./platform-role-permissions-page.js";
import { PLATFORM_PERMISSION_ACCESS_OPTIONS } from "./permission-model.js";

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
            workspace_read: { ringId: "ring_1" },
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
    expect(screen.queryByText("Invite members")).toBeNull();
    expect(container.querySelectorAll("[data-platform-settings-section-list='true']")).toHaveLength(1);
    expect(container.querySelectorAll("[data-platform-settings-section='true']")).toHaveLength(2);
    expect(container.querySelectorAll(".platform-permissions-page__ring-table")).toHaveLength(2);
    expect(container.querySelectorAll(".platform-settings-data-table")).toHaveLength(2);
    expect(container.querySelectorAll(".platform-data-table.is-minimalistic-ui")).toHaveLength(2);
    expect(container.querySelector(".platform-data-table__toolbar")).toBeNull();
    expect(container.querySelector(".platform-data-table__footer")).toBeNull();
    expect(container.querySelector(".platform-data-table__pagination")).toBeNull();
    expect(container.querySelector("select")).toBeNull();
    expect(container.querySelectorAll(".platform-selector")).toHaveLength(4);
    expect(container.querySelectorAll(".lucide-chevrons-up-down")).toHaveLength(4);

    const ringOneTable = screen.getByRole("table", { name: "Ring 1 permissions" });
    expect(
      ringOneTable.querySelector<HTMLElement>(".platform-data-table__header")?.style.gridTemplateColumns,
    ).toBe("minmax(0, 1fr) 104px 126px");
    expect(within(ringOneTable).getByRole("columnheader", { name: /Ring 1/ })).not.toBeNull();
    expect(within(ringOneTable).getByRole("columnheader", { name: "Ring" })).not.toBeNull();
    expect(within(ringOneTable).getByRole("columnheader", { name: "Permission" })).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Ring 1 default permissions" }));
    expect(
      document.body.querySelector(".platform-popup-surface.is-portaled"),
    ).not.toBeNull();
    expect(container.querySelector(".platform-popup-surface")).toBeNull();
    await user.click(screen.getByRole("option", { name: "Read only" }));

    await user.click(screen.getByRole("button", { name: "Read workspace ring" }));
    await user.click(screen.getByRole("option", { name: "Ring 2 · Shared" }));

    await user.click(screen.getByRole("button", { name: "Read workspace permissions" }));
    expect(
      screen.getByRole("listbox", { name: "Read workspace permissions options" })
        .getAttribute("data-platform-popup-placement"),
    ).toBe("bottom-end");
    await user.click(screen.getByRole("option", { name: "No access" }));

    expect(onRingAccessChange).toHaveBeenCalledWith("ring_1", "read_only");
    expect(onActionRingChange).toHaveBeenCalledWith("workspace_read", "ring_2");
    expect(onActionAccessChange).toHaveBeenCalledWith("workspace_read", "no_access");
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

    fireEvent.click(screen.getByRole("tab", { name: /Admin/ }));
    expect(onValueChange).toHaveBeenCalledWith("admin");
    expect(screen.getByRole("heading", { name: "Member" })).not.toBeNull();
    expect(screen.getByText("Invite members")).not.toBeNull();
  });
});
