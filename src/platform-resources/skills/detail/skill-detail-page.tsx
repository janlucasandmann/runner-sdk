import type { ReactNode } from "react";
import { FileResourceDetailPage } from "../../../platform-ui/pages/details/index.js";

export type SkillDetailTab = "code" | "settings";

export interface SkillDetailPageProps {
  activeTab: SkillDetailTab;
  metadata?: ReactNode;
  notice?: ReactNode;
  code: ReactNode;
  settings: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function SkillDetailPage({
  activeTab,
  metadata,
  notice,
  code,
  settings,
  sidebar,
  sidebarCollapsed = false,
  className = "",
}: SkillDetailPageProps) {
  const normalizedTab: SkillDetailTab =
    activeTab === "settings" ? "settings" : "code";

  return (
    <FileResourceDetailPage
      activeTab={normalizedTab}
      metadata={metadata}
      notice={notice}
      code={code}
      settings={settings}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel="Skill details"
      sidebarAriaLabel="Skill properties"
      className={`skill-detail-page is-${normalizedTab}-tab${className ? ` ${className}` : ""}`}
      contentClassName={`skill-detail-page__content is-${normalizedTab}-tab`}
      codeClassName="skill-detail-page__code"
      metadataClassName="skill-detail-page__metadata"
      noticeClassName="skill-detail-page__notice"
      workspaceClassName="skill-detail-page__code-workspace"
      settingsClassName="skill-detail-page__settings"
    />
  );
}
