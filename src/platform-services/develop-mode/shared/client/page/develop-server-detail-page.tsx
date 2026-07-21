import { ChartColumnIncreasing, Code2, History, Settings, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import type { PlatformDetailTab } from "../../../../../platform-ui/components/composite/detail-tab-bar/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";

export type DevelopServerDetailTab = "usage" | "code" | "logs" | "history" | "settings";

export interface DevelopServerDetailPageProps<TTab extends string = DevelopServerDetailTab> {
  header?: ReactNode;
  tabs?: readonly PlatformDetailTab<TTab>[];
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
  activeTab: TTab;
  onTabChange: (tab: TTab) => void;
  sidebarCollapsed?: boolean;
  sidebarAutoCollapseTabs?: readonly TTab[];
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
  contentClassName?: string;
}

const DEVELOP_SERVER_DETAIL_TABS = [
  { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
  { id: "code", label: "Code", icon: Code2 },
  { id: "logs", label: "Logs", icon: Terminal },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const DEVELOP_SERVER_SIDEBAR_AUTO_COLLAPSE_TABS: readonly DevelopServerDetailTab[] = ["code"];

export function DevelopServerDetailPage<TTab extends string = DevelopServerDetailTab>({
  header,
  tabs,
  tabBarActions,
  sidebarToggle,
  children,
  sidebar,
  activeTab,
  onTabChange,
  sidebarCollapsed = false,
  sidebarAutoCollapseTabs,
  sidebarPopoverOpen = false,
  ariaLabel = "Develop resource details",
  sidebarAriaLabel = "Develop resource properties",
  className = "",
  contentClassName = "",
}: DevelopServerDetailPageProps<TTab>) {
  const resolvedTabs = (tabs ?? DEVELOP_SERVER_DETAIL_TABS) as readonly PlatformDetailTab<TTab>[];
  const resolvedSidebarAutoCollapseTabs = sidebarAutoCollapseTabs
    ?? (DEVELOP_SERVER_SIDEBAR_AUTO_COLLAPSE_TABS as readonly unknown[] as readonly TTab[]);
  const isCodeTab = activeTab === "code";

  return (
    <ResourceDetailPage<TTab>
      header={header}
      tabs={resolvedTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarAutoCollapseTabs={resolvedSidebarAutoCollapseTabs}
      ariaLabel={ariaLabel}
      tabAriaLabel="Resource sections"
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-server-detail-page${isCodeTab ? " is-code-tab" : ""}${className ? ` ${className}` : ""}`}
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-server-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-server-detail-tab-actions"
      contentClassName={`playground-server-detail-page__content${isCodeTab ? " is-code-tab" : ""}${contentClassName ? ` ${contentClassName}` : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-server-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
