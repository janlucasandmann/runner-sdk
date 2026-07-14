// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { AgentsOverviewPage } from "../../../platform-resources/agents/overview/agents-overview-page.js";
import { ComputersOverviewPage } from "../../../platform-resources/computers/overview/computers-overview-page.js";
import { PluginsOverviewPage } from "../../../platform-resources/plugins/overview/plugins-overview-page.js";
import { SkillsOverviewPage } from "../../../platform-resources/skills/overview/skills-overview-page.js";
import { TagsOverviewPage } from "../../../platform-resources/tags/overview/tags-overview-page.js";
import type { ResourceOverviewAnalyticsModel } from "./resource-overview-types.js";

const analytics: ResourceOverviewAnalyticsModel = {
  title: "Activity",
  metrics: [
    { id: "total", label: "Total", value: "1", color: "#fff" },
    { id: "active", label: "Active", value: "1", color: "#7effff" },
  ],
  labels: [],
  series: [],
  emptyState: "No activity yet.",
};

afterEach(cleanup);

describe("resource overview pages", () => {
  it.each([
    ["agents", () => (
      <AgentsOverviewPage
        rows={[{
          id: "agent-1",
          name: "Forge",
          usageTokens: 3200,
          modelLabel: "Spark",
          creatorName: "Me",
          lastUsedLabel: "Today",
        }]}
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
      />
    )],
    ["computers", () => (
      <ComputersOverviewPage
        rows={[{
          id: "computer-1",
          name: "Main Computer",
          profileLabel: "Standard",
          status: "Running",
          isRunning: true,
          createdLabel: "Today",
          lastUsedLabel: "Now",
        }]}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onShare={vi.fn()}
        onCopy={vi.fn()}
        onDelete={vi.fn()}
      />
    )],
    ["skills", () => (
      <SkillsOverviewPage
        rows={[{
          id: "skill-1",
          name: "Browser",
          isActive: true,
          isCustom: false,
          updatedLabel: "System",
        }]}
        mode="system"
        onModeChange={vi.fn()}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />
    )],
    ["tags", () => (
      <TagsOverviewPage
        rows={[{
          id: "tag-1",
          name: "Email",
          connected: true,
          identityLabel: "mail@example.com",
          providerLabel: "Channel",
        }]}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
      />
    )],
    ["plugins", () => (
      <PluginsOverviewPage
        rows={[{
          id: "plugin-1",
          name: "GitHub",
          connected: true,
          identityLabel: "computer-agents",
          providerLabel: "Integration",
        }]}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={vi.fn()}
      />
    )],
  ])("renders the canonical shell for %s", (kind, createPage) => {
    const { container } = render(createPage());
    const toolbarTitles: Record<string, string> = {
      agents: "All Agents",
      computers: "All Computers",
      skills: "All Skills",
      tags: "All Tags",
      plugins: "All Plugins",
    };

    expect(container.querySelectorAll(".resource-overview-page")).toHaveLength(1);
    expect(container.querySelectorAll(".resource-overview-analytics")).toHaveLength(1);
    expect(container.querySelector(".resource-overview-analytics__chart-header")).toBeNull();
    expect(container.querySelectorAll(".resource-overview-page__table-section")).toHaveLength(1);
    expect(screen.getByRole("radiogroup", { name: "Analytics time frame" }).getAttribute("data-platform-switch")).toBe("true");
    expect(container.querySelector(".platform-data-table.is-fill-layout")).not.toBeNull();
    expect(screen.getByRole("navigation", { name: /pagination/ })).not.toBeNull();
    expect(screen.getByRole("heading", { name: toolbarTitles[kind], level: 2 })).not.toBeNull();
    expect(screen.getByText("1-1 of 1")).not.toBeNull();
    expect(screen.getByText("No activity yet.")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Sort Name/ })).not.toBeNull();
  });

  it("routes period changes through the common selector", async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();
    render(
      <PluginsOverviewPage
        rows={[]}
        period="month"
        onPeriodChange={onPeriodChange}
        analytics={analytics}
        onOpen={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "1W" }));
    expect(onPeriodChange).toHaveBeenCalledWith("week");
  });

  it("uses the shared switch for agent and squad modes", async () => {
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

    expect(screen.getByRole("radiogroup", { name: "Agent type" }).getAttribute("data-platform-switch")).toBe("true");
    await user.click(screen.getByRole("radio", { name: "Squads" }));
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

    const columnIds = screen.getAllByRole("columnheader")
      .map((header) => header.getAttribute("data-column-id"))
      .filter(Boolean);
    expect(columnIds.slice(0, 2)).toEqual(["name", "usage"]);
    const usageHeader = screen.getByRole("columnheader", { name: /Token Usage/ });
    expect(usageHeader.getAttribute("aria-sort")).toBe("descending");
    expect(usageHeader.querySelector(".platform-data-table__sort-icon")?.classList.contains("is-bottom-active")).toBe(true);
    expect(screen.getAllByRole("row").slice(1).map((row) => within(row).getByText(/Alpha|Beta/).textContent)).toEqual(["Beta", "Alpha"]);
    expect(screen.getByText("9,800").getAttribute("title")).toBe("9,800 tokens");
  });
});
