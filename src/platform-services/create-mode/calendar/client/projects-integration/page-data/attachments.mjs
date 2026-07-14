export const CALENDAR_PROJECTS_PAGE_ATTACHMENTS_SCRIPT = `
        function appendUploadedScheduleAttachments(attachments) {
          const normalizedAttachments = normalizePlaygroundTaskAttachmentList(attachments);
          if (!normalizedAttachments.length) {
            return null;
          }
          return updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            attachments: normalizePlaygroundTaskAttachmentList((current?.attachments || []).concat(normalizedAttachments)),
          }));
        }

`;
