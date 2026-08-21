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
  
          function getSkillApiRequestHeaders() {
            return {
              "Content-Type": "application/json",
              ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
              ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
            };
          }

          function createAndOpenCustomSkill() {
            if (skillSaveState.isSaving) return;
            const draftSkill = normalizeSkillRecord({
              id: PLAYGROUND_CUSTOM_SKILL_DRAFT_ID,
              projectId: baseSkillProjectId || "__runner_playground__",
              name: "",
              description: "",
              markdown: "",
              codeFiles: [{
                id: "skill-md",
                name: "SKILL.md",
                content: "",
                language: "markdown",
              }],
              icon: "code",
              category: "custom",
              isActive: true,
              isDraft: true,
            });
            setLoadedSkills((current) => [
              draftSkill,
              ...current.filter((skill) => skill.id !== PLAYGROUND_CUSTOM_SKILL_DRAFT_ID),
            ]);
            setSkillListMode("custom");
            setSkillOverviewScope("created");
            setSelectedSkillId(PLAYGROUND_CUSTOM_SKILL_DRAFT_ID);
            setSkillTitleDraft("");
            setSkillDetailTab("code");
            setSkillSaveState({ isSaving: false, error: "" });
            setSkillsPageMode("detail");
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
	          if (selectedSkill?.isDraft) {
	            setLoadedSkills((current) =>
	              current.filter((skill) => skill.id !== PLAYGROUND_CUSTOM_SKILL_DRAFT_ID)
	            );
	            setSelectedSkillId("");
	          }
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
            const customEmoji = String(skill?.icon || "").trim().startsWith("emoji:")
              ? String(skill.icon).trim().slice("emoji:".length).trim()
              : "";
            if (customEmoji) {
              return React.createElement("span", {
                className: className + " playground-skill-emoji-icon",
                "aria-hidden": "true",
              }, customEmoji);
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

          function getSelectedSkillVersion(targetSkill = selectedSkill) {
            if (
              !targetSkill?.id
              || String(skillVersionState.skillId || "").trim() !== String(targetSkill.id || "").trim()
            ) {
              return null;
            }
            const selectedVersionId = String(
              skillVersionState.currentVersionId
              || targetSkill?.currentVersionId
              || ""
            ).trim();
            return skillVersionState.versions.find((version) =>
              String(version?.id || "").trim() === selectedVersionId
            ) || skillVersionState.versions[0] || null;
          }

          function buildCurrentSkillVersionSnapshot(targetSkill = selectedSkill) {
            const currentFiles = normalizeSkillCodeFiles(targetSkill?.codeFiles);
            const activeFile = currentFiles.find((file) =>
              file.id === skillCodeEditorState.fileId
            );
            const codeFiles = activeFile && skillCodeEditorState.value !== skillCodeEditorState.initialValue
              ? currentFiles.map((file) =>
                  file.id === activeFile.id
                    ? { ...file, content: skillCodeEditorState.value }
                    : file
                )
              : currentFiles;
            const markdownFile = codeFiles.find((file) =>
              normalizeHistoryPath(file.name).toLowerCase() === "skill.md"
            );
            return {
              name: getSelectedSkillSaveName(targetSkill),
              skillDescription: String(targetSkill?.description || ""),
              markdown: markdownFile?.content ?? String(targetSkill?.markdown || ""),
              codeFiles,
              icon: String(targetSkill?.icon || "code"),
              category: String(targetSkill?.category || "custom"),
            };
          }

          function normalizeSkillVersionDiffSnapshot(snapshot = {}) {
            const codeFiles = normalizeSkillCodeFiles(snapshot?.codeFiles);
            const hasMarkdownFile = codeFiles.some((file) =>
              normalizeHistoryPath(file.name).toLowerCase() === "skill.md"
            );
            if (!hasMarkdownFile && typeof snapshot?.markdown === "string") {
              codeFiles.unshift({
                id: "skill-md",
                name: "SKILL.md",
                content: snapshot.markdown,
                language: "markdown",
              });
            }
            return {
              name: String(snapshot?.name || ""),
              skillDescription: String(snapshot?.skillDescription || ""),
              codeFiles,
              icon: String(snapshot?.icon || "code"),
              category: String(snapshot?.category || "custom"),
            };
          }

          function buildSkillVersionSaveDialogData() {
            const selectedVersion = getSelectedSkillVersion();
            const currentSnapshot = buildCurrentSkillVersionSnapshot();
            const latestVersion = skillVersionState.versions.reduce((highest, version) => {
              const parsedVersion = Number(version?.version);
              return Number.isFinite(parsedVersion)
                ? Math.max(highest, parsedVersion)
                : highest;
            }, 0);
            return {
              selectedVersion,
              canSaveCurrent: Boolean(selectedVersion),
              currentVersion: selectedVersion ? Number(selectedVersion.version) : null,
              nextVersion: latestVersion + 1,
              currentDescription: String(selectedVersion?.description || "").trim(),
              currentSnapshot,
              diffFiles: buildSkillVersionDiffFilesFromSnapshots(
                selectedVersion || {},
                currentSnapshot
              ),
            };
          }

          function hasSelectedSkillVersionChanges() {
            if (
              !selectedSkill?.id
              || !selectedSkill.isCustom
              || !getSelectedSkillSaveName()
            ) {
              return false;
            }
            if (selectedSkill.isDraft) {
              return true;
            }
            const selectedSkillVersionBaselineReady = Boolean(
              skillVersionState.status === "ready"
              && String(skillVersionState.skillId || "").trim() === String(selectedSkill.id || "").trim()
              && getSelectedSkillVersion()
            );
            if (!selectedSkillVersionBaselineReady) {
              return false;
            }
            return buildSkillVersionSaveDialogData().diffFiles.length > 0;
          }

          function discardUnsavedSkillVersionChanges() {
            if (!selectedSkill?.id || !selectedSkill.isCustom) return;
            if (selectedSkill.isDraft) {
              setLoadedSkills((current) => current.filter((skill) => (
                skill.id !== PLAYGROUND_CUSTOM_SKILL_DRAFT_ID
              )));
              setSelectedSkillId("");
              setSkillTitleDraft("");
              setSkillCodeEditorState({
                fileId: "",
                value: "",
                initialValue: "",
                isSaving: false,
                error: "",
                message: "",
              });
              return;
            }
            const selectedVersion = getSelectedSkillVersion();
            if (!selectedVersion) return;
            const snapshot = normalizeSkillVersionDiffSnapshot(selectedVersion);
            const codeFiles = normalizeSkillCodeFiles(snapshot.codeFiles);
            const activeFile = codeFiles.find((file) => file.id === skillCodeEditorState.fileId)
              || codeFiles[0]
              || null;
            const markdownFile = codeFiles.find((file) => (
              normalizeHistoryPath(file.name).toLowerCase() === "skill.md"
            ));
            updateSelectedSkillLocal((current) => ({
              ...current,
              name: snapshot.name,
              description: snapshot.skillDescription,
              codeFiles,
              markdown: markdownFile?.content || "",
              icon: snapshot.icon,
              category: snapshot.category,
            }));
            setSkillTitleDraft(snapshot.name);
            setSkillCodeEditorState({
              fileId: activeFile?.id || "",
              value: activeFile?.content || "",
              initialValue: activeFile?.content || "",
              isSaving: false,
              error: "",
              message: "",
            });
            setSkillSaveState({ isSaving: false, error: "" });
          }

          usePlatformVersionNavigationGuard({
            dirty: skillsPageMode === "detail" && hasSelectedSkillVersionChanges(),
            guardId: "skill-details-unsaved-changes",
            resourceId: String(selectedSkill?.id || ""),
            resourceName: String(selectedSkill?.name || skillTitleDraft || "").trim() || "this skill",
            resourceType: "Skill",
            onDiscard: discardUnsavedSkillVersionChanges,
            onNavigationGuardChange,
          });

          function openSkillVersionSaveDialog(options = {}) {
            if (
              !selectedSkill?.id
              || !selectedSkill.isCustom
              || skillSaveState.isSaving
              || skillCodeFilesTransferState.isProcessing
              || skillVersionState.status === "loading"
              || !hasSelectedSkillVersionChanges()
            ) {
              return false;
            }
            setSkillPublishMenuOpen(false);
            setSkillVersionsOpen(false);
            setSkillSaveState((current) => ({
              ...current,
              error: "",
            }));
            setSkillVersionSaveDialog({
              initialMode: options.mode === "current" ? "current" : "new",
              key: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
            return true;
          }

          async function loadSelectedSkillVersions(targetSkill = selectedSkill) {
            if (!targetSkill?.id || !targetSkill.isCustom || targetSkill.isDraft) {
              return [];
            }
            const targetProjectId = String(targetSkill.projectId || selectedSkillProjectId || "").trim();
            setSkillVersionState((current) => ({
              ...current,
              skillId: targetSkill.id,
              status: "loading",
              error: "",
            }));
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(targetProjectId) + "/skills/"
                  + encodeURIComponent(targetSkill.id) + "/versions",
                {
                  method: "GET",
                  credentials: "include",
                  headers: getSkillApiRequestHeaders(),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load skill versions.");
              }
              const versions = Array.isArray(data?.versions) ? data.versions : [];
              setSkillVersionState({
                skillId: targetSkill.id,
                status: "ready",
                error: "",
                versions,
                currentVersionId: String(data?.currentVersionId || targetSkill.currentVersionId || ""),
                publishedVersionId: String(data?.publishedVersionId || targetSkill.publishedVersionId || ""),
              });
              return versions;
            } catch (error) {
              setSkillVersionState((current) => ({
                ...current,
                skillId: targetSkill.id,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load skill versions.",
              }));
              return [];
            }
          }

          async function saveAndPublishSelectedSkillVersion(details = {}) {
            if (!selectedSkill?.id || !selectedSkill.isCustom || skillSaveState.isSaving) {
              return null;
            }
            const skillName = getSelectedSkillSaveName();
            if (!skillName) {
              setSkillSaveState({
                isSaving: false,
                error: "Enter a skill name before saving.",
              });
              return null;
            }
            const versionData = buildSkillVersionSaveDialogData();
            const selectedVersion = versionData.selectedVersion;
            const saveToCurrentVersion = Boolean(
              !selectedSkill.isDraft
              && details.mode === "current"
              && selectedVersion?.id
            );
            const versionDescription = String(details.description || "").trim().slice(0, 240);
            setSkillPublishMenuOpen(false);
            setSkillSaveState({ isSaving: true, error: "" });
            try {
              const currentFiles = normalizeSkillCodeFiles(selectedSkill.codeFiles);
              const activeFile = currentFiles
                .find((file) => file.id === skillCodeEditorState.fileId);
              const nextFiles = activeFile && skillCodeEditorState.value !== skillCodeEditorState.initialValue
                ? currentFiles.map((file) =>
                    file.id === activeFile.id
                      ? { ...file, content: skillCodeEditorState.value }
                      : file
                  )
                : currentFiles;
              if (selectedSkill.isDraft) {
                const markdownFile = nextFiles.find((file) =>
                  normalizeHistoryPath(file.name).toLowerCase() === "skill.md"
                );
                const response = await fetch(
                  "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills",
                  {
                    method: "POST",
                    credentials: "include",
                    headers: getSkillApiRequestHeaders(),
                    body: JSON.stringify({
                      name: skillName,
                      description: String(selectedSkill.description || ""),
                      markdown: markdownFile?.content ?? String(selectedSkill.markdown || ""),
                      codeFiles: nextFiles,
                      icon: selectedSkill.icon || "code",
                      category: selectedSkill.category || "custom",
                      metadata: selectedSkill.metadata || {},
                      permissionSet: selectedSkill.permissionSet || null,
                      accessControl: selectedSkill.accessControl || null,
                      isActive: selectedSkill.isActive !== false,
                      versionDescription,
                    }),
                  }
                );
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to create skill.");
                }
                const createdSkill = normalizeSkillRecord(data?.skill || data);
                if (!createdSkill?.id) {
                  throw new Error("Skill creation response was empty.");
                }
                setLoadedSkills((current) => [
                  createdSkill,
                  ...current.filter((skill) =>
                    skill.id !== PLAYGROUND_CUSTOM_SKILL_DRAFT_ID
                    && skill.id !== createdSkill.id
                  ),
                ]);
                setSelectedSkillId(createdSkill.id);
                setSkillTitleDraft(createdSkill.name);
                setSkillCodeEditorState((current) => ({
                  ...current,
                  initialValue: current.value,
                  isSaving: false,
                  error: "",
                  message: "Published",
                }));
                setSkillSaveState({ isSaving: false, error: "" });
                return createdSkill;
              }
              if (activeFile && skillCodeEditorState.value !== skillCodeEditorState.initialValue) {
                await saveSelectedSkillCodeFiles(nextFiles, { throwOnError: true });
              }
              const versionEndpoint = "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/"
                + encodeURIComponent(selectedSkill.id) + "/versions";
              const response = await fetch(
                saveToCurrentVersion
                  ? versionEndpoint + "/" + encodeURIComponent(selectedVersion.id)
                  : versionEndpoint,
                {
                  method: saveToCurrentVersion ? "PATCH" : "POST",
                  credentials: "include",
                  headers: getSkillApiRequestHeaders(),
                  body: JSON.stringify(saveToCurrentVersion
                    ? {
                        operation: "publish",
                        description: versionDescription,
                      }
                    : {
                        publish: true,
                        description: versionDescription,
                      }
                  ),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save skill version.");
              }
              const version = data?.version
                ? {
                    ...data.version,
                    ...versionData.currentSnapshot,
                    description: versionDescription,
                  }
                : null;
              if (version) {
                const currentVersionId = String(data?.currentVersionId || version.id || "");
                const publishedVersionId = String(data?.publishedVersionId || version.id || "");
                setSkillVersionState((current) => ({
                  ...current,
                  skillId: selectedSkill.id,
                  status: "ready",
                  error: "",
                  versions: [version, ...current.versions
                    .filter((entry) => entry.id !== version.id)
                    .map((entry) => entry.id === current.publishedVersionId
                      ? { ...entry, status: "saved", publishedAt: null }
                      : entry)],
                  currentVersionId,
                  publishedVersionId,
                }));
                updateSelectedSkillLocal((current) => ({
                  ...current,
                  currentVersionId,
                  publishedVersionId,
                }));
              }
              setSkillCodeEditorState((current) => ({
                ...current,
                initialValue: current.value,
                isSaving: false,
                error: "",
                message: "Saved",
              }));
              setSkillSaveState({ isSaving: false, error: "" });
              return version;
            } catch (error) {
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save skill version.",
              });
              return null;
            }
          }

          async function restoreSelectedSkillVersion(versionId) {
            if (!selectedSkill?.id || !selectedSkill.isCustom || !versionId) {
              return;
            }
            setSkillSaveState({ isSaving: true, error: "" });
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/"
                  + encodeURIComponent(selectedSkill.id) + "/versions/" + encodeURIComponent(versionId),
                {
                  method: "PATCH",
                  credentials: "include",
                  headers: getSkillApiRequestHeaders(),
                  body: JSON.stringify({ operation: "restore" }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to restore skill version.");
              }
              const restored = normalizeSkillRecord(data?.skill);
              if (restored) updateLoadedSkillRecord(selectedSkill.id, restored);
              setSkillVersionState((current) => ({
                ...current,
                currentVersionId: versionId,
              }));
              setSkillSaveState({ isSaving: false, error: "" });
            } catch (error) {
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to restore skill version.",
              });
            }
          }

          async function updateSelectedSkillAccessMetadata(nextMetadata) {
            if (!selectedSkill?.isCustom) return;
            const normalizedMetadata = nextMetadata && typeof nextMetadata === "object"
              ? nextMetadata
              : {};
            updateSelectedSkillLocal((current) => ({ ...current, metadata: normalizedMetadata }));
            await saveSelectedSkillFields({ metadata: normalizedMetadata });
          }
  
          async function saveSelectedSkillFields(partial) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return;
            }
            if (selectedSkill.isDraft) {
              updateSelectedSkillLocal((current) => ({ ...current, ...partial }));
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
  
          async function saveSelectedSkillCodeFiles(nextCodeFiles, options = {}) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return false;
            }
            if (selectedSkill.isDraft) {
              updateSelectedSkillLocal((current) => ({
                ...current,
                codeFiles: normalizeSkillCodeFiles(nextCodeFiles),
              }));
              return true;
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
              if (options.throwOnError) {
                throw error;
              }
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
  
          async function handleSkillCodeFileInputChange(event) {
            try {
              await handleSkillCodeFileSelection(event.target.files);
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
  
          async function handleAttachSkillEnvironmentFiles() {
            if (!selectedSkillEnvironment?.id || !selectedSkill || !selectedSkill.isCustom) {
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
              const mergedFiles = mergePlaygroundSkillCodeFiles(selectedSkill.codeFiles, nextCodeFiles);
              await saveSelectedSkillCodeFiles(mergedFiles);
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
