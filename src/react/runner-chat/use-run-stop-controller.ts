import { type Dispatch, type SetStateAction, useCallback, useRef, useState } from "react";

import type { RunnerTurn } from "./turn-types.js";
import { reportRunnerLifecycleCallbackError } from "./environment-api.js";
import { isRunningTurnStatus } from "./hydration/turn-state.js";
import { cancelThreadExecution } from "./thread-api.js";

interface RunnerRunStopServices {
  cancelThreadExecution: typeof cancelThreadExecution;
  now: () => number;
}

export interface UseRunnerRunStopControllerOptions {
  apiKey: string;
  backendUrl: string;
  cancelLocalExecution: () => void;
  clearQueuedMessages: () => void;
  localExecutionRunning: boolean;
  onContextRefresh?: (threadId: string) => void;
  onRunCancel?: (threadId: string) => void;
  onRunError?: (error: Error, threadId?: string) => void;
  requestHeaders?: HeadersInit;
  services?: Partial<RunnerRunStopServices>;
  setError: (message: string | null) => void;
  setPreparingRun: (preparing: boolean) => void;
  setTurns: Dispatch<SetStateAction<RunnerTurn[]>>;
  threadId?: string | null;
}

function isIntentionalStopTransportError(error: Error): boolean {
  if (error.name === "AbortError") return true;
  const message = String(error.message || "").trim();
  if (!message) return false;
  return (
    /runner stream failed \((?:499|500|502|503|504)\)/i.test(message) ||
    /<title>\s*502 Server Error\s*<\/title>/i.test(message) ||
    /temporary error and could not complete your request/i.test(message) ||
    /the server encountered a temporary error/i.test(message) ||
    /failed to fetch/i.test(message)
  );
}

export function useRunnerRunStopController({
  apiKey,
  backendUrl,
  cancelLocalExecution,
  clearQueuedMessages,
  localExecutionRunning,
  onContextRefresh,
  onRunCancel,
  onRunError,
  requestHeaders,
  services,
  setError,
  setPreparingRun,
  setTurns,
  threadId,
}: UseRunnerRunStopControllerOptions) {
  const stopRequestedThreadIdRef = useRef<string | null>(null);
  const [isStoppingRun, setIsStoppingRun] = useState(false);
  const serviceRef = useRef<RunnerRunStopServices>({
    cancelThreadExecution,
    now: () => Date.now(),
    ...services,
  });
  serviceRef.current = {
    cancelThreadExecution,
    now: () => Date.now(),
    ...services,
  };

  const isStopRequestedThread = useCallback((threadIdToMatch?: string | null): boolean => {
    const requestedThreadId = String(stopRequestedThreadIdRef.current || "").trim();
    const normalizedThreadId = String(threadIdToMatch || "").trim();
    return Boolean(
      requestedThreadId && normalizedThreadId && requestedThreadId === normalizedThreadId,
    );
  }, []);

  const isIntentionalStopError = useCallback(
    (error: Error, threadIdToMatch?: string | null): boolean =>
      isStopRequestedThread(threadIdToMatch) && isIntentionalStopTransportError(error),
    [isStopRequestedThread],
  );

  const normalizeIntentionalStopError = useCallback(
    (error: Error, threadIdToMatch?: string | null): Error => {
      if (!isIntentionalStopError(error, threadIdToMatch)) {
        return error;
      }
      if (error.name === "AbortError") return error;
      const abortError = new Error("Execution cancelled");
      abortError.name = "AbortError";
      return abortError;
    },
    [isIntentionalStopError],
  );

  const consumeIntentionalStopAbort = useCallback(
    (error: Error, threadIdToMatch?: string | null): boolean => {
      if (!isIntentionalStopError(error, threadIdToMatch)) {
        return false;
      }
      stopRequestedThreadIdRef.current = null;
      return true;
    },
    [isIntentionalStopError],
  );

  const clearStopRequest = useCallback(() => {
    stopRequestedThreadIdRef.current = null;
    setIsStoppingRun(false);
  }, []);

  const markRunningTurnsCancelled = useCallback(() => {
    const cancelledAtMs = serviceRef.current.now();
    setTurns((previousTurns) =>
      previousTurns.map((turn) =>
        isRunningTurnStatus(turn.status) || turn.status === "queued"
          ? {
              ...turn,
              status: "cancelled",
              completedAtMs: cancelledAtMs,
              durationSeconds:
                typeof turn.durationSeconds === "number" && Number.isFinite(turn.durationSeconds)
                  ? Math.max(0, Math.round(turn.durationSeconds))
                  : Math.max(0, Math.floor((cancelledAtMs - turn.startedAtMs) / 1000)),
            }
          : turn,
      ),
    );
  }, [setTurns]);

  const stopActiveRun = useCallback(async () => {
    if (isStoppingRun) return;

    const threadIdToCancel = String(threadId || "").trim();
    const hasLocalExecution = localExecutionRunning;
    if (!threadIdToCancel && !hasLocalExecution) return;

    setError(null);
    setPreparingRun(false);
    clearQueuedMessages();
    setIsStoppingRun(true);
    if (threadIdToCancel) {
      stopRequestedThreadIdRef.current = threadIdToCancel;
    }

    let cancellationError: Error | null = null;
    try {
      // Session-authenticated requests commonly have no API key. The gateway
      // authenticates these calls with the request cookies, so an empty key
      // must not prevent the persisted execution from being cancelled.
      if (threadIdToCancel && backendUrl) {
        await serviceRef.current.cancelThreadExecution({
          backendUrl,
          apiKey: apiKey.trim(),
          threadId: threadIdToCancel,
          requestHeaders,
        });
      }
    } catch (error) {
      cancellationError = error instanceof Error ? error : new Error(String(error));
    }

    try {
      // Always finalize the local run, even when the remote cancellation
      // request fails. Otherwise a transient gateway error leaves the
      // composer and the active turn stuck in a running state indefinitely.
      // The remote error is still surfaced below so it can be retried/diagnosed.
      markRunningTurnsCancelled();
      cancelLocalExecution();
      if (!hasLocalExecution) {
        stopRequestedThreadIdRef.current = null;
      }

      if (threadIdToCancel) {
        try {
          onContextRefresh?.(threadIdToCancel);
        } catch (error) {
          reportRunnerLifecycleCallbackError("onContextRefresh", error);
        }
        try {
          onRunCancel?.(threadIdToCancel);
        } catch (error) {
          reportRunnerLifecycleCallbackError("onRunCancel", error);
        }
      }

      if (cancellationError) {
        stopRequestedThreadIdRef.current = null;
        setError(cancellationError.message || "Failed to stop agent.");
        try {
          onRunError?.(cancellationError, threadIdToCancel || undefined);
        } catch (callbackError) {
          reportRunnerLifecycleCallbackError("onRunError", callbackError);
        }
      }
    } finally {
      setIsStoppingRun(false);
    }
  }, [
    apiKey,
    backendUrl,
    cancelLocalExecution,
    clearQueuedMessages,
    isStoppingRun,
    localExecutionRunning,
    markRunningTurnsCancelled,
    onContextRefresh,
    onRunCancel,
    onRunError,
    requestHeaders,
    setError,
    setPreparingRun,
    threadId,
  ]);

  return {
    clearStopRequest,
    consumeIntentionalStopAbort,
    handleStopActiveRun: stopActiveRun,
    isStoppingRun,
    normalizeIntentionalStopError,
  };
}
