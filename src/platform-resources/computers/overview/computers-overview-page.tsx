import { Copy, Plus, SquarePen, Trash2, UsersRound } from "../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo, useState } from "react";
import type { PlatformDataTableAction, PlatformDataTableColumn } from "../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../platform-ui/pages/overview/index.js";

function getComputerProfileLabelVariant(profileLabel: string): PlatformLabelVariant {
  switch (profileLabel.trim().toLowerCase()) {
    case "standard":
      return "blue";
    case "power":
      return "yellow";
    case "desktop":
      return "green";
    case "light":
    default:
      return "gray";
  }
}

export interface ComputerOverviewRow {
  id: string;
  name: string;
  searchText?: string;
  profileLabel: string;
  status: string;
  isRunning: boolean;
  isSystem?: boolean;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  creatorIsSystem?: boolean;
  createdAt?: number;
  createdLabel: string;
  createdTitle?: string;
  lastUsedAt?: number;
  lastUsedLabel: string;
  lastUsedTitle?: string;
}

export interface ComputersOverviewPageProps {
  rows: readonly ComputerOverviewRow[];
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics: ResourceOverviewAnalyticsModel;
  controlsPortalId?: string;
  periodPortalId?: string;
  loading?: boolean;
  error?: React.ReactNode;
  mutating?: boolean;
  headerActions?: React.ReactNode;
  onOpen: (row: ComputerOverviewRow) => void;
  onCreate: () => void;
  onRename: (row: ComputerOverviewRow) => void;
  onShare: (rows: readonly ComputerOverviewRow[]) => void;
  onCopy: (row: ComputerOverviewRow) => void;
  onDelete: (rows: readonly ComputerOverviewRow[]) => void;
}

export function ComputersOverviewPage({
  rows,
  period,
  onPeriodChange,
  analytics,
  controlsPortalId,
  periodPortalId,
  loading = false,
  error,
  mutating = false,
  headerActions,
  onOpen,
  onCreate,
  onRename,
  onShare,
  onCopy,
  onDelete,
}: ComputersOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (statusFilter === "running") return row.isRunning;
    if (statusFilter === "stopped") return !row.isRunning;
    return true;
  }), [rows, statusFilter]);

  const columns = useMemo<PlatformDataTableColumn<ComputerOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      width: "minmax(220px, 1.5fr)",
      cell: ({ row }) => <span className="resource-overview-identity__title" title={row.name}>{row.name}</span>,
    },
    {
      id: "profile",
      header: "Computer Profile",
      accessor: "profileLabel",
      sortable: true,
      width: "minmax(150px, 0.75fr)",
      hideBelow: 720,
      cell: ({ row }) => (
        <PlatformLabel variant={getComputerProfileLabelVariant(row.profileLabel)}>
          {row.profileLabel}
        </PlatformLabel>
      ),
    },
    {
      id: "creator",
      header: "Creator",
      accessor: "creatorName",
      sortable: true,
      width: "minmax(180px, 0.82fr)",
      hideBelow: 940,
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
      id: "created",
      header: "Created",
      accessor: (row) => row.createdAt || 0,
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.6fr)",
      hideBelow: 860,
      cell: ({ row }) => <ResourceOverviewValue title={row.createdTitle}>{row.createdLabel}</ResourceOverviewValue>,
    },
    {
      id: "lastUsed",
      header: "Last used",
      accessor: (row) => row.lastUsedAt || 0,
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.6fr)",
      hideBelow: 1040,
      cell: ({ row }) => <ResourceOverviewValue title={row.lastUsedTitle}>{row.lastUsedLabel}</ResourceOverviewValue>,
    },
  ], []);

  const getRowActions = (row: ComputerOverviewRow, state: { targetRows: readonly ComputerOverviewRow[] }): readonly PlatformDataTableAction<ComputerOverviewRow>[] => {
    const targets = state.targetRows.length ? state.targetRows : [row];
    const mutable = targets.filter((target) => !target.isSystem);
    if (targets.length > 1) {
      return [
        { id: "share", label: "Share selected with Team", icon: UsersRound, disabled: mutating || !mutable.length, onSelect: () => onShare(mutable), selectedRows: { label: "Share selected with Team", onSelect: () => onShare(mutable) } },
        { id: "delete", label: "Delete selected", icon: Trash2, danger: true, separatorBefore: true, disabled: mutating || !mutable.length, onSelect: () => onDelete(mutable), selectedRows: { label: "Delete selected", danger: true, onSelect: () => onDelete(mutable) } },
      ];
    }
    return [
      { id: "rename", label: "Rename", icon: SquarePen, disabled: mutating || row.isSystem, onSelect: () => onRename(row) },
      { id: "share", label: "Share with Team", icon: UsersRound, disabled: mutating || row.isSystem, onSelect: () => onShare([row]) },
      { id: "copy", label: "Copy", icon: Copy, disabled: mutating, onSelect: () => onCopy(row) },
      { id: "delete", label: "Delete", icon: Trash2, danger: true, separatorBefore: true, disabled: mutating || row.isSystem, onSelect: () => onDelete([row]) },
    ];
  };

  return (
    <ResourceOverviewPage<ComputerOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={analytics}
      controlsPortalId={controlsPortalId}
      periodPortalId={periodPortalId}
      headerActions={headerActions}
      className="is-computers"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Computers",
        className: "resource-overview-table is-computers",
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        toolbar: {
          title: "All Computers",
          search: { placeholder: "Search computers", getSearchText: (row) => row.searchText || `${row.name} ${row.profileLabel} ${row.creatorName} ${row.status}` },
          filters: [{
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: "All Computers" },
              { id: "running", label: "Running" },
              { id: "stopped", label: "Stopped" },
            ],
          }],
          primaryAction: { label: "Computer", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error,
        emptyState: "No computers available.",
      }}
    />
  );
}
