import { Bot, Info } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableCellContext,
  PlatformDataTableColumn,
  PlatformDataTableFilterOption,
  PlatformDataTableSortState,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformDetailTabBar,
  type PlatformDetailTab,
} from "../../../../../platform-ui/components/composite/detail-tab-bar/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import { ResourceOverviewPage } from "../../../../../platform-ui/pages/overview/index.js";
import type { ModelsOverviewRow } from "../domain/index.js";
import { ModelDetailsModal } from "./model-details-modal.js";

export type { ModelsOverviewRow } from "../domain/index.js";

function readModelContextTokenCount(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  const normalized = String(value ?? "").trim().toLowerCase().replace(/,/g, "");
  if (!normalized) return null;
  const match = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*([kmb])?/);
  if (!match) return null;

  const numericValue = Number(match[1]);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  const suffix = match[2] || "";
  const multiplier = suffix === "b"
    ? 1_000_000_000
    : suffix === "m" || normalized.includes("million")
      ? 1_000_000
      : suffix === "k" || normalized.includes("thousand")
        ? 1_000
        : 1;
  return numericValue * multiplier;
}

export function getModelContextLabelVariant(value: unknown): PlatformLabelVariant {
  const tokenCount = readModelContextTokenCount(value);
  if (tokenCount === null) return "gray";
  if (tokenCount < 300_000) return "yellow";
  if (tokenCount < 1_000_000) return "blue";
  return "green";
}

function readModelSpeedTps(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  const normalized = String(value ?? "").trim().toLowerCase().replace(/,/g, "");
  if (!normalized) return null;
  const match = normalized.match(/[0-9]+(?:\.[0-9]+)?/);
  if (!match) return null;

  const numericValue = Number(match[0]);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

export function getModelSpeedLabelVariant(value: unknown): PlatformLabelVariant {
  const tps = readModelSpeedTps(value);
  if (tps !== null) {
    if (tps < 60) return "yellow";
    if (tps < 120) return "blue";
    return "green";
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized.includes("very fast")) return "green";
  if (normalized.includes("fast")) return "blue";
  if (normalized.includes("medium") || normalized.includes("slow")) return "yellow";
  return "gray";
}

export interface ModelsOverviewPageProps<
  TRow extends ModelsOverviewRow = ModelsOverviewRow,
> {
  rows: readonly TRow[];
  columns: readonly PlatformDataTableColumn<TRow>[];
  featuredContent?: ReactNode;
  skillSettingsContent?: ReactNode;
  tabs: readonly PlatformDetailTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onCreateAgent?: (model: TRow) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  providerFilter: string;
  providerFilterOptions: readonly PlatformDataTableFilterOption[];
  onProviderFilterChange: (value: string) => void;
  sorting: PlatformDataTableSortState;
  onSortingChange: (sorting: PlatformDataTableSortState | null) => void;
  getRowId: (row: TRow) => string;
  getRowClassName?: (row: TRow) => string;
  loading?: boolean;
  error?: ReactNode;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;
}

export function ModelsOverviewPage<
  TRow extends ModelsOverviewRow = ModelsOverviewRow,
>({
  rows,
  columns,
  featuredContent = null,
  skillSettingsContent = null,
  tabs,
  activeTab,
  onTabChange,
  onCreateAgent,
  searchValue,
  onSearchChange,
  providerFilter,
  providerFilterOptions,
  onProviderFilterChange,
  sorting,
  onSortingChange,
  getRowId,
  getRowClassName,
  loading = false,
  error,
  emptyState = "No models available.",
  noResultsState = "No matching models found.",
}: ModelsOverviewPageProps<TRow>) {
  const [detailModel, setDetailModel] = useState<TRow | null>(null);
  const resolvedColumns = useMemo(
    () => columns.map((column) => {
      if (column.id === "context") {
        return {
          ...column,
          cell: ({ value }: PlatformDataTableCellContext<TRow>) => {
            const label = String(value ?? "").trim() || "Custom";
            return (
              <PlatformLabel variant={getModelContextLabelVariant(value)}>
                {label}
              </PlatformLabel>
            );
          },
        };
      }
      if (column.id === "speed" && activeTab !== "video") {
        return {
          ...column,
          cell: ({ value }: PlatformDataTableCellContext<TRow>) => {
            const label = String(value ?? "").trim() || "—";
            return (
              <PlatformLabel variant={getModelSpeedLabelVariant(value)}>
                {label}
              </PlatformLabel>
            );
          },
        };
      }
      return column;
    }),
    [activeTab, columns],
  );
  const tabBar = (
    <PlatformDetailTabBar
      tabs={tabs}
      value={activeTab}
      onValueChange={onTabChange}
      ariaLabel="Model categories"
      variant="minimal"
      className="models-overview-tab-bar"
    />
  );
  const getRowActions = (model: TRow): readonly PlatformDataTableAction<TRow>[] => [
    {
      id: "create-agent",
      label: "Create Agent",
      icon: Bot,
      disabled: !model.details?.canCreateAgent || !onCreateAgent,
      onSelect: () => onCreateAgent?.(model),
    },
    {
      id: "view-details",
      label: "View Details",
      icon: Info,
      onSelect: () => setDetailModel(model),
    },
  ];

  return (
    <>
      <ResourceOverviewPage<TRow>
        heroContent={featuredContent}
        showPeriodSelector={false}
        className="is-models-overview"
        table={{
          rows,
          columns: resolvedColumns,
          getRowId,
          ariaLabel: "Models",
          className: "resource-overview-table is-models-overview",
          sorting: {
            value: sorting,
            manual: true,
            onChange: onSortingChange,
          },
          selection: {
            enabled: true,
            ariaLabel: (row) => `Select ${row.label || row.id}`,
          },
          pagination: false,
          toolbar: {
            leading: tabBar,
            search: {
              value: searchValue,
              onChange: onSearchChange,
              placeholder: "Search models",
              manual: true,
            },
            filters: [{
              id: "provider",
              label: "Provider",
              value: providerFilter,
              options: providerFilterOptions,
              onChange: onProviderFilterChange,
            }],
          },
          getRowActions,
          getRowClassName,
          getRowAriaLabel: (row) => row.label || row.id,
          loading,
          error,
          footer: skillSettingsContent,
          emptyState,
          noResultsState,
        }}
      />
      <ModelDetailsModal
        model={detailModel}
        onClose={() => setDetailModel(null)}
        onCreateAgent={onCreateAgent
          ? (model) => onCreateAgent(model as TRow)
          : undefined}
      />
    </>
  );
}
