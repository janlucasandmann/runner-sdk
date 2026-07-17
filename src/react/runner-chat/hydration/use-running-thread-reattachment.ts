import {
  useEffect,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { hasActiveDeepResearchLogGroup } from "../../../platform-ui/components/thread-components/log-boxes/index.js";
import type { RunnerTurn } from "../turn-types.js";
import { mapExpandedTurns } from "../turn-expansion.js";
import {
  fetchThreadHydrationPayload,
  fetchThreadStatusSnapshot,
} from "./api.js";
import {
  isPendingPermissionThreadLifecycleStatus,
  isRunningThreadLifecycleStatus,
} from "./lifecycle-status.js";
import {
  fetchThreadLiveRefreshPayload,
  resolveHydrationInitialPrompt,
} from "./live-refresh.js";
import { buildHydratedTurnsFromPayload } from "./turn-builders.js";
import { mergeHydratedTurns } from "./turn-merge.js";
import { isRunningTurnStatus } from "./turn-state.js";
import type { RunnerThreadHydrationPayload } from "./types.js";

export const RUNNER_REATTACH_POLL_INTERVAL_MS = 900;
export const RUNNER_REATTACH_RETRY_DELAY_MS = 1_500;
export const RUNNER_REATTACH_TERMINAL_SETTLE_POLLS = 2;
export const RUNNER_REATTACH_INITIAL_GRACE_POLLS = 30;

export interface RunnerThreadReattachmentDecision {
  localHasActiveDeepResearch: boolean;
  localHasPendingPermissionTurn: boolean;
  localHasRunningTurn: boolean;
  remoteThreadHasPendingPermission: boolean;
  remoteThreadIsRunning: boolean;
  shouldHydrateThread: boolean;
}

export function getRunnerThreadReattachmentDecision(
  status: string | null | undefined,
  turns: RunnerTurn[],
  initialGracePollsRemaining: number,
): RunnerThreadReattachmentDecision {
  const localHasRunningTurn = turns.some((turn) => isRunningTurnStatus(turn.status));
  const localHasPendingPermissionTurn = turns.some(
    (turn) => turn.status === "permission_asked",
  );
  const localHasActiveDeepResearch = turns.some(
    (turn) => hasActiveDeepResearchLogGroup(turn.logs),
  );
  const remoteThreadIsRunning = isRunningThreadLifecycleStatus(status);
  const remoteThreadHasPendingPermission =
    isPendingPermissionThreadLifecycleStatus(status);
  const shouldHydrateThread =
    remoteThreadIsRunning
    || localHasRunningTurn
    || localHasActiveDeepResearch
    || (remoteThreadHasPendingPermission && !localHasPendingPermissionTurn)
    || (localHasPendingPermissionTurn && !remoteThreadHasPendingPermission)
    || (turns.length === 0 && initialGracePollsRemaining > 0);

  return {
    localHasActiveDeepResearch,
    localHasPendingPermissionTurn,
    localHasRunningTurn,
    remoteThreadHasPendingPermission,
    remoteThreadIsRunning,
    shouldHydrateThread,
  };
}

export interface RunnerRunningThreadReattachmentOptions {
  agentName: string;
  apiKey: string;
  backendUrl: string;
  enabled: boolean;
  environmentName: string;
  hasHydratedActivity: boolean;
  hasRunningTurn: boolean;
  hydrationCacheRef: MutableRefObject<RunnerThreadHydrationPayload | null>;
  locallyOwnedExecutionThreadIdRef: MutableRefObject<string | null>;
  onEnvironmentHydrated: (payload: RunnerThreadHydrationPayload) => void;
  requestHeaders?: HeadersInit;
  setExpandedTurns: Dispatch<SetStateAction<Record<string, boolean>>>;
  setHydratedThreadStatus: Dispatch<SetStateAction<string | null>>;
  setTurns: Dispatch<SetStateAction<RunnerTurn[]>>;
  threadId: string | null | undefined;
  turnsRef: MutableRefObject<RunnerTurn[]>;
}

/**
 * Reattaches a mounted chat to work that is executing outside this page.
 *
 * Locally owned executions stay on the direct execution stream; remote or
 * resumed work is polled through the hydration projection. Keeping that
 * ownership rule here prevents two concurrent transports from racing to
 * overwrite the same timeline.
 */
export function useRunnerRunningThreadReattachment({
  agentName,
  apiKey,
  backendUrl,
  enabled,
  environmentName,
  hasHydratedActivity,
  hasRunningTurn,
  hydrationCacheRef,
  locallyOwnedExecutionThreadIdRef,
  onEnvironmentHydrated,
  requestHeaders,
  setExpandedTurns,
  setHydratedThreadStatus,
  setTurns,
  threadId,
  turnsRef,
}: RunnerRunningThreadReattachmentOptions): void {
  const renderingRef = useRef({
    agentName,
    environmentName,
    onEnvironmentHydrated,
  });
  renderingRef.current = {
    agentName,
    environmentName,
    onEnvironmentHydrated,
  };

  useEffect(() => {
    void hasHydratedActivity;
    void hasRunningTurn;
    const normalizedThreadId = String(threadId || "").trim();
    if (!enabled || !normalizedThreadId || !apiKey.trim() || !backendUrl) {
      return;
    }

    let cancelled = false;
    let pollInFlight = false;
    let timeoutId: number | null = null;
    let trailingTerminalPollsRemaining =
      RUNNER_REATTACH_TERMINAL_SETTLE_POLLS;
    let initialGracePollsRemaining = RUNNER_REATTACH_INITIAL_GRACE_POLLS;

    const scheduleNextPoll = (delayMs: number) => {
      if (cancelled) return;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void pollRunningThread();
      }, delayMs);
    };

    const pollRunningThread = async () => {
      if (cancelled || pollInFlight) return;
      pollInFlight = true;

      try {
        if (locallyOwnedExecutionThreadIdRef.current === normalizedThreadId) {
          scheduleNextPoll(RUNNER_REATTACH_POLL_INTERVAL_MS);
          return;
        }

        const statusSnapshot = await fetchThreadStatusSnapshot({
          backendUrl,
          apiKey: apiKey.trim(),
          threadId: normalizedThreadId,
          requestHeaders,
        });
        if (cancelled) return;
        setHydratedThreadStatus(statusSnapshot.status ?? null);

        const decision = getRunnerThreadReattachmentDecision(
          statusSnapshot.status,
          turnsRef.current,
          initialGracePollsRemaining,
        );
        let nextHasRunningTurn = decision.localHasRunningTurn;
        let nextHasActiveDeepResearch =
          decision.localHasActiveDeepResearch;

        if (decision.shouldHydrateThread) {
          const cachedPayload =
            hydrationCacheRef.current?.threadId === normalizedThreadId
              ? hydrationCacheRef.current
              : null;
          const initialPrompt = resolveHydrationInitialPrompt(
            turnsRef.current,
            cachedPayload,
          );
          const shouldUseFullHydration =
            !decision.remoteThreadIsRunning
            || (!cachedPayload && !initialPrompt);
          const payload = shouldUseFullHydration
            ? await fetchThreadHydrationPayload({
                backendUrl,
                apiKey: apiKey.trim(),
                threadId: normalizedThreadId,
                requestHeaders,
              })
            : await fetchThreadLiveRefreshPayload({
                backendUrl,
                apiKey: apiKey.trim(),
                threadId: normalizedThreadId,
                requestHeaders,
                statusSnapshot,
                existingTurns: turnsRef.current,
                cachedPayload,
              });
          if (cancelled) return;

          hydrationCacheRef.current = payload;
          setHydratedThreadStatus(
            payload.threadStatus ?? statusSnapshot.status ?? null,
          );
          renderingRef.current.onEnvironmentHydrated(payload);
          const hydratedTurns = buildHydratedTurnsFromPayload(payload, {
            agentName: renderingRef.current.agentName,
            environmentName:
              payload.threadEnvironmentName
              ?? payload.environmentName
              ?? renderingRef.current.environmentName,
            backendUrl,
          });
          if (cancelled) return;

          const previousTurns = turnsRef.current;
          const mergedTurns = mergeHydratedTurns(
            previousTurns,
            hydratedTurns,
          );
          nextHasRunningTurn = mergedTurns.some(
            (turn) => isRunningTurnStatus(turn.status),
          );
          nextHasActiveDeepResearch = mergedTurns.some(
            (turn) => hasActiveDeepResearchLogGroup(turn.logs),
          );
          setTurns(mergedTurns);
          setExpandedTurns((previousExpandedTurns) =>
            mapExpandedTurns(
              previousExpandedTurns,
              previousTurns,
              mergedTurns,
              {
                defaultLatestExpanded: true,
                collapseOnNewRunSummary: true,
              },
            ),
          );
        }

        if (
          decision.remoteThreadIsRunning
          || nextHasRunningTurn
          || nextHasActiveDeepResearch
        ) {
          trailingTerminalPollsRemaining =
            RUNNER_REATTACH_TERMINAL_SETTLE_POLLS;
          initialGracePollsRemaining = RUNNER_REATTACH_INITIAL_GRACE_POLLS;
          scheduleNextPoll(RUNNER_REATTACH_POLL_INTERVAL_MS);
          return;
        }
        if (decision.remoteThreadHasPendingPermission) {
          trailingTerminalPollsRemaining =
            RUNNER_REATTACH_TERMINAL_SETTLE_POLLS;
          initialGracePollsRemaining = RUNNER_REATTACH_INITIAL_GRACE_POLLS;
          scheduleNextPoll(RUNNER_REATTACH_RETRY_DELAY_MS);
          return;
        }
        if (
          decision.shouldHydrateThread
          && trailingTerminalPollsRemaining > 0
        ) {
          trailingTerminalPollsRemaining -= 1;
          scheduleNextPoll(RUNNER_REATTACH_POLL_INTERVAL_MS);
          return;
        }
        if (
          !decision.shouldHydrateThread
          && initialGracePollsRemaining > 0
        ) {
          initialGracePollsRemaining -= 1;
          scheduleNextPoll(RUNNER_REATTACH_POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "[RunnerChat] Failed to refresh hydrated running thread:",
            error,
          );
          scheduleNextPoll(RUNNER_REATTACH_RETRY_DELAY_MS);
        }
      } finally {
        pollInFlight = false;
      }
    };

    void pollRunningThread();
    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [
    apiKey,
    backendUrl,
    enabled,
    hasHydratedActivity,
    hasRunningTurn,
    hydrationCacheRef,
    locallyOwnedExecutionThreadIdRef,
    requestHeaders,
    setExpandedTurns,
    setHydratedThreadStatus,
    setTurns,
    threadId,
    turnsRef,
  ]);
}
