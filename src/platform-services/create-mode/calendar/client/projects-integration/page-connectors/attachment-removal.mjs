export const CALENDAR_PROJECTS_PAGE_ATTACHMENT_REMOVAL_SCRIPT = `
        function handleRemoveScheduleAttachment(attachmentId) {
          const targetAttachment = (Array.isArray(scheduleDraft?.attachments) ? scheduleDraft.attachments : []).find((attachment) => attachment.id === attachmentId) || null;
          if (!targetAttachment) return;
          revokeTaskAttachmentObjectUrl(targetAttachment.previewUrl);
          revokeTaskAttachmentObjectUrl(targetAttachment.url);
          if (previewedTaskAttachmentId === attachmentId) {
            setPreviewedTaskAttachmentId("");
          }
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            attachments: normalizePlaygroundTaskAttachmentList((current?.attachments || []).filter((attachment) => attachment.id !== attachmentId)),
            connectors: removePlaygroundAttachmentFromConnectorSelections(current?.connectors, targetAttachment),
          }));
        }

`;
