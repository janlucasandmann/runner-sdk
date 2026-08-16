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
          return React.createElement(ConfigureHomeOverviewPage, {
            cards: configureOverviewCards,
            onOpenNotifications: openNotificationsPage,
            onOpenEvaluations: openEvaluationsOverviewPage,
            onOpenGuardrails: openGuardrailsOverviewPage,
            onOpenPricing: platformHasCapability("pricing")
              ? () => window.open(__CONFIGURE_HOME_PRICING_URL__, "_blank", "noopener,noreferrer")
              : undefined,
            onOpenDocumentation: openDocsPage,
          });
        }
`;

export function createConfigureHomePageScript(pricingUrl) {
  return CONFIGURE_HOME_PAGE_TEMPLATE.replace(
    "__CONFIGURE_HOME_PRICING_URL__",
    JSON.stringify(String(pricingUrl || "").trim()),
  );
}
