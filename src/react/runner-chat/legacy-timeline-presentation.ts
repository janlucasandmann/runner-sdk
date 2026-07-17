import type { RunnerLog } from "../../types.js";
import {
  getRunnerLogRangeDurationLabel,
  toRunnerLogDurationLabel,
} from "./log-presentation.js";
import {
  isRunningTurnStatus,
} from "./hydration/turn-state.js";
import type { RunnerTurn } from "./turn-types.js";
import {
  buildTimelineItems,
  getSubagentInvocationId,
  getSubagentInvocationMetadata,
  isSubagentInvocationLog,
  normalizeSubagentSummaryText,
  sanitizeSubagentResponseMessage,
  stepRowKey,
  type RunnerComputerUseGroup,
  type RunnerSubagentGroup,
  type RunnerTimelineItem,
} from "./legacy-timeline.js";

export type RunnerVisualDetailKind = "computer_use" | "browser";

export type RunnerSubagentPresentation = {
  invocationId: string;
  title: string;
  prompt?: string | null;
  environmentName: string;
  running: boolean;
  timeLabel?: string;
  responseMessage?: string | null;
  responseFailed: boolean;
  previewMessage: string;
  workLabel: string;
  nestedItems: RunnerTimelineItem[];
};

export type RunnerComputerUsePresentation = {
  kind: RunnerVisualDetailKind;
  groupId: string;
  title: string;
  environmentName: string;
  running: boolean;
  timeLabel?: string;
  workLabel: string;
  nestedItems: RunnerTimelineItem[];
};

export interface RunnerLegacyTimelinePresentationContext {
  displayedAgentLabel?: string | null;
  displayedEnvironmentLabel?: string | null;
}

export function buildSubagentGroupPresentation(
  turn: RunnerTurn,
  item: RunnerSubagentGroup,
  context: RunnerLegacyTimelinePresentationContext = {},
): RunnerSubagentPresentation {
  const invocation = getSubagentInvocationMetadata(item.invocationLog);
  const invocationId = getSubagentInvocationId(item.invocationLog) || `subagent-${turn.id}`;
  const fallbackCompletionLog = (
    !item.completionLog
    && isSubagentInvocationLog(item.invocationLog)
    && getSubagentInvocationMetadata(item.invocationLog)?.status !== "started"
  )
    ? item.invocationLog
    : undefined;
  const completionLog = item.completionLog || fallbackCompletionLog;
  const latestNestedLog = item.logs[item.logs.length - 1] || completionLog || item.invocationLog;
  const subagentTitle = (
    invocation?.agentName
    || item.invocationLog.metadata?.delegatedTo?.agentName
    || turn.agentName
    || context.displayedAgentLabel
    || "Subagent"
  );
  const subagentEnvironmentLabel = (
    turn.environmentName
    || context.displayedEnvironmentLabel
    || "Environment"
  );
  const isSubagentRunning = isRunningTurnStatus(turn.status) && !completionLog;
  const completionOutput = sanitizeSubagentResponseMessage(
    typeof completionLog?.metadata?.output === "string" ? completionLog.metadata.output : "",
  );
  const completionFailed = (
    completionLog?.metadata?.status === "failed"
    || completionLog?.type === "error"
    || completionLog?.metadata?.exitCode === 1
  );
  const completionOutputFingerprint = normalizeSubagentSummaryText(completionOutput);
  const hasCompletionOutputLog = Boolean(
    completionOutputFingerprint
    && item.logs.some(
      (log) => normalizeSubagentSummaryText(log.message) === completionOutputFingerprint,
    )
  );
  const nestedLogs = completionOutput.trim() && !hasCompletionOutputLog
    ? [
        ...item.logs,
        {
          createdAt: completionLog?.createdAt || item.invocationLog.createdAt,
          time: completionLog?.time || latestNestedLog.time || item.invocationLog.time,
          message: completionOutput,
          type: completionFailed ? "error" : "success",
          eventType: "reasoning",
          isReasoning: true,
          metadata: {
            ...(completionLog?.metadata || {}),
            actor: completionLog?.metadata?.delegatedTo || completionLog?.metadata?.actor,
            parentToolUseId: invocationId,
            source: "subagent_run_summary",
            isReasoning: true,
          },
        } as RunnerLog,
      ]
    : item.logs;
  const previewMessage = completionOutput.trim() || (
    isSubagentRunning
      ? `${subagentTitle} is working`
      : completionFailed
        ? `${subagentTitle} failed`
        : `${subagentTitle} finished`
  );
  const nestedDurationLabel = completionLog && completionLog !== item.invocationLog
    ? getRunnerLogRangeDurationLabel(item.invocationLog, completionLog, turn.startedAtMs)
    : undefined;
  const nestedWorkLabel = isSubagentRunning
    ? "Working..."
    : `Worked for ${
        nestedDurationLabel
        || toRunnerLogDurationLabel(completionLog || latestNestedLog, turn.startedAtMs)
        || "0s"
      }`;

  return {
    invocationId,
    title: subagentTitle,
    prompt: invocation?.message || invocation?.description,
    environmentName: subagentEnvironmentLabel,
    running: isSubagentRunning,
    timeLabel: toRunnerLogDurationLabel(completionLog || latestNestedLog, turn.startedAtMs),
    responseMessage: completionOutput,
    responseFailed: completionFailed,
    previewMessage,
    workLabel: nestedWorkLabel,
    nestedItems: buildTimelineItems(nestedLogs),
  };
}

export function buildComputerUseGroupPresentation(
  turn: RunnerTurn,
  item: RunnerComputerUseGroup,
  context: RunnerLegacyTimelinePresentationContext = {},
): RunnerComputerUsePresentation {
  const environmentName = turn.environmentName || context.displayedEnvironmentLabel || "Environment";
  const interactionCount = item.logs.length;
  const running = (
    isRunningTurnStatus(turn.status)
    && item.endLog.metadata?.status !== "failed"
    && item.endLog.metadata?.status !== "completed"
  );

  return {
    kind: "computer_use",
    groupId: item.id,
    title: "Computer Use",
    environmentName,
    running,
    timeLabel: toRunnerLogDurationLabel(item.endLog || item.startLog, turn.startedAtMs),
    workLabel: `${interactionCount} ${interactionCount === 1 ? "interaction" : "interactions"}`,
    nestedItems: buildTimelineItems(item.sessionLogs, { groupComputerUse: false }),
  };
}

export function getBrowserTimelineGroupId(logs: RunnerLog[]): string {
  return logs.length > 0 ? "browser" : "browser-empty";
}

export function buildBrowserGroupPresentation(
  turn: RunnerTurn,
  logs: RunnerLog[],
  context: RunnerLegacyTimelinePresentationContext = {},
): RunnerComputerUsePresentation {
  const environmentName = turn.environmentName || context.displayedEnvironmentLabel || "Environment";
  const latestLog = logs[logs.length - 1] || null;
  const interactionCount = logs.length;
  const running = (
    isRunningTurnStatus(turn.status)
    && latestLog?.metadata?.status !== "failed"
    && latestLog?.metadata?.status !== "completed"
  );

  return {
    kind: "browser",
    groupId: getBrowserTimelineGroupId(logs),
    title: "Browser",
    environmentName,
    running,
    timeLabel: latestLog
      ? toRunnerLogDurationLabel(latestLog, turn.startedAtMs)
      : undefined,
    workLabel: `${interactionCount} ${interactionCount === 1 ? "interaction" : "interactions"}`,
    nestedItems: logs.map((log) => ({ kind: "log" as const, log })),
  };
}

export function timelineItemKey(
  turnId: string,
  index: number,
  item: RunnerTimelineItem,
): string {
  if (item.kind === "deep_research_group") {
    const anchorLog = item.logs[0] || item.runningCommandLog;
    return anchorLog
      ? `${turnId}-deep-research-${stepRowKey(turnId, index, anchorLog)}`
      : `${turnId}-deep-research-${index}`;
  }
  if (item.kind === "browser_group") {
    const anchorLog = item.logs[0] || item.logs[item.logs.length - 1];
    return anchorLog
      ? `${turnId}-browser-${stepRowKey(turnId, index, anchorLog)}`
      : `${turnId}-browser-${index}`;
  }
  if (item.kind === "computer_use_group") {
    const anchorLog = item.group.startLog || item.group.endLog;
    return anchorLog
      ? `${turnId}-computer-use-${item.group.id}-${stepRowKey(turnId, index, anchorLog)}`
      : `${turnId}-computer-use-${item.group.id}-${index}`;
  }
  if (item.kind === "subagent_group") {
    const invocationId = getSubagentInvocationMetadata(item.invocationLog)?.invocationId || index;
    return `${turnId}-subagent-${invocationId}-${item.logs.length}`;
  }
  return stepRowKey(turnId, index, item.log);
}
