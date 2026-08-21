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
        function requestProjectAgentPlanGate() {
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setProjectSidebarPopover("");
          requestPlatformPlanGate({
            entitlement: "agents.custom.create",
            requiredPlan: "builder",
            featureName: "additional and custom agents",
            source: "projects",
          });
        }

\${CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence}
        async function loadProjects() {
          setProjectLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));

          try {
            const response = await fetch(backendUrl + "/projects?view=overview", {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              requestPlatformPlanGateFromResponse(response, data, {
                entitlement: "projects.use",
                requiredPlan: "builder",
                featureName: "projects",
                source: "projects",
              });
              throw new Error(data?.message || data?.error || "Projects API unavailable.");
            }

            const nextProjects = sortPlaygroundProjectsByRecent(
              parsePlaygroundProjectListResponse(data).map((project) => applyProjectLocalNameOverride(project))
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

        function normalizeProjectOverviewTaskActivityRows(rows, tasks, projectId) {
          const tasksById = new Map(
            (Array.isArray(tasks) ? tasks : [])
              .filter((task) => task?.id)
              .map((task) => [task.id, task])
          );
          const normalizedEvents = (Array.isArray(rows) ? rows : [])
            .map((row) => {
              const normalizedEvent = normalizePlaygroundTaskActivityRecord(row);
              if (!normalizedEvent || normalizedEvent.eventType === "comment_added") {
                return null;
              }
              const fieldName = String(normalizedEvent.fieldName || "").trim().toLowerCase();
              if (normalizedEvent.eventType === "field_changed" && fieldName === "description") {
                return null;
              }
              const taskId = String(row?.taskId || row?.task_id || row?.task?.id || "").trim();
              const task = tasksById.get(taskId)
                || (row?.task ? normalizePlaygroundTaskRecord(row.task) : null);
              if (!taskId || !task) {
                return null;
              }
              return {
                ...normalizedEvent,
                taskId,
                projectId: String(row?.projectId || row?.project_id || projectId).trim(),
                task,
              };
            })
            .filter(Boolean);
          const eventsByKey = new Map();
          normalizedEvents.forEach((event) => {
            const key = event.eventType === "created"
              ? event.taskId + ":created"
              : event.taskId + ":" + event.eventType + ":" + event.sourceId;
            const existingEvent = eventsByKey.get(key);
            const actorPriority = event.actorType === "system"
              ? 1
              : event.actorType === "agent"
                ? (event.actorAgentId ? 4 : 3)
                : (event.actorUserId ? 4 : 3);
            const existingActorPriority = existingEvent?.actorType === "system"
              ? 1
              : existingEvent?.actorType === "agent"
                ? (existingEvent.actorAgentId ? 4 : 3)
                : existingEvent
                  ? (existingEvent.actorUserId ? 4 : 3)
                  : 0;
            if (
              !existingEvent
              || (
                event.eventType === "created"
                && actorPriority > existingActorPriority
              )
            ) {
              eventsByKey.set(key, event);
            }
          });
          return [...eventsByKey.values()]
            .sort((left, right) => {
              const leftTime = Date.parse(String(left.createdAt || "")) || 0;
              const rightTime = Date.parse(String(right.createdAt || "")) || 0;
              return rightTime - leftTime || String(right.id).localeCompare(String(left.id));
            });
        }

        function isLegacyProjectTaskActivityRoute(result) {
          if (Number(result?.response?.status) !== 404) {
            return false;
          }
          const message = String(result?.data?.message || result?.data?.error || "").trim().toLowerCase();
          return message === "task not found";
        }

        function readProjectTaskActivityUpperBound(task) {
          const timestamp = Date.parse(String(task?.updatedAt || task?.createdAt || ""));
          return Number.isFinite(timestamp) ? timestamp : Number.POSITIVE_INFINITY;
        }

        async function loadLegacyProjectOverviewTaskActivity(projectId, tasks, loadToken) {
          const orderedTasks = (Array.isArray(tasks) ? tasks : [])
            .filter((task) => task?.id)
            .sort((left, right) =>
              readProjectTaskActivityUpperBound(right) - readProjectTaskActivityUpperBound(left)
              || String(left.id).localeCompare(String(right.id))
            );
          const activityRows = [];
          const batchSize = 4;
          let firstFailure = null;

          for (let offset = 0; offset < orderedTasks.length; offset += batchSize) {
            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return null;
            }
            const batch = orderedTasks.slice(offset, offset + batchSize);
            const batchResults = await Promise.all(batch.map(async (task) => {
              const target = new URL(
                backendUrl + "/tasks/" + encodeURIComponent(task.id) + "/activity",
                window.location.origin
              );
              try {
                const response = await fetch(target.toString(), {
                  method: "GET",
                  headers: requestHeaders,
                });
                const data = await response.json().catch(() => ({}));
                return { task, response, data };
              } catch (error) {
                return { task, error };
              }
            }));

            batchResults.forEach((result) => {
              if (!result.response?.ok) {
                firstFailure ||= result.error
                  || new Error(
                    result.data?.message
                    || result.data?.error
                    || "Failed to load ticket activity."
                  );
                return;
              }
              const rows = Array.isArray(result.data?.data)
                ? result.data.data
                : Array.isArray(result.data?.items)
                  ? result.data.items
                  : [];
              rows.forEach((row) => {
                activityRows.push({
                  ...row,
                  taskId: String(row?.taskId || row?.task_id || result.task.id).trim(),
                  projectId: String(row?.projectId || row?.project_id || projectId).trim(),
                  task: row?.task || result.task,
                });
              });
            });

            const normalizedItems = normalizeProjectOverviewTaskActivityRows(
              activityRows,
              orderedTasks,
              projectId
            );
            const nextTask = orderedTasks[offset + batch.length] || null;
            if (
              normalizedItems.length >= 50
              && (
                !nextTask
                || (Date.parse(String(normalizedItems[49]?.createdAt || "")) || 0)
                  >= readProjectTaskActivityUpperBound(nextTask)
              )
            ) {
              return normalizedItems;
            }
          }

          const normalizedItems = normalizeProjectOverviewTaskActivityRows(
            activityRows,
            orderedTasks,
            projectId
          );
          if (normalizedItems.length === 0 && firstFailure) {
            throw firstFailure;
          }
          return normalizedItems;
        }

        async function loadProjectWorkGraph(projectId) {
          const graphResponse = await fetch(
            backendUrl + "/projects/" + encodeURIComponent(projectId) + "/work-graph",
            {
              method: "GET",
              headers: requestHeaders,
            }
          );
          const graphData = await graphResponse.json().catch(() => ({}));
          if (graphResponse.ok) {
            return {
              response: graphResponse,
              data: {
                ...graphData,
                canonicalWorkGraph: true,
              },
            };
          }

          // Keep mixed-version deployments usable while the canonical work
          // graph endpoint rolls out. Legacy task data remains the source of
          // truth until the endpoint is available.
          if (graphResponse.status === 404) {
            const tasksResponse = await fetch(backendUrl + buildProjectScopedPath("/tasks", projectId), {
              method: "GET",
              headers: requestHeaders,
            });
            const tasksData = await tasksResponse.json().catch(() => ({}));
            return {
              response: tasksResponse,
              data: {
                ...tasksData,
                tasks: parsePlaygroundTaskListResponse(tasksData),
                relations: [],
                agentSessions: [],
                canonicalWorkGraph: false,
              },
            };
          }

          return {
            response: graphResponse,
            data: graphData,
          };
        }

        function projectCanonicalWorkRelationsOntoTasks(tasks, relations, isCanonical) {
          const normalizedTasks = Array.isArray(tasks) ? tasks : [];
          if (!isCanonical) {
            return normalizedTasks;
          }
          const normalizedRelations = Array.isArray(relations)
            ? relations.filter((relation) => relation?.sourceTaskId && relation?.targetTaskId)
            : [];
          const relationsByTaskId = new Map();
          const blockerIdsByTaskId = new Map();
          const parentIdByTaskId = new Map();

          normalizedRelations.forEach((relation) => {
            const sourceTaskId = String(relation.sourceTaskId || "").trim();
            const targetTaskId = String(relation.targetTaskId || "").trim();
            const relationType = String(relation.relationType || "").trim().toLowerCase();
            if (!sourceTaskId || !targetTaskId || sourceTaskId === targetTaskId) {
              return;
            }
            [sourceTaskId, targetTaskId].forEach((taskId) => {
              const taskRelations = relationsByTaskId.get(taskId) || [];
              taskRelations.push(relation);
              relationsByTaskId.set(taskId, taskRelations);
            });
            if (relationType === "blocks") {
              const blockerIds = blockerIdsByTaskId.get(targetTaskId) || [];
              blockerIds.push(sourceTaskId);
              blockerIdsByTaskId.set(targetTaskId, blockerIds);
            } else if (relationType === "parent_of") {
              parentIdByTaskId.set(targetTaskId, sourceTaskId);
            }
          });

          return normalizedTasks.map((task) => {
            const taskId = String(task?.id || "").trim();
            if (!taskId) {
              return task;
            }
            const metadata = task?.metadata && typeof task.metadata === "object"
              ? { ...task.metadata }
              : {};
            const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object"
              ? { ...metadata.runnerPlayground }
              : {};
            const parentTaskId = parentIdByTaskId.get(taskId) || "";
            if (parentTaskId) {
              runnerPlayground.parentTaskId = parentTaskId;
              if (String(runnerPlayground.taskType || "").trim().toLowerCase() !== "loop") {
                runnerPlayground.taskType = "subtask";
              }
            }
            metadata.runnerPlayground = runnerPlayground;
            return {
              ...task,
              dependencyIds: Array.from(new Set(blockerIdsByTaskId.get(taskId) || [])),
              metadata,
              workRelations: relationsByTaskId.get(taskId) || [],
            };
          });
        }

        function fetchProjectOverviewTaskActivity(projectId) {
          const activityRequestTarget = new URL(backendUrl + "/tasks/activity", window.location.origin);
          activityRequestTarget.searchParams.set("projectId", projectId);
          activityRequestTarget.searchParams.set("limit", "50");
          return fetch(activityRequestTarget.toString(), {
            method: "GET",
            headers: requestHeaders,
          })
            .then(async (response) => ({
              response,
              data: await response.json().catch(() => ({})),
            }))
            .catch((error) => ({ error }));
        }

        async function settleProjectOverviewTaskActivity(projectId, nextTasks, loadToken, activityResultPromise) {
          const activityResult = await activityResultPromise;
          if (projectWorkspaceLoadTokenRef.current !== loadToken) {
            return;
          }
          if (activityResult?.error) {
            setProjectOverviewTaskActivityState((current) => ({
              projectId,
              status: "error",
              error: activityResult.error instanceof Error
                ? activityResult.error.message
                : "Failed to load project activity.",
              items: current.projectId === projectId ? current.items : [],
            }));
            return;
          }
          if (activityResult?.response?.ok) {
            const activityRows = Array.isArray(activityResult.data?.data)
              ? activityResult.data.data
              : Array.isArray(activityResult.data?.items)
                ? activityResult.data.items
                : [];
            setProjectOverviewTaskActivityState({
              projectId,
              status: "ready",
              error: "",
              items: normalizeProjectOverviewTaskActivityRows(activityRows, nextTasks, projectId),
            });
            return;
          }
          if (isLegacyProjectTaskActivityRoute(activityResult)) {
            try {
              const items = await loadLegacyProjectOverviewTaskActivity(projectId, nextTasks, loadToken);
              if (!items || projectWorkspaceLoadTokenRef.current !== loadToken) {
                return;
              }
              setProjectOverviewTaskActivityState({
                projectId,
                status: "ready",
                error: "",
                items,
              });
            } catch (error) {
              if (projectWorkspaceLoadTokenRef.current !== loadToken) {
                return;
              }
              setProjectOverviewTaskActivityState((current) => ({
                projectId,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load project activity.",
                items: current.projectId === projectId ? current.items : [],
              }));
            }
            return;
          }
          setProjectOverviewTaskActivityState((current) => ({
            projectId,
            status: "error",
            error: activityResult?.data?.message
              || activityResult?.data?.error
              || "Failed to load project activity.",
            items: current.projectId === projectId ? current.items : [],
          }));
        }

        function getProjectWorkspaceLoadErrorMessage(error, fallbackMessage) {
          const message = error instanceof Error ? String(error.message || "").trim() : "";
          if (!message || /^(failed to fetch|networkerror|load failed)$/i.test(message)) {
            return fallbackMessage;
          }
          return message;
        }

        function hasCachedProjectWorkspace(projectId) {
          const normalizedProjectId = String(projectId || "").trim();
          if (!normalizedProjectId) return false;
          return Boolean(
            String(selectedProjectSnapshot?.id || "").trim() === normalizedProjectId
            || String(selectedProjectDetail?.project?.id || "").trim() === normalizedProjectId
            || projects.some((project) => String(project?.id || "").trim() === normalizedProjectId)
          );
        }

        function settleProjectWorkspaceLoadFailure(projectId, error, fallbackMessage) {
          const message = getProjectWorkspaceLoadErrorMessage(error, fallbackMessage);
          const canUseCachedWorkspace = hasCachedProjectWorkspace(projectId);
          if (canUseCachedWorkspace) {
            console.warn("Project workspace refresh failed; keeping cached content.", {
              projectId,
              error: message,
            });
          }
          setTaskLoadState({
            status: canUseCachedWorkspace ? "ready" : "error",
            error: canUseCachedWorkspace ? "" : message,
          });
          setProjectOverviewTaskActivityState((current) => ({
            projectId,
            status: canUseCachedWorkspace ? "ready" : "error",
            error: canUseCachedWorkspace ? "" : message,
            items: current.projectId === projectId ? current.items : [],
          }));
          return false;
        }

        async function loadProjectHome(projectId) {
          if (!projectId) {
            projectWorkspaceLoadTokenRef.current = "";
            projectConfigLoadTokenRef.current = "";
            clearProjectWorkspace();
            return false;
          }

          const loadToken = projectId + ":home:" + Date.now().toString(36) + Math.random().toString(36).slice(2);
          projectWorkspaceLoadTokenRef.current = loadToken;
          projectConfigLoadTokenRef.current = loadToken;
          setTaskLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));
          setProjectOverviewCostSummaryState({
            status: "idle",
            error: "",
            summary: null,
          });
          setProjectOverviewTaskActivityState((current) => ({
            projectId,
            status: "loading",
            error: "",
            items: current.projectId === projectId ? current.items : [],
          }));

          const activityResultPromise = fetchProjectOverviewTaskActivity(projectId);
          try {
            const response = await fetch(
              backendUrl + "/projects/" + encodeURIComponent(projectId) + "/home",
              {
                method: "GET",
                headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              const endpointError = String(data?.message || data?.error || "").trim().toLowerCase();
              const endpointUnavailable = response.status === 404
                && (
                  !data
                  || typeof data !== "object"
                  || Object.keys(data).length === 0
                  || endpointError === "not found"
                  || endpointError.includes("cannot get")
                  || endpointError.includes("route not found")
                );
              if (endpointUnavailable) {
                return loadProjectWorkspace(projectId, { loadProjectConfig: true });
              }
              throw new Error(data?.message || data?.error || "Project home unavailable.");
            }
            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return false;
            }

            const snapshotProjectRecord = selectedProjectSnapshot
              || projects.find((project) => project?.id === projectId)
              || normalizePlaygroundProjectRecord({
                id: projectId,
                name: "Project",
              });
            const currentDetailProject = selectedProjectDetail?.project?.id === projectId
              ? selectedProjectDetail.project
              : null;
            const fallbackProjectRecord = currentDetailProject
              ? mergePlaygroundProjectRecords(currentDetailProject, snapshotProjectRecord) || currentDetailProject
              : snapshotProjectRecord;
            const projectRecord = getPlaygroundProjectResponseRecord(data, fallbackProjectRecord) || fallbackProjectRecord;
            const nextSummary = {
              ...buildEmptyPlaygroundProjectSummary(),
              ...(data?.summary && typeof data.summary === "object" ? data.summary : {}),
            };
            const nextTasks = parsePlaygroundTaskListResponse(data);
            const parsedReleases = parsePlaygroundTaskReleaseListResponse(data);
            const nextReleases = enrichPlaygroundTaskReleasesWithLegacyStrategy(parsedReleases, projectRecord);
            const nextSprints = parsePlaygroundTaskSprintListResponse(data);
            const nextEnvironments = parsePlaygroundEnvironmentListResponse(data);
            const nextThreads = Array.isArray(data?.threads)
              ? data.threads.map(normalizeThreadItem)
              : [];
            const nextRecentThreads = Array.isArray(data?.recentThreads)
              ? data.recentThreads.map(normalizeThreadItem)
              : nextThreads.slice(0, 10);

            commitLocalProjectRecord({
              ...projectRecord,
              summary: nextSummary,
            }, {
              summary: nextSummary,
              environments: nextEnvironments,
              recentThreads: nextRecentThreads,
              threads: nextThreads,
              workRelations: [],
              agentSessions: [],
              selectImmediately: true,
            });
            setTasks(nextTasks);
            setReleases(nextReleases);
            setSprints(nextSprints);
            setTaskLoadState({
              status: "ready",
              error: "",
            });
            void settleProjectOverviewTaskActivity(
              projectId,
              nextTasks,
              loadToken,
              activityResultPromise
            );
            return true;
          } catch (error) {
            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return false;
            }
            return settleProjectWorkspaceLoadFailure(
              projectId,
              error,
              "Project details are temporarily unavailable."
            );
          }
        }

        async function loadProjectWorkspace(projectId, options = {}) {
          if (!projectId) {
            projectWorkspaceLoadTokenRef.current = "";
            projectConfigLoadTokenRef.current = "";
            clearProjectWorkspace();
            return false;
          }

          const loadToken = projectId + ":" + Date.now().toString(36) + Math.random().toString(36).slice(2);
          projectWorkspaceLoadTokenRef.current = loadToken;
          const shouldLoadProjectConfig = options?.loadProjectConfig === true;
          const projectConfigLoadToken = shouldLoadProjectConfig
            ? [
                backendUrl,
                requestHeadersKey,
                projectId,
                Date.now().toString(36),
                Math.random().toString(36).slice(2),
              ].join("|")
            : "";
          if (projectConfigLoadToken) {
            projectConfigLoadTokenRef.current = projectConfigLoadToken;
          }
          const projectDetailPromise = shouldLoadProjectConfig
            ? fetch(backendUrl + "/projects/" + encodeURIComponent(projectId), {
                method: "GET",
                headers: requestHeaders,
              })
              .then(async (response) => ({
                response,
                data: await response.json().catch(() => ({})),
              }))
              .catch((error) => ({ error }))
            : null;
          setTaskLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));
          setProjectOverviewCostSummaryState({
            status: "idle",
            error: "",
            summary: null,
          });
          setProjectOverviewTaskActivityState((current) => ({
            projectId,
            status: "loading",
            error: "",
            items: current.projectId === projectId ? current.items : [],
          }));

          try {
            const threadsRequestTarget = new URL(backendUrl + "/threads", window.location.origin);
            threadsRequestTarget.searchParams.set("projectId", projectId);
            threadsRequestTarget.searchParams.set("limit", "500");
            const activityResultPromise = fetchProjectOverviewTaskActivity(projectId);

            const [workGraphResult, releasesResponse, sprintsResponse, threadsResponse] = await Promise.all([
              loadProjectWorkGraph(projectId),
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
            ]);

            const tasksResponse = workGraphResult.response;
            const tasksData = workGraphResult.data || {};
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
              return false;
            }

            const nextTasks = projectCanonicalWorkRelationsOntoTasks(
              parsePlaygroundTaskListResponse(tasksData),
              tasksData?.relations,
              tasksData?.canonicalWorkGraph === true
            );
            const parsedReleases = parsePlaygroundTaskReleaseListResponse(releasesData);
            const nextSprints = parsePlaygroundTaskSprintListResponse(sprintsData);
            void settleProjectOverviewTaskActivity(
              projectId,
              nextTasks,
              loadToken,
              activityResultPromise
            );
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
            const nextReleases = enrichPlaygroundTaskReleasesWithLegacyStrategy(
              parsedReleases,
              fallbackProjectRecord
            );
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
            commitLocalProjectRecord({
              ...fallbackProjectRecord,
              summary: fallbackSummary,
            }, {
              summary: fallbackSummary,
              environments: fallbackEnvironments,
              recentThreads: nextThreads.slice(0, 10),
              threads: nextThreads,
              workRelations: Array.isArray(tasksData?.relations) ? tasksData.relations : [],
              agentSessions: Array.isArray(tasksData?.agentSessions) ? tasksData.agentSessions : [],
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

            if (projectDetailPromise) {
              void projectDetailPromise.then((projectResult) => {
                if (projectConfigLoadTokenRef.current !== projectConfigLoadToken) {
                  return;
                }
                if (projectResult?.error) {
                  console.warn("Failed to load project config", projectResult.error);
                  return;
                }
                const projectResponse = projectResult?.response;
                const projectData = projectResult?.data || {};
                if (!projectResponse?.ok) {
                  console.warn("Failed to load project config", projectData?.message || projectData?.error || projectResponse?.status);
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
                const enrichedReleases = enrichPlaygroundTaskReleasesWithLegacyStrategy(
                  nextReleases,
                  projectRecord
                );

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
                setReleases(enrichedReleases);
                syncProjectSummary(projectId, nextTasks, nextSprints, enrichedReleases, nextSummary);
              });
            }
            return true;
          } catch (error) {
            if (projectWorkspaceLoadTokenRef.current !== loadToken) {
              return false;
            }
            return settleProjectWorkspaceLoadFailure(
              projectId,
              error,
              "Project workspace is temporarily unavailable."
            );
          }
        }

        async function loadTaskDetails(taskId) {
          if (!selectedProjectId || !taskId) {
            return null;
          }

          try {
            const response = await fetch(
              backendUrl + "/tasks/" + encodeURIComponent(taskId) + "?threadDetails=summary",
              {
                method: "GET",
                headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load task details.");
            }

            const refreshedTask = getPlaygroundTaskResponseRecord(data);
            if (!refreshedTask?.id) {
              throw new Error("Task details are unavailable.");
            }

            if (selectedTaskIdRef.current === String(taskId || "").trim()) {
              setTaskDetailThreadRecords(getPlaygroundTaskThreadSummaryRecords(data, refreshedTask));
              setTaskDetailThreadsState({
                status: "ready",
                error: "",
              });
            }

            return applyRefreshedTaskDetails(refreshedTask);
          } catch (error) {
            if (selectedTaskIdRef.current === String(taskId || "").trim()) {
              setTaskDetailThreadsState({
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load ticket threads.",
              });
            }
            throw error;
          }
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
          setProjectOverviewActivityTab("threads");
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
        }, [missionControlSetupClosing, missionControlSetupOpen, projectBlueprintPickerOpen, projectComposerEnvironmentPopoverOpen, projectComposerOpen, projectEnvironmentFilePickerOpen, projectIconPickerOpen]);

        useEffect(() => {
          if (!issueComposerOpen) return undefined;

          function handleIssueComposerEscape(event) {
            if (event.key !== "Escape") return;
            if (issueComposerDetailSelectPopover) {
              setIssueComposerDetailSelectPopover("");
              return;
            }
            closeProjectIssueComposer();
          }

          window.addEventListener("keydown", handleIssueComposerEscape);
          return () => window.removeEventListener("keydown", handleIssueComposerEscape);
        }, [issueComposerClosing, issueComposerDetailSelectPopover, issueComposerOpen, issueComposerSaveState.isSaving]);

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
            if (target?.closest(".playground-tasks-project-card-actions, .playground-tasks-project-card-menu")) {
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
          if (!taskDetailPopover || projectTaskDetailScreenOpen) return undefined;

          function handleTaskDetailPopoverPointerDown(event) {
            const target = event?.target instanceof Node ? event.target : null;
            if (!target || !taskDetailActionsRef.current || taskDetailActionsRef.current.contains(target)) {
              return;
            }
            setTaskDetailPopover("");
          }

          document.addEventListener("mousedown", handleTaskDetailPopoverPointerDown);
          return () => document.removeEventListener("mousedown", handleTaskDetailPopoverPointerDown);
        }, [projectTaskDetailScreenOpen, taskDetailPopover]);

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
          setTaskDetailStatusSearchQuery("");
          setTaskDetailTypeSearchQuery("");
          setTaskDetailPrioritySearchQuery("");
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
	            projectConfigLoadTokenRef.current = "";
	            clearProjectWorkspace({ preserveSchedule: true });
	            return;
	          }
	          if (!selectedProjectId) {
	            projectWorkspaceAutoLoadKeyRef.current = "";
	            projectConfigLoadTokenRef.current = "";
	            clearProjectWorkspace();
	            return;
	          }
	          const workspaceMode = taskView === "overview" ? "home" : "workspace";
	          const loadKey = [
	            backendUrl,
	            requestHeadersKey,
	            selectedProjectId,
	            workspaceMode,
	          ].join("|");
	          if (projectWorkspaceAutoLoadKeyRef.current === loadKey) {
	            return;
	          }
	          projectWorkspaceAutoLoadKeyRef.current = loadKey;
	          const loadPromise = workspaceMode === "home"
	            ? loadProjectHome(selectedProjectId)
	            : loadProjectWorkspace(selectedProjectId, {
	                loadProjectConfig: selectedProjectDetail?.project?.id !== selectedProjectId,
	              });
	          void Promise.resolve(loadPromise).then((loaded) => {
	            if (!loaded && projectWorkspaceAutoLoadKeyRef.current === loadKey) {
	              projectWorkspaceAutoLoadKeyRef.current = "";
	            }
	          });
	        }, [backendUrl, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId, taskView]);

	        useEffect(() => {
            if (!isCalendarContext) {
              projectSchedulesAutoLoadKeyRef.current = "";
              return;
            }
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
	        }, [backendUrl, isCalendarContext, isStandaloneCalendarMode, requestHeadersKey, selectedProjectId, visibleScheduleCalendarRange, visibleScheduleCalendarRangeKey]);

	        useEffect(() => {
            if (!isCalendarContext) {
              projectMetronomeSchedulesAutoLoadKeyRef.current = "";
              return;
            }
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
          if (taskDetailAvailableAssigneePopupModes.includes(issueComposerActorPopupMode)) {
            return;
          }
          const nextMode = taskDetailAvailableAssigneePopupModes[0] || "agents";
          if (nextMode !== issueComposerActorPopupMode) {
            setIssueComposerActorPopupMode(nextMode);
          }
        }, [issueComposerActorPopupMode, taskDetailAvailableAssigneePopupModes]);

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
