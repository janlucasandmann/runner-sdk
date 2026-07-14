export const CALENDAR_PROJECTS_PAGE_SHELL_DERIVED_STATE_SCRIPT = `
        const selectedScheduleSnapshot = useMemo(() => {
          if (!selectedScheduleId) return null;
          return schedulesById[selectedScheduleId] || null;
        }, [schedulesById, selectedScheduleId]);

        const selectedProjectSchedules = useMemo(() => {
          if (!selectedProjectId) {
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
        }, [normalizedSearchQuery, schedules, selectedProjectId]);

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
        }, [calendarMetronomeWorkflows, selectedProjectSchedules, sortedTasks, taskTicketNumbersById, visibleScheduleCalendarRange]);

`;
