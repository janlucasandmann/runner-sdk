import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Bookmark,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUp,
  Cpu,
  Equal,
  HardDrive,
  ListTodo,
  MessageSquare,
  Rocket,
  Terminal,
} from "lucide-react";
import type { RunnerLog } from "../../../../types.js";
import { extractQuotedArgument, formatShellCommandForDisplay } from "./command-parsing.js";
import { CompactActionLogLine } from "./compact-action-log-line.js";
import { parseStructuredCommandExecutionOutput } from "./structured-command-output.js";
import { stripRunnerSystemTags } from "../../../../react/runner-markdown.js";
import type { RunnerWorkLogEntryProps } from "./log-entry-types.js";

const RUNNER_TRANSPARENT_LOGO_URL = "https://computer-agents.com/img/logos/runnertransparent.png";

type RunnerTaskManagementCreatedTaskPreview = {
  id: string;
  title: string;
  projectId?: string | null;
  projectName?: string | null;
  ticketNumber?: string | null;
  status?: string | null;
  priority?: string | null;
  taskType?: string | null;
  assigneeAgentId?: string | null;
  assigneeName?: string | null;
  taskColor?: string | null;
};

type RunnerTaskManagementCommentPreview = {
  id: string;
  body: string;
  authorName?: string | null;
  createdAt?: string | null;
  taskId?: string | null;
  taskTitle?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  ticketNumber?: string | null;
  status?: string | null;
  priority?: string | null;
  taskType?: string | null;
};

type RunnerComputerAgentsThreadSnapshotKind = "messages" | "logs";

type RunnerComputerAgentsThreadSnapshotItem = {
  id: string;
  role?: string | null;
  label: string;
  content: string;
  createdAt?: string | null;
  eventType?: string | null;
  tone?: "user" | "assistant" | "reasoning" | "command" | "error" | "log";
};

type RunnerComputerAgentsThreadSnapshotDetails = {
  kind: RunnerComputerAgentsThreadSnapshotKind;
  threadId: string;
  entries: RunnerComputerAgentsThreadSnapshotItem[];
  hasMore?: boolean | null;
};

export type RunnerCreatedResourceType = "agent" | "skill" | "environment" | "project" | "release";

export type RunnerCreatedResourcePreview = {
  id: string;
  name: string;
  resourceType: RunnerCreatedResourceType;
  mutationVerb?: "created" | "updated" | null;
  description?: string | null;
  model?: string | null;
  category?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  isDefault?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  status?: string | null;
  taskCount?: number | null;
  openTaskCount?: number | null;
};

const RUNNER_PLAYGROUND_HUMAN_ME_ID = "__runner_playground_human_me__";
const runnerTaskManagementPreviewCache = new Map<string, RunnerTaskManagementCreatedTaskPreview>();
const runnerTaskManagementProjectTicketMapCache = new Map<string, Record<string, string>>();

function asOptionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function asObjectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function normalizeTaskManagementPreviewStatus(value: string | null | undefined): "todo" | "in_progress" | "blocked" | "done" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "in_progress" || normalized === "blocked" || normalized === "done") {
    return normalized;
  }
  if (normalized === "backlog" || normalized === "todo") {
    return "todo";
  }
  return "todo";
}

function normalizeTaskManagementPreviewPriority(value: string | null | undefined): "low" | "medium" | "high" | "critical" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high" || normalized === "critical") {
    return normalized;
  }
  return "medium";
}

function normalizeTaskManagementPreviewType(value: string | null | undefined): "task" | "subtask" {
  return String(value || "").trim().toLowerCase() === "subtask" ? "subtask" : "task";
}

function normalizeTaskManagementPreviewTicketNumber(value: string | null | undefined): string | null {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  const digits = Array.from(normalized).filter((character) => character >= "0" && character <= "9").join("");
  const parsed = Number.parseInt(digits || normalized, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return String(parsed).padStart(3, "0");
}

function isTaskManagementHumanAssigneeId(value: string | null | undefined): boolean {
  return String(value || "").trim() === RUNNER_PLAYGROUND_HUMAN_ME_ID;
}

function normalizeTaskManagementPreviewColor(value: string | null | undefined): "gray" | "blue" | "green" | "amber" | "rose" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "gray" || normalized === "green" || normalized === "amber" || normalized === "rose") {
    return normalized;
  }
  return normalized === "blue" ? "blue" : "gray";
}

function getTaskManagementPreviewColorStyle(value: string | null | undefined): CSSProperties {
  const normalized = normalizeTaskManagementPreviewColor(value);
  const presentation = normalized === "gray"
    ? {
        accent: "rgba(255, 255, 255, 0.92)",
        surface: "rgba(255, 255, 255, 0.05)",
        surfaceHover: "rgba(255, 255, 255, 0.07)",
        border: "rgba(255, 255, 255, 0.08)",
      }
    : normalized === "green"
      ? {
          accent: "#2ca36b",
          surface: "rgba(44, 163, 107, 0.12)",
          surfaceHover: "rgba(44, 163, 107, 0.16)",
          border: "rgba(44, 163, 107, 0.2)",
        }
      : normalized === "amber"
        ? {
            accent: "#c98a1f",
            surface: "rgba(201, 138, 31, 0.12)",
            surfaceHover: "rgba(201, 138, 31, 0.16)",
            border: "rgba(201, 138, 31, 0.2)",
          }
        : normalized === "rose"
          ? {
              accent: "#c45b87",
              surface: "rgba(196, 91, 135, 0.12)",
              surfaceHover: "rgba(196, 91, 135, 0.16)",
              border: "rgba(196, 91, 135, 0.2)",
            }
          : {
              accent: "#016bcb",
              surface: "rgba(1, 107, 203, 0.12)",
              surfaceHover: "rgba(1, 107, 203, 0.16)",
              border: "rgba(1, 107, 203, 0.2)",
            };
  return {
    "--tb-log-task-preview-accent": presentation.accent,
    "--tb-log-task-preview-surface": presentation.surface,
    "--tb-log-task-preview-surface-hover": presentation.surfaceHover,
    "--tb-log-task-preview-border": presentation.border,
  } as CSSProperties;
}

function getTaskManagementPreviewStatusLabel(value: string | null | undefined): string {
  const normalized = normalizeTaskManagementPreviewStatus(value);
  if (normalized === "in_progress") return "In doing";
  if (normalized === "blocked") return "Blocked";
  if (normalized === "done") return "Done";
  return "To do";
}

function renderTaskManagementPreviewPriorityIcon(priority: string | null | undefined, className: string) {
  const normalized = normalizeTaskManagementPreviewPriority(priority);
  if (normalized === "low") {
    return <ChevronDown className={`${className} is-low`} strokeWidth={2} />;
  }
  if (normalized === "high") {
    return <ChevronUp className={`${className} is-high`} strokeWidth={2} />;
  }
  if (normalized === "critical") {
    return <ChevronsUp className={`${className} is-critical`} strokeWidth={2} />;
  }
  return <Equal className={`${className} is-medium`} strokeWidth={2} />;
}

function splitTaskManagementTitleAndTicket(rawTitle: string): { title: string; ticketNumber?: string } {
  const trimmedTitle = rawTitle.trim();
  const prefixedTicketMatch = trimmedTitle.match(/^((?:[A-Z]+-\d+)|(?:\d{2,4}))(?:(?:\s*[·\-:]\s*)|\s+)(.+)$/);
  if (prefixedTicketMatch?.[1] && prefixedTicketMatch[2]) {
    return {
      ticketNumber: prefixedTicketMatch[1].trim(),
      title: prefixedTicketMatch[2].trim() || trimmedTitle,
    };
  }
  return { title: trimmedTitle };
}

function dedupeTaskManagementCreatePreviews(previews: RunnerTaskManagementCreatedTaskPreview[]): RunnerTaskManagementCreatedTaskPreview[] {
  function mergePreview(base: RunnerTaskManagementCreatedTaskPreview, incoming: RunnerTaskManagementCreatedTaskPreview): RunnerTaskManagementCreatedTaskPreview {
    const incomingStatus = normalizeTaskManagementPreviewStatus(incoming.status);
    const baseStatus = normalizeTaskManagementPreviewStatus(base.status);
    const incomingPriority = normalizeTaskManagementPreviewPriority(incoming.priority);
    const basePriority = normalizeTaskManagementPreviewPriority(base.priority);
    const incomingTaskType = normalizeTaskManagementPreviewType(incoming.taskType);
    const baseTaskType = normalizeTaskManagementPreviewType(base.taskType);
    const normalizedIncomingTicketNumber = normalizeTaskManagementPreviewTicketNumber(incoming.ticketNumber);
    const normalizedBaseTicketNumber = normalizeTaskManagementPreviewTicketNumber(base.ticketNumber);
    const incomingId = String(incoming.id || "").trim();
    const baseId = String(base.id || "").trim();
    const resolvedId =
      incomingId.startsWith("task_")
        ? incomingId
        : baseId.startsWith("task_")
          ? baseId
          : incomingId || baseId;

    return {
      ...base,
      ...incoming,
      id: resolvedId || base.id || incoming.id,
      title: String(incoming.title || "").trim() || base.title,
      projectId: incoming.projectId || base.projectId || null,
      projectName: incoming.projectName || base.projectName || null,
      ticketNumber: normalizedIncomingTicketNumber || normalizedBaseTicketNumber || null,
      status:
        incomingStatus !== "todo" || !base.status
          ? incomingStatus
          : baseStatus,
      priority:
        incomingPriority !== "medium" || !base.priority
          ? incomingPriority
          : basePriority,
      taskType:
        incomingTaskType === "subtask" || !base.taskType
          ? incomingTaskType
          : baseTaskType,
      assigneeAgentId: incoming.assigneeAgentId || base.assigneeAgentId || null,
      assigneeName: incoming.assigneeName || base.assigneeName || null,
      taskColor: incoming.taskColor || base.taskColor || null,
    };
  }

  const deduped: RunnerTaskManagementCreatedTaskPreview[] = [];
  for (const preview of previews) {
    const normalizedTitle = String(preview.title || "").trim().toLowerCase();
    if (!normalizedTitle && !String(preview.id || "").trim()) {
      continue;
    }
    const existingIndex = deduped.findIndex((candidate) => {
      const candidateId = String(candidate.id || "").trim();
      const previewId = String(preview.id || "").trim();
      const candidateTitle = String(candidate.title || "").trim().toLowerCase();
      return (
        (candidateId && previewId && candidateId === previewId)
        || (normalizedTitle && candidateTitle === normalizedTitle)
      );
    });
    if (existingIndex === -1) {
      deduped.push(preview);
      continue;
    }
    deduped[existingIndex] = mergePreview(deduped[existingIndex], preview);
  }
  return deduped;
}

function compareTaskManagementPreviewTicketOrder(left: Record<string, unknown>, right: Record<string, unknown>): number {
  const leftCreatedAt = Date.parse(String(left?.createdAt || "")) || 0;
  const rightCreatedAt = Date.parse(String(right?.createdAt || "")) || 0;
  if (leftCreatedAt !== rightCreatedAt) {
    return leftCreatedAt - rightCreatedAt;
  }
  const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : (Number.isFinite(Number(left?.sortOrder)) ? Number(left?.sortOrder) : 0);
  const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : (Number.isFinite(Number(right?.sortOrder)) ? Number(right?.sortOrder) : 0);
  if (leftSortOrder !== rightSortOrder) {
    return leftSortOrder - rightSortOrder;
  }
  return String(left?.id || "").localeCompare(String(right?.id || ""));
}

function buildTaskManagementTicketMapFromTaskListPayload(data: unknown): Record<string, string> {
  const payload = asObjectRecord(data);
  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.tasks)
      ? payload.tasks
      : Array.isArray(payload?.items)
        ? payload.items
        : [];
  const orderedTasks = items
    .map((item) => asObjectRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item?.id))
    .slice()
    .sort(compareTaskManagementPreviewTicketOrder);
  const next: Record<string, string> = {};
  let explicitCount = 0;
  let highestTicketNumber = 0;

  orderedTasks.forEach((task) => {
    const metadata = asObjectRecord(task.metadata);
    const runnerPlayground = asObjectRecord(metadata?.runnerPlayground);
    const ticketNumber = normalizeTaskManagementPreviewTicketNumber(
      asOptionalTrimmedString(task.ticketNumber)
      || asOptionalTrimmedString(runnerPlayground?.ticketNumber)
      || null
    );
    if (!ticketNumber) {
      return;
    }
    next[String(task.id)] = ticketNumber;
    explicitCount += 1;
    highestTicketNumber = Math.max(highestTicketNumber, Number.parseInt(ticketNumber, 10));
  });

  let nextTicketNumber = explicitCount === 0 ? 0 : highestTicketNumber;
  orderedTasks.forEach((task) => {
    const taskId = String(task.id || "").trim();
    if (!taskId || next[taskId]) {
      return;
    }
    nextTicketNumber += 1;
    next[taskId] = String(nextTicketNumber).padStart(3, "0");
  });

  return next;
}

function normalizeTaskManagementCreatePreview(value: unknown): RunnerTaskManagementCreatedTaskPreview | null {
  const record = asObjectRecord(value);
  if (!record) return null;

  const metadata = asObjectRecord(record.metadata);
  const runnerPlayground = asObjectRecord(metadata?.runnerPlayground);
  const assigneeRecord = asObjectRecord(record.assignee) || asObjectRecord(record.assigneeAgent);

  const id =
    asOptionalTrimmedString(record.id)
    || asOptionalTrimmedString(record.taskId)
    || asOptionalTrimmedString(record.task_id)
    || "";
  const rawTitle =
    asOptionalTrimmedString(record.title)
    || asOptionalTrimmedString(record.name)
    || asOptionalTrimmedString(record.taskTitle)
    || "";
  const titleParts = rawTitle ? splitTaskManagementTitleAndTicket(rawTitle) : { title: rawTitle };
  const ticketNumber = normalizeTaskManagementPreviewTicketNumber(
    asOptionalTrimmedString(record.ticketNumber)
    || asOptionalTrimmedString(record.ticket_number)
    || asOptionalTrimmedString(record.ticket)
    || asOptionalTrimmedString(runnerPlayground?.ticketNumber)
    || titleParts.ticketNumber
    || null
  );
  const explicitTaskType =
    asOptionalTrimmedString(record.taskType)
    || asOptionalTrimmedString(record.task_type)
    || (asOptionalTrimmedString(record.type) && ["task", "subtask"].includes(String(record.type).trim().toLowerCase()) ? asOptionalTrimmedString(record.type) : undefined)
    || asOptionalTrimmedString(runnerPlayground?.taskType)
    || null;
  const assigneeAgentId =
    asOptionalTrimmedString(record.assigneeAgentId)
    || asOptionalTrimmedString(record.assignee_agent_id)
    || asOptionalTrimmedString(record.assigneeId)
    || asOptionalTrimmedString(record.assignee_id)
    || asOptionalTrimmedString(runnerPlayground?.assigneeActorId)
    || asOptionalTrimmedString(assigneeRecord?.id)
    || null;
  const assigneeName =
    asOptionalTrimmedString(record.assigneeName)
    || asOptionalTrimmedString(record.assignee_name)
    || asOptionalTrimmedString(record.assigneeAgentName)
    || asOptionalTrimmedString(record.assigneeActorName)
    || asOptionalTrimmedString(record.assignedToName)
    || asOptionalTrimmedString(assigneeRecord?.name)
    || asOptionalTrimmedString(assigneeRecord?.displayName)
    || (isTaskManagementHumanAssigneeId(assigneeAgentId) ? "Me" : null)
    || null;
  const taskColor =
    asOptionalTrimmedString(record.taskColor)
    || asOptionalTrimmedString(record.task_color)
    || asOptionalTrimmedString(record.color)
    || asOptionalTrimmedString(runnerPlayground?.taskColor)
    || null;
  const projectId =
    asOptionalTrimmedString(record.projectId)
    || asOptionalTrimmedString(record.project_id)
    || asOptionalTrimmedString(metadata?.projectId)
    || asOptionalTrimmedString(metadata?.project_id)
    || null;
  const projectName =
    asOptionalTrimmedString(record.projectName)
    || asOptionalTrimmedString(record.project_name)
    || null;
  const normalizedTitle = titleParts.title || id;
  const normalizedTaskType = explicitTaskType ? normalizeTaskManagementPreviewType(explicitTaskType) : null;
  const normalizedParentTaskId =
    asOptionalTrimmedString(record.parentTaskId)
    || asOptionalTrimmedString(record.parent_task_id)
    || asOptionalTrimmedString(runnerPlayground?.parentTaskId)
    || null;
  const normalizedDependencyIds =
    Array.isArray(record.dependencyIds)
      ? record.dependencyIds
      : Array.isArray(runnerPlayground?.dependencyIds)
        ? runnerPlayground.dependencyIds
        : [];
  const rawStatus =
    asOptionalTrimmedString(record.status)
    || asOptionalTrimmedString(runnerPlayground?.status)
    || null;
  const normalizedStatus =
    normalizedDependencyIds.length > 0 && normalizeTaskManagementPreviewStatus(rawStatus) !== "done"
      ? "blocked"
      : normalizeTaskManagementPreviewStatus(rawStatus);
  const normalizedPriority = normalizeTaskManagementPreviewPriority(
    asOptionalTrimmedString(record.priority)
    || asOptionalTrimmedString(runnerPlayground?.priority)
    || null
  );
  const hasExplicitTaskIdentifier =
    id.startsWith("task_")
    || Object.prototype.hasOwnProperty.call(record, "taskId")
    || Object.prototype.hasOwnProperty.call(record, "task_id");
  const runnerPlaygroundHasTaskSignals =
    runnerPlayground !== null
    && (
      Boolean(asOptionalTrimmedString(runnerPlayground.ticketNumber))
      || Boolean(asOptionalTrimmedString(runnerPlayground.taskType))
      || Boolean(asOptionalTrimmedString(runnerPlayground.taskColor))
      || Boolean(asOptionalTrimmedString(runnerPlayground.assigneeActorId))
      || Array.isArray(runnerPlayground.dependencyIds)
      || Array.isArray(runnerPlayground.linkedThreadIds)
    );
  const looksLikeTaskRecord =
    Boolean(normalizedTitle)
    && (
      hasExplicitTaskIdentifier
      || ticketNumber !== null
      || normalizedTaskType === "task"
      || normalizedTaskType === "subtask"
      || Object.prototype.hasOwnProperty.call(record, "assigneeAgentId")
      || Object.prototype.hasOwnProperty.call(record, "parentTaskId")
      || Object.prototype.hasOwnProperty.call(record, "linkedThreadIds")
      || Object.prototype.hasOwnProperty.call(record, "dependencyIds")
      || runnerPlaygroundHasTaskSignals
    );

  if (!looksLikeTaskRecord) {
    return null;
  }

  return {
    id: id || `task:${normalizedTitle}`,
    title: normalizedTitle,
    projectId,
    projectName,
    ticketNumber,
    status: normalizedStatus,
    priority: normalizedPriority,
    taskType: normalizedTaskType || (normalizedParentTaskId ? "subtask" : "task"),
    assigneeAgentId,
    assigneeName,
    taskColor,
  };
}

function buildTaskManagementCreatePreviewFromTaskPayload(value: unknown): RunnerTaskManagementCreatedTaskPreview | null {
  const payload = asObjectRecord(value);
  if (!payload) {
    return null;
  }

  const taskRecord = asObjectRecord(payload.task);
  if (!taskRecord) {
    return null;
  }

  const details = asObjectRecord(payload.details);
  const project = asObjectRecord(details?.project);
  const assignee = asObjectRecord(details?.assignee);

  return normalizeTaskManagementCreatePreview({
    ...taskRecord,
    ...(project && !Object.prototype.hasOwnProperty.call(taskRecord, "projectName")
      ? { projectName: asOptionalTrimmedString(project.name) || asOptionalTrimmedString(project.title) || null }
      : {}),
    ...(project && !Object.prototype.hasOwnProperty.call(taskRecord, "projectId")
      ? { projectId: asOptionalTrimmedString(project.id) || null }
      : {}),
    ...(assignee && !Object.prototype.hasOwnProperty.call(taskRecord, "assigneeAgentId")
      ? { assigneeAgentId: asOptionalTrimmedString(assignee.id) || null }
      : {}),
    ...(assignee && !Object.prototype.hasOwnProperty.call(taskRecord, "assigneeName")
      ? { assigneeName: asOptionalTrimmedString(assignee.name) || asOptionalTrimmedString(assignee.displayName) || null }
      : {}),
  });
}

function extractTaskManagementCreatePreviewsFromValue(value: unknown): RunnerTaskManagementCreatedTaskPreview[] {
  const previews: RunnerTaskManagementCreatedTaskPreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, depth: number) {
    if (!current || depth > 6) return;
    if (Array.isArray(current)) {
      current.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    const record = asObjectRecord(current);
    if (!record) {
      return;
    }
    if (visited.has(record)) {
      return;
    }
    visited.add(record);

    const directPreview = normalizeTaskManagementCreatePreview(record);
    if (directPreview) {
      previews.push(directPreview);
    }

    for (const nestedValue of Object.values(record)) {
      visit(nestedValue, depth + 1);
    }
  }

  visit(value, 0);
  return dedupeTaskManagementCreatePreviews(previews);
}

function extractTaskManagementCreatePreviewsFromText(text: string): RunnerTaskManagementCreatedTaskPreview[] {
  const previews: RunnerTaskManagementCreatedTaskPreview[] = [];
  const trimmed = text.trim();
  if (!trimmed) {
    return previews;
  }

  try {
    const parsedJson = JSON.parse(trimmed) as unknown;
    const structuredPreviews = extractTaskManagementCreatePreviewsFromValue(parsedJson);
    if (structuredPreviews.length > 0) {
      return structuredPreviews;
    }
  } catch {}

  const lines = trimmed.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const createdMatch = line.match(/^(?:[+*-]\s*)?(?:✓\s*)?Created:\s*(.+?)(?:\s+\((task_[^)]+)\))?\s*$/i);
    if (!createdMatch?.[1]) {
      continue;
    }
    const titleParts = splitTaskManagementTitleAndTicket(createdMatch[1]);
    previews.push({
      id: createdMatch[2]?.trim() || `task:${titleParts.title}`,
      title: titleParts.title,
      projectId: null,
      projectName: null,
      ticketNumber: titleParts.ticketNumber || null,
      status: "todo",
      priority: "medium",
      taskType: "task",
      assigneeName: null,
      taskColor: null,
    });
  }

  return dedupeTaskManagementCreatePreviews(previews);
}

function collectTaskManagementCreatedTasks(log: RunnerLog): RunnerTaskManagementCreatedTaskPreview[] {
  const previews = [
    ...extractTaskManagementCreatePreviewsFromValue(log.metadata?.result),
    ...extractTaskManagementCreatePreviewsFromValue(log.metadata?.args),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractTaskManagementCreatePreviewsFromText(String(value || ""))
    ),
    ...(typeof log.metadata?.result === "string" ? extractTaskManagementCreatePreviewsFromText(log.metadata.result) : []),
    ...(typeof log.metadata?.output === "string" ? extractTaskManagementCreatePreviewsFromText(log.metadata.output) : []),
    ...extractTaskManagementCreatePreviewsFromText(log.message || ""),
  ];

  const command = String(log.metadata?.command || "");
  const commandProjectId = extractQuotedArgument(command, "--project-id");
  if (previews.length > 0) {
    return dedupeTaskManagementCreatePreviews(previews).map((preview) => ({
      ...preview,
      projectId: preview.projectId || commandProjectId || null,
    }));
  }

  if (isTaskManagementCreateCommand(command)) {
    const title = extractQuotedArgument(command, "--title");
    if (title) {
      const titleParts = splitTaskManagementTitleAndTicket(title);
      return [{
        id: `task:${titleParts.title}`,
        title: titleParts.title,
        projectId: commandProjectId || null,
        projectName: null,
        ticketNumber: titleParts.ticketNumber || null,
        status: "todo",
        priority: "medium",
        taskType: "task",
        assigneeName: null,
        taskColor: null,
      }];
    }
  }

  return [];
}

function isTaskManagementCommentCommand(command?: string): boolean {
  if (!command) return false;
  return /manage-tasks\.py[\s\S]*\btasks\s+comment\b/i.test(command);
}

function isTaskManagementCommentToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  return (
    /task/.test(serverName || toolName)
    && (
      /(?:^|[._/-])comment(?:[._/-])?tasks?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])tasks?(?:[._/-])comment(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])add(?:[._/-])?task(?:[._/-])?comment(?:$|[._/-])/.test(toolName)
    )
  );
}

function extractTaskManagementCommentTaskIdFromCommand(command?: string): string | null {
  if (!command) return null;
  const match = /manage-tasks\.py[\s\S]*?\btasks\s+comment\s+("[^"]+"|'[^']+'|[^\s|&;]+)/i.exec(command);
  const value = match?.[1] || "";
  return asOptionalTrimmedString(value.replace(/^["']|["']$/g, "")) || null;
}

function extractTaskManagementCommandFlagValue(command: string, flagName: string): string | null {
  const quoted = extractQuotedArgument(command, flagName);
  if (quoted) {
    return quoted;
  }

  const equalsPattern = new RegExp(`${flagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=(?:"((?:\\\\.|[^"])*)"|'((?:\\\\.|[^'])*)'|([^\\s|&;]+))`, "i");
  const match = command.match(equalsPattern);
  const value = match?.[1] || match?.[2] || match?.[3] || "";
  return asOptionalTrimmedString(value.replace(/\\"/g, `"`).replace(/\\'/g, `'`).replace(/\\\\/g, `\\`)) || null;
}

function isTaskManagementUpdateCommand(command?: string): boolean {
  if (!command) return false;
  return /manage-tasks\.py[\s\S]*\btasks\s+update\b/i.test(command);
}

function isTaskManagementUpdateToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  return (
    /task/.test(serverName || toolName)
    && (
      /(?:^|[._/-])update(?:[._/-])?tasks?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])tasks?(?:[._/-])update(?:$|[._/-])/.test(toolName)
    )
  );
}

function extractTaskManagementUpdateTaskIdFromCommand(command?: string): string | null {
  if (!command) return null;
  const match = /manage-tasks\.py[\s\S]*?\btasks\s+update\s+("[^"]+"|'[^']+'|[^\s|&;]+)/i.exec(command);
  const value = match?.[1] || "";
  return asOptionalTrimmedString(value.replace(/^["']|["']$/g, "")) || null;
}

function extractTaskManagementUpdatePreviewsFromValue(value: unknown): RunnerTaskManagementCreatedTaskPreview[] {
  const previews: RunnerTaskManagementCreatedTaskPreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, depth: number) {
    if (!current || depth > 6) return;
    if (typeof current === "string") {
      const trimmed = current.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
        try {
          visit(JSON.parse(trimmed), depth + 1);
        } catch {}
      }
      return;
    }
    if (Array.isArray(current)) {
      current.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    const record = asObjectRecord(current);
    if (!record || visited.has(record)) return;
    visited.add(record);

    const payloadPreview = buildTaskManagementCreatePreviewFromTaskPayload(record);
    if (payloadPreview) {
      previews.push(payloadPreview);
    }

    const directPreview = normalizeTaskManagementCreatePreview(record);
    if (directPreview) {
      previews.push(directPreview);
    }

    for (const nestedValue of Object.values(record)) {
      if (nestedValue && typeof nestedValue === "object") {
        visit(nestedValue, depth + 1);
      } else if (typeof nestedValue === "string") {
        visit(nestedValue, depth + 1);
      }
    }
  }

  visit(value, 0);
  return dedupeTaskManagementCreatePreviews(previews);
}

function extractTaskManagementUpdatePreviewsFromText(text: string): RunnerTaskManagementCreatedTaskPreview[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return extractTaskManagementUpdatePreviewsFromValue(trimmed);
}

function collectTaskManagementUpdatedTasks(log: RunnerLog): RunnerTaskManagementCreatedTaskPreview[] {
  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const previews = [
    ...extractTaskManagementUpdatePreviewsFromValue(log.metadata?.result),
    ...extractTaskManagementUpdatePreviewsFromValue(log.metadata?.args),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractTaskManagementUpdatePreviewsFromText(String(value || ""))
    ),
    ...(typeof log.metadata?.result === "string" ? extractTaskManagementUpdatePreviewsFromText(log.metadata.result) : []),
    ...(typeof log.metadata?.output === "string" ? extractTaskManagementUpdatePreviewsFromText(log.metadata.output) : []),
    ...(parsedOutput?.stdout ? extractTaskManagementUpdatePreviewsFromText(parsedOutput.stdout) : []),
    ...(parsedOutput?.stderr ? extractTaskManagementUpdatePreviewsFromText(parsedOutput.stderr) : []),
    ...extractTaskManagementUpdatePreviewsFromText(log.message || ""),
  ];

  const command = String(log.metadata?.command || "");
  const commandTaskId = extractTaskManagementUpdateTaskIdFromCommand(command);
  if (previews.length > 0) {
    return dedupeTaskManagementCreatePreviews(previews).map((preview) => ({
      ...preview,
      id: preview.id || commandTaskId || `task:${preview.title}`,
    }));
  }

  if (!isTaskManagementUpdateCommand(command) || !commandTaskId) {
    return [];
  }

  return [{
    id: commandTaskId,
    title: extractTaskManagementCommandFlagValue(command, "--title") || commandTaskId,
    projectId: extractTaskManagementCommandFlagValue(command, "--project-id"),
    projectName: null,
    ticketNumber: null,
    status: extractTaskManagementCommandFlagValue(command, "--status") || null,
    priority: extractTaskManagementCommandFlagValue(command, "--priority") || null,
    taskType: extractTaskManagementCommandFlagValue(command, "--task-type") || "task",
    assigneeAgentId:
      extractTaskManagementCommandFlagValue(command, "--assignee-agent-id")
      || extractTaskManagementCommandFlagValue(command, "--assignee-id")
      || null,
    assigneeName: null,
    taskColor: null,
  }];
}

export function shouldRenderTaskManagementUpdateLog(log: RunnerLog): boolean {
  return (
    isTaskManagementUpdateCommand(log.metadata?.command || "")
    || isTaskManagementUpdateToolInvocation(log)
  );
}

function formatTaskManagementPriorityLabel(value: string | null | undefined): string {
  const normalized = normalizeTaskManagementPreviewPriority(value);
  if (normalized === "critical") return "Critical";
  if (normalized === "high") return "High";
  if (normalized === "low") return "Low";
  return "Medium";
}

function formatTaskManagementUpdateSummary(log: RunnerLog, tasks: RunnerTaskManagementCreatedTaskPreview[]): string {
  const command = String(log.metadata?.command || "");
  const task = tasks[0];
  const changes: string[] = [];
  const statusFlag = extractTaskManagementCommandFlagValue(command, "--status");
  const priorityFlag = extractTaskManagementCommandFlagValue(command, "--priority");
  const titleFlag = extractTaskManagementCommandFlagValue(command, "--title");
  const assigneeFlag =
    extractTaskManagementCommandFlagValue(command, "--assignee-agent-id")
    || extractTaskManagementCommandFlagValue(command, "--assignee-id");
  const dueAtFlag = extractTaskManagementCommandFlagValue(command, "--due-at");
  const releaseFlag = extractTaskManagementCommandFlagValue(command, "--release-id");
  const sprintFlag = extractTaskManagementCommandFlagValue(command, "--sprint-id");

  if (statusFlag || (task?.status && /\s--status(?:=|\s)/i.test(command))) {
    changes.push(`Status changed to ${getTaskManagementPreviewStatusLabel(statusFlag || task?.status)}.`);
  }
  if (priorityFlag || (task?.priority && /\s--priority(?:=|\s)/i.test(command))) {
    changes.push(`Priority changed to ${formatTaskManagementPriorityLabel(priorityFlag || task?.priority)}.`);
  }
  if (titleFlag) {
    changes.push(`Title changed to "${titleFlag}".`);
  }
  if (assigneeFlag) {
    changes.push("Assignee updated.");
  }
  if (dueAtFlag) {
    changes.push("Due date updated.");
  }
  if (releaseFlag) {
    changes.push("Milestone assignment updated.");
  }
  if (sprintFlag) {
    changes.push("Sprint assignment updated.");
  }

  if (changes.length > 0) {
    return changes.join(" ");
  }
  return tasks.length > 1 ? `${tasks.length} tickets updated.` : "Ticket updated.";
}

function normalizeTaskManagementCommentPreview(value: unknown): RunnerTaskManagementCommentPreview | null {
  const record = asObjectRecord(value);
  if (!record) return null;

  const taskRecord = asObjectRecord(record.task);
  const taskMetadata = asObjectRecord(taskRecord?.metadata);
  const runnerPlayground = asObjectRecord(taskMetadata?.runnerPlayground);
  const objectType =
    asOptionalTrimmedString(record.object)
    || asOptionalTrimmedString(record.type)
    || "";
  const id =
    asOptionalTrimmedString(record.id)
    || asOptionalTrimmedString(record.commentId)
    || asOptionalTrimmedString(record.comment_id)
    || "";
  const body =
    asOptionalTrimmedString(record.body)
    || asOptionalTrimmedString(record.text)
    || asOptionalTrimmedString(record.comment)
    || asOptionalTrimmedString(record.message)
    || "";
  const taskId =
    asOptionalTrimmedString(record.taskId)
    || asOptionalTrimmedString(record.task_id)
    || asOptionalTrimmedString(taskRecord?.id)
    || null;
  const taskTitle =
    asOptionalTrimmedString(taskRecord?.title)
    || asOptionalTrimmedString(taskRecord?.name)
    || asOptionalTrimmedString(record.taskTitle)
    || asOptionalTrimmedString(record.task_title)
    || null;
  const titleParts = taskTitle ? splitTaskManagementTitleAndTicket(taskTitle) : { title: taskTitle || "" };
  const ticketNumber = normalizeTaskManagementPreviewTicketNumber(
    asOptionalTrimmedString(record.ticketNumber)
    || asOptionalTrimmedString(record.ticket_number)
    || asOptionalTrimmedString(taskRecord?.ticketNumber)
    || asOptionalTrimmedString(taskRecord?.ticket_number)
    || asOptionalTrimmedString(runnerPlayground?.ticketNumber)
    || titleParts.ticketNumber
    || null
  );
  const looksLikeTaskComment =
    objectType === "task_comment"
    || id.startsWith("tcomment_")
    || (Boolean(body) && (Boolean(taskId) || Boolean(taskRecord)));

  if (!body || !looksLikeTaskComment) {
    return null;
  }

  return {
    id: id || `task-comment:${taskId || "task"}:${body}`,
    body,
    authorName:
      asOptionalTrimmedString(record.authorName)
      || asOptionalTrimmedString(record.author_name)
      || asOptionalTrimmedString(record.userName)
      || asOptionalTrimmedString(record.user_name)
      || asOptionalTrimmedString(record.displayName)
      || asOptionalTrimmedString(record.display_name)
      || null,
    createdAt:
      asOptionalTrimmedString(record.createdAt)
      || asOptionalTrimmedString(record.created_at)
      || null,
    taskId,
    taskTitle: titleParts.title || taskTitle,
    projectId:
      asOptionalTrimmedString(record.projectId)
      || asOptionalTrimmedString(record.project_id)
      || asOptionalTrimmedString(taskRecord?.projectId)
      || asOptionalTrimmedString(taskRecord?.project_id)
      || null,
    projectName:
      asOptionalTrimmedString(record.projectName)
      || asOptionalTrimmedString(record.project_name)
      || asOptionalTrimmedString(taskRecord?.projectName)
      || asOptionalTrimmedString(taskRecord?.project_name)
      || null,
    ticketNumber,
    status:
      asOptionalTrimmedString(taskRecord?.status)
      || asOptionalTrimmedString(record.status)
      || null,
    priority:
      asOptionalTrimmedString(taskRecord?.priority)
      || asOptionalTrimmedString(record.priority)
      || null,
    taskType:
      asOptionalTrimmedString(taskRecord?.taskType)
      || asOptionalTrimmedString(taskRecord?.task_type)
      || asOptionalTrimmedString(runnerPlayground?.taskType)
      || null,
  };
}

function dedupeTaskManagementCommentPreviews(previews: RunnerTaskManagementCommentPreview[]): RunnerTaskManagementCommentPreview[] {
  const next = new Map<string, RunnerTaskManagementCommentPreview>();
  for (const preview of previews) {
    const normalizedId = String(preview.id || "").trim();
    const fallbackKey = `${String(preview.taskId || "").trim()}:${preview.body.trim()}`;
    const key = normalizedId || fallbackKey;
    if (!key.trim()) {
      continue;
    }
    const existing = next.get(key);
    next.set(key, existing ? {
      ...existing,
      ...preview,
      id: preview.id || existing.id,
      body: preview.body || existing.body,
      authorName: preview.authorName || existing.authorName || null,
      createdAt: preview.createdAt || existing.createdAt || null,
      taskId: preview.taskId || existing.taskId || null,
      taskTitle: preview.taskTitle || existing.taskTitle || null,
      projectId: preview.projectId || existing.projectId || null,
      projectName: preview.projectName || existing.projectName || null,
      ticketNumber: preview.ticketNumber || existing.ticketNumber || null,
      status: preview.status || existing.status || null,
      priority: preview.priority || existing.priority || null,
      taskType: preview.taskType || existing.taskType || null,
    } : preview);
  }
  return Array.from(next.values());
}

function extractTaskManagementCommentPreviewsFromValue(value: unknown): RunnerTaskManagementCommentPreview[] {
  const previews: RunnerTaskManagementCommentPreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, depth: number) {
    if (!current || depth > 6) return;
    if (Array.isArray(current)) {
      current.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    if (typeof current === "string") {
      const trimmed = current.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
        try {
          visit(JSON.parse(trimmed), depth + 1);
        } catch {}
      }
      return;
    }
    const record = asObjectRecord(current);
    if (!record || visited.has(record)) return;
    visited.add(record);

    if (record.comment && typeof record.comment === "object") {
      visit(record.comment, depth + 1);
    }
    if (Array.isArray(record.comments)) {
      visit(record.comments, depth + 1);
    }

    const directPreview = normalizeTaskManagementCommentPreview(record);
    if (directPreview) {
      previews.push(directPreview);
    }

    for (const nestedValue of Object.values(record)) {
      if (nestedValue && typeof nestedValue === "object") {
        visit(nestedValue, depth + 1);
      } else if (typeof nestedValue === "string") {
        visit(nestedValue, depth + 1);
      }
    }
  }

  visit(value, 0);
  return dedupeTaskManagementCommentPreviews(previews);
}

function extractTaskManagementCommentPreviewsFromText(text: string): RunnerTaskManagementCommentPreview[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return extractTaskManagementCommentPreviewsFromValue(parsed);
  } catch {
    return [];
  }
}

function collectTaskManagementComments(log: RunnerLog): RunnerTaskManagementCommentPreview[] {
  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const previews = [
    ...extractTaskManagementCommentPreviewsFromValue(log.metadata?.result),
    ...extractTaskManagementCommentPreviewsFromValue(log.metadata?.args),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractTaskManagementCommentPreviewsFromText(String(value || ""))
    ),
    ...(typeof log.metadata?.result === "string" ? extractTaskManagementCommentPreviewsFromText(log.metadata.result) : []),
    ...(typeof log.metadata?.output === "string" ? extractTaskManagementCommentPreviewsFromText(log.metadata.output) : []),
    ...(parsedOutput?.stdout ? extractTaskManagementCommentPreviewsFromText(parsedOutput.stdout) : []),
    ...(parsedOutput?.stderr ? extractTaskManagementCommentPreviewsFromText(parsedOutput.stderr) : []),
    ...extractTaskManagementCommentPreviewsFromText(log.message || ""),
  ];

  const command = String(log.metadata?.command || "");
  const commandTaskId = extractTaskManagementCommentTaskIdFromCommand(command);
  const commandBody = extractTaskManagementCommandFlagValue(command, "--body");
  if (previews.length > 0) {
    return dedupeTaskManagementCommentPreviews(previews).map((preview) => ({
      ...preview,
      taskId: preview.taskId || commandTaskId || null,
      body: preview.body || commandBody || "",
    })).filter((preview) => preview.body.trim().length > 0);
  }

  if (!isTaskManagementCommentCommand(command) || !commandBody) {
    return [];
  }

  return [{
    id: `task-comment:${commandTaskId || "task"}:${commandBody}`,
    body: commandBody,
    authorName: null,
    createdAt: null,
    taskId: commandTaskId,
    taskTitle: null,
    projectId: null,
    projectName: null,
    ticketNumber: null,
    status: null,
    priority: null,
    taskType: null,
  }];
}

export function shouldRenderTaskManagementCommentLog(log: RunnerLog): boolean {
  return (
    isTaskManagementCommentCommand(log.metadata?.command || "")
    || isTaskManagementCommentToolInvocation(log)
    || collectTaskManagementComments(log).length > 0
  );
}

function formatTaskManagementCommentTimestamp(value: string | null | undefined): string {
  const timestamp = Date.parse(String(value || ""));
  if (!Number.isFinite(timestamp)) {
    return "Just now";
  }

  const diffMs = Math.max(0, Date.now() - timestamp);
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  if (diffMs < minuteMs) {
    return "Just now";
  }
  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.round(diffMs / minuteMs));
    return `${minutes}m ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.round(diffMs / hourMs));
    return `${hours}h ago`;
  }
  const days = Math.max(1, Math.round(diffMs / dayMs));
  return `${days}d ago`;
}

function getComputerAgentsThreadSnapshotCommandMatch(command?: string): RegExpMatchArray | null {
  if (!command) return null;
  return String(command).match(/computer-agents\.py[\s\S]*?\bthreads\s+(messages|logs)\s+("[^"]+"|'[^']+'|[^\s|&;]+)/i);
}

function isComputerAgentsThreadSnapshotCommand(command?: string): boolean {
  return Boolean(getComputerAgentsThreadSnapshotCommandMatch(command));
}

function isComputerAgentsThreadSnapshotToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  return (
    /(computer[_ -]?agents?|threads?)/.test(`${serverName} ${toolName}`)
    && (
      /(?:^|[._/-])threads?(?:[._/-])messages?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])messages?(?:[._/-])threads?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])threads?(?:[._/-])logs?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])logs?(?:[._/-])threads?(?:$|[._/-])/.test(toolName)
    )
  );
}

function extractComputerAgentsThreadSnapshotCommandDetails(command?: string): {
  kind: RunnerComputerAgentsThreadSnapshotKind;
  threadId: string;
} | null {
  const match = getComputerAgentsThreadSnapshotCommandMatch(command);
  if (!match?.[1]) return null;
  const kind = match[1].toLowerCase() === "logs" ? "logs" : "messages";
  const threadId = String(match[2] || "").replace(/^["']|["']$/g, "").trim();
  return {
    kind,
    threadId,
  };
}

function stringifyComputerAgentsThreadSnapshotContent(value: unknown): string {
  if (typeof value === "string") {
    return stripRunnerSystemTags(value).trim();
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => stringifyComputerAgentsThreadSnapshotContent(entry))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }
  const record = asObjectRecord(value);
  if (!record) {
    return "";
  }

  const directText =
    asOptionalTrimmedString(record.text)
    || asOptionalTrimmedString(record.content)
    || asOptionalTrimmedString(record.message)
    || asOptionalTrimmedString(record.output_text)
    || asOptionalTrimmedString(record.input_text)
    || asOptionalTrimmedString(record.summary)
    || "";
  if (directText) {
    return stripRunnerSystemTags(directText).trim();
  }

  return "";
}

function normalizeComputerAgentsThreadMessageSnapshotItem(value: unknown, index: number): RunnerComputerAgentsThreadSnapshotItem | null {
  const record = asObjectRecord(value);
  if (!record) return null;
  const role = String(
    asOptionalTrimmedString(record.role)
    || asOptionalTrimmedString(record.authorRole)
    || asOptionalTrimmedString(record.author_role)
    || "assistant"
  ).trim().toLowerCase();
  const content = stringifyComputerAgentsThreadSnapshotContent(record.content ?? record.message ?? record.text);
  if (!content) {
    return null;
  }
  const normalizedRole = role === "user" ? "user" : role === "system" ? "system" : "assistant";
  return {
    id: asOptionalTrimmedString(record.id) || `message:${index}`,
    role: normalizedRole,
    label: normalizedRole === "user" ? "You" : normalizedRole === "system" ? "System" : "Agent",
    content,
    createdAt:
      asOptionalTrimmedString(record.createdAt)
      || asOptionalTrimmedString(record.created_at)
      || asOptionalTrimmedString(record.time)
      || null,
    tone: normalizedRole === "user" ? "user" : "assistant",
  };
}

function formatComputerAgentsThreadLogLabel(eventType: string, type: string): string {
  const normalizedEventType = eventType.trim().toLowerCase();
  const normalizedType = type.trim().toLowerCase();
  if (normalizedEventType === "reasoning" || normalizedEventType === "planning") return "Reasoning";
  if (normalizedEventType === "command_execution") return "Tool Call";
  if (normalizedEventType === "mcp_tool_call") return "Tool Call";
  if (normalizedEventType === "action_summary") return "Run Summary";
  if (normalizedEventType === "permission_request") return "Permission";
  if (normalizedEventType === "file_change") return "File Change";
  if (normalizedEventType === "todo_list") return "Task List";
  if (normalizedType === "error") return "Error";
  return "Run Summary";
}

function normalizeComputerAgentsThreadLogSnapshotItem(value: unknown, index: number): RunnerComputerAgentsThreadSnapshotItem | null {
  const record = asObjectRecord(value);
  if (!record) return null;
  const metadata = asObjectRecord(record.metadata) || asObjectRecord(record.logMetadata) || asObjectRecord(record.log_metadata);
  const eventType = String(
    asOptionalTrimmedString(record.eventType)
    || asOptionalTrimmedString(record.event_type)
    || asOptionalTrimmedString(record.kind)
    || ""
  ).trim();
  const type = String(asOptionalTrimmedString(record.type) || asOptionalTrimmedString(record.level) || "").trim();
  const command = asOptionalTrimmedString(metadata?.command);
  const messageContent =
    asOptionalTrimmedString(record.message)
    || asOptionalTrimmedString(record.content)
    || asOptionalTrimmedString(record.text)
    || "";
  const content = stripRunnerSystemTags(command ? formatShellCommandForDisplay(command) : messageContent).trim();
  if (!content) {
    return null;
  }
  const normalizedEventType = eventType.toLowerCase();
  const normalizedType = type.toLowerCase();
  const tone: RunnerComputerAgentsThreadSnapshotItem["tone"] =
    normalizedType === "error"
      ? "error"
      : normalizedEventType === "reasoning" || normalizedEventType === "planning"
        ? "reasoning"
        : normalizedEventType === "command_execution" || normalizedEventType === "mcp_tool_call"
          ? "command"
          : "log";
  return {
    id: asOptionalTrimmedString(record.id) || `log:${index}`,
    label: formatComputerAgentsThreadLogLabel(eventType, type),
    content,
    createdAt:
      asOptionalTrimmedString(record.createdAt)
      || asOptionalTrimmedString(record.created_at)
      || asOptionalTrimmedString(record.time)
      || null,
    eventType: eventType || null,
    tone,
  };
}

function extractComputerAgentsThreadSnapshotPayloadItems(value: unknown): unknown[] {
  if (value == null) {
    return [];
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
      return [];
    }
    try {
      return extractComputerAgentsThreadSnapshotPayloadItems(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value;
  }
  const record = asObjectRecord(value);
  if (!record) {
    return [];
  }

  const directItems =
    Array.isArray(record.data) ? record.data
      : Array.isArray(record.items) ? record.items
        : Array.isArray(record.messages) ? record.messages
          : Array.isArray(record.logs) ? record.logs
            : null;
  if (directItems) {
    return directItems;
  }

  const nestedCandidates = [
    record.result,
    record.payload,
    record.structuredContent,
    record.structured_content,
    record.stdout,
  ];
  for (const candidate of nestedCandidates) {
    const nestedItems = extractComputerAgentsThreadSnapshotPayloadItems(candidate);
    if (nestedItems.length > 0) {
      return nestedItems;
    }
  }

  return [];
}

function parseComputerAgentsThreadSnapshotDetails(log: RunnerLog): RunnerComputerAgentsThreadSnapshotDetails | null {
  const command = String(log.metadata?.command || "");
  const commandDetails = extractComputerAgentsThreadSnapshotCommandDetails(command);
  if (!commandDetails && !isComputerAgentsThreadSnapshotToolInvocation(log)) {
    return null;
  }

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const kind =
    commandDetails?.kind
    || (String(log.metadata?.toolName || "").toLowerCase().includes("logs") ? "logs" : "messages");
  const threadId =
    commandDetails?.threadId
    || asOptionalTrimmedString((asObjectRecord(log.metadata?.args)?.threadId))
    || asOptionalTrimmedString((asObjectRecord(log.metadata?.args)?.thread_id))
    || "";
  const candidateValues = [
    log.metadata?.result,
    parsedOutput?.stdout,
    log.metadata?.output,
    log.message,
  ];

  for (const candidate of candidateValues) {
    const payloadItems = extractComputerAgentsThreadSnapshotPayloadItems(candidate);
    if (payloadItems.length === 0) {
      continue;
    }
    const entries = payloadItems
      .map((item, index) =>
        kind === "logs"
          ? normalizeComputerAgentsThreadLogSnapshotItem(item, index)
          : normalizeComputerAgentsThreadMessageSnapshotItem(item, index)
      )
      .filter((item): item is RunnerComputerAgentsThreadSnapshotItem => Boolean(item));
    if (entries.length > 0) {
      return {
        kind,
        threadId,
        entries,
      };
    }
  }

  if (!commandDetails && !isComputerAgentsThreadSnapshotToolInvocation(log)) {
    return null;
  }

  return {
    kind,
    threadId,
    entries: [],
  };
}

export function isComputerAgentsThreadSnapshotLog(log: RunnerLog): boolean {
  return (
    isComputerAgentsThreadSnapshotCommand(log.metadata?.command || "")
    || isComputerAgentsThreadSnapshotToolInvocation(log)
  );
}

function formatComputerAgentsThreadSnapshotTimestamp(value: string | null | undefined): string {
  const timestamp = Date.parse(String(value || ""));
  if (!Number.isFinite(timestamp)) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function normalizeCreatedResourceType(value: unknown): RunnerCreatedResourceType | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === "agent" || normalized === "agents") return "agent";
  if (normalized === "skill" || normalized === "skills") return "skill";
  if (normalized === "environment" || normalized === "environments" || normalized === "env" || normalized === "envs") return "environment";
  if (normalized === "release" || normalized === "releases") return "release";
  return null;
}

function inferCreatedResourceTypeFromId(value: unknown): RunnerCreatedResourceType | null {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.startsWith("agent_")) return "agent";
  if (normalized.startsWith("skill_")) return "skill";
  if (normalized.startsWith("env_") || normalized.startsWith("environment_")) return "environment";
  if (normalized.startsWith("release_")) return "release";
  return null;
}

function getCreatedResourceTypeLabel(resourceType: RunnerCreatedResourceType): string {
  if (resourceType === "agent") return "Agent";
  if (resourceType === "skill") return "Skill";
  if (resourceType === "environment") return "Environment";
  if (resourceType === "project") return "Project";
  return "Milestone";
}

function renderCreatedResourceIcon(resourceType: RunnerCreatedResourceType, className: string) {
  if (resourceType === "agent") return <Bot className={className} strokeWidth={1.8} />;
  if (resourceType === "skill") return <Cpu className={className} strokeWidth={1.8} />;
  if (resourceType === "environment") return <HardDrive className={className} strokeWidth={1.8} />;
  if (resourceType === "project") return <Rocket className={className} strokeWidth={1.8} />;
  return <Calendar className={className} strokeWidth={1.8} />;
}

function dedupeCreatedResourcePreviews(previews: RunnerCreatedResourcePreview[]): RunnerCreatedResourcePreview[] {
  const next = new Map<string, RunnerCreatedResourcePreview>();
  for (const preview of previews) {
    const key = `${preview.resourceType}:${String(preview.id || preview.name || "").trim().toLowerCase()}`;
    if (!key || key.endsWith(":")) continue;
    const existing = next.get(key);
    next.set(key, existing ? {
      ...existing,
      ...preview,
      id: preview.id || existing.id,
      name: preview.name || existing.name,
      description: preview.description || existing.description || null,
      model: preview.model || existing.model || null,
      category: preview.category || existing.category || null,
      projectId: preview.projectId || existing.projectId || null,
      projectName: preview.projectName || existing.projectName || null,
      startAt: preview.startAt || existing.startAt || null,
      endAt: preview.endAt || existing.endAt || null,
      status: preview.status || existing.status || null,
      taskCount: typeof preview.taskCount === "number" ? preview.taskCount : existing.taskCount ?? null,
      openTaskCount: typeof preview.openTaskCount === "number" ? preview.openTaskCount : existing.openTaskCount ?? null,
      isDefault: preview.isDefault || existing.isDefault,
    } : preview);
  }
  return Array.from(next.values());
}

function normalizeCreatedResourcePreview(
  value: unknown,
  fallbackType?: RunnerCreatedResourceType | null,
): RunnerCreatedResourcePreview | null {
  const record = asObjectRecord(value);
  if (!record) return null;

  const metadata = asObjectRecord(record.metadata);
  const normalizedType =
    normalizeCreatedResourceType(record.resourceType)
    || normalizeCreatedResourceType(record.object)
    || normalizeCreatedResourceType(record.type)
    || fallbackType
    || inferCreatedResourceTypeFromId(record.id);
  if (!normalizedType) return null;

  const id =
    asOptionalTrimmedString(record.id)
    || (normalizedType === "agent"
      ? (
          asOptionalTrimmedString(record.agentId)
          || asOptionalTrimmedString(record.agent_id)
          || asOptionalTrimmedString(record.agentID)
        )
      : "")
    || (normalizedType === "skill"
      ? (
          asOptionalTrimmedString(record.skillId)
          || asOptionalTrimmedString(record.skill_id)
          || asOptionalTrimmedString(record.skillID)
        )
      : "")
    || (normalizedType === "project"
      ? (
          asOptionalTrimmedString(record.projectId)
          || asOptionalTrimmedString(record.project_id)
          || asOptionalTrimmedString(record.projectID)
        )
      : "")
    || asOptionalTrimmedString(record.environmentId)
    || asOptionalTrimmedString(record.environment_id)
    || asOptionalTrimmedString(record.releaseId)
    || asOptionalTrimmedString(record.release_id)
    || "";
  const name =
    asOptionalTrimmedString(record.name)
    || asOptionalTrimmedString(record.title)
    || asOptionalTrimmedString(record.label)
    || "";
  if (!id && !name) {
    return null;
  }

  return {
    id: id || `${normalizedType}:${name}`,
    name: name || getCreatedResourceTypeLabel(normalizedType),
    resourceType: normalizedType,
    description:
      asOptionalTrimmedString(record.description)
      || asOptionalTrimmedString(record.instructions)
      || asOptionalTrimmedString(record.markdown)
      || asOptionalTrimmedString(record.documentation)
      || null,
    model:
      asOptionalTrimmedString(record.model)
      || asOptionalTrimmedString(record.deepResearchModel)
      || null,
    category:
      asOptionalTrimmedString(record.category)
      || null,
    projectId:
      asOptionalTrimmedString(record.projectId)
      || asOptionalTrimmedString(record.project_id)
      || asOptionalTrimmedString(metadata?.projectId)
      || asOptionalTrimmedString(metadata?.project_id)
      || null,
    projectName:
      asOptionalTrimmedString(record.projectName)
      || asOptionalTrimmedString(record.project_name)
      || null,
    isDefault: Boolean(record.isDefault),
    startAt: asOptionalTrimmedString(record.startAt) || null,
    endAt: asOptionalTrimmedString(record.endAt) || null,
    status: asOptionalTrimmedString(record.status) || null,
    taskCount: Number.isFinite(record.taskCount) ? Number(record.taskCount) : null,
    openTaskCount: Number.isFinite(record.openTaskCount) ? Number(record.openTaskCount) : null,
  };
}

function extractCreatedResourcePreviewsFromValue(
  value: unknown,
  fallbackType?: RunnerCreatedResourceType | null,
): RunnerCreatedResourcePreview[] {
  const previews: RunnerCreatedResourcePreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, hintedType?: RunnerCreatedResourceType | null, depth = 0) {
    if (!current || depth > 6) return;
    if (Array.isArray(current)) {
      current.forEach((item) => visit(item, hintedType, depth + 1));
      return;
    }
    if (typeof current === "string") {
      const trimmed = current.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
        try {
          visit(JSON.parse(trimmed), hintedType, depth + 1);
        } catch {}
      }
      return;
    }
    const record = asObjectRecord(current);
    if (!record) return;
    if (visited.has(record)) return;
    visited.add(record);

    if (record.agent && typeof record.agent === "object") visit(record.agent, "agent", depth + 1);
    if (record.skill && typeof record.skill === "object") visit(record.skill, "skill", depth + 1);
    if (record.environment && typeof record.environment === "object") visit(record.environment, "environment", depth + 1);
    if (record.release && typeof record.release === "object") visit(record.release, "release", depth + 1);
    if (Array.isArray(record.agents)) visit(record.agents, "agent", depth + 1);
    if (Array.isArray(record.skills)) visit(record.skills, "skill", depth + 1);
    if (Array.isArray(record.environments)) visit(record.environments, "environment", depth + 1);
    if (Array.isArray(record.releases)) visit(record.releases, "release", depth + 1);

    const directPreview = normalizeCreatedResourcePreview(record, hintedType || fallbackType || null);
    if (directPreview) {
      previews.push(directPreview);
    }

    for (const nestedValue of Object.values(record)) {
      if (nestedValue && typeof nestedValue === "object") {
        visit(nestedValue, null, depth + 1);
      }
    }
  }

  visit(value, fallbackType || null, 0);
  return dedupeCreatedResourcePreviews(previews);
}

function extractCreatedResourcePreviewsFromText(
  text: string,
  fallbackType?: RunnerCreatedResourceType | null,
): RunnerCreatedResourcePreview[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const structured = extractCreatedResourcePreviewsFromValue(parsed, fallbackType);
    if (structured.length > 0) {
      return structured;
    }
  } catch {}

  const previews: RunnerCreatedResourcePreview[] = [];
  const patterns: Array<{ type: RunnerCreatedResourceType; pattern: RegExp }> = [
    { type: "agent", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:agent created|created agent)\b[:\s-]*(.+?)(?:\s+\(([^)]+)\))?\s*$/i },
    { type: "skill", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:skill created|created skill)\b[:\s-]*(.+?)(?:\s+\((skill_[^)]+)\))?\s*$/i },
    { type: "environment", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:environment created|created environment)\b[:\s-]*(.+?)(?:\s+\(((?:env|environment)_[^)]+)\))?\s*$/i },
    { type: "release", pattern: /^(?:[+*-]\s*)?(?:✓\s*)?(?:(?:release|milestone) created|created (?:release|milestone))\b[:\s-]*(.+?)(?:\s+\((release_[^)]+)\))?\s*$/i },
  ];

  for (const rawLine of trimmed.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    for (const { type, pattern } of patterns) {
      const match = line.match(pattern);
      if (!match?.[1]) continue;
      previews.push({
        id: String(match[2] || `${type}:${match[1]}`).trim(),
        name: String(match[1] || "").trim(),
        resourceType: type,
        mutationVerb: null,
        description: null,
        model: null,
        category: null,
        projectId: null,
        projectName: null,
        isDefault: false,
        startAt: null,
        endAt: null,
        status: null,
        taskCount: null,
        openTaskCount: null,
      });
      break;
    }
  }

  return dedupeCreatedResourcePreviews(previews);
}

function isComputerAgentsCreateCommand(command?: string): boolean {
  if (!command) return false;
  return /computer-agents\.py[\s\S]*\b(agents|skills|environments)\s+(create|clone)\b/i.test(command);
}

function inferComputerAgentsResourceTypeFromCommand(command?: string): RunnerCreatedResourceType | null {
  if (!command) return null;
  if (/computer-agents\.py[\s\S]*\bagents\s+(create|update)\b/i.test(command)) return "agent";
  if (/computer-agents\.py[\s\S]*\bskills\s+(create|update)\b/i.test(command)) return "skill";
  if (/computer-agents\.py[\s\S]*\benvironments\s+(create|clone|update)\b/i.test(command)) return "environment";
  return null;
}

function isComputerAgentsCreateToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  const combined = `${serverName} ${toolName}`;
  return (
    /(computer[_ -]?agents?|agents?|skills?|environments?|envs?)/.test(combined)
    && /(create|clone|new)/.test(combined)
  );
}

export function isComputerAgentsMutationLog(log: RunnerLog): boolean {
  const command = String(log.metadata?.command || "");
  if (/computer-agents\.py[\s\S]*\bagents\s+(create|update)\b/i.test(command)) return true;
  if (/computer-agents\.py[\s\S]*\bskills\s+(create|update)\b/i.test(command)) return true;
  if (/computer-agents\.py[\s\S]*\benvironments\s+(create|clone|update)\b/i.test(command)) return true;

  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  const combined = `${serverName} ${toolName}`;
  return (
    /(computer[_ -]?agents?|agents?|skills?|environments?|envs?)/.test(combined)
    && /(create|clone|new|update|edit)/.test(combined)
  );
}

function getComputerAgentsMutationVerb(log: RunnerLog): "created" | "updated" {
  const command = String(log.metadata?.command || "");
  if (/computer-agents\.py[\s\S]*\b(agents|skills|environments)\s+update\b/i.test(command)) {
    return "updated";
  }
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  const combined = `${serverName} ${toolName}`;
  if (/(update|edit)/.test(combined)) {
    return "updated";
  }
  return "created";
}

export function collectComputerAgentsCreatedResources(log: RunnerLog): RunnerCreatedResourcePreview[] {
  const command = String(log.metadata?.command || "");
  const fallbackType =
    inferComputerAgentsResourceTypeFromCommand(command)
    || null;
  const mutationVerb = getComputerAgentsMutationVerb(log);
  const previews = [
    ...extractCreatedResourcePreviewsFromValue(log.metadata?.result, fallbackType),
    ...extractCreatedResourcePreviewsFromValue(log.metadata?.args, fallbackType),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractCreatedResourcePreviewsFromText(String(value || ""), fallbackType)
    ),
    ...(typeof log.metadata?.result === "string" ? extractCreatedResourcePreviewsFromText(log.metadata.result, fallbackType) : []),
    ...(typeof log.metadata?.output === "string" ? extractCreatedResourcePreviewsFromText(log.metadata.output, fallbackType) : []),
    ...extractCreatedResourcePreviewsFromText(log.message || "", fallbackType),
  ].filter((preview) => preview.resourceType !== "release");

  if (previews.length > 0) {
    return dedupeCreatedResourcePreviews(previews).map((preview) => ({
      ...preview,
      mutationVerb,
    }));
  }

  if (!isComputerAgentsCreateCommand(command) && !isComputerAgentsCreateToolInvocation(log)) {
    return [];
  }

  const fallbackName = extractQuotedArgument(command, "--name");
  if (!fallbackName || !fallbackType) {
    return [];
  }
  return [{
    id:
      extractQuotedArgument(command, "--id")
      || (fallbackType === "agent" ? extractQuotedArgument(command, "--agent-id") : "")
      || (fallbackType === "skill" ? extractQuotedArgument(command, "--skill-id") : "")
      || (fallbackType === "project" ? extractQuotedArgument(command, "--project-id") : "")
      || `${fallbackType}:${fallbackName}`,
    name: fallbackName,
    resourceType: fallbackType,
    mutationVerb,
    description: extractQuotedArgument(command, "--description"),
    model: extractQuotedArgument(command, "--model"),
    category: extractQuotedArgument(command, "--category"),
    projectId: extractQuotedArgument(command, "--project-id"),
    projectName: null,
    isDefault: /\s--is-default(?:\s|$)/.test(command),
    startAt: null,
    endAt: null,
    status: null,
    taskCount: null,
    openTaskCount: null,
  }];
}

function isTaskManagementReleaseCreateCommand(command?: string): boolean {
  if (!command) return false;
  return /manage-tasks\.py[\s\S]*\breleases\s+create\b/i.test(command);
}

function isTaskManagementReleaseCreateToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  return (
    /task/.test(serverName || toolName)
    && (
      /(?:^|[._/-])create(?:[._/-])?releases?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])releases?(?:[._/-])create(?:$|[._/-])/.test(toolName)
    )
  );
}

function normalizeTaskManagementReleasePreview(value: unknown): RunnerCreatedResourcePreview | null {
  const record = asObjectRecord(value);
  if (!record) return null;
  const metadata = asObjectRecord(record.metadata);
  const normalizedType =
    normalizeCreatedResourceType(record.resourceType)
    || normalizeCreatedResourceType(record.object)
    || normalizeCreatedResourceType(record.type)
    || inferCreatedResourceTypeFromId(record.id);
  const id =
    asOptionalTrimmedString(record.id)
    || asOptionalTrimmedString(record.releaseId)
    || asOptionalTrimmedString(record.release_id)
    || "";
  const name =
    asOptionalTrimmedString(record.name)
    || asOptionalTrimmedString(record.title)
    || asOptionalTrimmedString(record.releaseName)
    || asOptionalTrimmedString(record.release_name)
    || "";

  const looksLikeReleaseRecord =
    normalizedType === "release"
    || id.startsWith("release_")
    || Object.prototype.hasOwnProperty.call(record, "startAt")
    || Object.prototype.hasOwnProperty.call(record, "endAt")
    || Object.prototype.hasOwnProperty.call(record, "openTaskCount")
    || Object.prototype.hasOwnProperty.call(record, "taskCount")
    || Object.prototype.hasOwnProperty.call(record, "releaseId");
  if (!looksLikeReleaseRecord || (!id && !name)) {
    return null;
  }

  return {
    id: id || `release:${name}`,
    name: name || "Untitled Milestone",
    resourceType: "release",
    description: asOptionalTrimmedString(record.description) || null,
    model: null,
    category: null,
    projectId:
      asOptionalTrimmedString(record.projectId)
      || asOptionalTrimmedString(record.project_id)
      || asOptionalTrimmedString(metadata?.projectId)
      || null,
    projectName:
      asOptionalTrimmedString(record.projectName)
      || asOptionalTrimmedString(record.project_name)
      || null,
    isDefault: false,
    startAt: asOptionalTrimmedString(record.startAt) || null,
    endAt: asOptionalTrimmedString(record.endAt) || null,
    status: asOptionalTrimmedString(record.status) || null,
    taskCount: Number.isFinite(record.taskCount) ? Number(record.taskCount) : null,
    openTaskCount: Number.isFinite(record.openTaskCount) ? Number(record.openTaskCount) : null,
  };
}

function extractTaskManagementReleasePreviewsFromValue(value: unknown): RunnerCreatedResourcePreview[] {
  const previews: RunnerCreatedResourcePreview[] = [];
  const visited = new WeakSet<object>();

  function visit(current: unknown, depth: number) {
    if (!current || depth > 6) return;
    if (Array.isArray(current)) {
      current.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    if (typeof current === "string") {
      const trimmed = current.trim();
      if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && trimmed.length > 1) {
        try {
          visit(JSON.parse(trimmed), depth + 1);
        } catch {}
      }
      return;
    }
    const record = asObjectRecord(current);
    if (!record || visited.has(record)) return;
    visited.add(record);

    if (record.release && typeof record.release === "object") {
      visit(record.release, depth + 1);
    }
    if (Array.isArray(record.releases)) {
      visit(record.releases, depth + 1);
    }
    const directPreview = normalizeTaskManagementReleasePreview(record);
    if (directPreview) {
      previews.push(directPreview);
    }
    for (const nestedValue of Object.values(record)) {
      if (nestedValue && typeof nestedValue === "object") {
        visit(nestedValue, depth + 1);
      }
    }
  }

  visit(value, 0);
  return dedupeCreatedResourcePreviews(previews);
}

function extractTaskManagementReleasePreviewsFromText(text: string): RunnerCreatedResourcePreview[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const structured = extractTaskManagementReleasePreviewsFromValue(parsed);
    if (structured.length > 0) {
      return structured;
    }
  } catch {}

  const previews: RunnerCreatedResourcePreview[] = [];
  for (const rawLine of trimmed.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(?:[+*-]\s*)?(?:✓\s*)?(?:(?:Release|Milestone) created|Created (?:release|milestone)):\s*(.+?)(?:\s+\((release_[^)]+)\))?\s*$/i);
    if (!match?.[1]) continue;
    previews.push({
      id: String(match[2] || `release:${match[1]}`).trim(),
      name: String(match[1] || "").trim(),
      resourceType: "release",
      description: null,
      model: null,
      category: null,
      projectId: null,
      projectName: null,
      isDefault: false,
      startAt: null,
      endAt: null,
      status: null,
      taskCount: null,
      openTaskCount: null,
    });
  }
  return dedupeCreatedResourcePreviews(previews);
}

export function collectTaskManagementCreatedReleases(log: RunnerLog): RunnerCreatedResourcePreview[] {
  const previews = [
    ...extractTaskManagementReleasePreviewsFromValue(log.metadata?.result),
    ...extractTaskManagementReleasePreviewsFromValue(log.metadata?.args),
    ...Object.values((log.metadata?.fileContents as Record<string, string> | undefined) || {}).flatMap((value) =>
      extractTaskManagementReleasePreviewsFromText(String(value || ""))
    ),
    ...(typeof log.metadata?.result === "string" ? extractTaskManagementReleasePreviewsFromText(log.metadata.result) : []),
    ...(typeof log.metadata?.output === "string" ? extractTaskManagementReleasePreviewsFromText(log.metadata.output) : []),
    ...extractTaskManagementReleasePreviewsFromText(log.message || ""),
  ];

  const command = String(log.metadata?.command || "");
  const commandProjectId = extractQuotedArgument(command, "--project-id");
  if (previews.length > 0) {
    return dedupeCreatedResourcePreviews(previews).map((preview) => ({
      ...preview,
      projectId: preview.projectId || commandProjectId || null,
    }));
  }

  if (!isTaskManagementReleaseCreateCommand(command) && !isTaskManagementReleaseCreateToolInvocation(log)) {
    return [];
  }

  const releaseName = extractQuotedArgument(command, "--name");
  if (!releaseName) {
    return [];
  }
  return [{
    id: `release:${releaseName}`,
    name: releaseName,
    resourceType: "release",
    description: extractQuotedArgument(command, "--description"),
    model: null,
    category: null,
    projectId: commandProjectId || null,
    projectName: null,
    isDefault: false,
    startAt: extractQuotedArgument(command, "--start-at"),
    endAt: extractQuotedArgument(command, "--end-at"),
    status: "planned",
    taskCount: null,
    openTaskCount: null,
  }];
}

export function shouldRenderComputerAgentsCreateLog(log: RunnerLog): boolean {
  return (
    isComputerAgentsMutationLog(log)
    && collectComputerAgentsCreatedResources(log).length > 0
  );
}

export function shouldRenderTaskManagementReleaseCreateLog(log: RunnerLog): boolean {
  return (
    isTaskManagementReleaseCreateCommand(log.metadata?.command || "")
    || isTaskManagementReleaseCreateToolInvocation(log)
    || collectTaskManagementCreatedReleases(log).length > 0
  );
}

function isTaskManagementCreateCommand(command?: string): boolean {
  if (!command) return false;
  return /manage-tasks\.py[\s\S]*\btasks\s+create\b/i.test(command);
}

function isTaskManagementCreateToolInvocation(log: RunnerLog): boolean {
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || "").trim().toLowerCase();
  return (
    /task/.test(serverName || toolName)
    && (
      /(?:^|[._/-])create(?:[._/-])?tasks?(?:$|[._/-])/.test(toolName)
      || /(?:^|[._/-])tasks?(?:[._/-])create(?:$|[._/-])/.test(toolName)
    )
  );
}

export function shouldRenderTaskManagementCreateLog(log: RunnerLog): boolean {
  return (
    isTaskManagementCreateCommand(log.metadata?.command || "")
    || isTaskManagementCreateToolInvocation(log)
    || collectTaskManagementCreatedTasks(log).length > 0
  );
}

export function TaskManagementCommentLogBox({
  log,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  const comments = useMemo(() => collectTaskManagementComments(log), [log]);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const title =
    comments.length === 1
      ? "Added ticket comment"
      : comments.length > 1
        ? `${comments.length} comments added`
        : "Add ticket comment";
  const detail = comments[0]?.taskTitle || (isLoading ? "commenting..." : "");

  return (
    <CompactActionLogLine
      icon={<MessageSquare className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title={title}
      detail={detail}
    />
  );
}

function TaskManagementPreviewCard({
  task,
  activeTaskPreviewId,
  onTaskPreviewClick,
  fallbackTicketLabel = "TASK",
}: {
  task: RunnerTaskManagementCreatedTaskPreview;
  activeTaskPreviewId?: string | null;
  onTaskPreviewClick?: RunnerWorkLogEntryProps["onTaskPreviewClick"];
  fallbackTicketLabel?: string;
}) {
  const normalizedStatus = normalizeTaskManagementPreviewStatus(task.status);
  const normalizedTaskType = normalizeTaskManagementPreviewType(task.taskType);
  const isClickable = Boolean(onTaskPreviewClick && task.id);
  const isActive = String(activeTaskPreviewId || "").trim() !== "" && String(task.id || "").trim() === String(activeTaskPreviewId || "").trim();
  const content = (
    <>
      <div className="tb-log-task-create-item-content">
        <div className="tb-log-task-create-leading">
          <div className={`tb-log-task-create-type ${normalizedTaskType === "subtask" ? "is-subtask" : "is-task"}`.trim()}>
            {normalizedTaskType === "subtask"
              ? <Check className="tb-log-task-create-type-icon" strokeWidth={1.9} />
              : <Bookmark className="tb-log-task-create-type-icon" strokeWidth={1.9} />}
          </div>
          <div className="tb-log-task-create-main">
            {renderTaskManagementPreviewPriorityIcon(task.priority, "tb-log-task-create-priority")}
            <span className={`tb-log-task-create-ticket ${task.ticketNumber ? "" : "is-placeholder"}`.trim()}>
              {task.ticketNumber || fallbackTicketLabel}
            </span>
            <span className="tb-log-task-create-title" title={task.title}>
              {task.title}
            </span>
          </div>
        </div>
        <div className="tb-log-task-create-meta">
          <span className={`tb-log-task-create-assignee ${task.assigneeName ? "" : "is-unassigned"}`.trim()} title={task.assigneeName || "Unassigned"}>
            {task.assigneeName || "Unassigned"}
          </span>
          <span className={`tb-log-task-create-status is-${normalizedStatus.replace(/_/g, "-")}`.trim()}>
            {getTaskManagementPreviewStatusLabel(task.status)}
          </span>
        </div>
      </div>
    </>
  );

  return isClickable ? (
    <button
      key={task.id}
      type="button"
      className={`tb-log-task-create-item tb-log-task-create-item-button ${isActive ? "is-active" : ""}`.trim()}
      style={getTaskManagementPreviewColorStyle(task.taskColor)}
      onClick={() =>
        onTaskPreviewClick?.({
          taskId: task.id,
          projectId: task.projectId || "",
          ...(task.projectName ? { projectName: task.projectName } : {}),
          ticketNumber: task.ticketNumber || fallbackTicketLabel,
          title: task.title,
          ...(task.taskColor ? { taskColor: task.taskColor } : {}),
          ...(task.status ? { status: task.status } : {}),
          ...(task.priority ? { priority: task.priority } : {}),
          ...(task.taskType ? { taskType: task.taskType } : {}),
          ...(task.assigneeAgentId ? { assigneeAgentId: task.assigneeAgentId } : {}),
          ...(task.assigneeName ? { assigneeName: task.assigneeName } : {}),
        })
      }
    >
      {content}
    </button>
  ) : (
    <div
      key={task.id}
      className={`tb-log-task-create-item ${isActive ? "is-active" : ""}`.trim()}
      style={getTaskManagementPreviewColorStyle(task.taskColor)}
    >
      {content}
    </div>
  );
}

function buildTaskManagementPreviewClickPayload(
  task: RunnerTaskManagementCreatedTaskPreview,
  fallbackTicketLabel = "TASK"
): Parameters<NonNullable<RunnerWorkLogEntryProps["onTaskPreviewClick"]>>[0] {
  return {
    taskId: task.id,
    projectId: task.projectId || "",
    ...(task.projectName ? { projectName: task.projectName } : {}),
    ticketNumber: task.ticketNumber || fallbackTicketLabel,
    title: task.title,
    ...(task.taskColor ? { taskColor: task.taskColor } : {}),
    ...(task.status ? { status: task.status } : {}),
    ...(task.priority ? { priority: task.priority } : {}),
    ...(task.taskType ? { taskType: task.taskType } : {}),
    ...(task.assigneeAgentId ? { assigneeAgentId: task.assigneeAgentId } : {}),
    ...(task.assigneeName ? { assigneeName: task.assigneeName } : {}),
  };
}

function formatTaskManagementCompactDetail(
  task: RunnerTaskManagementCreatedTaskPreview | undefined,
  fallbackTicketLabel = "TASK"
): string {
  if (!task) {
    return "";
  }
  return [task.ticketNumber || fallbackTicketLabel, task.title].filter(Boolean).join(" ");
}

export function TaskManagementCreateLogBox({
  log,
  backendUrl,
  requestHeaders,
  onTaskPreviewClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  activeTaskPreviewId?: string | null;
  onTaskPreviewClick?: RunnerWorkLogEntryProps["onTaskPreviewClick"];
}) {
  const [enrichedTasksById, setEnrichedTasksById] = useState<Record<string, RunnerTaskManagementCreatedTaskPreview>>({});
  const [ticketNumbersByTaskId, setTicketNumbersByTaskId] = useState<Record<string, string>>({});
  const createdTasks = useMemo(() => collectTaskManagementCreatedTasks(log), [log]);

  useEffect(() => {
    const nextEnrichedTasksById: Record<string, RunnerTaskManagementCreatedTaskPreview> = {};
    const nextTicketNumbersByTaskId: Record<string, string> = {};

    createdTasks.forEach((task) => {
      const normalizedTaskId = String(task.id || "").trim();
      if (normalizedTaskId && runnerTaskManagementPreviewCache.has(normalizedTaskId)) {
        nextEnrichedTasksById[normalizedTaskId] = runnerTaskManagementPreviewCache.get(normalizedTaskId)!;
      }
      const normalizedProjectId = String(task.projectId || "").trim();
      if (normalizedTaskId && normalizedProjectId && runnerTaskManagementProjectTicketMapCache.has(normalizedProjectId)) {
        const ticketMap = runnerTaskManagementProjectTicketMapCache.get(normalizedProjectId)!;
        if (ticketMap[normalizedTaskId]) {
          nextTicketNumbersByTaskId[normalizedTaskId] = ticketMap[normalizedTaskId];
        }
      }
    });

    setEnrichedTasksById(nextEnrichedTasksById);
    setTicketNumbersByTaskId(nextTicketNumbersByTaskId);
  }, [createdTasks]);

  const displayTasks = useMemo(
    () =>
      createdTasks.map((task) => {
        const enriched = task.id ? enrichedTasksById[task.id] : undefined;
        const normalizedTaskId = String(task.id || "").trim();
        const ticketNumberFromMap = normalizedTaskId ? ticketNumbersByTaskId[normalizedTaskId] : "";
        const mergedTask = !enriched
          ? task
          : {
              ...task,
              ...enriched,
              projectId: enriched.projectId || task.projectId || null,
              projectName: enriched.projectName || task.projectName || null,
            };
        return {
          ...mergedTask,
          ticketNumber: mergedTask.ticketNumber || ticketNumberFromMap || null,
        };
      }),
    [createdTasks, enrichedTasksById, ticketNumbersByTaskId]
  );
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const createdCount = displayTasks.length;
  const title = createdCount === 1
    ? "1 task created"
    : createdCount > 1
      ? `${createdCount} tasks created`
      : "Create tasks";

  useEffect(() => {
    let cancelled = false;
    const normalizedBackendUrl = String(backendUrl || "").trim().replace(/\/$/, "");
    const taskIds = Array.from(
      new Set(
        createdTasks
          .map((task) => String(task.id || "").trim())
          .filter((taskId) => taskId.startsWith("task_"))
      )
    );

    if (!normalizedBackendUrl || taskIds.length === 0) {
      setEnrichedTasksById({});
      return () => {
        cancelled = true;
      };
    }

    void Promise.allSettled(
      taskIds.map(async (taskId) => {
        const response = await fetch(`${normalizedBackendUrl}/tasks/${encodeURIComponent(taskId)}`, {
          method: "GET",
          headers: requestHeaders,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load task ${taskId}`);
        }
        const body = await response.json();
        return {
          taskId,
          preview: buildTaskManagementCreatePreviewFromTaskPayload(body),
        };
      })
    ).then((results) => {
      if (cancelled) {
        return;
      }
      const nextEnrichedTasksById: Record<string, RunnerTaskManagementCreatedTaskPreview> = {};
      for (const result of results) {
        if (result.status !== "fulfilled" || !result.value.preview) {
          continue;
        }
        nextEnrichedTasksById[result.value.taskId] = result.value.preview;
        runnerTaskManagementPreviewCache.set(result.value.taskId, result.value.preview);
      }
      setEnrichedTasksById(nextEnrichedTasksById);
    }).catch(() => {
      if (!cancelled) {
        setEnrichedTasksById({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [backendUrl, createdTasks, requestHeaders]);

  useEffect(() => {
    let cancelled = false;
    const normalizedBackendUrl = String(backendUrl || "").trim().replace(/\/$/, "");
    const projectIds = Array.from(
      new Set(
        displayTasks
          .filter((task) => !task.ticketNumber)
          .map((task) => String(task.projectId || "").trim())
          .filter(Boolean)
      )
    );

    if (!normalizedBackendUrl || projectIds.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    const cachedTicketNumbers: Record<string, string> = {};
    projectIds.forEach((projectId) => {
      const cachedMap = runnerTaskManagementProjectTicketMapCache.get(projectId);
      if (!cachedMap) {
        return;
      }
      Object.assign(cachedTicketNumbers, cachedMap);
    });
    if (Object.keys(cachedTicketNumbers).length > 0) {
      setTicketNumbersByTaskId((current) => ({ ...current, ...cachedTicketNumbers }));
    }

    const projectIdsToFetch = projectIds.filter((projectId) => !runnerTaskManagementProjectTicketMapCache.has(projectId));
    if (projectIdsToFetch.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    void Promise.allSettled(
      projectIdsToFetch.map(async (projectId) => {
        const response = await fetch(`${normalizedBackendUrl}/tasks?projectId=${encodeURIComponent(projectId)}&limit=1000`, {
          method: "GET",
          headers: requestHeaders,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load tasks for project ${projectId}`);
        }
        const body = await response.json();
        return {
          projectId,
          ticketMap: buildTaskManagementTicketMapFromTaskListPayload(body),
        };
      })
    ).then((results) => {
      if (cancelled) {
        return;
      }
      const nextTicketNumbersByTaskId: Record<string, string> = {};
      for (const result of results) {
        if (result.status !== "fulfilled") {
          continue;
        }
        runnerTaskManagementProjectTicketMapCache.set(result.value.projectId, result.value.ticketMap);
        Object.assign(nextTicketNumbersByTaskId, result.value.ticketMap);
      }
      if (Object.keys(nextTicketNumbersByTaskId).length > 0) {
        setTicketNumbersByTaskId((current) => ({ ...current, ...nextTicketNumbersByTaskId }));
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [backendUrl, displayTasks, requestHeaders]);

  const firstTask = displayTasks[0];
  return (
    <CompactActionLogLine
      icon={<ListTodo className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title={createdCount === 1 ? "Created task" : title}
      detail={firstTask ? formatTaskManagementCompactDetail(firstTask, "NEW") : isLoading ? "creating..." : ""}
      onClick={firstTask?.id ? () => onTaskPreviewClick?.(buildTaskManagementPreviewClickPayload(firstTask, "NEW")) : undefined}
    />
  );
}

export function TaskManagementUpdateLogBox({
  log,
  backendUrl,
  requestHeaders,
  onTaskPreviewClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  requestHeaders?: HeadersInit;
  activeTaskPreviewId?: string | null;
  onTaskPreviewClick?: RunnerWorkLogEntryProps["onTaskPreviewClick"];
}) {
  const [enrichedTasksById, setEnrichedTasksById] = useState<Record<string, RunnerTaskManagementCreatedTaskPreview>>({});
  const updatedTasks = useMemo(() => collectTaskManagementUpdatedTasks(log), [log]);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";

  useEffect(() => {
    const nextEnrichedTasksById: Record<string, RunnerTaskManagementCreatedTaskPreview> = {};
    updatedTasks.forEach((task) => {
      const normalizedTaskId = String(task.id || "").trim();
      if (normalizedTaskId && runnerTaskManagementPreviewCache.has(normalizedTaskId)) {
        nextEnrichedTasksById[normalizedTaskId] = runnerTaskManagementPreviewCache.get(normalizedTaskId)!;
      }
    });
    setEnrichedTasksById(nextEnrichedTasksById);
  }, [updatedTasks]);

  useEffect(() => {
    let cancelled = false;
    const normalizedBackendUrl = String(backendUrl || "").trim().replace(/\/$/, "");
    const taskIds = Array.from(
      new Set(
        updatedTasks
          .map((task) => String(task.id || "").trim())
          .filter((taskId) => taskId.startsWith("task_"))
      )
    );

    if (!normalizedBackendUrl || taskIds.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    void Promise.allSettled(
      taskIds.map(async (taskId) => {
        const response = await fetch(`${normalizedBackendUrl}/tasks/${encodeURIComponent(taskId)}`, {
          method: "GET",
          headers: requestHeaders,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load task ${taskId}`);
        }
        const body = await response.json();
        return {
          taskId,
          preview: buildTaskManagementCreatePreviewFromTaskPayload(body),
        };
      })
    ).then((results) => {
      if (cancelled) return;
      const nextEnrichedTasksById: Record<string, RunnerTaskManagementCreatedTaskPreview> = {};
      for (const result of results) {
        if (result.status !== "fulfilled" || !result.value.preview) {
          continue;
        }
        nextEnrichedTasksById[result.value.taskId] = result.value.preview;
        runnerTaskManagementPreviewCache.set(result.value.taskId, result.value.preview);
      }
      setEnrichedTasksById(nextEnrichedTasksById);
    }).catch(() => {
      if (!cancelled) {
        setEnrichedTasksById({});
      }
    });

    return () => {
      cancelled = true;
    };
  }, [backendUrl, requestHeaders, updatedTasks]);

  const displayTasks = useMemo(
    () =>
      updatedTasks.map((task) => {
        const enriched = task.id ? enrichedTasksById[task.id] : undefined;
        if (!enriched) return task;
        return {
          ...task,
          ...enriched,
          status: task.status || enriched.status || null,
          priority: task.priority || enriched.priority || null,
          projectId: enriched.projectId || task.projectId || null,
          projectName: enriched.projectName || task.projectName || null,
        };
      }),
    [enrichedTasksById, updatedTasks]
  );
  const updatedCount = displayTasks.length;
  const title =
    updatedCount === 1
      ? "1 ticket updated"
      : updatedCount > 1
        ? `${updatedCount} tickets updated`
        : "Update ticket";

  const firstTask = displayTasks[0];
  return (
    <CompactActionLogLine
      icon={<CheckCircle2 className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title={updatedCount === 1 ? "Updated ticket" : title}
      detail={firstTask ? formatTaskManagementCompactDetail(firstTask) : isLoading ? "updating..." : ""}
      onClick={firstTask?.id ? () => onTaskPreviewClick?.(buildTaskManagementPreviewClickPayload(firstTask)) : undefined}
    />
  );
}

function formatCreatedResourceStatusLabel(resource: RunnerCreatedResourcePreview): string | null {
  if (resource.resourceType !== "release") return null;
  const normalized = String(resource.status || "").trim().toLowerCase();
  if (normalized === "completed" || normalized === "done") return "Completed";
  if (normalized === "active" || normalized === "in_progress") return "Active";
  if (normalized === "planned") return "Planned";
  return null;
}

function formatCreatedResourceMeta(resource: RunnerCreatedResourcePreview): string {
  if (resource.resourceType === "agent") {
    return [resource.model, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  if (resource.resourceType === "skill") {
    return [resource.category, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  if (resource.resourceType === "environment") {
    return [resource.projectName, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  const dateRange = [resource.startAt, resource.endAt].filter(Boolean).join(" - ");
  const taskSummary =
    typeof resource.taskCount === "number" && typeof resource.openTaskCount === "number"
      ? `${resource.openTaskCount}/${resource.taskCount} open`
      : typeof resource.taskCount === "number"
        ? `${resource.taskCount} tasks`
        : "";
  return [dateRange, taskSummary].filter(Boolean).join(" · ");
}

function ResourceCreateLogList({
  resources,
  emptyLabel,
}: {
  resources: RunnerCreatedResourcePreview[];
  emptyLabel: string;
}) {
  if (resources.length === 0) {
    return <div className="tb-log-card-empty">{emptyLabel}</div>;
  }

  return (
    <div className="tb-log-resource-create-list">
      {resources.map((resource) => {
        const meta = formatCreatedResourceMeta(resource);
        const statusLabel = formatCreatedResourceStatusLabel(resource);
        return (
          <div
            key={`${resource.resourceType}:${resource.id}`}
            className={`tb-log-resource-create-item is-${resource.resourceType}`.trim()}
          >
            <div className="tb-log-resource-create-leading">
              <div className={`tb-log-resource-create-icon-slot is-${resource.resourceType}`.trim()}>
                {renderCreatedResourceIcon(resource.resourceType, "tb-log-resource-create-icon")}
              </div>
              <div className="tb-log-resource-create-copy">
                <div className="tb-log-resource-create-title-row">
                  <span className="tb-log-resource-create-title" title={resource.name}>
                    {resource.name}
                  </span>
                  <span className="tb-log-resource-create-type-pill">
                    {getCreatedResourceTypeLabel(resource.resourceType)}
                  </span>
                </div>
                {resource.description ? (
                  <div className="tb-log-resource-create-description" title={resource.description}>
                    {resource.description}
                  </div>
                ) : null}
                {meta ? (
                  <div className="tb-log-resource-create-meta">{meta}</div>
                ) : null}
              </div>
            </div>
            {statusLabel ? (
              <span className={`tb-log-resource-create-status is-${String(resource.status || "planned").trim().toLowerCase()}`.trim()}>
                {statusLabel}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ComputerAgentsCreateLogBox({
  log,
  onAgentPreviewClick,
  onEnvironmentPreviewClick,
  onProjectPreviewClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  onAgentPreviewClick?: RunnerWorkLogEntryProps["onAgentPreviewClick"];
  onEnvironmentPreviewClick?: RunnerWorkLogEntryProps["onEnvironmentPreviewClick"];
  onProjectPreviewClick?: RunnerWorkLogEntryProps["onProjectPreviewClick"];
}) {
  const resources = useMemo(() => collectComputerAgentsCreatedResources(log), [log]);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const mutationVerb = getComputerAgentsMutationVerb(log);
  const title =
    resources.length === 1
      ? `1 resource ${mutationVerb}`
      : resources.length > 1
        ? `${resources.length} resources ${mutationVerb}`
        : mutationVerb === "updated"
          ? "Update resources"
          : "Create resources";
  const firstResource = resources[0];
  const compactTitle =
    firstResource && resources.length === 1
      ? `${mutationVerb === "updated" ? "Updated" : "Created"} ${getCreatedResourceTypeLabel(firstResource.resourceType).toLowerCase()}`
      : title;
  const detail = firstResource
    ? firstResource.name
    : isLoading
      ? mutationVerb === "updated" ? "updating..." : "creating..."
      : "";
  const onClick =
    firstResource?.resourceType === "agent" && firstResource.id
      ? () => onAgentPreviewClick?.({ agentId: firstResource.id, agentName: firstResource.name })
      : firstResource?.resourceType === "environment" && firstResource.id
        ? () => onEnvironmentPreviewClick?.({ environmentId: firstResource.id, environmentName: firstResource.name })
        : firstResource?.resourceType === "project" && firstResource.id
          ? () => onProjectPreviewClick?.({ projectId: firstResource.id, projectName: firstResource.name })
          : undefined;

  return (
    <CompactActionLogLine
      icon={firstResource
        ? renderCreatedResourceIcon(firstResource.resourceType, "tb-log-compact-action-icon-svg")
        : <img className="tb-log-compact-action-runner-icon" src={RUNNER_TRANSPARENT_LOGO_URL} alt="" aria-hidden="true" />}
      title={compactTitle}
      detail={detail}
      onClick={onClick}
    />
  );
}

export function TaskManagementReleaseCreateLogBox({
  log,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  const releases = useMemo(() => collectTaskManagementCreatedReleases(log), [log]);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const title =
    releases.length === 1
      ? "1 milestone created"
      : releases.length > 1
        ? `${releases.length} milestones created`
        : "Create milestones";
  const firstRelease = releases[0];

  return (
    <CompactActionLogLine
      icon={<Calendar className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title={releases.length === 1 ? "Created milestone" : title}
      detail={firstRelease?.name || (isLoading ? "creating..." : "")}
    />
  );
}

export function ComputerAgentsThreadSnapshotLogBox({
  log,
  timeLabel,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  void timeLabel;
  const details = useMemo(() => parseComputerAgentsThreadSnapshotDetails(log), [log]);
  const entries = details?.entries || [];
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const kind = details?.kind || "messages";

  if (kind === "messages" && entries.length === 0 && !isLoading) {
    return null;
  }

  const title = kind === "logs" ? "Retrieved Thread Logs" : "Retrieved Thread";
  const detailParts = [
    details?.threadId || "",
    entries.length > 0
      ? `${entries.length.toLocaleString()} ${kind === "logs" ? "logs" : "messages"}`
      : isLoading
        ? "loading..."
        : "",
  ].filter(Boolean);

  return (
    <CompactActionLogLine
      icon={kind === "logs"
        ? <Terminal className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />
        : <MessageSquare className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title={title}
      detail={detailParts.join(" - ")}
    />
  );
}
