export const GUARDRAILS_AGENT_PAGE_VIEW_SCRIPT = `          function renderAgentGuardrailsSection(options = {}) {
            return React.createElement("section", {
              className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-guardrails-section",
              key: options?.key || "guardrails",
              "data-section-id": "guardrails",
            },
              renderAgentGuardrailTable(options)
            );
          }
`;
