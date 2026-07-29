import type { ReactNode } from "react";
import {
  FileResourceDetailPage,
  type FileResourceDetailTab,
} from "../../../../../../platform-ui/pages/details/index.js";

export type EvaluationCaseDetailTab = FileResourceDetailTab;

export interface EvaluationCaseDetailPageProps {
  activeTab: EvaluationCaseDetailTab;
  metadata: ReactNode;
  notice?: ReactNode;
  code: ReactNode;
  settings: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function EvaluationCaseDetailPage({
  activeTab,
  metadata,
  notice,
  code,
  settings,
  sidebar,
  sidebarCollapsed = false,
  className = "",
}: EvaluationCaseDetailPageProps) {
  return (
    <FileResourceDetailPage
      activeTab={activeTab}
      metadata={metadata}
      notice={notice}
      code={code}
      settings={settings}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel="Evaluation case details"
      sidebarAriaLabel="Evaluation case properties"
      className={`evaluation-case-detail-page playground-evaluations-dataset-case-page${className ? ` ${className}` : ""}`}
      contentClassName="evaluation-case-detail-page__content"
      codeClassName="evaluation-case-detail-page__code"
      metadataClassName="evaluation-case-detail-page__metadata"
      noticeClassName="evaluation-case-detail-page__notice"
      workspaceClassName="evaluation-case-detail-page__workspace"
      settingsClassName="evaluation-case-detail-page__settings"
      sidebarClassName="evaluation-case-detail-page__sidebar playground-project-overview-sidebar playground-agents-detail-sidebar"
    />
  );
}
