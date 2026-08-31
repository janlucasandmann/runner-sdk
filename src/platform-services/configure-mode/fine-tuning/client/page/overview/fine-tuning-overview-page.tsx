import { ChevronRight, Plus, TestTubeDiagonal, Trash2 } from "../../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  createResourceOverviewColumns,
  ResourceOverviewPage,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { FineTuningOverviewGuide } from "./fine-tuning-overview-guide.js";

export interface FineTuningOverviewRow {
  id: string;
  name: string;
  description: string;
  agentLabel: string;
  agentAvatarUrl?: string;
  agentFallback?: string;
  evaluationSetCount: number;
  improvementScore: number;
  improvementLabel: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  updatedAt: number;
  status: string;
  searchText?: string;
}

export interface FineTuningOverviewPageProps {
  rows: readonly FineTuningOverviewRow[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  onOpen: (row: FineTuningOverviewRow) => void;
  onCreate: () => void;
  onDelete: (rows: readonly FineTuningOverviewRow[]) => void;
}

export function FineTuningOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
  onDelete,
}: FineTuningOverviewPageProps) {
  const columns = useMemo(
    () => createResourceOverviewColumns<FineTuningOverviewRow>({
      name: {
        getVisual: () => ({
          icon: <TestTubeDiagonal width={16} height={16} strokeWidth={1.8} />,
          iconClassName: "is-optimization",
        }),
      },
    }),
    [],
  );

  const getRowActions = (
    row: FineTuningOverviewRow,
  ): readonly PlatformDataTableAction<FineTuningOverviewRow>[] => [
    { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(row) },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      danger: true,
      separatorBefore: true,
      onSelect: () => onDelete([row]),
      selectedRows: {
        label: "Delete selected",
        danger: true,
        onSelect: ({ rows: selectedRows }) => onDelete(selectedRows),
      },
    },
  ];

  return (
    <ResourceOverviewPage<FineTuningOverviewRow>
      heroContent={<FineTuningOverviewGuide />}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-fine-tuning"
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Fine-tuning jobs",
        className: "resource-overview-table is-fine-tuning",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          search: {
            placeholder: "Search optimization jobs",
            getSearchText: (row) =>
              row.searchText || `${row.name} ${row.agentLabel} ${row.creatorName} ${row.status}`,
          },
          primaryAction: { label: "Optimize Agent", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: (
          <PlatformEmptyState
            icon={TestTubeDiagonal}
            title="No optimization jobs yet"
            description="Fine-tuning jobs will appear here after you improve an agent with evaluated evidence."
          />
        ),
        noResultsState: "No optimization jobs match this view.",
      }}
    />
  );
}
