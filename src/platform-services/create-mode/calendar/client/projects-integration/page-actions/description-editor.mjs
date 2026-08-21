export const CALENDAR_PROJECTS_PAGE_DESCRIPTION_EDITOR_SCRIPT = `
        function reconcileScheduleDescriptionDraftRecord(scheduleRecord, nextDescription, context = {}) {
          const currentSchedule = scheduleRecord || buildProjectScheduleDraft(selectedProject);
          const currentAttachments = normalizePlaygroundTaskAttachmentList(currentSchedule?.attachments);
          const uploadedAttachments = getTaskDescriptionChangeUploadedAttachments(context);
          const candidateAttachments = normalizePlaygroundTaskAttachmentList(
            currentAttachments.concat(uploadedAttachments)
          );
          const nextAttachments = reconcileTaskDescriptionAttachments(
            String(nextDescription || ""),
            candidateAttachments
          );
          const retainedAttachmentIds = new Set(nextAttachments.map((attachment) => attachment.id));
          const removedAttachments = currentAttachments.filter((attachment) =>
            !retainedAttachmentIds.has(attachment.id)
          );
          const nextConnectors = removedAttachments.reduce(
            (connectors, attachment) => removePlaygroundAttachmentFromConnectorSelections(connectors, attachment),
            currentSchedule?.connectors
          );
          return {
            ...currentSchedule,
            task: String(nextDescription || ""),
            attachments: nextAttachments,
            connectors: nextConnectors,
          };
        }

        function handleScheduleDescriptionEditorChange(nextValue, context = {}) {
          const previousAttachments = normalizePlaygroundTaskAttachmentList(scheduleDraft?.attachments);
          const nextSchedule = updateScheduleDraft((current) =>
            reconcileScheduleDescriptionDraftRecord(current, nextValue, context)
          );
          const retainedAttachmentIds = new Set(
            normalizePlaygroundTaskAttachmentList(nextSchedule?.attachments).map((attachment) => attachment.id)
          );
          revokeTaskAttachmentListObjectUrls(
            previousAttachments.filter((attachment) => !retainedAttachmentIds.has(attachment.id))
          );
        }

        function handleScheduleWorkflowPromptEditorChange(nextValue, context = {}) {
          const previousAttachments = normalizePlaygroundTaskAttachmentList(scheduleDraft?.attachments);
          const nextPrompt = String(nextValue || "");
          const nextValues = {
            ...(scheduleWorkflowRunState.values && typeof scheduleWorkflowRunState.values === "object"
              ? scheduleWorkflowRunState.values
              : {}),
            prompt: nextPrompt,
          };
          const nextSchedule = updateScheduleDraft((current) => {
            const base = current || buildProjectScheduleDraft(selectedProject);
            const reconciled = reconcileScheduleDescriptionDraftRecord(base, nextPrompt, context);
            return {
              ...reconciled,
              task: base.task || "",
              description: nextPrompt,
              metadata: {
                ...((base.metadata && typeof base.metadata === "object" && !Array.isArray(base.metadata)) ? base.metadata : {}),
                workflowContractId: activeScheduleWorkflowContract?.id || null,
                workflowTriggerType: activeScheduleWorkflowContract?.triggerType || null,
                workflowInputValues: nextValues,
              },
            };
          });
          setScheduleWorkflowRunState((current) => ({
            ...current,
            values: nextValues,
            error: "",
          }));
          const retainedAttachmentIds = new Set(
            normalizePlaygroundTaskAttachmentList(nextSchedule?.attachments).map((attachment) => attachment.id)
          );
          revokeTaskAttachmentListObjectUrls(
            previousAttachments.filter((attachment) => !retainedAttachmentIds.has(attachment.id))
          );
        }

        async function uploadScheduleDescriptionFiles(files) {
          const uploadedAttachments = await uploadTaskAttachmentFiles(files, {
            environmentId: activeTaskEnvironmentId,
            allowWithoutEnvironment: true,
          });
          return buildTaskDescriptionUploadedFiles(uploadedAttachments);
        }

        function handleRenameScheduleDescriptionFile(file, nextName) {
          const attachmentId = String(file?.attachmentId || "").trim();
          const normalizedName = String(nextName || "").trim();
          if (!attachmentId || !normalizedName) return;
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            attachments: normalizePlaygroundTaskAttachmentList(current?.attachments).map((attachment) =>
              attachment.id === attachmentId
                ? { ...attachment, filename: normalizedName }
                : attachment
            ),
          }));
        }

        function handleRemoveScheduleDescriptionFile(file) {
          const attachmentId = String(file?.attachmentId || "").trim();
          if (!attachmentId) return;
          const targetAttachment = normalizePlaygroundTaskAttachmentList(scheduleDraft?.attachments)
            .find((attachment) => attachment.id === attachmentId) || null;
          if (!targetAttachment) return;
          revokeTaskAttachmentObjectUrl(targetAttachment.previewUrl);
          revokeTaskAttachmentObjectUrl(targetAttachment.url);
          if (previewedTaskAttachmentId === attachmentId) {
            setPreviewedTaskAttachmentId("");
          }
          const isWorkflowPrompt = String(scheduleDraft?.targetType || "").trim().toLowerCase() === "workflow"
            && activeScheduleWorkflowContract?.mode === "composer";
          const currentWorkflowValues = scheduleWorkflowRunState.values
            && typeof scheduleWorkflowRunState.values === "object"
            && !Array.isArray(scheduleWorkflowRunState.values)
              ? scheduleWorkflowRunState.values
              : {};
          const nextWorkflowPrompt = isWorkflowPrompt
            ? removeTaskDescriptionAttachmentReference(
                currentWorkflowValues.prompt ?? scheduleDraft?.description,
                targetAttachment
              )
            : "";
          const nextWorkflowValues = isWorkflowPrompt
            ? { ...currentWorkflowValues, prompt: nextWorkflowPrompt }
            : currentWorkflowValues;
          updateScheduleDraft((current) => {
            const base = current || buildProjectScheduleDraft(selectedProject);
            const metadata = base.metadata && typeof base.metadata === "object" && !Array.isArray(base.metadata)
              ? base.metadata
              : {};
            return {
              ...base,
              task: isWorkflowPrompt
                ? base.task
                : removeTaskDescriptionAttachmentReference(base.task, targetAttachment),
              description: isWorkflowPrompt ? nextWorkflowPrompt : base.description,
              attachments: normalizePlaygroundTaskAttachmentList(base.attachments)
                .filter((attachment) => attachment.id !== attachmentId),
              connectors: removePlaygroundAttachmentFromConnectorSelections(base.connectors, targetAttachment),
              metadata: isWorkflowPrompt
                ? { ...metadata, workflowInputValues: nextWorkflowValues }
                : metadata,
            };
          });
          if (isWorkflowPrompt) {
            setScheduleWorkflowRunState((current) => ({
              ...current,
              values: nextWorkflowValues,
              error: "",
            }));
          }
        }

`;
