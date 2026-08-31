import { describe, expect, it, vi } from "vitest";

import type { RunnerThreadRoutedMessageResult } from "../../thread/types.js";
import { tryRouteRunnerCommunicatorMessage } from "./communicator-router.js";

function createOptions() {
  return {
    activeRunId: "run-1" as string | null,
    apiKey: "key",
    backendUrl: "https://runner.example",
    content: "What is the current status?",
    controlRun: vi.fn().mockResolvedValue({
      run: null,
      effectApplied: true,
    }),
    hasRoutableActiveRun: true,
    onAnswer: vi.fn(),
    onError: vi.fn(),
    onRestoreComposer: vi.fn(),
    onStop: vi.fn().mockResolvedValue(undefined),
    postMessage: vi.fn(),
    threadId: "thread-1",
    usesCanonicalThreadSurface: false,
  };
}

function createCommunicatorResult(content: string): RunnerThreadRoutedMessageResult {
  return {
    message: {},
    communicator: {
      message: { content },
    },
    routingReceipt: {
      id: "receipt-1",
      status: "answered",
    },
  } as RunnerThreadRoutedMessageResult;
}

describe("tryRouteRunnerCommunicatorMessage", () => {
  it("routes deterministic stop controls without classification", async () => {
    const options = createOptions();
    options.content = "stop this run";
    const fetchImpl = vi.fn();

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(handled).toBe(true);
    expect(options.onStop).toHaveBeenCalledOnce();
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(options.postMessage).not.toHaveBeenCalled();
  });

  it("reports deterministic control failures without rerouting the message", async () => {
    const options = createOptions();
    options.content = "pause";
    options.controlRun.mockRejectedValue(new Error("Control failed"));
    const fetchImpl = vi.fn();

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(handled).toBe(true);
    expect(options.onError).toHaveBeenCalledWith("Control failed");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(options.postMessage).not.toHaveBeenCalled();
  });

  it("uses the local status fallback when classification is unavailable", async () => {
    const options = createOptions();
    options.postMessage.mockResolvedValue(createCommunicatorResult("Tests are passing."));

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: vi.fn().mockRejectedValue(new Error("Not deployed")) as typeof fetch,
    });

    expect(handled).toBe(true);
    expect(options.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "What is the current status?",
        intendedRoute: "communicator",
      }),
    );
    expect(options.onAnswer).toHaveBeenCalledWith({
      content: "Tests are passing.",
      receiptId: "receipt-1",
      receiptStatus: "answered",
    });
  });

  it("keeps idle worker instructions out of the communicator", async () => {
    const options = createOptions();
    options.activeRunId = null;
    options.hasRoutableActiveRun = false;
    options.content = "Please implement the migration";
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          decision: { route: "communicator" },
          suggestedTransport: "activity_message",
          targetRunActive: false,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(handled).toBe(false);
    expect(options.postMessage).not.toHaveBeenCalled();
  });

  it("routes completed-thread questions back to the worker", async () => {
    const options = createOptions();
    options.activeRunId = null;
    options.hasRoutableActiveRun = false;
    options.content = "Why didnt you recognize it in the first run?";
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          decision: { route: "communicator" },
          suggestedTransport: "activity_message",
          targetRunActive: false,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(handled).toBe(false);
    expect(options.postMessage).not.toHaveBeenCalled();
  });

  it("routes idle status questions back to the worker when classification is unavailable", async () => {
    const options = createOptions();
    options.activeRunId = null;
    options.hasRoutableActiveRun = false;

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: vi.fn().mockRejectedValue(new Error("Not deployed")) as typeof fetch,
    });

    expect(handled).toBe(false);
    expect(options.postMessage).not.toHaveBeenCalled();
  });

  it("allows explicitly addressed communicator questions on completed threads", async () => {
    const options = createOptions();
    options.activeRunId = null;
    options.hasRoutableActiveRun = false;
    options.content = "@communicator summarize the previous run";
    options.postMessage.mockResolvedValue(createCommunicatorResult("The run completed."));
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          decision: { route: "communicator" },
          suggestedTransport: "activity_message",
          targetRunActive: false,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: fetchImpl as typeof fetch,
    });

    expect(handled).toBe(true);
    expect(options.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ intendedRoute: "communicator" }),
    );
  });

  it("restores the composer when communicator delivery cannot be confirmed", async () => {
    const options = createOptions();
    options.postMessage.mockRejectedValue(new Error("Delivery unavailable"));

    const handled = await tryRouteRunnerCommunicatorMessage({
      ...options,
      fetchImpl: vi.fn().mockRejectedValue(new Error("Not deployed")) as typeof fetch,
    });

    expect(handled).toBe(true);
    expect(options.onRestoreComposer).toHaveBeenCalledWith("What is the current status?");
    expect(options.onError).toHaveBeenCalledWith(expect.stringContaining("Delivery unavailable"));
  });
});
