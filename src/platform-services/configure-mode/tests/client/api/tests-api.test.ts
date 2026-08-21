// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { TestsApi } from "./tests-api.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TestsApi overview pagination", () => {
  it("requests summary pages and preserves the server cursor", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      testPlans: [{
        id: "test-21",
        name: "Release verification",
        description: "Checks the release candidate.",
        projectId: "project-1",
        caseCount: 4,
        runCount: 7,
        passedRunCount: 6,
        lastRunStatus: "passed",
        overviewSummaryVersion: 1,
        updatedAt: "2026-08-21T08:00:00.000Z",
        createdAt: "2026-08-20T08:00:00.000Z",
      }],
      hasMore: true,
      nextOffset: 30,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const page = await new TestsApi("/api/real").listPlanPage(20, 10);

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/real/test-plans?view=summary&offset=20&limit=10",
    );
    expect(page).toMatchObject({
      hasMore: true,
      nextOffset: 30,
      plans: [{
        id: "test-21",
        caseCount: 4,
        runCount: 7,
        lastRunStatus: "passed",
      }],
    });
    expect(page.plans[0]).not.toHaveProperty("definition");
  });

  it("uses response length for older servers that do not emit cursor metadata", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: Array.from({ length: 10 }, (_, index) => ({
        id: `test-${index + 1}`,
        name: `Test ${index + 1}`,
        definition: { cases: [] },
      })),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(new TestsApi("/api/real").listPlanPage(0, 10)).resolves.toMatchObject({
      hasMore: true,
      nextOffset: 10,
    });
  });
});
