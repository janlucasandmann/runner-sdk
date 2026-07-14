export const CALENDAR_PROJECTS_PAGE_PERSISTENCE_SCRIPT = `
        function openScheduleComposer() {
          if (!canCreateScheduledTask()) {
            return;
          }
          scheduleEditorDirtyRef.current = false;
          scheduleAutosaveQueuedRef.current = null;
          if (scheduleAutosaveTimerRef.current) {
            window.clearTimeout(scheduleAutosaveTimerRef.current);
            scheduleAutosaveTimerRef.current = null;
          }
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskCommentInputValue("");
          setPreviewedTaskAttachmentId("");
          setSelectedTaskId("");
          setDraftTask(null);
          setScheduleEditorMode("create");
          setSelectedScheduleId("");
          setScheduleDraft(buildProjectScheduleDraft(selectedProject));
          setScheduleViewMode("setup");
          setProjectSidebarPopover("");
          resetScheduleSaveState("");
        }

        function openScheduleComposerFromSlot(slotInfo) {
          if (!canCreateScheduledTask()) {
            return;
          }
          scheduleEditorDirtyRef.current = false;
          scheduleAutosaveQueuedRef.current = null;
          if (scheduleAutosaveTimerRef.current) {
            window.clearTimeout(scheduleAutosaveTimerRef.current);
            scheduleAutosaveTimerRef.current = null;
          }
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskCommentInputValue("");
          setPreviewedTaskAttachmentId("");
          const nextDraft = buildProjectScheduleDraft(selectedProject);
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
          setScheduleDraft(nextDraft);
          setScheduleViewMode("setup");
          setProjectSidebarPopover("");
          resetScheduleSaveState("");
        }

        function openScheduleEditor(scheduleRecord) {
          const resolved = normalizePlaygroundScheduleRecord(scheduleRecord || selectedScheduleSnapshot || buildProjectScheduleDraft(selectedProject));
          const resolvedProjectId = getPlaygroundScheduleProjectId(resolved);
          const resolvedProject = resolvedProjectId ? (projectsById[resolvedProjectId] || null) : null;
          scheduleEditorDirtyRef.current = false;
          scheduleAutosaveQueuedRef.current = null;
          if (scheduleAutosaveTimerRef.current) {
            window.clearTimeout(scheduleAutosaveTimerRef.current);
            scheduleAutosaveTimerRef.current = null;
          }
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskCommentInputValue("");
          setPreviewedTaskAttachmentId("");
          setSelectedTaskId("");
          setDraftTask(null);
          setScheduleEditorMode("edit");
          setSelectedScheduleId(resolved.id || "");
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

        function handleSelectSchedule(scheduleId) {
          if (!scheduleId) return;
          const scheduleRecord = schedulesById[scheduleId] || null;
          if (!scheduleRecord) return;
          openScheduleEditor(scheduleRecord);
        }

        function getScheduleDraftValidationError(scheduleRecord) {
          const normalizedSchedule = normalizePlaygroundScheduleRecord(scheduleRecord || buildProjectScheduleDraft(selectedProject));
          const trimmedTask = String(normalizedSchedule.task || normalizedSchedule.name || "").trim();
          const normalizedType = normalizedSchedule.scheduleType === "recurring" ? "recurring" : "one-time";
          const selectedAgent = agentsById[String(normalizedSchedule.agentId || "").trim()] || null;
          const selectedEnvironment = availableBacklogEnvironments.find((environment) => environment.id === String(normalizedSchedule.environmentId || "").trim()) || null;

          if (!trimmedTask) return "Please enter a task.";
          if (!selectedAgent) return "Please choose an agent.";
          if (!selectedEnvironment) return "Please choose a computer.";
          if (normalizedType === "one-time" && !normalizedSchedule.scheduledTime) return "Please choose a date and time.";
          if (normalizedType === "recurring" && !String(normalizedSchedule.cronExpression || "").trim()) return "Please enter a cron expression.";
          return "";
        }

        function buildScheduleSavePayload(scheduleRecord) {
          const normalizedSchedule = normalizePlaygroundScheduleRecord(scheduleRecord || buildProjectScheduleDraft(selectedProject));
          const trimmedTask = String(normalizedSchedule.task || normalizedSchedule.name || "").trim();
          const trimmedName = String(normalizedSchedule.name || "").trim();
          const normalizedType = normalizedSchedule.scheduleType === "recurring" ? "recurring" : "one-time";
          const selectedAgent = agentsById[String(normalizedSchedule.agentId || "").trim()] || null;
          const selectedEnvironment = availableBacklogEnvironments.find((environment) => environment.id === String(normalizedSchedule.environmentId || "").trim()) || null;
          const scheduleProjectId = getPlaygroundScheduleProjectId(normalizedSchedule);
          const scheduleProject = scheduleProjectId ? (projectsById[scheduleProjectId] || null) : null;

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
                taskType: normalizePlaygroundTaskType(normalizedSchedule.taskType),
                parentTaskId: normalizePlaygroundParentTaskId(normalizedSchedule.parentTaskId),
                releaseId: normalizedSchedule.releaseId || null,
                dependencyIds: normalizePlaygroundIdList(normalizedSchedule.dependencyIds),
                enabledSkills: normalizePlaygroundEnabledSkillIds(normalizedSchedule.enabledSkills),
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
              setScheduleDraft(savedSchedule);
              setScheduleViewMode("setup");
            }
            scheduleEditorDirtyRef.current = false;
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

        async function flushQueuedScheduleAutosave() {
          if (scheduleAutosaveInFlightRef.current || (!selectedProjectId && !isStandaloneCalendarMode)) {
            return;
          }

          scheduleAutosaveInFlightRef.current = true;
          try {
            while (scheduleAutosaveQueuedRef.current) {
              const nextScheduleToSave = normalizePlaygroundScheduleRecord(scheduleAutosaveQueuedRef.current);
              scheduleAutosaveQueuedRef.current = null;
              if (getScheduleDraftValidationError(nextScheduleToSave)) {
                continue;
              }
              const savedSchedule = await persistScheduleDraft(nextScheduleToSave, { reportError: true });
              if (!savedSchedule) {
                break;
              }
            }
          } finally {
            scheduleAutosaveInFlightRef.current = false;
          }
        }

        function queueScheduleAutosave(scheduleRecord) {
          if (!selectedProjectId && !isStandaloneCalendarMode) {
            return;
          }
          scheduleAutosaveQueuedRef.current = normalizePlaygroundScheduleRecord(scheduleRecord);
          if (scheduleAutosaveTimerRef.current) {
            window.clearTimeout(scheduleAutosaveTimerRef.current);
          }
          scheduleAutosaveTimerRef.current = window.setTimeout(() => {
            scheduleAutosaveTimerRef.current = null;
            void flushQueuedScheduleAutosave();
          }, 450);
        }

        async function handleSaveSchedule() {
          await persistScheduleDraft(scheduleDraft, { reportError: true });
        }

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
