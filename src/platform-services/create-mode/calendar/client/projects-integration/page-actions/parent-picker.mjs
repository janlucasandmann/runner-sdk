export const CALENDAR_PROJECTS_PAGE_PARENT_PICKER_SCRIPT = `
        function openScheduleTaskParentPicker() {
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskDetailSelectPopover("");
          setTaskParentPickerState({
            mode: "schedule",
            selectedParentTaskId: normalizePlaygroundParentTaskId(scheduleDraft?.parentTaskId) || "",
          });
        }

`;
