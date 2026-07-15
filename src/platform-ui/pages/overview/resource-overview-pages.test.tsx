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
    )],
    ["computers", () => (
      <ComputersOverviewPage
        rows={[{
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
        }]}
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
        controlsPortalId={CONTROLS_PORTAL_ID}
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
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={vi.fn()}
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
        controlsPortalId={CONTROLS_PORTAL_ID}
        onOpen={vi.fn()}
      />
    )],
  ])("renders the canonical shell for %s", (kind, createPage) => {
    const { container } = renderWithOverviewControls(createPage());
    const isTagsOverview = kind === "tags";
    const toolbarTitles: Record<string, string> = {
      agents: "All Agents",
      computers: "All Computers",
      skills: "All Skills",
      tags: "All Tags",
      plugins: "All Plugins",
    };

    expect(container.querySelectorAll(".resource-overview-page")).toHaveLength(1);
    expect(container.querySelector(".resource-overview-page__header")).toBeNull();
    expect(container.querySelectorAll(".platform-analytics")).toHaveLength(isTagsOverview ? 0 : 1);
    expect(container.querySelector(".resource-overview-analytics__chart-header")).toBeNull();
    expect(container.querySelectorAll(".resource-overview-page__table-section")).toHaveLength(1);
    if (isTagsOverview) {
      expect(screen.queryByRole("radiogroup", { name: "Analytics time frame" })).toBeNull();
      expect(screen.getByRole("region", { name: "Get started with Tags" })).not.toBeNull();
      expect(screen.queryByText("No activity yet.")).toBeNull();
    } else {
      expect(screen.getByRole("radiogroup", { name: "Analytics time frame" }).getAttribute("data-platform-switch")).toBe("true");
      expect(screen.getByText("No activity yet.")).not.toBeNull();
    }
    expect(container.querySelector(".platform-data-table.is-fill-layout")).not.toBeNull();
    expect(screen.getByRole("navigation", { name: /pagination/ })).not.toBeNull();
    expect(screen.getByRole("heading", { name: toolbarTitles[kind], level: 2 })).not.toBeNull();
    expect(screen.getByText("1-1 of 1")).not.toBeNull();
    expect(screen.getByRole("button", { name: /Sort Name/ })).not.toBeNull();
  });

  it("renders computer names without icons and maps profiles to shared labels", () => {
    const { container } = render(
      <ComputersOverviewPage
        rows={[
          { id: "light", name: "Light Computer", profileLabel: "Light", status: "Stopped", isRunning: false, creatorName: "Computer Agents", creatorAvatarUrl: "/img/agent-profile-pics/ca-profilepic.jpg", createdLabel: "Today", lastUsedLabel: "Never" },
          { id: "standard", name: "Standard Computer", profileLabel: "Standard", status: "Running", isRunning: true, creatorName: "Me", creatorFallback: "ME", createdLabel: "Today", lastUsedLabel: "Now" },
          { id: "power", name: "Power Computer", profileLabel: "Power", status: "Stopped", isRunning: false, creatorName: "Me", creatorFallback: "ME", createdLabel: "Today", lastUsedLabel: "Never" },
          { id: "desktop", name: "Desktop Computer", profileLabel: "Desktop", status: "Stopped", isRunning: false, creatorName: "Me", creatorFallback: "ME", createdLabel: "Today", lastUsedLabel: "Never" },
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

    expect(screen.getByText("Light Computer").closest(".platform-data-table__cell")?.querySelector("svg")).toBeNull();
    expect(screen.getByText("Light").getAttribute("data-platform-label-variant")).toBe("gray");
    expect(screen.getByText("Standard").getAttribute("data-platform-label-variant")).toBe("blue");
    expect(screen.getByText("Power").getAttribute("data-platform-label-variant")).toBe("yellow");
    expect(screen.getByText("Desktop").getAttribute("data-platform-label-variant")).toBe("green");
    expect(screen.getByText("Computer Agents").closest(".resource-overview-identity")?.querySelector("img")?.getAttribute("src")).toBe("/img/agent-profile-pics/ca-profilepic.jpg");
    expect(container.querySelectorAll(".platform-label")).toHaveLength(4);
  });

  it("renders the Tags guide, compact icons, and shared connection labels", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const rows = [
      { id: "email", name: "Email", connected: true, identityLabel: "mail@example.com", providerLabel: "Channel" },
      { id: "telegram", name: "Telegram", connected: false, identityLabel: "Not connected", providerLabel: "Channel" },
    ];
    const { container } = render(
      <TagsOverviewPage
        rows={rows}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={onOpen}
      />,
    );

    expect(container.querySelectorAll(".resource-overview-identity__visual.is-connection.is-size-compact")).toHaveLength(2);
    expect(screen.getByText("Connected").getAttribute("data-platform-label-variant")).toBe("green");
    expect(screen.getByText("Not Connected").getAttribute("data-platform-label-variant")).toBe("gray");
    expect(screen.queryByRole("button", { name: "New Custom Tag" })).toBeNull();
    expect(screen.getByText("Connect Email, Telegram, and Discord to start agent tasks and receive results directly in those channels.")).not.toBeNull();
    expect(screen.getByRole("link", { name: "Quickstart" }).getAttribute("href")).toBe("/developers/quickstart");
    expect(screen.getByRole("link", { name: "Documentation" }).getAttribute("href")).toBe("/developers/run-and-scale/webhooks");
    expect(screen.getByRole("link", { name: "Event-driven tutorial" }).getAttribute("href")).toBe("/tutorials/event-driven-triggers");

    await user.click(screen.getByRole("button", { name: "Run tasks by email" }));
    expect(onOpen).toHaveBeenCalledWith(rows[0]);
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
    expect(screen.getByTestId("overview-controls").contains(createButton)).toBe(true);
    expect(screen.getByTestId("overview-controls").contains(screen.getByRole("radiogroup", { name: "Analytics time frame" }))).toBe(true);
    expect(document.querySelector(".resource-overview-page__header")).toBeNull();
    expect(createButton.closest(".platform-data-table__toolbar")).toBeNull();
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
