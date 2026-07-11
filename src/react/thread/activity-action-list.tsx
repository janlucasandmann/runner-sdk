import { AlertCircle, CheckCircle2, Circle, Clock3, TerminalSquare } from "lucide-react";
import type { ReactNode } from "react";
import type { RunnerThreadAction } from "../../thread/types.js";

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

function previewPayload(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function DefaultAction({ action }: { action: RunnerThreadAction }) {
  const input = previewPayload(action.input);
  const output = previewPayload(action.output);
  return (
    <div className="tb-thread-action">
      <ActionStatusIcon action={action} />
      <div className="tb-thread-action-main">
        <div className="tb-thread-action-heading">
          <span className="tb-thread-action-title">{action.title}</span>
          {action.toolName ? <span className="tb-thread-action-tool">{action.toolName}</span> : null}
          {action.permissionRing ? (
            <span className={`tb-thread-ring is-ring-${action.permissionRing}`}>R{action.permissionRing}</span>
          ) : null}
        </div>
        {action.summary ? <div className="tb-thread-action-summary">{action.summary}</div> : null}
        {input || output ? (
          <details className="tb-thread-action-raw">
            <summary><TerminalSquare strokeWidth={1.6} /> Details</summary>
            {input ? <><span>Input</span><pre>{input}</pre></> : null}
            {output ? <><span>Output</span><pre>{output}</pre></> : null}
          </details>
        ) : null}
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

