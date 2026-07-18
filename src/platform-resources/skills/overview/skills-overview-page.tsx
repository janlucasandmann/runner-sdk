import { ChevronRight, Plus, Sparkles, SquarePen, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { PlatformDataTableAction, PlatformDataTableColumn } from "../../../platform-ui/components/composite/data-table/index.js";
import { PlatformDetailTabBar } from "../../../platform-ui/components/composite/detail-tab-bar/index.js";
import {
  ResourceOverviewPage,
  ResourceOverviewStatus,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../platform-ui/pages/overview/index.js";
import { SkillsOverviewGuide } from "./skills-overview-guide.js";

export interface SkillOverviewRow {
  id: string;
  name: string;
  searchText?: string;
  icon?: ReactNode;
  isActive: boolean;
  isCustom: boolean;
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
}

export function SkillsOverviewPage({
  rows,
  mode,
  onModeChange,
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
}: SkillsOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const systemSkillCount = useMemo(() => rows.filter((row) => !row.isCustom).length, [rows]);
  const customSkillCount = rows.length - systemSkillCount;
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (mode === "system" && row.isCustom) return false;
    if (mode === "custom" && !row.isCustom) return false;
    if (statusFilter === "active") return row.isActive;
    if (statusFilter === "disabled") return !row.isActive;
    return true;
  }), [mode, rows, statusFilter]);

  const columns = useMemo<PlatformDataTableColumn<SkillOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      width: "minmax(220px, 1.35fr)",
      cell: ({ row }) => (
        <div className="resource-overview-identity">
          <span className="resource-overview-identity__visual is-skill" aria-hidden="true">
            {row.icon || <Sparkles width={16} height={16} strokeWidth={1.8} />}
          </span>
          <span className="resource-overview-identity__title">{row.name}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.isActive ? "Active" : "Disabled",
      sortable: true,
      width: "minmax(110px, 0.58fr)",
      cell: ({ row }) => <ResourceOverviewStatus active={row.isActive} activeLabel="Active" inactiveLabel="Disabled" />,
    },
    {
      id: "type",
      header: "Type",
      accessor: (row) => row.isCustom ? "Custom" : "System",
      sortable: true,
      width: "minmax(105px, 0.55fr)",
      hideBelow: 760,
      cell: ({ row }) => <ResourceOverviewValue>{row.isCustom ? "Custom" : "System"}</ResourceOverviewValue>,
    },
    {
      id: "updated",
      header: "Updated",
      accessor: (row) => row.updatedAt || 0,
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.62fr)",
      hideBelow: 900,
      cell: ({ row }) => <ResourceOverviewValue title={row.updatedTitle}>{row.updatedLabel}</ResourceOverviewValue>,
    },
  ], []);

  const getRowActions = (row: SkillOverviewRow, state: { targetRows: readonly SkillOverviewRow[] }): readonly PlatformDataTableAction<SkillOverviewRow>[] => {
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

  const modeTabs = (
    <PlatformDetailTabBar<"system" | "custom">
      ariaLabel="Skill categories"
      value={mode}
      tabs={[
        { id: "system", label: "System Skills" },
        { id: "custom", label: "Custom Skills" },
      ]}
      onValueChange={onModeChange}
      variant="minimal"
      className="skills-overview-tab-bar"
    />
  );

  return (
    <ResourceOverviewPage<SkillOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={analytics}
      heroContent={(
        <SkillsOverviewGuide
          systemSkillCount={systemSkillCount}
          customSkillCount={customSkillCount}
          onBrowseSystem={() => onModeChange("system")}
          onBrowseCustom={() => onModeChange("custom")}
          onCreate={onCreate}
        />
      )}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      headerActions={headerActions}
      className="is-skills"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Skills",
        className: "resource-overview-table is-skills",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          leading: modeTabs,
          search: { placeholder: "Search skills", getSearchText: (row) => row.searchText || row.name },
          filters: [{
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: "All Status" },
              { id: "active", label: "Active" },
              { id: "disabled", label: "Disabled" },
            ],
          }],
          primaryAction: { label: "Skill", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        emptyState: mode === "custom" ? "No custom skills yet." : "No system skills available.",
        noResultsState: "No skills match this view.",
      }}
    />
  );
}
