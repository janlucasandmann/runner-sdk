export const CALENDAR_PROJECTS_PAGE_PERSISTENCE_SCRIPT = `
        function buildScheduleComposerDraft(targetType = "task") {
          const normalizedTargetType = normalizePlaygroundScheduleTargetType(targetType);
          const nextDraft = buildProjectScheduleDraft(selectedProject);
          nextDraft.targetType = normalizedTargetType;
          nextDraft.taskType = normalizedTargetType === "loop" ? "loop" : "task";
          nextDraft.parentTaskId = null;
          nextDraft.workflowId = null;
          nextDraft.workflowName = null;
          nextDraft.batchJobId = null;
          nextDraft.batchJobName = null;
          nextDraft.name = "";
          nextDraft.metadata = {
            ...((nextDraft.metadata && typeof nextDraft.metadata === "object") ? nextDraft.metadata : {}),
            scheduleTargetType: normalizedTargetType,
            targetKind: normalizedTargetType === "workflow"
              ? "metronome_run"
              : normalizedTargetType === "batch"
                ? "batch_job"
                : "thread",
            workflowId: null,
            workflowName: null,
            batchJobId: null,
            batchJobName: null,
          };
          return nextDraft;
        }

        function focusScheduleComposerTitle() {
          const focusTitle = () => {
            const titleInput = scheduleTitleInputRef.current;
            if (!titleInput) return false;
            titleInput.focus();
            titleInput.select();
            return true;
          };
          window.requestAnimationFrame(() => {
            if (!focusTitle()) {
              window.requestAnimationFrame(focusTitle);
            }
          });
        }

        function openScheduleComposer(targetType = "task") {
          if (!canCreateScheduledTask()) {
            return;
          }
          scheduleEditorRevisionRef.current += 1;
          setScheduleHasUnsavedChanges(false);
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskCommentInputValue("");
          setPreviewedTaskAttachmentId("");
          setSelectedTaskId("");
          setDraftTask(null);
          setScheduleEditorMode("create");
          setSelectedScheduleId("");
          setSelectedScheduleOccurrenceAt("");
          setScheduleDraft(buildScheduleComposerDraft(targetType));
          setScheduleViewMode("setup");
          setProjectSidebarPopover("");
          resetScheduleSaveState("");
          focusScheduleComposerTitle();
        }

        function openScheduleComposerFromSlot(slotInfo) {
          if (!canCreateScheduledTask()) {
            return;
          }
          scheduleEditorRevisionRef.current += 1;
          setScheduleHasUnsavedChanges(false);
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskCommentInputValue("");
          setPreviewedTaskAttachmentId("");
          const nextDraft = buildScheduleComposerDraft("task");
          const rawStart = slotInfo && slotInfo.start instanceof Date && !Number.isNaN(slotInfo.start.getTime())
            ? new Date(slotInfo.start)
            : new Date();

          if (activeScheduleCalendarView === "month" || (rawStart.getHours() === 0 && rawStart.getMinutes() === 0)) {
            rawStart.setHours(9, 0, 0, 0);
          }

          nextDraft.scheduleType = "one-time";
          nextDraft.scheduledTime = rawStart.toISOString();
          nextDraft.nextRunAt = nextDraft.scheduledTime;
          nextDraft.cronExpression = null;
          setSelectedTaskId("");
          setDraftTask(null);
          setScheduleEditorMode("create");
          setSelectedScheduleId("");
          setSelectedScheduleOccurrenceAt("");
          setScheduleDraft(nextDraft);
          setScheduleViewMode("setup");
          setProjectSidebarPopover("");
          resetScheduleSaveState("");
          focusScheduleComposerTitle();
        }

        function openScheduleEditor(scheduleRecord, occurrenceAt = "") {
          const resolved = normalizePlaygroundScheduleRecord(scheduleRecord || selectedScheduleSnapshot || buildProjectScheduleDraft(selectedProject));
          const resolvedProjectId = getPlaygroundScheduleProjectId(resolved);
          const resolvedProject = resolvedProjectId ? (projectsById[resolvedProjectId] || null) : null;
          if (resolved.id) {
            void loadScheduleExecutionThreads(resolved.id);
          }
          scheduleEditorRevisionRef.current += 1;
          setScheduleHasUnsavedChanges(false);
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskCommentInputValue("");
          setPreviewedTaskAttachmentId("");
          setSelectedTaskId("");
          setDraftTask(null);
          setScheduleEditorMode("edit");
          setSelectedScheduleId(resolved.id || "");
          setSelectedScheduleOccurrenceAt(
            occurrenceAt instanceof Date && !Number.isNaN(occurrenceAt.getTime())
              ? occurrenceAt.toISOString()
              : (typeof occurrenceAt === "string" && !Number.isNaN(new Date(occurrenceAt).getTime()) ? occurrenceAt : "")
          );
          setScheduleDraft({
            ...resolved,
            metadata: {
              ...(resolved.metadata && typeof resolved.metadata === "object" ? resolved.metadata : {}),
              projectId: resolvedProjectId || null,
              projectName: resolvedProjectId ? (resolvedProject?.name || resolved.contextName || null) : null,
              source: "runner_playground_project_calendar",
            },
            contextId: resolvedProjectId || null,
            contextName: resolvedProjectId
              ? (resolvedProject?.name || resolved.contextName || null)
              : null,
            appId: resolved.appId || "runner_project_calendar",
          });
          setScheduleViewMode("setup");
          setProjectSidebarPopover("");
          resetScheduleSaveState("");
        }

        function handleSelectSchedule(scheduleId, occurrenceAt = "") {
          if (!scheduleId) return;
          const scheduleRecord = schedulesById[scheduleId] || null;
          if (!scheduleRecord) return;
          openScheduleEditor(scheduleRecord, occurrenceAt);
        }

        function updateScheduleWorkflowRunValue(fieldId, value) {
          const nextValues = {
            ...(scheduleWorkflowRunState.values && typeof scheduleWorkflowRunState.values === "object"
              ? scheduleWorkflowRunState.values
              : {}),
            [fieldId]: value,
          };
          setScheduleWorkflowRunState((current) => ({
            ...current,
            values: nextValues,
            error: "",
          }));
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            metadata: {
              ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
              workflowContractId: activeScheduleWorkflowContract?.id || null,
              workflowTriggerType: activeScheduleWorkflowContract?.triggerType || null,
              workflowInputValues: nextValues,
            },
          }));
        }

        function handleScheduleWorkflowContractChange(contractId) {
          const contract = scheduleWorkflowRunState.contracts.find((candidate) => candidate.id === contractId) || null;
          if (!contract) return;
          const nextValues = createPlatformMetronomeManualRunInitialValues(contract);
          setScheduleWorkflowRunState((current) => ({
            ...current,
            contractId: contract.id,
            values: nextValues,
            error: "",
          }));
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            metadata: {
              ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
              workflowContractId: contract.id,
              workflowTriggerType: contract.triggerType,
              workflowInput: null,
              workflowInputValues: nextValues,
            },
          }));
        }

        function getScheduleDraftValidationError(scheduleRecord) {
          const normalizedSchedule = normalizePlaygroundScheduleRecord(scheduleRecord || buildProjectScheduleDraft(selectedProject));
          const scheduleTargetType = normalizePlaygroundScheduleTargetType(normalizedSchedule.targetType);
          const trimmedName = String(normalizedSchedule.name || "").trim();
          const trimmedTask = String(normalizedSchedule.task || normalizedSchedule.name || "").trim();
          const normalizedType = normalizedSchedule.scheduleType === "recurring" ? "recurring" : "one-time";
          const selectedAgent = agentsById[String(normalizedSchedule.agentId || "").trim()] || null;
          const selectedEnvironment = availableBacklogEnvironments.find((environment) => environment.id === String(normalizedSchedule.environmentId || "").trim()) || null;

          if (!trimmedName) return "Please enter a title.";
          if (scheduleTargetType === "workflow" && !String(normalizedSchedule.workflowId || "").trim()) {
            return "Please choose a workflow.";
          }
          if (scheduleTargetType === "batch" && !String(normalizedSchedule.batchJobId || "").trim()) {
            return "Please choose a Batch job.";
          }
          if (scheduleTargetType === "workflow") {
            const workflowId = String(normalizedSchedule.workflowId || "").trim();
            if (scheduleWorkflowRunState.workflowId !== workflowId || scheduleWorkflowRunState.status === "loading") {
              return "Workflow inputs are still loading.";
            }
            if (scheduleWorkflowRunState.status === "error" || scheduleWorkflowRunState.error) {
              return scheduleWorkflowRunState.error || "Workflow inputs could not be loaded.";
            }
            const workflowValidationError = getPlatformMetronomeManualRunValidationError(
              activeScheduleWorkflowContract,
              scheduleWorkflowRunState.values || {}
            );
            if (workflowValidationError) return workflowValidationError;
          }
          if (scheduleTargetType !== "workflow" && scheduleTargetType !== "batch" && !trimmedTask) return "Please enter a task.";
          if (!selectedAgent) return "Please choose an agent.";
          if (!selectedEnvironment) return "Please choose a computer.";
          if (normalizedType === "one-time" && !normalizedSchedule.scheduledTime) return "Please choose a date and time.";
          if (normalizedType === "recurring" && !String(normalizedSchedule.cronExpression || "").trim()) return "Please enter a cron expression.";
          return "";
        }

        function buildScheduleSavePayload(scheduleRecord) {
          const normalizedSchedule = normalizePlaygroundScheduleRecord(scheduleRecord || buildProjectScheduleDraft(selectedProject));
          const scheduleTargetType = normalizePlaygroundScheduleTargetType(normalizedSchedule.targetType);
          const selectedWorkflow = scheduleTargetType === "workflow"
            ? calendarMetronomeWorkflows.find((workflow) => workflow.id === String(normalizedSchedule.workflowId || "").trim()) || null
            : null;
          const workflowId = scheduleTargetType === "workflow" ? String(normalizedSchedule.workflowId || "").trim() : "";
          const workflowName = scheduleTargetType === "workflow"
            ? String(selectedWorkflow?.name || normalizedSchedule.workflowName || "Untitled Workflow").trim()
            : "";
          const selectedBatchJob = scheduleTargetType === "batch"
            ? calendarBatchJobs.find((job) => job.id === String(normalizedSchedule.batchJobId || "").trim()) || null
            : null;
          const batchJobId = scheduleTargetType === "batch" ? String(normalizedSchedule.batchJobId || "").trim() : "";
          const batchJobName = scheduleTargetType === "batch"
            ? String(selectedBatchJob?.name || normalizedSchedule.batchJobName || "Untitled Batch").trim()
            : "";
          const trimmedTask = scheduleTargetType === "workflow"
            ? "Run workflow: " + workflowName
            : scheduleTargetType === "batch"
              ? "Start Batch job: " + batchJobName
              : String(normalizedSchedule.task || normalizedSchedule.name || "").trim();
          const trimmedName = String(normalizedSchedule.name || "").trim();
          const normalizedType = normalizedSchedule.scheduleType === "recurring" ? "recurring" : "one-time";
          const selectedAgent = agentsById[String(normalizedSchedule.agentId || "").trim()] || null;
          const selectedEnvironment = availableBacklogEnvironments.find((environment) => environment.id === String(normalizedSchedule.environmentId || "").trim()) || null;
          const scheduleProjectId = getPlaygroundScheduleProjectId(normalizedSchedule);
          const scheduleProject = scheduleProjectId ? (projectsById[scheduleProjectId] || null) : null;
          const effectiveScheduleSkillIds = getEffectiveScheduleEnabledSkillIds(normalizedSchedule);
          const workflowFixture = scheduleTargetType === "workflow" && activeScheduleWorkflowContract
            ? buildPlatformMetronomeManualRunFixture(
                activeScheduleWorkflowContract,
                scheduleWorkflowRunState.values || {}
              )
            : null;
          const workflowInput = scheduleTargetType === "workflow"
            && activeScheduleWorkflowContract
            && scheduleWorkflowRunState.context
            && workflowFixture
              ? buildPlatformMetronomeManualRunInput(
                  scheduleWorkflowRunState.context.workflow,
                  activeScheduleWorkflowContract,
                  workflowFixture,
                  {
                    prompt: String(scheduleWorkflowRunState.values?.prompt || ""),
                    attachments: normalizePlaygroundTaskAttachmentList(normalizedSchedule.attachments),
                    agentId: selectedAgent?.id || null,
                    environmentId: selectedEnvironment?.id || null,
                    projectId: scheduleProjectId || null,
                  }
                )
              : null;
          return {
            normalizedSchedule,
            payload: {
              name: trimmedName || trimmedTask.slice(0, 50),
              description: typeof normalizedSchedule.description === "string" ? normalizedSchedule.description : "",
              task: trimmedTask,
              taskColor: getPlaygroundTaskColorId(normalizedSchedule.taskColor),
              agentId: selectedAgent?.id || null,
              agentName: selectedAgent?.name || "Agent",
              environmentId: selectedEnvironment?.id || "",
              environmentName: selectedEnvironment?.name || "Computer",
              appId: "runner_project_calendar",
              contextId: scheduleProjectId || null,
              contextName: scheduleProject?.name || normalizedSchedule.contextName || null,
              scheduleType: normalizedType,
              scheduledTime: normalizedType === "one-time" ? normalizedSchedule.scheduledTime || null : null,
              cronExpression: normalizedType === "recurring" ? String(normalizedSchedule.cronExpression || "").trim() : null,
              timezone: String(normalizedSchedule.timezone || "").trim() || "UTC",
              enabled: normalizedSchedule.enabled !== false,
              metadata: {
                ...(normalizedSchedule.metadata && typeof normalizedSchedule.metadata === "object" ? normalizedSchedule.metadata : {}),
                taskColor: getPlaygroundTaskColorId(normalizedSchedule.taskColor),
                priority: normalizedSchedule.priority,
                scheduleTargetType,
                targetKind: scheduleTargetType === "workflow"
                  ? "metronome_run"
                  : scheduleTargetType === "batch"
                    ? "batch_job"
                    : "thread",
                workflowId: workflowId || null,
                workflowName: workflowName || null,
                batchJobId: batchJobId || null,
                batchJobName: batchJobName || null,
                workflowVersionId: scheduleTargetType === "workflow"
                  ? scheduleWorkflowRunState.context?.versionId || null
                  : null,
                workflowContractId: scheduleTargetType === "workflow"
                  ? activeScheduleWorkflowContract?.id || null
                  : null,
                workflowTriggerType: scheduleTargetType === "workflow"
                  ? activeScheduleWorkflowContract?.triggerType || null
                  : null,
                workflowInput: scheduleTargetType === "workflow" ? workflowInput : null,
                workflowInputValues: scheduleTargetType === "workflow"
                  ? scheduleWorkflowRunState.values || {}
                  : null,
                taskType: scheduleTargetType === "loop" ? "loop" : "task",
                parentTaskId: null,
                releaseId: normalizedSchedule.releaseId || null,
                dependencyIds: normalizePlaygroundIdList(normalizedSchedule.dependencyIds),
                enabledSkills: effectiveScheduleSkillIds,
                scheduleSkillSelectionExplicit: true,
                attachments: normalizePlaygroundTaskAttachmentList(normalizedSchedule.attachments),
                connectors: normalizePlaygroundTaskConnectorSelections(normalizedSchedule.connectors),
                comments: normalizePlaygroundTaskCommentList(normalizedSchedule.comments),
                projectId: scheduleProjectId || null,
                projectName: scheduleProject?.name || normalizedSchedule.contextName || null,
                source: "runner_playground_project_calendar",
              },
            },
          };
        }

        async function persistScheduleDraft(scheduleRecord, options = {}) {
          const validationError = getScheduleDraftValidationError(scheduleRecord);
          if (validationError) {
            if (options.reportError !== false) {
              resetScheduleSaveState(validationError);
            }
            return null;
          }

          const { normalizedSchedule, payload } = buildScheduleSavePayload(scheduleRecord);
          const saveRevision = scheduleEditorRevisionRef.current;
          const scheduleRequestProjectId = String(payload.contextId || (!isStandaloneCalendarMode ? selectedProjectId : "") || "").trim();
          setScheduleSaveState({
            isSaving: true,
            error: "",
          });

          try {
            const isEditing = (options.mode || scheduleEditorMode) === "edit" && normalizedSchedule?.id;
            const targetUrl = scheduleRequestProjectId
              ? backendUrl + "/projects/" + encodeURIComponent(scheduleRequestProjectId) + "/schedules" + (isEditing ? "/" + encodeURIComponent(normalizedSchedule.id) : "")
              : backendUrl + "/schedules" + (isEditing ? "/" + encodeURIComponent(normalizedSchedule.id) : "");
            const response = await fetch(targetUrl, {
              method: isEditing ? "PATCH" : "POST",
              headers: requestHeaders,
              body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to save schedule.");
            }

            const savedSchedule = getPlaygroundScheduleResponseRecord(data) || normalizePlaygroundScheduleRecord({
              ...payload,
              id: isEditing ? normalizedSchedule.id : "",
            });
            await loadProjectSchedules(isStandaloneCalendarMode ? "" : (selectedProjectId || scheduleRequestProjectId), visibleScheduleCalendarRange);
            if (savedSchedule?.id) {
              setSelectedScheduleId(savedSchedule.id);
              setScheduleEditorMode("edit");
              setScheduleDraft((current) => {
                if (scheduleEditorRevisionRef.current === saveRevision) {
                  return savedSchedule;
                }
                return normalizePlaygroundScheduleRecord({
                  ...(current || normalizedSchedule),
                  id: savedSchedule.id,
                  userId: savedSchedule.userId || current?.userId || normalizedSchedule.userId,
                  createdAt: savedSchedule.createdAt || current?.createdAt || normalizedSchedule.createdAt,
                  updatedAt: savedSchedule.updatedAt || current?.updatedAt || normalizedSchedule.updatedAt,
                });
              });
              setScheduleViewMode("setup");
            }
            if (scheduleEditorRevisionRef.current === saveRevision) {
              setScheduleHasUnsavedChanges(false);
            }
            resetScheduleSaveState("");
            return savedSchedule;
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save schedule.";
            if (options.reportError !== false) {
              resetScheduleSaveState(message);
            } else {
              setScheduleSaveState({
                isSaving: false,
                error: message,
              });
            }
            return null;
          } finally {
            setScheduleSaveState((current) => ({
              ...current,
              isSaving: false,
            }));
          }
        }

        async function handleSaveSchedule() {
          await persistScheduleDraft(scheduleDraft, { reportError: true });
        }

        function openScheduleExecutionThread(threadId) {
          const normalizedThreadId = String(threadId || "").trim();
          if (!normalizedThreadId) return false;
          if (typeof onThreadOpen === "function") {
            onThreadOpen(normalizedThreadId, { contentMode: "chat" });
            return true;
          }
          if (typeof onThreadStarted === "function") {
            onThreadStarted(normalizedThreadId, { contentMode: "chat" });
            return true;
          }
          return false;
        }

        async function handleOpenScheduleExecution(scheduleRecord, occurrenceAt = "") {
          const executionAction = getPlaygroundScheduleExecutionAction(
            scheduleRecord,
            occurrenceAt,
            scheduleCurrentTime,
            scheduleExecutionThreadCandidates
          );
          if (!executionAction) return;
          if (executionAction.threadId) {
            if (!openScheduleExecutionThread(executionAction.threadId)) {
              resetScheduleSaveState("Thread navigation is unavailable.");
            }
            return;
          }

          const workflowId = String(scheduleRecord?.workflowId || scheduleRecord?.metadata?.workflowId || scheduleRecord?.metadata?.metronomeId || "").trim();
          if (!workflowId || !executionAction.workflowRunId) {
            resetScheduleSaveState("The execution thread could not be resolved.");
            return;
          }

          setScheduleSaveState({ isSaving: true, error: "" });
          try {
            const response = await fetch(
              backendUrl + "/metronomes/" + encodeURIComponent(workflowId) + "/runs/" + encodeURIComponent(executionAction.workflowRunId),
              { method: "GET", headers: requestHeaders }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Workflow run could not be loaded.");
            }
            const run = data?.data || data?.run || data;
            const runInput = run?.input && typeof run.input === "object" && !Array.isArray(run.input) ? run.input : {};
            const runMetadata = run?.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata) ? run.metadata : {};
            const resolvedThreadId = readPlaygroundScheduleExecutionId(
              [run, runInput, runMetadata],
              ["threadId", "thread_id", "originThreadId", "origin_thread_id", "sourceThreadId", "source_thread_id"]
            );
            if (!resolvedThreadId || !openScheduleExecutionThread(resolvedThreadId)) {
              throw new Error("The workflow run does not expose a thread to open.");
            }
            resetScheduleSaveState("");
          } catch (error) {
            resetScheduleSaveState(error instanceof Error ? error.message : "Failed to open the execution thread.");
          } finally {
            setScheduleSaveState((current) => ({ ...current, isSaving: false }));
          }
        }

        useEffect(() => {
          if (scheduleViewMode !== "setup") return undefined;

          function handleScheduleSaveShortcut(event) {
            if (
              !(event.metaKey || event.ctrlKey)
              || event.altKey
              || event.shiftKey
              || String(event.key || "").toLowerCase() !== "s"
            ) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation?.();
            if (
              scheduleSaveState.isSaving
              || !scheduleHasUnsavedChanges
              || getScheduleDraftValidationError(scheduleDraft)
            ) return;
            void handleSaveSchedule();
          }

          window.addEventListener("keydown", handleScheduleSaveShortcut, true);
          return () => window.removeEventListener("keydown", handleScheduleSaveShortcut, true);
        }, [scheduleDraft, scheduleHasUnsavedChanges, scheduleSaveState.isSaving, scheduleViewMode]);

        async function handleDeleteSchedule(scheduleId) {
          if (!scheduleId) return;
          const scheduleRecord = schedulesById[scheduleId] || selectedScheduleSnapshot || scheduleDraft || null;
          const scheduleProjectId = String(getPlaygroundScheduleProjectId(scheduleRecord) || (!isStandaloneCalendarMode ? selectedProjectId : "") || "").trim();

          setScheduleSaveState((current) => ({
            ...current,
            isSaving: true,
            error: "",
          }));

          try {
            const response = await fetch(
              scheduleProjectId
                ? backendUrl + "/projects/" + encodeURIComponent(scheduleProjectId) + "/schedules/" + encodeURIComponent(scheduleId)
                : backendUrl + "/schedules/" + encodeURIComponent(scheduleId),
              {
              method: "DELETE",
              headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to delete schedule.");
            }
            await loadProjectSchedules(isStandaloneCalendarMode ? "" : (selectedProjectId || scheduleProjectId), visibleScheduleCalendarRange);
            closeScheduleDetail();
          } catch (error) {
            resetScheduleSaveState(error instanceof Error ? error.message : "Failed to delete schedule.");
          } finally {
            setScheduleSaveState((current) => ({
              ...current,
              isSaving: false,
            }));
          }
        }

        async function handleTriggerSchedule(scheduleId) {
          if (!scheduleId) return;
          const scheduleRecord = schedulesById[scheduleId] || selectedScheduleSnapshot || scheduleDraft || null;
          const scheduleProjectId = String(getPlaygroundScheduleProjectId(scheduleRecord) || (!isStandaloneCalendarMode ? selectedProjectId : "") || "").trim();

          setScheduleSaveState((current) => ({
            ...current,
            isSaving: true,
            error: "",
          }));

          try {
            const response = await fetch(
              scheduleProjectId
                ? backendUrl + "/projects/" + encodeURIComponent(scheduleProjectId) + "/schedules/" + encodeURIComponent(scheduleId) + "/trigger"
                : backendUrl + "/schedules/" + encodeURIComponent(scheduleId) + "/trigger",
              {
              method: "POST",
              headers: requestHeaders,
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to trigger schedule.");
            }
            await loadProjectSchedules(isStandaloneCalendarMode ? "" : (selectedProjectId || scheduleProjectId), visibleScheduleCalendarRange);
            if (data?.thread?.id && typeof onThreadStarted === "function") {
              onThreadStarted(data.thread.id);
            }
            resetScheduleSaveState("");
          } catch (error) {
            resetScheduleSaveState(error instanceof Error ? error.message : "Failed to trigger schedule.");
          } finally {
            setScheduleSaveState((current) => ({
              ...current,
              isSaving: false,
            }));
          }
        }

`;
