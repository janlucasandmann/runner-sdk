export const CALENDAR_NAVIGATION_SCRIPT = `
        function openCalendarPage() {
          setAccountMenuOpen(false);
          setSidebarWorkspaceMode("work");
          setActivePage("calendar");
        }

        function openCalendarOverviewPage() {
          setTasksPageNavigationRequest({
            token: createPlaygroundPlatformNavigationToken(),
            projectId: "",
            view: "calendar",
            taskId: "",
            missionControlAction: "",
            projectComposerAction: "",
          });
          openCalendarPage();
        }

`;
