import {
  Play,
  Power,
  Plus,
  Trash2,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewStatus,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
} from "../../../../../platform-ui/pages/overview/index.js";

export interface DevelopWebhookOverviewRow {
  id: string;
  name: string;
  sourceLabel: string;
  eventLabel: string;
  actionLabel: string;
  enabled: boolean;
  lastTriggeredAt: number;
  lastTriggeredLabel: string;
  icon?: LucideIcon;
  searchText: string;
  raw: unknown;
}

export interface DevelopWebhooksOverviewPageProps {
  rows: readonly DevelopWebhookOverviewRow[];
  controlsPortalId?: string;
  loading?: boolean;
  error?: string;
  successMessage?: string;
  mutatingId?: string;
  onOpen: (row: DevelopWebhookOverviewRow) => void;
  onCreate: () => void;
  onToggle: (row: DevelopWebhookOverviewRow) => void | Promise<void>;
  onTest: (row: DevelopWebhookOverviewRow) => void | Promise<void>;
  onDelete: (row: DevelopWebhookOverviewRow) => void | Promise<void>;
}

export function DevelopWebhooksOverviewPage({
  rows,
  controlsPortalId = "",
  loading = false,
  error = "",
  successMessage = "",
  mutatingId = "",
  onOpen,
  onCreate,
  onToggle,
  onTest,
  onDelete,
}: DevelopWebhooksOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (statusFilter === "active") return row.enabled;
    if (statusFilter === "inactive") return !row.enabled;
    return true;
  }), [rows, statusFilter]);
  const sourceCount = new Set(rows.map((row) => row.sourceLabel).filter(Boolean)).size;
  const analytics = useMemo<ResourceOverviewAnalyticsModel>(() => ({
    title: "Webhook activity",
    ariaLabel: "Webhook activity",
    labels: [],
    series: [],
    emptyState: "Webhook activity appears after external events are received.",
    metrics: [
      { id: "total", label: "Webhooks", value: String(rows.length), color: "#7effff" },
      { id: "active", label: "Active", value: String(rows.filter((row) => row.enabled).length), color: "#8fc4ff" },
      { id: "inactive", label: "Inactive", value: String(rows.filter((row) => !row.enabled).length), color: "#6750ff" },
      { id: "sources", label: "Sources", value: String(sourceCount), color: "#9ff6ce" },
    ],
  }), [rows, sourceCount]);

  const columns = useMemo<PlatformDataTableColumn<DevelopWebhookOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Webhook",
      accessor: "name",
      sortable: true,
      width: "minmax(260px, 1.45fr)",
      cell: ({ row }) => (
        <ResourceOverviewIdentityCell
          title={row.name}
          icon={row.icon || Webhook}
          iconClassName="is-develop-resource"
        />
      ),
    },
    {
      id: "source",
      header: "Source",
      accessor: "sourceLabel",
      sortable: true,
      width: "minmax(130px, 0.65fr)",
      cell: ({ row }) => <ResourceOverviewValue>{row.sourceLabel}</ResourceOverviewValue>,
    },
    {
      id: "event",
      header: "Event",
      accessor: "eventLabel",
      sortable: true,
      width: "minmax(170px, 0.85fr)",
      hideBelow: 780,
      cell: ({ row }) => <ResourceOverviewValue>{row.eventLabel}</ResourceOverviewValue>,
    },
    {
      id: "action",
      header: "Action",
      accessor: "actionLabel",
      sortable: true,
      width: "minmax(170px, 0.9fr)",
      hideBelow: 940,
      cell: ({ row }) => <ResourceOverviewValue>{row.actionLabel}</ResourceOverviewValue>,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.enabled ? 1 : 0,
      sortable: true,
      width: "minmax(110px, 0.5fr)",
      cell: ({ row }) => <ResourceOverviewStatus active={row.enabled} />,
    },
    {
      id: "lastTriggered",
      header: "Last triggered",
      accessor: "lastTriggeredAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(140px, 0.7fr)",
      hideBelow: 1100,
      cell: ({ row }) => <ResourceOverviewValue>{row.lastTriggeredLabel}</ResourceOverviewValue>,
    },
  ], []);

  const getRowActions = (row: DevelopWebhookOverviewRow): readonly PlatformDataTableAction<DevelopWebhookOverviewRow>[] => [
    {
      id: "toggle",
      label: row.enabled ? "Disable" : "Enable",
      icon: Power,
      disabled: mutatingId === row.id,
      onSelect: () => onToggle(row),
    },
    {
      id: "test",
      label: "Test fire",
      icon: Play,
      disabled: mutatingId === row.id,
      onSelect: () => onTest(row),
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      danger: true,
      separatorBefore: true,
      disabled: mutatingId === row.id,
      onSelect: () => onDelete(row),
    },
  ];

  return (
    <ResourceOverviewPage<DevelopWebhookOverviewRow>
      period="day"
      onPeriodChange={() => undefined}
      analytics={analytics}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-develop-webhooks"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Webhooks",
        className: "resource-overview-table is-develop-webhooks",
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        toolbar: {
          title: "All Webhooks",
          search: {
            placeholder: "Search webhooks",
            getSearchText: (row) => row.searchText,
          },
          filters: [{
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: "All webhooks" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
            ],
          }],
          primaryAction: {
            label: "Webhook",
            icon: Plus,
            onClick: onCreate,
          },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        footer: successMessage
          ? <div className="develop-webhooks-overview__status" role="status">{successMessage}</div>
          : undefined,
        emptyState: "No webhooks available.",
        noResultsState: "No matching webhooks found.",
      }}
    />
  );
}
