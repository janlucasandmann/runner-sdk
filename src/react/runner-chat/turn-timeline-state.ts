import type { RunnerDeepResearchSession } from "../../types.js";
import {
  dedupeAdjacentRunnerLogs,
  isDuplicateAssistantSummaryTimelineLog,
  shouldDisplayTimelineLog,
} from "./hydration/log-normalization.js";
import { isRunningTurnStatus } from "./hydration/turn-state.js";
import {
  buildTimelineItems,
  isDeepResearchTimelineCommand,
  type RunnerTurnTimelineState,
} from "./legacy-timeline.js";
import {
  resolveDeepResearchSessionForGroup,
} from "./deep-research-session.js";
import type { RunnerTurn } from "./turn-types.js";

export interface BuildRunnerTurnTimelineStateOptions {
  turn: RunnerTurn;
  turns: readonly RunnerTurn[];
  deepResearchSessions: readonly RunnerDeepResearchSession[];
  activeDeepResearchThreadSession: RunnerDeepResearchSession | null;
}

export function buildRunnerTurnTimelineState({
  turn,
  turns,
  deepResearchSessions,
  activeDeepResearchThreadSession,
}: BuildRunnerTurnTimelineStateOptions): RunnerTurnTimelineState {
  const agentMessage = [...turn.logs]
    .reverse()
    .find(
      (log) =>
        log.eventType === "agent_message"
        || log.eventType === "llm_response",
    );
  const timelineLogs = dedupeAdjacentRunnerLogs(
    turn.logs.filter(
      (log) =>
        shouldDisplayTimelineLog(log)
        && !isDuplicateAssistantSummaryTimelineLog(log, agentMessage),
    ),
  );
  const displayedTimelineLogs =
    timelineLogs.length === 0 && isRunningTurnStatus(turn.status)
      ? [
          {
            time: "00:00",
            message: "Setting up workspace...",
            type: "info" as const,
            eventType: "setup" as const,
          },
        ]
      : timelineLogs;
  const displayedTimelineItems = buildTimelineItems(displayedTimelineLogs);
  const hasDeepResearchGroup = displayedTimelineItems.some(
    (item) => item.kind === "deep_research_group",
  );
  const fallbackDeepResearchCommandLog = displayedTimelineLogs.find((log) =>
    isDeepResearchTimelineCommand(log),
  );
  const matchedDeepResearchSession = resolveDeepResearchSessionForGroup({
    logs: [],
    runningCommandLog: fallbackDeepResearchCommandLog,
    turn,
    sessions: [...deepResearchSessions],
  });
  const latestPrimaryTurn =
    [...turns]
      .reverse()
      .find(
        (candidateTurn) =>
          candidateTurn.presentation !== "btw"
          && candidateTurn.presentation !== "context-action-notice",
      ) || null;
  const fallbackSessionForLatestTurn =
    !matchedDeepResearchSession && latestPrimaryTurn?.id === turn.id
      ? activeDeepResearchThreadSession
      : null;
  const effectiveDeepResearchSession =
    matchedDeepResearchSession || fallbackSessionForLatestTurn;
  const shouldInjectSessionBackedDeepResearchGroup =
    !hasDeepResearchGroup && Boolean(effectiveDeepResearchSession);

  return {
    agentMessage,
    displayedTimelineItems: shouldInjectSessionBackedDeepResearchGroup
      ? [
          {
            kind: "deep_research_group",
            logs: [],
            runningCommandLog: fallbackDeepResearchCommandLog,
          },
          ...displayedTimelineItems,
        ]
      : displayedTimelineItems,
  };
}
