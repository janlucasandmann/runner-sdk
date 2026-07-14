export const CALENDAR_PROJECTS_PAGE_LOADING_SCRIPT = `
        async function loadProjectSchedules(projectId, visibleRange = visibleScheduleCalendarRange) {
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
            setSchedules(parsePlaygroundScheduleListResponse(data));
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

        function closeScheduleDetail() {
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
          setSelectedScheduleId("");
          setScheduleEditorMode("create");
          setScheduleDraft(buildProjectScheduleDraft(selectedProject));
          setScheduleViewMode("calendar");
          setProjectSidebarPopover("");
          resetScheduleSaveState("");
        }

        function openCalendarUpgradeModal() {
          setTaskDetailPopover("");
          setTaskDetailSelectPopover("");
          setTaskSkillsPopoverOpen(false);
          setProjectSidebarPopover("");
          setCalendarUpgradeModalOpen(true);
        }

        function canCreateScheduledTask() {
          if (!isCalendarCreationLocked) {
            return true;
          }
          openCalendarUpgradeModal();
          return false;
        }

        async function handleCalendarUpgradeCheckout() {
          if (calendarUpgradeCheckoutLoading || typeof onUpgradeToIndividual !== "function") {
            return;
          }
          setCalendarUpgradeCheckoutLoading(true);
          try {
            await Promise.resolve(onUpgradeToIndividual());
          } finally {
            setCalendarUpgradeCheckoutLoading(false);
          }
        }

`;
