import { FingerprintPattern, LayoutGrid, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../platform-ui/pages/details/index.js";
import {
  PlatformPermissionsPage,
  type PlatformPermissionsPageProps,
} from "../../../platform-ui/pages/permissions/index.js";

export type TagDetailTab = "general" | "permissions" | "setup";

export interface TagDetailPageProps {
  header: ReactNode;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
  activeTab: TagDetailTab;
  onTabChange: (tab: TagDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  permissions?: PlatformPermissionsPageProps;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

const TAG_DETAIL_TABS = [
  { id: "general", label: "General", icon: LayoutGrid },
  { id: "permissions", label: "Permissions", icon: FingerprintPattern },
  { id: "setup", label: "Setup", icon: Settings2 },
] as const;

export function TagDetailPage({
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
  ariaLabel = "Tag details",
  sidebarAriaLabel = "Tag settings",
  className = "",
}: TagDetailPageProps) {
  return (
    <ResourceDetailPage<TagDetailTab>
      header={header}
      tabs={TAG_DETAIL_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel={ariaLabel}
      tabAriaLabel="Tag sections"
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-tags-detail-overview-layout${className ? ` ${className}` : ""}`}
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-plugin-detail-tabs playground-tags-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-tags-detail-tab-actions"
      contentClassName={`playground-project-overview-main playground-agents-detail-overview-main playground-tags-detail-overview-main${activeTab === "permissions" ? " is-permissions-tab" : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-tags-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {activeTab === "permissions" && permissions ? (
        <section
          className="playground-agents-permissions-section playground-tags-detail-permissions-section"
          data-section-id="permissions"
        >
          <PlatformPermissionsPage {...permissions} />
        </section>
      ) : children}
    </ResourceDetailPage>
  );
}
