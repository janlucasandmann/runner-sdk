import { ChevronRight, FlaskConical, Play, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableIncrementalLoadingConfig,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import { TestsOverviewGuide } from "./tests-overview-guide.js";

export interface TestPlanOverviewRow {
  id: string;
  name: string;
  projectLabel: string;
  caseCount: number;
  runCount: number;
  passedRunCount: number;
  lastRunStatus: string;
  updatedAt: number;
  updatedLabel: string;
  searchText?: string;
}

export interface TestsOverviewPageProps {
  rows: readonly TestPlanOverviewRow[];
  loading?: boolean;
  error?: string;
  incrementalLoading?: PlatformDataTableIncrementalLoadingConfig;
  controlsPortalId?: string;
  onOpen: (row: TestPlanOverviewRow) => void;
  onCreate: () => void;
  onRun: (row: TestPlanOverviewRow) => void;
  onDelete: (rows: readonly TestPlanOverviewRow[]) => void;
}

function statusLabel(value: string) {
  if (!value) return "Never run";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusLabelVariant(value: string): PlatformLabelVariant {
  if (value === "passed" || value === "active") return "green";
  if (["failed", "error", "completed_with_errors"].includes(value)) return "red";
  if (value === "running" || value === "queued") return "blue";
  if (value === "warning") return "yellow";
  return "gray";
}

export function TestsOverviewPage({
  rows,
  loading = false,
  error = "",
  incrementalLoading,
  controlsPortalId,
  onOpen,
  onCreate,
  onRun,
  onDelete,
}: TestsOverviewPageProps) {
  const columns = useMemo<PlatformDataTableColumn<TestPlanOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Test plan",
        accessor: "name",
        sortable: true,
        width: "minmax(250px, 1.25fr)",
        cell: ({ row }) => (
          <span className="resource-overview-identity__title">{row.name}</span>
        ),
      },
      {
        id: "project",
        header: "Project",
        accessor: "projectLabel",
        sortable: true,
        width: "minmax(180px, 0.9fr)",
        cell: ({ row }) => <ResourceOverviewValue>{row.projectLabel}</ResourceOverviewValue>,
      },
      {
        id: "cases",
        header: "Cases",
        accessor: "caseCount",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(90px, 0.45fr)",
        cell: ({ row }) => <ResourceOverviewValue>{row.caseCount}</ResourceOverviewValue>,
      },
      {
        id: "last-run",
        header: "Last run",
        accessor: "lastRunStatus",
        sortable: true,
        width: "minmax(160px, 0.75fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={statusLabelVariant(row.lastRunStatus)}>
            {statusLabel(row.lastRunStatus)}
          </PlatformLabel>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        accessor: "updatedAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(130px, 0.6fr)",
        hideBelow: 980,
        cell: ({ row }) => <ResourceOverviewValue>{row.updatedLabel}</ResourceOverviewValue>,
      },
    ],
    [],
  );
  const actions = (
    row: TestPlanOverviewRow,
  ): readonly PlatformDataTableAction<TestPlanOverviewRow>[] => [
    { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(row) },
    {
      id: "run",
      label: "Run tests",
      icon: Play,
      disabled: row.caseCount === 0,
      onSelect: () => onRun(row),
    },
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
    <ResourceOverviewPage<TestPlanOverviewRow>
      heroContent={<TestsOverviewGuide />}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-tests"
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Test plans",
        className: "resource-overview-table is-tests",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          search: {
            placeholder: "Search test plans",
            getSearchText: (row) =>
              row.searchText
              || `${row.name} ${row.projectLabel} ${row.lastRunStatus}`,
          },
          primaryAction: { label: "Test Plan", icon: Plus, onClick: onCreate },
        },
        getRowActions: actions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        incrementalLoading,
        emptyState: (
          <PlatformEmptyState
            icon={FlaskConical}
            title="No test plans yet"
            description="Create a versioned test plan to verify project components and retain delivery evidence."
            primaryAction={{ label: "Create Test Plan", onClick: onCreate }}
          />
        ),
        noResultsState: "No test plans match this view.",
      }}
    />
  );
}
