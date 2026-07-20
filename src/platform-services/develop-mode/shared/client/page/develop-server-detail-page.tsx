import { ChartColumnIncreasing, Code2, History, Settings, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";

export type DevelopServerDetailTab = "usage" | "code" | "logs" | "history" | "settings";

export interface DevelopServerDetailPageProps {
  header: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
  activeTab: DevelopServerDetailTab;
  onTabChange: (tab: DevelopServerDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

const DEVELOP_SERVER_DETAIL_TABS = [
  { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
  { id: "code", label: "Code", icon: Code2 },
  { id: "logs", label: "Logs", icon: Terminal },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const DEVELOP_SERVER_SIDEBAR_AUTO_COLLAPSE_TABS: readonly DevelopServerDetailTab[] = ["code"];

export function DevelopServerDetailPage({
  header,
  tabBarActions,
  sidebarToggle,
  children,
  sidebar,
  activeTab,
  onTabChange,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Develop resource details",
  sidebarAriaLabel = "Develop resource properties",
  className = "",
}: DevelopServerDetailPageProps) {
  return (
    <ResourceDetailPage<DevelopServerDetailTab>
      header={header}
      tabs={DEVELOP_SERVER_DETAIL_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarAutoCollapseTabs={DEVELOP_SERVER_SIDEBAR_AUTO_COLLAPSE_TABS}
      ariaLabel={ariaLabel}
      tabAriaLabel="Resource sections"
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-server-detail-page${activeTab === "code" ? " is-code-tab" : ""}${className ? ` ${className}` : ""}`}
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-server-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-server-detail-tab-actions"
      contentClassName={`playground-server-detail-page__content${activeTab === "code" ? " is-code-tab" : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-server-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
