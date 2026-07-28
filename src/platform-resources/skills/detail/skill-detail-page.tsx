import type { ReactNode } from "react";
import {
  DevelopServerDetailPage,
} from "../../../platform-services/develop-mode/shared/client/page/develop-server-detail-page.js";

export type SkillDetailTab = "code" | "settings";

export interface SkillDetailPageProps {
  activeTab: SkillDetailTab;
  code: ReactNode;
  settings: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function SkillDetailPage({
  activeTab,
  code,
  settings,
  sidebar,
  sidebarCollapsed = false,
  className = "",
}: SkillDetailPageProps) {
  const normalizedTab: SkillDetailTab = activeTab === "settings" ? "settings" : "code";

  return (
    <DevelopServerDetailPage<SkillDetailTab>
      tabs={[]}
      activeTab={normalizedTab}
      onTabChange={() => undefined}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarAutoCollapseTabs={["code", "settings"]}
      ariaLabel="Skill details"
      sidebarAriaLabel="Skill properties"
      className={`skill-detail-page is-${normalizedTab}-tab${className ? ` ${className}` : ""}`}
      contentClassName={`skill-detail-page__content is-${normalizedTab}-tab`}
    >
      {normalizedTab === "settings" ? settings : code}
    </DevelopServerDetailPage>
  );
}
