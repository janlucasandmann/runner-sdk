import { Bell } from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableRowActionState,
  PlatformDataTableSortState,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewCatalogIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import { NotificationsOverviewGuide } from "./notifications-overview-guide.js";

export interface ConfigureHomeNotificationRow {
  id: string;
  kind: string;
  kindLabel?: string;
  label?: string;
  text?: string;
  meta?: string;
  statusLabel?: string;
  unread?: boolean;
  createdAt?: string;
  createdAtTimestamp?: number;
  createdAtLabel?: string;
  [key: string]: unknown;
}

export type ConfigureHomeNotificationSort = "newest" | "oldest" | "type";

export interface NotificationsOverviewPageProps {
  notifications: readonly ConfigureHomeNotificationRow[];
  totalNotificationCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  sortValue: ConfigureHomeNotificationSort;
  onSortChange: (value: ConfigureHomeNotificationSort) => void;
  onOpenNotification: (row: ConfigureHomeNotificationRow) => void;
  canOpenNotification: (row: ConfigureHomeNotificationRow) => boolean;
  getNotificationActions: (
    row: ConfigureHomeNotificationRow,
    state: PlatformDataTableRowActionState<ConfigureHomeNotificationRow>,
  ) => readonly PlatformDataTableAction<ConfigureHomeNotificationRow>[];
  loading?: boolean;
}

const NOTIFICATION_FILTER_OPTIONS = [
  { id: "all", label: "All notifications" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
  { id: "permission", label: "Permission requests" },
  { id: "tasks", label: "Tasks" },
  { id: "team", label: "Teams" },
  { id: "organization", label: "Organizations" },
  { id: "product", label: "Product" },
] as const;

function getNotificationStatusVariant(
  row: ConfigureHomeNotificationRow,
): PlatformLabelVariant {
  const status = String(row.statusLabel || "").trim().toLowerCase();
  if (status.includes("needs")) return "yellow";
  if (row.unread) return "blue";
  return "gray";
}

export function NotificationsOverviewPage({
  notifications,
  totalNotificationCount,
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  sortValue,
  onSortChange,
  onOpenNotification,
  canOpenNotification,
  getNotificationActions,
  loading = false,
}: NotificationsOverviewPageProps) {
  const columns = useMemo<
    PlatformDataTableColumn<ConfigureHomeNotificationRow>[]
  >(() => [
    {
      id: "notification",
      header: "Notification",
      accessor: (row) => row.label || row.kindLabel || "Notification",
      sortable: true,
      width: "minmax(280px, 1.8fr)",
      cell: ({ row }) => (
        <ResourceOverviewCatalogIdentityCell
          title={row.label || row.kindLabel || "Notification"}
          description={row.text || row.meta || "Open notification"}
        />
      ),
    },
    {
      id: "type",
      header: "Type",
      accessor: (row) => row.kindLabel || "Notification",
      sortable: true,
      width: "minmax(130px, 0.75fr)",
      hideBelow: 780,
      cell: ({ row }) => (
        <ResourceOverviewValue>
          {row.kindLabel || "Notification"}
        </ResourceOverviewValue>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => (
        row.statusLabel || (row.unread ? "Unread" : "Read")
      ),
      sortable: true,
      width: "minmax(120px, 0.65fr)",
      hideBelow: 620,
      cell: ({ row }) => (
        <PlatformLabel variant={getNotificationStatusVariant(row)}>
          {row.statusLabel || (row.unread ? "Unread" : "Read")}
        </PlatformLabel>
      ),
    },
    {
      id: "time",
      header: "Time",
      accessor: (row) => row.createdAtTimestamp || 0,
      sortable: true,
      sortDescFirst: true,
      width: "minmax(130px, 0.7fr)",
      align: "end",
      cell: ({ row }) => (
        <ResourceOverviewValue title={row.createdAt}>
          {row.createdAtLabel || "—"}
        </ResourceOverviewValue>
      ),
    },
  ], []);

  const sorting: PlatformDataTableSortState = sortValue === "oldest"
    ? { id: "time", direction: "asc" }
    : sortValue === "type"
      ? { id: "type", direction: "asc" }
      : { id: "time", direction: "desc" };
  const noNotifications = totalNotificationCount === 0;
  const emptyState = (
    <PlatformEmptyState
      icon={Bell}
      title={noNotifications
        ? "No notifications yet"
        : "No matching notifications"}
      description={noNotifications
        ? "Notifications come from agent activity, permission requests, team invitations, and product updates."
        : "Try adjusting your search or filter settings."}
    />
  );

  return (
    <ResourceOverviewPage<ConfigureHomeNotificationRow>
      heroContent={<NotificationsOverviewGuide />}
      showPeriodSelector={false}
      className="is-notifications"
      table={{
        rows: notifications,
        columns,
        getRowId: (row) => `${row.kind}:${row.id}`,
        ariaLabel: "Notifications",
        className: "resource-overview-table is-notifications",
        variant: "catalog-ui",
        sorting: {
          value: sorting,
          manual: true,
          onChange: (next) => {
            if (!next) onSortChange("newest");
            else if (next.id === "type") onSortChange("type");
            else {
              onSortChange(
                next.direction === "asc" ? "oldest" : "newest",
              );
            }
          },
        },
        selection: {
          enabled: true,
          ariaLabel: (row) =>
            `Select ${row.label || row.kindLabel || "notification"}`,
        },
        pagination: false,
        toolbar: {
          title: "Notifications",
          search: {
            value: searchValue,
            onChange: onSearchChange,
            placeholder: "Search notifications",
            manual: true,
          },
          filters: [{
            id: "notification-kind",
            label: "Filter",
            value: filterValue,
            onChange: onFilterChange,
            options: NOTIFICATION_FILTER_OPTIONS,
          }],
        },
        onRowActivate: (row) => {
          if (canOpenNotification(row)) onOpenNotification(row);
        },
        isRowDisabled: (row) => !canOpenNotification(row),
        getRowActions: (row, state) => getNotificationActions(row, state),
        loading,
        emptyState,
        noResultsState: (
          <PlatformEmptyState
            icon={Bell}
            title="No matching notifications"
            description="Try adjusting your search or filter settings."
          />
        ),
      }}
    />
  );
}
