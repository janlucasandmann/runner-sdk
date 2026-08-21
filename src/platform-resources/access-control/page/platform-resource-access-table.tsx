import { Settings2, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
  type PlatformDataTableFilter,
  type PlatformDataTablePaginationConfig,
  type PlatformDataTableSearchConfig,
  type PlatformDataTableSortingConfig,
} from "../../../platform-ui/components/composite/data-table/index.js";
import { PlatformPermissionHelpTooltip } from "../../../platform-ui/pages/permissions/index.js";
import {
  composePlatformAccessPrincipalRows,
  getPlatformAccessPrincipalProfileImageUrl,
  isPlatformSystemAccessPrincipalId,
  type PlatformAccessPrincipal,
  type PlatformSystemAccessPrincipal,
} from "../domain/access-principals.js";

export interface PlatformResourceAccessTableProps<
  TTeam extends PlatformAccessPrincipal,
> {
  teams: readonly TTeam[];
  resourceLabel: string;
  title?: ReactNode;
  titleTooltip?: string;
  className?: string;
  selectedIds?: ReadonlySet<string>;
  busy?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  error?: ReactNode;
  search?: PlatformDataTableSearchConfig<PlatformSystemAccessPrincipal | TTeam>;
  filters?: readonly PlatformDataTableFilter[];
  pagination?: PlatformDataTablePaginationConfig | false;
  sorting?: PlatformDataTableSortingConfig;
  onSelectedIdsChange?: (selectedIds: Set<string>) => void;
  onOpenPermissions: (
    principal: PlatformSystemAccessPrincipal | TTeam,
  ) => void;
  onRemoveTeams?: (teams: readonly TTeam[]) => void;
  getTeamActions?: (
    team: TTeam,
  ) => readonly PlatformDataTableAction<PlatformSystemAccessPrincipal | TTeam>[];
  getTeamProfileImageUrl?: (team: TTeam) => string;
  formatCreatedAt?: (createdAt: string) => ReactNode;
}

function getPrincipalInitials(name: string): string {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (parts.length > 1
    ? `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`
    : parts[0]?.slice(0, 2) || "T"
  ).toUpperCase();
}

export function PlatformResourceAccessPrincipalAvatar({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const canRenderImage = Boolean(imageUrl) && !imageFailed;

  return (
    <span
      className="platform-resource-access-table__principal-avatar"
      aria-hidden="true"
    >
      {canRenderImage ? (
        <img
          className="platform-resource-access-table__principal-avatar-image"
          src={imageUrl}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="platform-resource-access-table__principal-avatar-fallback">
          {getPrincipalInitials(name)}
        </span>
      )}
    </span>
  );
}

export function PlatformResourceAccessTable<
  TTeam extends PlatformAccessPrincipal,
>({
  teams,
  resourceLabel,
  title = `Manage ${resourceLabel} Access`,
  titleTooltip = "",
  className = "",
  selectedIds,
  busy = false,
  leading = null,
  trailing = null,
  error = null,
  search,
  filters,
  pagination = false,
  sorting,
  onSelectedIdsChange,
  onOpenPermissions,
  onRemoveTeams,
  getTeamActions,
  getTeamProfileImageUrl,
  formatCreatedAt = (value) => value || "—",
}: PlatformResourceAccessTableProps<TTeam>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const effectiveSelectedIds = selectedIds || internalSelectedIds;
  const updateSelectedIds = (nextSelectedIds: Set<string>) => {
    if (!selectedIds) setInternalSelectedIds(nextSelectedIds);
    onSelectedIdsChange?.(nextSelectedIds);
  };
  const rows = useMemo(
    () => composePlatformAccessPrincipalRows(teams),
    [teams],
  );
  const columns = useMemo<
    PlatformDataTableColumn<PlatformSystemAccessPrincipal | TTeam>[]
  >(
    () => [
      {
        id: "name",
        header: "Team",
        accessor: "name",
        sortable: true,
        width: "minmax(240px, 1.45fr)",
        cell: ({ row }) => {
          const imageUrl = isPlatformSystemAccessPrincipalId(row.id)
            ? ""
            : String(
                getTeamProfileImageUrl?.(row as TTeam) ||
                  getPlatformAccessPrincipalProfileImageUrl(row),
              ).trim();
          return (
            <div className="platform-resource-access-table__principal">
              <PlatformResourceAccessPrincipalAvatar
                key={imageUrl || row.id}
                name={row.name}
                imageUrl={imageUrl}
              />
              <span className="platform-resource-access-table__principal-name">
                {row.name}
              </span>
            </div>
          );
        },
      },
      {
        id: "policy",
        header: "Policy",
        accessor: (row) =>
          isPlatformSystemAccessPrincipalId(row.id)
            ? "Default policy"
            : "Role policy",
        sortable: true,
        width: "minmax(150px, .9fr)",
      },
      {
        id: "created",
        header: "Created",
        accessor: (row) => Date.parse(row.createdAt || "") || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(120px, .7fr)",
        align: "end",
        cell: ({ row }) =>
          isPlatformSystemAccessPrincipalId(row.id)
            ? "Default"
            : formatCreatedAt(row.createdAt || ""),
      },
    ],
    [formatCreatedAt, getTeamProfileImageUrl],
  );

  return (
    <PlatformDataTable
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      ariaLabel={`${resourceLabel} access`}
      className={`platform-resource-access-table${className ? ` ${className}` : ""}`}
      surface="plain"
      layout="fill"
      variant="minimalistic-ui"
      sticky={false}
      pagination={pagination}
      sorting={sorting || { defaultValue: { id: "name", direction: "asc" } }}
      selection={{
        enabled: true,
        value: effectiveSelectedIds,
        isRowSelectable: (row) => !isPlatformSystemAccessPrincipalId(row.id),
        ariaLabel: (row) =>
          isPlatformSystemAccessPrincipalId(row.id)
            ? `${row.name} is always included`
            : `Select ${row.name}`,
        onChange: ({ selectedIds: nextSelectedIds }) =>
          updateSelectedIds(new Set(nextSelectedIds)),
      }}
      toolbar={{
        leading,
        title: titleTooltip && typeof title === "string" ? (
          <span className="platform-resource-access-table__title">
            <span>{title}</span>
            <PlatformPermissionHelpTooltip
              text={titleTooltip}
              ariaLabel={`About ${title}`}
              placement="bottom"
            />
          </span>
        ) : title || undefined,
        controlsLeading: trailing,
        search: search || {
          placeholder: "Search access",
          getSearchText: (row) =>
            `${row.name} ${row.description || ""} ${row.roleLabel || ""}`,
        },
        filters,
      }}
      onRowActivate={onOpenPermissions}
      getRowAriaLabel={(row) => `Edit permissions for ${row.name}`}
      getRowActions={(row) => [
        {
          id: "edit-permissions",
          label: "Edit permissions",
          icon: Settings2,
          onSelect: () => onOpenPermissions(row),
        },
        ...(!isPlatformSystemAccessPrincipalId(row.id) && getTeamActions
          ? getTeamActions(row as TTeam)
          : []),
        ...(!isPlatformSystemAccessPrincipalId(row.id) && onRemoveTeams
          ? [
              {
                id: "remove-team-access",
                label: "Remove team access",
                icon: Trash2,
                danger: true,
                disabled: busy,
                onSelect: ({
                  rows: selectedRows,
                }: {
                  rows: readonly (PlatformSystemAccessPrincipal | TTeam)[];
                }) => {
                  const removableTeams = selectedRows.filter(
                    (selectedRow): selectedRow is TTeam =>
                      !isPlatformSystemAccessPrincipalId(selectedRow.id),
                  );
                  onRemoveTeams(removableTeams);
                  updateSelectedIds(
                    new Set(
                      [...effectiveSelectedIds].filter(
                        (id) =>
                          !removableTeams.some((team) => team.id === id),
                      ),
                    ),
                  );
                },
              },
            ]
          : []),
      ]}
      error={error}
      emptyState="Default access principals are unavailable."
      noResultsState="No matching access principals found."
    />
  );
}
