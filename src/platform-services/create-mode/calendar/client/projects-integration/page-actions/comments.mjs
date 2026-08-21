export const CALENDAR_PROJECTS_PAGE_COMMENTS_SCRIPT = `
        async function handleAddScheduleComment(files = []) {
          const nextCommentBody = String(taskCommentInputValue || "").replaceAll(String.fromCharCode(13), "").trim();
          if (!nextCommentBody) {
            return false;
          }
          let uploadedAttachments = [];
          try {
            uploadedAttachments = await uploadTaskAttachmentFiles(files, {
              environmentId: activeTaskEnvironmentId,
              allowWithoutEnvironment: true,
            });
          } catch {
            return false;
          }
          const createdComment = normalizePlaygroundTaskCommentRecord({
            id: "schedule_comment_" + Date.now(),
            body: nextCommentBody,
            text: nextCommentBody,
            authorType: "user",
            authorName: currentUserName || "You",
            createdAt: new Date().toISOString(),
            attachments: uploadedAttachments,
            metadata: {
              attachments: uploadedAttachments,
            },
          });
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            comments: normalizePlaygroundTaskCommentList((current?.comments || []).concat(createdComment)),
          }));
          setTaskCommentInputValue("");
          resetScheduleSaveState("");
          return true;
        }

`;
