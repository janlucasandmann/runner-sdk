// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SecurityRepository } from "../domain/index.js";
import { SecurityRepositoryAccessSettings } from "./security-repository-access-settings.js";

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
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
  } as never);
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

function createRepository(): SecurityRepository {
  return {
    id: "security_repository_1",
    githubRepositoryId: "github_repository_1",
    githubInstallationId: "github_installation_1",
    githubNumericRepositoryId: "101",
    githubNumericInstallationId: "201",
    fullName: "acme/security",
    defaultBranch: "main",
    private: true,
    archived: false,
    status: "active",
    currentPolicyVersionId: null,
    currentThreatModelVersionId: null,
    permissionSet: null,
    lastRunId: null,
    lastRunAt: null,
    nextScanAt: null,
    metadata: {
      sharedTeamIds: ["team_appsec"],
      teamAccessIds: ["team_appsec"],
    },
    findingCounts: { open: 0, critical: 0, high: 0 },
    lastRunStatus: null,
    lastRunStage: null,
    createdAt: "2026-07-22T08:00:00.000Z",
    updatedAt: "2026-07-22T08:00:00.000Z",
  };
}

describe("SecurityRepositoryAccessSettings", () => {
  it("renders the centralized Manage access table and team role editor", async () => {
    const user = userEvent.setup();
    const onWorkspaceTeamsRequest = vi.fn();
    render(
      <SecurityRepositoryAccessSettings
        repository={createRepository()}
        workspaceTeams={[
          {
            id: "team_appsec",
            name: "AppSec",
            role: "admin",
            createdAt: "2026-07-20T08:00:00.000Z",
            memberCount: 4,
          },
          {
            id: "team_platform",
            name: "Platform",
            role: "admin",
            createdAt: "2026-07-19T08:00:00.000Z",
          },
        ]}
        onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
        onSaveSystemPrincipalPermissionSet={vi.fn()}
        onAddTeamAccess={vi.fn()}
        onRemoveTeamAccess={vi.fn()}
        onSaveTeamRolePermissionSet={vi.fn()}
      />,
    );

    const table = screen.getByRole("table", {
      name: "Security Agents access",
    });
    expect(table.closest(".platform-data-table")?.classList.contains("is-minimalistic-ui")).toBe(
      true,
    );
    expect(within(table).getByText("All Agents")).not.toBeNull();
    expect(within(table).getByText("All Organization Members")).not.toBeNull();
    expect(within(table).getByText("AppSec")).not.toBeNull();
    expect(
      (
        within(table).getByRole("checkbox", {
          name: "All Agents is always included",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    await user.click(within(table).getByText("AppSec"));
    expect(
      screen.getByRole("region", {
        name: "AppSec Security Agents access",
      }),
    ).not.toBeNull();
    expect(screen.getByRole("tablist", { name: "Security Agents team roles" })).not.toBeNull();
    expect(screen.getByRole("tab", { name: /Member/i }).getAttribute("aria-selected")).toBe("true");

    await user.click(screen.getByRole("button", { name: /Settings/i }));
    expect(screen.getByRole("table", { name: "Security Agents access" })).not.toBeNull();
    expect(onWorkspaceTeamsRequest).toHaveBeenCalled();
  });

  it("adds an available workspace team with role permission presets", async () => {
    const user = userEvent.setup();
    const onAddTeamAccess = vi.fn();
    render(
      <SecurityRepositoryAccessSettings
        repository={createRepository()}
        workspaceTeams={[
          { id: "team_appsec", name: "AppSec", role: "admin" },
          { id: "team_platform", name: "Platform", role: "admin" },
        ]}
        onSaveSystemPrincipalPermissionSet={vi.fn()}
        onAddTeamAccess={onAddTeamAccess}
        onRemoveTeamAccess={vi.fn()}
        onSaveTeamRolePermissionSet={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Add teams with Security Agents access",
      }),
    );
    const menu = screen.getByRole("menu", {
      name: "Add teams with Security Agents access",
    });
    expect(within(menu).queryByText("AppSec")).toBeNull();
    await user.click(within(menu).getByRole("menuitem", { name: /Platform/i }));

    expect(onAddTeamAccess).toHaveBeenCalledOnce();
    expect(onAddTeamAccess.mock.calls[0]?.[0]).toMatchObject({
      id: "team_platform",
      name: "Platform",
      roleId: "admin",
    });
    expect(onAddTeamAccess.mock.calls[0]?.[1]).toHaveProperty("member");
    expect(onAddTeamAccess.mock.calls[0]?.[1]).toHaveProperty("contributor");
  });
});
