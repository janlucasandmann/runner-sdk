// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchApiKeysOverviewAnalytics,
  normalizeApiKeysOverviewAnalyticsPayload,
} from "./api-keys-overview-analytics-client.js";

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
});

describe("API key overview analytics client", () => {
  it("normalizes compact backend payloads", () => {
    const snapshot = normalizeApiKeysOverviewAnalyticsPayload({
      analytics: {
        period: "day",
        generatedAt: "2026-07-16T10:00:00.000Z",
        summary: {
          requestCount: 8,
          tokenCount: 900,
          totalKeyCount: 3,
          usedKeyCount: 2,
        },
        charts: {
          usage: [{
            bucketStart: "2026-07-16T10:00:00.000Z",
            requestCount: 8,
            tokenCount: 900,
          }],
        },
      },
    }, "month");

    expect(snapshot.period).toBe("day");
    expect(snapshot.summary).toEqual({
      requestCount: 8,
      tokenCount: 900,
      totalKeyCount: 3,
      usedKeyCount: 2,
    });
    expect(snapshot.buckets[0]).toMatchObject({ requestCount: 8, tokenCount: 900 });
  });

  it("deduplicates fresh requests for the same identity and period", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      analytics: {
        period: "week",
        summary: {},
        charts: { usage: [] },
      },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const options = {
      backendUrl: "https://api.example.com",
      identity: "user-1",
      period: "week" as const,
    };
    await fetchApiKeysOverviewAnalytics(options);
    await fetchApiKeysOverviewAnalytics(options);

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
