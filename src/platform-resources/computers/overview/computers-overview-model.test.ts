import { describe, expect, it } from "vitest";

import {
  createComputersOverviewAnalytics,
  getComputerLastUsedValue,
  normalizeComputerOverviewRows,
} from "./computers-overview-model.js";

describe("computers overview model", () => {
  it("normalizes rows and resolves an agent creator", () => {
    const rows = normalizeComputerOverviewRows([
      {
        id: "computer-1",
        name: "Build machine",
        status: "running",
        creatorId: "agent-1",
        createdAt: "2026-07-01T10:00:00.000Z",
        metadata: {
          lastRunAt: "2026-07-02T10:00:00.000Z",
        },
      },
      { id: "draft" },
    ], {
      draftId: "draft",
      agents: [{
        id: "agent-1",
        name: "Forge",
        photoUrl: "https://example.com/forge.png",
      }],
      resolveProfileLabel: () => "Power",
      formatDate: (value) => value.slice(0, 10),
      formatExactDate: (value) => value,
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "computer-1",
      name: "Build machine",
      profileLabel: "Power",
      isRunning: true,
      creatorName: "Forge",
      creatorAvatarUrl: "https://example.com/forge.png",
      createdLabel: "2026-07-01",
      lastUsedLabel: "2026-07-02",
    });
  });

  it("uses the most recent valid activity timestamp", () => {
    expect(getComputerLastUsedValue({
      lastRunAt: "2026-06-01T00:00:00.000Z",
      metadata: {
        resourceBilling: {
          activeSessionLastSettledAt: "2026-07-01T00:00:00.000Z",
        },
      },
      updatedAt: "2026-05-01T00:00:00.000Z",
    })).toBe("2026-07-01T00:00:00.000Z");
  });

  it("builds the canonical analytics projection", () => {
    const rows = normalizeComputerOverviewRows([
      { id: "a", name: "A", status: "running", computeProfile: "standard" },
      { id: "b", name: "B", status: "stopped", computeProfile: "power" },
    ], {
      resolveProfileLabel: (record) => String(record.computeProfile),
    });
    const analytics = createComputersOverviewAnalytics({
      rows,
      title: "Computer activity",
      labels: ["Jul 1", "Jul 2"],
      costValuesUsd: [1, 2],
      totalCostUsd: 3,
      formatCurrency: (value) => `$${value.toFixed(2)}`,
    });

    expect(analytics.metrics.map((metric) => metric.value)).toEqual([
      "2",
      "1",
      "1",
      "2",
      "$3.00",
    ]);
    expect(analytics.series[0]?.values).toEqual([1, 2]);
  });
});
