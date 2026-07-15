import { describe, expect, it, vi } from "vitest";
import {
  AgentsOverviewAnalyticsRequestError,
  fetchAgentsOverviewAnalytics,
  normalizeAgentsOverviewAnalyticsPayload,
} from "./agents-overview-analytics-client.js";

describe("normalizeAgentsOverviewAnalyticsPayload", () => {
  it("normalizes compact bucket and per-agent usage data", () => {
    const snapshot = normalizeAgentsOverviewAnalyticsPayload({
      analytics: {
        period: "week",
        generatedAt: "2026-07-15T10:00:00.000Z",
        charts: {
          usage: [{
            bucketStart: "2026-07-15T00:00:00.000Z",
            agentRuns: 4,
            squadRuns: 2,
            agentCostUsd: 1.25,
            squadCostUsd: 0.75,
            tokens: 12_500,
          }],
        },
        resources: [{
          agentId: "agent_1",
          runCount: 4,
          tokenCount: 9_000,
          costUsd: 1.25,
          lastUsedAt: "2026-07-15T09:30:00.000Z",
        }],
      },
    }, "month");

    expect(snapshot.period).toBe("week");
    expect(snapshot.buckets).toEqual([{
      label: "Wed",
      agentRuns: 4,
      squadRuns: 2,
      agentCostUsd: 1.25,
      squadCostUsd: 0.75,
      tokens: 12_500,
    }]);
    expect(snapshot.resources).toEqual([{
      agentId: "agent_1",
      runCount: 4,
      tokenCount: 9_000,
      costUsd: 1.25,
      lastUsedAt: "2026-07-15T09:30:00.000Z",
    }]);
  });

  it("accepts snake-case payload aliases and clamps invalid numbers", () => {
    const snapshot = normalizeAgentsOverviewAnalyticsPayload({
      period: "day",
      buckets: [{
        bucket_start: "2026-07-15T09:00:00.000Z",
        agent_runs: -3,
        squad_runs: "2",
        agent_cost_usd: "0.5",
        squad_cost_usd: null,
        total_tokens: "800",
      }],
      resources: [{ agent_id: "agent_2", token_count: "800" }],
    }, "month");

    expect(snapshot.period).toBe("day");
    expect(snapshot.buckets[0]).toMatchObject({
      agentRuns: 0,
      squadRuns: 2,
      agentCostUsd: 0.5,
      squadCostUsd: 0,
      tokens: 800,
    });
    expect(snapshot.resources[0]).toMatchObject({ agentId: "agent_2", tokenCount: 800 });
  });

  it("deduplicates a scope while isolating canonical organization headers", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      analytics: { period: "month", charts: { usage: [] }, resources: [] },
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const backendUrl = "https://analytics-cache-test.invalid";

    try {
      const firstScope = {
        backendUrl,
        headers: { "X-API-Key": "key", "X-Computer-Agents-Organization": "org_1" },
        identity: "user_1",
        period: "month" as const,
      };
      await fetchAgentsOverviewAnalytics(firstScope);
      await fetchAgentsOverviewAnalytics(firstScope);
      await fetchAgentsOverviewAnalytics({
        ...firstScope,
        headers: { "X-API-Key": "key", "X-Computer-Agents-Organization": "org_2" },
      });
      await fetchAgentsOverviewAnalytics({
        ...firstScope,
        identity: "user_2",
      });

      expect(fetchMock).toHaveBeenCalledTimes(3);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("converts an undeployed HTML route response into a safe compatibility error", async () => {
    const fetchMock = vi.fn(async () => new Response(
      "<!DOCTYPE html><html><body><pre>Cannot GET /v1/agents/analytics/overview</pre></body></html>",
      { status: 404, headers: { "content-type": "text/html" } },
    ));
    vi.stubGlobal("fetch", fetchMock);

    try {
      const request = fetchAgentsOverviewAnalytics({
        backendUrl: "https://analytics-html-error-test.invalid",
        headers: { "X-API-Key": "key" },
        identity: "html-error-user",
        period: "month",
      });

      await expect(request).rejects.toMatchObject({
        name: "AgentsOverviewAnalyticsRequestError",
        status: 404,
        message: "Agent analytics endpoint is not available on this backend yet.",
      } satisfies Partial<AgentsOverviewAnalyticsRequestError>);
      await expect(request).rejects.not.toThrow(/<html>|Cannot GET/i);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
