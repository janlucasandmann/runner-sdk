import type { ReactNode } from "react";
import type {
  RunnerDeepResearchSession,
  RunnerLog,
} from "../../types.js";
import type { RunnerThreadAction } from "../../thread/types.js";
import {
  BrowserSkillLogBox,
  DeepResearchLogBox,
  RunnerWorkLogEntry,
  SubagentLogBox,
} from "../../platform-ui/components/thread-components/log-boxes/index.js";
import type {
  RunnerWorkLogEntryProps,
} from "../../platform-ui/components/thread-components/log-boxes/log-entry-types.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  type RunnerPreviewAttachment,
} from "../runner-document-preview.js";
import { adaptRunnerThreadActionToRunnerLog } from "../thread/activity-action-list.js";
import {
  resolveRunnerOriginalActionLog,
  type RunnerOriginalActionLogIndex,
} from "./canonical-action-log-index.js";
import {
  extractDeepResearchTopicFromGroup,
  resolveDeepResearchSessionForGroup,
} from "./deep-research-session.js";
import {
  toRunnerLogDurationLabel,
} from "./log-presentation.js";
import type {
  RunnerTimelineItem,
  RunnerTurnTimelineState,
} from "./legacy-timeline.js";
import {
  buildSubagentGroupPresentation,
  getBrowserTimelineGroupId,
  timelineItemKey,
} from "./legacy-timeline-presentation.js";
import { shouldDisplayTimelineLog } from "./hydration/log-normalization.js";
import type {
  RunnerChatOption,
  RunnerChatProjectOption,
} from "./agent-options.js";
import type {
  RunnerChatProps,
} from "./public-types.js";
import type { RunnerTurn } from "./turn-types.js";

type AgentPreview = Parameters<
  NonNullable<RunnerWorkLogEntryProps["onAgentPreviewClick"]>
>[0];
type EnvironmentPreview = Parameters<
  NonNullable<RunnerWorkLogEntryProps["onEnvironmentPreviewClick"]>
>[0];
type ProjectPreview = Parameters<
  NonNullable<RunnerWorkLogEntryProps["onProjectPreviewClick"]>
>[0];

export interface RunnerTimelineRenderContext {
  activeTaskPreviewId?: string | null;
  agents: RunnerChatOption[];
  availableEnvironments: RunnerChatOption[];
  availableProjects: RunnerChatProjectOption[];
  backendUrl: string;
  deepResearchSessions: RunnerDeepResearchSession[];
  displayedAgentLabel: string;
  displayedEnvironmentLabel: string;
  environmentId: string | null;
  environmentName: string;
  isBrowserDetailOpen: (turnId: string, groupId: string) => boolean;
  isComputerUseDetailOpen: (turnId: string, groupId: string) => boolean;
  isDeepResearchDetailOpen: (turnId: string) => boolean;
  isSubagentDetailOpen: (
    turnId: string,
    invocationId: string,
  ) => boolean;
  onAgentTurnClick?: RunnerChatProps["onAgentTurnClick"];
  onOpenBrowserDetails: (turnId: string, groupId: string) => void;
  onOpenComputerUseDetails: (turnId: string, groupId: string) => void;
  onOpenDeepResearchDetails: (turnId: string) => void;
  onOpenEnvironmentDesktop: (
    environmentId: string | null,
    environmentName: string,
  ) => void;
  onOpenSubagentDetails: (
    turnId: string,
    invocationId: string,
  ) => void;
  onOpenTaskList?: RunnerChatProps["onOpenTaskList"];
  onPermissionDecision: NonNullable<
    RunnerWorkLogEntryProps["onPermissionDecision"]
  >;
  onPreviewDocument: (attachment: RunnerPreviewAttachment) => void;
  onResourcePreviewClick?: RunnerChatProps["onResourcePreviewClick"];
  onTaskPreviewClick?: RunnerChatProps["onTaskPreviewClick"];
  onWorkspacePathClick: (turn: RunnerTurn, path: string) => void;
  requestHeaders?: HeadersInit;
}

interface RunnerTimelineItemOptions {
  renderBrowserSkillAsGeneric?: boolean;
  renderComputerUseMcpAsGeneric?: boolean;
}

function openAgentPreview(
  context: RunnerTimelineRenderContext,
  turnId: string,
  agent: AgentPreview,
) {
  context.onAgentTurnClick?.({
    turnId,
    agentId: agent.agentId || undefined,
    agentName: agent.agentName || undefined,
  });
}

function openEnvironmentPreview(
  context: RunnerTimelineRenderContext,
  environment: EnvironmentPreview,
) {
  const environmentId = String(environment.environmentId || "").trim();
  if (!environmentId) return;
  context.onResourcePreviewClick?.({
    id: environmentId,
    name:
      String(environment.environmentName || "Environment").trim()
      || "Environment",
    resourceType: "environment",
    description: null,
    model: null,
    category: null,
    projectId: null,
    projectName: null,
    isDefault: false,
    status: null,
  });
}

function openProjectPreview(
  context: RunnerTimelineRenderContext,
  project: ProjectPreview,
) {
  const projectId = String(project.projectId || "").trim();
  if (!projectId) return;
  context.onResourcePreviewClick?.({
    id: projectId,
    name:
      String(project.projectName || "Project").trim()
      || "Project",
    resourceType: "project",
    description: null,
    model: null,
    category: null,
    projectId,
    projectName: String(project.projectName || "").trim() || null,
    isDefault: false,
    status: null,
  });
}

export interface RunnerTimelineWorkLogEntryProps {
  activeTaskPreviewId?: string | null;
  context: RunnerTimelineRenderContext;
  log: RunnerLog;
  options?: RunnerTimelineItemOptions;
  requestHeadersOverride?: HeadersInit | null;
  timeLabel?: string;
  turnId: string;
  onWorkspacePathClick?: (path: string) => void;
}

export function RunnerTimelineWorkLogEntry({
  activeTaskPreviewId,
  context,
  log,
  onWorkspacePathClick,
  options,
  requestHeadersOverride,
  timeLabel,
  turnId,
}: RunnerTimelineWorkLogEntryProps) {
  return (
    <RunnerWorkLogEntry
      log={log}
      timeLabel={timeLabel}
      backendUrl={context.backendUrl}
      environmentId={context.environmentId}
      requestHeaders={
        requestHeadersOverride === undefined
          ? context.requestHeaders
          : requestHeadersOverride || undefined
      }
      renderComputerUseMcpAsGeneric={
        options?.renderComputerUseMcpAsGeneric
      }
      renderBrowserSkillAsGeneric={options?.renderBrowserSkillAsGeneric}
      activeTaskPreviewId={
        activeTaskPreviewId === undefined
          ? context.activeTaskPreviewId
          : activeTaskPreviewId
      }
      availableAgents={context.agents}
      availableEnvironments={context.availableEnvironments}
      availableProjects={context.availableProjects}
      onPreviewDocument={context.onPreviewDocument}
      onWorkspacePathClick={onWorkspacePathClick}
      onPermissionDecision={context.onPermissionDecision}
      onTaskPreviewClick={context.onTaskPreviewClick}
      onAgentPreviewClick={(agent) => {
        openAgentPreview(context, turnId, agent);
      }}
      onEnvironmentPreviewClick={(environment) => {
        openEnvironmentPreview(context, environment);
      }}
      onProjectPreviewClick={(project) => {
        openProjectPreview(context, project);
      }}
      onOpenTaskList={context.onOpenTaskList}
    />
  );
}

export function renderRunnerTimelineItem({
  context,
  index: _index,
  item,
  options,
  turn,
}: {
  context: RunnerTimelineRenderContext;
  index: number;
  item: RunnerTimelineItem;
  options?: RunnerTimelineItemOptions;
  turn: RunnerTurn;
}): ReactNode {
  if (item.kind === "browser_group") {
    const latestLog = item.logs[item.logs.length - 1];
    const browserGroupId = getBrowserTimelineGroupId(item.logs);
    return (
      <BrowserSkillLogBox
        log={latestLog}
        logs={item.logs}
        timeLabel={
          latestLog
            ? toRunnerLogDurationLabel(latestLog, turn.startedAtMs)
            : undefined
        }
        backendUrl={context.backendUrl}
        environmentId={context.environmentId}
        requestHeaders={context.requestHeaders}
        isDetailOpen={context.isBrowserDetailOpen(
          turn.id,
          browserGroupId,
        )}
        onOpenDetails={() => {
          context.onOpenBrowserDetails(turn.id, browserGroupId);
        }}
      />
    );
  }

  if (item.kind === "computer_use_group") {
    const latestLog =
      item.group.logs[item.group.logs.length - 1]
      || item.group.endLog;
    const environmentName =
      turn.environmentName
      || context.environmentName
      || context.displayedEnvironmentLabel
      || "Environment";
    return (
      <BrowserSkillLogBox
        log={latestLog}
        logs={item.group.logs}
        timeLabel={
          latestLog
            ? toRunnerLogDurationLabel(latestLog, turn.startedAtMs)
            : undefined
        }
        backendUrl={context.backendUrl}
        environmentId={context.environmentId}
        requestHeaders={context.requestHeaders}
        environmentName={environmentName}
        isDetailOpen={context.isComputerUseDetailOpen(
          turn.id,
          item.group.id,
        )}
        onOpenEnvironmentDesktop={() => {
          context.onOpenEnvironmentDesktop(
            context.environmentId,
            environmentName,
          );
        }}
        onOpenDetails={() => {
          context.onOpenComputerUseDetails(turn.id, item.group.id);
        }}
      />
    );
  }

  if (item.kind === "deep_research_group") {
    const firstLog = item.logs[0] || item.runningCommandLog;
    const session = resolveDeepResearchSessionForGroup({
      logs: item.logs,
      runningCommandLog: item.runningCommandLog,
      turn,
      sessions: context.deepResearchSessions,
    });
    return (
      <DeepResearchLogBox
        log={item.runningCommandLog}
        logs={item.logs}
        runningCommandLog={item.runningCommandLog}
        session={session}
        timeLabel={
          firstLog
            ? toRunnerLogDurationLabel(firstLog, turn.startedAtMs)
            : undefined
        }
        fallbackTopic={
          extractDeepResearchTopicFromGroup(
            item.logs,
            item.runningCommandLog,
          )
          || turn.prompt
          || null
        }
        isDetailOpen={context.isDeepResearchDetailOpen(turn.id)}
        onOpenDetails={() => {
          context.onOpenDeepResearchDetails(turn.id);
        }}
      />
    );
  }

  if (item.kind === "subagent_group") {
    const presentation = buildSubagentGroupPresentation(turn, item, {
      displayedAgentLabel: context.displayedAgentLabel,
      displayedEnvironmentLabel: context.displayedEnvironmentLabel,
    });
    return (
      <SubagentLogBox
        title={presentation.title}
        prompt={presentation.prompt}
        timeLabel={presentation.timeLabel}
        running={presentation.running}
        summaryMessage={presentation.previewMessage}
        isDetailOpen={context.isSubagentDetailOpen(
          turn.id,
          presentation.invocationId,
        )}
        onOpenDetails={() => {
          context.onOpenSubagentDetails(
            turn.id,
            presentation.invocationId,
          );
        }}
      />
    );
  }

  if (!shouldDisplayTimelineLog(item.log)) {
    return null;
  }
  return (
    <RunnerTimelineWorkLogEntry
      context={context}
      log={item.log}
      options={options}
      timeLabel={toRunnerLogDurationLabel(
        item.log,
        turn.startedAtMs,
      )}
      turnId={turn.id}
      onWorkspacePathClick={(path) => {
        context.onWorkspacePathClick(turn, path);
      }}
    />
  );
}

export function renderRunnerNestedTimelineItems({
  context,
  items,
  options,
  turn,
}: {
  context: RunnerTimelineRenderContext;
  items: RunnerTimelineItem[];
  options?: Pick<
    RunnerTimelineItemOptions,
    "renderBrowserSkillAsGeneric"
  >;
  turn: RunnerTurn;
}): ReactNode {
  return items.map((nestedItem, nestedIndex) => {
    const content = renderRunnerTimelineItem({
      context,
      index: nestedIndex,
      item: nestedItem,
      options: {
        renderComputerUseMcpAsGeneric: true,
        renderBrowserSkillAsGeneric:
          options?.renderBrowserSkillAsGeneric,
      },
      turn,
    });
    if (!content) return null;
    return (
      <div
        key={timelineItemKey(turn.id, nestedIndex, nestedItem)}
        className="agent-step-item"
      >
        <div className="agent-step-content">{content}</div>
      </div>
    );
  });
}

export function renderRunnerCanonicalThreadAction({
  action,
  context,
  getTurnTimelineState,
  originalLogIndex,
}: {
  action: RunnerThreadAction;
  context: RunnerTimelineRenderContext;
  getTurnTimelineState: (turn: RunnerTurn) => RunnerTurnTimelineState;
  originalLogIndex: RunnerOriginalActionLogIndex;
}): ReactNode {
  const original = resolveRunnerOriginalActionLog(
    action,
    originalLogIndex,
  );
  if (original) {
    const timelineState = getTurnTimelineState(original.turn);
    const itemIndex = timelineState.displayedTimelineItems.findIndex(
      (item) => {
        if (item.kind === "log") return item.log === original.log;
        if (item.kind === "browser_group") {
          return item.logs.includes(original.log);
        }
        if (item.kind === "deep_research_group") {
          return (
            item.runningCommandLog === original.log
            || item.logs.includes(original.log)
          );
        }
        if (item.kind === "computer_use_group") {
          return (
            item.group.logs.includes(original.log)
            || item.group.sessionLogs.includes(original.log)
          );
        }
        return (
          item.invocationLog === original.log
          || item.completionLog === original.log
          || item.logs.includes(original.log)
        );
      },
    );
    if (itemIndex >= 0) {
      const item = timelineState.displayedTimelineItems[itemIndex];
      const isGroupedAnchor =
        item.kind === "log"
        || (
          item.kind === "browser_group"
          && item.logs[0] === original.log
        )
        || (
          item.kind === "deep_research_group"
          && (item.logs[0] || item.runningCommandLog) === original.log
        )
        || (
          item.kind === "computer_use_group"
          && item.group.startLog === original.log
        )
        || (
          item.kind === "subagent_group"
          && item.invocationLog === original.log
        );
      if (!isGroupedAnchor) return null;
      return renderRunnerTimelineItem({
        context,
        index: itemIndex,
        item,
        turn: original.turn,
      });
    }
  }

  const log = original?.log || adaptRunnerThreadActionToRunnerLog(action);
  return (
    <RunnerTimelineWorkLogEntry
      context={context}
      log={log}
      turnId={action.runId}
      onWorkspacePathClick={(path) => {
        const normalizedPath = String(path || "").trim();
        if (!normalizedPath) return;
        context.onPreviewDocument({
          ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
            backendUrl: context.backendUrl,
            environmentId: context.environmentId,
            idPrefix: "thread-action-path",
          }),
          workspacePath: normalizedPath,
        });
      }}
    />
  );
}
