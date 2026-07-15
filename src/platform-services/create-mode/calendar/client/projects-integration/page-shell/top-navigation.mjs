export const CALENDAR_PROJECTS_PAGE_SHELL_TOP_NAVIGATION_SCRIPT = `
        function formatScheduleCalendarHeaderLabel(date, view) {
          const calendarDate = date instanceof Date ? new Date(date) : new Date(date || Date.now());
          if (Number.isNaN(calendarDate.getTime())) {
            return "Calendar";
          }
          if (view === "month") {
            return format(calendarDate, "MMMM yyyy");
          }
          if (view === "day") {
            return format(calendarDate, "MMMM d, yyyy");
          }

          const weekStart = getPlaygroundCalendarWeekStart(calendarDate);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          const separator = " \u2013 ";
          if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
            return format(weekStart, "MMM d, yyyy") + separator + format(weekEnd, "MMM d, yyyy");
          }
          if (weekStart.getMonth() !== weekEnd.getMonth()) {
            return format(weekStart, "MMM d") + separator + format(weekEnd, "MMM d");
          }
          return format(weekStart, "MMMM d") + separator + format(weekEnd, "d");
        }

        function handleScheduleCalendarViewChange(nextView) {
          setScheduleCalendarView(allowedScheduleCalendarViews.includes(nextView) ? nextView : "week");
        }

        function handleScheduleCalendarNavigate(action) {
          const normalizedAction = String(action || "").toUpperCase();
          if (normalizedAction === "TODAY") {
            setScheduleCalendarDate(new Date());
            return;
          }
          const direction = normalizedAction === "PREV" ? -1 : normalizedAction === "NEXT" ? 1 : 0;
          if (!direction) {
            return;
          }
          setScheduleCalendarDate((currentValue) => {
            const currentDate = currentValue instanceof Date ? new Date(currentValue) : new Date(currentValue || Date.now());
            const nextDate = Number.isNaN(currentDate.getTime()) ? new Date() : currentDate;
            if (activeScheduleCalendarView === "month") {
              const currentDay = nextDate.getDate();
              nextDate.setDate(1);
              nextDate.setMonth(nextDate.getMonth() + direction);
              const lastDayOfTargetMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
              nextDate.setDate(Math.min(currentDay, lastDayOfTargetMonth));
            } else {
              nextDate.setDate(nextDate.getDate() + direction * (activeScheduleCalendarView === "week" ? 7 : 1));
            }
            return nextDate;
          });
        }

        const scheduleCalendarTopNavLabel = useMemo(() => (
          formatScheduleCalendarHeaderLabel(scheduleCalendarDate, activeScheduleCalendarView)
        ), [activeScheduleCalendarView, scheduleCalendarDate]);
        const scheduleCalendarTodayActive = useMemo(() => (
          isScheduleCalendarDateVisible(scheduleCalendarDate, activeScheduleCalendarView)
        ), [activeScheduleCalendarView, scheduleCalendarDate]);

        useEffect(() => {
          if (!isStandaloneCalendarMode || typeof onCalendarTopNavStateChange !== "function") {
            return;
          }
          onCalendarTopNavStateChange({
            label: scheduleCalendarTopNavLabel,
            view: activeScheduleCalendarView,
            isTodayActive: scheduleCalendarTodayActive,
          });
        }, [
          activeScheduleCalendarView,
          isStandaloneCalendarMode,
          onCalendarTopNavStateChange,
          scheduleCalendarTodayActive,
          scheduleCalendarTopNavLabel,
        ]);

        useEffect(() => {
          if (!calendarTopNavActionsRef || typeof calendarTopNavActionsRef !== "object") {
            return;
          }
          if (!isStandaloneCalendarMode) {
            calendarTopNavActionsRef.current = null;
            return;
          }
          calendarTopNavActionsRef.current = {
            navigate: handleScheduleCalendarNavigate,
            setView: handleScheduleCalendarViewChange,
            create: () => openScheduleComposer(),
          };
        });

        useEffect(() => () => {
          if (calendarTopNavActionsRef && typeof calendarTopNavActionsRef === "object") {
            calendarTopNavActionsRef.current = null;
          }
        }, [calendarTopNavActionsRef]);

`;
