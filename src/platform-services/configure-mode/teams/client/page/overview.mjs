const TEAMS_PAGE_OVERVIEW_TEMPLATE = `	          const renderTeamOverview = () => React.createElement("div", { className: "playground-team-overview-page playground-agents-overview-page playground-organization-overview-page is-develop-configure-page" },
            React.createElement("div", { className: "playground-environments-home-content playground-team-overview-content playground-organization-overview-content" },
              React.createElement("section", { className: "playground-environments-home-hero playground-develop-server-kind-hero playground-agents-configure-hero playground-team-overview-hero playground-organization-overview-hero" },
                React.createElement("div", { className: "playground-organization-overview-hero-intro" },
                  React.createElement("h1", { className: "playground-organization-overview-hero-title" }, "Teams"),
                  React.createElement("p", { className: "playground-organization-overview-hero-description" }, "Share selected resources and projects with dedicated groups and control how every member can work."),
                  React.createElement("div", { className: "playground-organization-overview-hero-actions" },
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "button",
                      className: "playground-functions-empty-button is-primary playground-organization-overview-docs-button",
                      onClick: () => window.open(__TEAMS_DOCUMENTATION_URL__, "_blank", "noopener,noreferrer"),
                    },
                      React.createElement("span", null, "Documentation"),
                      React.createElement(ArrowUpRight, { width: 13, height: 13, strokeWidth: 1.8 })
                    )
                  )
                ),
                teamPageError
                  ? React.createElement("div", { className: "playground-team-error" }, teamPageError)
                  : null,
                React.createElement("section", {
                    className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-organization-overview-table-section",
                  },
	                  teamOverviewDataTable
	                )
              )
            ),
            renderCreateTeamModal()
          );

`;

export function createTeamsPageOverviewScript(documentationUrl) {
  return TEAMS_PAGE_OVERVIEW_TEMPLATE.replace(
    "__TEAMS_DOCUMENTATION_URL__",
    JSON.stringify(String(documentationUrl || "").trim()),
  );
}

