import {
  ExternalLink,
  FolderOpen,
  LayoutGrid,
  Package,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../platform-ui/pages/details/index.js";

export type ComputerDetailTab = "general" | "runtime" | "settings";
type ComputerDetailNavigationTab = ComputerDetailTab | "filebase";

export interface ComputerDetailPageProps {
  header: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
  activeTab: ComputerDetailTab;
  onTabChange: (tab: ComputerDetailTab) => void;
  onOpenFilebase?: () => void;
  filebaseDisabled?: boolean;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

const COMPUTER_DETAIL_TABS = [
  { id: "general", label: "General", icon: LayoutGrid },
  { id: "runtime", label: "Runtime", icon: Package },
  { id: "settings", label: "Settings", icon: Settings },
  {
    id: "filebase",
    label: (
      <span className="resource-detail-page__external-tab-label">
        <span>Filebase</span>
        <ExternalLink width={12} height={12} strokeWidth={1.8} aria-hidden="true" />
      </span>
    ),
    icon: FolderOpen,
    ariaLabel: "Open Filebase",
  },
] as const;

export function ComputerDetailPage({
  header,
  tabBarActions,
  sidebarToggle,
  children,
  sidebar,
  activeTab,
  onTabChange,
  onOpenFilebase,
  filebaseDisabled = false,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Computer details",
  sidebarAriaLabel = "Computer settings",
  className = "",
}: ComputerDetailPageProps) {
  const tabs = COMPUTER_DETAIL_TABS.map((tab) => (
    tab.id === "filebase"
      ? { ...tab, disabled: filebaseDisabled || !onOpenFilebase }
      : tab
  ));

  const handleTabChange = (tab: ComputerDetailNavigationTab) => {
    if (tab === "filebase") {
      onOpenFilebase?.();
      return;
    }
    onTabChange(tab);
  };

  return (
    <ResourceDetailPage<ComputerDetailNavigationTab>
      header={header}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel={ariaLabel}
      tabAriaLabel="Computer sections"
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-computer-detail-overview-layout${className ? ` ${className}` : ""}`}
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-computer-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-computer-detail-tab-actions"
      contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-computer-detail-overview-main"
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-computer-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
