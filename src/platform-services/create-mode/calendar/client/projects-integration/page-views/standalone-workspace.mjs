export const CALENDAR_PROJECTS_PAGE_STANDALONE_WORKSPACE_SCRIPT = `
        function renderStandaloneCalendarWorkspace() {
          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace",
            },
            React.createElement("section", { className: "playground-environments-detail playground-tasks-project-workspace-detail" },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-project-workspace-scroll is-calendar" },
                renderCalendarView()
              )
            )
          );
        }

`;
