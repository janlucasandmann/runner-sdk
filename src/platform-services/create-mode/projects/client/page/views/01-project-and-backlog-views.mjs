export const PROJECTS_VIEWS_01_FRAGMENT = `        function getPlaygroundTaskTypeIcon(value) {
          const taskType = normalizePlaygroundTaskType(value);
          if (taskType === "subtask") return Check;
          if (taskType === "loop") return RefreshCw;
          return Bookmark;
        }

        function renderPlaygroundTaskLoopFields({
          task,
          inputIdPrefix = "playground-task-loop-",
          disabled = false,
          onChange,
        }) {
          const loop = normalizePlaygroundTaskLoopConfig(task?.loop, task);
          return React.createElement("div", { className: "playground-new-issue-modal__loop-fields" },
            [
              [
                "Iteration budget",
                "maxIterations",
                loop.maxIterations,
                1,
                50,
                "The maximum number of worker-verifier cycles this Loop may run.",
                "The supervisor checks the cycle counter before scheduling more work and stops safely when the limit is reached.",
              ],
              [
                "Stagnation limit",
                "noProgressLimit",
                loop.noProgressLimit,
                1,
                Math.min(loop.maxIterations, 20),
                "How many consecutive cycles may finish without a better verified result.",
                "Each verifier result is compared with the best result so far. The supervisor stops after this many non-improving cycles.",
              ],
              [
                "Passing score (%)",
                "minimumScore",
                Math.round(loop.minimumScore * 100),
                0,
                100,
                "The minimum verifier score required for the Loop to succeed.",
                "The normalized verifier score must meet this threshold and the stated success criteria before the Loop can complete.",
              ],
              [
                "Time budget (min)",
                "maxDurationMinutes",
                loop.maxDurationMinutes,
                1,
                1440,
                "The maximum wall-clock time available to this Loop.",
                "The supervisor checks the deadline before another cycle and stops safely once the time budget has expired.",
              ],
            ].map(([label, key, value, minimum, maximum, description, runtime]) => {
              const inputId = inputIdPrefix + key;
              return React.createElement("div", {
                  key,
                  className: "playground-new-issue-modal__loop-field",
                },
                React.createElement("label", {
                  className: "playground-new-issue-modal__loop-field-label",
                  htmlFor: inputId,
                }, label),
                React.createElement(PlatformInfoTooltip, {
                  title: label,
                  description,
                  runtime,
                  placement: "top-start",
                  ariaLabel: "About " + label,
                }),
                React.createElement("input", {
                  id: inputId,
                  type: "number",
                  "aria-label": label,
                  min: minimum,
                  max: maximum,
                  value,
                  disabled,
                  style: {
                    width: "calc(" + Math.max(1, String(value).length) + "ch + 1px)",
                    flexBasis: "calc(" + Math.max(1, String(value).length) + "ch + 1px)",
                  },
                  onChange: (event) => onChange?.({
                    [key]: key === "minimumScore"
                      ? Number(event.target.value) / 100
                      : Number(event.target.value),
                  }),
                })
              );
            })
          );
        }

        function renderTaskCard(task, extraMeta) {
          const assignee = task.assigneeAgentId ? assignableActorsById[task.assigneeAgentId] : null;
          const isHumanTask = isHumanAssignedTask(task);
          const sprint = task.sprintId ? sprintsById[task.sprintId] : null;
          const priorityClass = "playground-tasks-chip is-priority-" + task.priority;
          const statusClass = "playground-tasks-chip" + (task.status === "done" ? " is-status-done" : "");
          return React.createElement("div", {
              key: task.id,
              className: "playground-tasks-card" + (selectedTaskId === task.id ? " is-active" : ""),
              role: "button",
              tabIndex: 0,
              onClick: () => handleSelectTask(task.id),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelectTask(task.id);
                }
              },
            },
              React.createElement("div", { className: "playground-tasks-card-header" },
                React.createElement("div", null,
                  React.createElement("div", {
                    className: "playground-tasks-card-title" + (task.status === "done" ? " is-complete" : ""),
                  }, task.title || "Untitled Task"),
                  React.createElement(PlaygroundTaskDescriptionMarkdown, {
                    content: task.description || "Add task details, dependencies, and assignment context from the right-hand pane.",
                    className: "playground-tasks-card-copy tb-message-markdown",
                  })
                ),
                React.createElement("div", { className: "playground-tasks-card-actions" },
                  React.createElement("span", { className: priorityClass }, getPlaygroundTaskPriorityLabel(task.priority)),
                  React.createElement("span", { className: statusClass }, getPlaygroundTaskStatusLabel(task.status))
                )
              ),
              React.createElement("div", { className: "playground-tasks-card-meta" },
                sprint
                  ? React.createElement("span", { className: "playground-tasks-chip" }, sprint.name)
                  : React.createElement("span", { className: "playground-tasks-chip" }, "No sprint"),
                assignee
                  ? React.createElement("span", { className: "playground-tasks-chip" }, assignee.name || "Assigned")
                  : React.createElement("span", { className: "playground-tasks-chip" }, "Unassigned"),
                task.dueAt
                  ? React.createElement("span", { className: "playground-tasks-meta-copy" }, "Due " + formatPlaygroundTaskDateTime(task.dueAt))
                  : null,
                extraMeta || null
              ),
              React.createElement("div", { className: "playground-tasks-inline-actions" },
                isHumanTask
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: (event) => {
                        void handleToggleTaskDone(task, event);
                      },
                      disabled: saveState.isSaving,
                    },
                      React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, task.status === "done" ? "Reopen Task" : "Mark Done")
                    )
                  : React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: (event) => {
                        event.stopPropagation();
                        void handleStartTaskThread(task);
                      },
                      disabled: saveState.isSaving || isTaskThreadLaunchLocked(task),
                    },
                      React.createElement(MessageCircle, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Start Thread")
                    )
              )
            );
        }

        function getProjectCardCreatorName(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const creator = project?.createdBy && typeof project.createdBy === "object" && !Array.isArray(project.createdBy)
            ? project.createdBy
            : {};
          const metadataCreator = metadata.createdBy && typeof metadata.createdBy === "object" && !Array.isArray(metadata.createdBy)
            ? metadata.createdBy
            : {};
          const owner = project?.owner && typeof project.owner === "object" && !Array.isArray(project.owner)
            ? project.owner
            : {};
          const metadataOwner = metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
            ? metadata.owner
            : {};
          const creatorUserId = [
            project?.createdByUserId,
            project?.creatorUserId,
            metadata.createdByUserId,
            metadata.creatorUserId,
            creator.userId,
            creator.id,
            metadataCreator.userId,
            metadataCreator.id,
            project?.ownerUserId,
            metadata.ownerUserId,
            owner.userId,
            owner.id,
            metadataOwner.userId,
            metadataOwner.id,
          ]
            .map((value) => String(value || "").trim())
            .find(Boolean) || "";
          const creatorEmail = [
            project?.createdByEmail,
            project?.creatorEmail,
            metadata.createdByEmail,
            metadata.creatorEmail,
            creator.email,
            metadataCreator.email,
            project?.ownerEmail,
            metadata.ownerEmail,
            owner.email,
            metadataOwner.email,
          ]
            .map((value) => String(value || "").trim())
            .find(Boolean) || "";
          const creatorName = [
            project?.createdByName,
            project?.creatorName,
            metadata.createdByName,
            metadata.creatorName,
            creator.name,
            creator.displayName,
            metadataCreator.name,
            metadataCreator.displayName,
            project?.ownerName,
            metadata.ownerName,
            owner.name,
            owner.displayName,
            metadataOwner.name,
            metadataOwner.displayName,
          ]
            .map((value) => String(value || "").trim())
            .find(Boolean) || "";
          const normalizedCreatorEmail = creatorEmail || (creatorName.includes("@") ? creatorName : "");
          const isCurrentUser = Boolean(
            (creatorUserId && creatorUserId === String(currentUserId || "").trim())
            || (
              normalizedCreatorEmail
              && normalizedCreatorEmail.toLowerCase() === String(currentUserEmail || "").trim().toLowerCase()
            )
          );
          return formatAccountDisplayName(
            isCurrentUser ? currentUserName : creatorName,
            isCurrentUser ? currentUserEmail : normalizedCreatorEmail,
            isCurrentUser ? "You" : "Project member"
          );
        }

        function renderProjectCard(project, index) {
          const projectIconConfig = getPlaygroundProjectIconConfig(project.icon);
          const ProjectIcon = projectIconConfig.icon;
          const projectAccent = getPlaygroundProjectAccent(project, index);
          const creatorName = getProjectCardCreatorName(project);
          const isProjectCardMenuOpen = projectCardMenuProjectId === project.id;

          return React.createElement("div", {
              key: project.id,
              className: "playground-tasks-project-card",
              role: "button",
              tabIndex: 0,
              onClick: () => handleSelectProject(project.id),
              onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelectProject(project.id);
                }
            },
            },
              React.createElement("div", {
                  className: "playground-tasks-project-card-hero",
                  style: { "--project-icon-color": projectAccent },
                },
                React.createElement("div", { className: "playground-tasks-project-card-top" },
                  React.createElement(PlatformPopup, {
                      open: isProjectCardMenuOpen,
                      variant: "minimal",
                      portal: true,
                      placement: "bottom-end",
                      portalOffset: 6,
                      rootClassName: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-project-card-actions",
                      surfaceClassName: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-project-card-menu",
                      surfaceProps: {
                        role: "menu",
                        "aria-label": "Project actions",
                        onClick: (event) => event.stopPropagation(),
                      },
                      animation: "down-in",
                      trigger: React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (isProjectCardMenuOpen ? " is-active" : ""),
                      "aria-label": "Project actions",
                      "aria-haspopup": "menu",
                      "aria-expanded": isProjectCardMenuOpen ? "true" : "false",
                      onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setProjectCardMenuProjectId((current) => current === project.id ? "" : project.id);
                      },
                    }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    },
                    React.createElement("button", {
                            type: "button",
                            role: "menuitem",
                            className: "tb-popup-row",
                            onClick: (event) => {
                              event.stopPropagation();
                              setProjectCardMenuProjectId("");
                              openProjectComposerForEdit(project);
                            },
                          },
                            React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Edit Project")
                          ),
                    React.createElement("button", {
                            type: "button",
                            role: "menuitem",
                            className: "tb-popup-row",
                            onClick: (event) => {
                              event.stopPropagation();
                              setProjectCardMenuProjectId("");
                              void handleDeleteProject(project.id);
                            },
                          },
                            React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("span", null, "Delete Project")
                          )
                  )
                ),
                React.createElement("div", {
                    className: "playground-tasks-project-card-icon",
                    "aria-hidden": "true",
                  },
                  React.createElement(ProjectIcon, { width: 30, height: 30, strokeWidth: 1.7 })
                )
              ),
              React.createElement("div", { className: "playground-tasks-project-card-body" },
                React.createElement("div", { className: "playground-tasks-project-card-title" }, project.name || "Untitled Project"),
                React.createElement(PlaygroundTaskDescriptionMarkdown, {
                  content: project.description || "Open this project to access its environments, active threads, and sprint-driven task board.",
                  className: "playground-tasks-project-card-copy tb-message-markdown",
                }),
                React.createElement("div", { className: "playground-tasks-project-card-creator" }, "By " + creatorName)
              )
            );
        }

        function renderProjectWallpaperPicker() {
          return null;
        }

        function renderProjectIssueComposerDialog() {
          if (!issueComposerOpen) {
            return null;
          }

          const normalizedIssueType = normalizePlaygroundTaskType(issueComposerDraft.taskType);
          const issueComposerTitle = normalizedIssueType === "subtask" ? "Create Subtask" : "Create Issue";

          function renderIssueComposerTypeBadge(taskType, className = "") {
            const normalizedTaskType = normalizePlaygroundTaskType(taskType);
            const TypeIcon = normalizedTaskType === "subtask"
              ? Check
              : (normalizedTaskType === "loop" ? RefreshCw : Bookmark);
            return React.createElement("span", {
                className: (
                  "playground-tasks-detail-type-badge is-"
                  + normalizedTaskType
                  + " "
                  + className
                ).trim(),
                "aria-hidden": "true",
              },
              React.createElement(TypeIcon, { strokeWidth: 1.9 })
            );
          }

          function renderIssueComposerTypeSelector() {
            return React.createElement(PlatformSelector, {
              value: normalizedIssueType,
              options: PLAYGROUND_TASK_TYPE_OPTIONS.map((option) => ({
                value: option.id,
                label: option.label,
                leading: renderIssueComposerTypeBadge(
                  option.id,
                  "playground-new-issue-modal__type-option-icon"
                ),
              })),
              onValueChange: (nextValue) => {
                const nextType = normalizePlaygroundTaskType(nextValue);
                updateIssueComposerDraft((current) => {
                  const currentType = normalizePlaygroundTaskType(current?.taskType);
                  const currentDescription = String(current?.description || "").trim();
                  const normalizedLoop = normalizePlaygroundTaskLoopConfig(
                    current?.loop,
                    currentType === "loop" ? current : null,
                  );
                  const nextDescription = nextType === "loop" && currentType !== "loop"
                    ? buildPlaygroundTaskLoopGoalTemplate({
                        ...normalizedLoop,
                        goal: currentDescription || normalizedLoop.goal,
                      })
                    : current.description;
                  return {
                    ...current,
                    description: nextDescription,
                    taskType: nextType,
                    loop: nextType === "loop"
                      ? normalizePlaygroundTaskLoopConfig({
                          ...normalizedLoop,
                          ...parsePlaygroundTaskLoopGoalMarkdown(nextDescription),
                        }, { ...current, description: nextDescription })
                      : null,
                    parentTaskId: nextType === "subtask" ? current.parentTaskId : null,
                  };
                });
              },
              ariaLabel: "Issue type",
              label: renderIssueComposerTypeBadge(
                normalizedIssueType,
                "playground-new-issue-modal__type-trigger-icon"
              ),
              open: issueComposerDetailSelectPopover === "type",
              onOpenChange: (nextOpen) => setIssueComposerDetailSelectPopover(nextOpen ? "type" : ""),
              alignment: "start",
              popupAlignment: "left",
              popupWidth: "min(220px, calc(100vw - 48px))",
              popupMaxWidth: "calc(100vw - 48px)",
              className: "playground-new-issue-modal__type-selector",
              triggerClassName: "playground-new-issue-modal__type-selector-trigger",
              popupClassName: "playground-new-issue-modal__type-selector-popup",
            });
          }

          const selectedDependencyId = normalizePlaygroundIdList(issueComposerDraft.dependencyIds)[0] || "";
          const parentTicketCandidates = tasks
            .filter((task) => {
              const taskType = normalizePlaygroundTaskType(task?.taskType || task?.type);
              return task?.id && ["task", "loop"].includes(taskType) && !isPlaygroundTaskTerminalStatus(task.status);
            })
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          const dependencyCandidates = tasks
            .filter((task) => task?.id)
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
            });
          const scheduleMode = issueComposerDraft.scheduledStartAt
            ? (issueComposerDraft.scheduleType === "recurring" ? "recurring" : "one-time")
            : "none";
          function renderIssueComposerDescriptionField() {
            const descriptionEditor = React.createElement(PlatformInstructionsEditor, {
              value: resolveTaskDescriptionAttachmentFiles(
                issueComposerDraft.description || "",
                issueComposerDraft.attachments
              ),
              onChange: handleIssueComposerDescriptionEditorChange,
              title: normalizedIssueType === "loop" ? "Loop Goal" : "Description",
              placeholder: normalizedIssueType === "loop"
                ? "Define the Loop goal, success criteria, progress signal, and verification method."
                : "Describe the expected outcome, context, constraints, and acceptance criteria.",
              ariaLabel: normalizedIssueType === "loop" ? "Loop goal" : "Issue description",
              editorRef: issueComposerDescriptionTextareaRef,
              historyKey: (
                normalizedIssueType === "loop" ? "new-loop-goal:" : "new-issue-description:"
              ) + String(selectedProjectId || selectedProject?.id || "project"),
              stickyHeader: false,
              variant: "minimalistic-ui",
              contentVariant: "file-enabled",
              promptInsertion: typeof onOpenPromptSearch === "function"
                ? { openSearch: onOpenPromptSearch }
                : undefined,
              fileUpload: {
                upload: uploadIssueComposerDescriptionFiles,
                resolvePreviewSource: resolveTaskDescriptionFilePreviewSource,
                disabled: issueComposerSaveState.isSaving || taskAttachmentTransferState.isProcessing,
                onRename: handleRenameIssueComposerDescriptionFile,
                onRemove: handleRemoveIssueComposerDescriptionFile,
              },
              className: "playground-new-issue-modal__description",
            });
            if (normalizedIssueType !== "loop") {
              return descriptionEditor;
            }
            return React.createElement("section", {
                className: "playground-new-issue-modal__loop-goal-section",
                "aria-label": "Loop goal",
              },
              descriptionEditor,
              renderIssueComposerLoopFields()
            );
          }

          function renderIssueComposerLoopFields() {
            if (normalizedIssueType !== "loop") {
              return null;
            }
            const updateLoop = (patch) => updateIssueComposerDraft((current) => ({
              ...current,
              loop: normalizePlaygroundTaskLoopConfig({
                ...normalizePlaygroundTaskLoopConfig(current.loop, current),
                ...patch,
              }, current),
            }));
            return renderPlaygroundTaskLoopFields({
              task: issueComposerDraft,
              inputIdPrefix: "playground-new-issue-loop-",
              onChange: updateLoop,
            });
          }

          function createIssueComposerSelectorOption({ value, label, description, leading = null, onSelect, disabled = false }) {
            return {
              value: String(value || ""),
              label,
              description: description || undefined,
              leading: leading || undefined,
              disabled,
              onSelect,
            };
          }

          function renderIssueComposerDetailSelectControl({
            popoverId,
            value,
            valueLabel,
            disabled = false,
            isEmpty = false,
            buttonContent = null,
            popupClassName = "",
            popupHeader = null,
            popupHeaderClassName = "",
            popupContent = null,
            popupAriaLabel = "",
            open = null,
            onOpenChange = null,
            popupWidth = "min(300px, calc(100vw - 48px))",
            popupMaxHeight = "min(320px, calc(100vh - 120px))",
            options = [],
            emptyContent = "No options available.",
          }) {
            const normalizedPopoverId = String(popoverId || "").trim();
            const hasControlledOpenState = typeof open === "boolean";
            const isOpen = hasControlledOpenState
              ? open
              : issueComposerDetailSelectPopover === normalizedPopoverId;
            const selectorOptions = Array.isArray(options) ? options.filter((option) => option?.value) : [];
            return React.createElement(PlatformSelector, {
              value: String(value || ""),
              options: selectorOptions,
              onValueChange: (_nextValue, option) => {
                if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
                setIssueComposerDetailSelectPopover("");
              },
              ariaLabel: "Select issue " + normalizedPopoverId.replace(/-/g, " "),
              label: buttonContent || React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, valueLabel),
              placeholder: valueLabel,
              disabled,
              open: isOpen,
              onOpenChange: (nextOpen) => {
                if (nextOpen && ["assignee", "reviewer"].includes(normalizedPopoverId)) {
                  const selectedActorId = normalizedPopoverId === "reviewer"
                    ? (issueComposerDraft.reviewRequired ? issueComposerDraft.reviewerAgentId : "")
                    : issueComposerDraft.assigneeAgentId;
                  setIssueComposerActorPopupMode(
                    getDefaultTaskActorPopupMode(assignableActorsById[selectedActorId] || null)
                  );
                }
                if (typeof onOpenChange === "function") {
                  onOpenChange(nextOpen);
                  return;
                }
                setIssueComposerDetailSelectPopover(nextOpen ? normalizedPopoverId : "");
              },
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent,
              popupHeader,
              popupHeaderClassName,
              popupContent,
              popupAriaLabel: popupAriaLabel || undefined,
              popupWidth,
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight,
              className: "playground-tasks-detail-central-selector" + (isEmpty ? " is-empty" : ""),
              triggerClassName: "playground-tasks-detail-central-selector-trigger",
              popupClassName: ("playground-tasks-detail-central-selector-popup " + popupClassName).trim(),
            });
          }

          function renderIssueComposerDetailFact(label, control) {
            return React.createElement("div", { className: "playground-tasks-detail-fact" },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" }, control)
            );
          }

          function renderIssueComposerPersonValue(actorId, label) {
            const normalizedActorId = String(actorId || "").trim();
            return React.createElement("span", { className: "playground-tasks-detail-person-value" },
              normalizedActorId ? renderTaskActorAvatar(normalizedActorId, "playground-tasks-detail-person-avatar") : null,
              React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, label)
            );
          }

          function createIssueComposerActorSelectorOption(actor, options = {}) {
            const mode = getPlaygroundTaskAssigneePopupMode(actor);
            const actorLabel = getTaskAssigneeName(actor.id, actor.name || "Unknown");
            const actorDescription = options.reviewer
              ? (mode === "humans" ? "Human reviewer" : (mode === "teams" ? "Agent squad reviewer" : "Agent reviewer"))
              : (mode === "humans" ? "Human" : (mode === "teams" ? "Agent squad" : "Agent"));
            return createIssueComposerSelectorOption({
              value: actor.id,
              label: actorLabel,
              description: actorDescription,
              leading: renderTaskActorAvatar(actor.id, "playground-tasks-detail-person-menu-avatar"),
              onSelect: () => {
                  if (options.reviewer) {
                    updateIssueComposerDraft((current) => ({
                      ...current,
                      reviewRequired: true,
                      reviewerAgentId: actor.id,
                    }));
                  } else {
                    updateIssueComposerField("assigneeAgentId", actor.id);
                  }
                },
            });
          }

          function renderIssueComposerDetailsSection() {
            const issueType = normalizePlaygroundTaskType(issueComposerDraft.taskType);
            const issueStatus = issueComposerDraft.status === "blocked" ? "blocked" : "todo";
            const issueStatusPresentation = getPlaygroundTaskStatusPresentation(issueStatus);
            const issueStatusLabel = issueStatusPresentation.label;
            const issuePriorityPresentation = getPlaygroundTaskPriorityPresentation(issueComposerDraft.priority);
            const selectedRelease = issueComposerDraft.releaseId ? releases.find((release) => release.id === issueComposerDraft.releaseId) || null : null;
            const selectedParentTaskId = normalizePlaygroundParentTaskId(issueComposerDraft.parentTaskId);
            const selectedParentTask = selectedParentTaskId ? tasks.find((task) => task.id === selectedParentTaskId) || null : null;
            const parentTaskLabel = selectedParentTask
              ? ((taskTicketNumbersById[selectedParentTask.id] || selectedParentTask.ticketNumber || "000") + " - " + (selectedParentTask.title || "Untitled Task"))
              : "Select ticket";
            const selectedAssignee = issueComposerDraft.assigneeAgentId ? assignableActors.find((actor) => actor.id === issueComposerDraft.assigneeAgentId) || null : null;
            const assigneeLabel = selectedAssignee ? getTaskAssigneeOptionLabel(selectedAssignee) : "Unassigned";
            const selectedReviewer = issueComposerDraft.reviewRequired && issueComposerDraft.reviewerAgentId
              ? assignableActors.find((actor) => actor.id === issueComposerDraft.reviewerAgentId) || null
              : null;
            const reviewerLabel = issueComposerDraft.reviewRequired
              ? (selectedReviewer ? getTaskAssigneeOptionLabel(selectedReviewer) : "Reviewer")
              : "No review";
            const loop = issueType === "loop"
              ? normalizePlaygroundTaskLoopConfig(issueComposerDraft.loop, issueComposerDraft)
              : null;
            const verifierAgents = issueType === "loop"
              ? assignableActors.filter((actor) => (
                  getPlaygroundTaskAssigneePopupMode(actor) === "agents"
                  && actor?.id
                ))
              : [];
            const selectedVerifier = loop?.verifierAgentId
              ? verifierAgents.find((agent) => agent.id === loop.verifierAgentId) || null
              : null;
            const updateLoop = (patch) => updateIssueComposerDraft((current) => ({
              ...current,
              loop: normalizePlaygroundTaskLoopConfig({
                ...normalizePlaygroundTaskLoopConfig(current.loop, current),
                ...patch,
              }, current),
            }));
            const filteredIssueComposerAssignableActors = assignableActors.filter(
              (actor) => getPlaygroundTaskAssigneePopupMode(actor) === issueComposerActorPopupMode
            );
            const selectedDependencyTask = selectedDependencyId ? tasks.find((task) => task.id === selectedDependencyId) || null : null;
            const dependencyLabel = selectedDependencyTask
              ? ((taskTicketNumbersById[selectedDependencyTask.id] || selectedDependencyTask.ticketNumber || "000") + " - " + (selectedDependencyTask.title || "Untitled Task"))
              : "None";
            const scheduleLabel = scheduleMode === "recurring" ? "Recurring" : (scheduleMode === "one-time" ? "One-time" : "None");

            return React.createElement("div", {
                className: "playground-tasks-detail-facts playground-tasks-issue-details-section" + (issueComposerDetailSelectPopover ? " is-popover-open" : ""),
              },
              React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                    issueType === "subtask"
                      ? renderIssueComposerDetailFact("Subtask to",
                          renderIssueComposerDetailSelectControl({
                            popoverId: "subtask-to",
                            value: selectedParentTaskId || "",
                            valueLabel: parentTaskLabel,
                            isEmpty: !selectedParentTaskId,
                            popupWidth: "min(380px, calc(100vw - 48px))",
                            options: parentTicketCandidates.map((task) =>
                              createIssueComposerSelectorOption({
                                value: task.id,
                                label: (taskTicketNumbersById[task.id] || task.ticketNumber || "000") + " - " + (task.title || "Untitled Task"),
                                description: getPlaygroundTaskTypeLabel(task.taskType || task.type),
                                onSelect: () => updateIssueComposerField("parentTaskId", task.id),
                              })
                            ),
                            emptyContent: "No unfinished tasks or loops available.",
                          })
                        )
                      : null,
                    renderIssueComposerDetailFact("Status",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "status",
                        value: issueStatus,
                        valueLabel: issueStatusLabel,
                        buttonContent: renderPlaygroundTaskStatusValue(issueStatus, "playground-tasks-detail-status-value"),
                        options: PLAYGROUND_TASK_STATUS_OPTIONS
                          .filter((option) => ["todo", "blocked"].includes(option.id))
                          .map((option) => createIssueComposerSelectorOption({
                            value: option.id,
                            label: option.label,
                            leading: renderPlaygroundTaskStatusGlyph(option.id),
                            onSelect: () => {
                              updateIssueComposerDraft((current) => ({
                                ...current,
                                status: option.id,
                                dependencyIds: option.id === "blocked" ? normalizePlaygroundIdList(current.dependencyIds) : [],
                                completedAt: null,
                              }));
                            },
                          })),
                      })
                    ),
                    issueStatus === "blocked"
                      ? renderIssueComposerDetailFact("Blocked by",
                          renderIssueComposerDetailSelectControl({
                            popoverId: "blocked-by",
                            value: selectedDependencyId || "__none__",
                            valueLabel: dependencyLabel,
                            isEmpty: !selectedDependencyId,
                            popupWidth: "min(380px, calc(100vw - 48px))",
                            options: [
                              createIssueComposerSelectorOption({
                                value: "__none__",
                                label: "None",
                                onSelect: () => updateIssueComposerField("dependencyIds", []),
                              }),
                              ...dependencyCandidates.map((task) =>
                                createIssueComposerSelectorOption({
                                  value: task.id,
                                  label: (taskTicketNumbersById[task.id] || task.ticketNumber || "000") + " - " + (task.title || "Untitled Task"),
                                  onSelect: () => updateIssueComposerField("dependencyIds", [task.id]),
                                })
                              ),
                            ],
                          })
                        )
                      : null,
                    renderIssueComposerDetailFact("Priority",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "priority",
                        value: issueComposerDraft.priority,
                        valueLabel: issuePriorityPresentation.label,
                        buttonContent: React.createElement("span", {
                            className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + issuePriorityPresentation.toneClassName,
                          },
                          renderPlaygroundTaskPriorityGlyph(issueComposerDraft.priority),
                          React.createElement("span", { className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label" }, issuePriorityPresentation.label)
                        ),
                        options: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) =>
                          createIssueComposerSelectorOption({
                            value: option.id,
                            label: getPlaygroundTaskPriorityPresentation(option.id).label,
                            leading: renderPlaygroundTaskPriorityGlyph(option.id),
                            onSelect: () => updateIssueComposerField("priority", option.id),
                          })
                        ),
                      })
                    ),
                    renderIssueComposerDetailFact("Milestone",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "release",
                        value: selectedRelease?.id || "__none__",
                        valueLabel: selectedRelease ? (selectedRelease.name || "Untitled Milestone") : "None",
                        isEmpty: !selectedRelease,
                        options: [
                          createIssueComposerSelectorOption({
                            value: "__none__",
                            label: "None",
                            onSelect: () => updateIssueComposerField("releaseId", null),
                          }),
                          ...releases
                            .slice()
                            .sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")))
                            .map((release) =>
                              createIssueComposerSelectorOption({
                                value: release.id,
                                label: release.name || "Untitled Milestone",
                                description: release.description || formatPlaygroundTaskReleaseDateRange(release),
                                onSelect: () => updateIssueComposerField("releaseId", release.id),
                              })
                            ),
                        ],
                      })
                    ),
                    renderIssueComposerDetailFact("Color",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "color",
                        value: getPlaygroundTaskColorId(issueComposerDraft.taskColor),
                        valueLabel: getPlaygroundTaskColorPresentation(issueComposerDraft.taskColor).label,
                        buttonContent: renderPlaygroundTaskColorValue(issueComposerDraft.taskColor),
                        options: PLAYGROUND_TASK_COLOR_OPTIONS.map((option) =>
                          createIssueComposerSelectorOption({
                            value: option.id,
                            label: option.label,
                            leading: renderPlaygroundTaskColorSwatch(option.id, "playground-tasks-detail-color-menu-swatch"),
                            onSelect: () => updateIssueComposerField("taskColor", option.id),
                          })
                        ),
                      })
                    ),
                    renderIssueComposerDetailFact("Assignee",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "assignee",
                        value: issueComposerDraft.assigneeAgentId || "__none__",
                        valueLabel: assigneeLabel,
                        isEmpty: !selectedAssignee,
                        buttonContent: renderIssueComposerPersonValue(issueComposerDraft.assigneeAgentId, assigneeLabel),
                        popupClassName: "playground-tasks-detail-assignee-selector-popup",
                        popupHeader: renderTaskActorModeSwitch({
                          ariaLabel: "Assignee type",
                          value: issueComposerActorPopupMode,
                          onValueChange: setIssueComposerActorPopupMode,
                        }),
                        options: [
                          createIssueComposerSelectorOption({
                            value: "__none__",
                            label: "Unassigned",
                            onSelect: () => updateIssueComposerField("assigneeAgentId", null),
                          }),
                          ...filteredIssueComposerAssignableActors.map((actor) => createIssueComposerActorSelectorOption(actor)),
                        ],
                        emptyContent: "No assignees available.",
                      })
                    ),
                    issueType === "loop"
                      ? React.createElement(React.Fragment, null,
                          renderIssueComposerDetailFact("Verifier",
                            renderIssueComposerDetailSelectControl({
                              popoverId: "loop-verifier",
                              value: loop.verifierAgentId || "__automatic__",
                              valueLabel: selectedVerifier
                                ? getTaskAssigneeOptionLabel(selectedVerifier)
                                : "Automatic",
                              isEmpty: !selectedVerifier,
                              buttonContent: selectedVerifier
                                ? renderIssueComposerPersonValue(selectedVerifier.id, getTaskAssigneeOptionLabel(selectedVerifier))
                                : React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, "Automatic"),
                              popupClassName: "playground-tasks-detail-assignee-selector-popup",
                              options: [
                                createIssueComposerSelectorOption({
                                  value: "__automatic__",
                                  label: "Automatic",
                                  description: "Use an isolated verifier run with the selected worker agent.",
                                  onSelect: () => updateLoop({ verifierAgentId: null }),
                                }),
                                ...verifierAgents.map((agent) => createIssueComposerSelectorOption({
                                  value: agent.id,
                                  label: getTaskAssigneeOptionLabel(agent),
                                  description: "Run this agent in a read-only verifier context.",
                                  leading: renderTaskActorAvatar(agent.id, "playground-tasks-detail-person-menu-avatar"),
                                  onSelect: () => updateLoop({ verifierAgentId: agent.id }),
                                })),
                              ],
                            })
                          ),
                          renderIssueComposerDetailFact("On regression",
                            renderIssueComposerDetailSelectControl({
                              popoverId: "loop-regression",
                              value: loop.regressionPolicy,
                              valueLabel: loop.regressionPolicy === "continue" ? "Continue" : "Stop safely",
                              options: [
                                createIssueComposerSelectorOption({
                                  value: "stop",
                                  label: "Stop safely",
                                  description: "Stop when a candidate scores materially below the best result.",
                                  onSelect: () => updateLoop({ regressionPolicy: "stop" }),
                                }),
                                createIssueComposerSelectorOption({
                                  value: "continue",
                                  label: "Continue",
                                  description: "Allow later iterations to recover from a regression.",
                                  onSelect: () => updateLoop({ regressionPolicy: "continue" }),
                                }),
                              ],
                            })
                          )
                        )
                      : renderIssueComposerDetailFact("Reviewer",
                          renderIssueComposerDetailSelectControl({
                            popoverId: "reviewer",
                            value: issueComposerDraft.reviewRequired ? (issueComposerDraft.reviewerAgentId || "") : "__none__",
                            valueLabel: reviewerLabel,
                            isEmpty: !issueComposerDraft.reviewRequired,
                            buttonContent: renderIssueComposerPersonValue(issueComposerDraft.reviewRequired ? issueComposerDraft.reviewerAgentId : "", reviewerLabel),
                            popupClassName: "playground-tasks-detail-assignee-selector-popup",
                            popupHeader: renderTaskActorModeSwitch({
                              ariaLabel: "Reviewer type",
                              value: issueComposerActorPopupMode,
                              onValueChange: setIssueComposerActorPopupMode,
                            }),
                            options: [
                              createIssueComposerSelectorOption({
                                value: "__none__",
                                label: "No review",
                                description: "Move directly to Done when work is done.",
                                onSelect: () => updateIssueComposerDraft((current) => ({
                                  ...current,
                                  reviewRequired: false,
                                  reviewerAgentId: null,
                                })),
                              }),
                              ...filteredIssueComposerAssignableActors.map((actor) => createIssueComposerActorSelectorOption(actor, { reviewer: true })),
                            ],
                          })
                        ),
                    renderIssueComposerDetailFact("Schedule",
                      renderIssueComposerDetailSelectControl({
                        popoverId: "schedule",
                        value: scheduleMode,
                        valueLabel: scheduleLabel,
                        isEmpty: scheduleMode === "none",
                        open: Boolean(taskScheduleDialogState?.target === "issue") && taskScheduleDialogPhase !== "exit",
                        onOpenChange: (nextOpen) => {
                          if (nextOpen) {
                            if (taskScheduleDialogState?.target !== "issue") {
                              openTaskScheduleDialog("issue");
                            }
                            return;
                          }
                          if (taskScheduleDialogState?.target === "issue") {
                            closeTaskScheduleDialog();
                          }
                        },
                        popupContent: renderTaskScheduleDialog({ embedded: true }),
                        popupAriaLabel: "Edit issue schedule",
                        popupClassName: "playground-tasks-schedule-selector-popup",
                        popupWidth: "min(320px, calc(100vw - 48px))",
                        popupMaxHeight: "min(520px, calc(100vh - 96px))",
                      })
                    )
                  )
            );
          }

	          return React.createElement(PlatformModal, {
	            open: issueComposerOpen,
	            visible: issueComposerVisible,
	            closing: issueComposerClosing,
	            animationDurationMs: issueComposerAnimationMs,
	            onClose: () => closeProjectIssueComposer(),
	            as: "form",
	            size: "large",
	            maxHeight: normalizedIssueType === "loop" ? "88vh" : "80vh",
	            title: issueComposerTitle,
	            headerVariant: "search",
	            headerLeading: renderIssueComposerTypeSelector(),
	            headerSearchProps: {
	              icon: null,
	              value: issueComposerDraft.title || "",
	              placeholder: "Issue title",
	              "aria-label": "Issue title",
	              autoComplete: "off",
	              onChange: (event) => updateIssueComposerField("title", event.target.value),
	              onKeyDown: (event) => {
	                if (
	                  event.key !== "Tab"
	                  || event.shiftKey
	                  || event.altKey
	                  || event.ctrlKey
	                  || event.metaKey
	                ) {
	                  return;
	                }
	                const descriptionTextarea = issueComposerDescriptionTextareaRef.current;
	                if (!descriptionTextarea) {
	                  return;
	                }
	                event.preventDefault();
	                descriptionTextarea.focus({ preventScroll: true });
	              },
	            },
	            className: "playground-new-issue-modal",
	            bodyClassName: "playground-new-issue-modal__body",
	            footerClassName: "playground-new-issue-modal__footer",
	            closeOnEscape: !issueComposerDetailSelectPopover,
	            closeButtonLabel: "Close new issue",
	            closeButtonDisabled: issueComposerSaveState.isSaving,
	            surfaceProps: {
	              onSubmit: (event) => void handleSaveProjectIssue(event),
	            },
	            footer: React.createElement(React.Fragment, null,
	              React.createElement(PlatformSecondaryButton, {
	                type: "button",
	                size: "medium",
	                onClick: () => closeProjectIssueComposer(),
	                disabled: issueComposerSaveState.isSaving,
	              }, "Cancel"),
	              React.createElement(PlatformPrimaryButton, {
	                size: "medium",
	                type: "submit",
	                disabled: issueComposerSaveState.isSaving || !String(issueComposerDraft.title || "").trim(),
	              }, issueComposerSaveState.isSaving ? "Creating..." : issueComposerTitle)
	            ),
	          },
	            renderIssueComposerDescriptionField(),
	            renderIssueComposerDetailsSection(),
	            issueComposerSaveState.error
	              ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, issueComposerSaveState.error)
	              : null
	          );
	        }

        function renderProjectComposerDialog(options = {}) {
          const embedded = options?.embedded === true;
          if (!projectComposerOpen || (!embedded && missionControlSetupOpen)) {
            return null;
          }

          const selectedProjectIcon = getPlaygroundProjectIconConfig(projectDraft.icon);
          const SelectedProjectIcon = selectedProjectIcon.icon;
          const selectedProjectBlueprint = getPlaygroundProjectBlueprint(projectDraft.projectType || projectDraft.type || projectDraft.metadata?.projectType || projectDraft.metadata?.blueprintId);
          const projectAttachments = normalizePlaygroundTaskAttachmentList(projectDraft.attachments);
          const hasProjectAttachments = projectAttachments.length > 0;
          const projectConnectorEntries = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, projectDraft);
            const isConnected = taskConnectorConfigByKey[option.key]?.connected !== false;
            return {
              ...option,
              selection,
              valueLabel: selection?.valueLabel || (isConnected ? "None" : "Connect"),
            };
          });
          const selectedProjectEnvironmentId = activeProjectAttachmentEnvironmentId
            || projectComposerDefaultEnvironmentId
            || projectComposerAvailableEnvironments[0]?.id
            || "";
          const selectedProjectEnvironmentOption = selectedProjectEnvironmentId
            ? projectComposerAvailableEnvironments.find((environment) => environment.id === selectedProjectEnvironmentId) || activeProjectAttachmentEnvironment
            : null;
          const projectDefaultEnvironmentLabel = selectedProjectEnvironmentOption
            ? (selectedProjectEnvironmentOption.name + (selectedProjectEnvironmentOption.isDefault ? " (Default)" : ""))
            : (projectComposerAvailableEnvironments.length > 0 ? "Select environment" : "No environments");

          function renderProjectComposerEnvironmentPicker() {
            return React.createElement("div", { className: "playground-tasks-project-modal-environment-picker" },
              React.createElement(PlatformSelector, {
                value: selectedProjectEnvironmentId,
                options: projectComposerAvailableEnvironments.map((environment) => ({
                  value: environment.id,
                  label: environment.name + (environment.isDefault ? " (Default)" : ""),
                  description: "Use this computer for project-wide files.",
                  leading: React.createElement(Monitor, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                })),
                onValueChange: (nextEnvironmentId) => {
                  setProjectDraft((current) => ({
                    ...current,
                    defaultEnvironmentId: nextEnvironmentId,
                  }));
                  setProjectAttachmentTransferState((current) => ({
                    ...current,
                    error: "",
                  }));
                },
                ariaLabel: "Project computer",
                label: React.createElement("span", {
                    className: "playground-tasks-project-modal-computer-selector-value",
                  },
                  React.createElement(Monitor, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  React.createElement("span", null, projectDefaultEnvironmentLabel)
                ),
                placeholder: projectDefaultEnvironmentLabel,
                disabled: projectComposerAvailableEnvironments.length === 0,
                open: projectComposerEnvironmentPopoverOpen,
                onOpenChange: (nextOpen) => {
                  if (nextOpen) {
                    setProjectIconPickerOpen(false);
                    setProjectBlueprintPickerOpen(false);
                  }
                  setProjectComposerEnvironmentPopoverOpen(nextOpen);
                },
                alignment: "end",
                popupAlignment: "right",
                emptyContent: "No computers available.",
                popupWidth: "min(320px, calc(100vw - 48px))",
                popupMaxWidth: "calc(100vw - 48px)",
                popupMaxHeight: "min(320px, calc(100vh - 120px))",
                className: "playground-tasks-project-modal-computer-selector",
                triggerClassName: "playground-tasks-project-modal-computer-selector-trigger",
                popupClassName: "playground-tasks-project-modal-computer-selector-popup",
              })
            );
          }

          function handleProjectBlueprintSelection(blueprint) {
            setProjectDraft((current) => {
              const currentRecord = current && typeof current === "object" ? current : {};
              const currentMetadata = currentRecord.metadata && typeof currentRecord.metadata === "object" && !Array.isArray(currentRecord.metadata)
                ? currentRecord.metadata
                : {};
              const previousWallpaperId = String(currentRecord.wallpaperId || currentMetadata.wallpaperId || "").trim();
              const nextDraft = applyPlaygroundProjectBlueprintToDraft(currentRecord, blueprint.id, {
                replaceRules: true,
              });
              const nextMetadata = nextDraft.metadata && typeof nextDraft.metadata === "object" && !Array.isArray(nextDraft.metadata)
                ? nextDraft.metadata
                : {};
              return {
                ...nextDraft,
                wallpaperId: previousWallpaperId || nextDraft.wallpaperId || "",
                metadata: {
                  ...nextMetadata,
                  wallpaperId: previousWallpaperId || nextMetadata.wallpaperId || "",
                },
              };
            });
            setProjectBlueprintPickerOpen(false);
            setProjectIconPickerOpen(false);
            setProjectComposerEnvironmentPopoverOpen(false);
          }

          function renderProjectBlueprintOption(blueprint) {
            const BlueprintIcon = blueprint.Icon || getPlaygroundProjectIconConfig(blueprint.iconId).icon;
            const isActive = selectedProjectBlueprint.id === blueprint.id;
            return React.createElement("button", {
                key: blueprint.id,
                type: "button",
                className: "playground-tasks-project-blueprint-option" + (isActive ? " is-active" : ""),
                onClick: () => handleProjectBlueprintSelection(blueprint),
              },
              React.createElement("span", {
                className: "playground-tasks-project-blueprint-icon",
                style: { "--project-blueprint-accent": blueprint.color || "#66A6FF" },
                "aria-hidden": "true",
              }, React.createElement(BlueprintIcon, { width: 15, height: 15, strokeWidth: 1.85 })),
              React.createElement("span", { className: "playground-tasks-project-blueprint-copy" },
                React.createElement("span", { className: "playground-tasks-project-blueprint-title" }, blueprint.title),
                React.createElement("span", { className: "playground-tasks-project-blueprint-description" }, blueprint.description)
              )
            );
          }

	          function renderProjectBlueprintSelector() {
	            const BlueprintIcon = selectedProjectBlueprint.Icon || getPlaygroundProjectIconConfig(selectedProjectBlueprint.iconId).icon;
	            return React.createElement("div", {
	                className: "playground-tasks-project-blueprint-section playground-tasks-toolbar-popup-shell" + (projectBlueprintPickerOpen ? " is-open" : ""),
	                ref: projectBlueprintPickerRef,
	              },
	              React.createElement("button", {
	                type: "button",
	                className: "playground-tasks-project-blueprint-trigger",
	                onClick: () => {
	                  setProjectIconPickerOpen(false);
	                  setProjectComposerEnvironmentPopoverOpen(false);
	                  setProjectBlueprintPickerOpen((current) => !current);
	                },
	                "aria-haspopup": "listbox",
	                "aria-expanded": projectBlueprintPickerOpen ? "true" : "false",
	              },
                React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-main" },
                    React.createElement("span", {
                      className: "playground-tasks-project-blueprint-icon",
                      style: { "--project-blueprint-accent": selectedProjectBlueprint.color || "#66A6FF" },
                      "aria-hidden": "true",
                    }, React.createElement(BlueprintIcon, { width: 15, height: 15, strokeWidth: 1.85 })),
                  React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-copy" },
                    React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-title" }, selectedProjectBlueprint.title),
                  React.createElement("span", { className: "playground-tasks-project-blueprint-trigger-description" }, selectedProjectBlueprint.description)
                    )
	                ),
	                React.createElement(ChevronDown, { className: "playground-tasks-project-blueprint-chevron", strokeWidth: 1.8 })
	              ),
	              projectBlueprintPickerOpen
	                ? React.createElement(PlatformPopupSurface, {
	                    className: "playground-tasks-toolbar-popup-menu playground-tasks-project-blueprint-popover playground-tasks-toolbar-popup-menu-animate-down-in",
	                    role: "listbox",
	                  },
	                    React.createElement("div", { className: "playground-tasks-project-blueprint-grid" },
	                      PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.map((blueprint) => renderProjectBlueprintOption(blueprint))
	                    )
	                  )
	                : null
	            );
	          }

          function getProjectDraftLeadDisplay() {
            const metadata = projectDraft?.metadata && typeof projectDraft.metadata === "object" && !Array.isArray(projectDraft.metadata)
              ? projectDraft.metadata
              : {};
            const metadataLead = metadata.lead && typeof metadata.lead === "object" && !Array.isArray(metadata.lead)
              ? metadata.lead
              : {};
            const leadName = String(
              projectDraft?.leadName
                || metadata.leadName
                || metadataLead.name
                || currentUserName
                || currentUserEmail
                || "Project Lead"
            ).trim();
            const leadEmail = String(
              projectDraft?.leadEmail
                || metadata.leadEmail
                || metadataLead.email
                || currentUserEmail
                || ""
            ).trim();
            const leadAvatarUrl = String(
              projectDraft?.leadAvatarUrl
                || metadata.leadAvatarUrl
                || metadataLead.avatarUrl
                || metadataLead.photoUrl
                || currentUserAvatarUrl
                || ""
            ).trim();
            return {
              name: leadName || "Project Lead",
              email: leadEmail,
              avatarUrl: leadAvatarUrl,
            };
          }

          function assignCurrentUserAsProjectLead(event) {
            if (event?.preventDefault) {
              event.preventDefault();
            }
            const leadName = String(currentUserName || currentUserEmail || "Project Lead").trim();
            const leadEmail = String(currentUserEmail || "").trim();
            const leadAvatarUrl = String(currentUserAvatarUrl || "").trim();
            const leadUserId = leadEmail || leadName || "current";
            setProjectDraft((current) => {
              const currentRecord = current && typeof current === "object" ? current : {};
              const currentMetadata = currentRecord.metadata && typeof currentRecord.metadata === "object" && !Array.isArray(currentRecord.metadata)
                ? currentRecord.metadata
                : {};
              return {
                ...currentRecord,
                leadUserId,
                leadName,
                leadEmail,
                leadAvatarUrl,
                metadata: {
                  ...currentMetadata,
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
                },
              };
            });
          }

          function renderProjectLeadSelector(options = {}) {
            const lead = getProjectDraftLeadDisplay();
            const label = String(options?.label || "Lead").trim() || "Lead";
            return React.createElement("button", {
                type: "button",
                className: "playground-tasks-project-lead-selector",
                onClick: assignCurrentUserAsProjectLead,
                title: "Project lead",
              },
              React.createElement("span", { className: "playground-tasks-project-lead-label" }, label),
              React.createElement("span", { className: "playground-tasks-project-lead-person" },
                canRenderAvatarImage(lead.avatarUrl)
                  ? React.createElement("img", {
                      className: "playground-tasks-project-lead-avatar",
                      src: lead.avatarUrl,
                      alt: lead.name,
                      draggable: false,
                    })
                  : React.createElement("span", { className: "playground-tasks-project-lead-avatar" },
                      React.createElement(User, { width: 13, height: 13, strokeWidth: 1.8 })
                    ),
                React.createElement("span", { className: "playground-tasks-project-lead-copy" },
                  React.createElement("span", { className: "playground-tasks-project-lead-name" }, lead.name),
                  lead.email
                    ? React.createElement("span", { className: "playground-tasks-project-lead-email" }, lead.email)
                    : null
                )
              ),
              React.createElement(ChevronDown, { className: "playground-tasks-project-lead-chevron", strokeWidth: 1.8 })
            );
          }

          const isInitialProjectSetupModal = !embedded && projectComposerMode === "create";

          function renderProjectInitialSetupField(label, child, className = "") {
            return React.createElement("div", {
                className: "playground-tasks-project-initial-setup-field" + (className ? " " + className : ""),
              },
              React.createElement("div", { className: "playground-tasks-project-initial-setup-label" }, label),
              child
            );
          }

          function renderProjectInitialGoalField() {
            return React.createElement(PlatformInstructionsEditor, {
              value: String(projectDraft.description || ""),
              onChange: (value) => setProjectDraft((current) => ({
                ...current,
                description: String(value || "").slice(0, 10000),
              })),
              title: "Project goal",
              placeholder: "Define the project goal, scope, working style, and constraints.",
              ariaLabel: "Project goal",
              readOnly: projectSaveState.isSaving,
              stickyHeader: false,
              historyKey: "project-create-goal",
              variant: "minimalistic-ui",
              contentVariant: "text",
              className: "playground-project-create-modal__description-editor",
            });
          }

          function renderProjectComposerIconPicker() {
            const projectIcon = getPlaygroundProjectIconId(projectDraft.icon);
            const projectColor = String(
              projectDraft.color
              || projectDraft.metadata?.color
              || PLAYGROUND_PROJECT_ACCENT_COLORS[0]
            ).trim() || PLAYGROUND_PROJECT_ACCENT_COLORS[0];
            return React.createElement(ProjectIconPicker, {
              projectName: String(projectDraft.name || "New Project").trim() || "New Project",
              icon: projectIcon,
              color: projectColor,
              iconOptions: PLAYGROUND_PROJECT_ICON_OPTIONS,
              colorOptions: PLAYGROUND_PROJECT_ACCENT_COLORS,
              showProjectName: false,
              onChange: (nextIdentity) => {
                const nextIcon = getPlaygroundProjectIconId(nextIdentity?.icon);
                const nextColor = String(nextIdentity?.color || projectColor).trim() || projectColor;
                setProjectDraft((current) => ({
                  ...current,
                  icon: nextIcon,
                  color: nextColor,
                  metadata: {
                    ...(current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                      ? current.metadata
                      : {}),
                    icon: nextIcon,
                    color: nextColor,
                  },
                }));
                return true;
              },
              className: "playground-project-create-modal__icon-picker",
            });
          }

          function renderProjectComposerNameControl() {
            return React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-project-modal-icon-trigger" + (projectIconPickerOpen ? " is-active" : ""),
                onClick: (event) => {
                  event.preventDefault();
                  setProjectIconPickerOpen((current) => !current);
                },
                title: "Choose project icon",
              },
                React.createElement(SelectedProjectIcon, { width: 20, height: 20, strokeWidth: 1.9 })
              ),
              React.createElement("input", {
                className: "playground-tasks-project-modal-name-input",
                value: projectDraft.name,
                onChange: (event) => updateProjectDraftName(event.target.value),
                placeholder: "Project name",
                autoFocus: !embedded,
              }),
              projectIconPickerOpen
                ? React.createElement("div", { className: "playground-tasks-project-icon-picker" },
                    PLAYGROUND_PROJECT_ICON_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      const isActive = projectDraft.icon === option.id;
                      return React.createElement("button", {
                        key: option.id,
                        type: "button",
                        className: "playground-tasks-project-icon-option" + (isActive ? " is-active" : ""),
                        title: option.label,
                        onClick: (event) => {
                          event.preventDefault();
                          setProjectDraft((current) => ({ ...current, icon: option.id }));
                          setProjectIconPickerOpen(false);
                        },
                      },
                        React.createElement(Icon, { width: 18, height: 18, strokeWidth: 1.9 })
                      );
                    })
                  )
                : null
            );
          }

          function updateProjectComposerProperty(property, value) {
            setProjectDraft((current) => ({
              ...current,
              [property]: value,
              metadata: {
                ...(current?.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                  ? current.metadata
                  : {}),
                [property]: value,
              },
            }));
          }

          function createProjectComposerSidebarSelectorOption(option) {
            const value = String(option?.value || option?.id || option?.key || option?.label || "").trim();
            const label = String(option?.label || option?.name || value || "Option").trim();
            const description = String(option?.description || option?.email || "").trim();
            return {
              value,
              label,
              description: description || undefined,
              leading: option?.icon || undefined,
              trailing: option?.trailing || undefined,
              ariaLabel: option?.ariaLabel,
              disabled: option?.disabled === true,
              selected: option?.selected === true,
              onSelect: option?.onSelect,
            };
          }

          function renderProjectComposerSidebarRow(label, value, options = {}) {
            const content = options.content || React.createElement("span", null, value || "None");
            return React.createElement("div", {
                className: "playground-tasks-detail-fact playground-project-overview-sidebar-row"
                  + (options.className ? " " + options.className : ""),
              },
              React.createElement("div", {
                className: "playground-tasks-detail-fact-label playground-project-overview-sidebar-row-label",
              }, label),
              React.createElement("div", {
                className: "playground-tasks-detail-fact-control playground-project-overview-sidebar-row-value"
                  + (!value && !options.content ? " playground-project-overview-sidebar-muted" : "")
                  + (options.editable ? " is-editable" : ""),
              }, content)
            );
          }

          function renderProjectComposerSidebarSelectControl(id, value, content, options = {}) {
            const normalizedId = String(id || "").trim();
            const selectorOptions = Array.isArray(options.options)
              ? options.options.filter((option) => option?.value)
              : [];
            const selectedOption = selectorOptions.find((option) => option.selected)
              || selectorOptions.find((option) => option.value === String(value || ""));
            const selectedValue = String(selectedOption?.value || value || "");
            return React.createElement(PlatformSelector, {
              value: selectedValue,
              options: selectorOptions,
              onValueChange: (nextValue, option) => {
                if (typeof options.onValueChange === "function") {
                  options.onValueChange(nextValue, option);
                } else if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
              },
              ariaLabel: String(options.ariaLabel || ("Select project " + normalizedId)),
              label: content,
              placeholder: content,
              open: Boolean(normalizedId && projectOverviewSidebarPropertyPopover === normalizedId),
              onOpenChange: (nextOpen) => {
                setProjectOverviewSidebarPropertyPopover(nextOpen ? normalizedId : "");
                if (typeof options.onOpenChange === "function") {
                  options.onOpenChange(nextOpen);
                }
              },
              disabled: options.disabled === true,
              loading: options.loading === true,
              loadingContent: options.loadingContent || "Loading organization members...",
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent: options.emptyContent || "No options available.",
              popupHeader: options.popupHeader || null,
              popupHeaderClassName: options.popupHeaderClassName || "",
              optionClassName: options.optionClassName || "",
              popupWidth: "min(280px, calc(100vw - 48px))",
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight: "min(320px, calc(100vh - 120px))",
              className: "playground-tasks-detail-central-selector playground-project-overview-sidebar-selector"
                + (options.empty ? " is-empty" : ""),
              triggerClassName: "playground-tasks-detail-central-selector-trigger playground-project-overview-sidebar-selector-trigger"
                + (options.empty ? " is-empty" : ""),
              popupClassName: "playground-tasks-detail-central-selector-popup playground-project-overview-sidebar-selector-popup"
                + (options.popupClassName ? " " + options.popupClassName : ""),
            });
          }

          function renderProjectComposerStatusIcon(option) {
            const StatusIcon = option?.icon || Circle;
            return React.createElement(StatusIcon, {
              className: [
                "playground-tasks-status-icon",
                option?.toneClassName,
                "playground-project-overview-status-icon",
              ].filter(Boolean).join(" "),
              strokeWidth: option?.id === "in_progress" ? 1.7 : 2,
              "aria-hidden": "true",
            });
          }

          function renderProjectComposerStatusContent(option) {
            return React.createElement("span", {
                className: [
                  "playground-tasks-status-value",
                  option?.toneClassName,
                  "playground-project-overview-status-value",
                ].filter(Boolean).join(" "),
              },
              renderProjectComposerStatusIcon(option),
              React.createElement("span", {
                className: "playground-tasks-status-value-label playground-tasks-detail-select-trigger-label",
              }, option?.label || "Backlog")
            );
          }

          function renderProjectComposerProperties() {
            const currentStatusValue = normalizePlaygroundProjectStatus(projectDraft.status || projectDraft.metadata?.status || "backlog");
            const statusOptions = PLAYGROUND_PROJECT_STATUS_OPTIONS.map((option) => ({
              ...option,
              selected: option.id === currentStatusValue,
            }));
            const currentStatusOption = statusOptions.find((option) => option.selected) || statusOptions[0];
            const currentPriorityValue = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === projectDraft.priority)
              ? projectDraft.priority
              : "medium";
            return React.createElement("div", {
                className: "playground-tasks-detail-facts is-centralized-sidebar-content playground-project-create-modal__properties",
              },
              React.createElement("div", {
                  className: "playground-tasks-detail-facts-body playground-project-overview-sidebar-rows",
                },
                renderProjectComposerSidebarRow("Status", currentStatusOption.label, {
                  editable: true,
                  content: renderProjectComposerSidebarSelectControl(
                    "create-project-status",
                    currentStatusValue,
                    renderProjectComposerStatusContent(currentStatusOption),
                    {
                      ariaLabel: "Project status",
                      onValueChange: (nextStatus) => updateProjectComposerProperty(
                        "status",
                        normalizePlaygroundProjectStatus(nextStatus)
                      ),
                      options: statusOptions.map((option) => createProjectComposerSidebarSelectorOption({
                        id: option.id,
                        label: option.label,
                        selected: option.selected,
                        icon: renderProjectComposerStatusIcon(option),
                      })),
                    }
                  ),
                }),
                renderProjectComposerSidebarRow("Priority", getPlaygroundTaskPriorityLabel(currentPriorityValue), {
                  editable: true,
                  content: renderProjectComposerSidebarSelectControl(
                    "create-project-priority",
                    currentPriorityValue,
                    renderPlaygroundTaskPriorityLabel(currentPriorityValue),
                    {
                      ariaLabel: "Project priority",
                      onValueChange: (nextPriority) => updateProjectComposerProperty(
                        "priority",
                        PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === nextPriority)
                          ? nextPriority
                          : "medium"
                      ),
                      options: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) => createProjectComposerSidebarSelectorOption({
                        id: option.id,
                        label: option.label,
                        selected: option.id === currentPriorityValue,
                        icon: renderPlaygroundTaskPriorityIcon(option.id),
                      })),
                    }
                  ),
                }),
                renderProjectComposerSidebarRow("Computer", projectDefaultEnvironmentLabel, {
                  editable: true,
                  content: renderProjectComposerSidebarSelectControl(
                    "create-project-computer",
                    selectedProjectEnvironmentId,
                    React.createElement(React.Fragment, null,
                      React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.85 }),
                      React.createElement("span", null, projectDefaultEnvironmentLabel)
                    ),
                    {
                      ariaLabel: "Project computer",
                      emptyContent: "No computers available.",
                      onValueChange: (nextEnvironmentId) => {
                        updateProjectComposerProperty("defaultEnvironmentId", nextEnvironmentId || null);
                        setProjectAttachmentTransferState((current) => ({ ...current, error: "" }));
                      },
                      options: projectComposerAvailableEnvironments.map((environment) => createProjectComposerSidebarSelectorOption({
                        id: environment.id,
                        label: environment.name + (environment.isDefault ? " (Default)" : ""),
                        description: environment.isDefault ? "Default computer" : "",
                        selected: environment.id === selectedProjectEnvironmentId,
                        icon: React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.85 }),
                      })),
                    }
                  ),
                })
              )
            );
          }

          function renderProjectInitialSetupBody() {
            return React.createElement("div", { className: "playground-tasks-project-initial-setup-body" },
              renderProjectInitialGoalField(),
              renderProjectComposerProperties()
            );
          }

          const projectComposerForm = React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "playground-tasks-project-modal playground-tasks-project-composer-modal"
                    + (isInitialProjectSetupModal ? " playground-tasks-project-initial-setup-modal" : "")
                    + (isInitialProjectSetupModal && projectInitialSetupModalVisible ? " is-visible" : "")
                    + (isInitialProjectSetupModal && projectInitialSetupModalClosing ? " is-closing" : ""),
                  onClick: (event) => event.stopPropagation(),
                  onKeyDown: handleComposerSubmitShortcut,
                  onSubmit: (event) => void (projectComposerMode === "edit" ? handleSaveProject(event) : handleCreateProject(event)),
                },
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
                  renderProjectComposerNameControl(),
                  renderProjectComposerEnvironmentPicker(),
                  embedded
                    ? null
                    : React.createElement("button", {
                        type: "button",
                        className: "playground-settings-icon-button playground-tasks-project-modal-close",
                        onClick: () => closeProjectComposer(),
                        title: "Close",
	                      }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                ),
	                embedded ? renderProjectWallpaperPicker() : null,
	                isInitialProjectSetupModal
	                  ? renderProjectInitialSetupBody()
	                  : null,
	                isInitialProjectSetupModal ? null : renderProjectBlueprintSelector(),
	                isInitialProjectSetupModal ? null : renderProjectLeadSelector(),
	                isInitialProjectSetupModal ? null : React.createElement("div", { className: "playground-tasks-attachments playground-tasks-project-modal-attachments" },
	                  React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
	                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Attachments"),
	                      React.createElement("div", { className: "playground-tasks-attachments-actions" },
	                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                          onClick: openProjectEnvironmentFilePicker,
                          disabled: projectAttachmentTransferState.isProcessing || !activeProjectAttachmentEnvironmentId,
                          title: activeProjectAttachmentEnvironmentId
                            ? "Add files from " + (activeProjectAttachmentEnvironment?.name || "the selected environment")
                            : "Select an environment first",
	                        }, "Upload from Computer")
                      )
                    ),
                    React.createElement("input", {
                      ref: projectAttachmentInputRef,
                      type: "file",
                      multiple: true,
                      hidden: true,
                      onChange: (event) => void handleProjectAttachmentInputChange(event),
                    }),
                    React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                      React.createElement("div", {
                        className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isProjectAttachmentDragging ? " dragging" : "") + (hasProjectAttachments ? " is-filled" : ""),
                        onDragOver: (event) => {
                          event.preventDefault();
                          if (!activeProjectAttachmentEnvironmentId) {
                            return;
                          }
                          setIsProjectAttachmentDragging(true);
                        },
                        onDragLeave: (event) => {
                          if (event.currentTarget.contains(event.relatedTarget)) {
                            return;
                          }
                          setIsProjectAttachmentDragging(false);
                        },
                        onDrop: (event) => void handleProjectAttachmentDrop(event),
                      },
                        hasProjectAttachments
                          ? React.createElement(React.Fragment, null,
                              React.createElement("div", { className: "playground-tasks-attachments-topline" },
                                React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                React.createElement("span", null, isProjectAttachmentDragging ? "Drop files here" : "Drop files to attach, or"),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-tasks-attachments-browse",
                                  onClick: openProjectAttachmentPicker,
                                }, "browse.")
                              ),
                              React.createElement("div", { className: "runner-attachments" },
                                projectAttachments.map((attachment) =>
                                  renderTaskAttachmentChip(attachment, {
                                    removable: true,
                                    activeAttachmentId: projectPreviewedAttachmentId,
                                    onPreview: handleProjectAttachmentPreviewToggle,
                                    onRemove: handleRemoveProjectAttachment,
                                  })
                                )
                              )
                            )
                          : React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-attachments-empty-button",
                              onClick: openProjectAttachmentPicker,
                            },
                              React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                              React.createElement("span", { className: "tb-popup-dropzone-title" }, isProjectAttachmentDragging ? "Drop files here" : "Drag & drop files here"),
                              React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                            )
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-connectors playground-tasks-project-modal-connectors" },
                      React.createElement("div", { className: "playground-plugins-section-header playground-tasks-project-modal-plugins-header" },
                        React.createElement("div", { className: "playground-plugins-section-copy" },
                          React.createElement("h3", { className: "playground-plugins-section-title" }, "Project Plugins"),
                          React.createElement("div", { className: "playground-tasks-secondary-copy" },
                            "Connect project-scoped plugin access so agents can read and write the right repositories, drives, and workspaces while they work."
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-connectors-list" },
                        projectConnectorEntries.map((connector) =>
                          React.createElement("div", {
                            key: connector.key,
                            className: "playground-tasks-connector-row",
                          },
                            React.createElement("div", { className: "playground-tasks-connector-service" },
                              renderTaskConnectorServiceIcon(connector.source, "playground-tasks-connector-service-icon"),
                              React.createElement("span", { className: "playground-tasks-connector-service-label" }, connector.label)
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                              React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-detail-fact-button" + (connector.selection ? "" : " is-empty"),
                                onClick: () => openProjectComposerConnectorBrowser(connector.source),
                              }, connector.valueLabel)
                            )
                          )
                        )
                      )
                    ),
                    previewedProjectAttachment
                      ? React.createElement("div", { className: "tb-runner-document-preview-host tb-runner-document-preview-host-inline playground-tasks-detail-preview-host playground-tasks-project-modal-preview" },
                          React.createElement(RunnerDocumentPreviewDrawer, {
                            attachment: previewedProjectAttachment,
                            backendUrl,
                            requestHeaders,
                            inline: true,
                            onClose: () => setProjectPreviewedAttachmentId(""),
                            showResizeHandle: false,
                          })
                        )
                      : null,
                    projectAttachmentTransferState.isProcessing
                      ? React.createElement("div", { className: "playground-tasks-attachments-status" }, "Uploading attachments...")
                      : null,
	                    projectAttachmentTransferState.error
	                      ? React.createElement("div", { className: "playground-environments-error" }, projectAttachmentTransferState.error)
	                      : null
	                  ),
	                isInitialProjectSetupModal ? null : React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
	                  React.createElement("div", { className: "playground-tasks-detail-section-header" },
	                    React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Goal"),
	                    React.createElement("div", { className: "playground-tasks-detail-format-actions" },
                      [
                        { id: "bold", label: "Bold", icon: Bold },
                        { id: "italic", label: "Italic", icon: Italic },
                        { id: "underline", label: "Underline", icon: Underline },
                        { id: "list", label: "List", icon: List },
                      ].map((action) =>
                        React.createElement("button", {
                          key: action.id,
                          type: "button",
                          className: "playground-tasks-detail-format-button",
                          title: action.label,
                          "aria-label": action.label,
                          onMouseDown: (event) => event.preventDefault(),
                          onClick: () => handleProjectDescriptionFormat(action.id),
                        }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isProjectDescriptionEditing ? " is-editing" : " is-preview") },
                    !isProjectDescriptionEditing
                      ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                          String(projectDraft.description || "").trim()
                            ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                content: projectDraft.description,
                                className: "playground-tasks-detail-description-preview tb-message-markdown",
                              })
                            : React.createElement("div", {
                                className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                              }, "Define the project goal, scope, working style, and constraints.")
                        )
                      : null,
                    React.createElement("textarea", {
                      ref: projectDescriptionTextareaRef,
                      className: "playground-tasks-detail-description-input " + (isProjectDescriptionEditing ? "is-editing" : "is-preview"),
                      rows: 1,
                      placeholder: isProjectDescriptionEditing ? "Define the project goal, scope, working style, and constraints." : "",
                      value: projectDraft.description,
                      onFocus: () => setProjectDescriptionEditing(true),
                      onChange: (event) => {
                        setProjectDraft((current) => ({ ...current, description: event.target.value }));
                        resizeTaskDescriptionTextarea(event.currentTarget);
                      },
                      onBlur: () => {
                        setProjectDescriptionEditing(false);
                      },
                    })
                  )
                ),
                projectSaveState.error
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, projectSaveState.error)
                  : null,
                embedded
                  ? React.createElement("div", { className: "playground-tasks-project-modal-actions playground-mission-control-setup-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-mission-control-studio-save-button",
                        onClick: () => void handleSaveProjectFromStudio(),
                        disabled: projectSaveState.isSaving || !String(projectDraft.name || "").trim(),
                      }, projectSaveState.isSaving ? "Saving..." : "Save Project")
                    )
                  : React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button",
                        onClick: () => closeProjectComposer(),
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "medium",
                        type: "submit",
                        className: "playground-environments-action-button is-primary",
                        disabled: projectSaveState.isSaving || !String(projectDraft.name || "").trim(),
                      }, projectSaveState.isSaving
                        ? "Saving..."
                        : "Save Project")
                    )
              )
          ;

	          if (embedded) {
	            return React.createElement(React.Fragment, null,
	              React.createElement("div", { className: "playground-mission-control-setup-form" },
	                projectComposerForm
	              )
	            );
	          }

	          if (isInitialProjectSetupModal) {
	            const canCreateProject = !projectSaveState.isSaving
	              && Boolean(String(projectDraft.name || "").trim());
	            return React.createElement(PlatformModal, {
	                open: projectComposerOpen && !projectInitialSetupModalClosing,
	                visible: projectInitialSetupModalVisible,
	                closing: projectInitialSetupModalClosing,
	                title: "New Project",
	                headerVariant: "search",
	                headerLeading: renderProjectComposerIconPicker(),
	                headerSearchProps: {
	                  icon: null,
	                  value: String(projectDraft.name || ""),
	                  maxLength: 500,
	                  placeholder: "Project name",
	                  "aria-label": "Project name",
	                  autoComplete: "off",
	                  disabled: projectSaveState.isSaving,
	                  onChange: (event) => updateProjectDraftName(event.target.value),
	                },
	                as: "form",
	                size: "large",
	                maxHeight: "min(720px, calc(100vh - 48px))",
	                scrollable: true,
	                className: "playground-project-create-modal playground-tasks-project-initial-setup-modal",
	                bodyClassName: "playground-project-create-modal__body",
	                footerClassName: "playground-project-create-modal__footer",
	                footer: React.createElement(React.Fragment, null,
	                  React.createElement(PlatformSecondaryButton, {
	                    type: "button",
	                    size: "medium",
	                    onClick: () => closeProjectComposer(),
	                    disabled: projectSaveState.isSaving,
	                  }, "Cancel"),
	                  React.createElement(PlatformPrimaryButton, {
	                    type: "submit",
	                    size: "medium",
	                    disabled: !canCreateProject,
	                  }, projectSaveState.isSaving ? "Creating..." : "Create Project")
	                ),
	                animationDurationMs: projectInitialSetupModalAnimationMs,
	                closeOnBackdrop: !projectSaveState.isSaving,
	                closeOnEscape: !projectSaveState.isSaving,
	                closeButtonDisabled: projectSaveState.isSaving,
	                onClose: () => {
	                  if (!projectSaveState.isSaving) closeProjectComposer();
	                },
	                surfaceProps: {
	                  onKeyDown: (event) => {
	                    if (canCreateProject) handleComposerSubmitShortcut(event);
	                  },
	                  onSubmit: (event) => void handleCreateProject(event),
	                },
	              },
	              renderProjectInitialSetupBody(),
	              projectSaveState.error
	                ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, projectSaveState.error)
	                : null
	            );
	          }

	          return React.createElement(PlatformModalBackdrop, {
	              className: "playground-tasks-project-modal-backdrop",
	              onClick: () => closeProjectComposer(),
	            },
	            projectComposerForm
`;
