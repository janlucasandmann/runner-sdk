import type { RunnerLog } from "../../types.js";
import type { RunnerTurn } from "./turn-types.js";
import {
  getRunnerLogSubagentInvocationIdentity,
} from "./hydration/log-normalization.js";
import {
  isBrowserSkillCommand,
  isBrowserSkillLaunchCommand,
  isComputerUseMcpLog,
  isDeepResearchCommand,
} from "../../platform-ui/components/thread-components/log-boxes/index.js";
import { stripRunnerSystemTags } from "../runner-markdown.js";

export type RunnerSubagentGroup = {
  invocationLog: RunnerLog;
  logs: RunnerLog[];
  completionLog?: RunnerLog;
};

export type RunnerComputerUseGroup = {
  id: string;
  startLog: RunnerLog;
  endLog: RunnerLog;
  logs: RunnerLog[];
  sessionLogs: RunnerLog[];
};

export type RunnerTimelineItem =
  | { kind: "log"; log: RunnerLog }
  | { kind: "deep_research_group"; logs: RunnerLog[]; runningCommandLog?: RunnerLog }
  | { kind: "browser_group"; logs: RunnerLog[] }
  | { kind: "computer_use_group"; group: RunnerComputerUseGroup }
  | { kind: "subagent_group"; invocationLog: RunnerLog; logs: RunnerLog[]; completionLog?: RunnerLog };

export type RunnerTurnTimelineState = {
  agentMessage?: RunnerLog;
  displayedTimelineItems: RunnerTimelineItem[];
};

export function stepRowKey(turnId: string, index: number, log: RunnerLog): string {
  return `${turnId}-${index}-${log.eventType || "log"}-${(log.message || "").slice(0, 24)}`;
}

export function isBrowserTimelineLog(log: RunnerLog): boolean {
  if (log.eventType !== "command_execution") return false;
  const command = log.metadata?.command || log.message || "";
  return isBrowserSkillCommand(command) && !isBrowserSkillLaunchCommand(command);
}

export function isComputerUseTimelineLog(log: RunnerLog): boolean {
  return isComputerUseMcpLog(log);
}

export function isTimelineTerminalLog(log: RunnerLog): boolean {
  return (
    log.eventType === "agent_message"
    || log.eventType === "llm_response"
    || log.eventType === "turn_completed"
  );
}

export function isMetronomeWorkflowRunnerLog(log: RunnerLog): boolean {
  return log.eventType === "metronome_workflow" || Boolean(log.metadata?.metronomeWorkflow);
}

export function isMetronomeWorkflowPromptReplacementLog(log: RunnerLog): boolean {
  if (!isMetronomeWorkflowRunnerLog(log)) {
    return false;
  }
  const workflow = log.metadata?.metronomeWorkflow && typeof log.metadata.metronomeWorkflow === "object"
    ? log.metadata.metronomeWorkflow as Record<string, unknown>
    : null;
  if (!workflow) {
    return false;
  }
  if (workflow.displayAsPrompt === true) {
    return true;
  }
  const status = String(workflow.status || log.metadata?.status || "").trim().toLowerCase();
  const triggerCommand = String(workflow.triggerCommand || "").trim();
  const triggerEventId = String(workflow.triggerEventId || "").trim();
  const definitionSource = String(workflow.definitionSource || "").trim();
  return status === "running" && !triggerCommand && !triggerEventId && !definitionSource;
}

export function getTurnMetronomeWorkflowPromptLog(turn: RunnerTurn): RunnerLog | null {
  const workflowLogs = turn.logs.filter(isMetronomeWorkflowPromptReplacementLog);
  if (workflowLogs.length === 0) {
    return null;
  }
  return workflowLogs[0] || null;
}

export function getSubagentInvocationMetadata(log: RunnerLog) {
  return log.metadata?.subagentInvocation || null;
}

export function getSubagentInvocationId(log: RunnerLog): string | null {
  return getRunnerLogSubagentInvocationIdentity(log) || null;
}

export function isSubagentInvocationLog(log: RunnerLog): boolean {
  return log.eventType === "subagent_invocation" && Boolean(getSubagentInvocationMetadata(log));
}

export function logBelongsToSubagentInvocation(log: RunnerLog, invocationId: string): boolean {
  return getSubagentInvocationId(log) === invocationId;
}

export function sanitizeSubagentResponseMessage(message: string | null | undefined): string {
  return stripRunnerSystemTags(String(message || ""))
    .replace(/^\s*agentId:\s.*$/gim, "")
    .replace(/<usage>[\s\S]*?<\/usage>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeSubagentSummaryText(message: string | null | undefined): string {
  return stripRunnerSystemTags(String(message || ""))
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[*_`#>\-\s]+/g, "")
    .toLowerCase();
}

export function buildSubagentTimelineGroups(logs: RunnerLog[]) {
  const groups = new Map<string, RunnerSubagentGroup>();
  const anchoredInvocationIds = new Set<string>();

  for (const log of logs) {
    if (!isSubagentInvocationLog(log)) {
      continue;
    }
    const invocationId = getSubagentInvocationId(log);
    if (invocationId) {
      anchoredInvocationIds.add(invocationId);
    }
  }

  for (const log of logs) {
    const invocationId = getSubagentInvocationId(log);
    if (!invocationId || !anchoredInvocationIds.has(invocationId)) {
      continue;
    }

    const existing = groups.get(invocationId);
    const invocationMetadata = getSubagentInvocationMetadata(log);
    const invocationStatus = invocationMetadata?.status || log.metadata?.status;
    const isCompletionLog = isSubagentInvocationLog(log) && invocationStatus && invocationStatus !== "started";

    if (!existing) {
      groups.set(invocationId, {
        invocationLog: log,
        logs: [],
        completionLog: isCompletionLog ? log : undefined,
      });
      continue;
    }

    if (
      isSubagentInvocationLog(log)
      && (!isSubagentInvocationLog(existing.invocationLog) || invocationStatus === "started")
    ) {
      existing.invocationLog = log;
    }
    if (isCompletionLog) {
      existing.completionLog = log;
    }
    existing.logs.push(log);
  }

  for (const group of groups.values()) {
    const completionLog = group.completionLog && group.completionLog !== group.invocationLog
      ? group.completionLog
      : undefined;
    group.completionLog = completionLog;
    group.logs = group.logs.filter((log) => {
      if (log === group.invocationLog) {
        return false;
      }
      if (completionLog && log === completionLog) {
        return false;
      }
      return !isSubagentInvocationLog(log);
    });
  }

  return groups;
}

function collectBrowserTimelineLogs(
  logs: RunnerLog[],
  subagentGroups: Map<string, RunnerSubagentGroup>,
): RunnerLog[] {
  const browserLogs: RunnerLog[] = [];

  for (const currentLog of logs) {
    const invocationId = getSubagentInvocationId(currentLog);
    if (invocationId && subagentGroups.has(invocationId)) {
      continue;
    }
    if (isBrowserTimelineLog(currentLog)) {
      browserLogs.push(currentLog);
    }
  }

  return browserLogs;
}

function collectComputerUseTimelineLogs(
  logs: RunnerLog[],
  subagentGroups: Map<string, RunnerSubagentGroup>,
): RunnerLog[] {
  const computerUseLogs: RunnerLog[] = [];

  for (const currentLog of logs) {
    const invocationId = getSubagentInvocationId(currentLog);
    if (invocationId && subagentGroups.has(invocationId)) {
      continue;
    }
    if (isComputerUseTimelineLog(currentLog)) {
      computerUseLogs.push(currentLog);
    }
  }

  return computerUseLogs;
}

function buildComputerUseTimelineGroups(
  logs: RunnerLog[],
  subagentGroups: Map<string, RunnerSubagentGroup>,
) {
  const groups: RunnerComputerUseGroup[] = [];
  let activeGroup: RunnerComputerUseGroup | null = null;

  function closeActiveGroup() {
    if (!activeGroup) {
      return;
    }
    groups.push(activeGroup);
    activeGroup = null;
  }

  for (let index = 0; index < logs.length; index += 1) {
    const currentLog = logs[index];
    const invocationId = getSubagentInvocationId(currentLog);
    const belongsToSubagent = Boolean(invocationId && subagentGroups.has(invocationId));
    const isDeepResearchLog = (
      !belongsToSubagent
      && (currentLog.eventType === "deep_research" || isDeepResearchTimelineCommand(currentLog))
    );
    const isBrowserLog = !belongsToSubagent && isBrowserTimelineLog(currentLog);

    if (belongsToSubagent || isDeepResearchLog || isBrowserLog || isTimelineTerminalLog(currentLog)) {
      closeActiveGroup();
      continue;
    }

    if (isComputerUseTimelineLog(currentLog)) {
      if (!activeGroup) {
        activeGroup = {
          id: `computer-use-${index}-${currentLog.time || "00:00"}`,
          startLog: currentLog,
          endLog: currentLog,
          logs: [currentLog],
          sessionLogs: [currentLog],
        };
      } else {
        activeGroup.logs.push(currentLog);
        activeGroup.sessionLogs.push(currentLog);
        activeGroup.endLog = currentLog;
      }
      continue;
    }

    if (activeGroup) {
      activeGroup.sessionLogs.push(currentLog);
    }
  }

  closeActiveGroup();
  return groups;
}

export function isDeepResearchTimelineCommand(log: RunnerLog): boolean {
  return (
    log.eventType === "command_execution"
    && isDeepResearchCommand(log.metadata?.command || log.message || "")
  );
}

function collectDeepResearchTimelineLogs(
  logs: RunnerLog[],
  subagentGroups: Map<string, RunnerSubagentGroup>,
): RunnerLog[] {
  const deepResearchLogs: RunnerLog[] = [];

  for (const currentLog of logs) {
    const invocationId = getSubagentInvocationId(currentLog);
    if (invocationId && subagentGroups.has(invocationId)) {
      continue;
    }
    if (currentLog.eventType === "deep_research") {
      deepResearchLogs.push(currentLog);
    }
  }

  return deepResearchLogs;
}

export function buildTimelineItems(
  logs: RunnerLog[],
  options?: { groupComputerUse?: boolean },
): RunnerTimelineItem[] {
  const subagentGroups = buildSubagentTimelineGroups(logs);
  const latestPermissionLogIndexById = new Map<string, number>();
  const latestPermissionLogById = new Map<string, RunnerLog>();
  logs.forEach((log, index) => {
    if (log.eventType !== "permission_request") return;
    const requestId = String(log.metadata?.permissionRequestId || "").trim();
    if (!requestId) return;
    latestPermissionLogIndexById.set(requestId, index);
    const previousLog = latestPermissionLogById.get(requestId);
    latestPermissionLogById.set(
      requestId,
      previousLog
        ? {
            ...log,
            metadata: {
              ...(previousLog.metadata || {}),
              ...(log.metadata || {}),
            },
          }
        : log,
    );
  });
  const deepResearchLogs = collectDeepResearchTimelineLogs(logs, subagentGroups);
  const deepResearchCommandLog = logs.find((currentLog) => {
    const invocationId = getSubagentInvocationId(currentLog);
    if (invocationId && subagentGroups.has(invocationId)) {
      return false;
    }
    return isDeepResearchTimelineCommand(currentLog);
  });
  const browserLogs = collectBrowserTimelineLogs(logs, subagentGroups);
  const groupComputerUse = options?.groupComputerUse !== false;
  const computerUseLogs = collectComputerUseTimelineLogs(logs, subagentGroups);
  const computerUseGroups = groupComputerUse
    ? buildComputerUseTimelineGroups(logs, subagentGroups)
    : [];
  const computerUseGroupsByStartLog = new Map<RunnerLog, RunnerComputerUseGroup>();
  const computerUseSessionLogs = new Set<RunnerLog>();
  for (const group of computerUseGroups) {
    computerUseGroupsByStartLog.set(group.startLog, group);
    for (const sessionLog of group.sessionLogs) {
      computerUseSessionLogs.add(sessionLog);
    }
  }
  const items: RunnerTimelineItem[] = [];
  const shouldShowDeepResearchGroup = deepResearchLogs.length > 0 || Boolean(deepResearchCommandLog);
  let deepResearchGroupInserted = false;
  let browserGroupInserted = false;
  const insertedComputerUseGroupIds = new Set<string>();
  const insertedSubagentInvocations = new Set<string>();

  for (let index = 0; index < logs.length; index += 1) {
    const log = logs[index];
    if (log.eventType === "permission_request") {
      const requestId = String(log.metadata?.permissionRequestId || "").trim();
      if (requestId && latestPermissionLogIndexById.get(requestId) !== index) {
        continue;
      }
      items.push({
        kind: "log",
        log: requestId ? latestPermissionLogById.get(requestId) || log : log,
      });
      continue;
    }
    const invocationId = getSubagentInvocationId(log);
    if (invocationId) {
      const group = subagentGroups.get(invocationId);
      if (group) {
        if (!insertedSubagentInvocations.has(invocationId) && log === group.invocationLog) {
          items.push({
            kind: "subagent_group",
            invocationLog: group.invocationLog,
            logs: group.logs,
            completionLog: group.completionLog,
          });
          insertedSubagentInvocations.add(invocationId);
        }
        continue;
      }
    }
    if (
      groupComputerUse
      && computerUseSessionLogs.has(log)
      && !computerUseGroupsByStartLog.has(log)
    ) {
      continue;
    }
    if (log.eventType === "deep_research") {
      if (!deepResearchGroupInserted && shouldShowDeepResearchGroup) {
        items.push({
          kind: "deep_research_group",
          logs: deepResearchLogs,
          runningCommandLog: deepResearchCommandLog,
        });
        deepResearchGroupInserted = true;
      }
      continue;
    }
    if (isDeepResearchTimelineCommand(log)) {
      if (!deepResearchGroupInserted && shouldShowDeepResearchGroup) {
        items.push({
          kind: "deep_research_group",
          logs: deepResearchLogs,
          runningCommandLog: deepResearchCommandLog || log,
        });
        deepResearchGroupInserted = true;
      }
      continue;
    }
    if (isBrowserTimelineLog(log)) {
      if (!browserGroupInserted) {
        items.push({ kind: "browser_group", logs: browserLogs });
        browserGroupInserted = true;
      }
      continue;
    }
    if (isComputerUseTimelineLog(log)) {
      if (!groupComputerUse) {
        items.push({ kind: "log", log });
        continue;
      }
      const group = computerUseGroupsByStartLog.get(log);
      if (group && !insertedComputerUseGroupIds.has(group.id)) {
        items.push({ kind: "computer_use_group", group });
        insertedComputerUseGroupIds.add(group.id);
      }
      continue;
    }
    items.push({ kind: "log", log });
  }

  if (!deepResearchGroupInserted && shouldShowDeepResearchGroup) {
    items.push({
      kind: "deep_research_group",
      logs: deepResearchLogs,
      runningCommandLog: deepResearchCommandLog,
    });
  }

  if (!browserGroupInserted && browserLogs.length > 0) {
    items.push({ kind: "browser_group", logs: browserLogs });
  }

  if (groupComputerUse && computerUseLogs.length > 0) {
    for (const group of computerUseGroups) {
      if (!insertedComputerUseGroupIds.has(group.id) && group.logs.length > 0) {
        items.push({ kind: "computer_use_group", group });
      }
    }
  }

  return items;
}
