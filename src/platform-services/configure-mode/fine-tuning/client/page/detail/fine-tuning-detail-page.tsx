import type { ReactNode } from "react";
import {
  PlatformServiceDetailPage,
} from "../../../../../../platform-ui/pages/details/index.js";

export type FineTuningDetailTab = "general" | "analysis" | "changes" | "settings";

export interface FineTuningDetailPageProps {
  children: ReactNode;
  properties: ReactNode;
  actions?: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function FineTuningDetailPage({
  children,
  properties,
  actions,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Agent optimization details",
  className = "",
}: FineTuningDetailPageProps) {
  return (
    <PlatformServiceDetailPage
      properties={properties}
      actions={actions}
      sidebarCollapsed={sidebarCollapsed}
      sidebarPopoverOpen={sidebarPopoverOpen}
      ariaLabel={ariaLabel}
      sidebarAriaLabel="Agent optimization information and actions"
      className={`playground-fine-tuning-detail-overview-layout${className ? ` ${className}` : ""}`}
      contentClassName="playground-fine-tuning-detail-overview-main"
      sidebarClassName="playground-fine-tuning-detail-sidebar"
      propertiesCardClassName="playground-fine-tuning-detail-sidebar-card"
      actionsCardClassName="playground-fine-tuning-detail-sidebar-card"
      variant="resource"
    >
      {children}
    </PlatformServiceDetailPage>
  );
}
