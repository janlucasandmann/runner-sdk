import {
  AlertCircle,
  Bell,
  Building2,
  ListTodo,
  Mail,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableSortState,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";

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

function getNotificationIcon(kind: string): LucideIcon {
  if (kind === "permission") return AlertCircle;
  if (kind === "human_task") return ListTodo;
  if (kind === "team_invitation") return UsersRound;
  if (kind === "organization_invitation") return Building2;
  if (kind === "email_verification") return Mail;
  return Bell;
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
      cell: ({ row }) => {
        const Icon = getNotificationIcon(row.kind);
        return (
          <div className="configure-home-notification__identity">
            <span
              className="configure-home-notification__icon"
              aria-hidden="true"
            >
              <Icon width={12} height={12} strokeWidth={1.8} />
            </span>
            <span className="configure-home-notification__copy">
              <span className="configure-home-notification__title">
                {row.label || row.kindLabel || "Notification"}
              </span>
              <span className="configure-home-notification__meta">
                {row.text || row.meta || "Open notification"}
              </span>
            </span>
          </div>
        );
      },
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
        <span
          className={
            `configure-home-notification__status${
              row.unread ? " is-unread" : ""
            }`
          }
        >
          {row.statusLabel || (row.unread ? "Unread" : "Read")}
        </span>
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
      className="configure-home-notification__empty-state"
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
      heroContent={null}
      showPeriodSelector={false}
      className="is-configure-notifications"
      table={{
        rows: notifications,
        columns,
        getRowId: (row) => `${row.kind}:${row.id}`,
        ariaLabel: "Notifications",
        className: "resource-overview-table is-configure-home-notifications",
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
        getRowActions: (row) => getNotificationActions(row),
        loading,
        emptyState,
        noResultsState: (
          <PlatformEmptyState
            icon={Bell}
            className="configure-home-notification__empty-state"
            title="No matching notifications"
            description="Try adjusting your search or filter settings."
          />
        ),
      }}
    />
  );
}
