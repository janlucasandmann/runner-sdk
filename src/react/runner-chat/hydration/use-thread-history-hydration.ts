import {
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { fetchAllThreadMessages } from "../conversation-messages.js";
import type { RunnerTurn } from "../turn-types.js";
import { mapExpandedTurns } from "../turn-expansion.js";
import { fetchThreadHydrationPayload } from "./api.js";
import { buildHydratedTurnsFromMessages } from "./message-turns.js";
import { buildHydratedTurnsFromPayload } from "./turn-builders.js";
import { mergeHydratedTurns } from "./turn-merge.js";
import type { RunnerThreadHydrationPayload } from "./types.js";

export interface RunnerHistoryExternalRunRequest {
  prompt?: string | null;
  threadId?: string | null;
  token?: string | number | null;
}

export interface RunnerThreadHistoryHydrationEligibility {
  alreadyInitialized: boolean;
  hasPendingExternalRun: boolean;
  isLocallyOwned: boolean;
  shouldHydrate: boolean;
}

export function getRunnerThreadHistoryHydrationEligibility(options: {
  externalRunRequest?: RunnerHistoryExternalRunRequest | null;
  handledExternalRunToken: string | number | null;
  hasApiKey: boolean;
  initializedThreadId: string | null;
  locallyOwnedThreadId: string | null;
  threadId: string | null | undefined;
  turnCount: number;
}): RunnerThreadHistoryHydrationEligibility {
  const threadId = String(options.threadId || "").trim();
  const requestThreadId = String(
    options.externalRunRequest?.threadId || "",
  ).trim();
  const hasPendingExternalRun = Boolean(
    options.externalRunRequest
    && options.handledExternalRunToken
      !== options.externalRunRequest.token
    && requestThreadId === threadId
    && String(options.externalRunRequest.prompt || "").trim(),
  );
  const isLocallyOwned = Boolean(
    threadId && options.locallyOwnedThreadId === threadId,
  );
  const alreadyInitialized = Boolean(
    threadId
    && options.initializedThreadId === threadId
    && options.turnCount > 0,
  );
  return {
    alreadyInitialized,
    hasPendingExternalRun,
    isLocallyOwned,
    shouldHydrate: Boolean(
      threadId
      && options.hasApiKey
      && !hasPendingExternalRun
      && !isLocallyOwned
      && !alreadyInitialized,
    ),
  };
}

export interface RunnerThreadHistoryHydrationOptions {
  agentName: string;
  apiKey: string;
  backendUrl: string;
  clearExecution: () => void;
  environmentName: string;
  externalRunRequest?: RunnerHistoryExternalRunRequest | null;
  handledExternalRunTokenRef: MutableRefObject<string | number | null>;
  hasApiKey: boolean;
  hasRunningTurn: boolean;
  hydrationCacheRef: MutableRefObject<RunnerThreadHydrationPayload | null>;
  initializedThreadIdRef: MutableRefObject<string | null>;
  isPreparingRun: boolean;
  locallyOwnedExecutionThreadIdRef: MutableRefObject<string | null>;
  onEnvironmentHydrated: (payload: RunnerThreadHydrationPayload) => void;
  onInitialHydrationSettled?: (threadId: string) => void;
  pendingQueuedMessageCount: number;
  requestHeaders?: HeadersInit;
  setError: Dispatch<SetStateAction<string | null>>;
  setExpandedStepRows: Dispatch<SetStateAction<Record<string, boolean>>>;
  setExpandedTurns: Dispatch<SetStateAction<Record<string, boolean>>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setHydratedThreadStatus: Dispatch<SetStateAction<string | null>>;
  setTurns: Dispatch<SetStateAction<RunnerTurn[]>>;
  threadId: string | null | undefined;
  turnsRef: MutableRefObject<RunnerTurn[]>;
}

/**
 * Loads an existing thread in two phases: messages first for fast paint, then
 * the authoritative hydration projection with logs, run state and environment.
 */
export function useRunnerThreadHistoryHydration({
  agentName,
  apiKey,
  backendUrl,
  clearExecution,
  environmentName,
  externalRunRequest,
  handledExternalRunTokenRef,
  hasApiKey,
  hasRunningTurn,
  hydrationCacheRef,
  initializedThreadIdRef,
  isPreparingRun,
  locallyOwnedExecutionThreadIdRef,
  onEnvironmentHydrated,
  onInitialHydrationSettled,
  pendingQueuedMessageCount,
  requestHeaders,
  setError,
  setExpandedStepRows,
  setExpandedTurns,
  setHydratedThreadStatus,
  setIsLoading,
  setTurns,
  threadId,
  turnsRef,
}: RunnerThreadHistoryHydrationOptions): void {
  const renderingRef = useRef({
    agentName,
    environmentName,
    onEnvironmentHydrated,
    onInitialHydrationSettled,
  });
  renderingRef.current = {
    agentName,
    environmentName,
    onEnvironmentHydrated,
    onInitialHydrationSettled,
  };

  useEffect(() => {
    void hasRunningTurn;
    void isPreparingRun;
    void pendingQueuedMessageCount;
    let cancelled = false;
    let hydrationApplied = false;
    let previewRendered = false;
    const normalizedThreadId = String(threadId || "").trim();
    const eligibility = getRunnerThreadHistoryHydrationEligibility({
      externalRunRequest,
      handledExternalRunToken: handledExternalRunTokenRef.current,
      hasApiKey,
      initializedThreadId: initializedThreadIdRef.current,
      locallyOwnedThreadId: locallyOwnedExecutionThreadIdRef.current,
      threadId: normalizedThreadId,
      turnCount: turnsRef.current.length,
    });

    if (!eligibility.shouldHydrate) {
      setIsLoading(false);
      renderingRef.current.onInitialHydrationSettled?.(normalizedThreadId);
      return () => {
        cancelled = true;
      };
    }

    clearExecution();
    setIsLoading(true);
    setError(null);
    setExpandedStepRows({});

    const threadMessagesPromise = fetchAllThreadMessages({
      backendUrl,
      apiKey: apiKey.trim(),
      threadId: normalizedThreadId,
      requestHeaders,
    });
    void threadMessagesPromise
      .then((messages) => {
        if (cancelled || hydrationApplied) return;
        const previewTurns = buildHydratedTurnsFromMessages(messages, {
          agentName: renderingRef.current.agentName,
          environmentName: renderingRef.current.environmentName,
          backendUrl,
        });
        if (!previewTurns.length) return;
        previewRendered = true;
        const previousTurns = turnsRef.current;
        setTurns(previewTurns);
        setExpandedTurns((previousExpandedTurns) =>
          mapExpandedTurns(
            previousExpandedTurns,
            previousTurns,
            previewTurns,
            { collapseOnNewRunSummary: true },
          ),
        );
      })
      .catch(() => undefined);

    void fetchThreadHydrationPayload({
      backendUrl,
      apiKey: apiKey.trim(),
      threadId: normalizedThreadId,
      requestHeaders,
      messagesPromise: threadMessagesPromise.catch(() => []),
    })
      .then((payload) => {
        if (cancelled) return null;
        hydrationApplied = true;
        hydrationCacheRef.current = payload;
        setHydratedThreadStatus(payload.threadStatus ?? null);
        renderingRef.current.onEnvironmentHydrated(payload);
        return buildHydratedTurnsFromPayload(payload, {
          agentName: renderingRef.current.agentName,
          environmentName:
            payload.threadEnvironmentName
            ?? payload.environmentName
            ?? renderingRef.current.environmentName,
          backendUrl,
        });
      })
      .catch(() =>
        fetchAllThreadMessages({
          backendUrl,
          apiKey: apiKey.trim(),
          threadId: normalizedThreadId,
          requestHeaders,
        }).then((messages) =>
          buildHydratedTurnsFromMessages(messages, {
            agentName: renderingRef.current.agentName,
            environmentName: renderingRef.current.environmentName,
            backendUrl,
          }),
        ),
      )
      .then((hydratedTurns) => {
        if (cancelled || !hydratedTurns) return;
        initializedThreadIdRef.current = normalizedThreadId;
        const previousTurns = turnsRef.current;
        const mergedTurns = mergeHydratedTurns(
          previousTurns,
          hydratedTurns,
        );
        setTurns(mergedTurns);
        setExpandedTurns((previousExpandedTurns) =>
          mapExpandedTurns(
            previousExpandedTurns,
            previousTurns,
            mergedTurns,
            {
              collapseOnNewRunSummary: true,
            },
          ),
        );
      })
      .catch((error) => {
        if (cancelled || previewRendered) return;
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        setTurns([]);
        setExpandedTurns({});
        setError(
          normalizedError.message || "Failed to load thread history.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          renderingRef.current.onInitialHydrationSettled?.(normalizedThreadId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    apiKey,
    backendUrl,
    clearExecution,
    externalRunRequest,
    handledExternalRunTokenRef,
    hasApiKey,
    hasRunningTurn,
    hydrationCacheRef,
    initializedThreadIdRef,
    isPreparingRun,
    locallyOwnedExecutionThreadIdRef,
    pendingQueuedMessageCount,
    requestHeaders,
    setError,
    setExpandedStepRows,
    setExpandedTurns,
    setHydratedThreadStatus,
    setIsLoading,
    setTurns,
    threadId,
    turnsRef,
  ]);
}
