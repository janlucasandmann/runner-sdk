import { Cable, ChevronRight, Link2, Unlink } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableProps,
} from "../../../platform-ui/components/composite/data-table/index.js";
import { PlatformLabel } from "../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewPage,
  ResourceOverviewStatus,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../platform-ui/pages/overview/index.js";

export interface ConnectionOverviewRow {
  id: string;
  name: string;
  searchText?: string;
  logoUrl?: string;
  logoClassName?: string;
  icon?: ReactNode;
  connected: boolean;
  identityLabel: string;
  providerLabel: string;
  category?: "all" | "channel" | "workspace";
  connectionAction?: {
    label: string;
    tone?: "default" | "destructive";
    onSelect: () => void;
  };
}

export interface ConnectionOverviewPageProps {
  kind: "tags" | "plugins";
  rows: readonly ConnectionOverviewRow[];
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics?: ResourceOverviewAnalyticsModel;
  loading?: boolean;
  heroContent?: ReactNode;
  showPeriodSelector?: boolean;
  controlsPortalId?: string;
  headerActions?: ReactNode;
  pageClassName?: string;
  toolbarLeading?: ReactNode;
  toolbarTitle?: ReactNode | false;
  pagination?: PlatformDataTableProps<ConnectionOverviewRow>["pagination"];
  onOpen: (row: ConnectionOverviewRow) => void;
}

function createFallbackAnalytics(kind: "tags" | "plugins", rows: readonly ConnectionOverviewRow[]): ResourceOverviewAnalyticsModel {
  const connected = rows.filter((row) => row.connected).length;
  const label = kind === "tags" ? "Tags" : "Plugins";
  return {
    title: `${label.slice(0, -1)} activity`,
    ariaLabel: `${label} activity overview`,
    metrics: [
      { id: "total", label, value: String(rows.length), color: "#8fc4ff" },
      { id: "connected", label: "Connected", value: String(connected), color: "#7effff" },
      { id: "available", label: "Available", value: String(rows.length - connected), color: "#6750ff" },
      { id: "activity", label: "Activity", value: "-", color: "#4da3ff" },
    ],
    labels: [],
    series: [],
  };
}

export function ConnectionOverviewPage({
  kind,
  rows,
  period,
  onPeriodChange,
  analytics,
  loading = false,
  heroContent,
  showPeriodSelector,
  controlsPortalId,
  headerActions,
  pageClassName,
  toolbarLeading,
  toolbarTitle,
  pagination,
  onOpen,
}: ConnectionOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (statusFilter === "connected" && !row.connected) return false;
    if (statusFilter === "disconnected" && row.connected) return false;
    return true;
  }), [rows, statusFilter]);
  const resolvedAnalytics = analytics || createFallbackAnalytics(kind, rows);
  const entity = kind === "tags" ? "Tags" : "Plugins";

  const columns = useMemo<PlatformDataTableColumn<ConnectionOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      width: "minmax(220px, 1.25fr)",
      cell: ({ row }) => (
        <div className="resource-overview-identity">
          <span className={`resource-overview-identity__visual is-connection${kind === "tags" ? " is-size-compact" : ""}`} aria-hidden="true">
            {row.logoUrl ? <img src={row.logoUrl} alt="" className={row.logoClassName} /> : row.icon || <Cable width={17} height={17} strokeWidth={1.8} />}
          </span>
          <span className="resource-overview-identity__title">{row.name}</span>
        </div>
      ),
    },
    {
      id: "connected",
      header: "Status",
      accessor: (row) => row.connected ? 1 : 0,
      sortable: true,
      width: "minmax(125px, 0.62fr)",
      cell: ({ row }) => kind === "tags"
        ? <PlatformLabel variant={row.connected ? "green" : "gray"}>{row.connected ? "Connected" : "Not Connected"}</PlatformLabel>
        : <ResourceOverviewStatus active={row.connected} activeLabel="Connected" inactiveLabel="Not Connected" />,
    },
    {
      id: "identity",
      header: "Connected Identity",
      accessor: "identityLabel",
      sortable: true,
      width: "minmax(170px, 0.9fr)",
      hideBelow: 760,
      cell: ({ row }) => <ResourceOverviewValue>{row.identityLabel}</ResourceOverviewValue>,
    },
    {
      id: "provider",
      header: "Provider",
      accessor: "providerLabel",
      sortable: true,
      width: "minmax(120px, 0.62fr)",
      hideBelow: 960,
      cell: ({ row }) => <ResourceOverviewValue>{row.providerLabel}</ResourceOverviewValue>,
    },
  ], [kind]);

  const getRowActions = (row: ConnectionOverviewRow): readonly PlatformDataTableAction<ConnectionOverviewRow>[] => [
    { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(row) },
    ...(row.connectionAction ? [{
      id: "connection",
      label: row.connectionAction.label,
      icon: row.connectionAction.tone === "destructive" ? Unlink : Link2,
      danger: row.connectionAction.tone === "destructive",
      separatorBefore: true,
      onSelect: row.connectionAction.onSelect,
    } satisfies PlatformDataTableAction<ConnectionOverviewRow>] : []),
  ];

  return (
    <ResourceOverviewPage<ConnectionOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={resolvedAnalytics}
      heroContent={heroContent}
      showPeriodSelector={showPeriodSelector}
      controlsPortalId={controlsPortalId}
      headerActions={headerActions}
      className={pageClassName || `is-${kind}`}
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: entity,
        className: `resource-overview-table is-${kind}`,
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: pagination === undefined ? (kind === "tags" ? false : undefined) : pagination,
        toolbar: {
          title: toolbarTitle === false ? undefined : toolbarTitle || `All ${entity}`,
          leading: toolbarLeading,
          search: { placeholder: `Search ${kind}`, getSearchText: (row) => row.searchText || `${row.name} ${row.identityLabel} ${row.providerLabel}` },
          filters: [{
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: `All ${entity}` },
              { id: "connected", label: "Connected" },
              { id: "disconnected", label: "Not Connected" },
            ],
          }],
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        emptyState: `No ${kind} match this view.`,
      }}
    />
  );
}
