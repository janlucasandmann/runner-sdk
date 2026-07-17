export const PROJECTS_DATA_03_FRAGMENT = `          );

          setSelectedProjectDetail((current) => {
            if (!current?.project || current.project.id !== projectId) {
              return current;
            }
            return {
              ...current,
              project: {
                ...current.project,
                summary: nextSummary,
              },
              summary: nextSummary,
            };
          });
        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading}
        function openProjectAgentUpgradeModal() {
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setProjectSidebarPopover("");
          setProjectAgentUpgradeModalOpen(true);
        }

        function closeProjectAgentUpgradeModal() {
          if (projectAgentUpgradeCheckoutLoading) {
            return;
          }
          setProjectAgentUpgradeModalOpen(false);
        }

        async function handleProjectAgentUpgradeCheckout() {
          if (projectAgentUpgradeCheckoutLoading || typeof onUpgradeToIndividual !== "function") {
            return;
          }
          setProjectAgentUpgradeCheckoutLoading(true);
          try {
            await Promise.resolve(onUpgradeToIndividual());
          } finally {
            setProjectAgentUpgradeCheckoutLoading(false);
          }
        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence}
        async function loadProjects() {
          setProjectLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));

          try {
            const response = await fetch(backendUrl + "/projects", {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Projects API unavailable.");
            }

            const baseProjects = sortPlaygroundProjectsByRecent(
              parsePlaygroundProjectListResponse(data).map((project) => applyProjectLocalNameOverride(project))
            );
            const nextProjects = sortPlaygroundProjectsByRecent(
              await resolvePlaygroundTeamSharedProjects({
                backendUrl,
                headers: requestHeaders,
                projects: baseProjects,
              })
            ).map((project) => applyProjectLocalNameOverride(project));
            setProjects((current) =>
              sortPlaygroundProjectsByRecent(nextProjects.map((project) => {
                const existingProject = current.find((currentProject) => currentProject?.id === project.id) || null;
                return applyProjectLocalNameOverride(mergePlaygroundProjectRecords(project, existingProject) || project);
              }))
            );
            setProjectLoadState({
              status: "ready",
              error: "",
            });

            if (selectedProjectId) {
              const refreshedProject = nextProjects.find((project) => project.id === selectedProjectId) || null;
              if (!refreshedProject) {
                handleSelectProject("");
              } else {
                setSelectedProjectDetail((current) =>
                  current?.project?.id === selectedProjectId
                    ? (() => {
                        const mergedProject = applyProjectLocalNameOverride(
                          mergePlaygroundProjectRecords(refreshedProject, current.project) || refreshedProject
                        );
                        return {
                          ...current,
                          project: mergedProject,
                          summary: mergedProject.summary || current.summary,
                        };
                      })()
                    : current
                );
              }
            }
          } catch (error) {
            setProjectLoadState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load projects from the API.",
            });
          }
        }

        function normalizeProjectCostSummaryResponse(data) {
          const totals = data?.totals && typeof data.totals === "object" ? data.totals : {};
          const byDay = Array.isArray(data?.byDay)
            ? data.byDay.map((day) => ({
                date: String(day?.date || ""),
                totalCT: Math.max(0, Number(readSettingsComputeTokens(day, "totalCT", "totalCost") || 0)),
                agentCT: Math.max(0, Number(readSettingsComputeTokens(day, "agentCT", "agentCost") || 0)),
                environmentCT: Math.max(0, Number(readSettingsComputeTokens(day, "environmentCT", "environmentCost") || 0)),
                threadCount: Math.max(0, Number(day?.threadCount || day?.totalThreads || 0)),
              })).filter((day) => day.date)
            : [];
          return {
            period: String(data?.period || "year"),
            startDate: String(data?.startDate || ""),
            endDate: String(data?.endDate || ""),
            totals: {
              totalCT: Math.max(0, Number(readSettingsComputeTokens(totals, "totalCT", "totalCost") || 0)),
              agentCT: Math.max(0, Number(readSettingsComputeTokens(totals, "agentCT", "agentCost") || 0)),
              environmentCT: Math.max(0, Number(readSettingsComputeTokens(totals, "environmentCT", "environmentCost") || 0)),
              totalThreads: Math.max(0, Number(totals?.totalThreads || 0)),
            },
            byDay,
          };
        }

        async function loadProjectWorkspace(projectId) {
          if (!projectId) {
            projectWorkspaceLoadTokenRef.current = "";
            clearProjectWorkspace();
            return;
          }

          const loadToken = projectId + ":" + Date.now().toString(36) + Math.random().toString(36).slice(2);
          projectWorkspaceLoadTokenRef.current = loadToken;
          setTaskLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));
          setProjectOverviewCostSummaryState((current) => ({
            status: current.status === "ready" ? "loading" : "loading",
            error: "",
            summary: current.summary,
          }));

          try {
            const threadsRequestTarget = new URL(backendUrl + "/threads", window.location.origin);
            threadsRequestTarget.searchParams.set("projectId", projectId);
            threadsRequestTarget.searchParams.set("limit", "500");
            const costSummaryRequestTarget = new URL(backendUrl + "/costs/summary", window.location.origin);
            costSummaryRequestTarget.searchParams.set("projectId", projectId);
            costSummaryRequestTarget.searchParams.set("period", "year");

            const [tasksResponse, releasesResponse, sprintsResponse, threadsResponse, costSummaryResult] = await Promise.all([
              fetch(backendUrl + buildProjectScopedPath("/tasks", projectId), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(backendUrl + buildProjectScopedPath("/tasks/releases", projectId), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(backendUrl + buildProjectScopedPath("/tasks/sprints", projectId), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(threadsRequestTarget.toString(), {
                method: "GET",
                headers: requestHeaders,
              }),
              fetch(costSummaryRequestTarget.toString(), {
                method: "GET",
                headers: requestHeaders,
              })
                .then(async (response) => ({
                  response,
                  data: await response.json().catch(() => ({})),
                }))
                .catch((error) => ({ error })),
            ]);

            const tasksData = await tasksResponse.json().catch(() => ({}));
            const releasesData = await releasesResponse.json().catch(() => ({}));
            const sprintsData = await sprintsResponse.json().catch(() => ({}));
            const threadsData = await threadsResponse.json().catch(() => ({}));

            if (!tasksResponse.ok || !releasesResponse.ok || !sprintsResponse.ok || !threadsResponse.ok) {
              throw new Error(
                tasksData?.message || tasksData?.error
                || releasesData?.message || releasesData?.error
                || sprintsData?.message || sprintsData?.error
                || threadsData?.message || threadsData?.error
                || "Project workspace unavailable."
              );
            }

            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return;
            }

            const nextTasks = parsePlaygroundTaskListResponse(tasksData);
            const nextReleases = parsePlaygroundTaskReleaseListResponse(releasesData);
            const nextSprints = parsePlaygroundTaskSprintListResponse(sprintsData);
            const currentDetailProject = selectedProjectDetail?.project?.id === projectId
              ? selectedProjectDetail.project
              : null;
            const snapshotProjectRecord = selectedProjectSnapshot
              || projects.find((project) => project?.id === projectId)
              || normalizePlaygroundProjectRecord({
                id: projectId,
                name: "Project",
              });
            const fallbackProjectRecord = currentDetailProject
              ? mergePlaygroundProjectRecords(currentDetailProject, snapshotProjectRecord) || currentDetailProject
              : snapshotProjectRecord;
            const fallbackSummary = {
              ...buildEmptyPlaygroundProjectSummary(),
              ...(fallbackProjectRecord?.summary && typeof fallbackProjectRecord.summary === "object" ? fallbackProjectRecord.summary : {}),
            };
            const fallbackEnvironments = selectedProjectDetail?.project?.id === projectId && Array.isArray(selectedProjectDetail.environments)
              ? selectedProjectDetail.environments
              : [];
            const nextThreads = Array.isArray(threadsData?.data)
              ? threadsData.data.map(normalizeThreadItem)
              : Array.isArray(threadsData?.threads)
                ? threadsData.threads.map(normalizeThreadItem)
                : [];
            if (costSummaryResult?.error) {
              setProjectOverviewCostSummaryState({
                status: "error",
                error: costSummaryResult.error instanceof Error ? costSummaryResult.error.message : "Failed to load project cost summary.",
                summary: null,
              });
            } else if (costSummaryResult?.response?.ok) {
              setProjectOverviewCostSummaryState({
                status: "ready",
                error: "",
                summary: normalizeProjectCostSummaryResponse(costSummaryResult.data || {}),
              });
            } else {
              setProjectOverviewCostSummaryState({
                status: "error",
                error: costSummaryResult?.data?.message || costSummaryResult?.data?.error || "Failed to load project cost summary.",
                summary: null,
              });
            }

            commitLocalProjectRecord({
              ...fallbackProjectRecord,
              summary: fallbackSummary,
            }, {
              summary: fallbackSummary,
              environments: fallbackEnvironments,
              recentThreads: nextThreads.slice(0, 10),
              threads: nextThreads,
              selectImmediately: true,
            });

            setTasks(nextTasks);
            setReleases(nextReleases);
            setSprints(nextSprints);
            syncProjectSummary(projectId, nextTasks, nextSprints, nextReleases, fallbackSummary);
            setTaskLoadState({
              status: "ready",
              error: "",
            });

            const projectDetailPromise = fetch(backendUrl + "/projects/" + encodeURIComponent(projectId), {
                method: "GET",
                headers: requestHeaders,
              })
              .then(async (response) => ({
                response,
                data: await response.json().catch(() => ({})),
              }))
              .catch((error) => ({ error }));

            void projectDetailPromise.then((projectResult) => {
              if (projectWorkspaceLoadTokenRef.current !== loadToken) {
                return;
              }
              if (projectResult?.error) {
                console.warn("Failed to refresh project detail", projectResult.error);
                return;
              }
              const projectResponse = projectResult?.response;
              const projectData = projectResult?.data || {};
              if (!projectResponse?.ok) {
                console.warn("Failed to refresh project detail", projectData?.message || projectData?.error || projectResponse?.status);
                return;
              }

              const projectRecord = getPlaygroundProjectResponseRecord(projectData, fallbackProjectRecord) || fallbackProjectRecord;
              const nextSummary = {
                ...buildEmptyPlaygroundProjectSummary(),
                ...(projectData?.summary && typeof projectData.summary === "object" ? projectData.summary : {}),
              };
              const parsedEnvironments = parsePlaygroundEnvironmentListResponse(projectData);
              const nextEnvironments = parsedEnvironments.length > 0 ? parsedEnvironments : fallbackEnvironments;
              const nextRecentThreads = Array.isArray(projectData?.recentThreads)
                ? projectData.recentThreads.map(normalizeThreadItem)
                : nextThreads.slice(0, 10);

              commitLocalProjectRecord({
                ...projectRecord,
                summary: nextSummary,
              }, {
                summary: nextSummary,
                environments: nextEnvironments,
                recentThreads: nextRecentThreads,
                threads: nextThreads,
                selectImmediately: true,
              });
              syncProjectSummary(projectId, nextTasks, nextSprints, nextReleases, nextSummary);
            });
          } catch (error) {
            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return;
            }
            setTaskLoadState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load project workspace.",
            });
          }
        }

        async function loadTaskDetails(taskId) {
          if (!selectedProjectId || !taskId) {
            return null;
          }

          const response = await fetch(backendUrl + "/tasks/" + encodeURIComponent(taskId), {
            method: "GET",
            headers: requestHeaders,
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to load task details.");
          }

          const refreshedTask = getPlaygroundTaskResponseRecord(data);
          if (!refreshedTask?.id) {
            throw new Error("Task details are unavailable.");
          }

          return applyRefreshedTaskDetails(refreshedTask);
        }

        useEffect(() => {
          try {
            if (selectedProjectId) {
              localStorage.setItem("runner_demo_tasks_project_scope_id", selectedProjectId);
            } else {
              localStorage.removeItem("runner_demo_tasks_project_scope_id");
            }
          } catch {}
        }, [selectedProjectId]);

	        useEffect(() => {
	          if (!selectedProjectId) {
	            reportedProjectScopeIdRef.current = "";
	            return;
	          }
	          if (typeof onProjectScopeChange !== "function") {
	            return;
	          }
	          if (reportedProjectScopeIdRef.current === selectedProjectId) {
	            return;
	          }
	          reportedProjectScopeIdRef.current = selectedProjectId;
	          onProjectScopeChange(selectedProjectId);
	        }, [onProjectScopeChange, selectedProjectId]);

        useEffect(() => {
          setBacklogComposerSubtaskCommandRequest(null);
        }, [selectedProjectId]);

	        useEffect(() => {
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	          ].join("|");
	          if (projectListAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectListAutoLoadKeyRef.current = loadKey;
	          void loadProjects();
	        }, [backendUrl, requestHeadersKey]);

        useEffect(() => {
          return () => {
            if (projectWallpaperTransitionTimerRef.current) {
              window.clearTimeout(projectWallpaperTransitionTimerRef.current);
              projectWallpaperTransitionTimerRef.current = null;
            }
            if (projectInitialSetupModalCloseTimerRef.current) {
              window.clearTimeout(projectInitialSetupModalCloseTimerRef.current);
              projectInitialSetupModalCloseTimerRef.current = null;
            }
            if (projectInitialSetupModalFrameRef.current) {
              window.cancelAnimationFrame(projectInitialSetupModalFrameRef.current);
              projectInitialSetupModalFrameRef.current = null;
            }
            if (missionControlSetupCloseTimerRef.current) {
              window.clearTimeout(missionControlSetupCloseTimerRef.current);
              missionControlSetupCloseTimerRef.current = null;
            }
            if (missionControlSetupFrameRef.current) {
              window.cancelAnimationFrame(missionControlSetupFrameRef.current);
              missionControlSetupFrameRef.current = null;
            }
            if (projectRuleComposerCloseTimerRef.current) {
              window.clearTimeout(projectRuleComposerCloseTimerRef.current);
              projectRuleComposerCloseTimerRef.current = null;
            }
            if (projectRuleComposerFrameRef.current) {
              window.cancelAnimationFrame(projectRuleComposerFrameRef.current);
              projectRuleComposerFrameRef.current = null;
            }
            if (projectOverviewOutcomeEditorCloseTimerRef.current) {
              window.clearTimeout(projectOverviewOutcomeEditorCloseTimerRef.current);
              projectOverviewOutcomeEditorCloseTimerRef.current = null;
            }
            if (projectOverviewOutcomeEditorFrameRef.current) {
              window.cancelAnimationFrame(projectOverviewOutcomeEditorFrameRef.current);
              projectOverviewOutcomeEditorFrameRef.current = null;
            }
            if (issueComposerCloseTimerRef.current) {
              window.clearTimeout(issueComposerCloseTimerRef.current);
              issueComposerCloseTimerRef.current = null;
            }
            if (issueComposerFrameRef.current) {
              window.cancelAnimationFrame(issueComposerFrameRef.current);
              issueComposerFrameRef.current = null;
            }
          };
        }, []);

        useEffect(() => {
          if (!projectComposerOpen) return undefined;

          function handleProjectComposerEscape(event) {
            if (event.key !== "Escape") return;
            if (projectOverviewOutcomeEditorState) {
              if (projectOverviewOutcomeMilestonePickerOpen) {
                setProjectOverviewOutcomeMilestonePickerOpen(false);
                return;
              }
              closeProjectOverviewOutcomeEditor();
              return;
            }
            if (missionControlSetupOutcomeMenuIndex >= 0) {
              setMissionControlSetupOutcomeMenuIndex(-1);
              return;
            }
            if (missionControlSetupOpen) {
              closeMissionControlSetupModal();
              return;
            }
            if (projectEnvironmentFilePickerOpen) {
              setProjectEnvironmentFilePickerOpen(false);
              return;
            }
            if (projectComposerEnvironmentPopoverOpen) {
              setProjectComposerEnvironmentPopoverOpen(false);
              return;
            }
            if (projectBlueprintPickerOpen) {
              setProjectBlueprintPickerOpen(false);
              return;
            }
            if (projectIconPickerOpen) {
              setProjectIconPickerOpen(false);
              return;
            }
            closeProjectComposer();
          }

          window.addEventListener("keydown", handleProjectComposerEscape);
          return () => window.removeEventListener("keydown", handleProjectComposerEscape);
        }, [missionControlSetupClosing, missionControlSetupOpen, missionControlSetupOutcomeMenuIndex, projectBlueprintPickerOpen, projectComposerEnvironmentPopoverOpen, projectComposerOpen, projectEnvironmentFilePickerOpen, projectIconPickerOpen, projectOverviewOutcomeEditorState, projectOverviewOutcomeMilestonePickerOpen]);

        useEffect(() => {
          if (!issueComposerOpen) return undefined;

          function handleIssueComposerEscape(event) {
            if (event.key !== "Escape") return;
            if (issueComposerDetailSelectPopover) {
              setIssueComposerDetailSelectPopover("");
              return;
            }
            if (issueComposerEnvironmentPopoverOpen) {
              setIssueComposerEnvironmentPopoverOpen(false);
              return;
            }
            closeProjectIssueComposer();
          }

          window.addEventListener("keydown", handleIssueComposerEscape);
          return () => window.removeEventListener("keydown", handleIssueComposerEscape);
        }, [issueComposerClosing, issueComposerDetailSelectPopover, issueComposerEnvironmentPopoverOpen, issueComposerOpen, issueComposerSaveState.isSaving]);

        useEffect(() => {
          if (!releaseComposerOpen) return undefined;

          function handleReleaseComposerEscape(event) {
            if (event.key !== "Escape") return;
            closeReleaseComposer();
          }

          window.addEventListener("keydown", handleReleaseComposerEscape);
          return () => window.removeEventListener("keydown", handleReleaseComposerEscape);
        }, [releaseComposerClosing, releaseComposerOpen, releaseDeletePending, releaseSaveState.isSaving]);

        useEffect(() => {
          if (!releaseComposerOpen) {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(releaseDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [releaseComposerOpen, releaseDraft.description]);

        useEffect(() => {
          if (!projectComposerOpen) {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(projectDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [projectComposerOpen, projectDraft.description]);

        useEffect(() => {
          if (!projectComposerOpen || projectDraft?.defaultEnvironmentId || projectComposerAvailableEnvironments.length === 0) {
            return;
          }
          setProjectDraft((current) => {
            if (current?.defaultEnvironmentId) {
              return current;
            }
            return {
              ...current,
              defaultEnvironmentId: projectComposerDefaultEnvironmentId
                || projectComposerAvailableEnvironments.find((environment) => environment.isDefault)?.id
                || projectComposerAvailableEnvironments[0]?.id
                || null,
            };
          });
        }, [projectComposerAvailableEnvironments, projectComposerDefaultEnvironmentId, projectComposerOpen, projectDraft?.defaultEnvironmentId]);

        useEffect(() => {
          if (scheduleViewMode !== "setup") {
            return undefined;
          }
          const frame = window.requestAnimationFrame(() => {
            resizeTaskDescriptionTextarea(scheduleTaskTextareaRef.current);
            resizeTaskDescriptionTextarea(scheduleDescriptionTextareaRef.current);
          });
          return () => window.cancelAnimationFrame(frame);
        }, [scheduleDraft.description, scheduleDraft.task, scheduleViewMode]);

        useEffect(() => {
          if (!projectSidebarPopover) return undefined;

          function handleProjectSidebarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectSidebarActionsRef.current || projectSidebarActionsRef.current.contains(target)) {
              return;
            }
            setProjectSidebarPopover("");
          }

          document.addEventListener("mousedown", handleProjectSidebarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectSidebarPopoverPointerDown);
        }, [projectSidebarPopover]);

        useEffect(() => {
          if (!projectComposerEnvironmentPopoverOpen) {
            return undefined;
          }

          function handleProjectComposerEnvironmentPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectComposerEnvironmentPopoverRef.current || projectComposerEnvironmentPopoverRef.current.contains(target)) {
              return;
            }
            setProjectComposerEnvironmentPopoverOpen(false);
          }

          document.addEventListener("mousedown", handleProjectComposerEnvironmentPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectComposerEnvironmentPopoverPointerDown);
        }, [projectComposerEnvironmentPopoverOpen]);

        useEffect(() => {
          if (!issueComposerEnvironmentPopoverOpen) {
            return undefined;
          }

          function handleIssueComposerEnvironmentPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !issueComposerEnvironmentPopoverRef.current || issueComposerEnvironmentPopoverRef.current.contains(target)) {
              return;
            }
            setIssueComposerEnvironmentPopoverOpen(false);
          }

          document.addEventListener("mousedown", handleIssueComposerEnvironmentPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleIssueComposerEnvironmentPopoverPointerDown);
        }, [issueComposerEnvironmentPopoverOpen]);

        useEffect(() => {
          if (!issueComposerDetailSelectPopover) {
            return undefined;
          }

          function handleIssueComposerDetailSelectPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !issueComposerDetailSelectPopoverRef.current || issueComposerDetailSelectPopoverRef.current.contains(target)) {
              return;
            }
            setIssueComposerDetailSelectPopover("");
          }

          document.addEventListener("mousedown", handleIssueComposerDetailSelectPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleIssueComposerDetailSelectPopoverPointerDown);
        }, [issueComposerDetailSelectPopover]);

        useEffect(() => {
          if (missionControlSetupOutcomeMenuIndex < 0) {
            return undefined;
          }

          function handleMissionControlOutcomeMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !missionControlSetupOutcomeMenuRef.current || missionControlSetupOutcomeMenuRef.current.contains(target)) {
              return;
            }
            setMissionControlSetupOutcomeMenuIndex(-1);
          }

          document.addEventListener("mousedown", handleMissionControlOutcomeMenuPointerDown);
          return () => document.removeEventListener("mousedown", handleMissionControlOutcomeMenuPointerDown);
        }, [missionControlSetupOutcomeMenuIndex]);

        useEffect(() => {
          if (!projectBlueprintPickerOpen) {
            return undefined;
          }

          function handleProjectBlueprintPickerPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !projectBlueprintPickerRef.current || projectBlueprintPickerRef.current.contains(target)) {
              return;
            }
            setProjectBlueprintPickerOpen(false);
          }

          document.addEventListener("mousedown", handleProjectBlueprintPickerPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectBlueprintPickerPointerDown);
        }, [projectBlueprintPickerOpen]);

        useEffect(() => {
          if (!projectCardMenuProjectId) return undefined;

          function handleProjectCardMenuPointerDown(event) {
            const target = event?.target instanceof Element ? event.target : null;
            if (target?.closest(".playground-tasks-project-card-actions")) {
              return;
            }
            setProjectCardMenuProjectId("");
          }

          document.addEventListener("mousedown", handleProjectCardMenuPointerDown);
          return () => document.removeEventListener("mousedown", handleProjectCardMenuPointerDown);
        }, [projectCardMenuProjectId]);

        useEffect(() => {
          if (!backlogToolbarPopover) return undefined;

          function handleBacklogToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !backlogToolbarActionsRef.current || backlogToolbarActionsRef.current.contains(target)) {
              return;
            }
            setBacklogToolbarPopover("");
          }

          document.addEventListener("mousedown", handleBacklogToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleBacklogToolbarPopoverPointerDown);
        }, [backlogToolbarPopover]);

        useEffect(() => {
          if (!boardToolbarPopover) return undefined;

          function handleBoardToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !boardToolbarActionsRef.current || boardToolbarActionsRef.current.contains(target)) {
              return;
            }
            setBoardToolbarPopover("");
          }

          document.addEventListener("mousedown", handleBoardToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleBoardToolbarPopoverPointerDown);
        }, [boardToolbarPopover]);

        useEffect(() => {
          if (!releaseToolbarPopover) return undefined;

          function handleReleaseToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !releaseToolbarActionsRef.current || releaseToolbarActionsRef.current.contains(target)) {
              return;
            }
            setReleaseToolbarPopover("");
          }

          document.addEventListener("mousedown", handleReleaseToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleReleaseToolbarPopoverPointerDown);
        }, [releaseToolbarPopover]);

        useEffect(() => {
          if (!releaseBacklogToolbarPopover) return undefined;

          function handleReleaseBacklogToolbarPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !releaseBacklogToolbarActionsRef.current || releaseBacklogToolbarActionsRef.current.contains(target)) {
              return;
            }
            setReleaseBacklogToolbarPopover("");
          }

          document.addEventListener("mousedown", handleReleaseBacklogToolbarPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleReleaseBacklogToolbarPopoverPointerDown);
        }, [releaseBacklogToolbarPopover]);

        useEffect(() => {
          if (!backlogTaskContextMenu) return undefined;

          function handleBacklogTaskContextMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !backlogTaskContextMenuRef.current || backlogTaskContextMenuRef.current.contains(target)) {
              return;
            }
            setBacklogTaskContextMenu(null);
          }

          function handleBacklogTaskContextMenuEscape(event) {
            if (event.key === "Escape") {
              setBacklogTaskContextMenu(null);
            }
          }

          document.addEventListener("mousedown", handleBacklogTaskContextMenuPointerDown);
          window.addEventListener("keydown", handleBacklogTaskContextMenuEscape);
          return () => {
            document.removeEventListener("mousedown", handleBacklogTaskContextMenuPointerDown);
            window.removeEventListener("keydown", handleBacklogTaskContextMenuEscape);
          };
        }, [backlogTaskContextMenu]);

        useEffect(() => {
          if (!taskStatusMenuState?.taskId) return undefined;

          function handleTaskStatusMenuPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskStatusMenuRef.current || taskStatusMenuRef.current.contains(target)) {
              return;
            }
            setTaskStatusMenuState(null);
          }

          function handleTaskStatusMenuEscape(event) {
            if (event.key === "Escape") {
              setTaskStatusMenuState(null);
            }
          }

          document.addEventListener("mousedown", handleTaskStatusMenuPointerDown);
          window.addEventListener("keydown", handleTaskStatusMenuEscape);
          return () => {
            document.removeEventListener("mousedown", handleTaskStatusMenuPointerDown);
            window.removeEventListener("keydown", handleTaskStatusMenuEscape);
          };
        }, [taskStatusMenuState]);

        useEffect(() => {
          if (!taskDetailPopover) return undefined;

          function handleTaskDetailPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskDetailActionsRef.current || taskDetailActionsRef.current.contains(target)) {
              return;
            }
            setTaskDetailPopover("");
          }

          document.addEventListener("mousedown", handleTaskDetailPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleTaskDetailPopoverPointerDown);
        }, [taskDetailPopover]);

        useEffect(() => {
          if (!taskDetailSelectPopover) return undefined;

          function handleTaskDetailSelectPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskDetailSelectPopoverRef.current || taskDetailSelectPopoverRef.current.contains(target)) {
              return;
            }
            setTaskDetailSelectPopover("");
          }

          function handleTaskDetailSelectPopoverEscape(event) {
            if (event.key === "Escape") {
              setTaskDetailSelectPopover("");
            }
          }

          document.addEventListener("mousedown", handleTaskDetailSelectPopoverPointerDown);
          window.addEventListener("keydown", handleTaskDetailSelectPopoverEscape);
          return () => {
            document.removeEventListener("mousedown", handleTaskDetailSelectPopoverPointerDown);
            window.removeEventListener("keydown", handleTaskDetailSelectPopoverEscape);
          };
        }, [taskDetailSelectPopover]);

        useEffect(() => {
          if (taskDetailPopover) {
            setTaskDetailSelectPopover("");
            setBacklogTaskContextMenu(null);
          }
        }, [taskDetailPopover]);

        useEffect(() => {
          if (taskSkillsPopoverOpen) {
            setTaskDetailSelectPopover("");
          }
        }, [taskSkillsPopoverOpen]);

        useEffect(() => {
          setTaskDetailSelectPopover("");
        }, [draftTask?.id, taskDetailsCollapsed]);

        useEffect(() => {
          if (!taskSkillsPopoverOpen) return undefined;

          function handleTaskSkillsPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskSkillsActionsRef.current || taskSkillsActionsRef.current.contains(target)) {
              return;
            }
            setTaskSkillsPopoverOpen(false);
          }

          function handleTaskSkillsPopoverEscape(event) {
            if (event.key === "Escape") {
              setTaskSkillsPopoverOpen(false);
            }
          }

          document.addEventListener("mousedown", handleTaskSkillsPopoverPointerDown);
          window.addEventListener("keydown", handleTaskSkillsPopoverEscape);
          return () => {
            document.removeEventListener("mousedown", handleTaskSkillsPopoverPointerDown);
            window.removeEventListener("keydown", handleTaskSkillsPopoverEscape);
          };
        }, [taskSkillsPopoverOpen]);

	        useEffect(() => {
	          if (isStandaloneCalendarMode) {
	            projectWorkspaceAutoLoadKeyRef.current = "";
	            clearProjectWorkspace({ preserveSchedule: true });
	            return;
	          }
	          if (!selectedProjectId) {
	            projectWorkspaceAutoLoadKeyRef.current = "";
	            clearProjectWorkspace();
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            selectedProjectId,
	          ].join("|");
	          if (projectWorkspaceAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectWorkspaceAutoLoadKeyRef.current = loadKey;
	          void loadProjectWorkspace(selectedProjectId);
	        }, [backendUrl, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId]);

	        useEffect(() => {
            const scheduleProjectId = isStandaloneCalendarMode ? "" : selectedProjectId;
	          if (!scheduleProjectId && !isStandaloneCalendarMode) {
	            projectSchedulesAutoLoadKeyRef.current = "";
	            setSchedules([]);
	            setScheduleLoadState({
              status: "idle",
              error: "",
	            });
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            scheduleProjectId || "standalone",
	            visibleScheduleCalendarRangeKey,
	          ].join("|");
	          if (projectSchedulesAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectSchedulesAutoLoadKeyRef.current = loadKey;
	          void loadProjectSchedules(scheduleProjectId, visibleScheduleCalendarRange);
	        }, [backendUrl, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId, visibleScheduleCalendarRange, visibleScheduleCalendarRangeKey]);

	        useEffect(() => {
            const scheduleProjectId = isStandaloneCalendarMode ? "" : selectedProjectId;
	          if (!scheduleProjectId && !isStandaloneCalendarMode) {
	            projectMetronomeSchedulesAutoLoadKeyRef.current = "";
	            setCalendarMetronomeWorkflows([]);
	            return;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            scheduleProjectId || "standalone",
              isCalendarContext ? "calendar" : "background",
	          ].join("|");
	          if (projectMetronomeSchedulesAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectMetronomeSchedulesAutoLoadKeyRef.current = loadKey;
	          void loadProjectMetronomeSchedules(scheduleProjectId);
	        }, [backendUrl, isCalendarContext, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId]);

        useEffect(() => {
          if (!selectedProjectId || boardSprintId === PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID) return;
          if (sprints.some((sprint) => sprint.id === boardSprintId)) return;
          const activeSprint = sprints.find((sprint) => sprint.status === "active") || sprints[0] || null;
          setBoardSprintId(activeSprint?.id || PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID);
        }, [boardSprintId, selectedProjectId, sprints]);

        useEffect(() => {
          if (!selectedProjectId) {
            setBacklogComposerEnvironmentId("");
            return;
          }
          if (backlogComposerEnvironmentId && availableBacklogEnvironments.some((environment) => environment.id === backlogComposerEnvironmentId)) {
            return;
          }
          const nextEnvironmentId = selectedProject?.defaultEnvironmentId && availableBacklogEnvironments.some((environment) => environment.id === selectedProject.defaultEnvironmentId)
            ? selectedProject.defaultEnvironmentId
            : availableBacklogEnvironments.find((environment) => environment.isDefault)?.id
              || availableBacklogEnvironments[0]?.id
              || "";
          setBacklogComposerEnvironmentId(nextEnvironmentId);
        }, [availableBacklogEnvironments, backlogComposerEnvironmentId, selectedProject?.defaultEnvironmentId, selectedProjectId]);

        useEffect(() => {
          if (backlogComposerAgentId && assignableActors.some((agent) => agent.id === backlogComposerAgentId)) {
            return;
          }
          const nextAgentId = initialAgentId && assignableActors.some((agent) => agent.id === initialAgentId)
            ? initialAgentId
            : getPlaygroundPreferredDefaultAgent(sortedAgents)?.id
              || sortedAgents[0]?.id
              || humanAssigneeOptions[0]?.id
              || "";
          setBacklogComposerAgentId(nextAgentId);
        }, [assignableActors, backlogComposerAgentId, humanAssigneeOptions, initialAgentId, sortedAgents]);

        useEffect(() => {
          if (taskDetailAvailableAssigneePopupModes.includes(taskDetailAssigneePopupMode)) {
            return;
          }
          const nextMode = taskDetailAvailableAssigneePopupModes[0] || "agents";
          if (nextMode !== taskDetailAssigneePopupMode) {
            setTaskDetailAssigneePopupMode(nextMode);
          }
        }, [taskDetailAssigneePopupMode, taskDetailAvailableAssigneePopupModes]);

        useEffect(() => {
          if (taskView === "threads") {
            setTaskView("backlog");
          }
        }, [taskView]);

        useEffect(() => {
          if (taskView !== "backlog") {
            setBacklogToolbarPopover("");
            setBacklogSessionCompletedTaskIds((current) => current.size ? new Set() : current);
          }
        }, [taskView]);

        useEffect(() => {
          setBacklogSessionCompletedTaskIds(new Set());
        }, [selectedProjectId]);

        useEffect(() => {
          setMissionControlStrategyOpen(false);
          setBacklogComposerMissionControlCommandRequest(null);
        }, [selectedProjectId]);

        useEffect(() => {
          const normalizedThreadId = String(missionControlRunState.threadId || "").trim();
          const normalizedProjectId = String(missionControlRunState.projectId || "").trim();
          if (
            !normalizedThreadId
            || !normalizedProjectId
            || (missionControlRunState.status !== "starting" && missionControlRunState.status !== "running")
          ) {
            return undefined;
          }

          let isActive = true;
          let timeoutId = 0;

          const pollMissionControlStatus = async () => {
            try {
              const response = await fetch(
                backendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/status",
                {
                  method: "GET",
                  headers: requestHeaders,
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok || !isActive) {
                return;
              }

              const nextStatus = typeof data?.status === "string" && data.status.trim()
                ? data.status.trim().toLowerCase()
                : typeof data?.thread?.status === "string" && data.thread.status.trim()
                  ? data.thread.status.trim().toLowerCase()
                  : typeof data?.data?.status === "string" && data.data.status.trim()
                    ? data.data.status.trim().toLowerCase()
                    : "";

              if (nextStatus === "running" && missionControlRunState.status !== "running") {
                setMissionControlRunState((current) => current.threadId === normalizedThreadId
                  ? {
                      ...current,
                      status: "running",
                      error: "",
                    }
                  : current
                );
                if (typeof onStatusIndicatorItemChange === "function") {
                  onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                    projectId: normalizedProjectId,
                    projectName: selectedProject?.name || "Project",
                    phase: "running",
                  }));
                }
              }

              if (!nextStatus || nextStatus === "running" || nextStatus === "queued" || nextStatus === "pending" || nextStatus === "starting") {
                timeoutId = window.setTimeout(pollMissionControlStatus, 2200);
                return;
              }

              if (nextStatus === "completed") {
                if (typeof onStatusIndicatorItemChange === "function") {
                  onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                    projectId: normalizedProjectId,
                    projectName: selectedProject?.name || "Project",
                    phase: "finished",
                  }));
                }
                setMissionControlRunState((current) => current.threadId === normalizedThreadId
                  ? {
                      ...current,
                      status: "syncing",
                      error: "",
                    }
                  : current
                );
                await syncMissionControlThreadResult(normalizedThreadId, normalizedProjectId);
                return;
              }

              if (typeof onStatusIndicatorItemChange === "function") {
                onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                  projectId: normalizedProjectId,
                  projectName: selectedProject?.name || "Project",
                  phase: nextStatus === "cancelled" ? "cancelled" : "failed",
                  error: nextStatus === "cancelled" ? "" : "Mission Control run did not complete successfully.",
                }));
              }
              setMissionControlRunState((current) => current.threadId === normalizedThreadId
                ? {
                    ...current,
                    status: "failed",
                    error: "Mission Control run did not complete successfully.",
                  }
                : current
              );
            } catch {
              if (!isActive) {
                return;
              }
              timeoutId = window.setTimeout(pollMissionControlStatus, 3000);
            }
          };

          void pollMissionControlStatus();

          return () => {
            isActive = false;
            if (timeoutId) {
              window.clearTimeout(timeoutId);
            }
          };
        }, [
          backendUrl,
          missionControlRunState.projectId,
          missionControlRunState.status,
          missionControlRunState.threadId,
          onStatusIndicatorItemChange,
          requestHeaders,
          selectedProject?.name,
        ]);

        useEffect(() => {
          if (taskView !== "board") {
            setBoardToolbarPopover("");
          }
        }, [taskView]);

        useEffect(() => {
          if (taskView !== "releases") {
            setReleaseToolbarPopover("");
            setReleaseBacklogToolbarPopover("");
          }
        }, [taskView]);

        useEffect(() => {
          if (isStandaloneCalendarMode || taskView === "calendar") {
            return;
          }
          if (scheduleViewMode !== "calendar" || selectedScheduleId) {
            setSelectedScheduleId("");
            setScheduleViewMode("calendar");
            setScheduleEditorMode("create");
            resetScheduleSaveState("");
          }
        }, [isStandaloneCalendarMode, scheduleViewMode, selectedScheduleId, taskView]);

        useEffect(() => {
          if (!isStandaloneCalendarMode) {
            return;
          }
          if (taskView !== "calendar") {
            setTaskView("calendar");
          }
          setSelectedTaskId("");
          setProjectTaskDetailScreenOpen(false);
          setDraftTask(null);
        }, [isStandaloneCalendarMode, taskView]);

        useEffect(() => {
          if (!selectedTaskId || taskView === "threads") {
            const isProjectConnectorBrowserActive = projectConnectorBrowserActiveRef.current || taskConnectorBrowserMode === "project" || taskConnectorBrowserMode === "project-composer";
            setTaskDetailPopover("");
            setTaskSkillsPopoverOpen(false);
            if (!isProjectConnectorBrowserActive) {
              setTaskConnectorBrowserOpen(false);
            }
          }
        }, [selectedTaskId, taskConnectorBrowserMode, taskView]);

        useEffect(() => {
          const requestToken = String(openTaskRequest?.token || "").trim();
          if (!openTaskRequest?.taskId || !openTaskRequest?.projectId || !requestToken) {
            return;
          }
          if (handledOpenTaskRequestTokenRef.current === requestToken) {
            return;
          }
          handledOpenTaskRequestTokenRef.current = requestToken;
          setTaskView("backlog");
          setSelectedProjectId(openTaskRequest.projectId);
`;
