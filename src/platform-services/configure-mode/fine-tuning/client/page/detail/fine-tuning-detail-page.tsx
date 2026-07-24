import { ChartColumnIncreasing, FileDiff, LayoutGrid, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";
import { ResourceDetailPage } from "../../../../../../platform-ui/pages/details/index.js";

export type FineTuningDetailTab = "general" | "analysis" | "changes" | "settings";

export interface FineTuningDetailPageProps {
  header: ReactNode;
  headerActions?: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  properties: ReactNode;
  actions?: ReactNode;
  activeTab: FineTuningDetailTab;
  onTabChange: (tab: FineTuningDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  className?: string;
}

const FINE_TUNING_DETAIL_TABS = [
  { id: "general", label: "General", icon: LayoutGrid },
  { id: "analysis", label: "Analysis", icon: ChartColumnIncreasing },
  { id: "changes", label: "Agent Changes", icon: FileDiff },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function FineTuningDetailPage({
  header,
  headerActions,
  tabBarActions,
  sidebarToggle,
  children,
  properties,
  actions,
  activeTab,
  onTabChange,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Fine-tuning details",
  className = "",
}: FineTuningDetailPageProps) {
  return (
    <ResourceDetailPage<FineTuningDetailTab>
      header={header}
      headerActions={headerActions}
      tabs={FINE_TUNING_DETAIL_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebarCollapsed={sidebarCollapsed}
      sidebar={(
        <>
          <PlatformUiCard
            as="section"
            variant="sidebar"
            cardTitle="Properties"
            className="playground-fine-tuning-detail-sidebar-card"
          >
            {properties}
          </PlatformUiCard>
          {actions !== undefined && actions !== null ? (
            <PlatformUiCard
              as="section"
              variant="sidebar"
              cardTitle="Actions"
              className="playground-fine-tuning-detail-sidebar-card"
            >
              {actions}
            </PlatformUiCard>
          ) : null}
        </>
      )}
      ariaLabel={ariaLabel}
      tabAriaLabel="Fine-tuning sections"
      sidebarAriaLabel="Fine-tuning information and actions"
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-fine-tuning-detail-overview-layout${className ? ` ${className}` : ""}`}
      headerClassName="playground-fine-tuning-detail-page-header"
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-fine-tuning-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-fine-tuning-detail-tab-actions"
      contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-fine-tuning-detail-overview-main"
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-fine-tuning-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
