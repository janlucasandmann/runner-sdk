export const PROJECTS_DOMAIN_RUNTIME_02_FRAGMENT = `            : typeof item?.id === "string" && item.id.trim()
              ? item.id.trim()
              : undefined,
          connectorItemPath: typeof item?.connectorItemPath === "string" && item.connectorItemPath.trim()
            ? item.connectorItemPath.trim()
            : typeof item?.path === "string" && item.path.trim()
              ? item.path.trim()
              : undefined,
          connectorRepoFullName: typeof item?.connectorRepoFullName === "string" && item.connectorRepoFullName.trim()
            ? item.connectorRepoFullName.trim()
            : typeof item?.repoFullName === "string" && item.repoFullName.trim()
              ? item.repoFullName.trim()
              : undefined,
          connectorRef: typeof item?.connectorRef === "string" && item.connectorRef.trim()
            ? item.connectorRef.trim()
            : typeof item?.ref === "string" && item.ref.trim()
              ? item.ref.trim()
              : undefined,
        };
      }

      function resolvePlaygroundTaskConnectorSelectedItems(items, selection, selectedIds) {
        const itemsById = buildPlaygroundTaskConnectorItemsIndex(items, selection);
        return normalizePlaygroundIdList(selectedIds)
          .map((id) => itemsById.get(id) || null)
          .filter(Boolean);
      }

      function getPlaygroundTaskConnectorDesiredFileIds(selectedItems) {
        const next = new Set();
        (Array.isArray(selectedItems) ? selectedItems : []).forEach((item) => {
          const normalizedItem = normalizePlaygroundTaskConnectorItem(item);
          if (!normalizedItem || normalizedItem.isFolder) {
            return;
          }
          next.add(normalizedItem.id);
        });
        return next;
      }

      function getPlaygroundTaskConnectorRemovedAttachments(attachments, source, selectedItems) {
        const normalizedSource = getPlaygroundTaskConnectorSource(source);
        if (!normalizedSource) {
          return [];
        }
        const desiredFileIds = getPlaygroundTaskConnectorDesiredFileIds(selectedItems);
        return normalizePlaygroundTaskAttachmentList(attachments).filter((attachment) => {
          if (getPlaygroundTaskAttachmentConnectorSource(attachment) !== normalizedSource) {
            return false;
          }
          const connectorItemId = String(attachment?.connectorItemId || "").trim();
          return Boolean(connectorItemId) && !desiredFileIds.has(connectorItemId);
        });
      }

      function reconcilePlaygroundTaskConnectorAttachments(currentAttachments, source, selectedItems, uploadedAttachments = []) {
        const normalizedSource = getPlaygroundTaskConnectorSource(source);
        if (!normalizedSource) {
          return normalizePlaygroundTaskAttachmentList(currentAttachments);
        }

        const desiredFileIds = getPlaygroundTaskConnectorDesiredFileIds(selectedItems);
        const nextAttachments = [];
        const seenConnectorItemIds = new Set();
        const normalizedUploadedAttachments = normalizePlaygroundTaskAttachmentList(uploadedAttachments);
        const uploadedAttachmentsByConnectorId = new Map();

        normalizedUploadedAttachments.forEach((attachment) => {
          const connectorItemId = String(attachment?.connectorItemId || "").trim();
          if (!connectorItemId || getPlaygroundTaskAttachmentConnectorSource(attachment) !== normalizedSource) {
            return;
          }
          uploadedAttachmentsByConnectorId.set(connectorItemId, attachment);
        });

        normalizePlaygroundTaskAttachmentList(currentAttachments).forEach((attachment) => {
          const connectorSource = getPlaygroundTaskAttachmentConnectorSource(attachment);
          const connectorItemId = String(attachment?.connectorItemId || "").trim();

          if (connectorSource !== normalizedSource || !connectorItemId) {
            nextAttachments.push(attachment);
            return;
          }

          if (!desiredFileIds.has(connectorItemId) || seenConnectorItemIds.has(connectorItemId)) {
            return;
          }

          nextAttachments.push(uploadedAttachmentsByConnectorId.get(connectorItemId) || attachment);
          seenConnectorItemIds.add(connectorItemId);
          uploadedAttachmentsByConnectorId.delete(connectorItemId);
        });

        uploadedAttachmentsByConnectorId.forEach((attachment, connectorItemId) => {
          if (seenConnectorItemIds.has(connectorItemId) || !desiredFileIds.has(connectorItemId)) {
            return;
          }
          nextAttachments.push(attachment);
          seenConnectorItemIds.add(connectorItemId);
        });

        return normalizePlaygroundTaskAttachmentList(nextAttachments);
      }

      function removePlaygroundAttachmentFromConnectorSelections(connectors, attachment) {
        const connectorSource = getPlaygroundTaskConnectorSource(attachment?.connectorSource || attachment?.integrationSource);
        const connectorKey = getPlaygroundTaskConnectorKey(connectorSource);
        const connectorItemId = typeof attachment?.connectorItemId === "string" && attachment.connectorItemId.trim()
          ? attachment.connectorItemId.trim()
          : "";
        const nextConnectors = normalizePlaygroundTaskConnectorSelections(connectors);

        if (!connectorKey || !connectorItemId || !nextConnectors[connectorKey]) {
          return nextConnectors;
        }

        const currentSelection = nextConnectors[connectorKey];
        const remainingItems = (currentSelection?.items || []).filter((item) => item?.id !== connectorItemId);
        const remainingSelectedIds = (currentSelection?.selectedIds || []).filter((id) => id !== connectorItemId);
        nextConnectors[connectorKey] = remainingItems.length > 0
          ? buildPlaygroundTaskConnectorSelection(connectorSource, remainingItems, remainingSelectedIds)
          : null;
        return nextConnectors;
      }

      function normalizePlaygroundTaskTicketNumber(value) {
        const normalized = String(value || "").trim();
        if (!normalized) return "";
        const digits = Array.from(normalized).filter((character) => character >= "0" && character <= "9").join("");
        const parsed = Number.parseInt(digits || normalized, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return "";
        }
        return String(parsed).padStart(3, "0");
      }

      function getPlaygroundProjectTicketPrefix(projectRecord) {
        const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
          ? projectRecord.metadata
          : {};
        const source = String(
          projectRecord?.name
            || projectRecord?.title
            || metadata.name
            || metadata.title
            || projectRecord?.slug
            || projectRecord?.id
            || ""
        ).trim();
        const asciiSource = source.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
        const letterPrefix = asciiSource.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3);
        const fallbackPrefix = asciiSource.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3);
        return (letterPrefix || fallbackPrefix || "PRJ").padEnd(3, "X");
      }

      function formatPlaygroundProjectTicketNumber(projectRecord, value) {
        const ticketNumber = normalizePlaygroundTaskTicketNumber(value);
        if (!ticketNumber) {
          return "";
        }
        return getPlaygroundProjectTicketPrefix(projectRecord) + "-" + ticketNumber;
      }

      function normalizePlaygroundTaskType(value) {
        const normalized = String(value || "").trim().toLowerCase();
        if (normalized === "subtask") {
          return "subtask";
        }
        if (normalized === "loop" || normalized === "loop_task" || normalized === "metronome_loop") {
          return "loop";
        }
        return "task";
      }

      function normalizePlaygroundParentTaskId(value) {
        const normalized = String(value || "").trim();
        return normalized || null;
      }

      function getPlaygroundTaskTypeLabel(value) {
        const taskType = normalizePlaygroundTaskType(value);
        if (taskType === "subtask") return "Subtask";
        if (taskType === "loop") return "Loop";
        return "Task";
      }

      function getPlaygroundTaskParentTaskId(task) {
        return normalizePlaygroundParentTaskId(task?.parentTaskId);
      }

      function isPlaygroundSubtaskRecord(task) {
        return normalizePlaygroundTaskType(task?.taskType || task?.type) === "subtask"
          && Boolean(getPlaygroundTaskParentTaskId(task));
      }

      function normalizePlaygroundEditableTaskTitle(value, fallback = "New Task") {
        const normalized = String(value || "")
          .replaceAll(String.fromCharCode(13), " ")
          .replaceAll(String.fromCharCode(10), " ")
          .replaceAll(String.fromCharCode(9), " ")
          .split(" ")
          .filter(Boolean)
          .join(" ")
          .trim();
        return normalized || fallback;
      }

      function parsePlaygroundTaskTicketNumber(value) {
        const normalized = normalizePlaygroundTaskTicketNumber(value);
        return normalized ? Number.parseInt(normalized, 10) : 0;
      }

      function getPlaygroundTaskRunnerMetadata(task) {
        const metadata = task?.metadata && typeof task.metadata === "object" && !Array.isArray(task.metadata)
          ? task.metadata
          : null;
        return metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : null;
      }

      // Task list and work-graph responses are not completely uniform across
      // deployments.  Some responses put the markdown in a dedicated field,
      // while older responses keep it in task metadata.  Resolve the canonical
      // description once here so every task surface (including Spotlight) uses
      // the same value instead of intermittently rendering an empty card.
      function resolvePlaygroundTaskDescription(task) {
        if (!task || typeof task !== "object") {
          return "";
        }
        const metadata = task.metadata && typeof task.metadata === "object" && !Array.isArray(task.metadata)
          ? task.metadata
          : {};
        const runnerPlayground = metadata.runnerPlayground
          && typeof metadata.runnerPlayground === "object"
          && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : {};
        const details = task.details && typeof task.details === "object" && !Array.isArray(task.details)
          ? task.details
          : {};
        const candidates = [
          task.description,
          task.descriptionMarkdown,
          task.description_markdown,
          details.description,
          details.descriptionMarkdown,
          details.description_markdown,
          metadata.description,
          metadata.descriptionMarkdown,
          metadata.description_markdown,
          runnerPlayground.description,
          runnerPlayground.descriptionMarkdown,
          runnerPlayground.description_markdown,
        ];
        return candidates
          .map((value) => typeof value === "string" ? value.trim() : "")
          .find(Boolean) || "";
      }

      const PLAYGROUND_TASK_LOOP_GOAL_SECTIONS = Object.freeze([
        Object.freeze({
          key: "goal",
          label: "Goal",
          example: "Example: Raise the project's automated test pass rate without introducing regressions.",
        }),
        Object.freeze({
          key: "successCriteria",
          label: "Success criteria",
          example: "Example: All target tests pass and the existing regression suite remains green.",
        }),
        Object.freeze({
          key: "progressSignal",
          label: "Progress signal",
          example: "Example: Each iteration increases the number of passing tests on the same test set.",
        }),
        Object.freeze({
          key: "verificationCriteria",
          label: "Verification method",
          example: "Example: Run the target tests and regression suite, then compare the result with the previous best iteration.",
        }),
      ]);

      function buildPlaygroundTaskLoopGoalTemplate(value = null) {
        const source = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const newline = String.fromCharCode(10);
        return PLAYGROUND_TASK_LOOP_GOAL_SECTIONS.map((section) => {
          const sectionValue = String(source[section.key] || "").trim() || section.example;
          return "**" + section.label + "**" + newline + "- " + sectionValue;
        }).join(newline + newline);
      }

      function parsePlaygroundTaskLoopGoalMarkdown(value) {
        const newline = String.fromCharCode(10);
        const source = String(value || "").replaceAll(String.fromCharCode(13), "");
        const normalizedSource = source.toLowerCase();
        const parsed = {};
        PLAYGROUND_TASK_LOOP_GOAL_SECTIONS.forEach((section) => {
          const heading = ("**" + section.label + "**").toLowerCase();
          const headingIndex = normalizedSource.indexOf(heading);
          if (headingIndex === -1) return;
          const sectionStart = headingIndex + heading.length;
          let sectionEnd = source.length;
          PLAYGROUND_TASK_LOOP_GOAL_SECTIONS.forEach((candidate) => {
            if (candidate.key === section.key) return;
            const candidateHeading = ("**" + candidate.label + "**").toLowerCase();
            const candidateIndex = normalizedSource.indexOf(candidateHeading, sectionStart);
            if (candidateIndex !== -1 && candidateIndex < sectionEnd) {
              sectionEnd = candidateIndex;
            }
          });
          const sectionLines = source.slice(sectionStart, sectionEnd).split(newline);
          const isBullet = (line) => {
            const trimmed = String(line || "").trimStart();
            return (trimmed.startsWith("- ") || trimmed.startsWith("* ")) && trimmed.length > 2;
          };
          const bulletIndex = sectionLines.findIndex(isBullet);
          if (bulletIndex === -1) return;
          const firstLine = sectionLines[bulletIndex].trimStart().slice(2).trim();
          const continuation = [];
          for (let lineIndex = bulletIndex + 1; lineIndex < sectionLines.length; lineIndex += 1) {
            const line = sectionLines[lineIndex];
            if (!line.trim() || isBullet(line)) break;
            continuation.push(line.trim());
          }
          parsed[section.key] = [firstLine, ...continuation].filter(Boolean).join(" ").trim();
        });
        return parsed;
      }

      function isPlaygroundTaskLoopGoalTemplatePristine(value) {
        const normalize = (candidate) => String(candidate || "").replaceAll(String.fromCharCode(13), "").trim();
        return normalize(value) === normalize(buildPlaygroundTaskLoopGoalTemplate());
      }

      function hasPlaygroundTaskLoopGoalTemplateExamples(value) {
        const parsed = parsePlaygroundTaskLoopGoalMarkdown(value);
        return PLAYGROUND_TASK_LOOP_GOAL_SECTIONS.some((section) => (
          String(parsed[section.key] || "").trim() === section.example
        ));
      }

      function normalizePlaygroundTaskLoopConfig(value, task = null) {
        const source = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const boundedInteger = (candidate, fallback, maximum) => {
          const parsed = Number(candidate);
          return Number.isFinite(parsed) && parsed > 0
            ? Math.max(1, Math.min(maximum, Math.floor(parsed)))
            : fallback;
        };
        const boundedScore = (candidate, fallback = 0.85) => {
          const parsed = Number(candidate);
          if (!Number.isFinite(parsed)) return fallback;
          const normalized = parsed > 1 && parsed <= 100 ? parsed / 100 : parsed;
          return Math.max(0, Math.min(1, normalized));
        };
        const maxIterations = boundedInteger(source.maxIterations ?? source.max_iterations, 6, 50);
        const maxDurationMinutes = source.maxDurationMinutes
          ?? source.max_duration_minutes
          ?? (Number(source.maxDurationMs ?? source.max_duration_ms) / 60_000);
        return {
          enabled: source.enabled !== false,
          goal: String(source.goal || source.endGoal || task?.title || "").trim(),
          progressSignal: String(source.progressSignal || source.progress_signal || "").trim(),
          verificationCriteria: String(source.verificationCriteria || source.verification_criteria || "").trim(),
          successCriteria: String(source.successCriteria || source.success_criteria || task?.description || "").trim(),
          maxIterations,
          noProgressLimit: boundedInteger(source.noProgressLimit ?? source.no_progress_limit, 2, Math.min(maxIterations, 20)),
          minimumScore: boundedScore(source.minimumScore ?? source.minimum_score),
          maxDurationMinutes: boundedInteger(maxDurationMinutes, 60, 1440),
          regressionPolicy: source.regressionPolicy === "continue" || source.regression_policy === "continue"
            ? "continue"
            : "stop",
          workerAgentId: String(source.workerAgentId || source.worker_agent_id || "").trim() || null,
          verifierAgentId: String(source.verifierAgentId || source.verifier_agent_id || "").trim() || null,
        };
      }

      function getPlaygroundTaskLoopConfig(task) {
        if (normalizePlaygroundTaskType(task?.taskType || task?.type) !== "loop") {
          return null;
        }
        const runnerPlayground = getPlaygroundTaskRunnerMetadata(task);
        return normalizePlaygroundTaskLoopConfig(
          task?.loop || runnerPlayground?.loop,
          task,
        );
      }

      function buildPlaygroundTaskMetadata(task, overrides = {}) {
        const currentMetadata = task?.metadata && typeof task.metadata === "object" && !Array.isArray(task.metadata)
          ? { ...task.metadata }
          : {};
        const currentRunnerPlayground = currentMetadata.runnerPlayground && typeof currentMetadata.runnerPlayground === "object" && !Array.isArray(currentMetadata.runnerPlayground)
          ? { ...currentMetadata.runnerPlayground }
          : {};
        const nextRunnerPlayground = {
          ...currentRunnerPlayground,
        };

        if (Object.prototype.hasOwnProperty.call(overrides, "ticketNumber")) {
          const nextTicketNumber = normalizePlaygroundTaskTicketNumber(overrides.ticketNumber);
          if (nextTicketNumber) {
            nextRunnerPlayground.ticketNumber = nextTicketNumber;
          } else {
            delete nextRunnerPlayground.ticketNumber;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "taskType")) {
          const nextTaskType = normalizePlaygroundTaskType(overrides.taskType);
          if (nextTaskType === "subtask" || nextTaskType === "loop") {
            nextRunnerPlayground.taskType = nextTaskType;
          } else {
            delete nextRunnerPlayground.taskType;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "loop")) {
          const nextTaskType = normalizePlaygroundTaskType(
            Object.prototype.hasOwnProperty.call(overrides, "taskType")
              ? overrides.taskType
              : task?.taskType,
          );
          if (nextTaskType === "loop") {
            nextRunnerPlayground.loop = normalizePlaygroundTaskLoopConfig(overrides.loop, task);
          } else {
            delete nextRunnerPlayground.loop;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "parentTaskId")) {
          const nextParentTaskId = normalizePlaygroundParentTaskId(overrides.parentTaskId);
          if (nextParentTaskId) {
            nextRunnerPlayground.parentTaskId = nextParentTaskId;
          } else {
            delete nextRunnerPlayground.parentTaskId;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "environmentId")) {
          const nextEnvironmentId = typeof overrides.environmentId === "string" && overrides.environmentId.trim()
            ? overrides.environmentId.trim()
            : "";
          if (nextEnvironmentId) {
            nextRunnerPlayground.environmentId = nextEnvironmentId;
          } else {
            delete nextRunnerPlayground.environmentId;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "taskColor")) {
          const nextTaskColor = getPlaygroundTaskColorId(overrides.taskColor);
          if (nextTaskColor) {
            nextRunnerPlayground.taskColor = nextTaskColor;
          } else {
            delete nextRunnerPlayground.taskColor;
          }
        }

	        if (Object.prototype.hasOwnProperty.call(overrides, "assigneeAgentId")) {
	          const nextAssigneeAgentId = typeof overrides.assigneeAgentId === "string" && overrides.assigneeAgentId.trim()
	            ? overrides.assigneeAgentId.trim()
	            : "";
	          if (isPlaygroundHumanAssigneeId(nextAssigneeAgentId)) {
	            nextRunnerPlayground.assigneeActorId = nextAssigneeAgentId;
	            nextRunnerPlayground.assigneeActorKind = "human";
	            nextRunnerPlayground.assigneeName = "Me";
	          } else {
	            delete nextRunnerPlayground.assigneeActorId;
	            delete nextRunnerPlayground.assigneeActorKind;
	            delete nextRunnerPlayground.assigneeName;
	          }
	        }

	        if (Object.prototype.hasOwnProperty.call(overrides, "reviewRequired")) {
	          if (overrides.reviewRequired === true) {
	            nextRunnerPlayground.reviewRequired = true;
	          } else {
	            delete nextRunnerPlayground.reviewRequired;
	            delete nextRunnerPlayground.reviewerActorId;
	            delete nextRunnerPlayground.reviewerActorKind;
	            delete nextRunnerPlayground.reviewerName;
	          }
	        }

	        if (Object.prototype.hasOwnProperty.call(overrides, "reviewerAgentId")) {
	          const nextReviewerAgentId = typeof overrides.reviewerAgentId === "string" && overrides.reviewerAgentId.trim()
	            ? overrides.reviewerAgentId.trim()
	            : "";
	          if (nextReviewerAgentId) {
	            nextRunnerPlayground.reviewRequired = true;
	            nextRunnerPlayground.reviewerActorId = nextReviewerAgentId;
	            nextRunnerPlayground.reviewerActorKind = isPlaygroundHumanAssigneeId(nextReviewerAgentId) ? "human" : "agent";
	            nextRunnerPlayground.reviewerName = isPlaygroundHumanAssigneeId(nextReviewerAgentId) ? "Me" : "";
	            if (!nextRunnerPlayground.reviewerName) {
              delete nextRunnerPlayground.reviewerName;
	            }
	          } else if (overrides.reviewRequired !== true) {
	            delete nextRunnerPlayground.reviewRequired;
	            delete nextRunnerPlayground.reviewerActorId;
	            delete nextRunnerPlayground.reviewerActorKind;
	            delete nextRunnerPlayground.reviewerName;
	          }
	        }

        if (Object.keys(nextRunnerPlayground).length > 0) {
          currentMetadata.runnerPlayground = nextRunnerPlayground;
        } else {
          delete currentMetadata.runnerPlayground;
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "enabledSkills")) {
          const nextEnabledSkills = normalizePlaygroundEnabledSkillIds(overrides.enabledSkills);
          if (nextEnabledSkills.length > 0) {
            nextRunnerPlayground.enabledSkills = nextEnabledSkills;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.enabledSkills;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "attachments")) {
          const nextAttachments = normalizePlaygroundTaskAttachmentList(overrides.attachments);
          if (nextAttachments.length > 0) {
            nextRunnerPlayground.attachments = nextAttachments;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.attachments;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "connectors")) {
          const nextConnectors = normalizePlaygroundTaskConnectorSelections(overrides.connectors);
          if (hasPlaygroundTaskConnectorSelections(nextConnectors)) {
            nextRunnerPlayground.connectors = nextConnectors;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.connectors;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "comments")) {
          const nextComments = normalizePlaygroundTaskCommentList(overrides.comments);
          if (nextComments.length > 0) {
            nextRunnerPlayground.comments = nextComments;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.comments;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "activity")) {
          const nextActivity = normalizePlaygroundTaskActivityList(overrides.activity);
          if (nextActivity.length > 0) {
            nextRunnerPlayground.activity = nextActivity;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.activity;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "scheduleType")) {
          const nextScheduleType = overrides.scheduleType === "recurring" ? "recurring" : "one-time";
          if (nextScheduleType === "recurring") {
            nextRunnerPlayground.scheduleType = "recurring";
          } else {
            delete nextRunnerPlayground.scheduleType;
          }
          if (Object.keys(nextRunnerPlayground).length > 0) {
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete currentMetadata.runnerPlayground;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "cronExpression")) {
          const nextCronExpression = typeof overrides.cronExpression === "string" && overrides.cronExpression.trim()
            ? overrides.cronExpression.trim()
            : "";
          if (nextCronExpression) {
            nextRunnerPlayground.cronExpression = nextCronExpression;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.cronExpression;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "scheduleTimezone")) {
          const nextScheduleTimezone = typeof overrides.scheduleTimezone === "string" && overrides.scheduleTimezone.trim()
            ? overrides.scheduleTimezone.trim()
            : "";
          if (nextScheduleTimezone) {
            nextRunnerPlayground.scheduleTimezone = nextScheduleTimezone;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.scheduleTimezone;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "scheduleEnabled")) {
          if (overrides.scheduleEnabled === false) {
            nextRunnerPlayground.scheduleEnabled = false;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.scheduleEnabled;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (nextRunnerPlayground.taskType !== "subtask") {
          delete nextRunnerPlayground.parentTaskId;
        }

        if (nextRunnerPlayground.taskType !== "loop") {
          delete nextRunnerPlayground.loop;
        }

        return Object.keys(currentMetadata).length > 0 ? currentMetadata : null;
      }

      function syncPlaygroundTaskRecordMetadata(task) {
        if (!task || typeof task !== "object") {
          return task;
        }

        return {
          ...task,
          metadata: buildPlaygroundTaskMetadata(task, {
            ticketNumber: task.ticketNumber,
	            taskType: task.taskType,
	            loop: task.loop,
	            parentTaskId: task.parentTaskId,
	            assigneeAgentId: task.assigneeAgentId,
	            reviewRequired: task.reviewRequired,
	            reviewerAgentId: task.reviewerAgentId,
	            environmentId: task.environmentId,
            taskColor: task.taskColor,
            scheduleType: task.scheduleType,
            cronExpression: task.cronExpression,
            scheduleTimezone: task.scheduleTimezone,
            scheduleEnabled: task.scheduleEnabled,
            enabledSkills: task.enabledSkills,
            attachments: task.attachments,
            connectors: task.connectors,
          }),
        };
      }

      function comparePlaygroundTaskTicketOrder(left, right) {
        const leftCreatedAt = Date.parse(left?.createdAt || "") || 0;
        const rightCreatedAt = Date.parse(right?.createdAt || "") || 0;
        if (leftCreatedAt !== rightCreatedAt) {
          return leftCreatedAt - rightCreatedAt;
        }
        const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : 0;
        const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : 0;
        if (leftSortOrder !== rightSortOrder) {
          return leftSortOrder - rightSortOrder;
        }
        return String(left?.id || "").localeCompare(String(right?.id || ""));
      }

      function buildPlaygroundTaskTicketNumberMap(tasks, projectRecord = null) {
        const orderedTasks = (Array.isArray(tasks) ? tasks : [])
          .filter((task) => task?.id)
          .slice()
          .sort(comparePlaygroundTaskTicketOrder);
        const next = {};
        let explicitCount = 0;
        let highestTicketNumber = 0;

        orderedTasks.forEach((task) => {
          const ticketNumber = normalizePlaygroundTaskTicketNumber(task?.ticketNumber);
          if (!ticketNumber) return;
          next[task.id] = ticketNumber;
          explicitCount += 1;
          highestTicketNumber = Math.max(highestTicketNumber, parsePlaygroundTaskTicketNumber(ticketNumber));
        });

        let nextTicketNumber = explicitCount === 0 ? 0 : highestTicketNumber;
        orderedTasks.forEach((task) => {
          if (next[task.id]) return;
          nextTicketNumber += 1;
          next[task.id] = String(nextTicketNumber).padStart(3, "0");
        });

        if (projectRecord) {
          Object.keys(next).forEach((taskId) => {
            next[taskId] = formatPlaygroundProjectTicketNumber(projectRecord, next[taskId]) || next[taskId];
          });
        }

        return next;
      }

      function normalizePlaygroundTaskRecord(task) {
        if (!task || typeof task !== "object") {
          return buildPlaygroundDefaultTaskDraft();
        }

        const draft = buildPlaygroundDefaultTaskDraft();
        const runnerPlaygroundMetadata = getPlaygroundTaskRunnerMetadata(task);
        const directCreator = task.creator && typeof task.creator === "object" && !Array.isArray(task.creator)
          ? task.creator
          : {};
        const metadataCreator = runnerPlaygroundMetadata?.creator
          && typeof runnerPlaygroundMetadata.creator === "object"
          && !Array.isArray(runnerPlaygroundMetadata.creator)
          ? runnerPlaygroundMetadata.creator
          : {};
        const creatorAgentId = [
          directCreator.agentId,
          directCreator.agent_id,
          task.creatorAgentId,
          task.creator_agent_id,
          task.createdByAgentId,
          task.created_by_agent_id,
          metadataCreator.agentId,
          metadataCreator.agent_id,
        ].map((value) => String(value || "").trim()).find(Boolean) || null;
        const creatorUserId = [
          directCreator.userId,
          directCreator.user_id,
          task.createdByUserId,
          task.created_by_user_id,
          metadataCreator.userId,
          metadataCreator.user_id,
          task.userId,
          task.user_id,
        ].map((value) => String(value || "").trim()).find(Boolean) || null;
        const creatorName = [
          directCreator.name,
          directCreator.displayName,
          task.creatorName,
          task.creator_name,
          metadataCreator.name,
          metadataCreator.displayName,
        ].map((value) => String(value || "").trim()).find(Boolean) || null;
        const creatorAvatarUrl = [
          directCreator.avatarUrl,
          directCreator.avatar_url,
          directCreator.photoUrl,
          directCreator.photoURL,
          task.creatorAvatarUrl,
          task.creator_avatar_url,
          metadataCreator.avatarUrl,
          metadataCreator.avatar_url,
          metadataCreator.photoUrl,
          metadataCreator.photoURL,
        ].map((value) => String(value || "").trim()).find(Boolean) || null;
        const creator = creatorAgentId || creatorUserId
          ? {
              type: creatorAgentId ? "agent" : "user",
              userId: creatorUserId,
              agentId: creatorAgentId,
              name: creatorName,
              avatarUrl: creatorAvatarUrl,
            }
          : null;
        const normalizedLinkedThreadIds = normalizePlaygroundIdList(task.linkedThreadIds || task.linked_thread_ids);
        const normalizedLastStartedThreadId =
          typeof task.lastStartedThreadId === "string" && task.lastStartedThreadId.trim()
            ? task.lastStartedThreadId.trim()
            : typeof task.last_started_thread_id === "string" && task.last_started_thread_id.trim()
              ? task.last_started_thread_id.trim()
              : null;
        const directAssigneeAgentId = typeof task.assigneeAgentId === "string" && task.assigneeAgentId.trim()
          ? task.assigneeAgentId.trim()
          : null;
        const metadataAssigneeActorId = typeof runnerPlaygroundMetadata?.assigneeActorId === "string" && runnerPlaygroundMetadata.assigneeActorId.trim()
          ? runnerPlaygroundMetadata.assigneeActorId.trim()
          : null;
	        const normalizedAssigneeAgentId = directAssigneeAgentId
	          || (isPlaygroundHumanAssigneeId(metadataAssigneeActorId) ? metadataAssigneeActorId : null);
        const directReviewerAgentId = typeof task.reviewerAgentId === "string" && task.reviewerAgentId.trim()
          ? task.reviewerAgentId.trim()
          : typeof task.reviewer_agent_id === "string" && task.reviewer_agent_id.trim()
            ? task.reviewer_agent_id.trim()
          : typeof task.reviewerActorId === "string" && task.reviewerActorId.trim()
            ? task.reviewerActorId.trim()
            : typeof task.reviewer_actor_id === "string" && task.reviewer_actor_id.trim()
              ? task.reviewer_actor_id.trim()
            : task.review?.reviewerActorId && typeof task.review.reviewerActorId === "string" && task.review.reviewerActorId.trim()
              ? task.review.reviewerActorId.trim()
              : null;
	        const metadataReviewerActorId = typeof runnerPlaygroundMetadata?.reviewerActorId === "string" && runnerPlaygroundMetadata.reviewerActorId.trim()
	          ? runnerPlaygroundMetadata.reviewerActorId.trim()
	          : null;
	        const normalizedReviewerAgentId = directReviewerAgentId || metadataReviewerActorId;
        const reviewRequired = task.reviewRequired === true
          || task.review_required === true
          || task.review?.reviewRequired === true
          || task.review?.review_required === true
          || runnerPlaygroundMetadata?.reviewRequired === true
          || Boolean(normalizedReviewerAgentId);
	        const normalizedDependencyIds = normalizePlaygroundIdList(
          Array.isArray(task.dependencyIds)
            ? task.dependencyIds
            : (Array.isArray(runnerPlaygroundMetadata?.dependencyIds) ? runnerPlaygroundMetadata.dependencyIds : [])
        );
        const rawStatus = PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === task.status)
          ? task.status
          : draft.status;
        const baseStatus = rawStatus === "in_progress"
          && !isPlaygroundHumanAssigneeId(normalizedAssigneeAgentId)
          && !normalizedLastStartedThreadId
          && normalizedLinkedThreadIds.length === 0
          ? "todo"
          : rawStatus;
        const status = normalizedDependencyIds.length > 0 && !isPlaygroundTaskTerminalStatus(baseStatus)
          ? "blocked"
          : baseStatus;
        const priority = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === task.priority) ? task.priority : draft.priority;
        const normalizeTaskTimestamp = (value, fallback) => {
          if (typeof value === "number" && Number.isFinite(value) && value > 0) {
            const timestamp = value < 100000000000 ? value * 1000 : value;
            return new Date(timestamp).toISOString();
          }
          if (value && typeof value === "object" && !Array.isArray(value)) {
            const seconds = Number(value.seconds ?? value._seconds ?? value.epochSeconds);
            if (Number.isFinite(seconds) && seconds > 0) {
              return new Date(seconds * 1000).toISOString();
            }
          }
          const normalized = String(value || "").trim();
          return normalized || fallback;
        };
        const createdAt = normalizeTaskTimestamp(task.createdAt, draft.createdAt);
        const updatedAt = normalizeTaskTimestamp(task.updatedAt, createdAt);
        const ticketNumber = normalizePlaygroundTaskTicketNumber(task.ticketNumber || runnerPlaygroundMetadata?.ticketNumber);
        const normalizedParentTaskId = normalizePlaygroundParentTaskId(task.parentTaskId || runnerPlaygroundMetadata?.parentTaskId);
        const taskType = normalizePlaygroundTaskType(
          task.taskType
          || (["task", "subtask", "loop"].includes(String(task.type || "").trim().toLowerCase()) ? task.type : "")
          || runnerPlaygroundMetadata?.taskType
        );
        const parentTaskId = taskType === "subtask" && normalizedParentTaskId
          ? normalizedParentTaskId
          : null;
        const loop = taskType === "loop"
          ? normalizePlaygroundTaskLoopConfig(task.loop || runnerPlaygroundMetadata?.loop, task)
          : null;
        const environmentId = typeof task.environmentId === "string" && task.environmentId.trim()
          ? task.environmentId.trim()
          : typeof runnerPlaygroundMetadata?.environmentId === "string" && runnerPlaygroundMetadata.environmentId.trim()
            ? runnerPlaygroundMetadata.environmentId.trim()
            : null;
        const rawTaskScheduleType = typeof task.scheduleType === "string" && task.scheduleType.trim()
          ? task.scheduleType.trim().toLowerCase()
          : typeof runnerPlaygroundMetadata?.scheduleType === "string" && runnerPlaygroundMetadata.scheduleType.trim()
            ? runnerPlaygroundMetadata.scheduleType.trim().toLowerCase()
            : "";
        const taskCronExpression = typeof task.cronExpression === "string" && task.cronExpression.trim()
          ? task.cronExpression.trim()
          : typeof runnerPlaygroundMetadata?.cronExpression === "string" && runnerPlaygroundMetadata.cronExpression.trim()
            ? runnerPlaygroundMetadata.cronExpression.trim()
            : null;
        const taskScheduleType = rawTaskScheduleType === "recurring" || taskCronExpression
          ? "recurring"
          : "one-time";
        const taskScheduleTimezone = typeof task.scheduleTimezone === "string" && task.scheduleTimezone.trim()
          ? task.scheduleTimezone.trim()
          : typeof runnerPlaygroundMetadata?.scheduleTimezone === "string" && runnerPlaygroundMetadata.scheduleTimezone.trim()
            ? runnerPlaygroundMetadata.scheduleTimezone.trim()
            : draft.scheduleTimezone;
        const taskScheduleEnabled = task.scheduleEnabled === false
          ? false
          : runnerPlaygroundMetadata?.scheduleEnabled === false
            ? false
            : true;
        const taskColor = getPlaygroundTaskColorId(task.taskColor || runnerPlaygroundMetadata?.taskColor);
        const directEnabledSkills = normalizePlaygroundEnabledSkillIds(task.enabledSkills);
        const metadataEnabledSkills = normalizePlaygroundEnabledSkillIds(runnerPlaygroundMetadata?.enabledSkills);
        const enabledSkills = directEnabledSkills.length > 0
          ? directEnabledSkills
          : metadataEnabledSkills;
        const directAttachments = normalizePlaygroundTaskAttachmentList(task.attachments);
        const metadataAttachments = normalizePlaygroundTaskAttachmentList(runnerPlaygroundMetadata?.attachments);
        const attachments = directAttachments.length > 0
          ? directAttachments
          : metadataAttachments;
        const directConnectors = normalizePlaygroundTaskConnectorSelections(task.connectors);
        const metadataConnectors = normalizePlaygroundTaskConnectorSelections(runnerPlaygroundMetadata?.connectors);
        const connectors = hasPlaygroundTaskConnectorSelections(directConnectors)
          ? directConnectors
          : metadataConnectors;
        const directComments = normalizePlaygroundTaskCommentList(task.comments);
        const metadataComments = normalizePlaygroundTaskCommentList(runnerPlaygroundMetadata?.comments);
        const hasDirectComments = Object.prototype.hasOwnProperty.call(task, "comments")
          && Array.isArray(task.comments);
        const comments = hasDirectComments
          ? directComments
          : metadataComments;
        const directActivity = normalizePlaygroundTaskActivityList(task.activity);
        const metadataActivity = normalizePlaygroundTaskActivityList(runnerPlaygroundMetadata?.activity);
        const hasDirectActivity = Object.prototype.hasOwnProperty.call(task, "activity")
          && Array.isArray(task.activity);
        const activity = hasDirectActivity
          ? directActivity
          : metadataActivity;

        return {
          ...draft,
          ...task,
          id: typeof task.id === "string" ? task.id : draft.id,
          createdByUserId: creatorUserId,
          creator,
          projectId: typeof task.projectId === "string" && task.projectId.trim() ? task.projectId.trim() : null,
          releaseId: typeof task.releaseId === "string" && task.releaseId.trim() ? task.releaseId.trim() : null,
          ticketNumber,
          taskType,
          loop,
          parentTaskId,
          title: typeof task.title === "string" && task.title.trim() ? task.title.trim() : draft.title,
          description: resolvePlaygroundTaskDescription(task) || draft.description,
          taskColor,
          status,
          priority,
	          sprintId: typeof task.sprintId === "string" && task.sprintId.trim() ? task.sprintId.trim() : null,
	          assigneeAgentId: normalizedAssigneeAgentId,
	          reviewRequired,
	          reviewerAgentId: reviewRequired ? normalizedReviewerAgentId : null,
	          environmentId,
          attachments,
          enabledSkills,
          connectors,
          comments,
          activity,
          dependencyIds: normalizedDependencyIds,
          linkedThreadIds: normalizedLinkedThreadIds,
          lastStartedThreadId: normalizedLastStartedThreadId,
          scheduledStartAt: typeof task.scheduledStartAt === "string" && task.scheduledStartAt ? task.scheduledStartAt : null,
          scheduledEndAt: typeof task.scheduledEndAt === "string" && task.scheduledEndAt ? task.scheduledEndAt : null,
          scheduleType: taskScheduleType,
          cronExpression: taskCronExpression,
          scheduleTimezone: taskScheduleTimezone,
          scheduleEnabled: taskScheduleEnabled,
          dueAt: typeof task.dueAt === "string" && task.dueAt ? task.dueAt : null,
          completedAt: typeof task.completedAt === "string" && task.completedAt
            ? task.completedAt
            : (isPlaygroundTaskTerminalStatus(status) ? updatedAt : null),
          sortOrder: Number.isFinite(task.sortOrder) ? Number(task.sortOrder) : draft.sortOrder,
          metadata: task.metadata && typeof task.metadata === "object" && !Array.isArray(task.metadata) ? task.metadata : null,
          createdAt,
          updatedAt,
        };
      }

      function normalizePlaygroundTaskSprintRecord(sprint) {
        if (!sprint || typeof sprint !== "object") {
          return buildPlaygroundDefaultSprintDraft();
        }

        const draft = buildPlaygroundDefaultSprintDraft();
        const status = ["planned", "active", "completed"].includes(sprint.status) ? sprint.status : draft.status;
        const createdAt = typeof sprint.createdAt === "string" && sprint.createdAt ? sprint.createdAt : draft.createdAt;
        const updatedAt = typeof sprint.updatedAt === "string" && sprint.updatedAt ? sprint.updatedAt : createdAt;

        return {
          ...draft,
          ...sprint,
          id: typeof sprint.id === "string" ? sprint.id : draft.id,
          projectId: typeof sprint.projectId === "string" && sprint.projectId.trim() ? sprint.projectId.trim() : null,
          name: typeof sprint.name === "string" ? sprint.name : draft.name,
          goal: typeof sprint.goal === "string" ? sprint.goal : draft.goal,
          status,
          startAt: typeof sprint.startAt === "string" && sprint.startAt ? sprint.startAt : null,
          endAt: typeof sprint.endAt === "string" && sprint.endAt ? sprint.endAt : null,
          sortOrder: Number.isFinite(sprint.sortOrder) ? Number(sprint.sortOrder) : draft.sortOrder,
          metadata: sprint.metadata && typeof sprint.metadata === "object" && !Array.isArray(sprint.metadata) ? sprint.metadata : null,
          createdAt,
          updatedAt,
        };
      }

      function getPlaygroundTaskReleaseStatus(release) {
        if (!release || typeof release !== "object") {
          return "planned";
        }

        if (typeof release.status === "string" && release.status.trim()) {
          return release.status.trim();
        }

        const nowMs = Date.now();
        const startAtMs = release.startAt ? Date.parse(release.startAt) : null;
        const endAtMs = release.endAt ? Date.parse(release.endAt) : null;

        if (Number.isFinite(endAtMs) && endAtMs < nowMs) {
          return "completed";
        }
        if (Number.isFinite(startAtMs) && startAtMs > nowMs) {
          return "planned";
        }
        return "active";
      }

      function formatPlaygroundTaskReleaseDateRange(release) {
        const startDate = release?.startAt ? new Date(release.startAt) : null;
        const endDate = release?.endAt ? new Date(release.endAt) : null;
        const startLabel = startDate && !Number.isNaN(startDate.getTime()) ? format(startDate, "MMM d, yyyy") : "";
        const endLabel = endDate && !Number.isNaN(endDate.getTime()) ? format(endDate, "MMM d, yyyy") : "";
        if (startLabel && endLabel) {
          const startMs = startDate ? startDate.getTime() : NaN;
          const endMs = endDate ? endDate.getTime() : NaN;
          const orderedLabels = Number.isFinite(startMs) && Number.isFinite(endMs) && startMs > endMs
            ? [endLabel, startLabel]
            : [startLabel, endLabel];
          if (orderedLabels[0] === orderedLabels[1]) {
            return orderedLabels[0];
          }
          return orderedLabels[0] + " - " + orderedLabels[1];
        }
        if (startLabel) {
          return "Starts " + startLabel;
        }
        if (endLabel) {
          return "Ends " + endLabel;
        }
        return "No dates";
      }

      function getPlaygroundTaskReleaseDeadlineLabel(release) {
        if (!release) {
          return "No deadlines";
        }
        const dateRangeLabel = formatPlaygroundTaskReleaseDateRange(release);
        return dateRangeLabel === "No dates" ? "No deadlines" : dateRangeLabel;
      }

      function normalizePlaygroundTaskReleaseRecord(release) {
        if (!release || typeof release !== "object") {
          return buildPlaygroundDefaultReleaseDraft();
        }

        const draft = buildPlaygroundDefaultReleaseDraft();
        const createdAt = typeof release.createdAt === "string" && release.createdAt ? release.createdAt : draft.createdAt;
        const updatedAt = typeof release.updatedAt === "string" && release.updatedAt ? release.updatedAt : createdAt;
        const metadata = release.metadata && typeof release.metadata === "object" && !Array.isArray(release.metadata)
          ? release.metadata
          : null;
        const successCriteria = normalizePlaygroundStrategyTextList(
          release.successCriteria
          ?? release.success_criteria
          ?? metadata?.successCriteria
          ?? metadata?.success_criteria
          ?? metadata?.outcomeSuccessCriteria
        );

        return {
          ...draft,
          ...release,
          id: typeof release.id === "string" ? release.id : draft.id,
          projectId: typeof release.projectId === "string" && release.projectId.trim() ? release.projectId.trim() : null,
          name: typeof release.name === "string" ? release.name : draft.name,
          description: typeof release.description === "string" ? release.description : draft.description,
          successCriteria,
          successCriteriaInput: serializePlaygroundMilestoneSuccessCriteria(successCriteria),
          startAt: typeof release.startAt === "string" && release.startAt ? release.startAt : null,
          endAt: typeof release.endAt === "string" && release.endAt ? release.endAt : null,
          sortOrder: Number.isFinite(release.sortOrder) ? Number(release.sortOrder) : draft.sortOrder,
          metadata,
          taskCount: Number.isFinite(release.taskCount) ? Number(release.taskCount) : 0,
          openTaskCount: Number.isFinite(release.openTaskCount) ? Number(release.openTaskCount) : 0,
          taskIds: normalizePlaygroundIdList(release.taskIds),
          status: getPlaygroundTaskReleaseStatus(release),
          createdAt,
          updatedAt,
        };
      }

      function normalizePlaygroundProjectRecord(project) {
        if (!project || typeof project !== "object") {
          return buildPlaygroundDefaultProjectDraft();
        }

        const draft = buildPlaygroundDefaultProjectDraft();
        const createdAt = typeof project.createdAt === "string" && project.createdAt ? project.createdAt : draft.createdAt;
        const updatedAt = typeof project.updatedAt === "string" && project.updatedAt ? project.updatedAt : createdAt;
        const summary = project.summary && typeof project.summary === "object" && !Array.isArray(project.summary)
          ? project.summary
          : {};
        const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : null;
        const projectBlueprint = getPlaygroundProjectBlueprint(
          project.projectType
          || project.type
          || metadata?.projectType
          || metadata?.type
          || metadata?.blueprintId
        );
        const hasExplicitIcon = hasPlaygroundExplicitProjectIcon(project);
        const icon = getPlaygroundProjectIconId(metadata?.icon || project.icon || projectBlueprint.iconId);
        const wallpaperId = getPlaygroundProjectWallpaperId(project.wallpaperId || metadata?.wallpaperId || projectBlueprint.wallpaperId, "");
        const useCardBackgroundAsWallpaper = getPlaygroundProjectUseCardBackgroundAsWallpaper(
          project.useCardBackgroundAsWallpaper,
          metadata?.useCardBackgroundAsWallpaper
        );
        const directAttachments = normalizePlaygroundTaskAttachmentList(project.attachments);
        const metadataAttachments = normalizePlaygroundTaskAttachmentList(metadata?.attachments);
        const attachments = directAttachments.length > 0
          ? directAttachments
          : metadataAttachments;
        const directConnectors = normalizePlaygroundTaskConnectorSelections(project.connectors);
        const metadataConnectors = normalizePlaygroundTaskConnectorSelections(metadata?.connectors);
        const connectors = hasPlaygroundTaskConnectorSelections(directConnectors)
          ? directConnectors
          : metadataConnectors;
        const missionControl = getPlaygroundProjectMissionControlRecord(project);
        const directProjectName = typeof project.name === "string" ? project.name.trim() : "";
        const metadataProjectName = typeof metadata?.name === "string" ? metadata.name.trim() : "";
        const isPlaceholderProjectName = (value) => {
          const normalized = String(value || "").trim().replace(/\\s+/g, " ").toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project";
        };
        const resolvedProjectName = directProjectName && (!isPlaceholderProjectName(directProjectName) || !metadataProjectName || isPlaceholderProjectName(metadataProjectName))
          ? project.name
          : (metadataProjectName || (typeof project.name === "string" ? project.name : draft.name));
        const metadataDescription = typeof metadata?.description === "string" ? metadata.description : "";
	        const resolvedProjectDescription = typeof project.description === "string" && (project.description.trim() || !metadataDescription)
	          ? project.description
	          : (metadataDescription || (typeof project.description === "string" ? project.description : draft.description));
        const projectRules = getPlaygroundProjectRules(project);
        const normalizedProjectStatus = normalizePlaygroundProjectStatus(
          project.status || metadata?.status || project.state || "backlog"
        );
        const normalizedProjectPriority = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === String(project.priority || metadata?.priority || "").trim().toLowerCase())
          ? String(project.priority || metadata?.priority || "").trim().toLowerCase()
          : "medium";
        const metadataLead = metadata?.lead && typeof metadata.lead === "object" && !Array.isArray(metadata.lead)
          ? metadata.lead
          : {};
        const leadUserId = String(project.leadUserId || metadata?.leadUserId || metadataLead.userId || metadataLead.id || "").trim();
	        const leadName = String(project.leadName || metadata?.leadName || metadataLead.name || "").trim();
	        const leadEmail = String(project.leadEmail || metadata?.leadEmail || metadataLead.email || "").trim();
	        const leadAvatarUrl = String(project.leadAvatarUrl || metadata?.leadAvatarUrl || metadataLead.avatarUrl || metadataLead.photoUrl || "").trim();
        const metadataOwner = metadata?.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
          ? metadata.owner
          : {};
        const ownerUserId = String(
          project.ownerUserId
            || project.userId
            || metadata?.ownerUserId
            || metadataOwner.userId
            || metadataOwner.id
            || ""
        ).trim();
        const ownerName = String(
          project.ownerName
            || metadata?.ownerName
            || metadataOwner.name
            || metadataOwner.displayName
            || ""
        ).trim();
        const ownerEmail = String(
          project.ownerEmail
            || metadata?.ownerEmail
            || metadataOwner.email
            || ""
        ).trim();
        const ownerAvatarUrl = String(
          project.ownerAvatarUrl
            || metadata?.ownerAvatarUrl
            || metadataOwner.avatarUrl
            || metadataOwner.photoUrl
            || ""
        ).trim();
	        const projectPermissionSet = normalizePlaygroundPermissionSet(project.permissionSet || metadata?.permissionSet, "project");

		        return {
		          ...draft,
	          ...project,
          id: typeof project.id === "string" ? project.id : draft.id,
          name: resolvedProjectName,
          description: resolvedProjectDescription,
          projectType: projectBlueprint.id,
          type: projectBlueprint.id,
          icon,
          __projectIconExplicit: hasExplicitIcon,
          wallpaperId,
          useCardBackgroundAsWallpaper,
	          color: typeof project.color === "string" && project.color.trim()
	            ? project.color.trim()
	            : (typeof metadata?.color === "string" && metadata.color.trim() ? metadata.color.trim() : projectBlueprint.color),
	          status: normalizedProjectStatus,
	          priority: normalizedProjectPriority,
          defaultEnvironmentId: typeof project.defaultEnvironmentId === "string" && project.defaultEnvironmentId.trim()
            ? project.defaultEnvironmentId.trim()
            : typeof metadata?.defaultEnvironmentId === "string" && metadata.defaultEnvironmentId.trim()
              ? metadata.defaultEnvironmentId.trim()
            : null,
	          attachments,
	          connectors,
	          projectRules,
	          missionControl,
          leadUserId,
          leadName,
	          leadEmail,
	          leadAvatarUrl,
          ownerUserId,
          ownerName,
          ownerEmail,
          ownerAvatarUrl,
          owner: {
            userId: ownerUserId,
            name: ownerName,
            email: ownerEmail,
            avatarUrl: ownerAvatarUrl,
          },
	          permissionSet: projectPermissionSet,
			          metadata: {
			            ...(metadata && typeof metadata === "object" ? metadata : {}),
			            ...buildPlaygroundProjectBlueprintMetadata(projectBlueprint),
	            status: normalizedProjectStatus,
	            priority: normalizedProjectPriority,
            leadUserId,
            leadName,
            leadEmail,
            leadAvatarUrl,
            lead: {
              userId: leadUserId,
	              name: leadName,
	              email: leadEmail,
	              avatarUrl: leadAvatarUrl,
	            },
            ownerUserId,
            ownerName,
            ownerEmail,
            ownerAvatarUrl,
            owner: {
              userId: ownerUserId,
              name: ownerName,
              email: ownerEmail,
              avatarUrl: ownerAvatarUrl,
            },
	            permissionSet: projectPermissionSet,
		          },
          summary: {
            ...buildEmptyPlaygroundProjectSummary(),
            environmentsCount: Number(summary.environmentsCount) || 0,
            threadsCount: Number(summary.threadsCount) || 0,
            activeThreadsCount: Number(summary.activeThreadsCount) || 0,
            tasksCount: Number(summary.tasksCount) || 0,
            openTasksCount: Number(summary.openTasksCount) || 0,
            releaseCount: Number(summary.releaseCount) || 0,
            activeReleaseCount: Number(summary.activeReleaseCount) || 0,
            sprintCount: Number(summary.sprintCount) || 0,
            activeSprintCount: Number(summary.activeSprintCount) || 0,
          },
          createdAt,
          updatedAt,
        };
      }

\${CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT}
      function parsePlaygroundTaskListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.tasks)
            ? data.tasks
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items.map(normalizePlaygroundTaskRecord);
      }

      function getPlaygroundTaskResponseRecord(data) {
        const source = data?.task || data?.data || data;
        const readActivityRecords = (value) => {
          if (Array.isArray(value)) {
            return value;
          }
          if (value && typeof value === "object" && Array.isArray(value.data)) {
            return value.data;
          }
          if (value && typeof value === "object" && Array.isArray(value.items)) {
            return value.items;
          }
          return [];
        };
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskRecord({
              ...source,
              comments: Array.isArray(data?.comments)
                ? data.comments
                : source.comments,
              activity: normalizePlaygroundTaskActivityList([
                ...readActivityRecords(source.activity),
                ...readActivityRecords(source.activityEvents),
                ...readActivityRecords(source.activity_events),
                ...readActivityRecords(data?.activity),
                ...readActivityRecords(data?.activityEvents),
                ...readActivityRecords(data?.activity_events),
                ...readActivityRecords(data?.details?.activity),
                ...readActivityRecords(data?.details?.activityEvents),
                ...readActivityRecords(data?.details?.activity_events),
              ]),
            })
          : null;
      }

      function getPlaygroundTaskCommentResponseRecord(data) {
        const source = data?.comment || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskCommentRecord(source)
          : null;
      }

      function parsePlaygroundTaskSprintListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.sprints)
            ? data.sprints
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items.map(normalizePlaygroundTaskSprintRecord);
      }

      function getPlaygroundTaskSprintResponseRecord(data) {
        const source = data?.sprint || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskSprintRecord(source)
          : null;
      }

      function parsePlaygroundTaskReleaseListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.releases)
            ? data.releases
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items.map(normalizePlaygroundTaskReleaseRecord);
      }

      function getPlaygroundTaskReleaseResponseRecord(data) {
        const source = data?.release || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskReleaseRecord(source)
          : null;
      }

      function isVisiblePlaygroundProjectListRecord(project) {
        if (!project || typeof project !== "object") {
          return false;
        }
        if (typeof project.id !== "string" || !project.id.trim()) {
          return false;
        }

        const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : null;
        const summary = project.summary && typeof project.summary === "object" && !Array.isArray(project.summary)
          ? project.summary
          : {};
        const missionControl = project.missionControl && typeof project.missionControl === "object" && !Array.isArray(project.missionControl)
          ? project.missionControl
          : (metadata?.missionControl && typeof metadata.missionControl === "object" && !Array.isArray(metadata.missionControl)
            ? metadata.missionControl
            : null);
        const hasSummaryActivity = [
          summary.environmentsCount,
          summary.threadsCount,
          summary.activeThreadsCount,
          summary.tasksCount,
          summary.openTasksCount,
          summary.releaseCount,
          summary.activeReleaseCount,
          summary.sprintCount,
          summary.activeSprintCount,
        ].some((value) => Number(value) > 0);
        const isPlaceholderProjectName = (value) => {
          const normalized = String(value || "").trim().replace(/\\s+/g, " ").toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project" || normalized === "new project";
        };
        const projectName = String(project.name || metadata?.name || "").trim();

        return Boolean(
          (projectName && !isPlaceholderProjectName(projectName))
          || String(project.description || metadata?.description || "").trim()
          || String(project.defaultEnvironmentId || metadata?.defaultEnvironmentId || "").trim()
          || normalizePlaygroundTaskAttachmentList(project.attachments || metadata?.attachments).length > 0
          || String(project.projectRules || metadata?.projectRules || "").trim()
          || String(missionControl?.summary || "").trim()
          || String(missionControl?.document || "").trim()
          || String(missionControl?.instructions || "").trim()
          || hasSummaryActivity
        );
      }

      function parsePlaygroundProjectListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.projects)
            ? data.projects
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items
          .filter(isVisiblePlaygroundProjectListRecord)
          .map(normalizePlaygroundProjectRecord);
      }

      function sortPlaygroundProjectsByRecent(projectList) {
        const items = Array.isArray(projectList) ? projectList.slice() : [];
        return items.sort((left, right) => {
          const updatedOrder = String(right?.updatedAt || right?.createdAt || "").localeCompare(String(left?.updatedAt || left?.createdAt || ""));
          if (updatedOrder !== 0) {
            return updatedOrder;
          }
          return String(left?.name || "").localeCompare(String(right?.name || ""));
        });
      }

      function mergePlaygroundProjectRecords(primaryProject, fallbackProject) {
        const hasOwnProjectField = (project, field) =>
          Boolean(project && typeof project === "object" && Object.prototype.hasOwnProperty.call(project, field));
        const normalizeProjectNameForMerge = (value) => String(value || "").trim().replace(/\\s+/g, " ");
        const isPlaceholderProjectNameForMerge = (value) => {
          const normalized = normalizeProjectNameForMerge(value).toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project";
        };
        const normalizedPrimary = primaryProject && typeof primaryProject === "object"
          ? normalizePlaygroundProjectRecord(primaryProject)
          : null;
        const normalizedFallback = fallbackProject && typeof fallbackProject === "object"
          ? normalizePlaygroundProjectRecord(fallbackProject)
          : null;

        if (!normalizedPrimary && !normalizedFallback) {
          return null;
        }
        if (!normalizedPrimary) {
          return normalizedFallback;
        }
        if (!normalizedFallback) {
          return normalizedPrimary;
        }

        const rawPrimaryMetadata = primaryProject?.metadata && typeof primaryProject.metadata === "object" && !Array.isArray(primaryProject.metadata)
          ? primaryProject.metadata
          : {};
        const rawFallbackMetadata = fallbackProject?.metadata && typeof fallbackProject.metadata === "object" && !Array.isArray(fallbackProject.metadata)
          ? fallbackProject.metadata
          : {};
        const primaryHasName = hasOwnProjectField(primaryProject, "name") || hasOwnProjectField(rawPrimaryMetadata, "name");
        const fallbackHasName = hasOwnProjectField(fallbackProject, "name") || hasOwnProjectField(rawFallbackMetadata, "name");
        const primaryHasDescription = hasOwnProjectField(primaryProject, "description")
          || hasOwnProjectField(rawPrimaryMetadata, "description");
        const primaryHasColor = hasOwnProjectField(primaryProject, "color");
        const primaryHasDefaultEnvironment = hasOwnProjectField(primaryProject, "defaultEnvironmentId")
          || hasOwnProjectField(rawPrimaryMetadata, "defaultEnvironmentId");
        const primaryHasAttachments = hasOwnProjectField(primaryProject, "attachments")
          || hasOwnProjectField(rawPrimaryMetadata, "attachments");
	        const primaryHasConnectors = hasOwnProjectField(primaryProject, "connectors")
	          || hasOwnProjectField(rawPrimaryMetadata, "connectors");
	        const primaryHasProjectRules = hasOwnProjectField(primaryProject, "projectRules")
	          || hasOwnProjectField(rawPrimaryMetadata, "projectRules");
	        const primaryHasMissionControl = hasOwnProjectField(primaryProject, "missionControl")
	          || hasOwnProjectField(rawPrimaryMetadata, "missionControl");
	        const primaryHasPermissionSet = hasOwnProjectField(primaryProject, "permissionSet")
	          || hasOwnProjectField(rawPrimaryMetadata, "permissionSet");
	        const primaryHasWallpaper = hasOwnProjectField(primaryProject, "wallpaperId")
          || hasOwnProjectField(rawPrimaryMetadata, "wallpaperId");
        const primaryHasIcon = hasPlaygroundExplicitProjectIcon(primaryProject);
        const fallbackHasIcon = hasPlaygroundExplicitProjectIcon(fallbackProject);
        const primaryHasUseCardBackgroundAsWallpaper = hasOwnProjectField(primaryProject, "useCardBackgroundAsWallpaper")
          || hasOwnProjectField(rawPrimaryMetadata, "useCardBackgroundAsWallpaper");
        const primaryHasProjectType = hasOwnProjectField(primaryProject, "projectType")
          || hasOwnProjectField(primaryProject, "type")
          || hasOwnProjectField(rawPrimaryMetadata, "projectType")
          || hasOwnProjectField(rawPrimaryMetadata, "type")
          || hasOwnProjectField(rawPrimaryMetadata, "blueprintId");
        const primaryName = normalizeProjectNameForMerge(primaryHasName ? normalizedPrimary.name : "");
        const fallbackName = normalizeProjectNameForMerge(fallbackHasName ? normalizedFallback.name : "");
        const mergedName = primaryHasName && (!isPlaceholderProjectNameForMerge(primaryName) || isPlaceholderProjectNameForMerge(fallbackName))
          ? normalizedPrimary.name
          : normalizedFallback.name;
        const mergedDescription = primaryHasDescription
          ? normalizedPrimary.description
          : normalizedFallback.description;
        const mergedColor = primaryHasColor ? normalizedPrimary.color : normalizedFallback.color;
        const mergedDefaultEnvironmentId = primaryHasDefaultEnvironment
          ? normalizedPrimary.defaultEnvironmentId
          : normalizedFallback.defaultEnvironmentId;
	        const mergedAttachments = primaryHasAttachments ? normalizedPrimary.attachments : normalizedFallback.attachments;
	        const mergedConnectors = primaryHasConnectors ? normalizedPrimary.connectors : normalizedFallback.connectors;
		        const mergedProjectRules = primaryHasProjectRules ? normalizedPrimary.projectRules : normalizedFallback.projectRules;
		        const mergedPermissionSet = primaryHasPermissionSet ? normalizedPrimary.permissionSet : normalizedFallback.permissionSet;
		        const primaryMissionControlIsMeaningful = hasMeaningfulPlaygroundProjectMissionControlRecord(normalizedPrimary.missionControl);
	        const fallbackMissionControlIsMeaningful = hasMeaningfulPlaygroundProjectMissionControlRecord(normalizedFallback.missionControl);
	        const mergedMissionControl = primaryHasMissionControl
	          ? (primaryMissionControlIsMeaningful || !fallbackMissionControlIsMeaningful
	              ? normalizedPrimary.missionControl
	              : normalizedFallback.missionControl)
	          : normalizedFallback.missionControl;
        const fallbackMetadata = normalizedFallback.metadata && typeof normalizedFallback.metadata === "object" && !Array.isArray(normalizedFallback.metadata)
          ? normalizedFallback.metadata
          : {};
        const primaryMetadata = normalizedPrimary.metadata && typeof normalizedPrimary.metadata === "object" && !Array.isArray(normalizedPrimary.metadata)
          ? normalizedPrimary.metadata
          : {};
        const mergedMetadata = {
          ...fallbackMetadata,
          ...primaryMetadata,
        };
        const mergedWallpaperId = getPlaygroundProjectWallpaperId(
          primaryHasWallpaper
            ? (normalizedPrimary.wallpaperId || primaryMetadata.wallpaperId)
            : (normalizedFallback.wallpaperId || fallbackMetadata.wallpaperId),
          normalizedFallback.wallpaperId || PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id
        );
        const mergedIcon = getPlaygroundProjectIconId(
          primaryHasIcon
            ? (normalizedPrimary.icon || primaryMetadata.icon)
            : (normalizedFallback.icon || fallbackMetadata.icon)
        );
        const mergedUseCardBackgroundAsWallpaper = primaryHasUseCardBackgroundAsWallpaper
          ? getPlaygroundProjectUseCardBackgroundAsWallpaper(
              primaryProject?.useCardBackgroundAsWallpaper,
              rawPrimaryMetadata.useCardBackgroundAsWallpaper,
              normalizedPrimary.useCardBackgroundAsWallpaper
            )
          : getPlaygroundProjectUseCardBackgroundAsWallpaper(
              fallbackProject?.useCardBackgroundAsWallpaper,
              rawFallbackMetadata.useCardBackgroundAsWallpaper,
              normalizedFallback.useCardBackgroundAsWallpaper
            );
        const mergedProjectType = primaryHasProjectType
          ? normalizedPrimary.projectType
          : normalizedFallback.projectType;
        const mergedBlueprint = getPlaygroundProjectBlueprint(mergedProjectType);

        return normalizePlaygroundProjectRecord({
          ...normalizedFallback,
          ...normalizedPrimary,
          name: mergedName,
          description: mergedDescription,
          projectType: mergedBlueprint.id,
          type: mergedBlueprint.id,
          icon: mergedIcon,
          __projectIconExplicit: primaryHasIcon || fallbackHasIcon,
          wallpaperId: mergedWallpaperId,
          useCardBackgroundAsWallpaper: mergedUseCardBackgroundAsWallpaper,
          color: mergedColor,
          defaultEnvironmentId: mergedDefaultEnvironmentId,
	          attachments: mergedAttachments,
	          connectors: mergedConnectors,
		          projectRules: mergedProjectRules,
		          permissionSet: mergedPermissionSet,
		          missionControl: mergedMissionControl,
	          metadata: {
            ...mergedMetadata,
            ...buildPlaygroundProjectBlueprintMetadata(mergedBlueprint),
            name: mergedName,
            description: mergedDescription,
            projectType: mergedBlueprint.id,
            blueprintId: mergedBlueprint.id,
            icon: mergedIcon,
            wallpaperId: mergedWallpaperId,
            useCardBackgroundAsWallpaper: mergedUseCardBackgroundAsWallpaper,
            defaultEnvironmentId: mergedDefaultEnvironmentId,
	            attachments: mergedAttachments,
	            connectors: hasPlaygroundTaskConnectorSelections(mergedConnectors) ? mergedConnectors : null,
		            projectRules: mergedProjectRules,
		            permissionSet: mergedPermissionSet,
		            missionControl: mergedMissionControl,
	          },
          summary: {
            ...buildEmptyPlaygroundProjectSummary(),
            ...(normalizedFallback.summary && typeof normalizedFallback.summary === "object" ? normalizedFallback.summary : {}),
            ...(normalizedPrimary.summary && typeof normalizedPrimary.summary === "object" ? normalizedPrimary.summary : {}),
          },
        });
      }

      function getPlaygroundProjectResponseRecord(data, fallbackProject) {
        const source = data?.project || data?.data || data;
        const sourceRecord = source && typeof source === "object" && typeof source.id === "string"
          ? {
              ...source,
              summary: data?.summary && typeof data.summary === "object" ? data.summary : source.summary,
            }
          : null;
        const normalizedSource = sourceRecord ? normalizePlaygroundProjectRecord(sourceRecord) : null;
        return mergePlaygroundProjectRecords(sourceRecord, fallbackProject) || normalizedSource;
      }

      function isPlaygroundProjectTeamSharedWithCurrentUser(project) {
        const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : {};
        return Boolean(
          project?.sharedWithMe
          || project?.isShared
          || project?.teamShared
          || project?.teamShareId
          || project?.teamShareSource
          || project?.teamAccessLevel
          || project?.teamId
          || metadata.sharedWithMe
          || metadata.isShared
          || metadata.teamShared
          || metadata.teamShareId
          || metadata.teamShareSource
          || metadata.teamAccessLevel
        );
      }

      function toPlaygroundDatetimeLocalValue(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
      }

      function toPlaygroundDateInputValue(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
        return localDate.toISOString().slice(0, 10);
      }

      function fromPlaygroundDatetimeLocalValue(value) {
        const normalized = String(value || "").trim();
        if (!normalized) return null;
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      }

      function fromPlaygroundDateInputValue(value, options = {}) {
        const normalized = String(value || "").trim();
        if (!normalized) return null;
        const timeSuffix = options.endOfDay ? "T23:59:59.999" : "T00:00:00.000";
        const date = new Date(normalized + timeSuffix);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      }

      function resolvePlaygroundReleaseDraftDateValue(value, options = {}) {
        const normalized = String(value || "").trim();
	        if (!normalized) return null;
	        if (/^\\d{4}-\\d{2}-\\d{2}$/.test(normalized)) {
          return fromPlaygroundDateInputValue(normalized, options);
        }
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      }

\${CALENDAR_DOMAIN_RUNTIME_SCRIPT}
      function getPlaygroundTaskStatusLabel(status) {
        return getPlaygroundTaskStatusPresentation(status).label;
      }

      function getPlaygroundTaskStatusPresentation(status) {
        const normalized = String(status || "").trim().toLowerCase();
        return PLAYGROUND_TASK_STATUS_OPTIONS.find((option) => option.id === normalized)
          || PLAYGROUND_TASK_STATUS_OPTIONS.find((option) => option.id === "todo");
      }

      function renderPlaygroundTaskStatusGlyph(status, className) {
        const presentation = getPlaygroundTaskStatusPresentation(status);
        const StatusIcon = presentation.icon || Circle;
        return React.createElement(StatusIcon, {
          className: [
            "playground-tasks-status-icon",
            presentation.toneClassName,
            className,
          ].filter(Boolean).join(" "),
          strokeWidth: presentation.id === "in_progress" ? 1.7 : 2,
          "aria-hidden": "true",
        });
      }

      function renderPlaygroundTaskStatusValue(status, className) {
        const presentation = getPlaygroundTaskStatusPresentation(status);
        return React.createElement("span", {
            className: [
              "playground-tasks-status-value",
              presentation.toneClassName,
              className,
            ].filter(Boolean).join(" "),
          },
          renderPlaygroundTaskStatusGlyph(status),
          React.createElement("span", {
            className: "playground-tasks-status-value-label playground-tasks-detail-select-trigger-label",
          }, presentation.label)
        );
      }

      function getPlaygroundTaskPriorityLabel(priority) {
        return getPlaygroundTaskPriorityPresentation(priority).label;
      }

      function getPlaygroundTaskPriorityPresentation(priority) {
        const normalized = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === priority) ? priority : "medium";
        switch (normalized) {
          case "low":
            return { id: "low", label: "Low", level: 1, toneClassName: "is-low" };
          case "high":
            return { id: "high", label: "High", level: 3, toneClassName: "is-high" };
          case "urgent":
            return { id: "urgent", label: "Urgent", level: 3, toneClassName: "is-critical", isUrgent: true };
          default:
            return { id: "medium", label: "Medium", level: 2, toneClassName: "is-medium" };
        }
      }

      function renderPlaygroundTaskPriorityGlyph(priority, className) {
        const presentation = getPlaygroundTaskPriorityPresentation(priority);
        if (presentation.isUrgent) {
          return React.createElement(AlertCircle, {
            className: ["playground-tasks-priority-value-icon", className].filter(Boolean).join(" "),
            strokeWidth: 2,
            "aria-hidden": "true",
          });
        }
        return React.createElement("span", {
            className: ["platform-priority-bars-icon", "playground-tasks-priority-value-icon", "playground-tasks-priority-bars-icon", className].filter(Boolean).join(" "),
            "aria-hidden": "true",
          },
          [1, 2, 3].map((barLevel) =>
            React.createElement("span", {
              key: barLevel,
              className: "platform-priority-bars-icon__bar playground-tasks-priority-bars-bar" + (barLevel <= presentation.level ? " is-active" : ""),
            })
          )
        );
      }

      function renderPlaygroundTaskPriorityLabel(priority, className) {
        const presentation = getPlaygroundTaskPriorityPresentation(priority);
        return React.createElement("span", {
            className: ["playground-tasks-priority-value", presentation.toneClassName, className].filter(Boolean).join(" "),
          },
          renderPlaygroundTaskPriorityGlyph(priority),
          React.createElement("span", { className: "playground-tasks-priority-value-text" }, presentation.label)
        );
      }

      function renderPlaygroundTaskPriorityIcon(priority, className) {
        const presentation = getPlaygroundTaskPriorityPresentation(priority);
        return React.createElement("span", {
            className: ["playground-tasks-priority-value", presentation.toneClassName, className].filter(Boolean).join(" "),
            title: presentation.label,
            "aria-label": presentation.label,
          },
          renderPlaygroundTaskPriorityGlyph(priority)
        );
      }

`;
