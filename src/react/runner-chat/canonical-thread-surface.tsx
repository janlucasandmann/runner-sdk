import { LoaderCircle } from "../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlatformThreadScreen } from "../../platform-ui/components/thread-components/thread-screen/index.js";
import { buildRunnerThreadScreenViewModel } from "../../thread/presentation.js";
import type {
  RunnerThreadControlAction,
  RunnerThreadMessage,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
} from "../../thread/types.js";
import { RunnerMarkdown, stripRunnerSystemTags } from "../runner-markdown.js";
import type { RunnerThreadActionRenderer } from "../thread/activity-action-list.js";
import { RunnerThreadExecutionWorkbench } from "../thread/execution-workbench.js";
import { RunnerThreadLiveSupervisionDock } from "../thread/live-supervision-dock.js";
import type { RunnerThreadDetailLoadState } from "../thread/run-detail-hydration.js";
import { RunnerThreadTimeline } from "../thread/thread-timeline.js";
import { RunnerUserMessageContent } from "./message-connectors.js";
import type { RunnerChatConnectorOption, RunnerThreadTaskListSummary } from "./public-types.js";
import { CollapsibleRunnerUserPrompt } from "./run-summary-content.js";

export interface RunnerCanonicalThreadSurfaceProps {
  activityGroupActionStates?: Record<string, RunnerThreadDetailLoadState>;
  availableConnectorOptions?: readonly RunnerChatConnectorOption[];
  taskList?: RunnerThreadTaskListSummary | null;
  connected: boolean;
  error?: string | null;
  fallbackRunAgentName?: string | null;
  fallbackRunWorkspaceName?: string | null;
  hasContent: boolean;
  loading: boolean;
  onControlRun?: (run: RunnerThreadRun, action: RunnerThreadControlAction) => Promise<void> | void;
  onLoadActivityGroupActions?: (groupId: string, runId: string) => Promise<void> | void;
  // biome-ignore lint/suspicious/noConfusingVoidType: Preserves the existing thread pagination callback contract.
  onLoadEarlier?: () => Promise<boolean | void> | boolean | void;
  onLoadRunDetails?: (run: RunnerThreadRun) => Promise<void> | void;
  onOpenChanges?: (run: RunnerThreadRun) => void;
  executionWorkbenchOpen?: boolean;
  onExecutionWorkbenchOpenChange?: (isOpen: boolean) => void;
  onExecutionWorkbenchAvailabilityChange?: (isAvailable: boolean) => void;
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

function renderCanonicalUserMessage(
  message: RunnerThreadMessage,
  availableConnectorOptions: readonly RunnerChatConnectorOption[],
) {
  return (
    <RunnerUserMessageContent
      metadata={message.metadata}
      availableConnectorOptions={availableConnectorOptions}
    >
      <CollapsibleRunnerUserPrompt
        content={stripRunnerSystemTags(message.content)}
        className="tb-message-markdown tb-message-markdown-user"
      />
    </RunnerUserMessageContent>
  );
}

export function RunnerCanonicalThreadSurface({
  activityGroupActionStates,
  availableConnectorOptions = [],
  taskList,
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
  executionWorkbenchOpen,
  onExecutionWorkbenchOpenChange,
  onExecutionWorkbenchAvailabilityChange,
  onPermissionDecision,
  onRefresh,
  projection,
  reconnecting,
  renderAction,
  runDetailStates,
}: RunnerCanonicalThreadSurfaceProps) {
  const screen = useMemo(() => buildRunnerThreadScreenViewModel(projection), [projection]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [internalWorkbenchOpen, setInternalWorkbenchOpen] = useState(false);
  const currentThreadIdRef = useRef<string | null>(null);
  const onWorkbenchOpenChangeRef = useRef(onExecutionWorkbenchOpenChange);
  const onWorkbenchAvailabilityChangeRef = useRef(onExecutionWorkbenchAvailabilityChange);
  onWorkbenchOpenChangeRef.current = onExecutionWorkbenchOpenChange;
  onWorkbenchAvailabilityChangeRef.current = onExecutionWorkbenchAvailabilityChange;
  const workbenchOpen = executionWorkbenchOpen ?? internalWorkbenchOpen;
  const selectedReceipt = selectedRunId
    ? screen.receipts.find((receipt) => receipt.id === selectedRunId) || null
    : null;
  const workbenchAvailable = Boolean(projection.threadId);

  useEffect(() => {
    if (currentThreadIdRef.current === projection.threadId) return;
    currentThreadIdRef.current = projection.threadId;
    setSelectedRunId(screen.defaultRunId);
    setInternalWorkbenchOpen(false);
    onWorkbenchOpenChangeRef.current?.(false);
  }, [projection.threadId, screen.defaultRunId]);

  useEffect(() => {
    if (!screen.defaultRunId) {
      setSelectedRunId(null);
      setInternalWorkbenchOpen(false);
      return;
    }
    if (selectedRunId && screen.receipts.some((receipt) => receipt.id === selectedRunId)) return;
    setSelectedRunId(screen.defaultRunId);
  }, [screen.defaultRunId, screen.receipts, selectedRunId]);

  useEffect(() => {
    onWorkbenchAvailabilityChangeRef.current?.(workbenchAvailable);
    return () => onWorkbenchAvailabilityChangeRef.current?.(false);
  }, [workbenchAvailable]);

  useEffect(() => {
    if (!workbenchOpen || selectedReceipt || !screen.defaultRunId) return;
    setSelectedRunId(screen.defaultRunId);
  }, [screen.defaultRunId, selectedReceipt, workbenchOpen]);

  const closeWorkbench = () => {
    if (executionWorkbenchOpen === undefined) setInternalWorkbenchOpen(false);
    onWorkbenchOpenChangeRef.current?.(false);
  };

  const conversation = (
    <>
      {reconnecting && hasContent ? (
        <div className="tb-canonical-thread-connection" role="status">
          <LoaderCircle className="tb-context-action-notice-icon-spinner" strokeWidth={1.6} />
          Reconnecting live activity...
        </div>
      ) : null}
      {loading && !hasContent ? (
        <div className="runner-log-empty">Loading conversation...</div>
      ) : null}
      {error && !hasContent ? (
        <div className="tb-canonical-thread-error" role="alert">
          <span>{error}</span>
          {onRefresh ? (
            <button
              type="button"
              onClick={() => void Promise.resolve(onRefresh()).catch(() => undefined)}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
      {!loading && !error && !hasContent ? (
        <div className="runner-log-empty">
          No activity yet. Send a message to start this thread.
        </div>
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
        renderUserMessageContent={(message) =>
          renderCanonicalUserMessage(message, availableConnectorOptions)
        }
        onLoadEarlier={onLoadEarlier}
        onControlRun={onControlRun}
        onOpenChanges={onOpenChanges}
        onPermissionDecision={onPermissionDecision}
        runPresentation="activity-card"
        showLiveSupervision={false}
      />
    </>
  );

  return (
    <div
      className="tb-canonical-thread-surface is-workbench-capable"
      data-connected={connected ? "true" : "false"}
    >
      <PlatformThreadScreen
        conversation={conversation}
        workbenchOpen={workbenchOpen && workbenchAvailable}
        decisionBar={
          screen.pendingPermissionCount ? (
            <RunnerThreadLiveSupervisionDock
              projection={projection}
              onPermissionDecision={onPermissionDecision}
            />
          ) : null
        }
        workbench={
          workbenchAvailable ? (
            <RunnerThreadExecutionWorkbench
              key={selectedReceipt?.id || `task-list:${projection.threadId}`}
              receipt={selectedReceipt}
              projection={projection}
              taskList={taskList}
              availableConnectorOptions={availableConnectorOptions}
              detailLoadState={
                selectedReceipt
                  ? runDetailStates?.[selectedReceipt.id] ||
                    (onLoadRunDetails ? { status: "idle", error: null } : undefined)
                  : undefined
              }
              activityGroupActionStates={activityGroupActionStates}
              renderAction={renderAction}
              onClose={closeWorkbench}
              onLoadRunDetails={onLoadRunDetails}
              onLoadActivityGroupActions={onLoadActivityGroupActions}
              onControlRun={onControlRun}
              onOpenChanges={onOpenChanges}
              onPermissionDecision={onPermissionDecision}
            />
          ) : null
        }
      />
    </div>
  );
}
