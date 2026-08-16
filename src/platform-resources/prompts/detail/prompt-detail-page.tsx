import type { ReactNode } from "react";
import { MarkdownResourceDetailPage } from "../../../platform-ui/pages/details/index.js";

export interface PromptDetailPageProps {
  metadata?: ReactNode;
  notice?: ReactNode;
  code: ReactNode;
  settings?: ReactNode;
  activeTab?: "general" | "settings";
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  className?: string;
}

/** Headerless, Markdown-first detail shell for a versioned prompt. */
export function PromptDetailPage({
  metadata,
  notice,
  code,
  settings = null,
  activeTab = "general",
  sidebar,
  sidebarCollapsed = false,
  className = "",
}: PromptDetailPageProps) {
  const normalizedTab = activeTab === "settings" ? "settings" : "code";

  return (
    <MarkdownResourceDetailPage
      metadata={metadata}
      notice={notice}
      code={code}
      settings={settings}
      activeTab={normalizedTab}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel="Prompt details"
      sidebarAriaLabel="Prompt properties"
      className={`prompt-detail-page playground-project-overview-layout playground-agents-detail-overview-layout is-${normalizedTab}-tab${className ? ` ${className}` : ""}`}
      contentClassName={`prompt-detail-page__content playground-project-overview-main playground-agents-detail-overview-main is-${normalizedTab}-tab`}
      codeClassName="prompt-detail-page__code"
      metadataClassName="prompt-detail-page__metadata"
      noticeClassName="prompt-detail-page__notice"
      workspaceClassName="prompt-detail-page__code-workspace"
      settingsClassName="prompt-detail-page__settings"
      sidebarClassName="prompt-detail-page__settings-sidebar-frame playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar"
    />
  );
}
