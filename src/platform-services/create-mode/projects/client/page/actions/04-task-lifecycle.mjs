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
          setTaskDetailPopover("");
          setTaskSkillsPopoverOpen(false);
          setTaskParentPickerState(null);
          setTaskDeleteDialogState(null);
          setTaskScheduleDialogState(null);
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setProjectSidebarPopover("");
          setMissionControlStrategyOpen(false);
          const preferredMissionControlAgent = missionControlAgentOptions.find((agent) => agent.id === missionControlSetupAgentId)
            || missionControlAgentOptions.find((agent) => agent.id === backlogComposerAgentId)
            || missionControlAgentOptions.find((agent) => agent.id === initialAgentId)
            || getPlaygroundPreferredDefaultAgent(missionControlAgentOptions)
            || missionControlAgentOptions[0]
            || null;
          const preferredMissionControlEnvironmentId = String(
            normalizedProject.defaultEnvironmentId
            || missionControlSetupEnvironmentId
            || backlogComposerEnvironmentId
            || initialEnvironmentId
            || availableBacklogEnvironments[0]?.id
            || ""
          ).trim();
          setMissionControlSetupInstructions("");
          setMissionControlSetupAgentId(String(preferredMissionControlAgent?.id || ""));
          setMissionControlSetupEnvironmentId(preferredMissionControlEnvironmentId);
          setMissionControlSetupFocus({
            issues: true,
            strategy: true,
            milestones: true,
            knowledge: true,
          });
          setMissionControlSetupSubmitting(false);
          setMissionControlSetupError("");
          setMissionControlSetupOpen(true);
          setMissionControlSetupResetToken((current) => current + 1);
          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerMissionControlCommandRequest(null);
          return true;
        }

        async function startMissionControlWorkflow({
          projectRecord,
          instructions = "",
          agentId,
          environmentId,
          focus,
        }) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord || selectedProject);
          const runProjectId = String(normalizedProject.id || selectedProjectId || "").trim();
          const launchAgentId = String(agentId || "").trim();
          const launchEnvironmentId = String(environmentId || normalizedProject.defaultEnvironmentId || "").trim();
          const normalizedFocus = {
            issues: focus?.issues !== false,
            strategy: focus?.strategy !== false,
            milestones: focus?.milestones !== false,
            knowledge: focus?.knowledge !== false,
          };
          if (!runProjectId) {
            throw new Error("Project is unavailable.");
          }
          if (!launchAgentId) {
            throw new Error("Select an agent for Mission Control.");
          }
          if (!Object.values(normalizedFocus).some(Boolean)) {
            throw new Error("Select at least one Mission Control focus.");
          }

          const response = await fetch(
            backendUrl + "/projects/" + encodeURIComponent(runProjectId) + "/mission-control/runs",
            {
              method: "POST",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                agentId: launchAgentId,
                environmentId: launchEnvironmentId || undefined,
                instructions: String(instructions || "").trim(),
                focus: normalizedFocus,
              }),
            }
          );
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || data?.error || "Failed to start Mission Control.");
          }
          const threadRecord = getPlaygroundThreadResponseRecord(data);
          if (!threadRecord?.id) {
            throw new Error("Mission Control workflow did not return an origin thread.");
          }

          setSelectedTaskId("");
          setDraftTask(null);
          setBacklogComposerMissionControlCommandRequest(null);
          setMissionControlRunState({
            threadId: threadRecord.id,
            projectId: runProjectId,
            status: "running",
            error: "",
            workflowManaged: true,
          });
          if (typeof onStatusIndicatorItemChange === "function") {
            onStatusIndicatorItemChange(buildMissionControlStatusIndicatorItem({
              projectId: runProjectId,
              projectName: normalizedProject.name || "Project",
              phase: "running",
            }));
          }
          if (onThreadStarted) {
            onThreadStarted(threadRecord.id, { threadRecord });
          }
          return threadRecord;
        }

        async function handleBacklogMissionControlSubmit(payload) {
          if (!selectedProjectId || !selectedProject) {
            return;
          }
          const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
          const launchAgentId = String(
            payload?.agentId
            || backlogComposerAgentId
            || initialAgentId
            || getPlaygroundPreferredDefaultAgent(missionControlAgentOptions)?.id
            || missionControlAgentOptions[0]?.id
            || ""
          ).trim();
          const launchEnvironmentId = String(
            payload?.environmentId
            || normalizedProject.defaultEnvironmentId
            || backlogComposerEnvironmentId
            || initialEnvironmentId
            || ""
          ).trim();
          await startMissionControlWorkflow({
            projectRecord: normalizedProject,
            instructions: typeof payload?.prompt === "string" ? payload.prompt : "",
            agentId: launchAgentId,
            environmentId: launchEnvironmentId,
            focus: {
              issues: true,
              strategy: true,
              milestones: true,
              knowledge: true,
            },
          });
        }

        async function handleMissionControlSetupSubmit() {
          const normalizedSelectedProjectId = String(selectedProjectId || "").trim();
          const baseProjectRecord = selectedProject?.id === normalizedSelectedProjectId
            ? selectedProject
            : selectedProjectSnapshot?.id === normalizedSelectedProjectId
              ? selectedProjectSnapshot
              : projects.find((project) => project?.id === normalizedSelectedProjectId) || null;
          if (!baseProjectRecord || missionControlSetupSubmitting) {
            return;
          }
          setMissionControlSetupSubmitting(true);
          setMissionControlSetupError("");
          try {
            const normalizedProject = normalizePlaygroundProjectRecord(baseProjectRecord);
            const threadRecord = await startMissionControlWorkflow({
              projectRecord: normalizedProject,
              instructions: missionControlSetupInstructions,
              agentId: missionControlSetupAgentId,
              environmentId: missionControlSetupEnvironmentId,
              focus: missionControlSetupFocus,
            });
            closeMissionControlSetupModal({ persist: false });
            return threadRecord;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to start Mission Control.";
            setMissionControlSetupError(errorMessage);
            setMissionControlRunState({
              threadId: "",
              projectId: String(baseProjectRecord?.id || selectedProjectId || ""),
              status: "failed",
              error: errorMessage,
              workflowManaged: true,
            });
            return null;
          } finally {
            setMissionControlSetupSubmitting(false);
          }
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
