import { describe, expect, it, vi } from "vitest";
import { createAgentsOverviewAnalytics } from "./agents-overview-analytics.js";

describe("createAgentsOverviewAnalytics", () => {
  it("reports total tokens and charts combined cost plus interval token usage", () => {
    const formatCurrency = vi.fn((value: number) => `$${value.toFixed(2)}`);
    const analytics = createAgentsOverviewAnalytics({
      agentCount: 3,
      squadCount: 2,
      formatCurrency,
      buckets: [
        { label: "Mon", agentRuns: 2, squadRuns: 1, agentCostUsd: 1.25, squadCostUsd: 0.5, tokens: 1_200 },
        { label: "Tue", agentRuns: 1, squadRuns: 2, agentCostUsd: 0.75, squadCostUsd: 1.5, tokens: 2_800 },
      ],
    });

    expect(analytics.metrics.map((metric) => metric.label)).toEqual([
      "Agents",
      "Squads",
      "Spent on Agents",
      "Spent on Squads",
      "Total tokens",
    ]);
    expect(analytics.metrics.at(-1)?.value).toBe("4,000");
    expect(analytics.series).toMatchObject([
      { id: "total-cost", type: "line", values: [1.75, 2.25] },
      { id: "tokens", type: "line", axis: "secondary", values: [1_200, 2_800] },
    ]);
  });

  it("uses combined runs as the primary line when cost data is unavailable", () => {
    const analytics = createAgentsOverviewAnalytics({
      agentCount: 1,
      squadCount: 1,
      buckets: [
        { label: "Now", agentRuns: 3, squadRuns: 2, agentCostUsd: 0, squadCostUsd: 0, tokens: 900 },
      ],
    });

    expect(analytics.series[0]).toMatchObject({ id: "runs", values: [5], valueKind: "count", type: "line" });
  });
});
