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
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { EvaluationsOverviewGuide } from "./evaluations-overview-guide.js";

export interface EvaluationOverviewRow {
  id: string;
  name: string;
  evaluatorLabel: string;
  evaluatorType: string;
  evaluatorAvatarUrl?: string;
  evaluatorFallback?: string;
  caseCount: number;
  runCount: number;
  creatorLabel: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  updatedAt: number;
  updatedLabel: string;
  updatedTitle?: string;
  canRun: boolean;
  searchText?: string;
}

export interface EvaluationsOverviewPageProps {
  rows: readonly EvaluationOverviewRow[];
  loading?: boolean;
  error?: string;
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

  const columns = useMemo<PlatformDataTableColumn<EvaluationOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Evaluation",
        accessor: "name",
        sortable: true,
        width: "minmax(230px, 1.25fr)",
        cell: ({ row }) => (
          <span className="resource-overview-identity__title">{row.name}</span>
        ),
      },
      {
        id: "evaluator",
        header: "Evaluator",
        accessor: "evaluatorLabel",
        sortable: true,
        width: "minmax(170px, 0.86fr)",
        cell: ({ row }) =>
          row.evaluatorType === "agent" ? (
            <ResourceOverviewIdentityCell
              title={row.evaluatorLabel}
              imageUrl={row.evaluatorAvatarUrl}
              fallback={row.evaluatorFallback}
              iconClassName="is-agent"
              size="compact"
            />
          ) : (
            <ResourceOverviewValue>{row.evaluatorLabel}</ResourceOverviewValue>
          ),
      },
      {
        id: "cases",
        header: "Cases",
        accessor: "caseCount",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(80px, 0.4fr)",
        cell: ({ row }) => (
          <ResourceOverviewValue>{row.caseCount}</ResourceOverviewValue>
        ),
      },
      {
        id: "creator",
        header: "Creator",
        accessor: "creatorLabel",
        sortable: true,
        width: "minmax(170px, 0.86fr)",
        hideBelow: 840,
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.creatorLabel}
            imageUrl={row.creatorAvatarUrl}
            fallback={row.creatorFallback}
            iconClassName="is-creator"
            size="compact"
          />
        ),
      },
      {
        id: "updated",
        header: "Updated",
        accessor: "updatedAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(120px, 0.62fr)",
        hideBelow: 1020,
        cell: ({ row }) => (
          <ResourceOverviewValue title={row.updatedTitle}>
            {row.updatedLabel}
          </ResourceOverviewValue>
        ),
      },
    ],
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
        toolbar: {
          search: {
            placeholder: "Search evaluations",
            getSearchText: (row) =>
              row.searchText ||
              `${row.name} ${row.evaluatorLabel} ${row.creatorLabel} ${row.updatedLabel}`,
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
