import { Copy, Metronome, Plus, RotateCcw, SquarePen, Trash2, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewPage,
  ResourceOverviewIdentityCell,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import {
  type MetronomeOverviewRow,
  type MetronomeOverviewStatus,
} from "./metronomes-overview-model.js";
import { MetronomesOverviewGuide } from "./metronomes-overview-guide.js";

type MetronomeOverviewAction = (row: MetronomeOverviewRow) => void | Promise<void>;
type MetronomeOverviewBulkAction = (
  rows: readonly MetronomeOverviewRow[],
) => void | Promise<void>;

export interface MetronomesOverviewPageProps {
  rows: readonly MetronomeOverviewRow[];
  controlsPortalId?: string;
  loading?: boolean;
  mutating?: boolean;
  error?: React.ReactNode;
  onOpen: MetronomeOverviewAction;
  onCreate: () => void;
  onEdit: MetronomeOverviewAction;
  onDuplicate: MetronomeOverviewAction;
  onShare: MetronomeOverviewAction;
  onDelete: MetronomeOverviewBulkAction;
  onRemoveShared: MetronomeOverviewAction;
  onRestoreShared: MetronomeOverviewAction;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
}

const INITIAL_WORKFLOW_LIMIT = 20;
const WORKFLOW_LOAD_MORE_COUNT = 10;

function getOwnerIdentity(row: MetronomeOverviewRow) {
  const candidateName = String(row.ownerName || row.creatorName || "").trim();
  const name = candidateName && candidateName.toLowerCase() !== "me"
    ? candidateName
    : "User";
  return {
    name,
    avatarUrl: row.ownerAvatarUrl || row.creatorAvatarUrl,
    fallback: row.ownerFallback || row.creatorFallback,
  };
}

function getStatusVariant(status: MetronomeOverviewStatus): PlatformLabelVariant {
  if (status === "active" || status === "default") return "green";
  if (status === "shared") return "blue";
  if (status === "paused") return "yellow";
  return "gray";
}

export function MetronomesOverviewPage({
  rows,
  controlsPortalId,
  loading = false,
  mutating = false,
  error,
  onOpen,
  onCreate,
  onEdit,
  onDuplicate,
  onShare,
  onDelete,
  onRemoveShared,
  onRestoreShared,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}: MetronomesOverviewPageProps) {
  const availableRows = useMemo(
    () => rows.filter((row) => !row.isHiddenTeamShared),
    [rows],
  );
  const [visibleRowCount, setVisibleRowCount] = useState(INITIAL_WORKFLOW_LIMIT);
  const [isRevealingMore, setIsRevealingMore] = useState(false);
  const visibleRows = useMemo(
    () => availableRows.slice(0, visibleRowCount),
    [availableRows, visibleRowCount],
  );

  useEffect(() => {
    setVisibleRowCount((current) =>
      Math.min(current, Math.max(INITIAL_WORKFLOW_LIMIT, availableRows.length)),
    );
  }, [availableRows.length]);

  const canLoadMore =
    visibleRowCount < availableRows.length || Boolean(hasMore && onLoadMore);
  const handleLoadMore = useCallback(async () => {
    if (isRevealingMore || loadingMore || !canLoadMore) return;
    setIsRevealingMore(true);
    try {
      const needsRemoteRows =
        visibleRowCount + WORKFLOW_LOAD_MORE_COUNT > availableRows.length;
      if (needsRemoteRows && hasMore && onLoadMore) await onLoadMore();
      setVisibleRowCount((current) => current + WORKFLOW_LOAD_MORE_COUNT);
    } finally {
      setIsRevealingMore(false);
    }
  }, [
    availableRows.length,
    canLoadMore,
    hasMore,
    isRevealingMore,
    loadingMore,
    onLoadMore,
    visibleRowCount,
  ]);

  const columns = useMemo<PlatformDataTableColumn<MetronomeOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
        width: "minmax(220px, 1.35fr)",
        cell: ({ row }) => <span className="resource-overview-identity__title">{row.name}</span>,
      },
      {
        id: "status",
        header: "Status",
        accessor: "statusRank",
        sortable: true,
        width: "minmax(105px, 0.62fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={getStatusVariant(row.status)}>{row.statusLabel}</PlatformLabel>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        accessor: (row) => getOwnerIdentity(row).name,
        sortable: true,
        width: "minmax(170px, 0.9fr)",
        hideBelow: 860,
        cell: ({ row }) => {
          const owner = getOwnerIdentity(row);
          return (
            <ResourceOverviewIdentityCell
              title={owner.name}
              imageUrl={owner.avatarUrl}
              fallback={owner.fallback}
              iconClassName="is-creator"
            />
          );
        },
      },
      {
        id: "lastRun",
        header: "Last run",
        accessor: (row) => row.sortTimestamp || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(125px, 0.72fr)",
        cell: ({ row }) => (
          <ResourceOverviewValue title={row.lastRunTitle}>{row.lastRunLabel}</ResourceOverviewValue>
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: MetronomeOverviewRow,
    state: { targetRows: readonly MetronomeOverviewRow[] },
  ): readonly PlatformDataTableAction<MetronomeOverviewRow>[] => {
    if (state.targetRows.length > 1) {
      const deletableRows = state.targetRows.filter(
        (target) => !target.isBuiltIn && !target.isTeamShared,
      );
      if (!deletableRows.length) return [];
      return [{
        id: "delete",
        label: "Delete selected",
        icon: Trash2,
        danger: true,
        disabled: mutating,
        onSelect: () => onDelete(deletableRows),
        selectedRows: {
          label: "Delete selected",
          danger: true,
          disabled: mutating,
          onSelect: () => onDelete(deletableRows),
        },
      }];
    }
    if (row.isBuiltIn) {
      return [
        {
          id: "duplicate",
          label: "Duplicate",
          icon: Copy,
          disabled: mutating,
          onSelect: () => onDuplicate(row),
        },
      ];
    }
    if (row.isTeamShared && row.isHiddenTeamShared) {
      return [
        {
          id: "restore",
          label: "Restore to list",
          icon: RotateCcw,
          disabled: mutating,
          onSelect: () => onRestoreShared(row),
        },
        {
          id: "duplicate",
          label: "Duplicate",
          icon: Copy,
          disabled: mutating,
          onSelect: () => onDuplicate(row),
        },
      ];
    }
    if (row.isTeamShared) {
      return [
        ...(row.canEditShared
          ? [
              {
                id: "edit",
                label: "Edit",
                icon: SquarePen,
                disabled: mutating,
                onSelect: () => onEdit(row),
              } satisfies PlatformDataTableAction<MetronomeOverviewRow>,
            ]
          : []),
        {
          id: "duplicate",
          label: "Duplicate",
          icon: Copy,
          disabled: mutating,
          onSelect: () => onDuplicate(row),
        },
        {
          id: "remove",
          label: "Remove from list",
          icon: Trash2,
          danger: true,
          separatorBefore: true,
          disabled: mutating,
          onSelect: () => onRemoveShared(row),
        },
      ];
    }
    return [
      {
        id: "edit",
        label: "Edit",
        icon: SquarePen,
        disabled: mutating,
        onSelect: () => onEdit(row),
      },
      {
        id: "duplicate",
        label: "Duplicate",
        icon: Copy,
        disabled: mutating,
        onSelect: () => onDuplicate(row),
      },
      {
        id: "share",
        label: "Share",
        icon: UsersRound,
        disabled: mutating,
        onSelect: () => onShare(row),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        separatorBefore: true,
        disabled: mutating,
        onSelect: () => onDelete([row]),
      },
    ];
  };

  return (
    <ResourceOverviewPage<MetronomeOverviewRow>
      heroContent={<MetronomesOverviewGuide />}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-metronomes"
      table={{
        rows: visibleRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Metronomes",
        className: "resource-overview-table is-metronomes",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "lastRun", direction: "desc" } },
        selection: {
          enabled: true,
          isRowSelectable: (row) => !row.isHiddenTeamShared,
          ariaLabel: (row) => `Select ${row.name}`,
        },
        pagination: false,
        incrementalLoading: {
          hasMore: canLoadMore,
          loading: isRevealingMore || loadingMore,
          onLoadMore: handleLoadMore,
          loadingMessage: "Loading more workflows...",
        },
        toolbar: {
          search: {
            placeholder: "Search metronomes",
            getSearchText: (row) =>
              row.searchText ||
              [row.name, row.statusLabel, row.triggerLabel, getOwnerIdentity(row).name].join(" "),
          },
          primaryAction: {
            label: "Metronome",
            icon: Plus,
            onClick: onCreate,
          },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        isRowDisabled: (row) => Boolean(row.isHiddenTeamShared),
        getRowClassName: (row) =>
          row.isHiddenTeamShared ? "is-removed-shared" : row.isBuiltIn ? "is-built-in" : "",
        loading,
        error,
        emptyState: (
          <PlatformEmptyState
            icon={Metronome}
            title="No metronomes yet"
            description="Create a workflow to coordinate agents, triggers, and deterministic actions."
            primaryAction={{ label: "Create Metronome", onClick: onCreate }}
          />
        ),
        noResultsState: "No metronomes match this view.",
      }}
    />
  );
}
