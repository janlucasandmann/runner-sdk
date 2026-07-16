import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  Coins,
  ListTodo,
  Mail,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { createElement, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableSortState,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformPopup } from "../../../../../platform-ui/components/composite/popup/index.js";
import {
  ResourceOverviewMenuButton,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";

export interface ConfigureHomeTeaserCard {
  id: string;
  title: string;
  description: string;
  value: string;
  icon: LucideIcon;
  onClick: () => void;
}

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

export interface ConfigureHomeOverviewPageProps {
  cards: readonly ConfigureHomeTeaserCard[];
  notifications: readonly ConfigureHomeNotificationRow[];
  totalNotificationCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  sortValue: ConfigureHomeNotificationSort;
  onSortChange: (value: ConfigureHomeNotificationSort) => void;
  onOpenPricing: () => void;
  onOpenDocumentation: () => void;
  onOpenNotification: (row: ConfigureHomeNotificationRow) => void;
  canOpenNotification: (row: ConfigureHomeNotificationRow) => boolean;
  getNotificationActions: (row: ConfigureHomeNotificationRow) => readonly PlatformDataTableAction<ConfigureHomeNotificationRow>[];
  controlsPortalId?: string;
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

function renderTeaserIcon(icon: LucideIcon): ReactNode {
  return createElement(icon, { width: 15, height: 15, strokeWidth: 1.8, "aria-hidden": true });
}

export function ConfigureHomeOverviewPage({
  cards,
  notifications,
  totalNotificationCount,
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  sortValue,
  onSortChange,
  onOpenPricing,
  onOpenDocumentation,
  onOpenNotification,
  canOpenNotification,
  getNotificationActions,
  controlsPortalId = "",
  loading = false,
}: ConfigureHomeOverviewPageProps) {
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!headerMenuOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerMenuRef.current?.contains(event.target as Node)) {
        setHeaderMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHeaderMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [headerMenuOpen]);

  const columns = useMemo<PlatformDataTableColumn<ConfigureHomeNotificationRow>[]>(() => [
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
            <span className="configure-home-notification__icon" aria-hidden="true"><Icon width={12} height={12} strokeWidth={1.8} /></span>
            <span className="configure-home-notification__copy">
              <span className="configure-home-notification__title">{row.label || row.kindLabel || "Notification"}</span>
              <span className="configure-home-notification__meta">{row.text || row.meta || "Open notification"}</span>
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
      cell: ({ row }) => <ResourceOverviewValue>{row.kindLabel || "Notification"}</ResourceOverviewValue>,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.statusLabel || (row.unread ? "Unread" : "Read"),
      sortable: true,
      width: "minmax(120px, 0.65fr)",
      hideBelow: 620,
      cell: ({ row }) => <span className={`configure-home-notification__status${row.unread ? " is-unread" : ""}`}>{row.statusLabel || (row.unread ? "Unread" : "Read")}</span>,
    },
    {
      id: "time",
      header: "Time",
      accessor: (row) => row.createdAtTimestamp || 0,
      sortable: true,
      sortDescFirst: true,
      width: "minmax(130px, 0.7fr)",
      align: "end",
      cell: ({ row }) => <ResourceOverviewValue title={row.createdAt}>{row.createdAtLabel || "—"}</ResourceOverviewValue>,
    },
  ], []);

  const sorting: PlatformDataTableSortState = sortValue === "oldest"
    ? { id: "time", direction: "asc" }
    : sortValue === "type"
      ? { id: "type", direction: "asc" }
      : { id: "time", direction: "desc" };
  const noNotifications = totalNotificationCount === 0;
  const emptyState = (
    <div className="configure-home-notification__empty">
      <span>{noNotifications ? "No notifications yet" : "No matching notifications"}</span>
      <span>{noNotifications
        ? "Notifications come from agent activity, permission requests, team invitations, and product updates."
        : "Try adjusting your search or filter settings."}</span>
    </div>
  );
  const hero = (
    <section className="configure-home-overview__teasers" aria-label="Workspace resources">
      {cards.map((card) => (
        <button key={card.id} type="button" className="configure-home-overview__teaser" onClick={card.onClick}>
          <span className="configure-home-overview__teaser-top">
            <span className="configure-home-overview__teaser-icon" aria-hidden="true">{renderTeaserIcon(card.icon)}</span>
            <ArrowUpRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="configure-home-overview__teaser-copy">
            <strong>{card.value}</strong>
            <span>{card.title}</span>
            <small>{card.description}</small>
          </span>
        </button>
      ))}
    </section>
  );
  const headerActions = (
    <PlatformPopup
      open={headerMenuOpen}
      rootRef={headerMenuRef}
      rootClassName="playground-tasks-toolbar-popup-shell configure-home-overview__header-menu"
      surfaceClassName="playground-tasks-toolbar-popup-menu configure-home-overview__header-menu-surface"
      surfaceProps={{ role: "menu", "aria-label": "Configure resources" }}
      animation="down-in"
      trigger={(
        <ResourceOverviewMenuButton
          label="Configure options"
          expanded={headerMenuOpen}
          onClick={() => setHeaderMenuOpen((current) => !current)}
        />
      )}
    >
      <button
        type="button"
        role="menuitem"
        className="tb-popup-row"
        onClick={() => {
          setHeaderMenuOpen(false);
          onOpenPricing();
        }}
      >
        <Coins className="tb-popup-icon" width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        <span>Pricing</span>
      </button>
      <button
        type="button"
        role="menuitem"
        className="tb-popup-row"
        onClick={() => {
          setHeaderMenuOpen(false);
          onOpenDocumentation();
        }}
      >
        <BookOpen className="tb-popup-icon" width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        <span>Documentation</span>
      </button>
    </PlatformPopup>
  );

  return (
    <ResourceOverviewPage<ConfigureHomeNotificationRow>
      heroContent={hero}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      headerActions={headerActions}
      className="is-configure-home"
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
            else onSortChange(next.direction === "asc" ? "oldest" : "newest");
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
          <div className="configure-home-notification__empty">
            <span>No matching notifications</span>
            <span>Try adjusting your search or filter settings.</span>
          </div>
        ),
      }}
    />
  );
}
