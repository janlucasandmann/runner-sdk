// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAgentsOverviewAnalytics } from "./agents-overview-analytics.js";
import {
  type AgentOverviewRow,
  AgentsOverviewPage,
} from "./agents-overview-page.js";

const missionControlRow: AgentOverviewRow = {
  id: "agent-mission-control",
  name: "Mission Control",
  usageTokens: 1200,
  isFunctional: true,
  isSystem: true,
  modelLabel: "DeepSeek V4 Flash",
  creatorName: "Computer Agents",
  creatorIsSystem: true,
  lastUsedLabel: "Today",
};

const communicatorRow: AgentOverviewRow = {
  id: "agent-thread-communicator-user-1",
  name: "Communicator",
  usageTokens: 0,
  isFunctional: true,
  isSystem: true,
  modelLabel: "DeepSeek V4 Flash",
  creatorName: "Computer Agents",
  creatorIsSystem: true,
  lastUsedLabel: "Never",
};

const analytics = createAgentsOverviewAnalytics({
  agentCount: 4,
  squadCount: 1,
  buckets: [],
});

afterEach(() => {
  cleanup();
});

describe("AgentsOverviewPage", () => {
  it("presents persisted functional agents as an editable third category", async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();
    const onOpen = vi.fn();
    const { container } = render(
      <AgentsOverviewPage
        rows={[missionControlRow, communicatorRow]}
        mode="functional"
        onModeChange={onModeChange}
        period="month"
        onPeriodChange={vi.fn()}
        analytics={analytics}
        onOpen={onOpen}
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
      within(tabs)
        .getByRole("tab", { name: "Functional Agents" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(within(tabs).getAllByRole("tab")).toHaveLength(3);
    expect(
      screen.getByPlaceholderText("Search functional agents"),
    ).not.toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /new agent/i })).toBeNull();
    expect(
      container.querySelector(".platform-data-table__row-actions-trigger"),
    ).toBeNull();

    await user.click(screen.getByText("Communicator"));
    expect(onOpen).toHaveBeenCalledWith(communicatorRow);

    await user.click(screen.getByText("Mission Control"));
    expect(onOpen).toHaveBeenCalledWith(missionControlRow);

    await user.click(within(tabs).getByRole("tab", { name: "Agents" }));
    expect(onModeChange).toHaveBeenCalledWith("agents");
  });
});
