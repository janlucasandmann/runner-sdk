import { ChevronRight, FlaskConical, Play, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableIncrementalLoadingConfig,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  createResourceOverviewColumns,
  ResourceOverviewPage,
} from "../../../../../platform-ui/pages/overview/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import { TestsOverviewGuide } from "./tests-overview-guide.js";

export interface TestPlanOverviewRow {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  projectLabel: string;
  caseCount: number;
  runCount: number;
  passedRunCount: number;
  lastRunStatus: string;
  updatedAt: number;
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
  const columns = useMemo(
    () => createResourceOverviewColumns<TestPlanOverviewRow>({
      name: {
        getVisual: () => ({
          icon: <FlaskConical width={16} height={16} strokeWidth={1.8} />,
          iconClassName: "is-test",
        }),
      },
      extensions: {
        afterName: [{
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
        }],
      },
    }),
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
