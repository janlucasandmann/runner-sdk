import { describe, expect, it, vi } from "vitest";
import {
  ComputersOverviewAnalyticsRequestError,
  fetchComputersOverviewAnalytics,
  normalizeComputersOverviewAnalyticsPayload,
} from "./computers-overview-analytics-client.js";

describe("normalizeComputersOverviewAnalyticsPayload", () => {
  it("normalizes compact computer usage buckets and summary data", () => {
    const snapshot = normalizeComputersOverviewAnalyticsPayload({
      analytics: {
        period: "week",
        generatedAt: "2026-07-15T10:00:00.000Z",
        summary: { totalRuns: 4, totalComputerCostUsd: 1.25 },
        charts: {
          usage: [{
            bucketStart: "2026-07-15T00:00:00.000Z",
            runCount: 4,
            computerCostUsd: 1.25,
          }],
        },
      },
    }, "month");

    expect(snapshot).toMatchObject({
      period: "week",
      generatedAt: "2026-07-15T10:00:00.000Z",
      totalRuns: 4,
      totalComputerCostUsd: 1.25,
    });
    expect(snapshot.buckets).toEqual([{
      label: "Wed",
      runCount: 4,
      computerCostUsd: 1.25,
    }]);
  });

  it("deduplicates requests while isolating organization scopes", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      analytics: { period: "month", charts: { usage: [] } },
    }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const backendUrl = "https://computer-analytics-cache-test.invalid";

    try {
      const firstScope = {
        backendUrl,
        headers: { "X-API-Key": "key", "X-Computer-Agents-Organization": "org_1" },
        identity: "user_1",
        period: "month" as const,
      };
      await fetchComputersOverviewAnalytics(firstScope);
      await fetchComputersOverviewAnalytics(firstScope);
      await fetchComputersOverviewAnalytics({
        ...firstScope,
        headers: { "X-API-Key": "key", "X-Computer-Agents-Organization": "org_2" },
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("converts an undeployed HTML route response into a safe compatibility error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(
      "<!DOCTYPE html><html><body><pre>Cannot GET /v1/environments/analytics/overview</pre></body></html>",
      { status: 404, headers: { "content-type": "text/html" } },
    )));

    try {
      const request = fetchComputersOverviewAnalytics({
        backendUrl: "https://computer-analytics-html-error-test.invalid",
        headers: { "X-API-Key": "key" },
        identity: "html-error-user",
        period: "month",
      });

      await expect(request).rejects.toMatchObject({
        name: "ComputersOverviewAnalyticsRequestError",
        status: 404,
        message: "Computer analytics endpoint is not available on this backend yet.",
      } satisfies Partial<ComputersOverviewAnalyticsRequestError>);
      await expect(request).rejects.not.toThrow(/<html>|Cannot GET/i);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
