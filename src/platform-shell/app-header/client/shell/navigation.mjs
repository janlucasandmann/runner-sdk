import { APP_HEADER_SEARCH_RESULT_ACTIONS_SCRIPT } from "../runtime/search-result-actions.mjs";

export const APP_HEADER_NAVIGATION_SCRIPT = `        function getThreadSearchModeForCurrentPage() {
          const currentActivePage = String(activePageRef.current || "").trim();
          const currentResourcesView = String(resourcesViewRef.current || "").trim();
          if (currentActivePage === "files") {
            return "files";
          }
          if (["tasks", "calendar", "projects", "project", "tickets"].includes(currentActivePage)) {
            return "tickets";
          }
          if (["metronome", "workflows"].includes(currentActivePage)) {
            return "workflows";
          }
          if (
            currentActivePage === "agents"
            || (currentActivePage === "resources" && currentResourcesView === "agents")
          ) {
            return "agents";
          }
          return "threads";
        }

        function openThreadSearch() {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setThreadSearchQuery("");
          setThreadSearchMode(getThreadSearchModeForCurrentPage());
          setThreadSearchAllActionsVisible(false);
          setThreadSearchOpen(true);
        }

        function closeThreadSearch() {
          setThreadSearchOpen(false);
          setThreadSearchQuery("");
          setThreadSearchAllActionsVisible(false);
        }

        function handleThreadSearchAction(actionId) {
          const normalizedActionId = String(actionId || "").trim();
          if (!normalizedActionId) {
            return;
          }

          if (normalizedActionId === "create-agent") {
            closeThreadSearch();
            openPlatformResourceCreationModal("agent");
            return;
          }

          requestPlatformNavigation(() => {
            closeThreadSearch();
            if (normalizedActionId === "create-chat") {
              handleNewThread();
              return;
            }
            if (normalizedActionId === "settings") {
              openSettingsModal();
              return;
            }
            if (normalizedActionId === "api-keys") {
              openDevelopApiKeysPage();
              return;
            }
            if (normalizedActionId === "sign-out") {
              void handleSignOutFromComputerAgents();
              return;
            }
            if (normalizedActionId === "create-ticket") {
              openProjectIssueComposerFromHeader();
              return;
            }
            if (normalizedActionId === "create-workflow") {
              openMetronomePage({ createWorkflow: true });
              return;
            }
            if (normalizedActionId === "create-file") {
              const targetEnvironmentId = String(
                resolvedEnvironmentId
                || environmentId
                || runtimeEnvironments.find((item) => item?.isDefault)?.id
                || runtimeEnvironments[0]?.id
                || ""
              ).trim();
              setSidebarWorkspaceMode("work");
              if (targetEnvironmentId) {
                setEnvironmentId(targetEnvironmentId);
              }
              setFilesPageNavigationRequest({
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                environmentId: targetEnvironmentId,
                path: "",
                isFolder: true,
                contentMode: "files",
                action: "create-file",
              });
              setActivePage("files");
            }
          });
        }

        function handleThreadSearchSelect(threadId) {
          requestPlatformNavigation(() => {
            closeThreadSearch();
            handleThreadSelect(threadId);
          });
        }

        function handleThreadSearchFileSelect(fileResult) {
          const normalizedEnvironmentId = String(fileResult?.environmentId || "").trim();
          const entry = fileResult?.entry || null;
          const normalizedPath = normalizeHistoryPath(entry?.path || "");
          if (!normalizedEnvironmentId || !normalizedPath) {
            return;
          }

          requestPlatformNavigation(() => {
            closeThreadSearch();
            setSidebarWorkspaceMode("work");
            setEnvironmentId(normalizedEnvironmentId);
            setFilesPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              environmentId: normalizedEnvironmentId,
              path: normalizedPath,
              isFolder: Boolean(entry?.isFolder),
              contentMode: "files",
            });
            setActivePage("files");
          });
        }

        function handleThreadSearchTicketSelect(task) {
          const normalizedTaskId = String(task?.id || "").trim();
          const normalizedProjectId = String(task?.projectId || "").trim();
          if (!normalizedTaskId || !normalizedProjectId) {
            return;
          }

          requestPlatformNavigation(() => {
            closeThreadSearch();
            setLatestInteractedProjectId(normalizedProjectId);
            setTasksPageNavigationRequest({
              token: Date.now().toString(36) + Math.random().toString(36).slice(2),
              projectId: normalizedProjectId,
              view: "backlog",
              taskId: normalizedTaskId,
              missionControlAction: "",
              projectComposerAction: "",
            });
            setSidebarWorkspaceMode("work");
            setActivePage("tasks");
          });
        }

        function handleThreadSearchAgentSelect(agent) {
          const normalizedAgentId = String(agent?.id || "").trim();
          if (!normalizedAgentId) {
            return;
          }

          requestPlatformNavigation(() => {
            closeThreadSearch();
            openAgentDetailsInResources(normalizedAgentId);
          });
        }

        function handleThreadSearchWorkflowSelect(workflow) {
          const normalizedWorkflowId = String(workflow?.id || "").trim();
          if (!normalizedWorkflowId) {
            return;
          }

          requestPlatformNavigation(() => {
            closeThreadSearch();
            openMetronomePage({
              workflowId: normalizedWorkflowId,
              projectId: String(workflow?.projectId || workflow?.project_id || "").trim(),
            });
          });
        }

${APP_HEADER_SEARCH_RESULT_ACTIONS_SCRIPT}
`;
