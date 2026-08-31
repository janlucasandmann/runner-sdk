import { ChevronRight, Link2, Unlink } from "../../../platform-ui/components/ui/hugeicons-compat.js";
import { type ReactNode, useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableProps,
} from "../../../platform-ui/components/composite/data-table/index.js";
import { PlatformLabel } from "../../../platform-ui/components/ui/label/index.js";
import {
  type ResourceOverviewAnalyticsModel,
  ResourceOverviewPage,
  type ResourceOverviewPeriod,
  ResourceOverviewStatus,
  ResourceOverviewValue,
} from "../../../platform-ui/pages/overview/index.js";
import { ConnectionIdentityIcon } from "./connection-identity-icon.js";

export interface ConnectionOverviewRow {
  id: string;
  tableRowId?: string;
  name: string;
  description?: string;
  resourceKind?: "tags" | "plugins";
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
  kind: "tags" | "plugins" | "connections";
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
  tableVariant?: PlatformDataTableProps<ConnectionOverviewRow>["variant"];
  showStatusFilter?: boolean;
  selectionEnabled?: boolean;
  rowGrouping?: PlatformDataTableProps<ConnectionOverviewRow>["rowGrouping"];
  pagination?: PlatformDataTableProps<ConnectionOverviewRow>["pagination"];
  onOpen: (row: ConnectionOverviewRow) => void;
}

function createFallbackAnalytics(
  kind: "tags" | "plugins" | "connections",
  rows: readonly ConnectionOverviewRow[],
): ResourceOverviewAnalyticsModel {
  const connected = rows.filter((row) => row.connected).length;
  const label =
    kind === "connections"
      ? "Tags and Plugins"
      : kind === "tags"
        ? "Tags"
        : "Plugins";
  return {
    title:
      kind === "connections"
        ? "Connection activity"
        : `${label.slice(0, -1)} activity`,
    ariaLabel: `${label} activity overview`,
    metrics: [
      { id: "total", label, value: String(rows.length), color: "#8fc4ff" },
      {
        id: "connected",
        label: "Connected",
        value: String(connected),
        color: "#7effff",
      },
      {
        id: "available",
        label: "Available",
        value: String(rows.length - connected),
        color: "#6750ff",
      },
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
  tableVariant,
  showStatusFilter = true,
  selectionEnabled = true,
  rowGrouping,
  pagination,
  onOpen,
}: ConnectionOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter === "connected" && !row.connected) return false;
        if (statusFilter === "disconnected" && row.connected) return false;
        return true;
      }),
    [rows, statusFilter],
  );
  const resolvedAnalytics = analytics || createFallbackAnalytics(kind, rows);
  const entity =
    kind === "connections"
      ? "Tags and Plugins"
      : kind === "tags"
        ? "Tags"
        : "Plugins";
  const usesCatalogLayout = tableVariant === "catalog-ui";
  const columns = useMemo<PlatformDataTableColumn<ConnectionOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
        width: "minmax(220px, 1.25fr)",
        cell: ({ row }) => {
          const rowKind =
            row.resourceKind || (kind === "connections" ? "plugins" : kind);
          return (
            <div
              className={`resource-overview-identity${usesCatalogLayout ? " is-catalog" : ""}`}
            >
              <ConnectionIdentityIcon
                kind={rowKind === "tags" ? "tags" : "plugins"}
                connectionId={row.id}
                icon={row.icon}
                logoUrl={row.logoUrl}
                logoClassName={row.logoClassName}
                variant={usesCatalogLayout ? "catalog" : "default"}
              />
              {usesCatalogLayout ? (
                <span className="resource-overview-identity__copy">
                  <span className="resource-overview-identity__title">
                    {row.name}
                  </span>
                  {row.description ? (
                    <span className="resource-overview-identity__description">
                      {row.description}
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="resource-overview-identity__title">
                  {row.name}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "connected",
        header: "Status",
        accessor: (row) => (row.connected ? 1 : 0),
        sortable: true,
        width: "minmax(125px, 0.62fr)",
        cell: ({ row }) => {
          const rowKind =
            row.resourceKind || (kind === "connections" ? "plugins" : kind);
          return rowKind === "tags" || kind === "connections" ? (
            <PlatformLabel variant={row.connected ? "green" : "gray"}>
              {row.connected ? "Connected" : "Not Connected"}
            </PlatformLabel>
          ) : (
            <ResourceOverviewStatus
              active={row.connected}
              activeLabel="Connected"
              inactiveLabel="Not Connected"
            />
          );
        },
      },
      ...(kind === "connections"
        ? []
        : [
            {
              id: "identity",
              header: "Connected Identity",
              accessor: "identityLabel",
              sortable: true,
              width: "minmax(170px, 0.9fr)",
              hideBelow: 760,
              cell: ({ row }) => (
                <ResourceOverviewValue>
                  {row.identityLabel}
                </ResourceOverviewValue>
              ),
            } satisfies PlatformDataTableColumn<ConnectionOverviewRow>,
          ]),
      ...(kind === "connections"
        ? []
        : [
            {
              id: "provider",
              header: "Provider",
              accessor: "providerLabel",
              sortable: true,
              width: "minmax(120px, 0.62fr)",
              hideBelow: 960,
              cell: ({ row }) => (
                <ResourceOverviewValue>
                  {row.providerLabel}
                </ResourceOverviewValue>
              ),
            } satisfies PlatformDataTableColumn<ConnectionOverviewRow>,
          ]),
    ],
    [kind, usesCatalogLayout],
  );

  const getRowActions = (
    row: ConnectionOverviewRow,
  ): readonly PlatformDataTableAction<ConnectionOverviewRow>[] => [
    {
      id: "open",
      label: "Open",
      icon: ChevronRight,
      onSelect: () => onOpen(row),
    },
    ...(row.connectionAction
      ? [
          {
            id: "connection",
            label: row.connectionAction.label,
            icon: row.connectionAction.tone === "destructive" ? Unlink : Link2,
            danger: row.connectionAction.tone === "destructive",
            separatorBefore: true,
            onSelect: row.connectionAction.onSelect,
          } satisfies PlatformDataTableAction<ConnectionOverviewRow>,
        ]
      : []),
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
        getRowId: (row) => row.tableRowId || row.id,
        ariaLabel: entity,
        className: `resource-overview-table is-${kind}`,
        variant: tableVariant,
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: selectionEnabled
          ? { enabled: true, ariaLabel: (row) => `Select ${row.name}` }
          : undefined,
        rowGrouping,
        pagination:
          pagination === undefined
            ? kind === "tags"
              ? false
              : undefined
            : pagination,
        toolbar: {
          title:
            toolbarTitle === false
              ? undefined
              : toolbarTitle || `All ${entity}`,
          leading: toolbarLeading,
          search: {
            placeholder:
              kind === "connections"
                ? "Search tags and plugins"
                : `Search ${kind}`,
            getSearchText: (row) =>
              row.searchText ||
              `${row.name} ${row.description || ""} ${row.identityLabel} ${row.providerLabel}`,
          },
          filters: showStatusFilter
            ? [
                {
                  id: "status",
                  label: "Status",
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: [
                    { id: "all", label: `All ${entity}` },
                    { id: "connected", label: "Connected" },
                    { id: "disconnected", label: "Not Connected" },
                  ],
                },
              ]
            : undefined,
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        emptyState:
          kind === "connections"
            ? "No tags or plugins match this view."
            : `No ${kind} match this view.`,
      }}
    />
  );
}
