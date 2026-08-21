export const CALENDAR_PROJECTS_PAGE_SHELL_DERIVED_STATE_SCRIPT = `
        const selectedScheduleSnapshot = useMemo(() => {
          if (!selectedScheduleId) return null;
          return schedulesById[selectedScheduleId] || null;
        }, [schedulesById, selectedScheduleId]);

        const scheduleExecutionThreadCandidates = useMemo(() => {
          const candidatesById = new Map();
          [...(Array.isArray(threadRecords) ? threadRecords : []), ...scheduleExecutionThreadRecords]
            .forEach((thread) => {
              const threadId = String(thread?.id || thread?.threadId || thread?.thread_id || "").trim();
              if (threadId) candidatesById.set(threadId, thread);
            });
          return Array.from(candidatesById.values());
        }, [scheduleExecutionThreadRecords, threadRecords]);

        const selectedProjectSchedules = useMemo(() => {
          if (!isStandaloneCalendarMode && !selectedProjectId) {
            return [];
          }
          return [...schedules]
            .filter((schedule) => {
              if (!normalizedSearchQuery) return true;
              const haystack = [
                schedule.name || "",
                schedule.description || "",
                schedule.task || "",
                schedule.agentName || "",
                schedule.environmentName || "",
                schedule.scheduleType || "",
              ]
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            })
            .sort((left, right) => {
              const leftAnchor = String(left.nextRunAt || left.scheduledTime || left.updatedAt || "");
              const rightAnchor = String(right.nextRunAt || right.scheduledTime || right.updatedAt || "");
              const primaryOrder = leftAnchor.localeCompare(rightAnchor);
              if (primaryOrder !== 0) {
                return primaryOrder;
              }
              return String(left.name || "").localeCompare(String(right.name || ""));
            });
        }, [isStandaloneCalendarMode, normalizedSearchQuery, schedules, selectedProjectId]);

	        const visibleScheduleCalendarRange = useMemo(() => {
	          return buildPlaygroundCalendarVisibleRange(scheduleCalendarDate, activeScheduleCalendarView);
	        }, [activeScheduleCalendarView, scheduleCalendarDate]);
	        const visibleScheduleCalendarRangeKey = useMemo(() => {
	          const startMs = visibleScheduleCalendarRange?.start instanceof Date && !Number.isNaN(visibleScheduleCalendarRange.start.getTime())
	            ? visibleScheduleCalendarRange.start.getTime()
	            : 0;
	          const endMs = visibleScheduleCalendarRange?.end instanceof Date && !Number.isNaN(visibleScheduleCalendarRange.end.getTime())
	            ? visibleScheduleCalendarRange.end.getTime()
	            : 0;
	          return String(startMs) + ":" + String(endMs);
	        }, [visibleScheduleCalendarRange]);

	        const projectCalendarEvents = useMemo(() => {
          const scheduleEvents = selectedProjectSchedules
            .reduce((allEvents, schedule) => {
              return allEvents.concat(buildPlaygroundScheduleCalendarEvents(schedule, visibleScheduleCalendarRange));
            }, []);
          const draftScheduleEvents = scheduleViewMode === "setup"
            && scheduleEditorMode === "create"
            && !String(scheduleDraft?.id || "").trim()
            ? buildPlaygroundScheduleCalendarEvents({
                ...(scheduleDraft || buildProjectScheduleDraft(selectedProject)),
                id: "__calendar_schedule_draft__",
                kind: "schedule-draft",
                isDraft: true,
                name: String(scheduleDraft?.name || "").trim() || (
                  normalizePlaygroundScheduleTargetType(scheduleDraft?.targetType) === "workflow"
                    ? "New Scheduled Workflow"
                    : normalizePlaygroundScheduleTargetType(scheduleDraft?.targetType) === "loop"
                      ? "New Scheduled Loop"
                      : normalizePlaygroundScheduleTargetType(scheduleDraft?.targetType) === "batch"
                        ? "New Scheduled Batch"
                        : "New Scheduled Task"
                ),
              }, visibleScheduleCalendarRange)
            : [];
          const metronomeEvents = calendarMetronomeWorkflows
            .reduce((allEvents, workflow) => {
              return allEvents.concat(buildPlaygroundMetronomeCalendarEvents(workflow, visibleScheduleCalendarRange));
            }, []);
          const taskEvents = sortedTasks
            .reduce((allEvents, task) => {
              return allEvents.concat(
                buildPlaygroundTaskCalendarEvents(
                  task,
                  taskTicketNumbersById[task.id] || task.ticketNumber || "",
                  visibleScheduleCalendarRange
                )
              );
            }, []);

          return scheduleEvents
            .concat(draftScheduleEvents)
            .concat(metronomeEvents)
            .concat(taskEvents)
            .sort((left, right) => {
              const leftTime = left?.start instanceof Date ? left.start.getTime() : 0;
              const rightTime = right?.start instanceof Date ? right.start.getTime() : 0;
              if (leftTime !== rightTime) {
                return leftTime - rightTime;
              }
              return String(left?.title || "").localeCompare(String(right?.title || ""));
            });
        }, [
          calendarMetronomeWorkflows,
          scheduleDraft,
          scheduleEditorMode,
          scheduleViewMode,
          selectedProject,
          selectedProjectSchedules,
          sortedTasks,
          taskTicketNumbersById,
          visibleScheduleCalendarRange,
        ]);

        const activeScheduleWorkflowContract = useMemo(() => {
          const contracts = Array.isArray(scheduleWorkflowRunState.contracts)
            ? scheduleWorkflowRunState.contracts
            : [];
          return contracts.find((contract) => contract.id === scheduleWorkflowRunState.contractId)
            || contracts[0]
            || null;
        }, [scheduleWorkflowRunState.contractId, scheduleWorkflowRunState.contracts]);

        useEffect(() => {
          const scheduleTargetType = normalizePlaygroundScheduleTargetType(scheduleDraft?.targetType);
          const workflowId = scheduleTargetType === "workflow"
            ? String(scheduleDraft?.workflowId || "").trim()
            : "";
          if (!workflowId) {
            setScheduleWorkflowRunState((current) => (
              current.status === "idle" && !current.workflowId
                ? current
                : {
                    status: "idle",
                    workflowId: "",
                    context: null,
                    contracts: [],
                    contractId: "",
                    values: {},
                    error: "",
                  }
            ));
            return undefined;
          }

          const metadata = scheduleDraft?.metadata && typeof scheduleDraft.metadata === "object" && !Array.isArray(scheduleDraft.metadata)
            ? scheduleDraft.metadata
            : {};
          const pinnedVersionId = String(metadata.workflowVersionId || "").trim();
          let isActive = true;
          const requestController = typeof AbortController === "function"
            ? new AbortController()
            : null;
          setScheduleWorkflowRunState({
            status: "loading",
            workflowId,
            context: null,
            contracts: [],
            contractId: "",
            values: {},
            error: "",
          });

          void loadPlatformMetronomeManualRunContext(workflowId, pinnedVersionId || null, {
            baseUrl: backendUrl,
            requestHeaders,
            signal: requestController?.signal,
          }).then((context) => {
            if (!isActive) return;
            const contracts = createPlatformMetronomeManualRunContracts(
              context.workflow,
              context.nodes,
              context.edges,
              {
                agentOptions: sortedAgents.map((agent) => ({
                  id: String(agent?.id || ""),
                  name: String(agent?.name || agent?.id || "Agent"),
                })).filter((agent) => agent.id),
                environmentOptions: availableBacklogEnvironments.map((environment) => ({
                  id: String(environment?.id || ""),
                  name: String(environment?.name || environment?.id || "Computer"),
                })).filter((environment) => environment.id),
                projectOptions: projects.map((project) => ({
                  id: String(project?.id || ""),
                  name: String(project?.name || project?.id || "Project"),
                  defaultEnvironmentId: project?.defaultEnvironmentId || null,
                })).filter((project) => project.id),
                functionOptions: context.functionOptions,
                webAppOptions: context.webAppOptions,
                databaseOptions: context.databaseOptions,
                authOptions: context.authOptions,
              }
            );
            const persistedInput = metadata.workflowInput && typeof metadata.workflowInput === "object" && !Array.isArray(metadata.workflowInput)
              ? metadata.workflowInput
              : {};
            const persistedValues = metadata.workflowInputValues && typeof metadata.workflowInputValues === "object" && !Array.isArray(metadata.workflowInputValues)
              ? metadata.workflowInputValues
              : null;
            const persistedContractId = String(metadata.workflowContractId || "").trim();
            const persistedTriggerType = String(
              metadata.workflowTriggerType || persistedInput.triggerType || persistedInput.simulatedTriggerType || ""
            ).trim().toLowerCase();
            const contract = contracts.find((candidate) => candidate.id === persistedContractId)
              || contracts.find((candidate) => candidate.triggerType === persistedTriggerType)
              || contracts[0]
              || null;
            setScheduleWorkflowRunState({
              status: "ready",
              workflowId,
              context,
              contracts,
              contractId: contract?.id || "",
              values: contract
                ? (persistedValues || createPlatformMetronomeManualRunInitialValues(contract, persistedInput))
                : {},
              error: contract ? "" : "This Workflow does not expose a runnable trigger.",
            });
          }).catch((error) => {
            if (!isActive || requestController?.signal.aborted) return;
            setScheduleWorkflowRunState({
              status: "error",
              workflowId,
              context: null,
              contracts: [],
              contractId: "",
              values: {},
              error: error instanceof Error ? error.message : "Workflow inputs could not be loaded.",
            });
          });

          return () => {
            isActive = false;
            requestController?.abort();
          };
        }, [backendUrl, requestHeadersKey, scheduleDraft?.targetType, scheduleDraft?.workflowId, scheduleDraft?.metadata?.workflowVersionId]);

`;
