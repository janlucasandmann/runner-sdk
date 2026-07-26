import { ChevronRight, FlaskConical, Play, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
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
  controlsPortalId?: string;
  onOpen: (row: TestPlanOverviewRow) => void;
  onCreate: () => void;
  onRun: (row: TestPlanOverviewRow) => void;
  onDelete: (row: TestPlanOverviewRow) => void;
}

function statusLabel(value: string) {
  if (!value) return "Never run";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function TestsOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
  onRun,
  onDelete,
}: TestsOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(
    () => rows.filter((row) => {
      if (statusFilter === "passed") return row.lastRunStatus === "passed";
      if (statusFilter === "attention") {
        return ["failed", "completed_with_errors"].includes(row.lastRunStatus);
      }
      if (statusFilter === "never") return row.runCount === 0;
      return true;
    }),
    [rows, statusFilter],
  );
  const columns = useMemo<PlatformDataTableColumn<TestPlanOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Test plan",
        accessor: "name",
        sortable: true,
        width: "minmax(250px, 1.25fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            icon={FlaskConical}
            iconClassName="is-connection"
            size="compact"
          />
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
          <span className={`tests-status-label is-${row.lastRunStatus || "idle"}`}>
            {statusLabel(row.lastRunStatus)}
          </span>
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
      onSelect: () => onDelete(row),
    },
  ];
  const scrollToTable = () => {
    if (typeof document === "undefined") return;
    document
      .querySelector(".resource-overview-page.is-tests .resource-overview-page__table-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const showPassed = () => {
    setStatusFilter("passed");
    scrollToTable();
  };
  return (
    <ResourceOverviewPage<TestPlanOverviewRow>
      heroContent={
        <TestsOverviewGuide
          planCount={rows.length}
          passedRunCount={rows.reduce((total, row) => total + row.passedRunCount, 0)}
          onCreate={onCreate}
          onBrowse={scrollToTable}
          onShowPassed={showPassed}
        />
      }
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-tests"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Test plans",
        className: "resource-overview-table is-tests",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          title: "All Test Plans",
          search: {
            placeholder: "Search test plans",
            getSearchText: (row) =>
              row.searchText
              || `${row.name} ${row.projectLabel} ${row.lastRunStatus}`,
          },
          filters: [
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { id: "all", label: "All Plans" },
                { id: "passed", label: "Passing" },
                { id: "attention", label: "Needs Attention" },
                { id: "never", label: "Never Run" },
              ],
            },
          ],
          primaryAction: { label: "Test Plan", icon: Plus, onClick: onCreate },
        },
        getRowActions: actions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
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
