import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS } from "../runner-chat-animations.js";
import {
  isRunningTurnStatus,
} from "./hydration/turn-state.js";
import type { RunnerTurnTimelineState } from "./legacy-timeline.js";
import type { RunnerTurn } from "./turn-types.js";

const THINKING_STATUS_FADE_DURATION_MS = 120;
const THINKING_STATUS_REAPPEAR_DELAY_MS = 500;

export type RunnerThinkingStatusPhase = "visible" | "fading" | "hidden";

export interface RunnerThinkingStatusState {
  thinkingStatusPhaseByTurn: Record<string, RunnerThinkingStatusPhase>;
  visibleTimelineItemCountsByTurn: Record<string, number>;
  visibleWorkLogItemCountsByTurn: Record<string, number>;
  setVisibleWorkLogItemCountsByTurn: Dispatch<
    SetStateAction<Record<string, number>>
  >;
}

export interface RunnerThinkingStatusOptions {
  turns: readonly RunnerTurn[];
  getTurnTimelineState: (turn: RunnerTurn) => RunnerTurnTimelineState;
}

export function useRunnerThinkingStatus({
  turns,
  getTurnTimelineState,
}: RunnerThinkingStatusOptions): RunnerThinkingStatusState {
  const [visibleTimelineItemCountsByTurn, setVisibleTimelineItemCountsByTurn] =
    useState<Record<string, number>>({});
  const [visibleWorkLogItemCountsByTurn, setVisibleWorkLogItemCountsByTurn] =
    useState<Record<string, number>>({});
  const [thinkingStatusPhaseByTurn, setThinkingStatusPhaseByTurn] = useState<
    Record<string, RunnerThinkingStatusPhase>
  >({});
  const getTurnTimelineStateRef = useRef(getTurnTimelineState);
  const visibleTimelineItemCountsRef = useRef<Record<string, number>>({});
  const thinkingStatusPhaseByTurnRef = useRef<
    Record<string, RunnerThinkingStatusPhase>
  >({});
  const thinkingStatusTimersRef = useRef<
    Record<string, { hideTimer?: number; showTimer?: number }>
  >({});
  const rawTimelineItemCountsRef = useRef<Record<string, number>>({});
  const thinkingStatusEligibilityRef = useRef<Record<string, boolean>>({});

  getTurnTimelineStateRef.current = getTurnTimelineState;

  const clearThinkingStatusTimers = useCallback((turnId: string) => {
    const timers = thinkingStatusTimersRef.current[turnId];
    if (timers?.hideTimer) window.clearTimeout(timers.hideTimer);
    if (timers?.showTimer) window.clearTimeout(timers.showTimer);
    delete thinkingStatusTimersRef.current[turnId];
  }, []);

  const setVisibleTimelineItemCount = useCallback(
    (turnId: string, nextCount: number) => {
      setVisibleTimelineItemCountsByTurn((previousCounts) => {
        if (previousCounts[turnId] === nextCount) return previousCounts;
        const nextCounts = { ...previousCounts, [turnId]: nextCount };
        visibleTimelineItemCountsRef.current = nextCounts;
        return nextCounts;
      });
    },
    [],
  );

  const setThinkingStatusPhase = useCallback(
    (turnId: string, nextPhase: RunnerThinkingStatusPhase) => {
      setThinkingStatusPhaseByTurn((previousPhases) => {
        if (previousPhases[turnId] === nextPhase) return previousPhases;
        const nextPhases = { ...previousPhases, [turnId]: nextPhase };
        thinkingStatusPhaseByTurnRef.current = nextPhases;
        return nextPhases;
      });
    },
    [],
  );

  const removeThinkingStatusState = useCallback(
    (turnId: string) => {
      setVisibleTimelineItemCountsByTurn((previousCounts) => {
        if (!(turnId in previousCounts)) return previousCounts;
        const nextCounts = { ...previousCounts };
        delete nextCounts[turnId];
        visibleTimelineItemCountsRef.current = nextCounts;
        return nextCounts;
      });
      setThinkingStatusPhaseByTurn((previousPhases) => {
        if (!(turnId in previousPhases)) return previousPhases;
        const nextPhases = { ...previousPhases };
        delete nextPhases[turnId];
        thinkingStatusPhaseByTurnRef.current = nextPhases;
        return nextPhases;
      });
      delete rawTimelineItemCountsRef.current[turnId];
      delete thinkingStatusEligibilityRef.current[turnId];
      clearThinkingStatusTimers(turnId);
    },
    [clearThinkingStatusTimers],
  );

  useEffect(() => {
    visibleTimelineItemCountsRef.current = visibleTimelineItemCountsByTurn;
  }, [visibleTimelineItemCountsByTurn]);

  useEffect(() => {
    thinkingStatusPhaseByTurnRef.current = thinkingStatusPhaseByTurn;
  }, [thinkingStatusPhaseByTurn]);

  useEffect(() => {
    const activeTurnIds = new Set(turns.map((turn) => turn.id));
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      let didChange = false;
      const nextCounts = { ...previousCounts };
      for (const turnId of Object.keys(nextCounts)) {
        if (!activeTurnIds.has(turnId)) {
          delete nextCounts[turnId];
          didChange = true;
        }
      }
      return didChange ? nextCounts : previousCounts;
    });
  }, [turns]);

  useEffect(() => {
    const activeTurnIds = new Set<string>();

    for (const turn of turns) {
      const { agentMessage, displayedTimelineItems } =
        getTurnTimelineStateRef.current(turn);
      const rawItemCount = displayedTimelineItems.length;
      const canShowThinkingStatus =
        isRunningTurnStatus(turn.status)
        && rawItemCount > 0
        && !agentMessage?.message;
      const visibleItemCount =
        visibleTimelineItemCountsRef.current[turn.id];
      const thinkingPhase =
        thinkingStatusPhaseByTurnRef.current[turn.id] ?? "hidden";

      activeTurnIds.add(turn.id);
      rawTimelineItemCountsRef.current[turn.id] = rawItemCount;
      thinkingStatusEligibilityRef.current[turn.id] =
        canShowThinkingStatus;

      if (visibleItemCount === undefined) {
        setVisibleTimelineItemCount(turn.id, rawItemCount);
      }

      if (!canShowThinkingStatus) {
        clearThinkingStatusTimers(turn.id);
        setVisibleTimelineItemCount(turn.id, rawItemCount);
        setThinkingStatusPhase(turn.id, "hidden");
        continue;
      }

      const currentVisibleItemCount =
        visibleTimelineItemCountsRef.current[turn.id] ?? rawItemCount;

      if (rawItemCount < currentVisibleItemCount) {
        clearThinkingStatusTimers(turn.id);
        setVisibleTimelineItemCount(turn.id, rawItemCount);
        setThinkingStatusPhase(turn.id, "visible");
        continue;
      }

      if (rawItemCount > currentVisibleItemCount) {
        if (thinkingPhase === "visible") {
          setThinkingStatusPhase(turn.id, "fading");
          clearThinkingStatusTimers(turn.id);
          const timers = thinkingStatusTimersRef.current[turn.id] || {};
          timers.hideTimer = window.setTimeout(() => {
            const latestVisibleItemCount =
              rawTimelineItemCountsRef.current[turn.id] ?? 0;
            setVisibleTimelineItemCount(turn.id, latestVisibleItemCount);
            setThinkingStatusPhase(turn.id, "hidden");

            const nextTimers =
              thinkingStatusTimersRef.current[turn.id] || {};
            if (nextTimers.showTimer) {
              window.clearTimeout(nextTimers.showTimer);
            }
            nextTimers.showTimer = window.setTimeout(() => {
              if (thinkingStatusEligibilityRef.current[turn.id]) {
                setThinkingStatusPhase(turn.id, "visible");
              }
            }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS + THINKING_STATUS_REAPPEAR_DELAY_MS);
            thinkingStatusTimersRef.current[turn.id] = nextTimers;
          }, THINKING_STATUS_FADE_DURATION_MS);
          thinkingStatusTimersRef.current[turn.id] = timers;
        } else if (thinkingPhase === "hidden") {
          setVisibleTimelineItemCount(turn.id, rawItemCount);
          const timers = thinkingStatusTimersRef.current[turn.id] || {};
          if (timers.showTimer) window.clearTimeout(timers.showTimer);
          timers.showTimer = window.setTimeout(() => {
            if (thinkingStatusEligibilityRef.current[turn.id]) {
              setThinkingStatusPhase(turn.id, "visible");
            }
          }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS + THINKING_STATUS_REAPPEAR_DELAY_MS);
          thinkingStatusTimersRef.current[turn.id] = timers;
        }
        continue;
      }

      if (thinkingPhase !== "fading" && thinkingPhase !== "visible") {
        setThinkingStatusPhase(turn.id, "visible");
      }
    }

    for (const turnId of Object.keys(rawTimelineItemCountsRef.current)) {
      if (!activeTurnIds.has(turnId)) removeThinkingStatusState(turnId);
    }
  }, [
    clearThinkingStatusTimers,
    removeThinkingStatusState,
    setThinkingStatusPhase,
    setVisibleTimelineItemCount,
    turns,
  ]);

  useEffect(
    () => () => {
      for (const turnId of Object.keys(thinkingStatusTimersRef.current)) {
        clearThinkingStatusTimers(turnId);
      }
    },
    [clearThinkingStatusTimers],
  );

  return {
    thinkingStatusPhaseByTurn,
    visibleTimelineItemCountsByTurn,
    visibleWorkLogItemCountsByTurn,
    setVisibleWorkLogItemCountsByTurn,
  };
}
