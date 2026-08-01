import {
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CirclePause,
  CircleStop,
  Clock3,
  ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  RunnerThreadRunReceiptViewModel,
  RunnerThreadScreenPhase,
} from "../../../../thread/presentation.js";
import { DotLoader } from "../../ui/dot-loader/index.js";

export interface PlatformThreadRunReceiptProps {
  receipt: RunnerThreadRunReceiptViewModel;
  avatar?: ReactNode;
  selected?: boolean;
  fallbackAgentName?: string | null;
  fallbackWorkspaceName?: string | null;
  onSelect?: (receipt: RunnerThreadRunReceiptViewModel) => void;
}

function formatDuration(durationMs: number): string {
  const seconds = Math.max(0, Math.round(durationMs / 1_000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function PhaseIcon({ phase }: { phase: RunnerThreadScreenPhase }) {
  if (phase === "completed") return <CheckCircle2 strokeWidth={1.8} aria-hidden="true" />;
  if (phase === "failed") return <CircleAlert strokeWidth={1.8} aria-hidden="true" />;
  if (phase === "cancelled") return <CircleStop strokeWidth={1.8} aria-hidden="true" />;
  if (phase === "paused") return <CirclePause strokeWidth={1.8} aria-hidden="true" />;
  if (phase === "waiting_permission") return <ShieldAlert strokeWidth={1.8} aria-hidden="true" />;
  return <Clock3 strokeWidth={1.8} aria-hidden="true" />;
}

export function PlatformThreadRunReceipt({
  receipt,
  avatar,
  selected = false,
  fallbackAgentName,
  fallbackWorkspaceName,
  onSelect,
}: PlatformThreadRunReceiptProps) {
  const actorName = receipt.actor?.displayName || fallbackAgentName || "Agent";
  const workspaceName = receipt.workspaceLabel || fallbackWorkspaceName || "";
  const contextLabel = workspaceName ? `${actorName} on ${workspaceName}` : actorName;
  const totalTokens = receipt.metrics.inputTokens + receipt.metrics.outputTokens;

  return (
    <button
      type="button"
      className={`platform-thread-run-receipt is-${receipt.phase}${receipt.active ? " is-active" : ""}${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      aria-label={`Open execution details for ${receipt.headline}`}
      onClick={() => onSelect?.(receipt)}
    >
      <span className="platform-thread-run-receipt__avatar" aria-hidden={!avatar}>
        {avatar}
      </span>
      <span className="platform-thread-run-receipt__content">
        <span className="platform-thread-run-receipt__context">{contextLabel}</span>
        <span className="platform-thread-run-receipt__headline-row">
          {receipt.active ? (
            <DotLoader
              dotCount={9}
              dotSize={2}
              gap={2}
              color="currentColor"
              className="platform-thread-run-receipt__loader"
            />
          ) : (
            <span className="platform-thread-run-receipt__phase-icon">
              <PhaseIcon phase={receipt.phase} />
            </span>
          )}
          <span className="platform-thread-run-receipt__headline">{receipt.headline}</span>
        </span>
        {receipt.summary && receipt.summary !== receipt.headline ? (
          <span className="platform-thread-run-receipt__summary">{receipt.summary}</span>
        ) : null}
        <span className="platform-thread-run-receipt__meta">
          <span>
            {receipt.metrics.actionCount} {receipt.metrics.actionCount === 1 ? "action" : "actions"}
          </span>
          {receipt.metrics.pendingPermissionCount ? (
            <span>{receipt.metrics.pendingPermissionCount} awaiting approval</span>
          ) : null}
          {totalTokens ? <span>{totalTokens.toLocaleString()} tokens</span> : null}
          <span>{formatDuration(receipt.durationMs)}</span>
        </span>
      </span>
      <span className="platform-thread-run-receipt__status">
        <span>{receipt.phaseLabel}</span>
        <ChevronRight strokeWidth={1.7} aria-hidden="true" />
      </span>
    </button>
  );
}
