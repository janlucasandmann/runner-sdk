import { describe, expect, it } from "vitest";
import { createApiKeysOverviewAnalytics } from "./api-keys-overview-analytics.js";

describe("createApiKeysOverviewAnalytics", () => {
  it("builds API activity KPIs and dual-axis chart series", () => {
    const analytics = createApiKeysOverviewAnalytics({
      snapshot: {
        period: "week",
        generatedAt: "2026-07-16T00:00:00.000Z",
        summary: {
          requestCount: 120,
          tokenCount: 45_000,
          totalKeyCount: 6,
          usedKeyCount: 3,
        },
        buckets: [{
          label: "Thu",
          requestCount: 120,
          tokenCount: 45_000,
        }],
      },
    });

    expect(analytics.metrics.map((metric) => [metric.label, metric.value])).toEqual([
      ["Requests", "120"],
      ["Tokens Consumed", "45,000"],
      ["API Keys", "6"],
      ["Used API Keys", "3"],
    ]);
    expect(analytics.series).toMatchObject([
      { id: "requests", values: [120], type: "bar" },
      { id: "tokens", values: [45_000], type: "line", axis: "secondary" },
    ]);
  });
});
