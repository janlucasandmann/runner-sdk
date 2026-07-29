// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlatformRolePermissionSet } from "../../../platform-ui/pages/permissions/index.js";
import {
  PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  type PlatformAccessPrincipal,
} from "../domain/access-principals.js";
import { PlatformResourceAccessSettings } from "./platform-resource-access-settings.js";

const team: PlatformAccessPrincipal = {
  id: "team_platform",
  name: "Platform",
  kind: "team",
  createdAt: "2026-07-23T08:00:00.000Z",
};

const roles = [
  { id: "owner", label: "Owner", description: "Permanent resource owner" },
  { id: "admin", label: "Admin", description: "Resource administrator" },
  {
    id: "contributor",
    label: "Contributor",
    description: "Resource contributor",
  },
  { id: "member", label: "Member", description: "Resource user" },
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

describe("PlatformResourceAccessSettings", () => {
  it("renders the role sidebar and Agent resource entitlements for a selected team", () => {
    const onSelectedRoleIdChange = vi.fn();

    render(
      <PlatformResourceAccessSettings
        teams={[team]}
        resourceLabel="Agent"
        selectedPrincipalId={team.id}
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="agent_resource"
        teamSubjectType="agent_team_role"
        roles={roles}
        selectedRoleId="member"
        onSelectedRoleIdChange={onSelectedRoleIdChange}
        teamPermissionSet={createPlatformRolePermissionSet("agent_team_role", "member")}
        onTeamPermissionSetChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("tablist", { name: "Agent team roles" })).not.toBeNull();
    expect(
      document.querySelector(
        "[data-platform-resource-access-settings] [data-platform-role-sidebar]",
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(".platform-resource-access-settings__role-sidebar"),
    ).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Owner/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Admin/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Contributor/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Member/ })).not.toBeNull();
    expect(screen.getByText("Use agent")).not.toBeNull();
    expect(screen.getByText("Create and manage versions")).not.toBeNull();
    expect(screen.queryByText("Read workspace")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /Contributor/ }));
    expect(onSelectedRoleIdChange).toHaveBeenCalledWith("contributor");
  });

  it("provides the canonical role sidebar when an adapter omits roles", () => {
    render(
      <PlatformResourceAccessSettings
        teams={[team]}
        resourceLabel="Agent"
        selectedPrincipalId={team.id}
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="agent_resource"
        teamSubjectType="agent_team_role"
        selectedRoleId="member"
        onSelectedRoleIdChange={vi.fn()}
        teamPermissionSet={createPlatformRolePermissionSet("agent_team_role", "member")}
        onTeamPermissionSetChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("tablist", { name: "Agent team roles" })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Owner/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Member/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Contributor/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Admin/ })).not.toBeNull();
  });

  it("renders Computer-specific entitlements for a selected team", () => {
    render(
      <PlatformResourceAccessSettings
        teams={[team]}
        resourceLabel="Computer"
        selectedPrincipalId={team.id}
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="computer"
        teamSubjectType="computer_team_role"
        roles={roles}
        selectedRoleId="contributor"
        onSelectedRoleIdChange={vi.fn()}
        teamPermissionSet={createPlatformRolePermissionSet("computer_team_role", "contributor")}
        onTeamPermissionSetChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("tablist", { name: "Computer team roles" })).not.toBeNull();
    expect(screen.getByText("Use computer")).not.toBeNull();
    expect(screen.getByText("Edit computer configuration")).not.toBeNull();
    expect(screen.getByText("Create and manage versions")).not.toBeNull();
    expect(screen.queryByText("Run local commands")).toBeNull();
  });

  it("renders the role sidebar for all organization members", () => {
    const onSelectedRoleIdChange = vi.fn();

    render(
      <PlatformResourceAccessSettings
        teams={[]}
        resourceLabel="Agent"
        selectedPrincipalId={PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID}
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="agent_resource"
        teamSubjectType="agent_team_role"
        roles={roles}
        selectedRoleId="member"
        onSelectedRoleIdChange={onSelectedRoleIdChange}
        systemRolePermissionSet={createPlatformRolePermissionSet(
          "agent_team_role",
          "member",
        )}
        onSystemRolePermissionSetChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("tablist", {
        name: "Agent organization member roles",
      }),
    ).not.toBeNull();
    expect(
      document.querySelector(
        "[data-platform-resource-access-settings] [data-platform-role-sidebar]",
      ),
    ).not.toBeNull();
    expect(
      screen.queryByText("All Organization Members Permissions"),
    ).toBeNull();
    expect(screen.queryByText("Organization member role")).toBeNull();
    expect(screen.getByText("Use agent")).not.toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /Admin/ }));
    expect(onSelectedRoleIdChange).toHaveBeenCalledWith("admin");
  });
});
