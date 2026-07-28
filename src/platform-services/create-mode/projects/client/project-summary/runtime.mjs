export const PROJECT_SUMMARY_RUNTIME_FRAGMENT = `
          function getProjectSummaryResourceTimestamp(row) {
            const sources = [
              row,
              row?.record,
              row?.template,
              row?.record?.metadata,
            ].filter((source) => source && typeof source === "object" && !Array.isArray(source));
            const keys = [
              "updatedAt",
              "updated_at",
              "modifiedAt",
              "modified_at",
              "lastModified",
              "lastModifiedAt",
              "lastUsedAt",
              "addedAt",
              "added_at",
              "createdAt",
              "created_at",
              "publishedAt",
              "published_at",
              "timestamp",
            ];
            for (const source of sources) {
              for (const key of keys) {
                const rawValue = source[key];
                if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
                  return rawValue > 0 && rawValue < 100000000000
                    ? rawValue * 1000
                    : rawValue;
                }
                const normalizedValue = String(rawValue || "").trim();
                if (!normalizedValue) continue;
                const numericValue = Number(normalizedValue);
                if (Number.isFinite(numericValue) && numericValue > 0) {
                  return numericValue < 100000000000
                    ? numericValue * 1000
                    : numericValue;
                }
                const parsedValue = Date.parse(normalizedValue);
                if (Number.isFinite(parsedValue)) {
                  return parsedValue;
                }
              }
            }
            return 0;
          }

          function getProjectSummaryResources() {
            return (Array.isArray(projectOverviewAllResourceRows) ? projectOverviewAllResourceRows : [])
              .map((row, index) => {
                const typeMeta = getProjectOverviewResourceTypeMeta(row?.type);
                const name = String(row?.title || row?.name || typeMeta?.label || "Resource").trim() || "Resource";
                return {
                  id: String(row?.key || row?.id || row?.path || name + ":" + index).trim(),
                  name,
                  icon: renderProjectOverviewResourceIcon(row, typeMeta?.Icon || Layers),
                  source: row,
                  timestamp: getProjectSummaryResourceTimestamp(row),
                  sourceIndex: index,
                };
              })
              .sort((left, right) => (
                Number(right.timestamp || 0) - Number(left.timestamp || 0)
                || Number(right.sourceIndex || 0) - Number(left.sourceIndex || 0)
              ));
          }

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
            const summaryResources = getProjectSummaryResources();
            const summaryMilestones = getProjectOverviewMilestoneRecords()
              .map((release) => {
                const progress = getProjectOverviewMilestoneProgress(release);
                return {
                  id: String(release.id),
                  name: String(release.name || "Untitled Milestone").trim() || "Untitled Milestone",
                  progressPercent: progress.percent,
                  source: release,
                };
              });
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
              renderProjectOverviewWorkGraphPanel(),
              React.createElement(ProjectSummaryDetails, {
                resources: summaryResources,
                milestones: summaryMilestones,
                resourcesLoading: Boolean(
                  projectOverviewServerResourcesState?.status === "loading"
                  && summaryResources.length === 0
                ),
                milestonesLoading: Boolean(
                  taskLoadState?.status === "loading"
                  && summaryMilestones.length === 0
                ),
                onResourcesSelect: () => setProjectOverviewHomeTab("resources"),
                onMilestonesSelect: () => setProjectOverviewHomeTab("milestones"),
                onResourceSelect: (resource) => {
                  if (resource?.source) {
                    openProjectOverviewResourceRow(resource.source);
                  }
                },
                onMilestoneSelect: (milestone) => {
                  if (milestone?.source && typeof openReleaseComposerForEdit === "function") {
                    openReleaseComposerForEdit(milestone.source);
                  }
                },
              }),
              renderProjectOverviewLatestUpdateSection()
            );
          }
`;
