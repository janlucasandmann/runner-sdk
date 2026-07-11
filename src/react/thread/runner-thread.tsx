import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import type {
  RunnerThreadControlAction,
  RunnerThreadEvent,
  RunnerThreadMessage,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRoutingReceipt,
  RunnerThreadRun,
} from "../../thread/types.js";
import { mountRunnerChatStyles } from "../runner-chat-styles.js";
import type { RunnerThreadActionRenderer } from "./activity-action-list.js";
import { RunnerThreadActiveRunsDock } from "./active-runs-dock.js";
import { RunnerThreadTimeline } from "./thread-timeline.js";
import type { RunnerThreadDetailLoadState } from "./run-detail-hydration.js";

export interface RunnerThreadProps {
  projection: RunnerThreadProjection;
  className?: string;
  maxMountedTimelineItems?: number;
  loading?: boolean;
  error?: string | null;
  emptyState?: ReactNode;
  composer?: ReactNode;
  renderMessageContent?: (message: RunnerThreadMessage) => ReactNode;
  renderEvent?: (event: RunnerThreadEvent) => ReactNode;
  renderAction?: RunnerThreadActionRenderer;
  runDetailStates?: Record<string, RunnerThreadDetailLoadState>;
  activityGroupActionStates?: Record<string, RunnerThreadDetailLoadState>;
  onLoadEarlier?: () => Promise<boolean | void> | boolean | void;
  onLoadRunDetails?: (run: RunnerThreadRun) => Promise<void> | void;
  onLoadActivityGroupActions?: (groupId: string, runId: string) => Promise<void> | void;
  onControlRun?: (run: RunnerThreadRun, action: RunnerThreadControlAction) => Promise<void> | void;
  onPermissionDecision?: (request: RunnerThreadPermissionRequest, decision: "allow" | "deny") => Promise<void> | void;
  onCorrectRoute?: (receipt: RunnerThreadRoutingReceipt) => void;
  onOpenChanges?: (run: RunnerThreadRun) => void;
}

export function RunnerThread({
  projection,
  className,
  maxMountedTimelineItems = 200,
  loading = false,
  error,
  emptyState,
  composer,
  renderMessageContent,
  renderEvent,
  renderAction,
  runDetailStates,
  activityGroupActionStates,
  onLoadEarlier,
  onLoadRunDetails,
  onLoadActivityGroupActions,
  onControlRun,
  onPermissionDecision,
  onCorrectRoute,
  onOpenChanges,
}: RunnerThreadProps) {
  const runElements = useRef(new Map<string, HTMLElement>());
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mountRunnerChatStyles();
  }, []);

  const runs = useMemo(() => Object.values(projection.runsById), [projection.runsById]);
  const isEmpty = projection.timeline.length === 0;

  const selectRun = (run: RunnerThreadRun) => {
    runElements.current.get(run.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const loadEarlierWithoutJump = async () => {
    if (!onLoadEarlier) return false;
    const container = scrollContainerRef.current;
    const distanceFromBottom = container ? container.scrollHeight - container.scrollTop : 0;
    const loaded = await onLoadEarlier();
    if (loaded === false) return false;
    if (!container || typeof window === "undefined") return loaded;
    window.requestAnimationFrame(() => {
      container.scrollTop = Math.max(0, container.scrollHeight - distanceFromBottom);
    });
    return loaded;
  };

  return (
    <section className={`tb-runner-chat tb-runner-thread ${className || ""}`.trim()} aria-label="Thread">
      <RunnerThreadActiveRunsDock
        runs={runs}
        projection={projection}
        onSelectRun={selectRun}
        onCancelRun={onControlRun ? (run) => onControlRun(run, "cancel") : undefined}
      />

      <div ref={scrollContainerRef} className="tb-runner-thread-scroll">
        <div className="tb-runner-thread-content">
          {loading && isEmpty ? <div className="tb-runner-thread-state">Loading thread…</div> : null}
          {error ? <div className="tb-runner-thread-state is-error">{error}</div> : null}
          {!loading && !error && isEmpty ? (emptyState || <div className="tb-runner-thread-state">No activity yet.</div>) : null}
          {!isEmpty ? (
            <RunnerThreadTimeline
              projection={projection}
              maxMountedItems={maxMountedTimelineItems}
              renderMessageContent={renderMessageContent}
              renderEvent={renderEvent}
              renderAction={renderAction}
              runDetailStates={runDetailStates}
              activityGroupActionStates={activityGroupActionStates}
              onLoadEarlier={onLoadEarlier ? loadEarlierWithoutJump : undefined}
              onLoadRunDetails={onLoadRunDetails}
              onLoadActivityGroupActions={onLoadActivityGroupActions}
              onControlRun={onControlRun}
              onPermissionDecision={onPermissionDecision}
              onCorrectRoute={onCorrectRoute}
              onOpenChanges={onOpenChanges}
              onRunElement={(runId, element) => {
                if (element) runElements.current.set(runId, element);
                else runElements.current.delete(runId);
              }}
            />
          ) : null}
        </div>
      </div>

      {composer ? <div className="tb-runner-thread-composer">{composer}</div> : null}
    </section>
  );
}
