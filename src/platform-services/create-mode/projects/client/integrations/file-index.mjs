export const PROJECTS_FILE_INDEX_RUNTIME_SCRIPT = `
      function buildPlaygroundProjectLinkedFilePathIndex(projects, servers, tasks) {
        const next = {};

        function getEnvironmentRecord(environmentId) {
          const normalizedEnvironmentId = String(environmentId || "").trim();
          if (!normalizedEnvironmentId) {
            return null;
          }
          if (!next[normalizedEnvironmentId]) {
            next[normalizedEnvironmentId] = {
              all: new Set(),
              byProjectId: {},
            };
          }
          return next[normalizedEnvironmentId];
        }

        function addPath(environmentId, path, projectId = "") {
          const normalizedPath = normalizeHistoryPath(path);
          const normalizedProjectId = String(projectId || "").trim();
          const environmentRecord = getEnvironmentRecord(environmentId);
          if (!environmentRecord || !normalizedPath) {
            return;
          }
          environmentRecord.all.add(normalizedPath);
          if (normalizedProjectId) {
            if (!environmentRecord.byProjectId[normalizedProjectId]) {
              environmentRecord.byProjectId[normalizedProjectId] = new Set();
            }
            environmentRecord.byProjectId[normalizedProjectId].add(normalizedPath);
          }
        }

        (Array.isArray(projects) ? projects : []).forEach((project) => {
          const projectId = String(project?.id || "").trim();
          normalizePlaygroundTaskAttachmentList(project?.attachments).forEach((attachment) => {
            addPath(attachment?.environmentId, attachment?.sourcePath || attachment?.workspacePath, projectId);
          });
        });

        (Array.isArray(servers) ? servers : []).forEach((server) => {
          const projectId = String(server?.projectId || "").trim();
          if (!projectId) {
            return;
          }
          addPath(server?.sourceEnvironmentId, server?.sourcePath, projectId);
        });

        (Array.isArray(tasks) ? tasks : []).forEach((task) => {
          const projectId = String(task?.projectId || "").trim();
          if (!projectId) {
            return;
          }
          normalizePlaygroundTaskAttachmentList(task?.attachments).forEach((attachment) => {
            addPath(attachment?.environmentId, attachment?.sourcePath || attachment?.workspacePath, projectId);
          });
        });

        return next;
      }

      function getPlaygroundThreadProjectId(thread) {
        const safeThread = normalizeThreadItem(thread);
        const taskPreview = getThreadTaskPreview(safeThread);
        const missionControlMetadata = getThreadMissionControlMetadata(safeThread);
        return String(
          taskPreview?.projectId
          || missionControlMetadata?.projectId
          || safeThread?.projectId
          || ""
        ).trim();
      }

      function getPlaygroundThreadEnvironmentId(thread, fallbackEnvironmentId = "") {
        const safeThread = normalizeThreadItem(thread);
        const taskPreview = getThreadTaskPreview(safeThread);
        return String(
          taskPreview?.environmentId
          || safeThread?.environmentId
          || fallbackEnvironmentId
          || ""
        ).trim();
      }

      function buildPlaygroundProjectFileActivityRowsForThreadHistory({
        thread,
        steps,
        threadLogs,
        fallbackEnvironmentId = "",
        agentsById = {},
      }) {
        const safeThread = normalizeThreadItem(thread);
        const normalizedThreadId = String(safeThread?.id || "").trim();
        const normalizedProjectId = getPlaygroundThreadProjectId(safeThread);
        if (!normalizedThreadId || !normalizedProjectId) {
          return [];
        }

        const normalizedSteps = Array.isArray(steps) ? steps : [];
        const normalizedThreadLogs = Array.isArray(threadLogs) ? threadLogs : [];
        if (normalizedSteps.length === 0 && normalizedThreadLogs.length === 0) {
          return [];
        }

        const historyLogsById = new Map();
        for (const log of normalizedThreadLogs) {
          if (log && typeof log.id === "string" && log.id) {
            historyLogsById.set(log.id, log);
          }
        }

        const supplementalStepEntriesById = buildSupplementalHistoryStepEntriesById(
          normalizedSteps,
          normalizedThreadLogs,
          historyLogsById
        );
        const orderedSteps = [...normalizedSteps].sort((left, right) => {
          const leftSequence = Number(left?.sequence || 0);
          const rightSequence = Number(right?.sequence || 0);
          return rightSequence - leftSequence;
        });

        function resolveRevertTargetStep(selectedStep) {
          if (!selectedStep) {
            return null;
          }

          if (selectedStep.snapshotBeforeId) {
            const matchedBySnapshot = orderedSteps.find((step) => {
              return (
                step.id !== selectedStep.id
                && (
                  (step.snapshotAfterId && step.snapshotAfterId === selectedStep.snapshotBeforeId)
                  || (step.snapshotBeforeId && step.snapshotBeforeId === selectedStep.snapshotBeforeId)
                )
              );
            });
            if (matchedBySnapshot) {
              return matchedBySnapshot;
            }
          }

          const previousSteps = orderedSteps
            .filter((step) => {
              return (
                step.id !== selectedStep.id
                && Number.isFinite(step?.sequence)
                && Number(step.sequence) < Number(selectedStep.sequence)
                && (step.snapshotAfterId || step.snapshotBeforeId)
              );
            })
            .sort((left, right) => Number(right.sequence || 0) - Number(left.sequence || 0));

          return previousSteps[0] || null;
        }

        const {
          safeThread: normalizedSafeThread,
          taskPreview,
          taskTicketNumber,
        } = getSidebarThreadTitleParts(safeThread);
        const resolvedEnvironmentId = getPlaygroundThreadEnvironmentId(
          safeThread,
          fallbackEnvironmentId
        );
        const threadActor = getPlaygroundThreadActorInfo(normalizedSafeThread, agentsById, "No agent");

        return orderedSteps.flatMap((step) => {
          const stepId = String(step?.id || "").trim();
          if (!stepId) {
            return [];
          }

          const revertTargetStep = resolveRevertTargetStep(step);
          const stepFileEntries = buildStepFileEntries(
            step,
            null,
            [],
            supplementalStepEntriesById.get(stepId) || [],
            historyLogsById
          ).filter((entry) => entry && entry.type === "file" && entry.path);

          if (stepFileEntries.length === 0) {
            return [];
          }

          const stepTimestamp = Date.parse(String(step?.createdAt || normalizedSafeThread?.updatedAt || normalizedSafeThread?.createdAt || ""));
          const dateLabel = Number.isFinite(stepTimestamp)
            ? new Date(stepTimestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—";

          return stepFileEntries.map((entry) => {
            const normalizedPath = normalizeHistoryPath(entry.path);
            const operationKind = normalizeHistoryChangeKind(entry.changeKind)
              || inferHistoryChangeKindFromDiffText(entry.diffText)
              || "modified";
            return {
              id: "project-file-change:" + normalizedThreadId + ":" + stepId + ":" + normalizedPath,
              threadId: normalizedThreadId,
              projectId: normalizedProjectId,
              stepId,
              revertTargetStepId: typeof revertTargetStep?.id === "string" ? revertTargetStep.id : "",
              title: entry.name || getHistoryPathName(normalizedPath) || normalizedPath,
              path: normalizedPath,
              operation: getHistoryChangeKindLabel(operationKind) || "Modified",
              operationKind,
              assignee: threadActor.name,
              assigneeId: threadActor.id,
              assigneeKind: threadActor.kind,
              taskTicketNumber: taskTicketNumber || "",
              taskId: String(taskPreview?.taskId || "").trim(),
              dateLabel,
              timestamp: Number.isFinite(stepTimestamp) ? stepTimestamp : 0,
              environmentId: resolvedEnvironmentId,
              threadRecord: normalizedSafeThread,
            };
          });
        });
      }

      function buildPlaygroundProjectLinkedFilePathIndexFromActivityRows(rows) {
        const next = {};

        function getEnvironmentRecord(environmentId) {
          const normalizedEnvironmentId = String(environmentId || "").trim();
          if (!normalizedEnvironmentId) {
            return null;
          }
          if (!next[normalizedEnvironmentId]) {
            next[normalizedEnvironmentId] = {
              all: new Set(),
              byProjectId: {},
            };
          }
          return next[normalizedEnvironmentId];
        }

        (Array.isArray(rows) ? rows : []).forEach((row) => {
          const normalizedEnvironmentId = String(row?.environmentId || "").trim();
          const normalizedProjectId = String(row?.projectId || "").trim();
          const normalizedPath = normalizeHistoryPath(row?.path || "");
          const environmentRecord = getEnvironmentRecord(normalizedEnvironmentId);
          if (!environmentRecord || !normalizedPath) {
            return;
          }
          environmentRecord.all.add(normalizedPath);
          if (normalizedProjectId) {
            if (!environmentRecord.byProjectId[normalizedProjectId]) {
              environmentRecord.byProjectId[normalizedProjectId] = new Set();
            }
            environmentRecord.byProjectId[normalizedProjectId].add(normalizedPath);
          }
        });

        return next;
      }

      function mergePlaygroundProjectLinkedFilePathIndexes(baseIndex, extraIndex) {
        const next = {};

        function ensureEnvironmentRecord(environmentId) {
          const normalizedEnvironmentId = String(environmentId || "").trim();
          if (!normalizedEnvironmentId) {
            return null;
          }
          if (!next[normalizedEnvironmentId]) {
            next[normalizedEnvironmentId] = {
              all: new Set(),
              byProjectId: {},
            };
          }
          return next[normalizedEnvironmentId];
        }

        function mergeIndex(index) {
          Object.entries(index && typeof index === "object" ? index : {}).forEach(([environmentId, environmentRecord]) => {
            const targetRecord = ensureEnvironmentRecord(environmentId);
            if (!targetRecord) {
              return;
            }
            (environmentRecord?.all instanceof Set ? environmentRecord.all : []).forEach((path) => {
              targetRecord.all.add(path);
            });
            Object.entries(environmentRecord?.byProjectId && typeof environmentRecord.byProjectId === "object"
              ? environmentRecord.byProjectId
              : {})
              .forEach(([projectId, paths]) => {
                if (!targetRecord.byProjectId[projectId]) {
                  targetRecord.byProjectId[projectId] = new Set();
                }
                (paths instanceof Set ? paths : []).forEach((path) => {
                  targetRecord.byProjectId[projectId].add(path);
                });
              });
          });
        }

        mergeIndex(baseIndex);
        mergeIndex(extraIndex);
        return next;
      }
`;
