import { describe, expect, it } from "vitest";

import { PROJECTS_DOMAIN_RUNTIME_03_FRAGMENT } from "./03-thread-status.mjs";

function loadThreadStatusRuntime() {
  return new Function(`
    const normalizeThreadItem = (thread) => ({ ...thread });
    const normalizePlaygroundIdList = (items) => Array.isArray(items)
      ? Array.from(new Set(items.map((item) => String(item || "").trim()).filter(Boolean)))
      : [];
    ${PROJECTS_DOMAIN_RUNTIME_03_FRAGMENT}
    return {
      getPlaygroundTaskThreadSummaryRecords,
      isPlaygroundTaskThreadStatusActive,
      mergePlaygroundTaskThreadStatusSnapshots,
      normalizePlaygroundTaskThreadStatusSnapshot,
      resolvePlaygroundTaskThreadStatus,
    };
  `)();
}

describe("project ticket thread status runtime", () => {
  const runtime = loadThreadStatusRuntime();

  it("uses completion timestamps to correct stale active statuses", () => {
    expect(runtime.resolvePlaygroundTaskThreadStatus(
      "running",
      "2026-07-20T10:00:00.000Z",
      "2026-07-20T10:00:00.000Z",
    )).toBe("completed");
  });

  it("preserves a new active run that updated after an older completion", () => {
    expect(runtime.resolvePlaygroundTaskThreadStatus(
      "running",
      "2026-07-20T10:00:00.000Z",
      "2026-07-20T10:00:05.000Z",
    )).toBe("running");
    expect(runtime.isPlaygroundTaskThreadStatusActive("active")).toBe(true);
    expect(runtime.isPlaygroundTaskThreadStatusActive("scheduled")).toBe(false);
  });

  it("normalizes nested status responses and reconciles existing records", () => {
    const snapshot = runtime.normalizePlaygroundTaskThreadStatusSnapshot({
      data: {
        thread: {
          threadId: "thread-1",
          status: "completed",
          completedAt: "2026-07-20T10:00:00.000Z",
          updatedAt: "2026-07-20T10:00:00.000Z",
        },
      },
    }, "");

    expect(snapshot).toEqual({
      id: "thread-1",
      status: "completed",
      completedAt: "2026-07-20T10:00:00.000Z",
      updatedAt: "2026-07-20T10:00:00.000Z",
    });
    expect(runtime.mergePlaygroundTaskThreadStatusSnapshots(
      [{ id: "thread-1", title: "Research", status: "running" }],
      [snapshot],
    )).toEqual([{
      id: "thread-1",
      title: "Research",
      status: "completed",
      completedAt: "2026-07-20T10:00:00.000Z",
      updatedAt: "2026-07-20T10:00:00.000Z",
    }]);
  });

  it("marks a successful response without lifecycle data as unavailable", () => {
    expect(runtime.normalizePlaygroundTaskThreadStatusSnapshot(
      { threadId: "thread-2" },
      "",
    )).toMatchObject({
      id: "thread-2",
      status: "unavailable",
    });
  });

  it("projects task-linked threads to the title and status needed by the ticket sidebar", () => {
    expect(runtime.getPlaygroundTaskThreadSummaryRecords({
      details: {
        linkedThreads: [{
          id: "thread-1",
          title: "Research evidence",
          status: "completed",
          messages: [{ role: "assistant", content: "large payload" }],
          agent: { id: "agent-1" },
        }],
      },
    }, {
      linkedThreadIds: ["thread-1", "thread-2"],
    })).toEqual([
      {
        id: "thread-1",
        title: "Research evidence",
        status: "completed",
      },
      {
        id: "thread-2",
        title: "Thread thread-2",
        status: "unavailable",
      },
    ]);
  });
});
