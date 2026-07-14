export const CALENDAR_PROJECTS_PAGE_EDITOR_FORMATTING_SCRIPT = `
        function applyScheduleTaskSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            task: nextValue,
          }));
          window.requestAnimationFrame(() => {
            const textarea = scheduleTaskTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleScheduleTaskFormat(formatType) {
          const textarea = scheduleTaskTextareaRef.current;
          if (!textarea) {
            return;
          }
          const value = String(scheduleDraft?.task || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyScheduleTaskSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

        function applyScheduleDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            description: nextValue,
          }));
          window.requestAnimationFrame(() => {
            const textarea = scheduleDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const maxLength = nextValue.length;
            const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
            const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
            textarea.focus();
            textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
            resizeTaskDescriptionTextarea(textarea);
          });
        }

        function handleScheduleDescriptionFormat(formatType) {
          const textarea = scheduleDescriptionTextareaRef.current;
          if (!textarea) {
            return;
          }
          const value = String(scheduleDraft?.description || "");
          const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : value.length;
          const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
          let edit = null;

          if (formatType === "bold") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "**");
          } else if (formatType === "italic") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "*");
          } else if (formatType === "underline") {
            edit = buildWrappedTaskDescriptionEdit(value, selectionStart, selectionEnd, "++");
          } else if (formatType === "list") {
            edit = buildTaskDescriptionListEdit(value, selectionStart, selectionEnd);
          }

          if (!edit) {
            return;
          }

          applyScheduleDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
        }

`;
