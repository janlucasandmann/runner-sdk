export const CALENDAR_PROJECTS_PAGE_TASK_TYPE_SCRIPT = `
        function handleScheduleTaskTypeSelection(nextType) {
          const normalizedType = normalizePlaygroundScheduleTargetType(nextType);
          const currentTargetType = normalizePlaygroundScheduleTargetType(scheduleDraft?.targetType);
          if (currentTargetType === normalizedType) {
            return;
          }
          updateScheduleDraft((current) => ({
            ...(current || buildProjectScheduleDraft(selectedProject)),
            task: normalizedType !== "workflow"
              && normalizedType !== "batch"
              && (
                (normalizePlaygroundScheduleTargetType(current?.targetType) === "workflow"
                  && String(current?.task || "").startsWith("Run workflow:"))
                || (normalizePlaygroundScheduleTargetType(current?.targetType) === "batch"
                  && String(current?.task || "").startsWith("Start Batch job:"))
              )
                ? ""
                : current?.task || "",
            targetType: normalizedType,
            taskType: normalizedType === "loop" ? "loop" : "task",
            parentTaskId: null,
            workflowId: normalizedType === "workflow" ? current?.workflowId || null : null,
            workflowName: normalizedType === "workflow" ? current?.workflowName || null : null,
            batchJobId: normalizedType === "batch" ? current?.batchJobId || null : null,
            batchJobName: normalizedType === "batch" ? current?.batchJobName || null : null,
            metadata: {
              ...((current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)) ? current.metadata : {}),
              scheduleTargetType: normalizedType,
              targetKind: normalizedType === "workflow"
                ? "metronome_run"
                : normalizedType === "batch"
                  ? "batch_job"
                  : "thread",
              workflowId: normalizedType === "workflow" ? current?.workflowId || null : null,
              workflowName: normalizedType === "workflow" ? current?.workflowName || null : null,
              workflowVersionId: normalizedType === "workflow" ? current?.metadata?.workflowVersionId || null : null,
              workflowContractId: normalizedType === "workflow" ? current?.metadata?.workflowContractId || null : null,
              workflowTriggerType: normalizedType === "workflow" ? current?.metadata?.workflowTriggerType || null : null,
              workflowInput: normalizedType === "workflow" ? current?.metadata?.workflowInput || null : null,
              workflowInputValues: normalizedType === "workflow" ? current?.metadata?.workflowInputValues || null : null,
              batchJobId: normalizedType === "batch" ? current?.batchJobId || current?.metadata?.batchJobId || null : null,
              batchJobName: normalizedType === "batch" ? current?.batchJobName || current?.metadata?.batchJobName || null : null,
            },
          }));
        }

`;
