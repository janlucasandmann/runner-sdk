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
              actionsHidden: threadSearchModeLocked,
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
              actionsHidden: threadSearchModeLocked,
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
          const knowledgeItems = filteredThreadSearchKnowledgeItems.map((library) => {
            const actionAvailability = getThreadSearchResultActionAvailability("knowledge", library);
            const versionNumber = Number(library?.currentVersionNumber || 0);
            return {
              id: library.id,
              title: library.name || "Untitled library",
              meta: versionNumber > 0 ? "Version " + String(versionNumber) : "Knowledge library",
              renameDisabled: !actionAvailability.canRename,
              deleteDisabled: !actionAvailability.canDelete,
              icon: React.createElement(LibraryBig, {
                width: 16,
                height: 16,
                strokeWidth: 1.8,
              }),
              iconClassName: "is-knowledge",
              actionsHidden: true,
            };
          });
          const evaluationItems = filteredThreadSearchEvaluationItems.map((evaluation) => {
            const versionNumber = Number(evaluation?.currentVersionNumber || evaluation?.version || 0);
            const caseCount = Array.isArray(evaluation?.cases)
              ? evaluation.cases.length
              : Number(evaluation?.caseCount || evaluation?.casesCount || 0);
            return {
              id: evaluation.id,
              title: evaluation.name || evaluation.title || "Untitled evaluation",
              meta: versionNumber > 0
                ? "Version " + String(versionNumber)
                : caseCount > 0
                  ? String(caseCount) + (caseCount === 1 ? " case" : " cases")
                  : "Evaluation",
              renameDisabled: true,
              deleteDisabled: true,
              icon: React.createElement(FlaskConical, {
                width: 16,
                height: 16,
                strokeWidth: 1.8,
              }),
              iconClassName: "is-evaluation",
              actionsHidden: true,
            };
          });
          const selectedServerResourceMeta = ({
            web_app: { label: "Web Apps", itemLabel: "Web App", Icon: Monitor },
            function: { label: "Functions", itemLabel: "Function", Icon: FunctionSquare },
            database: { label: "Databases", itemLabel: "Database", Icon: Database },
          })[canonicalizePlaygroundServerKind(threadSearchResourceTypeFilter)] || {
            label: "Resources",
            itemLabel: "Resource",
            Icon: Server,
          };
          const serverResourceItems = filteredThreadSearchServerResourceItems.map((resource) => {
            const ResourceIcon = selectedServerResourceMeta.Icon || Server;
            return {
              id: resource.id,
              title: resource.name || resource.title || "Untitled " + selectedServerResourceMeta.itemLabel.toLowerCase(),
              meta: String(resource.status || resource.state || selectedServerResourceMeta.itemLabel).replace(/_/g, " "),
              renameDisabled: true,
              deleteDisabled: true,
              openInNewTabDisabled: true,
              actionsHidden: true,
              icon: React.createElement(ResourceIcon, {
                width: 16,
                height: 16,
                strokeWidth: 1.8,
              }),
              iconClassName: "is-server-resource",
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
                    : threadSearchMode === "prompts"
                      ? (promptItems.length > 0 ? [{ id: "prompts", label: "Prompts", items: promptItems }] : [])
                      : threadSearchMode === "knowledge"
                        ? (knowledgeItems.length > 0 ? [{ id: "knowledge", label: "Knowledge", items: knowledgeItems }] : [])
                        : threadSearchMode === "evaluations"
                          ? (evaluationItems.length > 0 ? [{ id: "evaluations", label: "Evaluations", items: evaluationItems }] : [])
                          : (serverResourceItems.length > 0 ? [{ id: "server-resources", label: selectedServerResourceMeta.label, items: serverResourceItems }] : []);
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
            knowledge: "Knowledge",
            evaluations: "Evaluations",
            "server-resources": selectedServerResourceMeta.label,
          })[threadSearchMode] || "Results";
          const resolvedSelectedModeLabel = threadSearchMode === "files" && threadSearchResourceTypeFilter === "image"
            ? "Images"
            : selectedModeLabel;
          const emptyStateCopy = isGlobalServiceSearchQuery
            ? {
                title: "No services found",
                description: "Try a different service name after the slash.",
              }
            : threadSearchSelectedModeError
            ? {
                title: "Unable to load " + resolvedSelectedModeLabel.toLowerCase(),
                description: threadSearchSelectedModeError,
              }
            : exactThreadSearchId && threadSearchMode === "threads"
              ? {
                  title: "Thread not found",
                  description: "Check the thread ID and try again.",
                }
            : normalizedThreadSearchQuery
              ? {
                  title: "No " + resolvedSelectedModeLabel.toLowerCase() + " found",
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
                  knowledge: {
                    title: "No Knowledge libraries yet",
                    description: "Knowledge libraries in your workspace will appear here.",
                  },
                  evaluations: {
                    title: "No evaluations yet",
                    description: "Evaluations in your organization will appear here.",
                  },
                  "server-resources": {
                    title: "No " + selectedServerResourceMeta.label.toLowerCase() + " yet",
                    description: selectedServerResourceMeta.label + " in your organization will appear here.",
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
                      icon: React.createElement(Metronome, {
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
              ? [({
                  threads: { id: "threads", label: "Threads", description: "Conversations in your workspace" },
                  knowledge: { id: "knowledge", label: "Knowledge", description: "Knowledge libraries in your workspace" },
                  prompts: { id: "prompts", label: "Prompts", description: "Reusable prompts in your workspace" },
                  evaluations: { id: "evaluations", label: "Evaluations", description: "Evaluations in your organization" },
                  files: {
                    id: "files",
                    label: threadSearchResourceTypeFilter === "image" ? "Images" : "Files",
                    description: threadSearchResourceTypeFilter === "image" ? "Images across your computers" : "Files across your computers",
                  },
                  workflows: { id: "workflows", label: "Workflows", description: "Workflows in your organization" },
                  "server-resources": {
                    id: "server-resources",
                    label: selectedServerResourceMeta.label,
                    description: selectedServerResourceMeta.label + " in your organization",
                  },
                })[threadSearchMode] || { id: threadSearchMode, label: resolvedSelectedModeLabel, description: "Resources in your organization" }]
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
                  void handleThreadSearchFileSelect(fileResult);
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
                  void handleThreadSearchWorkflowSelect(workflow);
                }
                return;
              }
              if (threadSearchMode === "server-resources") {
                const resource = filteredThreadSearchServerResourceItems.find((item) => item.id === resultId);
                if (resource) {
                  void handleThreadSearchServerResourceSelect(resource);
                }
                return;
              }
              if (threadSearchMode === "knowledge") {
                const library = filteredThreadSearchKnowledgeItems.find((item) => item.id === resultId);
                if (library) {
                  void handleThreadSearchKnowledgeSelect(library);
                }
                return;
              }
              if (threadSearchMode === "evaluations") {
                const evaluation = filteredThreadSearchEvaluationItems.find((item) => item.id === resultId);
                if (evaluation) {
                  void handleThreadSearchEvaluationSelect(evaluation);
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
              : "Loading " + resolvedSelectedModeLabel.toLowerCase() + "...",
            emptyTitle: emptyStateCopy.title,
            emptyDescription: emptyStateCopy.description,
          });
        }
`;
