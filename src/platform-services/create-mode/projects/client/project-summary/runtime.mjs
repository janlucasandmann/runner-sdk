export const PROJECT_SUMMARY_RUNTIME_FRAGMENT = `
          function renderProjectOverviewSummaryHeader() {
            const projectRecord = normalizePlaygroundProjectRecord(projectOverviewDraft || selectedProject);
            const metadata = getProjectOverviewSidebarMetadata(projectRecord);
            const projectName = String(projectRecord.name || selectedProject?.name || "Untitled Project").trim() || "Untitled Project";
            const projectIcon = getPlaygroundProjectIconId(projectRecord.icon || metadata.icon);
            const projectColor = String(
              projectRecord.color
              || metadata.color
              || PLAYGROUND_PROJECT_ACCENT_COLORS[0]
            ).trim() || PLAYGROUND_PROJECT_ACCENT_COLORS[0];
            return React.createElement("div", { className: "platform-project-summary-shell" },
              React.createElement(ProjectSummary, {
                projectName,
                summary: String(projectRecord.description || ""),
                icon: projectIcon,
                color: projectColor,
                iconOptions: PLAYGROUND_PROJECT_ICON_OPTIONS,
                colorOptions: PLAYGROUND_PROJECT_ACCENT_COLORS,
                identityDisabled: !canManageProjectAccess,
                onIdentityChange: async (nextIdentity) => {
                  const nextIcon = getPlaygroundProjectIconId(nextIdentity?.icon);
                  const nextColor = String(nextIdentity?.color || projectColor).trim() || projectColor;
                  const updatedProject = await persistProjectOverviewSidebarProjectUpdate({
                    icon: nextIcon,
                    color: nextColor,
                  }, {
                    icon: nextIcon,
                    color: nextColor,
                  });
                  return Boolean(updatedProject?.id);
                },
                onSummaryChange: (nextSummary) => {
                  updateProjectDescriptionDraftValue(nextSummary, {
                    previousValue: String(projectOverviewDraft?.description || ""),
                  });
                },
                onSummaryCommit: (nextSummary) => saveProjectOverviewDescription(nextSummary),
                onSummaryEditingChange: setProjectDescriptionEditing,
              }),
              renderProjectOverviewProgressAnalyticsSection(),
              renderProjectOverviewLatestUpdateSection()
            );
          }
`;
