import { ChevronRight, Sparkles, SquarePen, Trash2 } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableRowGroupingConfig,
  PlatformDataTableRowReorderingConfig,
  PlatformDataTableSortingConfig,
} from "../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewCatalogIdentityCell,
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../platform-ui/pages/overview/index.js";
import { SkillsOverviewGuide } from "./skills-overview-guide.js";

const COMPUTER_AGENTS_CREATOR_NAME = "Computer Agents";
const COMPUTER_AGENTS_CREATOR_PROFILE_URL =
  "/img/agent-profile-pics/ca-profilepic.jpg";

export interface SkillOverviewRow {
  id: string;
  name: string;
  description?: string;
  searchText?: string;
  icon?: ReactNode;
  isComputerAgents?: boolean;
  isActive: boolean;
  isCustom: boolean;
  creatorName?: string;
  creatorAvatarUrl?: string;
  updatedAt?: number;
  updatedLabel: string;
  updatedTitle?: string;
}

export interface SkillsOverviewPageProps {
  rows: readonly SkillOverviewRow[];
  mode: "system" | "custom";
  onModeChange: (mode: "system" | "custom") => void;
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics?: ResourceOverviewAnalyticsModel;
  controlsPortalId?: string;
  loading?: boolean;
  mutating?: boolean;
  headerActions?: ReactNode;
  onOpen: (row: SkillOverviewRow) => void;
  onCreate: () => void;
  onEdit: (row: SkillOverviewRow) => void;
  onRename: (row: SkillOverviewRow) => void;
  onDelete: (rows: readonly SkillOverviewRow[]) => void;
  resourceName?: string;
  systemGroupLabel?: string;
  customGroupLabel?: string;
  searchPlaceholder?: string;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;
  heroContent?: ReactNode;
  pageClassName?: string;
  grouping?: "skills" | "flat";
  rowGrouping?: PlatformDataTableRowGroupingConfig<SkillOverviewRow>;
  rowReordering?: PlatformDataTableRowReorderingConfig<SkillOverviewRow>;
  sorting?: PlatformDataTableSortingConfig;
  sortableColumns?: boolean;
  /** Optional service-owned actions when this catalog shell is reused. */
  rowActions?: (
    row: SkillOverviewRow,
    state: { targetRows: readonly SkillOverviewRow[] },
  ) => readonly PlatformDataTableAction<SkillOverviewRow>[];
}

function getCreatorName(row: SkillOverviewRow): string {
  return row.creatorName?.trim()
    || (row.isCustom ? "You" : COMPUTER_AGENTS_CREATOR_NAME);
}

function getCreatorFallback(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function SkillsOverviewPage({
  rows,
  period,
  onPeriodChange,
  analytics,
  controlsPortalId,
  loading = false,
  mutating = false,
  headerActions,
  onOpen,
  onEdit,
  onRename,
  onDelete,
  resourceName = "Skills",
  systemGroupLabel = "System Skills",
  customGroupLabel = "Custom Skills",
  searchPlaceholder = "Search skills",
  emptyState = "No skills available.",
  noResultsState = "No skills match this view.",
  heroContent = <SkillsOverviewGuide />,
  pageClassName = "is-skills",
  grouping = "skills",
  rowGrouping,
  rowReordering,
  sorting,
  sortableColumns = true,
  rowActions,
}: SkillsOverviewPageProps) {
  const columns = useMemo<PlatformDataTableColumn<SkillOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: sortableColumns,
      width: "minmax(320px, 1.8fr)",
      cell: ({ row }) => (
        <ResourceOverviewCatalogIdentityCell
          title={row.name}
          description={row.description}
          icon={row.icon || <Sparkles width={16} height={16} strokeWidth={1.8} />}
          iconClassName={`is-skill${
              row.isComputerAgents
                || row.id.trim().toLowerCase() === "computer_agents"
                ? " is-computer-agents"
                : ""
            }`}
        />
      ),
    },
    {
      id: "creator",
      header: "Creator",
      accessor: getCreatorName,
      width: "minmax(160px, 0.62fr)",
      cell: ({ row }) => {
        const creatorName = getCreatorName(row);
        return (
          <ResourceOverviewIdentityCell
            title={creatorName}
            imageUrl={
              row.creatorAvatarUrl
              || (row.isCustom
                ? undefined
                : COMPUTER_AGENTS_CREATOR_PROFILE_URL)
            }
            fallback={getCreatorFallback(creatorName)}
            iconClassName="is-creator"
          />
        );
      },
    },
    {
      id: "updated",
      header: "Updated",
      accessor: (row) => row.updatedAt || 0,
      sortable: sortableColumns,
      sortDescFirst: true,
      width: "minmax(120px, 0.48fr)",
      hideBelow: 900,
      cell: ({ row }) => <ResourceOverviewValue title={row.updatedTitle}>{row.updatedLabel}</ResourceOverviewValue>,
    },
  ], [sortableColumns]);

  const getRowActions = (row: SkillOverviewRow, state: { targetRows: readonly SkillOverviewRow[] }): readonly PlatformDataTableAction<SkillOverviewRow>[] => {
    if (rowActions) return rowActions(row, state);
    const targets = state.targetRows.length ? state.targetRows : [row];
    const customTargets = targets.filter((target) => target.isCustom);
    if (targets.length > 1) {
      return [{
        id: "delete",
        label: "Delete selected",
        icon: Trash2,
        danger: true,
        disabled: mutating || !customTargets.length,
        onSelect: () => onDelete(customTargets),
      }];
    }
    return [
      { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(row) },
      { id: "edit", label: "Edit", icon: SquarePen, hidden: !row.isCustom, disabled: mutating, onSelect: () => onEdit(row) },
      { id: "rename", label: "Rename", icon: SquarePen, hidden: !row.isCustom, disabled: mutating, onSelect: () => onRename(row) },
      { id: "delete", label: "Delete", icon: Trash2, hidden: !row.isCustom, danger: true, separatorBefore: true, disabled: mutating, onSelect: () => onDelete([row]) },
    ];
  };

  return (
    <ResourceOverviewPage<SkillOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={analytics}
      heroContent={heroContent}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      headerActions={headerActions}
      className={pageClassName}
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: resourceName,
        className: `resource-overview-table ${pageClassName}`,
        variant: "catalog-ui",
        sorting: sorting ?? { defaultValue: { id: "updated", direction: "desc" } },
        rowGrouping: rowGrouping ?? (grouping === "flat" ? undefined : {
          groups: [
            {
              id: "system",
              label: systemGroupLabel,
              ariaLabel: systemGroupLabel,
            },
            {
              id: "custom",
              label: customGroupLabel,
              ariaLabel: customGroupLabel,
            },
          ],
          getGroupId: (row) => row.isCustom ? "custom" : "system",
        }),
        rowReordering,
        pagination: false,
        toolbar: {
          search: {
            placeholder: searchPlaceholder,
            getSearchText: (row) =>
              `${row.searchText || row.name} ${getCreatorName(row)}`,
          },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        emptyState,
        noResultsState,
      }}
    />
  );
}
