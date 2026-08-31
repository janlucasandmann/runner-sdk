import type { ReactNode } from "react";
import {
  MarkdownResourceDetailPage,
  PlatformServiceDetailFrame,
  PlatformServiceDetailPage,
} from "../../../platform-ui/pages/details/index.js";
import type { PlatformResourceSettingsPageProps } from "../../../platform-ui/pages/settings/index.js";

export type SkillDetailTab = "code" | "settings";

export interface SkillDetailPageProps {
  activeTab: SkillDetailTab;
  metadata?: ReactNode;
  notice?: ReactNode;
  code: ReactNode;
  settings: PlatformResourceSettingsPageProps;
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

  if (normalizedTab === "settings") {
    return (
      <PlatformServiceDetailFrame className="skill-detail-page__settings-frame">
        <PlatformServiceDetailPage
          settings={settings}
          sidebarCollapsed={sidebarCollapsed}
          ariaLabel="Skill details"
          sidebarAriaLabel="Skill properties"
          className={`skill-detail-page is-settings-tab${className ? ` ${className}` : ""}`}
          contentClassName="skill-detail-page__content is-settings-tab"
          sidebarClassName="skill-detail-page__sidebar"
          propertiesCardClassName="skill-detail-page__properties-card"
        >
          {null}
        </PlatformServiceDetailPage>
      </PlatformServiceDetailFrame>
    );
  }

  return (
    <MarkdownResourceDetailPage
      activeTab={normalizedTab}
      metadata={metadata}
      notice={notice}
      code={code}
      settings={null}
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
