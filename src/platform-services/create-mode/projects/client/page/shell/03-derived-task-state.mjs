export const PROJECTS_SHELL_03_FRAGMENT = `          setTaskDetailThreadToolbarPopover("");
          setTaskDetailThreadSearchQuery("");
          setTaskCommentMode("");
        }, [selectedTaskId]);
        useEffect(() => {
	          const normalizedTaskId = String(draftTask?.id || "").trim();
	          if (!normalizedTaskId) {
	            taskDetailThreadRecordsLoadKeyRef.current = "";
	            setTaskDetailThreadRecords([]);
	            setTaskDetailThreadsState({
              status: "idle",
              error: "",
	            });
	            return undefined;
	          }
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            selectedProjectId,
	            normalizedTaskId,
	            selectedTaskThreadIdsKey,
	          ].join("|");
	          if (taskDetailThreadRecordsLoadKeyRef.current === loadKey) {
	            return undefined;
	          }
	          taskDetailThreadRecordsLoadKeyRef.current = loadKey;

	          let cancelled = false;
          setTaskDetailThreadsState({
            status: "loading",
            error: "",
          });

          void (async () => {
            try {
              const response = await fetch(backendUrl + "/threads?limit=240", {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load task threads.");
              }
              const items = Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.threads)
                  ? data.threads
                  : [];
              if (!cancelled) {
                setTaskDetailThreadRecords(normalizeThreadList(items));
                setTaskDetailThreadsState({
                  status: "ready",
                  error: "",
                });
              }
            } catch (error) {
              if (!cancelled) {
                setTaskDetailThreadRecords([]);
                setTaskDetailThreadsState({
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to load task threads.",
                });
              }
            }
          })();

          return () => {
            cancelled = true;
          };
        }, [
	          backendUrl,
	          draftTask?.id,
	          requestHeaders,
	          requestHeadersKey,
	          selectedProjectId,
	          selectedTaskThreadIdsKey,
	        ]);
        function resolveTaskAttachmentApiUrl(rawUrl, attachmentId = "") {
          const normalizedUrl = typeof rawUrl === "string" ? rawUrl.trim() : "";
          let normalizedBackendUrl = String(backendUrl || "").trim();
          while (normalizedBackendUrl.endsWith("/")) {
            normalizedBackendUrl = normalizedBackendUrl.slice(0, -1);
          }
          const normalizedAttachmentId = String(attachmentId || "").trim();
          const normalizedUrlLower = normalizedUrl.toLowerCase();
          if (!normalizedUrl) {
            return normalizedBackendUrl && normalizedAttachmentId
              ? normalizedBackendUrl + "/attachments/" + encodeURIComponent(normalizedAttachmentId)
              : "";
          }
          if (
            normalizedUrlLower.startsWith("blob:")
            || normalizedUrlLower.startsWith("data:")
            || normalizedUrlLower.startsWith("http://")
            || normalizedUrlLower.startsWith("https://")
          ) {
            return normalizedUrl;
          }
          if (normalizedUrl.startsWith("/api/real/attachments/") || normalizedUrl.startsWith("/api/task-backlog/")) {
            return normalizedUrl;
          }
          if (normalizedUrl.startsWith("/api/attachments/")) {
            return normalizedBackendUrl
              ? normalizedBackendUrl + "/attachments" + normalizedUrl.slice("/api/attachments".length)
              : normalizedUrl;
          }
          if (normalizedUrl.startsWith("/attachments/")) {
            return normalizedBackendUrl
              ? normalizedBackendUrl + normalizedUrl
              : normalizedUrl;
          }
          if (normalizedUrl.startsWith("/")) {
            return normalizedUrl;
          }
          let relativeUrl = normalizedUrl;
          if (relativeUrl.startsWith("./")) {
            relativeUrl = relativeUrl.slice(2);
          }
          while (relativeUrl.startsWith("/")) {
            relativeUrl = relativeUrl.slice(1);
          }
          return normalizedBackendUrl
            ? normalizedBackendUrl + "/" + relativeUrl
            : normalizedUrl;
        }

        function getTaskAttachmentWorkspaceDownloadUrl(attachment) {
          if (!attachment) return "";
          const attachmentEnvironmentId = String(attachment.environmentId || "").trim();
          const attachmentSourcePath = normalizeHistoryPath(attachment.sourcePath || attachment.workspacePath);
          if (!attachmentEnvironmentId || !attachmentSourcePath) {
            return "";
          }
          return buildPlaygroundEnvironmentDownloadUrl(backendUrl, attachmentEnvironmentId, attachmentSourcePath);
        }

        function resolveTaskAttachmentPreviewUrl(attachment) {
          if (!attachment) return "";
          const normalizedPreviewUrl = typeof attachment.previewUrl === "string" ? attachment.previewUrl.trim() : "";
          const normalizedPreviewUrlLower = normalizedPreviewUrl.toLowerCase();
          if (
            normalizedPreviewUrlLower.startsWith("blob:")
            || normalizedPreviewUrlLower.startsWith("data:")
            || normalizedPreviewUrlLower.startsWith("http://")
            || normalizedPreviewUrlLower.startsWith("https://")
          ) {
            return normalizedPreviewUrl;
          }
          return resolveTaskAttachmentApiUrl(normalizedPreviewUrl, attachment.id)
            || resolveTaskAttachmentApiUrl(attachment.url, attachment.id)
            || getTaskAttachmentWorkspaceDownloadUrl(attachment);
        }

        function buildResolvedTaskAttachmentRecord(attachment) {
          if (!attachment) {
            return null;
          }
          const resolvedUrl = resolveTaskAttachmentApiUrl(attachment.url, attachment.id)
            || getTaskAttachmentWorkspaceDownloadUrl(attachment);
          const resolvedPreviewUrl = resolveTaskAttachmentPreviewUrl({
            ...attachment,
            url: resolvedUrl || attachment.url,
          });
          return {
            ...attachment,
            url: resolvedUrl || attachment.url,
            previewUrl: resolvedPreviewUrl || attachment.previewUrl,
          };
        }

        const activeDetailAttachments = useMemo(() => {
          if (draftTask?.attachments?.length) {
            return draftTask.attachments;
          }
          if (isCalendarScheduleDetailMode && Array.isArray(scheduleDraft?.attachments)) {
            return scheduleDraft.attachments;
          }
          return [];
        }, [draftTask?.attachments, isCalendarScheduleDetailMode, scheduleDraft?.attachments]);

        const previewedTaskAttachment = useMemo(() => {
          if (!activeDetailAttachments.length || !previewedTaskAttachmentId) {
            return null;
          }
          const matchedAttachment = activeDetailAttachments.find((attachment) => attachment.id === previewedTaskAttachmentId) || null;
          return buildResolvedTaskAttachmentRecord(matchedAttachment);
        }, [activeDetailAttachments, backendUrl, previewedTaskAttachmentId]);
        const previewedProjectAttachment = useMemo(() => {
          const projectAttachments = normalizePlaygroundTaskAttachmentList(projectAttachmentHostRecord?.attachments);
          if (!projectAttachments.length || !projectPreviewedAttachmentId) {
            return null;
          }
          const matchedAttachment = projectAttachments.find((attachment) => attachment.id === projectPreviewedAttachmentId) || null;
          return buildResolvedTaskAttachmentRecord(matchedAttachment);
        }, [backendUrl, projectAttachmentHostRecord?.attachments, projectPreviewedAttachmentId]);

        const schedulesById = useMemo(() => {
          const next = {};
          schedules.forEach((schedule) => {
            if (!schedule?.id) return;
            next[schedule.id] = schedule;
          });
          return next;
        }, [schedules]);

        const sprintsById = useMemo(() => {
          const next = {};
          sprints.forEach((sprint) => {
            if (!sprint?.id) return;
            next[sprint.id] = sprint;
          });
          return next;
        }, [sprints]);

        const summary = useMemo(() => {
          return {
            backlog: tasks.filter((task) => task.status === "backlog" || task.status === "todo").length,
            active: tasks.filter((task) => task.status === "in_progress" || task.status === "blocked").length,
            scheduled: tasks.filter((task) => task.scheduledStartAt || task.dueAt).length,
            completed: tasks.filter((task) => task.status === "done").length,
          };
        }, [tasks]);

        const backlogFilterOptions = [
          { id: "open", label: "Open Tasks", description: "Show every task that is not done" },
          { id: "tasks", label: "Tasks Only", description: "Only show top-level tasks on the backlog" },
          { id: "subtasks", label: "Subtasks Only", description: "Only show subtasks, grouped below their parent tasks" },
          { id: "all", label: "All Tasks", description: "Show open and completed tasks together" },
          { id: "started", label: "Started", description: "Only show tasks that already have threads" },
          { id: "unassigned", label: "Unassigned", description: "Only show tasks without an assignee" },
          { id: "scheduled", label: "Scheduled", description: "Only show tasks with dates attached" },
          { id: "done", label: "Done", description: "Only show completed tasks" },
        ];
        const boardFilterOptions = [
          { id: "all", label: "All Tasks", description: "Show every task across all board lanes" },
          { id: "open", label: "Open Tasks", description: "Hide finished tasks and focus on active work" },
          { id: "started", label: "Started", description: "Only show tasks that already have threads" },
          { id: "unassigned", label: "Unassigned", description: "Only show tasks without an assignee" },
          { id: "blocked", label: "Blocked", description: "Only show tasks currently blocked" },
          { id: "done", label: "Finished", description: "Only show finished tasks" },
        ];
        const releaseFilterOptions = [
          { id: "all", label: "All Milestones", description: "Show every milestone in this project" },
          { id: "active", label: "Active", description: "Only show milestones currently in progress" },
          { id: "planned", label: "Planned", description: "Only show upcoming milestones" },
          { id: "completed", label: "Completed", description: "Only show milestones whose date range has ended" },
          { id: "open", label: "Needs Work", description: "Only show milestones with open tasks remaining" },
        ];
        const backlogSortOptions = [
          { id: "default", label: "Default Order" },
          { id: "recent-desc", label: "Recently Updated" },
          { id: "created-desc", label: "Newest Created" },
          { id: "priority-desc", label: "Highest Priority" },
          { id: "title-asc", label: "Title (A-Z)" },
        ];
        const projectOverviewTaskFilterOptions = [
          { id: "open", label: "Open Tasks", description: "Show active tickets that are not finished" },
          { id: "in-progress", label: "In Progress", description: "Only show tickets currently being worked on" },
          { id: "review", label: "In Review", description: "Only show tickets waiting for review" },
          { id: "blocked", label: "Blocked", description: "Only show blocked tickets" },
          { id: "started", label: "Started", description: "Only show tickets that already have threads" },
          { id: "unassigned", label: "Unassigned", description: "Only show tickets without an assignee" },
          { id: "scheduled", label: "Scheduled", description: "Only show tickets with dates attached" },
          { id: "all", label: "All Tasks", description: "Show open and finished tickets together" },
        ];
        const projectOverviewTaskSortOptions = [
          { id: "default", label: "Default Order", description: "Use the project task order" },
          { id: "recent-desc", label: "Recently Updated", description: "Show recently changed tickets first" },
          { id: "created-desc", label: "Newest Created", description: "Show newly created tickets first" },
          { id: "priority-desc", label: "Highest Priority", description: "Surface urgent and high priority tickets first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort tickets alphabetically" },
        ];
        const projectOverviewThreadSortOptions = [
          { id: "recent-desc", label: "Recently Updated", description: "Show the newest thread activity first" },
          { id: "created-desc", label: "Newest Created", description: "Show newly created threads first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort threads alphabetically" },
        ];
        const projectOverviewThreadFilterOptions = [
          { id: "all", label: "All Threads", description: "Show every project thread" },
          { id: "running", label: "Running", description: "Only show threads still in progress" },
          { id: "permission", label: "Needs Permission", description: "Only show threads waiting for approval" },
          { id: "completed", label: "Completed", description: "Only show finished threads" },
          { id: "failed", label: "Failed", description: "Only show failed or cancelled threads" },
        ];
        const projectOverviewFileSortOptions = [
          { id: "recent-desc", label: "Recently Updated", description: "Show the newest file activity first" },
          { id: "title-asc", label: "Title (A-Z)", description: "Sort files alphabetically" },
          { id: "operation-asc", label: "Operation", description: "Group file activity by operation" },
        ];
        const projectOverviewFileFilterOptions = [
          { id: "all", label: "All Files", description: "Show every file operation" },
          { id: "created", label: "Created", description: "Only show newly created files" },
          { id: "modified", label: "Modified", description: "Only show changed files" },
          { id: "deleted", label: "Deleted", description: "Only show deleted files" },
        ];
        const releaseSortOptions = [
          { id: "default", label: "Default Order" },
          { id: "start-asc", label: "Earliest Start" },
          { id: "end-asc", label: "Earliest End" },
          { id: "recent-desc", label: "Recently Updated" },
          { id: "title-asc", label: "Name (A-Z)" },
        ];
        const projectsHomeFilterOptions = [
          { id: "all", label: "All project types", description: "Show every project type." },
          { id: "active", label: "Active", description: "Show projects that still have open work." },
          { id: "completed", label: "Completed", description: "Show projects with no open issues." },
          ...PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.map((blueprint) => ({
            id: "type:" + blueprint.id,
            label: blueprint.title || blueprint.shortTitle || "Project type",
            description: blueprint.description || blueprint.shortTitle || "Filter by project type.",
          })),
        ];
        const activeBacklogFilterOption = backlogFilterOptions.find((option) => option.id === backlogFilterMode) || backlogFilterOptions[0];
        const activeBoardFilterOption = boardFilterOptions.find((option) => option.id === boardFilterMode) || boardFilterOptions[0];
        const activeBacklogSortOption = backlogSortOptions.find((option) => option.id === backlogSortMode) || backlogSortOptions[0];
        const activeProjectOverviewTaskFilterOption = projectOverviewTaskFilterOptions.find((option) => option.id === projectOverviewTaskFilterMode) || projectOverviewTaskFilterOptions[0];
        const activeProjectOverviewTaskSortOption = projectOverviewTaskSortOptions.find((option) => option.id === projectOverviewTaskSortMode) || projectOverviewTaskSortOptions[0];
        const activeProjectOverviewThreadFilterOption = projectOverviewThreadFilterOptions.find((option) => option.id === projectOverviewThreadFilterMode) || projectOverviewThreadFilterOptions[0];
        const activeProjectOverviewThreadSortOption = projectOverviewThreadSortOptions.find((option) => option.id === projectOverviewThreadSortMode) || projectOverviewThreadSortOptions[0];
        const activeProjectOverviewFileFilterOption = projectOverviewFileFilterOptions.find((option) => option.id === projectOverviewFileFilterMode) || projectOverviewFileFilterOptions[0];
        const activeProjectOverviewFileSortOption = projectOverviewFileSortOptions.find((option) => option.id === projectOverviewFileSortMode) || projectOverviewFileSortOptions[0];
        const activeReleaseFilterOption = releaseFilterOptions.find((option) => option.id === releaseFilterMode) || releaseFilterOptions[0];
        const activeReleaseSortOption = releaseSortOptions.find((option) => option.id === releaseSortMode) || releaseSortOptions[0];
        const activeReleaseBacklogFilterOption = backlogFilterOptions.find((option) => option.id === releaseBacklogFilterMode) || backlogFilterOptions[0];
        const activeReleaseBacklogSortOption = backlogSortOptions.find((option) => option.id === releaseBacklogSortMode) || backlogSortOptions[0];
        const activeProjectsHomeFilterOption = projectsHomeFilterOptions.find((option) => option.id === projectsHomeFilterMode) || projectsHomeFilterOptions[0];
        const sortedReleaseOptions = useMemo(() => releases.slice().sort(compareTaskReleaseOrder), [releases, releaseSortMode]);

        function taskHasStartedThread(task) {
          return Boolean(task?.lastStartedThreadId || (Array.isArray(task?.linkedThreadIds) && task.linkedThreadIds.length > 0));
        }

	        function isTaskThreadLaunchLocked(task) {
	          const normalizedTaskId = typeof task?.id === "string" ? task.id.trim() : "";
	          if (!normalizedTaskId) {
	            return false;
	          }
	          return taskRunPendingIds.includes(normalizedTaskId) || taskRunPendingIdsRef.current.has(normalizedTaskId);
	        }

        function getTaskStartedThreadId(task) {
          const lastStartedThreadId = typeof task?.lastStartedThreadId === "string"
            ? task.lastStartedThreadId.trim()
            : "";
          if (lastStartedThreadId) {
            return lastStartedThreadId;
          }

          const linkedThreadIds = Array.isArray(task?.linkedThreadIds)
            ? task.linkedThreadIds.filter((value) => typeof value === "string" && value.trim())
            : [];
          return linkedThreadIds.length > 0 ? linkedThreadIds[linkedThreadIds.length - 1] : "";
        }

        function buildPlaygroundTaskRunEnabledSkillsPayload(taskRecord) {
          const normalizedTaskRecord = normalizePlaygroundTaskRecord(taskRecord);
          const enabledSkillIds = getEffectivePlaygroundTaskEnabledSkillIds(normalizedTaskRecord);
          const defaultSkillMap = {
            image_generation: "imageGeneration",
            video_generation: "videoGeneration",
            web_search: "webSearch",
            deep_research: "deepResearch",
            pdf: "pdf",
            frontend_design: "frontendDesign",
            pptx: "pptx",
            memory: "memory",
            task_management: "taskManagement",
            app_platform: "appPlatform",
          };
          const payload = {};
          Object.entries(defaultSkillMap).forEach(([skillId, payloadKey]) => {
            payload[payloadKey] = enabledSkillIds.includes(skillId);
          });
          applyDemoSkillDefaultsToEnabledSkillsPayload(payload);
          if (enabledSkillIds.includes("computer_agents")) {
            payload.computerAgents = true;
          }
          if (getPlaygroundDirectSubtasks(normalizedTaskRecord).length > 0) {
            payload.taskManagement = true;
          }
          const customSkillIds = enabledSkillIds.filter((skillId) => !defaultSkillMap[skillId]);
          if (customSkillIds.length > 0) {
            payload.customSkills = customSkillIds
              .map((skillId) => {
                const matchingSkill = projectCustomSkills.find((skill) => skill?.id === skillId) || null;
                if (!matchingSkill) {
                  return null;
                }

                return {
                  id: matchingSkill.id,
                  name: typeof matchingSkill.name === "string" && matchingSkill.name.trim()
                    ? matchingSkill.name.trim()
                    : matchingSkill.id,
                  description: typeof matchingSkill.description === "string" ? matchingSkill.description : "",
                  markdown: typeof matchingSkill.markdown === "string" ? matchingSkill.markdown : "",
                  codeFiles: Array.isArray(matchingSkill.codeFiles)
                    ? matchingSkill.codeFiles
                        .filter((file) => file && typeof file === "object")
                        .map((file) => ({
                          name: typeof file.name === "string" ? file.name : "",
                          content: typeof file.content === "string" ? file.content : "",
                          language: typeof file.language === "string" ? file.language : undefined,
                        }))
                        .filter((file) => file.name)
                    : [],
                };
              })
              .filter((skill) => skill && Array.isArray(skill.codeFiles));
          }
          return payload;
        }

        function buildPlaygroundTaskGithubRepoReference(taskRecord, options = {}) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const attachments = normalizePlaygroundTaskAttachmentList(normalizedTask.attachments);
          const githubAttachment = attachments.find((attachment) =>
            getPlaygroundTaskAttachmentConnectorSource(attachment) === "github"
            && attachment.connectorRepoFullName
          ) || null;
          if (githubAttachment?.connectorRepoFullName && githubAttachment?.connectorRef) {
            const repoFullName = githubAttachment.connectorRepoFullName;
            return {
              repoFullName,
              repoName: repoFullName.split("/").pop() || repoFullName,
              branch: githubAttachment.connectorRef,
            };
          }

          const githubSelection = getDraftTaskConnectorSelection("github", normalizedTask);
          return buildPlaygroundGithubRepoReferenceFromConnectorSelection(githubSelection)
            || buildPlaygroundGithubRepoReferenceFromConnectorSelection(
              normalizePlaygroundTaskConnectorSelections(options?.projectConnectors || selectedProject?.connectors).github
            );
        }

        function buildPlaygroundTaskThreadPreview(taskRecord, threadId = "") {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const ticketNumber = taskTicketNumbersById[normalizedTask.id] || normalizedTask.ticketNumber || "000";
          const assigneeName = getTaskAssigneeName(normalizedTask.assigneeAgentId, "");
          const environmentDisplay = resolvePlaygroundTaskEnvironmentDisplay(normalizedTask, {
            projectRecord: selectedProject,
          });
          return {
            taskId: normalizedTask.id,
            projectId: normalizedTask.projectId || selectedProjectId || "",
            projectName: selectedProjectDetail?.project?.name || "",
            threadId: String(threadId || "").trim(),
            ticketNumber,
            title: normalizedTask.title || "Untitled Task",
            description: normalizedTask.description || "",
            taskColor: normalizedTask.taskColor || PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
            status: normalizedTask.status || "todo",
            priority: normalizedTask.priority || "medium",
            taskType: normalizePlaygroundTaskType(normalizedTask.taskType),
            assigneeAgentId: normalizedTask.assigneeAgentId || "",
            assigneeName,
            reviewRequired: normalizedTask.reviewRequired === true,
            reviewerAgentId: normalizedTask.reviewerAgentId || "",
            environmentId: environmentDisplay.environmentId,
            environmentName: environmentDisplay.description || environmentDisplay.label,
          };
        }

        function getPlaygroundProjectDefaultEnvironmentId(projectRecord = selectedProject) {
          const explicitProjectDefaultEnvironmentId = typeof projectRecord?.defaultEnvironmentId === "string" && projectRecord.defaultEnvironmentId.trim()
            ? projectRecord.defaultEnvironmentId.trim()
            : "";
          if (explicitProjectDefaultEnvironmentId) {
            return explicitProjectDefaultEnvironmentId;
          }
          const accountDefaultEnvironment = availableBacklogEnvironments.find((environment) => environment.isDefault) || null;
          if (accountDefaultEnvironment?.id) {
            return accountDefaultEnvironment.id;
          }
          return availableBacklogEnvironments[0]?.id || "";
        }

        async function readProjectGithubPreparationError(response, fallbackMessage) {
          const contentType = String(response?.headers?.get("content-type") || "").toLowerCase();
          if (contentType.includes("application/json")) {
            const data = await response.json().catch(() => ({}));
            return data?.message || data?.error || fallbackMessage;
          }
          const text = await response.text().catch(() => "");
          return text || fallbackMessage;
        }

        function buildProjectGithubPreparationHeaders() {
          const headers = new Headers(requestHeaders || {});
          headers.set("Content-Type", "application/json");
          if (effectiveApiKey && !headers.has("X-API-Key")) {
            headers.set("X-API-Key", effectiveApiKey);
          }
          return headers;
        }

        function emitProjectGithubPreparationStatus(projectRecord, environmentId, repoReference, phase, error = "") {
          if (typeof onStatusIndicatorItemChange !== "function" || !projectRecord?.id || !repoReference?.repoFullName) {
            return;
          }
          const environmentName = availableBacklogEnvironments.find((environment) => environment.id === environmentId)?.name || "";
          onStatusIndicatorItemChange(buildProjectGithubPreparationStatusIndicatorItem({
            projectId: projectRecord.id,
            repoFullName: repoReference.repoFullName,
            branch: repoReference.branch,
            environmentName,
            phase,
            error,
          }));
        }

        async function prepareProjectGithubConnectorRepositories(projectRecord, githubSelection) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const repoReferences = buildPlaygroundGithubRepoReferencesFromConnectorSelection(githubSelection);
          if (!normalizedProject?.id || repoReferences.length === 0) {
            return;
          }
          const targetEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(normalizedProject);
          if (!targetEnvironmentId) {
            throw new Error("Select a project environment before connecting a GitHub repository.");
          }

          await Promise.all(repoReferences.map(async (repoReference) => {
            const preparationKey = [
              normalizedProject.id,
              targetEnvironmentId,
              repoReference.repoFullName,
              repoReference.branch || "main",
            ].join("::");
            const existingPromise = projectGithubPreparationPromisesRef.current.get(preparationKey);
            if (existingPromise) {
              await existingPromise;
              return;
            }

            const preparationPromise = (async () => {
              emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "starting");
              const startResponse = await fetch(backendUrl + "/environments/" + encodeURIComponent(targetEnvironmentId) + "/start", {
                method: "POST",
                headers: buildProjectGithubPreparationHeaders(),
                body: JSON.stringify({}),
              });
              if (!startResponse.ok) {
                throw new Error(await readProjectGithubPreparationError(startResponse, "Failed to start the project environment."));
              }

              emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "running");
              const prepareResponse = await fetch(backendUrl + "/environments/" + encodeURIComponent(targetEnvironmentId) + "/github/prepare", {
                method: "POST",
                headers: buildProjectGithubPreparationHeaders(),
                body: JSON.stringify({
                  repoFullName: repoReference.repoFullName,
                  branch: repoReference.branch || "main",
                }),
              });
              if (!prepareResponse.ok) {
                throw new Error(await readProjectGithubPreparationError(prepareResponse, "Failed to prepare the GitHub repository."));
              }
              emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "finished");
            })()
              .catch((error) => {
                const errorMessage = error instanceof Error ? error.message : "Failed to prepare the GitHub repository.";
                emitProjectGithubPreparationStatus(normalizedProject, targetEnvironmentId, repoReference, "failed", errorMessage);
                throw error;
              })
              .finally(() => {
                projectGithubPreparationPromisesRef.current.delete(preparationKey);
              });

            projectGithubPreparationPromisesRef.current.set(preparationKey, preparationPromise);
            await preparationPromise;
          }));
        }

        function resolvePlaygroundTaskEnvironmentDisplay(taskRecord, options = {}) {
          const projectRecord = options?.projectRecord || selectedProject;
          const explicitEnvironmentId = typeof taskRecord?.environmentId === "string" && taskRecord.environmentId.trim()
            ? taskRecord.environmentId.trim()
            : "";
          const projectDefaultEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(projectRecord);
          const resolvedEnvironmentId = explicitEnvironmentId || projectDefaultEnvironmentId;
          const resolvedEnvironment = resolvedEnvironmentId
            ? availableBacklogEnvironments.find((environment) => environment.id === resolvedEnvironmentId) || null
            : null;

          if (!explicitEnvironmentId && projectDefaultEnvironmentId) {
            return {
              environmentId: projectDefaultEnvironmentId,
              label: "Project Default",
              description: resolvedEnvironment?.name || "Uses the project's default environment",
            };
          }

          if (resolvedEnvironment) {
            return {
              environmentId: resolvedEnvironment.id,
              label: resolvedEnvironment.name || "Environment",
              description: resolvedEnvironment.isDefault ? "Default environment" : "",
            };
          }

          if (resolvedEnvironmentId) {
            return {
              environmentId: resolvedEnvironmentId,
              label: resolvedEnvironmentId,
              description: "",
            };
          }

          return {
            environmentId: "",
            label: projectRecord ? "Project Default" : "Default",
            description: projectRecord
              ? "Uses the project's default environment"
              : "Uses your default environment",
          };
        }

        function buildPlaygroundTaskLaunchRecord(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata(taskRecord));
          const attachments = normalizePlaygroundTaskAttachmentList(normalizedTask.attachments);
          const attachmentConnectorItemIdsByKey = {};

          PLAYGROUND_TASK_CONNECTOR_OPTIONS.forEach((option) => {
            attachmentConnectorItemIdsByKey[option.key] = new Set();
          });

          attachments.forEach((attachment) => {
            const connectorSource = getPlaygroundTaskAttachmentConnectorSource(attachment);
            const connectorKey = getPlaygroundTaskConnectorKey(connectorSource);
            const connectorItemId = String(attachment?.connectorItemId || "").trim();
            if (!connectorKey || !connectorItemId || !attachmentConnectorItemIdsByKey[connectorKey]) {
              return;
            }
            attachmentConnectorItemIdsByKey[connectorKey].add(connectorItemId);
          });

          const currentConnectors = normalizePlaygroundTaskConnectorSelections(normalizedTask.connectors);
          const nextConnectors = buildPlaygroundDefaultTaskConnectors();

          PLAYGROUND_TASK_CONNECTOR_OPTIONS.forEach((option) => {
            const selection = currentConnectors[option.key];
            if (!selection) {
              nextConnectors[option.key] = null;
              return;
            }

            if (option.key === "notion") {
              nextConnectors[option.key] = selection;
              return;
            }

            const attachmentConnectorItemIds = attachmentConnectorItemIdsByKey[option.key] || new Set();
            const retainedItems = (Array.isArray(selection.items) ? selection.items : [])
              .map((item) => normalizePlaygroundTaskConnectorItem(item))
              .filter(Boolean)
              .filter((item) => {
                if (option.key === "github" && item.isFolder && !String(item.path || "").trim() && item.repoFullName) {
                  return true;
                }
                return attachmentConnectorItemIds.has(item.id);
              });

            nextConnectors[option.key] = retainedItems.length > 0
              ? buildPlaygroundTaskConnectorSelection(option.source, retainedItems, retainedItems.map((item) => item.id))
              : null;
          });

          return normalizePlaygroundTaskRecord(syncPlaygroundTaskRecordMetadata({
            ...normalizedTask,
            attachments,
            connectors: nextConnectors,
          }));
        }

        function mergePlaygroundAttachmentLists(...lists) {
          const mergedByKey = new Map();
          lists.forEach((list) => {
            normalizePlaygroundTaskAttachmentList(list).forEach((attachment) => {
              const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
              const attachmentKey = [
                normalizedAttachment.id,
                normalizeHistoryPath(normalizedAttachment.workspacePath),
                normalizeHistoryPath(normalizedAttachment.sourcePath),
                normalizedAttachment.filename,
              ].find((value) => typeof value === "string" && value.trim()) || generateId("attachment");
              if (!mergedByKey.has(attachmentKey)) {
                mergedByKey.set(attachmentKey, normalizedAttachment);
              }
            });
          });
          return Array.from(mergedByKey.values());
        }

        function getPlaygroundDirectSubtasks(taskRecord) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const taskId = String(normalizedTask?.id || "").trim();
          if (!taskId) {
            return [];
          }
          return (allTaskChildrenByParentId[taskId] || [])
            .map((subtask) => normalizePlaygroundTaskRecord(subtask))
            .filter((subtask) => subtask?.id)
            .sort(compareBacklogTaskOrder);
        }

        function getIncompletePlaygroundDirectSubtasks(taskRecord) {
          return getPlaygroundDirectSubtasks(taskRecord)
            .filter((subtask) => String(subtask.status || "").trim() !== "done");
        }

        function formatIncompleteSubtasksMessage(incompleteSubtasks) {
          const labels = (Array.isArray(incompleteSubtasks) ? incompleteSubtasks : [])
            .slice(0, 3)
            .map((subtask) => taskTicketNumbersById[subtask.id] || subtask.ticketNumber || subtask.title || subtask.id)
            .filter(Boolean);
          const suffix = incompleteSubtasks.length > labels.length
            ? " +" + String(incompleteSubtasks.length - labels.length) + " more"
            : "";
          return "Finish subtasks before closing parent: " + labels.join(", ") + suffix;
        }

        function buildPlaygroundTaskSubtaskPromptSection(taskRecord) {
          const directSubtasks = getPlaygroundDirectSubtasks(taskRecord);
          if (directSubtasks.length === 0) {
            return "";
          }
          const newline = String.fromCharCode(10);
          const subtaskLines = directSubtasks.map((subtask) => {
            const ticketNumber = taskTicketNumbersById[subtask.id] || subtask.ticketNumber || "000";
            const dependencyIds = Array.isArray(subtask.dependencyIds)
              ? subtask.dependencyIds.filter((dependencyId) => typeof dependencyId === "string" && dependencyId.trim())
              : [];
            const dependencyLabel = dependencyIds.length > 0
              ? " | dependencies=" + dependencyIds.map((dependencyId) => taskTicketNumbersById[dependencyId] || dependencyId).join(", ")
              : "";
            const threadId = getTaskStartedThreadId(subtask);
            const threadLabel = threadId ? " | thread=" + threadId : "";
            const descriptionPreview = String(subtask.description || "").replace(/\\s+/g, " ").trim();
            return [
              "- " + subtask.id + " · " + ticketNumber + " · " + (subtask.title || "Untitled Subtask"),
              "status=" + getPlaygroundTaskStatusLabel(subtask.status),
              "priority=" + getPlaygroundTaskPriorityLabel(subtask.priority),
              "assignee=" + (getTaskAssigneeName(subtask.assigneeAgentId, "Unassigned") || "Unassigned"),
              dependencyLabel ? dependencyLabel.slice(3) : null,
              threadLabel ? threadLabel.slice(3) : null,
              descriptionPreview ? ("desc=" + descriptionPreview) : null,
            ].filter(Boolean).join(" | ");
          });
          return [
            "Available subtasks:",
            ...subtaskLines,
            "",
            "Subtask orchestration:",
            "- Decide at runtime which subtasks should be started. Do not start every subtask automatically.",
            "- Use the task-management skill to run child task threads when they should be handled separately.",
            "- If this parent task needs a subtask result before continuing, run or wait for that subtask thread and inspect the result before continuing.",
            "- If a subtask can progress independently, launch it in parallel and continue this parent task; wait later only if its result becomes necessary.",
            "- Avoid parallel child work that touches the same files, environment state, credentials, or external resources in conflicting ways.",
            "- After using a subtask result, add a concise comment/status update to the subtask and update its status when appropriate.",
            "- Do not mark this parent task done until every direct subtask is done. If any direct subtask remains open, leave this parent task in progress and explain what is still waiting.",
          ].join(newline);
        }

        function buildPlaygroundTaskRunPrompt(taskRecord, options = {}) {
          const normalizedTask = normalizePlaygroundTaskRecord(taskRecord);
          const ticketNumber = taskTicketNumbersById[normalizedTask.id] || normalizedTask.ticketNumber || "000";
          const newline = String.fromCharCode(10);
          const paragraphBreak = newline + newline;
	          const reviewRequestBody = typeof options?.reviewRequestBody === "string"
	            ? options.reviewRequestBody.trim()
	            : "";
	          const normalizedTaskStatus = String(normalizedTask.status || "").trim().toLowerCase();
	          const projectId = String(normalizedTask.projectId || selectedProjectId || selectedProject?.id || "").trim();
		          const projectName = String(
		            selectedProject?.id && projectId && selectedProject.id === projectId
		              ? selectedProject.name || ""
		              : selectedProject?.name || ""
		          ).trim();
			          const projectStrategySection = buildPlaygroundProjectStrategyBriefPromptSection(selectedProject, {
			            taskRecord: normalizedTask,
			          });
			          const projectRulesSection = buildPlaygroundProjectRulesPromptSection(selectedProject);
			          const projectResourcesSection = buildPlaygroundProjectResourcePromptSection(selectedProject, {
			            projectId,
			            projectName,
			            projectAttachments: options?.projectAttachments,
			          });
			          const directResponseTask = isPlaygroundDirectResponseTask(normalizedTask);
	          const independentReviewerId = getPlaygroundIndependentReviewerId(normalizedTask);
	          const inReviewImplementationGuard = normalizedTaskStatus === "in_review" && !reviewRequestBody
	            ? [
	                "In-review ticket guard:",
	                "- This is not a reviewer approval run. Do not approve this ticket and do not move it to Finished/done.",
	                "- If the user only asks a conversational question, answer that question and leave the ticket status unchanged.",
                "- If the user explicitly asks for implementation or rework, do the requested work and leave the ticket In Review when finished so the configured reviewer can accept it.",
              ].join(newline)
	            : "";
		          const assigneeName = getTaskAssigneeName(normalizedTask.assigneeAgentId, "None") || "None";
		          const reviewerName = independentReviewerId
		            ? (getTaskAssigneeName(independentReviewerId, "Reviewer") || "Reviewer")
		            : normalizedTask.reviewRequired && normalizedTask.reviewerAgentId
		              ? "No independent reviewer configured"
		            : "No review required";
          const environmentDisplay = resolvePlaygroundTaskEnvironmentDisplay(normalizedTask, {
            projectRecord: selectedProject,
          });
          const environmentName = environmentDisplay.label === "Project Default" && environmentDisplay.description
            ? "Project Default (" + environmentDisplay.description + ")"
            : environmentDisplay.label;
          const connectorLines = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, normalizedTask);
            if (!selection?.valueLabel) {
              return null;
            }
            return "- " + option.label + ": " + selection.valueLabel;
          }).filter(Boolean);
          const commentLines = normalizePlaygroundTaskCommentList(normalizedTask.comments)
            .slice()
            .sort((left, right) => String(left.createdAt || "").localeCompare(String(right.createdAt || "")))
            .map((comment) => "- " + (comment.authorName || "Computer Agents") + ": " + comment.text);
          const skillNames = getEffectivePlaygroundTaskEnabledSkillIds(normalizedTask)
            .map((skillId) => resolveTaskSkillItem(skillId)?.name || skillId)
            .filter(Boolean);
          const taskAttachmentsSection = buildPlaygroundAttachmentPromptSection("Task attachments:", normalizedTask.attachments, {
            copy: "These files are attached specifically to this task.",
          });
	          const projectAttachmentsSection = buildPlaygroundAttachmentPromptSection(
	            "Project attachments:",
            options?.projectAttachments,
            {
              copy: "These files belong to the whole project and should be treated as shared project context for this task.",
            }
          );
          const subtasksSection = buildPlaygroundTaskSubtaskPromptSection(normalizedTask);
	          return wrapPlaygroundHiddenSystemPrompt([
	            "Run this backlog ticket as configured.",
	            projectName || projectId ? "Project: " + [projectName, projectId ? "(" + projectId + ")" : ""].filter(Boolean).join(" ") : "",
	            "Task ID: " + normalizedTask.id,
	            "Ticket: " + ticketNumber,
	            "Title: " + (normalizedTask.title || "Untitled Task"),
		            "Type: " + getPlaygroundTaskTypeLabel(normalizedTask.taskType),
		            "Status: " + getPlaygroundTaskStatusLabel(normalizedTask.status),
		            "Priority: " + getPlaygroundTaskPriorityLabel(normalizedTask.priority),
		            "Assignee: " + assigneeName,
		            "Review: " + reviewerName,
		            "Environment: " + environmentName,
			            skillNames.length > 0
			              ? (directResponseTask ? "Skills: None needed for this response-only ticket." : "Skills: " + skillNames.join(", "))
			              : "",
			            connectorLines.length > 0 ? "Connectors:" + newline + connectorLines.join(newline) : "",
				            projectStrategySection,
				            projectRulesSection,
				            projectResourcesSection,
				            [
	              "Execution expectations:",
	              "- The project id and task id above are authoritative. Do not list projects or tasks just to discover this ticket.",
	              "- Use Task Management, Computer Agents, filesystem, browser, or shell tools only when the ticket cannot be completed from the provided title, description, attachments, and comments.",
	              directResponseTask ? "- This is a response-only ticket. Reply directly, do not call tools, do not inspect projects/tasks, do not update task status, and obey wording constraints such as nothing more." : "",
	                reviewRequestBody ? "- This run is a reviewer change request. Address the latest review request before treating the ticket as complete." : "",
	              "- If the ticket creates or changes deployable web apps, functions, databases, or integrations, deploy and smoke-test the affected resource unless the ticket explicitly excludes deployment.",
	              "- If you need user-owned inputs such as API keys, credentials, billing decisions, repository access, or product decisions, create a focused human-assigned resource request ticket instead of guessing.",
	              "- Do not update this ticket's own status directly. The platform will move it to In Review or Finished after the run. Only update subtasks, add comments, or create resource-request tickets when that is genuinely part of the work.",
	              independentReviewerId ? "- When implementation is complete, leave the ticket ready for the configured reviewer; do not perform the review yourself." : "",
			            ].filter(Boolean).join(newline),
		            inReviewImplementationGuard,
		            normalizedTask.description
              ? "Description:" + newline + normalizedTask.description
              : "Description:" + newline + "None provided.",
            reviewRequestBody ? "Latest review request:" + newline + reviewRequestBody : "",
            commentLines.length > 0 ? "Comments:" + newline + commentLines.join(newline) : "",
            subtasksSection,
            taskAttachmentsSection,
            projectAttachmentsSection,
          ].filter(Boolean).join(paragraphBreak));
        }

        function buildPlaygroundMissionControlTaskSnapshot(taskRecords) {
          const sortedTaskRecords = (Array.isArray(taskRecords) ? taskRecords : [])
            .map((taskRecord) => normalizePlaygroundTaskRecord(taskRecord))
            .filter((taskRecord) => taskRecord?.id)
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });

          if (sortedTaskRecords.length === 0) {
            return "Existing tasks:\\n- No backlog tasks exist yet.";
          }

          return [
            "Existing tasks:",
            ...sortedTaskRecords.map((taskRecord) => {
              const ticketNumber = taskTicketNumbersById[taskRecord.id] || taskRecord.ticketNumber || "000";
              const releaseName = taskRecord.releaseId ? (releasesById[taskRecord.releaseId]?.name || "Milestone") : "All other";
              const descriptionPreview = String(taskRecord.description || "").replace(/\\s+/g, " ").trim();
              const blockedByTaskId = Array.isArray(taskRecord.dependencyIds) ? String(taskRecord.dependencyIds[0] || "").trim() : "";
              const blockedByTicketNumber = blockedByTaskId ? (taskTicketNumbersById[blockedByTaskId] || blockedByTaskId) : "";
              const skillNames = getEffectivePlaygroundTaskEnabledSkillIds(taskRecord)
                .map((skillId) => resolveTaskSkillItem(skillId)?.name || skillId)
                .filter(Boolean);
              const environmentLabel = resolvePlaygroundTaskEnvironmentDisplay(taskRecord, {
                projectRecord: selectedProject,
              }).label;
              return [
                "- " + ticketNumber + " · " + (taskRecord.title || "Untitled Task"),
                "  status=" + getPlaygroundTaskStatusLabel(taskRecord.status),
                "priority=" + getPlaygroundTaskPriorityLabel(taskRecord.priority),
                "type=" + getPlaygroundTaskTypeLabel(taskRecord.taskType),
                "milestone=" + releaseName,
                "assignee=" + (getTaskAssigneeName(taskRecord.assigneeAgentId, "Unassigned") || "Unassigned"),
                taskRecord.reviewRequired ? ("reviewer=" + (getTaskAssigneeName(taskRecord.reviewerAgentId, "Reviewer") || "Reviewer")) : null,
                "environment=" + environmentLabel,
                blockedByTicketNumber ? ("blocked_by=" + blockedByTicketNumber) : null,
                skillNames.length > 0 ? ("skills=" + skillNames.join(", ")) : null,
                descriptionPreview ? ("desc=" + descriptionPreview) : null,
              ].filter(Boolean).join(" | ");
            }),
          ].join("\\n");
        }

        function buildPlaygroundMissionControlAgentSnapshot(agentRecords, preferredAgentId = "") {
          const normalizedPreferredAgentId = String(preferredAgentId || "").trim();
          const sortedAgentRecords = (Array.isArray(agentRecords) ? agentRecords : [])
            .filter((agentRecord) => agentRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));

          if (sortedAgentRecords.length === 0) {
            return "Available agents:\\n- No agents are configured yet.";
          }

          return [
            "Available agents:",
            ...sortedAgentRecords.map((agentRecord) => {
              const descriptionPreview = String(agentRecord.description || "").replace(/\\s+/g, " ").trim();
              return [
                "- " + (agentRecord.name || agentRecord.id),
                "id=" + agentRecord.id,
                normalizedPreferredAgentId && agentRecord.id === normalizedPreferredAgentId ? "selected_for_this_run=true" : null,
                agentRecord.isDefault ? "default=true" : null,
                agentRecord.model ? ("model=" + agentRecord.model) : null,
                descriptionPreview ? ("desc=" + descriptionPreview) : null,
              ].filter(Boolean).join(" | ");
            }),
          ].join("\\n");
        }

        function buildPlaygroundMissionControlReleaseSnapshot(releaseRecords) {
          const sortedReleaseRecords = (Array.isArray(releaseRecords) ? releaseRecords : [])
            .filter((releaseRecord) => releaseRecord?.id)
            .slice()
            .sort(compareTaskReleaseOrder);

          if (sortedReleaseRecords.length === 0) {
            return "Existing milestones:\\n- No milestones exist yet.";
          }

          return [
            "Existing milestones:",
            ...sortedReleaseRecords.map((releaseRecord) => {
              const releaseDeadlineLabel = formatPlaygroundTaskReleaseDateRange(releaseRecord);
              return [
                "- " + (releaseRecord.name || "Untitled Milestone"),
                releaseRecord.description ? ("desc=" + String(releaseRecord.description).replace(/\\s+/g, " ").trim()) : null,
                "deadline=" + (releaseDeadlineLabel === "No dates" ? "No deadlines" : releaseDeadlineLabel),
                "open_tasks=" + String(Number.isFinite(releaseRecord.openTaskCount) ? releaseRecord.openTaskCount : 0),
              ].filter(Boolean).join(" | ");
            }),
          ].join("\\n");
        }

        function buildPlaygroundMissionControlSkillSnapshot(systemSkillRecords, customSkillRecords) {
          const builtInSkillInvocationNames = {
            image_generation: "image-generation",
            video_generation: "video-generation",
            web_search: "web-search",
            deep_research: "deep-research",
            frontend_design: "frontend-design",
            task_management: "task-management",
            computer_agents: "computer-agents",
            app_platform: "app-platform",
          };
          const normalizedSystemSkillRecords = (Array.isArray(systemSkillRecords) ? systemSkillRecords : [])
            .filter((skillRecord) => skillRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || left?.id || "").localeCompare(String(right?.name || right?.id || "")));
          const normalizedCustomSkillRecords = (Array.isArray(customSkillRecords) ? customSkillRecords : [])
            .filter((skillRecord) => skillRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || left?.id || "").localeCompare(String(right?.name || right?.id || "")));

          return [
            "Available skills:",
            normalizedSystemSkillRecords.length > 0
              ? ("- System skills: " + normalizedSystemSkillRecords.map((skillRecord) => {
                  const skillId = String(skillRecord.id || "").trim();
                  const displayName = skillRecord.name || skillId;
                  const invocationName = builtInSkillInvocationNames[skillId] || skillId;
                  if (invocationName && invocationName !== skillId) {
                    return displayName + " [invoke as " + invocationName + "; attach id " + skillId + "]";
                  }
                  return displayName + " [id " + skillId + "]";
                }).join(", "))
              : "- System skills: None listed.",
            normalizedCustomSkillRecords.length > 0
              ? ("- Custom skills: " + normalizedCustomSkillRecords.map((skillRecord) => {
                  const skillId = String(skillRecord.id || "").trim();
                  return (skillRecord.name || skillId) + " [id " + skillId + "]";
                }).join(", "))
              : "- Custom skills: None yet.",
          ].join("\\n");
        }

        function buildPlaygroundMissionControlEnvironmentSnapshot(environmentRecords, defaultEnvironmentId = "") {
          const normalizedDefaultEnvironmentId = String(defaultEnvironmentId || "").trim();
          const normalizedEnvironmentRecords = (Array.isArray(environmentRecords) ? environmentRecords : [])
            .filter((environmentRecord) => environmentRecord?.id)
            .slice()
            .sort((left, right) => String(left?.name || "").localeCompare(String(right?.name || "")));

          if (normalizedEnvironmentRecords.length === 0) {
            return "Available environments:\\n- No environments are configured yet.";
          }

          return [
            "Available environments:",
            ...normalizedEnvironmentRecords.map((environmentRecord) => [
              "- " + (environmentRecord.name || environmentRecord.id),
              "id=" + environmentRecord.id,
              environmentRecord.id === normalizedDefaultEnvironmentId ? "project_default=true" : null,
              environmentRecord.isDefault ? "account_default=true" : null,
            ].filter(Boolean).join(" | ")),
          ].join("\\n");
        }

        function stripPlaygroundMissionControlCodeBlock(markdown) {
          return String(markdown || "").replace(/\\x60\\x60\\x60mission_control_json[\\s\\S]*?\\x60\\x60\\x60/gi, "").trim();
        }

        function sanitizePlaygroundMissionControlDocument(markdown) {
          const rawDocument = stripPlaygroundMissionControlCodeBlock(markdown);
          if (!rawDocument) {
            return "";
          }

          const normalizedDocument = String(rawDocument).trim();
          const strategyStartMatch = normalizedDocument.match(
            /(?:^|\\n)\\s*(#{1,6}\\s*)?(Strategy Summary|Strategic Breakdown|Risks?\\s*(?:&|and)\\s*Opportunities|Recommended Next Moves)\\b/i
          );
          if (!strategyStartMatch || typeof strategyStartMatch.index !== "number") {
            return normalizedDocument;
          }

          const strategyStartIndex = Math.max(0, strategyStartMatch.index + (strategyStartMatch[0].startsWith("\\n") ? 1 : 0));
          return normalizedDocument.slice(strategyStartIndex).trim();
        }

        function extractPlaygroundMissionControlSummary(document) {
          const plainText = String(document || "")
            .replace(/\\x60\\x60\\x60[\\s\\S]*?\\x60\\x60\\x60/g, " ")
            .replace(/[\\x60*_>#-]/g, " ")
            .replace(/\\[(.*?)\\]\\((.*?)\\)/g, "$1")
            .replace(/\\s+/g, " ")
            .trim();
          if (!plainText) {
            return "";
          }
          const sentenceMatches = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
          const summary = sentenceMatches.slice(0, 2).join(" ").trim() || plainText;
          return summary.length > 260 ? summary.slice(0, 257).trimEnd() + "…" : summary;
        }

        function getPlaygroundProjectStrategyBriefRecord(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : null;
          const missionControl = getPlaygroundProjectMissionControlRecord(project);
          const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControl.strategyBrief);
          const projectGoal = normalizePlaygroundStrategyText(project?.description || metadata?.description);
          if (projectGoal) {
            strategyBrief.mission = projectGoal;
          } else if (!strategyBrief.mission && missionControl.summary) {
            strategyBrief.mission = normalizePlaygroundStrategyText(missionControl.summary);
          }
          if (!strategyBrief.mission && missionControl.document) {
            strategyBrief.mission = extractPlaygroundMissionControlSummary(missionControl.document);
          }
          return strategyBrief;
        }

        function getPlaygroundTaskStrategyOutcomeId(taskRecord) {
          const metadata = taskRecord?.metadata && typeof taskRecord.metadata === "object" && !Array.isArray(taskRecord.metadata)
            ? taskRecord.metadata
            : null;
          const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
            ? metadata.runnerPlayground
            : null;
          return normalizePlaygroundStrategyText(
            taskRecord?.strategyOutcomeId
            || metadata?.strategyOutcomeId
            || runnerPlayground?.strategyOutcomeId
          );
        }

        function findPlaygroundStrategyOutcomeForTask(strategyBrief, taskRecord) {
          const normalizedStrategy = normalizePlaygroundProjectStrategyBrief(strategyBrief);
          const outcomes = normalizedStrategy.outcomes;
          if (!outcomes.length || !taskRecord) {
            return null;
          }
          const taskOutcomeId = getPlaygroundTaskStrategyOutcomeId(taskRecord);
          const releaseId = normalizePlaygroundStrategyText(taskRecord.releaseId);
          if (taskOutcomeId) {
            const matchedOutcome = outcomes.find((outcome) => outcome.id === taskOutcomeId);
            if (matchedOutcome) {
              return matchedOutcome;
            }
          }
          if (releaseId) {
            const matchedOutcome = outcomes.find((outcome) =>
              normalizePlaygroundStrategyOutcomeReleaseIds(outcome).includes(releaseId)
            );
            if (matchedOutcome) {
              return matchedOutcome;
            }
          }
          const taskText = normalizePlaygroundStrategyText([taskRecord.title, taskRecord.description].filter(Boolean).join(" ")).toLowerCase();
          if (taskText) {
            return outcomes.find((outcome) => {
              const title = normalizePlaygroundStrategyText(outcome.title).toLowerCase();
              return title.length >= 8 && taskText.includes(title);
            }) || null;
          }
          return null;
        }

        function formatPlaygroundStrategyPromptList(label, values) {
          const items = normalizePlaygroundStrategyTextList(values);
          if (!items.length) {
            return "";
          }
          const newline = String.fromCharCode(10);
          return label + ":" + newline + items.map((item) => "- " + item).join(newline);
        }

        function buildPlaygroundProjectStrategyBriefPromptSection(project, options = {}) {
          const strategyBrief = getPlaygroundProjectStrategyBriefRecord(project);
          const newline = String.fromCharCode(10);
          const sections = [];
          if (strategyBrief.mission) {
            sections.push("Goal: " + strategyBrief.mission);
          }
          if (strategyBrief.outcomes.length > 0) {
            sections.push([
              "Primary outcomes:",
              ...strategyBrief.outcomes.map((outcome, index) => {
                const prefix = String(index + 1) + ". " + (outcome.title || "Outcome");
                const releaseIds = normalizePlaygroundStrategyOutcomeReleaseIds(outcome);
                const details = [
                  outcome.description,
                  releaseIds.length > 0 ? "Milestones: " + releaseIds.join(", ") : "",
                  outcome.successCriteria.length > 0 ? "Success: " + outcome.successCriteria.join("; ") : "",
                ].filter(Boolean).join(" ");
                return "- " + prefix + (details ? " — " + details : "");
              }),
            ].join(newline));
          }
          const taskOutcome = findPlaygroundStrategyOutcomeForTask(strategyBrief, options?.taskRecord);
          if (taskOutcome) {
            sections.push([
              "This task supports outcome: " + (taskOutcome.title || taskOutcome.id),
              taskOutcome.description ? "Outcome context: " + taskOutcome.description : "",
              taskOutcome.successCriteria.length > 0 ? "Outcome success criteria:" + newline + taskOutcome.successCriteria.map((item) => "- " + item).join(newline) : "",
            ].filter(Boolean).join(newline));
          }
          const scopeLines = [
            formatPlaygroundStrategyPromptList("In scope", strategyBrief.inScope),
            formatPlaygroundStrategyPromptList("Out of scope", strategyBrief.outOfScope),
          ].filter(Boolean).join(newline);
          if (scopeLines) {
            sections.push("Scope boundaries:" + newline + scopeLines);
          }
          [
            formatPlaygroundStrategyPromptList("Project success criteria", strategyBrief.successCriteria),
            formatPlaygroundStrategyPromptList("Risks and assumptions", strategyBrief.risks),
            formatPlaygroundStrategyPromptList("Key decisions", strategyBrief.decisions),
          ].filter(Boolean).forEach((section) => sections.push(section));
          if (!sections.length) {
            return "";
          }
	          return "Project goal and strategy:" + newline + sections.join(newline + newline);
	        }

	        function normalizePlaygroundMissionControlProjectRulesOutput(value) {
	          if (Array.isArray(value)) {
	            return serializePlaygroundProjectRuleEntries(value);
	          }
	          const normalized = normalizePlaygroundProjectRuleEntry(value);
	          if (!normalized) {
	            return "";
	          }
	          const paragraphEntries = splitPlaygroundProjectRuleEntries(normalized);
	          if (paragraphEntries.length > 1) {
	            return serializePlaygroundProjectRuleEntries(paragraphEntries);
	          }
	          return serializePlaygroundProjectRuleEntries(
	            normalized
	              .split(/\\n+/)
	              .map((entry) => normalizePlaygroundProjectRuleEntry(entry))
	              .filter(Boolean)
	          );
	        }
	        function parsePlaygroundMissionControlResponseContent(content) {
	          const rawContent = String(content || "").trim();
	          if (!rawContent) {
	            return buildEmptyPlaygroundProjectMissionControl();
          }

          const codeBlockMatch = rawContent.match(/\\x60\\x60\\x60mission_control_json\\s*([\\s\\S]*?)\\x60\\x60\\x60/i);
          let parsedBlock = null;
          if (codeBlockMatch?.[1]) {
            try {
              parsedBlock = JSON.parse(codeBlockMatch[1]);
            } catch {}
          }

          const document = sanitizePlaygroundMissionControlDocument(parsedBlock?.document || "")
            || sanitizePlaygroundMissionControlDocument(rawContent)
            || rawContent;
          const summary = String(parsedBlock?.summary || "").trim() || extractPlaygroundMissionControlSummary(document);
	          const strategyBrief = normalizePlaygroundProjectStrategyBrief(
	            parsedBlock?.strategyBrief
	            || parsedBlock?.structuredStrategy
	            || parsedBlock?.strategy
	          );
	          const normalizedRecord = normalizePlaygroundProjectMissionControlRecord({
	            summary,
	            document,
	            strategyBrief,
	            lastThreadId: "",
	            updatedAt: new Date().toISOString(),
	          });
	          if (
	            parsedBlock
	            && typeof parsedBlock === "object"
	            && !Array.isArray(parsedBlock)
	            && Object.prototype.hasOwnProperty.call(parsedBlock, "projectRules")
	          ) {
	            normalizedRecord.projectRules = normalizePlaygroundMissionControlProjectRulesOutput(parsedBlock.projectRules);
	            normalizedRecord.projectRulesReplace = parsedBlock.projectRulesReplace === true;
	          }
	          return normalizedRecord;
	        }

        async function fetchPlaygroundThreadMessages(threadId) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) {
            return [];
          }

          const pageSize = 200;
          const messages = [];
          let offset = 0;

          while (true) {
            const response = await fetch(
              backendUrl + "/threads/" + encodeURIComponent(normalizedThreadId) + "/messages?limit=" + pageSize + "&offset=" + offset + "&compact=1",
              {
                method: "GET",
                headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load Mission Control thread messages.");
            }
            const pageItems = Array.isArray(data?.data) ? data.data : [];
            messages.push(...pageItems);
            if (!data?.has_more || pageItems.length === 0) {
              break;
            }
            offset += pageItems.length;
          }

          return messages;
        }

        function getPlaygroundThreadMessageText(message) {
          if (typeof message?.content === "string") {
            return message.content;
          }
          if (Array.isArray(message?.content)) {
            return message.content
              .map((item) => {
                if (typeof item === "string") {
                  return item;
                }
                if (typeof item?.text === "string") {
                  return item.text;
                }
                if (typeof item?.content === "string") {
                  return item.content;
                }
                return "";
              })
              .filter(Boolean)
              .join("\\n")
              .trim();
          }
          return "";
        }

        function getPlaygroundThreadMessageAttachments(message) {
          const directAttachments = normalizePlaygroundTaskAttachmentList(message?.attachments);
          if (directAttachments.length > 0) {
            return directAttachments;
          }
          const logMetadata = message?.logMetadata && typeof message.logMetadata === "object" && !Array.isArray(message.logMetadata)
            ? message.logMetadata
            : null;
          return normalizePlaygroundTaskAttachmentList(logMetadata?.attachments);
        }

        function getPlaygroundMissionControlContentScore(content) {
          const rawContent = String(content || "").trim();
          if (!rawContent) {
            return 0;
          }

          let score = 0;
          if (/\\x60\\x60\\x60mission_control_json/i.test(rawContent)) {
            score += 240;
          }
          if (/strategy summary/i.test(rawContent)) {
            score += 80;
          }
          if (/strategic breakdown/i.test(rawContent)) {
            score += 60;
          }
          if (/risks?\\s*(?:&|and)\\s*opportunit/i.test(rawContent)) {
            score += 60;
          }
          if (/recommended next moves/i.test(rawContent)) {
            score += 50;
          }
          if (/mission control/i.test(rawContent)) {
            score += 20;
          }
          if (rawContent.length >= 400) {
            score += 20;
          }
          return score;
        }

        function isPlaygroundMissionControlReadableAttachment(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment || normalizedAttachment.type === "image") {
            return false;
          }
          const normalizedFilename = String(normalizedAttachment.filename || "").trim().toLowerCase();
          const normalizedMimeType = String(normalizedAttachment.mimeType || "").trim().toLowerCase();
          const extension = normalizedFilename.split(".").pop() || "";
`;
