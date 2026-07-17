import {
  normalizeDuplicateSummaryText,
} from "./hydration/log-normalization.js";
import {
  isTurnResponseLog,
} from "./hydration/turn-state.js";
import {
  turnsLikelyMatch,
} from "./hydration/turn-merge.js";
import type { RunnerTurn } from "./turn-types.js";

export function getTurnRunSummarySignature(
  turn: RunnerTurn | null | undefined,
): string {
  const responseLog = turn?.logs
    ? [...turn.logs].reverse().find(isTurnResponseLog)
    : null;
  const normalizedMessage = normalizeDuplicateSummaryText(
    responseLog?.message || "",
  );
  if (!normalizedMessage) {
    return "";
  }
  return [
    responseLog?.eventType || "",
    responseLog?.time || "",
    normalizedMessage.length,
    normalizedMessage.slice(0, 160),
  ].join(":");
}

export function findMatchingPreviousTurn(
  previousTurns: RunnerTurn[],
  nextTurn: RunnerTurn,
): RunnerTurn | null {
  return previousTurns.find((previousTurn) => previousTurn.id === nextTurn.id)
    || previousTurns.find((previousTurn) => turnsLikelyMatch(previousTurn, nextTurn))
    || null;
}

export function hasNewTurnRunSummary(
  previousTurns: RunnerTurn[],
  nextTurns: RunnerTurn[],
): boolean {
  return nextTurns.some((nextTurn) => {
    const nextSignature = getTurnRunSummarySignature(nextTurn);
    if (!nextSignature) {
      return false;
    }
    const previousTurn = findMatchingPreviousTurn(previousTurns, nextTurn);
    return getTurnRunSummarySignature(previousTurn) !== nextSignature;
  });
}

export function mapExpandedTurns(
  previousExpandedTurns: Record<string, boolean>,
  previousTurns: RunnerTurn[],
  nextTurns: RunnerTurn[],
  options?: {
    defaultLatestExpanded?: boolean;
    collapseOnNewRunSummary?: boolean;
  },
): Record<string, boolean> {
  if (
    options?.collapseOnNewRunSummary
    && hasNewTurnRunSummary(previousTurns, nextTurns)
  ) {
    return nextTurns.reduce<Record<string, boolean>>((accumulator, turn) => {
      accumulator[turn.id] = false;
      return accumulator;
    }, {});
  }

  const latestTurnId =
    nextTurns.length > 0 ? nextTurns[nextTurns.length - 1]!.id : null;
  return nextTurns.reduce<Record<string, boolean>>((accumulator, turn) => {
    const directExpanded = previousExpandedTurns[turn.id];
    if (typeof directExpanded === "boolean") {
      accumulator[turn.id] = directExpanded;
      return accumulator;
    }

    const matchedPreviousTurn = previousTurns.find((previousTurn) =>
      turnsLikelyMatch(previousTurn, turn));
    if (
      matchedPreviousTurn
      && typeof previousExpandedTurns[matchedPreviousTurn.id] === "boolean"
    ) {
      accumulator[turn.id] = previousExpandedTurns[matchedPreviousTurn.id]!;
      return accumulator;
    }

    if (options?.defaultLatestExpanded && latestTurnId === turn.id) {
      accumulator[turn.id] = true;
    }
    return accumulator;
  }, {});
}
