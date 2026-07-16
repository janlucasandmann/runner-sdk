import { ChartColumnIncreasing, ChartNoAxesColumnIncreasing, FingerprintPattern, LayoutGrid, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../platform-ui/pages/details/index.js";
import { AgentPermissionsPage, type AgentPermissionsPageProps } from "./agent-permissions-page.js";

export type AgentDetailTab = "general" | "insights" | "evaluation" | "guardrails" | "permissions";

export interface AgentDetailPageProps {
  header: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
  activeTab: AgentDetailTab;
  onTabChange: (tab: AgentDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  permissions?: AgentPermissionsPageProps;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

const AGENT_DETAIL_TABS = [
  { id: "general", label: "General", icon: LayoutGrid },
  { id: "insights", label: "Insights", icon: ChartNoAxesColumnIncreasing },
  { id: "evaluation", label: "Evaluation", icon: ChartColumnIncreasing },
  { id: "guardrails", label: "Guardrails", icon: Shield },
  { id: "permissions", label: "Permissions", icon: FingerprintPattern },
] as const;

export function AgentDetailPage({
  header,
  tabBarActions,
  sidebarToggle,
  children,
  sidebar,
  activeTab,
  onTabChange,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  permissions,
  ariaLabel = "Agent details",
  sidebarAriaLabel = "Agent settings",
  className = "",
}: AgentDetailPageProps) {
  return (
    <ResourceDetailPage<AgentDetailTab>
      header={header}
      tabs={AGENT_DETAIL_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel={ariaLabel}
      tabAriaLabel="Agent sections"
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout${className ? ` ${className}` : ""}`}
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions"
      contentClassName={`playground-project-overview-main playground-agents-detail-overview-main${activeTab === "permissions" ? " is-permissions-tab" : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {activeTab === "permissions" && permissions ? (
        <section
          className="playground-agents-permissions-section"
          data-section-id="permissions"
        >
          <AgentPermissionsPage {...permissions} />
        </section>
      ) : children}
    </ResourceDetailPage>
  );
}
