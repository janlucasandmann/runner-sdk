import type { ReactNode } from "react";
import {
  PlatformServiceDetailPage,
} from "../../../../../../platform-ui/pages/details/index.js";

export type EvaluationDetailTab = "general" | "cases" | "settings";
export type EvaluationDetailVariant = "evaluation" | "run";

export interface EvaluationDetailPageProps {
  children: ReactNode;
  properties: ReactNode;
  actions?: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  className?: string;
  variant?: EvaluationDetailVariant;
}

export function EvaluationDetailPage({
  children,
  properties,
  actions,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Evaluation details",
  className = "",
  variant = "evaluation",
}: EvaluationDetailPageProps) {
  return (
    <PlatformServiceDetailPage
      properties={properties}
      actions={actions}
      sidebarCollapsed={sidebarCollapsed}
      sidebarPopoverOpen={sidebarPopoverOpen}
      ariaLabel={ariaLabel}
      sidebarAriaLabel={variant === "run"
        ? "Evaluation run information and actions"
        : "Evaluation information and actions"}
      className={`playground-evaluations-detail-overview-layout playground-evaluations-detail-page${className ? ` ${className}` : ""}`}
      contentClassName="playground-evaluations-detail-overview-main playground-evaluations-detail-content"
      sidebarClassName="playground-evaluations-detail-sidebar"
      propertiesCardClassName="playground-evaluations-detail-sidebar-card"
      actionsCardClassName="playground-evaluations-detail-sidebar-card"
      variant={variant === "run" ? "run" : "resource"}
    >
      {children}
    </PlatformServiceDetailPage>
  );
}
