export const PROJECTS_ACTIONS_04_FRAGMENT = `          updateMissionControlStrategyDraft({
            ...missionControlStrategyDraft,
            [field]: value,
          });
        }

        function updateMissionControlStrategyListField(field, value) {
          updateMissionControlStrategyDraft({
            ...missionControlStrategyDraft,
            [field]: normalizePlaygroundStrategyTextList(value),
          });
        }

        function updateMissionControlStrategyOutcome(indexToUpdate, updates) {
          const outcomes = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft).outcomes;
          const nextOutcomes = outcomes.map((outcome, index) => index === indexToUpdate
            ? normalizePlaygroundStrategyOutcomeRecord({ ...outcome, ...updates }, index)
            : outcome
          );
          updateMissionControlStrategyDraft({
            ...missionControlStrategyDraft,
            outcomes: nextOutcomes,
          });
        }

        function addMissionControlStrategyOutcome() {
          const outcomes = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft).outcomes;
          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
            ...missionControlStrategyDraft,
            outcomes: outcomes.concat(normalizePlaygroundStrategyOutcomeRecord({
              id: "outcome-" + String(outcomes.length + 1).padStart(2, "0"),
              title: "New outcome",
              description: "",
              successCriteria: [],
            }, outcomes.length)),
          });
          setMissionControlStrategyDraft(nextStrategyBrief);
          void saveMissionControlStrategyBrief(nextStrategyBrief);
        }

        function removeMissionControlStrategyOutcome(indexToRemove) {
          const outcomes = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft).outcomes;
          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
            ...missionControlStrategyDraft,
            outcomes: outcomes.filter((_, index) => index !== indexToRemove),
          });
          setMissionControlStrategyDraft(nextStrategyBrief);
          void saveMissionControlStrategyBrief(nextStrategyBrief);
        }

        function syncMissionControlSetupOutcomesDraft(nextStrategyBrief) {
          const normalizedStrategyBrief = normalizePlaygroundProjectStrategyBrief(nextStrategyBrief);
          setMissionControlSetupOutcomesDraft(serializeMissionControlSetupOutcomesForInput(normalizedStrategyBrief.outcomes));
        }

        function applyMissionControlStrategyBriefFromOutcomeEditor(nextStrategyBrief) {
          const normalizedStrategyBrief = normalizePlaygroundProjectStrategyBrief(nextStrategyBrief);
          setMissionControlStrategyDraft(normalizedStrategyBrief);
          if (missionControlSetupOpen) {
            syncMissionControlSetupOutcomesDraft(normalizedStrategyBrief);
            setIsMissionControlSetupOutcomesEditing(false);
          }
        }

        function finishCloseProjectOverviewOutcomeEditor() {
          if (projectOverviewOutcomeEditorCloseTimerRef.current) {
            window.clearTimeout(projectOverviewOutcomeEditorCloseTimerRef.current);
            projectOverviewOutcomeEditorCloseTimerRef.current = null;
          }
          if (projectOverviewOutcomeEditorFrameRef.current) {
            window.cancelAnimationFrame(projectOverviewOutcomeEditorFrameRef.current);
            projectOverviewOutcomeEditorFrameRef.current = null;
          }
          setProjectOverviewOutcomeEditorVisible(false);
          setProjectOverviewOutcomeEditorClosing(false);
          setProjectOverviewOutcomeMilestonePickerOpen(false);
          setProjectOverviewOutcomeEditorState(null);
        }

        function closeProjectOverviewOutcomeEditor(options = {}) {
          if (!projectOverviewOutcomeEditorState) {
            return;
          }
          if (options?.animate === false) {
            finishCloseProjectOverviewOutcomeEditor();
            return;
          }
          if (projectOverviewOutcomeEditorClosing) {
            return;
          }
          setProjectOverviewOutcomeEditorVisible(false);
          setProjectOverviewOutcomeEditorClosing(true);
          if (projectOverviewOutcomeEditorCloseTimerRef.current) {
            window.clearTimeout(projectOverviewOutcomeEditorCloseTimerRef.current);
          }
          projectOverviewOutcomeEditorCloseTimerRef.current = window.setTimeout(() => {
            projectOverviewOutcomeEditorCloseTimerRef.current = null;
            finishCloseProjectOverviewOutcomeEditor();
          }, projectOverviewOutcomeEditorAnimationMs);
        }

        function buildProjectOverviewOutcomeEditorDraft(outcome, index = 0) {
          const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(outcome, index);
          return {
            ...normalizedDraft,
            successCriteriaInput: serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
          };
        }

        function updateProjectOverviewOutcomeEditorDraft(updates) {
          if (typeof setProjectOverviewOutcomeEditorState !== "function") return;
          setProjectOverviewOutcomeEditorState((current) => current
            ? {
                ...current,
                draft: {
                  ...(current.draft || {}),
                  ...(updates || {}),
                },
              }
            : current
          );
        }

        function getProjectOverviewOutcomeEditorDraft(index = 0) {
          const rawDraft = projectOverviewOutcomeEditorState?.draft || {};
          const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(rawDraft, index);
          return {
            ...normalizedDraft,
            title: typeof rawDraft.title === "string" ? rawDraft.title : normalizedDraft.title,
            description: typeof rawDraft.description === "string" ? rawDraft.description : normalizedDraft.description,
            successCriteriaInput: typeof rawDraft.successCriteriaInput === "string"
              ? rawDraft.successCriteriaInput
              : serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
          };
        }

        function normalizeProjectOverviewOutcomeEditorDraftForSave(rawDraft, index = 0) {
          return normalizePlaygroundStrategyOutcomeRecord({
            ...(rawDraft || {}),
            taskIds: [],
            successCriteria: typeof rawDraft?.successCriteriaInput === "string"
              ? normalizePlaygroundStrategyTextList(rawDraft.successCriteriaInput)
              : rawDraft?.successCriteria,
          }, index);
        }

        async function saveProjectOverviewOutcomeEditor(options = {}) {
          const sourceStrategyBrief = normalizePlaygroundProjectStrategyBrief(options?.strategyBrief || missionControlStrategyDraft);
          const index = Number(projectOverviewOutcomeEditorState?.index);
          const draft = normalizeProjectOverviewOutcomeEditorDraftForSave(projectOverviewOutcomeEditorState?.draft, index);
          if (!Number.isInteger(index) || index < 0 || index > sourceStrategyBrief.outcomes.length) {
            closeProjectOverviewOutcomeEditor();
            return;
          }
          const isNewOutcome = projectOverviewOutcomeEditorState?.isNew === true || index >= sourceStrategyBrief.outcomes.length;
          const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
            ...missionControlStrategyDraft,
            ...sourceStrategyBrief,
            outcomes: isNewOutcome
              ? sourceStrategyBrief.outcomes.concat(draft)
              : sourceStrategyBrief.outcomes.map((outcome, outcomeIndex) => outcomeIndex === index ? draft : outcome),
          });
          applyMissionControlStrategyBriefFromOutcomeEditor(nextStrategyBrief);
          if (String(selectedProjectId || "").trim()) {
            try {
              await saveMissionControlStrategyBrief(nextStrategyBrief, { throwOnError: true });
            } catch (error) {
              setMissionControlSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save outcome.",
                message: "",
              });
              return;
            }
          }
          closeProjectOverviewOutcomeEditor();
        }

        function deleteProjectOverviewOutcomeEditor(options = {}) {
          const sourceStrategyBrief = normalizePlaygroundProjectStrategyBrief(options?.strategyBrief || missionControlStrategyDraft);
          const index = Number(projectOverviewOutcomeEditorState?.index);
          if (projectOverviewOutcomeEditorState?.isNew !== true && Number.isInteger(index) && index >= 0) {
            const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
              ...missionControlStrategyDraft,
              ...sourceStrategyBrief,
              outcomes: sourceStrategyBrief.outcomes.filter((_, outcomeIndex) => outcomeIndex !== index),
            });
            applyMissionControlStrategyBriefFromOutcomeEditor(nextStrategyBrief);
            if (String(selectedProjectId || "").trim()) {
              void saveMissionControlStrategyBrief(nextStrategyBrief);
            }
          }
          closeProjectOverviewOutcomeEditor();
        }

        function updateProjectOverviewOutcomeEditorMilestone(releaseId) {
          const normalizedReleaseId = String(releaseId || "").trim();
          const currentReleaseIds = normalizePlaygroundStrategyOutcomeReleaseIds(projectOverviewOutcomeEditorState?.draft || {});
          const nextReleaseIds = normalizedReleaseId
            ? (currentReleaseIds.includes(normalizedReleaseId)
                ? currentReleaseIds.filter((id) => id !== normalizedReleaseId)
                : currentReleaseIds.concat(normalizedReleaseId))
            : [];
          updateProjectOverviewOutcomeEditorDraft({
            releaseIds: nextReleaseIds,
            releaseId: nextReleaseIds[0] || "",
            taskIds: [],
          });
          if (!normalizedReleaseId) {
            setProjectOverviewOutcomeMilestonePickerOpen(false);
          }
        }

        function renderSharedProjectOverviewOutcomeEditorModal(options = {}) {
          const sourceStrategyBrief = normalizePlaygroundProjectStrategyBrief(options?.strategyBrief || missionControlStrategyDraft);
          const normalizedOverviewTasks = Array.isArray(options?.normalizedOverviewTasks)
            ? options.normalizedOverviewTasks
            : (Array.isArray(tasks) ? tasks.map((task) => normalizePlaygroundTaskRecord(task)) : []);
          const index = Number(projectOverviewOutcomeEditorState?.index);
          const draft = getProjectOverviewOutcomeEditorDraft(index);
          if (!projectOverviewOutcomeEditorState || !Number.isInteger(index) || index < 0) {
            return null;
          }
          const activeOutcomeMilestoneIds = normalizePlaygroundStrategyOutcomeReleaseIds(draft);
          const activeOutcomeMilestoneIdSet = new Set(activeOutcomeMilestoneIds);
          const activeOutcomeMilestones = activeOutcomeMilestoneIds
            .map((releaseId) => releasesById[releaseId] || null)
            .filter(Boolean);
          const activeOutcomeMilestoneTaskInfoById = activeOutcomeMilestoneIds.reduce((result, releaseId) => {
            const milestoneTasks = normalizedOverviewTasks.filter((task) => String(task?.releaseId || "").trim() === releaseId);
            result[releaseId] = {
              tasks: milestoneTasks,
              doneTasks: milestoneTasks.filter((task) => getTaskBoardStatus(task) === "done"),
            };
            return result;
          }, {});
          const sortedOutcomeMilestones = releases.slice().sort(compareTaskReleaseOrder);
          function renderProjectOverviewOutcomeMilestonePicker() {
            return renderPlaygroundPlatformPopup({
              open: projectOverviewOutcomeMilestonePickerOpen,
              shellRef: projectOverviewOutcomeMilestonePickerRef,
              shellClassName: "playground-project-overview-outcome-milestone-picker-shell",
              menuClassName: "playground-project-overview-outcome-milestone-menu",
              trigger: React.createElement("button", {
                type: "button",
                className: "playground-project-overview-outcome-milestone-add",
                title: "Link milestones",
                "aria-label": "Link milestones",
                "aria-expanded": projectOverviewOutcomeMilestonePickerOpen ? "true" : "false",
                onClick: () => setProjectOverviewOutcomeMilestonePickerOpen((current) => !current),
              }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 })),
              children: sortedOutcomeMilestones.length > 0
                ? sortedOutcomeMilestones.map((release) =>
                    React.createElement("button", {
                        key: release.id,
                        type: "button",
                        className: "tb-popup-row tb-popup-row-select" + (activeOutcomeMilestoneIdSet.has(release.id) ? " selected" : ""),
                        onClick: () => updateProjectOverviewOutcomeEditorMilestone(release.id),
                      },
                      activeOutcomeMilestoneIdSet.has(release.id)
                        ? React.createElement(Check, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 })
                        : React.createElement(ListTodo, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                        React.createElement("span", null, release.name || "Untitled milestone"),
                        React.createElement("small", null, formatPlaygroundTaskReleaseDateRange(release))
                      )
                    )
                  )
                : React.createElement("div", { className: "tb-popup-empty-state" }, "No milestones yet."),
            });
          }

          function renderProjectOverviewOutcomeMilestoneField() {
            return React.createElement("div", { className: "playground-project-overview-outcome-milestone-field" },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-project-overview-outcome-milestone-title-row" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Linked milestones")
                ),
                renderProjectOverviewOutcomeMilestonePicker()
              ),
              activeOutcomeMilestones.length > 0
                ? activeOutcomeMilestones.map((milestone) => {
                    const milestoneTaskInfo = activeOutcomeMilestoneTaskInfoById[milestone.id] || { tasks: [], doneTasks: [] };
                    const milestoneTaskLabel = milestoneTaskInfo.tasks.length
                      ? milestoneTaskInfo.doneTasks.length + "/" + milestoneTaskInfo.tasks.length + " tickets done"
                      : formatPlaygroundTaskReleaseDateRange(milestone);
                    return React.createElement("div", { key: milestone.id, className: "playground-tasks-backlog-item playground-project-overview-outcome-milestone-row" },
                      React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                        React.createElement("div", { className: "playground-tasks-backlog-leading" },
                          React.createElement("div", {
                            className: "playground-tasks-backlog-project-icon is-task",
                            "aria-hidden": "true",
                          }, React.createElement(ListTodo, { width: 14, height: 14, strokeWidth: 1.9 })),
                          React.createElement("div", { className: "playground-tasks-backlog-main" },
                            React.createElement("span", { className: "playground-tasks-backlog-ticket" }, "Milestone"),
                            React.createElement("span", { className: "playground-tasks-backlog-title" }, milestone.name || "Untitled milestone")
                          )
                        ),
                        React.createElement("div", { className: "playground-tasks-backlog-meta" },
                          React.createElement("span", { className: "playground-tasks-backlog-ticket" }, milestoneTaskLabel)
                        ),
                        React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-outcome-milestone-remove",
                          title: "Unlink milestone",
                          "aria-label": "Unlink milestone",
                          onClick: () => updateProjectOverviewOutcomeEditorMilestone(milestone.id),
                        }, React.createElement(Minus, { width: 14, height: 14, strokeWidth: 1.8 }))
                      )
                    );
                  })
                : React.createElement("button", {
                    type: "button",
                    className: "playground-mission-control-modal-outcomes-empty",
                    onClick: () => setProjectOverviewOutcomeMilestonePickerOpen(true),
                  }, "Link a milestone")
            );
          }

          const content = React.createElement(PlatformModal, {
              open: Boolean(projectOverviewOutcomeEditorState) && !projectOverviewOutcomeEditorClosing,
              onClose: () => closeProjectOverviewOutcomeEditor(),
              animationDurationMs: projectOverviewOutcomeEditorAnimationMs,
              as: "form",
              size: "medium",
              title: "Edit Outcome",
              headerVariant: "search",
              headerSearchProps: {
                icon: Award,
                value: draft.title,
                placeholder: "Outcome title",
                "aria-label": "Outcome title",
                onChange: (event) => updateProjectOverviewOutcomeEditorDraft({ title: event.target.value }),
              },
              backdropClassName: "playground-project-overview-outcome-editor-backdrop",
              className: "playground-project-overview-outcome-editor-modal",
              bodyClassName: "playground-project-overview-outcome-editor-shell",
              footerClassName: "playground-project-overview-outcome-editor-footer",
              closeButtonLabel: "Close outcome editor",
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  void saveProjectOverviewOutcomeEditor({ strategyBrief: sourceStrategyBrief });
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  className: "playground-project-overview-outcome-delete-button",
                  onClick: () => deleteProjectOverviewOutcomeEditor({ strategyBrief: sourceStrategyBrief }),
                },
                  React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                  React.createElement("span", null, "Delete")
                ),
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: () => closeProjectOverviewOutcomeEditor(),
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: missionControlSaveState.isSaving || !String(draft.title || "").trim(),
                }, "Save Outcome")
              ),
            },
            React.createElement("div", { className: "playground-project-overview-outcome-editor-body" },
              React.createElement(PlatformInstructionsEditor, {
                variant: "minimalistic-ui",
                title: "Description",
                value: draft.description,
                onChange: (nextValue) => updateProjectOverviewOutcomeEditorDraft({ description: nextValue }),
                placeholder: "What this outcome should achieve",
                ariaLabel: "Outcome description",
                historyKey: "project-outcome-description:" + String(selectedProjectId || "") + ":" + index,
                stickyHeader: false,
              }),
              React.createElement(PlatformInstructionsEditor, {
                variant: "minimalistic-ui",
                title: "Success criteria",
                value: draft.successCriteriaInput,
                onChange: (nextValue) => updateProjectOverviewOutcomeEditorDraft({ successCriteriaInput: nextValue }),
                placeholder: "One success criterion per line",
                ariaLabel: "Outcome success criteria",
                historyKey: "project-outcome-success-criteria:" + String(selectedProjectId || "") + ":" + index,
                stickyHeader: false,
              }),
              renderProjectOverviewOutcomeMilestoneField(),
              missionControlSaveState?.error
                ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, missionControlSaveState.error)
                : null
            )
          );
          return content;
        }

        async function handleMissionControlEnvironmentSelectionChange(nextEnvironmentId) {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          const normalizedEnvironmentId = String(nextEnvironmentId || "").trim();
          if (!normalizedProjectId || !normalizedEnvironmentId || normalizedEnvironmentId === getPlaygroundProjectDefaultEnvironmentId(selectedProject)) {
            setTaskDetailSelectPopover("");
            return;
          }
          try {
            await persistProjectMissionControlRecord(normalizedProjectId, buildMissionControlRecordForSave(), {
              projectOverrides: {
                defaultEnvironmentId: normalizedEnvironmentId,
              },
              successMessage: "Mission updated",
            });
          } catch {} finally {
            setTaskDetailSelectPopover("");
          }
        }

        async function handleAddMissionControlComment() {
          const normalizedProjectId = String(selectedProjectId || "").trim();
          const nextCommentBody = String(missionControlCommentInputValue || "").replaceAll(String.fromCharCode(13), "").trim();
          if (!normalizedProjectId || !nextCommentBody) {
            return;
          }

          const createdComment = createPlaygroundTaskCommentRecord(nextCommentBody, {
            authorType: "user",
            name: currentUserName || "Computer Agents",
            avatarUrl: currentUserAvatarUrl || "",
          });
          if (!createdComment) {
            return;
          }

          try {
            await persistProjectMissionControlRecord(normalizedProjectId, {
              ...buildMissionControlRecordForSave(),
              comments: normalizePlaygroundTaskCommentList(selectedProjectMissionComments.concat(createdComment)),
              updatedAt: new Date().toISOString(),
            }, {
              successMessage: "Comment added",
            });
            setMissionControlCommentInputValue("");
          } catch {}
        }

        function buildMissionControlAgentPayload(agentRecord, modelOptions = PLAYGROUND_AGENT_MODEL_OPTIONS, tierId = subscriptionTierId) {
          const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord || buildPlaygroundMissionControlAgentDraft(modelOptions, tierId));
          const existingMetadata = normalizedAgent.metadata && typeof normalizedAgent.metadata === "object" && !Array.isArray(normalizedAgent.metadata)
            ? normalizedAgent.metadata
            : {};
          return {
            name: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
            description: String(normalizedAgent.description || "").trim() || PLAYGROUND_MISSION_CONTROL_AGENT_DESCRIPTION,
            model: getPlaygroundAgentModelMeta(normalizedAgent.model || resolvePlaygroundMissionControlAgentModelId(modelOptions, tierId), modelOptions).id,
            instructions: String(normalizedAgent.instructions || buildPlaygroundMissionControlAgentInstructions()),
            binary: String(normalizedAgent.binary || "").trim() || "Claude Code CLI",
            reasoningEffort: ["minimal", "low", "medium", "high"].includes(normalizedAgent.reasoningEffort)
              ? normalizedAgent.reasoningEffort
              : "medium",
            enabledSkills: normalizePlaygroundEnabledSkillIds(normalizedAgent.enabledSkills).filter((skillId) =>
              skillId === "task_management" || skillId === "computer_agents" || skillId === "memory"
            ),
            deepResearchModel: null,
            permissionSet: normalizePlaygroundPermissionSet(normalizedAgent.permissionSet, "agent"),
            metadata: {
              ...existingMetadata,
              runnerPlayground: {
                ...(existingMetadata.runnerPlayground && typeof existingMetadata.runnerPlayground === "object" && !Array.isArray(existingMetadata.runnerPlayground)
                  ? existingMetadata.runnerPlayground
                  : {}),
                role: PLAYGROUND_MISSION_CONTROL_AGENT_METADATA_ROLE,
                internal: true,
                managedBy: "runner-web-sdk-demo",
                version: 1,
              },
              profile: {
                email: slugifyPlaygroundAgentEmailLocalPart(PLAYGROUND_MISSION_CONTROL_AGENT_NAME) + "@" + PLAYGROUND_AGENT_EMAIL_DOMAIN,
                photoURL: PLAYGROUND_MISSION_CONTROL_AGENT_PROFILE_URL,
              },
            },
          };
        }

        async function alignMissionControlAgentModel(agentRecord) {
          const normalizedAgent = normalizePlaygroundAgentRecord(agentRecord);
          if (!normalizedAgent?.id || normalizedAgent.id === PLAYGROUND_AGENT_DRAFT_ID) {
            return normalizedAgent;
          }

          const desiredModelId = resolvePlaygroundMissionControlAgentModelId(PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
          if (!desiredModelId || normalizedAgent.model === desiredModelId) {
            return normalizedAgent;
          }

          try {
            const payload = buildMissionControlAgentPayload({
              ...normalizedAgent,
              model: desiredModelId,
            }, PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
            const response = await fetch(backendUrl + "/agents/" + encodeURIComponent(normalizedAgent.id), {
              method: "PATCH",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update Mission Control.");
            }
            return normalizePlaygroundAgentRecord(getPlaygroundAgentResponseRecord(data) || {
              ...normalizedAgent,
              ...payload,
              id: normalizedAgent.id,
              updatedAt: new Date().toISOString(),
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update Mission Control.";
            if (!isPlaygroundPaidModelSubscriptionError(errorMessage)) {
              console.warn("Failed to align Mission Control model", error);
            }
            return normalizedAgent;
          }
        }

        async function ensureMissionControlAgent() {
          const existingLocalAgent = missionControlAgent?.id && missionControlAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
            ? normalizePlaygroundAgentRecord(missionControlAgent)
            : null;
          if (existingLocalAgent?.id) {
            const alignedAgent = await alignMissionControlAgentModel(existingLocalAgent);
            setMissionControlAgent(alignedAgent);
            return alignedAgent;
          }

          const existingPropAgent = (Array.isArray(agents) ? agents : []).find((agent) => isPlaygroundMissionControlAgent(agent)) || null;
          if (existingPropAgent?.id && existingPropAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
            const normalizedExistingAgent = await alignMissionControlAgentModel(existingPropAgent);
            setMissionControlAgent(normalizedExistingAgent);
            setMissionControlAgentError("");
            return normalizedExistingAgent;
          }

          if (missionControlAgentSavePromiseRef.current) {
            return missionControlAgentSavePromiseRef.current;
          }

          setMissionControlAgentPreparing(true);
          setMissionControlAgentError("");
          const savePromise = (async () => {
            let existingRemoteAgent = null;
            try {
              const listResponse = await fetch(backendUrl + "/agents?limit=200", {
                method: "GET",
                headers: requestHeaders,
              });
              const listData = await listResponse.json().catch(() => ({}));
              if (listResponse.ok) {
                existingRemoteAgent = parsePlaygroundAgentListResponse(listData).find((agent) => isPlaygroundMissionControlAgent(agent)) || null;
              }
            } catch {}

            if (existingRemoteAgent?.id && existingRemoteAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
              const normalizedExistingAgent = await alignMissionControlAgentModel(existingRemoteAgent);
              setMissionControlAgent(normalizedExistingAgent);
              return normalizedExistingAgent;
            }

            const draftAgent = buildPlaygroundMissionControlAgentDraft(PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
            const payload = buildMissionControlAgentPayload(draftAgent, PLAYGROUND_AGENT_MODEL_OPTIONS, subscriptionTierId);
            const response = await fetch(backendUrl + "/agents", {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to prepare Mission Control.");
            }
            const savedAgent = getPlaygroundAgentResponseRecord(data) || normalizePlaygroundAgentRecord({
              ...draftAgent,
              ...payload,
              updatedAt: new Date().toISOString(),
            });
            if (!savedAgent?.id) {
              throw new Error("Mission Control agent creation failed.");
            }
            setMissionControlAgent(savedAgent);
            return savedAgent;
          })();

          missionControlAgentSavePromiseRef.current = savePromise;
          try {
            return await savePromise;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to prepare Mission Control.";
            setMissionControlAgentError(isPlaygroundPaidModelSubscriptionError(errorMessage) ? "" : errorMessage);
            throw error;
          } finally {
            missionControlAgentSavePromiseRef.current = null;
            setMissionControlAgentPreparing(false);
          }
        }

        function buildMissionControlThreadMetadata(projectRecord, userPrompt = "") {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject);
          return {
            runnerPlayground: {
              missionControl: {
                projectId: normalizedProject.id || selectedProjectId || "",
                projectName: normalizedProject.name || "Project",
                source: "project_backlog_mission_control",
                requestedAt: new Date().toISOString(),
                userPrompt: String(userPrompt || "").trim(),
              },
            },
          };
        }

        function buildMissionControlThreadRecord(threadId, projectRecord, userPrompt, agentId, environmentId) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject);
          const normalizedThreadId = String(threadId || "").trim();
          return {
            id: normalizedThreadId,
            title: (normalizedProject.name || "Project") + " Mission Control",
            projectId: normalizedProject.id || selectedProjectId || "",
            environmentId: String(environmentId || "").trim() || null,
            agentId: String(agentId || "").trim() || null,
            status: "running",
            metadata: buildMissionControlThreadMetadata(normalizedProject, userPrompt),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        function openMissionControlStrategySidebar() {
          if (!selectedProjectId) {
            return;
          }
          setTaskView("overview");
          setProjectOverviewHomeTab("strategy");
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setTaskDeleteDialogState(null);
          setTaskScheduleDialogState(null);
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setMissionControlSetupOpen(false);
          setSelectedTaskId("");
          setDraftTask(null);
          setProjectPreviewedAttachmentId("");
          setMissionControlStrategyOpen(false);
        }

        function openMissionControlComposer(options = {}) {
          const normalizedSelectedProjectId = String(selectedProjectId || "").trim();
          if (!normalizedSelectedProjectId) {
            return false;
          }
          const requestedProjectRecord = options?.projectRecord && typeof options.projectRecord === "object" && !Array.isArray(options.projectRecord)
            ? normalizePlaygroundProjectRecord(options.projectRecord)
            : null;
          const sourceProject = requestedProjectRecord?.id === normalizedSelectedProjectId
            ? requestedProjectRecord
            : selectedProject?.id === normalizedSelectedProjectId
              ? selectedProject
              : selectedProjectSnapshot?.id === normalizedSelectedProjectId
                ? selectedProjectSnapshot
                : projects.find((project) => project?.id === normalizedSelectedProjectId) || null;
          if (!sourceProject?.id) {
            return false;
          }
          const normalizedProject = normalizePlaygroundProjectRecord(sourceProject);
          const activeEditDraft = projectComposerOpen
            && projectComposerMode === "edit"
            && projectDraft?.id === normalizedProject.id
              ? projectDraft
              : null;
          if (!activeEditDraft) {
            projectDraftNameDirtyRef.current = false;
            projectDraftTypedNameRef.current = "";
          }
          const nextProjectDraft = activeEditDraft && projectDraftNameDirtyRef.current
            ? mergePlaygroundProjectRecords(activeEditDraft, normalizedProject) || activeEditDraft
            : normalizedProject;
          const projectIndex = projects.findIndex((project) => project.id === normalizedProject.id);
          const wallpaperConfig = getPlaygroundProjectWallpaperConfig(nextProjectDraft, projectIndex >= 0 ? projectIndex : 0);
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setTaskDeleteDialogState(null);
          setTaskScheduleDialogState(null);
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setProjectSidebarPopover("");
          setMissionControlStrategyOpen(false);
          setProjectComposerMode("edit");
          setProjectDraft((current) => preserveDirtyProjectDraftName({
            ...nextProjectDraft,
            wallpaperId: getPlaygroundProjectWallpaperId(nextProjectDraft.wallpaperId, wallpaperConfig.id),
          }, current));
          setProjectDescriptionEditing(false);
          setProjectComposerEnvironmentPopoverOpen(false);
          setProjectPreviewedAttachmentId("");
          setProjectAttachmentTransferState({
            uploadingIds: [],
            error: "",
            isProcessing: false,
          });
          setIsProjectAttachmentDragging(false);
          setProjectEnvironmentFilePickerOpen(false);
          setProjectEnvironmentFilePickerInventory([]);
          setProjectEnvironmentFilePickerState({
            status: "idle",
            error: "",
          });
          setProjectEnvironmentFilePickerSearch("");
          setProjectEnvironmentFilePickerExpandedFolders([]);
          setProjectEnvironmentFilePickerSelectedPaths([]);
          setProjectSaveState({
            isSaving: false,
            error: "",
          });
          setProjectIconPickerOpen(false);
          setProjectComposerOpen(true);
          setMissionControlSetupOpen(true);
          setMissionControlSetupResetToken((current) => current + 1);
          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerMissionControlCommandRequest(null);
          void ensureMissionControlAgent();
          return true;
        }

        async function handleBacklogMissionControlSubmit(payload) {
          if (!selectedProjectId || !selectedProject) {
            return;
          }

          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
          const normalizedOperatorPrompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
          const launchEnvironmentId = String(
            payload?.environmentId
            || normalizedProject.defaultEnvironmentId
            || backlogComposerEnvironmentId
            || initialEnvironmentId
            || ""
          ).trim();
          const launchAgentId = String(
            payload?.agentId
            || backlogComposerAgentId
            || initialAgentId
            || ""
          ).trim();
          const missionControlPrompt = buildPlaygroundMissionControlPrompt({
            userPrompt: normalizedOperatorPrompt,
            attachments: payload?.attachments,
            launchAgentId: launchAgentId,
          });
          const runAttachments = mergePlaygroundAttachmentLists(
            normalizedProject.attachments,
            Array.isArray(payload?.attachments) ? payload.attachments : []
          );
          const enabledSkillsPayload = buildPlaygroundMissionControlEnabledSkillsPayload(payload?.enabledSkills);
          const projectGithubRepo = payload?.githubRepo
            || buildPlaygroundGithubRepoReferenceFromConnectorSelection(normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors).github);
          const response = await fetch(backendUrl + "/threads", {
            method: "POST",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payload: {
                title: (normalizedProject.name || "Project") + " Mission Control",
                appId: "runner-web-sdk-demo",
                projectId: selectedProjectId,
                environmentId: launchEnvironmentId || undefined,
                agentId: launchAgentId || undefined,
                metadata: {
                  runnerPlayground: {
                    missionControl: {
                      projectId: selectedProjectId,
                      projectName: normalizedProject.name || "Project",
                      source: "project_backlog_mission_control",
                      requestedAt: new Date().toISOString(),
                      userPrompt: normalizedOperatorPrompt,
                    },
                  },
                },
              },
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to start Mission Control.");
          }

          const threadRecord = getPlaygroundThreadResponseRecord(data);
          if (!threadRecord?.id) {
            throw new Error("Mission Control thread creation failed.");
          }
          const runnerPlaygroundMetadata = threadRecord?.metadata?.runnerPlayground
            && typeof threadRecord.metadata.runnerPlayground === "object"
            && !Array.isArray(threadRecord.metadata.runnerPlayground)
            ? threadRecord.metadata.runnerPlayground
            : {};
          const launchedThreadRecord = {
            ...(threadRecord && typeof threadRecord === "object" ? threadRecord : {}),
            projectId: selectedProjectId,
            metadata: {
              ...(threadRecord?.metadata && typeof threadRecord.metadata === "object" && !Array.isArray(threadRecord.metadata)
                ? threadRecord.metadata
                : {}),
              runnerPlayground: {
                ...runnerPlaygroundMetadata,
                missionControl: {
                  ...(runnerPlaygroundMetadata?.missionControl && typeof runnerPlaygroundMetadata.missionControl === "object" && !Array.isArray(runnerPlaygroundMetadata.missionControl)
                    ? runnerPlaygroundMetadata.missionControl
                    : {}),
                  projectId: selectedProjectId,
                  projectName: normalizedProject.name || "Project",
                  source: "project_backlog_mission_control",
                  requestedAt: new Date().toISOString(),
                  userPrompt: normalizedOperatorPrompt,
                },
              },
            },
          };

          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerMissionControlCommandRequest(null);
          setMissionControlRunState({
            threadId: launchedThreadRecord.id,
            projectId: selectedProjectId,
            status: "starting",
            error: "",
          });
          if (typeof onStatusIndicatorItemChange === "function") {
            onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
              projectId: selectedProjectId,
              projectName: normalizedProject.name || "Project",
              phase: "starting",
            }));
          }
          if (onThreadStarted) {
            onThreadStarted(launchedThreadRecord.id, {
              threadRecord: launchedThreadRecord,
              taskRunRequest: {
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                prompt: missionControlPrompt,
                displayPrompt: normalizedOperatorPrompt || "Run Mission Control",
                userPrompt: normalizedOperatorPrompt,
                agentId: launchAgentId,
                agentName: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
                attachments: runAttachments,
                githubRepo: projectGithubRepo || null,
                enabledSkills: enabledSkillsPayload,
                environmentId: launchEnvironmentId,
              },
            });
          }
        }

        function handleMissionControlSetupRunRequest(runRequest) {
          const normalizedThreadId = String(runRequest?.threadId || "").trim();
          const normalizedOperatorPrompt = String(runRequest?.displayPrompt || runRequest?.prompt || "").trim();
          const isProjectComposerRun = projectComposerOpen && (projectComposerMode === "create" || projectComposerMode === "edit");
          const baseProjectRecord = isProjectComposerRun ? projectDraft : selectedProject;
          if (!baseProjectRecord || !normalizedThreadId || !normalizedOperatorPrompt) {
            return false;
          }

          setMissionControlAgentError("");
          if (isProjectComposerRun && !String(projectDraft.name || "").trim()) {
            setProjectSaveState({
              isSaving: false,
              error: "Project name is required.",
            });
            setMissionControlSetupResetToken((current) => current + 1);
            return true;
          }

          void (async () => {
            try {
              const missionAgent = await ensureMissionControlAgent();
              const normalizedInitialProject = normalizePlaygroundProjectRecord(baseProjectRecord);
              const savedProject = isProjectComposerRun
                ? await persistProjectComposerDraft({
                    mode: projectComposerMode,
                    closeAfterSave: false,
                    selectAfterSave: false,
                  })
                : normalizedInitialProject;
              let normalizedProject = normalizePlaygroundProjectRecord(savedProject || normalizedInitialProject);
              const setupStrategyBrief = buildMissionControlSetupStrategyBriefFromDraft();
              const runProjectId = String(normalizedProject.id || selectedProjectId || "").trim();
              if (!runProjectId) {
                throw new Error("Project is unavailable.");
              }
              const updatedProjectWithMissionContext = await persistProjectMissionControlRecord(runProjectId, buildMissionControlRecordForSave({
                strategyBrief: setupStrategyBrief,
                updatedAt: new Date().toISOString(),
              }), {
                quiet: true,
                refreshBaseProject: false,
              }).catch(() => null);
              normalizedProject = normalizePlaygroundProjectRecord(
                updatedProjectWithMissionContext
                || {
                  ...normalizedProject,
                  missionControl: {
                    ...getPlaygroundProjectMissionControlRecord(normalizedProject),
                    strategyBrief: setupStrategyBrief,
                    updatedAt: new Date().toISOString(),
                  },
                }
              );
              const launchEnvironmentId = String(
                runRequest?.environmentId
                || normalizedProject.defaultEnvironmentId
                || backlogComposerEnvironmentId
                || initialEnvironmentId
                || ""
              ).trim();
              const launchAgentId = String(missionAgent?.id || "").trim();
              if (!launchAgentId) {
                throw new Error("Mission Control agent is unavailable.");
              }

              const runAttachments = mergePlaygroundAttachmentLists(
                normalizedProject.attachments,
                Array.isArray(runRequest?.attachments) ? runRequest.attachments : []
              );
              const projectGithubRepo = runRequest?.githubRepo
                || buildPlaygroundGithubRepoReferenceFromConnectorSelection(normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors).github);
              const missionControlPrompt = buildPlaygroundMissionControlPrompt({
                projectRecord: normalizedProject,
                userPrompt: normalizedOperatorPrompt,
                attachments: runRequest?.attachments,
                launchAgentId,
              });
              const enabledSkillsPayload = buildPlaygroundMissionControlEnabledSkillsPayload(runRequest?.enabledSkills);
              const missionControlMetadata = buildMissionControlThreadMetadata(normalizedProject, normalizedOperatorPrompt);
              const patchThreadResponse = await fetch(backendUrl + "/threads/" + encodeURIComponent(normalizedThreadId), {
                method: "PATCH",
                headers: {
                  ...requestHeaders,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: (normalizedProject.name || "Project") + " Mission Control",
                  projectId: runProjectId,
                  agentId: launchAgentId,
                  environmentId: launchEnvironmentId || undefined,
                  metadata: missionControlMetadata,
                }),
              });
              const patchThreadData = await patchThreadResponse.json().catch(() => ({}));
              if (!patchThreadResponse.ok) {
                throw new Error(patchThreadData?.message || patchThreadData?.error || "Failed to prepare Mission Control thread.");
              }
              const launchedThreadRecord = buildMissionControlThreadRecord(
                normalizedThreadId,
                normalizedProject,
                normalizedOperatorPrompt,
                launchAgentId,
                launchEnvironmentId
              );

              setSelectedTaskId("");
              setDraftTask(null);
              setBacklogComposerMissionControlCommandRequest(null);
              closeMissionControlSetupModal({ persist: false });
              setMissionControlRunState({
                threadId: normalizedThreadId,
                projectId: runProjectId,
                status: "starting",
                error: "",
              });
              if (typeof onStatusIndicatorItemChange === "function") {
                onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
                  projectId: runProjectId,
                  projectName: normalizedProject.name || "Project",
                  phase: "starting",
                }));
              }
              if (isProjectComposerRun && (projectComposerMode === "create" || !selectedProjectId)) {
                handleSelectProject(runProjectId);
              }
              if (onThreadStarted) {
                onThreadStarted(normalizedThreadId, {
                  threadRecord: launchedThreadRecord,
                  taskRunRequest: {
                    token: "mission-control:" + (runRequest?.token || Date.now().toString(36) + Math.random().toString(36).slice(2)),
                    prompt: missionControlPrompt,
                    displayPrompt: normalizedOperatorPrompt,
                    userPrompt: normalizedOperatorPrompt,
                    agentId: launchAgentId,
                    agentName: PLAYGROUND_MISSION_CONTROL_AGENT_NAME,
                    attachments: runAttachments,
                    githubRepo: projectGithubRepo || null,
                    enabledSkills: enabledSkillsPayload,
                    environmentId: launchEnvironmentId,
                    quotedSelection: runRequest?.quotedSelection || null,
                  },
                });
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Failed to start Mission Control.";
              setMissionControlAgentError(errorMessage);
              setMissionControlSetupResetToken((current) => current + 1);
              setMissionControlRunState({
                threadId: normalizedThreadId,
                projectId: String(baseProjectRecord?.id || selectedProjectId || ""),
                status: "failed",
                error: errorMessage,
              });
            }
          })();

          return true;
        }

        async function syncMissionControlThreadResult(threadId, projectId) {
          const normalizedThreadId = String(threadId || "").trim();
          const normalizedProjectId = String(projectId || "").trim();
          if (!normalizedThreadId || !normalizedProjectId) {
            return;
          }
          if (missionControlSyncThreadIdRef.current === normalizedThreadId) {
            return;
          }

	          missionControlSyncThreadIdRef.current = normalizedThreadId;
		          try {
		            const threadMessages = await fetchPlaygroundThreadMessages(normalizedThreadId);
		            const parsedMissionControl = await resolvePlaygroundMissionControlRecordFromMessages(threadMessages);
		            if (!String(parsedMissionControl.document || "").trim()) {
              setMissionControlRunState((current) => current.threadId === normalizedThreadId
                ? {
                    ...current,
                    status: "failed",
                    error: "Mission Control finished without a strategy document.",
                  }
                : current
		              );
		              return;
		            }
		            const hasParsedProjectRules = parsedMissionControl
		              && typeof parsedMissionControl === "object"
		              && !Array.isArray(parsedMissionControl)
		              && Object.prototype.hasOwnProperty.call(parsedMissionControl, "projectRules");
		            const parsedProjectRules = hasParsedProjectRules
		              ? String(parsedMissionControl.projectRules || "")
		              : "";
		            const shouldPersistParsedProjectRules = hasParsedProjectRules
		              && (parsedProjectRules.trim() || parsedMissionControl.projectRulesReplace === true);
		            const projectRuleOverrides = shouldPersistParsedProjectRules
		              ? {
		                  projectRules: parsedProjectRules,
		                }
		              : null;
		            await persistProjectMissionControlRecord(normalizedProjectId, {
	              ...selectedProjectMissionControl,
	              ...parsedMissionControl,
	              lastThreadId: normalizedThreadId,
	              updatedAt: new Date().toISOString(),
	            }, {
	              quiet: true,
	              ...(projectRuleOverrides
	                ? {
	                    projectOverrides: projectRuleOverrides,
	                    metadataOverrides: projectRuleOverrides,
	                  }
	                : {}),
	            });
            if (selectedProjectId === normalizedProjectId) {
              await loadProjectWorkspace(normalizedProjectId);
            }
            setMissionControlRunState((current) => current.threadId === normalizedThreadId
              ? {
                  threadId: "",
                  projectId: "",
                  status: "idle",
                  error: "",
                }
              : current
            );
          } catch (error) {
            setMissionControlRunState((current) => current.threadId === normalizedThreadId
              ? {
                  ...current,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Mission Control sync failed.",
                }
              : current
            );
          } finally {
            if (missionControlSyncThreadIdRef.current === normalizedThreadId) {
              missionControlSyncThreadIdRef.current = "";
            }
          }
        }

        function openProjectSubtaskIssueComposer(parentTaskId) {
          const normalizedParentTaskId = normalizePlaygroundParentTaskId(parentTaskId);
          if (!normalizedParentTaskId || !selectedProjectId) {
            return false;
          }
          const parentTask = tasks.find((task) => task?.id === normalizedParentTaskId);
          if (!parentTask?.id || isPlaygroundSubtaskRecord(parentTask)) {
            return false;
          }
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setMissionControlStrategyOpen(false);
          return openProjectIssueComposer({
`;
