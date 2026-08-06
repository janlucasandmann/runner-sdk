import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { RunnerTurn } from "./turn-types.js";

export interface RunnerWorkLogPaginationState {
  visibleWorkLogItemCountsByTurn: Record<string, number>;
  setVisibleWorkLogItemCountsByTurn: Dispatch<
    SetStateAction<Record<string, number>>
  >;
}

/** Keeps per-turn pagination state while pruning entries from other threads. */
export function useRunnerWorkLogPagination(
  turns: readonly RunnerTurn[],
): RunnerWorkLogPaginationState {
  const [visibleWorkLogItemCountsByTurn, setVisibleWorkLogItemCountsByTurn] =
    useState<Record<string, number>>({});

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

  return {
    visibleWorkLogItemCountsByTurn,
    setVisibleWorkLogItemCountsByTurn,
  };
}
