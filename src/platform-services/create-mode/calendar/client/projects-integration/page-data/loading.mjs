export const CALENDAR_PROJECTS_PAGE_LOADING_SCRIPT = `
        async function loadScheduleExecutionThreads(
          scheduleId = "",
          visibleRange = visibleScheduleCalendarRange,
          projectId = isStandaloneCalendarMode ? "" : selectedProjectId
        ) {
          async function loadLegacyScheduleExecutionThreads(normalizedScheduleId) {
            const legacyQueries = normalizedScheduleId
              ? [{ scheduleId: normalizedScheduleId }]
              : [{ appId: "runner_project_calendar" }, { appId: "automations" }];
            return Promise.all(legacyQueries.map(async (query) => {
              const requestTarget = new URL(backendUrl + "/threads", window.location.origin);
              Object.entries(query).forEach(([key, value]) => requestTarget.searchParams.set(key, value));
              requestTarget.searchParams.set("limit", normalizedScheduleId ? "100" : "200");
              const response = await fetch(requestTarget.toString(), {
                method: "GET",
                headers: requestHeaders,
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Scheduled threads could not be loaded.");
              }
              return Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.threads)
                  ? data.threads
                  : Array.isArray(data?.items)
                    ? data.items
                    : [];
            }));
          }

          try {
            const normalizedScheduleId = String(scheduleId || "").trim();
            const queries = normalizedScheduleId
              ? [{ scheduleId: normalizedScheduleId }]
              : [{ appId: "runner_project_calendar" }, { appId: "automations" }];
            let responses;
            try {
              responses = await Promise.all(queries.map(async (query) => {
                const requestTarget = new URL(backendUrl + "/schedules/executions", window.location.origin);
                if (query.scheduleId) requestTarget.searchParams.set("scheduleId", query.scheduleId);
                if (query.appId) requestTarget.searchParams.set("appId", query.appId);
                const normalizedProjectId = String(projectId || "").trim();
                if (normalizedProjectId) requestTarget.searchParams.set("contextId", normalizedProjectId);
                if (visibleRange?.start instanceof Date && !Number.isNaN(visibleRange.start.getTime())) {
                  requestTarget.searchParams.set("rangeStart", visibleRange.start.toISOString());
                }
                if (visibleRange?.end instanceof Date && !Number.isNaN(visibleRange.end.getTime())) {
                  requestTarget.searchParams.set("rangeEnd", visibleRange.end.toISOString());
                }
                requestTarget.searchParams.set("limit", normalizedScheduleId ? "100" : "200");
                const response = await fetch(requestTarget.toString(), {
                  method: "GET",
                  headers: requestHeaders,
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  const compatibilityError = new Error(
                    data?.message || data?.error || "Schedule executions could not be loaded."
                  );
                  compatibilityError.status = response.status;
                  throw compatibilityError;
                }
                const executions = Array.isArray(data?.data)
                  ? data.data
                  : Array.isArray(data?.executions)
                    ? data.executions
                    : [];
                return executions.map((execution) => {
                  const threadId = String(execution?.threadId || execution?.thread_id || "").trim();
                  if (!threadId) return null;
                  return {
                    id: threadId,
                    threadId,
                    title: execution?.threadTitle || execution?.thread_title || execution?.scheduleName || "Scheduled execution",
                    status: execution?.threadStatus || execution?.thread_status || execution?.status || "running",
                    createdAt: execution?.threadCreatedAt || execution?.thread_created_at || execution?.startedAt || execution?.scheduledFor,
                    startedAt: execution?.startedAt || execution?.started_at || null,
                    completedAt: execution?.threadCompletedAt || execution?.thread_completed_at || execution?.completedAt || null,
                    lastMessagePreview: execution?.threadLastMessagePreview || execution?.thread_last_message_preview || execution?.error || "",
                    metadata: {
                      scheduleId: execution?.scheduleId || execution?.schedule_id || query.scheduleId || "",
                      scheduleExecutionId: execution?.id || "",
                      scheduledFor: execution?.scheduledFor || execution?.scheduled_for || "",
                      triggered: execution?.triggerType || execution?.trigger_type || "automatic",
                      contextId: execution?.contextId || execution?.context_id || normalizedProjectId || "",
                    },
                  };
                }).filter(Boolean);
              }));
            } catch (error) {
              if (Number(error?.status) !== 404 && Number(error?.status) !== 501) throw error;
              responses = await loadLegacyScheduleExecutionThreads(normalizedScheduleId);
            }
            const recordsById = new Map();
            responses.flat().forEach((thread) => {
              const threadId = String(thread?.id || thread?.threadId || thread?.thread_id || "").trim();
              if (threadId) recordsById.set(threadId, thread);
            });
            const records = Array.from(recordsById.values());
            setScheduleExecutionThreadRecords((current) => {
              if (!normalizedScheduleId) return records;
              const mergedById = new Map();
              (Array.isArray(current) ? current : []).concat(records).forEach((thread) => {
                const threadId = String(thread?.id || thread?.threadId || thread?.thread_id || "").trim();
                if (threadId) mergedById.set(threadId, thread);
              });
              return Array.from(mergedById.values());
            });
            return records;
          } catch (error) {
            console.warn("[calendar] Failed to load scheduled execution threads", error);
            return [];
          }
        }

        async function loadProjectSchedules(projectId, visibleRange = visibleScheduleCalendarRange) {
          const executionThreadsPromise = loadScheduleExecutionThreads("", visibleRange, projectId);
          setScheduleLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));

          try {
            const normalizedProjectId = String(projectId || "").trim();
            const requestTarget = new URL(
              normalizedProjectId
                ? backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId) + "/schedules"
                : backendUrl + "/schedules",
              window.location.origin
            );
            if (visibleRange?.start instanceof Date && !Number.isNaN(visibleRange.start.getTime())) {
              requestTarget.searchParams.set("rangeStart", visibleRange.start.toISOString());
            }
            if (visibleRange?.end instanceof Date && !Number.isNaN(visibleRange.end.getTime())) {
              requestTarget.searchParams.set("rangeEnd", visibleRange.end.toISOString());
            }
            const response = await fetch(requestTarget.toString(), {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Schedules API unavailable.");
            }
            const executionThreads = await executionThreadsPromise;
            const nextSchedules = parsePlaygroundScheduleListResponse(data).map((schedule) => {
              const linkedThreadId = findPlaygroundScheduleExecutionThreadId(
                schedule,
                schedule.scheduledTime || schedule.lastRunAt || "",
                executionThreads
              );
              if (!linkedThreadId) return schedule;
              return {
                ...schedule,
                metadata: {
                  ...(schedule.metadata && typeof schedule.metadata === "object" ? schedule.metadata : {}),
                  threadId: linkedThreadId,
                },
              };
            });
            setSchedules(nextSchedules);
            setScheduleLoadState({
              status: "ready",
              error: "",
            });
          } catch (error) {
            setScheduleLoadState({
              status: "error",
              error: error instanceof Error ? error.message : "Failed to load project schedules.",
            });
          }
        }

        async function loadProjectMetronomeSchedules(projectId) {
          void loadCalendarBatchJobs();
          try {
            const normalizedProjectId = String(projectId || "").trim();
            const requestTarget = new URL(backendUrl + "/metronomes", window.location.origin);
            if (normalizedProjectId) {
              requestTarget.searchParams.set("projectId", normalizedProjectId);
            }
            const response = await fetch(requestTarget.toString(), {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Metronomes API unavailable.");
            }
            const nextWorkflows = getPlaygroundMetronomeListArray(data)
              .map(normalizePlaygroundCalendarMetronomeWorkflow)
              .filter((workflow) => workflow.id);
            setCalendarMetronomeWorkflows(nextWorkflows);
          } catch (error) {
            console.warn("[calendar] Failed to load metronome schedules", error);
            setCalendarMetronomeWorkflows([]);
          }
        }

        async function loadCalendarBatchJobs() {
          setCalendarBatchJobsLoadState((current) => ({
            status: "loading",
            error: current.status === "ready" ? "" : current.error,
          }));
          try {
            const requestTarget = new URL(backendUrl + "/batch-jobs", window.location.origin);
            requestTarget.searchParams.set("limit", "500");
            const response = await fetch(requestTarget.toString(), {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Batch jobs could not be loaded.");
            }
            const jobs = Array.isArray(data?.jobs)
              ? data.jobs
              : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.items)
                  ? data.items
                  : [];
            const nextJobs = jobs
              .filter((job) => {
                const startPolicy = String(job?.startPolicy || job?.start_policy || "").trim().toLowerCase();
                const status = String(job?.status || "").trim().toLowerCase();
                return (startPolicy === "manual" || startPolicy === "stay_on_shelf")
                  && (status === "held" || status === "failed");
              })
              .map((job) => ({
                ...job,
                id: String(job?.id || "").trim(),
                name: String(job?.name || "Untitled Batch").trim() || "Untitled Batch",
                description: String(job?.description || "").trim(),
                startPolicy: String(job?.startPolicy || job?.start_policy || "manual").trim().toLowerCase(),
                targetKind: String(job?.targetKind || job?.target_kind || "").trim().toLowerCase(),
                status: String(job?.status || "held").trim().toLowerCase(),
              }))
              .filter((job) => job.id)
              .sort((left, right) => {
                const leftPosition = Number.isFinite(Number(left.position)) ? Number(left.position) : Number.MAX_SAFE_INTEGER;
                const rightPosition = Number.isFinite(Number(right.position)) ? Number(right.position) : Number.MAX_SAFE_INTEGER;
                if (left.startPolicy !== right.startPolicy) return left.startPolicy.localeCompare(right.startPolicy);
                if (leftPosition !== rightPosition) return leftPosition - rightPosition;
                return left.name.localeCompare(right.name);
              });
            setCalendarBatchJobs(nextJobs);
            setCalendarBatchJobsLoadState({ status: "ready", error: "" });
            return nextJobs;
          } catch (error) {
            const message = error instanceof Error ? error.message : "Batch jobs could not be loaded.";
            console.warn("[calendar] Failed to load Batch jobs", error);
            setCalendarBatchJobs([]);
            setCalendarBatchJobsLoadState({ status: "error", error: message });
            return [];
          }
        }

        function closeScheduleDetail() {
          scheduleEditorRevisionRef.current += 1;
          setScheduleHasUnsavedChanges(false);
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskCommentInputValue("");
          setPreviewedTaskAttachmentId("");
          setSelectedTaskId("");
          setSelectedScheduleId("");
          setSelectedScheduleOccurrenceAt("");
          setScheduleEditorMode("create");
          setScheduleDraft(buildProjectScheduleDraft(selectedProject));
          setScheduleViewMode("calendar");
          setProjectSidebarPopover("");
          resetScheduleSaveState("");
        }

        function requestCalendarPlanGate() {
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setProjectSidebarPopover("");
          requestPlatformPlanGate({
            entitlement: "schedules.use",
            requiredPlan: "builder",
            featureName: "scheduled work",
            source: "calendar",
          });
        }

        function canCreateScheduledTask() {
          if (!isCalendarCreationLocked) {
            return true;
          }
          requestCalendarPlanGate();
          return false;
        }

`;
