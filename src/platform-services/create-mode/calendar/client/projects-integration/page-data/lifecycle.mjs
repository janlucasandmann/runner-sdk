export const CALENDAR_PROJECTS_PAGE_LIFECYCLE_SCRIPT = `
        useEffect(() => {
          if (!isCalendarContext) return undefined;
          const scheduleProjectId = isStandaloneCalendarMode ? "" : selectedProjectId;
          if (!scheduleProjectId && !isStandaloneCalendarMode) return undefined;
          let disposed = false;
          let refreshing = false;
          const refreshExecutionLifecycle = async () => {
            if (disposed || refreshing || document.visibilityState === "hidden") return;
            refreshing = true;
            try {
              await loadScheduleExecutionThreads(
                "",
                visibleScheduleCalendarRange,
                scheduleProjectId
              );
            } finally {
              refreshing = false;
            }
          };
          const intervalId = window.setInterval(refreshExecutionLifecycle, 5_000);
          const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") void refreshExecutionLifecycle();
          };
          document.addEventListener("visibilitychange", handleVisibilityChange);
          return () => {
            disposed = true;
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
          };
        }, [
          backendUrl,
          isCalendarContext,
          isStandaloneCalendarMode,
          requestHeadersKey,
          selectedProjectId,
          visibleScheduleCalendarRangeKey,
        ]);
`;
