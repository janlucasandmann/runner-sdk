                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load environment files.");
                }
                if (controller.signal.aborted) {
                  return;
                }
                setSkillEnvironmentFilePickerInventory(normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data));
                setSkillEnvironmentFilePickerState({
                  status: "ready",
                  error: "",
                });
              })
              .catch((error) => {
                if (controller.signal.aborted) {
                  return;
                }
                setSkillEnvironmentFilePickerInventory([]);
                setSkillEnvironmentFilePickerState({
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to load environment files.",
                });
              });
  
            return () => controller.abort();
          }, [backendUrl, requestHeaders, selectedSkillEnvironment?.id, skillEnvironmentFilePickerOpen]);
  
          function toggleToolbarPopover(nextValue) {
            setToolbarPopover((current) => current === nextValue ? "" : nextValue);
          }
  
  	        function openSkillComposer() {
  	          setToolbarPopover("");
  	          setSkillListActionMenuState(null);
  	          setSkillListMode("custom");
            setSkillsPageMode("overview");
            setSkillComposerDraft(buildPlaygroundDefaultSkillComposerDraft());
            setSkillComposerSaveState({
              isSaving: false,
              error: "",
            });
            setSkillCodeFilesTransferState({
              isProcessing: false,
              error: "",
            });
            setIsSkillComposerDescriptionEditing(false);
            setSkillComposerIconPickerOpen(false);
            setIsSkillComposerCodeDragging(false);
            setSkillEnvironmentFilePickerOpen(false);
            setSkillEnvironmentPopoverOpen(false);
            setSkillEnvironmentFilePickerSelectedPaths([]);
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerTarget("detail");
            setSkillComposerOpen(true);
          }
  
          function closeSkillComposer() {
            if (skillComposerSaveState.isSaving) {
              return;
            }
            setSkillComposerOpen(false);
            setSkillComposerDraft(buildPlaygroundDefaultSkillComposerDraft());
            setSkillComposerSaveState({
              isSaving: false,
              error: "",
            });
            setSkillCodeFilesTransferState({
              isProcessing: false,
              error: "",
            });
            setIsSkillComposerDescriptionEditing(false);
            setSkillComposerIconPickerOpen(false);
            setIsSkillComposerCodeDragging(false);
            setSkillEnvironmentFilePickerOpen(false);
            setSkillEnvironmentPopoverOpen(false);
            setSkillEnvironmentFilePickerSelectedPaths([]);
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerTarget("detail");
          }
  
          function updateSkillComposerField(field, value) {
            setSkillComposerDraft((current) => ({
              ...current,
              [field]: value,
            }));
            setSkillComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
  	        function handleSkillSelect(skillId) {
  	          setToolbarPopover("");
  	          setSkillListActionMenuState(null);
  	          setSelectedSkillId(PLAYGROUND_RUNNER_SKILL_ID_ALIASES[String(skillId || "").trim()] || String(skillId || "").trim());
            setSkillsPageMode("detail");
          }
  
          function handleSkillListModeChange(nextMode) {
            const normalizedMode = nextMode === "custom" ? "custom" : "system";
            setSkillListMode(normalizedMode);
  	          setToolbarPopover("");
  	          setSkillListActionMenuState(null);
  	        }
  
          function handleBackToSkillsOverview() {
            setToolbarPopover("");
  	          setSkillActionsPopoverOpen(false);
  	          setSkillDetailIconPickerOpen(false);
  	          setSkillsPageMode("overview");
          }
  
          function closeSkillListActionMenu() {
            setSkillListActionMenuState(null);
          }
  
  	        function getSkillListContextMenuPosition(event, menuHeight = 150) {
  	          const menuWidth = 220;
  	          const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
  	          const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
  	          const gutter = 12;
  	          const maxLeft = Math.max(gutter, viewportWidth - menuWidth - gutter);
  	          const maxTop = Math.max(gutter, viewportHeight - menuHeight - gutter);
  	          return {
  	            top: Math.max(gutter, Math.min(maxTop, Number(event?.clientY || 0))),
  	            left: Math.max(gutter, Math.min(maxLeft, Number(event?.clientX || 0))),
  	          };
  	        }
  
  	        function getSkillListActionMenuStyle(menuState) {
  	          const menuStyle = {
  	            position: "fixed",
  	            top: Number(menuState?.top || 0) + "px",
  	          };
  	          if (Number.isFinite(menuState?.right)) {
  	            menuStyle.right = Number(menuState.right) + "px";
  	            menuStyle.left = "auto";
  	          } else {
  	            menuStyle.left = Number(menuState?.left || 0) + "px";
  	            menuStyle.right = "auto";
  	          }
  	          return menuStyle;
  	        }
  
  	        function openSkillListActionMenu(event, skill, options = {}) {
  	          if (!skill?.id) {
  	            return;
  	          }
  	          event.preventDefault();
  	          event.stopPropagation();
  	          const menuHeight = skill.isCustom ? 180 : 64;
  	          const position = options?.context
  	            ? getSkillListContextMenuPosition(event, menuHeight)
  	            : getSideActionMenuPosition(event, menuHeight, 220);
  	          setSkillListActionMenuState((current) =>
  	            current?.skillId === skill.id && !options?.context
  	              ? null
  	              : {
  	                  skillId: skill.id,
  	                  skill,
  	                  ...position,
  	                }
  	          );
  	        }
  
          function getPlaygroundSkillIconComponent(skill) {
            const normalizedCustomIcon = String(skill?.icon || "default").trim().toLowerCase();
            const systemSkillFamilyId = String(
              skill?.systemFamilyId
              || getPlaygroundSkillFamilyId(skill?.id)
              || skill?.id
              || ""
            ).trim().toLowerCase();
            if (skill?.isCustom) {
              if (normalizedCustomIcon === "sparkles") return Sparkles;
              if (normalizedCustomIcon === "brain") return Brain;
              if (normalizedCustomIcon === "zap") return Zap;
              if (normalizedCustomIcon === "telescope" || normalizedCustomIcon === "research") return Telescope;
              if (normalizedCustomIcon === "search" || normalizedCustomIcon === "globe") return Globe;
              if (normalizedCustomIcon === "image") return ImageIcon;
              if (normalizedCustomIcon === "code") return Code;
              if (normalizedCustomIcon === "terminal") return Terminal;
              if (normalizedCustomIcon === "file-text") return FileText;
              if (normalizedCustomIcon === "database") return Database;
              if (normalizedCustomIcon === "pen-tool") return PenTool;
              if (normalizedCustomIcon === "palette") return Paintbrush;
              if (normalizedCustomIcon === "slash") return Slash;
              if (normalizedCustomIcon === "message") return MessageSquare;
              if (normalizedCustomIcon === "mail") return Mail;
              if (normalizedCustomIcon === "calendar") return CalendarIcon;
              if (normalizedCustomIcon === "calculator") return Calculator;
              if (normalizedCustomIcon === "shield" || normalizedCustomIcon === "lock") return Shield;
              if (normalizedCustomIcon === "cloud") return Cloud;
              if (normalizedCustomIcon === "server") return Server;
              if (normalizedCustomIcon === "cpu") return Cpu;
              if (normalizedCustomIcon === "git") return GitCommitHorizontal;
              if (normalizedCustomIcon === "package") return Package;
              if (normalizedCustomIcon === "list") return ListTodo;
              return Wand2;
            }
            if (systemSkillFamilyId === "browser") return Globe;
            if (systemSkillFamilyId === "image_generation") return ImageIcon;
            if (systemSkillFamilyId === "video_generation") return Film;
            if (systemSkillFamilyId === "web_search") return Search;
            if (systemSkillFamilyId === "research" || systemSkillFamilyId === "deep_research") return Telescope;
            if (systemSkillFamilyId === "pdf") return FileText;
            if (systemSkillFamilyId === "frontend_design") return Slash;
            if (systemSkillFamilyId === "pptx") return Layers;
            if (systemSkillFamilyId === "memory") return Brain;
            if (systemSkillFamilyId === "task_management") return ListTodo;
            if (systemSkillFamilyId === "app_platform") return Server;
            if (systemSkillFamilyId === "computer_agents") return Cpu;
            if (systemSkillFamilyId === "email") return Mail;
            return Layers;
          }
  
          function renderSkillIcon(skill, className) {
            const systemSkillFamilyId = String(
              skill?.systemFamilyId
              || getPlaygroundSkillFamilyId(skill?.id)
              || skill?.id
              || ""
            ).trim().toLowerCase();
            if (systemSkillFamilyId === "computer_agents") {
              return React.createElement("img", {
                src: COMPUTER_AGENTS_CREATOR_PROFILE_URL,
                alt: "",
                "aria-hidden": "true",
                draggable: false,
                className,
                style: { objectFit: "cover", borderRadius: "50%" },
              });
            }
            const Icon = getPlaygroundSkillIconComponent(skill);
            return React.createElement(Icon, { className, strokeWidth: 1.8 });
          }
  
          function renderSkillFactRow(label, value) {
            return React.createElement("div", { className: "playground-tasks-detail-fact", key: label },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                React.createElement("div", { className: "playground-environments-editor-fact-value" }, value)
              )
            );
          }
  
          function getSkillDeepResearchModelMeta(modelId) {
            return PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.find((option) => option.id === modelId)
              || PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS[0];
          }
  
          function getSkillImageGenerationModelMeta(modelId) {
            return getPlaygroundImageGenerationModelMeta(modelId);
          }
  
          function getSkillImageGenerationQualityMeta(qualityId) {
            return getPlaygroundImageGenerationQualityMeta(qualityId);
          }
  
          function getSkillVideoGenerationModelMeta(modelId) {
            return getPlaygroundVideoGenerationModelMeta(modelId);
          }
  
          function getSkillImageGenerationCostLabel(modelId, qualityId) {
            const computeTokens = getPlaygroundImageGenerationComputeTokensPerImage(modelId, qualityId);
            return formatSettingsComputeTokens(computeTokens) + " / image";
          }
  
          function renderSkillPopoverMenu(anchorRef, popoverRef, content) {
            if (!content) {
              return null;
            }
            if (typeof document === "undefined" || !document.body) {
              return content;
            }
            const anchorElement = anchorRef?.current;
            if (!anchorElement || typeof anchorElement.getBoundingClientRect !== "function") {
              return content;
            }
            const rect = anchorElement.getBoundingClientRect();
            const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
            const menuWidth = Math.min(320, Math.max(240, rect.width || 280));
            const left = Math.max(20, Math.min(viewportWidth - menuWidth - 20, rect.right - menuWidth));
            const top = rect.bottom + 8;
            return createPortal(
              React.createElement("div", {
                  ref: popoverRef,
                  className: "playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal",
                  style: { top: top + "px", left: left + "px" },
                },
                content
              ),
              document.body
            );
          }
  
          function updateSkillDeepResearchDefaultModel(nextModelId) {
            const normalizedModelId = getSkillDeepResearchModelMeta(nextModelId)?.id || PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS[0].id;
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                deepResearchModel: normalizedModelId,
              },
            });
            setSkillDeepResearchDefaultModel(normalizedModelId);
            setSkillDeepResearchModelPopoverOpen(false);
          }
  
          function updateSkillImageGenerationDefaultModel(nextModelId) {
            const normalizedModelId = getSkillImageGenerationModelMeta(nextModelId)?.id || PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS[0].id;
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                imageGenerationModel: normalizedModelId,
              },
            });
            setSkillImageGenerationDefaultModel(normalizedModelId);
            setSkillImageGenerationModelPopoverOpen(false);
          }
  
          function updateSkillImageGenerationDefaultQuality(nextQualityId) {
            const normalizedQualityId = getSkillImageGenerationQualityMeta(nextQualityId)?.id || "medium";
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                imageGenerationQuality: normalizedQualityId,
              },
            });
            setSkillImageGenerationDefaultQuality(normalizedQualityId);
            setSkillImageGenerationQualityPopoverOpen(false);
          }
  
          function updateSkillVideoGenerationDefaultModel(nextModelId) {
            const normalizedModelId = getSkillVideoGenerationModelMeta(nextModelId)?.id || PLAYGROUND_SKILL_VIDEO_MODEL_OPTIONS[0].id;
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                videoGenerationModel: normalizedModelId,
              },
            });
            setSkillVideoGenerationDefaultModel(normalizedModelId);
            setSkillVideoGenerationModelPopoverOpen(false);
          }
  
          function buildPlaygroundSkillCodeFileRecord(name, content, language = "") {
            const normalizedName = String(name || "").trim();
            return {
              id: "code-file-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
              name: normalizedName,
              content: typeof content === "string" ? content : "",
              language: language || getPlaygroundCodeEditorLanguage({ path: normalizedName, isDirectory: false, mimeType: "" }) || "plaintext",
            };
          }
  
          function mergePlaygroundSkillCodeFiles(currentCodeFiles, nextCodeFiles) {
            const mergedByName = new Map();
            normalizeSkillCodeFiles(currentCodeFiles).forEach((file) => {
              mergedByName.set(normalizeHistoryPath(file.name).toLowerCase(), file);
            });
            normalizeSkillCodeFiles(nextCodeFiles).forEach((file) => {
              mergedByName.set(normalizeHistoryPath(file.name).toLowerCase(), file);
            });
            return Array.from(mergedByName.values()).sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
          }
  
          function applySkillComposerDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            updateSkillComposerField("description", nextValue);
            window.requestAnimationFrame(() => {
              const textarea = skillComposerDescriptionTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeSkillTextarea(textarea);
            });
          }
  
          function handleSkillComposerDescriptionFormat(formatType) {
            const textarea = skillComposerDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const currentValue = String(skillComposerDraft.description || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : currentValue.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
            if (formatType === "bold") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildSkillMarkdownListEdit(currentValue, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applySkillComposerDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function updateLoadedSkillRecord(skillId, nextSkill) {
            setLoadedSkills((current) => {
              let replaced = false;
              const next = current.map((skill) => {
                if (skill.id !== skillId) {
                  return skill;
                }
                replaced = true;
                return nextSkill;
              });
              return replaced ? next : next.concat(nextSkill);
            });
          }
  
          async function handleSkillComposerSubmit(event) {
            event.preventDefault();
            const nextName = String(skillComposerDraft.name || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setSkillComposerSaveState({
                isSaving: false,
                error: "Skill name cannot be empty.",
              });
              return;
            }
  
            if (!baseSkillProjectId) {
              setSkillComposerSaveState({
                isSaving: false,
                error: "Project scope is unavailable for skill creation.",
              });
              return;
            }
  
            setSkillComposerSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(baseSkillProjectId) + "/skills",
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                    ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                  },
                  body: JSON.stringify({
                    name: nextName,
                    description: String(skillComposerDraft.description || ""),
                    markdown: computePlaygroundSkillMarkdownFromSections(nextName, {
                      usage: "Describe when this skill should be invoked...",
                      process: "1. Step one\n2. Step two",
                      outputFormat: "Describe what this skill should return...",
                      configuration: "Add configuration notes here...",
                      examplePrompts: "- Example prompt",
                    }),
                    codeFiles: normalizeSkillCodeFiles(skillComposerDraft.codeFiles).map((file) => ({
                      id: file.id,
                      name: file.name,
                      content: file.content,
                      language: file.language,
                    })),
                    icon: getPlaygroundSkillIconId(skillComposerDraft.icon),
                    category: "custom",
                    isActive: true,
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create skill.");
              }
  
              const normalizedCreatedSkill = normalizeSkillRecord(data?.skill || {
                id: data?.id,
                projectId: baseSkillProjectId,
                name: nextName,
                description: String(skillComposerDraft.description || ""),
                category: "custom",
                icon: getPlaygroundSkillIconId(skillComposerDraft.icon),
                codeFiles: normalizeSkillCodeFiles(skillComposerDraft.codeFiles),
                isActive: true,
                isSystem: false,
                isDefault: false,
              });
              if (!normalizedCreatedSkill) {
                throw new Error("Skill creation response was empty.");
              }
  
              setLoadedSkills((current) => [normalizedCreatedSkill, ...current.filter((skill) => skill.id !== normalizedCreatedSkill.id)]);
              setSkillListMode("custom");
              setSelectedSkillId(normalizedCreatedSkill.id);
              setSkillsPageMode("detail");
              setSkillComposerOpen(false);
              setSkillComposerDraft(buildPlaygroundDefaultSkillComposerDraft());
              setSkillComposerSaveState({
                isSaving: false,
                error: "",
              });
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: "",
              });
              setIsSkillComposerDescriptionEditing(false);
              setSkillComposerIconPickerOpen(false);
              setIsSkillComposerCodeDragging(false);
              setSkillEnvironmentFilePickerOpen(false);
              setSkillEnvironmentPopoverOpen(false);
              setSkillEnvironmentFilePickerSelectedPaths([]);
              setSkillEnvironmentFilePickerSearch("");
              setSkillEnvironmentFilePickerTarget("detail");
              void loadSkills({ force: true });
            } catch (error) {
              setSkillComposerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create skill.",
              });
            }
          }
  
          function updateSelectedSkillLocal(updater) {
            if (!selectedSkill?.id) {
              return;
            }
            setLoadedSkills((current) =>
              current.map((skill) => {
                if (skill.id !== selectedSkill.id) {
                  return skill;
                }
                return typeof updater === "function" ? updater(skill) : updater;
              })
            );
            setSkillSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function closeSkillRenameDialog() {
            setSkillRenameState(null);
            setSkillRenameValue("");
            setSkillRenameError("");
          }
  
          function openSkillRenameDialog(targetSkill = selectedSkill) {
            if (!targetSkill?.id || !targetSkill.isCustom) {
              return;
            }
            setSelectedSkillId(targetSkill.id);
            closeSkillListActionMenu();
            setSkillActionsPopoverOpen(false);
            setSkillRenameState({
              skillId: targetSkill.id,
              originalName: String(targetSkill.name || "").trim(),
            });
            setSkillRenameValue(String(targetSkill.name || ""));
            setSkillRenameError("");
          }
  
          function closeSkillEditDialog() {
            setSkillEditState(null);
            setSkillEditTitleValue("");
            setSkillEditDescriptionValue("");
            setSkillEditError("");
          }
  
          function openSkillEditDialog(targetSkill = selectedSkill) {
            if (!targetSkill?.id || !targetSkill.isCustom) {
              return;
            }
            setSelectedSkillId(targetSkill.id);
            closeSkillListActionMenu();
            setSkillActionsPopoverOpen(false);
            setSkillEditState({
              skillId: targetSkill.id,
              originalName: String(targetSkill.name || "").trim(),
              originalDescription: String(targetSkill.description || ""),
            });
            setSkillEditTitleValue(String(targetSkill.name || ""));
            setSkillEditDescriptionValue(String(targetSkill.description || ""));
            setSkillEditError("");
          }
  
          async function patchSelectedSkillFields(partial) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              throw new Error("Only custom skills can be updated.");
            }
  
            const response = await fetch(
              "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/" + encodeURIComponent(selectedSkill.id),
              {
                method: "PATCH",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                  ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                },
                body: JSON.stringify(partial),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to save skill.");
            }
            const normalizedUpdatedSkill = normalizeSkillRecord(data?.skill || {
              ...selectedSkill,
              ...partial,
            });
            if (normalizedUpdatedSkill) {
              updateLoadedSkillRecord(selectedSkill.id, normalizedUpdatedSkill);
            }
            return normalizedUpdatedSkill;
          }
  
          async function saveSelectedSkillFields(partial) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return;
            }
  
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              await patchSelectedSkillFields(partial);
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            } catch (error) {
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save skill.",
              });
            }
          }
  
          function handleSelectedSkillTitleCommit() {
            if (!selectedSkill?.isCustom) {
              return;
            }
            const currentName = String(selectedSkill.name || "").trim();
            const nextName = String(skillTitleDraft || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setSkillTitleDraft(currentName);
              return;
            }
            if (nextName === currentName) {
              setSkillTitleDraft(nextName);
              return;
            }
            updateSelectedSkillLocal((current) => ({
              ...current,
              name: nextName,
            }));
            void saveSelectedSkillFields({
              name: nextName,
            });
          }
  
          function handleSelectedSkillIconChange(iconId) {
            if (!selectedSkill?.isCustom) {
              return;
            }
            const normalizedIconId = getPlaygroundSkillIconId(iconId);
            updateSelectedSkillLocal((current) => ({
              ...current,
              icon: normalizedIconId,
            }));
            setSkillDetailIconPickerOpen(false);
            void saveSelectedSkillFields({
              icon: normalizedIconId,
            });
          }
  
          async function handleSkillRenameSubmit(event) {
            event.preventDefault();
            if (!skillRenameState?.skillId || !selectedSkill?.isCustom) {
              return;
            }
  
            const nextName = String(skillRenameValue || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setSkillRenameError("Skill name cannot be empty.");
              return;
            }
  
            if (nextName === skillRenameState.originalName) {
              closeSkillRenameDialog();
              return;
            }
  
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
            setSkillRenameError("");
  
            try {
              await patchSelectedSkillFields({
                name: nextName,
              });
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
              closeSkillRenameDialog();
            } catch (error) {
              setSkillRenameError(error instanceof Error ? error.message : "Failed to rename skill.");
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            }
          }
  
          async function handleSkillEditSubmit(event) {
            event.preventDefault();
            if (!skillEditState?.skillId || !selectedSkill?.isCustom) {
              return;
            }
  
            const nextName = String(skillEditTitleValue || "").trim().replace(/\s+/g, " ");
            const nextDescription = String(skillEditDescriptionValue || "");
            if (!nextName) {
              setSkillEditError("Skill title cannot be empty.");
              return;
            }
  
            if (
              nextName === skillEditState.originalName
              && nextDescription === skillEditState.originalDescription
            ) {
              closeSkillEditDialog();
              return;
            }
  
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
            setSkillEditError("");
  
            try {
              await patchSelectedSkillFields({
                name: nextName,
                description: nextDescription,
              });
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
              closeSkillEditDialog();
            } catch (error) {
              setSkillEditError(error instanceof Error ? error.message : "Failed to save skill.");
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            }
          }
  
          async function handleDeleteSelectedSkill(targetSkill = selectedSkill) {
            if (!targetSkill?.id || !targetSkill.isCustom) {
              return;
            }
            setSelectedSkillId(targetSkill.id);
            closeSkillListActionMenu();
            if (!window.confirm("Delete this skill?")) {
              return;
            }
  
            const deletingSkillId = targetSkill.id;
            const nextSelectedCustomSkillId = normalizedCustomSkills.find((skill) => skill.id !== deletingSkillId)?.id || "";
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/" + encodeURIComponent(deletingSkillId),
                {
                  method: "DELETE",
                  credentials: "include",
                  headers: {
                    ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                    ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                  },
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete skill.");
              }
  
              setLoadedSkills((current) => current.filter((skill) => skill.id !== deletingSkillId));
              setSelectedSkillId(nextSelectedCustomSkillId);
              if (!nextSelectedCustomSkillId) {
                setSkillsPageMode("overview");
              }
              setSkillActionsPopoverOpen(false);
              closeSkillRenameDialog();
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            } catch (error) {
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete skill.",
              });
            }
          }
  
          function getSkillTextareaRef(sectionId) {
            if (sectionId === "description") return skillDescriptionTextareaRef;
            if (sectionId === "usage") return skillUsageTextareaRef;
            if (sectionId === "process") return skillProcessTextareaRef;
            if (sectionId === "outputFormat") return skillOutputTextareaRef;
            if (sectionId === "configuration") return skillConfigurationTextareaRef;
            return skillExamplesTextareaRef;
          }
  
          function applySkillMarkdownSelection(sectionId, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            const textareaRef = getSkillTextareaRef(sectionId);
            if (sectionId === "description") {
              updateSelectedSkillLocal((current) => ({
                ...current,
                description: nextValue,
              }));
            } else {
              updateSelectedSkillLocal((current) => {
                const currentSections = parsePlaygroundSkillMarkdownSections(current?.markdown || "");
                const nextSections = {
                  ...currentSections,
                  [sectionId]: nextValue,
                };
                return {
                  ...current,
                  markdown: computePlaygroundSkillMarkdownFromSections(current?.name || "Skill", nextSections),
                };
              });
            }
  
            window.requestAnimationFrame(() => {
              const textarea = textareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeSkillTextarea(textarea);
            });
          }
  
          function buildWrappedSkillMarkdownEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            if (safeStart !== safeEnd) {
              if (
                selectedText.startsWith(prefix)
                && selectedText.endsWith(suffix)
                && selectedText.length >= prefix.length + suffix.length
              ) {
                const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
                return {
                  value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
                  selectionStart: safeStart,
                  selectionEnd: safeStart + unwrappedText.length,
                };
              }
  
              const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
              const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
              if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
                return {
                  value: value.slice(0, safeStart - prefix.length) + selectedText + value.slice(safeEnd + suffix.length),
                  selectionStart: safeStart - prefix.length,
                  selectionEnd: safeStart - prefix.length + selectedText.length,
                };
              }
  
              const wrappedText = prefix + selectedText + suffix;
              return {
                value: value.slice(0, safeStart) + wrappedText + value.slice(safeEnd),
                selectionStart: safeStart + prefix.length,
                selectionEnd: safeStart + prefix.length + selectedText.length,
              };
            }
  
            const insertedText = prefix + suffix;
            return {
              value: value.slice(0, safeStart) + insertedText + value.slice(safeEnd),
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length,
            };
          }
  
          function buildSkillMarkdownListEdit(value, selectionStart, selectionEnd) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
            let lineEnd = value.indexOf("\n", safeEnd);
            if (lineEnd === -1) {
              lineEnd = value.length;
            }
            const block = value.slice(lineStart, lineEnd);
            const lines = block.split("\n");
            const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
            const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^(\s*)-\s+/.test(line));
            const nextLines = lines.map((line) => {
              if (!line.trim()) {
                return shouldRemoveList ? line : "- ";
              }
              if (shouldRemoveList) {
                return line.replace(/^(\s*)-\s+/, "$1");
              }
              if (/^(\s*)-\s+/.test(line)) {
                return line;
              }
              return line.replace(/^(\s*)/, "$1- ");
            });
            const nextBlock = nextLines.join("\n");
            const collapsedSelection = safeStart === safeEnd;
            const nextCaretOffset = shouldRemoveList
              ? Math.max(0, safeStart - lineStart - 2)
              : safeStart - lineStart + 2;
            return {
              value: value.slice(0, lineStart) + nextBlock + value.slice(lineEnd),
              selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
              selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
            };
          }
  
          function handleSkillMarkdownFormat(sectionId, formatType) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return;
            }
            const textareaRef = getSkillTextareaRef(sectionId);
            const textarea = textareaRef.current;
            if (!textarea) {
              return;
            }
  
            const currentValue = sectionId === "description"
              ? String(selectedSkill.description || "")
              : String(selectedSkillSections?.[sectionId] || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : currentValue.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
            if (formatType === "bold") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildSkillMarkdownListEdit(currentValue, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            setSkillSectionEditing((current) => ({
              ...current,
              [sectionId]: true,
            }));
            applySkillMarkdownSelection(sectionId, edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          async function saveSelectedSkillCodeFiles(nextCodeFiles) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return false;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/" + encodeURIComponent(selectedSkill.id),
                {
                  method: "PATCH",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                    ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                  },
                  body: JSON.stringify({
                    codeFiles: normalizeSkillCodeFiles(nextCodeFiles).map((file) => ({
                      id: file.id,
                      name: file.name,
                      content: file.content,
                      language: file.language,
                    })),
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save skill code files.");
              }
  
              const normalizedUpdatedSkill = normalizeSkillRecord(data?.skill || {
                ...selectedSkill,
                codeFiles: nextCodeFiles,
              });
              if (normalizedUpdatedSkill) {
                updateLoadedSkillRecord(selectedSkill.id, normalizedUpdatedSkill);
              }
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: "",
              });
              return true;
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to save skill code files.",
              });
              return false;
            }
          }
  
          async function handleSkillCodeFileSelection(fileList) {
            if (!selectedSkill || !selectedSkill.isCustom || !fileList?.length) {
              return;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const nextFiles = await Promise.all(
                Array.from(fileList).map(async (file) => {
                  const content = await file.text();
                  return buildPlaygroundSkillCodeFileRecord(file.name, content);
                })
              );
              const mergedFiles = mergePlaygroundSkillCodeFiles(selectedSkill.codeFiles, nextFiles);
              await saveSelectedSkillCodeFiles(mergedFiles);
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to add code files.",
              });
            }
          }
  
          async function handleSkillComposerCodeFileSelection(fileList) {
            if (!fileList?.length) {
              return;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const nextFiles = await Promise.all(
                Array.from(fileList).map(async (file) => {
                  const content = await file.text();
                  return buildPlaygroundSkillCodeFileRecord(file.name, content);
                })
              );
              setSkillComposerDraft((current) => ({
                ...(current || buildPlaygroundDefaultSkillComposerDraft()),
                codeFiles: mergePlaygroundSkillCodeFiles(current?.codeFiles || [], nextFiles),
              }));
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: "",
              });
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to add code files.",
              });
            }
          }
  
          async function handleSkillCodeFileInputChange(event) {
            try {
              await handleSkillCodeFileSelection(event.target.files);
            } finally {
              if (event.target) {
                event.target.value = "";
              }
            }
          }
  
          async function handleSkillComposerCodeFileInputChange(event) {
            try {
              await handleSkillComposerCodeFileSelection(event.target.files);
            } finally {
              if (event.target) {
                event.target.value = "";
              }
            }
          }
  
          async function handleSkillCodeFileDrop(event) {
            event.preventDefault();
            setIsSkillCodeDragging(false);
            if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing) {
              return;
            }
            await handleSkillCodeFileSelection(event.dataTransfer?.files);
          }
  
          async function handleSkillComposerCodeFileDrop(event) {
            event.preventDefault();
            setIsSkillComposerCodeDragging(false);
            if (skillCodeFilesTransferState.isProcessing) {
              return;
            }
            await handleSkillComposerCodeFileSelection(event.dataTransfer?.files);
          }
  
          async function handleAttachSkillEnvironmentFiles() {
            const isComposerTarget = skillEnvironmentFilePickerTarget === "composer";
            if (!selectedSkillEnvironment?.id || (!isComposerTarget && (!selectedSkill || !selectedSkill.isCustom))) {
              return;
            }
  
            const selectedEntries = skillEnvironmentFilePickerInventory.filter((entry) =>
              !entry.isFolder && skillEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
            );
            if (selectedEntries.length === 0) {
              return;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const nextCodeFiles = await Promise.all(
                selectedEntries.map(async (entry) => {
                  const response = await fetch(
                    buildPlaygroundEnvironmentDownloadUrl(backendUrl, selectedSkillEnvironment.id, entry.path),
                    {
                      method: "GET",
                      headers: requestHeaders,
                    }
                  );
                  if (!response.ok) {
                    const text = await response.text().catch(() => "");
                    throw new Error(text || ("Failed to load " + entry.name));
                  }
                  const content = await response.text();
                  return buildPlaygroundSkillCodeFileRecord(entry.path, content);
                })
              );
              if (isComposerTarget) {
                setSkillComposerDraft((current) => ({
                  ...(current || buildPlaygroundDefaultSkillComposerDraft()),
                  codeFiles: mergePlaygroundSkillCodeFiles(current?.codeFiles || [], nextCodeFiles),
                }));
                setSkillCodeFilesTransferState({
                  isProcessing: false,
                  error: "",
                });
              } else {
                const mergedFiles = mergePlaygroundSkillCodeFiles(selectedSkill.codeFiles, nextCodeFiles);
                await saveSelectedSkillCodeFiles(mergedFiles);
              }
              setSkillEnvironmentFilePickerOpen(false);
              setSkillEnvironmentPopoverOpen(false);
              setSkillEnvironmentFilePickerSelectedPaths([]);
              setSkillEnvironmentFilePickerSearch("");
              setSkillEnvironmentFilePickerTarget("detail");
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to add environment files.",
              });
            }
          }
  
          function handleRemoveSkillCodeFile(codeFileId) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return;
            }
            const nextCodeFiles = normalizeSkillCodeFiles(selectedSkill.codeFiles).filter((file) => file.id !== codeFileId);
            void saveSelectedSkillCodeFiles(nextCodeFiles);
          }
  
          function handleRemoveSkillComposerCodeFile(codeFileId) {
            setSkillComposerDraft((current) => ({
              ...(current || buildPlaygroundDefaultSkillComposerDraft()),
              codeFiles: normalizeSkillCodeFiles(current?.codeFiles).filter((file) => file.id !== codeFileId),
            }));
            setSkillCodeFilesTransferState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function openSkillCodeFilePicker() {
            if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing) {
              return;
            }
            skillCodeFileInputRef.current?.click?.();
          }
  
          function openSkillEnvironmentFilePicker() {
            if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing || availableSkillEnvironments.length === 0) {
              return;
            }
            setSkillEnvironmentFilePickerTarget("detail");
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerOpen(true);
          }
  
          function openSkillComposerEnvironmentFilePicker() {
            if (skillCodeFilesTransferState.isProcessing || availableSkillEnvironments.length === 0) {
              return;
            }
            setSkillEnvironmentFilePickerTarget("composer");
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerOpen(true);
          }
  
          function toggleSkillEnvironmentFileSelection(path) {
            const normalizedPath = normalizeHistoryPath(path);
            setSkillEnvironmentFilePickerSelectedPaths((current) => {
              if (current.includes(normalizedPath)) {
                return current.filter((value) => value !== normalizedPath);
              }
              return current.concat(normalizedPath);
            });
          }
  
          function toggleSkillEnvironmentFileFolder(path) {
            const normalizedPath = normalizeHistoryPath(path);
            setSkillEnvironmentFilePickerExpandedFolders((current) =>
              current.includes(normalizedPath)
                ? current.filter((value) => value !== normalizedPath)
                : current.concat(normalizedPath)
            );
          }
  
          function renderSkillMarkdownSection({ sectionId, title, content, emptyLabel }) {
            const textareaRef = getSkillTextareaRef(sectionId);
            const isEditing = Boolean(skillSectionEditing[sectionId]);
            const canEdit = isSelectedSkillEditable;
  
            return React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description", key: sectionId },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, title),
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
                      disabled: !canEdit,
                      onMouseDown: (event) => event.preventDefault(),
                      onClick: () => handleSkillMarkdownFormat(sectionId, action.id),
                    }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isEditing ? " is-editing" : " is-preview") },
                React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                  String(content || "").trim()
                    ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                        content: content,
                        className: "playground-tasks-detail-description-preview tb-message-markdown",
                      })
                    : React.createElement("div", {
                        className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                      }, emptyLabel)
                ),
                React.createElement("textarea", {
                  ref: textareaRef,
                  className: "playground-tasks-detail-description-input " + (isEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isEditing ? emptyLabel : "",
                  value: content || "",
                  readOnly: !canEdit,
                  onFocus: () => {
                    if (!canEdit) {
                      return;
                    }
                    setSkillSectionEditing((current) => ({
                      ...current,
                      [sectionId]: true,
                    }));
                  },
                  onChange: (event) => {
                    const nextValue = event.target.value;
                    if (sectionId === "description") {
                      updateSelectedSkillLocal((current) => ({
                        ...current,
                        description: nextValue,
                      }));
                    } else {
                      updateSelectedSkillLocal((current) => {
                        const currentSections = parsePlaygroundSkillMarkdownSections(current?.markdown || "");
                        const nextSections = {
                          ...currentSections,
                          [sectionId]: nextValue,
                        };
                        return {
                          ...current,
                          markdown: computePlaygroundSkillMarkdownFromSections(current?.name || "Skill", nextSections),
                        };
                      });
                    }
