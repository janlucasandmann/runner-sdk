export const PROJECT_OVERVIEW_RESOURCES_CREATORS_FRAGMENT = String.raw`
          function isProjectOverviewFunctionResource(resource) {
            const haystack = getProjectOverviewResourceHaystack(resource);
            return haystack.includes("function") || haystack.includes("server action") || haystack.includes("backend logic");
          }

          function renderProjectOverviewFunctionsWidget() {
            const functionResources = allOverviewResourceItems
              .filter((item) => isProjectOverviewFunctionResource(item))
              .slice(0, 4);
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Functions", FunctionSquare, {
                label: "Open",
                onClick: () => {
                  if (typeof setProjectOverviewHomeTab === "function") {
                    setProjectOverviewHomeTab("resources");
                  }
                  if (typeof setProjectOverviewFilesSubview === "function") {
                    setProjectOverviewFilesSubview("resources");
                  }
                },
              }),
              functionResources.length > 0
                ? React.createElement("div", { className: "playground-project-overview-widget-list" },
                    functionResources.map((resource, index) => {
                      const title = String(resource?.title || resource?.name || resource?.label || "Function").trim();
                      const meta = [resource?.status || "", resource?.dateLabel || resource?.updatedAt || ""].filter(Boolean).join(" · ");
                      return renderProjectOverviewWidgetListItem({
                        key: String(resource?.id || title || index),
                        Icon: FunctionSquare,
                        title,
                        meta,
                      });
                    })
                  )
                : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No functions connected yet.")
            );
          }

          function renderProjectOverviewEarningsWidget() {
            const summary = selectedProjectSummary && typeof selectedProjectSummary === "object" && !Array.isArray(selectedProjectSummary)
              ? selectedProjectSummary
              : {};
            const earningsValue = Math.max(0, Number(summary.earnings || summary.revenue || summary.totalRevenue || summary.paymentsTotal || 0));
            const formattedValue = earningsValue > 0
              ? "$" + new Intl.NumberFormat("en-US", { maximumFractionDigits: earningsValue >= 100 ? 0 : 2 }).format(earningsValue)
              : "$0";
            return React.createElement("section", { className: "playground-project-overview-widget" },
              renderProjectOverviewWidgetHeader("Earnings", DollarSign),
              React.createElement("div", { className: "playground-project-overview-widget-metric" },
                React.createElement("div", { className: "playground-project-overview-widget-metric-value" }, formattedValue),
                React.createElement("div", { className: "playground-project-overview-widget-metric-label" }, "Payment revenue"),
                earningsValue > 0
                  ? React.createElement("div", { className: "playground-project-overview-widget-metric-meta" }, "From connected payment resources")
                  : React.createElement("div", { className: "playground-project-overview-widget-empty" }, "No earnings recorded yet.")
              )
            );
          }

          function getProjectOverviewOperatingProfile() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            if (metadata.operatingProfileSnapshot && typeof metadata.operatingProfileSnapshot === "object" && !Array.isArray(metadata.operatingProfileSnapshot)) {
              return metadata.operatingProfileSnapshot;
            }
            const projectType = String(selectedProject?.projectType || selectedProject?.type || metadata.projectType || metadata.blueprintId || "blank").trim();
            const blueprint = typeof getPlaygroundProjectBlueprint === "function"
              ? getPlaygroundProjectBlueprint(projectType)
              : null;
            if (blueprint && typeof buildPlaygroundProjectOperatingProfileSnapshot === "function") {
              return buildPlaygroundProjectOperatingProfileSnapshot(blueprint);
            }
            return null;
          }

          function getProjectOverviewDashboardWidgetIds() {
            const operatingProfile = getProjectOverviewOperatingProfile();
            const dashboardProfile = operatingProfile?.dashboardProfile && typeof operatingProfile.dashboardProfile === "object" && !Array.isArray(operatingProfile.dashboardProfile)
              ? operatingProfile.dashboardProfile
              : {};
            const configuredWidgets = Array.isArray(dashboardProfile.widgets)
              ? dashboardProfile.widgets
              : [];
            const normalizedWidgets = configuredWidgets
              .map((widgetId) => String(widgetId || "").trim().toLowerCase().replace(/[\\s_-]+/g, "-"))
              .filter(Boolean);
            const fallbackWidgets = ["progress", "files", "resources", "cost"];
            const allowedWidgets = new Set(["progress", "cost", "files", "resources", "metronomes", "server-resources", "imagine-resources", "users", "functions", "earnings"]);
            const seen = new Set();
            const widgetIds = (normalizedWidgets.length ? normalizedWidgets : fallbackWidgets)
              .map((widgetId) => {
                if (["project-progress", "scope"].includes(widgetId)) return "progress";
                if (["costs", "cost-observability", "usage"].includes(widgetId)) return "cost";
                if (["file", "workspace-files"].includes(widgetId)) return "files";
                if (["resource", "execution-resources"].includes(widgetId)) return "resources";
                if (["setup", "setup-guide", "project-setup", "setup-recipe"].includes(widgetId)) return "";
                if (["dau", "daily-active-users", "active-users"].includes(widgetId)) return "users";
                if (["function", "server-functions", "function-activity"].includes(widgetId)) return "functions";
                if (["revenue", "payments", "payment-earnings"].includes(widgetId)) return "earnings";
                return widgetId;
              })
              .filter(Boolean)
              .filter((widgetId) => {
                if (!allowedWidgets.has(widgetId)) {
                  return false;
                }
                if (seen.has(widgetId)) {
                  return false;
                }
                seen.add(widgetId);
                return true;
              });
            return widgetIds.length ? widgetIds : fallbackWidgets;
          }

          function renderProjectOverviewWidgetById(widgetId) {
            switch (widgetId) {
              case "progress":
                return renderProjectOverviewProgressWidget();
              case "cost":
                return renderProjectOverviewCostWidget();
              case "files":
                return renderProjectOverviewFilesWidget();
              case "resources":
                return renderProjectOverviewResourcesWidget();
              case "metronomes":
                return renderProjectOverviewMetronomesWidget();
              case "server-resources":
                return renderProjectOverviewServerResourcesWidget();
              case "imagine-resources":
                return renderProjectOverviewImagineWidget();
              case "users":
                return renderProjectOverviewUsersWidget();
              case "functions":
                return renderProjectOverviewFunctionsWidget();
              case "earnings":
                return renderProjectOverviewEarningsWidget();
              default:
                return null;
            }
          }

          function renderProjectOverviewWidgetSection() {
            const widgets = getProjectOverviewDashboardWidgetIds()
              .map(renderProjectOverviewWidgetById)
              .filter(Boolean);
            return React.createElement("div", { className: "playground-project-overview-widget-grid" }, ...widgets);
          }

          function getProjectOverviewReadableText(value) {
            if (value == null) return "";
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
              return String(value).trim();
            }
            if (Array.isArray(value)) {
              return value.map(getProjectOverviewReadableText).filter(Boolean).join("\n").trim();
            }
            if (typeof value === "object") {
              const candidates = [
                value.body,
                value.text,
                value.message,
                value.content,
                value.summary,
                value.description,
                value.note,
                value.update,
                value.markdown,
                value.plainText,
                value.goal,
                value.title,
                value.name,
                value.latestUpdate,
                value.statusUpdate,
                value.scopeUpdate,
                value.projectUpdate,
              ];
              for (const candidate of candidates) {
                const text = getProjectOverviewReadableText(candidate);
                if (text) return text;
              }
            }
            return "";
          }

          function normalizeProjectOverviewLatestUpdateRecord(value) {
            if (value == null) return null;
            if (typeof value === "string") {
              const body = value.trim();
              return body ? { body } : null;
            }
            if (typeof value !== "object" || Array.isArray(value)) {
              return null;
            }
            const body = getProjectOverviewReadableText(
              value.body
                || value.text
                || value.message
                || value.content
                || value.summary
                || value.description
                || value.note
                || value.update
                || value.markdown
                || value.plainText
                || value.goal
                || value.title
                || value.name
                || ""
            );
            const timestamp = String(
              value.updatedAt
                || value.createdAt
                || value.timestamp
                || value.date
                || ""
            ).trim();
            const authorName = String(
              value.authorName
                || value.actorName
                || value.userName
                || value.name
                || value.author?.name
                || value.actor?.name
                || ""
            ).trim();
            const authorAvatarUrl = String(
              value.authorAvatarUrl
                || value.actorAvatarUrl
                || value.avatarUrl
                || value.photoUrl
                || value.author?.avatarUrl
                || value.actor?.avatarUrl
                || ""
            ).trim();
            if (!body && !timestamp && !authorName && !authorAvatarUrl) {
              return null;
            }
            return {
              body,
              timestamp,
              authorName,
              authorAvatarUrl,
            };
          }

          function collectProjectOverviewLatestUpdateRecords() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const summary = selectedProjectSummary && typeof selectedProjectSummary === "object" && !Array.isArray(selectedProjectSummary)
              ? selectedProjectSummary
              : {};
            const rawCandidates = [
              selectedProject?.latestUpdate,
              selectedProject?.statusUpdate,
              selectedProject?.scopeUpdate,
              selectedProject?.projectUpdate,
              metadata.latestUpdate,
              metadata.statusUpdate,
              metadata.scopeUpdate,
              metadata.projectUpdate,
              summary.latestUpdate,
              summary.statusUpdate,
              summary.scopeUpdate,
              summary.projectUpdate,
            ];
            [
              selectedProject?.updates,
              selectedProject?.projectUpdates,
              selectedProject?.statusUpdates,
              selectedProject?.comments,
              metadata.updates,
              metadata.projectUpdates,
              metadata.statusUpdates,
              metadata.comments,
              summary.updates,
              summary.projectUpdates,
              summary.statusUpdates,
            ].forEach((collection) => {
              if (Array.isArray(collection)) {
                collection.forEach((entry) => rawCandidates.push(entry));
              }
            });
            return rawCandidates
              .map(normalizeProjectOverviewLatestUpdateRecord)
              .filter(Boolean)
              .sort((left, right) => {
                const leftTime = Date.parse(left.timestamp || "");
                const rightTime = Date.parse(right.timestamp || "");
                return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
              });
          }

          function getProjectOverviewLatestUpdateTimestamp(...values) {
            for (const value of values) {
              const raw = String(value || "").trim();
              if (!raw) continue;
              const parsed = Date.parse(raw);
              if (Number.isFinite(parsed)) {
                return { timestamp: raw, time: parsed };
              }
            }
            return { timestamp: "", time: 0 };
          }

          function buildProjectOverviewLatestUpdateActivityRecords() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const lead = getProjectOverviewSidebarLead();
            const records = [];
            const pushRecord = (record) => {
              const body = getProjectOverviewReadableText(record?.body);
              if (!body) return;
              records.push({
                body,
                timestamp: String(record?.timestamp || "").trim(),
                time: Number.isFinite(Number(record?.time)) ? Number(record.time) : 0,
                authorName: String(record?.authorName || lead.name || "Project lead").trim(),
                authorAvatarUrl: String(record?.authorAvatarUrl || lead.avatarUrl || "").trim(),
              });
            };

            buildProjectOverviewActivityItems()
              .filter((item) => item?.task || item?.taskId)
              .forEach((item) => {
                const task = item?.task || {};
                const timestampInfo = getProjectOverviewLatestUpdateTimestamp(task.updatedAt, task.createdAt);
                const verb = String(item?.verb || "").trim() || "updated";
                pushRecord({
                  body: [item?.actor || "Agent", verb, "ticket", item?.object || task.title || "Untitled task"].filter(Boolean).join(" "),
                  timestamp: timestampInfo.timestamp,
                  time: timestampInfo.time || Number(item?.time || 0),
                  authorName: item?.actor,
                  authorAvatarUrl: item?.photoUrl,
                });
              });

            Object.values(releasesById || {}).forEach((release) => {
              const name = String(release?.name || release?.title || "").trim();
              if (!name) return;
              const timestampInfo = getProjectOverviewLatestUpdateTimestamp(release.updatedAt, release.createdAt, release.timestamp);
              if (!timestampInfo.time) return;
              const isCreated = String(release?.createdAt || "").trim()
                && String(release?.createdAt || "").trim() === String(release?.updatedAt || "").trim();
              pushRecord({
                body: (isCreated ? "Created milestone " : "Updated milestone ") + name,
                timestamp: timestampInfo.timestamp,
                time: timestampInfo.time,
              });
            });

            const strategyTimestamp = getProjectOverviewLatestUpdateTimestamp(
              metadata.strategyUpdatedAt,
              metadata.missionControlUpdatedAt,
              selectedProjectMissionControl?.updatedAt,
              selectedProjectMissionControl?.createdAt
            );
            if (String(missionControlDocumentDraft || selectedProjectMissionControl?.document || "").trim() && strategyTimestamp.time) {
              pushRecord({
                body: "Updated project strategy",
                timestamp: strategyTimestamp.timestamp,
                time: strategyTimestamp.time,
              });
            }

            const rulesTimestamp = getProjectOverviewLatestUpdateTimestamp(
              metadata.rulesUpdatedAt,
              metadata.projectRulesUpdatedAt,
              selectedProject?.rulesUpdatedAt
            );
            const ruleEntries = typeof splitPlaygroundProjectRuleEntries === "function"
              ? splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules)
              : [];
            if (ruleEntries.length > 0 && rulesTimestamp.time) {
              pushRecord({
                body: "Updated project rules",
                timestamp: rulesTimestamp.timestamp,
                time: rulesTimestamp.time,
              });
            }

            const strategyBrief = typeof normalizePlaygroundProjectStrategyBrief === "function"
              ? normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft)
              : { outcomes: [] };
            const outcomesTimestamp = getProjectOverviewLatestUpdateTimestamp(
              metadata.outcomesUpdatedAt,
              metadata.strategyUpdatedAt,
              metadata.missionControlUpdatedAt,
              selectedProjectMissionControl?.updatedAt
            );
            if (Array.isArray(strategyBrief?.outcomes) && strategyBrief.outcomes.length > 0 && outcomesTimestamp.time) {
              pushRecord({
                body: "Updated project outcomes",
                timestamp: outcomesTimestamp.timestamp,
                time: outcomesTimestamp.time,
              });
            }

            return records.sort((left, right) => (right.time || 0) - (left.time || 0));
          }

          function getProjectOverviewLatestUpdateInfo() {
            const lead = getProjectOverviewSidebarLead();
            const latestRecord = collectProjectOverviewLatestUpdateRecords()
              .map((record) => ({
                ...record,
                body: getProjectOverviewReadableText(record?.body),
                time: Date.parse(String(record?.timestamp || "")),
              }))
              .filter((record) => record.body)
              .concat(buildProjectOverviewLatestUpdateActivityRecords())
              .sort((left, right) => {
                const leftTime = Number.isFinite(left.time) ? left.time : 0;
                const rightTime = Number.isFinite(right.time) ? right.time : 0;
                return rightTime - leftTime;
              })[0] || null;
            const body = getProjectOverviewReadableText(latestRecord?.body);
            if (!body) {
              return null;
            }
            const timestamp = String(latestRecord?.timestamp || "").trim();
            const timeLabel = timestamp && typeof formatRelativeThreadTime === "function"
              ? (formatRelativeThreadTime(timestamp) || "")
              : "";
            const actorName = latestRecord?.authorName || lead.name || "Project lead";
            const actorAvatarUrl = latestRecord?.authorAvatarUrl || lead.avatarUrl || "";
            const progressStats = getProjectOverviewProgressStats();
            const healthLabel = progressStats.scopeCount > 0 && progressStats.completedCount >= progressStats.scopeCount
              ? "Complete"
              : "On track";
            return {
              actorName,
              actorAvatarUrl,
              body,
              healthLabel,
              timeLabel,
            };
          }

          function renderProjectOverviewLatestUpdateSection() {
            const update = getProjectOverviewLatestUpdateInfo();
            const updateBody = getProjectOverviewReadableText(update?.body);
            if (!update || !updateBody) {
              return null;
            }
            return React.createElement("section", { className: "playground-project-overview-latest-update-card" },
              React.createElement("div", { className: "playground-project-overview-latest-update-header" },
                React.createElement("h2", { className: "playground-project-overview-latest-update-title" }, "Latest update"),
                typeof openProjectComposerForEdit === "function"
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-latest-update-button",
                      onClick: () => openProjectComposerForEdit(selectedProject),
                    },
                      React.createElement(SquarePen, { className: "playground-project-overview-latest-update-button-icon", strokeWidth: 1.8 }),
                      React.createElement("span", null, "Update")
                    )
                  : null
              ),
              React.createElement("div", { className: "playground-project-overview-latest-update-meta" },
                React.createElement("span", { className: "playground-project-overview-latest-update-status" },
                  React.createElement(CircleCheckBig, { className: "playground-project-overview-latest-update-status-icon", strokeWidth: 2 }),
                  React.createElement("span", null, update.healthLabel)
                ),
                React.createElement("span", { className: "playground-project-overview-latest-update-author" },
                  renderProjectOverviewSidebarAvatar(update.actorName, update.actorAvatarUrl),
                  React.createElement("span", null, update.actorName)
                ),
                update.timeLabel
                  ? React.createElement("span", { className: "playground-project-overview-latest-update-time" }, update.timeLabel)
                  : null
              ),
              React.createElement("p", { className: "playground-project-overview-latest-update-body" }, updateBody),
              React.createElement("div", { className: "playground-project-overview-latest-update-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-latest-update-icon-button",
                  "aria-label": "Comment on latest update",
                }, React.createElement(MessageCircle, { className: "playground-project-overview-latest-update-icon", strokeWidth: 1.8 })),
                React.createElement("button", {
                  type: "button",
                  className: "playground-project-overview-latest-update-icon-button",
                  "aria-label": "React to latest update",
                }, React.createElement(Plus, { className: "playground-project-overview-latest-update-icon", strokeWidth: 1.8 }))
              )
            );
          }

          function renderProjectOverviewGeneralGoalSection() {
            const goalText = getProjectOverviewReadableText(projectOverviewDraft?.description || projectOverviewGoal);
            return React.createElement("section", { className: "playground-project-overview-general-goal" },
              React.createElement("h2", { className: "playground-project-overview-general-goal-title" }, "Project Goal"),
              React.createElement("p", {
                className: "playground-project-overview-general-goal-text" + (goalText ? "" : " is-empty"),
              }, goalText || "No project goal set yet.")
            );
          }

          function openProjectOverviewResourceRow(row) {
            if (row?.kind === "template") {
              openProjectOverviewTemplate(row.template || row.record || {});
              return;
            }
            const type = String(row?.type || "").trim();
            if (type === "file" || type === "imagine") {
              const record = row?.record || {};
              const normalizedPath = normalizeHistoryPath(row?.path || record?.sourcePath || record?.workspacePath || record?.path || "");
              if (normalizedPath && typeof navigateProjectOverviewFileToFiles === "function") {
                navigateProjectOverviewFileToFiles({
                  ...record,
                  path: normalizedPath,
                  title: row?.title || getHistoryPathName(normalizedPath) || "Untitled file",
                  environmentId: record?.environmentId || activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                  projectId: normalizedSelectedProjectId,
                });
                return;
              }
            }
            if (typeof setProjectOverviewHomeTab === "function") {
              setProjectOverviewHomeTab("resources");
            }
            if (typeof setProjectOverviewFilesSubview === "function") {
              const meta = getProjectOverviewResourceTypeMeta(type);
              setProjectOverviewFilesSubview(meta.subview || "resources");
            }
          }

          function openProjectOverviewTemplate(template) {
            if (typeof onOpenResourceTemplatesPage === "function") {
              onOpenResourceTemplatesPage({
                type: template?.type || "all",
                templateId: template?.id || "",
              });
            }
          }

          function renderProjectOverviewTemplateCard(template) {
            const Icon = getProjectOverviewResourceTemplateIcon(template?.type);
            return React.createElement("button", {
                key: String(template?.id || template?.title || ""),
                type: "button",
                className: "playground-project-resource-template-card",
                onClick: () => openProjectOverviewTemplate(template),
              },
              React.createElement("span", { className: "playground-project-resource-template-card-icon" },
                React.createElement(Icon, { width: 17, height: 17, strokeWidth: 1.9 })
              ),
              React.createElement("span", { className: "playground-project-resource-template-card-title" }, template?.title || "Template"),
              React.createElement("span", { className: "playground-project-resource-template-card-copy" }, template?.summary || template?.description || "Publish this template to the project.")
            );
          }

          function openProjectOverviewNewResource(type) {
            const normalizedType = String(type || "").trim();
            if (!normalizedType) {
              return;
            }
            if (typeof setProjectOverviewResourceToolbarPopover === "function") {
              setProjectOverviewResourceToolbarPopover("");
            }
            if (normalizedType === "file") {
              const normalizedProjectId = String(selectedProjectId || "").trim();
              const normalizedEnvironmentId = String(
                selectedProject?.defaultEnvironmentId
                || activeProjectAttachmentEnvironmentId
                || ""
              ).trim();
              if (typeof onOpenFilesPage === "function") {
                onOpenFilesPage({
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                  projectId: normalizedProjectId,
                  environmentId: normalizedEnvironmentId,
                });
              }
              return;
            }
            if (typeof setProjectOverviewHomeTab === "function") {
              setProjectOverviewHomeTab("resources");
            }
            if (typeof setProjectOverviewFilesSubview === "function") {
              const meta = getProjectOverviewResourceTypeMeta(normalizedType);
              setProjectOverviewFilesSubview(meta.subview || "resources");
            }
          }

          function renderProjectOverviewRecommendedTemplatesEmptyState() {
            return React.createElement("div", { className: "playground-project-resources-empty has-templates" },
              React.createElement("div", { className: "playground-project-resource-template-grid" },
                projectOverviewRecommendedTemplates.map((template) => renderProjectOverviewTemplateCard(template))
              ),
              React.createElement("div", { className: "playground-project-resource-template-actions" },
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "small",
                  className: "playground-project-resource-template-browse-button",
                  onClick: () => typeof onOpenResourceTemplatesPage === "function" && onOpenResourceTemplatesPage({ type: "all" }),
                },
                  React.createElement(Layers, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "All Templates")
                )
              )
            );
          }

          function renderProjectOverviewResourceNewMenuItems() {
            const resourceTypes = projectOverviewResourceTypeFilters.filter((type) => String(type?.id || "") !== "all");
            return React.createElement(React.Fragment, null,
              resourceTypes.map((type) => {
                const meta = getProjectOverviewResourceTypeMeta(type.id);
                const Icon = meta.Icon || Layers;
                return React.createElement("button", {
                    key: type.id,
                    type: "button",
                    className: "tb-popup-row playground-project-team-menu-item",
                    onClick: () => openProjectOverviewNewResource(type.id),
                  },
                  React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, type.label || meta.label || type.id)
                );
              }),
              React.createElement("div", { className: "playground-project-resources-menu-divider" }),
              React.createElement("button", {
                  type: "button",
                  className: "tb-popup-row playground-project-team-menu-item",
                  onClick: () => {
                    if (typeof setProjectOverviewResourceToolbarPopover === "function") {
                      setProjectOverviewResourceToolbarPopover("");
                    }
                    if (typeof onOpenResourceTemplatesPage === "function") {
                      onOpenResourceTemplatesPage({ type: "all" });
                    }
                  },
                },
                React.createElement(Layers, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Templates")
              )
            );
          }

          function renderProjectOverviewResourceFilterMenu() {
            if (projectOverviewResourceToolbarPopover !== "filter") {
              return null;
            }
            return React.createElement(PlatformPopupSurface, {
                className: "playground-tasks-toolbar-popup-menu playground-project-resources-filter-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                onClick: (event) => event.stopPropagation(),
              },
              projectOverviewResourceTypeFilters.map((type) =>
                renderProjectOverviewTaskToolbarOption({
                  option: { id: type.id, label: type.label || type.id },
                  active: String(projectOverviewResourceFilter || "all") === String(type.id),
                  onClick: () => {
                    setProjectOverviewResourceFilter(String(type.id || "all"));
                    if (typeof setProjectOverviewResourceToolbarPopover === "function") {
                      setProjectOverviewResourceToolbarPopover("");
                    }
                  },
                })
              )
            );
          }

          function getProjectOverviewResourceRowMenuId(row) {
            return "resource:" + String(row?.key || row?.id || row?.path || row?.title || "").trim();
          }

          function closeProjectOverviewResourceMenu() {
            if (typeof setProjectOverviewResourceMenuId === "function") {
              setProjectOverviewResourceMenuId("");
            }
          }

          function getProjectOverviewResourceRowEnvironmentId(row) {
            return String(
              row?.record?.environmentId
              || row?.environmentId
              || selectedProject?.defaultEnvironmentId
              || activeProjectAttachmentEnvironmentId
              || ""
            ).trim();
          }

          function getProjectOverviewResourceRowPath(row) {
            return normalizeHistoryPath(
              row?.path
              || row?.record?.sourcePath
              || row?.record?.workspacePath
              || row?.record?.path
              || ""
            );
          }

          async function removeProjectOverviewTemplateResource(row) {
            const rowKey = String(row?.key || "").trim();
            const templateId = String(
              row?.record?.templateId
              || row?.record?.id
              || row?.template?.templateId
              || row?.template?.id
              || ""
            ).trim();
            const nextTemplates = projectOverviewPublishedTemplates.filter((item, index) => {
              const itemTemplateId = String(item?.templateId || item?.id || "").trim();
              if (templateId) {
                return itemTemplateId !== templateId;
              }
              return "template:" + (itemTemplateId || String(item?.type || "file").trim() + ":" + index) !== rowKey;
            });
            await persistProjectOverviewSidebarProjectUpdate({}, { resourceTemplates: nextTemplates });
          }

          async function removeProjectOverviewAttachmentResource(row) {
            const rowAttachmentId = String(row?.record?.id || row?.id || "").trim();
            const rowPath = getProjectOverviewResourceRowPath(row);
            const rowEnvironmentId = getProjectOverviewResourceRowEnvironmentId(row);
            const currentAttachments = normalizePlaygroundTaskAttachmentList(projectOverviewDraft?.attachments || selectedProject?.attachments);
            const nextAttachments = currentAttachments.filter((attachment) => {
              const attachmentId = String(attachment?.id || "").trim();
              const attachmentEnvironmentId = String(attachment?.environmentId || "").trim();
              const attachmentPath = normalizeHistoryPath(attachment?.sourcePath || attachment?.workspacePath || attachment?.path || "");
              if (rowAttachmentId && attachmentId === rowAttachmentId) {
                return false;
              }
              if (rowPath && attachmentPath === rowPath && (!rowEnvironmentId || !attachmentEnvironmentId || attachmentEnvironmentId === rowEnvironmentId)) {
                return false;
              }
              return true;
            });
            await persistProjectOverviewSidebarProjectUpdate(
              { attachments: nextAttachments },
              { attachments: nextAttachments }
            );
          }

          async function removeProjectOverviewFileActivityResource(row) {
            const rowPath = getProjectOverviewResourceRowPath(row);
            const rowEnvironmentId = getProjectOverviewResourceRowEnvironmentId(row);
            const suppressedFileKey = normalizedSelectedProjectId && rowEnvironmentId && rowPath
              ? normalizedSelectedProjectId + "\u0000" + rowEnvironmentId + "\u0000" + rowPath
              : "";
            if (!suppressedFileKey) {
              setProjectOverviewFileActivityState?.((current) => ({
                ...current,
                items: (Array.isArray(current?.items) ? current.items : []).filter((item) => {
                  if (row?.record?.id && item?.id === row.record.id) {
                    return false;
                  }
                  const itemPath = normalizeHistoryPath(item?.path || item?.sourcePath || item?.workspacePath || "");
                  return !(rowPath && itemPath === rowPath);
                }),
              }));
              return;
            }
            const nextDeletedFileKeys = Array.from(new Set(
              (Array.isArray(selectedProjectOverviewDeletedFileKeys) ? selectedProjectOverviewDeletedFileKeys : [])
                .concat([suppressedFileKey])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            )).slice(-250);
            setProjectOverviewSuppressedFileKeys?.(nextDeletedFileKeys);
            setProjectOverviewFileActivityState?.((current) => ({
              ...current,
              items: (Array.isArray(current?.items) ? current.items : []).filter((item) => {
                const itemEnvironmentId = String(item?.environmentId || "").trim();
                const itemPath = normalizeHistoryPath(item?.path || item?.sourcePath || item?.workspacePath || "");
                return !(itemEnvironmentId === rowEnvironmentId && itemPath === rowPath);
              }),
            }));
            await persistProjectOverviewSidebarProjectUpdate({}, { projectOverviewDeletedFileKeys: nextDeletedFileKeys });
          }

          async function removeProjectOverviewRuntimeResource(row) {
            const resourceId = String(row?.record?.id || row?.id || "").trim();
            if (!resourceId) {
              return;
            }
            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            const response = await fetch(backendUrl + "/servers/" + encodeURIComponent(resourceId), {
              method: "PATCH",
              headers,
              body: JSON.stringify({ projectId: null }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to remove resource from project.");
            }
            setProjectOverviewServerResourcesState?.((current) => ({
              ...current,
              status: current?.status || "ready",
              error: "",
              items: (Array.isArray(current?.items) ? current.items : []).filter((item) => String(item?.id || "") !== resourceId),
            }));
          }

          async function handleRemoveProjectOverviewResourceFromProject(row) {
            const kind = String(row?.kind || "").trim();
            closeProjectOverviewResourceMenu();
            try {
              if (kind === "template") {
                await removeProjectOverviewTemplateResource(row);
              } else if (kind === "attachment") {
                await removeProjectOverviewAttachmentResource(row);
              } else if (kind === "file") {
                await removeProjectOverviewFileActivityResource(row);
              } else if (kind === "runtime") {
                await removeProjectOverviewRuntimeResource(row);
              }
            } catch (error) {
              if (typeof window !== "undefined") {
                window.alert(error instanceof Error ? error.message : "Failed to remove resource from project.");
              }
            }
          }


          function isProjectOverviewFileResourceRow(row) {
            return row?.kind === "attachment" || row?.kind === "file";
          }

          function buildProjectOverviewFileIconEntry(row) {
            const record = row?.record && typeof row.record === "object" ? row.record : {};
            const path = normalizeHistoryPath(
              row?.path
              || record.path
              || record.sourcePath
              || record.workspacePath
              || ""
            );
            const name = String(
              record.filename
              || record.name
              || record.title
              || row?.title
              || getHistoryPathName(path)
              || "Untitled file"
            ).trim();
            const rawMimeType = String(
              record.mimeType
              || record.contentType
              || record.fileType
              || (/[/]/.test(String(record.type || "")) ? record.type : "")
              || ""
            ).trim();
            return {
              name: name || getHistoryPathName(path) || "Untitled file",
              path,
              isFolder: Boolean(record.isFolder || record.type === "folder" || record.mimeType === "inode/directory"),
              mimeType: rawMimeType,
            };
          }

          function renderProjectOverviewResourceIcon(row, Icon) {
            if (isProjectOverviewFileResourceRow(row) && typeof PlaygroundFileIcon === "function") {
              const record = row?.record && typeof row.record === "object" ? row.record : {};
              const iconEntry = buildProjectOverviewFileIconEntry(row);
              const iconEnvironmentId = String(
                record.environmentId
                || row?.environmentId
                || activeProjectAttachmentEnvironmentId
                || selectedProject?.defaultEnvironmentId
                || ""
              ).trim();
              return React.createElement("span", { className: "playground-project-resource-title-icon is-file" },
                React.createElement(PlaygroundFileIcon, {
                  entry: iconEntry,
                  environmentId: iconEnvironmentId,
                  backendUrl,
                  useThumbnail: true,
                })
              );
            }
            const ResourceIcon = Icon || Layers;
            return React.createElement("span", { className: "playground-project-resource-title-icon" },
              React.createElement(ResourceIcon, { width: 16, height: 16, strokeWidth: 1.8 })
            );
          }

          function readProjectOverviewResourceCreatorString(record, keys = []) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
            if (!source) return "";
            for (const key of keys) {
              const value = source[key];
              if (typeof value === "string" && value.trim()) return value.trim();
              if (typeof value === "number" && Number.isFinite(value)) return String(value);
            }
            return "";
          }

          function readProjectOverviewResourceCreatorObject(record, keys = []) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
            if (!source) return null;
            for (const key of keys) {
              const value = source[key];
              if (value && typeof value === "object" && !Array.isArray(value)) return value;
            }
            return null;
          }

          function getProjectOverviewResourceAgentAvatarUrl(agent) {
            const rawAvatarUrl = String(
              (typeof getPlaygroundAgentProfilePhotoUrl === "function"
                ? getPlaygroundAgentProfilePhotoUrl(agent)
                : "")
              || agent?.profilePhotoUrl
              || agent?.avatarUrl
              || agent?.photoUrl
              || ""
            ).trim();
            return typeof normalizeSessionPhotoUrl === "function"
              ? normalizeSessionPhotoUrl(rawAvatarUrl)
              : rawAvatarUrl;
          }

          function findProjectOverviewResourceCreatorAgent(agentId, creatorName = "") {
            const agents = Array.isArray(sortedAgents) ? sortedAgents : [];
            const normalizedAgentId = String(agentId || "").trim().toLowerCase();
            const normalizedCreatorName = String(creatorName || "").trim().toLowerCase();
            if (normalizedAgentId) {
              const match = agents.find((agent) => {
                const candidateIds = [
                  agent?.id,
                  agent?.agentId,
                  agent?.agent_id,
                  agent?.slug,
                ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
                return candidateIds.includes(normalizedAgentId);
              });
              if (match) return match;
            }
            if (normalizedCreatorName) {
              return agents.find((agent) => String(agent?.name || agent?.displayName || "").trim().toLowerCase() === normalizedCreatorName) || null;
            }
            return null;
          }

          function isProjectOverviewCurrentUserCreator(creator) {
            const values = [
              creator?.id,
              creator?.userId,
              creator?.email,
              creator?.name,
            ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
            if (!values.length) return false;
            const currentValues = [
              currentUserEmail,
              currentUserName,
            ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
            return currentValues.some((value) => values.includes(value));
          }

          function getProjectOverviewResourceCreator(row) {
            const record = row?.record && typeof row.record === "object" && !Array.isArray(row.record) ? row.record : {};
            const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
            const definition = record.definition && typeof record.definition === "object" && !Array.isArray(record.definition) ? record.definition : {};
            const sources = [row, record, metadata, definition].filter((source) => source && typeof source === "object" && !Array.isArray(source));
            const creator = sources
              .map((source) => readProjectOverviewResourceCreatorObject(source, ["creator", "createdBy", "created_by", "author", "actor", "owner", "user"]))
              .find(Boolean) || {};
            const rawCreatedBy = sources
              .map((source) => readProjectOverviewResourceCreatorString(source, ["createdBy", "created_by", "author", "actor", "owner"]))
              .find(Boolean) || "";
            const rawType = readProjectOverviewResourceCreatorString(creator, ["type", "kind", "creatorType", "creator_type", "role"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorType", "creator_type", "createdByType", "created_by_type", "authorType", "actorType"])).find(Boolean)
              || "";
            const agentId = readProjectOverviewResourceCreatorString(creator, ["agentId", "agent_id"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorAgentId", "creator_agent_id", "createdByAgentId", "created_by_agent_id", "authorAgentId", "actorAgentId", "agentId", "agent_id"])).find(Boolean)
              || "";
            const userId = readProjectOverviewResourceCreatorString(creator, ["userId", "user_id"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorUserId", "creator_user_id", "createdByUserId", "created_by_user_id", "authorUserId", "actorUserId", "userId", "user_id"])).find(Boolean)
              || "";
            const id = readProjectOverviewResourceCreatorString(creator, ["id"])
              || agentId
              || userId
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorId", "creator_id", "createdById", "created_by_id", "authorId", "actorId"])).find(Boolean)
              || rawCreatedBy;
            const email = readProjectOverviewResourceCreatorString(creator, ["email"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorEmail", "creator_email", "createdByEmail", "created_by_email", "authorEmail", "actorEmail", "email"])).find(Boolean)
              || "";
            const rawName = readProjectOverviewResourceCreatorString(creator, ["name", "displayName", "display_name", "label", "email"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorName", "creator_name", "createdByName", "created_by_name", "createdByLabel", "created_by_label", "authorName", "actorName", "ownerName", "userName", "actor"])).find(Boolean)
              || (!agentId && !userId ? rawCreatedBy : "");
            const rawAvatarUrl = readProjectOverviewResourceCreatorString(creator, ["photoUrl", "photoURL", "avatarUrl", "avatarURL", "avatar", "picture"])
              || sources.map((source) => readProjectOverviewResourceCreatorString(source, ["creatorAvatarUrl", "creator_avatar_url", "creatorPhotoUrl", "creator_photo_url", "createdByAvatarUrl", "created_by_avatar_url", "authorAvatarUrl", "actorAvatarUrl", "ownerAvatarUrl", "avatarUrl", "photoUrl", "picture"])).find(Boolean)
              || "";
            const normalizedType = String(rawType || "").trim().toLowerCase();
            const type = normalizedType.includes("agent")
              ? "agent"
              : normalizedType.includes("user") || normalizedType.includes("human") || normalizedType.includes("person")
                ? "user"
                : agentId
                  ? "agent"
                  : userId || email
                    ? "user"
                    : "";
            const agent = type === "agent" || agentId
              ? findProjectOverviewResourceCreatorAgent(agentId || id, rawName)
              : null;
            if (agent) {
              return {
                type: "agent",
                id: String(agent?.id || agentId || id || "").trim(),
                agentId: String(agent?.id || agentId || "").trim(),
                userId: "",
                email: String(agent?.email || email || "").trim(),
                name: String(agent?.name || agent?.displayName || rawName || "Agent").trim(),
                avatarUrl: getProjectOverviewResourceAgentAvatarUrl(agent) || rawAvatarUrl,
              };
            }
            const normalizedCreator = {
              type: type || "user",
              id,
              agentId,
              userId,
              email,
              name: rawName || email || "Me",
              avatarUrl: rawAvatarUrl,
            };
            if (isProjectOverviewCurrentUserCreator(normalizedCreator) || (!rawName && !email && !userId && !agentId && !id)) {
              return {
                ...normalizedCreator,
                type: "user",
                name: "Me",
                avatarUrl: currentUserAvatarUrl || normalizedCreator.avatarUrl || "",
              };
            }
            return normalizedCreator;
          }

          function renderProjectOverviewResourceCreatorAvatar(creator) {
            const name = String(creator?.name || "Me").trim();
            const avatarUrl = String(creator?.avatarUrl || "").trim();
            if (avatarUrl && (typeof canRenderAvatarImage !== "function" || canRenderAvatarImage(avatarUrl))) {
              return React.createElement("img", {
                className: "playground-project-resources-creator-avatar playground-project-resources-creator-avatar-image",
                src: avatarUrl,
                alt: name || "Creator",
                draggable: false,
              });
            }
            return React.createElement("span", { className: "playground-project-resources-creator-avatar" },
              React.createElement("span", { className: "playground-project-resources-creator-avatar-fallback" },
                getProjectOverviewSidebarInitials(name || "Me")
              )
            );
          }

          function renderProjectOverviewResourceCreator(row) {
            const creator = getProjectOverviewResourceCreator(row);
            const name = String(creator?.name || "Me").trim() || "Me";
            return React.createElement("div", {
                className: "playground-project-resources-creator",
                title: creator?.email ? name + " · " + creator.email : name,
              },
              renderProjectOverviewResourceCreatorAvatar({ ...creator, name }),
              React.createElement("span", { className: "playground-project-resources-creator-name" }, name)
            );
          }


          function renderProjectOverviewResourcesHome() {
            return React.createElement(PlaygroundSharedResourcesTab, {
              rows: projectOverviewResourceRows,
              allRows: projectOverviewAllResourceRows,
              searchQuery: projectOverviewResourceSearchQuery,
              onSearchQueryChange: setProjectOverviewResourceSearchQuery,
              toolbarPopover: projectOverviewResourceToolbarPopover,
              onToolbarPopoverChange: setProjectOverviewResourceToolbarPopover,
              filter: projectOverviewResourceFilter,
              onFilterChange: setProjectOverviewResourceFilter,
              typeFilters: projectOverviewResourceTypeFilters,
              viewMode: "list",
              menuId: projectOverviewResourceMenuId,
              onMenuIdChange: setProjectOverviewResourceMenuId,
              getTypeMeta: getProjectOverviewResourceTypeMeta,
              getRowMenuId: getProjectOverviewResourceRowMenuId,
              renderIcon: (row, meta) => renderProjectOverviewResourceIcon(row, meta?.Icon || Layers),
              renderCreator: renderProjectOverviewResourceCreator,
              getRowActions: (row) => [{
                id: "remove",
                label: "Remove from project",
                icon: Trash2,
                danger: true,
                onSelect: () => handleRemoveProjectOverviewResourceFromProject(row),
              }],
              renderNewMenuItems: renderProjectOverviewResourceNewMenuItems,
              renderEmptyContent: renderProjectOverviewRecommendedTemplatesEmptyState,
              onRowOpen: openProjectOverviewResourceRow,
              searchAriaLabel: "Search project resources",
              useCentralSearch: true,
              useCentralNewSelector: true,
              useCentralFilterPopup: true,
              toolbarTitle: "All Resources",
              showViewToggle: false,
              emptyLabel: "No resources yet.",
              noMatchesLabel: "No resources match this view yet.",
            });
          }

          function shouldShowProjectOverviewGeneralEmptyState() {
            const progressStats = getProjectOverviewProgressStats();
            const hasTasks = progressStats.scopeCount > 0
              || normalizedOverviewTasks.length > 0
              || Number(selectedProjectSummary?.tasksCount || 0) > 0
              || Number(selectedProjectSummary?.openTasksCount || 0) > 0;
            const hasThreads = projectThreads.length > 0
              || Number(selectedProjectSummary?.threadsCount || 0) > 0;
            const hasActivity = buildProjectOverviewActivityItems().length > 0;
            const hasMissionControlDocument = Boolean(
              String(missionControlDocumentDraft || selectedProjectMissionControl?.document || "").trim()
              || String(selectedProjectMissionControl?.summary || "").trim()
            );
            return !hasTasks
              && !hasThreads
              && !hasActivity
              && !projectHasCostData
              && !hasMissionControlDocument;
          }

          function renderProjectOverviewGeneralEmptyState() {
            const isMissionControlRunning = typeof isSelectedProjectMissionControlRunning !== "undefined"
              && Boolean(isSelectedProjectMissionControlRunning);
            const canOpenMissionControl = typeof openMissionControlComposer === "function";
            return React.createElement("section", { className: "playground-project-overview-general-empty-state" },
              React.createElement("div", {
                  className: "playground-settings-usage-chart-empty is-tall playground-auth-users-empty-state playground-configure-usage-empty-state playground-project-overview-general-empty-content",
                },
                React.createElement("img", {
                  className: "playground-auth-users-empty-state-image",
                  src: "/img/empty-state/no-agent-usage.avif",
                  alt: "",
                  "aria-hidden": "true",
                  draggable: "false",
                }),
                React.createElement("div", { className: "playground-auth-users-empty-state-title" }, "Kick off this project"),
                React.createElement("div", { className: "playground-auth-users-empty-state-copy" },
                  "Run Mission Control to generate the first strategy, backlog, and next steps for this project."
                ),
                React.createElement("div", { className: "playground-project-overview-general-empty-action" },
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "button",
                    className: "playground-tasks-empty-primary-button playground-project-overview-general-empty-button",
                    disabled: !canOpenMissionControl || isMissionControlRunning,
                    onClick: () => {
                      if (canOpenMissionControl) {
                        openMissionControlComposer({ keepStrategyOpen: true });
                      }
                    },
                  },
                    isMissionControlRunning
                      ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 2, className: "playground-files-state-loader" })
                      : React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 2 }),
                    React.createElement("span", null, isMissionControlRunning ? "Running Mission Control" : "Run Mission Control")
                  )
                )
              )
            );
          }

          function renderProjectOverviewGeneralPanel() {
            if (shouldShowProjectOverviewGeneralEmptyState()) {
              return React.createElement("div", { className: "playground-project-overview-general-grid" },
                renderProjectOverviewGeneralEmptyState()
              );
            }
            return React.createElement("div", { className: "playground-project-overview-general-grid" },
              renderProjectOverviewProgressUsageChartSection(),
              renderProjectOverviewActivitySection(),
              renderProjectOverviewSetupSection(),
              renderProjectOverviewThreadsSection()
            );
          }

          function renderProjectOverviewResourcesPanel() {
            if (isProjectOverviewResourceSubviewOpen) {
              return React.createElement("div", { className: "playground-tasks-project-panel-grid" },
                renderProjectOverviewFilesTab(),
                renderProjectOverviewFileMenu()
              );
            }
            return renderProjectOverviewResourcesHome();
          }

          function getProjectOverviewSidebarInitials(value) {
            const words = String(value || "")
              .trim()
              .split(/\s+/)
              .filter(Boolean);
            if (!words.length) return "P";
            return words
              .slice(0, 2)
              .map((word) => word.charAt(0).toUpperCase())
              .join("");
          }

          function getProjectOverviewSidebarLead() {
            if (typeof getProjectListLead === "function") {
              const lead = getProjectListLead(selectedProject);
              return {
                id: String(lead?.id || lead?.userId || lead?.email || "").trim(),
                name: String(lead?.name || "Unassigned").trim() || "Unassigned",
                email: String(lead?.email || "").trim(),
                avatarUrl: String(lead?.avatarUrl || "").trim(),
              };
            }
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const metadataLead = metadata?.lead && typeof metadata.lead === "object" && !Array.isArray(metadata.lead)
              ? metadata.lead
              : {};
            const name = String(
              selectedProject?.leadName
                || metadata.leadName
                || metadataLead.name
                || metadataLead.displayName
                || "Unassigned"
            ).trim();
            const avatarUrl = String(
              selectedProject?.leadAvatarUrl
                || metadata.leadAvatarUrl
                || metadataLead.avatarUrl
                || metadataLead.photoUrl
                || ""
            ).trim();
            return {
              id: String(selectedProject?.leadUserId || metadata.leadUserId || metadataLead.userId || metadataLead.id || metadata.leadEmail || "").trim(),
              name: name || "Unassigned",
              email: String(selectedProject?.leadEmail || metadata.leadEmail || metadataLead.email || "").trim(),
              avatarUrl,
            };
          }

          function renderProjectOverviewSidebarAvatar(name, avatarUrl) {
            if (avatarUrl && (typeof canRenderAvatarImage !== "function" || canRenderAvatarImage(avatarUrl))) {
              return React.createElement("img", {
                className: "playground-project-overview-sidebar-avatar",
                src: avatarUrl,
                alt: name || "Project lead",
                draggable: false,
              });
            }
            return React.createElement("span", { className: "playground-project-overview-sidebar-avatar" },
              getProjectOverviewSidebarInitials(name || "Project lead")
            );
          }

          function getProjectOverviewSidebarStatusLabel() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const explicitStatus = String(selectedProject?.status || selectedProject?.state || metadata.status || "").trim();
            if (explicitStatus) {
              return explicitStatus.charAt(0).toUpperCase() + explicitStatus.slice(1).replace(/[_-]+/g, " ");
            }
            const progressStats = getProjectOverviewProgressStats();
            if (progressStats.scopeCount > 0 && progressStats.completedCount >= progressStats.scopeCount) {
              return "Completed";
            }
            if (progressStats.startedCount > 0) {
              return "In progress";
            }
            return "Backlog";
          }

          function getProjectOverviewSidebarPriorityLabel() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const priority = String(selectedProject?.priority || metadata.priority || "").trim();
            if (!priority) return "Medium";
            return priority.charAt(0).toUpperCase() + priority.slice(1).replace(/[_-]+/g, " ");
          }

          function getProjectOverviewSidebarDateLabel(value) {
            const raw = String(value || "").trim();
            if (!raw) return "";
            if (typeof formatPlaygroundFileDate === "function") {
              return formatPlaygroundFileDate(raw) || raw;
            }
            const timestamp = Date.parse(raw);
            if (!Number.isFinite(timestamp)) return raw;
            try {
              return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(timestamp));
            } catch {
              return raw;
            }
          }

          function getProjectOverviewSidebarMetadata(project = selectedProject) {
            return project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
              ? project.metadata
              : {};
          }

          function getProjectOverviewSidebarDateInputValue(value) {
            const raw = String(value || "").trim();
            if (!raw) return "";
            const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}/);
            if (isoMatch) return isoMatch[0];
            const timestamp = Date.parse(raw);
            if (!Number.isFinite(timestamp)) return "";
            try {
              return new Date(timestamp).toISOString().slice(0, 10);
            } catch {
              return "";
            }
          }

          function getProjectOverviewSidebarStatusValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            const raw = String(projectOverviewDraft?.status || projectOverviewDraft?.state || metadata.status || "backlog")
              .trim()
              .toLowerCase()
              .replace(/[\s-]+/g, "_");
            if (["done", "finished", "complete"].includes(raw)) return "completed";
            if (["doing", "active"].includes(raw)) return "in_progress";
            return ["backlog", "in_progress", "on_track", "at_risk", "blocked", "completed"].includes(raw) ? raw : "backlog";
          }

          function getProjectOverviewSidebarPriorityValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            const raw = String(projectOverviewDraft?.priority || metadata.priority || "medium").trim().toLowerCase();
            return PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === raw) ? raw : "medium";
          }

          function getProjectOverviewSidebarProjectTypeValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            return String(projectOverviewDraft?.projectType || projectOverviewDraft?.type || metadata.projectType || metadata.blueprintId || "blank").trim() || "blank";
          }

          function getProjectOverviewSidebarEnvironmentValue() {
            const metadata = getProjectOverviewSidebarMetadata(projectOverviewDraft);
            return String(projectOverviewDraft?.defaultEnvironmentId || metadata.defaultEnvironmentId || activeProjectAttachmentEnvironmentId || "").trim();
          }

          function commitProjectOverviewSidebarProjectRecord(projectRecord) {
            if (!projectRecord?.id || typeof commitLocalProjectRecord !== "function") {
              return;
            }
            const normalizedProjectRecord = normalizePlaygroundProjectRecord(projectRecord);
            if (typeof setProjectDraft === "function") {
              setProjectDraft((current) => {
                if (!current || String(current.id || "") !== String(normalizedProjectRecord.id || "")) {
                  return current;
                }
                return normalizePlaygroundProjectRecord({
                  ...current,
                  ...normalizedProjectRecord,
                  metadata: {
                    ...(current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata) ? current.metadata : {}),
                    ...(normalizedProjectRecord.metadata && typeof normalizedProjectRecord.metadata === "object" && !Array.isArray(normalizedProjectRecord.metadata) ? normalizedProjectRecord.metadata : {}),
                  },
                });
              });
            }
            commitLocalProjectRecord(normalizedProjectRecord, {
              summary: normalizedProjectRecord.summary || selectedProjectSummary,
              environments: selectedProjectEnvironments,
              recentThreads: selectedProjectRecentThreads,
              threads: selectedProjectRecentThreads,
              selectImmediately: true,
            });
          }
`;
