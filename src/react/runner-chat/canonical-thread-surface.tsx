import { LoaderCircle } from "lucide-react";
import type {
  RunnerThreadControlAction,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
} from "../../thread/types.js";
import { RunnerMarkdown, stripRunnerSystemTags } from "../runner-markdown.js";
import type { RunnerThreadActionRenderer } from "../thread/activity-action-list.js";
import type { RunnerThreadDetailLoadState } from "../thread/run-detail-hydration.js";
import { RunnerThreadTimeline } from "../thread/thread-timeline.js";
import { CollapsibleRunnerUserPrompt } from "./run-summary-content.js";

export interface RunnerCanonicalThreadSurfaceProps {
  activityGroupActionStates?: Record<string, RunnerThreadDetailLoadState>;
  connected: boolean;
  error?: string | null;
  fallbackRunAgentName?: string | null;
  fallbackRunWorkspaceName?: string | null;
  hasContent: boolean;
  loading: boolean;
  onControlRun?: (
    run: RunnerThreadRun,
    action: RunnerThreadControlAction,
  ) => Promise<void> | void;
  onLoadActivityGroupActions?: (
    groupId: string,
    runId: string,
  ) => Promise<void> | void;
  // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the existing thread pagination callback contract.
  onLoadEarlier?: () => Promise<boolean | void> | boolean | void;
  onLoadRunDetails?: (run: RunnerThreadRun) => Promise<void> | void;
  onOpenChanges?: (run: RunnerThreadRun) => void;
  onPermissionDecision?: (
    request: RunnerThreadPermissionRequest,
    decision: "allow" | "deny",
  ) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
  projection: RunnerThreadProjection;
  reconnecting: boolean;
  renderAction?: RunnerThreadActionRenderer;
  runDetailStates?: Record<string, RunnerThreadDetailLoadState>;
}

function renderCanonicalMessage(message: { content: string }) {
  return (
    <RunnerMarkdown
      content={stripRunnerSystemTags(message.content)}
      className="tb-thread-message-markdown"
      softBreaks
    />
  );
}

function renderCanonicalUserMessage(message: { content: string }) {
  return (
    <CollapsibleRunnerUserPrompt
      content={stripRunnerSystemTags(message.content)}
      className="tb-message-markdown tb-message-markdown-user"
    />
  );
}

export function RunnerCanonicalThreadSurface({
  activityGroupActionStates,
  connected,
  error,
  fallbackRunAgentName,
  fallbackRunWorkspaceName,
  hasContent,
  loading,
  onControlRun,
  onLoadActivityGroupActions,
  onLoadEarlier,
  onLoadRunDetails,
  onOpenChanges,
  onPermissionDecision,
  onRefresh,
  projection,
  reconnecting,
  renderAction,
  runDetailStates,
}: RunnerCanonicalThreadSurfaceProps) {
  return (
    <div className="tb-canonical-thread-surface" data-connected={connected ? "true" : "false"}>
      {reconnecting && hasContent ? (
        <div className="tb-canonical-thread-connection" role="status">
          <LoaderCircle className="tb-context-action-notice-icon-spinner" strokeWidth={1.6} />
          Reconnecting live activity…
        </div>
      ) : null}
      {loading && !hasContent ? (
        <div className="runner-log-empty">Loading conversation…</div>
      ) : null}
      {error && !hasContent ? (
        <div className="tb-canonical-thread-error" role="alert">
          <span>{error}</span>
          {onRefresh ? (
            <button type="button" onClick={() => void Promise.resolve(onRefresh()).catch(() => undefined)}>
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
      {!loading && !error && !hasContent ? (
        <div className="runner-log-empty">No activity yet. Send a message to start this thread.</div>
      ) : null}

      <RunnerThreadTimeline
        projection={projection}
        fallbackRunAgentName={fallbackRunAgentName}
        fallbackRunWorkspaceName={fallbackRunWorkspaceName}
        maxMountedItems={200}
        runDetailStates={runDetailStates}
        activityGroupActionStates={activityGroupActionStates}
        onLoadRunDetails={onLoadRunDetails}
        onLoadActivityGroupActions={onLoadActivityGroupActions}
        renderAction={renderAction}
        renderMessageContent={renderCanonicalMessage}
        renderUserMessageContent={renderCanonicalUserMessage}
        onLoadEarlier={onLoadEarlier}
        onControlRun={onControlRun}
        onOpenChanges={onOpenChanges}
        onPermissionDecision={onPermissionDecision}
      />
    </div>
  );
}
