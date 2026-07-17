import { describe, expect, it } from "vitest";
import { getRunnerExternalRunEligibility } from "./external-run-request.js";

describe("getRunnerExternalRunEligibility", () => {
  const request = {
    token: "request_1",
    threadId: "thread_1",
    prompt: "continue",
  };

  it("accepts one matching unhandled request", () => {
    expect(
      getRunnerExternalRunEligibility({
        currentThreadId: "thread_1",
        disabled: false,
        enabled: true,
        handledToken: null,
        request,
      }),
    ).toMatchObject({
      shouldExecute: true,
      prompt: "continue",
    });
  });

  it("rejects a request after its token was handled", () => {
    expect(
      getRunnerExternalRunEligibility({
        currentThreadId: "thread_1",
        disabled: false,
        enabled: true,
        handledToken: "request_1",
        request,
      }).shouldExecute,
    ).toBe(false);
  });
});
