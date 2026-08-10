export const APP_HEADER_SEARCH_MODAL_SCRIPT = `        function renderAppHeaderSearchModal() {
          const fileItems = filteredThreadSearchFileItems.map((fileResult) => {
            const filePath = normalizeHistoryPath(fileResult.entry?.path || "");
            const fileName = fileResult.entry?.name
              || filePath.split("/").filter(Boolean).pop()
              || filePath
              || "Untitled file";
            const actionAvailability = getThreadSearchResultActionAvailability("files", fileResult);
            return {
              id: fileResult.key,
              title: fileName,
              meta: fileResult.environmentName,
              renameDisabled: !actionAvailability.canRename,
              deleteDisabled: !actionAvailability.canDelete,
              icon: React.createElement(PlaygroundFileIcon, {
                entry: fileResult.entry,
                environmentId: fileResult.environmentId,
                backendUrl: proxyBackendBase,
                useThumbnail: true,
                className: "platform-global-search-modal__file-preview",
              }),
              iconClassName: "is-file-preview",
            };
          });
          const threadGroups = groupedThreadSearchItems.map((group) => ({
            id: group.key,
            label: group.label,
            items: group.items.map((thread) => {
              const actionAvailability = getThreadSearchResultActionAvailability("threads", thread);
              return {
                id: thread.id,
                title: thread.title,
                meta: formatThreadSearchTimestamp(resolveThreadSortTimestamp(thread)),
                active: activeSidebarThreadId === thread.id,
                renameDisabled: !actionAvailability.canRename,
                deleteDisabled: !actionAvailability.canDelete,
              };
            }),
          }));
          const ticketItems = filteredThreadSearchTicketItems.map((task) => {
            const project = threadSearchProjectsById.get(String(task?.projectId || "").trim()) || null;
            const ticketNumber = formatPlaygroundProjectTicketNumber(project, task?.ticketNumber);
            const isSubtask = isPlaygroundSubtaskRecord(task);
            const TicketTypeIcon = isSubtask ? Check : Bookmark;
            const actionAvailability = getThreadSearchResultActionAvailability("tickets", task);
            return {
              id: task.id,
              title: task.title || "Untitled ticket",
              identifier: ticketNumber,
              meta: project?.name || "Project",
              renameDisabled: !actionAvailability.canRename,
              deleteDisabled: !actionAvailability.canDelete,
              icon: React.createElement("span", {
                className: "playground-tasks-backlog-project-icon " + (isSubtask ? "is-subtask" : "is-task"),
              }, React.createElement(TicketTypeIcon, {
                width: 14,
                height: 14,
                strokeWidth: 1.9,
              })),
              iconClassName: "is-ticket",
            };
          });
          const agentItems = filteredThreadSearchAgentItems.map((agent) => {
            const profilePhotoUrl = normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(agent));
            const modelMeta = getPlaygroundAgentModelMeta(String(agent?.model || "").trim());
            const providerIcon = getPlaygroundAgentModelProviderIcon(modelMeta);
            const modelName = String(modelMeta?.label || "").trim();
            const actionAvailability = getThreadSearchResultActionAvailability("agents", agent);
            return {
              id: agent.id,
              title: agent.name || "Untitled agent",
              renameDisabled: !actionAvailability.canRename,
              deleteDisabled: !actionAvailability.canDelete,
              meta: modelName
                ? React.createElement("span", {
                    className: "platform-global-search-modal__agent-model",
                  },
                    providerIcon
                      ? React.createElement("img", {
                          className: "platform-global-search-modal__agent-model-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                          src: providerIcon.src,
                          alt: "",
                          loading: "lazy",
                          decoding: "async",
                        })
                      : null,
                    React.createElement("span", {
                      className: "platform-global-search-modal__agent-model-name",
                    }, modelName)
                  )
                : null,
              icon: React.createElement("img", {
                className: "platform-global-search-modal__agent-avatar",
                src: profilePhotoUrl,
                alt: "",
                loading: "lazy",
                decoding: "async",
              }),
              iconClassName: "is-agent-avatar",
            };
          });
          const workflowItems = filteredThreadSearchWorkflowItems.map((workflow) => {
            const actionAvailability = getThreadSearchResultActionAvailability("workflows", workflow);
            return {
              id: workflow.id,
              title: workflow.name || "Untitled workflow",
              meta: isMetronomeWorkflowBuiltIn(workflow)
                ? "Default"
                : String(workflow.status || "draft").replace(/_/g, " "),
              renameDisabled: !actionAvailability.canRename,
              deleteDisabled: !actionAvailability.canDelete,
            };
          });
          const promptItems = filteredThreadSearchPromptItems.map((prompt) => {
            const actionAvailability = getThreadSearchResultActionAvailability("prompts", prompt);
            const versionNumber = Number(prompt?.currentVersionNumber || 0);
            return {
              id: prompt.id,
              title: prompt.name || "Untitled prompt",
              meta: versionNumber > 0 ? "Version " + String(versionNumber) : "Prompt",
              renameDisabled: !actionAvailability.canRename,
              deleteDisabled: !actionAvailability.canDelete,
              icon: React.createElement(MessageSquareText, {
                width: 16,
                height: 16,
                strokeWidth: 1.8,
              }),
              iconClassName: "is-prompt",
              actionsHidden: true,
            };
          });

          const globalServiceNavigationItems = isGlobalServiceSearchQuery
            ? getGlobalServiceNavigationItems(globalServiceSearchQuery)
            : [];
          const globalServiceItems = globalServiceNavigationItems.map((serviceItem) => {
            const ServiceIcon = getPlaygroundSafeIconComponent(serviceItem.Icon, Circle);
            return {
              id: serviceItem.globalSearchId,
              title: serviceItem.label || "Untitled service",
              meta: serviceItem.workspaceLabel,
              icon: React.createElement(ServiceIcon, {
                width: 16,
                height: 16,
                strokeWidth: 1.85,
              }),
              renameDisabled: true,
              deleteDisabled: true,
              openInNewTabDisabled: true,
              actionsHidden: true,
            };
          });
          const modeResultGroups = threadSearchMode === "threads"
            ? threadGroups
            : threadSearchMode === "files"
              ? (fileItems.length > 0 ? [{ id: "files", label: "Files", items: fileItems }] : [])
              : threadSearchMode === "tickets"
                ? (ticketItems.length > 0 ? [{ id: "tickets", label: "Tickets", items: ticketItems }] : [])
                : threadSearchMode === "agents"
                  ? (agentItems.length > 0 ? [{ id: "agents", label: "Agents", items: agentItems }] : [])
                  : threadSearchMode === "workflows"
                    ? (workflowItems.length > 0 ? [{ id: "workflows", label: "Workflows", items: workflowItems }] : [])
                    : (promptItems.length > 0 ? [{ id: "prompts", label: "Prompts", items: promptItems }] : []);
          const resultGroups = isGlobalServiceSearchQuery
            ? (
                globalServiceItems.length > 0
                  ? [{ id: "services", label: "Services", items: globalServiceItems }]
                  : []
              )
            : modeResultGroups;
          const selectedModeLabel = ({
            threads: "Threads",
            files: "Files",
            tickets: "Tickets",
            agents: "Agents",
            workflows: "Workflows",
            prompts: "Prompts",
          })[threadSearchMode] || "Results";
          const emptyStateCopy = isGlobalServiceSearchQuery
            ? {
                title: "No services found",
                description: "Try a different service name after the slash.",
              }
            : threadSearchSelectedModeError
            ? {
                title: "Unable to load " + selectedModeLabel.toLowerCase(),
                description: threadSearchSelectedModeError,
              }
            : exactThreadSearchId && threadSearchMode === "threads"
              ? {
                  title: "Thread not found",
                  description: "Check the thread ID and try again.",
                }
            : normalizedThreadSearchQuery
              ? {
                  title: "No " + selectedModeLabel.toLowerCase() + " found",
                  description: "Try a different search term.",
                }
              : ({
                  threads: {
                    title: "No threads yet",
                    description: "Your conversations will appear here.",
                  },
                  files: {
                    title: "Search files",
                    description: "Enter a file name or path to search across your computers.",
                  },
                  tickets: {
                    title: "No tickets yet",
                    description: "Project tickets will appear here.",
                  },
                  agents: {
                    title: "No agents yet",
                    description: "Agents in this organization will appear here.",
                  },
                  workflows: {
                    title: "No workflows yet",
                    description: "Metronome workflows will appear here.",
                  },
                  prompts: {
                    title: "No prompts yet",
                    description: "Reusable prompts will appear here.",
                  },
                })[threadSearchMode];
          const actions = isGlobalServiceSearchQuery
            ? []
            : threadSearchMode === "threads"
            ? [
                {
                  id: "create-chat",
                  label: "Create New Chat",
                  icon: React.createElement(SquarePen, {
                    width: 16,
                    height: 16,
                    strokeWidth: 1.9,
                  }),
                },
                ...(threadSearchAllActionsVisible
                  ? [
                      {
                        id: "settings",
                        label: "Settings",
                        icon: React.createElement(Settings, {
                          width: 16,
                          height: 16,
                          strokeWidth: 1.9,
                        }),
                      },
                      {
                        id: "api-keys",
                        label: "API Keys",
                        icon: React.createElement(KeyRound, {
                          width: 16,
                          height: 16,
                          strokeWidth: 1.9,
                        }),
                      },
                      {
                        id: "sign-out",
                        label: "Sign Out",
                        icon: React.createElement(LogOut, {
                          width: 16,
                          height: 16,
                          strokeWidth: 1.9,
                        }),
                      },
                    ]
                  : []),
              ]
            : threadSearchMode === "files"
              ? [{
                  id: "create-file",
                  label: "Create new File",
                  icon: React.createElement(FilePlus2, {
                    width: 16,
                    height: 16,
                    strokeWidth: 1.9,
                  }),
                }]
              : threadSearchMode === "tickets"
                ? [{
                    id: "create-ticket",
                    label: "Create new ticket",
                    icon: React.createElement(ListTodo, {
                      width: 16,
                      height: 16,
                      strokeWidth: 1.9,
                    }),
                  }]
                : threadSearchMode === "agents"
                  ? [{
                      id: "create-agent",
                      label: "Create new agent",
                      icon: React.createElement(Bot, {
                        width: 16,
                        height: 16,
                        strokeWidth: 1.9,
                      }),
                    }]
                  : threadSearchMode === "workflows"
                    ? [{
                      id: "create-workflow",
                      label: "Create new workflow",
                      icon: React.createElement(Workflow, {
                        width: 16,
                        height: 16,
                        strokeWidth: 1.9,
                      }),
                    }]
                    : [];

          return React.createElement(PlatformGlobalSearchModal, {
            open: threadSearchOpen,
            query: threadSearchQuery,
            onQueryChange: (nextQuery) => {
              setThreadSearchQuery(nextQuery);
              if (
                resolveGlobalServiceSearchQuery(nextQuery) === null
                && resolveExactThreadSearchId(nextQuery)
                && !threadSearchModeLocked
                && threadSearchMode !== "threads"
              ) {
                setThreadSearchMode("threads");
                setThreadSearchAllActionsVisible(false);
              }
            },
            onClose: closeThreadSearch,
            mode: threadSearchMode,
            modeLocked: threadSearchModeLocked,
            modeOptions: threadSearchModeLocked
              ? [threadSearchMode === "threads"
                ? { id: "threads", label: "Threads", description: "Conversations in your workspace" }
                : { id: "prompts", label: "Prompts", description: "Reusable prompts in your workspace" }]
              : undefined,
            onModeChange: (nextMode) => {
              if (threadSearchModeLocked) return;
              setThreadSearchMode(nextMode);
              setThreadSearchQuery("");
              setThreadSearchAllActionsVisible(false);
            },
            actions,
            onActionSelect: handleThreadSearchAction,
            onShowAllActions: threadSearchMode === "threads" && !threadSearchAllActionsVisible
              && !isGlobalServiceSearchQuery
              ? () => setThreadSearchAllActionsVisible(true)
              : undefined,
            resultGroups,
            resultsLoading: isThreadSearchSelectedModeLoading,
            onResultOpenInNewTab: isGlobalServiceSearchQuery
              ? undefined
              : (resultId) => {
                  try {
                    openThreadSearchResultInNewTab(threadSearchMode, resultId);
                  } catch (error) {
                    window.alert(error instanceof Error ? error.message : "Failed to open result in a new tab.");
                    throw error;
                  }
                },
            onResultRename: isGlobalServiceSearchQuery
              ? undefined
              : async (resultId, nextTitle) => {
                  try {
                    await renameThreadSearchResult(threadSearchMode, resultId, nextTitle);
                  } catch (error) {
                    window.alert(error instanceof Error ? error.message : "Failed to rename result.");
                    throw error;
                  }
                },
            onResultDelete: isGlobalServiceSearchQuery
              ? undefined
              : async (resultId) => {
                  await deleteThreadSearchResult(threadSearchMode, resultId);
                },
            onResultSelect: (resultId) => {
              if (isGlobalServiceSearchQuery) {
                if (handleGlobalServiceNavigationItemClick(resultId)) {
                  closeThreadSearch();
                }
                return;
              }
              if (threadSearchMode === "threads") {
                const thread = filteredThreadSearchItems.find((item) => item.id === resultId);
                if (thread) {
                  void handleThreadSearchThreadSelect(thread);
                }
                return;
              }
              if (threadSearchMode === "files") {
                const fileResult = filteredThreadSearchFileItems.find((item) => item.key === resultId);
                if (fileResult) {
                  handleThreadSearchFileSelect(fileResult);
                }
                return;
              }
              if (threadSearchMode === "tickets") {
                const task = filteredThreadSearchTicketItems.find((item) => item.id === resultId);
                if (task) {
                  handleThreadSearchTicketSelect(task);
                }
                return;
              }
              if (threadSearchMode === "agents") {
                const agent = filteredThreadSearchAgentItems.find((item) => item.id === resultId);
                if (agent) {
                  handleThreadSearchAgentSelect(agent);
                }
                return;
              }
              if (threadSearchMode === "workflows") {
                const workflow = filteredThreadSearchWorkflowItems.find((item) => item.id === resultId);
                if (workflow) {
                  handleThreadSearchWorkflowSelect(workflow);
                }
                return;
              }
              const prompt = filteredThreadSearchPromptItems.find((item) => item.id === resultId);
              if (prompt) {
                void handleThreadSearchPromptSelect(prompt);
              }
            },
            resultCount: isGlobalServiceSearchQuery
              ? globalServiceItems.length
              : threadSearchTotalResultCount,
            loadingLabel: isGlobalServiceSearchQuery
              ? "Loading services..."
              : "Loading " + selectedModeLabel.toLowerCase() + "...",
            emptyTitle: emptyStateCopy.title,
            emptyDescription: emptyStateCopy.description,
          });
        }
`;
