import { FingerprintPattern, Layers, UsersRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ResourceDetailPage } from "../../../../../../platform-ui/pages/details/index.js";

export type TeamDetailTab = "members" | "resources" | "roles";

export interface TeamDetailPageProps {
  header: ReactNode;
  tabBarActions?: ReactNode;
  appHeaderActions?: ReactNode;
  appHeaderActionsPortalId?: string;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  sidebar: ReactNode;
  activeTab: TeamDetailTab;
  onTabChange: (tab: TeamDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

const TEAM_DETAIL_TABS = [
  { id: "members", label: "Members", icon: UsersRound },
  { id: "resources", label: "Resources", icon: Layers },
  { id: "roles", label: "Roles", icon: FingerprintPattern },
] as const;

export function TeamDetailPage({
  header,
  tabBarActions,
  appHeaderActions,
  appHeaderActionsPortalId = "",
  sidebarToggle,
  children,
  sidebar,
  activeTab,
  onTabChange,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Team details",
  sidebarAriaLabel = "Team settings",
  className = "",
}: TeamDetailPageProps) {
  const [appHeaderActionsTarget, setAppHeaderActionsTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!appHeaderActionsPortalId || typeof document === "undefined") {
      setAppHeaderActionsTarget(null);
      return;
    }
    setAppHeaderActionsTarget(document.getElementById(appHeaderActionsPortalId));
  }, [appHeaderActionsPortalId]);

  return (
    <>
      <ResourceDetailPage<TeamDetailTab>
        header={header}
        tabs={TEAM_DETAIL_TABS}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabBarActions={tabBarActions}
        sidebarToggle={sidebarToggle}
        sidebar={sidebar}
        sidebarCollapsed={sidebarCollapsed}
        sidebarAutoCollapseTabs={["resources", "roles"]}
        ariaLabel={ariaLabel}
        tabAriaLabel="Team sections"
        sidebarAriaLabel={sidebarAriaLabel}
        className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-team-detail-overview-layout${className ? ` ${className}` : ""}`}
        tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-team-detail-tabs"
        tabBarActionsClassName="playground-agents-detail-tab-actions playground-team-detail-tab-actions"
        contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-team-detail-overview-main"
        sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-team-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
      >
        {children}
      </ResourceDetailPage>
      {appHeaderActionsTarget && appHeaderActions
        ? createPortal(appHeaderActions, appHeaderActionsTarget)
        : null}
    </>
  );
}
