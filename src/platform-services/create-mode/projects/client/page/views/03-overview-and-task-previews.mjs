export const PROJECTS_VIEWS_03_FRAGMENT = `	                  agents: backlogComposerAgents,
	                  skills: skills,
	                  skillDefaults: getDemoImageGenerationSkillDefaults(),
	                  environmentId: backlogComposerEnvironmentId || undefined,
	                  agentId: effectiveBacklogComposerAgentId || undefined,
	                  autoFocusComposer: true,
	                  keepFocusOnSubmit: true,
                  enableBacklogSubtaskCommand: true,
                  backlogTaskConnectors: normalizePlaygroundTaskConnectorSelections(selectedProject?.connectors),
                  backlogSubtaskCommand: backlogComposerSubtaskCommandRequest,
                  enableBacklogMissionControlCommand: true,
                  backlogMissionControlCommand: backlogComposerMissionControlCommandRequest,
                  showUsageInStatus: false,
	                  placeholder: "Add a new task",
	                  onRunStart: handleBacklogComposerRunStart,
	                  onRunFinish: handleBacklogComposerRunFinish,
	                  onBacklogMissionControlSubmit: handleBacklogMissionControlSubmit,
	                  isAgentSelectionBlocked: (agent) => normalizedSubscriptionTierId === "free" && isPlaygroundFreePlanLockedComposerAgent(agent),
	                  onBlockedAgentSelect: openProjectAgentUpgradeModal,
	                  onAgentChange: (nextAgentId) => setBacklogComposerAgentId(nextAgentId),
                  onEnvironmentChange: (nextEnvironmentId) => setBacklogComposerEnvironmentId(nextEnvironmentId),
                  onDocumentPreviewOpenChange: () => {
                  },
                  onDeepResearchDetailOpenChange: () => {
                  },
                })
              ),
          });
        }

        function renderBoardView() {
          const boardTasks = boardVisibleTasks;
          const draggingBoardTask = boardDraggingTaskId ? tasksById[boardDraggingTaskId] || null : null;
          const hasSelectedReleaseSection = Boolean(selectedReleaseId && selectedRelease);

          function isTaskInBoardReleaseSection(taskRecord, releaseId) {
            const taskReleaseId = typeof taskRecord?.releaseId === "string" && taskRecord.releaseId.trim()
              ? taskRecord.releaseId.trim()
              : "";
            const normalizedReleaseId = typeof releaseId === "string" && releaseId.trim()
              ? releaseId.trim()
              : "";
            return taskReleaseId === normalizedReleaseId;
          }

          function renderBoardToolbar() {
            return React.createElement("div", {
                className: "playground-tasks-backlog-header is-board-list-header",
                ref: boardToolbarActionsRef,
              },
              React.createElement("div", { className: "playground-tasks-backlog-header-row" },
                React.createElement("div", { className: "playground-tasks-backlog-header-main" },
                  React.createElement("div", { className: "playground-tasks-backlog-heading" }, "Board"),
                  React.createElement(PlatformPopup, {
                      open: boardToolbarPopover === "filter",
                      rootClassName: "playground-tasks-board-filter-shell is-central-popup",
                      surfaceClassName: "platform-data-table__floating-menu playground-tasks-board-filter-menu is-central-popup",
                      surfaceProps: {
                        role: "menu",
                        "aria-label": "Filter board",
                      },
                      animation: "down-in",
                      variant: "minimal",
                      placement: "bottom-start",
                      trigger: React.createElement("button", {
                        type: "button",
                        className: "platform-data-table__toolbar-button is-icon-only"
                          + (boardToolbarPopover === "filter" || boardFilterMode !== "all" ? " is-open" : ""),
                        onClick: (event) => {
                          event.stopPropagation();
                          setBoardToolbarPopover((current) => current === "filter" ? "" : "filter");
                        },
                        title: "Filter board",
                        "aria-label": "Filter board",
                        "aria-haspopup": "menu",
                        "aria-expanded": boardToolbarPopover === "filter" ? "true" : "false",
                      }, React.createElement(ListFilter, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      })),
                    },
                    boardFilterOptions.map((option) =>
                      React.createElement("button", {
                        key: option.id,
                        type: "button",
                        role: "menuitemradio",
                        "aria-checked": boardFilterMode === option.id ? "true" : "false",
                        className: "platform-data-table__menu-item",
                        onClick: () => {
                          setBoardFilterMode(option.id);
                          setBoardToolbarPopover("");
                        },
                      },
                        React.createElement("span", { className: "platform-data-table__menu-icon" },
                          boardFilterMode === option.id
                            ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                            : null
                        ),
                        React.createElement("span", { className: "platform-data-table__menu-copy" },
                          React.createElement("span", { className: "platform-data-table__menu-label" }, option.label),
                          React.createElement("span", { className: "platform-data-table__menu-description" }, option.description)
                        )
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-backlog-header-actions" },
                  React.createElement(PlatformSearch, {
                    className: "playground-tasks-board-central-search",
                    value: searchQuery,
                    onChange: (event) => setSearchQuery(event.target.value),
                    placeholder: "Search tasks",
                    "aria-label": "Search board tasks",
                  })
                )
              )
            );
          }

          function renderBoardCard(task) {
            const boardStatus = getTaskBoardStatus(task);
            const statusLabel = getPlaygroundTaskStatusLabel(boardStatus);
            const isSubtask = isPlaygroundSubtaskRecord(task);
            const TaskTypeIcon = isSubtask ? Check : Bookmark;
            const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "001";
            const taskDescription = String(task.description || "").trim() || "No description";
            const isDraggable = canDropTaskOnBoardLane(task, "blocked") || canDropTaskOnBoardLane(task, "in_progress") || canDropTaskOnBoardLane(task, "todo");
            return React.createElement(PlatformTicketItem, {
                key: task.id,
                variant: "card",
                title: task.title || "Untitled Task",
                description: React.createElement(PlaygroundTaskDescriptionMarkdown, {
                  content: taskDescription,
                  className: "tb-message-markdown",
                }),
                taskType: isSubtask ? "subtask" : "task",
                typeIcon: React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 }),
                priority: renderPlaygroundTaskPriorityIcon(task.priority, "playground-tasks-lane-card-priority"),
                ticketNumber: taskTicketNumber,
                status: React.createElement("span", {
                  className: "playground-tasks-lane-card-status",
                  title: statusLabel,
                }, statusLabel),
                assignee: renderTaskAssigneeAvatar(task, "playground-tasks-board-assignee-avatar"),
                completed: task.status === "done",
                active: selectedTaskId === task.id,
                className: ""
                  + (isDraggable ? " is-draggable" : "")
                  + (boardDraggingTaskId === task.id ? " is-dragging" : ""),
                style: getPlaygroundTaskColorStyle(task.taskColor),
                onClick: () => openProjectTaskDetailScreen(task.id),
                draggable: isDraggable,
                onDragStart: (event) => {
                  if (!isDraggable) {
                    event.preventDefault();
                    return;
                  }
                  if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", task.id);
                  }
                  setBoardDraggingTaskId(task.id);
                  setBoardDropLaneId("");
                },
                onDragEnd: () => {
                  clearBoardDragState();
                },
              });
          }

          function renderBoardReleaseLane(section, lane) {
            const normalizedSectionReleaseId = typeof section.releaseId === "string" && section.releaseId.trim()
              ? section.releaseId.trim()
              : "";
            const laneTasks = section.tasks.filter((task) => lane.statuses.includes(getTaskBoardStatus(task)));
            const laneDropTargetKey = section.key + ":" + lane.id;
            const isLaneDropTarget = boardDropLaneId === laneDropTargetKey
              && draggingBoardTask
              && isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId)
              && canDropTaskOnBoardLane(draggingBoardTask, lane.id);
            return React.createElement("div", {
                key: section.key + ":" + lane.id,
                className: "playground-tasks-board-release-box" + (isLaneDropTarget ? " is-drop-target" : ""),
              },
              React.createElement("div", { className: "playground-tasks-board-release-box-header" },
                React.createElement("div", { className: "playground-tasks-board-release-box-title" }, lane.label),
                React.createElement("span", { className: "playground-tasks-board-release-box-count" }, String(laneTasks.length))
              ),
              React.createElement("div", {
                  className: "playground-tasks-lane playground-tasks-board-release-lane-body",
                  onDragOver: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    if (event.dataTransfer) {
                      event.dataTransfer.dropEffect = "move";
                    }
                    if (boardDropLaneId !== laneDropTargetKey) {
                      setBoardDropLaneId(laneDropTargetKey);
                    }
                  },
                  onDragEnter: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    if (boardDropLaneId !== laneDropTargetKey) {
                      setBoardDropLaneId(laneDropTargetKey);
                    }
                  },
                  onDragLeave: (event) => {
                    const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
                      return;
                    }
                    if (boardDropLaneId === laneDropTargetKey) {
                      setBoardDropLaneId("");
                    }
                  },
                  onDrop: (event) => {
                    if (!draggingBoardTask || !isTaskInBoardReleaseSection(draggingBoardTask, normalizedSectionReleaseId) || !canDropTaskOnBoardLane(draggingBoardTask, lane.id)) {
                      return;
                    }
                    event.preventDefault();
                    void handleBoardLaneMove(draggingBoardTask, lane.id);
                  },
                },
                laneTasks.length > 0
                  ? React.createElement("div", { className: "playground-tasks-lane-list" },
                      laneTasks.map((task) => renderBoardCard(task))
                    )
                  : null
              )
            );
          }

          function renderBoardSection(section) {
            const sectionRelease = section.releaseId ? (releasesById[section.releaseId] || null) : null;
            return React.createElement("div", {
                key: section.key,
                className: "playground-tasks-board-release-section",
              },
              React.createElement("div", { className: "playground-tasks-board-release-section-header" },
                React.createElement("div", { className: "playground-tasks-backlog-section-copy-group" },
                  React.createElement("div", { className: "playground-tasks-backlog-section-title" }, section.title)
                ),
                renderReleaseHeaderMeta(sectionRelease)
              ),
              React.createElement("div", { className: "playground-tasks-board-grid" },
                PLAYGROUND_TASK_BOARD_LANES.map((lane) => renderBoardReleaseLane(section, lane))
              )
            );
          }

          const shouldRenderBoardSections = hasSelectedReleaseSection || boardReleaseSections.length > 0;
          const shouldShowMissionControlEmptyAction = !selectedRelease
            && !normalizedSearchQuery
            && boardFilterMode === "all"
            && !shouldRenderBoardSections;
          const emptyTitle = selectedRelease
            ? "No tasks in this milestone"
            : "No tasks on the board";
          const emptyCopy = selectedRelease
            ? "Assign tasks to this milestone or adjust the filter and they will appear in the appropriate lane."
            : shouldShowMissionControlEmptyAction
              ? "Run Mission Control to generate the first strategy and create the initial structured backlog for this project."
              : "Adjust the filter or add tasks to the project and they will appear in the appropriate board lane.";

          return React.createElement("div", { className: "playground-tasks-view-section" },
            renderBoardToolbar(),
            shouldRenderBoardSections
              ? React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "playground-tasks-board-sections" },
                    boardReleaseSections.map((section) => renderBoardSection(section))
                  )
                )
              : React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, emptyTitle),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, emptyCopy),
                  shouldShowMissionControlEmptyAction
                    ? React.createElement("div", { className: "playground-tasks-empty-actions" },
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-tasks-empty-primary-button playground-tasks-empty-mission-control-button",
                          onClick: () => openMissionControlComposer({ keepStrategyOpen: true }),
                        },
                          React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 2 }),
                          React.createElement("span", null, "Run Mission Control")
                        )
                      )
                    : null
                )
          );
        }

\${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar}
        function renderThreadsView() {
          return React.createElement("div", { className: "playground-tasks-view-section" },
            React.createElement("div", { className: "playground-tasks-project-panel" },
              React.createElement("div", { className: "playground-tasks-project-panel-header" },
                React.createElement("div", null,
                  React.createElement("div", { className: "playground-tasks-project-panel-title" }, "Threads"),
                  React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Threads created inside this project stay grouped here for quick reopening.")
                )
              ),
              filteredProjectThreads.length > 0
                ? React.createElement("div", { className: "playground-tasks-project-list" },
                    filteredProjectThreads.map((thread) =>
                      React.createElement("div", { key: thread.id, className: "playground-tasks-project-row" },
                        React.createElement("div", { className: "playground-tasks-project-row-main" },
                          React.createElement("div", { className: "playground-tasks-project-row-title" }, thread.title || "Untitled thread"),
                          React.createElement("div", { className: "playground-tasks-project-row-copy" }, formatRelativeThreadTime(thread.updatedAt || thread.createdAt) || "Recently updated")
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => onThreadStarted && onThreadStarted(thread.id),
                        }, "Open")
                      )
                    )
                  )
                : React.createElement("div", { className: "playground-tasks-secondary-copy" },
                    normalizedSearchQuery ? "No matching project threads." : "No project threads yet."
                  )
            )
          );
        }

\${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.upgradeModal}
        function renderProjectAgentUpgradeModal() {
          return renderPlaygroundAgentUpgradeModal({
            isOpen: projectAgentUpgradeModalOpen,
            titleId: "playground-project-agent-upgrade-title",
            onClose: closeProjectAgentUpgradeModal,
            onCheckout: handleProjectAgentUpgradeCheckout,
            checkoutLoading: projectAgentUpgradeCheckoutLoading,
            checkoutDisabled: typeof onUpgradeToIndividual !== "function",
          });
        }

        function renderMissionControlSetupEmptyState() {
          const capabilities = [
            {
              title: "Generate Strategy",
              copy: "Turn the project goal into a clear execution plan and working context.",
              Icon: SquarePen,
            },
            {
              title: "Generate Tickets",
              copy: "Create structured backlog work with owners, order, and dependencies.",
              Icon: ListTodo,
            },
            {
              title: "Generate Outcomes",
              copy: "Define measurable project outcomes and connect them to planned work.",
              Icon: Award,
            },
            {
              title: "Update Rules",
              copy: "Capture project-level instructions agents should follow on every task.",
              Icon: Shield,
            },
          ];
          return React.createElement("div", { className: "playground-mission-control-setup-empty-card" },
            React.createElement("div", { className: "playground-mission-control-setup-empty-kicker" }, "Mission Control"),
            React.createElement("div", { className: "playground-mission-control-setup-empty-title" }, "Plan or update this project"),
            React.createElement("div", { className: "playground-mission-control-capability-list" },
              capabilities.map((capability) =>
                React.createElement("div", { key: capability.title, className: "playground-mission-control-capability-item" },
                  React.createElement(getPlaygroundSafeIconComponent(capability.Icon, Circle), { className: "playground-mission-control-capability-icon", strokeWidth: 1.8 }),
                  React.createElement("div", { className: "playground-mission-control-capability-copy-shell" },
                    React.createElement("div", { className: "playground-mission-control-capability-title" }, capability.title),
                    React.createElement("div", { className: "playground-mission-control-capability-copy" }, capability.copy)
                  )
                )
              )
            )
          );
        }

        function renderMissionControlSetupView() {
          const normalizedProject = normalizePlaygroundProjectRecord(projectComposerOpen ? projectDraft : (selectedProject || buildPlaygroundDefaultProjectDraft()));
          const defaultEnvironmentId = String(
            normalizedProject.defaultEnvironmentId
            || backlogComposerEnvironmentId
            || initialEnvironmentId
            || ""
          ).trim();
          const missionControlRunnerEnvironments = availableBacklogEnvironments.map((environment) => ({
            ...environment,
            ...(defaultEnvironmentId && environment.id === defaultEnvironmentId ? { isDefault: true } : {}),
          }));
          const missionControlAgentId = String(missionControlAgent?.id || "").trim();
          const normalizedProjectId = String(normalizedProject.id || selectedProjectId || "").trim();
          const runnerProjectId = normalizedProjectId || "draft-project";
          const isMissionControlReady = Boolean(
            canStartThreads !== false
            && missionControlAgentId
            && !missionControlAgentPreparing
            && !missionControlAgentError
            && defaultEnvironmentId
          );
          const lockedProjectConfig = {
            ...(computerAgents && typeof computerAgents === "object" ? computerAgents : {}),
            projects: {
              ...((computerAgents?.projects && typeof computerAgents.projects === "object") ? computerAgents.projects : {}),
              items: [{
                id: runnerProjectId,
                name: normalizedProject.name || "Project",
                description: normalizedProject.description || "",
                defaultEnvironmentId: defaultEnvironmentId || null,
                connectors: normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors),
                color: normalizedProject.color || null,
                metadata: normalizedProject.metadata || null,
              }],
              selectedProjectId: runnerProjectId,
            },
          };

          return React.createElement("div", { className: "playground-mission-control-setup-pane" },
            React.createElement(RunnerChat, {
              key: "mission-control-setup:" + (normalizedProject.id || selectedProjectId || "project") + ":" + missionControlSetupResetToken,
              className: "playground-mission-control-setup-runner playground-mission-control-modal-runner",
              backendUrl,
              apiKey,
              fetchCustomSkills: fetchProjectCustomSkills,
              speechToTextUrl: speechToTextUrl || undefined,
              requestHeaders,
              appId: "runner-web-sdk-demo",
              title: (normalizedProject.name || "Project") + " Mission Control",
              threadMetadata: buildMissionControlThreadMetadata(normalizedProject, ""),
              projectId: normalizedProjectId || undefined,
              inputMode: "computer-agents",
              computerAgents: lockedProjectConfig,
              environments: missionControlRunnerEnvironments,
              agents: missionControlAgentId
                ? [buildPlaygroundRunnerAgentOption(missionControlAgent, { isDefault: true })]
                : [],
              skills: skills,
              skillDefaults: getDemoImageGenerationSkillDefaults(),
              environmentId: defaultEnvironmentId || undefined,
              agentId: missionControlAgentId || undefined,
              autoFocusComposer: true,
              keepFocusOnSubmit: true,
              showUsageInStatus: false,
              disabled: !isMissionControlReady,
              placeholder: "Develop your Project strategy and tasks by prompting Mission Control",
              emptyState: renderMissionControlSetupEmptyState(),
              onExternalRunRequestCreate: handleMissionControlSetupRunRequest,
            })
          );
        }

        function renderMissionControlStudio() {
          if (!missionControlSetupOpen || !projectComposerOpen) {
            return null;
          }
          const normalizedProject = normalizePlaygroundProjectRecord(projectDraft || selectedProject || buildPlaygroundDefaultProjectDraft());
          const projectGoalDraft = String(normalizedProject.description || "");
          const hasProjectGoal = Boolean(projectGoalDraft.trim());

          function renderMissionControlGoalEditor() {
            return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Project goal"),
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
                      hasProjectGoal
                        ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                            content: projectGoalDraft,
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
                  value: projectGoalDraft,
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
            );
          }

          function handleMissionControlOutcomesBlur() {
            setIsMissionControlSetupOutcomesEditing(false);
            updateMissionControlStrategyDraft(buildMissionControlSetupStrategyBriefFromDraft());
          }

          function renderMissionControlOutcomesEditor() {
            const currentStrategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraftRef.current || missionControlStrategyDraft);
            const outcomeRecords = parseMissionControlSetupOutcomesInput(missionControlSetupOutcomesDraft, currentStrategyBrief.outcomes);
            const hasOutcomeRecords = outcomeRecords.length > 0;

            function applyMissionControlSetupOutcomeRecords(nextOutcomes) {
              const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
                ...currentStrategyBrief,
                mission: String(projectDraft.description || "").replaceAll(String.fromCharCode(13), "").trim(),
                outcomes: nextOutcomes.map((outcome, index) => normalizePlaygroundStrategyOutcomeRecord(outcome, index)),
              });
              updateMissionControlStrategyDraft(nextStrategyBrief);
              syncMissionControlSetupOutcomesDraft(nextStrategyBrief);
            }

            function updateMissionControlSetupOutcomeTitle(indexToUpdate, nextValue) {
              setMissionControlSetupOutcomeTitleDrafts((current) => ({
                ...(current && typeof current === "object" ? current : {}),
                [indexToUpdate]: String(nextValue || ""),
              }));
              const nextOutcomes = outcomeRecords.map((outcome, index) => index === indexToUpdate
                ? normalizePlaygroundStrategyOutcomeRecord({ ...outcome, title: nextValue }, index)
                : outcome
              );
              applyMissionControlSetupOutcomeRecords(nextOutcomes);
            }

            function getMissionControlSetupOutcomeTitleValue(outcome, index) {
              if (
                missionControlSetupOutcomeTitleDrafts
                && typeof missionControlSetupOutcomeTitleDrafts === "object"
                && Object.prototype.hasOwnProperty.call(missionControlSetupOutcomeTitleDrafts, index)
              ) {
                return missionControlSetupOutcomeTitleDrafts[index];
              }
              return outcome.title || "";
            }

            function commitMissionControlSetupOutcomeTitle(indexToCommit) {
              setMissionControlSetupOutcomeTitleDrafts((current) => {
                if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, indexToCommit)) {
                  return current;
                }
                const nextDrafts = { ...current };
                delete nextDrafts[indexToCommit];
                return nextDrafts;
              });
              handleMissionControlOutcomesBlur();
            }

            function addMissionControlSetupOutcome() {
              setIsMissionControlSetupOutcomesEditing(true);
              setMissionControlSetupOutcomeMenuIndex(-1);
              applyMissionControlSetupOutcomeRecords(outcomeRecords.concat(normalizePlaygroundStrategyOutcomeRecord({
                id: "outcome-" + String(outcomeRecords.length + 1).padStart(2, "0"),
                title: "New outcome",
                description: "",
                successCriteria: [],
              }, outcomeRecords.length)));
            }

            function deleteMissionControlSetupOutcome(indexToDelete) {
              setMissionControlSetupOutcomeMenuIndex(-1);
              setMissionControlSetupOutcomeTitleDrafts({});
              applyMissionControlSetupOutcomeRecords(outcomeRecords.filter((_, index) => index !== indexToDelete));
            }

            function openMissionControlSetupOutcomeDetails(indexToOpen) {
              const outcome = outcomeRecords[indexToOpen];
              if (!outcome) {
                return;
              }
              const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
                ...currentStrategyBrief,
                outcomes: outcomeRecords,
              });
              updateMissionControlStrategyDraft(nextStrategyBrief);
              syncMissionControlSetupOutcomesDraft(nextStrategyBrief);
              setMissionControlSetupOutcomeMenuIndex(-1);
              setProjectOverviewOutcomeEditorState({
                index: indexToOpen,
                draft: buildProjectOverviewOutcomeEditorDraft(outcome, indexToOpen),
                source: "mission-control-setup",
              });
            }

            return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-mission-control-modal-context-editor playground-mission-control-modal-outcomes-editor" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Outcomes"),
                React.createElement("button", {
                  type: "button",
                  className: "playground-mission-control-modal-outcome-add",
                  onClick: addMissionControlSetupOutcome,
                  title: "Add outcome",
                  "aria-label": "Add outcome",
                }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.9 }))
              ),
              React.createElement("div", { className: "playground-mission-control-modal-outcomes-list" },
                hasOutcomeRecords
                  ? outcomeRecords.map((outcome, index) =>
                      React.createElement("div", {
                          key: outcome.id || ("mission-control-outcome-" + index),
                          className: "playground-mission-control-modal-outcome-row",
                        },
                        React.createElement("div", { className: "playground-mission-control-modal-outcome-copy" },
                          React.createElement("input", {
                            type: "text",
                            className: "playground-mission-control-modal-outcome-input",
                            value: getMissionControlSetupOutcomeTitleValue(outcome, index),
                            placeholder: "Outcome",
                            onFocus: () => setIsMissionControlSetupOutcomesEditing(true),
                            onChange: (event) => updateMissionControlSetupOutcomeTitle(index, event.target.value),
                            onBlur: () => commitMissionControlSetupOutcomeTitle(index),
                          })
                        ),
                        React.createElement("div", {
                            className: "playground-mission-control-modal-outcome-menu-shell playground-tasks-toolbar-popup-shell" + (missionControlSetupOutcomeMenuIndex === index ? " is-open" : ""),
                            ref: missionControlSetupOutcomeMenuIndex === index ? missionControlSetupOutcomeMenuRef : null,
                          },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-mission-control-modal-outcome-menu-trigger",
                            onClick: () => setMissionControlSetupOutcomeMenuIndex((current) => current === index ? -1 : index),
                            title: "Outcome options",
                            "aria-label": "Outcome options",
                            "aria-expanded": missionControlSetupOutcomeMenuIndex === index ? "true" : "false",
                          }, React.createElement(EllipsisVertical, { width: 14, height: 14, strokeWidth: 1.8 })),
                          missionControlSetupOutcomeMenuIndex === index
                            ? React.createElement(PlatformPopupSurface, {
                                className: "playground-tasks-toolbar-popup-menu playground-mission-control-modal-outcome-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                              },
                                React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row",
                                  onClick: () => openMissionControlSetupOutcomeDetails(index),
                                },
                                  React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, "Details")
                                  )
                                ),
                                React.createElement("button", {
                                  type: "button",
                                  className: "tb-popup-row playground-tasks-detail-menu-item-danger",
                                  onClick: () => deleteMissionControlSetupOutcome(index),
                                },
                                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                    React.createElement("span", null, "Delete outcome")
                                  )
                                )
                              )
                            : null
                        )
                      )
                    )
                  : React.createElement("button", {
                      type: "button",
                      className: "playground-mission-control-modal-outcomes-empty",
                      onClick: addMissionControlSetupOutcome,
                    }, "Add the first outcome")
              )
            );
          }

          const studioElement = React.createElement(PlatformModal, {
            open: missionControlSetupOpen && projectComposerOpen && !missionControlSetupClosing,
            visible: missionControlSetupVisible,
            closing: missionControlSetupClosing,
            onClose: () => closeMissionControlSetupModal(),
            closeOnEscape: false,
            animationDurationMs: missionControlSetupAnimationMs,
            size: "large",
            title: "Mission Control",
            className: "playground-mission-control-modal",
            ariaLabel: "Mission Control",
            showFooter: false,
            bodyProps: {
              style: {
                maxHeight: "calc(100dvh - 96px)",
                overflow: "auto",
              },
            },
          },
            React.createElement("div", { className: "playground-mission-control-modal-body" },
              React.createElement("div", { className: "playground-mission-control-modal-context" },
                renderMissionControlGoalEditor(),
                renderMissionControlOutcomesEditor(),
                missionControlAgentError
                  ? React.createElement("div", { className: "playground-mission-control-setup-error playground-environments-error" }, missionControlAgentError)
                  : null
              ),
              React.createElement("div", { className: "playground-mission-control-modal-composer" },
                renderMissionControlSetupView()
              )
            )
          );
          return React.createElement(React.Fragment, null,
            studioElement,
            renderSharedProjectOverviewOutcomeEditorModal({
              strategyBrief: normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft),
            })
          );
        }

\${PROJECT_OVERVIEW_SCRIPT}

        function renderSelectedProjectWorkspace() {
          if (!selectedProject) {
            return null;
          }

	          const projectWorkspaceTitle = selectedProjectWorkspaceTitle;
	          const selectedProjectAccessLevel = String(
	            selectedProject?.teamAccessLevel
	            || selectedProject?.metadata?.teamAccessLevel
	            || ""
	          ).trim().toLowerCase();
	          const canManageSelectedProject = Boolean(
	            isProjectCreatedByCurrentViewer(selectedProject)
	            || selectedProjectAccessLevel === "owner"
	            || selectedProjectAccessLevel === "manage"
	          );
	          const projectWorkspaceScrollClassName = "playground-environments-detail-scroll playground-tasks-project-workspace-scroll"
	            + (taskView === "overview" ? " is-overview" : "")
	            + (taskView === "backlog" ? " is-backlog" : "")
            + (taskView === "board" ? " is-board" : "");
          const projectWorkspaceScrollStyle = undefined;

          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace",
            },
            React.createElement("section", { className: "playground-environments-detail playground-tasks-project-workspace-detail" },
              useUnifiedProjectNav ? null : React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-tasks-project-navbar" },
                React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain playground-tasks-project-title-back",
                    onClick: () => {
                      setMissionControlSetupOpen(false);
                      handleSelectProject("");
                    },
                    title: "All Projects",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                    React.createElement("div", { className: "playground-content-title" }, projectWorkspaceTitle)
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" },
                  React.createElement("div", { className: "content-mode-switch playground-tasks-nav playground-tasks-project-nav-switch" },
                    projectSidebarNavItems.map((item) =>
                      React.createElement("button", {
                        key: item.id,
                        type: "button",
                        className: "content-mode-button" + (!missionControlSetupOpen && taskView === item.id ? " is-active" : ""),
                        onClick: () => {
                          setMissionControlSetupOpen(false);
                          setTaskView(item.id);
                          if (item.id === "calendar") {
                            setSelectedTaskId("");
                            setDraftTask(null);
                          }
                          setProjectSidebarPopover("");
                        },
                      }, item.label)
                    )
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions", ref: projectSidebarActionsRef },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-tasks-project-search-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "search" ? " is-active" : ""),
                      onClick: () => setProjectSidebarPopover((current) => current === "search" ? "" : "search"),
                      title: "Search project",
                    }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                    projectSidebarPopover === "search"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                          React.createElement("div", { className: "playground-tasks-project-search-header" },
                            React.createElement("div", { className: "playground-tasks-project-search-title" }, "Search Project"),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-tasks-project-search-close",
                              onClick: () => setProjectSidebarPopover(""),
                            }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                          ),
                          React.createElement("div", { className: "playground-tasks-project-search-body" },
                            React.createElement("div", { className: "playground-files-search-field" },
                              React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                              React.createElement("input", {
                                type: "text",
                                className: "playground-files-search-field-input",
                                placeholder: projectSearchPlaceholder,
                                value: searchQuery,
                                onChange: (event) => setSearchQuery(event.target.value),
                              })
                            ),
                            React.createElement("div", { className: "playground-tasks-project-search-hint" },
                              taskView === "overview"
                                ? "Search across tasks, threads, files, environments, assigned agents, and project plugins."
                                : taskView === "calendar"
                                ? "Filter tasks and schedules by title, task, agent, or environment."
                                : taskView === "backlog" && selectedReleaseId
                                  ? "Filter milestone tasks by title, ticket number, assignee, environment, or milestone."
                                  : "Filter tasks by title, ticket number, assignee, environment, or sprint."
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain" + (projectSidebarPopover === "menu" ? " is-active" : ""),
                      onClick: () => setProjectSidebarPopover((current) => current === "menu" ? "" : "menu"),
                      title: "Project actions",
                    }, React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })),
                    projectSidebarPopover === "menu"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          taskView === "calendar"
                            ? React.createElement("button", {
                                type: "button",
                                className: "tb-popup-row",
                                onClick: () => {
                                  setProjectSidebarPopover("");
                                  openScheduleComposer();
                                },
                              },
                                React.createElement(Plus, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                  React.createElement("span", null, "New Scheduled Task"),
                                  React.createElement("span", null, "Create a new calendar automation for this project.")
                                )
                              )
                            : null,
	                          canManageSelectedProject
	                            ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row",
	                            onClick: () => {
                              setProjectSidebarPopover("");
                              openProjectComposerForEdit(selectedProject);
                            },
                          },
                            React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                              React.createElement("span", null, "Edit Project"),
	                              React.createElement("span", null, "Change icon, title, and description.")
	                            )
	                          )
	                            : null,
	                          canManageSelectedProject
	                            ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row playground-tasks-detail-menu-item-danger",
	                            onClick: () => {
                              setProjectSidebarPopover("");
                              void handleDeleteProject(selectedProject.id);
                            },
                          },
                            React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
	                              React.createElement("span", null, "Delete Project"),
	                              React.createElement("span", null, "Remove this project and its planning scope.")
	                            )
	                          )
	                            : null
	                        )
	                      : null
	                  )
                )
              ),
              React.createElement("div", {
                className: projectWorkspaceScrollClassName,
                style: projectWorkspaceScrollStyle,
              },
                React.createElement("div", { className: "playground-project-workspace-inner" },
                  taskLoadState.status === "error" && tasks.length > 0
                    ? React.createElement("div", { className: "playground-environments-error" },
                        React.createElement("span", null, taskLoadState.error || "Failed to refresh project tasks."),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: () => void loadProjectWorkspace(selectedProjectId),
                        }, "Retry")
                      )
                    : null,
                  taskLoadState.status === "loading" && tasks.length === 0
                    ? React.createElement(PlatformLoadingState, {
                        message: "Loading project...",
                        centered: true,
                      })
                    : taskLoadState.status === "error" && tasks.length === 0
                      ? React.createElement("div", { className: "playground-tasks-empty" },
                          React.createElement("div", { className: "playground-tasks-empty-title" }, "Project workspace unavailable"),
                          React.createElement("div", { className: "playground-tasks-empty-copy" }, taskLoadState.error || "The tasks API could not be reached for this project."),
                          React.createElement(PlatformPrimaryButton, {
                            size: "medium",
                            type: "button",
                            className: "playground-environments-action-button is-primary",
                            onClick: () => void loadProjectWorkspace(selectedProjectId),
                          }, "Retry")
                        )
                      : React.createElement(React.Fragment, null,
                          taskView === "overview"
                            ? renderProjectOverviewView()
                            : taskView === "board"
                              ? renderBoardView()
                              : renderBacklogView()
                        )
                )
              )
            )
          );
        }

        function renderProjectComposerSetupWorkspace() {
          if (!projectComposerOpen || selectedProject) {
            return null;
          }

          return React.createElement("div", {
              className: "playground-environments-page playground-tasks-project-workspace",
            },
            React.createElement("section", { className: "playground-environments-detail playground-tasks-project-workspace-detail" },
              React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar playground-environments-editor-navbar playground-tasks-project-navbar" },
                React.createElement("div", { className: "playground-environments-editor-navbar-title playground-tasks-project-navbar-title" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-header-icon-button is-plain playground-tasks-project-title-back",
                    onClick: () => closeProjectComposer(),
                    title: "All Projects",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-environments-editor-navbar-copy" },
                    React.createElement("div", { className: "playground-content-title" }, projectDraft.name || "New Project")
                  )
                ),
                React.createElement("div", { className: "playground-content-nav-center" }),
                React.createElement("div", { className: "playground-content-nav-right playground-environments-editor-navbar-actions playground-tasks-project-navbar-actions" })
              ),
              React.createElement("div", {
                className: "playground-environments-detail-scroll playground-tasks-project-workspace-scroll is-mission-control-setup",
              },
                React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, "Project Studio"),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, "Use the full-screen studio to define project settings and run Mission Control.")
                )
              )
            )
          );
        }

\${CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.standaloneWorkspace}
        function renderTaskDetail() {
          if (missionControlStrategyOpen && selectedProject) {
            const missionControlTaskCount = Number(selectedProjectSummary.tasksCount) || 0;
            const missionControlOpenTaskCount = Number(selectedProjectSummary.openTasksCount) || 0;
            const missionControlStatusMetrics = [
              {
                key: "backlog",
                label: "Backlog",
                count: Number(selectedProjectTaskStatusOverview.backlog) || 0,
                Icon: FolderOpen,
                toneClassName: "is-backlog",
              },
              {
                key: "in-progress",
                label: "In Progress",
                count: Number(selectedProjectTaskStatusOverview.inProgress) || 0,
                Icon: Zap,
                toneClassName: "is-in-progress",
              },
              {
                key: "done",
                label: "Done",
                count: Number(selectedProjectTaskStatusOverview.done) || 0,
                Icon: Sparkles,
                toneClassName: "is-done",
              },
            ];
            const missionControlStatusSegments = [
              {
                key: "backlog",
                count: Number(selectedProjectTaskStatusOverview.backlog) || 0,
                className: "is-backlog",
              },
              {
                key: "in-progress",
                count: Number(selectedProjectTaskStatusOverview.inProgress) || 0,
                className: "is-in-progress",
              },
              {
                key: "done",
                count: Number(selectedProjectTaskStatusOverview.done) || 0,
                className: "is-done",
              },
            ]
              .map((segment) => ({
                ...segment,
                percentage: missionControlTaskCount > 0
                  ? (segment.count / missionControlTaskCount) * 100
                  : 0,
              }))
              .filter((segment) => segment.count > 0);
            return React.createElement("div", { className: "playground-tasks-detail-shell" },
              React.createElement("div", { className: "playground-tasks-detail-main" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""), ref: taskDetailMainRef },
                React.createElement("div", { className: "playground-content-nav playground-tasks-detail-navbar" },
                  React.createElement("div", { className: "playground-tasks-detail-navbar-title" },
                    React.createElement("div", { className: "playground-tasks-detail-navbar-title-main" },
                      React.createElement("div", { className: "playground-content-title" }, "Strategy")
                    )
                  ),
                  React.createElement("div", { className: "playground-content-nav-center" }),
                  React.createElement("div", { className: "playground-content-nav-right playground-tasks-detail-navbar-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-header-icon-button is-plain",
                      onClick: () => setMissionControlStrategyOpen(false),
                      title: "Close strategy",
                      "aria-label": "Close strategy",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-body" },
                  React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll" },
                    React.createElement("div", { className: "playground-tasks-detail-facts" },
                      React.createElement("div", { className: "playground-tasks-detail-facts-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Details"),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-detail-facts-toggle" + (missionControlDetailsCollapsed ? " is-collapsed" : ""),
                          onClick: () => setMissionControlDetailsCollapsed((current) => !current),
                          title: missionControlDetailsCollapsed ? "Expand details" : "Collapse details",
                          "aria-label": missionControlDetailsCollapsed ? "Expand details" : "Collapse details",
                          "aria-expanded": missionControlDetailsCollapsed ? "false" : "true",
                        }, React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.9 }))
                      ),
                      !missionControlDetailsCollapsed
                        ? React.createElement("div", { className: "playground-tasks-detail-facts-body" },
                            missionControlTaskCount > 0
                              ? React.createElement("div", { className: "playground-mission-control-status-overview" },
                                  React.createElement("div", { className: "playground-mission-control-status-metrics" },
                                    missionControlStatusMetrics.map((metric) =>
                                      React.createElement("div", {
                                        key: metric.key,
                                        className: "playground-mission-control-status-metric",
                                      },
                                        React.createElement("div", { className: "playground-mission-control-status-value" }, String(metric.count)),
                                        metric.label
                                          ? React.createElement("div", { className: "playground-mission-control-status-label " + metric.toneClassName },
                                              React.createElement("span", null, metric.label),
                                              React.createElement(getPlaygroundSafeIconComponent(metric.Icon, Circle), { strokeWidth: 1.8 })
                                            )
                                          : null
                                      )
                                    )
                                  ),
                                  React.createElement("div", {
                                    className: "playground-mission-control-status-bar" + (missionControlStatusSegments.length === 0 ? " is-empty" : ""),
                                    "aria-label": "Project task progress overview",
                                  },
                                    missionControlStatusSegments.map((segment) =>
                                      React.createElement("div", {
                                        key: segment.key,
                                        className: "playground-mission-control-status-segment " + segment.className,
                                        style: {
                                          width: segment.percentage + "%",
                                          flex: "0 0 " + segment.percentage + "%",
                                        },
                                        title: Math.round(segment.percentage) + "% " + segment.key.replace("-", " "),
                                      })
                                    )
                                  )
                                )
                              : null,
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Number of tasks"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, String(missionControlTaskCount))
                              )
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, "Open tasks"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, String(missionControlOpenTaskCount))
                              )
                            ),
                            React.createElement("div", { className: "playground-tasks-detail-fact" },
                              React.createElement("div", {
                                className: "playground-tasks-detail-fact-label",
                                style: { whiteSpace: "nowrap" },
                              }, "Mission Confidence"),
                              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                                React.createElement("div", { className: "playground-tasks-detail-fact-button" }, "100%")
                              )
                            ),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-mission-control-run-button",
                              disabled: isSelectedProjectMissionControlRunning,
                              onClick: () => openMissionControlComposer({ keepStrategyOpen: true }),
                            },
                              isSelectedProjectMissionControlRunning
                                ? React.createElement(React.Fragment, null,
                                    React.createElement(Loader2, { className: "playground-mission-control-run-button-icon", strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Running Mission Control")
                                  )
                                : React.createElement(React.Fragment, null,
                                    React.createElement(Rocket, { className: "playground-mission-control-run-button-icon", strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Run Mission Control")
                                  )
                            )
                          )
                        : null
                    ),
                    React.createElement("div", { className: "playground-tasks-comments" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Comments"),
                      selectedProjectMissionComments.length > 0
                        ? React.createElement("div", { className: "playground-tasks-comments-list" },
                            selectedProjectMissionComments.map((comment) =>
                              React.createElement("div", {
                                key: comment.id,
                                className: "playground-tasks-comment",
                              },
                                renderTaskCommentAvatar(comment, "playground-tasks-comment-avatar"),
                                React.createElement("div", { className: "playground-tasks-comment-body" },
                                  React.createElement("div", { className: "playground-tasks-comment-meta" },
                                    React.createElement("span", { className: "playground-tasks-comment-author" }, getTaskCommentDisplayName(comment)),
                                    React.createElement("span", { className: "playground-tasks-comment-time" }, formatRelativeThreadTime(comment.createdAt) || formatPlaygroundFileDate(comment.createdAt))
                                  ),
                                  React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: comment.text,
                                    className: "playground-tasks-comment-text tb-message-markdown",
                                  })
                                )
                              )
                            )
                          )
                        : React.createElement("div", { className: "playground-tasks-secondary-copy playground-tasks-comment-empty" }, "No comments yet.")
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-comment-dock" },
                    missionControlSaveState.error
                      ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, missionControlSaveState.error)
                      : missionControlSaveState.isSaving
                        ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
                        : missionControlSaveState.message
                          ? React.createElement("div", { className: "playground-environments-success playground-tasks-comment-feedback" }, missionControlSaveState.message)
                          : null,
                    React.createElement("div", { className: "playground-tasks-comment-runner" },
                      React.createElement("div", { className: "playground-tasks-comment-bar" },
                        React.createElement("textarea", {
                          rows: 1,
                          className: "playground-tasks-comment-input",
                          placeholder: "Add a comment",
                          value: missionControlCommentInputValue,
                          onChange: (event) => {
                            setMissionControlCommentInputValue(event.target.value);
                            resizeTaskCommentTextarea(event.currentTarget);
                          },
                          onKeyDown: (event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              void handleAddMissionControlComment();
                            }
                          },
                        }),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-tasks-comment-send-button",
                          onClick: () => void handleAddMissionControlComment(),
                          disabled: missionControlSaveState.isSaving || !String(missionControlCommentInputValue || "").trim(),
                          "aria-label": "Send comment",
                          title: "Send comment",
                        },
                          React.createElement(ArrowUp, { className: "playground-tasks-comment-send-icon", strokeWidth: 1.9 })
                        )
                      )
                    )
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-preview-pane" },
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
                  : null
              )
            );
          }

          if (!draftTask && isCalendarContext && scheduleViewMode === "setup") {
            return renderScheduleDetailPanel();
          }

          if (!draftTask) {
            if (taskLoadState.status === "loading" || pendingExternalTaskOpenRequest) {
              return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-tasks-loading-state" },
                  React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                  React.createElement("div", { className: "playground-tasks-loading-copy" }, "Loading ticket…")
                )
              );
            }
            if (taskLoadState.status === "error") {
              return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
                React.createElement("div", { className: "playground-tasks-empty" },
                  React.createElement("div", { className: "playground-tasks-empty-title" }, "Ticket unavailable"),
                  React.createElement("div", { className: "playground-tasks-empty-copy" }, taskLoadState.error || "The task details could not be loaded."),
                  selectedProjectId
                    ? React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                        type: "button",
                        className: "playground-environments-action-button is-primary",
                        onClick: () => void loadProjectWorkspace(selectedProjectId),
                      }, "Retry")
                    : null
                )
              );
            }
            return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-detail-empty" },
              React.createElement("div", { className: "playground-tasks-empty" },
                React.createElement("div", { className: "playground-tasks-empty-title" }, "Pick a task"),
                React.createElement("div", { className: "playground-tasks-empty-copy" }, "Select a task from backlog, board, or a milestone backlog to edit assignments, dependencies, attachments, and scheduling.")
              )
            );
          }

          const dependencyCandidates = sortedTasks
            .filter((task) => task.id !== draftTask.id)
            .slice()
            .sort((left, right) => {
              const leftTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[left.id] || left.ticketNumber);
              const rightTicketNumber = parsePlaygroundTaskTicketNumber(taskTicketNumbersById[right.id] || right.ticketNumber);
              if (leftTicketNumber !== rightTicketNumber) {
                return leftTicketNumber - rightTicketNumber;
              }
              return String(left.title || "").localeCompare(String(right.title || ""));
          });
          const startedThreadId = getTaskStartedThreadId(draftTask);
          const isTaskConfigLocked = false;
          const activeTicketNumber = taskTicketNumbersById[draftTask.id] || draftTask.ticketNumber || "001";
          const activeTaskType = normalizePlaygroundTaskType(draftTask.taskType);
          const activeTaskReleaseId = draftTask.releaseId || "";
          const blockedByTaskId = draftTask.dependencyIds[0] || "";
          const hasTaskAttachments = draftTask.attachments.length > 0;
          const taskScheduleSummary = formatPlaygroundTaskScheduleSummary(draftTask);
          const draftTaskParentLabel = draftTaskParentTask
            ? ((taskTicketNumbersById[draftTaskParentTask.id] || draftTaskParentTask.ticketNumber || "000") + " " + (draftTaskParentTask.title || "Untitled Task"))
            : "Choose parent";
          const draftTaskParentTicketNumber = draftTaskParentTask
            ? (taskTicketNumbersById[draftTaskParentTask.id] || draftTaskParentTask.ticketNumber || "000")
            : "";
          const taskComments = normalizePlaygroundTaskCommentList(draftTask.comments)
            .slice()
            .sort((left, right) => {
              const leftTimestamp = Date.parse(String(left.createdAt || ""));
              const rightTimestamp = Date.parse(String(right.createdAt || ""));
              const normalizedLeftTimestamp = Number.isFinite(leftTimestamp) ? leftTimestamp : 0;
              const normalizedRightTimestamp = Number.isFinite(rightTimestamp) ? rightTimestamp : 0;
              return normalizedRightTimestamp - normalizedLeftTimestamp;
            });
          const isFullPageTaskDetail = Boolean(projectTaskDetailScreenOpen);
          const taskConnectorEntries = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
            const selection = getDraftTaskConnectorSelection(option.source, draftTask);
            return {
              ...option,
              selection,
              valueLabel: selection?.valueLabel || "None",
            };
          });
          const activeTaskPriorityPresentation = getPlaygroundTaskPriorityPresentation(draftTask.priority);
          const ActiveTaskTypeIcon = activeTaskType === "subtask" ? Check : (activeTaskType === "loop" ? RefreshCw : Bookmark);
          const startedThreadRecord = startedThreadId
            ? selectedProjectRecentThreads.find((thread) => thread.id === startedThreadId) || null
            : null;
          const linkedRunPresentation = getTaskLinkedRunPresentation(startedThreadRecord);
          const activeTaskTypeLabel = PLAYGROUND_TASK_TYPE_OPTIONS.find((option) => option.id === activeTaskType)?.label || "Task";
          const activeReleaseLabel = activeTaskReleaseId
            ? (releasesById[activeTaskReleaseId]?.name || releases.find((release) => release.id === activeTaskReleaseId)?.name || "Milestone")
            : "None";
          const resolvedTaskAssigneeId = draftTask.assigneeAgentId || defaultTaskAssigneeId || "";
	          const activeAssigneeLabel = resolvedTaskAssigneeId
	            ? getTaskAssigneeName(resolvedTaskAssigneeId, "Unassigned")
	            : "Unassigned";
	          const resolvedTaskReviewerId = draftTask.reviewRequired
	            ? String(draftTask.reviewerAgentId || "").trim()
	            : "";
	          const activeReviewerLabel = draftTask.reviewRequired
	            ? (resolvedTaskReviewerId ? getTaskAssigneeName(resolvedTaskReviewerId, "Reviewer") : "Review required")
	            : "No review";
          const activeBlockedByTask = blockedByTaskId ? (tasksById[blockedByTaskId] || null) : null;
          const activeBlockedByLabel = activeBlockedByTask
            ? ((taskTicketNumbersById[activeBlockedByTask.id] || activeBlockedByTask.ticketNumber || "000") + " - " + (activeBlockedByTask.title || "Untitled Task"))
            : "None";
          const activeAssigneeActor = resolvedTaskAssigneeId
            ? (assignableActorsById[resolvedTaskAssigneeId] || null)
            : null;
          const defaultTaskAssigneePopupMode = taskDetailAvailableAssigneePopupModes.includes(getPlaygroundTaskAssigneePopupMode(activeAssigneeActor))
            ? getPlaygroundTaskAssigneePopupMode(activeAssigneeActor)
            : (taskDetailAvailableAssigneePopupModes[0] || "agents");

          function createTaskDetailSelectorOption({ value, label, description, leading = null, trailing = null, onSelect, disabled = false }) {
            return {
              value: String(value || ""),
              label,
              description: description || undefined,
              leading: leading || undefined,
              trailing: trailing || undefined,
              disabled,
              onSelect,
            };
          }

          function renderTaskDetailSelectControl({
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
            popupWidth = "min(280px, calc(100vw - 48px))",
            popupMaxHeight = "min(320px, calc(100vh - 120px))",
            options = [],
            emptyContent = "No options available.",
`;
