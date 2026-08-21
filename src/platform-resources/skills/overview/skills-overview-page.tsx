import {
  ChevronRight,
  Plus,
  Sparkles,
  SquareMousePointer,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableRowGroupingConfig,
  PlatformDataTableRowReorderingConfig,
  PlatformDataTableSelectionConfig,
  PlatformDataTableSortingConfig,
} from "../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../platform-ui/components/composite/empty-state/index.js";
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
  ownerName?: string;
  ownerAvatarUrl?: string;
  updatedAt?: number;
  updatedLabel: string;
  updatedTitle?: string;
}

export interface SkillOverviewIdentity {
  name: string;
  imageUrl?: string;
  fallback?: string;
}

export interface SkillsOverviewIdentityColumn {
  id?: string;
  header: ReactNode;
  getIdentity: (row: SkillOverviewRow) => SkillOverviewIdentity;
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
  selection?: PlatformDataTableSelectionConfig<SkillOverviewRow>;
  identityColumn?: SkillsOverviewIdentityColumn;
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

function getIdentityFallback(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getOwnerIdentity(row: SkillOverviewRow): SkillOverviewIdentity {
  const isSystemSkill = !row.isCustom;
  const name = isSystemSkill
    ? COMPUTER_AGENTS_CREATOR_NAME
    : row.ownerName?.trim() || getCreatorName(row);
  return {
    name,
    imageUrl: isSystemSkill
      ? COMPUTER_AGENTS_CREATOR_PROFILE_URL
      : row.ownerAvatarUrl || row.creatorAvatarUrl,
    fallback: getIdentityFallback(name),
  };
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
  onCreate,
  onEdit,
  onRename,
  onDelete,
  resourceName = "Skills",
  systemGroupLabel = "System Skills",
  customGroupLabel = "Custom Skills",
  searchPlaceholder = "Search skills",
  emptyState,
  noResultsState = "No skills match this view.",
  heroContent = <SkillsOverviewGuide />,
  pageClassName = "is-skills",
  grouping = "skills",
  rowGrouping,
  rowReordering,
  selection,
  identityColumn,
  sorting,
  sortableColumns = true,
  rowActions,
}: SkillsOverviewPageProps) {
  const resolveIdentity = identityColumn?.getIdentity || getOwnerIdentity;
  const resolvedEmptyState = emptyState ?? (
    <PlatformEmptyState
      icon={SquareMousePointer}
      title="No skills available"
      description="Create a custom skill to give agents reusable expertise and repeatable workflows."
      primaryAction={{
        label: "Custom Skill",
        icon: Plus,
        onClick: onCreate,
      }}
    />
  );
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
      id: identityColumn?.id || "owner",
      header: identityColumn?.header || "Owner",
      accessor: (row) => resolveIdentity(row).name,
      width: "minmax(160px, 0.62fr)",
      cell: ({ row }) => {
        const identity = resolveIdentity(row);
        return (
          <ResourceOverviewIdentityCell
            title={identity.name}
            imageUrl={identity.imageUrl}
            fallback={identity.fallback || getIdentityFallback(identity.name)}
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
  ], [identityColumn?.header, identityColumn?.id, resolveIdentity, sortableColumns]);

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
        selection,
        pagination: false,
        toolbar: {
          search: {
            placeholder: searchPlaceholder,
            getSearchText: (row) =>
              `${row.searchText || row.name} ${resolveIdentity(row).name}`,
          },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        emptyState: resolvedEmptyState,
        noResultsState,
      }}
    />
  );
}
