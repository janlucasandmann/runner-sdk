export const PROJECT_MILESTONES_RUNTIME_FRAGMENT = `
          function getProjectOverviewMilestoneStatusPresentation(status) {
            const normalizedStatus = String(status || "planned").trim().toLowerCase();
            if (normalizedStatus === "completed") {
              return { label: "Completed", variant: "green" };
            }
            if (normalizedStatus === "active") {
              return { label: "Active", variant: "blue" };
            }
            return { label: "Planned", variant: "gray" };
          }

          function getProjectOverviewMilestoneProgress(release) {
            const releaseId = String(release?.id || "").trim();
            const linkedTasks = releaseId
              ? normalizedOverviewTasks.filter((task) => String(task?.releaseId || "").trim() === releaseId)
              : [];
            const recordedTaskCount = Math.max(0, Number(release?.taskCount || 0));
            const recordedOpenTaskCount = Math.max(0, Number(release?.openTaskCount || 0));
            const shouldUseRecordedProgress = recordedTaskCount > linkedTasks.length;
            const total = shouldUseRecordedProgress
              ? recordedTaskCount
              : linkedTasks.length;
            const completed = shouldUseRecordedProgress
              ? Math.max(0, Math.min(total, total - recordedOpenTaskCount))
              : linkedTasks.filter((task) => String(task?.status || "").trim().toLowerCase() === "done").length;
            return {
              total,
              completed,
              percent: total > 0 ? Math.round((completed / total) * 100) : 0,
            };
          }

          function renderProjectOverviewMilestonesSection() {
            const milestoneRecords = (Array.isArray(releases) ? releases : [])
              .map((release) => normalizePlaygroundTaskReleaseRecord(release))
              .filter((release) => String(release?.id || "").trim())
              .sort((left, right) => (
                typeof compareTaskReleaseOrder === "function"
                  ? compareTaskReleaseOrder(left, right)
                  : String(left?.name || "").localeCompare(String(right?.name || ""))
              ));

            return React.createElement("section", {
                className: "playground-project-overview-milestones",
                "aria-labelledby": "playground-project-overview-milestones-title",
              },
              React.createElement("div", { className: "playground-project-overview-milestones-header" },
                React.createElement("h2", {
                  id: "playground-project-overview-milestones-title",
                  className: "playground-project-overview-milestones-title",
                }, "Milestones"),
                React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "small",
                    className: "playground-project-overview-milestones-add",
                    onClick: () => {
                      if (typeof openReleaseComposer === "function") {
                        openReleaseComposer();
                      }
                    },
                  },
                  React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Milestone")
                )
              ),
              milestoneRecords.length > 0
                ? React.createElement("div", {
                    className: "playground-project-overview-milestones-list",
                    role: "list",
                  },
                  milestoneRecords.map((release) => {
                    const status = getProjectOverviewMilestoneStatusPresentation(
                      getPlaygroundTaskReleaseStatus(release)
                    );
                    const progress = getProjectOverviewMilestoneProgress(release);
                    const dateRange = formatPlaygroundTaskReleaseDateRange(release);
                    const successCriteriaCount = Array.isArray(release.successCriteria)
                      ? release.successCriteria.length
                      : 0;
                    const supportingParts = [
                      dateRange,
                      progress.total > 0
                        ? progress.completed + " of " + progress.total + " tickets completed"
                        : "No tickets",
                      successCriteriaCount > 0
                        ? successCriteriaCount + " success " + (successCriteriaCount === 1 ? "criterion" : "criteria")
                        : "No success criteria",
                    ];
                    return React.createElement("button", {
                        key: release.id,
                        type: "button",
                        role: "listitem",
                        className: "playground-project-overview-milestone-row",
                        onClick: () => {
                          if (typeof openReleaseComposerForEdit === "function") {
                            openReleaseComposerForEdit(release);
                          }
                        },
                        "aria-label": "Edit milestone " + (release.name || "Untitled Milestone"),
                      },
                      React.createElement("span", {
                          className: "playground-project-overview-milestone-icon",
                          "aria-hidden": "true",
                        },
                        React.createElement(Flag, { width: 16, height: 16, strokeWidth: 1.8 })
                      ),
                      React.createElement("span", { className: "playground-project-overview-milestone-copy" },
                        React.createElement("span", {
                          className: "playground-project-overview-milestone-name",
                          title: release.name || "Untitled Milestone",
                        }, release.name || "Untitled Milestone"),
                        React.createElement("span", {
                          className: "playground-project-overview-milestone-meta",
                          title: supportingParts.join(" · "),
                        }, supportingParts.join(" · "))
                      ),
                      React.createElement("span", {
                          className: "playground-project-overview-milestone-progress",
                          "aria-label": progress.percent + "% complete",
                        },
                        React.createElement("span", { className: "playground-project-overview-milestone-progress-value" },
                          progress.percent + "%"
                        ),
                        React.createElement("span", { className: "playground-project-overview-milestone-progress-track" },
                          React.createElement("span", {
                            className: "playground-project-overview-milestone-progress-fill",
                            style: { width: progress.percent + "%" },
                          })
                        )
                      ),
                      React.createElement(PlatformLabel, {
                        className: "playground-project-overview-milestone-status",
                        variant: status.variant,
                      }, status.label)
                    );
                  })
                )
                : React.createElement(PlatformEmptyState, {
                    className: "playground-project-overview-milestones-empty",
                    icon: Flag,
                    title: "No milestones yet",
                    description: "Create a milestone to group tickets around a measurable delivery target.",
                  })
            );
          }
`;
