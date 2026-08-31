import {
  Bot,
  Copy,
  Layers,
  Plus,
  SquarePen,
  Trash2,
  UsersRound,
} from "../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../platform-ui/components/composite/data-table/index.js";
import { PlatformDetailTabBar } from "../../../platform-ui/components/composite/detail-tab-bar/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../platform-ui/pages/overview/index.js";

export type AgentOverviewMode = "agents" | "squads" | "functional";

export interface AgentOverviewRow {
  id: string;
  name: string;
  usageTokens: number;
  searchText?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  isSquad?: boolean;
  isSystem?: boolean;
  isFunctional?: boolean;
  modelLabel: string;
  modelIconUrl?: string;
  modelIconClassName?: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  creatorIsSystem?: boolean;
  lastUsedAt?: number;
  lastUsedLabel: string;
  lastUsedTitle?: string;
}

export interface AgentsOverviewPageProps {
  rows: readonly AgentOverviewRow[];
  mode: AgentOverviewMode;
  onModeChange: (mode: AgentOverviewMode) => void;
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics: ResourceOverviewAnalyticsModel;
  controlsPortalId?: string;
  periodPortalId?: string;
  loading?: boolean;
  mutating?: boolean;
  headerActions?: React.ReactNode;
  onOpen: (row: AgentOverviewRow) => void;
  onCreateAgent: () => void;
  onCreateSquad: () => void;
  onRename: (row: AgentOverviewRow) => void;
  onShare: (rows: readonly AgentOverviewRow[]) => void;
  onAddToSquad: (rows: readonly AgentOverviewRow[]) => void;
  onCopy: (row: AgentOverviewRow) => void;
  onDelete: (rows: readonly AgentOverviewRow[]) => void;
}

export function AgentsOverviewPage({
  rows,
  mode,
  onModeChange,
  period,
  onPeriodChange,
  analytics,
  controlsPortalId,
  periodPortalId,
  loading = false,
  mutating = false,
  headerActions,
  onOpen,
  onCreateAgent,
  onCreateSquad,
  onRename,
  onShare,
  onAddToSquad,
  onCopy,
  onDelete,
}: AgentsOverviewPageProps) {
  const [typeFilter, setTypeFilter] = useState("all");
  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        if (mode === "functional") return true;
        if (typeFilter === "system") return row.isSystem;
        if (typeFilter === "custom") return !row.isSystem;
        return true;
      }),
    [mode, rows, typeFilter],
  );

  const columns = useMemo<PlatformDataTableColumn<AgentOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
        width: "minmax(220px, 1.35fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            imageUrl={row.avatarUrl}
            fallback={row.avatarFallback}
            icon={row.isSquad ? Layers : row.avatarUrl ? undefined : Bot}
            iconClassName={row.isSquad ? "is-squad" : "is-agent"}
          />
        ),
      },
      {
        id: "usage",
        header: "Token Usage",
        accessor: "usageTokens",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(110px, 0.52fr)",
        cell: ({ row }) => {
          const formattedTokens = Math.max(
            0,
            Math.round(Number(row.usageTokens) || 0),
          ).toLocaleString("en-US");
          return (
            <ResourceOverviewValue title={`${formattedTokens} tokens`}>
              {formattedTokens}
            </ResourceOverviewValue>
          );
        },
      },
      {
        id: "model",
        header: "Model",
        accessor: "modelLabel",
        sortable: true,
        width: "minmax(220px, 1fr)",
        hideBelow: 760,
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.modelLabel}
            imageUrl={row.modelIconUrl}
            imageClassName={row.modelIconClassName}
            icon={row.modelIconUrl ? undefined : Bot}
            iconClassName="is-model"
            size="compact"
          />
        ),
      },
      {
        id: "creator",
        header: "Creator",
        accessor: "creatorName",
        sortable: true,
        width: "minmax(180px, 0.82fr)",
        hideBelow: 940,
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.creatorName}
            imageUrl={row.creatorAvatarUrl}
            fallback={row.creatorFallback}
            iconClassName="is-creator"
          />
        ),
      },
      {
        id: "lastUsed",
        header: "Last used",
        accessor: (row) => row.lastUsedAt || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(110px, 0.46fr)",
        cell: ({ row }) => (
          <ResourceOverviewValue title={row.lastUsedTitle}>
            {row.lastUsedLabel}
          </ResourceOverviewValue>
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: AgentOverviewRow,
    state: { targetRows: readonly AgentOverviewRow[] },
  ): readonly PlatformDataTableAction<AgentOverviewRow>[] => {
    if (mode === "functional" || row.isFunctional) return [];
    const targets = state.targetRows.length ? state.targetRows : [row];
    const bulk = targets.length > 1;
    const deletable = targets.filter((target) => !target.isSystem);
    const squadEligible = targets.filter((target) => !target.isSquad);
    if (bulk) {
      return [
        {
          id: "share",
          label: "Share selected with Team",
          icon: UsersRound,
          disabled: mutating,
          onSelect: () => onShare(targets),
          selectedRows: { label: "Share selected with Team", onSelect: () => onShare(targets) },
        },
        {
          id: "squad",
          label: "Add selected to Agent Squad",
          icon: Layers,
          disabled: mutating || !squadEligible.length,
          onSelect: () => onAddToSquad(squadEligible),
          selectedRows: { label: "Add selected to Agent Squad", onSelect: () => onAddToSquad(squadEligible) },
        },
        {
          id: "delete",
          label: "Delete selected",
          icon: Trash2,
          danger: true,
          separatorBefore: true,
          disabled: mutating || !deletable.length,
          onSelect: () => onDelete(deletable),
          selectedRows: { label: "Delete selected", danger: true, onSelect: () => onDelete(deletable) },
        },
      ];
    }
    return [
      {
        id: "rename",
        label: "Rename",
        icon: SquarePen,
        disabled: mutating || row.isSystem,
        onSelect: () => onRename(row),
      },
      {
        id: "share",
        label: "Share with Team",
        icon: UsersRound,
        disabled: mutating,
        onSelect: () => onShare([row]),
      },
      {
        id: "squad",
        label: "Add to Agent Squad",
        icon: Layers,
        disabled: mutating || row.isSquad,
        onSelect: () => onAddToSquad([row]),
      },
      {
        id: "copy",
        label: "Copy",
        icon: Copy,
        disabled: mutating,
        onSelect: () => onCopy(row),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        separatorBefore: true,
        disabled: mutating || row.isSystem,
        onSelect: () => onDelete([row]),
      },
    ];
  };

  const modeTabs = (
    <PlatformDetailTabBar<AgentOverviewMode>
      ariaLabel="Agent categories"
      value={mode}
      tabs={[
        { id: "agents", label: "Agents" },
        { id: "squads", label: "Squads" },
        { id: "functional", label: "Functional Agents" },
      ]}
      onValueChange={onModeChange}
      variant="minimal"
      className="agents-overview-tab-bar"
    />
  );

  const isFunctionalMode = mode === "functional";
  const entity =
    mode === "squads"
      ? "Squads"
      : isFunctionalMode
        ? "Functional Agents"
        : "Agents";
  return (
    <ResourceOverviewPage<AgentOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={analytics}
      controlsPortalId={controlsPortalId}
      periodPortalId={periodPortalId}
      headerActions={headerActions}
      className="is-agents"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: entity,
        className: "resource-overview-table is-agents",
        sorting: { defaultValue: { id: "usage", direction: "desc" } },
        selection: isFunctionalMode
          ? undefined
          : { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        toolbar: {
          leading: modeTabs,
          search: {
            placeholder:
              mode === "squads"
                ? "Search squads"
                : isFunctionalMode
                  ? "Search functional agents"
                  : "Search agents",
            getSearchText: (row) =>
              row.searchText ||
              `${row.name} ${row.modelLabel} ${row.creatorName}`,
          },
          filters: isFunctionalMode
            ? undefined
            : [
                {
                  id: "type",
                  label: "Type",
                  value: typeFilter,
                  onChange: setTypeFilter,
                  options: [
                    { id: "all", label: `All ${entity}` },
                    { id: "system", label: `System ${entity}` },
                    { id: "custom", label: `Custom ${entity}` },
                  ],
                },
              ],
          primaryAction: isFunctionalMode
            ? undefined
            : {
                label: mode === "squads" ? "Squad" : "Agent",
                icon: Plus,
                onClick: mode === "squads" ? onCreateSquad : onCreateAgent,
              },
        },
        getRowActions: isFunctionalMode ? undefined : getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        emptyState:
          mode === "squads"
            ? "No squads available."
            : isFunctionalMode
              ? "No functional agents available."
              : "No agents available.",
      }}
    />
  );
}
