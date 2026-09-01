          function handleAgentAssistantRunFinish(_result, threadId) {
            const normalizedThreadId = String(threadId || "").trim();
            if (normalizedThreadId && typeof onThreadRegistered === "function") {
              onThreadRegistered(normalizedThreadId, { private: true });
            }
            rememberAgentAssistantThread(getAgentAssistantTargetAgentId(), normalizedThreadId);
            if (normalizedThreadId && agentCreationInstructionContext?.threadId === normalizedThreadId) {
              const agentId = String(agentCreationInstructionContext.agentId || "").trim();
              setAgentCreationInstructionContext((current) => current && current.threadId === normalizedThreadId
                ? { ...current, status: "completed" }
                : current
              );
              if (agentId) {
                void loadAgentDetails(agentId, { force: true, background: true });
              }
            }
            if (typeof onAgentMutated === "function") {
              void Promise.resolve(onAgentMutated());
            }
          }
  
          function handleAgentAssistantRunError(_error, threadId) {
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedThreadId || agentCreationInstructionContext?.threadId !== normalizedThreadId) {
              return;
            }
            setAgentCreationInstructionContext((current) => current && current.threadId === normalizedThreadId
              ? { ...current, status: "failed" }
                : current
            );
          }
  
          function renderAgentAssistantEmptyState(assistantThreadId, isAgentCreatorReady) {
            const isStarting = Boolean(agentAssistantPresetRunState.isStarting);
            const isDisabled = !isAgentCreatorReady || isStarting || Boolean(agentCreationInstructionRunRequest);
            const renderPresetButton = (actionType) => {
              const label = getAgentAssistantPresetActionLabel(actionType);
              const isButtonStarting = isStarting && agentAssistantPresetRunState.actionType === actionType;
              return React.createElement("button", {
                key: actionType,
                type: "button",
                className: "playground-agents-assistant-empty-button",
                disabled: isDisabled,
                onClick: () => {
                  void handleAgentAssistantPresetAction(actionType, {
                    threadId: assistantThreadId,
                  });
                },
              },
                React.createElement("span", null, isButtonStarting ? "Starting..." : label),
                React.createElement(ArrowRight, { className: "playground-agents-assistant-empty-button-icon", strokeWidth: 1.8, "aria-hidden": "true" })
              );
            };
  
            return React.createElement("div", { className: "playground-agents-assistant-empty-state" },
              React.createElement("h3", { className: "playground-agents-assistant-empty-title" }, "Improve your Agent"),
              React.createElement("div", { className: "playground-agents-assistant-empty-actions" },
                renderPresetButton("efficiency"),
                renderPresetButton("latest_threads")
              ),
              agentAssistantPresetRunState.error
                ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, agentAssistantPresetRunState.error)
                : null
            );
          }
  
          function renderAgentAssistantPanel() {
            if (!canShowAgentAssistant || agentVersionsSidebarOpen) {
              return null;
            }
  
            const assistantCommandType = selectedAgentAssistantCommandType === "team" ? "team" : "agent";
            const assistantRunRequest = agentCreationInstructionRunRequest;
            const assistantTargetAgentId = getAgentAssistantTargetAgentId();
            const contextThreadId = agentCreationInstructionContext?.agentId === assistantTargetAgentId
              ? agentCreationInstructionContext?.threadId
              : "";
            const assistantThreadId = String(
              assistantRunRequest?.threadId
              || contextThreadId
              || agentAssistantThreadByAgentId[assistantTargetAgentId]
              || ""
            ).trim();
            const creationAssistantAgentId = String(agentCreationAssistantAgent?.id || "").trim();
            const isAgentCreatorReady = Boolean(creationAssistantAgentId && !agentCreationAssistantPreparing && !agentCreationAssistantError);
            return React.createElement("aside", {
                className: "playground-agents-assistant-sidebar" + (agentAssistantOpen ? " is-open" : " is-closed"),
                "aria-hidden": agentAssistantOpen ? "false" : "true",
              },
              React.createElement(RunnerChat, {
                key: "agent-assistant:" + (assistantTargetAgentId || draftAgent?.id || selectedAgentId || "agent") + ":" + assistantCommandType + ":" + (assistantThreadId || "new"),
                className: "playground-agents-assistant-runner",
                backendUrl,
                apiKey,
                fetchCustomSkills,
                speechToTextUrl: speechToTextUrl || undefined,
                requestHeaders,
                resolveRequestHeaders,
                appId: "runner-web-sdk-demo",
                threadId: assistantThreadId || undefined,
                inputMode: "computer-agents",
                computerAgents: computerAgents || undefined,
                environments: (Array.isArray(environments) ? environments : []).map((environment) => ({
                  ...environment,
                  ...(preferredEnvironmentId && environment.id === preferredEnvironmentId ? { isDefault: true } : {}),
                })),
                agents: agentCreationAssistantRunnerAgents,
                hideAgentSelector: true,
                skills: Array.isArray(skills) ? skills : [],
                skillDefaults: getDemoImageGenerationSkillDefaults(),
                environmentId: preferredEnvironmentId || undefined,
                agentId: creationAssistantAgentId || undefined,
                privateMode: true,
                autoFocusComposer: agentAssistantOpen,
                keepFocusOnSubmit: true,
                showUsageInStatus: false,
                disabled: !isAgentCreatorReady || !agentAssistantOpen,
                placeholder: agentCreationAssistantPreparing
                  ? "Preparing agent creator..."
                  : agentCreationAssistantError
                    ? "Agent creator unavailable"
                    : (assistantCommandType === "team" ? "Describe your Squad" : "Describe your Agent"),
                hiddenSystemPrompt: buildAgentAssistantHiddenPrompt(assistantCommandType),
                emptyState: renderAgentAssistantEmptyState(assistantThreadId, isAgentCreatorReady),
                onThreadIdChange: (threadId) => {
                  const normalizedThreadId = String(threadId || "").trim();
                  if (!normalizedThreadId) {
                    return;
                  }
                  rememberAgentAssistantThread(assistantTargetAgentId, normalizedThreadId);
                  if (typeof onThreadRegistered === "function") {
                    onThreadRegistered(normalizedThreadId, { private: true });
                  }
                },
                onOpenPromptSearch,
                onOpenKnowledgeSearch,
                onOpenThreadSearch,
                externalRunRequest: assistantRunRequest && assistantThreadId
                  ? assistantRunRequest
                  : null,
                onExternalRunRequestHandled: (token) => {
                  setAgentCreationInstructionRunRequest((current) => (
                    current && current.token === token ? null : current
                  ));
                },
                onRunStart: (threadId) => {
                  const normalizedThreadId = String(threadId || "").trim();
                  rememberAgentAssistantThread(assistantTargetAgentId, normalizedThreadId);
                  if (!normalizedThreadId || agentCreationInstructionContext?.threadId !== normalizedThreadId) {
                    return;
                  }
                  setAgentCreationInstructionContext((current) => current && current.threadId === normalizedThreadId
                    ? { ...current, status: "running" }
                    : current
                  );
                },
                onThreadStatusChange: (threadId, nextStatus) => {
                  const normalizedThreadId = String(threadId || "").trim();
                  if (!normalizedThreadId || agentCreationInstructionContext?.threadId !== normalizedThreadId) {
                    return;
                  }
                  setAgentCreationInstructionContext((current) => current && current.threadId === normalizedThreadId
                    ? { ...current, status: String(nextStatus || "running") }
                    : current
                  );
                },
                onRunFinish: handleAgentAssistantRunFinish,
                onRunError: handleAgentAssistantRunError,
                onEnvironmentChange: (nextEnvironmentId) => {
                  if (typeof onPreferredEnvironmentChange === "function") {
                    onPreferredEnvironmentChange(String(nextEnvironmentId || "").trim());
                  }
                },
              })
            );
          }

          function renderAgentPreviewPanel() {
            if (!canShowAgentPreview || agentVersionsSidebarOpen) {
              return null;
            }

            const previewAgentId = String(draftAgent?.id || selectedAgentId || "").trim();
            if (!previewAgentId || previewAgentId === PLAYGROUND_AGENT_DRAFT_ID) {
              return null;
            }
            const previewAgentLabel = String(draftAgent?.name || "Agent").trim() || "Agent";
            const isPreviewTeamAgent = Boolean(
              draftAgent?.agentType === "team" || isPlaygroundTeamAgent(draftAgent)
            );
            const isDefaultPreviewAgent = isPlaygroundDefaultAgentConfigurationLocked(draftAgent);
            const canRefinePreviewAgent = !isDefaultPreviewAgent && canVersionPlaygroundAgent(draftAgent);
            const isPreviewRefinementRunning = Boolean(
              agentPreviewRefinementRun?.agentId === previewAgentId
              && (agentPreviewRefinementRun?.status === "running" || agentPreviewRefinementRun?.status === "syncing")
            );
            const previewAgentOption = buildPlaygroundRunnerAgentOption(draftAgent, { isDefault: true });
            const previewEnvironmentOptions = (Array.isArray(environments) ? environments : []).map((environment) => ({
              ...environment,
              ...(preferredEnvironmentId && environment.id === preferredEnvironmentId ? { isDefault: true } : {}),
            }));
            const previewServiceActions = [
              {
                id: "evaluations",
                label: "Evaluate the Agent",
                serviceLabel: "Evaluations",
                onClick: onOpenEvaluations,
              },
              {
                id: "agent-optimization",
                label: "Fine-tune the Agent",
                serviceLabel: "Agent Optimization",
                onClick: onOpenAgentOptimization,
              },
              {
                id: "refine-instructions",
                label: "Refine Instructions",
                serviceLabel: "Instructions",
                onClick: () => {
                  setAgentPreviewRefineMode(true);
                  setAgentPreviewComposerFocusRequest((current) => (Number(current) || 0) + 1);
                },
              },
            ];
            const previewRefineControl = canRefinePreviewAgent
              ? React.createElement("button", {
                  type: "button",
                  className: "playground-agent-preview-refine-control" + (agentPreviewRefineMode ? " is-active" : ""),
                  disabled: isPreviewRefinementRunning,
                  "aria-label": agentPreviewRefineMode ? "Disable instruction refinement" : "Refine Agent instructions",
                  "aria-pressed": agentPreviewRefineMode ? "true" : "false",
                  title: isPreviewRefinementRunning
                    ? "Refining instructions..."
                    : agentPreviewRefineMode
                      ? "Instruction refinement active"
                      : "Refine instructions",
                  onClick: () => setAgentPreviewRefineMode((current) => !current),
                },
                React.createElement(TestTubeDiagonal, {
                  width: 16,
                  height: 16,
                  strokeWidth: 1.8,
                  "aria-hidden": "true",
                })
              )
              : null;
            const previewEmptyState = isDefaultPreviewAgent
              ? React.createElement("div", {
                  className: "playground-agent-preview-empty-state is-default-agent",
                  "aria-hidden": "true",
                })
              : React.createElement("div", {
                className: "playground-agent-preview-empty-state",
                "aria-label": "Start a private preview thread with " + previewAgentLabel,
              },
              React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "feature",
                  className: "playground-agent-preview-guide-card",
                  "aria-labelledby": "playground-agent-preview-guide-title",
                },
                React.createElement("span", {
                    className: "platform-ui-card__feature-icon is-violet playground-agent-preview-guide-icon",
                    "aria-hidden": "true",
                  },
                  React.createElement(Sparkles, { width: 30, height: 30, strokeWidth: 1.7 })
                ),
                React.createElement("h2", {
                  id: "playground-agent-preview-guide-title",
                  className: "platform-ui-card__feature-title",
                }, "Improve this Agent"),
                React.createElement("p", {
                  className: "platform-ui-card__feature-description",
                }, "Measure quality, optimize behavior, and refine operational instructions."),
                React.createElement("div", {
                    className: "platform-ui-card__feature-links",
                    "aria-label": "Agent improvement services",
                  },
                  previewServiceActions.map((action) => React.createElement("button", {
                      key: action.id,
                      type: "button",
                      className: "platform-ui-card__feature-link playground-agent-preview-guide-action"
                        + (action.id === "refine-instructions" && agentPreviewRefineMode ? " is-active" : ""),
                      disabled: typeof action.onClick !== "function",
                      "aria-pressed": action.id === "refine-instructions"
                        ? (agentPreviewRefineMode ? "true" : "false")
                        : undefined,
                      onClick: () => {
                        if (action.id === "refine-instructions") {
                          action.onClick();
                          return;
                        }
                        requestAgentNavigation(action.onClick);
                      },
                    },
                    React.createElement("span", {
                      className: "platform-ui-card__feature-link-label",
                    }, action.label),
                    React.createElement("span", {
                        className: "platform-ui-card__feature-link-end",
                      },
                      React.createElement("span", {
                        className: "platform-ui-card__feature-link-meta",
                      }, action.serviceLabel),
                      React.createElement(ArrowRight, {
                        width: 14,
                        height: 14,
                        strokeWidth: 1.8,
                        "aria-hidden": "true",
                      })
                    )
                  ))
                )
              )
            );

            return React.createElement("aside", {
                className: "playground-agent-preview-sidebar",
                "aria-label": "Private agent preview",
              },
              React.createElement("header", { className: "playground-agent-preview-header" },
                React.createElement("span", { className: "playground-agent-preview-title" },
                  isPreviewTeamAgent ? "Preview your Squad" : "Preview your Agent"
                ),
                React.createElement(PlatformButton, {
                    variant: "primary",
                    size: "small",
                    className: "playground-agent-preview-open-thread",
                    disabled: typeof onStartThreadWithAgent !== "function",
                    onClick: handleAgentProfileNewThread,
                  },
                  React.createElement("span", null, "Open new chat"),
                  React.createElement(ArrowUpRight, {
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  })
                )
              ),
              React.createElement(RunnerChat, {
                key: "agent-preview:" + previewAgentId,
                className: "playground-agent-preview-runner",
                backendUrl,
                apiKey,
                fetchCustomSkills,
                speechToTextUrl: speechToTextUrl || undefined,
                requestHeaders,
                resolveRequestHeaders,
                appId: "runner-web-sdk-agent-preview",
                title: previewAgentLabel + " preview",
                threadViewMode: "legacy",
                threadMetadata: {
                  runnerPlayground: {
                    source: "agent-detail-preview",
                    temporary: true,
                    targetAgentId: previewAgentId,
                  },
                },
                inputMode: "computer-agents",
                computerAgents: computerAgents || undefined,
                environments: previewEnvironmentOptions,
                agents: [previewAgentOption],
                hideAgentSelector: true,
                skills: Array.isArray(skills) ? skills : [],
                skillDefaults: getDemoImageGenerationSkillDefaults(),
                enabledSkillIds: agentPreviewRefineMode
                  ? Array.from(new Set([
                      ...normalizePlaygroundEnabledSkillIds(draftAgent?.enabledSkills),
                      "computer_agents",
                    ]))
                  : undefined,
                environmentId: preferredEnvironmentId || undefined,
                agentId: previewAgentId,
                reasoningEffort: draftAgent?.reasoningEffort || undefined,
                privateMode: true,
                autoCreateThread: true,
                composerFocusRequest: agentPreviewComposerFocusRequest,
                keepFocusOnSubmit: true,
                showUsageInStatus: false,
                placeholder: agentPreviewRefineMode
                  ? "Describe how to refine " + previewAgentLabel + "'s instructions"
                  : "Message " + previewAgentLabel,
                hiddenSystemPrompt: agentPreviewRefineMode
                  ? buildAgentPreviewRefinementHiddenPrompt(draftAgent)
                  : "",
                composerBeforeAgentControl: previewRefineControl,
                onOpenPromptSearch,
                onOpenKnowledgeSearch,
                onOpenThreadSearch,
                emptyState: previewEmptyState,
                onRunStart: (threadId) => {
                  if (!agentPreviewRefineMode) {
                    return;
                  }
                  setAgentPreviewRefinementRun({
                    agentId: previewAgentId,
                    threadId: String(threadId || "").trim(),
                    status: "running",
                    baselineInstructions: String(draftAgent?.instructions || ""),
                    baselineVersionId: String(
                      getDraftAgentActiveVersion()?.id
                      || getAgentVersionMetadata()?.activeAgentVersionId
                      || getAgentVersionMetadata()?.active_agent_version_id
                      || ""
                    ).trim(),
                  });
                },
                onRunFinish: (_result, threadId) => {
                  const normalizedThreadId = String(threadId || "").trim();
                  const isRefinementRun = agentPreviewRefineMode || Boolean(
                    agentPreviewRefinementRun?.agentId === previewAgentId
                    && (!agentPreviewRefinementRun?.threadId || agentPreviewRefinementRun.threadId === normalizedThreadId)
                  );
                  if (!isRefinementRun) {
                    return;
                  }
                  setAgentPreviewRefinementRun({
                    agentId: previewAgentId,
                    threadId: normalizedThreadId,
                    status: "syncing",
                    baselineInstructions: String(agentPreviewRefinementRun?.baselineInstructions || draftAgent?.instructions || ""),
                    baselineVersionId: String(agentPreviewRefinementRun?.baselineVersionId || "").trim(),
                  });
                  void (async () => {
                    try {
                      const baselineInstructions = String(
                        agentPreviewRefinementRun?.baselineInstructions || draftAgent?.instructions || ""
                      );
                      const baselineVersionId = String(agentPreviewRefinementRun?.baselineVersionId || "").trim();
                      const latestAgent = await loadAgentDetails(previewAgentId, {
                        force: true,
                        background: true,
                      });
                      let refreshedAgent = await refreshAuthoritativeAgentVersions(previewAgentId, {
                        baseAgent: latestAgent || draftAgent,
                      });
                      const refreshedInstructions = typeof latestAgent?.instructions === "string"
                        ? latestAgent.instructions
                        : String(refreshedAgent?.instructions || "");
                      const refreshedActiveVersion = readPlaygroundAgentVersions(refreshedAgent)
                        .find((version) => version.status === "active") || null;
                      if (
                        refreshedInstructions !== baselineInstructions
                        && baselineVersionId
                        && String(refreshedActiveVersion?.id || "").trim() === baselineVersionId
                      ) {
                        const fallbackSnapshot = buildPlaygroundAgentVersionSnapshot({
                          ...refreshedAgent,
                          instructions: refreshedInstructions,
                        });
                        const fallbackVersion = await createAgentVersionApi(previewAgentId, fallbackSnapshot, {
                          description: "Refined from Agent details preview",
                        });
                        await publishAgentVersionApi(previewAgentId, fallbackVersion.id, {
                          snapshot: fallbackSnapshot,
                          description: "Refined from Agent details preview",
                        });
                        refreshedAgent = await refreshAuthoritativeAgentVersions(previewAgentId, {
                          baseAgent: refreshedAgent,
                          preferredSelectedId: fallbackVersion.id,
                        });
                      }
                      if (typeof onAgentMutated === "function") {
                        await onAgentMutated();
                      }
                      setAgentPreviewRefineMode(false);
                      setAgentPreviewRefinementRun({
                        agentId: "",
                        threadId: "",
                        status: "idle",
                        baselineInstructions: "",
                        baselineVersionId: "",
                      });
                    } catch (_error) {
                      setAgentPreviewRefinementRun({
                        agentId: previewAgentId,
                        threadId: normalizedThreadId,
                        status: "failed",
                        baselineInstructions: String(agentPreviewRefinementRun?.baselineInstructions || draftAgent?.instructions || ""),
                        baselineVersionId: String(agentPreviewRefinementRun?.baselineVersionId || "").trim(),
                      });
                    }
                  })();
                },
                onRunError: (_error, threadId) => {
                  if (!agentPreviewRefineMode) {
                    return;
                  }
                  setAgentPreviewRefinementRun({
                    agentId: previewAgentId,
                    threadId: String(threadId || "").trim(),
                    status: "failed",
                    baselineInstructions: String(agentPreviewRefinementRun?.baselineInstructions || draftAgent?.instructions || ""),
                    baselineVersionId: String(agentPreviewRefinementRun?.baselineVersionId || "").trim(),
                  });
                },
                onRunCancel: (threadId) => {
                  if (!agentPreviewRefineMode) {
                    return;
                  }
                  setAgentPreviewRefinementRun({
                    agentId: previewAgentId,
                    threadId: String(threadId || "").trim(),
                    status: "failed",
                    baselineInstructions: String(agentPreviewRefinementRun?.baselineInstructions || draftAgent?.instructions || ""),
                    baselineVersionId: String(agentPreviewRefinementRun?.baselineVersionId || "").trim(),
                  });
                },
                onEnvironmentChange: (nextEnvironmentId) => {
                  if (typeof onPreferredEnvironmentChange === "function") {
                    onPreferredEnvironmentChange(String(nextEnvironmentId || "").trim());
                  }
                },
              })
            );
          }
  
          function renderAgentVersionsSidebar(options = {}) {
            if (!canShowAgentVersions || !agentVersionsSidebarOpen) {
              return null;
            }
            const versions = readDraftAgentVersions();
            const metadata = getAgentVersionMetadata();
            const activeVersion = getDraftAgentActiveVersion();
            const selectedVersion = getDraftAgentSelectedVersion();
            const activeVersionId = String(activeVersion?.id || metadata.activeAgentVersionId || metadata.active_agent_version_id || "").trim();
            const selectedVersionId = String(
              selectedVersion?.id
              ||
              metadata.restoredFromAgentVersionId
              || metadata.restored_from_agent_version_id
              || activeVersionId
              || ""
            ).trim();
            const normalizedAgentId = String(draftAgent?.id || selectedAgentId || "").trim();
            const versionsLoading = agentVersionsLoadState.agentId === normalizedAgentId
              && agentVersionsLoadState.status === "loading";
            const versionsError = agentVersionsLoadState.agentId === normalizedAgentId
              && agentVersionsLoadState.status === "error"
              ? agentVersionsLoadState.error
              : "";
            const mutationStateContent = agentVersionState.status === "loading"
              ? React.createElement("div", { className: "platform-version-history-sidebar__state" },
                  agentVersionState.message || "Saving agent version..."
                )
              : agentVersionState.status === "error" && agentVersionState.error
                ? React.createElement("div", {
                    className: "platform-version-history-sidebar__state is-error",
                    role: "alert",
                  }, agentVersionState.error)
                : null;
            return React.createElement(PlatformVersionHistorySidebar, {
              open: agentVersionsSidebarOpen,
              title: "Version history",
              sectionTitle: "All Versions",
              className: "playground-agent-versions-sidebar",
              width: "var(--playground-thread-task-detail-width)",
              portal: Boolean(options.portal),
              portalTarget: options.portalTarget || null,
              versions,
              activeVersionId,
              selectedVersionId,
              loading: versionsLoading,
              loadingMessage: "Loading versions",
              error: versionsError || null,
              emptyDescription: "Save changes to create this agent's first version.",
              busy: saveState.isSaving || agentVersionState.status === "loading",
              stateContent: mutationStateContent,
              onClose: () => {
                setAgentVersionChangesState(null);
                closeAgentVersionsSidebar();
              },
              onSelectVersion: (versionId) => void restoreAgentVersion(versionId),
              onPublishVersion: (versionId) => void publishAgentVersion(versionId),
              canPublishVersion: (version) => canPublishAgentVersion(version),
              onViewChanges: () => openAgentVersionChangesModal(),
              getVersionCreatedAt: (version) => {
                const timestamp = version.createdAt || version.updatedAt || version.publishedAt;
                return timestamp ? formatAgentVersionTimestamp(timestamp) : "-";
              },
              getVersionActions: (version) => [
                {
                  id: "edit",
                  label: "Edit description",
                  icon: SquarePen,
                  onSelect: () => openEditAgentVersionModal(version.id),
                },
                {
                  id: "compare",
                  label: "View Changes",
                  icon: Code2,
                  onSelect: () => openAgentVersionChangesModal(version.id),
                },
                {
                  id: "delete",
                  label: "Delete version",
                  icon: Trash2,
                  danger: true,
                  disabled: version.status === "active" || versions.length <= 1,
                  onSelect: () => void deleteAgentVersion(version.id),
                },
              ],
            });
          }
  
          function renderAgentVersionsSidebarPortal() {
            if (!canShowAgentVersions || !agentVersionsSidebarOpen) return null;
            if (agentVersionsDrawerContainer) {
              return renderAgentVersionsSidebar({
                portal: true,
                portalTarget: agentVersionsDrawerContainer,
              });
            }
            if (versionsDrawerPortalId) return null;
            return renderAgentVersionsSidebar();
          }
  
          function renderAgentPublishAction() {
            const canShowPublish = Boolean(
              !shouldShowAgentsHome
              && !agentCreationSetupOpen
              && draftAgent?.id
              && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID
              && canVersionPlaygroundAgent(draftAgent)
            );
            if (!canShowPublish) {
              return null;
            }
            const isVersionControlBusy = saveState.isSaving || agentVersionState.status === "loading";
            const versionHasChanges = hasDraftAgentVersionChanges();
            const isPublishControlDisabled = Boolean(!draftAgent || isVersionControlBusy || !versionHasChanges);
            const isPublishMenuDisabled = isPublishControlDisabled;
            const versionPopupActions = getAgentVersionPopupActions();
  	          return React.createElement(AgentPublishControl, {
  	            open: agentPublishMenuOpen,
  	            actions: versionPopupActions,
              active: agentPublishMenuOpen,
              disabled: isPublishControlDisabled,
              menuDisabled: isPublishMenuDisabled,
              label: "Save Changes",
              leading: React.createElement(Bookmark, { strokeWidth: 1.8 }),
              publishAriaLabel: "Save agent changes",
              onOpenChange: (nextOpen) => {
                setAgentVersionSelectorMenuOpen(false);
                setAgentVersionsHeaderMenuOpen(false);
                setAgentPublishMenuOpen(nextOpen);
              },
              onPublish: () => openAgentVersionSaveDialog(),
            });
          }

          function renderAgentVersionSaveDialog() {
            if (!agentVersionSaveDialog) {
              return null;
            }
            const versionData = buildAgentVersionSaveDialogData();
            const isBusy = saveState.isSaving || agentVersionState.status === "loading";
            return React.createElement(PlatformVersionSaveDialog, {
              open: true,
              title: "Review changes",
              currentVersion: versionData.currentVersion,
              nextVersion: versionData.nextVersion,
              currentDescription: versionData.currentDescription,
              initialMode: agentVersionSaveDialog.initialMode || "new",
              canSaveCurrent: versionData.canSaveCurrent,
              instanceKey: agentVersionSaveDialog.key,
              pending: isBusy,
              error: agentVersionState.status === "error"
                ? agentVersionState.error
                : null,
              changes: versionData.diffFiles.map((file) => ({
                id: file.id,
                label: file.label || file.filePath,
                content: React.createElement(PlatformDiffViewer, {
                  filePath: file.filePath,
                  diffContent: file.diffContent || "",
                  fileContent: file.fileContent || "",
                  additions: file.additions,
                  deletions: file.deletions,
                  hideTopbar: true,
                  embedded: true,
                  defaultExpanded: true,
                  maxHeight: 330,
                }),
              })),
              emptyChanges: "No changes were found between the editor and the selected version.",
              onClose: () => {
                if (!isBusy) setAgentVersionSaveDialog(null);
              },
              onSubmit: async (details) => {
                const savedAgent = await saveAndPublishCurrentAgentVersion(details);
                if (!savedAgent) {
                  throw new Error("The agent could not be saved and published. Review the validation details and try again.");
                }
                setAgentVersionSaveDialog(null);
              },
            });
          }
  
          function renderAgentVersionChangesModal() {
            if (!agentVersionChangesState) {
              return null;
            }
            const versions = readDraftAgentVersions();
            const sources = buildAgentVersionCompareSources(versions);
            const legacyTargetSourceId = agentVersionChangesState.targetVersionId
              ? getAgentVersionCompareVersionSourceId(agentVersionChangesState.targetVersionId)
              : "";
            const requestedLeftSourceId = String(agentVersionChangesState.leftSourceId || legacyTargetSourceId || "").trim()
              || getDefaultAgentVersionCompareLeftSourceId(versions);
            const requestedRightSourceId = String(agentVersionChangesState.rightSourceId || "").trim()
              || AGENT_VERSION_COMPARE_CURRENT_EDITOR_ID;
            const currentEditorSource = sources.find((source) => source.id === AGENT_VERSION_COMPARE_CURRENT_EDITOR_ID) || sources[0] || null;
            const leftSource = resolveAgentVersionCompareSource(requestedLeftSourceId, sources, sources[1] || currentEditorSource);
            const rightSource = resolveAgentVersionCompareSource(requestedRightSourceId, sources, currentEditorSource);
            if (!leftSource || !rightSource) {
              return null;
            }
            const orderedCompareSources = orderAgentVersionCompareSourcesForDiff(leftSource, rightSource);
            const displayLeftSource = orderedCompareSources.leftSource;
            const displayRightSource = orderedCompareSources.rightSource;
            const diffFiles = buildAgentVersionDiffFilesFromSnapshots(displayLeftSource.snapshot, displayRightSource.snapshot);
            const compareOptions = sources.map((source) => ({
              value: source.id,
              label: source.label,
            }));
            return renderPlaygroundVersionChangesModal({
              title: "Changes",
              leftSelector: {
                value: displayLeftSource.id,
                options: compareOptions,
                onValueChange: (value) => handleAgentVersionCompareSourceChange(orderedCompareSources.leftStateSide, value),
                ariaLabel: "Select base agent version",
              },
              rightSelector: {
                value: displayRightSource.id,
                options: compareOptions,
                onValueChange: (value) => handleAgentVersionCompareSourceChange(orderedCompareSources.rightStateSide, value),
                ariaLabel: "Select target agent version",
              },
              actions: renderAgentPublishAction(),
              files: diffFiles,
              closeButtonLabel: "Close agent version changes",
              onClose: closeAgentVersionChangesModal,
              emptyMessage: "No differences from the current editor.",
              className: "playground-agents-version-changes-modal__content",
            });
          }
  
          function renderAgentVersionModal() {
            if (!agentVersionModal) {
              return null;
            }
            const isBusy = saveState.isSaving || agentVersionState.status === "loading";
            const versionLabel = formatPlatformVersionLabel(agentVersionModal.version);
  
            function renderAgentVersionDescriptionField() {
              return React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-tasks-issue-description-editor playground-agents-version-description-editor" },
                React.createElement("div", { className: "playground-tasks-detail-section-header" },
                  React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
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
                        disabled: isBusy,
                        onMouseDown: (event) => event.preventDefault(),
                        onClick: () => handleAgentVersionDescriptionFormat(action.id),
                      }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                    )
                  )
                ),
                React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isAgentVersionDescriptionEditing ? " is-editing" : " is-preview") },
                  !isAgentVersionDescriptionEditing
                    ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                        String(agentVersionDescriptionDraft || "").trim()
                          ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                              content: agentVersionDescriptionDraft,
                              className: "playground-tasks-detail-description-preview tb-message-markdown",
                            })
                          : React.createElement("div", {
                              className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                            }, "Describe what changed in this version.")
                      )
                    : null,
                  React.createElement("textarea", {
                    ref: agentVersionDescriptionTextareaRef,
                    className: "playground-tasks-detail-description-input " + (isAgentVersionDescriptionEditing ? "is-editing" : "is-preview"),
                    rows: 1,
                    placeholder: isAgentVersionDescriptionEditing ? "Describe what changed in this version." : "",
                    value: agentVersionDescriptionDraft || "",
                    disabled: isBusy,
                    onFocus: (event) => {
                      setIsAgentVersionDescriptionEditing(true);
                      resizeAgentDescriptionTextarea(event.currentTarget);
                    },
                    onChange: (event) => {
                      setAgentVersionDescriptionDraft(event.target.value);
                      resizeAgentDescriptionTextarea(event.currentTarget);
                    },
                    onBlur: () => setIsAgentVersionDescriptionEditing(false),
                    onKeyDown: (event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        closeAgentVersionModal();
                      }
                    },
                  })
                )
              );
            }
  
            return renderPlaygroundPlatformModal({
              open: Boolean(agentVersionModal),
              visible: agentVersionModalVisible,
              closing: agentVersionModalClosing,
              onClose: () => closeAgentVersionModal(),
              as: "form",
              backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-version-modal-backdrop",
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-version-modal",
              ariaLabel: "Edit agent version",
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  void commitAgentVersionModal();
                },
                onKeyDown: (event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    closeAgentVersionModal();
                  }
                },
              },
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
                  React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                    React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
                      React.createElement(SquarePen, { width: 18, height: 18, strokeWidth: 1.9 })
                    ),
                    React.createElement("input", {
                      type: "text",
                      className: "playground-tasks-project-modal-name-input playground-tasks-issue-modal-title-input",
                      value: versionLabel,
                      "aria-label": "Version identifier",
                      readOnly: true,
                      tabIndex: -1,
                      disabled: isBusy,
                    })
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-settings-icon-button playground-tasks-project-modal-close",
                    onClick: () => closeAgentVersionModal(),
                    title: "Close",
                    disabled: isBusy,
                  }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                ),
                React.createElement("div", { className: "playground-tasks-issue-modal-body" },
                  renderAgentVersionDescriptionField(),
                  agentVersionState.status === "error" && agentVersionState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, agentVersionState.error)
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeAgentVersionModal(),
                    disabled: isBusy,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: isBusy,
                  }, isBusy ? "Saving..." : "Save Version")
                )
              )
            });
          }
  
          function renderModularAgentsOverviewPage() {
            const allOverviewAgents = allKnownAgents.filter((agent) => agent?.id && agent.id !== PLAYGROUND_AGENT_DRAFT_ID);
            const compactAnalyticsSnapshot = agentsOverviewAnalyticsState.scopeKey === agentsOverviewAnalyticsScopeKey
              ? agentsOverviewAnalyticsState.dataByPeriod?.[agentsHomeChartTimescale] || null
              : null;
            const hasCompactAnalytics = Array.isArray(compactAnalyticsSnapshot?.buckets)
              && compactAnalyticsSnapshot.buckets.length > 0;
            const squadAgentIds = new Set(
              allOverviewAgents.filter((agent) => isPlaygroundTeamAgent(agent)).map((agent) => String(agent.id || "").trim()).filter(Boolean)
            );
            const latestActivityByAgentId = new Map();
            const periodStart = new Date();
            if (agentsHomeChartTimescale === "day") {
              periodStart.setHours(0, 0, 0, 0);
            } else if (agentsHomeChartTimescale === "week") {
              periodStart.setDate(periodStart.getDate() - 6);
              periodStart.setHours(0, 0, 0, 0);
            } else {
              periodStart.setDate(periodStart.getDate() - 29);
              periodStart.setHours(0, 0, 0, 0);
            }
            const bucketCount = agentsHomeChartTimescale === "day" ? 24 : agentsHomeChartTimescale === "week" ? 7 : 30;
            const bucketDurationMs = agentsHomeChartTimescale === "day" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
            const bucketFormatter = agentsHomeChartTimescale === "day"
              ? new Intl.DateTimeFormat("en-US", { hour: "numeric" })
              : agentsHomeChartTimescale === "week"
                ? new Intl.DateTimeFormat("en-US", { weekday: "short" })
                : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
            const buckets = Array.from({ length: bucketCount }, (_, index) => {
              const date = new Date();
              if (agentsHomeChartTimescale === "day") {
                date.setMinutes(0, 0, 0);
                date.setHours(date.getHours() - (bucketCount - 1 - index));
              } else {
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() - (bucketCount - 1 - index));
              }
              return { startMs: date.getTime(), endMs: date.getTime() + bucketDurationMs, label: bucketFormatter.format(date) };
            });
            const agentRuns = buckets.map(() => 0);
            const squadRuns = buckets.map(() => 0);
            const agentCostsUsd = buckets.map(() => 0);
            const squadCostsUsd = buckets.map(() => 0);
            const combinedTokens = buckets.map(() => 0);
            const usageTokensByAgentId = new Map();
  
            const readThreadUsageTokens = (thread) => {
              const totalTokens = Number(thread?.totalTokens ?? thread?.total_tokens);
              if (Number.isFinite(totalTokens) && totalTokens > 0) {
                return Math.round(totalTokens);
              }
              const inputTokens = Math.max(0, Number(thread?.inputTokens ?? thread?.input_tokens) || 0);
              const outputTokens = Math.max(0, Number(thread?.outputTokens ?? thread?.output_tokens) || 0);
              const cacheTokens = Math.max(0, Number(thread?.cacheTokens ?? thread?.cache_tokens) || 0);
              return Math.round(inputTokens + outputTokens + cacheTokens);
            };
  
            if (hasCompactAnalytics) {
              compactAnalyticsSnapshot.buckets.forEach((bucket, index) => {
                if (index >= buckets.length) return;
                agentRuns[index] = Math.max(0, Number(bucket?.agentRuns) || 0);
                squadRuns[index] = Math.max(0, Number(bucket?.squadRuns) || 0);
                agentCostsUsd[index] = Math.max(0, Number(bucket?.agentCostUsd) || 0);
                squadCostsUsd[index] = Math.max(0, Number(bucket?.squadCostUsd) || 0);
                combinedTokens[index] = Math.max(0, Number(bucket?.tokens) || 0);
              });
              (Array.isArray(compactAnalyticsSnapshot.resources) ? compactAnalyticsSnapshot.resources : []).forEach((resource) => {
                const agentId = String(resource?.agentId || "").trim();
                if (!agentId) return;
                usageTokensByAgentId.set(agentId, Math.max(0, Number(resource?.tokenCount) || 0));
                const activityValue = String(resource?.lastUsedAt || "").trim();
                const activityTimestamp = Date.parse(activityValue);
                if (Number.isFinite(activityTimestamp)) {
                  latestActivityByAgentId.set(agentId, { timestamp: activityTimestamp, value: activityValue });
                }
              });
            } else {
              (Array.isArray(agentsHomeThreadRecords) ? agentsHomeThreadRecords : []).forEach((thread) => {
                const agentId = String(thread?.agentId || thread?.agent?.id || thread?.metadata?.agentId || "").trim();
                const activityValue = thread?.updatedAt || thread?.createdAt || "";
                const activityTimestamp = Date.parse(String(activityValue));
                if (agentId && Number.isFinite(activityTimestamp)) {
                  const current = latestActivityByAgentId.get(agentId);
                  if (!current || activityTimestamp > current.timestamp) {
                    latestActivityByAgentId.set(agentId, { timestamp: activityTimestamp, value: activityValue });
                  }
                }
                const createdAt = Date.parse(String(thread?.createdAt || thread?.updatedAt || ""));
                if (!Number.isFinite(createdAt) || createdAt < periodStart.getTime()) return;
                const usageTokens = readThreadUsageTokens(thread);
                if (agentId) {
                  usageTokensByAgentId.set(
                    agentId,
                    (usageTokensByAgentId.get(agentId) || 0) + usageTokens,
                  );
                }
                const bucketIndex = buckets.findIndex((bucket) => createdAt >= bucket.startMs && createdAt < bucket.endMs);
                if (bucketIndex < 0) return;
                combinedTokens[bucketIndex] += usageTokens;
                const isSquad = squadAgentIds.has(agentId);
                const costUsd = Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0)) / SETTINGS_CT_PER_DOLLAR;
                if (isSquad) {
                  squadRuns[bucketIndex] += 1;
                  squadCostsUsd[bucketIndex] += costUsd;
                } else {
                  agentRuns[bucketIndex] += 1;
                  agentCostsUsd[bucketIndex] += costUsd;
                }
              });
            }
  
            const compactAnalyticsLoading = agentsOverviewAnalyticsState.scopeKey === agentsOverviewAnalyticsScopeKey
              && agentsOverviewAnalyticsState.loadingPeriod === agentsHomeChartTimescale;
            const compactAnalyticsError = agentsOverviewAnalyticsState.scopeKey === agentsOverviewAnalyticsScopeKey
              ? String(agentsOverviewAnalyticsState.errorsByPeriod?.[agentsHomeChartTimescale] || "")
              : "";
            const analyticsLoading = !hasCompactAnalytics && (compactAnalyticsLoading || agentsHomeThreadsLoading);
            const analyticsError = hasCompactAnalytics || analyticsLoading
              ? ""
              : (agentsHomeThreadsError || compactAnalyticsError);
  
            const analytics = createAgentsOverviewAnalytics({
              agentCount: allOverviewAgents.filter((agent) => (
                !isPlaygroundTeamAgent(agent)
                && !isPlaygroundFunctionalAgent(agent)
              )).length,
              squadCount: squadAgentIds.size,
              loading: analyticsLoading,
              error: analyticsError || null,
              formatCurrency: formatSettingsUsdCredits,
              buckets: buckets.map((bucket, index) => ({
                label: hasCompactAnalytics ? String(compactAnalyticsSnapshot.buckets[index]?.label || bucket.label) : bucket.label,
                agentRuns: agentRuns[index],
                squadRuns: squadRuns[index],
                agentCostUsd: agentCostsUsd[index],
                squadCostUsd: squadCostsUsd[index],
                tokens: combinedTokens[index],
              })),
            });
  
            const getCreator = (agent) => {
              if (agent?.isDefault === true || agent?.isSystem === true || isPlaygroundDefaultAgentConfigurationLocked(agent)) {
                return { name: "Computer Agents", avatarUrl: COMPUTER_AGENTS_CREATOR_PROFILE_URL, isSystem: true };
              }
              const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
              const nested = agent?.creator && typeof agent.creator === "object"
                ? agent.creator
                : agent?.createdBy && typeof agent.createdBy === "object"
                  ? agent.createdBy
                  : metadata?.creator && typeof metadata.creator === "object"
                    ? metadata.creator
                    : metadata?.createdBy && typeof metadata.createdBy === "object"
                      ? metadata.createdBy
                      : {};
              const name = String(nested?.name || nested?.displayName || agent?.creatorName || agent?.createdByName || metadata?.creatorName || metadata?.createdByName || currentUserName || currentUserEmail || "Unknown").trim();
              const avatarUrl = String(nested?.avatarUrl || nested?.photoUrl || nested?.photoURL || agent?.creatorAvatarUrl || agent?.createdByAvatarUrl || metadata?.creatorAvatarUrl || metadata?.createdByAvatarUrl || currentUserAvatarUrl || "").trim();
              return { name, avatarUrl: canRenderAvatarImage(avatarUrl) ? avatarUrl : "", isSystem: false };
            };
            const overviewAgentListMode = agentListMode === "teams" ? "teams" : "agents";
            const agentRows = allOverviewAgents
              .filter((agent) => (
                getPlaygroundAgentListMode(agent) === overviewAgentListMode
                && !isPlaygroundAgentCreatorAgent(agent)
                && !isPlaygroundFunctionalAgent(agent)
              ))
              .filter((agent) => agent?.id && agent.id !== PLAYGROUND_AGENT_DRAFT_ID)
              .map((agent) => {
                const name = String(agent?.name || (isPlaygroundTeamAgent(agent) ? "Untitled Squad" : "Untitled Agent")).trim();
                const isFunctional = isPlaygroundFunctionalAgent(agent);
                const modelMeta = getPlaygroundAgentModelMeta(agent?.model || "claude-haiku-4-5", resolvedAgentModelOptions);
                const modelIcon = modelMeta
                  ? getPlaygroundAgentModelProviderIcon(modelMeta)
                  : null;
                const creator = getCreator(agent);
                const profilePhotoUrl = normalizeSessionPhotoUrl(getPlaygroundAgentProfilePhotoUrl(agent));
                const lastUsed = latestActivityByAgentId.get(String(agent.id || "").trim())?.value || agent?.lastRunAt || agent?.metadata?.lastRunAt || "";
                const lastUsedAt = Date.parse(String(lastUsed || ""));
                return {
                  id: String(agent.id),
                  name,
                  usageTokens: usageTokensByAgentId.get(String(agent.id || "").trim()) || 0,
                  searchText: [name, agent?.description || "", agent?.instructions || ""].join(" "),
                  avatarUrl: canRenderAvatarImage(profilePhotoUrl) ? profilePhotoUrl : "",
                  avatarFallback: name.charAt(0).toUpperCase() || "A",
                  isSquad: isPlaygroundTeamAgent(agent),
                  isFunctional,
                  isSystem: Boolean(agent?.isDefault || agent?.isSystem || isFunctional),
                  modelLabel: String(agent?.modelLabel || modelMeta?.label || modelMeta?.id || agent?.model || "Selected model"),
                  modelIconUrl: modelIcon?.src || "",
                  modelIconClassName: modelIcon?.className || "",
                  creatorName: creator.name,
                  creatorAvatarUrl: creator.avatarUrl,
                  creatorFallback: getAccountInitials(creator.name),
                  creatorIsSystem: creator.isSystem,
                  lastUsedAt: Number.isFinite(lastUsedAt) ? lastUsedAt : 0,
                  lastUsedLabel: lastUsed ? formatPlaygroundFileDate(lastUsed) : (analyticsLoading ? "Loading..." : "Never"),
                  lastUsedTitle: lastUsed ? formatPlaygroundExactDate(lastUsed) : "",
                };
              });
            const resolveSourceAgent = (row) => allOverviewAgents.find((agent) => String(agent?.id || "") === row.id) || null;
            return React.createElement(AgentsOverviewPage, {
              rows: agentRows,
              mode: overviewAgentListMode === "teams" ? "squads" : "agents",
              onModeChange: (mode) => handleAgentListModeChange(
                mode === "squads"
                  ? "teams"
                  : "agents"
              ),
              period: agentsHomeChartTimescale,
              onPeriodChange: setAgentsHomeChartTimescale,
              analytics,
              controlsPortalId: "playground-resource-overview-controls",
              periodPortalId: "playground-agents-overview-period-controls",
              loading: false,
              mutating: saveState.isSaving,
              onOpen: (row) => handleAgentSelect(row.id),
              onCreateAgent: handleCreateAgent,
              onCreateSquad: handleCreateTeam,
              onRename: (row) => {
                const agent = resolveSourceAgent(row);
                if (agent) openAgentRenameDialog(agent);
              },
              onShare: (rows) => {
                const ids = rows.map((row) => row.id).filter(Boolean);
                if (ids.length === 1) {
                  const agent = resolveSourceAgent(rows[0]);
                  if (agent) openAgentSendToTeamModal(agent);
                  return;
                }
                openAgentSendToTeamModal(null, { agentIds: ids });
              },
              onAddToSquad: (rows) => {
                const ids = rows.map((row) => row.id).filter(Boolean);
                if (ids.length === 1) {
                  const agent = resolveSourceAgent(rows[0]);
                  if (agent) openAgentAddToSquadModal(agent);
                  return;
                }
                openAgentAddToSquadModal(null, { agentIds: ids });
              },
              onCopy: (row) => {
                const agent = resolveSourceAgent(row);
                if (agent) openAgentCopyModal(agent);
              },
              onDelete: (rows) => {
                const agentsToDelete = rows.map(resolveSourceAgent).filter(Boolean);
                if (agentsToDelete.length === 1) void handleDeleteAgent(agentsToDelete[0].id);
                else if (agentsToDelete.length > 1) void handleDeleteAgents(agentsToDelete);
              },
            });
          }
  
  	        const agentsHomeComposerSourceAgents = useMemo(
  	          () => ensurePlaygroundComposerDefaultChoices(Array.isArray(agents) ? agents : []),
  	          [agents]
  	        );
          const agentsHomeComposerAgentId = (() => {
            const normalizedAgentId = String(preferredAgentId || "").trim();
            if (!isFreeAgentPlan) {
              return normalizedAgentId;
            }
  
            const selectedAgent = agentsHomeComposerSourceAgents.find((agent) => String(agent?.id || "").trim() === normalizedAgentId) || null;
            if (selectedAgent && !isPlaygroundFreePlanLockedComposerAgent(selectedAgent)) {
              return normalizedAgentId;
            }
  
            const sparkAgent = agentsHomeComposerSourceAgents.find((agent) => isPlaygroundAssistantAgent(agent));
            const selectableAgent = agentsHomeComposerSourceAgents.find((agent) => !isPlaygroundFreePlanLockedComposerAgent(agent));
            return String((sparkAgent || selectableAgent || agentsHomeComposerSourceAgents[0])?.id || "").trim();
          })();
          const agentsHomeComposerAgents = agentsHomeComposerSourceAgents.map((agent) => (
            buildPlaygroundRunnerAgentOption(agent, agentsHomeComposerAgentId && agent.id === agentsHomeComposerAgentId ? { isDefault: true } : {})
          ));

          if (creationOnly) {
            return React.createElement(React.Fragment, null,
              renderAgentCreationSetupModal(),
              renderAgentCreationPermissionModal(),
              renderAgentModelPickerDialog()
            );
          }
  
          if (embeddedInResources) {
            return React.createElement(React.Fragment, null,
              agentsTitleActions,
              agentsTopNavActions,
              shouldShowAgentsHome || (agentCreationSetupOpen && !agentCreationSetupDraft)
                ? React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page playground-resources-page playground-agents-overview-page is-develop-configure-page" },
                    renderModularAgentsOverviewPage()
                  )
                : React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page playground-resources-page playground-agents-detail-assistant-page" },
                    React.createElement("div", { className: agentDetailLayoutClass },
                      React.createElement("div", { className: "playground-agents-detail-main-pane" },
                        React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll", ref: agentResourcesDetailScrollRef },
                          React.createElement("div", { className: "playground-resources-detail-content" },
                            isLoadingCurrentAgent && !draftAgent
                              ? React.createElement("div", { className: "playground-files-state" },
                                  React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                                )
                              : renderCurrentAgentEditor()
                          )
                        )
                      ),
                      renderAgentPreviewPanel()
                    )
                  ),
  	            renderAgentVersionsSidebarPortal(),
              renderAgentVersionSaveDialog(),
  	            renderAgentVersionModal(),
  	            renderAgentListActionMenu(),
              renderAgentBulkActionMenu(),
              renderAgentRenameModal(),
              renderAgentComposerDialog(),
              renderAgentCreationSetupModal(),
              renderAgentCreationPermissionModal(),
              renderAgentModelPickerDialog(),
              renderAgentSendToTeamModal(),
              renderAgentAddToSquadModal(),
              renderAgentApiModal()
            );
          }
  
          return React.createElement("div", { className: "playground-environments-page playground-agents-page" },
            React.createElement("div", { className: "playground-environments-shell" },
              React.createElement("aside", { className: "playground-environments-list-pane" },
                React.createElement("div", { className: "playground-files-browser-header playground-environments-list-header" },
                  toolbarPopover
                    ? React.createElement(PlatformPopupDismissLayer, {
                        className: "playground-files-search-backdrop",
                        onClick: () => setToolbarPopover(""),
                      })
                    : null,
                  React.createElement("div", { className: "playground-files-topbar" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-list-title playground-environments-list-title-button",
                      onClick: showAgentsHome,
                    }, "Agents"),
                    React.createElement("div", { className: "playground-files-topbar-actions" },
                      React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-environments-search-shell" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-files-header-icon-button is-plain" + (toolbarPopover === "search" ? " is-active" : ""),
                          onClick: () => toggleToolbarPopover("search"),
                          title: agentListMode === "teams"
                            ? "Search squads"
                            : agentListMode === "functional"
                              ? "Search functional agents"
                              : "Search agents",
                        }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
                        toolbarPopover === "search"
                          ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                              React.createElement("div", { className: "playground-tasks-project-search-header" },
                                React.createElement("div", { className: "playground-tasks-project-search-title" }, agentListMode === "teams"
                                  ? "Search Squads"
                                  : agentListMode === "functional"
                                    ? "Search Functional Agents"
                                    : "Search Agents"),
                                React.createElement("button", {
                                  type: "button",
                                  className: "playground-tasks-project-search-close",
                                  onClick: () => setToolbarPopover(""),
                                }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                              ),
                              React.createElement("div", { className: "playground-tasks-project-search-body" },
                                React.createElement("div", { className: "playground-files-search-field" },
                                  React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                                  React.createElement("input", {
                                    ref: searchPopupInputRef,
                                    type: "text",
                                    className: "playground-files-search-field-input",
                                    placeholder: agentListMode === "teams"
                                      ? "Search squads by name, description, or instructions..."
                                      : agentListMode === "functional"
                                        ? "Search functional agents by name or purpose..."
                                        : "Search agents by name, description, or instructions...",
                                    value: searchPopupQuery,
                                    onChange: (event) => setSearchPopupQuery(event.target.value),
                                  })
                                ),
                                searchPopupQuery.trim()
                                  ? searchResults.length > 0
                                    ? React.createElement("div", { className: "playground-files-search-results" },
                                        searchResults.map((agent) =>
                                          React.createElement("button", {
                                              key: agent.id,
                                              type: "button",
                                              className: "playground-files-search-result",
                                              onClick: () => handleAgentSelect(agent.id),
                                            },
                                              (agent?.agentType === "team" || isPlaygroundTeamAgent(agent))
                                                ? React.createElement(Layers, { className: "playground-files-entry-icon", strokeWidth: 1.8 })
                                                : renderAgentListAvatar(agent, "playground-agent-list-avatar"),
                                              React.createElement("div", { className: "playground-files-search-result-copy" },
                                                React.createElement("div", { className: "playground-files-search-result-name" }, agent.name || "Untitled Agent"),
                                                React.createElement("div", { className: "playground-files-search-result-path" }, agent.description || ((agent?.agentType === "team" || isPlaygroundTeamAgent(agent)) ? "Agent squad" : agent.id || "No description"))
                                              )
                                              )
                                            )
                                        )
                                      : React.createElement("div", { className: "playground-files-search-empty" }, agentListMode === "teams"
                                        ? "No matching squads found."
                                        : agentListMode === "functional"
                                          ? "No matching functional agents found."
                                          : "No matching agents found.")
                                  : React.createElement("div", { className: "playground-tasks-project-search-hint" }, agentListMode === "teams"
                                    ? "Type a squad name, description, or instruction to search."
                                    : agentListMode === "functional"
                                      ? "Type a functional agent name or purpose to search."
                                      : "Type an agent name, description, or instruction to search.")
                              )
                            )
                          : null
                      ),
                      agentListMode !== "functional"
                        ? React.createElement("div", { className: "playground-files-toolbar-anchor" },
                            React.createElement("button", {
                              type: "button",
                              className: "playground-files-header-icon-button" + (agentComposerOpen ? " is-active" : ""),
                              onClick: () => {
                                if (agentListMode === "teams") {
                                  handleCreateTeam();
                                } else {
                                  handleCreateAgent();
                                }
                              },
                              title: "Create agent or squad",
                            }, React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 })),
                          )
                        : null
                    )
                  ),
                  React.createElement("div", { className: "playground-agents-list-switch-row" },
                    React.createElement("div", { className: "content-mode-switch playground-agents-list-switch" },
                      React.createElement("button", {
                        type: "button",
                        className: "content-mode-button" + (agentListMode === "agents" ? " is-active" : ""),
                        onClick: () => handleAgentListModeChange("agents"),
                        "aria-pressed": agentListMode === "agents",
                      }, "Agents"),
                      React.createElement("button", {
                        type: "button",
                        className: "content-mode-button" + (agentListMode === "teams" ? " is-active" : ""),
                        onClick: () => handleAgentListModeChange("teams"),
                        "aria-pressed": agentListMode === "teams",
                      }, "Squads")
                    )
                  )
                ),
                React.createElement("div", { className: "playground-environments-list-body" },
                  displayAgents.length > 0
                    ? groupedDisplayAgents.map((section) =>
                        React.createElement("div", { key: section.key, className: "playground-agents-list-section" + (section.key === "system" ? " is-system" : "") },
                          React.createElement("button", {
                            type: "button",
                            className: "sidebar-thread-section-header" + (collapsedAgentListSections[section.key] ? " is-collapsed" : ""),
                            onClick: () => setCollapsedAgentListSections((current) => ({
                              ...current,
                              [section.key]: !current[section.key],
                            })),
                            "aria-expanded": collapsedAgentListSections[section.key] ? "false" : "true",
                          },
                            React.createElement("div", { className: "sidebar-thread-section-title" }, section.title),
                            React.createElement(ChevronDown, { className: "sidebar-thread-section-chevron", strokeWidth: 1.8 })
                          ),
                          !collapsedAgentListSections[section.key]
                            ? section.items.map((agent) => {
                                const teamMetadata = getPlaygroundAgentTeamMetadata(agent.metadata);
                                const isTeamListItem = agent?.agentType === "team" || Boolean(teamMetadata);
                                const isActive = !shouldShowAgentsHome && selectedAgentId === agent.id;
                                const hasActions = !agent.isDefault && !agent.isSystem && !isPlaygroundFunctionalAgent(agent);
                                const isMenuOpen = agentListActionMenuState?.agentId === agent.id;
                                return React.createElement("div", {
                                    key: agent.id,
                                    className: "playground-environments-list-item-row" + (isActive ? " is-active" : ""),
                                  },
                                    React.createElement("button", {
                                        type: "button",
                                        className: "playground-environments-list-item" + (isActive ? " is-active" : "") + (hasActions ? " has-actions" : ""),
                                        onClick: () => handleAgentSelect(agent.id),
                                      },
                                        isTeamListItem
                                          ? React.createElement(Layers, { className: "playground-environments-list-item-icon", strokeWidth: 1.8 })
                                          : renderAgentListAvatar(agent, "playground-agent-list-avatar"),
                                        React.createElement("div", { className: "playground-environments-list-item-copy" },
                                          React.createElement("div", { className: "playground-environments-list-item-title" }, agent.id === PLAYGROUND_AGENT_DRAFT_ID ? (draftAgent?.name || (draftAgent?.agentType === "team" ? "New Squad" : "New Agent")) : (agent.name || "Untitled Agent"))
                                        )
                                      ),
                                    hasActions
                                      ? React.createElement("div", { className: "playground-environments-list-item-side" },
                                          React.createElement("button", {
                                            type: "button",
                                            className: "playground-environments-list-item-menu-button" + (isMenuOpen ? " is-open" : ""),
                                            onClick: (event) => openAgentListActionMenu(event, agent),
                                            "aria-label": "Agent actions",
                                            "aria-expanded": isMenuOpen ? "true" : "false",
                                          },
                                            React.createElement(EllipsisVertical, { width: 16, height: 16, strokeWidth: 1.8 })
                                          )
                                        )
                                      : null
                                  );
                              })
                            : null
                        )
                      )
                    : React.createElement("div", { className: "playground-environments-empty-state" },
                        React.createElement("div", { className: "playground-environments-empty-title" }, agentListMode === "teams"
                          ? "No squads"
                          : agentListMode === "functional"
                            ? "No functional agents"
                            : "No agents"),
                        React.createElement("div", { className: "playground-environments-empty-copy" }, agentListMode === "teams"
                          ? "Create a fixed orchestrator plus subagent squad here. If you have not created any member agents yet, switch back to Agents first."
                          : agentListMode === "functional"
                            ? "Task-specific agents supplied by platform services will appear here."
                            : "Create single agents first, then assemble them into fixed squads when you need an orchestrator plus subagents."
                        ),
                        agentListMode !== "functional"
                          ? React.createElement("div", { className: "playground-agents-empty-actions" },
                              React.createElement(PlatformPrimaryButton, {
                                size: "medium",
                                type: "button",
                                className: "playground-environments-action-button" + (agentListMode === "teams" ? " is-primary" : ""),
                                onClick: handleCreateTeam,
                              },
                                React.createElement(Layers, { width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("span", null, "New Squad")
                              ),
                              React.createElement(PlatformPrimaryButton, {
                                size: "medium",
                                type: "button",
                                className: "playground-environments-action-button" + (agentListMode === "agents" ? " is-primary" : ""),
                                onClick: handleCreateAgent,
                              },
                                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                                React.createElement("span", null, "New Agent")
                              )
                          )
                          : null
                      )
                )
              ),
              React.createElement("section", { className: "playground-environments-detail" },
                shouldShowAgentsHome || (agentCreationSetupOpen && !agentCreationSetupDraft)
                  ? renderAgentsHome()
                  : (
                      isLoadingCurrentAgent && !draftAgent
                        ? React.createElement("div", { className: "playground-files-state" },
                            React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                          )
                        : renderCurrentAgentEditor()
                    ),
                shouldShowAgentsHome
                && !agentCreationSetupOpen
                  ? React.createElement("div", { className: "playground-environments-home-composer-host" },
                      React.createElement("div", { className: "playground-environments-home-content" },
                        React.createElement("div", { className: "playground-environments-home-composer-shell" },
                          React.createElement(RunnerChat, {
                            key: "agents-home-composer",
                            className: "playground-environments-home-runner",
                            backendUrl,
                            apiKey,
                            fetchCustomSkills,
                            speechToTextUrl: speechToTextUrl || undefined,
                            requestHeaders,
                            resolveRequestHeaders,
                            appId: "runner-web-sdk-demo",
                            inputMode: "computer-agents",
                            computerAgents: computerAgents || undefined,
                            environments: (Array.isArray(environments) ? environments : []).map((environment) => ({
                              ...environment,
                              ...(preferredEnvironmentId && environment.id === preferredEnvironmentId ? { isDefault: true } : {}),
                            })),
                            agents: agentsHomeComposerAgents,
                            skills: Array.isArray(skills) ? skills : [],
                            skillDefaults: getDemoImageGenerationSkillDefaults(),
                            environmentId: preferredEnvironmentId || undefined,
                            agentId: agentsHomeComposerAgentId || undefined,
                            isAgentSelectionBlocked: (agent) => isFreeAgentPlan && isPlaygroundFreePlanLockedComposerAgent(agent),
                            onBlockedAgentSelect: requestAgentPlanGate,
                            keepFocusOnSubmit: true,
                            showUsageInStatus: false,
                            placeholder: "Type /agent or /team",
                            enableAgentCreationCommand: !isFreeAgentPlan,
                            agentCreationCommand: agentsHomeCreationCommandRequest,
                            agentCreationCommandHiddenPrompt: buildAgentsHomeCreationHiddenPrompt,
                            onExternalRunRequestCreate: handleAgentsHomeThreadStartRequest,
                            onOpenPromptSearch,
                            onOpenKnowledgeSearch,
                            onOpenThreadSearch,
                            onAgentCreationCommandChange: (commandType) => {
                              setAgentsHomeActiveCreationCommand(commandType || "");
                            },
                            onThreadIdChange: (threadId) => {
                              const normalizedThreadId = String(threadId || "").trim();
                              if (!normalizedThreadId || typeof onThreadRegistered !== "function") {
                                return;
                              }
                              onThreadRegistered(normalizedThreadId);
                            },
                            onRunFinish: (_result, threadId) => handleAgentsHomeThreadOpen(threadId),
                            onAgentChange: (nextAgentId) => {
                              if (typeof onPreferredAgentChange === "function") {
                                onPreferredAgentChange(String(nextAgentId || "").trim());
                              }
                            },
                            onEnvironmentChange: (nextEnvironmentId) => {
                              if (typeof onPreferredEnvironmentChange === "function") {
                                onPreferredEnvironmentChange(String(nextEnvironmentId || "").trim());
                              }
                            },
                          })
                        )
                      )
                    )
                  : null
              )
            ),
            renderAgentListActionMenu(),
            renderAgentBulkActionMenu(),
            renderAgentRenameModal(),
            renderAgentComposerDialog(),
            renderAgentCreationSetupModal(),
            renderAgentCreationPermissionModal(),
            renderAgentModelPickerDialog(),
            renderAgentSendToTeamModal(),
            renderAgentAddToSquadModal(),
            renderAgentApiModal(),
            renderAgentVersionsSidebarPortal(),
            renderAgentVersionSaveDialog(),
            renderAgentVersionModal()
          );
        }
  
