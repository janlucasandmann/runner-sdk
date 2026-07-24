import { useId } from "react";
import { PlatformDetailSidebar } from "../../components/composite/detail-sidebar/index.js";
import { PlatformDetailTabBar } from "../../components/composite/detail-tab-bar/index.js";
import type { ResourceDetailPageProps } from "./resource-detail-types.js";

export function ResourceDetailPage<TTab extends string = string>({
  title,
  header,
  headerActions,
  tabs = [],
  activeTab,
  onTabChange,
  tabBarActions,
  sidebarToggle,
  children,
  sidebar,
  sidebarCollapsed = false,
  sidebarAutoCollapseTabs = [],
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
  const hasTabs = tabs.length > 0 && activeTab !== undefined && typeof onTabChange === "function";
  const activeTabDefinition = hasTabs ? tabs.find((tab) => tab.id === activeTab) : undefined;
  const panelLabel = activeTabDefinition?.ariaLabel
    || (typeof activeTabDefinition?.label === "string" ? activeTabDefinition.label : `${ariaLabel} content`);
  const hasHeader = header !== undefined || title !== undefined || headerActions !== undefined;
  const hasSidebar = sidebar !== undefined && sidebar !== null;
  const isSidebarAutoCollapsed = activeTab !== undefined
    && sidebarAutoCollapseTabs.some((tab) => tab === activeTab);
  const effectiveSidebarCollapsed = sidebarCollapsed || isSidebarAutoCollapsed;
  const visibleSidebarToggle = isSidebarAutoCollapsed ? null : sidebarToggle;
  const tabBarEndActions = tabBarActions || visibleSidebarToggle ? (
    <div className={`resource-detail-page__tab-bar-actions${tabBarActionsClassName ? ` ${tabBarActionsClassName}` : ""}`}>
      {tabBarActions}
      {visibleSidebarToggle ? (
        <div className="resource-detail-page__sidebar-toggle">
          {visibleSidebarToggle}
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <section
      className={`resource-detail-page${hasHeader ? " has-header" : " is-headerless"}${hasTabs ? " has-tabs" : " is-tabless"}${hasSidebar ? " has-sidebar" : " is-sidebar-empty"}${effectiveSidebarCollapsed ? " is-sidebar-collapsed" : ""}${isSidebarAutoCollapsed ? " is-sidebar-auto-collapsed" : ""}${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      data-resource-detail-page="true"
    >
      {hasHeader ? (
        <header className={`resource-detail-page__header${headerClassName ? ` ${headerClassName}` : ""}`}>
          <div className="resource-detail-page__header-content">
            {header ?? <h1 className="resource-detail-page__title">{title}</h1>}
          </div>
          {headerActions ? <div className="resource-detail-page__header-actions">{headerActions}</div> : null}
        </header>
      ) : null}

      {hasTabs ? (
        <PlatformDetailTabBar<TTab>
          tabs={tabs}
          value={activeTab}
          onValueChange={onTabChange}
          endActions={tabBarEndActions}
          ariaLabel={tabAriaLabel}
          panelId={panelId}
          className={tabBarClassName}
        />
      ) : null}

      <section
        id={panelId}
        role={hasTabs ? "tabpanel" : undefined}
        aria-label={hasTabs ? panelLabel : undefined}
        className={`resource-detail-page__content${contentClassName ? ` ${contentClassName}` : ""}`}
      >
        {children}
      </section>

      {hasSidebar ? (
        <PlatformDetailSidebar
          ariaLabel={sidebarAriaLabel}
          collapsed={effectiveSidebarCollapsed}
          className={sidebarClassName}
        >
          {sidebar}
        </PlatformDetailSidebar>
      ) : null}
    </section>
  );
}
