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

        function openPromptSearch(onSelect) {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setThreadSearchQuery("");
          setThreadSearchMode("prompts");
          setThreadSearchModeLocked(typeof onSelect === "function");
          setThreadSearchAllActionsVisible(false);
          threadSearchPromptSelectHandlerRef.current = typeof onSelect === "function" ? onSelect : null;
          threadSearchThreadSelectHandlerRef.current = null;
          setThreadSearchOpen(true);
        }

        function openThreadReferenceSearch(onSelect) {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setThreadSearchQuery("");
          setThreadSearchMode("threads");
          setThreadSearchModeLocked(typeof onSelect === "function");
          setThreadSearchAllActionsVisible(false);
          threadSearchPromptSelectHandlerRef.current = null;
          threadSearchThreadSelectHandlerRef.current = typeof onSelect === "function" ? onSelect : null;
          setThreadSearchOpen(true);
        }

        function openThreadSearch() {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setThreadSearchQuery("");
          setThreadSearchMode(getThreadSearchModeForCurrentPage());
          setThreadSearchModeLocked(false);
          setThreadSearchAllActionsVisible(false);
          threadSearchPromptSelectHandlerRef.current = null;
          threadSearchThreadSelectHandlerRef.current = null;
          setThreadSearchOpen(true);
        }

        function closeThreadSearch() {
          setThreadSearchOpen(false);
          setThreadSearchQuery("");
          setThreadSearchModeLocked(false);
          setThreadSearchAllActionsVisible(false);
          threadSearchPromptSelectHandlerRef.current = null;
          threadSearchThreadSelectHandlerRef.current = null;
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

        async function handleThreadSearchThreadSelect(thread) {
          const normalizedThreadId = String(thread?.id || "").trim();
          if (!normalizedThreadId) {
            return;
          }

          const selectionHandler = threadSearchThreadSelectHandlerRef.current;
          let resolvedThread = thread;
          if (selectionHandler) {
            try {
              const threadResponse = await fetch(
                proxyBackendBase + "/threads/" + encodeURIComponent(normalizedThreadId),
                {
                  method: "GET",
                  headers: authRequestHeaders,
                  credentials: "include",
                  cache: "no-store",
                },
              );
              const threadData = await threadResponse.json().catch(() => ({}));
              if (!threadResponse.ok) {
                throw new Error(threadData?.message || threadData?.error || "Failed to load thread.");
              }
              resolvedThread = {
                ...(threadData?.thread || threadData?.data?.thread || threadData?.data || threadData),
                id: normalizedThreadId,
                title: String(
                  threadData?.thread?.title
                  || threadData?.data?.thread?.title
                  || threadData?.data?.title
                  || threadData?.title
                  || thread?.title
                  || "Untitled thread"
                ).trim() || "Untitled thread",
              };

              try {
                const messagesResponse = await fetch(
                  proxyBackendBase + "/threads/" + encodeURIComponent(normalizedThreadId) + "/messages?limit=200&compact=1",
                  {
                    method: "GET",
                    headers: authRequestHeaders,
                    credentials: "include",
                    cache: "no-store",
                  },
                );
                const messagesData = await messagesResponse.json().catch(() => ({}));
                if (messagesResponse.ok) {
                  const messages = Array.isArray(messagesData?.messages)
                    ? messagesData.messages
                    : Array.isArray(messagesData?.data)
                      ? messagesData.data
                      : Array.isArray(messagesData)
                        ? messagesData
                        : [];
                  const markdownLines = messages
                    .map((message) => {
                      const role = String(message?.role || "assistant").trim() || "assistant";
                      const content = typeof message?.content === "string"
                        ? message.content
                        : typeof message?.text === "string"
                          ? message.text
                          : "";
                      return content.trim() ? "## " + role + "\\n\\n" + content.trim() : "";
                    })
                    .filter(Boolean);
                  if (markdownLines.length > 0) {
                    resolvedThread = {
                      ...resolvedThread,
                      markdown: [
                        "# " + String(resolvedThread?.title || thread?.title || "Untitled thread").trim(),
                        "Thread ID: " + normalizedThreadId,
                        ...markdownLines,
                      ].join("\\n\\n"),
                    };
                  }
                }
              } catch {
                // A thread title and ID remain useful if message history is unavailable.
              }
            } catch (error) {
              closeThreadSearch();
              window.alert(error instanceof Error ? error.message : "Failed to load thread.");
              return;
            }
          }

          closeThreadSearch();
          if (selectionHandler) {
            try {
              await selectionHandler(resolvedThread);
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Failed to attach thread.");
            }
            return;
          }

          handleThreadSearchSelect(normalizedThreadId);
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

        async function handleThreadSearchPromptSelect(prompt) {
          const normalizedPromptId = String(prompt?.id || "").trim();
          if (!normalizedPromptId) {
            return;
          }

          const selectionHandler = threadSearchPromptSelectHandlerRef.current;
          let resolvedPrompt = prompt;
          if (selectionHandler) {
            try {
              const response = await fetch(
                proxyBackendBase + "/prompts/" + encodeURIComponent(normalizedPromptId),
                {
                  method: "GET",
                  headers: authRequestHeaders,
                  credentials: "include",
                  cache: "no-store",
                },
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load prompt.");
              }
              resolvedPrompt = data?.prompt || data?.data || data;
            } catch (error) {
              closeThreadSearch();
              window.alert(error instanceof Error ? error.message : "Failed to load prompt.");
              return;
            }
          }

          closeThreadSearch();
          if (selectionHandler) {
            try {
              await selectionHandler(resolvedPrompt);
            } catch (error) {
              window.alert(error instanceof Error ? error.message : "Failed to attach prompt.");
            }
            return;
          }

          requestPlatformNavigation(() => {
            openToolsView("prompts", { promptId: normalizedPromptId });
          });
        }

${APP_HEADER_SEARCH_RESULT_ACTIONS_SCRIPT}
`;
