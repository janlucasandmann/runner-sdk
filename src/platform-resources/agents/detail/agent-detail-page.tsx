import type { ReactNode } from "react";
import { ResourceDetailPage } from "../../../platform-ui/pages/details/index.js";
import {
  PlatformResourceSettingsPage,
  type PlatformResourceSettingsPageProps,
} from "../../../platform-ui/pages/settings/index.js";
import { AgentPermissionsPage, type AgentPermissionsPageProps } from "./agent-permissions-page.js";

export type AgentDetailTab = "general" | "insights" | "evaluation" | "guardrails" | "permissions" | "settings";

export interface AgentDetailPageProps {
  children: ReactNode;
  sidebar: ReactNode;
  activeTab: AgentDetailTab;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  permissions?: AgentPermissionsPageProps;
  settings?: PlatformResourceSettingsPageProps;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

export function AgentDetailPage({
  children,
  sidebar,
  activeTab,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  permissions,
  settings,
  ariaLabel = "Agent details",
  sidebarAriaLabel = "Agent settings",
  className = "",
}: AgentDetailPageProps) {
  if (activeTab === "settings" && settings) {
    return <PlatformResourceSettingsPage {...settings} />;
  }
  return (
    <ResourceDetailPage<AgentDetailTab>
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel={ariaLabel}
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout${className ? ` ${className}` : ""}`}
      contentClassName={`playground-project-overview-main playground-agents-detail-overview-main${activeTab === "permissions" ? " is-permissions-tab" : ""}`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
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
