import { Copy, Metronome, Plus, RotateCcw, SquarePen, Trash2, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../../../platform-ui/pages/overview/index.js";
import {
  createMetronomesOverviewAnalytics,
  type MetronomeOverviewRow,
  type MetronomeOverviewStatus,
} from "./metronomes-overview-model.js";

type MetronomeOverviewAction = (row: MetronomeOverviewRow) => void | Promise<void>;

export interface MetronomesOverviewPageProps {
  rows: readonly MetronomeOverviewRow[];
  controlsPortalId?: string;
  loading?: boolean;
  mutating?: boolean;
  error?: React.ReactNode;
  period?: ResourceOverviewPeriod;
  onPeriodChange?: (period: ResourceOverviewPeriod) => void;
  analytics?: ResourceOverviewAnalyticsModel;
  onOpen: MetronomeOverviewAction;
  onCreate: () => void;
  onEdit: MetronomeOverviewAction;
  onDuplicate: MetronomeOverviewAction;
  onShare: MetronomeOverviewAction;
  onDelete: MetronomeOverviewAction;
  onRemoveShared: MetronomeOverviewAction;
  onRestoreShared: MetronomeOverviewAction;
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
  period,
  onPeriodChange,
  analytics,
  onOpen,
  onCreate,
  onEdit,
  onDuplicate,
  onShare,
  onDelete,
  onRemoveShared,
  onRestoreShared,
}: MetronomesOverviewPageProps) {
  const [internalPeriod, setInternalPeriod] = useState<ResourceOverviewPeriod>("month");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const activePeriod = period || internalPeriod;

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (ownershipFilter === "owned") {
          return !row.isBuiltIn && !row.isTeamShared;
        }
        if (ownershipFilter === "shared") {
          return row.isTeamShared && !row.isHiddenTeamShared;
        }
        if (ownershipFilter === "removed") return row.isHiddenTeamShared;
        return !row.isHiddenTeamShared;
      }),
    [ownershipFilter, rows],
  );

  const resolvedAnalytics = useMemo(
    () =>
      analytics ||
      createMetronomesOverviewAnalytics({
        rows,
        period: activePeriod,
        loading,
        error: typeof error === "string" ? error : null,
      }),
    [activePeriod, analytics, error, loading, rows],
  );

  const columns = useMemo<PlatformDataTableColumn<MetronomeOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
        width: "minmax(220px, 1.35fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            icon={Metronome}
            iconClassName="is-connection"
            size="compact"
          />
        ),
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
        id: "trigger",
        header: "Trigger",
        accessor: "triggerLabel",
        sortable: true,
        width: "minmax(120px, 0.72fr)",
        hideBelow: 720,
        cell: ({ row }) => <ResourceOverviewValue>{row.triggerLabel}</ResourceOverviewValue>,
      },
      {
        id: "creator",
        header: "Creator",
        accessor: "creatorName",
        sortable: true,
        width: "minmax(170px, 0.9fr)",
        hideBelow: 860,
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.creatorName}
            imageUrl={row.creatorAvatarUrl}
            fallback={row.creatorFallback}
            iconClassName="is-creator"
          />
        ),
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
  ): readonly PlatformDataTableAction<MetronomeOverviewRow>[] => {
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
        onSelect: () => onDelete(row),
      },
    ];
  };

  const removedCount = rows.filter((row) => row.isHiddenTeamShared).length;

  return (
    <ResourceOverviewPage<MetronomeOverviewRow>
      period={activePeriod}
      onPeriodChange={(nextPeriod) => {
        if (!period) setInternalPeriod(nextPeriod);
        onPeriodChange?.(nextPeriod);
      }}
      analytics={resolvedAnalytics}
      controlsPortalId={controlsPortalId}
      className="is-metronomes"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Metronomes",
        className: "resource-overview-table is-metronomes",
        sorting: { defaultValue: { id: "lastRun", direction: "desc" } },
        selection: {
          enabled: true,
          isRowSelectable: (row) => !row.isHiddenTeamShared,
          ariaLabel: (row) => `Select ${row.name}`,
        },
        toolbar: {
          title: "All Workflows",
          search: {
            placeholder: "Search metronomes",
            getSearchText: (row) =>
              row.searchText ||
              [row.name, row.statusLabel, row.triggerLabel, row.creatorName].join(" "),
          },
          filters: [
            {
              id: "ownership",
              label: "Ownership",
              value: ownershipFilter,
              onChange: setOwnershipFilter,
              options: [
                { id: "all", label: "All Metronomes" },
                { id: "owned", label: "Owned" },
                { id: "shared", label: "Shared" },
                {
                  id: "removed",
                  label: removedCount ? `Removed shared (${removedCount})` : "Removed shared",
                },
              ],
            },
          ],
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
        emptyState:
          ownershipFilter === "removed"
            ? "No removed shared metronomes."
            : "No metronomes available.",
        noResultsState: "No metronomes match this view.",
      }}
    />
  );
}
