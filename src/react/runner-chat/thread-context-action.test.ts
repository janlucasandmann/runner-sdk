import { describe, expect, it, vi } from "vitest";

import { executeRunnerThreadContextAction } from "./thread-context-action.js";
import type { RunnerThreadContextActionResponse } from "./thread-context-api.js";
import type { RunnerChatThreadContextAction } from "./thread-context-utils.js";

function createHarness(action: RunnerChatThreadContextAction) {
  const events: string[] = [];
  const requestAction = vi.fn(
    async (): Promise<RunnerThreadContextActionResponse> => ({
      responseText: "Context answer",
    }),
  );
  const options = {
    action,
    apiKey: "test-key",
    appendBtwTurn: (commandText: string, responseText: string) => {
      events.push(`btw:${commandText}:${responseText}`);
    },
    appendNotice: (noticeAction: RunnerChatThreadContextAction, message: string) => {
      events.push(`notice:${noticeAction}:${message}`);
      return "notice-1";
    },
    appendPendingNotice: (
      noticeAction: RunnerChatThreadContextAction,
      message: string,
      noticeOptions?: { prompt?: string },
    ) => {
      events.push(`pending:${noticeAction}:${message}:${noticeOptions?.prompt || ""}`);
      return "pending-1";
    },
    backendUrl: "https://runner.example",
    beginAction: (nextAction: RunnerChatThreadContextAction) => {
      events.push(`begin:${nextAction}`);
    },
    finishAction: () => {
      events.push("finish");
    },
    markContextCleared: () => {
      events.push("clear");
    },
    onThreadForked: (threadId: string) => {
      events.push(`fork:${threadId}`);
    },
    refreshDetails: (threadId: string) => {
      events.push(`refresh:${threadId}`);
    },
    requestHeaders: { "x-request": "test" },
    services: { requestAction },
    threadId: "thread-1",
    updateNotice: (turnId: string, message: string, updateOptions?: { failed?: boolean }) => {
      events.push(`update:${turnId}:${message}:${updateOptions?.failed === true}`);
    },
  };
  return { events, options, requestAction };
}

describe("executeRunnerThreadContextAction", () => {
  it("runs compact as one pending-notice lifecycle", async () => {
    const harness = createHarness("compact");

    await executeRunnerThreadContextAction({
      ...harness.options,
      commandText: "/compact preserve the decision log",
      prompt: "preserve the decision log",
    });

    expect(harness.requestAction).toHaveBeenCalledWith({
      action: "compact",
      apiKey: "test-key",
      backendUrl: "https://runner.example",
      prompt: "preserve the decision log",
      requestHeaders: { "x-request": "test" },
      threadId: "thread-1",
    });
    expect(harness.events).toEqual([
      "begin:compact",
      "pending:compact:Compacting context:/compact preserve the decision log",
      "update:pending-1:Context was compacted:false",
      "refresh:thread-1",
      "finish",
    ]);
  });

  it("marks a compact notice failed and always finishes", async () => {
    const harness = createHarness("compact");
    harness.requestAction.mockRejectedValueOnce(new Error("transport failed"));

    await expect(executeRunnerThreadContextAction(harness.options)).rejects.toThrow(
      "transport failed",
    );
    expect(harness.events).toEqual([
      "begin:compact",
      "pending:compact:Compacting context:/compact",
      "update:pending-1:Failed to compact context:true",
      "finish",
    ]);
  });

  it("switches to the returned fork before refreshing its context", async () => {
    const harness = createHarness("fork");
    harness.requestAction.mockResolvedValueOnce({
      thread: { id: "thread-2" },
    });

    await executeRunnerThreadContextAction(harness.options);

    expect(harness.events).toEqual([
      "begin:fork",
      "fork:thread-2",
      "notice:fork:Forked into a new conversation",
      "refresh:thread-2",
      "finish",
    ]);
  });

  it("applies clear and btw outcomes without conflating their presentation", async () => {
    const clearHarness = createHarness("clear");
    await executeRunnerThreadContextAction(clearHarness.options);
    expect(clearHarness.events).toEqual([
      "begin:clear",
      "clear",
      "notice:clear:Context was cleared",
      "refresh:thread-1",
      "finish",
    ]);

    const btwHarness = createHarness("btw");
    await executeRunnerThreadContextAction({
      ...btwHarness.options,
      commandText: "/btw status?",
    });
    expect(btwHarness.events).toEqual([
      "begin:btw",
      "btw:/btw status?:Context answer",
      "refresh:thread-1",
      "finish",
    ]);
  });

  it("rejects missing identity before opening the lifecycle", async () => {
    const harness = createHarness("clear");

    await expect(
      executeRunnerThreadContextAction({
        ...harness.options,
        threadId: null,
      }),
    ).rejects.toThrow("Start a conversation first before using this context action.");
    expect(harness.events).toEqual([]);
    expect(harness.requestAction).not.toHaveBeenCalled();
  });
});
