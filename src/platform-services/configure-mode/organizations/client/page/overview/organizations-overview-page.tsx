import { Building2, Check, ChevronRight, Plus, SquarePen } from "../../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewStatus,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { OrganizationsOverviewGuide } from "./organizations-overview-guide.js";

export interface OrganizationOverviewRow {
  id: string;
  name: string;
  roleLabel: string;
  type: "company" | "personal";
  typeLabel: string;
  isActive: boolean;
  canRename: boolean;
  searchText?: string;
}

export interface OrganizationsOverviewPageProps {
  rows: readonly OrganizationOverviewRow[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  onOpen: (row: OrganizationOverviewRow) => void;
  onCreate: () => void;
  onActivate: (row: OrganizationOverviewRow) => void;
  onRename: (row: OrganizationOverviewRow) => void;
  onOpenDocumentation: () => void;
}

export function OrganizationsOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
  onActivate,
  onRename,
  onOpenDocumentation,
}: OrganizationsOverviewPageProps) {
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (organizationFilter === "current") return row.isActive;
        if (organizationFilter === "company") return row.type === "company";
        if (organizationFilter === "personal") return row.type === "personal";
        return true;
      }),
    [organizationFilter, rows],
  );

  const columns = useMemo<PlatformDataTableColumn<OrganizationOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
        width: "minmax(220px, 1.25fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            icon={Building2}
            iconClassName="is-connection"
            size="compact"
          />
        ),
      },
      {
        id: "role",
        header: "Role",
        accessor: "roleLabel",
        sortable: true,
        width: "minmax(115px, 0.6fr)",
        cell: ({ row }) => <ResourceOverviewValue>{row.roleLabel}</ResourceOverviewValue>,
      },
      {
        id: "type",
        header: "Type",
        accessor: "typeLabel",
        sortable: true,
        width: "minmax(170px, 0.88fr)",
        hideBelow: 760,
        cell: ({ row }) => <ResourceOverviewValue>{row.typeLabel}</ResourceOverviewValue>,
      },
      {
        id: "status",
        header: "Status",
        accessor: (row) => (row.isActive ? 1 : 0),
        sortable: true,
        width: "minmax(120px, 0.62fr)",
        hideBelow: 900,
        cell: ({ row }) => (
          <ResourceOverviewStatus
            active={row.isActive}
            activeLabel="Current"
            inactiveLabel="Available"
          />
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: OrganizationOverviewRow,
  ): readonly PlatformDataTableAction<OrganizationOverviewRow>[] => [
    { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(row) },
    {
      id: "activate",
      label: "Set active",
      icon: Check,
      hidden: row.isActive,
      onSelect: () => onActivate(row),
    },
    {
      id: "rename",
      label: "Rename",
      icon: SquarePen,
      hidden: !row.canRename,
      onSelect: () => onRename(row),
    },
  ];

  const browseOrganizations = () => {
    if (typeof document === "undefined") return;
    document
      .querySelector(
        ".resource-overview-page.is-organizations .resource-overview-page__table-section",
      )
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <ResourceOverviewPage<OrganizationOverviewRow>
      heroContent={
        <OrganizationsOverviewGuide
          organizationCount={rows.length}
          onCreate={onCreate}
          onBrowse={browseOrganizations}
          onOpenDocumentation={onOpenDocumentation}
        />
      }
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-organizations"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Organizations",
        className: "resource-overview-table is-organizations",
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          title: "All Organizations",
          search: {
            placeholder: "Search organizations",
            getSearchText: (row) =>
              row.searchText || `${row.name} ${row.roleLabel} ${row.typeLabel}`,
          },
          filters: [
            {
              id: "type",
              label: "Type",
              value: organizationFilter,
              onChange: setOrganizationFilter,
              options: [
                { id: "all", label: "All Organizations" },
                { id: "current", label: "Current Organization" },
                { id: "company", label: "Company Organizations" },
                { id: "personal", label: "Personal Organization" },
              ],
            },
          ],
          primaryAction: { label: "New Organization", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: "No organizations yet.",
        noResultsState: "No organizations match this view.",
      }}
    />
  );
}
