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
          mode="tags"
          onModeChange={vi.fn()}
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
        ".platform-data-table.is-fill-layout.is-minimalistic-ui",
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
    if (kind === "agents" || kind === "tags" || kind === "skills") {
      const tabBar = screen.getByRole("navigation", {
        name:
          kind === "agents"
            ? "Agent categories"
            : kind === "tags"
              ? "Tag and plugin categories"
              : "Skill categories",
      });
      expect(tabBar.getAttribute("data-platform-detail-tab-bar-variant")).toBe(
        "minimal",
      );
      expect(
        screen.queryByRole("heading", {
          name: `All ${kind === "agents" ? "Agents" : kind === "tags" ? "Tags" : "Skills"}`,
          level: 2,
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

  it("renders the Tags guide, compact icons, and shared connection labels", async () => {
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
        id: "google-drive",
        name: "Google Drive",
        connected: false,
        identityLabel: "Not connected",
        providerLabel: "Storage",
      },
    ];
    const { container } = render(
      <TagsOverviewPage
        mode="tags"
        onModeChange={vi.fn()}
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
    ).toHaveLength(2);
    expect(
      screen.getByText("Connected").getAttribute("data-platform-label-variant"),
    ).toBe("green");
    expect(
      screen
        .getByText("Not Connected")
        .getAttribute("data-platform-label-variant"),
    ).toBe("gray");
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
      screen.getByRole("heading", { name: "Tags", level: 2 }),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Plugins", level: 2 }),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(
        ".platform-ui-card.is-feature[data-platform-ui-card-variant='feature']",
      ),
    ).toHaveLength(2);
    expect(
      container.querySelector(".platform-data-table__pagination"),
    ).toBeNull();
    expect(
      screen.getByText(
        "Use Tags to invoke agents from communication channels and Plugins to connect the external services agents use while working.",
      ),
    ).not.toBeNull();
    expect(
      screen.getByText(/Give agents identities in communication channels/),
    ).not.toBeNull();
    expect(
      screen.getByText(
        /Connect repositories, knowledge bases, and cloud storage/,
      ),
    ).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Explore Email" }));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
    await user.click(screen.getByRole("button", { name: "Explore GitHub" }));
    expect(onOpenPlugin).toHaveBeenCalledWith(pluginRows[0]);
  });

  it("uses the shared minimal tab bar for tag and plugin modes", async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    const sharedProps = {
      onModeChange,
      tagRows: [
        {
          id: "email",
          name: "Email",
          connected: true,
          identityLabel: "mail@example.com",
          providerLabel: "Channel",
        },
      ],
      pluginRows: [
        {
          id: "github",
          name: "GitHub",
          connected: true,
          identityLabel: "computer-agents",
          providerLabel: "Integration",
        },
      ],
      period: "month" as const,
      onPeriodChange: vi.fn(),
      analytics,
      onOpenTag: vi.fn(),
      onOpenPlugin: vi.fn(),
    };
    const { rerender } = render(
      <TagsOverviewPage mode="tags" {...sharedProps} />,
    );

    const tabBar = screen.getByRole("navigation", {
      name: "Tag and plugin categories",
    });
    expect(tabBar.getAttribute("data-platform-detail-tab-bar-variant")).toBe(
      "minimal",
    );
    expect(tabBar.classList.contains("has-divider")).toBe(false);
    expect(
      within(tabBar)
        .getByRole("tab", { name: "Tags" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByText("Email")).not.toBeNull();
    expect(screen.queryByText("GitHub")).toBeNull();
    await user.click(within(tabBar).getByRole("tab", { name: "Plugins" }));
    expect(onModeChange).toHaveBeenCalledWith("plugins");

    rerender(<TagsOverviewPage mode="plugins" {...sharedProps} />);
    expect(
      within(tabBar)
        .getByRole("tab", { name: "Plugins" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(screen.getByText("GitHub")).not.toBeNull();
    expect(screen.queryByText("Email")).toBeNull();
    expect(screen.queryByRole("group", { name: "Plugin category" })).toBeNull();
  });

  it("renders the Skills guide and switches between system and custom skills", async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    const onCreate = vi.fn();
    const rows = [
      {
        id: "browser",
        name: "Browser",
        isActive: true,
        isCustom: false,
        updatedLabel: "System",
      },
      {
        id: "audit",
        name: "Audit",
        isActive: true,
        isCustom: true,
        updatedLabel: "Today",
      },
    ];
    const sharedProps = {
      rows,
      onModeChange,
      period: "month" as const,
      onPeriodChange: vi.fn(),
      analytics,
      onOpen: vi.fn(),
      onCreate,
      onEdit: vi.fn(),
      onRename: vi.fn(),
      onDelete: vi.fn(),
    };
    const { container, rerender } = render(
      <SkillsOverviewPage mode="system" {...sharedProps} />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Give agents reusable expertise",
        level: 1,
      }),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "System Skills", level: 2 }),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "Custom Skills", level: 2 }),
    ).not.toBeNull();
    expect(
      container.querySelectorAll(
        ".platform-ui-card.is-feature[data-platform-ui-card-variant='feature']",
      ),
    ).toHaveLength(2);
    expect(screen.getByText("Browser")).not.toBeNull();
    expect(screen.queryByText("Audit")).toBeNull();
    expect(screen.getAllByText("1 skill")).toHaveLength(2);
    expect(
      container.querySelector(".platform-data-table__pagination"),
    ).toBeNull();

    const tabBar = screen.getByRole("navigation", { name: "Skill categories" });
    await user.click(
      within(tabBar).getByRole("tab", { name: "Custom Skills" }),
    );
    expect(onModeChange).toHaveBeenCalledWith("custom");
    await user.click(screen.getByRole("button", { name: "Create a Skill" }));
    expect(onCreate).toHaveBeenCalledTimes(1);

    rerender(<SkillsOverviewPage mode="custom" {...sharedProps} />);
    expect(screen.getByText("Audit")).not.toBeNull();
    expect(screen.queryByText("Browser")).toBeNull();
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
