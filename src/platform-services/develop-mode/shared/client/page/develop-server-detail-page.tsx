import { ChartColumnIncreasing, Code2, History, Settings, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import type { PlatformDetailTab } from "../../../../../platform-ui/components/composite/detail-tab-bar/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";

export type DevelopServerDetailTab = "usage" | "code" | "logs" | "history" | "settings";

export interface DevelopServerDetailPageProps<TTab extends string = DevelopServerDetailTab> {
  header?: ReactNode;
  headerActions?: ReactNode;
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
  tabAriaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
  headerClassName?: string;
  tabBarClassName?: string;
  tabBarActionsClassName?: string;
  contentClassName?: string;
  sidebarClassName?: string;
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
  headerActions,
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
  tabAriaLabel = "Resource sections",
  sidebarAriaLabel = "Develop resource properties",
  className = "",
  headerClassName = "",
  tabBarClassName = "",
  tabBarActionsClassName = "",
  contentClassName = "",
  sidebarClassName = "",
}: DevelopServerDetailPageProps<TTab>) {
  const resolvedTabs = (tabs ?? DEVELOP_SERVER_DETAIL_TABS) as readonly PlatformDetailTab<TTab>[];
  const resolvedSidebarAutoCollapseTabs = sidebarAutoCollapseTabs
    ?? (DEVELOP_SERVER_SIDEBAR_AUTO_COLLAPSE_TABS as readonly unknown[] as readonly TTab[]);
  const isCodeTab = activeTab === "code";

  return (
    <ResourceDetailPage<TTab>
      header={header}
      headerActions={headerActions}
      tabs={resolvedTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarAutoCollapseTabs={resolvedSidebarAutoCollapseTabs}
      ariaLabel={ariaLabel}
      tabAriaLabel={tabAriaLabel}
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-server-detail-page${isCodeTab ? " is-code-tab" : ""}${className ? ` ${className}` : ""}`}
      headerClassName={headerClassName}
      tabBarClassName={`playground-agents-overview-tabs playground-agents-detail-tabs playground-server-detail-tabs${tabBarClassName ? ` ${tabBarClassName}` : ""}`}
      tabBarActionsClassName={`playground-agents-detail-tab-actions playground-server-detail-tab-actions${tabBarActionsClassName ? ` ${tabBarActionsClassName}` : ""}`}
      contentClassName={`playground-server-detail-page__content${isCodeTab ? " is-code-tab" : ""}${contentClassName ? ` ${contentClassName}` : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-server-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}${sidebarClassName ? ` ${sidebarClassName}` : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
