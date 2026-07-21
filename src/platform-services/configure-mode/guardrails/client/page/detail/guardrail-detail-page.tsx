import { ChartColumnIncreasing, LayoutGrid, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";
import { ResourceDetailPage } from "../../../../../../platform-ui/pages/details/index.js";

export type GuardrailDetailTab = "general" | "evaluation" | "settings";

export interface GuardrailDetailPageProps {
  header: ReactNode;
  headerActions?: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  properties: ReactNode;
  actions?: ReactNode;
  activeTab: GuardrailDetailTab;
  onTabChange: (tab: GuardrailDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  className?: string;
}

const GUARDRAIL_DETAIL_TABS = [
  { id: "general", label: "General", icon: LayoutGrid },
  { id: "evaluation", label: "Evaluation", icon: ChartColumnIncreasing },
  { id: "settings", label: "Settings", icon: Settings2 },
] as const;

export function GuardrailDetailPage({
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
  ariaLabel = "Guardrail details",
  className = "",
}: GuardrailDetailPageProps) {
  return (
    <ResourceDetailPage<GuardrailDetailTab>
      header={header}
      headerActions={headerActions}
      tabs={GUARDRAIL_DETAIL_TABS}
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
            className="playground-guardrails-detail-sidebar-card"
          >
            {properties}
          </PlatformUiCard>
          {actions !== undefined && actions !== null ? (
            <PlatformUiCard
              as="section"
              variant="sidebar"
              cardTitle="Actions"
              className="playground-guardrails-detail-sidebar-card"
            >
              {actions}
            </PlatformUiCard>
          ) : null}
        </>
      )}
      ariaLabel={ariaLabel}
      tabAriaLabel="Guardrail sections"
      sidebarAriaLabel="Guardrail information and actions"
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-guardrails-detail-overview-layout${className ? ` ${className}` : ""}`}
      headerClassName="playground-guardrails-detail-page-header"
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-guardrails-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-guardrails-detail-tab-actions"
      contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-guardrails-detail-overview-main"
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-guardrails-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
