          function performAgentSelect(agentId) {
            discardUnsavedAgentDraft();
            setToolbarPopover("");
            setSearchPopupQuery("");
            setAgentListActionMenuState(null);
            setAgentCreationSetupOpen(false);
            setAgentCreationSetupError("");
            setAgentCreationPermissionModalOpen(false);
            setAgentCreationInstructionRunRequest(null);
            setAgentCreationInstructionContext(null);
            setAgentVersionsHeaderMenuOpen(false);
            setAgentVersionsSidebarOpen(false);
            finishCloseAgentVersionModal();
            setOpenAgentVersionMenuId("");
            setAgentVersionState({
              status: "idle",
              message: "",
              error: "",
            });
            setIsHomeViewActive(false);
            setSelectedAgentId(agentId);
          }
  
          function handleAgentSelect(agentId) {
            const normalizedAgentId = String(agentId || "").trim();
            if (!normalizedAgentId) {
              return;
            }
            if (!isHomeViewActive && normalizedAgentId === String(selectedAgentId || "").trim()) {
              return;
            }
            requestAgentNavigation(() => performAgentSelect(normalizedAgentId));
          }
  
          function handleAgentListModeChange(nextMode) {
            setToolbarPopover("");
            setSearchPopupQuery("");
            setAgentListActionMenuState(null);
            setAgentListMode(nextMode === "teams" ? "teams" : "agents");
          }
  
          function buildAgentComposerSeedDraft(kind, draftOverrides = null) {
            const normalizedKind = kind === "team" ? "team" : "single";
            const seedDraft = normalizePlaygroundAgentRecord({
              ...buildPlaygroundDefaultAgentDraft(normalizedKind),
              model: resolvePlaygroundAgentDraftModelId(resolvedAgentModelOptions, subscriptionTierId),
              ...(draftOverrides && typeof draftOverrides === "object" ? draftOverrides : {}),
              id: PLAYGROUND_AGENT_DRAFT_ID,
              agentType: normalizedKind,
              isActive: true,
              isDefault: false,
              isSystem: false,
            });
  
            if (normalizedKind === "team") {
              return {
                ...seedDraft,
                teamExecutionMode: PLAYGROUND_AGENT_TEAM_EXECUTION_MODE,
                teamSubagentIds: dedupePlaygroundAgentIds(seedDraft.teamSubagentIds).filter((value) => value !== String(seedDraft.teamOrchestratorAgentId || "").trim()),
              };
            }
  
            return {
              ...seedDraft,
              teamOrchestratorAgentId: "",
              teamSubagentIds: [],
              teamExecutionMode: "",
            };
          }
  
          function getAgentAssistantTargetAgentId(agentRecord = draftAgent) {
            const draftId = String(agentRecord?.id || "").trim();
            if (draftId && draftId !== PLAYGROUND_AGENT_DRAFT_ID) {
              return draftId;
            }
            const selectedId = String(selectedAgentId || "").trim();
            return selectedId && selectedId !== PLAYGROUND_AGENT_DRAFT_ID ? selectedId : "";
          }
  
          function rememberAgentAssistantThread(agentId, threadId) {
            const normalizedAgentId = String(agentId || "").trim();
            const normalizedThreadId = String(threadId || "").trim();
            if (!normalizedAgentId || normalizedAgentId === PLAYGROUND_AGENT_DRAFT_ID || !normalizedThreadId) {
              return;
            }
            setAgentAssistantThreadByAgentId((current) => (
              current[normalizedAgentId] === normalizedThreadId
                ? current
                : {
                    ...current,
                    [normalizedAgentId]: normalizedThreadId,
                  }
            ));
          }
  
  	        function openAgentAssistant(commandType = "") {
  	          if (draftAgent?.isSystem || draftAgent?.isDefault) {
  	            setAgentAssistantOpen(false);
  	            return;
  	          }
  	          if (draftAgent && !canUseAgentOnCurrentPlan(draftAgent)) {
  	            return;
  	          }
  	          setAgentVersionsHeaderMenuOpen(false);
  	          setAgentVersionsSidebarOpen(false);
  	          finishCloseAgentVersionModal();
  	          setOpenAgentVersionMenuId("");
  	          setAgentAssistantOpen(true);
  	          setAgentAssistantCommandRequest(null);
  	          setAgentAssistantPresetRunState((current) => (
              current.error
                ? {
                    isStarting: false,
                    actionType: "",
                    error: "",
                  }
                : current
            ));
          }
  
          function getAgentAssistantPresetActionLabel(actionType) {
            return actionType === "latest_threads"
              ? "Optimize Agent based on latest threads"
              : "Analyze model & reasoning effort fit";
          }
  
          async function createAgentAssistantPrivateThread(actionType, assistantAgentId, targetAgentId) {
            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            if (apiKey) {
              headers.set("X-API-Key", apiKey);
            }
  
            const response = await fetch(backendUrl + "/threads", {
              method: "POST",
              headers,
              body: JSON.stringify({
                title: getAgentAssistantPresetActionLabel(actionType),
                appId: "runner-web-sdk-demo",
                environmentId: preferredEnvironmentId || undefined,
                agentId: assistantAgentId || undefined,
                metadata: {
                  runnerPlayground: {
                    privateMode: true,
                    privateModeCreatedAt: new Date().toISOString(),
                    source: "agent_detail_assistant",
                    agentAssistant: {
                      actionType,
                      targetAgentId,
                    },
                  },
                },
              }),
            });
            const text = await response.text();
            let parsed = {};
            try {
              parsed = text ? JSON.parse(text) : {};
            } catch {
              parsed = { message: text };
            }
            if (!response.ok) {
              throw new Error(parsed?.message || parsed?.error || "Failed to start agent assistant thread.");
            }
            const threadId = String(parsed?.thread?.id || parsed?.data?.id || parsed?.id || "").trim();
            if (!threadId) {
              throw new Error("Thread creation succeeded but no thread id was returned.");
            }
            return threadId;
          }
  
          async function handleAgentAssistantPresetAction(actionType, options = {}) {
            const normalizedActionType = actionType === "latest_threads" ? "latest_threads" : "efficiency";
            const targetAgentId = getAgentAssistantTargetAgentId();
            if (!targetAgentId) {
              setAgentAssistantPresetRunState({
                isStarting: false,
                actionType: "",
                error: "Select a saved agent first.",
              });
              return;
            }
  
            setAgentAssistantPresetRunState({
              isStarting: true,
              actionType: normalizedActionType,
              error: "",
            });
  
            try {
              const assistantAgent = await ensureAgentCreationAssistantAgent();
              const assistantAgentId = String(assistantAgent?.id || agentCreationAssistantAgent?.id || "").trim();
              if (!assistantAgentId) {
                throw new Error("Agent creator unavailable.");
              }
  
              const targetAgent = draftAgent?.id === targetAgentId
                ? draftAgent
                : allKnownAgents.find((agent) => agent?.id === targetAgentId) || draftAgent;
              let threadId = String(options?.threadId || "").trim();
              if (!threadId) {
                threadId = await createAgentAssistantPrivateThread(normalizedActionType, assistantAgentId, targetAgentId);
              }
  
              const visiblePrompt = getAgentAssistantPresetActionLabel(normalizedActionType);
              const executionPrompt = buildAgentAssistantPresetPrompt(normalizedActionType, targetAgent);
              rememberAgentAssistantThread(targetAgentId, threadId);
              setAgentVersionsHeaderMenuOpen(false);
              setAgentVersionsSidebarOpen(false);
              finishCloseAgentVersionModal();
              setOpenAgentVersionMenuId("");
              setAgentAssistantOpen(true);
              setAgentCreationInstructionContext({
                agentId: targetAgentId,
                threadId,
                status: "running",
              });
              setAgentCreationInstructionRunRequest({
                token: "agent-assistant-preset:" + normalizedActionType + ":" + Date.now().toString(36) + Math.random().toString(36).slice(2),
                threadId,
                prompt: executionPrompt,
                displayPrompt: visiblePrompt,
                attachments: [],
                githubRepo: null,
                enabledSkills: buildAgentCreationEnabledSkillsPayload(null),
                environmentId: preferredEnvironmentId || "",
                quotedSelection: null,
              });
              if (typeof onThreadRegistered === "function") {
                onThreadRegistered(threadId, { private: true });
              }
              setAgentAssistantPresetRunState({
                isStarting: false,
                actionType: "",
                error: "",
              });
            } catch (error) {
              setAgentAssistantPresetRunState({
                isStarting: false,
                actionType: "",
                error: error instanceof Error ? error.message : "Failed to start agent assistant.",
              });
            }
          }
  
          function openAgentDraftDetail(kind = "single", options = {}) {
            if (!canCreateAgentOnCurrentPlan()) {
              return;
            }
            requestAgentNavigation(() => {
              const normalizedKind = kind === "team" ? "team" : "single";
              const seedDraft = buildAgentComposerSeedDraft(normalizedKind, options?.draft || null);
              const preserveDraftName = Boolean(options?.preserveDraftName);
              resetEditorAuxiliaryState();
              setAgentProfileAvatarBroken(false);
              setToolbarPopover("");
              setSearchPopupQuery("");
              setAgentListActionMenuState(null);
              closeAgentModelPicker();
              setAgentListMode(normalizedKind === "team" ? "teams" : "agents");
              setAgentComposerOpen(false);
              setAgentComposerDraft(buildPlaygroundDefaultAgentDraft());
              setAgentComposerSaveState({
                isSaving: false,
                error: "",
              });
              setDraftAgent(
                normalizedKind === "single" && !preserveDraftName
                  ? { ...seedDraft, name: "" }
                  : seedDraft
              );
              selectedAgentIdRef.current = PLAYGROUND_AGENT_DRAFT_ID;
              setSelectedAgentId(PLAYGROUND_AGENT_DRAFT_ID);
              setIsHomeViewActive(normalizedKind === "single");
              setAgentCreationInstructionRunRequest(null);
              setAgentCreationInstructionContext(null);
              if (normalizedKind === "single") {
                setAgentCreationSetupDraft(null);
                setAgentCreationSetupOpen(true);
                setAgentCreationSetupError("");
                setAgentCreationSetupSubmitting(false);
                setAgentCreationSetupResetToken((current) => current + 1);
                setAgentCreationPermissionModalOpen(false);
                setAgentAssistantOpen(false);
                setAgentAssistantCommandRequest(null);
                return;
              }
              setAgentCreationSetupOpen(false);
              setAgentCreationPermissionModalOpen(false);
              setAgentAssistantOpen(true);
              setAgentAssistantCommandRequest(null);
            });
          }

          function openAgentCreationSetupOverlay(draftOverrides = null) {
            if (!canCreateAgentOnCurrentPlan()) {
              return;
            }
            const seedDraft = buildAgentComposerSeedDraft("single", draftOverrides);
            setToolbarPopover("");
            setSearchPopupQuery("");
            setAgentListActionMenuState(null);
            setAgentActionsPopoverOpen(false);
            closeAgentModelPicker({ animate: false });
            setAgentProfileAvatarBroken(false);
            setAgentCreationSetupDraft(seedDraft);
            setAgentCreationSetupOpen(true);
            setAgentCreationSetupError("");
            setAgentCreationSetupSubmitting(false);
            setAgentCreationSetupResetToken((current) => current + 1);
            setAgentCreationPermissionModalOpen(false);
            setAgentCreationInstructionRunRequest(null);
            setAgentCreationInstructionContext(null);
          }
  
          function openAgentComposer(kind = "single", options = {}) {
            if (!canCreateAgentOnCurrentPlan()) {
              return;
            }
            requestAgentNavigation(() => {
              const draftOverrides = options && typeof options === "object" ? options.draft : null;
              resetEditorAuxiliaryState();
              setToolbarPopover("");
              setSearchPopupQuery("");
              setAgentListActionMenuState(null);
              closeAgentModelPicker();
              setAgentListMode(kind === "team" ? "teams" : "agents");
              setAgentCreationSetupOpen(false);
              setAgentCreationSetupError("");
              setAgentCreationPermissionModalOpen(false);
              setAgentComposerDraft(buildAgentComposerSeedDraft(kind, draftOverrides));
              setAgentComposerSaveState({
                isSaving: false,
                error: "",
              });
              setIsAgentComposerInstructionsEditing(false);
              setAgentComposerModelPopover("");
              setAgentComposerOpen(true);
            });
          }
  
          function closeAgentComposer() {
            if (agentComposerSaveState.isSaving) {
              return;
            }
            closeAgentModelPicker();
            setAgentComposerOpen(false);
            setAgentComposerDraft(buildPlaygroundDefaultAgentDraft());
            setAgentComposerSaveState({
              isSaving: false,
              error: "",
            });
            setIsAgentComposerInstructionsEditing(false);
            setAgentComposerModelPopover("");
          }
  
          function handleCreateAgent(modelId = "") {
            if (!canCreateAgentOnCurrentPlan()) {
              return;
            }
            const normalizedModelId = typeof modelId === "string" ? modelId.trim() : "";
            openAgentDraftDetail("single", normalizedModelId
              ? { draft: { model: normalizedModelId } }
              : {});
          }
  
          function handleCreateTeam() {
            if (!canCreateAgentOnCurrentPlan()) {
              return;
            }
            openAgentDraftDetail("team");
          }
  
          useEffect(() => {
            const normalizedToken = String(createAgentRequestToken || "").trim();
            if (!normalizedToken || normalizedToken === "0" || lastAppliedCreateAgentRequestTokenRef.current === normalizedToken) {
              return;
            }
            lastAppliedCreateAgentRequestTokenRef.current = normalizedToken;
            handleCreateAgent(createAgentModelId);
          }, [createAgentModelId, createAgentRequestToken]);
  
          function openAgentModelPicker(target) {
            if (agentModelPickerCloseTimerRef.current) {
              window.clearTimeout(agentModelPickerCloseTimerRef.current);
              agentModelPickerCloseTimerRef.current = null;
            }
            const normalizedTarget = target === "composer"
              ? "composer"
              : target === "creation"
                ? "creation"
                : "detail";
            const activeModelId = normalizedTarget === "composer"
              ? (agentComposerDraft?.model || "claude-haiku-4-5")
              : normalizedTarget === "creation"
                ? ((agentCreationSetupDraft || draftAgent)?.model || "claude-haiku-4-5")
                : (draftAgent?.model || "claude-haiku-4-5");
            setAgentModelPickerClosing(false);
            setAgentModelPickerState({
              target: normalizedTarget,
              pendingModelId: activeModelId,
              searchQuery: "",
              providerFilters: [],
              isProviderFilterOpen: false,
            });
          }
  
          function finishCloseAgentModelPicker() {
            if (agentModelPickerCloseTimerRef.current) {
              window.clearTimeout(agentModelPickerCloseTimerRef.current);
              agentModelPickerCloseTimerRef.current = null;
            }
            setAgentModelPickerClosing(false);
            setAgentModelPickerState(null);
          }
  
          function closeAgentModelPicker(options = {}) {
            if (options?.animate === false || (!agentModelPickerState && !agentModelPickerClosing)) {
              finishCloseAgentModelPicker();
              return;
            }
            if (agentModelPickerClosing) {
              return;
            }
            setAgentModelPickerClosing(true);
            if (agentModelPickerCloseTimerRef.current) {
              window.clearTimeout(agentModelPickerCloseTimerRef.current);
            }
            agentModelPickerCloseTimerRef.current = window.setTimeout(() => {
              agentModelPickerCloseTimerRef.current = null;
              finishCloseAgentModelPicker();
            }, typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number" ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS : 60);
          }
  
          useEffect(() => {
            return () => {
              if (agentModelPickerCloseTimerRef.current) {
                window.clearTimeout(agentModelPickerCloseTimerRef.current);
                agentModelPickerCloseTimerRef.current = null;
              }
            };
          }, []);
  
          useEffect(() => {
            if (!agentModelPickerState) {
              return undefined;
            }
  
            function handleAgentModelPickerEscape(event) {
              if (event.key !== "Escape") return;
              if (agentModelPickerState?.isProviderFilterOpen) {
                setAgentModelPickerState((current) => current ? {
                  ...current,
                  isProviderFilterOpen: false,
                } : current);
                return;
              }
              closeAgentModelPicker();
            }
  
            window.addEventListener("keydown", handleAgentModelPickerEscape);
            return () => window.removeEventListener("keydown", handleAgentModelPickerEscape);
          }, [agentModelPickerClosing, agentModelPickerState]);
  
          function openAgentCreationPermissionModal() {
            if (!agentCreationSetupOpen) {
              return;
            }
            setAgentCreationPermissionModalOpen(true);
          }
  
          function closeAgentCreationPermissionModal() {
            setAgentCreationPermissionModalOpen(false);
          }
  
          function renderPlaygroundAgentModelButton(modelMeta, onClick, isDisabled, isDetailView = false) {
            const providerIcon = getPlaygroundAgentModelProviderIcon(modelMeta);
            return React.createElement("button", {
                type: "button",
                className: "playground-environments-runtime-value-button playground-agents-model-picker-trigger" + (isDetailView ? "" : " playground-tasks-detail-select-trigger"),
                onClick,
                disabled: isDisabled,
              },
              React.createElement("span", { className: "playground-agents-model-picker-trigger-copy" },
                providerIcon
                  ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                      React.createElement("img", {
                        src: providerIcon.src,
                        alt: "",
                        draggable: "false",
                        className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                      })
                    )
                  : React.createElement("span", { className: "playground-agents-model-provider-icon-shell", "aria-hidden": "true" },
                      React.createElement(Bot, { width: 14, height: 14, strokeWidth: 1.8 })
                    ),
                React.createElement("span", { className: "playground-agents-model-picker-trigger-labels" },
                  React.createElement("span", { className: "playground-environments-runtime-value-label" }, modelMeta?.label || "Select model")
                )
              ),
              React.createElement(ChevronDown, { className: isDetailView ? "" : "playground-tasks-detail-select-trigger-chevron", width: 14, height: 14, strokeWidth: 1.8 })
            );
          }
  
          function getPlaygroundDeepResearchModelMeta(modelId) {
            return PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.find((option) => option.id === modelId)
              || PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS[0];
          }
  
          function updateDeepResearchSkillDefaultModel(nextModelId) {
            const normalizedModelId = getPlaygroundDeepResearchModelMeta(nextModelId)?.id || PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS[0].id;
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                deepResearchModel: normalizedModelId,
              },
            });
            setDeepResearchSkillDefaultModel(normalizedModelId);
          }
  
          function renderAgentModelPickerDialog() {
            if (!agentModelPickerState) {
              return null;
            }
  
            const isComposerTarget = agentModelPickerState.target === "composer";
            const isCreationTarget = agentModelPickerState.target === "creation";
            const activeModelId = isComposerTarget
              ? (agentComposerDraft?.model || "claude-haiku-4-5")
              : isCreationTarget
                ? ((agentCreationSetupDraft || draftAgent)?.model || "claude-haiku-4-5")
                : (draftAgent?.model || "claude-haiku-4-5");
            const pendingModelId = String(agentModelPickerState.pendingModelId || activeModelId || "").trim() || activeModelId;
            const normalizedSearchQuery = String(agentModelPickerState.searchQuery || "").trim().toLowerCase();
            const activeProviderFilters = Array.isArray(agentModelPickerState.providerFilters)
              ? agentModelPickerState.providerFilters.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)
              : [];
            const providerFilterOptions = [
              { id: "anthropic", label: "Anthropic", description: "Show Claude models" },
              { id: "google", label: "Google", description: "Show Gemini models" },
              { id: "openai", label: "OpenAI", description: "Show GPT models" },
              { id: "xai", label: "xAI", description: "Show Grok models" },
              { id: "deepseek", label: "DeepSeek", description: "Show DeepSeek models" },
              { id: "minimax", label: "MiniMax", description: "Show MiniMax models" },
              { id: "kimi", label: "Kimi", description: "Show Moonshot models" },
              { id: "zai", label: "ZAI", description: "Show ZAI models" },
              { id: "qwen", label: "Qwen", description: "Show Qwen models" },
              { id: "custom", label: "Custom", description: "Show external and custom models" },
            ];
            const providerLabelById = Object.fromEntries(providerFilterOptions.map((option) => [option.id, option.label]));
            const visibleModelOptions = resolvedAgentModelOptions.filter((option) => {
              if (activeProviderFilters.length > 0 && !activeProviderFilters.includes(getPlaygroundAgentModelProviderFilterKey(option))) {
                return false;
              }
              if (!normalizedSearchQuery) {
                return true;
              }
              const haystack = [
                option.label,
                option.id,
                option.description,
                option.providerType,
                option.intelligence,
                option.intelligenceLabel,
                option.contextWindow,
                option.speed,
                option.source,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearchQuery);
            });
            const groupedVisibleModelOptions = providerFilterOptions
              .map((providerOption) => ({
                id: providerOption.id,
                label: providerOption.label,
                items: visibleModelOptions.filter((option) => getPlaygroundAgentModelProviderFilterKey(option) === providerOption.id),
              }))
              .filter((group) => group.items.length > 0);
            const stageModel = (modelId) => {
              if (!modelId) {
                return;
              }
              setAgentModelPickerState((current) => current ? {
                ...current,
                pendingModelId: modelId,
                isProviderFilterOpen: false,
              } : current);
            };
            const toggleProviderFilterMenu = () => {
              setAgentModelPickerState((current) => current ? {
                ...current,
                isProviderFilterOpen: !current.isProviderFilterOpen,
              } : current);
            };
            const toggleProviderFilter = (providerId) => {
              if (!providerId) {
                return;
              }
              setAgentModelPickerState((current) => {
                if (!current) {
                  return current;
                }
                const currentFilters = Array.isArray(current.providerFilters)
                  ? current.providerFilters.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)
                  : [];
                const nextFilters = currentFilters.includes(providerId)
                  ? currentFilters.filter((value) => value !== providerId)
                  : [...currentFilters, providerId];
                return {
                  ...current,
                  providerFilters: nextFilters,
                };
              });
            };
            const confirmModelSelection = () => {
              if (!pendingModelId) {
                return;
              }
              if (isComposerTarget) {
                updateAgentComposerField("model", pendingModelId);
              } else if (isCreationTarget) {
                updateAgentCreationSetupField("model", pendingModelId);
              } else {
                updateAgentField("model", pendingModelId);
              }
              closeAgentModelPicker();
            };
            const renderModelPickerCard = (option) => {
              const providerIcon = getPlaygroundAgentModelProviderIcon(option);
              const isSelected = pendingModelId === option.id;
              const isCustomModel = getPlaygroundAgentModelProviderFilterKey(option) === "custom";
              const intelligenceLevel = Math.max(1, Math.min(4, getPlaygroundAgentIntelligenceLevel(option.intelligence || option.intelligenceLabel || "")));
              const costMultiplier = getPlaygroundAgentModelCostMultiplier(option.id);
              const costBadgeLabel = formatPlaygroundAgentModelComputeTokenCost(option.id).replace(" / 1M", " / mTok");
              const costBadgeClass = costMultiplier < 1
                ? " is-low"
                : costMultiplier > 1
                  ? " is-high"
                  : " is-baseline";
              return React.createElement("button", {
                  key: option.id,
                  type: "button",
                  className: "playground-agents-model-picker-card" + (isSelected ? " is-selected" : ""),
                  onClick: () => stageModel(option.id),
                  disabled: Boolean(option.locked),
                },
                providerIcon
                  ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell is-card", "aria-hidden": "true" },
                      React.createElement("img", {
                        src: providerIcon.src,
                        alt: "",
                        draggable: "false",
                        className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                      })
                    )
                  : React.createElement("span", { className: "playground-agents-model-provider-icon-shell is-card", "aria-hidden": "true" },
                      React.createElement(Bot, { width: 20, height: 20, strokeWidth: 1.8 })
                    ),
                React.createElement("span", { className: "playground-agents-model-picker-card-title-row" },
                  React.createElement("span", { className: "playground-agents-model-picker-card-title" }, option.label || option.id)
                ),
                !isCustomModel
                  ? React.createElement("span", { className: "playground-agents-model-picker-card-cost-badge" + costBadgeClass }, costBadgeLabel)
                  : null,
                React.createElement("span", { className: "playground-agents-model-picker-card-description" }, option.description || "Selected model"),
                React.createElement("span", { className: "playground-agents-model-picker-card-footer" },
                  React.createElement("span", { className: "playground-agents-model-picker-card-context" }, (option.contextWindow || "Custom") + " context"),
                  isCustomModel
                    ? React.createElement("span", { className: "playground-agents-model-picker-card-custom-label" }, "Custom Model")
                    : React.createElement("span", { className: "playground-agents-model-picker-card-brains", "aria-label": "Intelligence level " + intelligenceLevel + " of 4" },
                        Array.from({ length: 4 }).map((_, index) =>
                          React.createElement(Brain, {
                            key: option.id + "-brain-" + index,
                            className: "playground-agents-model-picker-card-brain" + (index < intelligenceLevel ? " is-active" : ""),
                            width: 12,
                            height: 12,
                            strokeWidth: 1.9,
                          })
                        )
                      )
                )
              );
            };
            const modelPickerFilterControl = React.createElement(
              PlatformPopup,
              {
                open: agentModelPickerState.isProviderFilterOpen,
                variant: "minimal",
                portal: true,
                placement: "bottom-end",
                rootClassName: "playground-files-toolbar-anchor playground-agents-model-picker-filter-anchor",
                surfaceClassName: "playground-agents-model-picker-filter-menu",
                surfaceProps: {
                  role: "menu",
                  "aria-label": "Filter models by provider",
                  width: 250,
                },
                animation: "down-in",
                trigger: React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "small",
                  className: "playground-agents-model-picker-filter-button",
                  active: agentModelPickerState.isProviderFilterOpen || activeProviderFilters.length > 0,
                  onClick: toggleProviderFilterMenu,
                  "aria-haspopup": "menu",
                  "aria-expanded": agentModelPickerState.isProviderFilterOpen,
                },
                  React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Filter")
                ),
              },
              providerFilterOptions.map((option) => {
                const isActive = activeProviderFilters.includes(option.id);
                return React.createElement("button", {
                    key: option.id,
                    type: "button",
                    role: "menuitemcheckbox",
                    "aria-checked": isActive,
                    className: "tb-popup-row" + (isActive ? " is-selected" : ""),
                    onClick: () => toggleProviderFilter(option.id),
                  },
                  React.createElement("span", { className: "tb-popup-check-slot", "aria-hidden": "true" },
                    isActive
                      ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-menu-item-copy" },
                    React.createElement("span", null, option.label),
                    React.createElement("span", null, option.description)
                  )
                );
              })
            );
  
            return React.createElement(PlatformModal, {
              open: Boolean(agentModelPickerState) && !agentModelPickerClosing,
              animationDurationMs: typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number" ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS : 60,
              onClose: () => closeAgentModelPicker(),
              closeOnEscape: !agentModelPickerState.isProviderFilterOpen,
              backdropClassName: "playground-agents-model-picker-backdrop",
              className: "playground-agents-model-picker-modal",
              size: "large",
              title: "Select Model",
              headerVariant: "search",
              headerSearchProps: {
                value: agentModelPickerState.searchQuery || "",
                onChange: (event) => setAgentModelPickerState((current) => current ? {
                  ...current,
                  searchQuery: event.target.value,
                  isProviderFilterOpen: false,
                } : current),
                placeholder: "Search models",
                "aria-label": "Search models",
              },
              headerActions: modelPickerFilterControl,
              bodyClassName: "playground-agents-model-picker-body",
              footerClassName: "playground-agents-model-picker-actions",
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: () => closeAgentModelPicker(),
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: confirmModelSelection,
                  disabled: !pendingModelId || pendingModelId === activeModelId,
                }, "Confirm")
              ),
              closeButtonLabel: "Close model selector",
              surfaceProps: {
                onClick: (event) => {
                  const target = event?.target instanceof Element ? event.target : null;
                  if (!target || !target.closest(".playground-agents-model-picker-filter-anchor, .playground-agents-model-picker-filter-menu")) {
                    setAgentModelPickerState((current) => current ? {
                      ...current,
                      isProviderFilterOpen: false,
                    } : current);
                  }
                },
              },
              children: groupedVisibleModelOptions.length > 0
                ? React.createElement("div", { className: "playground-agents-model-picker-groups" },
                    groupedVisibleModelOptions.map((group) =>
                      React.createElement("section", { key: group.id, className: "playground-agents-model-picker-group" },
                        React.createElement("div", { className: "playground-agents-model-picker-group-title" }, providerLabelById[group.id] || group.label),
                        React.createElement("div", { className: "playground-agents-model-picker-grid" },
                          group.items.map(renderModelPickerCard)
                        )
                      )
                    )
                  )
                : React.createElement("div", { className: "playground-agents-model-picker-empty" },
                    "No models match your search."
                  )
            });
          }
  
          function renderAgentSendToTeamModal() {
            if (!agentSendTeamModalOpen) {
              return null;
            }
  
            const targetAgents = agentSendTeamTargetAgentIds.length > 0
              ? getAgentActionTargetsByIds(agentSendTeamTargetAgentIds)
              : normalizeAgentActionTargets([agentSendTeamTargetAgent || draftAgent]);
            const targetAgentCount = targetAgents.length;
            const isSharingAgentToTeam = agentSendTeamShareState.action === "share";
            const selectedTeamId = String(agentSendTeamPickerValue || "").trim();
            const selectedTeamAlreadyShared = targetAgentCount > 0 && targetAgents.every((agent) => getAgentSharedTeamIds(agent).includes(selectedTeamId));
            const hasManageableTeams = availableAgentShareTeams.length > 0;
            const showTeamsLoading = workspaceTeamsLoading && !hasManageableTeams;
            const selectedTeam = availableAgentShareTeams.find((team) => team.id === agentSendTeamPickerValue) || null;
  
            return React.createElement(PlatformModal, {
              open: agentSendTeamModalOpen && !agentSendTeamModalClosing,
              visible: agentSendTeamModalVisible && !agentSendTeamModalClosing,
              animationDurationMs: typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number"
                ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS
                : 60,
              onClose: () => closeAgentSendToTeamModal(),
              as: "form",
              size: "medium",
              title: targetAgentCount > 1 ? "Share " + targetAgentCount + " Agents with Team" : "Share with Team",
              backdropClassName: "playground-agents-send-team-modal-backdrop",
              className: "playground-agents-send-team-modal",
              bodyClassName: "playground-agents-send-team-modal-body",
              footerClassName: "playground-agents-send-team-actions",
              closeButtonDisabled: isSharingAgentToTeam,
              closeButtonLabel: "Close team selector",
              ariaLabel: "Share agent with team",
              surfaceProps: {
                onSubmit: (event) => {
                  void handleAgentSendToTeamSubmit(event);
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  onClick: () => closeAgentSendToTeamModal(),
                  disabled: isSharingAgentToTeam,
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: isSharingAgentToTeam || !selectedTeam || selectedTeamAlreadyShared || targetAgentCount === 0,
                }, isSharingAgentToTeam ? "Sharing..." : "Share")
              ),
              children: React.createElement(React.Fragment, null,
                showTeamsLoading
                  ? React.createElement("div", { className: "playground-agents-send-team-empty" },
                      React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                      React.createElement("span", null, "Loading teams...")
                    )
                  : workspaceTeamsRequiresPlan
                    ? React.createElement("div", { className: "playground-agents-send-team-empty" }, "Teams are not available on this workspace plan.")
                    : hasManageableTeams
                      ? React.createElement("div", { className: "playground-agents-send-team-list", role: "radiogroup", "aria-label": "Teams" },
                          availableAgentShareTeams.map((team) => {
                            const isSelected = team.id === agentSendTeamPickerValue;
                            const sharedCount = targetAgents.filter((agent) => getAgentSharedTeamIds(agent).includes(team.id)).length;
                            const isShared = targetAgentCount > 0 && sharedCount === targetAgentCount;
                            const teamMeta = targetAgentCount > 1
                              ? (sharedCount > 0 ? sharedCount + "/" + targetAgentCount + " already shared" : team.roleLabel)
                              : (isShared ? "Already shared" : team.roleLabel);
                            return React.createElement("button", {
                                key: team.id,
                                type: "button",
                                className: "playground-agents-send-team-option" + (isSelected ? " is-selected" : "") + (isShared ? " is-shared" : ""),
                                onClick: () => setAgentSendTeamPickerValue(team.id),
                                disabled: isSharingAgentToTeam,
                                role: "radio",
                                "aria-checked": isSelected ? "true" : "false",
                              },
                              React.createElement("span", { className: "playground-agents-send-team-option-icon", "aria-hidden": "true" },
                                React.createElement(UsersRound, { width: 15, height: 15, strokeWidth: 1.85 })
                              ),
                              React.createElement("span", { className: "playground-agents-send-team-option-copy" },
                                React.createElement("span", { className: "playground-agents-send-team-option-title" }, team.name),
                                React.createElement("span", { className: "playground-agents-send-team-option-meta" }, teamMeta)
                              ),
                              isSelected
                                ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                                : null
                            );
                          })
                        )
                      : React.createElement("div", { className: "playground-agents-send-team-empty" }, "No teams are available yet."),
                agentSendTeamError
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, agentSendTeamError)
                  : null
              )
            });
          }
  
          function renderAgentAddToSquadModal() {
            if (!agentAddSquadModalOpen) {
              return null;
            }
  
            const targetAgents = (agentAddSquadTargetAgentIds.length > 0
              ? getAgentActionTargetsByIds(agentAddSquadTargetAgentIds)
              : normalizeAgentActionTargets([agentAddSquadTargetAgent])
            ).filter((agent) => !isPlaygroundTeamAgent(agent));
            const isAddingToSquad = agentAddSquadState.action === "add";
            const squadRows = getAgentSquadCandidateRows(targetAgents);
            const hasSquads = squadRows.length > 0;
            const selectedSquad = squadRows.find((squad) => squad.id === agentAddSquadPickerValue) || null;
            const targetAgentIds = targetAgents.map((agent) => String(agent?.id || "").trim()).filter(Boolean);
            const selectedSquadSubagentIds = dedupePlaygroundAgentIds(selectedSquad?.teamSubagentIds);
            const selectedSquadOrchestratorId = String(selectedSquad?.teamOrchestratorAgentId || "").trim();
            const selectedAgentAlreadyInSquad = Boolean(
              targetAgentIds.length > 0
              && selectedSquad
              && targetAgentIds.every((targetAgentId) => (
                selectedSquadSubagentIds.includes(targetAgentId)
                || selectedSquadOrchestratorId === targetAgentId
              ))
            );
            const selectedSquadLocked = Boolean(selectedSquad?.isDefault || selectedSquad?.isSystem);
  
            return renderPlaygroundPlatformModal({
              open: agentAddSquadModalOpen,
              visible: agentAddSquadModalVisible,
              closing: agentAddSquadModalClosing,
              onClose: () => closeAgentAddSquadModal(),
              as: "form",
              backdropClassName: "playground-tasks-project-issue-backdrop playground-agents-send-team-modal-backdrop",
              className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-agents-send-team-modal",
              ariaLabel: "Add agent to squad",
              surfaceProps: {
                onSubmit: (event) => {
                  void handleAgentAddToSquadSubmit(event);
                },
              },
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-tasks-project-modal-top" },
                  React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                    React.createElement("div", {
                      className: "playground-content-title playground-tasks-project-modal-name-input",
                      style: { display: "flex", alignItems: "center" },
                    }, targetAgentIds.length > 1 ? "Add " + targetAgentIds.length + " Agents to Squad" : "Add to Agent Squad"),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: () => closeAgentAddSquadModal(),
                      disabled: isAddingToSquad,
                      title: "Close",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  )
                ),
                React.createElement("div", { className: "playground-tasks-issue-modal-body playground-agents-send-team-modal-body" },
                  hasSquads
                    ? React.createElement("div", { className: "playground-agents-send-team-list", role: "radiogroup", "aria-label": "Squads" },
                        squadRows.map((squad) => {
                          const isSelected = squad.id === agentAddSquadPickerValue;
                          const squadSubagentIds = dedupePlaygroundAgentIds(squad?.teamSubagentIds);
                          const squadOrchestratorId = String(squad?.teamOrchestratorAgentId || "").trim();
                          const alreadyInSquadCount = targetAgentIds.filter((targetAgentId) => squadSubagentIds.includes(targetAgentId) || squadOrchestratorId === targetAgentId).length;
                          const isAlreadyInSquad = targetAgentIds.length > 0 && alreadyInSquadCount === targetAgentIds.length;
                          const isLocked = Boolean(squad?.isDefault || squad?.isSystem);
                          const squadMeta = isLocked
                            ? "System squad"
                            : targetAgentIds.length > 1 && alreadyInSquadCount > 0
                              ? alreadyInSquadCount + "/" + targetAgentIds.length + " already added"
                              : isAlreadyInSquad
                                ? "Already added"
                                : (squadSubagentIds.length + (squadSubagentIds.length === 1 ? " subagent" : " subagents"));
                          return React.createElement("button", {
                              key: squad.id,
                              type: "button",
                              className: "playground-agents-send-team-option" + (isSelected ? " is-selected" : "") + (isAlreadyInSquad ? " is-shared" : ""),
                              onClick: () => setAgentAddSquadPickerValue(squad.id),
                              disabled: isAddingToSquad,
                              role: "radio",
                              "aria-checked": isSelected ? "true" : "false",
                            },
                            React.createElement("span", { className: "playground-agents-send-team-option-icon", "aria-hidden": "true" },
                              React.createElement(Layers, { width: 15, height: 15, strokeWidth: 1.85 })
                            ),
                            React.createElement("span", { className: "playground-agents-send-team-option-copy" },
                              React.createElement("span", { className: "playground-agents-send-team-option-title" }, squad.name || "Untitled Squad"),
                              React.createElement("span", { className: "playground-agents-send-team-option-meta" }, squadMeta)
                            ),
                            isSelected
                              ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                              : null
                          );
                        })
                      )
                    : React.createElement("div", { className: "playground-agents-send-team-empty" }, "No squads are available yet.")
                ),
                agentAddSquadError
                  ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, agentAddSquadError)
                  : null,
                React.createElement("div", { className: "playground-tasks-project-modal-actions playground-agents-send-team-actions" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-environments-action-button",
                    onClick: () => closeAgentAddSquadModal(),
                    disabled: isAddingToSquad,
                  }, "Cancel"),
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "submit",
                    className: "playground-environments-action-button is-primary",
                    disabled: isAddingToSquad || !selectedSquad || selectedAgentAlreadyInSquad || selectedSquadLocked || targetAgentIds.length === 0,
                  }, isAddingToSquad ? "Adding..." : "Add to Squad")
                )
              )
            });
          }
  
          function renderAgentApiModal() {
            if (!agentApiModalOpen) {
              return null;
            }
            const snippetTabs = [
              { id: "curl", label: "cURL" },
              { id: "python", label: "Python" },
              { id: "javascript", label: "JavaScript" },
            ];
            const effectiveAgentApiEnvironmentId = String(
              selectedAgentApiEnvironment?.id
              || agentApiEnvironmentId
              || agentApiDefaultEnvironmentId
              || "computer_id"
            ).trim() || "computer_id";
            const snippets = buildAgentApiSnippets(draftAgent, effectiveAgentApiEnvironmentId);
            const activeSnippet = snippets[agentApiSnippetTab] || snippets.curl;
            const activeSnippetLanguage = ({
              curl: "shell",
              python: "python",
              javascript: "javascript",
            })[agentApiSnippetTab] || "shell";
            const activeSnippetExtension = ({
              curl: "sh",
              python: "py",
              javascript: "js",
            })[agentApiSnippetTab] || "sh";
            const activeSnippetLineCount = String(activeSnippet || "").split(/\n/).length || 1;
            const activeSnippetCodeHeight = Math.min(460, Math.max(240, activeSnippetLineCount * 20 + 24)) + "px";
            const agentApiSnippetSlug = String((draftAgent?.id || "agent") + "-" + effectiveAgentApiEnvironmentId + "-" + agentApiSnippetTab)
              .replace(/[^A-Za-z0-9_.:-]+/g, "_")
              .slice(0, 96);
            const AgentApiEditorComponent = agentApiEditorModule?.default || null;
            const agentApiCodePreview = AgentApiEditorComponent
              ? React.createElement("div", {
                  className: "playground-server-invoke-code-editor playground-code-preview-editor-shell playground-computer-api-code-editor",
                  style: { "--playground-server-invoke-code-height": activeSnippetCodeHeight },
                },
                  React.createElement(AgentApiEditorComponent, {
                    path: "agent-api-" + agentApiSnippetSlug + "." + activeSnippetExtension,
                    height: activeSnippetCodeHeight,
                    language: activeSnippetLanguage,
                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                    value: activeSnippet,
                    beforeMount: ensurePlaygroundCodeEditorTheme,
                    options: {
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      readOnly: true,
                      fontSize: 12,
                      lineHeight: 20,
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: "none",
                      lineNumbersMinChars: 3,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      wordWrap: "on",
                      padding: { top: 12, bottom: 12 },
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  })
                )
              : !agentApiEditorModuleError
                ? React.createElement("div", {
                    className: "playground-code-preview-state playground-server-invoke-code-editor playground-computer-api-code-editor",
                    style: { "--playground-server-invoke-code-height": activeSnippetCodeHeight },
                  },
                    React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 }),
                    React.createElement("span", null, "Loading editor...")
                  )
                : React.createElement("pre", {
                    className: "playground-server-invoke-code-fallback playground-computer-api-code",
                    style: { minHeight: activeSnippetCodeHeight },
                  },
                    React.createElement("code", null, activeSnippet)
                  );
            const agentApiEnvironmentPopoverOpen = agentModelPopover === "api-environment";
            const agentApiEnvironmentLabel = selectedAgentApiEnvironment?.name || selectedAgentApiEnvironment?.label || effectiveAgentApiEnvironmentId || "Computer";
            const agentApiEnvironmentOptions = orderedAgentApiEnvironments
              .map((environment) => {
                const environmentId = String(environment?.id || "").trim();
                if (!environmentId) {
                  return null;
                }
                return {
                  value: environmentId,
                  label: environment?.name || environmentId,
                  leading: React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.8 }),
                };
              })
              .filter(Boolean);
            const agentApiEnvironmentSelector = React.createElement(PlatformSelector, {
              value: effectiveAgentApiEnvironmentId,
              options: agentApiEnvironmentOptions,
              open: agentApiEnvironmentPopoverOpen,
              onOpenChange: (open) => setAgentModelPopover(open ? "api-environment" : ""),
              onValueChange: (environmentId) => setAgentApiEnvironmentId(environmentId),
              ariaLabel: "Computer",
              label: React.createElement("span", { className: "playground-agent-api-environment-selector-value" },
                React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                React.createElement("span", null, agentApiEnvironmentLabel)
              ),
              alignment: "start",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent: "No computers available.",
              className: "playground-agent-api-environment-selector",
              triggerClassName: "playground-agent-api-environment-selector-trigger",
              popupClassName: "playground-agent-api-environment-selector-popup",
            });
  
            return React.createElement(PlatformModal, {
              open: agentApiModalOpen && !agentApiModalClosing,
              visible: agentApiModalVisible && !agentApiModalClosing,
              animationDurationMs: typeof PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS === "number"
                ? PLAYGROUND_PLATFORM_MODAL_ANIMATION_MS
                : 60,
              onClose: () => closeAgentApiModal(),
              closeOnEscape: !agentApiEnvironmentPopoverOpen,
              size: "medium",
              title: "Use via API",
              backdropClassName: "playground-computer-api-modal-backdrop playground-agent-api-modal-backdrop",
              className: "playground-computer-api-modal playground-agent-api-modal",
              bodyClassName: "playground-computer-api-modal-body playground-agent-api-modal-body",
              showFooter: false,
              closeButtonLabel: "Close API examples",
              ariaLabel: "Use agent via API",
              children: React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-computer-api-config-row" },
                  React.createElement("div", { className: "playground-computer-api-config-label" }, "Computer"),
                  agentApiEnvironmentSelector
                ),
                React.createElement("div", { className: "playground-server-invoke-card playground-computer-api-card" },
                  React.createElement("div", { className: "playground-server-invoke-header playground-computer-api-header" },
                    React.createElement("div", { className: "playground-server-invoke-tabs", role: "tablist", "aria-label": "Agent API examples" },
                      snippetTabs.map((tab) =>
                        React.createElement("button", {
                          key: tab.id,
                          type: "button",
                          role: "tab",
                          className: "playground-server-invoke-tab" + (agentApiSnippetTab === tab.id ? " is-active" : ""),
                          "aria-selected": agentApiSnippetTab === tab.id ? "true" : "false",
                          onClick: () => setAgentApiSnippetTab(tab.id),
                        }, tab.label)
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-computer-api-copy-button",
                      onClick: () => void copyAgentApiSnippet(agentApiSnippetTab, activeSnippet),
                      title: "Copy code",
                      "aria-label": "Copy code",
                    }, copiedAgentApiSnippet === agentApiSnippetTab
                      ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.9 })
                      : React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.9 }))
                  ),
                  agentApiCodePreview
                )
              )
            });
          }
  
          function EnvironmentsHomeResponsiveSvgShared({ frameClassName, frameHeight, svgHeight, fallbackWidth = 640, ariaLabel, svgClassName, children }) {
            const frameRef = useRef(null);
            const [measuredWidth, setMeasuredWidth] = useState(0);
  
            useLayoutEffect(() => {
              const node = frameRef.current;
              if (!node) {
                return undefined;
              }
  
              const updateWidth = () => {
                const nextWidth = Math.max(1, Math.round(node.clientWidth || fallbackWidth));
                setMeasuredWidth((current) => current === nextWidth ? current : nextWidth);
              };
  
              updateWidth();
  
              if (typeof ResizeObserver === "undefined") {
                window.addEventListener("resize", updateWidth);
                return () => window.removeEventListener("resize", updateWidth);
              }
  
              const observer = new ResizeObserver(() => updateWidth());
              observer.observe(node);
              return () => observer.disconnect();
            }, [fallbackWidth]);
  
            const resolvedSvgWidth = Math.max(1, Math.round(measuredWidth || fallbackWidth));
            const resolvedSvgHeight = Math.max(1, Math.round(svgHeight || frameHeight || 208));
  
            return React.createElement("div", {
                ref: frameRef,
                className: frameClassName,
                style: frameHeight ? { height: String(frameHeight) + "px" } : undefined,
              },
              React.createElement("svg", {
                className: svgClassName || "playground-settings-usage-chart-svg",
                width: resolvedSvgWidth,
                height: resolvedSvgHeight,
                role: "img",
                "aria-label": ariaLabel || "Usage chart",
              },
                typeof children === "function"
                  ? children({
                      svgWidth: resolvedSvgWidth,
                      svgHeight: resolvedSvgHeight,
                    })
                  : children
              )
            );
          }
  
          const renderAgentsConfigureUsageEmptyState = (imageName, title, copy) =>
            React.createElement("div", { className: "playground-settings-usage-chart-empty is-tall playground-auth-users-empty-state playground-configure-usage-empty-state" },
              React.createElement("img", {
                className: "playground-auth-users-empty-state-image",
                src: "/img/empty-state/" + imageName,
                alt: "",
                "aria-hidden": "true",
                draggable: "false",
              }),
              React.createElement("div", { className: "playground-auth-users-empty-state-title" }, title),
              React.createElement("div", { className: "playground-auth-users-empty-state-copy" }, copy)
            );
  
          const renderHomeStackedUsageChartShared = ({ ariaLabel, labels, series, emptyText, emptyContent, title, timescaleControl, tickFormatter, isLoading, showLegend = true }) => {
            const normalizedLabels = Array.isArray(labels) ? labels : [];
            const normalizedSeries = Array.isArray(series)
              ? series.filter((entry) => entry && Array.isArray(entry.values))
              : [];
  
            const frameHeight = 270;
            const svgHeight = 270;
            const marginTop = 12;
            const marginRight = 14;
            const marginBottom = 64;
            const marginLeft = 58;
            const totals = normalizedLabels.map((_, index) =>
              normalizedSeries.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
            );
            const hasUsageData = totals.some((value) => Math.max(0, Number(value || 0)) > 0);
            const shouldShowEmptyState = !normalizedLabels.length || !normalizedSeries.length || !hasUsageData;
            const yMax = Math.max(1, ...totals, 1);
            const gridLineCount = 4;
            const formatTick = typeof tickFormatter === "function"
              ? tickFormatter
              : (value) => String(Math.round(value));
            const labelStep = Math.max(1, Math.ceil(normalizedLabels.length / 7));
            const visibleLabelIndexes = (() => {
              const next = [];
              for (let index = 0; index < normalizedLabels.length; index += labelStep) {
                next.push(index);
              }
              const lastIndex = normalizedLabels.length - 1;
              if (lastIndex >= 0 && !next.includes(lastIndex)) {
                if (next.length > 0 && lastIndex - next[next.length - 1] < 2) {
                  next[next.length - 1] = lastIndex;
                } else {
                  next.push(lastIndex);
                }
              }
              return new Set(next);
            })();
  
            return React.createElement("div", { className: "playground-settings-usage-chart-card" },
              React.createElement("div", { className: "playground-project-overview-chart-header" },
                React.createElement("div", { className: "playground-project-overview-chart-header-main" },
                  React.createElement("div", { className: "playground-project-overview-chart-title" }, title || "Activity comparison"),
                  timescaleControl || null
                )
              ),
              isLoading
                ? React.createElement("div", {
                    className: "playground-project-overview-chart-shell",
                    style: { height: String(frameHeight) + "px" },
                  },
                    React.createElement("div", {
                        className: "playground-overview-chart-loading",
                        style: { position: "static", inset: "auto", height: "100%" },
                        "aria-label": "Loading chart data",
                      },
                      React.createElement(Loader2, { className: "playground-overview-chart-loading-icon", strokeWidth: 1.8 })
                    )
                  )
                : shouldShowEmptyState
                  ? (emptyContent || React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "No usage data yet"))
                  : React.createElement(EnvironmentsHomeResponsiveSvgShared, {
                      frameClassName: "playground-project-overview-chart-shell",
                      frameHeight,
                      svgHeight,
                      fallbackWidth: 1200,
                      ariaLabel: ariaLabel || "Usage chart",
                    }, ({ svgWidth, svgHeight: measuredSvgHeight }) => {
                      const plotWidth = svgWidth - marginLeft - marginRight;
                      const plotHeight = measuredSvgHeight - marginTop - marginBottom;
                      const slotWidth = plotWidth / Math.max(normalizedLabels.length, 1);
                      const barWidth = Math.min(24, Math.max(8, slotWidth * 0.56));
                      const baselineY = marginTop + plotHeight;
  
                      return React.createElement(React.Fragment, null,
                        Array.from({ length: gridLineCount + 1 }).map((_, index) => {
                          const y = marginTop + (plotHeight / gridLineCount) * index;
                          const tickValue = yMax - (yMax / gridLineCount) * index;
                          return React.createElement(React.Fragment, { key: "grid:" + index },
                            React.createElement("line", {
                              x1: marginLeft,
                              y1: y,
                              x2: svgWidth - marginRight,
                              y2: y,
                              stroke: "rgba(255,255,255,0.10)",
                              strokeWidth: "1",
                            }),
                            React.createElement("text", {
                              x: 0,
                              y,
                              textAnchor: "start",
                              dominantBaseline: "middle",
                              fill: "rgba(255,255,255,0.4)",
                              fontSize: "12",
                              fontFamily: "Inter, sans-serif",
                              fontWeight: "400",
                            }, formatTick(tickValue))
                          );
                        }),
                        normalizedLabels.map((label, index) => {
                          const x = marginLeft + slotWidth * index + (slotWidth - barWidth) / 2;
                          const isFirstLabel = index === 0;
                          const isLastLabel = index === normalizedLabels.length - 1;
                          const labelX = isFirstLabel
                            ? marginLeft
                            : isLastLabel
                              ? svgWidth - marginRight
                              : marginLeft + slotWidth * index + slotWidth / 2;
                          let stackOffsetY = baselineY;
                          return React.createElement(React.Fragment, { key: "stack:" + index },
                            normalizedSeries.map((entry, seriesIndex) => {
                              const rawValue = Math.max(0, Number(entry.values[index] || 0));
                              if (rawValue <= 0) {
                                return null;
                              }
                              const segmentHeight = (rawValue / yMax) * plotHeight;
                              stackOffsetY -= segmentHeight;
                              return React.createElement("rect", {
                                key: "segment:" + seriesIndex,
                                x,
                                y: stackOffsetY,
                                width: barWidth,
                                height: Math.max(segmentHeight, 1),
                                rx: "3",
                                fill: entry.color || "rgba(255,255,255,0.8)",
                              });
                            }),
                            visibleLabelIndexes.has(index)
                              ? React.createElement("text", {
                                  x: labelX,
                                  y: measuredSvgHeight - 28,
                                  textAnchor: isFirstLabel ? "start" : (isLastLabel ? "end" : "middle"),
                                  dominantBaseline: "middle",
                                  fill: "rgba(255,255,255,0.4)",
                                  fontSize: "12",
                                  fontFamily: "Inter, sans-serif",
                                  fontWeight: "400",
                                }, label)
                              : null
                          );
                        })
                      );
                    }
                  ),
              showLegend
                ? (!isLoading && !shouldShowEmptyState ? React.createElement("div", {
                    className: "playground-settings-usage-inline-legend",
                    style: { justifyContent: "flex-start" },
                  },
                    normalizedSeries.map((entry) =>
                      React.createElement("div", { key: entry.id || entry.label, className: "playground-settings-usage-legend-item" },
                        React.createElement("span", {
                          className: "playground-settings-usage-legend-swatch",
                          style: { background: entry.color },
                        }),
                        React.createElement("span", null, entry.label)
                      )
                    )
                  ) : null)
                : null
            );
          };
  
          function getAgentsObservabilityThreadTimestamp(thread) {
            const safeThread = normalizeThreadItem(thread || {});
            const timestamp = Date.parse(String(safeThread.updatedAt || safeThread.completedAt || safeThread.finishedAt || safeThread.endedAt || safeThread.startedAt || safeThread.createdAt || ""));
            return Number.isFinite(timestamp) ? timestamp : 0;
          }
  
          function getAgentsObservabilityThreadDurationMs(thread, details = null) {
            const explicitDuration = Number(
              thread?.durationMs
              || thread?.duration
              || details?.thread?.durationMs
              || details?.thread?.duration
              || 0
            );
            if (Number.isFinite(explicitDuration) && explicitDuration > 0) {
              return explicitDuration;
            }
            const safeThread = normalizeThreadItem(thread || {});
            const startedAt = Date.parse(String(safeThread.startedAt || safeThread.createdAt || ""));
            const completedAt = Date.parse(String(safeThread.completedAt || safeThread.finishedAt || safeThread.endedAt || ""));
            if (Number.isFinite(startedAt) && Number.isFinite(completedAt) && completedAt >= startedAt) {
              return completedAt - startedAt;
            }
            return null;
          }
  
          function getAgentsObservabilityAgentLabel(thread, agentsById) {
            const safeThread = normalizeThreadItem(thread || {});
            const agentId = String(safeThread.agentId || thread?.agent?.id || thread?.metadata?.agentId || "").trim();
            const agent = agentId ? agentsById[agentId] : null;
            if (agent?.name) {
              return agent.name;
            }
            if (thread?.agentName) {
              return String(thread.agentName).trim();
            }
            if (thread?.agent?.name) {
              return String(thread.agent.name).trim();
            }
            return agentId || "No agent";
          }
  
          function renderAgentsObservabilityStatusBadge(status) {
            const normalizedStatus = String(status || "unknown").trim().toLowerCase() || "unknown";
            return React.createElement("span", {
              className: "playground-agents-observability-status is-" + normalizedStatus,
            }, getTraceStatusLabel(normalizedStatus));
          }
  
          function renderAgentsObservabilitySection() {
            const agentsById = {};
            allKnownAgents.forEach((agent) => {
              if (!agent?.id) return;
              agentsById[agent.id] = agent;
            });
            const statusOptions = [
              { id: "all", label: "All statuses" },
              { id: "running", label: "Running" },
              { id: "permission_asked", label: "Needs permission" },
              { id: "completed", label: "Completed" },
              { id: "failed", label: "Failed" },
              { id: "cancelled", label: "Cancelled" },
            ];
            const sortOptions = [
              { id: "newest", label: "Newest first" },
              { id: "oldest", label: "Oldest first" },
              { id: "cost", label: "Highest cost" },
              { id: "duration", label: "Longest duration" },
            ];
            const normalizedQuery = String(searchPopupQuery || "").trim().toLowerCase();
            const normalizedThreads = (Array.isArray(agentsHomeThreadRecords) ? agentsHomeThreadRecords : [])
              .map((thread) => normalizeThreadItem(thread))
              .filter((thread) => thread?.id);
            const visibleThreads = normalizedThreads
              .filter((thread) => {
                const status = String(thread.status || "").trim().toLowerCase();
                if (agentsObservabilityStatusFilter !== "all" && status !== agentsObservabilityStatusFilter) {
                  return false;
                }
                if (!normalizedQuery) {
                  return true;
                }
                const titleParts = getSidebarThreadTitleParts(thread);
                const haystack = [
                  thread.id,
                  titleParts.displayThreadTitle,
                  titleParts.taskTicketNumber,
                  thread.projectName,
                  thread.environmentName,
                  getAgentsObservabilityAgentLabel(thread, agentsById),
                  status,
                ].join(" ").toLowerCase();
                return haystack.includes(normalizedQuery);
              })
              .slice()
              .sort((left, right) => {
                if (agentsObservabilitySort === "oldest") {
                  return getAgentsObservabilityThreadTimestamp(left) - getAgentsObservabilityThreadTimestamp(right);
                }
                if (agentsObservabilitySort === "cost") {
                  const leftCost = readSettingsComputeTokens(left, "totalCT", "totalCost");
                  const rightCost = readSettingsComputeTokens(right, "totalCT", "totalCost");
                  if (leftCost !== rightCost) {
                    return rightCost - leftCost;
                  }
                } else if (agentsObservabilitySort === "duration") {
                  const leftDuration = getAgentsObservabilityThreadDurationMs(left) || 0;
                  const rightDuration = getAgentsObservabilityThreadDurationMs(right) || 0;
                  if (leftDuration !== rightDuration) {
                    return rightDuration - leftDuration;
                  }
                }
                return getAgentsObservabilityThreadTimestamp(right) - getAgentsObservabilityThreadTimestamp(left);
              });
            const agentsObservabilityPageSize = 20;
            const visibleThreadLimit = Math.max(agentsObservabilityPageSize, Number(agentsObservabilityVisibleThreadLimit || agentsObservabilityPageSize));
            const displayedThreads = visibleThreads.slice(0, visibleThreadLimit);
            const remainingThreadCount = Math.max(0, visibleThreads.length - displayedThreads.length);
  
            return React.createElement("section", { className: "playground-agents-observability-section" },
              React.createElement("div", { className: "playground-plugins-section-header" },
                React.createElement("div", { className: "playground-plugins-section-copy" },
                  React.createElement("h3", { className: "playground-plugins-section-title" }, "Thread traces")
                )
              ),
              React.createElement("div", { className: "playground-plugins-search-row playground-agents-overview-search-row", ref: agentsObservabilityToolbarRef },
                React.createElement("div", { className: "playground-plugins-search-shell" },
                  React.createElement(Search, { className: "playground-plugins-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("input", {
                    type: "search",
                    value: searchPopupQuery,
                    onChange: (event) => setSearchPopupQuery(event.target.value),
                    className: "playground-plugins-search",
                    placeholder: "Search traces",
                  })
                ),
                React.createElement("div", { className: "playground-plugins-toolbar-controls" },
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-sort" + (agentsObservabilityToolbarPopover === "sort" || agentsObservabilitySort !== "newest" ? " is-active" : ""),
                      onClick: () => setAgentsObservabilityToolbarPopover((current) => current === "sort" ? "" : "sort"),
                    },
                      React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Sort")
                    ),
                    agentsObservabilityToolbarPopover === "sort"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          sortOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (agentsObservabilitySort === option.id ? " selected" : ""),
                                onClick: () => {
                                  setAgentsObservabilitySort(option.id);
                                  setAgentsObservabilityToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                agentsObservabilitySort === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label)
                              )
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-control-button is-bare is-backlog-filter" + (agentsObservabilityToolbarPopover === "status" || agentsObservabilityStatusFilter !== "all" ? " is-active" : ""),
                      onClick: () => setAgentsObservabilityToolbarPopover((current) => current === "status" ? "" : "status"),
                    },
                      React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                      React.createElement("span", null, "Status")
                    ),
                    agentsObservabilityToolbarPopover === "status"
                      ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                          statusOptions.map((option) =>
                            React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "tb-popup-row tb-popup-row-select" + (agentsObservabilityStatusFilter === option.id ? " selected" : ""),
                                onClick: () => {
                                  setAgentsObservabilityStatusFilter(option.id);
                                  setAgentsObservabilityToolbarPopover("");
                                },
                              },
                              React.createElement("span", { className: "tb-popup-check-slot" },
                                agentsObservabilityStatusFilter === option.id
                                  ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                  : null
                              ),
                              React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                                React.createElement("span", null, option.label)
                              )
                            )
                          )
                        )
                      : null
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare playground-agents-observability-refresh-button",
                    onClick: () => void loadAgentsHomeThreads({ force: true }),
                    disabled: agentsHomeThreadsLoading,
                  },
                    React.createElement(RefreshCw, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, agentsHomeThreadsLoading ? "Refreshing" : "Refresh")
                  )
                )
              ),
              React.createElement(PlatformDataTable, {
                rows: displayedThreads,
                getRowId: (thread) => String(thread?.id || ""),
                ariaLabel: "Agent thread traces",
                className: "playground-agents-observability-platform-table",
                surface: "plain",
                sticky: false,
                loading: agentsHomeThreadsLoading && displayedThreads.length === 0,
                error: agentsHomeThreadsError || null,
                emptyState: normalizedQuery ? "No matching traces found." : "No thread traces yet.",
                columns: [
                  {
                    id: "trace",
                    header: "Trace",
                    accessor: (thread) => getSidebarThreadTitleParts(thread).displayThreadTitle || thread.title || "Untitled thread",
                    width: "minmax(220px, 2fr)",
                    cell: ({ row: thread }) => {
                      const threadId = String(thread?.id || "").trim();
                      const title = getSidebarThreadTitleParts(thread).displayThreadTitle || thread.title || "Untitled thread";
                      return React.createElement("div", { className: "playground-agents-overview-name-copy" },
                        React.createElement("div", { className: "playground-agents-overview-name-title", title }, title),
                        React.createElement("div", { className: "playground-agents-overview-name-description", title: threadId }, threadId)
                      );
                    },
                  },
                  {
                    id: "agent",
                    header: "Agent",
                    accessor: (thread) => getAgentsObservabilityAgentLabel(thread, agentsById),
                    width: "minmax(120px, 1fr)",
                  },
                  {
                    id: "status",
                    header: "Status",
                    accessor: (thread) => thread.status || "",
                    width: "minmax(90px, 0.75fr)",
                    cell: ({ row: thread }) => renderAgentsObservabilityStatusBadge(thread.status),
                  },
                  {
                    id: "started",
                    header: "Started",
                    accessor: getAgentsObservabilityThreadTimestamp,
                    width: "minmax(110px, 0.9fr)",
                    align: "end",
                    cell: ({ row: thread }) => {
                      const startedAt = thread.startedAt || thread.createdAt || "";
                      return React.createElement("span", { title: startedAt ? new Date(startedAt).toLocaleString() : "" }, startedAt ? formatPlaygroundFileDate(startedAt) : "-");
                    },
                  },
                  {
                    id: "duration",
                    header: "Duration",
                    accessor: (thread) => getAgentsObservabilityThreadDurationMs(thread) || 0,
                    width: "minmax(90px, 0.75fr)",
                    align: "end",
                    hideBelow: 760,
                    cell: ({ row: thread }) => {
                      const durationMs = getAgentsObservabilityThreadDurationMs(thread);
                      return durationMs == null ? "-" : formatPlaygroundExecutionDuration(durationMs);
                    },
                  },
                  {
                    id: "compute",
                    header: "Compute",
                    accessor: (thread) => readSettingsComputeTokens(thread, "totalCT", "totalCost"),
                    width: "minmax(90px, 0.75fr)",
                    align: "end",
                    cell: ({ row: thread }) => formatSettingsComputeTokens(readSettingsComputeTokens(thread, "totalCT", "totalCost")),
                  },
                ],
                onRowActivate: (thread) => handleAgentsHomeThreadOpen(String(thread?.id || "").trim(), {
                  contentMode: "trace",
                  threadRecord: thread,
                }),
                getRowAriaLabel: (thread) => "Open trace " + (getSidebarThreadTitleParts(thread).displayThreadTitle || thread.title || "Untitled thread"),
                footer: remainingThreadCount > 0
                  ? React.createElement("div", { className: "playground-agents-observability-load-more-row" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-agents-observability-load-more-button",
                        onClick: () => setAgentsObservabilityVisibleThreadLimit((current) => (
                          Math.max(agentsObservabilityPageSize, Number(current || agentsObservabilityPageSize)) + agentsObservabilityPageSize
                        )),
                      },
                        React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", null, remainingThreadCount > agentsObservabilityPageSize ? "Load 20 more" : "Load " + remainingThreadCount + " more")
                      )
                    )
                  : null,
              })
            );
          }
  
          function renderAgentsModelsSection() {
            const renderModelProviderIcon = (modelMeta) => {
              const providerIcon = getPlaygroundAgentModelProviderIcon(modelMeta);
              return providerIcon
                ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                    React.createElement("img", {
                      src: providerIcon.src,
                      alt: "",
                      draggable: "false",
                      className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                    })
                  )
                : React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                    React.createElement(Bot, { width: 16, height: 16, strokeWidth: 1.8 })
                  );
            };
            const renderModelIntelligence = (model) => {
              const intelligenceLabel = String(model?.intelligence || model?.intelligenceLabel || "Custom").trim() || "Custom";
              const intelligenceLevel = Math.max(1, Math.min(4, getPlaygroundAgentIntelligenceLevel(intelligenceLabel)));
              return React.createElement("span", {
                  className: "playground-agents-model-brains",
                  title: intelligenceLabel,
                  "aria-label": intelligenceLabel + " intelligence, level " + intelligenceLevel + " of 4",
                },
                Array.from({ length: 4 }).map((_, index) =>
                  React.createElement(Brain, {
                    key: String(model?.id || "model") + "-brain-" + index,
                    className: "playground-agents-model-brain" + (index < intelligenceLevel ? " is-active" : ""),
                    width: 12,
                    height: 12,
                    strokeWidth: 1.9,
                  })
                )
              );
            };
            const readModelContextValue = (model) => {
              const raw = String(model?.contextWindow || "").trim().toLowerCase();
              const match = raw.match(/([0-9]+(?:\.[0-9]+)?)/);
              if (!match) return 0;
              const value = Number(match[1]);
              if (!Number.isFinite(value)) return 0;
              if (raw.includes("m")) return value * 1000000;
              if (raw.includes("k")) return value * 1000;
              return value;
            };
            const readModelSpeedRank = (model) => {
              const normalized = String(model?.speed || "").trim().toLowerCase();
              if (normalized.includes("very")) return 4;
              if (normalized.includes("fast")) return 3;
              if (normalized.includes("medium")) return 2;
              if (normalized.includes("slow")) return 1;
              return 0;
            };
            const providerFilterOptions = [
              { id: "all", label: "All models" },
              { id: "anthropic", label: "Anthropic" },
              { id: "google", label: "Google" },
              { id: "openai", label: "OpenAI" },
              { id: "xai", label: "xAI" },
              { id: "deepseek", label: "DeepSeek" },
              { id: "minimax", label: "MiniMax" },
              { id: "kimi", label: "Kimi" },
              { id: "zai", label: "ZAI" },
              { id: "qwen", label: "Qwen" },
              { id: "custom", label: "Custom" },
              { id: "available", label: "Available" },
              { id: "locked", label: "Plan required" },
            ];
            const sortOptions = [
              { id: "provider", label: "Provider" },
              { id: "name", label: "Name (A-Z)" },
              { id: "intelligence", label: "Highest intelligence" },
              { id: "cost", label: "Lowest USD cost" },
              { id: "context", label: "Largest context" },
              { id: "speed", label: "Fastest" },
            ];
            const normalizedModelsSearchQuery = String(agentsModelsSearchQuery || "").trim().toLowerCase();
            const visibleModels = (Array.isArray(resolvedAgentModelOptions) ? resolvedAgentModelOptions : [])
              .filter((model) => model?.id && model?.label)
              .filter((model) => {
                const providerKey = getPlaygroundAgentModelProviderFilterKey(model);
                if (agentsModelsProviderFilter === "available" && model.locked) return false;
                if (agentsModelsProviderFilter === "locked" && !model.locked) return false;
                if (
                  agentsModelsProviderFilter !== "all"
                  && agentsModelsProviderFilter !== "available"
                  && agentsModelsProviderFilter !== "locked"
                  && providerKey !== agentsModelsProviderFilter
                ) {
                  return false;
                }
                if (!normalizedModelsSearchQuery) {
                  return true;
                }
                const providerLabel = providerKey === "custom" ? "Custom" : getPlaygroundAgentModelProviderLabel(model);
                const haystack = [
                  model.id,
                  model.label,
                  model.description,
                  model.intelligence,
                  model.intelligenceLabel,
                  model.contextWindow,
                  model.speed,
                  model.source,
                  model.providerType,
                  providerLabel,
                ].join(" ").toLowerCase();
                return haystack.includes(normalizedModelsSearchQuery);
              })
              .slice()
              .sort((left, right) => {
                if (agentsModelsSort === "name") {
                  return String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || ""));
                }
                if (agentsModelsSort === "intelligence") {
                  const leftLevel = getPlaygroundAgentIntelligenceLevel(left?.intelligence || left?.intelligenceLabel || "");
                  const rightLevel = getPlaygroundAgentIntelligenceLevel(right?.intelligence || right?.intelligenceLabel || "");
                  if (leftLevel !== rightLevel) {
                    return rightLevel - leftLevel;
                  }
                } else if (agentsModelsSort === "cost") {
                  const leftCost = getPlaygroundAgentModelWeightedCost(left?.id) || Number.POSITIVE_INFINITY;
                  const rightCost = getPlaygroundAgentModelWeightedCost(right?.id) || Number.POSITIVE_INFINITY;
                  if (leftCost !== rightCost) {
                    return leftCost - rightCost;
                  }
                } else if (agentsModelsSort === "context") {
                  const leftContext = readModelContextValue(left);
                  const rightContext = readModelContextValue(right);
                  if (leftContext !== rightContext) {
                    return rightContext - leftContext;
                  }
                } else if (agentsModelsSort === "speed") {
                  const leftSpeed = readModelSpeedRank(left);
                  const rightSpeed = readModelSpeedRank(right);
                  if (leftSpeed !== rightSpeed) {
                    return rightSpeed - leftSpeed;
                  }
                }
                const leftProvider = getPlaygroundAgentModelProviderLabel(left);
                const rightProvider = getPlaygroundAgentModelProviderLabel(right);
                if (leftProvider !== rightProvider) {
                  return leftProvider.localeCompare(rightProvider);
                }
                return String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || ""));
              });
  
            return React.createElement("section", { className: "playground-plugins-section" },
              React.createElement("div", { className: "playground-plugins-section-header" },
                React.createElement("div", { className: "playground-plugins-section-copy" },
                  React.createElement("h3", { className: "playground-plugins-section-title" }, "Models")
                )
              ),
              React.createElement(PlatformDataTable, {
                rows: visibleModels,
                getRowId: (model) => model.id,
                ariaLabel: "Available agent models",
                className: "playground-agent-models-platform-table",
                surface: "plain",
                sticky: false,
                emptyState: normalizedModelsSearchQuery || agentsModelsProviderFilter !== "all" ? "No matching models found." : "No models available.",
                sorting: { defaultValue: { id: "provider", direction: "asc" } },
                toolbar: {
                  search: {
                    value: agentsModelsSearchQuery,
                    manual: true,
                    onChange: setAgentsModelsSearchQuery,
                    placeholder: "Search models",
                  },
                  showSort: true,
                  filters: [{
                    id: "provider",
                    label: "Provider",
                    value: agentsModelsProviderFilter,
                    onChange: setAgentsModelsProviderFilter,
                    options: providerFilterOptions,
                  }],
                },
                columns: [
                  {
                    id: "model",
                    header: "Model",
                    accessor: (model) => model.label || model.id,
                    sortable: true,
                    width: "minmax(220px, 2fr)",
                    cell: ({ row: model }) => React.createElement("div", { className: "playground-agents-overview-model-cell" },
                      renderModelProviderIcon(model),
                      React.createElement("div", { className: "playground-agents-overview-model-copy" },
                        React.createElement("div", { className: "playground-agents-overview-name-title", title: model.label || model.id }, model.label || model.id),
                        React.createElement("div", { className: "playground-agents-overview-name-description", title: model.description || model.id }, model.description || model.id)
                      )
                    ),
                  },
                  {
                    id: "provider",
                    header: "Provider",
                    accessor: (model) => getPlaygroundAgentModelProviderFilterKey(model) === "custom" ? "Custom" : getPlaygroundAgentModelProviderLabel(model),
                    sortable: true,
                    width: "minmax(100px, 0.9fr)",
                  },
                  {
                    id: "intelligence",
                    header: "Intelligence",
                    accessor: (model) => getPlaygroundAgentIntelligenceLevel(model?.intelligence || model?.intelligenceLabel || ""),
                    sortable: true,
                    sortDescFirst: true,
                    width: "minmax(100px, 0.9fr)",
                    cell: ({ row: model }) => renderModelIntelligence(model),
                  },
                  {
                    id: "context",
                    header: "Context",
                    accessor: readModelContextValue,
                    sortable: true,
                    sortDescFirst: true,
                    width: "minmax(90px, 0.75fr)",
                    cell: ({ row: model }) => model.contextWindow || "Custom",
                  },
                  {
                    id: "speed",
                    header: "Speed",
                    accessor: readModelSpeedRank,
                    sortable: true,
                    sortDescFirst: true,
                    width: "minmax(90px, 0.75fr)",
                    hideBelow: 760,
                    cell: ({ row: model }) => model.speed || "Custom",
                  },
                  {
                    id: "cost",
                    header: "Cost / mTok",
                    accessor: (model) => getPlaygroundAgentModelWeightedCost(model?.id) || Number.POSITIVE_INFINITY,
                    sortable: true,
                    width: "minmax(100px, 0.85fr)",
                    align: "end",
                    cell: ({ row: model }) => formatPlaygroundAgentModelComputeTokenCost(model.id),
                  },
                  {
                    id: "access",
                    header: "Access",
                    accessor: (model) => model.locked ? "Plan required" : "Available",
                    width: "minmax(100px, 0.85fr)",
                    align: "end",
                    cell: ({ row: model }) => React.createElement("span", { className: "playground-agents-model-access" + (model.locked ? " is-locked" : " is-available") }, model.locked ? "Plan required" : "Available"),
                  },
                ],
              })
            );
          }
  
          function renderAgentsHome(overviewListContent = null) {
            const allAgents = allKnownAgents.filter((agent) => agent?.id && agent.id !== PLAYGROUND_AGENT_DRAFT_ID);
            const teamAgents = allAgents.filter((agent) => isPlaygroundTeamAgent(agent));
            const singleAgents = allAgents.filter((agent) => !isPlaygroundTeamAgent(agent));
            const teamAgentIds = new Set(teamAgents.map((agent) => String(agent.id || "").trim()).filter(Boolean));
            const readThreadCreatedAtMs = (thread) => {
              const timestamp = Date.parse(String(thread?.createdAt || thread?.updatedAt || ""));
              return Number.isFinite(timestamp) ? timestamp : null;
            };
            const readThreadAgentId = (thread) => String(thread?.agentId || "").trim();
            const readThreadTotalCT = (thread) => Math.max(0, Number(readSettingsComputeTokens(thread, "totalCT", "totalCost") || 0));
            const getAgentsHomePeriodStartMs = (period) => {
              const now = new Date();
              const start = new Date(now);
              if (period === "day") {
                start.setHours(0, 0, 0, 0);
                return start.getTime();
              }
              if (period === "week") {
                start.setDate(start.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                return start.getTime();
              }
              start.setDate(start.getDate() - 29);
              start.setHours(0, 0, 0, 0);
              return start.getTime();
            };
            const periodStartMs = getAgentsHomePeriodStartMs(agentsHomeChartTimescale);
            const periodEndMs = Date.now();
            const relevantThreads = (Array.isArray(agentsHomeThreadRecords) ? agentsHomeThreadRecords : []).filter((thread) => {
              const createdAtMs = readThreadCreatedAtMs(thread);
              return Number.isFinite(createdAtMs) && createdAtMs >= periodStartMs && createdAtMs <= periodEndMs;
            });
  
            let totalSingleAgentCT = 0;
            let totalTeamAgentCT = 0;
            relevantThreads.forEach((thread) => {
              const nextCost = readThreadTotalCT(thread);
              const threadAgentId = readThreadAgentId(thread);
              if (threadAgentId && teamAgentIds.has(threadAgentId)) {
                totalTeamAgentCT += nextCost;
                return;
              }
              totalSingleAgentCT += nextCost;
            });
            const totalAgentsCT = totalSingleAgentCT + totalTeamAgentCT;
            const agentsHomeKpis = [
              { id: "agents", value: String(singleAgents.length), label: "Agents" },
              { id: "teams", value: String(teamAgents.length), label: "Squads" },
              { id: "agent-ct", value: formatSettingsComputeTokens(totalSingleAgentCT), label: "Spent on Agents" },
              { id: "team-ct", value: formatSettingsComputeTokens(totalTeamAgentCT), label: "Spent on Squads" },
              { id: "total-ct", value: formatSettingsComputeTokens(totalAgentsCT), label: "Total cost" },
            ];
  
            const buildAgentsHomeActivityBuckets = (period) => {
              if (period === "day") {
                const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
                return Array.from({ length: 24 }, (_, index) => {
                  const date = new Date();
                  date.setMinutes(0, 0, 0);
                  date.setHours(date.getHours() - (23 - index));
                  return {
                    key: date.toISOString().slice(0, 13),
                    label: formatter.format(date),
                    startMs: date.getTime(),
                    endMs: date.getTime() + 60 * 60 * 1000,
                  };
                });
              }
              if (period === "week") {
                const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
                return Array.from({ length: 7 }, (_, index) => {
                  const date = new Date();
                  date.setHours(0, 0, 0, 0);
                  date.setDate(date.getDate() - (6 - index));
                  return {
                    key: date.toISOString().slice(0, 10),
                    label: formatter.format(date),
                    startMs: date.getTime(),
                    endMs: date.getTime() + 24 * 60 * 60 * 1000,
                  };
                });
              }
              const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
              return Array.from({ length: 30 }, (_, index) => {
                const date = new Date();
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() - (29 - index));
                return {
                  key: date.toISOString().slice(0, 10),
                  label: formatter.format(date),
                  startMs: date.getTime(),
                  endMs: date.getTime() + 24 * 60 * 60 * 1000,
                };
              });
            };
  
            const activityBuckets = buildAgentsHomeActivityBuckets(agentsHomeChartTimescale);
            const singleAgentActivity = activityBuckets.map((bucket) => relevantThreads.reduce((sum, thread) => {
              const createdAtMs = readThreadCreatedAtMs(thread);
              if (!Number.isFinite(createdAtMs) || createdAtMs < bucket.startMs || createdAtMs >= bucket.endMs) {
                return sum;
              }
              const threadAgentId = readThreadAgentId(thread);
              return threadAgentId && teamAgentIds.has(threadAgentId) ? sum : sum + 1;
            }, 0));
            const teamActivity = activityBuckets.map((bucket) => relevantThreads.reduce((sum, thread) => {
              const createdAtMs = readThreadCreatedAtMs(thread);
              if (!Number.isFinite(createdAtMs) || createdAtMs < bucket.startMs || createdAtMs >= bucket.endMs) {
                return sum;
              }
              const threadAgentId = readThreadAgentId(thread);
              return threadAgentId && teamAgentIds.has(threadAgentId) ? sum + 1 : sum;
            }, 0));
            const singleAgentCostActivity = activityBuckets.map((bucket) => relevantThreads.reduce((sum, thread) => {
              const createdAtMs = readThreadCreatedAtMs(thread);
              if (!Number.isFinite(createdAtMs) || createdAtMs < bucket.startMs || createdAtMs >= bucket.endMs) {
                return sum;
              }
              const threadAgentId = readThreadAgentId(thread);
              return threadAgentId && teamAgentIds.has(threadAgentId) ? sum : sum + readThreadTotalCT(thread);
            }, 0));
            const teamAgentCostActivity = activityBuckets.map((bucket) => relevantThreads.reduce((sum, thread) => {
              const createdAtMs = readThreadCreatedAtMs(thread);
              if (!Number.isFinite(createdAtMs) || createdAtMs < bucket.startMs || createdAtMs >= bucket.endMs) {
                return sum;
              }
              const threadAgentId = readThreadAgentId(thread);
              return threadAgentId && teamAgentIds.has(threadAgentId) ? sum + readThreadTotalCT(thread) : sum;
            }, 0));
            const agentsHomeHasCostActivity = singleAgentCostActivity.concat(teamAgentCostActivity).some((value) => Math.max(0, Number(value || 0)) > 0);
  
            const renderAgentsHomeComparisonBarChart = ({ ariaLabel, labels, countValues, costValues, emptyText }) => {
              const normalizedLabels = Array.isArray(labels) ? labels : [];
              const normalizedCountValues = Array.isArray(countValues) ? countValues.map((value) => Math.max(0, Number(value || 0))) : [];
              const normalizedCostValues = Array.isArray(costValues) ? costValues.map((value) => Math.max(0, Number(value || 0))) : [];
              if (
                !normalizedLabels.length
                || normalizedLabels.length !== normalizedCountValues.length
                || normalizedLabels.length !== normalizedCostValues.length
              ) {
                return React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "No agent data yet");
              }
  
              const chartHeight = 194;
              const marginTop = 12;
              const marginRight = 42;
              const marginBottom = 28;
              const marginLeft = 58;
              const maxCountValue = Math.max(1, ...normalizedCountValues);
              const maxCostValue = Math.max(1, ...normalizedCostValues);
              const countAxisValues = [maxCountValue, Math.round(maxCountValue / 2), 0];
              const costAxisValues = [maxCostValue, Math.round(maxCostValue / 2), 0];
  
              return React.createElement("div", {
                  className: "playground-database-overview-timeseries-card",
                  "aria-label": ariaLabel || "Agent overview chart",
                },
                React.createElement("div", { className: "playground-environments-home-comparison-header" },
                  React.createElement("div", { className: "playground-environments-home-comparison-copy" },
                    React.createElement("div", { className: "playground-environments-home-comparison-title" }, "Agent comparison"),
                    React.createElement("div", { className: "playground-environments-home-comparison-legend" },
                      React.createElement("span", { className: "playground-environments-home-comparison-legend-item" },
                        React.createElement("span", { className: "playground-environments-home-comparison-legend-dot is-count" }),
                        React.createElement("span", null, "Count")
                      ),
                      React.createElement("span", { className: "playground-environments-home-comparison-legend-item" },
                        React.createElement("span", { className: "playground-environments-home-comparison-legend-dot is-cost" }),
                        React.createElement("span", null, "Compute cost")
                      )
                    )
                  )
                ),
                React.createElement("div", { className: "playground-database-overview-timeseries-chart" },
                  React.createElement(AgentsHomeResponsiveSvg, {
                      frameClassName: "playground-database-overview-timeseries-frame",
                      frameHeight: chartHeight,
                      svgHeight: chartHeight,
                      fallbackWidth: 420,
                      ariaLabel: ariaLabel || "Agent overview chart",
                    }, ({ svgWidth, svgHeight }) => {
                      const plotWidth = svgWidth - marginLeft - marginRight;
                      const plotHeight = svgHeight - marginTop - marginBottom;
                      const baselineY = marginTop + plotHeight;
                      const slotWidth = plotWidth / Math.max(normalizedLabels.length, 1);
                      const pairWidth = Math.min(38, Math.max(16, slotWidth * 0.42));
                      const pairGap = Math.min(8, Math.max(4, slotWidth * 0.08));
                      const barWidth = Math.max(5, (pairWidth - pairGap) / 2);
  
                      return React.createElement(React.Fragment, null,
                        Array.from({ length: 4 }).map((_, index) => {
                          const y = marginTop + (plotHeight / 3) * index;
                          return React.createElement("line", {
                            key: "grid:" + index,
                            className: "playground-database-overview-timeseries-grid-line",
                            x1: marginLeft,
                            y1: y,
                            x2: svgWidth - marginRight,
                            y2: y,
                          });
                        }),
                        countAxisValues.map((value, index) =>
                          React.createElement("text", {
                            key: "count-axis:" + index,
                            x: 0,
                            y: marginTop + (plotHeight / 2) * index + 4,
                            textAnchor: "start",
                            className: "playground-database-overview-timeseries-axis-label",
                            fontSize: "10",
                          }, String(value))
                        ),
                        costAxisValues.map((value, index) =>
                          React.createElement("text", {
                            key: "cost-axis:" + index,
                            x: svgWidth,
                            y: marginTop + (plotHeight / 2) * index + 4,
                            textAnchor: "end",
                            className: "playground-database-overview-timeseries-axis-label",
                            fontSize: "10",
                          }, formatSettingsComputeTokens(value))
                        ),
                        normalizedLabels.map((label, index) => {
                          const groupX = marginLeft + slotWidth * index + ((slotWidth - pairWidth) / 2);
                          const countHeight = (normalizedCountValues[index] / maxCountValue) * plotHeight;
                          const costHeight = (normalizedCostValues[index] / maxCostValue) * plotHeight;
                          return React.createElement(React.Fragment, { key: "bars:" + index },
                            React.createElement("rect", {
                              x: groupX,
                              y: baselineY - countHeight,
                              width: barWidth,
                              height: Math.max(2, countHeight),
                              rx: "7",
                              ry: "7",
                              className: "playground-database-overview-timeseries-bar is-comparison-count",
                            }),
                            React.createElement("rect", {
                              x: groupX + barWidth + pairGap,
                              y: baselineY - costHeight,
                              width: barWidth,
                              height: Math.max(2, costHeight),
                              rx: "7",
                              ry: "7",
                              className: "playground-database-overview-timeseries-bar is-comparison-cost",
                            })
                          );
                        }),
                        normalizedLabels.map((label, index) =>
                          React.createElement("text", {
                            key: "label:" + index,
                            x: marginLeft + slotWidth * index + (slotWidth / 2),
                            y: svgHeight - 8,
                            textAnchor: "middle",
                            className: "playground-database-overview-timeseries-axis-label",
                            fontSize: "10",
                          }, String(label || ""))
                        )
                      );
                    })
                )
              );
            };
  
            function PlaygroundAgentsHomeStackedUsageChart({
              ariaLabel,
              labels,
              series,
              countSeries,
              emptyText,
              emptyContent,
              title,
              timescaleControl,
              isLoading,
              usesComputeTokenValues,
            }) {
              const canvasRef = useRef(null);
              const chartRef = useRef(null);
              const normalizedLabels = Array.isArray(labels) ? labels : [];
              const normalizedSeries = Array.isArray(series)
                ? series.filter((entry) => entry && Array.isArray(entry.values))
                : [];
              const normalizedCountSeries = Array.isArray(countSeries)
                ? countSeries.filter((entry) => entry && Array.isArray(entry.values))
                : [];
              const totals = normalizedLabels.map((_, index) =>
                normalizedSeries.reduce((sum, entry) => sum + Math.max(0, Number(entry.values[index] || 0)), 0)
              );
              const hasUsageData = normalizedLabels.length > 0
                && normalizedSeries.length > 0
                && totals.some((value) => Math.max(0, Number(value || 0)) > 0);
              const chartSignature = JSON.stringify({
                labels: normalizedLabels,
                series: normalizedSeries.map((entry) => ({
                  id: entry.id,
                  label: entry.label,
                  color: entry.color,
                  values: entry.values,
                })),
                countSeries: normalizedCountSeries.map((entry) => ({
                  id: entry.id,
                  values: entry.values,
                })),
                usesComputeTokenValues: Boolean(usesComputeTokenValues),
              });
  
              useEffect(() => () => {
                if (chartRef.current) {
                  chartRef.current.destroy();
                  chartRef.current = null;
                }
              }, []);
  
              useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas || typeof Chart !== "function" || !hasUsageData) {
                  if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                  }
                  return undefined;
                }
  
                const countValuesById = normalizedCountSeries.reduce((map, entry) => {
                  map[entry.id] = Array.isArray(entry.values) ? entry.values : [];
                  return map;
                }, {});
                const maxLabelCount = Math.max(2, Math.floor(normalizedLabels.length <= 7 ? 7 : 7));
                const labelStep = Math.max(1, Math.ceil(normalizedLabels.length / maxLabelCount));
                const visibleLabelIndexes = (() => {
                  const next = new Set();
                  for (let index = 0; index < normalizedLabels.length; index += labelStep) {
                    next.add(index);
                  }
                  const lastIndex = normalizedLabels.length - 1;
                  if (lastIndex >= 0) {
                    next.add(lastIndex);
                  }
                  return next;
                })();
                const chartData = {
                  labels: normalizedLabels,
                  datasets: normalizedSeries.map((entry) => ({
                    id: entry.id,
                    label: entry.label,
                    data: entry.values.map((value) => Math.max(0, Number(value || 0))),
                    backgroundColor: entry.color || "rgba(255,255,255,0.8)",
                    borderColor: entry.color || "rgba(255,255,255,0.8)",
                    borderWidth: 0,
                    borderRadius: 3,
                    borderSkipped: false,
                    barPercentage: 0.92,
                    categoryPercentage: 0.58,
                    maxBarThickness: 24,
                    stack: "agent-usage",
                  })),
                };
                const chartOptions = {
                  animation: false,
                  responsive: true,
                  maintainAspectRatio: false,
                  normalized: true,
                  interaction: {
                    intersect: true,
                    mode: "nearest",
                  },
                  layout: {
                    padding: {
                      top: 12,
                      right: 14,
                      bottom: 0,
                      left: 0,
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "rgba(8, 8, 8, 0.96)",
                      borderColor: "rgba(255, 255, 255, 0.14)",
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                      titleColor: "rgba(255, 255, 255, 0.94)",
                      bodyColor: "rgba(255, 255, 255, 0.78)",
                      padding: 10,
                      callbacks: {
                        label: (context) => {
                          const datasetId = String(context.dataset?.id || "");
                          const label = String(context.dataset?.label || "Usage");
                          const value = Math.max(0, Number(context.parsed?.y || 0));
                          const runCount = Math.max(0, Number(countValuesById[datasetId]?.[context.dataIndex] || 0));
                          const runSuffix = runCount === 1 ? "1 run" : runCount + " runs";
                          if (usesComputeTokenValues) {
                            return label + ": " + formatSettingsComputeTokens(value) + " · " + runSuffix;
                          }
                          return label + ": " + Math.round(value).toLocaleString("en-US") + " " + (Math.round(value) === 1 ? "run" : "runs");
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      stacked: true,
                      grid: { display: false, drawBorder: false },
                      border: { display: false },
                      ticks: {
                        color: "rgba(255, 255, 255, 0.4)",
                        font: {
                          size: 10,
                          weight: "400",
                          family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        padding: 10,
                        callback: (_value, index) => visibleLabelIndexes.has(index) ? String(normalizedLabels[index] || "") : "",
                      },
                    },
                    y: {
                      stacked: true,
                      min: 0,
                      grid: {
                        color: "rgba(255,255,255,0.10)",
                        drawTicks: false,
                      },
                      border: { display: false },
                      ticks: {
                        color: "rgba(255, 255, 255, 0.4)",
                        padding: 8,
                        maxTicksLimit: 5,
                        font: {
                          size: 10,
                          weight: "400",
                          family: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                        },
                        callback: (value) => usesComputeTokenValues
                          ? formatSettingsComputeTokens(value)
                          : Math.round(Number(value || 0)).toLocaleString("en-US"),
                      },
                    },
                  },
                };
  
                if (chartRef.current) {
                  chartRef.current.data = chartData;
                  chartRef.current.options = chartOptions;
                  chartRef.current.update("none");
                  return undefined;
                }
  
                chartRef.current = new Chart(canvas, {
                  type: "bar",
                  data: chartData,
                  options: chartOptions,
                });
                return undefined;
              }, [chartSignature, hasUsageData]);
  
              return React.createElement("div", { className: "playground-project-overview-progress-combo-chart-frame playground-agents-home-chartjs-frame" },
                isLoading
                  ? React.createElement("div", {
                      className: "playground-overview-chart-loading",
                      style: { position: "static", inset: "auto", height: "100%" },
                      "aria-label": "Loading chart data",
                    },
                    React.createElement(Loader2, { className: "playground-overview-chart-loading-icon", strokeWidth: 1.8 })
                  )
                  : (!normalizedLabels.length || !normalizedSeries.length || !hasUsageData)
                    ? (emptyContent || React.createElement("div", { className: "playground-settings-usage-chart-empty" }, emptyText || "No usage data yet"))
                    : React.createElement("canvas", {
                        ref: canvasRef,
                        className: "playground-project-overview-progress-combo-canvas playground-agents-home-chartjs-canvas",
                        role: "img",
                        "aria-label": ariaLabel || "Agent and team activity over time",
                      })
              );
            }
  
            const renderAgentsHomeUsageChart = ({ ariaLabel, labels, singleValues, teamValues, singleCountValues, teamCountValues, emptyText, emptyContent, usesComputeTokenValues }) =>
              React.createElement(PlaygroundAgentsHomeStackedUsageChart, {
                ariaLabel: ariaLabel || "Overall agent activity",
                labels,
                series: [
                  {
                    id: "agents",
                    label: "Agents",
                    color: "rgb(143,196,255)",
                    values: singleValues,
                  },
                  {
                    id: "teams",
                    label: "Squads",
                    color: "rgb(103,80,255)",
                    values: teamValues,
                  },
                ],
                countSeries: [
                  {
                    id: "agents",
                    values: singleCountValues,
                  },
                  {
                    id: "teams",
                    values: teamCountValues,
                  },
                ],
                emptyText: emptyText || "No activity data yet",
                emptyContent,
                title: "Daily cost by Agent Type",
                isLoading: agentsHomeThreadsLoading,
                usesComputeTokenValues,
                timescaleControl: React.createElement("div", { className: "playground-environments-home-comparison-timescale" },
                  React.createElement("select", {
                    className: "playground-environments-home-comparison-timescale-select",
                    value: agentsHomeChartTimescale,
                    onChange: (event) => setAgentsHomeChartTimescale(String(event.target.value || "month")),
                  },
                    React.createElement("option", { value: "day" }, "Daily"),
                    React.createElement("option", { value: "week" }, "Weekly"),
                    React.createElement("option", { value: "month" }, "Monthly")
                  )
                ),
              });
  
            const isDevelopConfigureAgentsHome = embeddedInResources;
            const agentsHomeTimescaleOptions = [
              { id: "day", label: "1D" },
              { id: "week", label: "1W" },
              { id: "month", label: "1M" },
            ];
            const activeAgentsHomeTimescaleId = agentsHomeTimescaleOptions.some((option) => option.id === agentsHomeChartTimescale)
              ? agentsHomeChartTimescale
              : "month";
            const agentsHomeTimescaleControl = React.createElement("div", { className: "playground-project-overview-progress-combo-ranges", role: "group", "aria-label": "Agent analytics time frame" },
              agentsHomeTimescaleOptions.map((option) =>
                React.createElement("button", {
                  key: option.id,
                  type: "button",
                  className: "playground-project-overview-progress-combo-range" + (activeAgentsHomeTimescaleId === option.id ? " is-active" : ""),
                  onClick: () => setAgentsHomeChartTimescale(option.id),
                  "aria-pressed": activeAgentsHomeTimescaleId === option.id ? "true" : "false",
                }, option.label)
              )
            );
            const agentsHomeAnalyticsOptions = isDevelopConfigureAgentsHome
              ? React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-develop-server-metrics-menu-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-content-menu-button",
                    "aria-label": "Analytics options",
                    "aria-expanded": agentsAnalyticsMenuOpen ? "true" : "false",
                    onClick: () => setAgentsAnalyticsMenuOpen((current) => !current),
                  }, React.createElement(Ellipsis, { className: "playground-content-menu-icon", strokeWidth: 1.75 })),
                  agentsAnalyticsMenuOpen
                    ? React.createElement(PlatformPopupSurface, {
                        className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in",
                      },
                        React.createElement("button", {
                          type: "button",
                          className: "tb-popup-row",
                          onClick: () => {
                            setAgentsAnalyticsMenuOpen(false);
                            if (typeof onOpenSettingsUsage === "function") {
                              onOpenSettingsUsage();
                            }
                          },
                        },
                          React.createElement(ChartNoAxesColumnIncreasing, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                            React.createElement("span", null, "Show Usage")
                          )
                        )
                      )
                    : null
                )
              : null;
  
            const agentsHomeHero = React.createElement("section", {
                className: "playground-environments-home-hero" + (isDevelopConfigureAgentsHome ? " playground-develop-server-kind-hero playground-agents-configure-hero" : ""),
              },
              isDevelopConfigureAgentsHome
                ? React.createElement("div", { className: "playground-project-overview-summary-title-row playground-develop-header playground-develop-server-kind-header" },
                    React.createElement("h1", { className: "playground-project-overview-summary-title playground-develop-title" }, "Agents"),
                    React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-develop-header-actions" },
                      agentsHomeTimescaleControl,
                      agentsHomeAnalyticsOptions
                    )
                  )
                : React.createElement("div", { className: "playground-environments-home-hero-title" }, "Build and run your AI workforce."),
              React.createElement(React.Fragment, null,
                React.createElement("div", {
                  className: "playground-environments-home-metrics" + (isDevelopConfigureAgentsHome ? " playground-develop-server-metrics playground-develop-server-kind-metrics" : ""),
                },
                  React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-agents-detail-progress-combo-card playground-evaluations-analytics-card playground-agents-overview-analytics-card" },
                    React.createElement("div", { className: "playground-project-overview-progress-combo-metrics" },
                      agentsHomeKpis.map((item) =>
                        React.createElement("div", { key: item.id, className: "playground-project-overview-progress-combo-metric" },
                          React.createElement("div", { className: "playground-project-overview-progress-combo-metric-label" },
                            React.createElement("span", { className: "playground-project-overview-progress-combo-metric-dot is-" + item.id, "aria-hidden": "true" }),
                            React.createElement("span", null, item.label)
                          ),
                          React.createElement("div", { className: "playground-project-overview-progress-combo-metric-value" }, item.value)
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
                      renderAgentsHomeUsageChart({
                        ariaLabel: "Agent and team activity over time",
                        labels: activityBuckets.map((bucket) => String(bucket?.label || "")),
                        singleValues: agentsHomeHasCostActivity ? singleAgentCostActivity : singleAgentActivity,
                        teamValues: agentsHomeHasCostActivity ? teamAgentCostActivity : teamActivity,
                        singleCountValues: singleAgentActivity,
                        teamCountValues: teamActivity,
                        usesComputeTokenValues: agentsHomeHasCostActivity,
                        emptyText: agentsHomeThreadsLoading ? "Loading activity..." : (agentsHomeThreadsError || "No activity data yet"),
                        emptyContent: isDevelopConfigureAgentsHome
                          ? renderAgentsConfigureUsageEmptyState(
                              "no-agent-usage.avif",
                              "No Agent Usage yet",
                              "Agent usage appears here once agents start running and consuming credits."
                            )
                          : null,
                      })
                    )
                  )
                ),
                overviewListContent
              )
            );
  
            return React.createElement("div", { className: "playground-environments-detail-scroll playground-environments-home-scroll" },
              React.createElement("div", { className: "playground-environments-home-content" },
                agentsHomeHero
              )
            );
          }
  
