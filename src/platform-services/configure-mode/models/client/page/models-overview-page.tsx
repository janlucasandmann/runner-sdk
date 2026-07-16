import { Bot, Info } from "lucide-react";
import { useState, type ReactNode } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableFilterOption,
  PlatformDataTableSortState,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformDetailTabBar,
  type PlatformDetailTab,
} from "../../../../../platform-ui/components/composite/detail-tab-bar/index.js";
import { ResourceOverviewPage } from "../../../../../platform-ui/pages/overview/index.js";
import type { ModelsOverviewRow } from "../domain/index.js";
import { ModelDetailsModal } from "./model-details-modal.js";

export type { ModelsOverviewRow } from "../domain/index.js";

export interface ModelsOverviewPageProps {
  rows: readonly ModelsOverviewRow[];
  columns: readonly PlatformDataTableColumn<ModelsOverviewRow>[];
  featuredContent?: ReactNode;
  skillSettingsContent?: ReactNode;
  tabs: readonly PlatformDetailTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onCreateAgent?: (model: ModelsOverviewRow) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  providerFilter: string;
  providerFilterOptions: readonly PlatformDataTableFilterOption[];
  onProviderFilterChange: (value: string) => void;
  sorting: PlatformDataTableSortState;
  onSortingChange: (sorting: PlatformDataTableSortState | null) => void;
  getRowId: (row: ModelsOverviewRow) => string;
  getRowClassName?: (row: ModelsOverviewRow) => string;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;
}

export function ModelsOverviewPage({
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
  emptyState = "No models available.",
  noResultsState = "No matching models found.",
}: ModelsOverviewPageProps) {
  const [detailModel, setDetailModel] = useState<ModelsOverviewRow | null>(null);
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
  const getRowActions = (model: ModelsOverviewRow): readonly PlatformDataTableAction<ModelsOverviewRow>[] => [
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
      <ResourceOverviewPage<ModelsOverviewRow>
        heroContent={featuredContent}
        showPeriodSelector={false}
        className="is-models-overview"
        table={{
          rows,
          columns,
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
          footer: skillSettingsContent,
          emptyState,
          noResultsState,
        }}
      />
      <ModelDetailsModal
        model={detailModel}
        onClose={() => setDetailModel(null)}
        onCreateAgent={onCreateAgent}
      />
    </>
  );
}
