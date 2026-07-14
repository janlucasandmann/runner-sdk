export const CALENDAR_PROJECTS_PAGE_TASK_NAVIGATION_SCRIPT = `
        function openTaskFromCalendar(taskId) {
          if (!taskId || !selectedProjectId) {
            return;
          }
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setMissionControlStrategyOpen(false);
          setProjectTaskDetailScreenOpen(false);
          setSelectedScheduleId("");
          setScheduleViewMode("calendar");
          setScheduleEditorMode("create");
          setSelectedTaskId(taskId);
        }

`;
