import {
  Copy,
  Metronome,
  Plus,
  RefreshCcwDot,
  RefreshCw,
  RotateCcw,
  SquarePen,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  createResourceOverviewColumns,
  ResourceOverviewPage,
} from "../../../../../platform-ui/pages/overview/index.js";
import {
  type MetronomeOverviewRow,
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

  const columns = useMemo(
    () => createResourceOverviewColumns<MetronomeOverviewRow>({
      name: {
        getVisual: (row) => {
          if (row.visualKind === "loop") {
            return {
              icon: <RefreshCw width={16} height={16} strokeWidth={1.9} />,
              iconClassName: "is-metronome is-loop",
            };
          }
          if (row.visualKind === "mission-control") {
            return {
              icon: <RefreshCcwDot width={16} height={16} strokeWidth={1.9} />,
              iconClassName: "is-metronome is-mission-control",
            };
          }
          return {
            icon: <Metronome width={16} height={16} strokeWidth={1.8} />,
            iconClassName: "is-metronome",
          };
        },
      },
    }),
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
        rows: availableRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Metronomes",
        className: "resource-overview-table is-metronomes",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: {
          enabled: true,
          isRowSelectable: (row) => !row.isHiddenTeamShared,
          ariaLabel: (row) => `Select ${row.name}`,
        },
        pagination: false,
        incrementalLoading: hasMore && onLoadMore
          ? {
              hasMore,
              loading: loadingMore,
              onLoadMore,
              loadingMessage: "Loading more workflows...",
            }
          : undefined,
        toolbar: {
          search: {
            placeholder: "Search metronomes",
            getSearchText: (row) =>
              row.searchText ||
              [row.name, row.description, row.statusLabel, row.triggerLabel, row.creatorName].join(" "),
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
