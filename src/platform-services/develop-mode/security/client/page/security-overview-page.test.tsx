// @vitest-environment jsdom

import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  SecurityGitHubAppStatus,
  SecurityGitHubInstallation,
  SecurityGitHubRepository,
  SecurityOverview,
} from "../domain/index.js";
import type { PlatformPluginConnectionStatus } from "../../../../../platform-resources/plugins/connections/index.js";
import {
  SecurityOverviewPage,
  type SecurityOverviewPageProps,
} from "./security-overview-page.js";

afterEach(() => {
  cleanup();
  document.getElementById("security-overview-controls-test")?.remove();
});

const overview: SecurityOverview = {
  metrics: {
    repositories: 3,
    activeRepositories: 2,
    openFindings: 7,
    criticalFindings: 1,
    highFindings: 2,
    fixedFindings: 12,
    totalRuns: 18,
    successfulRuns: 16,
    failedRuns: 1,
    activeRuns: 1,
  },
  repositories: [],
};

const unconfiguredGitHubStatus: SecurityGitHubAppStatus = {
  configured: false,
  slug: "",
  setupUrl: "",
  requiredPermissions: {},
  requiredEvents: [],
};

const configuredGitHubStatus: SecurityGitHubAppStatus = {
  ...unconfiguredGitHubStatus,
  configured: true,
  slug: "computer-agents-security",
};

const installation: SecurityGitHubInstallation = {
  id: "installation-1",
  githubInstallationId: "123",
  accountLogin: "acme-security",
  accountType: "Organization",
  repositorySelection: "selected",
  permissions: {},
  events: [],
  status: "active",
  suspendedAt: null,
  repositoryCount: 4,
  createdAt: "2026-07-22T06:00:00.000Z",
  updatedAt: "2026-07-22T06:00:00.000Z",
};

const connectedGitHubAccount: PlatformPluginConnectionStatus = {
  connected: true,
  profile: { login: "acme-security" },
};

const githubRepositories: SecurityGitHubRepository[] = [
  {
    id: "github-repository-api",
    installationId: installation.id,
    githubRepositoryId: "101",
    fullName: "acme-security/api",
    ownerLogin: "acme-security",
    name: "api",
    defaultBranch: "main",
    private: true,
    archived: false,
    disabled: false,
    monitored: true,
    securityRepositoryId: "security-repository-api",
    syncedAt: "2026-07-22T06:00:00.000Z",
    updatedAt: "2026-07-22T06:00:00.000Z",
  },
  {
    id: "github-repository-web",
    installationId: installation.id,
    githubRepositoryId: "102",
    fullName: "acme-security/web",
    ownerLogin: "acme-security",
    name: "web",
    defaultBranch: "main",
    private: false,
    archived: false,
    disabled: false,
    monitored: false,
    securityRepositoryId: null,
    syncedAt: "2026-07-22T06:00:00.000Z",
    updatedAt: "2026-07-22T06:00:00.000Z",
  },
];

function renderOverview(overrides: Partial<SecurityOverviewPageProps> = {}) {
  const controlsPortalId = "security-overview-controls-test";
  document.getElementById(controlsPortalId)?.remove();
  const controls = document.createElement("div");
  controls.id = controlsPortalId;
  document.body.append(controls);
  const props: SecurityOverviewPageProps = {
    overview,
    githubStatus: unconfiguredGitHubStatus,
    githubConnectionStatus: { connected: false },
    installations: [],
    githubRepositories: [],
    controlsPortalId,
    onRefresh: vi.fn(),
    onBeginGitHubSetup: vi.fn(),
    onDisconnectGitHub: vi.fn().mockResolvedValue(true),
    onLoadRepositoryBranches: vi.fn().mockResolvedValue([]),
    onManageRepositories: vi.fn().mockResolvedValue(true),
    onOpenRepository: vi.fn(),
    onRunRepository: vi.fn(),
    ...overrides,
  };

  return { props, controls, ...render(<SecurityOverviewPage {...props} />) };
}

describe("SecurityOverviewPage", () => {
  it("uses the shared cards, centralized empty state, and reusable GitHub connection action", async () => {
    const user = userEvent.setup();
    const { container, controls, props } = renderOverview();

    expect(
      screen.getByRole("heading", { name: "Security Agents", level: 1 }),
    ).not.toBeNull();
    const features = screen.getByRole("region", {
      name: "Security Agents capabilities and status",
    });
    expect(
      features.querySelectorAll(".platform-ui-card.is-feature"),
    ).toHaveLength(2);
    expect(
      within(features).getByRole("heading", {
        name: "Secure your repositories",
      }),
    ).not.toBeNull();
    expect(
      within(features).getByRole("heading", { name: "Connect GitHub" }),
    ).not.toBeNull();
    expect(within(features).getByText("Exact commit SHAs")).not.toBeNull();
    expect(
      features.querySelector(".platform-ui-card__feature-icon.is-white"),
    ).not.toBeNull();
    expect(container.querySelector(".develop-security-setup-panel")).toBeNull();
    expect(screen.queryByText("GitHub App unavailable")).toBeNull();
    expect(container.querySelector(".platform-empty-state")).not.toBeNull();
    expect(screen.getByText("No repositories linked")).not.toBeNull();
    expect(
      (
        within(controls).getByRole("button", {
          name: "Manage Repos",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      screen.queryByRole("button", { name: "Refresh security overview" }),
    ).toBeNull();

    const hero = container.querySelector(
      "[data-platform-page-hero='true']",
    ) as HTMLElement;
    await user.click(
      within(hero).getByRole("button", { name: "Connect GitHub" }),
    );

    expect(props.onBeginGitHubSetup).toHaveBeenCalledOnce();
    await user.click(
      within(features).getByRole("button", { name: "Connect GitHub" }),
    );
    expect(props.onBeginGitHubSetup).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByText("GitHub App configuration required")).toBeNull();
  });

  it("shows the connected GitHub organization and live KPI rows", async () => {
    const user = userEvent.setup();
    const { container, controls, props } = renderOverview({
      githubStatus: configuredGitHubStatus,
      githubConnectionStatus: connectedGitHubAccount,
      installations: [installation],
    });

    const features = screen.getByRole("region", {
      name: "Security Agents capabilities and status",
    });
    expect(
      within(features).getByRole("heading", { name: "Security posture" }),
    ).not.toBeNull();
    expect(
      within(features).getByText("Monitored repositories").parentElement
        ?.textContent,
    ).toContain("3");
    expect(
      within(features).getByText("Open findings").parentElement?.textContent,
    ).toContain("7");
    expect(
      within(features).getByText("Completed fixes").parentElement?.textContent,
    ).toContain("12");

    const hero = container.querySelector(
      "[data-platform-page-hero='true']",
    ) as HTMLElement;
    const accountAction = within(hero).getByRole("button", {
      name: "GitHub account acme-security",
    });
    expect(accountAction.textContent).toContain("acme-security");
    expect(accountAction.getAttribute("data-platform-button-variant")).toBe(
      "secondary",
    );
    await user.click(accountAction);
    const accountMenu = screen.getByRole("menu", {
      name: "GitHub account acme-security",
    });
    await user.click(
      within(accountMenu).getByRole("menuitem", { name: "Sign out" }),
    );
    expect(props.onDisconnectGitHub).toHaveBeenCalledOnce();

    const manageReposButton = within(controls).getByRole("button", {
      name: "Manage Repos",
    });
    expect((manageReposButton as HTMLButtonElement).disabled).toBe(false);
    expect(manageReposButton.querySelector("svg")).toBeNull();
    await user.click(
      within(controls).getByRole("button", { name: "Manage Repos" }),
    );

    expect(screen.getByRole("dialog", { name: "Manage Repos" })).not.toBeNull();
  });

  it("starts the shared GitHub connection directly without deployment app configuration", async () => {
    const user = userEvent.setup();
    const onBeginGitHubSetup = vi.fn();
    const { container } = renderOverview({
      githubStatus: configuredGitHubStatus,
      onBeginGitHubSetup,
    });

    const hero = container.querySelector(
      "[data-platform-page-hero='true']",
    ) as HTMLElement;
    await user.click(
      within(hero).getByRole("button", { name: "Connect GitHub" }),
    );

    expect(onBeginGitHubSetup).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog", { name: "Connect GitHub" })).toBeNull();
  });

  it("uses the empty state instead of a missing-collection API error", () => {
    const { container } = renderOverview({
      error: "Platform API request failed (404).",
    });

    expect(screen.queryByText("Platform API request failed (404).")).toBeNull();
    expect(screen.getByText("No repositories linked")).not.toBeNull();
    expect(container.querySelector(".platform-empty-state")).not.toBeNull();
  });

  it("manages repository selection and branches with centralized table controls", async () => {
    const user = userEvent.setup();
    const onLoadRepositoryBranches = vi.fn().mockResolvedValue([
      { name: "main", protected: true },
      { name: "develop", protected: false },
    ]);
    const onManageRepositories = vi.fn().mockResolvedValue(true);
    const { controls } = renderOverview({
      githubStatus: configuredGitHubStatus,
      githubConnectionStatus: connectedGitHubAccount,
      installations: [installation],
      githubRepositories,
      onLoadRepositoryBranches,
      onManageRepositories,
    });

    await user.click(
      within(controls).getByRole("button", { name: "Manage Repos" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Manage Repos" });
    expect(
      within(dialog).queryByText(
        "Select the repositories Security Agents may monitor and choose the branch each repository should scan by default.",
      ),
    ).toBeNull();
    expect(
      within(dialog).queryByRole("button", { name: /Reconnect GitHub/i }),
    ).toBeNull();
    expect(
      within(dialog).queryByRole("button", { name: /Refresh acme-security/i }),
    ).toBeNull();
    const search = within(dialog).getByRole("searchbox", {
      name: "Search GitHub repositories",
    });
    expect(search.closest(".platform-modal-header__actions")).not.toBeNull();
    const table = within(dialog).getByRole("table", {
      name: "GitHub repositories available to Security Agents",
    });
    expect(
      table
        .closest(".platform-data-table")
        ?.classList.contains("is-minimalistic-ui"),
    ).toBe(true);
    expect(
      within(dialog)
        .getByText("acme-security/api")
        .closest(".platform-data-table__cell")
        ?.querySelector("svg"),
    ).toBeNull();
    expect(
      within(dialog)
        .getByRole("checkbox", { name: "Deselect acme-security/api" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      within(dialog)
        .getByRole("checkbox", { name: "Select acme-security/web" })
        .getAttribute("aria-checked"),
    ).toBe("false");
    expect(
      (
        within(dialog).getByRole("button", {
          name: "Save changes",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    await user.type(search, "does-not-exist");
    expect(
      within(dialog).getByText("No repositories match this search."),
    ).not.toBeNull();
    await user.clear(search);

    await user.click(
      within(dialog).getByRole("checkbox", {
        name: "Deselect acme-security/api",
      }),
    );
    await user.click(
      within(dialog).getByRole("checkbox", {
        name: "Select acme-security/web",
      }),
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "Branch for acme-security/web",
      }),
    );
    await user.click(await screen.findByRole("option", { name: "develop" }));
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );

    expect(onLoadRepositoryBranches).toHaveBeenCalledWith(
      githubRepositories[1],
    );
    expect(onManageRepositories).toHaveBeenCalledWith([
      {
        kind: "unmonitor",
        repository: githubRepositories[0],
        securityRepositoryId: "security-repository-api",
      },
      {
        kind: "monitor",
        repository: githubRepositories[1],
        branch: "develop",
      },
    ]);
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Manage Repos" })).toBeNull();
    });
  });
});
