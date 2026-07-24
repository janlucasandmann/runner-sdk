import type { ReactNode } from "react";
import { PlatformUiCard } from "../../../../../../platform-ui/components/composite/ui-card/index.js";
import { ResourceDetailPage } from "../../../../../../platform-ui/pages/details/index.js";

export type EvaluationDetailTab = "general" | "settings";
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
  const isRun = variant === "run";

  return (
    <ResourceDetailPage<EvaluationDetailTab>
      tabs={[]}
      sidebarCollapsed={sidebarCollapsed}
      sidebar={(
        <>
          <PlatformUiCard
            as="section"
            variant="sidebar"
            cardTitle={isRun ? "Run Properties" : "Properties"}
            className="playground-evaluations-detail-sidebar-card"
          >
            {properties}
          </PlatformUiCard>
          {actions !== undefined && actions !== null ? (
            <PlatformUiCard
              as="section"
              variant="sidebar"
              cardTitle="Actions"
              className="playground-evaluations-detail-sidebar-card"
            >
              {actions}
            </PlatformUiCard>
          ) : null}
        </>
      )}
      ariaLabel={ariaLabel}
      tabAriaLabel={isRun ? "Evaluation run sections" : "Evaluation sections"}
      sidebarAriaLabel={isRun ? "Evaluation run information and actions" : "Evaluation information and actions"}
      className={`playground-project-overview-layout playground-agents-detail-overview-layout playground-evaluations-detail-overview-layout${isRun ? " is-run-detail" : ""}${className ? ` ${className}` : ""}`}
      headerClassName="playground-evaluations-detail-page-header"
      tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs playground-evaluations-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-evaluations-detail-tab-actions"
      contentClassName="playground-project-overview-main playground-agents-detail-overview-main playground-evaluations-detail-overview-main"
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-evaluations-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {children}
    </ResourceDetailPage>
  );
}
