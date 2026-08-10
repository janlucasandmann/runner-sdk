import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchThreadFeedback,
  type RunnerThreadFeedbackRating,
  type RunnerThreadFeedbackReportType,
  type RunnerThreadFeedbackState,
  reportThreadFeedbackIssue,
  setThreadFeedback,
} from "./thread-feedback.js";

const EMPTY_FEEDBACK_STATE: RunnerThreadFeedbackState = Object.freeze({
  userRating: null,
  upCount: 0,
  downCount: 0,
  reportCount: 0,
  isSubmitting: false,
});

export interface RunnerThreadFeedbackReportTarget {
  turnId: string;
  summaryText: string;
}

export interface RunnerThreadFeedbackReportOpenOptions {
  /** Allow the feedback surface to open before a thread has been persisted. */
  allowUnavailable?: boolean;
  /** Select the initial report category for contextual entry points. */
  reportType?: RunnerThreadFeedbackReportType;
}

export interface RunnerThreadFeedbackClient {
  fetch: typeof fetchThreadFeedback;
  set: typeof setThreadFeedback;
  report: typeof reportThreadFeedbackIssue;
}

const DEFAULT_FEEDBACK_CLIENT: RunnerThreadFeedbackClient = Object.freeze({
  fetch: fetchThreadFeedback,
  set: setThreadFeedback,
  report: reportThreadFeedbackIssue,
});

export interface UseRunnerThreadFeedbackControllerOptions {
  backendUrl?: string;
  apiKey?: string;
  threadId?: string | null;
  requestHeaders?: HeadersInit;
  sanitizeSummary?: (summary: string) => string;
  onUnavailable?: (message: string) => void;
  onReportOpen?: () => void;
  client?: RunnerThreadFeedbackClient;
}

function applyOptimisticRating(
  previous: RunnerThreadFeedbackState,
  rating: RunnerThreadFeedbackRating,
): RunnerThreadFeedbackState {
  return {
    ...previous,
    userRating: rating,
    upCount:
      previous.userRating === rating
        ? previous.upCount
        : rating === "up"
          ? previous.upCount + 1
          : Math.max(0, previous.upCount - (previous.userRating === "up" ? 1 : 0)),
    downCount:
      previous.userRating === rating
        ? previous.downCount
        : rating === "down"
          ? previous.downCount + 1
          : Math.max(0, previous.downCount - (previous.userRating === "down" ? 1 : 0)),
    isSubmitting: true,
  };
}

export function useRunnerThreadFeedbackController({
  backendUrl = "",
  apiKey = "",
  threadId = null,
  requestHeaders,
  sanitizeSummary = (summary) => summary,
  onUnavailable,
  onReportOpen,
  client = DEFAULT_FEEDBACK_CLIENT,
}: UseRunnerThreadFeedbackControllerOptions = {}) {
  const [feedback, setFeedback] = useState<RunnerThreadFeedbackState>(EMPTY_FEEDBACK_STATE);
  const [reportTarget, setReportTarget] = useState<RunnerThreadFeedbackReportTarget | null>(null);
  const [reportType, setReportTypeState] = useState<RunnerThreadFeedbackReportType>("bug");
  const [reportMessage, setReportMessageState] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const mutationSequenceRef = useRef(0);
  const callbacksRef = useRef({
    sanitizeSummary,
    onUnavailable,
    onReportOpen,
  });
  const normalizedThreadId = String(threadId || "").trim();
  const normalizedApiKey = String(apiKey || "").trim();
  const available = Boolean(normalizedThreadId && backendUrl && normalizedApiKey);

  useEffect(() => {
    callbacksRef.current = {
      sanitizeSummary,
      onUnavailable,
      onReportOpen,
    };
  }, [onReportOpen, onUnavailable, sanitizeSummary]);

  useEffect(() => {
    let cancelled = false;
    const requestSequence = ++mutationSequenceRef.current;
    if (!available) {
      setFeedback(EMPTY_FEEDBACK_STATE);
      return;
    }

    void client
      .fetch({
        backendUrl,
        apiKey: normalizedApiKey,
        threadId: normalizedThreadId,
        requestHeaders,
      })
      .then((nextFeedback) => {
        if (cancelled || requestSequence !== mutationSequenceRef.current) {
          return;
        }
        setFeedback({ ...nextFeedback, isSubmitting: false });
      })
      .catch(() => {
        if (cancelled || requestSequence !== mutationSequenceRef.current) {
          return;
        }
        setFeedback((previous) => ({
          ...previous,
          isSubmitting: false,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [available, backendUrl, client, normalizedApiKey, normalizedThreadId, requestHeaders]);

  const submitRating = useCallback(
    (rating: RunnerThreadFeedbackRating) => {
      if (!available) return;
      const requestSequence = ++mutationSequenceRef.current;
      setFeedback((previous) => applyOptimisticRating(previous, rating));
      void client
        .set({
          backendUrl,
          apiKey: normalizedApiKey,
          threadId: normalizedThreadId,
          rating,
          requestHeaders,
        })
        .then((nextFeedback) => {
          if (requestSequence !== mutationSequenceRef.current) return;
          setFeedback({ ...nextFeedback, isSubmitting: false });
        })
        .catch(() => {
          if (requestSequence !== mutationSequenceRef.current) return;
          setFeedback((previous) => ({
            ...previous,
            isSubmitting: false,
          }));
        });
    },
    [available, backendUrl, client, normalizedApiKey, normalizedThreadId, requestHeaders],
  );

  const openReport = useCallback(
    (
      turnId: string,
      summaryText: string,
      options?: RunnerThreadFeedbackReportOpenOptions,
    ) => {
      if (!available && !options?.allowUnavailable) {
        callbacksRef.current.onUnavailable?.("Reporting an issue requires a saved thread.");
        return false;
      }
      callbacksRef.current.onReportOpen?.();
      setReportTarget({
        turnId: String(turnId || "").trim(),
        summaryText,
      });
      setReportTypeState(options?.reportType || "bug");
      setReportMessageState("");
      setReportError("");
      setReportSubmitting(false);
      return true;
    },
    [available],
  );

  const closeReport = useCallback(() => {
    if (reportSubmitting) return;
    setReportTarget(null);
    setReportMessageState("");
    setReportError("");
  }, [reportSubmitting]);

  const setReportType = useCallback((nextType: RunnerThreadFeedbackReportType) => {
    setReportTypeState(nextType);
    setReportError("");
  }, []);

  const setReportMessage = useCallback((message: string) => {
    setReportMessageState(message);
    setReportError("");
  }, []);

  const submitReport = useCallback(async () => {
    const message = reportMessage.trim();
    if (!reportTarget || !available) {
      setReportError("Reporting an issue requires a saved thread.");
      return false;
    }
    if (!message) {
      setReportError("Describe the issue before sending.");
      return false;
    }

    setReportSubmitting(true);
    setReportError("");
    try {
      await client.report({
        backendUrl,
        apiKey: normalizedApiKey,
        threadId: normalizedThreadId,
        reportType,
        message,
        requestHeaders,
        metadata: {
          turnId: reportTarget.turnId,
          summary: callbacksRef.current
            .sanitizeSummary(reportTarget.summaryText)
            .trim()
            .slice(0, 4000),
          url: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        },
      });
      setFeedback((previous) => ({
        ...previous,
        reportCount: previous.reportCount + 1,
      }));
      setReportTarget(null);
      setReportMessageState("");
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setReportError(normalizedError.message || "Failed to report issue.");
      return false;
    } finally {
      setReportSubmitting(false);
    }
  }, [
    available,
    backendUrl,
    client,
    normalizedApiKey,
    normalizedThreadId,
    reportMessage,
    reportTarget,
    reportType,
    requestHeaders,
  ]);

  return {
    feedback,
    submitRating,
    reportTarget,
    reportType,
    reportMessage,
    reportError,
    reportSubmitting,
    openReport,
    closeReport,
    setReportType,
    setReportMessage,
    submitReport,
  };
}
