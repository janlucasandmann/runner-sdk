import type { CSSProperties, ReactNode } from "react";
import {
  Bookmark as LucideBookmark,
  Check as LucideCheck,
  ChevronDown as LucideChevronDown,
  ChevronsUp as LucideChevronsUp,
  ChevronUp as LucideChevronUp,
  Equal as LucideEqual,
  Rocket as LucideRocket,
} from "lucide-react";
import { RunnerMarkdown } from "../runner-markdown.js";

export interface RunnerTaskPreview {
  taskId: string;
  projectId: string;
  projectName?: string;
  threadId?: string;
  ticketNumber: string;
  title: string;
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
export type RunnerTaskPreviewType = "task" | "subtask";
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
  return String(value || "").trim().toLowerCase() === "subtask" ? "subtask" : "task";
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
    "--tb-task-preview-surface": presentation.surface,
    "--tb-task-preview-surface-hover": presentation.surfaceHover,
    "--tb-task-preview-border": presentation.border,
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
  if (normalized === "low") {
    return <LucideChevronDown className={`${className} is-low`} strokeWidth={2} />;
  }
  if (normalized === "high") {
    return <LucideChevronUp className={`${className} is-high`} strokeWidth={2} />;
  }
  if (normalized === "critical") {
    return <LucideChevronsUp className={`${className} is-critical`} strokeWidth={2} />;
  }
  return <LucideEqual className={`${className} is-medium`} strokeWidth={2} />;
}

function renderRunnerTaskPreviewAssigneeAvatar(taskPreview: RunnerTaskPreview) {
  const assigneeName = String(taskPreview.assigneeName || "").trim();
  if (!assigneeName) {
    return null;
  }
  const assigneePhotoUrl = String(taskPreview.assigneePhotoUrl || "").trim();

  return (
    <span className="tb-task-preview-assignee-avatar" aria-hidden="true" title={assigneeName}>
      {assigneePhotoUrl
        ? (
          <img
            className="tb-task-preview-assignee-avatar-image"
            src={assigneePhotoUrl}
            alt={assigneeName.charAt(0).toUpperCase()}
          />
        )
        : (
          <span className="tb-task-preview-assignee-avatar-fallback">
            {assigneeName.charAt(0).toUpperCase()}
          </span>
        )}
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
  const isReviewPreview = isRunnerTaskReviewPreview(taskPreview);
  const taskType = normalizeRunnerTaskPreviewType(taskPreview.taskType);

  return (
    <button
      type="button"
      className={`tb-task-preview-card${isReviewPreview ? " is-review" : ""}`.trim()}
      style={getRunnerTaskPreviewColorStyle(taskPreview.taskColor)}
      disabled={isTaskPreviewDeleted}
      onClick={() => {
        if (!isTaskPreviewDeleted && typeof options.onClick === "function") {
          options.onClick(taskPreview);
        }
      }}
    >
      {isReviewPreview ? <div className="tb-task-preview-review-label">Review</div> : null}
      <div className="tb-task-preview-card-header">
        <div className="tb-task-preview-title">{taskPreview.title || "Untitled Task"}</div>
        {renderRunnerTaskPreviewAssigneeAvatar(taskPreview)}
      </div>
      <RunnerMarkdown
        content={String(taskPreview.description || "").trim() || "No description"}
        className="tb-task-preview-card-description tb-message-markdown"
        softBreaks
        disallowHeadings
      />
      <div className="tb-task-preview-card-bottom">
        <div className="tb-task-preview-card-meta-left">
          <div className={`tb-task-preview-type-badge ${taskType === "subtask" ? "is-subtask" : "is-task"}`.trim()}>
            {taskType === "subtask"
              ? <LucideCheck className="tb-task-preview-type-icon" strokeWidth={2} />
              : <LucideBookmark className="tb-task-preview-type-icon" strokeWidth={2} />}
          </div>
          {renderRunnerTaskPreviewPriorityIcon(
            taskPreview.priority,
            "tb-task-preview-priority-icon",
          )}
        </div>
        <span className="tb-task-preview-ticket">{taskPreview.ticketNumber}</span>
      </div>
    </button>
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
