import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

import {
  normalizeRunnerThreadWorkingLabel,
  selectRunnerThreadActiveRuns,
  selectRunnerThreadRunWorkingLabel,
  type RunnerThreadProjection,
} from "../../thread/index.js";
import { DotLoader } from "../../platform-ui/components/ui/dot-loader/index.js";
import { useRunnerThreadProjection } from "./use-runner-thread-projection.js";

export interface RunnerThreadLiveWorkStatusProps {
  ariaLabel?: string;
  backendUrl: string;
  className?: string;
  credentials?: RequestCredentials;
  enabled?: boolean;
  fallbackLabel?: string;
  headers?: HeadersInit;
  onClick?: () => void;
  organizationId?: string;
  threadId: string;
}

export function resolveRunnerThreadLiveWorkStatusLabel(
  projection: RunnerThreadProjection,
  fallbackLabel?: string,
): string {
  const activeRuns = selectRunnerThreadActiveRuns(projection);
  for (let index = activeRuns.length - 1; index >= 0; index -= 1) {
    const label = selectRunnerThreadRunWorkingLabel(projection, activeRuns[index]!.id);
    if (label) return label;
  }
  return normalizeRunnerThreadWorkingLabel(fallbackLabel) || "Working...";
}

/**
 * Read-only live status for a linked thread. It intentionally consumes the
 * same canonical thread projection used by RunnerChat so overview surfaces do
 * not invent a second, stale description of what an agent is doing.
 */
export function RunnerThreadLiveWorkStatus({
  ariaLabel,
  backendUrl,
  className = "",
  credentials,
  enabled = true,
  fallbackLabel = "",
  headers,
  onClick,
  organizationId,
  threadId,
}: RunnerThreadLiveWorkStatusProps) {
  const normalizedThreadId = threadId.trim();
  const normalizedBackendUrl = backendUrl.trim();
  const liveThread = useRunnerThreadProjection({
    threadId: normalizedThreadId,
    backendUrl: normalizedBackendUrl,
    headers,
    organizationId,
    credentials,
    enabled: enabled && Boolean(normalizedThreadId && normalizedBackendUrl),
    initialLimit: 120,
    includeLegacy: false,
  });
  const headline = resolveRunnerThreadLiveWorkStatusLabel(
    liveThread.projection,
    fallbackLabel,
  );
  const sharedProps = {
    className: `tb-work-header is-static tb-thread-live-work-status${className ? ` ${className}` : ""}`,
  };
  const content = (
    <span className="tb-work-label is-live">
      <span
        className="tb-log-inline-status-spinner-slot tb-work-status-loader"
        aria-hidden="true"
      >
        <DotLoader
          dotCount={9}
          dotSize={3}
          gap={2}
          className="tb-log-inline-status-dot-loader"
        />
      </span>
      <span className="tb-work-label-copy" aria-live="polite">
        {headline}
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button
        {...(sharedProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }
  return <div {...(sharedProps as HTMLAttributes<HTMLDivElement>)}>{content}</div>;
}
