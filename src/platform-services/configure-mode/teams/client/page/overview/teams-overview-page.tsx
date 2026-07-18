import { ChevronRight, Plus, SquarePen, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { TeamsOverviewGuide } from "./teams-overview-guide.js";

export interface TeamOverviewRow {
  id: string;
  name: string;
  roleLabel: string;
  ownerLabel: string;
  ownership: "owned" | "member";
  createdAt: number;
  createdLabel: string;
  createdTitle?: string;
  searchText?: string;
}

export interface TeamsOverviewPageProps {
  rows: readonly TeamOverviewRow[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  onOpen: (row: TeamOverviewRow) => void;
  onCreate: () => void;
  onRename: (row: TeamOverviewRow) => void;
  onOpenDocumentation: () => void;
}

export function TeamsOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
  onRename,
  onOpenDocumentation,
}: TeamsOverviewPageProps) {
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const filteredRows = useMemo(
    () => rows.filter((row) => ownershipFilter === "all" || row.ownership === ownershipFilter),
    [ownershipFilter, rows],
  );

  const columns = useMemo<PlatformDataTableColumn<TeamOverviewRow>[]>(
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
            icon={UsersRound}
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
        id: "owner",
        header: "Owner",
        accessor: "ownerLabel",
        sortable: true,
        width: "minmax(170px, 0.88fr)",
        hideBelow: 760,
        cell: ({ row }) => <ResourceOverviewValue>{row.ownerLabel}</ResourceOverviewValue>,
      },
      {
        id: "created",
        header: "Created",
        accessor: "createdAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(120px, 0.62fr)",
        hideBelow: 900,
        cell: ({ row }) => (
          <ResourceOverviewValue title={row.createdTitle}>{row.createdLabel}</ResourceOverviewValue>
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: TeamOverviewRow,
  ): readonly PlatformDataTableAction<TeamOverviewRow>[] => [
    { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(row) },
    { id: "rename", label: "Rename", icon: SquarePen, onSelect: () => onRename(row) },
  ];

  const browseTeams = () => {
    if (typeof document === "undefined") return;
    document
      .querySelector(".resource-overview-page.is-teams .resource-overview-page__table-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <ResourceOverviewPage<TeamOverviewRow>
      heroContent={
        <TeamsOverviewGuide
          teamCount={rows.length}
          onCreate={onCreate}
          onBrowse={browseTeams}
          onOpenDocumentation={onOpenDocumentation}
        />
      }
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-teams"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Teams",
        className: "resource-overview-table is-teams",
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          title: "All Teams",
          search: {
            placeholder: "Search teams",
            getSearchText: (row) =>
              row.searchText || `${row.name} ${row.roleLabel} ${row.ownerLabel}`,
          },
          filters: [
            {
              id: "ownership",
              label: "Ownership",
              value: ownershipFilter,
              onChange: setOwnershipFilter,
              options: [
                { id: "all", label: "All Teams" },
                { id: "owned", label: "Owned by You" },
                { id: "member", label: "Member Teams" },
              ],
            },
          ],
          primaryAction: { label: "New Team", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: "No teams yet.",
        noResultsState: "No teams match this view.",
      }}
    />
  );
}
