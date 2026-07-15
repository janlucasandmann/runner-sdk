const CONFIGURE_HOME_PAGE_TEMPLATE = `        function renderConfigureHomePage() {
          const connectedPluginsCount = [githubStatus, gmailStatus, googleDriveStatus, oneDriveStatus, notionStatus]
            .filter((status) => Boolean(status?.connected || status?.status === "connected")).length;

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
              Icon: Bot,
              onClick: () => openResourcesView("agents"),
            },
            {
              id: "computers",
              title: "Computers",
              description: "Persistent workspaces agents can use.",
              value: formatConfigureOverviewCount(runtimeEnvironments.length),
              Icon: Monitor,
              onClick: () => openResourcesView("computers"),
            },
            {
              id: "skills",
              title: "Skills",
              description: "Capabilities agents can call during work.",
              value: formatConfigureOverviewCount(demoSkills.length),
              Icon: Sparkles,
              onClick: () => openToolsView("skills"),
            },
          ];
          const renderConfigureOverviewCards = () =>
            React.createElement("section", { className: "playground-configure-overview-cards", "aria-label": "Workspace resources" },
              configureOverviewCards.map((card) =>
                React.createElement("button", {
                    key: card.id,
                    type: "button",
                    className: "playground-configure-overview-card",
                    onClick: card.onClick,
                  },
	                  React.createElement("div", { className: "playground-configure-overview-card-top" },
	                    React.createElement("span", { className: "playground-configure-overview-card-icon", "aria-hidden": "true" },
	                      React.createElement(getPlaygroundSafeIconComponent(card.Icon, Circle), { strokeWidth: 1.8 })
	                    ),
                    React.createElement(ArrowUpRight, { className: "playground-configure-overview-card-arrow", strokeWidth: 1.8 })
                  ),
                  React.createElement("div", { className: "playground-configure-overview-card-copy" },
                    React.createElement("div", { className: "playground-configure-overview-card-value" }, card.value),
                    React.createElement("div", { className: "playground-configure-overview-card-title" }, card.title),
                    React.createElement("div", { className: "playground-configure-overview-card-description" }, card.description)
                  )
                )
              )
            );

          return React.createElement("div", { className: "playground-configure-home playground-develop-home" },
            React.createElement("div", { className: "playground-configure-home-inner playground-develop-home-inner" },
              React.createElement("div", { className: "playground-project-overview-summary-title-row playground-develop-header" },
                React.createElement("h1", { className: "playground-project-overview-summary-title playground-develop-title" }, "Configure your Workspace"),
                React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-develop-header-actions" },
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button",
                    onClick: () => window.open(__CONFIGURE_HOME_PRICING_URL__, "_blank", "noopener,noreferrer"),
                  }, "Pricing", React.createElement(ArrowUpRight, { width: 14, height: 14, strokeWidth: 1.8 })),
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button",
                    onClick: openDocsPage,
                  }, "Documentation", React.createElement(ArrowUpRight, { width: 14, height: 14, strokeWidth: 1.8 }))
                )
              ),
	              renderConfigureOverviewCards(),
	              renderConfigureNotificationsSection()
            )
          );
        }
`;

export function createConfigureHomePageScript(pricingUrl) {
  return CONFIGURE_HOME_PAGE_TEMPLATE.replace(
    "__CONFIGURE_HOME_PRICING_URL__",
    JSON.stringify(String(pricingUrl || "").trim()),
  );
}
