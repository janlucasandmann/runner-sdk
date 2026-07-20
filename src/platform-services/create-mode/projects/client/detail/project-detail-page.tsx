import { FolderOpen, House, Rocket, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";

export type ProjectDetailTab = "general" | "resources" | "strategy" | "permissions";

export interface ProjectDetailPageProps {
  header: ReactNode;
  headerActions?: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
  activeTab: ProjectDetailTab;
  onTabChange: (tab: ProjectDetailTab) => void;
  showSettings?: boolean;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

const PROJECT_DETAIL_TABS = [
  { id: "general", label: "Home", icon: House },
  { id: "resources", label: "Resources", icon: FolderOpen },
  { id: "strategy", label: "Strategy", icon: Rocket },
  { id: "permissions", label: "Settings", icon: Settings2 },
] as const;

export function ProjectDetailPage({
  header,
  headerActions,
  tabBarActions,
  sidebarToggle,
  children,
  sidebar,
  activeTab,
  onTabChange,
  showSettings = true,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Project details",
  sidebarAriaLabel = "Project settings",
  className = "",
}: ProjectDetailPageProps) {
  const tabs = showSettings
    ? PROJECT_DETAIL_TABS
    : PROJECT_DETAIL_TABS.filter((tab) => tab.id !== "permissions");

  return (
    <ResourceDetailPage<ProjectDetailTab>
      header={header}
      headerActions={headerActions}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel={ariaLabel}
      tabAriaLabel="Project sections"
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-project-detail-overview-layout${className ? ` ${className}` : ""}`}
      headerClassName="playground-project-detail-header"
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-project-overview-tabs playground-project-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-project-detail-tab-actions"
      contentClassName={`playground-project-overview-main playground-agents-detail-overview-main playground-project-detail-overview-main${activeTab === "permissions" ? " is-permissions-tab" : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-project-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
