import type { ReactNode } from "react";
import type { PlatformDetailTab } from "../../components/composite/detail-tab-bar/index.js";

export interface ResourceDetailPageProps<TTab extends string = string> {
  title?: ReactNode;
  header?: ReactNode;
  headerActions?: ReactNode;
  tabs?: readonly PlatformDetailTab<TTab>[];
  activeTab?: TTab;
  onTabChange?: (tab: TTab) => void;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarAlignTop?: boolean;
  sidebarAutoCollapseTabs?: readonly TTab[];
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
