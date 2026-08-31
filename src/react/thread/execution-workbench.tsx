import { Circle, CircleCheck, ExternalLink, LoaderCircle, Plug } from "../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useRef } from "react";
import { ConnectionIdentityIcon } from "../../platform-resources/shared/connections/connection-identity-icon.js";
import {
  PlatformThreadSummaryPanel,
  type PlatformThreadSummarySection,
} from "../../platform-ui/components/thread-components/thread-screen/index.js";
import { PlatformIconButton } from "../../platform-ui/components/ui/icon-button/index.js";
import { PlatformPermissionMiniRingIcon } from "../../platform-ui/pages/permissions/index.js";
import { collectRunnerConnectorIdsFromStructuredEvidence } from "../../thread/message-connector-metadata.js";
import type { RunnerThreadRunReceiptViewModel } from "../../thread/presentation.js";
import {
  selectRunnerThreadActivityGroups,
  selectRunnerThreadRunActions,
} from "../../thread/selectors.js";
import type {
  RunnerThreadAction,
  RunnerThreadControlAction,
  RunnerThreadPermissionRequest,
  RunnerThreadProjection,
  RunnerThreadRun,
} from "../../thread/types.js";
import { resolveRunnerMessageConnectorOptions } from "../runner-chat/composer-connectors.js";
import type {
  RunnerChatConnectorOption,
  RunnerThreadTaskListSummary,
} from "../runner-chat/public-types.js";
import type { RunnerThreadActionRenderer } from "./activity-action-list.js";
import type { RunnerThreadDetailLoadState } from "./run-detail-hydration.js";

export type RunnerThreadWorkbenchTab = "activity" | "changes" | "artifacts" | "context";

export interface RunnerThreadExecutionWorkbenchProps {
  receipt?: RunnerThreadRunReceiptViewModel | null;
  projection: RunnerThreadProjection;
  taskList?: RunnerThreadTaskListSummary | null;
  availableConnectorOptions?: readonly RunnerChatConnectorOption[];
  usedConnectorIds?: readonly string[];
  detailLoadState?: RunnerThreadDetailLoadState;
  activityGroupActionStates?: Record<string, RunnerThreadDetailLoadState>;
  renderAction?: RunnerThreadActionRenderer;
  onClose: () => void;
  onLoadRunDetails?: (run: RunnerThreadRun) => Promise<void> | void;
  onLoadActivityGroupActions?: (groupId: string, runId: string) => Promise<void> | void;
  onControlRun?: (run: RunnerThreadRun, action: RunnerThreadControlAction) => Promise<void> | void;
  onOpenChanges?: (run: RunnerThreadRun) => void;
  onPermissionDecision?: (
    request: RunnerThreadPermissionRequest,
    decision: "allow" | "deny",
  ) => Promise<void> | void;
}

function deduplicateResources(actions: RunnerThreadAction[]) {
  return Array.from(
    new Map(
      actions
        .flatMap((action) => action.touchedResources || [])
        .map((resource) => {
          const key = [
            resource.kind,
            resource.id,
            resource.path,
            resource.url,
            resource.label,
          ].join(":");
          return [key, resource] as const;
        }),
    ).values(),
  );
}

function connectorIdentityKind(option: RunnerChatConnectorOption): "tags" | "plugins" {
  return option.kind === "tag" ? "tags" : "plugins";
}

function connectorOptionsUsedInThread(
  projection: RunnerThreadProjection,
  availableOptions: readonly RunnerChatConnectorOption[],
  additionalConnectorIds: readonly string[],
): RunnerChatConnectorOption[] {
  const connectorIds = new Set(additionalConnectorIds);

  for (const action of Object.values(projection.actionsById)) {
    collectRunnerConnectorIdsFromStructuredEvidence(
      {
        toolName: action.toolName,
        input: action.input,
        output: action.output,
        metadata: action.metadata,
        touchedResources: action.touchedResources,
      },
      connectorIds,
    );
  }
  for (const run of Object.values(projection.runsById)) {
    collectRunnerConnectorIdsFromStructuredEvidence(
      { metadata: run.metadata, origin: run.origin, projection: run.projection },
      connectorIds,
    );
  }
  for (const event of Object.values(projection.eventsById)) {
    collectRunnerConnectorIdsFromStructuredEvidence(event.payload, connectorIds);
  }
  for (const message of Object.values(projection.messagesById)) {
    collectRunnerConnectorIdsFromStructuredEvidence(message.metadata, connectorIds);
  }

  return resolveRunnerMessageConnectorOptions(
    { runnerConnectorIds: Array.from(connectorIds) },
    availableOptions,
  );
}

export function RunnerThreadExecutionWorkbench({
  receipt,
  projection,
  taskList,
  availableConnectorOptions = [],
  usedConnectorIds = [],
  detailLoadState,
  onLoadRunDetails,
  onOpenChanges,
}: RunnerThreadExecutionWorkbenchProps) {
  const requestedRunIdsRef = useRef(new Set<string>());
  const run = receipt?.run || null;
  const groups = useMemo(
    () => (run ? selectRunnerThreadActivityGroups(projection, { runId: run.id }) : []),
    [projection, run],
  );
  const actions = useMemo(
    () =>
      run
        ? selectRunnerThreadRunActions(projection, run.id)
        : Object.values(projection.actionsById),
    [projection, run],
  );
  const permissions = useMemo(
    () =>
      Object.values(projection.permissionsById).filter(
        (permission) => !run || permission.runId === run.id,
      ),
    [projection.permissionsById, run],
  );
  const resources = useMemo(() => deduplicateResources(actions), [actions]);
  const connectors = useMemo(
    () => connectorOptionsUsedInThread(projection, availableConnectorOptions, usedConnectorIds),
    [availableConnectorOptions, projection, usedConnectorIds],
  );
  const taskItems = taskList?.items || [];

  const permissionGroups = useMemo(() => {
    const summaries = groups.flatMap((group) => {
      const groupPermissions = permissions.filter(
        (permission) => permission.activityGroupId === group.id,
      );
      const groupActions = group.actionIds
        .map((actionId) => projection.actionsById[actionId])
        .filter((action): action is RunnerThreadAction => Boolean(action));
      const rings = [
        group.highestPermissionRing,
        ...groupActions.map((action) => action.permissionRing),
        ...groupPermissions.map((permission) => permission.permissionRing),
      ].filter((ring): ring is 1 | 2 | 3 => ring === 1 || ring === 2 || ring === 3);
      if (rings.length === 0) return [];
      const highestRing = Math.max(...rings) as 1 | 2 | 3;
      const matchingPermission = groupPermissions.find(
        (permission) => permission.permissionRing === highestRing,
      );
      return [
        {
          id: group.id,
          title: group.title || "Execution group",
          ringNumber: highestRing,
          ring: matchingPermission?.ringLabel || `Ring ${highestRing}`,
          status: groupPermissions.some((permission) => permission.status === "pending")
            ? "Awaiting approval"
            : "Used",
        },
      ];
    });

    if (summaries.length || !receipt?.highestPermissionRing || !run) return summaries;
    return [
      {
        id: `run:${run.id}`,
        title: receipt.originLabel || "Thread execution",
        ringNumber: receipt.highestPermissionRing,
        ring: `Ring ${receipt.highestPermissionRing}`,
        status: "Used",
      },
    ];
  }, [
    groups,
    permissions,
    projection.actionsById,
    receipt?.highestPermissionRing,
    receipt?.originLabel,
    run,
  ]);

  useEffect(() => {
    if (!run || !onLoadRunDetails || detailLoadState?.status !== "idle") return;
    if (requestedRunIdsRef.current.has(run.id)) return;
    requestedRunIdsRef.current.add(run.id);
    void Promise.resolve(onLoadRunDetails(run)).catch(() => {
      requestedRunIdsRef.current.delete(run.id);
    });
  }, [detailLoadState?.status, onLoadRunDetails, run]);

  const sections = useMemo<PlatformThreadSummarySection[]>(() => {
    const nextSections: PlatformThreadSummarySection[] = [];
    const shouldShowTaskList =
      taskItems.length > 0 ||
      taskList?.status === "loading" ||
      taskList?.status === "refreshing" ||
      taskList?.status === "error";

    if (shouldShowTaskList) {
      const taskListContent =
        taskItems.length > 0 ? (
          <div className="platform-thread-workbench__summary-items is-task-list">
            {taskItems.map((item, index) => (
              <div
                key={item.id || `${index}:${item.text}`}
                className={`platform-thread-workbench__summary-item is-task${item.completed ? " is-complete" : ""}`}
              >
                {item.completed ? (
                  <CircleCheck strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Circle strokeWidth={1.7} aria-hidden="true" />
                )}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        ) : taskList?.status === "error" ? (
          <div className="platform-thread-workbench__summary-state is-error">
            {taskList.error || "Task list unavailable."}
          </div>
        ) : (
          <div className="platform-thread-workbench__summary-state">
            <LoaderCircle className="is-spinning" strokeWidth={1.7} aria-hidden="true" />
            Loading task list
          </div>
        );
      nextSections.push({
        id: "tasks",
        title: "Task List",
        content: taskListContent,
      });
    }

    if (permissionGroups.length > 0) {
      nextSections.push({
        id: "permissions",
        title: "Permission groups",
        description: "Access scopes used while working on this thread",
        meta: permissionGroups.length,
        content: (
          <div className="platform-thread-workbench__summary-items">
            {permissionGroups.map((group) => (
              <div key={group.id} className="platform-thread-workbench__summary-item is-permission">
                <span className="platform-thread-workbench__summary-item-main">
                  <PlatformPermissionMiniRingIcon ringId={`ring_${group.ringNumber}`} />
                  <span className="platform-thread-workbench__summary-item-label">
                    {group.title}
                  </span>
                </span>
                <span className="platform-thread-workbench__summary-item-meta">
                  {group.ring} · {group.status}
                </span>
              </div>
            ))}
          </div>
        ),
      });
    }

    if (connectors.length > 0) {
      nextSections.push({
        id: "connectors",
        title: "Connectors",
        description: "Connected services used in this thread",
        meta: connectors.length,
        content: (
          <div className="platform-thread-workbench__summary-items">
            {connectors.map((connector) => (
              <div
                key={connector.id}
                className="platform-thread-workbench__summary-item is-connector"
              >
                <ConnectionIdentityIcon
                  kind={connectorIdentityKind(connector)}
                  connectionId={connector.id}
                  logoUrl={connector.logoUrl}
                  logoClassName="platform-thread-workbench__connector-logo"
                  variant="catalog"
                  className="platform-thread-workbench__connector-icon-shell"
                  icon={
                    <Plug className="platform-thread-workbench__connector-icon" strokeWidth={1.7} />
                  }
                />
                <span className="platform-thread-workbench__summary-item-label">
                  {connector.name}
                </span>
              </div>
            ))}
          </div>
        ),
      });
    }

    const changedActionCount = actions.filter(
      (action) =>
        Boolean(action.snapshotBeforeId || action.snapshotAfterId) ||
        Boolean(action.touchedResources?.length),
    ).length;
    const reportedChangeCount = Math.max(
      changedActionCount,
      Number(run?.projection?.counters?.changeCount || 0),
    );
    if (reportedChangeCount > 0) {
      nextSections.push({
        id: "changes",
        title: "Changes",
        description: `${reportedChangeCount} recorded ${reportedChangeCount === 1 ? "change" : "changes"}`,
        meta:
          onOpenChanges && run ? (
            <PlatformIconButton
              size="compact"
              aria-label="Open thread changes"
              title="Open changes"
              onClick={() => onOpenChanges(run)}
            >
              <ExternalLink strokeWidth={1.7} />
            </PlatformIconButton>
          ) : null,
      });
    }

    if (resources.length > 0) {
      nextSections.push({
        id: "resources",
        title: "Resources",
        description: `${resources.length} ${
          resources.length === 1 ? "resource" : "resources"
        } created or updated`,
        meta: resources.length,
        content: (
          <div className="platform-thread-workbench__summary-items">
            {resources.map((resource, index) => (
              <div
                key={[resource.kind, resource.id, resource.path, resource.url, index].join(":")}
                className="platform-thread-workbench__summary-item is-resource"
              >
                <span className="platform-thread-workbench__summary-item-label">
                  {resource.label ||
                    resource.path ||
                    resource.url ||
                    resource.id ||
                    "Untitled resource"}
                </span>
                <span className="platform-thread-workbench__summary-item-meta">
                  {resource.kind || "Resource"}
                </span>
              </div>
            ))}
          </div>
        ),
      });
    }

    return nextSections;
  }, [
    actions,
    connectors,
    onOpenChanges,
    permissionGroups,
    resources,
    run,
    taskItems,
    taskList?.error,
    taskList?.status,
  ]);

  return <PlatformThreadSummaryPanel sections={sections} ariaLabel="Execution details" />;
}
