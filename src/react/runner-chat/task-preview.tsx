import type { CSSProperties, ReactNode } from "react";
import {
  AlertCircle as LucideAlertCircle,
  Bookmark as LucideBookmark,
  Check as LucideCheck,
  Circle as LucideCircle,
  CircleCheck as LucideCircleCheck,
  CircleDashed as LucideCircleDashed,
  CircleEllipsis as LucideCircleEllipsis,
  CircleMinus as LucideCircleMinus,
  RefreshCw as LucideRefreshCw,
  Rocket as LucideRocket,
} from "../../platform-ui/components/ui/hugeicons-compat.js";
import { PlatformTicketItem } from "../../platform-ui/components/ui/ticket-item/index.js";
import { RunnerMarkdown } from "../runner-markdown.js";

export interface RunnerTaskPreview {
  taskId: string;
  projectId: string;
  projectName?: string;
  threadId?: string;
  ticketNumber: string;
  title: string;
  createdAt?: string | number | Date | null;
  description?: string;
  taskColor?: string;
  status?: string;
  priority?: string;
  taskType?: string;
  assigneeAgentId?: string;
  assigneeName?: string;
  assigneePhotoUrl?: string;
  environmentId?: string;
  environmentName?: string;
  runKind?: string;
  reviewRequired?: boolean;
  reviewerAgentId?: string;
  sourceThreadId?: string;
  reviewRequest?: boolean;
  showPromptPreview?: boolean;
  reviewCommentId?: string;
  isDeleted?: boolean;
}

export interface RunnerMissionControlPreview {
  prompt?: string;
  projectName?: string;
  projectIcon?: ReactNode;
  agentName?: string;
  agentPhotoUrl?: string;
}

export type RunnerTaskPreviewPriority = "low" | "medium" | "high" | "critical";
export type RunnerTaskPreviewType = "task" | "subtask" | "loop";
export type RunnerTaskPreviewColor = "gray" | "blue" | "green" | "amber" | "rose";

export function normalizeRunnerTaskPreviewPriority(
  value: string | null | undefined,
): RunnerTaskPreviewPriority {
  const normalized = String(value || "").trim().toLowerCase();
  if (
    normalized === "low"
    || normalized === "medium"
    || normalized === "high"
    || normalized === "critical"
  ) {
    return normalized;
  }
  return "medium";
}

export function normalizeRunnerTaskPreviewType(
  value: string | null | undefined,
): RunnerTaskPreviewType {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "subtask" || normalized === "loop") {
    return normalized;
  }
  return "task";
}

export function normalizeRunnerTaskPreviewColor(
  value: string | null | undefined,
): RunnerTaskPreviewColor {
  const normalized = String(value || "").trim().toLowerCase();
  if (
    normalized === "gray"
    || normalized === "green"
    || normalized === "amber"
    || normalized === "rose"
  ) {
    return normalized;
  }
  return normalized === "blue" ? "blue" : "gray";
}

export function getRunnerTaskPreviewColorStyle(
  value: string | null | undefined,
): CSSProperties {
  const normalized = normalizeRunnerTaskPreviewColor(value);
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
    "--tb-task-preview-accent": presentation.accent,
    "--tb-task-preview-surface": "rgba(255, 255, 255, 0.075)",
    "--tb-task-preview-surface-hover": presentation.surfaceHover,
    "--tb-task-preview-border": presentation.border,
    "--playground-task-color-accent": presentation.accent,
    "--playground-task-color-surface": "rgba(255, 255, 255, 0.075)",
    "--playground-task-color-surface-hover": presentation.surfaceHover,
    "--playground-task-color-surface-active": presentation.surfaceHover,
  } as CSSProperties;
}

export function isRunnerTaskReviewPreview(taskPreview: RunnerTaskPreview): boolean {
  return String(taskPreview.runKind || "").trim().toLowerCase() === "review";
}

function renderRunnerTaskPreviewPriorityIcon(
  priority: string | null | undefined,
  className: string,
) {
  const normalized = normalizeRunnerTaskPreviewPriority(priority);
  if (normalized === "critical") {
    return (
      <span
        className={`playground-tasks-priority-value is-critical ${className}`}
        title="Urgent"
        aria-label="Urgent"
      >
        <LucideAlertCircle
          className="playground-tasks-priority-value-icon"
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>
    );
  }
  const level = normalized === "low" ? 1 : normalized === "high" ? 3 : 2;
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return (
    <span
      className={`playground-tasks-priority-value is-${normalized} ${className}`}
      title={label}
      aria-label={label}
    >
      <span
        className="platform-priority-bars-icon playground-tasks-priority-value-icon playground-tasks-priority-bars-icon"
        aria-hidden="true"
      >
        {[1, 2, 3].map((barLevel) => (
          <span
            key={barLevel}
            className={`platform-priority-bars-icon__bar playground-tasks-priority-bars-bar${barLevel <= level ? " is-active" : ""}`}
          />
        ))}
      </span>
    </span>
  );
}

function renderRunnerTaskPreviewAssigneeAvatar(taskPreview: RunnerTaskPreview) {
  const assigneeName = String(taskPreview.assigneeName || "").trim();
  if (!assigneeName) {
    return null;
  }
  const assigneePhotoUrl = String(taskPreview.assigneePhotoUrl || "").trim();

  return (
    <span className="playground-tasks-board-assignee-avatar" aria-hidden="true" title={assigneeName}>
      {assigneePhotoUrl
        ? (
          <img
            className="playground-tasks-board-assignee-avatar-image"
            src={assigneePhotoUrl}
            alt={assigneeName.charAt(0).toUpperCase()}
          />
        )
        : (
          <span className="playground-tasks-board-assignee-avatar-fallback">
            {assigneeName.charAt(0).toUpperCase()}
          </span>
        )}
    </span>
  );
}

function normalizeRunnerTaskPreviewStatus(value: string | null | undefined) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "doing") return "in_progress";
  if (normalized === "review") return "in_review";
  if (normalized === "cancelled") return "canceled";
  return [
    "backlog",
    "todo",
    "in_progress",
    "done",
    "canceled",
    "blocked",
    "in_review",
  ].includes(normalized)
    ? normalized
    : "todo";
}

function renderRunnerTaskPreviewStatus(taskPreview: RunnerTaskPreview) {
  const status = normalizeRunnerTaskPreviewStatus(taskPreview.status);
  const presentation = status === "backlog"
    ? { label: "Backlog", Icon: LucideCircleDashed, tone: "is-backlog" }
    : status === "in_progress"
      ? { label: "In Progress", Icon: LucideCircleEllipsis, tone: "is-in-progress" }
      : status === "done"
        ? { label: "Done", Icon: LucideCircleCheck, tone: "is-done" }
        : status === "canceled"
          ? { label: "Canceled", Icon: LucideCircleMinus, tone: "is-canceled" }
          : status === "blocked"
            ? { label: "Blocked", Icon: LucideAlertCircle, tone: "is-blocked" }
            : status === "in_review"
              ? { label: "In Review", Icon: LucideCircleEllipsis, tone: "is-in-review" }
              : { label: "Todo", Icon: LucideCircle, tone: "is-todo" };
  const { Icon } = presentation;

  return (
    <span title={presentation.label} aria-label={presentation.label}>
      <Icon
        className={`playground-tasks-status-icon ${presentation.tone} playground-tasks-lane-card-status-icon`}
        strokeWidth={status === "in_progress" ? 1.7 : 2}
        aria-hidden="true"
      />
    </span>
  );
}

export function renderRunnerTaskPreviewCard(
  taskPreview: RunnerTaskPreview,
  options: {
    onClick?: ((preview: RunnerTaskPreview) => void) | undefined;
  } = {},
) {
  const isTaskPreviewDeleted = Boolean(taskPreview.isDeleted);
  const taskType = normalizeRunnerTaskPreviewType(taskPreview.taskType);
  const typeIcon = taskType === "subtask"
    ? <LucideCheck width={14} height={14} strokeWidth={1.9} />
    : taskType === "loop"
      ? <LucideRefreshCw width={14} height={14} strokeWidth={1.9} />
      : <LucideBookmark width={14} height={14} strokeWidth={1.9} />;

  return (
    <PlatformTicketItem
      variant="card"
      style={getRunnerTaskPreviewColorStyle(taskPreview.taskColor)}
      title={taskPreview.title || "Untitled Task"}
      taskType={taskType}
      typeIcon={typeIcon}
      priority={renderRunnerTaskPreviewPriorityIcon(
        taskPreview.priority,
        "playground-tasks-lane-card-priority",
      )}
      ticketNumber={taskPreview.ticketNumber}
      status={renderRunnerTaskPreviewStatus(taskPreview)}
      createdAt={taskPreview.createdAt}
      assignee={renderRunnerTaskPreviewAssigneeAvatar(taskPreview)}
      completed={normalizeRunnerTaskPreviewStatus(taskPreview.status) === "done"}
      disabled={isTaskPreviewDeleted}
      onClick={() => {
        if (!isTaskPreviewDeleted && typeof options.onClick === "function") {
          options.onClick(taskPreview);
        }
      }}
    />
  );
}

export function renderRunnerMissionControlPreviewCard(
  preview: RunnerMissionControlPreview | null | undefined,
) {
  const prompt = String(preview?.prompt || "").trim() || "Run mission control.";
  const projectName = String(preview?.projectName || "").trim() || "Project";

  return (
    <div className="tb-task-preview-card tb-mission-control-preview-card" role="presentation">
      <div className="tb-mission-control-preview-header">
        <span className="tb-mission-control-preview-title">
          <span>Mission Control</span>
        </span>
      </div>
      <RunnerMarkdown
        content={prompt}
        className="tb-mission-control-preview-copy tb-message-markdown"
        softBreaks
        disallowHeadings
      />
      <div className="tb-mission-control-preview-footer">
        <span className="tb-mission-control-preview-project">
          <span className="tb-mission-control-preview-project-icon" aria-hidden="true">
            {preview?.projectIcon || <LucideRocket strokeWidth={1.8} />}
          </span>
          <span className="tb-mission-control-preview-project-name">{projectName}</span>
        </span>
      </div>
    </div>
  );
}

export function getRunnerMissionControlAgentName(
  preview: RunnerMissionControlPreview | null | undefined,
): string {
  return String(preview?.agentName || "").trim() || "Mission Control";
}

export function getRunnerMissionControlAgentPhotoUrl(
  preview: RunnerMissionControlPreview | null | undefined,
): string {
  return String(preview?.agentPhotoUrl || "").trim();
}
