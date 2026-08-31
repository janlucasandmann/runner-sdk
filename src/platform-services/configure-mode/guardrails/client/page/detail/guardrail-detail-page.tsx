import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  MarkdownResourceDetailPage,
  PlatformServiceDetailFrame,
} from "../../../../../../platform-ui/pages/details/index.js";
import {
  PlatformResourceSettingsPage,
  type PlatformResourceSettingsPageProps,
} from "../../../../../../platform-ui/pages/settings/index.js";

export type GuardrailDetailTab = "general" | "evaluation" | "settings";

export interface GuardrailDetailPageProps {
  activeTab: GuardrailDetailTab;
  metadata?: ReactNode;
  notice?: ReactNode;
  general: ReactNode;
  evaluation: ReactNode;
  settings: PlatformResourceSettingsPageProps;
  sidebar?: ReactNode;
  evaluationScopeKey?: string;
  onEvaluationActivate?: () => void;
  onSettingsActivate?: () => void;
  className?: string;
}

/**
 * Guardrails use the same full-screen Markdown resource shell as Skills.
 * General and Evaluation are primary workspaces; Settings owns the optional
 * resource-properties sidebar.
 */
export function GuardrailDetailPage({
  activeTab,
  metadata,
  notice,
  general,
  evaluation,
  settings,
  sidebar,
  evaluationScopeKey = "",
  onEvaluationActivate,
  onSettingsActivate,
  className = "",
}: GuardrailDetailPageProps) {
  const normalizedTab: GuardrailDetailTab =
    activeTab === "evaluation"
      ? "evaluation"
      : activeTab === "settings"
        ? "settings"
        : "general";
  const fileResourceTab = normalizedTab === "general" ? "code" : "settings";
  const onEvaluationActivateRef = useRef(onEvaluationActivate);
  const onSettingsActivateRef = useRef(onSettingsActivate);

  useEffect(() => {
    onEvaluationActivateRef.current = onEvaluationActivate;
    onSettingsActivateRef.current = onSettingsActivate;
  }, [onEvaluationActivate, onSettingsActivate]);

  useEffect(() => {
    if (normalizedTab === "evaluation") {
      onEvaluationActivateRef.current?.();
    } else if (normalizedTab === "settings") {
      onSettingsActivateRef.current?.();
    }
  }, [evaluationScopeKey, normalizedTab]);

  if (normalizedTab === "settings") {
    return (
      <PlatformServiceDetailFrame className="guardrail-detail-page__frame">
        <PlatformResourceSettingsPage
          {...settings}
          className={`guardrail-detail-page${settings.className ? ` ${settings.className}` : ""}${className ? ` ${className}` : ""}`}
        />
      </PlatformServiceDetailFrame>
    );
  }

  const detailPage = (
    <MarkdownResourceDetailPage
      activeTab={fileResourceTab}
      metadata={metadata}
      notice={notice}
      code={general}
      settings={evaluation}
      sidebar={normalizedTab === "evaluation" ? undefined : sidebar}
      sidebarCollapsed={true}
      ariaLabel="Guardrail details"
      sidebarAriaLabel="Guardrail properties"
      className={`guardrail-detail-page playground-project-overview-layout playground-agents-detail-overview-layout is-${normalizedTab}-tab${className ? ` ${className}` : ""}`}
      contentClassName={`guardrail-detail-page__content playground-project-overview-main playground-agents-detail-overview-main is-${normalizedTab}-tab`}
      codeClassName="guardrail-detail-page__code"
      metadataClassName="guardrail-detail-page__metadata"
      noticeClassName="guardrail-detail-page__notice"
      workspaceClassName="guardrail-detail-page__workspace"
      settingsClassName="guardrail-detail-page__settings"
      sidebarClassName="guardrail-detail-page__sidebar playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar"
    />
  );

  return normalizedTab === "general" ? detailPage : (
    <PlatformServiceDetailFrame className="guardrail-detail-page__frame">
      {detailPage}
    </PlatformServiceDetailFrame>
  );
}
