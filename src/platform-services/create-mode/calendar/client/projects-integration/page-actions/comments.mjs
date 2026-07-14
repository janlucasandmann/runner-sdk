export const CALENDAR_PROJECTS_PAGE_COMMENTS_SCRIPT = `
        function handleAddScheduleComment() {
          const nextCommentBody = String(taskCommentInputValue || "").replaceAll(String.fromCharCode(13), "").trim();
          if (!nextCommentBody) {
            return;
          }
          const createdComment = normalizePlaygroundTaskCommentRecord({
            id: "schedule_comment_" + Date.now(),
            body: nextCommentBody,
            text: nextCommentBody,
            authorType: "user",
            authorName: currentUserName || "You",
            createdAt: new Date().toISOString(),
          });
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            comments: normalizePlaygroundTaskCommentList((current?.comments || []).concat(createdComment)),
          }));
          setTaskCommentInputValue("");
          resetScheduleSaveState("");
        }

`;
