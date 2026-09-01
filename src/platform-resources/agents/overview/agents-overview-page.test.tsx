// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAgentsOverviewAnalytics } from "./agents-overview-analytics.js";
import {
  type AgentOverviewRow,
  AgentsOverviewPage,
} from "./agents-overview-page.js";

const analytics = createAgentsOverviewAnalytics({
  agentCount: 4,
  squadCount: 1,
  buckets: [],
});

afterEach(() => {
  cleanup();
});

describe("AgentsOverviewPage", () => {
  it("uses the same canonical circular avatar for agents, squads, and creators", () => {
    const { container } = render(
      <AgentsOverviewPage
        rows={[
          {
            id: "agent-visuals",
            name: "Visual Agent",
            usageTokens: 1200,
            avatarUrl: "/agent.png",
            modelLabel: "DeepSeek V4 Flash",
            modelIconUrl: "/model.svg",
            creatorName: "Creator",
            creatorAvatarUrl: "/creator.png",
            lastUsedLabel: "Today",
          },
          {
            id: "squad-visuals",
            name: "Visual Squad",
            usageTokens: 800,
            avatarUrl: "/squad.png",
            isSquad: true,
            modelLabel: "DeepSeek V4 Flash",
            creatorName: "Creator",
            creatorAvatarUrl: "/creator.png",
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

    expect(
      container.querySelector(
        '.resource-overview-identity__visual.is-agent > img[src="/agent.png"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        '.resource-overview-identity__visual.is-creator > img[src="/creator.png"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        '.resource-overview-identity__visual.is-squad > img[src="/squad.png"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        '.resource-overview-identity__visual.is-model > img[src="/model.svg"]',
      ),
    ).not.toBeNull();

    const styles = readFileSync(
      join(process.cwd(), "src/platform-ui/pages/overview/resource-overview.css"),
      "utf8",
    );
    expect(styles).toMatch(
      /\.resource-overview-table\.is-agents\.is-catalog-ui[\s\S]*?\.resource-overview-identity__visual\.is-agent,[\s\S]*?\.resource-overview-table\.is-agents\.is-catalog-ui[\s\S]*?\.resource-overview-identity__visual\.is-squad\s*\{[\s\S]*?width:\s*26px;[\s\S]*?height:\s*26px;[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*50%;/,
    );
    expect(styles).toMatch(
      /\.resource-overview-table\.is-agents\.is-catalog-ui[\s\S]*?\.resource-overview-identity__visual\.is-creator\s*\{[\s\S]*?width:\s*26px;[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*50%;/,
    );
    expect(styles).toMatch(
      /\.resource-overview-table\.is-agents\.is-catalog-ui[\s\S]*?\.resource-overview-identity__visual\.is-model\s*\{[\s\S]*?width:\s*20px;[\s\S]*?height:\s*20px;[\s\S]*?padding:\s*0;[\s\S]*?border:\s*0;[\s\S]*?border-radius:\s*0;/,
    );
  });

  it("reuses catalog pagination to reveal 20 rows initially and 10 more at the bottom", () => {
    const rows = Array.from({ length: 35 }, (_, index): AgentOverviewRow => ({
      id: `agent-${index + 1}`,
      name: `Agent ${String(index + 1).padStart(2, "0")}`,
      usageTokens: 35 - index,
      modelLabel: "DeepSeek V4 Flash",
      creatorName: "Computer Agents",
      lastUsedLabel: "Never",
    }));
    const { container } = render(
      <AgentsOverviewPage
        rows={rows}
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

    expect(screen.getByText("Agent 20")).not.toBeNull();
    expect(screen.queryByText("Agent 21")).toBeNull();

    const scroll = container.querySelector<HTMLElement>(
      ".platform-data-table__scroll",
    );
    expect(scroll).not.toBeNull();
    Object.defineProperties(scroll as HTMLElement, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 600, writable: true },
    });
    fireEvent.scroll(scroll as HTMLElement);

    expect(screen.getByText("Agent 30")).not.toBeNull();
    expect(screen.queryByText("Agent 31")).toBeNull();
  });

  it("exposes only Agents and Squads as overview categories", async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    const { container } = render(
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

    const tabs = screen.getByRole("navigation", { name: "Agent categories" });
    expect(
      container
        .querySelector(".resource-overview-page")
        ?.getAttribute("data-resource-overview-page-variant"),
    ).toBe("analytics-catalog");
    expect(
      container.querySelector(
        ".resource-overview-page__analytics-header .platform-analytics",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".resource-overview-page__analytics-header .platform-analytics__chart",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(".platform-data-table.is-catalog-ui"),
    ).not.toBeNull();
    expect(
      within(tabs)
        .getByRole("tab", { name: "Agents" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(within(tabs).getAllByRole("tab")).toHaveLength(2);
    expect(
      within(tabs).queryByRole("tab", { name: "Functional Agents" }),
    ).toBeNull();
    expect(screen.getByPlaceholderText("Search agents")).not.toBeNull();

    await user.click(within(tabs).getByRole("tab", { name: "Squads" }));
    expect(onModeChange).toHaveBeenCalledWith("squads");
  });
});
