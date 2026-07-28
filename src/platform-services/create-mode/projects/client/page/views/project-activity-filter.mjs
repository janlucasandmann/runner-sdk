export const PROJECT_ACTIVITY_FILTER_SCRIPT = `        const projectWorkActivityFilterOptions = [
          {
            id: "all",
            label: "All actions",
            description: "Show every ticket and agent action.",
          },
          {
            id: "lifecycle",
            label: "Lifecycle",
            description: "Ticket creation and status changes.",
          },
          {
            id: "agent_work",
            label: "Agent work",
            description: "Threads and agent execution activity.",
          },
          {
            id: "assignments",
            label: "Assignments",
            description: "Assignee and reviewer changes.",
          },
          {
            id: "planning",
            label: "Planning",
            description: "Priority, milestone, schedule, and dependency changes.",
          },
          {
            id: "other_changes",
            label: "Other changes",
            description: "Titles, types, and other ticket fields.",
          },
        ];
        const projectWorkActivityAssignmentFields = new Set([
          "assigneeagentid",
          "revieweragentid",
        ]);
        const projectWorkActivityPlanningFields = new Set([
          "priority",
          "releaseid",
          "milestoneid",
          "sprintid",
          "dueat",
          "scheduledstartat",
          "scheduledendat",
          "scheduletype",
          "cronexpression",
          "scheduletimezone",
          "scheduleenabled",
          "dependencyids",
          "parenttaskid",
        ]);

        function matchesProjectWorkActivityFilter(event, filterMode) {
          if (!filterMode || filterMode === "all") {
            return true;
          }
          const eventType = String(event?.eventType || "").trim().toLowerCase();
          const fieldName = String(event?.fieldName || "")
            .replace(/[^a-z0-9]/gi, "")
            .toLowerCase();
          if (filterMode === "lifecycle") {
            return eventType === "created" || eventType === "status_changed";
          }
          if (filterMode === "agent_work") {
            return eventType === "thread_started";
          }
          if (filterMode === "assignments") {
            return eventType === "field_changed"
              && projectWorkActivityAssignmentFields.has(fieldName);
          }
          if (filterMode === "planning") {
            return eventType === "field_changed"
              && projectWorkActivityPlanningFields.has(fieldName);
          }
          if (filterMode === "other_changes") {
            return eventType === "field_changed"
              && !projectWorkActivityAssignmentFields.has(fieldName)
              && !projectWorkActivityPlanningFields.has(fieldName);
          }
          return true;
        }

        function renderProjectWorkActivityFilter() {
          const filterOpen = projectOverviewTaskActivityToolbarPopover === "filter";
          return React.createElement(PlatformPopup, {
              open: filterOpen,
              rootRef: projectOverviewTaskActivityFilterPopupRef,
              surfaceRef: projectOverviewTaskActivityFilterSurfaceRef,
              rootClassName: "playground-project-activity-filter-shell is-central-popup",
              surfaceClassName: "platform-data-table__floating-menu playground-project-activity-filter-menu is-central-popup",
              surfaceProps: {
                role: "menu",
                "aria-label": "Filter activity",
              },
              animation: "down-in",
              variant: "minimal",
              portal: true,
              placement: "bottom-end",
              portalOffset: 6,
              trigger: React.createElement("button", {
                type: "button",
                className: "platform-data-table__toolbar-button is-icon-only"
                  + (filterOpen || projectOverviewTaskActivityFilterMode !== "all" ? " is-open" : ""),
                onClick: (event) => {
                  event.stopPropagation();
                  setProjectOverviewTaskActivityToolbarPopover((current) =>
                    current === "filter" ? "" : "filter"
                  );
                },
                title: "Filter activity",
                "aria-label": "Filter activity",
                "aria-haspopup": "menu",
                "aria-expanded": filterOpen ? "true" : "false",
              }, React.createElement(ListFilter, {
                width: 14,
                height: 14,
                strokeWidth: 1.8,
                "aria-hidden": "true",
              })),
            },
            projectWorkActivityFilterOptions.map((option) =>
              React.createElement("button", {
                key: option.id,
                type: "button",
                role: "menuitemradio",
                "aria-checked": projectOverviewTaskActivityFilterMode === option.id
                  ? "true"
                  : "false",
                className: "platform-data-table__menu-item",
                onClick: () => {
                  setProjectOverviewTaskActivityFilterMode(option.id);
                  setProjectOverviewTaskActivityToolbarPopover("");
                },
              },
                React.createElement("span", {
                    className: "platform-data-table__menu-icon",
                  },
                  projectOverviewTaskActivityFilterMode === option.id
                    ? React.createElement(Check, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      })
                    : null
                ),
                React.createElement("span", {
                    className: "platform-data-table__menu-copy",
                  },
                  React.createElement("span", {
                    className: "platform-data-table__menu-label",
                  }, option.label),
                  React.createElement("span", {
                    className: "platform-data-table__menu-description",
                  }, option.description)
                )
              )
            )
          );
        }
`;
