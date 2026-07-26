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

          function getProjectSummaryTeams(projectRecord) {
            const metadata = projectRecord?.metadata
              && typeof projectRecord.metadata === "object"
              && !Array.isArray(projectRecord.metadata)
                ? projectRecord.metadata
                : {};
            const sharedTeamIds = new Set(
              getPlatformSharedTeamIds(metadata)
                .map((teamId) => String(teamId || "").trim())
                .filter(Boolean)
            );
            const removedTeamIds = new Set(
              (Array.isArray(metadata.teamAccessRemovedIds) ? metadata.teamAccessRemovedIds : [])
                .map((teamId) => String(teamId || "").trim())
                .filter(Boolean)
            );
            const workspaceTeamRows = (Array.isArray(workspaceTeams) ? workspaceTeams : [])
              .map((team) => {
                const teamId = String(team?.id || "").trim();
                if (
                  !teamId
                  || isPlatformSystemAccessPrincipalId(teamId)
                  || !sharedTeamIds.has(teamId)
                  || removedTeamIds.has(teamId)
                ) {
                  return null;
                }
                return {
                  id: teamId,
                  name: String(team?.name || "Untitled team").trim() || "Untitled team",
                  kind: "team",
                  profileImageUrl: getPlatformAccessPrincipalProfileImageUrl(team),
                };
              })
              .filter(Boolean);
            return composePlatformAccessPrincipalRows(workspaceTeamRows)
              .map((principal) => ({
                id: String(principal?.id || "").trim(),
                name: String(principal?.name || "Untitled team").trim() || "Untitled team",
                imageUrl: getPlatformAccessPrincipalProfileImageUrl(principal),
              }))
              .filter((principal) => principal.id)
              .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
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
            const summaryTeams = getProjectSummaryTeams(projectRecord);
            const summaryResources = getProjectSummaryResources();
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
              React.createElement(ProjectSummaryDetails, {
                teams: summaryTeams,
                resources: summaryResources,
                teamsLoading: Boolean(workspaceTeamsLoading && summaryTeams.length === 0),
                resourcesLoading: Boolean(
                  projectOverviewServerResourcesState?.status === "loading"
                  && summaryResources.length === 0
                ),
                onTeamsSelect: () => setProjectOverviewHomeTab("permissions"),
                onResourcesSelect: () => setProjectOverviewHomeTab("resources"),
                onResourceSelect: (resource) => {
                  if (resource?.source) {
                    openProjectOverviewResourceRow(resource.source);
                  }
                },
              }),
              renderProjectOverviewLatestUpdateSection()
            );
          }
`;
