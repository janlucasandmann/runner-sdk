export const PROJECTS_SHELL_04_FRAGMENT = `          if (normalizedMimeType.startsWith("text/") || normalizedMimeType.includes("json") || normalizedMimeType.includes("markdown")) {
            return true;
          }
          return ["md", "markdown", "mdx", "txt", "text", "json", "yml", "yaml"].includes(extension);
        }

        function getPlaygroundMissionControlAttachmentScore(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment) {
            return 0;
          }
          const normalizedFilename = String(normalizedAttachment.filename || "").trim().toLowerCase();
          const extension = normalizedFilename.split(".").pop() || "";
          let score = 0;
          if (normalizedFilename.includes("mission")) {
            score += 60;
          }
          if (normalizedFilename.includes("strategy")) {
            score += 50;
          }
          if (normalizedFilename.includes("summary")) {
            score += 20;
          }
          if (normalizedFilename.includes("result") || normalizedFilename.includes("report")) {
            score += 15;
          }
          if (extension === "md" || extension === "markdown" || extension === "mdx") {
            score += 20;
          } else if (extension === "json") {
            score += 15;
          } else if (extension === "txt" || extension === "text") {
            score += 10;
          }
          return score;
        }

        async function fetchPlaygroundMissionControlAttachmentText(attachment) {
          const normalizedAttachment = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalizedAttachment || !isPlaygroundMissionControlReadableAttachment(normalizedAttachment)) {
            return "";
          }

          const attachmentUrl = resolveTaskAttachmentPreviewUrl(normalizedAttachment)
            || resolveTaskAttachmentApiUrl(normalizedAttachment.url, normalizedAttachment.id)
            || getTaskAttachmentWorkspaceDownloadUrl(normalizedAttachment);
          if (!attachmentUrl) {
            return "";
          }

          try {
            const response = await fetch(attachmentUrl, {
              method: "GET",
              headers: requestHeaders,
            });
            if (!response.ok) {
              return "";
            }
            return await response.text();
          } catch {
            return "";
          }
        }

        async function resolvePlaygroundMissionControlRecordFromMessages(threadMessages) {
          const assistantMessages = (Array.isArray(threadMessages) ? threadMessages : [])
            .filter((message) => String(message?.role || "").trim().toLowerCase() === "assistant")
            .slice()
            .reverse();

          let bestRecord = buildEmptyPlaygroundProjectMissionControl();
          let bestScore = 0;

          for (const message of assistantMessages) {
            const inlineText = getPlaygroundThreadMessageText(message);
            if (inlineText) {
              const inlineRecord = parsePlaygroundMissionControlResponseContent(inlineText);
              const inlineScore = getPlaygroundMissionControlContentScore(inlineText);
              if (String(inlineRecord.document || "").trim() && (inlineScore > bestScore || !String(bestRecord.document || "").trim())) {
                bestRecord = inlineRecord;
                bestScore = inlineScore;
                if (inlineScore >= 240) {
                  return inlineRecord;
                }
              }
            }

            const attachmentCandidates = getPlaygroundThreadMessageAttachments(message)
              .filter(isPlaygroundMissionControlReadableAttachment)
              .sort((left, right) => getPlaygroundMissionControlAttachmentScore(right) - getPlaygroundMissionControlAttachmentScore(left))
              .slice(0, 6);

            for (const attachment of attachmentCandidates) {
              const attachmentContent = await fetchPlaygroundMissionControlAttachmentText(attachment);
              if (!String(attachmentContent || "").trim()) {
                continue;
              }
              const parsedAttachmentRecord = parsePlaygroundMissionControlResponseContent(attachmentContent);
              const attachmentScore = getPlaygroundMissionControlAttachmentScore(attachment) + getPlaygroundMissionControlContentScore(attachmentContent);
              if (String(parsedAttachmentRecord.document || "").trim() && (attachmentScore > bestScore || !String(bestRecord.document || "").trim())) {
                bestRecord = parsedAttachmentRecord;
                bestScore = attachmentScore;
                if (attachmentScore >= 240) {
                  return parsedAttachmentRecord;
                }
              }
            }
          }

          return bestRecord;
        }

        function buildPlaygroundMissionControlOperatingProfilePromptSection(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const blueprint = getPlaygroundProjectBlueprint(
            project?.projectType
            || project?.type
            || metadata.projectType
            || metadata.blueprintId
          );
          const operatingProfile = metadata.operatingProfileSnapshot && typeof metadata.operatingProfileSnapshot === "object" && !Array.isArray(metadata.operatingProfileSnapshot)
            ? metadata.operatingProfileSnapshot
            : buildPlaygroundProjectOperatingProfileSnapshot(blueprint);
          const newline = String.fromCharCode(10);

          function formatProfileList(label, values) {
            const items = Array.isArray(values)
              ? values.map((value) => String(value || "").trim()).filter(Boolean)
              : [];
            return items.length ? "- " + label + ": " + items.join(", ") : "";
          }

          const dashboardProfile = operatingProfile.dashboardProfile && typeof operatingProfile.dashboardProfile === "object"
            ? operatingProfile.dashboardProfile
            : {};
          const missionControlProfile = operatingProfile.missionControlProfile && typeof operatingProfile.missionControlProfile === "object"
            ? operatingProfile.missionControlProfile
            : {};
          const setupRecipe = operatingProfile.setupRecipe && typeof operatingProfile.setupRecipe === "object"
            ? operatingProfile.setupRecipe
            : {};
          const syncProfiles = Array.isArray(operatingProfile.syncProfiles) ? operatingProfile.syncProfiles : [];
          const syncLines = syncProfiles
            .map((profile) => {
              const source = String(profile?.source || profile?.label || "").trim();
              if (!source) return "";
              const direction = String(profile?.direction || "").trim();
              const objects = Array.isArray(profile?.objects) ? profile.objects.map((item) => String(item || "").trim()).filter(Boolean) : [];
              return "- Sync: " + source + (direction ? " (" + direction + ")" : "") + (objects.length ? " for " + objects.join(", ") : "");
            })
            .filter(Boolean);

          return [
            "Project operating profile:",
            "- Type: " + (operatingProfile.title || blueprint.title || "Blank Project") + " [" + (operatingProfile.id || blueprint.id || "blank") + "]",
            operatingProfile.description ? "- Purpose: " + operatingProfile.description : "",
            missionControlProfile.planningStyle ? "- Planning style: " + missionControlProfile.planningStyle : "",
            missionControlProfile.releasePattern ? "- Milestone pattern: " + missionControlProfile.releasePattern : "",
            formatProfileList("Priorities", missionControlProfile.prioritization),
            formatProfileList("Dashboard focus", dashboardProfile.primaryMetrics),
            formatProfileList("Activity focus", dashboardProfile.activityFocus),
            formatProfileList("Recommended resources", operatingProfile.suggestedResources),
            formatProfileList("Recommended skills", operatingProfile.suggestedSkills),
            formatProfileList("Starter folders", setupRecipe.initialFolders || operatingProfile.suggestedFolders),
            ...syncLines,
          ].filter(Boolean).join(newline);
        }

        function buildPlaygroundMissionControlPrompt(options = {}) {
          const normalizedProject = normalizePlaygroundProjectRecord(options?.projectRecord || selectedProject || projectDraft);
          const newline = String.fromCharCode(10);
          const paragraphBreak = newline + newline;
          const normalizedLaunchAgentId = String(options?.launchAgentId || "").trim();
          const launchAgent = normalizedLaunchAgentId ? (agentsById[normalizedLaunchAgentId] || null) : null;
          const defaultExecutionAgent = sortedAgents.find((agent) => {
            const normalizedName = String(agent?.name || "").trim().toLowerCase();
            const normalizedId = String(agent?.id || "").trim();
            return normalizedName === "assistant" || normalizedId.startsWith("agent-assistant-");
          }) || sortedAgents.find((agent) => agent?.isDefault && agent?.id) || sortedAgents[0] || launchAgent || null;
          const projectDefaultEnvironmentId = getPlaygroundProjectDefaultEnvironmentId(normalizedProject);
          const availableAgentsSection = buildPlaygroundMissionControlAgentSnapshot(sortedAgents, normalizedLaunchAgentId);
          const availableReleasesSection = buildPlaygroundMissionControlReleaseSnapshot(releases);
          const availableSkillsSection = buildPlaygroundMissionControlSkillSnapshot(taskSystemSkillItems, projectCustomSkills);
          const availableEnvironmentsSection = buildPlaygroundMissionControlEnvironmentSnapshot(
            availableBacklogEnvironments,
            projectDefaultEnvironmentId
          );
		          const projectAttachmentsSection = buildPlaygroundAttachmentPromptSection(
		            "Project attachments:",
		            normalizedProject.attachments,
            {
              copy: "These files belong to the entire project and describe the shared scope, requirements, or design direction.",
            }
          );
          const runAttachmentsSection = buildPlaygroundAttachmentPromptSection(
            "Additional operator attachments:",
            options?.attachments,
            {
              copy: "These files were attached specifically for this Mission Control run.",
            }
          );
		          const projectConnectorsSection = buildPlaygroundConnectorPromptSection(
		            "Project connectors",
		            normalizedProject.connectors
		          );
		          const projectResourcesSection = buildPlaygroundProjectResourcePromptSection(normalizedProject, {
		            projectId: normalizedProject.id,
		            projectName: normalizedProject.name,
		            projectAttachments: normalizedProject.attachments,
		          });
	          const operatorPrompt = String(options?.userPrompt || "").trim();
	          const projectContextDescription = getPlaygroundProjectMissionInstructions(normalizedProject);
	          const projectOperatingProfileSection = buildPlaygroundMissionControlOperatingProfilePromptSection(normalizedProject);
	          const currentProjectStrategySection = buildPlaygroundProjectStrategyBriefPromptSection(normalizedProject);
	          const currentProjectRulesSection = buildPlaygroundProjectRulesPromptSection(normalizedProject);
	          return [
	            "You are running Mission Control for this project.",
		            "Your job is to analyze the available project context, reconcile the current project state, define the right strategy, and update the project structure using the Task Management and Computer Agents skills where appropriate.",
	            "Always use the Task Management skill for milestones, tasks, subtasks, blockers, comments, and other planning mutations instead of only describing them in prose.",
            "Always use the Computer Agents skill for live discovery of agents, environments, and skills instead of inventing IDs or writing raw curl requests.",
            "When invoking built-in skills, use the exact invocation names from the available skills list, for example task-management and computer-agents. Do not invoke skills using attachment IDs like task_management or computer_agents.",
            "Project: " + (normalizedProject.name || "Untitled Project"),
            projectContextDescription
              ? ("Project goal:" + newline + projectContextDescription)
              : "Project goal: None provided.",
		            projectOperatingProfileSection,
		            projectAttachmentsSection,
		            runAttachmentsSection,
		            projectConnectorsSection,
		            projectResourcesSection,
		            currentProjectStrategySection
	              ? ("Current structured project strategy:" + newline + currentProjectStrategySection)
	              : "Current structured project strategy: None yet.",
	            currentProjectRulesSection
	              ? ("Current project rules:" + newline + currentProjectRulesSection)
	              : "Current project rules: None yet.",
	            availableReleasesSection,
	            buildPlaygroundMissionControlTaskSnapshot(tasks),
	            availableAgentsSection,
	            availableEnvironmentsSection,
            availableSkillsSection,
            operatorPrompt
              ? ("Operator directive for this Mission Control run:" + newline + operatorPrompt)
              : "",
            [
              "Required outputs:",
              "1. Analyze the project operating profile, attachments, project goal, existing milestones, open work, completed work, comments, blocked work, and likely next steps.",
              "2. Use the Computer Agents skill to inspect the live agent roster, environments, and available skills before assigning work.",
	              "3. Form a strategy for the project and explain the direction clearly.",
	              "   - Also create compact structured strategy context agents can use inside every task prompt.",
	              "   - The structured strategy context must express the project goal, primary outcomes, in-scope boundaries, out-of-scope boundaries, success criteria, risks/assumptions, and key decisions.",
	              "   - Outcomes should be concrete user/business outcomes, not generic task status buckets. Include releaseIds (milestone ids) when outcomes clearly map to existing milestones. Use releaseId only for a legacy single-milestone mapping.",
	              "   - Preserve existing outcome ids when you are updating an existing outcome. Only remove an outcome when it is clearly obsolete or the operator asks for that.",
	              "   - Update project rules when the project needs durable execution behavior that every future task agent should follow. Do not duplicate generic platform behavior as a rule.",
	              "4. Inspect the available agents and assign the backlog work intentionally.",
	              defaultExecutionAgent
	                ? ("   - Every created or updated execution task and subtask must have an agent assignee. If no better specialist is obvious, set assigneeAgentId to " + defaultExecutionAgent.id + " (" + (defaultExecutionAgent.name || "Assistant") + ").")
                : "   - Every created or updated execution task and subtask must have an agent assignee. If no better fit is obvious, use the system Assistant agent returned by the Computer Agents or Task Management skill.",
              "5. Create or update the project structure using the Task Management skill whenever the project needs clearer execution steps.",
              "   - If the project is empty or still loosely defined, create at least one milestone first and then place the new work under milestones.",
              "   - When the project is new, use the operating profile setup recipe, recommended resources, skills, sync targets, and dashboard focus as the default project shape.",
              "   - Prefer a clear hierarchy of parent tasks and subtasks instead of keeping every item flat.",
              "   - Add blocked-by dependencies so the execution order is explicit and immediately understandable.",
              "   - Create human-assigned resource request tasks only when user-owned input is required, such as API keys, credentials, billing decisions, repository access, or product decisions. Make them small, explicit, and acceptance-criteria driven.",
              "   - Never leave Mission Control-generated execution tasks unassigned. Unassigned execution backlog items are invalid.",
              "   - Pass assigneeAgentId whenever you create or update execution tasks, including parent tasks. Use the human assignment option only for resource/input requests or explicit manual reviews.",
              "   - Use in_review and reviewer metadata for work that needs human or agent acceptance before it is done.",
              "   - Set releaseId on planned work whenever the task belongs to a specific milestone.",
              "   - Attach enabled skill IDs to tasks after you inspect the live skill list.",
              "   - Use the project's default environment for execution work unless a different environment is clearly more appropriate.",
              "   - Add task comments whenever they preserve important rationale, sequencing, architectural decisions, or handoff context.",
              "   - Use connectors when there is concrete connector context that materially helps the task.",
              "   - Project connectors are inherited by project work. When a task needs repository context, attach the relevant project GitHub connector to the task so the execution thread can prepare the repository in the project environment.",
              "   - Write every task description as a concise professional execution brief in markdown. Include context, dependencies, deployment expectations, verification steps, and acceptance criteria.",
              "   - If a ticket creates cloud functions, web apps, databases, or integrations, include deploy-and-smoke-test requirements in that same ticket unless a dependency-linked deployment ticket already exists.",
              "   - Keep descriptions focused and execution-ready rather than long speculative specs.",
              "   - Delete, close, or comment on obsolete tickets instead of leaving stale work mixed into the active plan.",
              "   - If a reusable project-specific workflow gap is obvious and worth reusing, create a custom skill before attaching it to tasks.",
              "   - Aim for task records that are execution-ready: milestone, assignee, environment, skills, hierarchy/dependencies, and useful comments should all be populated when the context supports it.",
              "   - When you create parent tasks, also create the subtasks and dependency chain needed to express the real order of work.",
              "6. In your human-readable response, output only the strategy document markdown itself.",
              "   - Do not add any conversational intro, acknowledgement, explanation, or outro before or after the document.",
              "   - Start directly with the first strategy heading.",
              "   - Use these sections in order:",
              "     - Strategy Summary",
              "     - Strategic Breakdown",
              "     - Risks & Opportunities",
              "     - Recommended Next Moves",
              "7. End your final response with a fenced code block labeled mission_control_json.",
              "   - The markdown before that code block must exactly match the strategy document text stored in the JSON document field.",
	              "8. That JSON must contain these keys:",
	              '   - "summary": a 1-2 sentence summary for the Mission Control card',
	              '   - "document": the full strategy document in markdown only, with no conversational preface or trailing commentary',
	              '   - "strategyBrief": an object with keys "goal", "outcomes", "inScope", "outOfScope", "successCriteria", "risks", and "decisions"',
	              '     - "outcomes" must be an array of objects with "id", "title", "description", optional "releaseIds", optional legacy "releaseId", and optional "successCriteria"',
	              '   - "projectRules": optional array of rule strings. Include it only when project rules should be created, replaced, or updated; otherwise omit it.',
	              '   - "projectRulesReplace": optional true. Include it only when intentionally clearing all existing project rules.',
	            ].join(newline),
	          ].filter(Boolean).join(paragraphBreak);
	        }

        function buildPlaygroundMissionControlEnabledSkillsPayload(basePayload) {
          const payload = basePayload && typeof basePayload === "object" ? { ...basePayload } : {};
          payload.taskManagement = true;
          payload.computerAgents = true;
          return applyDemoSkillDefaultsToEnabledSkillsPayload(payload);
        }

        function hasIncompleteTaskDependencies(task) {
          const dependencyIds = normalizePlaygroundIdList(task?.dependencyIds);
          if (dependencyIds.length === 0) {
            return false;
          }
          return dependencyIds.some((dependencyId) => {
            const dependencyTask = tasksById[dependencyId] || null;
            return Boolean(dependencyTask && !isPlaygroundTaskTerminalStatus(dependencyTask.status));
          });
        }

        function getTaskBoardStatus(task) {
          const normalizedTaskId = typeof task?.id === "string" ? task.id.trim() : "";
	          const taskRunState = normalizedTaskId && taskRunStates[normalizedTaskId] && typeof taskRunStates[normalizedTaskId] === "object"
	            ? taskRunStates[normalizedTaskId]
	            : null;
	          const taskRunPhase = typeof taskRunState?.phase === "string" ? taskRunState.phase.trim().toLowerCase() : "";
	          const taskRunStatus = typeof taskRunState?.taskStatus === "string" ? taskRunState.taskStatus.trim().toLowerCase() : "";
          const isOptimisticallyInProgress =
            Boolean(normalizedTaskId)
            && (
              taskRunPendingIds.includes(normalizedTaskId)
              || taskRunPendingIdsRef.current.has(normalizedTaskId)
              || taskRunPhase === "starting"
              || taskRunPhase === "running"
            );

		          if (taskRunPhase === "in_review") {
		            return PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === taskRunStatus)
		              ? taskRunStatus
		              : "in_review";
		          }
          if (task?.status === "blocked") {
            return hasIncompleteTaskDependencies(task) ? "blocked" : "todo";
          }
	          if (isPlaygroundTaskTerminalStatus(task?.status) || task?.status === "in_review") {
	            return task.status;
	          }
          if (isOptimisticallyInProgress) {
            return "in_progress";
          }
          if (task?.status === "in_progress") {
            return isHumanAssignedTask(task) || taskHasStartedThread(task) ? "in_progress" : "todo";
          }
          return "todo";
        }

        function matchesBacklogFilter(task, filterMode, options = {}) {
          const keepVisibleCompletedTaskIds = options?.keepVisibleCompletedTaskIds instanceof Set
            ? options.keepVisibleCompletedTaskIds
            : null;
          const shouldKeepCompletedTaskVisible = Boolean(
            keepVisibleCompletedTaskIds
            && isPlaygroundTaskTerminalStatus(task?.status)
            && typeof task?.id === "string"
            && keepVisibleCompletedTaskIds.has(task.id)
          );
          if (filterMode === "all") {
            return true;
          }
          if (filterMode === "tasks") {
            return !isPlaygroundSubtaskRecord(task);
          }
          if (filterMode === "subtasks") {
            return isPlaygroundSubtaskRecord(task);
          }
          if (filterMode === "done") {
            return isPlaygroundTaskTerminalStatus(task.status);
          }
          if (shouldKeepCompletedTaskVisible) {
            return true;
          }
          if (isPlaygroundTaskTerminalStatus(task.status)) {
            return false;
          }
          if (filterMode === "started") {
            return taskHasStartedThread(task);
          }
          if (filterMode === "unassigned") {
            return !task.assigneeAgentId;
          }
          if (filterMode === "scheduled") {
            return Boolean(task.scheduledStartAt || task.scheduledEndAt || task.dueAt);
          }
          return true;
        }

        function matchesBoardFilter(task, filterMode) {
          if (filterMode === "all") {
            return true;
          }
          const boardStatus = getTaskBoardStatus(task);
          if (filterMode === "done") {
            return isPlaygroundTaskTerminalStatus(boardStatus);
          }
          if (filterMode === "blocked") {
            return boardStatus === "blocked";
          }
          if (filterMode === "open") {
            return boardStatus !== "done";
          }
          if (filterMode === "started") {
            return taskHasStartedThread(task);
          }
          if (filterMode === "unassigned") {
            return !task.assigneeAgentId;
          }
          return true;
        }

        function matchesTaskSearch(task) {
          if (!normalizedSearchQuery) {
            return true;
          }
          const haystack = [
            taskTicketNumbersById[task.id] || "",
            task.title || "",
            task.description || "",
            getPlaygroundTaskStatusLabel(task.status),
            getPlaygroundTaskPriorityLabel(task.priority),
            getPlaygroundTaskTypeLabel(task.taskType),
            getTaskAssigneeName(task.assigneeAgentId, ""),
            environmentsById[task.environmentId || ""]?.name || "",
            releasesById[task.releaseId || ""]?.name || "",
            sprintsById[task.sprintId || ""]?.name || "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        }

        function compareWorkspaceTaskOrder(left, right) {
          const statusOrder = {
            in_progress: 0,
            blocked: 1,
            todo: 2,
            backlog: 3,
            done: 4,
          };
          const leftStatus = statusOrder[left.status] ?? 99;
          const rightStatus = statusOrder[right.status] ?? 99;
          if (leftStatus !== rightStatus) {
            return leftStatus - rightStatus;
          }
          if ((left.sortOrder || 0) !== (right.sortOrder || 0)) {
            return (left.sortOrder || 0) - (right.sortOrder || 0);
          }
          return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
        }

        function compareBacklogDefaultTaskOrder(left, right) {
          const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : 0;
          const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : 0;
          if (leftSortOrder !== rightSortOrder) {
            return leftSortOrder - rightSortOrder;
          }
          const leftCreatedAt = Date.parse(left?.createdAt || "") || 0;
          const rightCreatedAt = Date.parse(right?.createdAt || "") || 0;
          if (leftCreatedAt !== rightCreatedAt) {
            return leftCreatedAt - rightCreatedAt;
          }
          return String(left?.id || "").localeCompare(String(right?.id || ""));
        }

        function compareBacklogTaskOrderWithModes(left, right, sortMode = backlogSortMode, filterMode = backlogFilterMode) {
          const priorityOrder = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          if (sortMode === "default") {
            return compareBacklogDefaultTaskOrder(left, right);
          }
          if (filterMode === "all") {
            const leftIsDone = isPlaygroundTaskTerminalStatus(left.status);
            const rightIsDone = isPlaygroundTaskTerminalStatus(right.status);
            if (leftIsDone !== rightIsDone) {
              return leftIsDone ? 1 : -1;
            }
          }
          if (sortMode === "title-asc") {
            return String(left.title || "").localeCompare(String(right.title || ""));
          }
          if (sortMode === "created-desc") {
            return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
          }
          if (sortMode === "priority-desc") {
            const leftPriority = priorityOrder[left.priority] ?? 99;
            const rightPriority = priorityOrder[right.priority] ?? 99;
            if (leftPriority !== rightPriority) {
              return leftPriority - rightPriority;
            }
          }
          return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
        }

        function compareBacklogTaskOrder(left, right) {
          return compareBacklogTaskOrderWithModes(left, right, backlogSortMode, backlogFilterMode);
        }

        function compareTaskReleaseOrder(left, right) {
          if (releaseSortMode === "title-asc") {
            return String(left.name || "").localeCompare(String(right.name || ""));
          }
          if (releaseSortMode === "recent-desc") {
            return String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || ""));
          }
          if (releaseSortMode === "start-asc") {
            const leftStart = Date.parse(left.startAt || "") || Number.MAX_SAFE_INTEGER;
            const rightStart = Date.parse(right.startAt || "") || Number.MAX_SAFE_INTEGER;
            if (leftStart !== rightStart) {
              return leftStart - rightStart;
            }
          }
          if (releaseSortMode === "end-asc") {
            const leftEnd = Date.parse(left.endAt || "") || Number.MAX_SAFE_INTEGER;
            const rightEnd = Date.parse(right.endAt || "") || Number.MAX_SAFE_INTEGER;
            if (leftEnd !== rightEnd) {
              return leftEnd - rightEnd;
            }
          }
          const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : 0;
          const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : 0;
          if (leftSortOrder !== rightSortOrder) {
            return leftSortOrder - rightSortOrder;
          }
          return String(left.name || "").localeCompare(String(right.name || ""));
        }

        function matchesReleaseFilter(release) {
          const releaseStatus = getPlaygroundTaskReleaseStatus(release);
          if (releaseFilterMode === "all") {
            return true;
          }
          if (releaseFilterMode === "active") {
            return releaseStatus === "active";
          }
          if (releaseFilterMode === "planned") {
            return releaseStatus === "planned";
          }
          if (releaseFilterMode === "completed") {
            return releaseStatus === "completed";
          }
          if (releaseFilterMode === "open") {
            return Number(release?.openTaskCount || 0) > 0;
          }
          return true;
        }

        function matchesReleaseSearch(release) {
          if (!normalizedSearchQuery) {
            return true;
          }
          const haystack = [
            release.name || "",
            release.description || "",
            getPlaygroundTaskReleaseStatus(release),
            String(release.taskCount || ""),
            String(release.openTaskCount || ""),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearchQuery);
        }

        const projectSearchPlaceholder = useMemo(() => {
          if (selectedReleaseId && (taskView === "backlog" || taskView === "board")) {
            return "Search milestone tasks, ticket numbers, assignees, or environments...";
          }
          if (taskView === "overview") {
            return "Search tasks, threads, files, environments, or plugins...";
          }
          return taskView === "calendar"
            ? "Search tasks, schedules, agents, or environments..."
            : "Search tasks, ticket numbers, assignees, or sprints...";
        }, [selectedReleaseId, taskView]);

        const projectSidebarNavItems = useMemo(() => {
          return PLAYGROUND_PROJECT_VIEW_OPTIONS.filter((item) => item.id !== "calendar");
        }, []);

        const currentProjectViewerTokens = useMemo(() => {
          return [
            currentUserId,
            currentUserEmail,
            currentUserName,
          ]
            .map((value) => String(value || "").trim().toLowerCase())
            .filter(Boolean);
        }, [currentUserEmail, currentUserId, currentUserName]);

        function getProjectIdentityTokens(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const owner = project?.owner && typeof project.owner === "object" && !Array.isArray(project.owner)
            ? project.owner
            : {};
          const creator = project?.createdBy && typeof project.createdBy === "object" && !Array.isArray(project.createdBy)
            ? project.createdBy
            : {};
          const metadataOwner = metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
            ? metadata.owner
            : {};
          const metadataCreator = metadata.createdBy && typeof metadata.createdBy === "object" && !Array.isArray(metadata.createdBy)
            ? metadata.createdBy
            : {};
          const lead = project?.lead && typeof project.lead === "object" && !Array.isArray(project.lead)
            ? project.lead
            : {};
          return [
            project?.ownerUserId,
            project?.ownerId,
            project?.createdByUserId,
            project?.createdById,
            project?.creatorId,
            project?.userId,
            project?.leadUserId,
            project?.leadEmail,
            project?.leadName,
            metadata.ownerUserId,
            metadata.ownerId,
            metadata.createdByUserId,
            metadata.createdById,
            metadata.creatorId,
            metadata.userId,
            metadata.leadUserId,
            metadata.leadEmail,
            metadata.leadName,
            owner.id,
            owner.userId,
            owner.email,
            owner.name,
            creator.id,
            creator.userId,
            creator.email,
            creator.name,
            metadataOwner.id,
            metadataOwner.userId,
            metadataOwner.email,
            metadataOwner.name,
            metadataCreator.id,
            metadataCreator.userId,
            metadataCreator.email,
            metadataCreator.name,
            lead.id,
            lead.userId,
            lead.email,
            lead.name,
          ]
            .map((value) => String(value || "").trim().toLowerCase())
            .filter(Boolean);
        }

        function getProjectSharedIdentityTokens(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const tokens = [];
          const addValue = (value) => {
            if (Array.isArray(value)) {
              value.forEach(addValue);
              return;
            }
            if (value && typeof value === "object") {
              [
                value.id,
                value.userId,
                value.email,
                value.name,
                value.memberId,
                value.accountId,
              ].forEach(addValue);
              return;
            }
            const normalizedValue = String(value || "").trim().toLowerCase();
            if (normalizedValue) {
              tokens.push(normalizedValue);
            }
          };
          [
            project?.sharedWith,
            project?.sharedWithUsers,
            project?.sharedWithUserIds,
            project?.collaborators,
            project?.members,
            project?.memberIds,
            project?.teamMembers,
            project?.accessUsers,
            metadata.sharedWith,
            metadata.sharedWithUsers,
            metadata.sharedWithUserIds,
            metadata.collaborators,
            metadata.members,
            metadata.memberIds,
            metadata.teamMembers,
            metadata.accessUsers,
          ].forEach(addValue);
          return [...new Set(tokens)];
        }

        function isProjectCreatedByCurrentViewer(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const ownerTokens = getProjectIdentityTokens(project);
          if ((project?.sharedWithMe === true || metadata.sharedWithMe === true || metadata.teamShared === true) && ownerTokens.length === 0) {
            return false;
          }
          if (currentProjectViewerTokens.length === 0 || ownerTokens.length === 0) {
            return true;
          }
          return ownerTokens.some((token) => currentProjectViewerTokens.includes(token));
        }

        function isProjectSharedWithCurrentViewer(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          if ((project?.sharedWithMe === true || metadata.sharedWithMe === true || metadata.teamShared === true) && !isProjectCreatedByCurrentViewer(project)) {
            return true;
          }
          if (isProjectCreatedByCurrentViewer(project)) {
            return false;
          }
          if (project?.isShared === true || metadata.isShared === true) {
            return true;
          }
          const sharedTokens = getProjectSharedIdentityTokens(project);
          if (currentProjectViewerTokens.length === 0) {
            return sharedTokens.length > 0;
          }
          return sharedTokens.some((token) => currentProjectViewerTokens.includes(token));
        }

        const filteredProjects = useMemo(() => {
          const scopedProjects = projects.filter((project) => {
            if (projectsHomeScope === "created") {
              return isProjectCreatedByCurrentViewer(project);
            }
            if (projectsHomeScope === "shared") {
              return isProjectSharedWithCurrentViewer(project);
            }
            return true;
          });
          const typedProjects = scopedProjects.filter((project) => {
            if (projectsHomeFilterMode === "all") {
              return true;
            }
            const summary = getProjectListSummary(project);
            if (projectsHomeFilterMode === "active") {
              return Number(summary.openTasksCount || 0) > 0 || Number(summary.activeThreadsCount || 0) > 0;
            }
            if (projectsHomeFilterMode === "completed") {
              return Number(summary.tasksCount || 0) > 0 && Number(summary.openTasksCount || 0) <= 0;
            }
            if (projectsHomeFilterMode.startsWith("type:")) {
              return getProjectListBlueprint(project).id === projectsHomeFilterMode.slice(5);
            }
            return true;
          });
          const matchedProjects = typedProjects.filter((project) => {
            if (!normalizedSearchQuery) return true;
            const haystack = [
              project.name || "",
              project.description || "",
              String(project.summary?.tasksCount || ""),
              String(project.summary?.threadsCount || ""),
              String(project.summary?.environmentsCount || ""),
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });

          return matchedProjects;
        }, [currentProjectViewerTokens, normalizedSearchQuery, projects, projectsHomeFilterMode, projectsHomeScope]);

        const sortedTasks = useMemo(() => {
          return [...tasks]
            .filter((task) => matchesTaskSearch(task))
            .sort(compareWorkspaceTaskOrder);
        }, [agentsById, environmentsById, normalizedSearchQuery, sprintsById, taskTicketNumbersById, tasks]);

        const overviewVisibleTasks = useMemo(() => {
          const normalizedOverviewTaskQuery = String(projectOverviewTaskSearchQuery || "").trim().toLowerCase();
          const priorityOrder = {
            urgent: 0,
            high: 1,
            medium: 2,
            low: 3,
          };
          return sortedTasks
            .filter((task) => !isPlaygroundSubtaskRecord(task))
            .filter((task) => {
              const boardStatus = getTaskBoardStatus(task);
              if (projectOverviewTaskFilterMode === "all") {
                return true;
              }
              if (projectOverviewTaskFilterMode === "in-progress") {
                return boardStatus === "in_progress";
              }
              if (projectOverviewTaskFilterMode === "review") {
                return boardStatus === "in_review";
              }
              if (projectOverviewTaskFilterMode === "blocked") {
                return boardStatus === "blocked";
              }
              if (projectOverviewTaskFilterMode === "started") {
                return boardStatus !== "done" && taskHasStartedThread(task);
              }
              if (projectOverviewTaskFilterMode === "unassigned") {
                return boardStatus !== "done" && !task.assigneeAgentId;
              }
              if (projectOverviewTaskFilterMode === "scheduled") {
                return boardStatus !== "done" && Boolean(task.scheduledStartAt || task.scheduledEndAt || task.dueAt);
              }
              return boardStatus !== "done";
            })
            .filter((task) => {
              if (!normalizedOverviewTaskQuery) {
                return true;
              }
              const haystack = [
                taskTicketNumbersById[task.id] || "",
                task.title || "",
                task.description || "",
                getPlaygroundTaskStatusLabel(task.status),
                getPlaygroundTaskPriorityLabel(task.priority),
                getPlaygroundTaskTypeLabel(task.taskType),
                getTaskAssigneeName(task.assigneeAgentId, ""),
                environmentsById[task.environmentId || ""]?.name || "",
                releasesById[task.releaseId || ""]?.name || "",
                sprintsById[task.sprintId || ""]?.name || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedOverviewTaskQuery);
            })
            .sort((left, right) => {
              if (projectOverviewTaskSortMode === "title-asc") {
                return String(left.title || "").localeCompare(String(right.title || ""));
              }
              if (projectOverviewTaskSortMode === "created-desc") {
                return String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
              }
              if (projectOverviewTaskSortMode === "priority-desc") {
                const leftPriority = priorityOrder[left.priority] ?? 99;
                const rightPriority = priorityOrder[right.priority] ?? 99;
                if (leftPriority !== rightPriority) {
                  return leftPriority - rightPriority;
                }
              }
              if (projectOverviewTaskSortMode === "recent-desc") {
                return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
              }
              return compareWorkspaceTaskOrder(left, right);
            })
            .slice(0, 8);
        }, [
          agentsById,
          environmentsById,
          projectOverviewTaskFilterMode,
          projectOverviewTaskSearchQuery,
          projectOverviewTaskSortMode,
          releasesById,
          sortedTasks,
          sprintsById,
          taskTicketNumbersById,
        ]);

        const overviewAssignedActors = useMemo(() => {
          const nextById = new Map();
          sortedTasks.forEach((task) => {
            const normalizedAssigneeId = String(task?.assigneeAgentId || "").trim();
            if (!normalizedAssigneeId) {
              return;
            }
            const existing = nextById.get(normalizedAssigneeId) || {
              id: normalizedAssigneeId,
              name: getTaskAssigneeName(normalizedAssigneeId, "Unassigned") || "Unassigned",
              isHuman: isPlaygroundHumanAssigneeId(normalizedAssigneeId),
              photoUrl: "",
              totalCount: 0,
              openCount: 0,
            };
            existing.totalCount += 1;
            if (String(task?.status || "").trim() !== "done") {
              existing.openCount += 1;
            }
            if (existing.isHuman) {
              existing.photoUrl = canRenderAvatarImage(currentUserAvatarUrl) ? currentUserAvatarUrl : "";
            } else {
              const assigneeAgent = agentsById[normalizedAssigneeId] || null;
              existing.photoUrl = assigneeAgent
                ? normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(assigneeAgent))
                : "";
            }
            nextById.set(normalizedAssigneeId, existing);
          });
          return [...nextById.values()]
            .filter((entry) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                entry.name || "",
                String(entry.openCount || ""),
                String(entry.totalCount || ""),
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .sort((left, right) => {
              if (right.openCount !== left.openCount) {
                return right.openCount - left.openCount;
              }
              if (right.totalCount !== left.totalCount) {
                return right.totalCount - left.totalCount;
              }
              return String(left.name || "").localeCompare(String(right.name || ""));
            });
        }, [agentsById, currentUserAvatarUrl, normalizedSearchQuery, sortedTasks]);

        const taskChildrenByParentId = useMemo(() => {
          const next = {};
          tasks.forEach((task) => {
            const parentTaskId = getPlaygroundTaskParentTaskId(task);
            if (!parentTaskId) {
              return;
            }
            if (!next[parentTaskId]) {
              next[parentTaskId] = [];
            }
            next[parentTaskId].push(task);
          });
          Object.values(next).forEach((items) => items.sort(compareBacklogTaskOrder));
          return next;
        }, [backlogFilterMode, backlogSortMode, taskTicketNumbersById, tasks]);

        const backlogVisibleTaskIds = useMemo(() => {
          const next = new Set();
          tasks.forEach((task) => {
            if (!matchesTaskSearch(task) || !matchesBacklogFilter(task, backlogFilterMode, {
              keepVisibleCompletedTaskIds: backlogSessionCompletedTaskIds,
            })) {
              return;
            }
            let currentTask = task;
            const visited = new Set();
            while (currentTask?.id && !visited.has(currentTask.id)) {
              visited.add(currentTask.id);
              next.add(currentTask.id);
              const parentTaskId = getPlaygroundTaskParentTaskId(currentTask);
              currentTask = parentTaskId ? tasksById[parentTaskId] || null : null;
            }
          });
          return next;
        }, [agentsById, backlogFilterMode, backlogSessionCompletedTaskIds, environmentsById, normalizedSearchQuery, sprintsById, taskTicketNumbersById, tasks, tasksById]);

        const backlogTaskRoots = useMemo(() => {
          return [...tasks]
            .filter((task) => backlogVisibleTaskIds.has(task.id))
            .filter((task) => {
              const parentTaskId = getPlaygroundTaskParentTaskId(task);
              return !parentTaskId || !backlogVisibleTaskIds.has(parentTaskId) || !tasksById[parentTaskId];
            })
            .sort(compareBacklogTaskOrder);
        }, [backlogVisibleTaskIds, backlogFilterMode, backlogSortMode, taskTicketNumbersById, tasks, tasksById]);

        const selectedRelease = useMemo(() => {
          if (!selectedReleaseId) return null;
          return releasesById[selectedReleaseId] || null;
        }, [releasesById, selectedReleaseId]);

        const projectReleaseTasks = useMemo(() => {
          if (!selectedReleaseId) {
            return [];
          }
          return tasks.filter((task) => task.releaseId === selectedReleaseId);
        }, [selectedReleaseId, tasks]);

        const projectReleaseTaskIds = useMemo(() => {
          return new Set(projectReleaseTasks.map((task) => task.id));
        }, [projectReleaseTasks]);

        const releaseVisibleTaskIds = useMemo(() => {
          const next = new Set();
          projectReleaseTasks.forEach((task) => {
            if (!matchesTaskSearch(task) || !matchesBacklogFilter(task, releaseBacklogFilterMode, {
              keepVisibleCompletedTaskIds: backlogSessionCompletedTaskIds,
            })) {
              return;
            }
            next.add(task.id);
          });
          return next;
        }, [agentsById, backlogSessionCompletedTaskIds, environmentsById, normalizedSearchQuery, projectReleaseTasks, releaseBacklogFilterMode, releasesById, sprintsById, taskTicketNumbersById]);

        const releaseTaskChildrenByParentId = useMemo(() => {
          const next = {};
          projectReleaseTasks.forEach((task) => {
            const parentTaskId = getPlaygroundTaskParentTaskId(task);
            if (!parentTaskId || !projectReleaseTaskIds.has(parentTaskId)) {
              return;
            }
            if (!next[parentTaskId]) {
              next[parentTaskId] = [];
            }
            next[parentTaskId].push(task);
          });
          Object.values(next).forEach((items) => items.sort((left, right) =>
            compareBacklogTaskOrderWithModes(left, right, releaseBacklogSortMode, releaseBacklogFilterMode)
          ));
          return next;
        }, [projectReleaseTaskIds, projectReleaseTasks, releaseBacklogFilterMode, releaseBacklogSortMode, taskTicketNumbersById]);

        const releaseTaskRoots = useMemo(() => {
          return projectReleaseTasks
            .filter((task) => releaseVisibleTaskIds.has(task.id))
            .filter((task) => {
              const parentTaskId = getPlaygroundTaskParentTaskId(task);
              return !parentTaskId || !projectReleaseTaskIds.has(parentTaskId) || !releaseVisibleTaskIds.has(parentTaskId);
            })
            .slice()
            .sort((left, right) => compareBacklogTaskOrderWithModes(left, right, releaseBacklogSortMode, releaseBacklogFilterMode));
        }, [projectReleaseTaskIds, projectReleaseTasks, releaseBacklogFilterMode, releaseBacklogSortMode, releaseVisibleTaskIds, taskTicketNumbersById]);

        const boardVisibleTasks = useMemo(() => {
          return sortedTasks
            .filter((task) => !isPlaygroundSubtaskRecord(task) && matchesBoardFilter(task, boardFilterMode))
            .filter((task) => !selectedReleaseId || task.releaseId === selectedReleaseId);
        }, [boardFilterMode, selectedReleaseId, sortedTasks]);

        const boardReleaseSections = useMemo(() => {
          if (selectedReleaseId && selectedRelease) {
            return [{
              key: selectedRelease.id,
              releaseId: selectedRelease.id,
              title: selectedRelease.name || "Milestone",
              copy: selectedRelease.description || "",
              tasks: boardVisibleTasks,
            }];
          }

          const sections = [];
          const sectionIndexByKey = new Map();
          boardVisibleTasks.forEach((task) => {
            const normalizedReleaseId = typeof task?.releaseId === "string" && task.releaseId.trim()
              ? task.releaseId.trim()
              : "";
            const sectionKey = normalizedReleaseId || "__no_release__";
            const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
            if (!sectionIndexByKey.has(sectionKey)) {
              sectionIndexByKey.set(sectionKey, sections.length);
              sections.push({
                key: sectionKey,
                releaseId: normalizedReleaseId,
                title: normalizedReleaseId ? (releaseRecord?.name || "Milestone unavailable") : "All other",
                copy: normalizedReleaseId
                  ? (releaseRecord?.description || "")
                  : "All tasks that are not assigned to any milestone",
                tasks: [],
              });
            }
            sections[sectionIndexByKey.get(sectionKey)].tasks.push(task);
          });

          return sections
            .slice()
            .sort((left, right) => {
              const leftIsAllOther = left.key === "__no_release__";
              const rightIsAllOther = right.key === "__no_release__";
              if (leftIsAllOther !== rightIsAllOther) {
                return leftIsAllOther ? 1 : -1;
              }
              if (leftIsAllOther && rightIsAllOther) {
                return 0;
              }
              const leftRelease = releasesById[left.releaseId] || { id: left.releaseId, name: left.title };
              const rightRelease = releasesById[right.releaseId] || { id: right.releaseId, name: right.title };
              return compareTaskReleaseOrder(leftRelease, rightRelease);
            });
        }, [boardVisibleTasks, releasesById, selectedRelease, selectedReleaseId]);

        const boardNavigationTaskIds = useMemo(() => {
          const next = [];
          const seenTaskIds = new Set();
          boardReleaseSections.forEach((section) => {
            PLAYGROUND_TASK_BOARD_LANES.forEach((lane) => {
              section.tasks.forEach((task) => {
                if (!task?.id || seenTaskIds.has(task.id)) {
                  return;
                }
                if (!lane.statuses.includes(getTaskBoardStatus(task))) {
                  return;
                }
                seenTaskIds.add(task.id);
                next.push(task.id);
              });
            });
          });
          return next;
        }, [boardReleaseSections, taskRunPendingIds, taskRunStates]);

        function flattenVisibleBacklogTaskIds(taskItems, {
          childrenByParentId: visibleChildrenByParentId = {},
          visibleTaskIds = null,
          groupRootTasksByRelease = false,
          depth = 0,
        } = {}) {
          if (!Array.isArray(taskItems) || taskItems.length === 0) {
            return [];
          }

          if (depth === 0 && groupRootTasksByRelease) {
            const releaseSections = [];
            const sectionIndexByKey = new Map();
            taskItems.forEach((task) => {
              const normalizedReleaseId = typeof task?.releaseId === "string" ? task.releaseId.trim() : "";
              const sectionKey = normalizedReleaseId || "__no_release__";
              const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
              const sectionTitle = normalizedReleaseId
                ? (releaseRecord?.name || "Milestone unavailable")
                : "All other";
              const sectionCopy = normalizedReleaseId
                ? (releaseRecord?.description || "")
                : "All tasks that are not assigned to any milestone";
              let sectionIndex = sectionIndexByKey.get(sectionKey);
              if (sectionIndex === undefined) {
                sectionIndex = releaseSections.length;
                sectionIndexByKey.set(sectionKey, sectionIndex);
                releaseSections.push({
                  key: sectionKey,
                  releaseId: normalizedReleaseId,
                  title: sectionTitle,
                  copy: sectionCopy,
                  tasks: [],
                });
              }
              releaseSections[sectionIndex].tasks.push(task);
            });

            return releaseSections
              .slice()
              .sort((left, right) => {
                const leftIsAllOther = left.key === "__no_release__";
                const rightIsAllOther = right.key === "__no_release__";
                if (leftIsAllOther !== rightIsAllOther) {
                  return leftIsAllOther ? 1 : -1;
                }
                if (leftIsAllOther && rightIsAllOther) {
                  return 0;
                }
                const leftRelease = releasesById[left.key] || { id: left.key, name: left.title };
                const rightRelease = releasesById[right.key] || { id: right.key, name: right.title };
                return compareTaskReleaseOrder(leftRelease, rightRelease);
              })
              .flatMap((section) => flattenVisibleBacklogTaskIds(section.tasks, {
                childrenByParentId: visibleChildrenByParentId,
                visibleTaskIds,
                groupRootTasksByRelease: false,
                depth: depth + 1,
              }));
          }

          const next = [];
          taskItems.forEach((task) => {
            if (!task?.id) {
              return;
            }
            next.push(task.id);
            const visibleChildren = (visibleChildrenByParentId[task.id] || []).filter((childTask) =>
              !visibleTaskIds || visibleTaskIds.has(childTask.id)
            );
            if (visibleChildren.length > 0) {
              next.push(...flattenVisibleBacklogTaskIds(visibleChildren, {
                childrenByParentId: visibleChildrenByParentId,
                visibleTaskIds,
                groupRootTasksByRelease: false,
                depth: depth + 1,
              }));
            }
          });
          return next;
        }

        const backlogNavigationTaskIds = useMemo(() => {
          if (selectedReleaseId) {
            return flattenVisibleBacklogTaskIds(releaseTaskRoots, {
              childrenByParentId: releaseTaskChildrenByParentId,
              visibleTaskIds: releaseVisibleTaskIds,
              groupRootTasksByRelease: false,
            });
          }
          return flattenVisibleBacklogTaskIds(backlogTaskRoots, {
            childrenByParentId: taskChildrenByParentId,
            visibleTaskIds: backlogVisibleTaskIds,
            groupRootTasksByRelease: true,
          });
        }, [
          backlogTaskRoots,
          backlogVisibleTaskIds,
          releaseTaskChildrenByParentId,
          releaseTaskRoots,
          releaseVisibleTaskIds,
          selectedReleaseId,
          taskChildrenByParentId,
        ]);

        const filteredReleases = useMemo(() => {
          return [...releases]
            .filter((release) => matchesReleaseSearch(release) && matchesReleaseFilter(release))
            .sort(compareTaskReleaseOrder);
        }, [normalizedSearchQuery, releaseFilterMode, releaseSortMode, releases]);

        const allTaskChildrenByParentId = useMemo(() => {
          const next = {};
          tasks.forEach((task) => {
            const parentTaskId = getPlaygroundTaskParentTaskId(task);
            if (!parentTaskId) {
              return;
            }
            if (!next[parentTaskId]) {
              next[parentTaskId] = [];
            }
            next[parentTaskId].push(task);
          });
          Object.values(next).forEach((items) => {
            items.sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          });
          return next;
        }, [taskTicketNumbersById, tasks]);

        const selectedTaskSnapshot = useMemo(() => {
          if (!selectedTaskId) return null;
          return tasksById[selectedTaskId] || null;
        }, [selectedTaskId, tasksById]);

        const draftTaskParentTask = useMemo(() => {
          const parentTaskId = getPlaygroundTaskParentTaskId(draftTask);
          return parentTaskId ? tasksById[parentTaskId] || null : null;
        }, [draftTask, tasksById]);

        const draftTaskSubtasks = useMemo(() => {
          if (!draftTask?.id) {
            return [];
          }
          return allTaskChildrenByParentId[draftTask.id] || [];
        }, [allTaskChildrenByParentId, draftTask?.id]);

        const taskParentCandidateTasks = useMemo(() => {
          if (!draftTask?.id) {
            return [];
          }
          const blockedIds = new Set([draftTask.id]);
          const stack = [draftTask.id];
          while (stack.length > 0) {
            const currentTaskId = stack.pop();
            const children = allTaskChildrenByParentId[currentTaskId] || [];
            children.forEach((childTask) => {
              if (!childTask?.id || blockedIds.has(childTask.id)) {
                return;
              }
              blockedIds.add(childTask.id);
              stack.push(childTask.id);
            });
          }
          return tasks
            .filter((task) => task?.id && !blockedIds.has(task.id) && !isPlaygroundSubtaskRecord(task))
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
        }, [allTaskChildrenByParentId, draftTask?.id, taskTicketNumbersById, tasks]);

        const scheduleParentCandidateTasks = useMemo(() => {
          return tasks
            .filter((task) => task?.id && !isPlaygroundSubtaskRecord(task))
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
        }, [taskTicketNumbersById, tasks]);

        const boardBlockedTaskCandidates = useMemo(() => {
          const blockedTaskId = String(boardBlockedPickerState?.taskId || "").trim();
          if (!blockedTaskId) {
            return [];
          }
          const blockedIds = new Set([blockedTaskId]);
          const stack = [blockedTaskId];
          while (stack.length > 0) {
            const currentTaskId = stack.pop();
            const children = allTaskChildrenByParentId[currentTaskId] || [];
            children.forEach((childTask) => {
              if (!childTask?.id || blockedIds.has(childTask.id)) {
                return;
              }
              blockedIds.add(childTask.id);
              stack.push(childTask.id);
            });
          }
          return tasks
            .filter((task) => task?.id && !blockedIds.has(task.id) && !isPlaygroundSubtaskRecord(task))
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
        }, [allTaskChildrenByParentId, boardBlockedPickerState?.taskId, taskTicketNumbersById, tasks]);

\${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.derivedState}
\${CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.topNavigation}
        const boardSprints = useMemo(() => {
          return [
            {
              id: PLAYGROUND_TASK_BOARD_UNSCHEDULED_ID,
              name: "No sprint",
              status: "planned",
            },
            ...sprints,
          ];
        }, [sprints]);

`;
