import { ChevronRight, Plus, ShieldCheck } from "lucide-react";
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
import { AssuranceOverviewGuide } from "./assurance-overview-guide.js";

export interface AssurancePolicyOverviewRow {
  id: string;
  name: string;
  projectLabel: string;
  gateCount: number;
  runCount: number;
  passedRunCount: number;
  blockedRunCount: number;
  lastRunStatus: string;
  updatedAt: number;
  updatedLabel: string;
  searchText?: string;
}

interface AssuranceOverviewPageProps {
  rows: readonly AssurancePolicyOverviewRow[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  onOpen: (row: AssurancePolicyOverviewRow) => void;
  onCreate: () => void;
}

function formatStatus(value: string) {
  if (!value) return "Never run";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function AssuranceOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
}: AssuranceOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(
    () => rows.filter((row) => {
      if (statusFilter === "passed") return row.lastRunStatus === "passed";
      if (statusFilter === "blocked") return row.lastRunStatus === "blocked";
      if (statusFilter === "failed") return row.lastRunStatus === "failed";
      if (statusFilter === "never") return row.runCount === 0;
      return true;
    }),
    [rows, statusFilter],
  );
  const columns = useMemo<PlatformDataTableColumn<AssurancePolicyOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Assurance Policy",
        accessor: "name",
        sortable: true,
        width: "minmax(260px, 1.3fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            icon={ShieldCheck}
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
        width: "minmax(180px, .9fr)",
        cell: ({ row }) => <ResourceOverviewValue>{row.projectLabel}</ResourceOverviewValue>,
      },
      {
        id: "gates",
        header: "Gates",
        accessor: "gateCount",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(90px, .42fr)",
        cell: ({ row }) => <ResourceOverviewValue>{row.gateCount}</ResourceOverviewValue>,
      },
      {
        id: "last-run",
        header: "Last decision",
        accessor: "lastRunStatus",
        sortable: true,
        width: "minmax(160px, .7fr)",
        cell: ({ row }) => (
          <span className={`assurance-status-label is-${row.lastRunStatus || "idle"}`}>
            {formatStatus(row.lastRunStatus)}
          </span>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        accessor: "updatedAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(130px, .58fr)",
        hideBelow: 980,
        cell: ({ row }) => <ResourceOverviewValue>{row.updatedLabel}</ResourceOverviewValue>,
      },
    ],
    [],
  );
  const actions = (
    row: AssurancePolicyOverviewRow,
  ): readonly PlatformDataTableAction<AssurancePolicyOverviewRow>[] => [
    {
      id: "open",
      label: "Open",
      icon: ChevronRight,
      onSelect: () => onOpen(row),
    },
  ];
  const scrollToTable = () => {
    if (typeof document === "undefined") return;
    document
      .querySelector(".resource-overview-page.is-assurance .resource-overview-page__table-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const showBlocked = () => {
    setStatusFilter("blocked");
    scrollToTable();
  };
  return (
    <ResourceOverviewPage<AssurancePolicyOverviewRow>
      heroContent={(
        <AssuranceOverviewGuide
          policyCount={rows.length}
          passedRunCount={rows.reduce((total, row) => total + row.passedRunCount, 0)}
          blockedRunCount={rows.reduce((total, row) => total + row.blockedRunCount, 0)}
          onCreate={onCreate}
          onBrowse={scrollToTable}
          onShowBlocked={showBlocked}
        />
      )}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-assurance"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Assurance Policies",
        className: "resource-overview-table is-assurance",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          title: "All Assurance Policies",
          search: {
            placeholder: "Search Assurance Policies",
            getSearchText: (row) => row.searchText || `${row.name} ${row.projectLabel}`,
          },
          filters: [{
            id: "status",
            label: "Decision",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: "All Policies" },
              { id: "passed", label: "Passed" },
              { id: "blocked", label: "Awaiting Approval" },
              { id: "failed", label: "Failed" },
              { id: "never", label: "Never Run" },
            ],
          }],
          primaryAction: {
            label: "Assurance Policy",
            icon: Plus,
            onClick: onCreate,
          },
        },
        getRowActions: actions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: (
          <PlatformEmptyState
            icon={ShieldCheck}
            title="No Assurance Policies yet"
            description="Create an evidence-bound release policy for a project or autonomous delivery workflow."
            primaryAction={{ label: "Create Assurance Policy", onClick: onCreate }}
          />
        ),
        noResultsState: "No Assurance Policies match this view.",
      }}
    />
  );
}
