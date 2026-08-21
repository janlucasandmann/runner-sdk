import { Rocket, SquarePen, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewCatalogIdentityCell,
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import { ProjectsOverviewGuide } from "./projects-overview-guide.js";
import type {
  ProjectOverviewRow,
  ProjectOverviewStatus,
} from "./projects-overview-model.js";

type ProjectOverviewAction = (row: ProjectOverviewRow) => void | Promise<void>;

export interface ProjectsOverviewPageProps {
  rows: readonly ProjectOverviewRow[];
  loading?: boolean;
  mutating?: boolean;
  error?: React.ReactNode;
  onOpen: ProjectOverviewAction;
  onEdit: ProjectOverviewAction;
  onDelete: (rows: readonly ProjectOverviewRow[]) => void;
}

function getStatusVariant(status: ProjectOverviewStatus): PlatformLabelVariant {
  if (status === "on_track" || status === "completed") return "green";
  if (status === "in_progress") return "blue";
  if (status === "at_risk") return "yellow";
  if (status === "blocked") return "red";
  return "gray";
}

function getOwnerFallback(row: ProjectOverviewRow): string {
  if (row.ownerFallback) return row.ownerFallback;
  return row.ownerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function ProjectsOverviewPage({
  rows,
  loading = false,
  mutating = false,
  error,
  onOpen,
  onEdit,
  onDelete,
}: ProjectsOverviewPageProps) {
  const columns = useMemo<PlatformDataTableColumn<ProjectOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
        width: "minmax(320px, 1.8fr)",
        cell: ({ row }) => (
          <ResourceOverviewCatalogIdentityCell
            title={row.name}
            description={row.description}
            icon={row.icon || <Rocket width={16} height={16} strokeWidth={1.8} />}
            iconClassName="is-project"
          />
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "statusRank",
        sortable: true,
        width: "minmax(105px, 0.62fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={getStatusVariant(row.status)}>
            {row.statusLabel}
          </PlatformLabel>
        ),
      },
      {
        id: "owner",
        header: "Owner",
        accessor: "ownerName",
        sortable: true,
        width: "minmax(160px, 0.62fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.ownerName}
            imageUrl={row.ownerAvatarUrl}
            fallback={getOwnerFallback(row)}
            iconClassName="is-creator"
          />
        ),
      },
      {
        id: "updated",
        header: "Updated",
        accessor: (row) => row.updatedAt || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(125px, 0.72fr)",
        cell: ({ row }) => (
          <ResourceOverviewValue title={row.updatedTitle}>
            {row.updatedLabel}
          </ResourceOverviewValue>
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: ProjectOverviewRow,
    state: { targetRows: readonly ProjectOverviewRow[] },
  ): readonly PlatformDataTableAction<ProjectOverviewRow>[] => [
    {
      id: "edit",
      label: "Edit",
      icon: SquarePen,
      disabled: mutating,
      onSelect: () => onEdit(row),
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      separatorBefore: true,
      disabled: mutating,
      onSelect: () => onDelete([row]),
      selectedRows: {
        label: "Delete selected",
        danger: true,
        disabled: mutating,
        onSelect: ({ rows: selectedRows }) => onDelete(selectedRows),
      },
    },
  ];

  return (
    <ResourceOverviewPage<ProjectOverviewRow>
      heroContent={<ProjectsOverviewGuide />}
      showPeriodSelector={false}
      className="is-projects"
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Projects",
        className: "resource-overview-table is-projects",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: {
          enabled: true,
          ariaLabel: (row) => `Select ${row.name}`,
        },
        pagination: false,
        toolbar: {
          search: {
            placeholder: "Search projects",
            getSearchText: (row) =>
              row.searchText ||
              [
                row.name,
                row.description,
                row.projectTypeLabel,
                row.statusLabel,
                row.ownerName,
              ]
                .filter(Boolean)
                .join(" "),
          },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error,
        emptyState: "No projects match this view.",
        noResultsState: "No projects match this view.",
      }}
    />
  );
}
