// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { RunnerThreadFeedbackClient } from "./use-thread-feedback-controller.js";
import { useRunnerThreadFeedbackController } from "./use-thread-feedback-controller.js";

function createClient(
  overrides: Partial<RunnerThreadFeedbackClient> = {},
): RunnerThreadFeedbackClient {
  return {
    fetch: vi.fn().mockResolvedValue({
      userRating: null,
      upCount: 2,
      downCount: 1,
      reportCount: 0,
    }),
    set: vi.fn().mockResolvedValue({
      userRating: "up",
      upCount: 3,
      downCount: 1,
      reportCount: 0,
    }),
    report: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("useRunnerThreadFeedbackController", () => {
  it("loads feedback and settles an optimistic rating through one client", async () => {
    const client = createClient();
    const { result } = renderHook(() =>
      useRunnerThreadFeedbackController({
        backendUrl: "https://runner.example.test",
        apiKey: "secret",
        threadId: "thread_1",
        client,
      }),
    );

    await waitFor(() => expect(result.current.feedback.upCount).toBe(2));

    act(() => result.current.submitRating("up"));
    expect(result.current.feedback).toMatchObject({
      userRating: "up",
      upCount: 3,
      isSubmitting: true,
    });

    await waitFor(() => expect(result.current.feedback.isSubmitting).toBe(false));
    expect(client.set).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: "thread_1",
        rating: "up",
      }),
    );
  });

  it("validates and submits a grounded report", async () => {
    const client = createClient();
    const onReportOpen = vi.fn();
    const { result } = renderHook(() =>
      useRunnerThreadFeedbackController({
        backendUrl: "https://runner.example.test",
        apiKey: "secret",
        threadId: "thread_1",
        sanitizeSummary: (summary) => summary.replace("<system>", ""),
        onReportOpen,
        client,
      }),
    );

    act(() => {
      result.current.openReport("turn_1", "<system>Summary");
      result.current.setReportMessage("The result is incorrect.");
    });
    expect(onReportOpen).toHaveBeenCalledOnce();

    let submitted = false;
    await act(async () => {
      submitted = await result.current.submitReport();
    });

    expect(submitted).toBe(true);
    expect(client.report).toHaveBeenCalledWith(
      expect.objectContaining({
        reportType: "bug",
        message: "The result is incorrect.",
        metadata: expect.objectContaining({
          turnId: "turn_1",
          summary: "Summary",
        }),
      }),
    );
    expect(result.current.feedback.reportCount).toBe(1);
    expect(result.current.reportTarget).toBeNull();
  });

  it("does not open reporting without a persisted thread", () => {
    const onUnavailable = vi.fn();
    const client = createClient();
    const { result } = renderHook(() =>
      useRunnerThreadFeedbackController({
        onUnavailable,
        client,
      }),
    );

    act(() => {
      expect(result.current.openReport("turn_1", "Summary")).toBe(false);
    });

    expect(onUnavailable).toHaveBeenCalledWith("Reporting an issue requires a saved thread.");
    expect(result.current.reportTarget).toBeNull();
  });

  it("can open general feedback before a thread is persisted", () => {
    const onReportOpen = vi.fn();
    const { result } = renderHook(() =>
      useRunnerThreadFeedbackController({
        onReportOpen,
        client: createClient(),
      }),
    );

    act(() => {
      expect(result.current.openReport("composer", "Feedback from home", {
        allowUnavailable: true,
        reportType: "general",
      })).toBe(true);
    });

    expect(onReportOpen).toHaveBeenCalledOnce();
    expect(result.current.reportType).toBe("general");
    expect(result.current.reportTarget).toEqual({
      turnId: "composer",
      summaryText: "Feedback from home",
    });
  });
});
