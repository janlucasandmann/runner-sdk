// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { AgentsOverviewPage } from "../../../platform-resources/agents/overview/agents-overview-page.js";
import { ComputersOverviewPage } from "../../../platform-resources/computers/overview/computers-overview-page.js";
import { PluginsOverviewPage } from "../../../platform-resources/plugins/overview/plugins-overview-page.js";
import { SkillsOverviewPage } from "../../../platform-resources/skills/overview/skills-overview-page.js";
import { TagsOverviewPage } from "../../../platform-resources/tags/overview/tags-overview-page.js";
import { ResourceOverviewPage } from "./resource-overview-page.js";
import type { ResourceOverviewAnalyticsModel } from "./resource-overview-types.js";

const analytics: ResourceOverviewAnalyticsModel = {
  title: "Activity",
  metrics: [
    { id: "total", label: "Total", value: "1", color: "#fff" },
    { id: "active", label: "Active", value: "1", color: "#7effff" },
  ],
  labels: [],
  series: [],
};
const CONTROLS_PORTAL_ID = "resource-overview-test-controls";

function renderWithOverviewControls(ui: React.ReactNode) {
  return render(
    <>
      <div id={CONTROLS_PORTAL_ID} data-testid="overview-controls" />
      {ui}
    </>,
  );
}

afterEach(cleanup);

describe("resource overview pages", () => {
  it.each([
    [
      "agents",
      () => (
        <AgentsOverviewPage
          rows={[
            {
              id: "agent-1",
              name: "Forge",
              usageTokens: 3200,
              modelLabel: "Spark",
              creatorName: "Me",
              lastUsedLabel: "Today",
            },
          ]}
          mode="agents"
          onModeChange={vi.fn()}
          period="month"
          onPeriodChange={vi.fn()}
          analytics={analytics}
          controlsPortalId={CONTROLS_PORTAL_ID}
          onOpen={vi.fn()}
          onCreateAgent={vi.fn()}
          onCreateSquad={vi.fn()}
          onRename={vi.fn()}
          onShare={vi.fn()}
          onAddToSquad={vi.fn()}
          onCopy={vi.fn()}
          onDelete={vi.fn()}
        />
      ),
    ],
    [
      "computers",
      () => (
        <ComputersOverviewPage
          rows={[
            {
              id: "computer-1",
              name: "Main Computer",
              profileLabel: "Standard",
              status: "Running",
              isRunning: true,
              creatorName: "Computer Agents",
              creatorAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
              creatorFallback: "CA",
              creatorIsSystem: true,
              createdLabel: "Today",
              lastUsedLabel: "Now",
            },
          ]}
          period="month"
          onPeriodChange={vi.fn()}
          analytics={analytics}
          controlsPortalId={CONTROLS_PORTAL_ID}
          onOpen={vi.fn()}
          onCreate={vi.fn()}
          onRename={vi.fn()}
          onShare={vi.fn()}
          onCopy={vi.fn()}
          onDelete={vi.fn()}
        />
      ),
    ],
    [
      "skills",
      () => (
        <SkillsOverviewPage
          rows={[
            {
              id: "skill-1",
              name: "Browser",
              isActive: true,
              isCustom: false,
              updatedLabel: "System",
            },
          ]}
          mode="system"
          onModeChange={vi.fn()}
          period="month"
          onPeriodChange={vi.fn()}
          analytics={analytics}
          controlsPortalId={CONTROLS_PORTAL_ID}
          onOpen={vi.fn()}
          onCreate={vi.fn()}
          onEdit={vi.fn()}
          onRename={vi.fn()}
          onDelete={vi.fn()}
        />
      ),
    ],
    [
      "tags",
      () => (
        <TagsOverviewPage
          tagRows={[
            {
              id: "tag-1",
              name: "Email",
              connected: true,
              identityLabel: "mail@example.com",
              providerLabel: "Channel",
            },
          ]}
          pluginRows={[]}
          period="month"
          onPeriodChange={vi.fn()}
          analytics={analytics}
          controlsPortalId={CONTROLS_PORTAL_ID}
          onOpenTag={vi.fn()}
          onOpenPlugin={vi.fn()}
        />
      ),
    ],
    [
      "plugins",
      () => (
        <PluginsOverviewPage
          rows={[
            {
              id: "plugin-1",
              name: "GitHub",
              connected: true,
              identityLabel: "computer-agents",
              providerLabel: "Integration",
            },
          ]}
          period="month"
          onPeriodChange={vi.fn()}
          analytics={analytics}
          controlsPortalId={CONTROLS_PORTAL_ID}
          onOpen={vi.fn()}
        />
      ),
    ],
  ])("renders the canonical shell for %s", (kind, createPage) => {
    const { container } = renderWithOverviewControls(createPage());
    const isGuideOverview = kind === "tags" || kind === "skills";
    const toolbarTitles: Record<string, string> = {
      computers: "All Computers",
      tags: "All Tags",
      plugins: "All Plugins",
    };

    expect(container.querySelectorAll(".resource-overview-page")).toHaveLength(
      1,
    );
    expect(
      container.querySelector(".resource-overview-page__header"),
    ).toBeNull();
    expect(container.querySelectorAll(".platform-analytics")).toHaveLength(
      isGuideOverview ? 0 : 1,
    );
    expect(
      container.querySelector(".resource-overview-analytics__chart-header"),
    ).toBeNull();
    expect(
      container.querySelectorAll(".resource-overview-page__table-section"),
    ).toHaveLength(1);
    if (isGuideOverview) {
      expect(
        screen.queryByRole("radiogroup", { name: "Analytics time frame" }),
      ).toBeNull();
      expect(
        screen.getByRole("region", {
          name:
            kind === "tags"
              ? "Get started with Tags and Plugins"
              : "Get started with Skills",
        }),
      ).not.toBeNull();
      expect(screen.queryByText("No activity yet.")).toBeNull();
    } else {
      expect(
        screen
          .getByRole("radiogroup", { name: "Analytics time frame" })
          .getAttribute("data-platform-switch"),
      ).toBe("true");
      expect(screen.getByText("No data available yet")).not.toBeNull();
      expect(
        screen.getByText(
          "Analytics will appear here once activity has been recorded.",
        ),
      ).not.toBeNull();
    }
    expect(
      container.querySelector(
        `.platform-data-table.is-fill-layout.${isGuideOverview ? "is-catalog-ui" : "is-minimalistic-ui"}`,
      ),
    ).not.toBeNull();
    if (isGuideOverview) {
      expect(
        screen.queryByRole("navigation", { name: /pagination/ }),
      ).toBeNull();
    } else {
      expect(
        screen.getByRole("navigation", { name: /pagination/ }),
      ).not.toBeNull();
    }
    if (kind === "agents") {
      const tabBar = screen.getByRole("navigation", {
        name: "Agent categories",
      });
      expect(tabBar.getAttribute("data-platform-detail-tab-bar-variant")).toBe(
        "minimal",
      );
      expect(
        screen.queryByRole("heading", {
          name: "All Agents",
          level: 2,
        }),
      ).toBeNull();
    } else if (kind === "tags") {
      expect(
        screen.getByRole("heading", {
          name: "Connect agents everywhere",
          level: 1,
        }),
      ).not.toBeNull();
      expect(
        screen.queryByRole("navigation", {
          name: "Tag and plugin categories",
        }),
      ).toBeNull();
    } else if (kind === "skills") {
      expect(
        screen.getByRole("heading", {
          name: "Give agents reusable expertise",
          level: 1,
        }),
      ).not.toBeNull();
      expect(
        screen.queryByRole("navigation", {
          name: "Skill categories",
        }),
      ).toBeNull();
    } else {
      expect(
        screen.getByRole("heading", { name: toolbarTitles[kind], level: 2 }),
      ).not.toBeNull();
    }
    if (!isGuideOverview) {
      expect(screen.getByText("1-1 of 1")).not.toBeNull();
    }
    expect(screen.getByRole("button", { name: /Sort Name/ })).not.toBeNull();
  });

  it("preserves an explicitly iconless primary action in the app-header portal", () => {
    const { container } = renderWithOverviewControls(
      <ResourceOverviewPage<{ id: string; name: string }>
        showPeriodSelector={false}
        controlsPortalId={CONTROLS_PORTAL_ID}
        heroContent={<div>Overview</div>}
        table={{
          rows: [],
          columns: [{ id: "name", header: "Name", accessor: "name" }],
          getRowId: (row) => row.id,
          ariaLabel: "Resources",
          toolbar: {
            primaryAction: {
              label: "Manage Repos",
              icon: null,
              onClick: vi.fn(),
            },
          },
        }}
      />,
    );

    expect(
      within(container)
        .getByRole("button", { name: "Manage Repos" })
        .querySelector("svg"),
    ).toBeNull();
  });

  it("renders computer names without icons and maps profiles to shared labels", () => {
    const { container } = render(
      <ComputersOverviewPage
        rows={[
          {
            id: "light",
            name: "Light Computer",
            profileLabel: "Light",
            status: "Stopped",
            isRunning: false,
            creatorName: "Computer Agents",
            creatorAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg",
            createdLabel: "Today",
            lastUsedLabel: "Never",
          },
          {
            id: "standard",
            name: "Standard Computer",
            profileLabel: "Standard",
            status: "Running",
            isRunning: true,
            creatorName: "Me",
            creatorFallback: "ME",
            createdLabel: "Today",
            lastUsedLabel: "Now",
          },
          {
            id: "power",
            name: "Power Computer",
            profileLabel: "Power",
            status: "Stopped",
            isRunning: false,
            creatorName: "Me",
            creatorFallback: "ME",
            createdLabel: "Today",
            lastUsedLabel: "Never",
          },
          {
            id: "desktop",
            name: "Desktop Computer",
            profileLabel: "Desktop",
            status: "Stopped",
            isRunning: false,
            creatorName: "Me",
            creatorFallback: "ME",
            createdLabel: "Today",
            lastUsedLabel: "Never",
          },
        ]}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onShare={vi.fn()}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen
        .getByText("Light Computer")
        .closest(".platform-data-table__cell")
        ?.querySelector("svg"),
    ).toBeNull();
    expect(
      screen.getByText("Light").getAttribute("data-platform-label-variant"),
    ).toBe("gray");
    expect(
      screen.getByText("Standard").getAttribute("data-platform-label-variant"),
    ).toBe("blue");
    expect(
      screen.getByText("Power").getAttribute("data-platform-label-variant"),
    ).toBe("yellow");
    expect(
      screen.getByText("Desktop").getAttribute("data-platform-label-variant"),
    ).toBe("green");
    expect(
      screen.getByText("Light").querySelector(".platform-label__icon"),
    ).toBeNull();
    expect(
      screen.getByText("Desktop").querySelector(".platform-label__icon"),
    ).toBeNull();
    expect(
      screen
        .getByText("Computer Agents")
        .closest(".resource-overview-identity")
        ?.querySelector("img")
        ?.getAttribute("src"),
    ).toBe("/img/agent-profile-pics/ca-profilepic.jpg");
    expect(container.querySelectorAll(".platform-label")).toHaveLength(4);
  });

  it("renders Tags and Plugins in one grouped catalog without selection", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onOpenPlugin = vi.fn();
    const rows = [
      {
        id: "email",
        name: "Email",
        connected: true,
        identityLabel: "mail@example.com",
        providerLabel: "Channel",
      },
      {
        id: "telegram",
        name: "Telegram",
        connected: false,
        identityLabel: "Not connected",
        providerLabel: "Channel",
      },
      {
        id: "discord",
        name: "Discord",
        connected: false,
        identityLabel: "Not connected",
        providerLabel: "Channel",
      },
    ];
    const pluginRows = [
      {
        id: "github",
        name: "GitHub",
        connected: true,
        identityLabel: "computer-agents",
        providerLabel: "Source control",
      },
      {
        id: "notion",
        name: "Notion",
        connected: false,
        identityLabel: "Not connected",
        providerLabel: "Knowledge",
      },
      {
        id: "gitlab",
        name: "GitLab",
        connected: false,
        identityLabel: "Not connected",
        providerLabel: "Source control",
      },
      {
        id: "google-drive",
        name: "Google Drive",
        connected: false,
        identityLabel: "Not connected",
        providerLabel: "Storage",
      },
    ];
    const { container } = render(
      <TagsOverviewPage
        tagRows={rows}
        pluginRows={pluginRows}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpenTag={onOpen}
        onOpenPlugin={onOpenPlugin}
      />,
    );

    expect(
      container.querySelectorAll(
        ".resource-overview-identity__visual.is-connection.is-size-compact",
      ),
    ).toHaveLength(3);
    expect(
      within(screen.getByRole("row", { name: "Email" }))
        .getByText("Connected")
        .getAttribute("data-platform-label-variant"),
    ).toBe("green");
    expect(
      within(screen.getByRole("row", { name: "Telegram" }))
        .getByText("Not Connected")
        .getAttribute("data-platform-label-variant"),
    ).toBe("gray");
    expect(
      within(screen.getByRole("row", { name: "GitHub" }))
        .getByText("Connected")
        .getAttribute("data-platform-label-variant"),
    ).toBe("green");
    expect(
      within(screen.getByRole("row", { name: "Notion" }))
        .getByText("Not Connected")
        .getAttribute("data-platform-label-variant"),
    ).toBe("gray");
    expect(
      container.querySelectorAll(
        ".resource-overview-identity__visual.is-plugin",
      ),
    ).toHaveLength(4);
    expect(
      screen
        .getByRole("row", { name: "GitLab" })
        .querySelector(
          ".resource-overview-identity__visual.is-plugin.is-gitlab",
        ),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("row", { name: "Email" })
        .querySelector(".resource-overview-identity__visual.is-plugin"),
    ).toBeNull();
    expect(
      container.querySelectorAll(
        ".resource-overview-identity__visual.is-tag",
      ),
    ).toHaveLength(3);
    expect(
      screen
        .getByRole("row", { name: "Discord" })
        .querySelector(".resource-overview-identity__visual.is-discord"),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("row", { name: "Email" })
        .querySelector(".resource-overview-identity__visual.is-email"),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("row", { name: "Telegram" })
        .querySelector(".resource-overview-identity__visual.is-telegram"),
    ).not.toBeNull();
    expect(screen.queryByRole("button", { name: "New Custom Tag" })).toBeNull();
    expect(
      container.querySelector("[data-platform-page-hero='true']"),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Connect agents everywhere",
        level: 1,
      }),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(
        ".platform-ui-card.is-feature[data-platform-ui-card-variant='feature']",
      ),
    ).toHaveLength(0);
    expect(
      container.querySelector(".platform-data-table__pagination"),
    ).toBeNull();
    const catalogTable = container.querySelector(
      ".platform-data-table.is-catalog-ui",
    );
    const catalogToolbar = catalogTable?.querySelector(
      ".platform-data-table__toolbar",
    );
    const catalogLeading = catalogTable?.querySelector(
      ".platform-data-table__toolbar-leading",
    );
    const catalogControls = catalogTable?.querySelector(
      ".platform-data-table__toolbar-controls",
    );
    const table = screen.getByRole("table", { name: "Tags and Plugins" });
    const search = screen.getByRole("searchbox", {
      name: "Search tags and plugins",
    });
    const guide = screen.getByRole("region", {
      name: "Get started with Tags and Plugins",
    });
    expect(catalogTable).not.toBeNull();
    expect(
      catalogTable?.parentElement?.classList.contains(
        "has-full-bleed-table",
      ),
    ).toBe(true);
    expect(catalogToolbar?.classList.contains("has-title-line")).toBe(false);
    expect(catalogLeading).toBeNull();
    expect(catalogControls?.contains(search)).toBe(true);
    expect(screen.queryByRole("button", { name: "Filter" })).toBeNull();
    expect(
      within(guide).queryByRole("navigation", {
        name: "Tag and plugin categories",
      }),
    ).toBeNull();
    expect(
      within(guide).queryByText(
        "Use Tags to invoke agents from communication channels and Plugins to connect the external services agents use while working.",
      ),
    ).toBeNull();
    expect(within(table).queryByRole("checkbox")).toBeNull();
    expect(
      within(table).queryByRole("columnheader", { name: /Provider/ }),
    ).toBeNull();
    expect(
      within(table)
        .getAllByRole("button", { name: /Collapse (Plugins|Tags)/ })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Collapse Plugins", "Collapse Tags"]);
    expect(
      table.querySelector(".platform-data-table__group-indicator"),
    ).toBeNull();
    const githubRow = screen.getByRole("row", { name: "GitHub" });
    expect(githubRow).not.toBeNull();
    expect(githubRow.parentElement?.classList.contains("is-grouped-row")).toBe(
      true,
    );
    expect(
      githubRow.parentElement?.classList.contains("has-group-indicator"),
    ).toBe(false);
    expect(screen.getByRole("row", { name: "Email" })).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Explore Email" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Explore GitHub" })).toBeNull();

    await user.click(
      within(table).getByRole("button", { name: "Collapse Plugins" }),
    );
    expect(screen.queryByRole("row", { name: "GitHub" })).toBeNull();
    expect(screen.getByRole("row", { name: "Email" })).not.toBeNull();

    await user.click(
      within(table).getByRole("button", { name: "Expand Plugins" }),
    );
    await user.click(screen.getByRole("row", { name: "GitHub" }));
    expect(onOpenPlugin).toHaveBeenCalledWith(pluginRows[0]);
    await user.click(screen.getByRole("row", { name: "Email" }));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
  });

  it("renders Skills in one grouped full-screen catalog", async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    const onCreate = vi.fn();
    const onOpen = vi.fn();
    const rows = [
      {
        id: "computer_agents",
        name: "Computer Agents Skill",
        description: "Browse and interact with websites.",
        isActive: true,
        isCustom: false,
        updatedLabel: "System",
      },
      {
        id: "audit",
        name: "Audit",
        description: "Apply the organization audit workflow.",
        isActive: true,
        isCustom: true,
        creatorName: "Jane Doe",
        creatorAvatarUrl: "/img/people/jane.jpg",
        updatedLabel: "Today",
      },
    ];
    const sharedProps = {
      rows,
      onModeChange,
      period: "month" as const,
      onPeriodChange: vi.fn(),
      analytics,
      onOpen,
      onCreate,
      onEdit: vi.fn(),
      onRename: vi.fn(),
      onDelete: vi.fn(),
    };
    const { container } = render(
      <SkillsOverviewPage mode="system" {...sharedProps} />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Give agents reusable expertise",
        level: 1,
      }),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(
        ".platform-ui-card.is-feature[data-platform-ui-card-variant='feature']",
      ),
    ).toHaveLength(0);
    expect(
      screen.queryByText(
        "Use maintained system skills or create custom guidance that gives agents repeatable workflows, tool knowledge, and execution standards.",
      ),
    ).toBeNull();
    expect(screen.getByText("Computer Agents Skill")).not.toBeNull();
    expect(screen.getByText("Audit")).not.toBeNull();
    expect(screen.getByText("Browse and interact with websites.")).not.toBeNull();
    expect(
      container.querySelector(".platform-data-table.is-catalog-ui"),
    ).not.toBeNull();
    expect(
      container
        .querySelector(".platform-data-table.is-catalog-ui")
        ?.parentElement?.classList.contains("has-full-bleed-table"),
    ).toBe(true);
    expect(
      container.querySelector(".platform-data-table__pagination"),
    ).toBeNull();
    expect(
      screen.queryByRole("navigation", { name: "Skill categories" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Filter" })).toBeNull();
    const table = screen.getByRole("table", { name: "Skills" });
    expect(within(table).queryByRole("checkbox")).toBeNull();
    expect(
      within(table).queryByRole("columnheader", { name: "Type" }),
    ).toBeNull();
    expect(
      within(table).queryByRole("columnheader", { name: "Status" }),
    ).toBeNull();
    expect(
      within(table).getByRole("columnheader", { name: "Creator" }),
    ).not.toBeNull();
    expect(
      within(screen.getByRole("row", { name: "Computer Agents Skill" }))
        .getByText("Computer Agents")
        ?.closest(".resource-overview-identity")
        ?.querySelector("img")
        ?.getAttribute("src"),
    ).toBe("/img/agent-profile-pics/ca-profilepic.jpg");
    expect(
      within(screen.getByRole("row", { name: "Audit" }))
        .getByText("Jane Doe")
        ?.closest(".resource-overview-identity")
        ?.querySelector("img")
        ?.getAttribute("src"),
    ).toBe("/img/people/jane.jpg");
    expect(
      screen
        .getByRole("row", { name: "Computer Agents Skill" })
        .querySelector(
          ".resource-overview-identity__visual.is-skill.is-computer-agents",
        ),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(
        ".resource-overview-identity__visual.is-skill",
      ),
    ).toHaveLength(2);
    expect(
      within(table)
        .getAllByRole("button", {
          name: /Collapse (System Skills|Custom Skills)/,
        })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Collapse System Skills", "Collapse Custom Skills"]);

    await user.click(
      within(table).getByRole("button", { name: "Collapse Custom Skills" }),
    );
    expect(screen.queryByRole("row", { name: "Audit" })).toBeNull();
    expect(
      screen.getByRole("row", { name: "Computer Agents Skill" }),
    ).not.toBeNull();

    await user.click(
      within(table).getByRole("button", { name: "Expand Custom Skills" }),
    );
    await user.click(screen.getByRole("row", { name: "Audit" }));
    expect(onOpen).toHaveBeenCalledWith(rows[1]);
    expect(onModeChange).not.toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("routes period changes through the common selector", async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();
    renderWithOverviewControls(
      <PluginsOverviewPage
        rows={[]}
        period="month"
        onPeriodChange={onPeriodChange}
        analytics={analytics}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "7D" }));
    expect(onPeriodChange).toHaveBeenCalledWith("week");
  });

  it("portals the primary create action and time frame selector outside the page body", () => {
    renderWithOverviewControls(
      <ComputersOverviewPage
        rows={[]}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onShare={vi.fn()}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const createButton = screen.getByRole("button", { name: "Computer" });
    expect(screen.getByTestId("overview-controls").contains(createButton)).toBe(
      true,
    );
    expect(
      screen
        .getByTestId("overview-controls")
        .contains(
          screen.getByRole("radiogroup", { name: "Analytics time frame" }),
        ),
    ).toBe(true);
    expect(
      document.querySelector(".resource-overview-page__header"),
    ).toBeNull();
    expect(createButton.closest(".platform-data-table__toolbar")).toBeNull();
  });

  it("uses the shared minimal tab bar for agent and squad modes", async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    render(
      <AgentsOverviewPage
        rows={[]}
        mode="agents"
        onModeChange={onModeChange}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
        onCreateAgent={vi.fn()}
        onCreateSquad={vi.fn()}
        onRename={vi.fn()}
        onShare={vi.fn()}
        onAddToSquad={vi.fn()}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const tabBar = screen.getByRole("navigation", { name: "Agent categories" });
    expect(tabBar.getAttribute("data-platform-detail-tab-bar-variant")).toBe(
      "minimal",
    );
    expect(tabBar.classList.contains("has-divider")).toBe(false);
    expect(
      within(tabBar)
        .getByRole("tab", { name: "Agents" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    await user.click(within(tabBar).getByRole("tab", { name: "Squads" }));
    expect(onModeChange).toHaveBeenCalledWith("squads");
  });

  it("places agent usage after name and sorts most-used agents first", () => {
    render(
      <AgentsOverviewPage
        rows={[
          {
            id: "agent-low",
            name: "Alpha",
            usageTokens: 1200,
            modelLabel: "Spark",
            creatorName: "Me",
            lastUsedLabel: "Today",
          },
          {
            id: "agent-high",
            name: "Beta",
            usageTokens: 9800,
            modelLabel: "Spark",
            creatorName: "Me",
            lastUsedLabel: "Today",
          },
        ]}
        mode="agents"
        onModeChange={vi.fn()}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
        onCreateAgent={vi.fn()}
        onCreateSquad={vi.fn()}
        onRename={vi.fn()}
        onShare={vi.fn()}
        onAddToSquad={vi.fn()}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const columnIds = screen
      .getAllByRole("columnheader")
      .map((header) => header.getAttribute("data-column-id"))
      .filter(Boolean);
    expect(columnIds.slice(0, 2)).toEqual(["name", "usage"]);
    const usageHeader = screen.getByRole("columnheader", {
      name: /Token Usage/,
    });
    expect(usageHeader.getAttribute("aria-sort")).toBe("descending");
    expect(
      usageHeader
        .querySelector(".platform-data-table__sort-icon")
        ?.classList.contains("is-bottom-active"),
    ).toBe(true);
    expect(
      screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getByText(/Alpha|Beta/).textContent),
    ).toEqual(["Beta", "Alpha"]);
    expect(screen.getByText("9,800").getAttribute("title")).toBe(
      "9,800 tokens",
    );
  });
});
