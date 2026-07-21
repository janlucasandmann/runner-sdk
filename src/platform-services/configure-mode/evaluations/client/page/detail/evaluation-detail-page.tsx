import { LayoutGrid, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";
import { ResourceDetailPage } from "../../../../../../platform-ui/pages/details/index.js";

export type EvaluationDetailTab = "general" | "settings";

export interface EvaluationDetailPageProps {
  header: ReactNode;
  headerActions?: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  properties: ReactNode;
  actions?: ReactNode;
  activeTab: EvaluationDetailTab;
  onTabChange: (tab: EvaluationDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  className?: string;
}

const EVALUATION_DETAIL_TABS = [
  { id: "general", label: "General", icon: LayoutGrid },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;

export function EvaluationDetailPage({
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
  ariaLabel = "Evaluation details",
  className = "",
}: EvaluationDetailPageProps) {
  return (
    <ResourceDetailPage<EvaluationDetailTab>
      header={header}
      headerActions={headerActions}
      tabs={EVALUATION_DETAIL_TABS}
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
            className="playground-evaluations-detail-sidebar-card"
          >
            {properties}
          </PlatformUiCard>
          {actions !== undefined && actions !== null ? (
            <PlatformUiCard
              as="section"
              variant="sidebar"
              cardTitle="Actions"
              className="playground-evaluations-detail-sidebar-card"
            >
              {actions}
            </PlatformUiCard>
          ) : null}
        </>
      )}
      ariaLabel={ariaLabel}
      tabAriaLabel="Evaluation sections"
      sidebarAriaLabel="Evaluation information and actions"
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-evaluations-detail-overview-layout${className ? ` ${className}` : ""}`}
      headerClassName="playground-evaluations-detail-page-header"
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-evaluations-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-evaluations-detail-tab-actions"
      contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-evaluations-detail-overview-main"
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-evaluations-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
