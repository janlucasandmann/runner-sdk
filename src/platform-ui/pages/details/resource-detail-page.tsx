import { useId } from "react";
import { PlatformDetailSidebar } from "../../components/composite/detail-sidebar/index.js";
import { PlatformDetailTabBar } from "../../components/composite/detail-tab-bar/index.js";
import type { ResourceDetailPageProps } from "./resource-detail-types.js";

export function ResourceDetailPage<TTab extends string = string>({
  title,
  header,
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  tabBarActions,
  sidebarToggle,
  children,
  sidebar,
  sidebarCollapsed = false,
  ariaLabel = "Resource details",
  tabAriaLabel = "Resource sections",
  sidebarAriaLabel = "Resource settings",
  className = "",
  headerClassName = "",
  tabBarClassName = "",
  tabBarActionsClassName = "",
  contentClassName = "",
  sidebarClassName = "",
}: ResourceDetailPageProps<TTab>) {
  const generatedId = useId().replace(/:/g, "");
  const panelId = `resource-detail-panel-${generatedId}`;
  const activeTabDefinition = tabs.find((tab) => tab.id === activeTab);
  const panelLabel = activeTabDefinition?.ariaLabel
    || (typeof activeTabDefinition?.label === "string" ? activeTabDefinition.label : `${ariaLabel} content`);
  const hasSidebar = sidebar !== undefined && sidebar !== null;
  const tabBarEndActions = tabBarActions || sidebarToggle ? (
    <div className={`resource-detail-page__tab-bar-actions${tabBarActionsClassName ? ` ${tabBarActionsClassName}` : ""}`}>
      {tabBarActions}
      {sidebarToggle ? (
        <div className="resource-detail-page__sidebar-toggle">
          {sidebarToggle}
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <section
      className={`resource-detail-page${hasSidebar ? " has-sidebar" : " is-sidebar-empty"}${sidebarCollapsed ? " is-sidebar-collapsed" : ""}${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      data-resource-detail-page="true"
    >
      <header className={`resource-detail-page__header${headerClassName ? ` ${headerClassName}` : ""}`}>
        <div className="resource-detail-page__header-content">
          {header ?? <h1 className="resource-detail-page__title">{title}</h1>}
        </div>
        {headerActions ? <div className="resource-detail-page__header-actions">{headerActions}</div> : null}
      </header>

      <PlatformDetailTabBar<TTab>
        tabs={tabs}
        value={activeTab}
        onValueChange={onTabChange}
        endActions={tabBarEndActions}
        ariaLabel={tabAriaLabel}
        panelId={panelId}
        className={tabBarClassName}
      />

      <section
        id={panelId}
        role="tabpanel"
        aria-label={panelLabel}
        className={`resource-detail-page__content${contentClassName ? ` ${contentClassName}` : ""}`}
      >
        {children}
      </section>

      {hasSidebar ? (
        <PlatformDetailSidebar
          ariaLabel={sidebarAriaLabel}
          collapsed={sidebarCollapsed}
          className={sidebarClassName}
        >
          {sidebar}
        </PlatformDetailSidebar>
      ) : null}
    </section>
  );
}
