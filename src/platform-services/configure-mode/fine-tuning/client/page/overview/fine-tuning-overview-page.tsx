import { ChevronRight, Plus, TestTubeDiagonal, Trash2 } from "lucide-react";
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
import { FineTuningOverviewGuide } from "./fine-tuning-overview-guide.js";

export interface FineTuningOverviewRow {
  id: string;
  name: string;
  agentLabel: string;
  agentAvatarUrl?: string;
  agentFallback?: string;
  evaluationSetCount: number;
  improvementScore: number;
  improvementLabel: string;
  conductorLabel: string;
  conductorAvatarUrl?: string;
  conductorFallback?: string;
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
  onDelete: (row: FineTuningOverviewRow) => void;
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
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter === "with-improvement") return row.improvementScore > 0;
        if (statusFilter !== "all") return row.status === statusFilter;
        return true;
      }),
    [rows, statusFilter],
  );

  const columns = useMemo<PlatformDataTableColumn<FineTuningOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Job",
        accessor: "name",
        sortable: true,
        width: "minmax(230px, 1.2fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            icon={TestTubeDiagonal}
            iconClassName="is-connection"
            size="compact"
          />
        ),
      },
      {
        id: "agent",
        header: "Agent",
        accessor: "agentLabel",
        sortable: true,
        width: "minmax(180px, 0.9fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.agentLabel}
            imageUrl={row.agentAvatarUrl}
            fallback={row.agentFallback}
            iconClassName="is-agent"
            size="compact"
          />
        ),
      },
      {
        id: "sets",
        header: "Sets",
        accessor: "evaluationSetCount",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(90px, 0.42fr)",
        cell: ({ row }) => (
          <ResourceOverviewValue>
            {row.evaluationSetCount} {row.evaluationSetCount === 1 ? "set" : "sets"}
          </ResourceOverviewValue>
        ),
      },
      {
        id: "improvement",
        header: "Improvement",
        accessor: "improvementScore",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(160px, 0.78fr)",
        hideBelow: 780,
        cell: ({ row }) => <ResourceOverviewValue>{row.improvementLabel}</ResourceOverviewValue>,
      },
      {
        id: "conductor",
        header: "Conducted by",
        accessor: "conductorLabel",
        sortable: true,
        width: "minmax(180px, 0.9fr)",
        hideBelow: 980,
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.conductorLabel}
            imageUrl={row.conductorAvatarUrl}
            fallback={row.conductorFallback}
            iconClassName="is-creator"
            size="compact"
          />
        ),
      },
    ],
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
      onSelect: () => onDelete(row),
    },
  ];

  const scrollToTable = () => {
    if (typeof document === "undefined") return;
    document
      .querySelector(
        ".resource-overview-page.is-fine-tuning .resource-overview-page__table-section",
      )
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showCompleted = () => {
    setStatusFilter("completed");
    scrollToTable();
  };

  return (
    <ResourceOverviewPage<FineTuningOverviewRow>
      heroContent={
        <FineTuningOverviewGuide
          jobCount={rows.length}
          onCreate={onCreate}
          onBrowse={scrollToTable}
          onShowCompleted={showCompleted}
        />
      }
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-fine-tuning"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Fine-tuning jobs",
        className: "resource-overview-table is-fine-tuning",
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: {
          defaultValue: { pageIndex: 0, pageSize: 20 },
          pageSizeOptions: [20, 50, 100],
        },
        toolbar: {
          title: "All Fine-tuning Jobs",
          search: {
            placeholder: "Search fine-tuning jobs",
            getSearchText: (row) =>
              row.searchText || `${row.name} ${row.agentLabel} ${row.conductorLabel} ${row.status}`,
          },
          filters: [
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { id: "all", label: "All Jobs" },
                { id: "completed", label: "Completed" },
                { id: "running", label: "Running" },
                { id: "verifying", label: "Verifying" },
                { id: "with-improvement", label: "With Improvement" },
              ],
            },
          ],
          primaryAction: { label: "Fine-Tune", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: (
          <PlatformEmptyState
            icon={TestTubeDiagonal}
            title="No fine-tuning jobs yet"
            description="Fine-tuning jobs will appear here after you improve an agent with evaluated evidence."
          />
        ),
        noResultsState: "No fine-tuning jobs match this view.",
      }}
    />
  );
}
