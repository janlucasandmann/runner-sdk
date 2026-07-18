import { useCallback, useEffect, useRef, useState } from "react";

import { fetchRunnerThreadContext, fetchRunnerThreadContextDetails } from "./thread-context-api.js";
import {
  DEFAULT_THREAD_CONTEXT_ACTIONS,
  type RunnerChatThreadContext,
  type RunnerChatThreadContextAction,
  type RunnerChatThreadContextAvailableActions,
  type RunnerChatThreadContextDetails,
} from "./thread-context-utils.js";

interface RunnerThreadContextControllerServices {
  fetchDetails: typeof fetchRunnerThreadContextDetails;
  fetchEstimate: typeof fetchRunnerThreadContext;
}

export interface UseRunnerThreadContextControllerOptions {
  apiKey: string;
  backendUrl: string;
  detailsRequested: boolean;
  executionRunning: boolean;
  requestHeaders?: HeadersInit;
  services?: Partial<RunnerThreadContextControllerServices>;
  threadId?: string | null;
}

export function useRunnerThreadContextController({
  apiKey,
  backendUrl,
  detailsRequested,
  executionRunning,
  requestHeaders,
  services,
  threadId,
}: UseRunnerThreadContextControllerOptions) {
  const [context, setContext] = useState<RunnerChatThreadContext | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [details, setDetails] = useState<RunnerChatThreadContextDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [nativeError, setNativeError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<RunnerChatThreadContextAction | null>(null);
  const [availableActions, setAvailableActions] = useState<RunnerChatThreadContextAvailableActions>(
    DEFAULT_THREAD_CONTEXT_ACTIONS,
  );
  const automaticDetailsRequestKeyRef = useRef("");
  const fetchEstimate = services?.fetchEstimate || fetchRunnerThreadContext;
  const fetchDetails = services?.fetchDetails || fetchRunnerThreadContextDetails;

  const resetDetails = useCallback(() => {
    setDetails(null);
    setDetailsError(null);
    setNativeError(null);
    setDetailsLoading(false);
    setAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
  }, []);

  const resetContext = useCallback(() => {
    setContext(null);
    setEstimateLoading(false);
    setActionLoading(null);
    resetDetails();
  }, [resetDetails]);

  const markContextCleared = useCallback(() => {
    setContext(null);
    setDetails(null);
  }, []);

  const beginAction = useCallback((action: RunnerChatThreadContextAction) => {
    setActionLoading(action);
    setDetailsError(null);
  }, []);

  const finishAction = useCallback(() => {
    setActionLoading(null);
  }, []);

  const clearDetailsError = useCallback(() => {
    setDetailsError(null);
  }, []);

  const refreshDetails = useCallback(
    async (nextThreadId?: string) => {
      const resolvedThreadId = String(nextThreadId || threadId || "").trim();
      if (!resolvedThreadId || !apiKey.trim() || !backendUrl) {
        resetDetails();
        return;
      }

      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const result = await fetchDetails({
          backendUrl,
          apiKey,
          requestHeaders,
          threadId: resolvedThreadId,
        });
        setDetails(result.context);
        setContext(result.context);
        setAvailableActions(result.availableActions);
        setNativeError(result.nativeError);
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setDetails(null);
        setDetailsError(normalizedError.message || "Failed to load thread context details.");
        setNativeError(null);
        setAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
      } finally {
        setDetailsLoading(false);
      }
    },
    [apiKey, backendUrl, fetchDetails, requestHeaders, resetDetails, threadId],
  );

  const refreshDetailsInBackground = useCallback(
    (nextThreadId?: string) => {
      void refreshDetails(nextThreadId).catch(() => undefined);
    },
    [refreshDetails],
  );

  useEffect(() => {
    automaticDetailsRequestKeyRef.current = `reset:${String(
      threadId || "",
    ).trim()}`;
    resetContext();
  }, [resetContext, threadId]);

  useEffect(() => {
    let cancelled = false;
    const resolvedThreadId = String(threadId || "").trim();

    if (!resolvedThreadId || !apiKey.trim() || !backendUrl || executionRunning) {
      if (!resolvedThreadId) setContext(null);
      setEstimateLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setEstimateLoading(true);
    void fetchEstimate({
      backendUrl,
      apiKey,
      requestHeaders,
      threadId: resolvedThreadId,
    })
      .then((nextContext) => {
        if (!cancelled) setContext(nextContext);
      })
      .catch(() => {
        if (!cancelled) setContext(null);
      })
      .finally(() => {
        if (!cancelled) setEstimateLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, backendUrl, executionRunning, fetchEstimate, requestHeaders, threadId]);

  useEffect(() => {
    if (!detailsRequested) {
      automaticDetailsRequestKeyRef.current = "";
      return;
    }
    const requestKey = String(threadId || "").trim();
    if (!requestKey) return;
    if (details?.threadId === threadId && !detailsError) return;
    if (automaticDetailsRequestKeyRef.current === requestKey) return;
    automaticDetailsRequestKeyRef.current = requestKey;
    void refreshDetails();
  }, [details?.threadId, detailsError, detailsRequested, refreshDetails, threadId]);

  return {
    actionLoading,
    availableActions,
    beginAction,
    clearDetailsError,
    context,
    details,
    detailsError,
    detailsLoading,
    estimateLoading,
    finishAction,
    markContextCleared,
    nativeError,
    refreshDetails,
    refreshDetailsInBackground,
    resetContext,
  };
}
