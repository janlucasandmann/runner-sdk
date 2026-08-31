import { AlertCircle, CheckCircle2, Circle, Clock3 } from "../../platform-ui/components/ui/hugeicons-compat.js";
import type { ReactNode } from "react";
import type { RunnerEventType, RunnerLog, RunnerLogType } from "../../types.js";
import { describeRunnerThreadAction } from "../../thread/action-presentation.js";
import type { RunnerThreadAction } from "../../thread/types.js";

export { describeRunnerThreadAction } from "../../thread/action-presentation.js";

export type RunnerThreadActionRenderer = (action: RunnerThreadAction) => ReactNode;

export interface RunnerThreadActivityActionListProps {
  actions: RunnerThreadAction[];
  renderAction?: RunnerThreadActionRenderer;
}

function ActionStatusIcon({ action }: { action: RunnerThreadAction }) {
  if (action.status === "failed" || action.status === "blocked") {
    return <AlertCircle className="tb-thread-action-status is-error" strokeWidth={1.7} />;
  }
  if (action.status === "completed" || action.status === "succeeded") {
    return <CheckCircle2 className="tb-thread-action-status is-success" strokeWidth={1.7} />;
  }
  if (action.status === "running" || action.status === "pending") {
    return <Clock3 className="tb-thread-action-status is-pending" strokeWidth={1.7} />;
  }
  return <Circle className="tb-thread-action-status" strokeWidth={1.7} />;
}

function payloadRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string" || !value.trim().startsWith("{")) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function recordText(record: Record<string, unknown> | null, ...keys: string[]): string {
  for (const key of keys) {
    const value = record?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

const RUNNER_LOG_EVENT_TYPES = new Set<RunnerEventType>([
  "user_message",
  "agent_message",
  "reasoning",
  "subagent_invocation",
  "command_execution",
  "mcp_tool_call",
  "mcp_log",
  "file_change",
  "todo_list",
  "action_summary",
  "setup",
  "startup",
  "turn_completed",
  "planning",
  "llm_response",
  "deep_research",
  "metronome_workflow",
  "permission_request",
]);

function serializeActionValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Restores the original RunnerLog shape so grouped canonical actions use the
 * same specialized log-box dispatcher as the legacy thread surface. */
export function adaptRunnerThreadActionToRunnerLog(action: RunnerThreadAction): RunnerLog {
  const sourceMetadata = action.metadata || {};
  const input = payloadRecord(action.input);
  const metadataEventType = recordText(sourceMetadata, "legacyEventType", "eventType", "event_type");
  const eventTypeCandidate = metadataEventType || String(action.type || "").trim();
  const command = recordText(sourceMetadata, "command") || recordText(input, "command");
  const toolName = String(action.toolName || recordText(sourceMetadata, "toolName", "tool_name", "tool") || "").trim();
  const eventType = RUNNER_LOG_EVENT_TYPES.has(eventTypeCandidate as RunnerEventType)
    ? eventTypeCandidate as RunnerEventType
    : command
      ? "command_execution"
      : toolName
        ? "mcp_tool_call"
        : "command_execution";
  const normalizedStatus = String(action.status || "").trim().toLowerCase();
  const type: RunnerLogType = normalizedStatus === "failed" || normalizedStatus === "blocked"
    ? "error"
    : normalizedStatus === "completed" || normalizedStatus === "succeeded"
      ? "success"
      : "info";
  const existingFilePaths = Array.isArray(sourceMetadata.filePaths)
    ? sourceMetadata.filePaths.filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    : [];
  const touchedFilePaths = (action.touchedResources || [])
    .map((resource) => String(resource.path || "").trim())
    .filter(Boolean);
  const output = sourceMetadata.output !== undefined
    ? serializeActionValue(sourceMetadata.output)
    : serializeActionValue(action.output);
  const metadata = {
    ...sourceMetadata,
    ...(command ? { command } : {}),
    ...(toolName ? { toolName } : {}),
    toolId: recordText(sourceMetadata, "toolId", "tool_id") || action.id,
    status: normalizedStatus === "failed" || normalizedStatus === "blocked"
      ? "failed"
      : normalizedStatus === "running" || normalizedStatus === "pending"
        ? "running"
        : "completed",
    ...(input ? { toolInput: sourceMetadata.toolInput || input } : {}),
    ...(action.input !== undefined ? { args: sourceMetadata.args ?? action.input } : {}),
    ...(output ? { output } : {}),
    ...(action.output !== undefined ? { result: sourceMetadata.result ?? action.output } : {}),
    ...((existingFilePaths.length > 0 || touchedFilePaths.length > 0)
      ? { filePaths: existingFilePaths.length > 0 ? existingFilePaths : touchedFilePaths }
      : {}),
  } as RunnerLog["metadata"];

  return {
    createdAt: action.createdAt,
    time: recordText(sourceMetadata, "time") || "",
    message: String(action.summary || action.title || "").trim(),
    type,
    eventType,
    isActionSummary: eventType === "action_summary",
    isReasoning: eventType === "reasoning",
    isPlanning: eventType === "planning",
    isLLMResponse: eventType === "llm_response",
    metadata,
  };
}

function DefaultAction({ action }: { action: RunnerThreadAction }) {
  const description = describeRunnerThreadAction(action);
  return (
    <div className="tb-thread-action">
      <ActionStatusIcon action={action} />
      <div className="tb-thread-action-main">
        <div className="tb-thread-action-heading">
          <span className="tb-thread-action-title">{description}</span>
          {action.permissionRing ? (
            <span className={`tb-thread-ring is-ring-${action.permissionRing}`}>R{action.permissionRing}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function RunnerThreadActivityActionList({
  actions,
  renderAction,
}: RunnerThreadActivityActionListProps) {
  if (actions.length === 0) return null;
  return (
    <div className="tb-thread-action-list">
      {actions.map((action) => (
        <div key={action.id} className="tb-thread-action-renderer">
          {renderAction ? renderAction(action) : <DefaultAction action={action} />}
        </div>
      ))}
    </div>
  );
}
