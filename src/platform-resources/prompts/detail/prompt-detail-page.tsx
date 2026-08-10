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
  return (
    <MarkdownResourceDetailPage
      metadata={metadata}
      notice={notice}
      code={code}
      settings={settings}
      activeTab={activeTab === "settings" ? "settings" : "code"}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      ariaLabel="Prompt details"
      sidebarAriaLabel="Prompt properties"
      className={`prompt-detail-page${className ? ` ${className}` : ""}`}
      contentClassName="prompt-detail-page__content"
      codeClassName="prompt-detail-page__code"
      metadataClassName="prompt-detail-page__metadata"
      noticeClassName="prompt-detail-page__notice"
      workspaceClassName="prompt-detail-page__code-workspace"
      settingsClassName="prompt-detail-page__settings"
    />
  );
}
