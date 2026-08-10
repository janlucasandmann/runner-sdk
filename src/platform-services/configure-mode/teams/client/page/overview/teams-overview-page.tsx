import { ChevronRight, Plus, SquarePen, UsersRound } from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { TeamsOverviewGuide } from "./teams-overview-guide.js";

export interface TeamOverviewRow {
  id: string;
  name: string;
  profileImageUrl?: string;
  profileFallback?: string;
  roleLabel: string;
  ownerLabel: string;
  ownerAvatarUrl?: string;
  ownerFallback?: string;
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
}

export function TeamsOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
  onRename,
}: TeamsOverviewPageProps) {
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
            imageUrl={row.profileImageUrl}
            fallback={row.profileFallback}
            iconClassName="is-team"
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
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.ownerLabel}
            imageUrl={row.ownerAvatarUrl}
            fallback={row.ownerFallback}
            iconClassName="is-creator"
          />
        ),
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

  return (
    <ResourceOverviewPage<TeamOverviewRow>
      heroContent={<TeamsOverviewGuide />}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-teams"
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Teams",
        className: "resource-overview-table is-teams",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          search: {
            placeholder: "Search teams",
            getSearchText: (row) =>
              row.searchText || `${row.name} ${row.roleLabel} ${row.ownerLabel}`,
          },
          primaryAction: { label: "New Team", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: (
          <PlatformEmptyState
            icon={UsersRound}
            title="No teams yet"
            description="Create a team to organize members and share resources across your organization."
            primaryAction={{ label: "Create Team", onClick: onCreate }}
          />
        ),
        noResultsState: "No teams match this view.",
      }}
    />
  );
}
