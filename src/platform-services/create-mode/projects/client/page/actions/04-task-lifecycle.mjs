export const PROJECTS_ACTIONS_04_FRAGMENT = `          updateMissionControlStrategyDraft({
            ...missionControlStrategyDraft,
            [field]: value,
          });
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

        async function ensureMissionControlAgent() {
          const existingLocalAgent = missionControlAgent?.id && missionControlAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
            ? normalizePlaygroundAgentRecord(missionControlAgent)
            : null;
          if (existingLocalAgent?.id) {
            setMissionControlAgent(existingLocalAgent);
            return existingLocalAgent;
          }

          const existingPropAgent = (Array.isArray(agents) ? agents : []).find((agent) => isPlaygroundMissionControlAgent(agent)) || null;
          if (existingPropAgent?.id && existingPropAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
            const normalizedExistingAgent = normalizePlaygroundAgentRecord(existingPropAgent);
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
              const normalizedExistingAgent = normalizePlaygroundAgentRecord(existingRemoteAgent);
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

        function buildMissionControlThreadMetadata(projectRecord, userPrompt = "", knowledgeContext = null) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject);
          return {
            ...(knowledgeContext ? { knowledgeContext } : {}),
            runnerPlayground: {
              ...(knowledgeContext ? { knowledgeContext } : {}),
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

        function buildMissionControlThreadRecord(threadId, projectRecord, userPrompt, agentId, environmentId, knowledgeContext = null) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject);
          const normalizedThreadId = String(threadId || "").trim();
          return {
            id: normalizedThreadId,
            title: (normalizedProject.name || "Project") + " Mission Control",
            projectId: normalizedProject.id || selectedProjectId || "",
            environmentId: String(environmentId || "").trim() || null,
            agentId: String(agentId || "").trim() || null,
            status: "running",
            metadata: buildMissionControlThreadMetadata(normalizedProject, userPrompt, knowledgeContext),
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
          const projectKnowledgeLibrary = await ensurePlaygroundProjectKnowledgeLibrary(normalizedProject);
          const projectKnowledgeContext = buildPlaygroundProjectKnowledgeContext(
            projectKnowledgeLibrary,
            "project-mission-control"
          );
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
            projectRecord: normalizedProject,
            userPrompt: normalizedOperatorPrompt,
            attachments: payload?.attachments,
            launchAgentId: launchAgentId,
            knowledgeLibrary: projectKnowledgeLibrary,
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
                ...(projectKnowledgeContext ? { knowledgeContext: projectKnowledgeContext } : {}),
                metadata: {
                  ...(projectKnowledgeContext ? { knowledgeContext: projectKnowledgeContext } : {}),
                  runnerPlayground: {
                    ...(projectKnowledgeContext ? { knowledgeContext: projectKnowledgeContext } : {}),
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
                ...(projectKnowledgeContext ? { knowledgeContext: projectKnowledgeContext } : {}),
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
                knowledgeContext: projectKnowledgeContext,
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
              const runProjectId = String(normalizedProject.id || selectedProjectId || "").trim();
              if (!runProjectId) {
                throw new Error("Project is unavailable.");
              }
              const projectKnowledgeLibrary = await ensurePlaygroundProjectKnowledgeLibrary(normalizedProject);
              const projectKnowledgeContext = buildPlaygroundProjectKnowledgeContext(
                projectKnowledgeLibrary,
                "project-mission-control"
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
                knowledgeLibrary: projectKnowledgeLibrary,
              });
              const enabledSkillsPayload = buildPlaygroundMissionControlEnabledSkillsPayload(runRequest?.enabledSkills);
              const missionControlMetadata = buildMissionControlThreadMetadata(
                normalizedProject,
                normalizedOperatorPrompt,
                projectKnowledgeContext
              );
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
                  ...(projectKnowledgeContext ? { knowledgeContext: projectKnowledgeContext } : {}),
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
                launchEnvironmentId,
                projectKnowledgeContext
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
                    knowledgeContext: projectKnowledgeContext,
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
	            const projectRecord = normalizePlaygroundProjectRecord(
	              (selectedProject?.id === normalizedProjectId ? selectedProject : null)
	              || projectsById[normalizedProjectId]
	              || { id: normalizedProjectId, name: "Project" }
	            );
	            const projectKnowledgeLibrary = await ensurePlaygroundProjectKnowledgeLibrary(projectRecord);
	            await applyPlaygroundMissionControlKnowledgeDocuments({
	              projectRecord,
	              library: projectKnowledgeLibrary,
	              documents: parsedMissionControl.knowledgeDocuments,
	              threadId: normalizedThreadId,
	            });
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
	            const { knowledgeDocuments: _knowledgeDocuments, ...operationalMissionControl } = parsedMissionControl;
	            await persistProjectMissionControlRecord(normalizedProjectId, {
	              ...getPlaygroundProjectMissionControlRecord(projectRecord),
	              ...operationalMissionControl,
	              knowledgeLibraryId: String(projectKnowledgeLibrary.id || ""),
	              knowledgeLibraryName: String(projectKnowledgeLibrary.name || "Project Knowledge"),
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
          if (!normalizedParentTaskId || (!selectedProjectId && !selectedProject?.id)) {
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
