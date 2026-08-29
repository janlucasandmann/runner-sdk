import {
  ChartColumnIncreasing,
  ChevronRight,
  Play,
  Plus,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableIncrementalLoadingConfig,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  createResourceOverviewColumns,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { EvaluationsOverviewGuide } from "./evaluations-overview-guide.js";

export interface EvaluationOverviewRow {
  id: string;
  name: string;
  description: string;
  evaluatorLabel: string;
  evaluatorType: string;
  evaluatorAvatarUrl?: string;
  evaluatorFallback?: string;
  caseCount: number | null;
  runCount: number | null;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  updatedAt: number;
  canRun: boolean;
  searchText?: string;
}

export interface EvaluationsOverviewPageProps {
  rows: readonly EvaluationOverviewRow[];
  loading?: boolean;
  error?: string;
  incrementalLoading?: PlatformDataTableIncrementalLoadingConfig;
  controlsPortalId?: string;
  onOpen: (row: EvaluationOverviewRow) => void;
  onCreate: () => void;
  onRename: (row: EvaluationOverviewRow) => void;
  onRun: (row: EvaluationOverviewRow) => void;
  onDelete: (row: EvaluationOverviewRow) => void;
  onDeleteMany: (rows: readonly EvaluationOverviewRow[]) => void;
}

export function EvaluationsOverviewPage({
  rows,
  loading = false,
  error = "",
  incrementalLoading,
  controlsPortalId,
  onOpen,
  onCreate,
  onRename,
  onRun,
  onDelete,
  onDeleteMany,
}: EvaluationsOverviewPageProps) {
  const [selectedRowIds, setSelectedRowIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const columns = useMemo(
    () => createResourceOverviewColumns<EvaluationOverviewRow>({
      name: {
        getVisual: () => ({
          icon: <ChartColumnIncreasing width={16} height={16} strokeWidth={1.8} />,
          iconClassName: "is-evaluation",
        }),
      },
      extensions: {
        afterName: [{
          id: "cases",
          header: "Cases",
          accessor: "caseCount",
          sortable: true,
          sortDescFirst: true,
          width: "minmax(80px, 0.4fr)",
          cell: ({ row }) => (
            <ResourceOverviewValue>{row.caseCount ?? "—"}</ResourceOverviewValue>
          ),
        }],
      },
    }),
    [],
  );

  const getRowActions = (
    row: EvaluationOverviewRow,
    state: { targetRows: readonly EvaluationOverviewRow[] },
  ): readonly PlatformDataTableAction<EvaluationOverviewRow>[] => {
    const targets = state.targetRows.length ? state.targetRows : [row];
    if (targets.length > 1) {
      return [
        {
          id: "delete-selected",
          label: "Delete selected",
          icon: Trash2,
          danger: true,
          onSelect: () => {
            onDeleteMany(targets);
            setSelectedRowIds(new Set());
          },
          selectedRows: {
            label: "Delete selected",
            danger: true,
            onSelect: () => {
              onDeleteMany(targets);
              setSelectedRowIds(new Set());
            },
          },
        },
      ];
    }
    return [
      {
        id: "open",
        label: "Open",
        icon: ChevronRight,
        onSelect: () => onOpen(row),
      },
      {
        id: "rename",
        label: "Rename",
        icon: SquarePen,
        onSelect: () => onRename(row),
      },
      {
        id: "run",
        label: "Run",
        icon: Play,
        disabled: !row.canRun,
        onSelect: () => onRun(row),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        separatorBefore: true,
        onSelect: () => {
          onDelete(row);
          setSelectedRowIds((current) => {
            const next = new Set(current);
            next.delete(row.id);
            return next;
          });
        },
      },
    ];
  };

  return (
    <ResourceOverviewPage<EvaluationOverviewRow>
      heroContent={<EvaluationsOverviewGuide />}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-evaluations"
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Evaluations",
        className: "resource-overview-table is-evaluations",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: {
          enabled: true,
          value: selectedRowIds,
          onChange: ({ selectedIds }) =>
            setSelectedRowIds(new Set(selectedIds)),
          ariaLabel: (row) => `Select ${row.name}`,
        },
        pagination: false,
        incrementalLoading,
        toolbar: {
          search: {
            placeholder: "Search evaluations",
            getSearchText: (row) =>
              row.searchText ||
              `${row.name} ${row.evaluatorLabel} ${row.creatorName}`,
          },
          primaryAction: { label: "Evaluation", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: (
          <PlatformEmptyState
            icon={ChartColumnIncreasing}
            title="No evaluations yet"
            description="Create an evaluation to measure agent quality against repeatable cases and criteria."
            primaryAction={{ label: "Create Evaluation", onClick: onCreate }}
          />
        ),
        noResultsState: "No evaluations match this view.",
      }}
    />
  );
}
