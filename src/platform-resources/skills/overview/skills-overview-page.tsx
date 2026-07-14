import { ChevronRight, Plus, SquarePen, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { PlatformDataTableAction, PlatformDataTableColumn } from "../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewStatus,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../platform-ui/pages/overview/index.js";

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
  loading?: boolean;
  mutating?: boolean;
  headerActions?: ReactNode;
  onOpen: (row: SkillOverviewRow) => void;
  onCreate: () => void;
  onEdit: (row: SkillOverviewRow) => void;
  onRename: (row: SkillOverviewRow) => void;
  onDelete: (rows: readonly SkillOverviewRow[]) => void;
}

function createSkillsFallbackAnalytics(rows: readonly SkillOverviewRow[]): ResourceOverviewAnalyticsModel {
  const active = rows.filter((row) => row.isActive).length;
  const custom = rows.filter((row) => row.isCustom).length;
  return {
    title: "Skill activity",
    ariaLabel: "Skill activity overview",
    metrics: [
      { id: "skills", label: "Skills", value: String(rows.length), color: "#8fc4ff" },
      { id: "active", label: "Active", value: String(active), color: "#7effff" },
      { id: "custom", label: "Custom", value: String(custom), color: "#6750ff" },
      { id: "disabled", label: "Disabled", value: String(rows.length - active), color: "#8a8a8a" },
    ],
    labels: [],
    series: [],
    emptyState: "Skill usage appears here after skills are invoked by agents.",
  };
}

export function SkillsOverviewPage({
  rows,
  mode,
  onModeChange,
  period,
  onPeriodChange,
  analytics,
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
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (statusFilter === "active") return row.isActive;
    if (statusFilter === "disabled") return !row.isActive;
    return true;
  }), [rows, statusFilter]);
  const resolvedAnalytics = analytics || createSkillsFallbackAnalytics(rows);

  const columns = useMemo<PlatformDataTableColumn<SkillOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      width: "minmax(220px, 1.35fr)",
      cell: ({ row }) => (
        <div className="resource-overview-identity">
          <span className="resource-overview-identity__visual is-skill" aria-hidden="true">{row.icon}</span>
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

  const modeSwitch = (
    <div className="resource-overview-segmented" role="group" aria-label="Skill type">
      <button type="button" className={mode === "system" ? "is-active" : ""} onClick={() => onModeChange("system")} aria-pressed={mode === "system"}>System</button>
      <button type="button" className={mode === "custom" ? "is-active" : ""} onClick={() => onModeChange("custom")} aria-pressed={mode === "custom"}>Custom</button>
    </div>
  );

  return (
    <ResourceOverviewPage<SkillOverviewRow>
      title="Configure your Skills"
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={resolvedAnalytics}
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
        toolbar: {
          title: "All Skills",
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
          trailing: modeSwitch,
          primaryAction: { label: "New Skill", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        emptyState: mode === "custom" ? "No custom skills yet." : "No system skills available.",
      }}
    />
  );
}
