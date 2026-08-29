import type { ReactNode } from "react";
import { MarkdownResourceDetailPage } from "../../../platform-ui/pages/details/index.js";
import {
  PlatformResourceSettingsPage,
  type PlatformResourceSettingsPageProps,
} from "../../../platform-ui/pages/settings/index.js";

export interface PromptDetailPageProps {
  metadata?: ReactNode;
  notice?: ReactNode;
  code: ReactNode;
  settings?: PlatformResourceSettingsPageProps;
  activeTab?: "general" | "settings";
  className?: string;
}

/** Headerless, Markdown-first detail shell for a versioned prompt. */
export function PromptDetailPage({
  metadata,
  notice,
  code,
  settings,
  activeTab = "general",
  className = "",
}: PromptDetailPageProps) {
  const normalizedTab = activeTab === "settings" ? "settings" : "code";
  const settingsPage = settings ? <PlatformResourceSettingsPage {...settings} /> : null;

  return (
    <MarkdownResourceDetailPage
      metadata={metadata}
      notice={notice}
      code={code}
      settings={settingsPage}
      activeTab={normalizedTab}
      ariaLabel="Prompt details"
      className={`prompt-detail-page playground-project-overview-layout playground-agents-detail-overview-layout is-${normalizedTab}-tab${className ? ` ${className}` : ""}`}
      contentClassName={`prompt-detail-page__content playground-project-overview-main playground-agents-detail-overview-main is-${normalizedTab}-tab`}
      codeClassName="prompt-detail-page__code"
      metadataClassName="prompt-detail-page__metadata"
      noticeClassName="prompt-detail-page__notice"
      workspaceClassName="prompt-detail-page__code-workspace"
      settingsClassName="prompt-detail-page__settings"
    />
  );
}
