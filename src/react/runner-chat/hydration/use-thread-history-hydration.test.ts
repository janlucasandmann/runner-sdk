import { describe, expect, it } from "vitest";
import { getRunnerThreadHistoryHydrationEligibility } from "./use-thread-history-hydration.js";

const base = {
  externalRunRequest: null,
  handledExternalRunToken: null,
  hasApiKey: true,
  initializedThreadId: null,
  locallyOwnedThreadId: null,
  threadId: "thread_1",
  turnCount: 0,
};

describe("getRunnerThreadHistoryHydrationEligibility", () => {
  it("hydrates an uninitialized existing thread", () => {
    expect(
      getRunnerThreadHistoryHydrationEligibility(base).shouldHydrate,
    ).toBe(true);
  });

  it("does not race a locally owned execution", () => {
    expect(
      getRunnerThreadHistoryHydrationEligibility({
        ...base,
        locallyOwnedThreadId: "thread_1",
      }),
    ).toMatchObject({
      isLocallyOwned: true,
      shouldHydrate: false,
    });
  });

  it("waits for a pending external run request to establish its turn", () => {
    expect(
      getRunnerThreadHistoryHydrationEligibility({
        ...base,
        externalRunRequest: {
          token: "request_1",
          threadId: "thread_1",
          prompt: "continue",
        },
      }),
    ).toMatchObject({
      hasPendingExternalRun: true,
      shouldHydrate: false,
    });
  });

  it("does not reload an initialized non-empty transcript", () => {
    expect(
      getRunnerThreadHistoryHydrationEligibility({
        ...base,
        initializedThreadId: "thread_1",
        turnCount: 3,
      }),
    ).toMatchObject({
      alreadyInitialized: true,
      shouldHydrate: false,
    });
  });
});
