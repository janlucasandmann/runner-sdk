import { Copy, Plus, SquarePen, Trash2 } from "lucide-react";
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
} from "../../../../../platform-ui/pages/overview/index.js";
import { createDevelopResourceOverviewAnalyticsModel } from "../domain/resource-overview-model.js";
import type {
  DevelopResourceOverviewRow,
  DevelopResourceOverviewSurfaceProps,
} from "../domain/resource-overview-types.js";

export function DevelopResourceOverviewSurface({
  definition,
  rows,
  period,
  onPeriodChange,
  operationalMetrics,
  analytics: providedAnalytics,
  analyticsLoading = false,
  analyticsError = "",
  controlsPortalId,
  loading = false,
  error,
  mutating = false,
  headerActions,
  onOpen,
  onCreate,
  onRename,
  onCopy,
  onDelete,
  onPrefetch,
}: DevelopResourceOverviewSurfaceProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const ResourceIcon = definition.icon;
  const publishedCount = rows.filter((row) => row.published).length;
  const analytics = providedAnalytics || createDevelopResourceOverviewAnalyticsModel(definition, operationalMetrics, {
    resourceCount: rows.length,
    publishedCount,
    loading: analyticsLoading,
    error: analyticsError,
  });
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (statusFilter === "published") return row.published;
    if (statusFilter === "draft") return !row.published;
    return true;
  }), [rows, statusFilter]);

  const columns = useMemo<PlatformDataTableColumn<DevelopResourceOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      width: "minmax(240px, 1.5fr)",
      cell: ({ row }) => <ResourceOverviewIdentityCell title={row.name} icon={ResourceIcon} iconClassName="is-develop-resource" />,
    },
    {
      id: "type",
      header: "Type",
      accessor: "typeLabel",
      sortable: true,
      width: "minmax(130px, 0.68fr)",
      hideBelow: 720,
      cell: ({ row }) => <ResourceOverviewValue>{row.typeLabel}</ResourceOverviewValue>,
    },
    {
      id: "published",
      header: "Published",
      accessor: (row) => row.published ? 1 : 0,
      sortable: true,
      width: "minmax(110px, 0.52fr)",
      hideBelow: 860,
      cell: ({ row }) => <ResourceOverviewStatus active={row.published} activeLabel="Yes" inactiveLabel="No" />,
    },
    {
      id: "created",
      header: "Created",
      accessor: "createdAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.6fr)",
      hideBelow: 980,
      cell: ({ row }) => <ResourceOverviewValue title={row.createdTitle}>{row.createdLabel}</ResourceOverviewValue>,
    },
    {
      id: "lastUsed",
      header: "Last used",
      accessor: "lastUsedAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.6fr)",
      hideBelow: 1120,
      cell: ({ row }) => <ResourceOverviewValue title={row.lastUsedTitle}>{row.lastUsedLabel}</ResourceOverviewValue>,
    },
  ], [ResourceIcon]);

  const getRowActions = (
    row: DevelopResourceOverviewRow,
    state: { targetRows: readonly DevelopResourceOverviewRow[] },
  ): readonly PlatformDataTableAction<DevelopResourceOverviewRow>[] => {
    const targets = state.targetRows.length ? state.targetRows : [row];
    const mutableTargets = targets.filter((target) => !target.isDraft);
    if (targets.length > 1) {
      return onDelete ? [{
        id: "delete",
        label: "Delete selected",
        icon: Trash2,
        danger: true,
        disabled: mutating || mutableTargets.length === 0,
        onSelect: () => onDelete(mutableTargets),
      }] : [];
    }
    const actions: PlatformDataTableAction<DevelopResourceOverviewRow>[] = [];
    if (onRename) {
      actions.push({ id: "rename", label: "Rename", icon: SquarePen, disabled: mutating || row.isDraft, onSelect: () => onRename(row) });
    }
    if (onCopy) {
      actions.push({ id: "copy", label: "Copy", icon: Copy, disabled: mutating, onSelect: () => onCopy(row) });
    }
    if (onDelete) {
      actions.push({ id: "delete", label: "Delete", icon: Trash2, danger: true, separatorBefore: true, disabled: mutating || row.isDraft, onSelect: () => onDelete([row]) });
    }
    return actions;
  };

  return (
    <ResourceOverviewPage<DevelopResourceOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={analytics}
      controlsPortalId={controlsPortalId}
      headerActions={headerActions}
      className={`is-develop-resource is-${definition.kind.replaceAll("_", "-")}`}
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: definition.plural,
        className: `resource-overview-table is-develop-resource is-${definition.kind.replaceAll("_", "-")}`,
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: onDelete ? { enabled: true, ariaLabel: (row) => `Select ${row.name}` } : undefined,
        toolbar: {
          title: `All ${definition.plural}`,
          search: {
            placeholder: `Search ${definition.plural.toLowerCase()}`,
            getSearchText: (row) => row.searchText,
          },
          filters: [{
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: `All ${definition.plural}` },
              { id: "published", label: "Published" },
              { id: "draft", label: "Not published" },
            ],
          }],
          primaryAction: onCreate ? { label: definition.singular, icon: Plus, onClick: onCreate } : undefined,
        },
        getRowActions: onRename || onCopy || onDelete ? getRowActions : undefined,
        onRowActivate: onOpen,
        onRowPointerEnter: onPrefetch,
        onRowFocus: onPrefetch,
        getRowAriaLabel: (row) => row.name,
        loading,
        error,
        emptyState: `No ${definition.plural.toLowerCase()} available.`,
        noResultsState: `No matching ${definition.plural.toLowerCase()} found.`,
      }}
    />
  );
}
