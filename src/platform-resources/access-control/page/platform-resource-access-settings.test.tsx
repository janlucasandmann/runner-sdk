// @vitest-environment jsdom

import { useState } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlatformRolePermissionSet } from "../../../platform-ui/pages/permissions/index.js";
import {
  PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
  PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
  type PlatformAccessPrincipal,
} from "../domain/access-principals.js";
import {
  PLATFORM_RESOURCE_ACCESS_HISTORY_STATE_KEY,
  PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT,
  PlatformResourceAccessSettings,
} from "./platform-resource-access-settings.js";

const team: PlatformAccessPrincipal = {
  id: "team_platform",
  name: "Platform",
  kind: "team",
  profileImageUrl: "/img/teams/platform.webp",
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
  window.history.replaceState({}, "", window.location.href);
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
  it("owns the Add Teams popup and renders centralized team avatars", () => {
    const availableTeam: PlatformAccessPrincipal = {
      ...team,
      id: "team_design",
      name: "Design",
      profileImageUrl: "/img/teams/design.webp",
      roleId: "admin",
      roleLabel: "Admin",
    };
    const onAddTeam = vi.fn();

    render(
      <PlatformResourceAccessSettings
        teams={[]}
        resourceLabel="Skill"
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="skill"
        teamSubjectType="skill_team_role"
        addTeams={{
          teams: [availableTeam],
          totalTeamCount: 1,
          popupAriaLabel: "Add teams with Skill access",
          onAddTeam,
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Add teams with Skill access" }),
    );
    const teamItem = screen.getByRole("menuitem", { name: "Design Admin" });
    expect(
      teamItem.querySelector(
        '.platform-resource-access-table__principal-avatar-image[src="/img/teams/design.webp"]',
      ),
    ).not.toBeNull();
    expect(
      teamItem.querySelector(".platform-resource-access-settings__add-team-role")
        ?.textContent,
    ).toBe("Admin");

    fireEvent.click(teamItem);
    expect(onAddTeam).toHaveBeenCalledWith(availableTeam);
  });

  it("eagerly hydrates persisted team identities from the authoritative directory", async () => {
    const onRequestTeams = vi.fn(() => new Promise<void>(() => undefined));

    render(
      <PlatformResourceAccessSettings
        teams={[]}
        resourceLabel="Skill"
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="skill"
        teamSubjectType="skill_team_role"
        addTeams={{
          teams: [],
          totalTeamCount: 0,
          popupAriaLabel: "Load Skill teams",
          onRequestTeams,
          onAddTeam: vi.fn(),
        }}
      />,
    );

    await waitFor(() => expect(onRequestTeams).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "Load Skill teams" }));
    expect(onRequestTeams).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Loading teams...")).not.toBeNull();
  });

  it("replaces a restored team placeholder with its saved name and profile image", async () => {
    const onRequestTeams = vi.fn().mockResolvedValue(undefined);
    const placeholderTeam = {
      ...team,
      name: "Team",
      profileImageUrl: "",
    };
    const hydratedTeam = {
      ...team,
      name: "test team",
      profileImageUrl: "/img/teams/test-team.webp",
    };
    const view = render(
      <PlatformResourceAccessSettings
        teams={[placeholderTeam]}
        resourceLabel="Skill"
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="skill"
        teamSubjectType="skill_team_role"
        addTeams={{
          teams: [],
          totalTeamCount: 0,
          onRequestTeams,
          onAddTeam: vi.fn(),
        }}
      />,
    );

    await waitFor(() => expect(onRequestTeams).toHaveBeenCalledTimes(1));
    view.rerender(
      <PlatformResourceAccessSettings
        teams={[hydratedTeam]}
        resourceLabel="Skill"
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="skill"
        teamSubjectType="skill_team_role"
        addTeams={{
          teams: [],
          totalTeamCount: 1,
          onRequestTeams,
          onAddTeam: vi.fn(),
        }}
      />,
    );

    expect(screen.getByText("test team")).not.toBeNull();
    expect(
      document.querySelector(
        '.platform-resource-access-table__principal-avatar-image[src="/img/teams/test-team.webp"]',
      ),
    ).not.toBeNull();
  });

  it("renders the role sidebar and Agent resource entitlements for a selected team", () => {
    const onSelectedRoleIdChange = vi.fn();
    const onViewTeam = vi.fn();

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
        teamMembersTeamId={team.id}
        teamMembers={[
          {
            id: "membership_ada",
            userId: "user_ada",
            role: "member",
            displayName: "Ada Lovelace",
            email: "ada@example.com",
            photoURL: "/img/people/ada.webp",
            status: "active",
          },
        ]}
        onViewTeam={onViewTeam}
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
    expect(
      document.querySelector(
        '[data-platform-role-list-placement="details-sidebar"] > .platform-role-permissions-page__details-sidebar',
      ),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Roles" })).not.toBeNull();
    expect(
      document.querySelector(
        ".platform-role-permissions-page__details-card > .platform-resource-access-settings__role-sidebar",
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(".playground-project-team-permissions-back"),
    ).toBeNull();
    expect(screen.getByRole("tab", { name: /Owner/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Admin/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Contributor/ })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Member/ })).not.toBeNull();
    expect(screen.getByText("Use agent")).not.toBeNull();
    expect(screen.getByText("Create and manage versions")).not.toBeNull();
    expect(screen.queryByText("Read workspace")).toBeNull();
    expect(document.querySelectorAll(".platform-settings-data-table")).toHaveLength(1);
    expect(
      document.querySelector(".platform-permissions-page__grouped-table"),
    ).not.toBeNull();
    expect(
      screen.getByRole("searchbox", { name: "Search permissions" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Member assigned members" }),
    ).not.toBeNull();
    expect(
      document.querySelector(
        '.platform-role-permissions-page__assigned-avatar img[src="/img/people/ada.webp"]',
      ),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "View Team" }));
    expect(onViewTeam).toHaveBeenCalledWith(team);

    fireEvent.click(screen.getByRole("tab", { name: /Contributor/ }));
    expect(onSelectedRoleIdChange).toHaveBeenCalledWith("contributor");
  });

  it("publishes the centralized team detail route and clears it on unmount", async () => {
    const navigationEvents: Array<Record<string, unknown>> = [];
    const handleNavigation = (event: Event) => {
      navigationEvents.push(
        (event as CustomEvent<Record<string, unknown>>).detail,
      );
    };
    window.addEventListener(
      PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT,
      handleNavigation,
    );

    const onSelectedPrincipalIdChange = vi.fn();
    const view = render(
      <PlatformResourceAccessSettings
        teams={[team]}
        resourceLabel="Skill"
        selectedPrincipalId={team.id}
        onSelectedPrincipalIdChange={onSelectedPrincipalIdChange}
        subjectType="skill"
        teamSubjectType="skill_team_role"
        selectedRoleId="member"
        onSelectedRoleIdChange={vi.fn()}
        teamPermissionSet={createPlatformRolePermissionSet("skill_team_role", "member")}
        onTeamPermissionSetChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(navigationEvents.at(-1)).toMatchObject({
        open: true,
        principalId: team.id,
        principalName: team.name,
        principalKind: "team",
        principalProfileImageUrl: team.profileImageUrl,
        resourceLabel: "Skill",
      });
    });
    expect(
      document.querySelector(
        '[data-platform-resource-access-view="team"].is-team-detail-view',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(
        "[data-platform-resource-access-detail-host] > [data-platform-resource-access-view=\"team\"]",
      ),
    ).not.toBeNull();

    const closeRoute = navigationEvents.at(-1)?.onClose;
    expect(closeRoute).toBeTypeOf("function");
    (closeRoute as () => void)();
    expect(onSelectedPrincipalIdChange).toHaveBeenCalledWith("");

    view.unmount();
    expect(navigationEvents.at(-1)).toMatchObject({ open: false });
    window.removeEventListener(
      PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT,
      handleNavigation,
    );
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

  it("renders all organization members through the centralized access detail route", async () => {
    const onSelectedRoleIdChange = vi.fn();
    const navigationEvents: Array<Record<string, unknown>> = [];
    const handleNavigation = (event: Event) => {
      navigationEvents.push(
        (event as CustomEvent<Record<string, unknown>>).detail,
      );
    };
    window.addEventListener(
      PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT,
      handleNavigation,
    );

    const view = render(
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

    await waitFor(() => {
      expect(navigationEvents.at(-1)).toMatchObject({
        open: true,
        principalId: PLATFORM_ALL_ORGANIZATION_MEMBERS_PRINCIPAL_ID,
        principalName: "All Organization Members",
        principalKind: "system",
        resourceLabel: "Agent",
      });
    });

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
    expect(
      document.querySelector(
        '[data-platform-resource-access-detail-host] > [data-platform-resource-access-view="system"]',
      ),
    ).not.toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: /Admin/ }));
    expect(onSelectedRoleIdChange).toHaveBeenCalledWith("admin");
    view.unmount();
    window.removeEventListener(
      PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT,
      handleNavigation,
    );
  });

  it("opens All Agents through the same centralized access detail route", async () => {
    const navigationEvents: Array<Record<string, unknown>> = [];
    const handleNavigation = (event: Event) => {
      navigationEvents.push(
        (event as CustomEvent<Record<string, unknown>>).detail,
      );
    };
    window.addEventListener(
      PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT,
      handleNavigation,
    );

    const view = render(
      <PlatformResourceAccessSettings
        teams={[]}
        resourceLabel="Agent"
        selectedPrincipalId={PLATFORM_ALL_AGENTS_PRINCIPAL_ID}
        onSelectedPrincipalIdChange={vi.fn()}
        subjectType="agent_resource"
        teamSubjectType="agent_team_role"
        onSystemPermissionSetChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(navigationEvents.at(-1)).toMatchObject({
        open: true,
        principalId: PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
        principalName: "All Agents",
        principalKind: "system",
        resourceLabel: "Agent",
      });
    });
    expect(
      document.querySelector(
        '[data-platform-resource-access-detail-host] > [data-platform-resource-access-view="system"]',
      ),
    ).not.toBeNull();
    expect(
      screen.getByRole("tablist", { name: "Agent all agents policy" }),
    ).not.toBeNull();
    expect(screen.getByRole("tab", { name: /All Agents/ })).not.toBeNull();
    expect(
      document.querySelector(
        '[data-platform-role-list-placement="details-sidebar"] > .platform-role-permissions-page__details-sidebar',
      ),
    ).not.toBeNull();
    expect(
      document.querySelector(".platform-permissions-page__grouped-table"),
    ).not.toBeNull();
    expect(
      screen.getByRole("searchbox", { name: "Search permissions" }),
    ).not.toBeNull();

    view.unmount();
    window.removeEventListener(
      PLATFORM_RESOURCE_ACCESS_NAVIGATION_EVENT,
      handleNavigation,
    );
  });

  it("keeps browser Back inside the parent resource when access details are open", async () => {
    const parentNavigationEntry = {
      page: "tools",
      mode: "detail",
      toolsView: "skills",
      skillId: "skill_1",
      skillTab: "settings",
    };
    const parentState = {
      __runnerPlatformNavigation: true,
      entry: parentNavigationEntry,
    };
    window.history.replaceState(parentState, "", window.location.href);

    function StatefulAccessSettings() {
      const [principalId, setPrincipalId] = useState("");
      return (
        <PlatformResourceAccessSettings
          teams={[team]}
          resourceLabel="Skill"
          selectedPrincipalId={principalId}
          onSelectedPrincipalIdChange={setPrincipalId}
          subjectType="skill"
          teamSubjectType="skill_team_role"
          selectedRoleId="member"
          onSelectedRoleIdChange={vi.fn()}
          teamPermissionSet={createPlatformRolePermissionSet(
            "skill_team_role",
            "member",
          )}
          onTeamPermissionSetChange={vi.fn()}
        />
      );
    }

    render(<StatefulAccessSettings />);
    fireEvent.click(
      screen.getByRole("row", { name: `Edit permissions for ${team.name}` }),
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-platform-resource-access-view="team"]'),
      ).not.toBeNull();
    });
    expect(
      window.history.state[PLATFORM_RESOURCE_ACCESS_HISTORY_STATE_KEY],
    ).toMatchObject({
      principalId: team.id,
      resourceLabel: "Skill",
      parentNavigationKey: JSON.stringify(parentNavigationEntry),
    });

    act(() => {
      window.history.replaceState(parentState, "", window.location.href);
      window.dispatchEvent(new PopStateEvent("popstate", { state: parentState }));
    });

    await waitFor(() => {
      expect(screen.getByRole("table", { name: "Skill access" })).not.toBeNull();
    });
    expect(window.history.state.entry).toEqual(parentNavigationEntry);
    expect(
      document.querySelector('[data-platform-resource-access-view="team"]'),
    ).toBeNull();
  });

  it("preserves the access history entry while View Team leaves the resource page", async () => {
    const parentNavigationEntry = {
      page: "tools",
      mode: "detail",
      toolsView: "skills",
      skillId: "skill_1",
      skillTab: "settings",
    };
    window.history.replaceState(
      {
        __runnerPlatformNavigation: true,
        entry: parentNavigationEntry,
      },
      "",
      window.location.href,
    );

    function ViewTeamNavigationHarness() {
      const [principalId, setPrincipalId] = useState("");
      const [resourceOpen, setResourceOpen] = useState(true);
      if (!resourceOpen) return <div>Team detail page</div>;
      return (
        <PlatformResourceAccessSettings
          teams={[team]}
          resourceLabel="Skill"
          selectedPrincipalId={principalId}
          onSelectedPrincipalIdChange={setPrincipalId}
          subjectType="skill"
          teamSubjectType="skill_team_role"
          selectedRoleId="member"
          onSelectedRoleIdChange={vi.fn()}
          teamPermissionSet={createPlatformRolePermissionSet(
            "skill_team_role",
            "member",
          )}
          onTeamPermissionSetChange={vi.fn()}
          onViewTeam={() => setResourceOpen(false)}
        />
      );
    }

    render(<ViewTeamNavigationHarness />);
    fireEvent.click(
      screen.getByRole("row", { name: `Edit permissions for ${team.name}` }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "View Team" }));

    expect(screen.getByText("Team detail page")).not.toBeNull();
    expect(
      window.history.state[PLATFORM_RESOURCE_ACCESS_HISTORY_STATE_KEY],
    ).toMatchObject({
      principalId: team.id,
      resourceLabel: "Skill",
      parentNavigationKey: JSON.stringify(parentNavigationEntry),
    });
  });
});
