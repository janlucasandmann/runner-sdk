          function renderAuthGate() {
            if (
              sessionState.status === "loading"
              || sessionState.status === "unauthenticated"
              || sessionState.status === "error"
            ) {
              return React.createElement(PlaygroundAppLoadingScreen, {
                label: sessionState.status === "loading"
                  ? "Agentic Compute Platform"
                  : "Redirecting to sign in...",
              });
            }
            return React.createElement(PlaygroundAppLoadingScreen, {
              label: "Agentic Compute Platform",
            });
          }
  
          function renderWelcomeProjectPickerModal() {
            if (!welcomeProjectPickerOpen) {
              return null;
            }
  
            const selectedProjectId = String(welcomeProjectPickerValue || welcomeWidgetsState.projectId || latestInteractedProjectId || "").trim();
            const availableProjects = welcomeProjectPickerProjects;
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim playground-thread-home-project-picker-scrim",
                onClick: closeWelcomeProjectPickerDialog,
              },
                React.createElement(PlatformModalSurface, {
                  className: "sidebar-thread-rename-modal playground-thread-home-project-picker-modal",
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-label": "Choose project",
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "playground-thread-home-project-picker-title" }, "Project"),
                  React.createElement("div", { className: "playground-thread-home-project-picker-body" },
                    welcomeProjectPickerLoading
                      ? React.createElement("div", { className: "playground-thread-home-project-picker-loading" },
                          React.createElement("span", { className: "playground-thread-home-project-picker-spinner", "aria-hidden": "true" }),
                          React.createElement("span", null, "Loading projects...")
                        )
                      : availableProjects.length > 0
                        ? React.createElement(React.Fragment, null,
                          availableProjects.map((project) => {
                            const projectId = String(project?.id || "").trim();
                            const isSelected = projectId === selectedProjectId;
                            return React.createElement("button", {
                                key: projectId,
                                type: "button",
                                className: "playground-thread-home-project-picker-row" + (isSelected ? " is-selected" : ""),
                                onClick: () => handleWelcomeProjectSelection(project),
                              },
                                React.createElement(Folder, { className: "playground-thread-home-project-picker-icon", strokeWidth: 1.8, "aria-hidden": "true" }),
                                React.createElement("span", { className: "playground-thread-home-project-picker-label" }, project?.name || "Untitled Project"),
                                React.createElement("span", { className: "playground-thread-home-project-picker-check-slot" },
                                  isSelected
                                    ? React.createElement(Check, { className: "playground-thread-home-project-picker-check", strokeWidth: 1.8, "aria-hidden": "true" })
                                    : null
                                )
                              );
                          })
                        )
                        : React.createElement("div", { className: "playground-thread-home-project-picker-empty" },
                          "No projects are available yet."
                        ),
                    welcomeProjectPickerError
                      ? React.createElement("div", { className: "playground-thread-home-project-picker-error" }, welcomeProjectPickerError)
                      : null
                  )
                )
              );
          }
  
          function renderInitialThreadWelcome(section = "before") {
  	          const currentWelcomeProject = welcomeWidgetProject || null;
  	          const welcomeProjectHeaderTitle = currentWelcomeProject?.name || (welcomeWidgetsState.status === "loading" ? "Loading Project" : "Projects");
  	          const welcomeProjectWallpaper = getPlaygroundProjectWallpaperConfig(currentWelcomeProject || welcomeProjectHeaderTitle, 0);
  	          const welcomeProjectSummary = currentWelcomeProject?.summary && typeof currentWelcomeProject.summary === "object"
  	            ? currentWelcomeProject.summary
  	            : {};
  	          const welcomeProjectTaskRecords = (Array.isArray(welcomeWidgetsState.tasks) ? welcomeWidgetsState.tasks : [])
  	            .map((task) => normalizePlaygroundTaskRecord(task))
  	            .filter((task) => task?.id);
  	          const welcomeProjectFallbackOpenTasks = welcomeProjectTaskRecords
  	            .filter((task) => String(task.status || "").trim() !== "done")
  	            .length;
  	          const welcomeProjectTotalTasks = Math.max(
  	            0,
  	            Number(welcomeProjectSummary.tasksCount || 0),
  	            welcomeProjectTaskRecords.length
  	          );
  	          const welcomeProjectOpenTasks = welcomeProjectTotalTasks > 0
  	            ? Math.min(
  	                welcomeProjectTotalTasks,
  	                Math.max(
  	                  0,
  	                  Number(welcomeProjectSummary.openTasksCount || 0),
  	                  welcomeProjectFallbackOpenTasks
  	                )
  	              )
  	            : 0;
  	          const welcomeProjectWidgetProps = {
  	            title: welcomeProjectHeaderTitle,
  	            wallpaperUrl: welcomeProjectWallpaper.url,
  	            hasProject: Boolean(currentWelcomeProject),
  	            openTaskCount: welcomeProjectOpenTasks,
  	            totalTaskCount: welcomeProjectTotalTasks,
  	            onSwitchProject: currentWelcomeProject ? openWelcomeProjectPickerDialog : undefined,
  	            onEditProject: currentWelcomeProject
  	              ? () => handleWelcomeWidgetOpen("backlog", { projectComposerAction: "edit" })
  	              : undefined,
  	          };
  
  	          function renderWelcomeProjectTaskRow(item) {
  	            const taskRecord = normalizePlaygroundTaskRecord(item.task);
  	            const taskId = String(taskRecord.id || item.id || "").trim();
  	            const ticketNumber = welcomeWidgetTicketNumbersById[taskId] || taskRecord.ticketNumber || item.ticketNumber || "000";
  	            const openTask = (event) => {
  	              event?.preventDefault?.();
  	              event?.stopPropagation?.();
  	              handleOpenWelcomeWidgetTaskDetail(taskRecord, event);
              };
  
  	            return React.createElement(PlatformProjectWidgetTask, {
  	                key: taskId || ticketNumber,
  	                title: taskRecord.title || item.label || "Untitled Task",
  	                ticketNumber,
  	                complete: taskRecord.status === "done",
  	                priority: renderPlaygroundTaskPriorityIcon(taskRecord.priority, "playground-thread-widget-tasks-item-priority"),
  	                onOpen: openTask,
  	              });
  	          }
  
            let welcomeProjectTaskListContent = null;
            if (welcomeWidgetsState.status === "loading" && welcomeWidgetTaskRows.length === 0) {
              welcomeProjectTaskListContent = React.createElement(PlatformProjectWidget, welcomeProjectWidgetProps,
                React.createElement(PlatformProjectWidgetEmpty, null, "Loading project tasks...")
              );
            } else if (welcomeWidgetsState.status === "error") {
              welcomeProjectTaskListContent = React.createElement(PlatformProjectWidget, welcomeProjectWidgetProps,
                React.createElement(PlatformProjectWidgetEmpty, null, welcomeWidgetsState.error || "Failed to load project tasks.")
              );
            } else if (!currentWelcomeProject) {
              welcomeProjectTaskListContent = React.createElement(PlatformProjectWidget, welcomeProjectWidgetProps,
                React.createElement(PlatformProjectWidgetEmptyState, {
                  kind: "projects",
                  title: "Create your first project",
                  description: "Projects help orchestrate complex work across your agents.",
                  action: React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "button",
                      className: "playground-tasks-empty-primary-button",
                      onClick: (event) => {
                        event.stopPropagation();
                        handleWelcomeWidgetCreateProject();
                      },
                    },
                      React.createElement(Plus, { width: 12, height: 12, strokeWidth: 2, "aria-hidden": "true" }),
                      React.createElement("span", null, "New Project")
                    ),
                })
              );
            } else if (welcomeWidgetTaskRows.length === 0) {
              welcomeProjectTaskListContent = React.createElement(PlatformProjectWidget, welcomeProjectWidgetProps,
                React.createElement(PlatformProjectWidgetEmptyState, {
                  kind: "backlog",
                  title: "Backlog is empty",
                  description: "Create or generate tasks to move your project forward.",
                  action: React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "button",
                      className: "playground-tasks-empty-primary-button",
                      onClick: (event) => {
                        event.stopPropagation();
                        handleWelcomeWidgetRunMissionControl();
                      },
                    },
                      React.createElement(Rocket, { width: 12, height: 12, strokeWidth: 2, "aria-hidden": "true" }),
                      React.createElement("span", null, "Mission Control")
                    ),
                })
              );
            } else {
              welcomeProjectTaskListContent = React.createElement(PlatformProjectWidget, {
                  ...welcomeProjectWidgetProps,
                  "aria-label": "Open project backlog",
                  onActivate: () => handleWelcomeWidgetOpen("backlog"),
                },
                React.createElement(PlatformProjectWidgetTaskList, null,
                  welcomeWidgetTaskRows.map((item) => renderWelcomeProjectTaskRow(item))
                )
              );
            }
  
            const latestWelcomeThreads = recentThreadItems
              .slice()
              .filter((thread) => !thread?.isScheduled)
              .sort(compareThreadsByRecent)
              .slice(0, 3);
  
            const getWelcomeThreadWorkspaceLabel = (thread) => {
              const safeThread = normalizeThreadItem(thread);
              const taskPreview = getThreadTaskPreview(safeThread);
              const missionControlMetadata = getThreadMissionControlMetadata(safeThread);
              const normalizedThreadId = String(safeThread?.id || "").trim();
              const cachedProjectContext = normalizedThreadId ? (threadProjectContextById[normalizedThreadId] || null) : null;
              const projectId = String(
                taskPreview?.projectId
                || missionControlMetadata?.projectId
                || safeThread?.projectId
                || cachedProjectContext?.projectId
                || ""
              ).trim();
              const cachedProjectRecord = projectId ? (threadProjectRecordsById[projectId] || null) : null;
              const listedProjectRecord = projectId
                ? (realProjects.find((project) => project?.id === projectId) || null)
                : null;
              const projectName = String(
                cachedProjectRecord?.name
                || listedProjectRecord?.name
                || (projectId && currentWelcomeProject?.id === projectId ? currentWelcomeProject?.name : "")
                || cachedProjectContext?.projectName
                || taskPreview?.projectName
                || missionControlMetadata?.projectName
                || safeThread?.projectName
                || ""
              ).trim();
              if (projectName) {
                return projectName;
              }
  
              const environmentId = String(
                taskPreview?.environmentId
                || safeThread?.environmentId
                || ""
              ).trim();
              const environmentName = String(
                taskPreview?.environmentName
                || safeThread?.environmentName
                || (environmentId ? runtimeEnvironments.find((environment) => environment?.id === environmentId)?.name : "")
                || ""
              ).trim();
              return environmentName || "Workspace";
            };
  
            const getWelcomeThreadStatusPresentation = (thread) => {
              const normalizedStatus = String(thread?.status || "").trim().toLowerCase();
              if (thread?.isScheduled) {
                return {
                  label: "Upcoming",
                  className: "playground-thread-welcome-thread-status is-upcoming",
                };
              }
              if (isPendingPermissionThreadDisplayStatus(normalizedStatus)) {
                return {
                  label: "Permission asked",
                  className: "playground-thread-welcome-thread-status is-permission",
                };
              }
              if (isActiveThreadDisplayStatus(normalizedStatus) || normalizedStatus.includes("progress") || normalizedStatus.includes("work") || normalizedStatus.includes("stream")) {
                return {
                  label: "In Progress",
                  className: "playground-thread-welcome-thread-status is-running",
                };
              }
              return {
                label: "Done",
                className: "playground-thread-welcome-thread-status is-done",
              };
            };
  
            const welcomeLatestThreadsContent = latestWelcomeThreads.length
              ? React.createElement("div", { className: "playground-thread-welcome-thread-grid" },
                  latestWelcomeThreads.map((thread) => {
                    const safeThread = normalizeThreadItem(thread);
                    const titleParts = getSidebarThreadTitleParts(safeThread);
                    const threadTitle = titleParts.displayThreadTitle || safeThread.title || "Untitled thread";
                    const statusPresentation = getWelcomeThreadStatusPresentation(safeThread);
                    const threadWorkspaceName = getWelcomeThreadWorkspaceLabel(safeThread);
                    const threadLastActivityText = formatThreadSearchTimestamp(resolveThreadSortTimestamp(safeThread)) || "Recently updated";
  
                    return React.createElement("button", {
                      key: safeThread.id,
                      type: "button",
                      className: "playground-thread-welcome-thread-card",
                      onClick: () => handleThreadSelect(safeThread.id),
                    },
                      React.createElement("div", { className: "playground-thread-welcome-thread-card-top" },
                        React.createElement("span", { className: statusPresentation.className }, statusPresentation.label),
                        React.createElement(ChevronRight, { className: "playground-thread-welcome-thread-arrow", strokeWidth: 2 })
                      ),
                      React.createElement("h3", { className: "playground-thread-welcome-thread-title" }, threadTitle),
                      React.createElement("div", { className: "playground-thread-welcome-thread-meta" },
                        threadWorkspaceName,
                        React.createElement("span", { className: "thread-search-footer-separator" }, "•"),
                        threadLastActivityText
                      )
                    );
                  })
                )
              : null;
  
            const usageTotals = settingsUsageSummary?.totals || {};
            const welcomeTotalUsedCT = Math.max(
              0,
              Number(settingsUsageDashboard?.totalUsedCT || 0),
              readSettingsComputeTokens(usageTotals, "totalCT", "totalCost")
            );
            const usageByDay = Array.isArray(settingsUsageSummary?.byDay) ? settingsUsageSummary.byDay : [];
            const usageByDayMap = new Map();
            usageByDay.forEach((day) => {
              if (!day?.date) {
                return;
              }
              usageByDayMap.set(String(day.date).slice(0, 10), {
                agentCT: readSettingsComputeTokens(day, "agentCT", "agentCost"),
                environmentCT: readSettingsComputeTokens(day, "environmentCT", "environmentCost"),
              });
            });
            const periodStart = settingsUsageSummary?.startDate ? new Date(settingsUsageSummary.startDate) : null;
            const periodEnd = settingsUsageSummary?.endDate ? new Date(settingsUsageSummary.endDate) : null;
            const hasValidUsagePeriod = Boolean(
              periodStart
              && periodEnd
              && !Number.isNaN(periodStart.getTime())
              && !Number.isNaN(periodEnd.getTime())
              && periodEnd.getTime() > periodStart.getTime()
            );
            const welcomeUsageDailyData = [];
            if (hasValidUsagePeriod) {
              const dayCount = Math.max(1, Math.min(31, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000))));
              for (let index = 0; index < dayCount; index += 1) {
                const date = new Date(periodStart);
                date.setDate(date.getDate() + index);
                const dateKey = date.toISOString().slice(0, 10);
                const dayData = usageByDayMap.get(dateKey) || {};
                welcomeUsageDailyData.push({
                  date: dateKey,
                  agentCT: Math.max(0, Number(dayData.agentCT || 0)),
                  environmentCT: Math.max(0, Number(dayData.environmentCT || 0)),
                });
              }
            } else {
              usageByDay.slice(-31).forEach((day) => {
                const dateKey = typeof day?.date === "string" ? day.date.slice(0, 10) : "";
                if (!dateKey) {
                  return;
                }
                welcomeUsageDailyData.push({
                  date: dateKey,
                  agentCT: readSettingsComputeTokens(day, "agentCT", "agentCost"),
                  environmentCT: readSettingsComputeTokens(day, "environmentCT", "environmentCost"),
                });
              });
            }
            const welcomeUsageAgentValues = welcomeUsageDailyData.map((day) => Math.max(0, Number(day.agentCT || 0)));
            const welcomeUsageResourceValues = welcomeUsageDailyData.map((day) => Math.max(0, Number(day.environmentCT || 0)));
            const hasWelcomeUsageData = welcomeUsageAgentValues.concat(welcomeUsageResourceValues).some((value) => value > 0);
            const welcomeFallbackTierInfo = {
              id: "sandbox",
              name: "Sandbox",
              monthlyPrice: 0,
              computeTokens: 100,
            };
            const welcomeTierInfo = SETTINGS_PLAN_CATALOG.find((tier) => tier.id === settingsCurrentTierId) || welcomeFallbackTierInfo;
            const welcomeIncludedQuotaCT = Math.max(
              settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["includedCredits", "includedTierQuota"])),
              settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["tierQuota"])),
              Number(welcomeTierInfo.computeTokens || welcomeFallbackTierInfo.computeTokens)
            );
            const welcomeTopUpBalanceCT = Math.max(0, settingsDollarsToComputeTokens(readSettingsUsdAmount(settingsBudgetStatus, ["topUpBalance", "topUpCredits"])));
            const welcomeTotalBudgetCT = Math.max(1, welcomeIncludedQuotaCT + welcomeTopUpBalanceCT);
            const welcomeRemainingCT = Math.max(0, welcomeTotalBudgetCT - welcomeTotalUsedCT);
            const welcomeRemainingPercentage = clampSettingsPercentage((welcomeRemainingCT / welcomeTotalBudgetCT) * 100);
            const welcomeRemainingPercentageLabel = Math.round(welcomeRemainingPercentage) + "%";
            const welcomeRemainingStyleValue = welcomeRemainingPercentage.toFixed(2) + "%";
            const welcomeUsageIsFull = welcomeRemainingPercentage >= 100;
            const welcomeUsageCombinedValues = welcomeUsageDailyData.map((day) =>
              Math.max(0, Number(day.agentCT || 0) + Number(day.environmentCT || 0))
            );
            const welcomeUsageMeterBarCount = 24;
            const welcomeUsageRecentValues = welcomeUsageCombinedValues.slice(-welcomeUsageMeterBarCount);
            const welcomeUsagePaddedValues = Array.from({
              length: Math.max(0, welcomeUsageMeterBarCount - welcomeUsageRecentValues.length),
            }, () => 0).concat(welcomeUsageRecentValues);
            const welcomeUsageMeterMaxValue = Math.max(1, ...welcomeUsagePaddedValues);
            const welcomeUsageFallbackHeights = [30, 38, 44, 32, 50, 62, 46, 58, 36, 70, 48, 64, 40, 54, 76, 42, 60, 34, 52, 66, 44, 58, 36, 72];
            const welcomeUsageMeterBars = welcomeUsagePaddedValues.map((value, index) => {
              if (!hasWelcomeUsageData) {
                return welcomeUsageFallbackHeights[index % welcomeUsageFallbackHeights.length];
              }
              return Math.max(18, Math.min(86, 18 + (Math.max(0, Number(value || 0)) / welcomeUsageMeterMaxValue) * 68));
            });
  
  	          const welcomeTodayWidget = React.createElement(PlatformCalendarWidget, {
  	            initialDateKey: toPlaygroundDateInputValue(new Date()),
  	            buildView: (selectedDateKey) => buildPlaygroundWelcomeCalendarWidgetView(
  	              selectedDateKey,
  	              welcomeWidgetsState.schedules,
  	              welcomeWidgetProject,
  	              welcomeWidgetsState.tasks,
  	              welcomeWidgetTicketNumbersById
  	            ),
  	            onOpenCalendar: () => handleWelcomeWidgetOpen("calendar"),
  	            onOpenDailyBriefingPreview: handleOpenWelcomeDailyBriefingPreview,
            });
            const welcomeUsageWidget = platformHasCapability("commercialUsageLimits")
              ? React.createElement(PlatformUsageWidget, {
                "aria-label": "Open usage cost details",
                onActivate: () => openSettingsModal("costs-overview"),
                percentageLabel: welcomeRemainingPercentageLabel,
                caption: settingsUsageLoading && welcomeTotalUsedCT === 0
                  ? "Loading"
                  : formatSettingsComputeTokens(welcomeRemainingCT) + " left",
                remaining: welcomeRemainingStyleValue,
                meterBars: welcomeUsageMeterBars,
                full: welcomeUsageIsFull,
              })
              : null;
  
            const welcomeIntro = React.createElement("div", { className: "playground-thread-welcome playground-thread-welcome-intro" },
              React.createElement("div", { className: "playground-thread-welcome-copy" },
                React.createElement("h1", { className: "playground-thread-welcome-title" }, initialThreadGreeting)
              )
            );
  
            const welcomeAfterComposer = React.createElement("div", { className: "playground-thread-welcome playground-thread-welcome-sections" },
              React.createElement("div", {
                className: "playground-thread-home-dashboard"
                  + (platformHasCapability("commercialUsageLimits") ? "" : " is-without-commercial-usage"),
              },
                React.createElement("section", { className: "playground-thread-home-section playground-thread-home-project-column" },
                  welcomeProjectTaskListContent
                ),
                React.createElement("aside", { className: "playground-thread-home-section playground-thread-home-calendar-column", "aria-label": "Calendar" },
                  welcomeTodayWidget
                ),
                welcomeUsageWidget
                  ? React.createElement("aside", { className: "playground-thread-home-section playground-thread-home-usage-column", "aria-label": "Usage credits" },
                      welcomeUsageWidget
                    )
                  : null
              )
            );
  
            return section === "after" ? welcomeAfterComposer : welcomeIntro;
          }
  
          function renderDemoFeaturePage(pageId) {
            const pageConfig = (() => {
              switch (pageId) {
                case "tasks":
                  return {
                    title: "Projects",
                    copy: "Plan milestones, assign work to agents, and keep mission control close to the execution flow.",
                    cards: [
                      { icon: Rocket, title: "Mission Control", copy: "Turn rough ideas into strategy, backlog structure, and next-run guidance." },
                      { icon: ListTodo, title: "Backlog", copy: "Track tickets, priorities, dependencies, and ownership without leaving ACP." },
                      { icon: CalendarIcon, title: "Schedules", copy: "Automate recurring work, reviews, and follow-up threads." },
                    ],
                  };
                case "files":
                  return {
                    title: "Files",
                    copy: "Unify workspace files, connected sources, and generated assets in one browser.",
                    cards: [
                      { icon: FolderOpen, title: "Workspace", copy: "Browse source trees, generated outputs, and supporting artifacts." },
                      { icon: Globe, title: "Connected Sources", copy: "Blend GitHub, Drive, Notion, and OneDrive into active work." },
                      { icon: MessageSquare, title: "File Chat", copy: "Ask agents to inspect, summarize, or modify files with context." },
                    ],
                  };
                case "environments":
                  return {
                    title: "Environments",
                    copy: "Start computers, deploy resources, and keep runtime state attached to the work it supports.",
                    cards: [
                      { icon: HardDrive, title: "Computers", copy: "Give agents real runtimes for code, browsing, and execution." },
                      { icon: Server, title: "Resources", copy: "Provision apps, functions, auth, and databases from the same shell." },
                      { icon: Cpu, title: "Runtime Control", copy: "Track status, usage, and environment actions without leaving ACP." },
                    ],
                  };
                case "agents":
                  return {
                    title: "Agents",
                    copy: "Specialize instructions, models, skills, and environments for each role in the platform.",
                    cards: [
                      { icon: Bot, title: "Role-based setup", copy: "Keep research, coding, design, and ops behavior separate and reusable." },
                      { icon: Sparkles, title: "Model routing", copy: "Blend managed models and BYOM endpoints under the same selector." },
                      { icon: Layers, title: "Skill stacks", copy: "Attach the right tools and custom skills to each agent." },
                    ],
                  };
                case "skills":
                  return {
                    title: "Skills",
                    copy: "Package reusable capabilities so agents know how to operate inside your stack.",
                    cards: [
                      { icon: Layers, title: "System skills", copy: "Ship web search, PDF handling, task management, and app-platform workflows." },
                      { icon: Wand2, title: "Custom skills", copy: "Define organization-specific instructions and reuse them across agents." },
                      { icon: Shield, title: "Controlled access", copy: "Scope skills to the workspaces and agents that actually need them." },
                    ],
                  };
                default:
                  return {
                    title: "Agentic Compute Platform Demo",
                    copy: "This seeded walkthrough shows the ACP shell, workflow structure, and execution model without touching a live account.",
                    cards: [
                      { icon: Sparkles, title: "Threads", copy: "See how prompts, working logs, and outcomes stay together." },
                      { icon: HardDrive, title: "Resources", copy: "Understand how ACP connects agents to infrastructure and files." },
                      { icon: Bot, title: "Agents", copy: "Inspect how role, model, and skill configuration shape execution." },
                    ],
                  };
              }
            })();
  
            return React.createElement("div", { className: "playground-demo-page" },
              React.createElement("div", { className: "playground-demo-page-header" },
                React.createElement("div", { className: "playground-demo-page-kicker" }, "Interactive Demo"),
                React.createElement("h2", { className: "playground-demo-page-title" }, pageConfig.title),
                React.createElement("p", { className: "playground-demo-page-copy" }, pageConfig.copy)
              ),
              React.createElement("div", { className: "playground-demo-card-grid" },
                pageConfig.cards.map((card) =>
                  React.createElement("div", { key: card.title, className: "playground-demo-card" },
                    React.createElement("div", { className: "playground-demo-card-icon" },
                      React.createElement(card.icon, { strokeWidth: 1.8 })
                    ),
                    React.createElement("div", null,
                      React.createElement("h3", { className: "playground-demo-card-title" }, card.title),
                      React.createElement("p", { className: "playground-demo-card-copy" }, card.copy)
                    )
                  )
                )
              ),
              React.createElement("div", { className: "playground-demo-callout" },
                React.createElement("div", { className: "playground-demo-callout-copy" },
                  React.createElement("p", { className: "playground-demo-callout-title" }, "Demo mode is read-only"),
                  React.createElement("p", { className: "playground-demo-callout-text" }, "Use this walkthrough to understand the platform structure, then sign in to run real threads, configure agents, and connect live resources.")
                ),
                React.createElement("div", { className: "playground-demo-callout-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-demo-action",
                    onClick: handleSignInWithComputerAgents,
                  }, "Sign in to continue"),
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    className: "playground-demo-action-secondary",
                    onClick: () => {
                      setActivePage("thread");
                      setCurrentThreadId(SEEDED_DEMO_THREAD_ID);
                      setContentMode("chat");
                    },
                  }, "Open demo thread")
                )
              )
            );
          }
  
          function renderDemoThreadChatSurface() {
            if (!currentThreadId) {
              return React.createElement("div", { className: "playground-demo-thread-shell" },
                React.createElement("div", { className: "playground-demo-thread-header" },
                  React.createElement("div", { className: "playground-demo-thread-kicker" }, "ACP Demo"),
                  React.createElement("h2", { className: "playground-demo-thread-title" }, "Start with a clean workspace"),
                  React.createElement("p", { className: "playground-demo-thread-copy" }, "This demo opens the same way a fresh ACP workspace should feel: no existing chats in the sidebar, just a clean shell ready for agents, environments, files, and projects.")
                ),
                React.createElement("div", { className: "playground-demo-card-grid" },
                  [
                    { icon: MessageSquare, title: "Thread-first work", copy: "Every run keeps prompts, actions, files, and outputs together." },
                    { icon: Bot, title: "Agent-driven execution", copy: "Threads inherit instructions, models, skills, and environments." },
                    { icon: HardDrive, title: "Runtime attached", copy: "Agents can work inside computers and connected resources instead of only chat." },
                  ].map((card) =>
                    React.createElement("div", { key: card.title, className: "playground-demo-card" },
                      React.createElement("div", { className: "playground-demo-card-icon" },
                        React.createElement(card.icon, { strokeWidth: 1.8 })
                      ),
                      React.createElement("div", null,
                        React.createElement("h3", { className: "playground-demo-card-title" }, card.title),
                        React.createElement("p", { className: "playground-demo-card-copy" }, card.copy)
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-demo-thread-composer" },
                  React.createElement("div", { className: "playground-demo-thread-composer-copy" },
                    React.createElement("p", { className: "playground-demo-thread-composer-title" }, "Fresh workspace preview"),
                    React.createElement("p", { className: "playground-demo-thread-composer-text" }, "Use the sidebar to inspect the shell, or open one seeded demo thread when you want to see logs, tool calls, and output in context.")
                  ),
                  React.createElement("div", { className: "playground-demo-callout-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      className: "playground-demo-action-secondary",
                      onClick: () => {
                        setCurrentThreadId(SEEDED_DEMO_THREAD_ID);
                        setContentMode("chat");
                      },
                    }, "Open demo thread"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-demo-action",
                      onClick: handleSignInWithComputerAgents,
                    }, "Sign in to run ACP")
                  )
                )
              );
            }
  
            const demoExperience = getDemoThreadExperience(selectedKnownThread);
            const demoEvents = Array.isArray(demoExperience?.events) ? demoExperience.events : [];
  
            return React.createElement("div", { className: "playground-demo-thread-shell" },
              React.createElement("div", { className: "playground-demo-thread-header" },
                React.createElement("div", { className: "playground-demo-thread-kicker" }, "Demo Thread"),
                React.createElement("h2", { className: "playground-demo-thread-title" }, selectedThreadTitle || "Seeded ACP thread"),
                React.createElement("p", { className: "playground-demo-thread-copy" }, demoExperience.summary),
                React.createElement("div", { className: "playground-demo-thread-badges" },
                  React.createElement("div", { className: "playground-demo-thread-badge is-strong" },
                    React.createElement(Bot, { strokeWidth: 1.8 }),
                    React.createElement("span", null, demoExperience.agent)
                  ),
                  React.createElement("div", { className: "playground-demo-thread-badge" },
                    React.createElement(Cpu, { strokeWidth: 1.8 }),
                    React.createElement("span", null, demoExperience.model)
                  ),
                  React.createElement("div", { className: "playground-demo-thread-badge" },
                    React.createElement(Sparkles, { strokeWidth: 1.8 }),
                    React.createElement("span", null, "Runtime: " + demoExperience.runtime)
                  ),
                  React.createElement("div", { className: "playground-demo-thread-badge" },
                    React.createElement(HardDrive, { strokeWidth: 1.8 }),
                    React.createElement("span", null, demoExperience.environment)
                  )
                )
              ),
              React.createElement("div", { className: "playground-demo-thread-timeline" },
                demoEvents.map((entry, index) => {
                  const Icon = entry.kind === "tool"
                    ? Terminal
                    : entry.kind === "message"
                      ? MessageSquare
                      : entry.kind === "user"
                        ? ArrowUpRight
                        : Sparkles;
                  return React.createElement("div", {
                      key: entry.title + ":" + index,
                      className: "playground-demo-thread-entry is-" + entry.kind,
                    },
                    React.createElement("div", { className: "playground-demo-thread-entry-header" },
                      React.createElement(Icon, { strokeWidth: 1.8 }),
                      React.createElement("span", { className: "playground-demo-thread-entry-title" }, entry.title)
                    ),
                    React.createElement("div", { className: "playground-demo-thread-entry-body" },
                      React.createElement(ReactMarkdown, {
                        remarkPlugins: [remarkGfm, remarkPlaygroundSoftbreaksToBreaks],
                        rehypePlugins: [rehypeRaw],
                        components: playgroundMarkdownComponents,
                      }, String(entry.body || ""))
                    )
                  );
                })
              ),
              React.createElement("div", { className: "playground-demo-thread-composer" },
                React.createElement("div", { className: "playground-demo-thread-composer-copy" },
                  React.createElement("p", { className: "playground-demo-thread-composer-title" }, "Ready to try this on your own workspace?"),
                  React.createElement("p", { className: "playground-demo-thread-composer-text" }, "Sign in to create real threads, connect models, attach environments, and watch live tool output stream in.")
                ),
                React.createElement("button", {
                  type: "button",
                  className: "playground-demo-action",
                  onClick: handleSignInWithComputerAgents,
                }, "Sign in to continue")
              )
            );
          }
  
          function renderDemoThreadChangesSurface() {
            const demoExperience = getDemoThreadExperience(selectedKnownThread);
            const changes = Array.isArray(demoExperience?.changes) ? demoExperience.changes : [];
            return React.createElement("div", { className: "playground-demo-changes-shell" },
              React.createElement("div", { className: "playground-demo-page-header" },
                React.createElement("div", { className: "playground-demo-page-kicker" }, "Demo Changes"),
                React.createElement("h2", { className: "playground-demo-page-title" }, selectedThreadTitle || "Seeded change history"),
                React.createElement("p", { className: "playground-demo-page-copy" }, "ACP normally streams real step history here. In demo mode, this surface previews how changes, files, and execution output stay attached to the thread.")
              ),
              React.createElement("div", { className: "playground-demo-changes-list" },
                changes.map((entry, index) =>
                  React.createElement("div", { key: entry.path + ":" + index, className: "playground-demo-change-entry" },
                    React.createElement(FileText, { strokeWidth: 1.8 }),
                    React.createElement("div", null,
                      React.createElement("p", { className: "playground-demo-change-path" }, entry.path),
                      React.createElement("p", { className: "playground-demo-change-copy" }, entry.copy)
                    )
                  )
                )
              ),
              React.createElement("div", { className: "playground-demo-callout" },
                React.createElement("div", { className: "playground-demo-callout-copy" },
                  React.createElement("p", { className: "playground-demo-callout-title" }, "Live runs keep much richer detail"),
                  React.createElement("p", { className: "playground-demo-callout-text" }, "Signed-in threads stream real tool starts, tool results, file diffs, and resource previews into this pane.")
                ),
                React.createElement("div", { className: "playground-demo-callout-actions" },
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    className: "playground-demo-action-secondary",
                    onClick: () => setContentMode("chat"),
                  }, "Back to thread"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-demo-action",
                    onClick: handleSignInWithComputerAgents,
                  }, "Sign in to run live")
                )
              )
            );
          }
  
  ${METRONOME_APP_SCRIPT_FRAGMENTS.runTraceView}
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.threadList}
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.searchModal}
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.notificationsPopup}
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.accountMenu}
  
  ${CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS.notificationActions}
  ${CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS.notificationsSection}
  
  ${TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation}
  ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.topNavigation}
  ${CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.topNavigation}
  ${MODELS_APP_SCRIPT_FRAGMENTS.topNavigation}${MARKETPLACE_APP_SCRIPT_FRAGMENTS.topNavigation}${GUARDRAILS_APP_SCRIPT_FRAGMENTS.topNavigation}${TESTS_APP_SCRIPT_FRAGMENTS.topNavigation}${KNOWLEDGE_APP_SCRIPT_FRAGMENTS.topNavigation}${ASSURANCE_APP_SCRIPT_FRAGMENTS.topNavigation}${EVALUATIONS_APP_SCRIPT_FRAGMENTS.topNavigation}${FINE_TUNING_APP_SCRIPT_FRAGMENTS.topNavigation}${INFERENCE_APP_SCRIPT_FRAGMENTS.topNavigation}${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.topNavigation}
  ${API_KEYS_APP_SCRIPT_FRAGMENTS.topNavigation}
  ${SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation}
  ${EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.topNavigation}
          function renderResourcesPageNav() {
            const isResourcesDetailView = resourcesHeaderState.mode === "detail";
            const activeDevelopServerPageItem = activeResourcesView === "servers"
              ? getDevelopServerPageItem(activeResourcesServerKind)
              : null;
            const resourcesOverviewTitle = activeResourcesView === "servers"
              ? (activeDevelopServerPageItem?.label || "Servers")
              : activeResourcesView === "computers"
                ? "Computers"
                : "Agents";
            const isConfigureResourcesPage = !activeDevelopServerPageItem;
            const isComputerResourcesDetailView = isResourcesDetailView
              && activeResourcesView === "computers"
              && resourcesHeaderState.resourceType === "computer";
            const isDatabaseResourcesDetailView = isResourcesDetailView
              && activeResourcesView === "servers"
              && resourcesHeaderState.resourceType === "database";
            const isSourceDeployableResourcesDetailView = isResourcesDetailView
              && activeResourcesView === "servers"
              && isSourceDeployablePlaygroundServerKind(activeResourcesServerKind)
              && resourcesHeaderState.resourceType === "server";
            const isAuthenticationResourcesDetailView = isResourcesDetailView
              && activeResourcesView === "servers"
              && activeResourcesServerKind === "auth"
              && resourcesHeaderState.resourceType === "server";
            const isAgentRuntimeResourcesDetailView = isResourcesDetailView
              && activeResourcesView === "servers"
              && activeResourcesServerKind === "agent_runtime"
              && resourcesHeaderState.resourceType === "server";
            const isSecretsResourcesDetailView = isResourcesDetailView
              && activeResourcesView === "servers"
              && activeResourcesServerKind === "secrets"
              && resourcesHeaderState.resourceType === "server";
            const isPaymentsResourcesDetailView = isResourcesDetailView
              && activeResourcesView === "servers"
              && activeResourcesServerKind === "payments"
              && resourcesHeaderState.resourceType === "server";
            const isManagedServerResourcesDetailView = isSourceDeployableResourcesDetailView
              || isAuthenticationResourcesDetailView
              || isAgentRuntimeResourcesDetailView
              || isSecretsResourcesDetailView
              || isPaymentsResourcesDetailView;
            const isVersionedDevelopResource = activeResourcesView === "servers"
              && isSourceDeployablePlaygroundServerKind(activeResourcesServerKind);
            const returnToResourcesOverview = () => openResourcesView(activeResourcesView, {
              forceOverview: true,
              preserveSidebarMode: true,
              serverKind: activeResourcesServerKind,
            });
            const resourcesDetailVersionLabel = (
              (
                activeResourcesView === "agents"
                || activeResourcesView === "computers"
                || isVersionedDevelopResource
              )
              && resourcesHeaderState.versionNumber !== null
              && resourcesHeaderState.versionNumber !== undefined
            )
              ? React.createElement(PlatformVersionLabel, {
                    version: resourcesHeaderState.versionNumber,
                    qualifier: resourcesHeaderState.versionIsLatest ? "Latest" : null,
                    className: "agent-breadcrumb-version-label",
                    disabled: Boolean(resourcesHeaderState.versionBusy),
                    "aria-label": "Open " + (
                      activeResourcesView === "computers"
                        ? "computer"
                        : activeResourcesView === "agents"
                          ? "agent"
                          : activeResourcesServerKind === "function"
                            ? "function"
                            : activeResourcesServerKind === "api"
                              ? "API"
                              : "web app"
                    ) + " version history",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (typeof resourcesHeaderState.onVersionClick === "function") {
                        resourcesHeaderState.onVersionClick();
                      }
                    },
                  })
              : null;
            const resourcesDetailTitleActions = activeResourcesView === "agents"
              ? React.createElement("span", {
                  id: "playground-agent-title-actions",
                  className: "playground-agent-title-actions-root",
                })
              : activeResourcesView === "computers"
                ? React.createElement("span", {
                    id: "playground-computer-title-actions",
                    className: "playground-agent-title-actions-root playground-computer-title-actions-root",
                  })
              : isDatabaseResourcesDetailView
                ? React.createElement("span", {
                    id: "playground-database-title-actions",
                    className: "playground-database-title-actions-root",
                  })
                : isManagedServerResourcesDetailView
                  ? React.createElement("span", {
                      id: "playground-server-title-actions",
                      className: "playground-server-title-actions-root",
                    })
                  : null;
            const resourcesDetailPathItem = {
              label: resourcesHeaderState.title || "Resource",
              trailing: resourcesDetailVersionLabel || resourcesDetailTitleActions
                ? React.createElement(React.Fragment, null,
                    resourcesDetailVersionLabel,
                    resourcesDetailTitleActions
                  )
                : null,
            };
            const resourcesPathItems = activeDevelopServerPageItem
              ? (
                  isResourcesDetailView
                    ? [
                        { label: "Develop" },
                        {
                          label: resourcesOverviewTitle,
                          onClick: returnToResourcesOverview,
                        },
                        resourcesDetailPathItem,
                      ]
                    : [{ label: "Develop" }, { label: resourcesOverviewTitle }]
                )
              : (
                  isResourcesDetailView
                    ? [
                        ...(isConfigureResourcesPage ? [{ label: "Configure" }] : []),
                        {
                          label: resourcesOverviewTitle,
                          onClick: returnToResourcesOverview,
                        },
                        resourcesDetailPathItem,
                      ]
                    : [
                        ...(isConfigureResourcesPage ? [{ label: "Configure" }] : []),
                        { label: resourcesOverviewTitle },
                      ]
                );
  
            return renderAppHeader({
              className: "playground-resources-page",
              pathItems: resourcesPathItems,
              center: isResourcesDetailView && activeResourcesView === "agents"
                ? React.createElement("div", {
                    className: "playground-agent-detail-header-center",
                  },
                    React.createElement(PlatformSwitch, {
                      className: "playground-agent-detail-header-switch",
                      value: ["general", "insights", "settings"].includes(resourcesHeaderState.activeSection)
                        ? resourcesHeaderState.activeSection
                        : "general",
                      options: [
                        { value: "general", label: "General" },
                        { value: "insights", label: "Insights" },
                        { value: "settings", label: "Settings" },
                      ],
                      onValueChange: (nextSection) => {
                        if (typeof resourcesHeaderState.onSectionChange === "function") {
                          resourcesHeaderState.onSectionChange(nextSection);
                        }
                      },
                      ariaLabel: "Agent section",
                    })
                  )
                  : isComputerResourcesDetailView
                    ? React.createElement(PlatformSwitch, {
                        className: "playground-computer-detail-header-switch",
                        value: ["general", "runtime", "settings"].includes(resourcesHeaderState.activeSection)
                          ? resourcesHeaderState.activeSection
                          : "general",
                        options: [
                          { value: "general", label: "General" },
                          { value: "runtime", label: "Runtime" },
                          { value: "settings", label: "Settings" },
                        ],
                        onValueChange: (nextSection) => {
                          if (typeof resourcesHeaderState.onSectionChange === "function") {
                            resourcesHeaderState.onSectionChange(nextSection);
                          }
                        },
                        ariaLabel: "Computer section",
                      })
                  : !isResourcesDetailView && activeResourcesView === "agents"
                    ? React.createElement("div", {
                        id: "playground-agents-overview-period-controls",
                        className: "playground-agent-overview-period-controls-slot",
                      })
                  : !isResourcesDetailView && activeResourcesView === "computers"
                    ? React.createElement("div", {
                        id: "playground-computers-overview-period-controls",
                        className: "playground-computer-overview-period-controls-slot",
                      })
                  : !isResourcesDetailView
                    && activeResourcesView === "servers"
                    && ["web_app", "function", "api", "database", "auth", "secrets", "payments"].includes(activeResourcesServerKind)
                    ? React.createElement("div", {
                        id: "playground-develop-resource-overview-period-controls",
                        className: "playground-develop-resource-overview-period-controls-slot",
                      })
                  : isDatabaseResourcesDetailView
                    ? React.createElement(PlatformSwitch, {
                      className: "playground-database-detail-header-switch",
                      value: ["data", "usage", "settings"].includes(resourcesHeaderState.activeSection)
                        ? resourcesHeaderState.activeSection
                        : "data",
                      options: [
                        { value: "data", label: "Data" },
                        { value: "usage", label: "Usage" },
                        { value: "settings", label: "Settings" },
                      ],
                      onValueChange: (nextSection) => {
                        if (typeof resourcesHeaderState.onSectionChange === "function") {
                          resourcesHeaderState.onSectionChange(nextSection);
                        }
                      },
                      ariaLabel: "Database section",
                    })
                  : isSourceDeployableResourcesDetailView
                    ? React.createElement(PlatformSwitch, {
                        className: "playground-source-server-detail-header-switch",
                        value: ["code", "usage", "settings"].includes(resourcesHeaderState.activeSection)
                          ? resourcesHeaderState.activeSection
                          : "code",
                        options: [
                          { value: "code", label: "Code" },
                          { value: "usage", label: "Usage" },
                          { value: "settings", label: "Settings" },
                        ],
                        onValueChange: (nextSection) => {
                          if (typeof resourcesHeaderState.onSectionChange === "function") {
                            resourcesHeaderState.onSectionChange(nextSection);
                          }
                        },
                        ariaLabel: (activeResourcesServerKind === "web_app" ? "Web app" : "Function") + " section",
                      })
                  : isAuthenticationResourcesDetailView
                    ? React.createElement(PlatformSwitch, {
                        className: "playground-auth-detail-header-switch",
                        value: ["users", "usage", "settings"].includes(resourcesHeaderState.activeSection)
                          ? resourcesHeaderState.activeSection
                          : "users",
                        options: [
                          { value: "users", label: "Users" },
                          { value: "usage", label: "Usage" },
                          { value: "settings", label: "Settings" },
                        ],
                        onValueChange: (nextSection) => {
                          if (typeof resourcesHeaderState.onSectionChange === "function") {
                            resourcesHeaderState.onSectionChange(nextSection);
                          }
                        },
                      ariaLabel: "Authentication section",
                    })
                  : isAgentRuntimeResourcesDetailView
                    ? React.createElement(PlatformSwitch, {
                        className: "playground-agent-runtime-detail-header-switch",
                        value: ["usage", "threads", "settings"].includes(resourcesHeaderState.activeSection)
                          ? resourcesHeaderState.activeSection
                          : "usage",
                        options: [
                          { value: "usage", label: "Usage" },
                          { value: "threads", label: "Threads" },
                          { value: "settings", label: "Settings" },
                        ],
                        onValueChange: (nextSection) => {
                          if (typeof resourcesHeaderState.onSectionChange === "function") {
                            resourcesHeaderState.onSectionChange(nextSection);
                          }
                        },
                        ariaLabel: "Agent Runtime section",
                      })
                  : isSecretsResourcesDetailView
                    ? React.createElement(PlatformSwitch, {
                        className: "playground-secrets-detail-header-switch",
                        value: ["secrets", "usage", "settings"].includes(resourcesHeaderState.activeSection)
                          ? resourcesHeaderState.activeSection
                          : "secrets",
                        options: [
                          { value: "secrets", label: "Secrets" },
                          { value: "usage", label: "Usage" },
                          { value: "settings", label: "Settings" },
                        ],
                        onValueChange: (nextSection) => {
                          if (typeof resourcesHeaderState.onSectionChange === "function") {
                            resourcesHeaderState.onSectionChange(nextSection);
                          }
                        },
                        ariaLabel: "Secrets section",
                      })
                  : isPaymentsResourcesDetailView
                    ? React.createElement(PlatformSwitch, {
                        className: "playground-payments-detail-header-switch",
                        value: ["usage", "settings"].includes(resourcesHeaderState.activeSection)
                          ? resourcesHeaderState.activeSection
                          : "usage",
                        options: [
                          { value: "usage", label: "Usage" },
                          { value: "settings", label: "Settings" },
                        ],
                        onValueChange: (nextSection) => {
                          if (typeof resourcesHeaderState.onSectionChange === "function") {
                            resourcesHeaderState.onSectionChange(nextSection);
                          }
                        },
                        ariaLabel: "Payments section",
                      })
                  : null,
              includeSearchDivider: activeResourcesView === "agents"
                || activeResourcesView === "computers"
                || (activeResourcesView === "servers" && Boolean(activeResourcesServerKind)),
              hideCommonActions: false,
              extraActions: React.createElement(React.Fragment, null,
                isResourcesDetailView
                  && activeResourcesView === "agents"
                  && resourcesHeaderState.activeSection === "insights"
                  && resourcesHeaderState.showTimeframe
                  ? React.createElement(PlatformSwitch, {
                      className: "playground-agent-detail-header-timeframe",
                      value: resourcesHeaderState.timeframeValue || "month",
                      options: Array.isArray(resourcesHeaderState.timeframeOptions)
                        ? resourcesHeaderState.timeframeOptions
                        : [],
                      onValueChange: (nextTimeframe) => {
                        if (typeof resourcesHeaderState.onTimeframeChange === "function") {
                          resourcesHeaderState.onTimeframeChange(nextTimeframe);
                        }
                      },
                      ariaLabel: "Agent analytics time frame",
                    })
                  : null,
                !isResourcesDetailView
                  ? React.createElement("div", {
                      id: "playground-resource-overview-controls",
                      className: "playground-resource-overview-controls-slot",
                    })
                  : null,
                React.createElement("div", {
                  id: "playground-resources-nav-actions",
                  className: "playground-resources-nav-actions-slot",
                })
              ),
            });
          }
  
          function getTopNavIssueProjectId() {
            return String(tasksHeaderState.projectId || latestInteractedProjectId || "").trim();
          }

          function openProjectIssueComposerFromHeader(taskType = "task") {
            const requestedTaskType = normalizePlaygroundTaskType(taskType);
            const composerOptions = { taskType: requestedTaskType };
            const registeredHandler = tasksProjectIssueCreateHandlerRef.current;
            if (typeof registeredHandler === "function" && registeredHandler(composerOptions) !== false) {
              return;
            }
            setTasksProjectIssueRequest({
              action: "create",
              taskType: requestedTaskType,
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
          }
  
          function getDefaultTopNavIssueAssigneeId() {
            const preferredAgent = getPlaygroundPreferredDefaultAgent(runtimeAgents);
            return preferredAgent?.id || runtimeAgents[0]?.id || "";
          }
  
          function getDefaultTopNavIssueEnvironmentId() {
            const currentEnvironmentId = String(resolvedEnvironmentId || environmentId || "").trim();
            if (currentEnvironmentId && runtimeEnvironments.some((item) => item?.id === currentEnvironmentId)) {
              return currentEnvironmentId;
            }
            return runtimeEnvironments.find((item) => item?.isDefault)?.id
              || runtimeEnvironments[0]?.id
              || "";
          }
  
          function buildTopNavIssueDraft() {
            const now = new Date().toISOString();
            return normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
              ...buildPlaygroundDefaultTaskDraft(),
              projectId: getTopNavIssueProjectId() || null,
              title: "",
              description: "",
              taskType: "task",
              parentTaskId: null,
              status: "todo",
              priority: "medium",
              taskColor: PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
              assigneeAgentId: getDefaultTopNavIssueAssigneeId() || null,
              reviewRequired: false,
              reviewerAgentId: null,
              environmentId: getDefaultTopNavIssueEnvironmentId() || null,
              createdAt: now,
              updatedAt: now,
              metadata: {
                runnerPlayground: {
                  source: "top_nav_issue_composer",
                },
              },
            }));
          }
  
          function openTopNavIssueComposer() {
            if (topNavIssueComposerCloseTimerRef.current) {
              window.clearTimeout(topNavIssueComposerCloseTimerRef.current);
              topNavIssueComposerCloseTimerRef.current = null;
            }
            if (topNavIssueComposerFrameRef.current) {
              window.cancelAnimationFrame(topNavIssueComposerFrameRef.current);
              topNavIssueComposerFrameRef.current = null;
            }
            setTopNavIssueComposerVisible(false);
            setTopNavIssueComposerClosing(false);
            setIsTopNavIssueDescriptionEditing(false);
            setTopNavIssueEnvironmentPopoverOpen(false);
            setTopNavIssueDetailSelectPopover("");
            setTopNavIssueDetailsCollapsed(false);
            setTopNavIssueDraft(buildTopNavIssueDraft());
            setTopNavIssueSaveState({
              isSaving: false,
              error: "",
            });
            setTopNavIssueComposerOpen(true);
            topNavIssueComposerFrameRef.current = window.requestAnimationFrame(() => {
              topNavIssueComposerFrameRef.current = window.requestAnimationFrame(() => {
                topNavIssueComposerFrameRef.current = null;
                setTopNavIssueComposerVisible(true);
              });
            });
          }
  
          function finishCloseTopNavIssueComposer() {
            if (topNavIssueComposerCloseTimerRef.current) {
              window.clearTimeout(topNavIssueComposerCloseTimerRef.current);
              topNavIssueComposerCloseTimerRef.current = null;
            }
            if (topNavIssueComposerFrameRef.current) {
              window.cancelAnimationFrame(topNavIssueComposerFrameRef.current);
              topNavIssueComposerFrameRef.current = null;
            }
            setTopNavIssueComposerVisible(false);
            setTopNavIssueComposerClosing(false);
            setTopNavIssueComposerOpen(false);
            setIsTopNavIssueDescriptionEditing(false);
            setTopNavIssueEnvironmentPopoverOpen(false);
            setTopNavIssueDetailSelectPopover("");
            setTopNavIssueDetailsCollapsed(false);
            setTopNavIssueDraft(buildPlaygroundDefaultTaskDraft());
            setTopNavIssueSaveState({
              isSaving: false,
              error: "",
            });
          }
  
          function closeTopNavIssueComposer(options = {}) {
            if (topNavIssueSaveState.isSaving) {
              return;
            }
            if (options?.animate === false) {
              finishCloseTopNavIssueComposer();
              return;
            }
            if (topNavIssueComposerClosing) {
              return;
            }
            setTopNavIssueComposerVisible(false);
            setTopNavIssueComposerClosing(true);
            if (topNavIssueComposerCloseTimerRef.current) {
              window.clearTimeout(topNavIssueComposerCloseTimerRef.current);
            }
            topNavIssueComposerCloseTimerRef.current = window.setTimeout(() => {
              topNavIssueComposerCloseTimerRef.current = null;
              finishCloseTopNavIssueComposer();
            }, topNavIssueComposerAnimationMs);
          }
  
          useEffect(() => {
            return () => {
              if (topNavIssueComposerCloseTimerRef.current) {
                window.clearTimeout(topNavIssueComposerCloseTimerRef.current);
                topNavIssueComposerCloseTimerRef.current = null;
              }
              if (topNavIssueComposerFrameRef.current) {
                window.cancelAnimationFrame(topNavIssueComposerFrameRef.current);
                topNavIssueComposerFrameRef.current = null;
              }
            };
          }, []);
  
          useEffect(() => {
            if (!topNavIssueComposerOpen) return undefined;
  
            function handleTopNavIssueComposerEscape(event) {
              if (event.key !== "Escape") return;
              if (topNavIssueDetailSelectPopover) {
                setTopNavIssueDetailSelectPopover("");
                return;
              }
              if (topNavIssueEnvironmentPopoverOpen) {
                setTopNavIssueEnvironmentPopoverOpen(false);
                return;
              }
              closeTopNavIssueComposer();
            }
  
            window.addEventListener("keydown", handleTopNavIssueComposerEscape);
            return () => window.removeEventListener("keydown", handleTopNavIssueComposerEscape);
          }, [topNavIssueComposerClosing, topNavIssueComposerOpen, topNavIssueDetailSelectPopover, topNavIssueEnvironmentPopoverOpen, topNavIssueSaveState.isSaving]);
  
          useEffect(() => {
            if (!topNavIssueEnvironmentPopoverOpen) {
              return undefined;
            }
  
            function handleTopNavIssueEnvironmentPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !topNavIssueEnvironmentPopoverRef.current || topNavIssueEnvironmentPopoverRef.current.contains(target)) {
                return;
              }
              setTopNavIssueEnvironmentPopoverOpen(false);
            }
  
            document.addEventListener("mousedown", handleTopNavIssueEnvironmentPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleTopNavIssueEnvironmentPopoverPointerDown);
          }, [topNavIssueEnvironmentPopoverOpen]);
  
          useEffect(() => {
            if (!topNavIssueDetailSelectPopover) {
              return undefined;
            }
  
            function handleTopNavIssueDetailSelectPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !topNavIssueDetailSelectPopoverRef.current || topNavIssueDetailSelectPopoverRef.current.contains(target)) {
                return;
              }
              setTopNavIssueDetailSelectPopover("");
            }
  
            document.addEventListener("mousedown", handleTopNavIssueDetailSelectPopoverPointerDown);
            return () => document.removeEventListener("mousedown", handleTopNavIssueDetailSelectPopoverPointerDown);
          }, [topNavIssueDetailSelectPopover]);

          useEffect(() => {
            setProjectBreadcrumbMenuOpen(false);
          }, [tasksHeaderState.mode, tasksHeaderState.projectId]);
  
          function updateTopNavIssueDraft(updater) {
            setTopNavIssueDraft((current) => normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata(
              typeof updater === "function" ? updater(current) : updater
            )));
            setTopNavIssueSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function updateTopNavIssueField(field, value) {
            updateTopNavIssueDraft((current) => ({
              ...current,
              [field]: value,
            }));
          }
  
          function resizeTopNavIssueDescriptionTextarea(textarea) {
            if (!textarea) return;
            const computedStyles = window.getComputedStyle(textarea);
            const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
            const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
            const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
            const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
            const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
            const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
            textarea.style.height = "auto";
            const nextHeight = String(textarea.value || "").trim()
              ? Math.max(singleLineHeight, textarea.scrollHeight)
              : singleLineHeight;
            textarea.style.height = nextHeight + "px";
          }
  
          function buildTopNavIssueWrappedDescriptionEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            if (safeStart !== safeEnd) {
              if (
                selectedText.startsWith(prefix)
                && selectedText.endsWith(suffix)
                && selectedText.length >= prefix.length + suffix.length
              ) {
                const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
                return {
                  value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
                  selectionStart: safeStart,
                  selectionEnd: safeStart + unwrappedText.length,
                };
              }
  
              const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
              const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
              if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
                return {
                  value: value.slice(0, safeStart - prefix.length) + selectedText + value.slice(safeEnd + suffix.length),
                  selectionStart: safeStart - prefix.length,
                  selectionEnd: safeStart - prefix.length + selectedText.length,
                };
              }
  
              const wrappedText = prefix + selectedText + suffix;
              return {
                value: value.slice(0, safeStart) + wrappedText + value.slice(safeEnd),
                selectionStart: safeStart + prefix.length,
                selectionEnd: safeStart + prefix.length + selectedText.length,
              };
            }
  
            return {
              value: value.slice(0, safeStart) + prefix + suffix + value.slice(safeEnd),
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length,
            };
          }
  
          function buildTopNavIssueDescriptionListEdit(value, selectionStart, selectionEnd) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
            let lineEnd = value.indexOf("\n", safeEnd);
            if (lineEnd === -1) {
              lineEnd = value.length;
            }
            const block = value.slice(lineStart, lineEnd);
            const lines = block.split("\n");
            const allListItems = lines.every((line) => !line.trim() || /^\s*-\s/.test(line));
            const nextLines = allListItems
              ? lines.map((line) => line.replace(/^(\s*)-\s?/, "$1"))
              : lines.map((line) => line.trim() ? (line.match(/^\s*$/) ? line : "- " + line.replace(/^\s*-\s?/, "")) : line);
            const nextBlock = nextLines.join("\n");
            const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
            return {
              value: nextValue,
              selectionStart: lineStart,
              selectionEnd: lineStart + nextBlock.length,
            };
          }
  
          function applyTopNavIssueDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            updateTopNavIssueField("description", nextValue);
            window.requestAnimationFrame(() => {
              const textarea = topNavIssueDescriptionTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeTopNavIssueDescriptionTextarea(textarea);
            });
          }
  
          function handleTopNavIssueDescriptionFormat(formatType) {
            const textarea = topNavIssueDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const value = String(topNavIssueDraft?.description || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
  
            if (formatType === "bold") {
              edit = buildTopNavIssueWrappedDescriptionEdit(value, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildTopNavIssueWrappedDescriptionEdit(value, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildTopNavIssueWrappedDescriptionEdit(value, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildTopNavIssueDescriptionListEdit(value, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applyTopNavIssueDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function buildTopNavIssuePayload(taskRecord, projectIdForIssue) {
            const mergedTask = normalizePlaygroundTaskRecord({
              ...normalizePlaygroundTaskRecord(taskRecord),
              projectId: projectIdForIssue,
            });
            const metadata = buildPlaygroundTaskMetadata(mergedTask, {
              ticketNumber: mergedTask.ticketNumber,
              taskType: mergedTask.taskType,
              parentTaskId: mergedTask.parentTaskId,
              assigneeAgentId: mergedTask.assigneeAgentId,
              reviewRequired: mergedTask.reviewRequired,
              reviewerAgentId: mergedTask.reviewerAgentId,
              environmentId: mergedTask.environmentId,
              taskColor: mergedTask.taskColor,
              scheduleType: mergedTask.scheduleType,
              cronExpression: mergedTask.cronExpression,
              scheduleTimezone: mergedTask.scheduleTimezone,
              scheduleEnabled: mergedTask.scheduleEnabled,
              attachments: mergedTask.attachments,
              enabledSkills: mergedTask.enabledSkills,
              connectors: mergedTask.connectors,
            });
            return {
              projectId: projectIdForIssue,
              releaseId: mergedTask.releaseId,
              ticketNumber: mergedTask.ticketNumber,
              type: mergedTask.taskType,
              parentTaskId: null,
              title: mergedTask.title,
              description: mergedTask.description,
              status: mergedTask.status,
              priority: mergedTask.priority,
              sprintId: mergedTask.sprintId,
              assigneeAgentId: isPlaygroundHumanAssigneeId(mergedTask.assigneeAgentId) ? null : mergedTask.assigneeAgentId,
              reviewRequired: mergedTask.reviewRequired,
              reviewerAgentId: mergedTask.reviewerAgentId,
              environmentId: mergedTask.environmentId,
              dependencyIds: mergedTask.dependencyIds,
              linkedThreadIds: mergedTask.linkedThreadIds,
              lastStartedThreadId: mergedTask.lastStartedThreadId,
              scheduledStartAt: mergedTask.scheduledStartAt,
              scheduledEndAt: mergedTask.scheduledEndAt,
              dueAt: mergedTask.dueAt,
              completedAt: mergedTask.completedAt,
              sortOrder: mergedTask.sortOrder,
              metadata,
            };
          }
  
          async function handleSaveTopNavIssue(event) {
            event?.preventDefault?.();
            if (topNavIssueSaveState.isSaving) {
              return;
            }
            const projectIdForIssue = getTopNavIssueProjectId();
            const title = normalizePlaygroundEditableTaskTitle(topNavIssueDraft?.title, "");
            if (!projectIdForIssue) {
              setTopNavIssueSaveState({ isSaving: false, error: "Project is unavailable." });
              return;
            }
            if (!title) {
              setTopNavIssueSaveState({ isSaving: false, error: "Issue title is required." });
              return;
            }
            const now = new Date().toISOString();
            const status = PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === topNavIssueDraft?.status)
              ? topNavIssueDraft.status
              : "todo";
            const taskDraft = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
              ...topNavIssueDraft,
              id: "",
              projectId: projectIdForIssue,
              title,
              taskType: normalizePlaygroundTaskType(topNavIssueDraft?.taskType) === "loop" ? "loop" : "task",
              parentTaskId: null,
              priority: PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === topNavIssueDraft?.priority) ? topNavIssueDraft.priority : "medium",
              status,
              reviewRequired: topNavIssueDraft?.reviewRequired === true,
              reviewerAgentId: topNavIssueDraft?.reviewRequired === true ? (topNavIssueDraft?.reviewerAgentId || null) : null,
              environmentId: topNavIssueDraft?.environmentId || null,
              completedAt: status === "done" ? now : null,
              sortOrder: Date.now(),
              createdAt: now,
              updatedAt: now,
            }));
  
            setTopNavIssueSaveState({ isSaving: true, error: "" });
            try {
              const response = await fetch(proxyBackendBase + "/tasks", {
                method: "POST",
                headers: {
                  ...authRequestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(buildTopNavIssuePayload(taskDraft, projectIdForIssue)),
              });
              const data = await response.json().catch(() => ({}));
  	            if (!response.ok) {
  	              throw new Error(data?.message || data?.error || "Failed to create issue.");
  	            }
  	            const createdTask = getPlaygroundTaskResponseRecord(data);
  	            finishCloseTopNavIssueComposer();
  	            setLatestInteractedProjectId(projectIdForIssue);
              setTasksPageNavigationRequest({
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                projectId: projectIdForIssue,
                view: "backlog",
                taskId: createdTask?.id || "",
              });
              setActivePage("tasks");
            } catch (error) {
              setTopNavIssueSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create issue.",
              });
            }
          }
  
          function renderTopNavIssueField(label, control, options = {}) {
            return React.createElement("label", {
                className: "playground-tasks-project-modal-field playground-tasks-issue-modal-field" + (options.full ? " is-full" : ""),
              },
              React.createElement("div", { className: "playground-tasks-project-modal-label" }, label),
              control
            );
          }
  
          function renderTopNavIssueComposerDialog() {
            if (!topNavIssueComposerOpen) {
              return null;
            }
  		          const assignableActors = runtimeAgents.concat(buildPlaygroundHumanAssigneeOption());
            const selectedTopNavIssueEnvironment = topNavIssueDraft.environmentId
              ? runtimeEnvironments.find((environment) => environment?.id === topNavIssueDraft.environmentId) || null
              : null;
            const topNavIssueEnvironmentLabel = selectedTopNavIssueEnvironment
              ? ((selectedTopNavIssueEnvironment.name || selectedTopNavIssueEnvironment.id) + (selectedTopNavIssueEnvironment.isDefault ? " (Default)" : ""))
              : (runtimeEnvironments.length > 0 ? "Select environment" : "No environments");
  
            function renderTopNavIssueEnvironmentOptionRow(environment) {
              const isSelected = selectedTopNavIssueEnvironment?.id === environment.id;
              return React.createElement("button", {
                  key: environment.id,
                  type: "button",
                  className: "tb-popup-row tb-popup-row-select" + (isSelected ? " selected" : ""),
                  onClick: () => {
                    updateTopNavIssueField("environmentId", environment.id);
                    setTopNavIssueEnvironmentPopoverOpen(false);
                  },
                },
                React.createElement("span", { className: "tb-popup-check-slot" },
                  isSelected
                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, (environment.name || environment.id) + (environment.isDefault ? " (Default)" : "")),
                  React.createElement("span", null, "Use this computer for this issue.")
                )
              );
            }
  
            function renderTopNavIssueComputerSelector() {
              return React.createElement("div", { className: "playground-tasks-project-modal-environment-picker playground-tasks-issue-modal-computer-picker" },
                renderPlaygroundPlatformPopup({
                  open: topNavIssueEnvironmentPopoverOpen,
                  shellRef: topNavIssueEnvironmentPopoverRef,
                  shellClassName: "playground-environments-runtime-popup-shell playground-tasks-detail-select-shell",
                  menuClassName: "playground-tasks-toolbar-popup-menu-environment",
                  trigger: React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger playground-tasks-project-modal-environment-button" + (selectedTopNavIssueEnvironment ? "" : " is-empty") + (topNavIssueEnvironmentPopoverOpen ? " is-active" : ""),
                    onClick: () => {
                      setTopNavIssueDetailSelectPopover("");
                      setTopNavIssueEnvironmentPopoverOpen((current) => !current);
                    },
                    title: topNavIssueEnvironmentLabel,
                    "aria-expanded": topNavIssueEnvironmentPopoverOpen ? "true" : "false",
                    disabled: runtimeEnvironments.length === 0,
                  },
                    React.createElement(Monitor, { className: "playground-tasks-project-modal-environment-icon", strokeWidth: 1.8 }),
                    React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, topNavIssueEnvironmentLabel),
                    React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                  ),
                  children: runtimeEnvironments.length > 0
                    ? runtimeEnvironments.map((environment) => renderTopNavIssueEnvironmentOptionRow(environment))
                    : React.createElement("div", { className: "tb-popup-empty-state" }, "No environments available."),
                })
              );
            }
  
            function renderTopNavIssueDescriptionField() {
              return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor" },
                React.createElement("div", { className: "playground-tasks-detail-section-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
                  React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                    [
                      { id: "bold", label: "Bold", icon: Bold },
                      { id: "italic", label: "Italic", icon: Italic },
                      { id: "underline", label: "Underline", icon: Underline },
                      { id: "list", label: "List", icon: List },
                    ].map((action) =>
                      React.createElement("button", {
                        key: action.id,
                        type: "button",
                        className: "playground-tasks-detail-format-button",
                        title: action.label,
                        "aria-label": action.label,
                        onMouseDown: (event) => event.preventDefault(),
                        onClick: () => handleTopNavIssueDescriptionFormat(action.id),
                      }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isTopNavIssueDescriptionEditing ? " is-editing" : " is-preview") },
                  !isTopNavIssueDescriptionEditing
                    ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                        String(topNavIssueDraft.description || "").trim()
                          ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                              content: topNavIssueDraft.description,
                              className: "playground-tasks-detail-description-preview tb-message-markdown",
                            })
                          : React.createElement("div", {
                              className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                            }, "Describe the expected outcome, context, constraints, and acceptance criteria.")
                      )
                    : null,
                  React.createElement("textarea", {
                    ref: topNavIssueDescriptionTextareaRef,
                    className: "playground-tasks-detail-description-input " + (isTopNavIssueDescriptionEditing ? "is-editing" : "is-preview"),
                    rows: 1,
                    placeholder: isTopNavIssueDescriptionEditing ? "Describe the expected outcome, context, constraints, and acceptance criteria." : "",
                    value: topNavIssueDraft.description || "",
                    onFocus: (event) => {
                      setIsTopNavIssueDescriptionEditing(true);
                      resizeTopNavIssueDescriptionTextarea(event.currentTarget);
                    },
                    onChange: (event) => {
                      updateTopNavIssueField("description", event.target.value);
                      resizeTopNavIssueDescriptionTextarea(event.currentTarget);
                    },
                    onBlur: () => setIsTopNavIssueDescriptionEditing(false),
                  })
                )
              );
            }
  
            function toggleTopNavIssueDetailSelectPopover(nextPopoverId) {
              setTopNavIssueEnvironmentPopoverOpen(false);
              setTopNavIssueDetailSelectPopover((current) => current === nextPopoverId ? "" : nextPopoverId);
            }
  
            function renderTopNavIssueDetailSelectOptionRow({ key, label, description, selected, onClick, disabled = false }) {
              return React.createElement("button", {
                  key,
                  type: "button",
                  className: "tb-popup-row tb-popup-row-select" + (selected ? " selected" : ""),
                  onClick,
                  disabled,
                },
                React.createElement("span", { className: "tb-popup-check-slot" },
                  selected
                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, label),
                  description
                    ? React.createElement("span", null, description)
                    : null
                )
              );
            }
  
            function renderTopNavIssueDetailSelectControl({
              popoverId,
              valueLabel,
              disabled = false,
              isEmpty = false,
              buttonContent = null,
              menuClassName = "",
              children,
            }) {
              const isOpen = topNavIssueDetailSelectPopover === popoverId;
              return renderPlaygroundPlatformPopup({
                open: isOpen,
                shellRef: isOpen ? topNavIssueDetailSelectPopoverRef : null,
                shellClassName: "playground-environments-runtime-popup-shell playground-tasks-detail-select-shell",
                menuClassName,
                trigger: React.createElement("button", {
                  type: "button",
                  className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger" + (isEmpty ? " is-empty" : "") + (isOpen ? " is-active" : ""),
                  disabled,
                  onClick: () => {
                    if (disabled) return;
                    toggleTopNavIssueDetailSelectPopover(popoverId);
                  },
                  title: valueLabel,
                  "aria-expanded": isOpen ? "true" : "false",
                },
                  buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
                  React.createElement(ChevronDown, { className: "playground-tasks-detail-select-trigger-chevron", strokeWidth: 1.8 })
                ),
                children,
              });
            }
  
            function renderTopNavIssueDetailFact(label, control) {
              return React.createElement("div", { className: "playground-tasks-detail-fact" },
                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
                React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
              );
            }
  
            function getTopNavIssueActorLabel(actorId, fallback = "Unassigned") {
              const normalizedActorId = String(actorId || "").trim();
              if (!normalizedActorId) return fallback;
              const actor = assignableActors.find((item) => item.id === normalizedActorId) || null;
              if (isPlaygroundHumanAssigneeId(normalizedActorId)) {
                return actor?.name || "Me";
              }
              return actor?.name || normalizedActorId || fallback;
            }
  
            function renderTopNavIssueActorAvatar(actorId, className, fallbackLabel = "") {
              const normalizedActorId = String(actorId || "").trim();
              const actor = normalizedActorId ? assignableActors.find((item) => item.id === normalizedActorId) || null : null;
              const actorLabel = getTopNavIssueActorLabel(normalizedActorId, fallbackLabel || "User");
              const avatarLabel = (getAccountInitials(actorLabel).charAt(0) || "U").toUpperCase();
              const avatarUrl = isPlaygroundHumanAssigneeId(normalizedActorId)
                ? normalizeSessionPhotoUrl(sessionState.photoURL || "")
                : normalizeSessionPhotoUrl(actor ? getPlaygroundAgentProfilePhotoUrl(actor) : "");
              return React.createElement("span", { className, "aria-hidden": "true" },
                canRenderAvatarImage(avatarUrl)
                  ? React.createElement("img", {
                      className: className + "-image",
                      src: avatarUrl,
                      alt: avatarLabel,
                    })
                  : React.createElement("span", { className: className + "-fallback" }, avatarLabel)
              );
            }
  
            function renderTopNavIssuePersonValue(actorId, label) {
              const normalizedActorId = String(actorId || "").trim();
              return React.createElement("span", { className: "playground-tasks-detail-person-value" },
                normalizedActorId ? renderTopNavIssueActorAvatar(normalizedActorId, "playground-tasks-detail-person-avatar", label) : null,
                React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, label)
              );
            }
  
            function renderTopNavIssueAgentRow(actor, options = {}) {
              const actorLabel = getTopNavIssueActorLabel(actor.id, "Unknown");
              const actorDescription = options.reviewer
                ? (isPlaygroundHumanAssigneeId(actor.id) ? "Human reviewer" : "Agent reviewer")
                : (isPlaygroundHumanAssigneeId(actor.id) ? "Human" : "Agent");
              const isSelected = options.reviewer
                ? (topNavIssueDraft.reviewRequired && topNavIssueDraft.reviewerAgentId === actor.id)
                : topNavIssueDraft.assigneeAgentId === actor.id;
              return React.createElement("button", {
                  key: actor.id,
                  type: "button",
                  className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (isSelected ? " selected" : ""),
                  onClick: () => {
                    if (options.reviewer) {
                      updateTopNavIssueDraft((current) => ({
                        ...current,
                        reviewRequired: true,
                        reviewerAgentId: actor.id,
                      }));
                    } else {
                      updateTopNavIssueField("assigneeAgentId", actor.id);
                    }
                    setTopNavIssueDetailSelectPopover("");
                  },
                },
                renderTopNavIssueActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar", actorLabel),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, actorLabel),
                  React.createElement("span", null, actorDescription)
                ),
                React.createElement("span", { className: "tb-popup-check-slot" },
                  isSelected
                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                    : null
                )
              );
            }
  
            function renderTopNavIssueReviewerNoneRow() {
              return React.createElement("button", {
                  key: "__none__",
                  type: "button",
                  className: "tb-popup-row tb-popup-row-select tb-popup-row-agent" + (!topNavIssueDraft.reviewRequired ? " selected" : ""),
                  onClick: () => {
                    updateTopNavIssueDraft((current) => ({
                      ...current,
                      reviewRequired: false,
                      reviewerAgentId: null,
                    }));
                    setTopNavIssueDetailSelectPopover("");
                  },
                },
                React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar", "aria-hidden": "true" },
                  React.createElement("span", { className: "playground-tasks-detail-person-menu-avatar-fallback" }, "No")
                ),
                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                  React.createElement("span", null, "No review"),
                  React.createElement("span", null, "Move directly to Done when work is done.")
                ),
                React.createElement("span", { className: "tb-popup-check-slot" },
                  !topNavIssueDraft.reviewRequired
                    ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                    : null
                )
              );
            }
  
            function renderTopNavIssueDetailsSection() {
              const issueType = normalizePlaygroundTaskType(topNavIssueDraft.taskType) === "loop" ? "loop" : "task";
              const IssueTypeIcon = issueType === "loop" ? RefreshCw : Bookmark;
              const issueTypeLabel = PLAYGROUND_TASK_TYPE_OPTIONS.find((option) => option.id === issueType)?.label || "Task";
              const issueStatusLabel = PLAYGROUND_TASK_STATUS_OPTIONS.find((option) => option.id === topNavIssueDraft.status)?.label || "Todo";
              const issuePriorityPresentation = getPlaygroundTaskPriorityPresentation(topNavIssueDraft.priority);
              const selectedAssignee = topNavIssueDraft.assigneeAgentId ? assignableActors.find((actor) => actor.id === topNavIssueDraft.assigneeAgentId) || null : null;
              const assigneeLabel = selectedAssignee ? getTopNavIssueActorLabel(selectedAssignee.id, "Unassigned") : "Unassigned";
              const selectedReviewer = topNavIssueDraft.reviewRequired && topNavIssueDraft.reviewerAgentId
                ? assignableActors.find((actor) => actor.id === topNavIssueDraft.reviewerAgentId) || null
                : null;
              const reviewerLabel = topNavIssueDraft.reviewRequired
                ? (selectedReviewer ? getTopNavIssueActorLabel(selectedReviewer.id, "Reviewer") : "Reviewer")
                : "No review";
  
              return React.createElement("div", {
                  className: "playground-tasks-detail-facts playground-tasks-issue-details-section" + (topNavIssueDetailSelectPopover ? " is-popover-open" : ""),
                },
                React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-detail-facts-toggle" + (topNavIssueDetailsCollapsed ? " is-collapsed" : ""),
                    onClick: () => setTopNavIssueDetailsCollapsed((current) => !current),
                    title: topNavIssueDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-label": topNavIssueDetailsCollapsed ? "Expand details" : "Collapse details",
                    "aria-expanded": topNavIssueDetailsCollapsed ? "false" : "true",
                  }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                ),
                !topNavIssueDetailsCollapsed
                  ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                      renderTopNavIssueDetailFact("Type",
                        React.createElement("div", { className: "playground-tasks-type-control" },
                          renderTopNavIssueDetailSelectControl({
                            popoverId: "type",
                            valueLabel: issueTypeLabel,
                            buttonContent: React.createElement("span", { className: "playground-tasks-detail-type-value" },
                              React.createElement(IssueTypeIcon, { className: "playground-tasks-detail-type-icon", strokeWidth: 1.9 }),
                              React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, issueTypeLabel)
                            ),
                            children: PLAYGROUND_TASK_TYPE_OPTIONS
                              .filter((option) => option.id !== "subtask")
                              .map((option) =>
                                renderTopNavIssueDetailSelectOptionRow({
                                  key: option.id,
                                  label: option.label,
                                  selected: issueType === option.id,
                                  onClick: () => {
                                    updateTopNavIssueField("taskType", option.id);
                                    setTopNavIssueDetailSelectPopover("");
                                  },
                                })
                              ),
                          })
                        )
                      ),
                      renderTopNavIssueDetailFact("Status",
                        renderTopNavIssueDetailSelectControl({
                          popoverId: "status",
                          valueLabel: issueStatusLabel,
                          children: PLAYGROUND_TASK_STATUS_OPTIONS.map((option) =>
                            renderTopNavIssueDetailSelectOptionRow({
                              key: option.id,
                              label: option.label,
                              selected: topNavIssueDraft.status === option.id,
                              onClick: () => {
                                updateTopNavIssueField("status", option.id);
                                setTopNavIssueDetailSelectPopover("");
                              },
                            })
                          ),
                        })
                      ),
                      renderTopNavIssueDetailFact("Priority",
                        renderTopNavIssueDetailSelectControl({
                          popoverId: "priority",
                          valueLabel: issuePriorityPresentation.label,
                          buttonContent: React.createElement("span", {
                              className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + issuePriorityPresentation.toneClassName,
                            },
                            renderPlaygroundTaskPriorityGlyph(topNavIssueDraft.priority),
                            React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, issuePriorityPresentation.label)
                          ),
                          children: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                            renderTopNavIssueDetailSelectOptionRow({
                              key: option.id,
                              label: getPlaygroundTaskPriorityPresentation(option.id).label,
                              selected: topNavIssueDraft.priority === option.id,
                              onClick: () => {
                                updateTopNavIssueField("priority", option.id);
                                setTopNavIssueDetailSelectPopover("");
                              },
                            })
                          ),
                        })
                      ),
                      renderTopNavIssueDetailFact("Assignee",
                        renderTopNavIssueDetailSelectControl({
                          popoverId: "assignee",
                          valueLabel: assigneeLabel,
                          isEmpty: !selectedAssignee,
                          buttonContent: renderTopNavIssuePersonValue(topNavIssueDraft.assigneeAgentId, assigneeLabel),
                          menuClassName: "tb-popup-menu-inline-agent",
                          children: assignableActors.length > 0
                            ? assignableActors.map((actor) => renderTopNavIssueAgentRow(actor))
                            : React.createElement("div", { className: "tb-popup-empty-state" }, "No assignees yet."),
                        })
                      ),
                      renderTopNavIssueDetailFact("Reviewer",
                        renderTopNavIssueDetailSelectControl({
                          popoverId: "reviewer",
                          valueLabel: reviewerLabel,
                          isEmpty: !topNavIssueDraft.reviewRequired,
                          buttonContent: renderTopNavIssuePersonValue(topNavIssueDraft.reviewRequired ? topNavIssueDraft.reviewerAgentId : "", reviewerLabel),
                          menuClassName: "tb-popup-menu-inline-agent",
                          children: [
                            renderTopNavIssueReviewerNoneRow(),
                            ...assignableActors.map((actor) => renderTopNavIssueAgentRow(actor, { reviewer: true })),
                          ],
                        })
                      )
                    )
                  : null
              );
            }
  
            return renderPlaygroundPlatformModal({
              open: topNavIssueComposerOpen,
              visible: topNavIssueComposerVisible,
              closing: topNavIssueComposerClosing,
              onClose: () => closeTopNavIssueComposer(),
              as: "form",
              backdropClassName: "playground-tasks-project-issue-backdrop",
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal",
              ariaLabel: "New issue",
              surfaceProps: {
                onSubmit: (event) => void handleSaveTopNavIssue(event),
              },
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
  	                React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
  	                  React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
  	                    React.createElement(Bookmark, { width: 18, height: 18, strokeWidth: 1.9 })
  	                  ),
  	                  React.createElement("input", {
  	                    type: "text",
  	                    className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
  	                    value: topNavIssueDraft.title || "",
  	                    placeholder: "Issue title",
  	                    autoFocus: true,
  	                    onChange: (event) => updateTopNavIssueField("title", event.target.value),
  	                  })
  	                ),
  	                renderTopNavIssueComputerSelector(),
  	                React.createElement("button", {
  	                  type: "button",
  	                  className: "playground-settings-icon-button playground-tasks-project-modal-close",
                    onClick: () => closeTopNavIssueComposer(),
                    title: "Close",
                    disabled: topNavIssueSaveState.isSaving,
  	                }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
  		              ),
  		              React.createElement("div", { className: "playground-tasks-issue-modal-body" },
  		                renderTopNavIssueDescriptionField(),
  		                renderTopNavIssueDetailsSection(),
  	                topNavIssueSaveState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, topNavIssueSaveState.error)
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeTopNavIssueComposer(),
                    disabled: topNavIssueSaveState.isSaving,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: topNavIssueSaveState.isSaving || !String(topNavIssueDraft.title || "").trim(),
                  }, topNavIssueSaveState.isSaving ? "Creating..." : "Create Issue")
                )
              )
            });
	          }

          function renderThreadTitleActionMenu() {
            if (!selectedThreadNavRecord?.id) {
              return null;
            }

            const threadId = String(selectedThreadNavRecord.id || "").trim();
            const threadCanMutate = Boolean(showThreadNavMutationActions && selectedThreadNavRecord?.id);
            const threadMutationIs = (action) =>
              threadMutationState.action === action
              && threadMutationState.threadId === selectedThreadNavRecord?.id;
            const closeThreadActions = () => setThreadNavMenuOpen(false);

            return React.createElement(PlatformResourceHeaderActions, {
                className: "playground-thread-nav-popup-shell playground-thread-title-actions",
              },
              React.createElement(PlatformResourceActionsMenu, {
                open: threadNavMenuOpen,
                onOpenChange: handleThreadNavMenuOpenChange,
                resourceLabel: "Thread",
                disabled: !selectedThreadNavRecord?.id,
                width: 280,
                maxWidth: "min(280px, calc(100vw - 16px))",
                popupClassName: "playground-thread-nav-popup-menu",
                shortcutActions: {
                  rename: {
                    onInvoke: () => openThreadRenameDialog(selectedThreadNavRecord),
                    disabled: !threadCanMutate || Boolean(threadMutationState.action),
                  },
                  delete: {
                    onInvoke: () => {
                      if (selectedThreadNavRecord?.id) void handleThreadDelete(selectedThreadNavRecord.id);
                    },
                    disabled: !threadCanMutate || threadMutationIs("delete"),
                  },
                },
              },
              React.createElement(PlatformResourceActionsInformation, {
                resourceLabel: "Thread",
                items: [
                  {
                    id: "id",
                    label: "ID",
                    value: threadId,
                    title: threadId,
                    monospace: true,
                    copyValue: threadId,
                    copyAriaLabel: "Copy Thread ID",
                  },
                  { id: "project", label: "Project", value: selectedThreadProjectName || "None", title: selectedThreadProjectName || "None" },
                  { id: "task", label: "Task", value: selectedThreadTaskTitle || "None", title: selectedThreadTaskTitle || "None" },
                  { id: "started", label: "Started", value: selectedThreadStartedLabel },
                  { id: "updated", label: "Last updated", value: selectedThreadUpdatedLabel },
                  { id: "inference", label: "LLM inference", value: selectedThreadAgentCtLabel },
                  { id: "resources", label: "Resources", value: selectedThreadEnvironmentCtLabel },
                ],
              }),
              threadCanMutate && selectedThreadProjectName
                ? React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(FolderOpen, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: "Open project",
                    onClick: () => {
                      closeThreadActions();
                      openSelectedThreadProject();
                    },
                  })
                : null,
              threadCanMutate && selectedThreadTaskTitle
                ? React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(FileText, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: "Open task",
                    onClick: () => {
                      closeThreadActions();
                      openSelectedThreadTaskDetail();
                    },
                  })
                : null,
              threadCanMutate ? React.createElement(PlatformResourceActionsDivider, null) : null,
              threadCanMutate
                ? React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(Pin, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: threadMutationIs("pin")
                      ? (selectedThreadNavRecord.isPinned ? "Unpinning thread..." : "Pinning thread...")
                      : (selectedThreadNavRecord.isPinned ? "Unpin thread" : "Pin thread"),
                    disabled: threadMutationIs("pin"),
                    onClick: () => {
                      void handleThreadPinToggle(selectedThreadNavRecord.id);
                    },
                  })
                : null,
              threadCanMutate
                ? React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: "Rename thread",
                    shortcut: "rename",
                    onClick: () => openThreadRenameDialog(selectedThreadNavRecord),
                  })
                : null,
              threadCanMutate
                ? React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(FolderOpen, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: threadMutationIs("project")
                      ? (selectedThreadProjectId ? "Removing from project..." : "Adding to project...")
                      : (selectedThreadProjectId ? "Remove from Project" : "Add to Project"),
                    disabled: threadMutationIs("project"),
                    onClick: () => handleOpenThreadProjectAction(selectedThreadNavRecord),
                  })
                : null,
              threadCanMutate
                ? React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(Truck, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: "Add to Batches",
                    onClick: () => {
                      closeThreadActions();
                      openBatchComposer({
                        name: "Continue " + String(selectedThreadNavRecord.title || selectedThreadNavRecord.task || "thread").slice(0, 180),
                        description: "Thread work queued from the thread details page.",
                        targetKind: "thread_run",
                        targetResourceId: selectedThreadNavRecord.id,
                        definition: {
                          threadId: selectedThreadNavRecord.id,
                          message: String(selectedThreadNavRecord.task || "Continue the work in this thread.").trim(),
                        },
                        sourceProjectId: selectedThreadProjectId || null,
                        sourceTicketId: String(selectedThreadNavRecord.taskId || selectedThreadNavRecord.ticketId || "").trim() || null,
                        startPolicy: "manual",
                      });
                    },
                  })
                : null,
              threadCanMutate
                ? React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: threadMutationIs("delete") ? "Deleting thread..." : "Delete Thread",
                    shortcut: "delete",
                    danger: true,
                    disabled: threadMutationIs("delete"),
                    onClick: () => {
                      void handleThreadDelete(selectedThreadNavRecord.id);
                    },
                  })
                : null
              )
            );
          }

          function getThreadPagePathItems() {
            const threadTitleActionMenu = renderThreadTitleActionMenu();
            if (activeEvaluationThreadContext) {
              return [
                {
                  label: "Evaluations",
                  onClick: () => {
                    setSelectedEvaluationCaseId("");
                    openEvaluationsPage({ mode: "overview" });
                  },
                },
                {
                  label: activeEvaluationThreadContext.runLabel || "Run",
                  onClick: () => {
                    setSelectedEvaluationCaseId("");
                    openEvaluationsPage({
                      mode: "run",
                      evaluationId: activeEvaluationThreadContext.evaluationSetId,
                      evaluationRunId: activeEvaluationThreadContext.runId,
                    });
                  },
                },
                {
                  label: activeEvaluationThreadContext.threadKind || "Evaluation",
                  trailing: threadTitleActionMenu,
                  allowCurrentClick: true,
                  onClick: () => {
                    if (currentThreadId) {
                      handleThreadSelect(currentThreadId);
                    }
                  },
                },
              ];
            }

            if (activeMetronomeRunPresentation?.isTaskLoop) {
              return [{
                label: activeMetronomeRunPresentation.label,
                trailing: threadTitleActionMenu,
                leading: React.createElement("span", {
                  className: "playground-tasks-backlog-project-icon is-loop",
                  "aria-hidden": "true",
                }, React.createElement(RefreshCw, {
                  width: 12,
                  height: 12,
                  strokeWidth: 1.9,
                })),
              }];
            }
            if (activeMetronomeRunPresentation?.isMissionControl) {
              return [{
                label: activeMetronomeRunPresentation.label,
                trailing: threadTitleActionMenu,
                leading: React.createElement("span", {
                  className: "playground-tasks-backlog-project-icon is-mission-control",
                  "aria-hidden": "true",
                }, React.createElement(RefreshCcwDot, {
                  width: 12,
                  height: 12,
                  strokeWidth: 1.9,
                })),
              }];
            }

            if (selectedThreadProjectId && selectedThreadProjectName) {
              const ProjectBreadcrumbIcon = selectedThreadProjectIconConfig?.icon || Rocket;
              const TicketTypeIcon = selectedThreadTaskType === "subtask"
                ? Check
                : selectedThreadTaskType === "loop"
                  ? RefreshCw
                  : Bookmark;
              return [
                {
                  label: selectedThreadProjectName,
                  trailing: selectedThreadTaskTicketNumber ? null : threadTitleActionMenu,
                  leading: React.createElement("span", {
                      className: "playground-project-breadcrumb-icon",
                      style: {
                        "--project-icon-color": selectedThreadProjectColor || "rgba(255, 255, 255, 0.82)",
                      },
                      "aria-hidden": "true",
                    },
                    React.createElement(ProjectBreadcrumbIcon, {
                      width: 14,
                      height: 14,
                      strokeWidth: 1.8,
                    })
                  ),
                  allowCurrentClick: true,
                  onClick: openSelectedThreadProject,
                },
                ...(selectedThreadTaskTicketNumber
                  ? [{
                      label: selectedThreadTaskTicketNumber,
                      trailing: threadTitleActionMenu,
                      leading: React.createElement("span", {
                        className: "playground-tasks-backlog-project-icon is-" + selectedThreadTaskType,
                        "aria-hidden": "true",
                      }, React.createElement(TicketTypeIcon, {
                        width: 12,
                        height: 12,
                        strokeWidth: 1.9,
                      })),
                      allowCurrentClick: true,
                      onClick: openSelectedThreadTaskDetail,
                    }]
                  : []),
              ];
            }

            return [{
              label: selectedThreadTitle || "Current thread",
              trailing: threadTitleActionMenu,
            }];
          }

          function renderTasksPageNav() {
            const isProjectDetailView = tasksHeaderState.mode === "project";
            const projectTitle = String(tasksHeaderState.title || "").trim() || "Project";
            const projectIconConfig = getPlaygroundProjectIconConfig(tasksHeaderState.icon);
            const ProjectBreadcrumbIcon = projectIconConfig.icon || Rocket;
            const projectIconColor = String(tasksHeaderState.color || "").trim() || "rgba(255, 255, 255, 0.82)";
            const projectBreadcrumbLeading = React.createElement("span", {
                className: "playground-project-breadcrumb-icon",
                style: { "--project-icon-color": projectIconColor },
                "aria-hidden": "true",
              },
              React.createElement(ProjectBreadcrumbIcon, {
                width: 14,
                height: 14,
                strokeWidth: 1.8,
              })
            );
            const activeProjectSectionId = String(tasksHeaderState.sectionId || "").trim().toLowerCase();
            const activeProjectWorkspaceView = tasksHeaderState.view === "board"
              ? "board"
              : tasksHeaderState.view === "backlog"
                ? "backlog"
                : activeProjectSectionId === "resources"
                  ? "resources"
                  : "overview";
            const activeProjectView = activeProjectWorkspaceView === "board"
              ? "backlog"
              : activeProjectWorkspaceView;
            const activeTicketNumber = String(tasksHeaderState.ticketNumber || "").trim();
            const activeTicketType = tasksHeaderState.taskType === "subtask"
              ? "subtask"
              : tasksHeaderState.taskType === "loop"
                ? "loop"
                : "task";
            const ActiveTicketTypeIcon = activeTicketType === "subtask"
              ? Check
              : activeTicketType === "loop"
                ? RefreshCw
                : Bookmark;
            const isProjectTaskDetailView = Boolean(
              isProjectDetailView
              && tasksHeaderState.detailMode === "task"
              && activeTicketNumber
            );
            const isProjectMilestonesView = Boolean(
              isProjectDetailView
              && !isProjectTaskDetailView
              && activeProjectSectionId === "milestones"
            );
            const isProjectDeliveryView = Boolean(
              isProjectDetailView
              && !isProjectTaskDetailView
              && activeProjectSectionId === "delivery"
            );
            const isProjectSettingsView = Boolean(
              isProjectDetailView
              && !isProjectTaskDetailView
              && activeProjectSectionId === "permissions"
            );
            const activeTicketNavigation = isProjectTaskDetailView
              && tasksHeaderState.ticketNavigation
              && Number(tasksHeaderState.ticketNavigation.currentIndex) > 0
              && Number(tasksHeaderState.ticketNavigation.totalCount) > 0
                ? {
                    currentIndex: Number(tasksHeaderState.ticketNavigation.currentIndex),
                    totalCount: Number(tasksHeaderState.ticketNavigation.totalCount),
                    previousTaskId: String(tasksHeaderState.ticketNavigation.previousTaskId || "").trim(),
                    nextTaskId: String(tasksHeaderState.ticketNavigation.nextTaskId || "").trim(),
                  }
                : null;
            const activeProjectsHomeScope = tasksProjectsHomeScope === "created"
              ? "created"
              : tasksProjectsHomeScope === "shared"
                ? "shared"
                : "all";
            const projectId = String(tasksHeaderState.projectId || "").trim();
            const canViewProjectSettings = tasksHeaderState.canViewProjectSettings !== false;
            const canDeleteProject = tasksHeaderState.canDeleteProject !== false;
            const formatProjectHeaderTimestamp = (value) => {
              const timestamp = Date.parse(String(value || ""));
              return Number.isFinite(timestamp)
                ? new Date(timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "—";
            };
            const navigateToProjectSection = (sectionId) => {
              setProjectBreadcrumbMenuOpen(false);
              setTasksProjectViewRequest({
                view: "overview",
                sectionId,
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              });
            };
            const requestProjectDelete = () => {
              if (!canDeleteProject || !projectId) return;
              setProjectBreadcrumbMenuOpen(false);
              setTasksProjectDeleteRequest({
                projectId,
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              });
            };
            const projectBreadcrumbTrailing = isProjectDetailView
              ? React.createElement(PlatformResourceHeaderActions, {
                  className: "playground-project-breadcrumb-actions",
                },
                React.createElement(PlatformResourceActionsMenu, {
                  open: projectBreadcrumbMenuOpen,
                  onOpenChange: setProjectBreadcrumbMenuOpen,
                  resourceLabel: "Project",
                  disabled: !projectId,
                  shortcutActions: canDeleteProject
                    ? {
                        delete: {
                          onInvoke: requestProjectDelete,
                          disabled: !projectId,
                        },
                      }
                    : {},
                },
                  React.createElement(PlatformResourceActionsInformation, {
                    resourceLabel: "Project",
                    items: [
                      {
                        id: "id",
                        label: "ID",
                        value: projectId,
                        title: projectId,
                        monospace: true,
                        copyValue: projectId,
                        copyAriaLabel: "Copy Project ID",
                      },
                      {
                        id: "created",
                        label: "Created",
                        value: formatProjectHeaderTimestamp(tasksHeaderState.createdAt),
                      },
                      {
                        id: "updated",
                        label: "Updated",
                        value: formatProjectHeaderTimestamp(tasksHeaderState.updatedAt),
                      },
                    ],
                  }),
                  React.createElement(PlatformResourceActionsDivider, null),
                  [
                    { id: "general", label: "Home", Icon: House },
                    { id: "resources", label: "Resources", Icon: FolderOpen },
                    { id: "delivery", label: "Delivery", Icon: GitPullRequestArrow },
                    ...(canViewProjectSettings
                      ? [{ id: "permissions", label: "Settings", Icon: Settings2 }]
                      : []),
                  ].map((item) => React.createElement(PlatformResourceActionMenuItem, {
                      key: item.id,
                      icon: React.createElement(item.Icon, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      }),
                      label: item.label,
                      active: activeProjectView === item.id,
                      onClick: () => navigateToProjectSection(item.id),
                    })),
                  React.createElement(PlatformResourceActionsDivider, null),
                  React.createElement(PlatformResourceActionMenuItem, {
                    icon: React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    label: "Copy Project ID",
                    onClick: () => {
                      setProjectBreadcrumbMenuOpen(false);
                      const copyPromise = navigator.clipboard?.writeText(projectId);
                      if (copyPromise) void copyPromise.catch(() => undefined);
                    },
                  }),
                  canDeleteProject
                    ? React.createElement(PlatformResourceActionMenuItem, {
                        icon: React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                        label: "Delete Project",
                        shortcut: "delete",
                        danger: true,
                        onClick: requestProjectDelete,
                      })
                    : null
                )
              )
              : null;
  
            return renderAppHeader({
              className: "playground-tasks-unified-navbar"
                + (isProjectTaskDetailView ? " is-ticket-detail" : ""),
              includeSearchDivider: true,
              pathItems: isProjectDetailView
                ? [
                    { label: "Create" },
                    ...(isProjectTaskDetailView
                      ? []
                      : [{
                          label: "Projects",
                          onClick: () => setTasksProjectBackRequestToken((current) => current + 1),
                        }]),
                    ...(isProjectTaskDetailView
                      ? [
                          {
                            label: projectTitle,
                            leading: projectBreadcrumbLeading,
                            onClick: () => setTasksProjectViewRequest({
                              view: activeProjectWorkspaceView === "resources" ? "overview" : activeProjectWorkspaceView,
                              sectionId: activeProjectWorkspaceView === "resources" ? "resources" : "general",
                              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                            }),
                          },
                          {
                            label: activeTicketNumber,
                            leading: React.createElement("span", {
                              className: "playground-tasks-backlog-project-icon is-" + activeTicketType,
                            }, React.createElement(ActiveTicketTypeIcon, {
                              width: 12,
                              height: 12,
                              strokeWidth: 1.9,
                            })),
                            trailing: React.createElement("span", {
                              id: "playground-ticket-breadcrumb-actions-root",
                              className: "playground-tasks-ticket-breadcrumb-actions-root",
                            }),
                          },
                        ]
                      : [
                          {
                            label: projectTitle,
                            leading: projectBreadcrumbLeading,
                            trailing: projectBreadcrumbTrailing,
                            onClick: isProjectMilestonesView || isProjectDeliveryView
                              ? () => navigateToProjectSection("general")
                              : undefined,
                          },
                          ...(isProjectMilestonesView
                            ? [{ label: "Milestones" }]
                            : isProjectDeliveryView
                              ? [{ label: "Delivery" }]
                              : []),
                        ]),
                  ]
                : [{ label: "Create" }, { label: "Projects" }],
              center: isProjectDetailView
                ? isProjectTaskDetailView
                  ? null
                  : React.createElement(PlatformSwitch, {
                      className: "playground-tasks-nav playground-tasks-project-nav-switch",
                      value: isProjectSettingsView ? "" : activeProjectView,
                      options: [
                        { value: "overview", label: "Progress" },
                        { value: "backlog", label: "Backlog" },
                        { value: "resources", label: "Resources" },
                      ],
                      onValueChange: (nextView) => {
                        setTasksProjectViewRequest({
                          view: nextView === "resources" ? "overview" : nextView,
                          sectionId: nextView === "resources" ? "resources" : "general",
                          token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                        });
                      },
                      ariaLabel: "Project view",
                    })
                : React.createElement(PlatformSwitch, {
                    className: "playground-projects-home-scope-switch",
                    value: activeProjectsHomeScope,
                    options: [
                      { value: "all", label: "All projects" },
                      { value: "created", label: "Created by me" },
                      { value: "shared", label: "Shared with me" },
                    ],
                    onValueChange: setTasksProjectsHomeScope,
                    ariaLabel: "Project scope",
                  }),
              extraActions: isProjectDetailView
                ? React.createElement(React.Fragment, null,
                    (
                      activeProjectWorkspaceView === "backlog"
                      || activeProjectWorkspaceView === "board"
                    ) && !isProjectTaskDetailView
                      ? tasksHeaderState.extraActions || null
                      : null,
                    activeTicketNavigation
                      ? React.createElement("div", {
                          className: "playground-tasks-ticket-navigation",
                          role: "group",
                          "aria-label": "Open ticket navigation",
                        },
                          React.createElement("span", {
                            className: "playground-tasks-ticket-navigation-count",
                            "aria-live": "polite",
                          }, activeTicketNavigation.currentIndex + " / " + activeTicketNavigation.totalCount),
                          React.createElement(PlatformIconButton, {
                            size: "compact",
                            className: "playground-tasks-ticket-navigation-button",
                            disabled: !activeTicketNavigation.nextTaskId,
                            onClick: () => setTasksProjectTaskRequest({
                              taskId: activeTicketNavigation.nextTaskId,
                              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                            }),
                            title: "Next open ticket",
                            "aria-label": "Next open ticket",
                          }, React.createElement(ArrowDown, { width: 14, height: 14, strokeWidth: 2 })),
                          React.createElement(PlatformIconButton, {
                            size: "compact",
                            className: "playground-tasks-ticket-navigation-button",
                            disabled: !activeTicketNavigation.previousTaskId,
                            onClick: () => setTasksProjectTaskRequest({
                              taskId: activeTicketNavigation.previousTaskId,
                              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                            }),
                            title: "Previous open ticket",
                            "aria-label": "Previous open ticket",
                          }, React.createElement(ArrowUp, { width: 14, height: 14, strokeWidth: 2 }))
                        )
                      : null,
                    canViewProjectSettings && !isProjectTaskDetailView
                      ? React.createElement(PlatformSecondaryButton, {
                          type: "button",
                          size: "small",
                          active: isProjectSettingsView,
                          className: "playground-tasks-nav-settings-button",
                          onClick: () => navigateToProjectSection("permissions"),
                          "aria-label": "Project settings",
                          "aria-pressed": isProjectSettingsView ? "true" : "false",
                        },
                          React.createElement(Settings, {
                            width: 14,
                            height: 14,
                            strokeWidth: 1.8,
                            "aria-hidden": "true",
                          }),
                          React.createElement("span", null, "Settings")
                        )
                      : null,
                    React.createElement(PlatformButtonSelector, {
                        mode: "split-action",
                        buttonVariant: "primary",
                        buttonSize: "small",
                        label: "New Issue",
                        leading: React.createElement(Plus, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        }),
                        onAction: () => openProjectIssueComposerFromHeader("task"),
                        actionAriaLabel: "New issue",
                        closeOnSelect: true,
                        popupAriaLabel: "Choose task type",
                        popupAlignment: "right",
                        popupRole: "menu",
                        popupVariant: "minimal",
                        popupWidth: 200,
                        className: "playground-tasks-nav-issue-selector",
                        actionButtonClassName: "playground-files-control-button is-backlog-sort playground-tasks-nav-issue-button",
                      },
                      PLAYGROUND_TASK_TYPE_OPTIONS.map((option) => {
                        const TaskTypeIcon = option.id === "subtask"
                          ? Check
                          : option.id === "loop"
                            ? RefreshCw
                            : Bookmark;
                        return React.createElement("button", {
                            key: option.id,
                            type: "button",
                            role: "menuitem",
                            className: "tb-popup-row",
                            onClick: () => openProjectIssueComposerFromHeader(option.id),
                          },
                          React.createElement("span", {
                            className: "playground-tasks-detail-type-badge is-" + option.id,
                            "aria-hidden": "true",
                          }, React.createElement(TaskTypeIcon, {
                            width: 10,
                            height: 10,
                            strokeWidth: 1.9,
                          })),
                          React.createElement("span", null, option.label)
                        );
                      })
                    )
                  )
                : React.createElement(PlatformPrimaryButton, {
                    type: "button",
                    "aria-label": "New project",
                    title: "New project",
                    onClick: () => setTasksPageNavigationRequest({
                      token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                      projectComposerAction: "create",
                    }),
                  },
                    React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                    React.createElement("span", null, "Project")
                  ),
            });
          }
  
          function renderFilesPageNav() {
            return renderAppHeader({
              className: "playground-files-unified-navbar",
              pathItems: filesPageTopNav?.pathItems || [{ label: "Create" }, { label: "Files" }],
              hidePath: filesPageTopNav?.hidePath === true,
              hideSidebarToggle: filesPageTopNav?.hideSidebarToggle === true,
              leftExtra: filesPageTopNav?.left || null,
              center: filesPageTopNav?.center || null,
              extraActions: filesPageTopNav?.extraActions || null,
              includeSearchDivider: true,
            });
          }
  
  ${IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation}
  ${METRONOME_APP_SCRIPT_FRAGMENTS.modeSwitch}
  ${BATCHES_APP_SCRIPT_FRAGMENTS.topNavigation}
          function renderInitialThreadWelcomeNav() {
            return renderAppHeader({
              className: "playground-thread-welcome-navbar",
              hidePath: true,
              includeGhost: true,
              ghostVariant: "private-chat",
              includeSearchDivider: true,
            });
          }
  
  ${METRONOME_APP_SCRIPT_FRAGMENTS.topNavActions}
  ${CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation}
          function renderGenericPageNav() {
            const isMetronomeEditor = activePage === "metronome" && metronomeTopNavState?.mode === "editor";
            const isMetronomeOverview = activePage === "metronome" && !isMetronomeEditor;
            const metronomePathItems = isMetronomeEditor
              ? [
	                  { label: "Create" },
	                  { label: "Workflows", onClick: () => metronomeTopNavActionsRef.current?.goOverview?.() },
	                  {
	                    label: metronomeTopNavState?.title || "Untitled Workflow",
		                    trailing: renderMetronomeBreadcrumbActions(),
	                  },
	                ]
              : [{ label: "Create" }, { label: "Workflows" }];
            return renderAppHeader({
              pathItems: activePage === "calendar"
                ? [{ label: "Create" }, { label: calendarTopNavState?.label || "Calendar" }]
                : activePage === "batches"
                  ? [{ label: "Create" }, { label: "Batches" }]
                : activePage === "imagine"
                  ? [{ label: "Create" }, { label: "Imagine" }]
                : activePage === "metronome"
                  ? metronomePathItems
                : [{ label: selectedThreadTitle || "Home" }],
              leftExtra: null,
              center: activePage === "calendar"
                ? renderCalendarTopNavCenter()
                : activePage === "imagine"
                  ? renderImagineModeSwitch()
                : activePage === "batches"
                  ? React.createElement("div", {
                      id: "playground-batches-overview-scope",
                      className: "playground-resource-overview-scope-slot",
                    })
                : isMetronomeEditor
                  ? renderMetronomeModeSwitch()
                  : isMetronomeOverview
                    ? React.createElement(PlatformSwitch, {
                        className: "playground-metronome-overview-scope-switch",
                        value: metronomeOverviewScope,
                        options: [
                          { value: "all", label: "All Workflows" },
                          { value: "created", label: "Created by me" },
                          { value: "shared", label: "Shared with me" },
                        ],
                        onValueChange: setMetronomeOverviewScope,
                        ariaLabel: "Workflow scope",
                      })
                    : null,
              includeSearchDivider: activePage === "calendar" || activePage === "batches" || isMetronomeEditor || isMetronomeOverview,
              extraActions: activePage === "imagine"
                ? renderImagineTopNavControls()
                : activePage === "calendar"
                  ? renderCalendarTopNavActions()
                : activePage === "batches"
                  ? React.createElement("div", {
                      id: "playground-batches-overview-controls",
                      className: "playground-resource-overview-controls-slot",
                    })
                : isMetronomeEditor
                  ? renderMetronomeTopNavActions()
                  : isMetronomeOverview
                    ? React.createElement("div", {
                        id: "playground-metronome-overview-controls",
                        className: "playground-resource-overview-controls-slot",
                      })
                    : null,
            });
          }
  
  ${RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.host}          function renderResourcesPage() {
            if (activeResourcesView === "agents") {
              return hasRealAccess
                ? React.createElement(PlaygroundAgentsPage, {
                    key: "resources:agents",
                    backendUrl: proxyBackendBase,
                    requestHeaders,
                    resolveRequestHeaders: resolveRunnerRequestHeaders,
                    apiKey: effectiveApiKey,
                    fetchCustomSkills: handleFetchCustomSkills,
                    speechToTextUrl: speechToTextUrl || "",
                    computerAgents: demoComputerAgents,
                    agents: realAgents,
                    environments: runtimeEnvironments,
                    projects: runnerWorkspaceProjects,
                    skills: demoSkills,
                    currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
                    currentUserName: hasSessionAuth ? accountName : "Agentic Compute Platform",
                    currentUserEmail: hasSessionAuth ? accountEmail : "",
                    currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                    workspaceTeams: teamPageTeams,
                    workspaceTeamMembers: teamPageMembers,
                    workspaceTeamMembersTeamId: teamPageSelectedTeamId,
                    workspaceTeamsLoading: teamPageLoading,
                    workspaceTeamsRequiresPlan: teamPageRequiresPlan,
                    guardrailSets: allGuardrailSets,
                    evaluationSets,
                    setEvaluationSets,
                    onWorkspaceTeamsRequest: (options = {}) => {
                      const requestedTeamId = String(options?.selectedTeamId || options?.teamId || "").trim();
                      void loadTeamPageData({ selectedTeamId: requestedTeamId });
                    },
                    initialAgentId: resolvedPreferredAgentId || "",
                    preferredEnvironmentId: resolvedEnvironmentId || "",
                    preferredAgentId: resolvedPreferredAgentId || "",
                    focusedAgentId: agentPageSelectionRequest?.agentId || "",
                    focusedAgentSelectionToken: agentPageSelectionRequest?.token || "",
                    createAgentRequestToken: agentCreationPageRequestToken,
                    createAgentModelId: agentCreationPageModelId,
                    subscriptionTierId: accountTierId || "",
                    onOpenPromptSearch: (onSelect) => {
                      openPromptSearch(onSelect);
                    },
                    onOpenKnowledgeSearch: (onSelect) => {
                      openKnowledgeSearch(onSelect);
                    },
                    onOpenThreadSearch: (onSelect) => {
                      openThreadReferenceSearch(onSelect);
                    },
                    onPreferredAgentChange: (nextAgentId) => {
                      setPreferredAgentId(String(nextAgentId || "").trim());
                    },
                    onPreferredEnvironmentChange: (nextEnvironmentId) => {
                      setEnvironmentId(String(nextEnvironmentId || "").trim());
                    },
                    onThreadRegistered: (threadId, options = {}) => {
                      const normalizedThreadId = String(threadId || "").trim();
                      if (!normalizedThreadId) {
                        return;
                      }
                      if (options?.private) {
                        registerPrivateThreadId(normalizedThreadId);
                        return;
                      }
                      setCurrentThreadId(normalizedThreadId);
                      void refreshThreads();
                    },
  	                  onThreadOpen: (threadId, options = {}) => {
  	                    const normalizedThreadId = String(threadId || "").trim();
  	                    if (!normalizedThreadId) {
  	                      return;
  	                    }
                      requestPlatformNavigation(() => {
                        if (options?.threadRecord?.id) {
                          upsertRealThreadRecord(options.threadRecord);
                        }
                        const requestedContentMode = options?.contentMode === "changes" ? "changes" : "chat";
                        setThreadAgentSelectionOverride(null);
                        setPendingThreadRunRequest(null);
                        setActivePage("thread");
                        setCurrentThreadId(normalizedThreadId);
                        setContentMode(requestedContentMode);
                        setThreadListMode("threads");
                        setChangesNavigationTarget(null);
  	                      setRunnerRenderKey((current) => current + 1);
  	                      void refreshThreads(undefined, normalizedThreadId);
                      });
  	                  },
  	                  onThreadActionMenuOpen: openThreadActionMenu,
                    threadMutationSignal,
  	                  onThreadStarted: (threadId, options = {}) => {
  	                    const normalizedThreadId = String(threadId || "").trim();
  	                    if (!normalizedThreadId) {
  	                      return;
                      }
                      requestPlatformNavigation(() => {
                        if (options?.threadRecord?.id) {
                          upsertRealThreadRecord(options.threadRecord);
                        }
                        setThreadAgentSelectionOverride(null);
                        if (options?.taskPreview?.taskId) {
                          upsertThreadTaskPreview(normalizedThreadId, {
                            ...options.taskPreview,
                            threadId: normalizedThreadId,
                          });
                        }
                        if (options?.taskRunRequest?.prompt) {
                          setPendingThreadRunRequest({
                            token: options.taskRunRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                            threadId: normalizedThreadId,
                            prompt: options.taskRunRequest.prompt,
                            displayPrompt: options.taskRunRequest.displayPrompt || null,
                            agentId: options.taskRunRequest.agentId || null,
                            attachments: Array.isArray(options.taskRunRequest.attachments) ? options.taskRunRequest.attachments : [],
                            githubRepo: options.taskRunRequest.githubRepo || null,
                            enabledSkills: options.taskRunRequest.enabledSkills || null,
                            connectors: options.taskRunRequest.connectors || null,
                            knowledgeContext: options.taskRunRequest.knowledgeContext || null,
                            environmentId: typeof options.taskRunRequest.environmentId === "string" ? options.taskRunRequest.environmentId : "",
                            quotedSelection: options.taskRunRequest.quotedSelection || null,
                            loopCommand: options.taskRunRequest.loopCommand || null,
                          });
                        } else {
                          setPendingThreadRunRequest(null);
                        }
                        setActivePage("thread");
                        setCurrentThreadId(normalizedThreadId);
                        setContentMode("chat");
                        setThreadListMode("threads");
                        setChangesNavigationTarget(null);
                        setRunnerRenderKey((current) => current + 1);
                        void refreshThreads();
                      });
                    },
                    onAgentMutated: async () => {
                      await refreshAgents({ force: true });
                    },
                    onStartThreadWithAgent: (agentId) => {
                      requestPlatformNavigation(() => {
                        const normalizedAgentId = String(agentId || "").trim();
                        if (normalizedAgentId) {
                          setPreferredAgentId(normalizedAgentId);
                        }
                        handleNewThread();
                      });
                    },
                    onGenerateInstructions: (initialPrompt) => {
                      handleNewThread({
                        initialPrompt: normalizePlaygroundInitialPrompt(initialPrompt) || "/agent",
                      });
                    },
                    onOpenEvaluations: openEvaluationsOverviewPage,
                    onOpenAgentOptimization: openFineTuningOverviewPage,
  ${MODELS_AGENT_SCRIPT_FRAGMENTS.hostProps}                  embeddedInResources: true,
                    topNavActionsPortalId: "playground-resources-nav-actions",
                    titleActionsPortalId: "playground-agent-title-actions",
                    versionsDrawerPortalId: "playground-agent-versions-drawer-root",
                    onResourcesHeaderChange: setResourcesHeaderState,
                    onVersionsSidebarOpenChange: setIsAgentVersionsDetailOpen,
                    onOpenSettingsUsage: () => openSettingsModal("costs-overview"),
                    onNavigationGuardChange: registerPlatformNavigationGuard,
                    onNavigationRequest: requestPlatformNavigation,
                    backRequestToken: resourcesBackRequestToken,
                  })
                : hasDemoAccess
                  ? renderDemoFeaturePage("agents")
                  : renderAuthGate();
            }
  
            return hasRealAccess
              ? React.createElement(PlaygroundEnvironmentsPage, {
                  key: "resources:"
                    + activeResourcesView
                    + (activeResourcesView === "servers"
                      ? ":" + (activeResourcesServerKind || "all")
                      : ""),
                  backendUrl: proxyBackendBase,
                  requestHeaders,
                  environments: realEnvironments,
                  initialEnvironmentId: resolvedEnvironmentId || "",
                  apiKey: effectiveApiKey,
                  fetchCustomSkills: handleFetchCustomSkills,
                  speechToTextUrl: speechToTextUrl || "",
                  computerAgents: demoComputerAgents,
                  agents: runtimeAgents,
                  skills: demoSkills,
                  currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
                  currentUserName: hasSessionAuth ? accountName : "Me",
                  currentUserEmail: hasSessionAuth ? accountEmail : "",
                  currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                  databaseListIdentity,
                  preferredEnvironmentId: resolvedEnvironmentId || "",
                  preferredAgentId: resolvedPreferredAgentId || "",
                  navigationToken: environmentsOpenToken,
                  navigationTargetEnvironmentId: environmentsNavigationTargetId,
                  onPreferredAgentChange: (nextAgentId) => {
                    setPreferredAgentId(String(nextAgentId || "").trim());
                  },
                  onPreferredEnvironmentChange: (nextEnvironmentId) => {
                    setEnvironmentId(String(nextEnvironmentId || "").trim());
                  },
                  onThreadRegistered: (threadId) => {
                    const normalizedThreadId = String(threadId || "").trim();
                    if (!normalizedThreadId) {
                      return;
                    }
                    setCurrentThreadId(normalizedThreadId);
                    void refreshThreads();
                  },
                  onThreadOpen: (threadId) => {
                    const normalizedThreadId = String(threadId || "").trim();
                    if (!normalizedThreadId) {
                      return;
                    }
                    setThreadAgentSelectionOverride(null);
                    setPendingThreadRunRequest(null);
                    setActivePage("thread");
                    setCurrentThreadId(normalizedThreadId);
                    setContentMode("chat");
                    setThreadListMode("threads");
                    setChangesNavigationTarget(null);
                    setRunnerRenderKey((current) => current + 1);
                    void refreshThreads();
                  },
                  onThreadStarted: (threadId, options = {}) => {
                    const normalizedThreadId = String(threadId || "").trim();
                    if (!normalizedThreadId) {
                      return;
                    }
                    if (options?.threadRecord?.id) {
                      upsertRealThreadRecord(options.threadRecord);
                    }
                    setThreadAgentSelectionOverride(null);
                    if (options?.taskPreview?.taskId) {
                      upsertThreadTaskPreview(normalizedThreadId, {
                        ...options.taskPreview,
                        threadId: normalizedThreadId,
                      });
                    }
                    if (options?.taskRunRequest?.prompt) {
                      setPendingThreadRunRequest({
                        token: options.taskRunRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                        threadId: normalizedThreadId,
                        prompt: options.taskRunRequest.prompt,
                        displayPrompt: options.taskRunRequest.displayPrompt || null,
                        agentId: options.taskRunRequest.agentId || null,
                        attachments: Array.isArray(options.taskRunRequest.attachments) ? options.taskRunRequest.attachments : [],
                        githubRepo: options.taskRunRequest.githubRepo || null,
                        enabledSkills: options.taskRunRequest.enabledSkills || null,
                        connectors: options.taskRunRequest.connectors || null,
                        knowledgeContext: options.taskRunRequest.knowledgeContext || null,
                        environmentId: typeof options.taskRunRequest.environmentId === "string" ? options.taskRunRequest.environmentId : "",
                        quotedSelection: options.taskRunRequest.quotedSelection || null,
                        loopCommand: options.taskRunRequest.loopCommand || null,
                      });
                    } else {
                      setPendingThreadRunRequest(null);
                    }
                    setActivePage("thread");
                    setCurrentThreadId(normalizedThreadId);
                    setContentMode("chat");
                    setThreadListMode("threads");
                    setChangesNavigationTarget(null);
                    setRunnerRenderKey((current) => current + 1);
                    void refreshThreads();
                  },
                  onOpenFilesPage: (request) => {
                    const normalizedEnvironmentId = String(request?.environmentId || "").trim();
                    if (normalizedEnvironmentId) {
                      setEnvironmentId(normalizedEnvironmentId);
                    }
                    setFilesPageNavigationRequest(request || null);
                    setActivePage("files");
                  },
                  threadRecords: realThreads,
                  onEnvironmentMutated: async () => {
                    await refreshEnvironments();
                  },
                  workspaceTeams: teamPageTeams,
                  workspaceTeamsLoading: teamPageLoading,
                  workspaceTeamsRequiresPlan: teamPageRequiresPlan,
                  onWorkspaceTeamsRequest: (options = {}) => {
                    const requestedTeamId = String(options?.selectedTeamId || options?.teamId || "").trim();
                    void loadTeamPageData({ selectedTeamId: requestedTeamId });
                  },
                  onOpenTeamPage: (teamId) => {
                    const normalizedTeamId = String(teamId || "").trim();
                    setTeamPageSelectedTeamId(normalizedTeamId);
                    setTeamPageActiveTab("members");
                    openTeamPage();
                    void loadTeamPageData({ selectedTeamId: normalizedTeamId });
                  },
                  embeddedInResources: true,
                  embeddedResourcesView: activeResourcesView === "servers" ? "servers" : "computers",
                  embeddedServerKind: activeResourcesView === "servers" ? activeResourcesServerKind : "",
                  navigationResourceToken: resourcesNavigationTarget.token,
                  navigationTargetResourceType: resourcesNavigationTarget.resourceType,
                  navigationTargetResourceId: resourcesNavigationTarget.resourceId,
                  serverCreationRequestToken: resourcesNavigationTarget.serverCreationToken,
                  serverCreationRequestKind: resourcesNavigationTarget.serverCreationKind,
                  resourceTemplatePreviewResources,
                  topNavActionsPortalId: "playground-resources-nav-actions",
                  computerTitleActionsPortalId: "playground-computer-title-actions",
                  databaseTitleActionsPortalId: "playground-database-title-actions",
                  serverTitleActionsPortalId: "playground-server-title-actions",
                  versionsDrawerPortalId: "playground-agent-versions-drawer-root",
                  onVersionsSidebarOpenChange: setIsAgentVersionsDetailOpen,
                  onResourcesHeaderChange: setResourcesHeaderState,
                  backRequestToken: resourcesBackRequestToken,
                  resourceBillingPreferences: settingsBillingPreferences,
                  resourceBillingSaving: settingsPlatformConfigSaving,
                  resourceBillingError: settingsPlatformConfigError,
                  resourceBillingSuccess: settingsPlatformConfigSuccess,
                  canConfigureResourceBilling: settingsCanConfigureUsageBilling,
                  onResourceBillingPreferencesChange: queueSettingsResourceCapAutosave,
                  developServerOperationalMetrics,
                  developServerOperationalMetricsLoading,
                  developServerOperationalMetricsError,
                  developServerOperationalMetricsPeriod,
                  onDevelopServerOperationalMetricsPeriodChange: setDevelopServerOperationalMetricsPeriod,
                  developServerMetricsChartTab,
                  onDevelopServerMetricsChartTabChange: setDevelopServerMetricsChartTab,
                  developAnalyticsMenuOpen,
                  onDevelopAnalyticsMenuOpenChange: setDevelopAnalyticsMenuOpen,
                  onOpenSettingsUsage: () => openSettingsModal("costs-overview"),
                  onOpenSettingsApi: () => openSettingsModal("api"),
                  onNavigationGuardChange: registerPlatformNavigationGuard,
                  onNavigationRequest: requestPlatformNavigation,
                })
              : hasDemoAccess
                ? renderDemoFeaturePage("environments")
                : renderAuthGate();
          }
  
  ${MODELS_APP_SCRIPT_FRAGMENTS.pageView}${GUARDRAILS_PAGE_RUNTIME_SCRIPT}${TESTS_APP_SCRIPT_FRAGMENTS.pageView}${KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView}${ASSURANCE_APP_SCRIPT_FRAGMENTS.pageView}${EVALUATIONS_APP_SCRIPT_FRAGMENTS.pageView}${FINE_TUNING_APP_SCRIPT_FRAGMENTS.pageView}${MARKETPLACE_APP_SCRIPT_FRAGMENTS.pageView}${CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS.home}${CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS.notifications}
  ${API_KEYS_PAGE_SCRIPT_FRAGMENTS.management}
  ${DEVELOP_HOME_PAGE_SCRIPT}
  ${SECURITY_APP_SCRIPT_FRAGMENTS.pageView}
  ${EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.pageView}
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.statusIndicators}
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.breadcrumbBar}
  ${APP_HEADER_APP_SCRIPT_FRAGMENTS.appHeader}
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.modeSelector}
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.navigationItems}
  ${APP_SIDEBAR_APP_SCRIPT_FRAGMENTS.sidebar}
  ${PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS.modal}
  ${ONBOARDING_APP_SCRIPT_FRAGMENTS.host}
  ${PLAN_GATE_APP_SCRIPT_FRAGMENTS.host}
          const renderedPlaygroundOnboarding = renderPlaygroundOnboardingHost();
          const renderedPlatformPlanGate = renderPlatformPlanGateHost();
          const subscriptionSuccessPlanLabel = settingsCurrentTierId && settingsCurrentTierId !== "sandbox"
            ? formatSubscriptionTier(settingsCurrentTierId)
            : "paid plan";
          const renderedSubscriptionSuccessModal = platformHasCapability("subscriptions") && showSubscriptionSuccessModal
            ? React.createElement(PlaygroundSubscriptionSuccessModal, {
                open: showSubscriptionSuccessModal,
                planLabel: subscriptionSuccessPlanLabel,
                onClose: closeSubscriptionSuccessModal,
                onOpenBilling: handleOpenSubscriptionSuccessBilling,
              })
            : null;
          if (!hasShellAccess && (sessionState.status === "loading" || sessionState.status === "unauthenticated" || sessionState.status === "error")) {
            return React.createElement(React.Fragment, null,
              renderAuthGate(),
              renderedPlaygroundOnboarding,
              renderedSubscriptionSuccessModal,
              renderedPlatformPlanGate
            );
          }
          const ownerDirectoryOrganization = (Array.isArray(organizationPageOrganizations)
            ? organizationPageOrganizations
            : []
          ).find((organization) => isOrganizationPageActiveOrganization(organization))
            || getOrganizationPagePersonalOrganization(organizationPageOrganizations);
          const ownerDirectoryOrganizationId = String(
            ownerDirectoryOrganization?.id
            || activeOrganizationId
            || billingOrganizationId
            || settingsBudgetStatus?.organizationId
            || ""
          ).trim();
  
  	        return (
            React.createElement(PlatformOrganizationMemberDirectoryProvider, {
                organizationId: ownerDirectoryOrganizationId,
                apiBaseUrl: proxyBackendBase,
                requestHeaders,
              },
              React.createElement(React.Fragment, null,
              renderPlatformNavigationGuardModal(),
              renderedPlaygroundOnboarding,
              renderedSubscriptionSuccessModal,
              renderedPlatformPlanGate,
              renderPlatformResourceCreationHost(),
              renderAppHeaderSearchModal(),
              renderAppHeaderNotificationsPopup(),
              renderThreadActionMenu(),
              renderMetronomeRunActionMenu(),
              renderThreadRenameModal(),
              renderThreadProjectPickerModal(),
              renderWelcomeProjectPickerModal(),
              renderSettingsModal(),
              renderAppHeaderAccountMenu(),
              profileEditorOpen
                ? React.createElement(PlatformModalBackdrop, {
                    className: "profile-editor-scrim",
                    onClick: handleProfileEditorClose,
                  },
                    React.createElement(PlatformModalSurface, {
                      className: "profile-editor-modal",
                      onClick: (event) => event.stopPropagation(),
                    },
                      React.createElement("div", { className: "profile-editor-header" },
                        React.createElement("div", { className: "profile-editor-title" }, "Edit Profile"),
                        React.createElement("button", {
                          type: "button",
                          className: "profile-editor-close",
                          onClick: handleProfileEditorClose,
                          "aria-label": "Close profile editor",
                        }, React.createElement(X, { className: "profile-editor-close-icon", strokeWidth: 1.9 }))
                      ),
                      React.createElement("div", { className: "profile-editor-avatar-wrap" },
                        React.createElement("div", { className: "profile-editor-avatar" },
                          React.createElement("div", { className: "profile-editor-avatar-surface" },
                            profileEditorAvatarUrl
                              ? React.createElement("img", {
                                  className: "profile-editor-avatar-image",
                                  src: profileEditorAvatarUrl,
                                  alt: getAccountInitials(profileDraft.displayName || accountName),
                                  onError: () => setProfileEditorAvatarBroken(true),
                                })
                              : React.createElement("span", { className: "profile-editor-avatar-fallback" }, getAccountInitials(profileDraft.displayName || accountName))
                          ),
                          profileEditorAvatarUrl
                            ? React.createElement("button", {
                                type: "button",
                                className: "profile-editor-avatar-remove",
                                onClick: handleProfilePhotoRemove,
                                "aria-label": "Remove profile picture",
                              }, React.createElement(Minus, { className: "profile-editor-camera-icon", strokeWidth: 1.9 }))
                            : null,
                          React.createElement("button", {
                            type: "button",
                            className: "profile-editor-avatar-trigger",
                            onClick: () => profileImageInputRef.current && profileImageInputRef.current.click(),
                            "aria-label": "Upload profile picture",
                          }, React.createElement(Camera, { className: "profile-editor-camera-icon", strokeWidth: 1.9 })),
                          React.createElement("input", {
                            ref: profileImageInputRef,
                            className: "profile-editor-file-input",
                            type: "file",
                            accept: "image/*",
                            onChange: handleProfilePhotoSelection,
                          })
                        )
                      ),
                      React.createElement("div", { className: "profile-editor-fields" },
                        React.createElement("div", { className: "field" },
                          React.createElement("label", { htmlFor: "profile-display-name" }, "Name"),
                          React.createElement("input", {
                            id: "profile-display-name",
                            value: profileDraft.displayName,
                            onChange: (event) => {
                              const nextValue = event.target.value.replace(/\s+/g, " ");
                              setProfileDraft((current) => ({
                                ...current,
                                displayName: nextValue,
                              }));
                            },
                            placeholder: "Your name",
                          })
                        ),
                        React.createElement("div", { className: "field" },
                          React.createElement("label", { htmlFor: "profile-email-address" }, "Email address"),
                          React.createElement("div", {
                            id: "profile-email-address",
                            className: "profile-editor-readonly",
                          }, profileDraft.email || "No email address available")
                        ),
                        React.createElement("div", { className: "profile-editor-hint" },
                          "Your profile uses the same Agentic Compute Platform account details everywhere you sign in."
                        )
                      ),
                      profileSaveState.error
                        ? React.createElement("div", { className: "profile-editor-error" }, profileSaveState.error)
                        : null,
                      React.createElement("div", { className: "profile-editor-actions" },
                        React.createElement(PlatformSecondaryButton, {
                          size: "large",
                          type: "button",
                          className: "profile-editor-button is-secondary",
                          onClick: handleProfileEditorClose,
                          disabled: profileSaveState.status === "saving",
                        }, "Cancel"),
                        React.createElement(PlatformPrimaryButton, {
                          size: "large",
                          type: "button",
                          className: "profile-editor-button is-primary",
                          onClick: handleProfileSave,
                          disabled: profileSaveState.status === "saving",
                        }, profileSaveState.status === "saving" ? "Saving..." : "Save")
                      )
                    )
                  )
                : null,
  	            React.createElement("div", { className: "playground-shell" + (sidebarOpen ? "" : " sidebar-collapsed") + (isProjectShellContext ? " is-projects-page" : "") + (isAgentShellContext ? " is-agents-page" : "") + (isProjectThreadPage ? " is-project-thread-page" : "") + (showInitialThreadWelcome ? " is-initial-thread-page" : "") },
  	              renderAppSidebar(),
  	              React.createElement("main", { className: "playground-main" },
  	                React.createElement("div", { className: "playground-content-shell" + (isThreadTaskDetailOpen ? " is-thread-task-detail-open" : "") + (isThreadSideDetailOpen ? " is-thread-side-detail-open" : "") + (isResourcesSideDetailOpen ? " is-resources-side-detail-open" : "") + (isMetronomeNodeDetailOpen ? " is-metronome-node-detail-open" : "") },
  	                  activePage === "tools"
  	                    ? renderPluginsPageNav()
  	                    : activePage === "configure"
  	                      ? renderConfigureHomeNav()
  	                    : activePage === "models"
  	                      ? renderModelsPageNav()
  	                    : activePage === "guardrails"
  	                      ? renderGuardrailsPageNav()
                            : activePage === "tests"
                              ? renderTestsPageNav()
                            : activePage === "knowledge"
                              ? renderKnowledgePageNav()
                            : activePage === "assurance"
                              ? renderAssurancePageNav()
  	                    : activePage === "evaluations"
  	                      ? renderEvaluationsPageNav()
  	                    : activePage === "fine-tuning"
  	                      ? renderFineTuningPageNav()
  	                    : activePage === "resource-templates"
  	                      ? renderResourceTemplatesPageNav()
  	                    : activePage === "inference"
  	                      ? renderInferencePageNav()
  	                    : activePage === "develop"
  	                      ? renderDevelopHomeNav()
  	                    : activePage === "develop-webhooks"
  	                      ? renderDevelopWebhooksNav()
  	                    : activePage === "develop-api-keys"
  	                      ? renderDevelopApiKeysNav()
                        : activePage === "develop-security"
                          ? renderDevelopSecurityNav()
                        : activePage === "develop-evidence-agents"
                          ? renderDevelopEvidenceAgentsNav()
  	                    : isResourcesPage
  	                      ? renderResourcesPageNav()
  	                    : activePage === "team"
  	                      ? renderTeamPageNav()
  	                    : activePage === "organization"
  	                      ? renderOrganizationPageNav()
  	                    : showInitialThreadWelcome
  	                      ? renderInitialThreadWelcomeNav()
  	                    : activePage === "tasks"
  	                      ? renderTasksPageNav()
  	                    : activePage === "files"
  	                      ? renderFilesPageNav()
  	                    : activePage === "imagine"
  	                      ? renderGenericPageNav()
                    : activePage === "metronome"
                      ? renderGenericPageNav()
                    : activePage === "batches"
                      ? renderBatchesPageNav()
                    : activePage === "calendar"
  	                      ? renderGenericPageNav()
  	                    : renderAppHeader({
  	                        className: "playground-thread-navbar",
                            pathItems: getThreadPagePathItems(),
                          center: activePage === "thread" && !isThreadSideDetailOpen
                              ? React.createElement(PlatformSwitch, {
                                  className: "playground-thread-details-mode-switch",
                                  ariaLabel: "Thread view",
                                  value: contentMode === "changes" ? "changes" : "chat",
                                  options: [
                                    { value: "chat", label: "Thread" },
                                    { value: "changes", label: "Activity", disabled: !currentThreadId },
                                  ],
                                  onValueChange: (nextMode) => {
                                    if (nextMode === "changes" && !currentThreadId) return;
                                    if (nextMode === "changes") {
                                      setThreadExecutionWorkbenchOpen(false);
                                    }
                                    setContentMode(nextMode === "changes" ? "changes" : "chat");
                                  },
                                })
                              : null,
                          hideCommonActions: activePage !== "thread" || isThreadSideDetailOpen,
                          includeSearchDivider: true,
                          extraActions: activePage === "thread" && !isThreadSideDetailOpen
                              ? React.createElement(React.Fragment, null,
                                  contentMode === "chat" && currentThreadId
                                    ? React.createElement(PlatformIconButton, {
                                        type: "button",
                                        size: "medium",
                                        className: "playground-thread-execution-workbench-button",
                                        active: threadExecutionWorkbenchOpen,
                                        "aria-label": threadExecutionWorkbenchOpen
                                          ? "Close execution details"
                                          : "Open execution details",
                                        "aria-pressed": threadExecutionWorkbenchOpen,
                                        title: "Execution details",
                                        onClick: () => setThreadExecutionWorkbenchOpen((current) => !current),
                                      }, React.createElement(ClipboardList, { strokeWidth: 1.75 }))
                                    : null,
                                )
                              : null,
  	                    }),
                          React.createElement("div", { className: "playground-content-body" + (isThreadTaskDetailOpen ? " is-thread-task-detail-open" : "") + (isThreadSideDetailOpen ? " is-thread-side-detail-open" : "") + (isMetronomeNodeDetailOpen ? " is-metronome-node-detail-open" : "") + (isResourcesVersionsDrawerOpen ? " is-agent-versions-detail-open" : "") + (isSourceDeployableCodeContentRoute ? " is-source-deployable-code-route" : "") + (activePage === "files" || activePage === "batches" || activePage === "guardrails" || activePage === "tests" || activePage === "knowledge" || activePage === "assurance" || activePage === "evaluations" || activePage === "fine-tuning" ? " is-files-page" : "") + (activePage === "batches" ? " is-batches-page" : "") + (activePage === "guardrails" ? " is-guardrails-page" : "") + (activePage === "tests" ? " is-tests-page" : "") + (activePage === "knowledge" ? " is-knowledge-page" : "") + (activePage === "assurance" ? " is-assurance-page" : "") + (activePage === "evaluations" ? " is-evaluations-page" : "") + (activePage === "fine-tuning" ? " is-fine-tuning-page" : "") + (activePage === "imagine" ? " is-imagine-page" : "") + (activePage === "metronome" ? " is-metronome-page" : "") + (activePage === "tasks" ? " is-tasks-page" : "") + (activePage === "calendar" ? " is-calendar-page" : "") },
                              React.createElement(React.Suspense, {
                                fallback: React.createElement(PlatformLoadingState, {
                                  className: "playground-content-route-loading",
                                  message: "Loading page...",
                                  centered: true,
                                }),
                              },
                                activePage === "team"
  	                        ? hasRealAccess
  	                          ? renderTeamPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("team")
  	                            : renderAuthGate()
  	                      : activePage === "organization"
  	                        ? hasRealAccess
  	                          ? renderOrganizationPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("team")
  	                            : renderAuthGate()
  	                      : activePage === "configure"
  	                        ? hasRealAccess
                              ? configureHomeTab === "notifications"
                                ? renderConfigureNotificationsPage()
                                : renderConfigureHomePage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "models"
  	                        ? hasRealAccess
  	                          ? renderModelsPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "guardrails"
  	                        ? hasRealAccess
  	                          ? renderGuardrailsPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
                              : activePage === "tests"
                                ? hasRealAccess
                                  ? renderTestsPage()
                                  : hasDemoAccess
                                    ? renderDemoFeaturePage("resources")
                                    : renderAuthGate()
                              : activePage === "knowledge"
                                ? hasRealAccess
                                  ? renderKnowledgePage()
                                  : hasDemoAccess
                                    ? renderDemoFeaturePage("resources")
                                    : renderAuthGate()
                              : activePage === "assurance"
                                ? hasRealAccess
                                  ? renderAssurancePage()
                                  : hasDemoAccess
                                    ? renderDemoFeaturePage("resources")
                                    : renderAuthGate()
  	                      : activePage === "evaluations"
  	                        ? hasRealAccess
  	                          ? renderEvaluationsPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "fine-tuning"
  	                        ? hasRealAccess
  	                          ? renderFineTuningPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "resource-templates"
  	                        ? hasRealAccess
  	                          ? renderResourceTemplatesPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "inference"
  	                        ? hasRealAccess
                              ? renderSettingsSurface({ section: "inference", hideHeader: true })
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "develop"
  	                        ? hasRealAccess
  	                          ? renderDevelopHomePage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "develop-webhooks"
  	                        ? hasRealAccess
  	                          ? renderDevelopWebhooksPage()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
  	                      : activePage === "develop-api-keys"
  	                        ? hasRealAccess
  	                          ? renderApiKeysManagementPanel()
  	                          : hasDemoAccess
  	                            ? renderDemoFeaturePage("resources")
  	                            : renderAuthGate()
                          : activePage === "develop-security"
                            ? hasRealAccess
                              ? renderDevelopSecurityPage()
                              : hasDemoAccess
                                ? renderDemoFeaturePage("resources")
                                : renderAuthGate()
                          : activePage === "develop-evidence-agents"
                            ? hasRealAccess
                              ? renderDevelopEvidenceAgentsPage()
                              : hasDemoAccess
                                ? renderDemoFeaturePage("resources")
                                : renderAuthGate()
  	                      : activePage === "tools"
                          ? hasRealAccess
                            ? renderPluginsPage()
                            : hasDemoAccess
                              ? renderDemoFeaturePage("skills")
                              : renderAuthGate()
                        : activePage === "files"
                          ? hasRealAccess
                            ? React.createElement(PlaygroundFilesPage, {
                                backendUrl: proxyBackendBase,
                                requestHeaders,
                                environments: realEnvironments,
                                initialEnvironmentId: resolvedEnvironmentId || "",
                                apiKey: effectiveApiKey,
                                agentId: resolvedComposerAgentId || "",
                                agents: runtimeAgentsForComposer,
                                organizationId: billingOrganizationId || settingsBudgetStatus?.organizationId || "",
                                connectorConnectionStatuses: {
                                  github: githubStatus,
                                  "google-drive": googleDriveStatus,
                                  "one-drive": oneDriveStatus,
                                },
                                isAgentSelectionBlocked: isComposerAgentSelectionBlocked,
                                onBlockedAgentSelect: handleBlockedComposerAgentSelect,
                                onFileChatThreadMutated: () => {
                                  void refreshThreads();
                                },
                                onThreadOpen: (threadId, options = {}) => {
                                  const normalizedThreadId = String(threadId || "").trim();
                                  if (!normalizedThreadId) {
                                    return;
                                  }
                                  if (options?.threadRecord?.id) {
                                    upsertRealThreadRecord(options.threadRecord);
                                  }
                                  setThreadAgentSelectionOverride(null);
                                  setPendingThreadRunRequest(null);
                                  setPendingThreadDocumentPreviewRequest(options?.documentPreviewAttachment ? {
                                    threadId: normalizedThreadId,
                                    token: options.documentPreviewToken || buildPlaygroundStableDocumentPreviewToken(normalizedThreadId, options.documentPreviewAttachment),
                                    attachment: options.documentPreviewAttachment,
                                  } : null);
                                  setThreadTaskOpenRequest(null);
                                  setActivePage("thread");
                                  setCurrentThreadId(normalizedThreadId);
                                  setContentMode("chat");
                                  setThreadListMode("threads");
                                  setChangesNavigationTarget(null);
                                  setRunnerRenderKey((current) => current + 1);
                                  void refreshThreads(undefined, normalizedThreadId);
                                },
                                onThreadStarted: (threadId, options = {}) => {
                                  const normalizedThreadId = String(threadId || "").trim();
                                  if (!normalizedThreadId) {
                                    return;
                                  }
                                  if (options?.threadRecord?.id) {
                                    upsertRealThreadRecord(options.threadRecord);
                                  }
                                  setThreadAgentSelectionOverride(null);
                                  setPendingThreadDocumentPreviewRequest(options?.documentPreviewAttachment ? {
                                    threadId: normalizedThreadId,
                                    token: options.documentPreviewToken || buildPlaygroundStableDocumentPreviewToken(normalizedThreadId, options.documentPreviewAttachment),
                                    attachment: options.documentPreviewAttachment,
                                  } : null);
                                  if (options?.taskRunRequest?.prompt) {
                                    setPendingThreadRunRequest({
                                      token: options.taskRunRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                                      threadId: normalizedThreadId,
                                      prompt: options.taskRunRequest.prompt,
                                      displayPrompt: options.taskRunRequest.displayPrompt || null,
                                      agentId: options.taskRunRequest.agentId || null,
                                      agentName: options.taskRunRequest.agentName || null,
                                      attachments: Array.isArray(options.taskRunRequest.attachments) ? options.taskRunRequest.attachments : [],
                                      githubRepo: options.taskRunRequest.githubRepo || null,
                                      enabledSkills: options.taskRunRequest.enabledSkills || null,
                                      connectors: options.taskRunRequest.connectors || null,
                                      knowledgeContext: options.taskRunRequest.knowledgeContext || null,
                                      environmentId: typeof options.taskRunRequest.environmentId === "string" ? options.taskRunRequest.environmentId : "",
                                      quotedSelection: options.taskRunRequest.quotedSelection || null,
                                      loopCommand: options.taskRunRequest.loopCommand || null,
                                    });
                                  } else {
                                    setPendingThreadRunRequest(null);
                                  }
                                  setThreadTaskOpenRequest(null);
                                  setActivePage("thread");
                                  setCurrentThreadId(normalizedThreadId);
                                  setContentMode("chat");
                                  setThreadListMode("threads");
                                  setChangesNavigationTarget(null);
                                  setRunnerRenderKey((current) => current + 1);
                                  void refreshThreads(undefined, normalizedThreadId);
                                },
                                navigationRequest: filesPageNavigationRequest,
                                onNavigationRequestHandled: (token) => {
                                  setFilesPageNavigationRequest((current) => (
                                    current && current.token === token ? null : current
                                  ));
                                },
                                onOpenEnvironmentSettings: (nextEnvironmentId) => {
                                  const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
                                  if (normalizedEnvironmentId) {
                                    setEnvironmentsNavigationTargetId(normalizedEnvironmentId);
                                    setEnvironmentId(normalizedEnvironmentId);
                                  }
                                  setSidebarWorkspaceMode("configure");
                                  setResourcesView("computers");
                                  setResourcesHeaderState({
                                    mode: "overview",
                                    title: "",
                                  });
                                  setActivePage("resources");
                                  setEnvironmentsOpenToken((current) => current + 1);
                                },
                                onCreateEnvironment: () => {
                                  openPlatformResourceCreationModal("computer");
                                },
                                onEnvironmentMutated: async () => {
                                  await refreshEnvironments();
                                },
                                onEnvironmentChange: (nextEnvironmentId) => {
                                  const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
                                  if (normalizedEnvironmentId) {
                                    setEnvironmentId(normalizedEnvironmentId);
                                  }
                                },
                                onRequestSidebarCollapse: () => {
                                  setSidebarOpen(false);
                                },
                                onTopNavChange: setFilesPageTopNav,
                              })
                            : hasDemoAccess
                              ? renderDemoFeaturePage("files")
                              : renderAuthGate()
                        : activePage === "imagine"
                          ? hasRealAccess
                            ? React.createElement(PlaygroundImaginePage, {
                                backendUrl: proxyBackendBase,
                                apiKey: effectiveApiKey,
                                fetchCustomSkills: computerAgentsMode ? handleFetchCustomSkills : undefined,
                                speechToTextUrl: speechToTextUrl || "",
                                requestHeaders,
                                computerAgents: computerAgentsMode ? {
                                  ...demoComputerAgents,
                                  projects: {
                                    items: runnerWorkspaceProjects,
                                    selectedProjectId: latestInteractedProjectId || "",
                                    onProjectChange: (nextProjectId) => {
                                      const normalizedProjectId = String(nextProjectId || "").trim();
                                      setLatestInteractedProjectId(normalizedProjectId);
                                    },
                                  },
                                } : undefined,
                                environments: computerAgentsMode ? runtimeEnvironments.map((environment) => ({
                                  ...environment,
                                  ...(resolvedEnvironmentId && environment.id === resolvedEnvironmentId ? { isDefault: true } : {})
                                })) : [],
                                agents: computerAgentsMode ? runtimeAgentsForComposer.map((agent) => (
                                  buildPlaygroundRunnerAgentOption(agent, resolvedComposerAgentId && agent.id === resolvedComposerAgentId ? { isDefault: true } : {})
                                )) : [],
                                isAgentSelectionBlocked: isComposerAgentSelectionBlocked,
                                onBlockedAgentSelect: handleBlockedComposerAgentSelect,
                                skills: computerAgentsMode ? demoSkills : [],
                                skillDefaults: getDemoImageGenerationSkillDefaults(),
                                canGenerateVideo: canGenerateImagineVideo,
                                onOpenPromptSearch: (onSelect) => {
                                  openPromptSearch(onSelect);
                                },
                                onOpenKnowledgeSearch: (onSelect) => {
                                  openKnowledgeSearch(onSelect);
                                },
                                onOpenThreadSearch: (onSelect) => {
                                  openThreadReferenceSearch(onSelect);
                                },
                                environmentId: resolvedEnvironmentId || "",
                                agentId: resolvedComposerAgentId || "",
                                onAgentChange: (nextAgentId) => {
                                  setThreadAgentSelectionOverride(String(nextAgentId || "").trim() || null);
                                },
                                onEnvironmentChange: (nextEnvironmentId) => {
                                  const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
                                  if (normalizedEnvironmentId) {
                                    setEnvironmentId(normalizedEnvironmentId);
                                  }
                                },
                                onRequireAuth: handleSignInWithComputerAgents,
                                activeView: imagineActiveView,
                                mediaMode: imagineMediaMode,
                                filterMode: imagineFilterMode,
                                sortMode: imagineSortMode,
                                focusedTemplateId: imagineTemplateSelectionRequest?.templateId || "",
                                focusedTemplateSelectionToken: imagineTemplateSelectionRequest?.token || "",
                                onActiveViewChange: setImagineActiveView,
                                onMediaModeChange: setImagineMediaMode,
                                onOpenPlansBudget: () => {
                                  requestPlatformPlanGate({
                                    mode: "budget",
                                    title: "Usage budget required",
                                    source: "imagine",
                                  });
                                },
                                onThreadStarted: (threadId, options = {}) => {
                                  const normalizedThreadId = String(threadId || "").trim();
                                  if (!normalizedThreadId) {
                                    return;
                                  }
                                  setThreadAgentSelectionOverride(null);
                                  if (options?.taskRunRequest?.prompt) {
                                    const requestProjectId = String(options.taskRunRequest.projectId || options.projectId || "").trim();
                                    if (requestProjectId) {
                                      setLatestInteractedProjectId(requestProjectId);
                                    }
                                    setPendingThreadRunRequest({
                                      token: options.taskRunRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                                      threadId: normalizedThreadId,
                                      projectId: requestProjectId || null,
                                      prompt: options.taskRunRequest.prompt,
                                      displayPrompt: options.taskRunRequest.displayPrompt || null,
                                      agentId: options.taskRunRequest.agentId || null,
                                      agentName: options.taskRunRequest.agentName || null,
                                      attachments: Array.isArray(options.taskRunRequest.attachments) ? options.taskRunRequest.attachments : [],
                                      githubRepo: options.taskRunRequest.githubRepo || null,
                                      enabledSkills: options.taskRunRequest.enabledSkills || null,
                                      connectors: options.taskRunRequest.connectors || null,
                                      knowledgeContext: options.taskRunRequest.knowledgeContext || null,
                                      environmentId: typeof options.taskRunRequest.environmentId === "string" ? options.taskRunRequest.environmentId : "",
                                      quotedSelection: options.taskRunRequest.quotedSelection || null,
                                      slideCreationCommand: options.taskRunRequest.slideCreationCommand || null,
                                      researchCreationCommand: options.taskRunRequest.researchCreationCommand || null,
                                      scrapeCreationCommand: options.taskRunRequest.scrapeCreationCommand || null,
                                      parseCreationCommand: options.taskRunRequest.parseCreationCommand || null,
                                      adCreationCommand: options.taskRunRequest.adCreationCommand || null,
                                      loopCommand: options.taskRunRequest.loopCommand || null,
                                    });
                                  } else {
                                    setPendingThreadRunRequest(null);
                                  }
                                  setThreadTaskOpenRequest(null);
                                  setActivePage("thread");
                                  setCurrentThreadId(normalizedThreadId);
                                  setContentMode("chat");
                                  setThreadListMode("threads");
                                  setChangesNavigationTarget(null);
                                  setRunnerRenderKey((current) => current + 1);
                                  void refreshThreads(undefined, normalizedThreadId);
                                },
                                onThreadTitleGenerated: (threadId, nextTitle) => {
                                  upsertRealThreadTitle(threadId, nextTitle);
                                },
                              })
                            : hasDemoAccess
                              ? renderDemoFeaturePage("imagine")
                              : renderAuthGate()
                        : activePage === "metronome"
                          ? hasRealAccess
                            ? React.createElement(PlaygroundMetronomePage, {
                                onTopNavStateChange: setMetronomeTopNavState,
                                topNavActionsRef: metronomeTopNavActionsRef,
                                onNodeDetailOpenChange: setIsMetronomeNodeDetailOpen,
                                inspectorPortalId: "playground-metronome-node-drawer-root",
                                overviewControlsPortalId: "playground-metronome-overview-controls",
                                agents: metronomeAgentsForComposer.map((agent) => (
                                  buildPlaygroundRunnerAgentOption(agent, resolvedComposerAgentId && agent.id === resolvedComposerAgentId ? { isDefault: true } : {})
                                )),
                                environments: realEnvironments,
                                projects: realProjects,
                                projectFilterId: metronomeProjectFilterId,
                                overviewScope: metronomeOverviewScope,
                                openWorkflowRequest: metronomeOpenWorkflowRequest,
                                onOpenWorkflowRequestHandled: (token) => {
                                  setMetronomeOpenWorkflowRequest((current) => (
                                    current && current.token === token ? null : current
                                  ));
                                },
                                backendUrl: proxyBackendBase,
                                apiKey: effectiveApiKey,
                                requestHeaders,
                                threadComposerProps: {
                                  backendUrl: proxyBackendBase,
                                  apiKey: effectiveApiKey,
                                  speechToTextUrl: speechToTextUrl || undefined,
                                  fetchCustomSkills: computerAgentsMode ? handleFetchCustomSkills : undefined,
                                  requestHeaders,
                                  resolveRequestHeaders: resolveRunnerRequestHeaders,
                                  computerAgents: computerAgentsMode ? {
                                    ...demoComputerAgents,
                                    projects: {
                                      items: runnerWorkspaceProjects,
                                      selectedProjectId: latestInteractedProjectId || "",
                                      onProjectChange: (nextProjectId) => {
                                        setLatestInteractedProjectId(String(nextProjectId || "").trim());
                                      },
                                    },
                                  } : undefined,
                                  environments: computerAgentsMode ? runtimeEnvironments.map((environment) => ({
                                    ...environment,
                                    ...(resolvedEnvironmentId && environment.id === resolvedEnvironmentId ? { isDefault: true } : {}),
                                  })) : [],
                                  agents: computerAgentsMode ? runtimeAgentsForComposer.map((agent) => (
                                    buildPlaygroundRunnerAgentOption(agent, resolvedComposerAgentId && agent.id === resolvedComposerAgentId ? { isDefault: true } : {})
                                  )) : [],
                                  isAgentSelectionBlocked: computerAgentsMode ? isComposerAgentSelectionBlocked : undefined,
                                  onBlockedAgentSelect: computerAgentsMode ? handleBlockedComposerAgentSelect : undefined,
                                  skills: computerAgentsMode ? demoSkills : [],
                                  enabledSkillIds: computerAgentsMode ? runnerEnabledSkillIds : undefined,
                                  onSkillsChange: computerAgentsMode ? setRunnerEnabledSkillIds : undefined,
                                  skillDefaults: getDemoImageGenerationSkillDefaults(),
                                  environmentId: resolvedEnvironmentId || undefined,
                                  agentId: resolvedComposerAgentId || undefined,
                                  onAgentChange: (nextAgentId) => {
                                    setThreadAgentSelectionOverride(String(nextAgentId || "").trim() || null);
                                  },
                                  onEnvironmentChange: (nextEnvironmentId) => {
                                    const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
                                    if (normalizedEnvironmentId) setEnvironmentId(normalizedEnvironmentId);
                                  },
                                  onOpenPluginsOverview: () => {
                                    setSelectedPluginId("");
                                    openToolsView("plugins");
                                  },
                                  onOpenPromptSearch: (onSelect) => openPromptSearch(onSelect),
                                  onOpenKnowledgeSearch: (onSelect) => openKnowledgeSearch(onSelect),
                                  onOpenThreadSearch: (onSelect) => openThreadReferenceSearch(onSelect),
                                },
                                currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
                                currentUserName: hasSessionAuth ? accountName : "User",
                                currentUserEmail: hasSessionAuth ? accountEmail : "",
                                currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                                onNavigationGuardChange: registerPlatformNavigationGuard,
                                onNavigationRequest: requestPlatformNavigation,
                                onThreadOpen: (threadId, options = {}) => {
                                  const normalizedThreadId = String(threadId || "").trim();
                                  if (!normalizedThreadId) {
                                    return;
                                  }
                                  if (options?.threadRecord?.id) {
                                    upsertRealThreadRecord(options.threadRecord);
                                  }
                                  const requestedContentMode = options?.contentMode === "changes" ? "changes" : "chat";
                                  setThreadAgentSelectionOverride(null);
                                  setPendingThreadRunRequest(null);
                                  setThreadTaskOpenRequest(null);
                                  setActivePage("thread");
                                  setCurrentThreadId(normalizedThreadId);
                                  setContentMode(requestedContentMode);
                                  setThreadListMode("threads");
                                  setChangesNavigationTarget(null);
                                  setRunnerRenderKey((current) => current + 1);
                                  void refreshThreads(undefined, normalizedThreadId);
                                },
                              })
                            : hasDemoAccess
                              ? renderDemoFeaturePage("resources")
                              : renderAuthGate()
                        : activePage === "batches"
                          ? hasRealAccess
                            ? React.createElement(BatchesWorkspacePage, {
                                shouldLoadData: activePage === "batches",
                                backendUrl: proxyBackendBase + "/batch-jobs",
                                resourceBackendUrl: proxyBackendBase,
                                requestHeaders: authRequestHeaders,
                                controlsPortalId: "playground-batches-overview-controls",
                                scopePortalId: "playground-batches-overview-scope",
                                currentUser: {
                                  id: hasSessionAuth ? String(sessionState.userId || "").trim() : "",
                                  name: hasSessionAuth ? accountName : "",
                                  email: hasSessionAuth ? accountEmail : "",
                                  avatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                                },
                                threadComposerProps: {
                                  backendUrl: proxyBackendBase,
                                  apiKey: effectiveApiKey,
                                  speechToTextUrl: speechToTextUrl || undefined,
                                  fetchCustomSkills: computerAgentsMode ? handleFetchCustomSkills : undefined,
                                  requestHeaders,
                                  resolveRequestHeaders: resolveRunnerRequestHeaders,
                                  computerAgents: computerAgentsMode ? {
                                    ...demoComputerAgents,
                                    projects: {
                                      items: runnerWorkspaceProjects,
                                      selectedProjectId: latestInteractedProjectId || "",
                                      onProjectChange: (nextProjectId) => {
                                        setLatestInteractedProjectId(String(nextProjectId || "").trim());
                                      },
                                    },
                                  } : undefined,
                                  environments: computerAgentsMode ? runtimeEnvironments.map((environment) => ({
                                    ...environment,
                                    ...(resolvedEnvironmentId && environment.id === resolvedEnvironmentId ? { isDefault: true } : {}),
                                  })) : [],
                                  agents: computerAgentsMode ? runtimeAgentsForComposer.map((agent) => (
                                    buildPlaygroundRunnerAgentOption(agent, resolvedComposerAgentId && agent.id === resolvedComposerAgentId ? { isDefault: true } : {})
                                  )) : [],
                                  isAgentSelectionBlocked: computerAgentsMode ? isComposerAgentSelectionBlocked : undefined,
                                  onBlockedAgentSelect: computerAgentsMode ? handleBlockedComposerAgentSelect : undefined,
                                  skills: computerAgentsMode ? demoSkills : [],
                                  enabledSkillIds: computerAgentsMode ? runnerEnabledSkillIds : undefined,
                                  onSkillsChange: computerAgentsMode ? setRunnerEnabledSkillIds : undefined,
                                  skillDefaults: getDemoImageGenerationSkillDefaults(),
                                  environmentId: resolvedEnvironmentId || undefined,
                                  agentId: resolvedComposerAgentId || undefined,
                                  onAgentChange: (nextAgentId) => {
                                    setThreadAgentSelectionOverride(String(nextAgentId || "").trim() || null);
                                  },
                                  onEnvironmentChange: (nextEnvironmentId) => {
                                    const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
                                    if (normalizedEnvironmentId) setEnvironmentId(normalizedEnvironmentId);
                                  },
                                  onOpenPluginsOverview: () => {
                                    setSelectedPluginId("");
                                    openToolsView("plugins");
                                  },
                                  onOpenPromptSearch: (onSelect) => openPromptSearch(onSelect),
                                  onOpenKnowledgeSearch: (onSelect) => openKnowledgeSearch(onSelect),
                                  onOpenThreadSearch: (onSelect) => openThreadReferenceSearch(onSelect),
                                },
                              })
                            : hasDemoAccess
                              ? renderDemoFeaturePage("resources")
                              : renderAuthGate()
                        : isResourcesPage
                          ? renderResourcesPage()
                        : activePage === "tasks" || activePage === "calendar"
                          ? hasRealAccess
                            ? React.createElement(PlaygroundTasksPage, {
                              backendUrl: proxyBackendBase,
                              requestHeaders: authRequestHeaders,
                              agents: runtimeAgents,
                              environments: runtimeEnvironments,
                              initialEnvironmentId: resolvedEnvironmentId || "",
                              initialAgentId: resolvedPreferredAgentId || "",
                              apiKey: effectiveApiKey,
                              upstreamUrl: resolvedUpstreamUrl,
                              speechToTextUrl: speechToTextUrl || "",
                              subscriptionTierId: settingsCurrentTierId || accountTierId || "",
  	                            computerAgents: demoComputerAgents,
  	                            skills: demoSkills,
  	                            currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
  	                            currentUserName: hasSessionAuth ? accountName : "Agentic Compute Platform",
  	                            currentUserEmail: hasSessionAuth ? accountEmail : "",
                              currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                              canStartThreads: hasRealAccess,
                              hasRealAccess,
                              taskRunStates: taskRunStates,
                              threadRecords: realThreads,
                              openTaskRequest: taskOpenRequest,
                              navigationRequest: tasksPageNavigationRequest,
                              onTaskRunStateChange: applyTaskRunState,
                              onStartAgentReviewThread: startAgentReviewThreadForTask,
                              onStatusIndicatorItemChange: upsertStatusIndicatorItem,
                              onNavigationRequestHandled: (token) => {
                                setTasksPageNavigationRequest((current) => (
                                  current && current.token === token ? null : current
                                ));
                              },
                              onProjectScopeChange: (nextProjectId) => {
                                const normalizedProjectId = String(nextProjectId || "").trim();
                                if (!normalizedProjectId) {
                                  return;
                                }
                                setLatestInteractedProjectId(normalizedProjectId);
                              },
                              onProjectRecordCommitted: handleThreadProjectRecordCommitted,
                              onOpenFilesPage: (request) => {
                                const normalizedEnvironmentId = String(request?.environmentId || "").trim();
                                if (normalizedEnvironmentId) {
                                  setEnvironmentId(normalizedEnvironmentId);
                                }
                                setFilesPageNavigationRequest(request || null);
                                setActivePage("files");
                              },
                              onOpenProjectMetronomes: (request = {}) => {
                                const normalizedProjectId = String(request?.projectId || "").trim();
                                const normalizedWorkflowId = String(request?.workflowId || "").trim();
                                openMetronomePage(normalizedWorkflowId
                                  ? { workflowId: normalizedWorkflowId }
                                  : { projectId: normalizedProjectId });
                              },
                              onOpenResourceTemplatesPage: openResourceTemplatesPage,
                              onOpenPromptSearch: (onSelect) => openPromptSearch(onSelect),
                              onOpenKnowledgeSearch: (onSelect) => openKnowledgeSearch(onSelect),
                              onOpenEvaluationSearch: (onSelect) => openEvaluationSearch(onSelect),
                              onOpenFileSearch: (onSelect, options) => openFileSearch(onSelect, options),
                              onOpenWorkflowSearch: (onSelect) => openWorkflowSearch(onSelect),
                              onOpenServerResourceSearch: (resourceType, onSelect) => openServerResourceSearch(resourceType, onSelect),
                              onOpenProjectLinkedResource: openProjectLinkedResourceFromProject,
                              attachmentPreviewPortalId: "playground-task-attachment-preview-root",
                              projectOverviewResourceFilter,
                              setProjectOverviewResourceFilter,
                              projectOverviewResourceSearchQuery,
                              setProjectOverviewResourceSearchQuery,
                              projectOverviewResourceViewMode,
                              setProjectOverviewResourceViewMode,
                              projectOverviewResourceToolbarPopover,
                              setProjectOverviewResourceToolbarPopover,
                              projectOverviewResourceMenuId,
                              setProjectOverviewResourceMenuId,
                              workspaceTeams: teamPageTeams,
                              workspaceTeamMembers: teamPageMembers,
                              workspaceTeamMembersTeamId: teamPageSelectedTeamId,
                              workspaceTeamsLoading: teamPageLoading,
                              workspaceTeamsRequiresPlan: teamPageRequiresPlan,
                              onWorkspaceTeamsRequest: (options = {}) => {
                                const requestedTeamId = String(options?.selectedTeamId || options?.teamId || "").trim();
                                void loadTeamPageData({ selectedTeamId: requestedTeamId });
                              },
  	                            onOpenTeamPage: (teamId = "", options = {}) => {
  	                              const normalizedTeamId = String(teamId || "").trim();
  	                              const requestedTab = options?.tab === "resources"
  	                                ? "resources"
  	                                : options?.tab === "roles" || options?.tab === "permissions"
  	                                  ? "roles"
  	                                  : "members";
  	                              openTeamPage();
  	                              setTeamPageSelectedTeamId(normalizedTeamId);
  	                              setTeamPageActiveTab(requestedTab);
  	                              if (requestedTab === "roles") {
  	                                setTeamPageSelectedRoleId(normalizePlaygroundTeamRoleId(options?.roleId, "member"));
  	                              }
  	                              void loadTeamPageData({ selectedTeamId: normalizedTeamId });
  	                            },
                              onThreadOpen: (threadId, options = {}) => {
                                const normalizedThreadId = String(threadId || "").trim();
                                if (!normalizedThreadId) {
                                  return;
                                }
                                if (options?.threadRecord?.id) {
                                  upsertRealThreadRecord(options.threadRecord);
                                }
                                setThreadAgentSelectionOverride(null);
                                setPendingThreadRunRequest(null);
                                setThreadTaskOpenRequest(null);
                                setActivePage("thread");
                                setCurrentThreadId(normalizedThreadId);
                                setContentMode("chat");
                                setThreadListMode("threads");
                                setChangesNavigationTarget(null);
                                setRunnerRenderKey((current) => current + 1);
                                void refreshThreads(undefined, normalizedThreadId);
                              },
                              onThreadOptionsOpen: (event, threadId, options = {}) => {
                                const normalizedThreadId = String(threadId || "").trim();
                                if (!normalizedThreadId) {
                                  return;
                                }
                                if (options?.threadRecord?.id) {
                                  upsertRealThreadRecord(options.threadRecord);
                                }
                                openThreadActionMenu(event, normalizedThreadId, options?.threadRecord || null, options);
                              },
                              onBackgroundThreadCreated: handleBackgroundThreadCreated,
                              onThreadStarted: (threadId, options = {}) => {
                                const normalizedThreadId = String(threadId || "").trim();
                                if (!normalizedThreadId) {
                                  return;
                                }
                                if (options?.threadRecord?.id) {
                                  upsertRealThreadRecord(options.threadRecord, {
                                    taskPreview: options?.taskPreview || null,
                                    status: options?.taskRunRequest?.prompt ? "running" : "",
                                  });
                                }
                                if (options?.taskPreview?.taskId) {
                                  upsertThreadTaskPreview(normalizedThreadId, {
                                    ...options.taskPreview,
                                    threadId: normalizedThreadId,
                                  });
                                }
                                if (options?.taskPreview?.environmentId) {
                                  setEnvironmentId(options.taskPreview.environmentId);
                                }
                                setThreadAgentSelectionOverride(null);
                                if (options?.taskRunRequest?.prompt) {
                                  if (options.taskRunRequest.executionStarted) {
                                    setPendingThreadRunRequest(null);
                                    void loadThreadGroundTruthStatus(normalizedThreadId);
                                    void refreshThreads(undefined, normalizedThreadId);
                                  } else {
                                    setPendingThreadRunRequest({
                                      token: options.taskRunRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                                      threadId: normalizedThreadId,
                                      prompt: options.taskRunRequest.prompt,
                                      displayPrompt: options.taskRunRequest.displayPrompt || null,
                                      agentId: options.taskRunRequest.agentId || null,
                                      attachments: Array.isArray(options.taskRunRequest.attachments) ? options.taskRunRequest.attachments : [],
                                      githubRepo: options.taskRunRequest.githubRepo || null,
                                      enabledSkills: options.taskRunRequest.enabledSkills || null,
                                      connectors: options.taskRunRequest.connectors || null,
                                      knowledgeContext: options.taskRunRequest.knowledgeContext || null,
                                      environmentId: typeof options.taskRunRequest.environmentId === "string" ? options.taskRunRequest.environmentId : "",
                                      loopCommand: options.taskRunRequest.loopCommand || null,
                                    });
                                  }
                                } else {
                                  setPendingThreadRunRequest(null);
                                }
                                setThreadTaskOpenRequest(null);
                                setActivePage("thread");
                                setCurrentThreadId(normalizedThreadId);
                                setContentMode(options?.contentMode === "changes" ? "changes" : "chat");
                                setThreadListMode("threads");
                                setChangesNavigationTarget(null);
                                setRunnerRenderKey((current) => current + 1);
                                void refreshThreads(undefined, normalizedThreadId);
                              },
                              onRequireAuth: handleSignInWithComputerAgents,
                              onRequestSidebarCollapse: () => {
                                setSidebarOpen(false);
                              },
                              standaloneMode: activePage === "calendar" ? "calendar" : "",
                              useUnifiedProjectNav: activePage === "tasks",
                              projectsHomeScope: tasksProjectsHomeScope,
                              onTasksHeaderChange: setTasksHeaderState,
                              onCalendarTopNavStateChange: setCalendarTopNavState,
                              calendarTopNavActionsRef,
                              onProjectIssueCreateHandlerChange: handleProjectIssueCreateHandlerChange,
                              projectNavBackRequestToken: tasksProjectBackRequestToken,
                              projectNavViewRequest: tasksProjectViewRequest,
                              projectNavTaskRequest: tasksProjectTaskRequest,
                              projectNavSettingsRequestToken: tasksProjectSettingsRequestToken,
                              projectNavIssueRequest: tasksProjectIssueRequest,
                              projectNavDeleteRequest: tasksProjectDeleteRequest,
                            })
                            : hasDemoAccess
                              ? renderDemoFeaturePage("tasks")
                              : renderAuthGate()
                        : React.createElement(React.Fragment, null,
                            React.createElement("div", { className: "playground-view-pane" + (contentMode === "chat" ? "" : " is-hidden") },
                              React.createElement("div", { className: "runner-host" },
                                (hasRealAccess || (hasDemoAccess && showInitialThreadWelcome))
                                  ? metronomeRunTraceSelection?.key
                                    ? renderMetronomeRunTraceThreadSurface()
                                    : React.createElement(RunnerChat, {
                                      key: runnerRenderKey,
                                      className: "playground-thread-runner"
                                        + (selectedThreadShellBackground ? " is-project-wallpaper-active" : "")
                                        + (showInitialThreadWelcome ? " is-initial-welcome-runner" : ""),
                                      backendUrl: proxyBackendBase,
                                      apiKey: effectiveApiKey,
                                      onBatchJobCreate: handleQuickBatchJobCreate,
                                      fetchCustomSkills: computerAgentsMode ? handleFetchCustomSkills : undefined,
                                      speechToTextUrl: speechToTextUrl || undefined,
                                      requestHeaders,
                                      resolveRequestHeaders: resolveRunnerRequestHeaders,
                                      appId: "runner-web-sdk-demo",
                                      threadId: activeRunnerThreadId || undefined,
                                      threadMetadata: !activeRunnerThreadId && pendingThreadKnowledgeContext
                                        ? { knowledgeContext: pendingThreadKnowledgeContext }
                                        : null,
                                      threadViewMode: "legacy",
                                      inputMode: computerAgentsMode ? "computer-agents" : "minimal",
                                      computerAgents: computerAgentsMode ? {
                                        ...demoComputerAgents,
                                        projects: {
                                          items: runnerWorkspaceProjects,
                                          selectedProjectId: latestInteractedProjectId || "",
                                          onProjectChange: (nextProjectId) => {
                                            const normalizedProjectId = String(nextProjectId || "").trim();
                                            setLatestInteractedProjectId(normalizedProjectId);
                                          },
                                        },
                                      } : undefined,
                                      environments: computerAgentsMode ? runtimeEnvironments.map((environment) => ({
                                        ...environment,
                                        ...(resolvedEnvironmentId && environment.id === resolvedEnvironmentId ? { isDefault: true } : {})
                                      })) : undefined,
                                      agents: computerAgentsMode ? runtimeAgentsForComposer.map((agent) => (
                                        buildPlaygroundRunnerAgentOption(agent, resolvedComposerAgentId && agent.id === resolvedComposerAgentId ? { isDefault: true } : {})
                                      )) : undefined,
                                      isAgentSelectionBlocked: computerAgentsMode ? isComposerAgentSelectionBlocked : undefined,
                                      onBlockedAgentSelect: computerAgentsMode ? handleBlockedComposerAgentSelect : undefined,
                                      skills: computerAgentsMode ? demoSkills : undefined,
                                      enabledSkillIds: computerAgentsMode ? runnerEnabledSkillIds : undefined,
                                      onSkillsChange: computerAgentsMode ? setRunnerEnabledSkillIds : undefined,
                                      skillDefaults: getDemoImageGenerationSkillDefaults(),
                                      environmentId: resolvedEnvironmentId || undefined,
                                      agentId: resolvedComposerAgentId || undefined,
                                      autoFocusComposer: true,
                                      keepFocusOnSubmit: true,
                                      showUsageInStatus: false,
                                      placeholder: "Ask anything",
                                      initialTask: showInitialThreadWelcome ? initialLandingPrompt : "",
  	                                    privateMode: runnerComposerPrivateMode,
  	                                    hiddenSystemPrompt: pendingThreadRunRequest && pendingThreadRunRequest.threadId === activeRunnerThreadId
  	                                      ? ""
  	                                      : selectedThreadProjectContextPrompt,
  	                                    enableResourceCreationCommand: true,
                                      resourceCreationCommandHiddenPrompt: buildThreadRunnerResourceHiddenPrompt,
                                      enableAgentCreationCommand: !isFreeComposerAgentPlan,
                                      agentCreationCommandHiddenPrompt: buildThreadRunnerAgentHiddenPrompt,
                                      enableSkillCreationCommand: true,
                                      skillCreationCommandHiddenPrompt: buildThreadRunnerSkillHiddenPrompt,
                                      emptyState: showInitialThreadWelcome ? renderInitialThreadWelcome() : undefined,
                                      emptyStateAfterComposer: showInitialThreadWelcome ? renderInitialThreadWelcome("after") : undefined,
                                      composerProjectTasks: showInitialThreadWelcome ? welcomeComposerTaskPreviews : undefined,
                                      selectedComposerProjectTask: showInitialThreadWelcome ? selectedWelcomeComposerTaskPreview : null,
                                      composerWorkflowTriggers: showInitialThreadWelcome ? metronomeComposerWorkflowTriggers : undefined,
                                      onComposerWorkflowTriggerSubmit: showInitialThreadWelcome
                                        ? handleComposerMetronomeWorkflowTriggerSubmit
                                        : undefined,
                                      composerPlanTierId: settingsCurrentTierId || accountTierId || "sandbox",
                                      composerOrganizations: getComposerOrganizationOptions(),
                                      composerOrganizationId: getActiveComposerOrganizationId(),
                                      onComposerOrganizationChange: handleComposerOrganizationChange,
                                      showComposerCreateAgentAction: showWelcomeComposerCreateAgentAction && !isFreeComposerAgentPlan,
                                      onComposerCreateAgentClick: showInitialThreadWelcome && !isFreeComposerAgentPlan ? openAgentCreationInResources : undefined,
                                      onComposerProjectTaskChange: showInitialThreadWelcome
                                        ? (taskPreview) => {
                                            setSelectedWelcomeComposerTaskId(String(taskPreview?.taskId || "").trim());
                                          }
                                        : undefined,
                                      onComposerProjectTaskSubmit: showInitialThreadWelcome ? handleWelcomeComposerProjectTaskSubmit : undefined,
                                      onOpenPluginsOverview: () => {
                                        setSelectedPluginId("");
                                        openToolsView("plugins");
                                      },
                                      onOpenPromptSearch: (onSelect) => {
                                        openPromptSearch(onSelect);
                                      },
                                      onOpenKnowledgeSearch: (onSelect) => {
                                        openKnowledgeSearch(onSelect);
                                      },
                                      onOpenThreadSearch: (onSelect) => {
                                        openThreadReferenceSearch(onSelect);
                                      },
                                      onOpenPlansBudget: () => {
                                        requestPlatformPlanGate({
                                          mode: "budget",
                                          title: "Usage budget required",
                                          source: "composer",
                                        });
                                      },
                                      initialSurfaceLoading: selectedThreadInitialSurfaceLoading,
                                      threadTaskList: {
                                        status: selectedThreadTaskListState.status,
                                        error: selectedThreadTaskListState.error || "",
                                        items: selectedThreadTaskListTodos,
                                      },
                                      threadTaskPreview: selectedThreadTaskPreviewForDisplay || undefined,
                                      threadMissionControlPreview: selectedThreadMissionControlPreview || undefined,
                                      followUpActions: selectedThreadFollowUpActions,
                                      followUpError: threadFollowUpActionState.error || "",
                                      activeTaskPreviewId: threadTaskOpenRequest?.taskId || null,
                                      onOpenTaskList: openCurrentThreadTaskListMenu,
                                      onTaskListChange: handleThreadTaskListChange,
                                      initialDocumentPreviewAttachment: pendingThreadDocumentPreviewRequest && pendingThreadDocumentPreviewRequest.threadId === activeRunnerThreadId
                                        ? pendingThreadDocumentPreviewRequest.attachment
                                        : null,
                                      initialDocumentPreviewToken: pendingThreadDocumentPreviewRequest && pendingThreadDocumentPreviewRequest.threadId === activeRunnerThreadId
                                        ? pendingThreadDocumentPreviewRequest.token
                                        : null,
                                      externalRunRequest: pendingThreadRunRequest && pendingThreadRunRequest.threadId === activeRunnerThreadId
                                        ? pendingThreadRunRequest
                                        : null,
                                      externalPromptAttachmentRequest: !activeRunnerThreadId
                                        ? pendingThreadPromptAttachmentRequest
                                        : null,
                                      onExternalPromptAttachmentRequestHandled: (token) => {
                                        setPendingThreadPromptAttachmentRequest((current) => (
                                          current && current.token === token ? null : current
                                        ));
                                      },
                                      onExternalRunRequestHandled: (token) => {
                                        setPendingThreadRunRequest((current) => (
                                          current && current.token === token ? null : current
                                        ));
                                      },
                                      onTaskPreviewClick: (taskPreview) => {
                                        const resolvedProjectId = String(taskPreview?.projectId || selectedThreadProjectId || "").trim();
                                        if (!taskPreview?.taskId || !resolvedProjectId) {
                                          return;
                                        }
                                        if (activeRunnerThreadId || currentThreadId) {
                                          const normalizedThreadId = String(activeRunnerThreadId || currentThreadId || "").trim();
                                          if (normalizedThreadId) {
                                            setThreadProjectContextById((current) => ({
                                              ...current,
                                              [normalizedThreadId]: {
                                                projectId: resolvedProjectId,
                                                projectName: String(taskPreview?.projectName || current[normalizedThreadId]?.projectName || "").trim(),
                                              },
                                            }));
                                          }
                                        }
                                        setThreadTaskOpenRequest({
                                          projectId: resolvedProjectId,
                                          taskId: taskPreview.taskId,
                                          threadId: activeRunnerThreadId || currentThreadId || "",
                                          token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                                        });
                                      },
                                      onResourcePreviewClick: async (resourcePreview) => {
                                        if (!resourcePreview) {
                                          return;
                                        }
                                        if (resourcePreview.resourceType === "knowledge") {
                                          const normalizedLibraryId = String(resourcePreview.id || "").trim();
                                          const originThreadId = String(activeRunnerThreadId || currentThreadId || "").trim();
                                          if (!normalizedLibraryId || !originThreadId) {
                                            return;
                                          }
                                          let resolvedLibraryName = String(resourcePreview.name || "").trim();
                                          if (!resolvedLibraryName || resolvedLibraryName === "Knowledge Library") {
                                            try {
                                              const response = await fetch(
                                                proxyBackendBase + "/knowledge/" + encodeURIComponent(normalizedLibraryId),
                                                { credentials: "include", cache: "no-store", headers: requestHeaders }
                                              );
                                              if (response.ok) {
                                                const payload = await response.json();
                                                resolvedLibraryName = String(payload?.library?.name || "").trim();
                                              }
                                            } catch {
                                              // The resource still opens by immutable ID if its display name cannot be refreshed.
                                            }
                                          }
                                          requestPlatformNavigation(() => openKnowledgeLibraryFromThread(
                                            normalizedLibraryId,
                                            resolvedLibraryName || "Knowledge Library",
                                            originThreadId,
                                            selectedThreadTitle || "Current thread"
                                          ));
                                          return;
                                        }
                                        if (resourcePreview.resourceType === "environment") {
                                          const normalizedEnvironmentId = String(resourcePreview.id || "").trim();
                                          if (!normalizedEnvironmentId) {
                                            return;
                                          }
                                          setEnvironmentsNavigationTargetId(normalizedEnvironmentId);
                                          setEnvironmentId(normalizedEnvironmentId);
                                          setSidebarWorkspaceMode("configure");
                                          setResourcesView("computers");
                                          setResourcesHeaderState({
                                            mode: "overview",
                                            title: "",
                                          });
                                          setActivePage("resources");
                                          setEnvironmentsOpenToken((current) => current + 1);
                                          return;
                                        }
                                        if (resourcePreview.resourceType === "project") {
                                          const normalizedProjectId = String(resourcePreview.id || resourcePreview.projectId || "").trim();
                                          if (!normalizedProjectId) {
                                            return;
                                          }
                                          setLatestInteractedProjectId(normalizedProjectId);
                                          setThreadTaskOpenRequest(null);
                                          setTasksPageNavigationRequest({
                                            token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                                            projectId: normalizedProjectId,
                                            view: "overview",
                                            missionControlAction: "",
                                            projectComposerAction: "",
                                          });
                                          setActivePage("tasks");
                                          return;
                                        }
                                        if (resourcePreview.resourceType === "agent") {
                                          const rawAgentId = String(resourcePreview.id || "").trim();
                                          const normalizedAgentName = String(resourcePreview.name || "").trim().toLowerCase();
                                          const isSyntheticAgentPreviewId = /^agent:/i.test(rawAgentId);
                                          let resolvedAgentId = isSyntheticAgentPreviewId ? "" : rawAgentId;
  
                                          if (!resolvedAgentId && normalizedAgentName) {
                                            resolvedAgentId = runtimeAgentIdsByNormalizedName.get(normalizedAgentName) || "";
                                          }
  
                                          if (!resolvedAgentId && normalizedAgentName) {
                                            const refreshedAgents = await refreshAgents();
                                            const refreshedAgent = (Array.isArray(refreshedAgents) ? refreshedAgents : [])
                                              .find((agent) => String(agent?.name || "").trim().toLowerCase() === normalizedAgentName) || null;
                                            resolvedAgentId = String(refreshedAgent?.id || "").trim();
                                          }
  
                                          if (!resolvedAgentId) {
                                            return;
                                          }
                                          openAgentDetailsInResources(resolvedAgentId);
                                        }
                                      },
                                      onAgentTurnClick: handleThreadTurnAgentClick,
                                      onSummaryWorkspacePathClick: handleThreadSummaryWorkspacePathClick,
                                      onThreadIdChange: (threadId) => {
                                        const normalizedThreadId = String(threadId || "").trim();
                                        if (absorbedMetronomeTriggerThreadIdsRef.current?.[normalizedThreadId]) {
                                          return;
                                        }
                                        setInitialLandingPrompt("");
                                        const isPrivateRun = initialThreadPrivateMode || isPrivateThreadId(normalizedThreadId);
                                        if (isPrivateRun) {
                                          registerPrivateThreadId(normalizedThreadId);
                                        }
                                        setActivePage("thread");
                                        setCurrentThreadId(normalizedThreadId);
                                        setPendingThreadKnowledgeContext(null);
                                        setPendingThreadRunRequest((current) => (
                                          current && current.threadId === normalizedThreadId ? current : null
                                        ));
                                        if (!isPrivateRun) {
                                          void refreshThreads();
                                        }
                                      },
                                      onThreadTitleChange: (threadId, nextTitle) => {
                                        if (absorbedMetronomeTriggerThreadIdsRef.current?.[String(threadId || "").trim()]) {
                                          return;
                                        }
                                        if (initialThreadPrivateMode || isPrivateThreadId(threadId)) {
                                          return;
                                        }
                                        upsertRealThreadTitle(threadId, nextTitle);
                                        void refreshThreads();
                                      },
                                      onRunStart: (threadId) => {
                                        const normalizedThreadId = String(threadId || "").trim();
                                        if (absorbedMetronomeTriggerThreadIdsRef.current?.[normalizedThreadId]) {
                                          return;
                                        }
                                        setInitialLandingPrompt("");
                                        const isPrivateRun = initialThreadPrivateMode || isPrivateThreadId(normalizedThreadId);
                                        if (isPrivateRun) {
                                          registerPrivateThreadId(normalizedThreadId);
                                        }
                                        setActivePage("thread");
                                        setCurrentThreadId(normalizedThreadId);
                                        if (!isPrivateRun) {
                                          updateRealThreadStatus(normalizedThreadId, "running");
                                          void refreshThreads();
                                          void loadThreadGroundTruthStatus(normalizedThreadId);
                                        }
                                      },
                                      onThreadStatusChange: (threadId, nextStatus) => {
                                        const normalizedThreadId = String(threadId || "").trim();
                                        const normalizedStatus = String(nextStatus || "").trim();
                                        if (absorbedMetronomeTriggerThreadIdsRef.current?.[normalizedThreadId]) {
                                          return;
                                        }
                                        if (!normalizedThreadId || !normalizedStatus || isPrivateThreadId(normalizedThreadId)) {
                                          return;
                                        }
                                        updateRealThreadStatus(normalizedThreadId, normalizedStatus);
                                        if (normalizedStatus === "permission_asked") {
                                          void refreshThreads(undefined, normalizedThreadId, { silent: true });
                                        }
                                      },
                                      onRunFinish: (result, threadId) => {
                                        const normalizedThreadId = String(threadId || "").trim();
                                        if (absorbedMetronomeTriggerThreadIdsRef.current?.[normalizedThreadId]) {
                                          return;
                                        }
                                        if (metronomeRunTraceSelectionRef.current?.key) {
                                          if (!isPrivateThreadId(normalizedThreadId)) {
                                            void loadThreadGroundTruthStatus(normalizedThreadId);
                                            void loadThreadTaskListForThread(normalizedThreadId, { force: true });
                                            void refreshThreads();
                                          }
                                          return;
                                        }
                                        setActivePage("thread");
                                        setCurrentThreadId(normalizedThreadId);
                                        if (!isPrivateThreadId(normalizedThreadId)) {
                                          void loadThreadGroundTruthStatus(normalizedThreadId);
                                          void loadThreadTaskListForThread(normalizedThreadId, { force: true });
                                          void refreshThreads();
                                        }
                                      },
                                      onRunCancel: (threadId) => {
                                        const normalizedThreadId = String(threadId || "").trim();
                                        if (absorbedMetronomeTriggerThreadIdsRef.current?.[normalizedThreadId]) {
                                          return;
                                        }
                                        setActivePage("thread");
                                        setCurrentThreadId(normalizedThreadId);
                                        if (!isPrivateThreadId(normalizedThreadId)) {
                                          updateRealThreadStatus(normalizedThreadId, "cancelled");
                                          void loadThreadGroundTruthStatus(normalizedThreadId);
                                          void refreshThreads(undefined, normalizedThreadId);
                                        }
                                      },
                                      onRunError: (error, threadId) => {
                                        const normalizedThreadId = String(threadId || "").trim();
                                        if (absorbedMetronomeTriggerThreadIdsRef.current?.[normalizedThreadId]) {
                                          return;
                                        }
                                        if (!normalizedThreadId || isPrivateThreadId(normalizedThreadId)) {
                                          return;
                                        }
                                        void loadThreadGroundTruthStatus(normalizedThreadId);
                                        void refreshThreads();
                                      },
                                      onMetronomeWorkflowRun: handleMetronomeWorkflowRunFromThread,
                                      executionWorkbenchOpen: threadExecutionWorkbenchOpen,
                                      onExecutionWorkbenchOpenChange: setThreadExecutionWorkbenchOpen,
                                      onExecutionWorkbenchAvailabilityChange: setThreadExecutionWorkbenchAvailable,
                                      onDocumentPreviewOpenChange: (isOpen) => {
                                        setThreadDocumentPreviewOpen(isOpen);
                                        if (isOpen) {
                                          setPendingThreadDocumentPreviewRequest((current) => (
                                            current && current.threadId === activeRunnerThreadId ? null : current
                                          ));
                                        }
                                      },
                                      onDeepResearchDetailOpenChange: (isOpen) => {
                                        setThreadDeepResearchDetailOpen(isOpen);
                                      },
                                      onSubagentDetailOpenChange: (isOpen) => {
                                        setThreadSubagentDetailOpen(isOpen);
                                      },
                                      onAgentChange: (nextAgentId) => {
                                        const normalizedAgentId = String(nextAgentId || "").trim();
                                        setPreferredAgentId(normalizedAgentId);
                                        if (activePage === "thread" && currentThreadId) {
                                          setThreadAgentSelectionOverride({
                                            threadId: currentThreadId,
                                            agentId: normalizedAgentId,
                                          });
                                        } else {
                                          setThreadAgentSelectionOverride(null);
                                        }
                                      },
                                      onEnvironmentChange: (nextEnvironmentId) => {
                                        setEnvironmentId(String(nextEnvironmentId || "").trim());
                                      },
  	                                    onActionSummaryClick: (summary) => {
  	                                      if (!activeRunnerThreadId || !summary?.revertedChangeStepId) {
  	                                        return;
  	                                      }
                                        setChangesNavigationTarget({
                                          token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                                          threadId: activeRunnerThreadId,
                                          stepId: summary.revertedChangeStepId,
                                          filePath: summary.revertedFilePath || null,
                                          openDetail: true,
                                        });
  	                                      setContentMode("changes");
  	                                    },
                                      onOpenChanges: () => {
                                        setChangesNavigationTarget(null);
                                        setContentMode("changes");
                                      },
                                      renderUserPromptContent: renderEvaluatorThreadUserPromptContent,
                                      renderRunSummaryJsonSegment: renderEvaluatorRunSummaryJsonSegment,
  	                                    subagentDetailPortalTarget: threadSubagentDetailHost,
  	                                    documentPreviewPortalTarget: threadSubagentDetailHost,
  	                                    documentPreviewPortalOnly: true,
                                      disableSubagentDetailDrawer: isThreadTaskDetailOpen,
                                    })
                                  : hasDemoAccess
                                    ? renderDemoThreadChatSurface()
                                    : renderAuthGate()
                              )
                            ),
                            React.createElement("div", { className: "playground-view-pane" + (contentMode === "changes" ? "" : " is-hidden") },
                              contentMode === "changes"
                                ? hasRealAccess
                                  ? metronomeRunTraceSelection?.key
                                    ? renderMetronomeRunTraceActivitySurface()
                                    : React.createElement(ThreadChangesView, {
                                        threadId: activeRunnerThreadId,
                                        threadTitle: selectedThreadTitle,
                                        backendUrl: proxyBackendBase,
                                        apiKey: effectiveApiKey,
                                        upstreamUrl: resolvedUpstreamUrl,
                                        hasRealAccess,
                                        currentUserName: hasSessionAuth ? accountName : "User",
                                        currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                                        onThreadMutated: () => refreshThreads(),
                                        navigationTarget: changesNavigationTarget,
                                        onNavigationTargetHandled: (token) => {
                                          setChangesNavigationTarget((current) => (current && current.token === token ? null : current));
                                        },
                                      })
                                  : hasDemoAccess
                                    ? renderDemoThreadChangesSurface()
                                    : renderAuthGate()
                                : null
                            )
                          )
                      )
                    )
                    ,
                    activePage === "metronome"
                      ? React.createElement("div", {
                          id: "playground-metronome-node-drawer-root",
                          className: "platform-floating-sidebar-portal",
                        })
                      : null
                    ,
                    activePage === "tasks" || activePage === "calendar"
                      ? React.createElement("div", {
                          id: "playground-task-attachment-preview-root",
                          className: "platform-floating-sidebar-portal playground-task-attachment-preview-portal",
                        })
                      : null
                    ,
                    hasResourcesVersionsDrawerSlot
                      ? React.createElement("aside", {
                          id: "playground-agent-versions-drawer-root",
                          className: "playground-metronome-node-drawer playground-agent-versions-node-drawer" + (isResourcesVersionsDrawerOpen ? " is-open" : ""),
                        })
                      : null
                    ,
                    activePage === "thread" && hasRealAccess
                      ? React.createElement("aside", { className: "playground-thread-task-drawer" + (threadTaskOpenRequest ? " is-open" : "") },
                          threadTaskOpenRequest
                            ? React.createElement(PlaygroundTasksPage, {
                                backendUrl: proxyBackendBase,
                                requestHeaders: authRequestHeaders,
                                agents: runtimeAgents,
                                environments: runtimeEnvironments,
                                initialEnvironmentId: resolvedEnvironmentId || "",
                                initialAgentId: resolvedPreferredAgentId || "",
                                apiKey: effectiveApiKey,
                                upstreamUrl: resolvedUpstreamUrl,
                                speechToTextUrl: speechToTextUrl || "",
                                subscriptionTierId: settingsCurrentTierId || accountTierId || "",
                                computerAgents: demoComputerAgents,
                                skills: demoSkills,
                                currentUserName: hasSessionAuth ? accountName : "Agentic Compute Platform",
                                currentUserEmail: hasSessionAuth ? accountEmail : "",
                                currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
                                canStartThreads: hasRealAccess,
                                hasRealAccess,
                                taskRunStates: taskRunStates,
                                threadRecords: realThreads,
                                openTaskRequest: threadTaskOpenRequest,
                                navigationRequest: null,
                                onTaskRunStateChange: applyTaskRunState,
                                onStartAgentReviewThread: async (...args) => {
                                  const reviewThread = await startAgentReviewThreadForTask(...args);
                                  setThreadTaskOpenRequest(null);
                                  return reviewThread;
                                },
                                onStatusIndicatorItemChange: upsertStatusIndicatorItem,
                                onTaskRecordCommitted: (taskRecord) => {
                                  const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
                                  if (!normalizedTask?.id) {
                                    return;
                                  }
                                  const previewsByThreadId = new Map();
                                  const currentThreadPreview = selectedThreadTaskPreviewRef.current || selectedThreadTaskPreview || null;
                                  const currentThreadPreviewId = String(activeRunnerThreadId || currentThreadId || "").trim();
                                  if (
                                    currentThreadPreviewId
                                    && currentThreadPreview
                                    && String(currentThreadPreview.taskId || "").trim() === normalizedTask.id
                                  ) {
                                    previewsByThreadId.set(currentThreadPreviewId, currentThreadPreview);
                                  }
                                  Object.entries(threadTaskPreviewOverrides || {}).forEach(([threadId, preview]) => {
                                    const normalizedThreadId = String(threadId || "").trim();
                                    if (
                                      normalizedThreadId
                                      && preview
                                      && typeof preview === "object"
                                      && String(preview.taskId || "").trim() === normalizedTask.id
                                    ) {
                                      previewsByThreadId.set(normalizedThreadId, preview);
                                    }
                                  });
                                  (realThreadsRef.current || []).forEach((thread) => {
                                    const normalizedThreadId = String(thread?.id || "").trim();
                                    const preview = getThreadTaskPreview(thread);
                                    if (
                                      normalizedThreadId
                                      && preview
                                      && String(preview.taskId || "").trim() === normalizedTask.id
                                    ) {
                                      previewsByThreadId.set(normalizedThreadId, preview);
                                    }
                                  });
                                  previewsByThreadId.forEach((preview, threadId) => {
                                    upsertThreadTaskPreview(
                                      threadId,
                                      buildLiveThreadTaskPreview(normalizedTask, preview, threadId)
                                    );
                                  });
                                },
                                onNavigationRequestHandled: () => {},
                                onProjectScopeChange: (nextProjectId) => {
                                  const normalizedProjectId = String(nextProjectId || "").trim();
                                  if (!normalizedProjectId) {
                                    return;
                                  }
                                  setLatestInteractedProjectId(normalizedProjectId);
                                },
                                onProjectRecordCommitted: handleThreadProjectRecordCommitted,
                                onOpenFilesPage: (request) => {
                                  const normalizedEnvironmentId = String(request?.environmentId || "").trim();
                                  if (normalizedEnvironmentId) {
                                    setEnvironmentId(normalizedEnvironmentId);
                                  }
                                  setFilesPageNavigationRequest(request || null);
                                  setActivePage("files");
                                },
                                onOpenProjectMetronomes: (request = {}) => {
                                  const normalizedProjectId = String(request?.projectId || "").trim();
                                  const normalizedWorkflowId = String(request?.workflowId || "").trim();
                                  openMetronomePage(normalizedWorkflowId
                                    ? { workflowId: normalizedWorkflowId }
                                    : { projectId: normalizedProjectId });
                                },
                                onOpenResourceTemplatesPage: openResourceTemplatesPage,
                                onOpenPromptSearch: (onSelect) => openPromptSearch(onSelect),
                                onOpenKnowledgeSearch: (onSelect) => openKnowledgeSearch(onSelect),
                                onOpenEvaluationSearch: (onSelect) => openEvaluationSearch(onSelect),
                                onOpenFileSearch: (onSelect, options) => openFileSearch(onSelect, options),
                                onOpenWorkflowSearch: (onSelect) => openWorkflowSearch(onSelect),
                                onOpenServerResourceSearch: (resourceType, onSelect) => openServerResourceSearch(resourceType, onSelect),
                                onOpenProjectLinkedResource: openProjectLinkedResourceFromProject,
                                projectOverviewResourceFilter,
                                setProjectOverviewResourceFilter,
                                projectOverviewResourceSearchQuery,
                                setProjectOverviewResourceSearchQuery,
                                projectOverviewResourceViewMode,
                                setProjectOverviewResourceViewMode,
                                projectOverviewResourceToolbarPopover,
                                setProjectOverviewResourceToolbarPopover,
                                projectOverviewResourceMenuId,
                                setProjectOverviewResourceMenuId,
                                workspaceTeams: teamPageTeams,
                                workspaceTeamMembers: teamPageMembers,
                                workspaceTeamMembersTeamId: teamPageSelectedTeamId,
                                workspaceTeamsLoading: teamPageLoading,
                                workspaceTeamsRequiresPlan: teamPageRequiresPlan,
                                onWorkspaceTeamsRequest: (options = {}) => {
                                  const requestedTeamId = String(options?.selectedTeamId || options?.teamId || "").trim();
                                  void loadTeamPageData({ selectedTeamId: requestedTeamId });
                                },
  	                              onOpenTeamPage: (teamId = "", options = {}) => {
  	                                const normalizedTeamId = String(teamId || "").trim();
  	                                const requestedTab = options?.tab === "resources"
  	                                  ? "resources"
  	                                  : options?.tab === "roles" || options?.tab === "permissions"
  	                                    ? "roles"
  	                                    : "members";
  	                                openTeamPage();
  	                                setTeamPageSelectedTeamId(normalizedTeamId);
  	                                setTeamPageActiveTab(requestedTab);
  	                                if (requestedTab === "roles") {
  	                                  setTeamPageSelectedRoleId(normalizePlaygroundTeamRoleId(options?.roleId, "member"));
  	                                }
  	                                void loadTeamPageData({ selectedTeamId: normalizedTeamId });
  	                              },
                                onThreadOpen: (threadId, options = {}) => {
                                  const normalizedThreadId = String(threadId || "").trim();
                                  if (!normalizedThreadId) {
                                    return;
                                  }
                                  if (options?.threadRecord?.id) {
                                    upsertRealThreadRecord(options.threadRecord);
                                  }
                                  setThreadAgentSelectionOverride(null);
                                  setPendingThreadRunRequest(null);
                                  setActivePage("thread");
                                  setCurrentThreadId(normalizedThreadId);
                                  setContentMode("chat");
                                  setThreadListMode("threads");
                                  setChangesNavigationTarget(null);
                                  setRunnerRenderKey((current) => current + 1);
                                  void refreshThreads(undefined, normalizedThreadId);
                                },
                                onThreadOptionsOpen: (event, threadId, options = {}) => {
                                  const normalizedThreadId = String(threadId || "").trim();
                                  if (!normalizedThreadId) {
                                    return;
                                  }
                                  if (options?.threadRecord?.id) {
                                    upsertRealThreadRecord(options.threadRecord);
                                  }
                                  openThreadActionMenu(event, normalizedThreadId, options?.threadRecord || null, options);
                                },
                                onBackgroundThreadCreated: handleBackgroundThreadCreated,
                                onThreadStarted: (threadId, options = {}) => {
                                  const normalizedThreadId = String(threadId || "").trim();
                                  if (!normalizedThreadId) {
                                    return;
                                  }
                                  if (options?.threadRecord?.id) {
                                    upsertRealThreadRecord(options.threadRecord, {
                                      taskPreview: options?.taskPreview || null,
                                      status: options?.taskRunRequest?.prompt ? "running" : "",
                                    });
                                  }
                                  if (options?.taskPreview?.taskId) {
                                    upsertThreadTaskPreview(normalizedThreadId, {
                                      ...options.taskPreview,
                                      threadId: normalizedThreadId,
                                    });
                                  }
                                  if (options?.taskPreview?.environmentId) {
                                    setEnvironmentId(options.taskPreview.environmentId);
                                  }
                                  setThreadAgentSelectionOverride(null);
                                  if (options?.taskRunRequest?.prompt) {
                                    if (options.taskRunRequest.executionStarted) {
                                      setPendingThreadRunRequest(null);
                                      void loadThreadGroundTruthStatus(normalizedThreadId);
                                      void refreshThreads(undefined, normalizedThreadId);
                                    } else {
                                      setPendingThreadRunRequest({
                                          token: options.taskRunRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2)),
                                          threadId: normalizedThreadId,
                                          prompt: options.taskRunRequest.prompt,
                                          displayPrompt: options.taskRunRequest.displayPrompt || null,
                                          agentId: options.taskRunRequest.agentId || null,
                                          attachments: Array.isArray(options.taskRunRequest.attachments) ? options.taskRunRequest.attachments : [],
                                          githubRepo: options.taskRunRequest.githubRepo || null,
                                          enabledSkills: options.taskRunRequest.enabledSkills || null,
                                          connectors: options.taskRunRequest.connectors || null,
                                          knowledgeContext: options.taskRunRequest.knowledgeContext || null,
                                          environmentId: typeof options.taskRunRequest.environmentId === "string" ? options.taskRunRequest.environmentId : "",
                                          loopCommand: options.taskRunRequest.loopCommand || null,
                                        });
                                    }
                                  } else {
                                    setPendingThreadRunRequest(null);
                                  }
                                  setThreadTaskOpenRequest(null);
                                  setActivePage("thread");
                                  setCurrentThreadId(normalizedThreadId);
                                  setContentMode(options?.contentMode === "changes" ? "changes" : "chat");
                                  setThreadListMode("threads");
                                  setChangesNavigationTarget(null);
                                  setRunnerRenderKey((current) => current + 1);
                                  void refreshThreads(undefined, normalizedThreadId);
                                },
                                onRequireAuth: handleSignInWithComputerAgents,
                                onRequestSidebarCollapse: () => {
                                  setSidebarOpen(false);
                                },
                                onTaskDeleted: (taskId) => {
                                  if (
                                    activeRunnerThreadId
                                    && selectedThreadTaskPreview
                                    && String(selectedThreadTaskPreview.taskId || "").trim() === String(taskId || "").trim()
                                  ) {
                                    markThreadTaskPreviewDeleted(activeRunnerThreadId, selectedThreadTaskPreview);
                                  }
                                  setThreadTaskOpenRequest(null);
                                },
                                onOpenTaskFullScreen: openSelectedThreadTaskDetail,
                                detailOnly: true,
                                onCloseDetailOnly: () => {
                                  setThreadTaskOpenRequest(null);
                                  if (typeof document !== "undefined") {
                                    const fallbackBackground = "#000000";
                                    document.documentElement.style.setProperty(
                                      "--playground-app-bg",
                                      activePage === "thread" ? (selectedThreadShellBackground || fallbackBackground) : fallbackBackground
                                    );
                                  }
                                },
                              })
                            : null
                        )
                      : null,
                    activePage === "thread" && hasRealAccess
                      ? React.createElement("aside", {
                          className: "playground-thread-subagent-drawer" + (isThreadSubagentDetailOpen || isThreadDeepResearchDetailOpen || isThreadDocumentPreviewDetailOpen ? " is-open" : ""),
                          "aria-hidden": isThreadSubagentDetailOpen || isThreadDeepResearchDetailOpen || isThreadDocumentPreviewDetailOpen ? "false" : "true",
                        },
                          React.createElement("div", {
                            ref: threadSubagentDetailHostRef,
                            className:
                              "playground-thread-subagent-drawer-host tb-runner-chat" +
                              (isThreadSubagentDetailOpen ? " tb-runner-chat-subagent-detail-open" : "") +
                              (isThreadDeepResearchDetailOpen ? " tb-runner-chat-deep-research-detail-open" : "") +
                              (isThreadDocumentPreviewDetailOpen ? " tb-runner-chat-document-preview-open" : ""),
                          })
                        )
                      : null,
                  ),
                !sidebarOpen
                  ? React.createElement("div", { className: "playground-shell-status-indicators" },
                      renderStatusIndicators()
                    )
                  : null
              ))))
          );
        }
  
