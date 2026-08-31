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

describe("TestsApi scenario execution contract", () => {
  it("creates and previews independently runnable scenarios", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        scenario: { id: "scenario-1", name: "Checkout", kind: "browser" },
      }), { status: 201, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        testRun: { id: "run-1", executionType: "preview", status: "queued" },
      }), { status: 202, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const api = new TestsApi("/api/real");

    await expect(api.createScenario("test/one", {
      name: "Checkout",
      kind: "browser",
    })).resolves.toMatchObject({ id: "scenario-1" });
    await expect(api.createPreviewRun("test/one", {
      scenarioIds: ["scenario-1"],
    })).resolves.toMatchObject({ id: "run-1", executionType: "preview" });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/real/tests/test%2Fone/scenarios",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "/api/real/tests/test%2Fone/preview-runs",
    );
  });

  it("imports a standard CI report into a scenario run", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      testRun: { id: "run-imported", verdict: "passed", status: "passed" },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const api = new TestsApi("/api/real");
    const input = {
      scenarioId: "scenario-1",
      format: "junit" as const,
      report: '<testsuite><testcase name="passes"/></testsuite>',
    };

    await expect(api.importRun("test/one", input)).resolves.toMatchObject({
      id: "run-imported",
      verdict: "passed",
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/real/tests/test%2Fone/import-runs",
    );
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual(input);
  });
});

describe("TestsApi target resource discovery", () => {
  it("loads every accessible Function without narrowing it to the Test project", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: [{
          id: "function-1",
          name: "First Function",
          kind: "function",
          projectId: "project-1",
        }],
        has_more: true,
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: [{
          id: "function-2",
          name: "Second Function",
          kind: "function",
          metadata: { projectScope: { projectIds: ["project-2", "project-3"] } },
        }],
        has_more: false,
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(new TestsApi("/api/real").listFunctions("project-1")).resolves.toEqual([
      {
        id: "function-1",
        name: "First Function",
        description: "",
        projectIds: ["project-1"],
      },
      {
        id: "function-2",
        name: "Second Function",
        description: "",
        projectIds: ["project-2", "project-3"],
      },
    ]);
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      "/api/real/servers?kind=function&limit=200&offset=0",
      "/api/real/servers?kind=function&limit=200&offset=1",
    ]);
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("projectId");
  });
});
