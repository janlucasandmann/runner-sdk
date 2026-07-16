const CONFIGURE_HOME_PAGE_TEMPLATE = `        function renderConfigureHomePage() {
          const formatConfigureOverviewCount = (value) => {
            const numericValue = Math.max(0, Math.round(Number(value || 0)));
            return numericValue.toLocaleString("en-US");
          };
          const configureOverviewCards = [
            {
              id: "agents",
              title: "Agents",
              description: "Agents available for workspace runs.",
              value: formatConfigureOverviewCount(runtimeAgents.length),
              icon: Bot,
              onClick: () => openResourcesView("agents"),
            },
            {
              id: "computers",
              title: "Computers",
              description: "Persistent workspaces agents can use.",
              value: formatConfigureOverviewCount(runtimeEnvironments.length),
              icon: Monitor,
              onClick: () => openResourcesView("computers"),
            },
            {
              id: "skills",
              title: "Skills",
              description: "Capabilities agents can call during work.",
              value: formatConfigureOverviewCount(demoSkills.length),
              icon: Sparkles,
              onClick: () => openToolsView("skills"),
            },
          ];
          const configureNotificationRows = visibleNotificationPageItems.map((item) => {
            const timestamp = Date.parse(item.createdAt || "");
            return {
              ...item,
              createdAtTimestamp: Number.isFinite(timestamp) ? timestamp : 0,
              createdAtLabel: item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "—",
            };
          });
          return React.createElement(ConfigureHomeOverviewPage, {
            cards: configureOverviewCards,
            notifications: configureNotificationRows,
            totalNotificationCount: allNotificationPageItems.length,
            searchValue: notificationsPageSearchQuery,
            onSearchChange: setNotificationsPageSearchQuery,
            filterValue: notificationsPageFilter,
            onFilterChange: setNotificationsPageFilter,
            sortValue: notificationsPageSort,
            onSortChange: setNotificationsPageSort,
            onOpenPricing: () => window.open(__CONFIGURE_HOME_PRICING_URL__, "_blank", "noopener,noreferrer"),
            onOpenDocumentation: openDocsPage,
            onOpenNotification: handleOpenNotificationPageItem,
            canOpenNotification: canOpenConfigureHomeNotification,
            getNotificationActions: getConfigureHomeNotificationActions,
            controlsPortalId: "playground-configure-overview-controls",
          });
        }
`;

export function createConfigureHomePageScript(pricingUrl) {
  return CONFIGURE_HOME_PAGE_TEMPLATE.replace(
    "__CONFIGURE_HOME_PRICING_URL__",
    JSON.stringify(String(pricingUrl || "").trim()),
  );
}
