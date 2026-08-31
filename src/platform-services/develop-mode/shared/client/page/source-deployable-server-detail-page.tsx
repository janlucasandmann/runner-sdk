import type { ReactNode } from "react";
import type { PlatformResourceSettingsPageProps } from "../../../../../platform-ui/pages/settings/index.js";
import { DevelopServerDetailPage } from "./develop-server-detail-page.js";

export type SourceDeployableServerKind = "function" | "web-app" | "api";
export type SourceDeployableServerDetailTab = "usage" | "code" | "settings";

export interface SourceDeployableServerDetailPageProps<
  TValue extends string = string,
  TData = unknown,
> {
  resourceKind: SourceDeployableServerKind;
  activeTab: SourceDeployableServerDetailTab;
  contentByTab: Readonly<Record<SourceDeployableServerDetailTab, ReactNode>>;
  overrideContent?: ReactNode;
  settings?: PlatformResourceSettingsPageProps<TValue, TData>;
  sidebar?: ReactNode;
  sidebarCollapsed?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
}

export function SourceDeployableServerDetailPage<
  TValue extends string = string,
  TData = unknown,
>({
  resourceKind,
  activeTab,
  contentByTab,
  overrideContent,
  settings,
  sidebar,
  sidebarCollapsed = false,
  ariaLabel = "Source-deployable resource details",
  sidebarAriaLabel = "Source-deployable resource properties",
}: SourceDeployableServerDetailPageProps<TValue, TData>) {
  const normalizedTab: SourceDeployableServerDetailTab = (
    activeTab === "usage" || activeTab === "settings"
  )
    ? activeTab
    : "code";
  const isUsageTab = normalizedTab === "usage";
  const isCodeTab = normalizedTab === "code";
  const resourceClassName = resourceKind === "function"
    ? "function"
    : resourceKind === "api"
      ? "api"
      : "web-app";

  return (
    <DevelopServerDetailPage<SourceDeployableServerDetailTab, TValue, TData>
      tabs={[]}
      activeTab={normalizedTab}
      onTabChange={() => undefined}
      settings={overrideContent ? undefined : settings}
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
