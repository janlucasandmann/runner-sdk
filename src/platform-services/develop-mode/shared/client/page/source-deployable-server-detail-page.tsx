import type { ReactNode } from "react";
import { DevelopServerDetailPage } from "./develop-server-detail-page.js";

export type SourceDeployableServerKind = "function" | "web-app";
export type SourceDeployableServerDetailTab = "usage" | "code" | "settings";

export interface SourceDeployableServerDetailPageProps {
  resourceKind: SourceDeployableServerKind;
  activeTab: SourceDeployableServerDetailTab;
  contentByTab: Readonly<Record<SourceDeployableServerDetailTab, ReactNode>>;
  overrideContent?: ReactNode;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
}

export function SourceDeployableServerDetailPage({
  resourceKind,
  activeTab,
  contentByTab,
  overrideContent,
  sidebar,
  sidebarCollapsed = false,
  ariaLabel = "Source-deployable resource details",
  sidebarAriaLabel = "Source-deployable resource properties",
}: SourceDeployableServerDetailPageProps) {
  const normalizedTab: SourceDeployableServerDetailTab = (
    activeTab === "usage" || activeTab === "settings"
  )
    ? activeTab
    : "code";
  const isUsageTab = normalizedTab === "usage";
  const isCodeTab = normalizedTab === "code";
  const resourceClassName = resourceKind === "function" ? "function" : "web-app";

  return (
    <DevelopServerDetailPage<SourceDeployableServerDetailTab>
      tabs={[]}
      activeTab={normalizedTab}
      onTabChange={() => undefined}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarAutoCollapseTabs={["code"]}
      ariaLabel={ariaLabel}
      sidebarAriaLabel={sidebarAriaLabel}
      className={[
        "is-source-deployable-server-detail",
        `is-${resourceClassName}-server-detail`,
        isUsageTab ? "is-source-server-usage-tab" : "",
        isCodeTab ? "is-source-server-code-tab" : "",
      ].filter(Boolean).join(" ")}
      contentClassName={[
        isUsageTab ? "is-source-server-usage-tab" : "",
        isCodeTab ? "is-source-server-code-tab" : "",
      ].filter(Boolean).join(" ")}
    >
      {overrideContent ?? contentByTab[normalizedTab]}
    </DevelopServerDetailPage>
  );
}
