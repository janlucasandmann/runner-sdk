import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";

export type ProjectDetailTab = "general" | "resources" | "strategy" | "permissions";

export interface ProjectDetailPageProps {
  header?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
  activeTab: ProjectDetailTab;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

export function ProjectDetailPage({
  header,
  children,
  sidebar,
  activeTab,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Project details",
  sidebarAriaLabel = "Project settings",
  className = "",
}: ProjectDetailPageProps) {
  return (
    <ResourceDetailPage<ProjectDetailTab>
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel={ariaLabel}
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-project-detail-overview-layout${className ? ` ${className}` : ""}`}
      contentClassName={`playground-project-overview-main playground-agents-detail-overview-main playground-project-detail-overview-main${activeTab === "permissions" ? " is-permissions-tab" : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-project-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {header ? (
        <header className="playground-project-detail-header">
          {header}
        </header>
      ) : null}
      {children}
    </ResourceDetailPage>
  );
}
