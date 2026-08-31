          const SKILL_VERSION_COMPARE_CURRENT_EDITOR_ID = "current-editor";
          const [skillVersionChangesState, setSkillVersionChangesState] = useState(null);
          const [skillVersionEditDialog, setSkillVersionEditDialog] = useState(null);
          const [skillVersionDescriptionDraft, setSkillVersionDescriptionDraft] = useState("");
          const [skillVersionsDrawerContainer, setSkillVersionsDrawerContainer] = useState(null);
          const skillVersionDescriptionTextareaRef = useRef(null);

          useEffect(() => {
            setSkillVersionChangesState(null);
            setSkillVersionEditDialog(null);
            setSkillVersionDescriptionDraft("");
          }, [selectedSkill?.id]);

          useLayoutEffect(() => {
            if (!versionsDrawerPortalId || typeof document === "undefined") {
              setSkillVersionsDrawerContainer(null);
              return undefined;
            }
            const updateContainer = () => {
              setSkillVersionsDrawerContainer(document.getElementById(versionsDrawerPortalId));
            };
            updateContainer();
            const frame = window.requestAnimationFrame(updateContainer);
            return () => window.cancelAnimationFrame(frame);
          }, [versionsDrawerPortalId]);

          useEffect(() => {
            if (typeof onVersionsSidebarOpenChange !== "function") return undefined;
            onVersionsSidebarOpenChange(Boolean(skillVersionsOpen));
            return () => onVersionsSidebarOpenChange(false);
          }, [onVersionsSidebarOpenChange, skillVersionsOpen]);

          function getSelectedSkillSaveName(targetSkill = selectedSkill) {
            const name = targetSkill?.isDraft
              ? skillTitleDraft || targetSkill?.name || ""
              : targetSkill?.name || skillTitleDraft || "";
            return String(name).trim().replace(/\s+/g, " ");
          }

          function buildSkillVersionDiffFilesFromSnapshots(baseSnapshot, targetSnapshot) {
            const normalizedBase = normalizeSkillVersionDiffSnapshot(baseSnapshot);
            const normalizedTarget = normalizeSkillVersionDiffSnapshot(targetSnapshot);
            const metadataDiff = createPlaygroundVersionDiffFile({
              id: "skill-metadata",
              path: "skill.json",
              label: "skill.json",
              before: {
                name: normalizedBase.name,
                description: normalizedBase.skillDescription,
                icon: normalizedBase.icon,
                category: normalizedBase.category,
              },
              after: {
                name: normalizedTarget.name,
                description: normalizedTarget.skillDescription,
                icon: normalizedTarget.icon,
                category: normalizedTarget.category,
              },
            });
            const baseFilesByPath = new Map(normalizedBase.codeFiles.map((file) => [
              normalizeHistoryPath(file.name).toLowerCase(),
              file,
            ]));
            const targetFilesByPath = new Map(normalizedTarget.codeFiles.map((file) => [
              normalizeHistoryPath(file.name).toLowerCase(),
              file,
            ]));
            const filePaths = Array.from(new Set([
              ...baseFilesByPath.keys(),
              ...targetFilesByPath.keys(),
            ])).sort((left, right) => left.localeCompare(right));
            const fileDiffs = filePaths.map((normalizedPath) => {
              const baseFile = baseFilesByPath.get(normalizedPath);
              const targetFile = targetFilesByPath.get(normalizedPath);
              const filePath = normalizeHistoryPath(targetFile?.name || baseFile?.name || normalizedPath);
              return createPlaygroundVersionDiffFile({
                id: "skill-source:" + normalizedPath,
                path: filePath,
                label: filePath,
                before: baseFile?.content || "",
                after: targetFile?.content || "",
              });
            });
            return [metadataDiff, ...fileDiffs].filter(Boolean);
          }

          function getSelectedSkillVersionEndpoint(versionId = "") {
            const baseEndpoint = "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId)
              + "/skills/" + encodeURIComponent(selectedSkill?.id || "") + "/versions";
            return versionId
              ? baseEndpoint + "/" + encodeURIComponent(versionId)
              : baseEndpoint;
          }

          function canPublishSelectedSkillVersion(version) {
            const versionId = String(version?.id || "").trim();
            return Boolean(
              versionId
              && versionId !== String(skillVersionState.publishedVersionId || "").trim()
              && String(version?.status || "").toLowerCase() !== "published"
            );
          }

          async function publishSelectedSkillVersion(versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            const targetVersion = skillVersionState.versions.find(
              (version) => String(version?.id || "").trim() === normalizedVersionId
            );
            if (
              !selectedSkill?.id
              || !targetVersion
              || !canPublishSelectedSkillVersion(targetVersion)
              || skillSaveState.isSaving
            ) {
              return;
            }
            if (hasSelectedSkillVersionChanges()) {
              setSkillVersionState((current) => ({
                ...current,
                error: "Save the current changes before publishing another version.",
              }));
              return;
            }
            setSkillSaveState({ isSaving: true, error: "" });
            setSkillVersionState((current) => ({ ...current, status: "loading", error: "" }));
            try {
              const response = await fetch(getSelectedSkillVersionEndpoint(normalizedVersionId), {
                method: "PATCH",
                credentials: "include",
                headers: getSkillApiRequestHeaders(),
                body: JSON.stringify({ operation: "publish", useStoredSnapshot: true }),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to publish skill version.");
              }
              const publishedVersion = data?.version || {
                ...targetVersion,
                status: "published",
              };
              const normalizedSkill = normalizeSkillRecord(data?.skill);
              if (normalizedSkill) {
                updateLoadedSkillRecord(selectedSkill.id, normalizedSkill);
              }
              setSkillVersionState((current) => ({
                ...current,
                status: "ready",
                error: "",
                versions: current.versions.map((version) => {
                  if (String(version?.id || "") === normalizedVersionId) return publishedVersion;
                  if (String(version?.id || "") === String(current.publishedVersionId || "")) {
                    return { ...version, status: "saved", publishedAt: null };
                  }
                  return version;
                }),
                currentVersionId: String(data?.currentVersionId || normalizedVersionId),
                publishedVersionId: String(data?.publishedVersionId || normalizedVersionId),
              }));
              setSkillSaveState({ isSaving: false, error: "" });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to publish skill version.";
              setSkillSaveState({ isSaving: false, error: message });
              setSkillVersionState((current) => ({ ...current, status: "error", error: message }));
            }
          }

          function openEditSelectedSkillVersion(versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            const version = skillVersionState.versions.find(
              (entry) => String(entry?.id || "").trim() === normalizedVersionId
            );
            if (!version || skillSaveState.isSaving) return;
            setSkillVersionDescriptionDraft(String(version.description || ""));
            setSkillVersionEditDialog({ versionId: normalizedVersionId, version });
          }

          async function saveSelectedSkillVersionDescription() {
            if (!skillVersionEditDialog || skillSaveState.isSaving) return;
            setSkillSaveState({ isSaving: true, error: "" });
            setSkillVersionState((current) => ({ ...current, error: "" }));
            try {
              const response = await fetch(
                getSelectedSkillVersionEndpoint(skillVersionEditDialog.versionId),
                {
                  method: "PATCH",
                  credentials: "include",
                  headers: getSkillApiRequestHeaders(),
                  body: JSON.stringify({
                    description: String(skillVersionDescriptionDraft || "").trim().slice(0, 240),
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to update skill version.");
              }
              setSkillVersionState((current) => ({
                ...current,
                status: "ready",
                error: "",
                versions: current.versions.map((version) =>
                  String(version?.id || "") === skillVersionEditDialog.versionId
                    ? { ...version, ...data.version }
                    : version
                ),
              }));
              setSkillSaveState({ isSaving: false, error: "" });
              setSkillVersionEditDialog(null);
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to update skill version.";
              setSkillSaveState({ isSaving: false, error: message });
              setSkillVersionState((current) => ({ ...current, status: "error", error: message }));
            }
          }

          async function deleteSelectedSkillVersion(versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            const targetVersion = skillVersionState.versions.find(
              (version) => String(version?.id || "").trim() === normalizedVersionId
            );
            if (!targetVersion || skillSaveState.isSaving || skillVersionState.versions.length <= 1) {
              return;
            }
            if (normalizedVersionId === String(skillVersionState.publishedVersionId || "")) {
              setSkillVersionState((current) => ({
                ...current,
                error: "The published version cannot be deleted.",
              }));
              return;
            }
            if (
              normalizedVersionId === String(skillVersionState.currentVersionId || "")
              && hasSelectedSkillVersionChanges()
            ) {
              setSkillVersionState((current) => ({
                ...current,
                error: "Revert or save the current changes before deleting this version.",
              }));
              return;
            }
            if (!window.confirm("Delete this skill version?")) return;
            setSkillSaveState({ isSaving: true, error: "" });
            setSkillVersionState((current) => ({ ...current, status: "loading", error: "" }));
            try {
              const response = await fetch(getSelectedSkillVersionEndpoint(normalizedVersionId), {
                method: "DELETE",
                credentials: "include",
                headers: getSkillApiRequestHeaders(),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete skill version.");
              }
              const normalizedSkill = normalizeSkillRecord(data?.skill);
              if (normalizedSkill) updateLoadedSkillRecord(selectedSkill.id, normalizedSkill);
              setSkillVersionState((current) => ({
                ...current,
                status: "ready",
                error: "",
                versions: current.versions.filter(
                  (version) => String(version?.id || "") !== normalizedVersionId
                ),
                currentVersionId: String(data?.currentVersionId || current.publishedVersionId || ""),
              }));
              const deletedSourceId = getSkillVersionCompareVersionSourceId(normalizedVersionId);
              setSkillVersionChangesState((current) => (
                current
                && [current.leftSourceId, current.rightSourceId].includes(deletedSourceId)
                  ? null
                  : current
              ));
              setSkillSaveState({ isSaving: false, error: "" });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Failed to delete skill version.";
              setSkillSaveState({ isSaving: false, error: message });
              setSkillVersionState((current) => ({ ...current, status: "error", error: message }));
            }
          }

          function getSelectedSkillVersionActions(version) {
            const versionId = String(version?.id || "").trim();
            return [
              {
                id: "edit",
                label: "Edit description",
                icon: SquarePen,
                onSelect: () => openEditSelectedSkillVersion(versionId),
              },
              {
                id: "compare",
                label: "View Changes",
                icon: Code2,
                onSelect: () => openSkillVersionChangesModal(versionId),
              },
              {
                id: "delete",
                label: "Delete version",
                icon: Trash2,
                danger: true,
                disabled: versionId === String(skillVersionState.publishedVersionId || "")
                  || skillVersionState.versions.length <= 1,
                onSelect: () => void deleteSelectedSkillVersion(versionId),
              },
            ];
          }

          function getSkillVersionCompareVersionSourceId(versionId) {
            const normalizedVersionId = String(versionId || "").trim();
            return normalizedVersionId ? "version:" + normalizedVersionId : "";
          }

          function getSkillVersionCompareVersionId(sourceId) {
            const normalizedSourceId = String(sourceId || "").trim();
            return normalizedSourceId.startsWith("version:")
              ? normalizedSourceId.slice("version:".length).trim()
              : "";
          }

          function buildSkillVersionCompareSources() {
            return [{
              id: SKILL_VERSION_COMPARE_CURRENT_EDITOR_ID,
              label: "Current editor",
              snapshot: buildCurrentSkillVersionSnapshot(),
              version: null,
            }].concat(skillVersionState.versions.map((version) => ({
              id: getSkillVersionCompareVersionSourceId(version.id),
              label: String(version.label || formatPlatformVersionLabel(version.version) || "Version"),
              snapshot: version?.snapshot && typeof version.snapshot === "object"
                ? { ...version, ...version.snapshot }
                : version,
              version,
            })));
          }

          function compareSkillVersionSourceChronology(leftSource, rightSource) {
            if (!getSkillVersionCompareVersionId(leftSource?.id)
              || !getSkillVersionCompareVersionId(rightSource?.id)) return 0;
            const leftVersion = Number(leftSource?.version?.version || 0);
            const rightVersion = Number(rightSource?.version?.version || 0);
            if (leftVersion && rightVersion && leftVersion !== rightVersion) {
              return leftVersion - rightVersion;
            }
            const leftTimestamp = Date.parse(String(
              leftSource?.version?.publishedAt || leftSource?.version?.updatedAt || leftSource?.version?.createdAt || ""
            ));
            const rightTimestamp = Date.parse(String(
              rightSource?.version?.publishedAt || rightSource?.version?.updatedAt || rightSource?.version?.createdAt || ""
            ));
            return Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp)
              ? leftTimestamp - rightTimestamp
              : String(leftSource.id).localeCompare(String(rightSource.id));
          }

          function orderSkillVersionCompareSources(leftSource, rightSource) {
            return compareSkillVersionSourceChronology(leftSource, rightSource) > 0
              ? {
                  leftSource: rightSource,
                  rightSource: leftSource,
                  leftStateSide: "right",
                  rightStateSide: "left",
                }
              : { leftSource, rightSource, leftStateSide: "left", rightStateSide: "right" };
          }

          function getDefaultSkillVersionCompareSourceIds(versionId = "") {
            const sources = buildSkillVersionCompareSources();
            const currentEditorSource = sources.find(
              (source) => source.id === SKILL_VERSION_COMPARE_CURRENT_EDITOR_ID
            ) || null;
            const versionSources = sources
              .filter((source) => Boolean(getSkillVersionCompareVersionId(source.id)))
              .sort(compareSkillVersionSourceChronology);
            const preferredVersionIds = [
              versionId,
              skillVersionState.currentVersionId,
              skillVersionState.publishedVersionId,
            ].map((value) => String(value || "").trim()).filter(Boolean);
            const targetSource = preferredVersionIds.reduce(
              (match, preferredVersionId) => match || versionSources.find(
                (source) => getSkillVersionCompareVersionId(source.id) === preferredVersionId
              ),
              null
            ) || versionSources[versionSources.length - 1] || currentEditorSource;
            if (!targetSource) {
              return {
                leftSourceId: SKILL_VERSION_COMPARE_CURRENT_EDITOR_ID,
                rightSourceId: SKILL_VERSION_COMPARE_CURRENT_EDITOR_ID,
              };
            }
            const targetIndex = versionSources.findIndex(
              (source) => source.id === targetSource.id
            );
            const previousSource = targetIndex > 0 ? versionSources[targetIndex - 1] : null;
            const nextSource = targetIndex >= 0 ? versionSources[targetIndex + 1] || null : null;
            const editorHasChanges = Boolean(
              currentEditorSource
              && buildSkillVersionDiffFilesFromSnapshots(
                targetSource.snapshot,
                currentEditorSource.snapshot
              ).length
            );
            if (!String(versionId || "").trim() && editorHasChanges) {
              return {
                leftSourceId: targetSource.id,
                rightSourceId: currentEditorSource.id,
              };
            }
            if (previousSource) {
              return {
                leftSourceId: previousSource.id,
                rightSourceId: targetSource.id,
              };
            }
            if (editorHasChanges) {
              return {
                leftSourceId: targetSource.id,
                rightSourceId: currentEditorSource.id,
              };
            }
            return {
              leftSourceId: targetSource.id,
              rightSourceId: nextSource?.id || currentEditorSource?.id || targetSource.id,
            };
          }

          function openSkillVersionChangesModal(versionId) {
            if (!selectedSkill?.id) return;
            const compareSourceIds = getDefaultSkillVersionCompareSourceIds(versionId);
            setSkillVersionsOpen(false);
            setSkillVersionChangesState(compareSourceIds);
          }

          function handleSkillVersionCompareSourceChange(side, sourceId) {
            setSkillVersionChangesState((current) => ({
              ...(current || {}),
              [side === "left" ? "leftSourceId" : "rightSourceId"]:
                String(sourceId || "").trim() || SKILL_VERSION_COMPARE_CURRENT_EDITOR_ID,
            }));
          }

          function renderSkillVersionChangesModal(actions = null) {
            if (!skillVersionChangesState) return null;
            const sources = buildSkillVersionCompareSources();
            const currentSource = sources[0] || null;
            const leftSource = sources.find(
              (source) => source.id === skillVersionChangesState.leftSourceId
            ) || sources[1] || currentSource;
            const rightSource = sources.find(
              (source) => source.id === skillVersionChangesState.rightSourceId
            ) || currentSource;
            if (!leftSource || !rightSource) return null;
            const orderedSources = orderSkillVersionCompareSources(leftSource, rightSource);
            const options = sources.map((source) => ({
              value: source.id,
              label: source.label,
            }));
            return renderPlaygroundVersionChangesModal({
              title: "Changes",
              leftSelector: {
                value: orderedSources.leftSource.id,
                options,
                onValueChange: (value) => handleSkillVersionCompareSourceChange(orderedSources.leftStateSide, value),
                ariaLabel: "Select base skill version",
              },
              rightSelector: {
                value: orderedSources.rightSource.id,
                options,
                onValueChange: (value) => handleSkillVersionCompareSourceChange(orderedSources.rightStateSide, value),
                ariaLabel: "Select target skill version",
              },
              actions,
              files: buildSkillVersionDiffFilesFromSnapshots(
                orderedSources.leftSource.snapshot,
                orderedSources.rightSource.snapshot
              ),
              closeButtonLabel: "Close skill version changes",
              onClose: () => setSkillVersionChangesState(null),
              emptyMessage: "No differences between the selected versions.",
              className: "playground-skills-version-changes-modal__content",
            });
          }

          function renderSkillVersionEditDialog() {
            if (!skillVersionEditDialog) return null;
            const isBusy = skillSaveState.isSaving;
            const versionLabel = formatPlatformVersionLabel(
              skillVersionEditDialog.version?.version
            );
            return React.createElement(PlatformModal, {
              open: true,
              onClose: () => {
                if (!isBusy) setSkillVersionEditDialog(null);
              },
              as: "form",
              size: "medium",
              title: "Edit " + versionLabel,
              ariaLabel: "Edit skill version description",
              initialFocusRef: skillVersionDescriptionTextareaRef,
              className: "playground-agents-version-modal playground-skills-version-modal",
              surfaceProps: {
                onSubmit: (event) => {
                  event.preventDefault();
                  void saveSelectedSkillVersionDescription();
                },
              },
              footer: React.createElement(React.Fragment, null,
                React.createElement(PlatformSecondaryButton, {
                  size: "medium",
                  type: "button",
                  disabled: isBusy,
                  onClick: () => setSkillVersionEditDialog(null),
                }, "Cancel"),
                React.createElement(PlatformPrimaryButton, {
                  size: "medium",
                  type: "submit",
                  disabled: isBusy,
                }, isBusy ? "Saving..." : "Save Version")
              ),
              children: React.createElement("label", {
                  className: "playground-tasks-detail-description playground-agents-version-description-editor",
                },
                React.createElement("span", {
                  className: "playground-tasks-detail-section-title",
                }, "Description"),
                React.createElement("textarea", {
                  ref: skillVersionDescriptionTextareaRef,
                  className: "playground-tasks-detail-description-input is-editing",
                  rows: 5,
                  maxLength: 240,
                  placeholder: "Describe what changed in this version.",
                  value: skillVersionDescriptionDraft,
                  disabled: isBusy,
                  onChange: (event) => setSkillVersionDescriptionDraft(event.target.value),
                }),
                skillVersionState.error
                  ? React.createElement("span", {
                      className: "playground-tasks-project-modal-error",
                      role: "alert",
                    }, skillVersionState.error)
                  : null
              ),
            });
          }

          useEffect(() => {
            const canUseSkillVersionShortcut = Boolean(
              skillsPageMode === "detail"
              && selectedSkill?.isCustom
            );
            if (!canUseSkillVersionShortcut) {
              return undefined;
            }

            function handleSkillVersionKeyboardShortcut(event) {
              const isCommandShortcut = Boolean(event.metaKey || event.ctrlKey);
              if (
                !isCommandShortcut
                || event.altKey
                || event.repeat
                || String(event.key || "").toLowerCase() !== "s"
              ) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              if (
                skillSaveState.isSaving
                || skillCodeFilesTransferState.isProcessing
                || skillVersionState.status === "loading"
                || skillVersionSaveDialog
                || skillVersionEditDialog
              ) {
                return;
              }
              openSkillVersionSaveDialog({
                mode: event.shiftKey ? "new" : undefined,
              });
            }

            window.addEventListener("keydown", handleSkillVersionKeyboardShortcut, true);
            return () => window.removeEventListener("keydown", handleSkillVersionKeyboardShortcut, true);
          }, [
            selectedSkill,
            skillCodeEditorState.fileId,
            skillCodeEditorState.initialValue,
            skillCodeEditorState.value,
            skillCodeFilesTransferState.isProcessing,
            skillSaveState.isSaving,
            skillVersionEditDialog,
            skillVersionSaveDialog,
            skillVersionState.currentVersionId,
            skillVersionState.status,
            skillVersionState.versions,
            skillsPageMode,
          ]);

          function renderSkillVersionSaveDialog() {
            if (!skillVersionSaveDialog) {
              return null;
            }
            const versionData = buildSkillVersionSaveDialogData();
            const isBusy = skillSaveState.isSaving || skillCodeFilesTransferState.isProcessing;
            return React.createElement(PlatformVersionSaveDialog, {
              open: true,
              title: "Review changes",
              currentVersion: versionData.currentVersion,
              nextVersion: versionData.nextVersion,
              currentDescription: versionData.currentDescription,
              initialMode: skillVersionSaveDialog.initialMode || "new",
              canSaveCurrent: versionData.canSaveCurrent,
              instanceKey: skillVersionSaveDialog.key,
              pending: isBusy,
              error: skillSaveState.error || skillVersionState.error || null,
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
                if (!isBusy) setSkillVersionSaveDialog(null);
              },
              onSubmit: async (details) => {
                const savedVersion = await saveAndPublishSelectedSkillVersion(details);
                if (!savedVersion) {
                  throw new Error("The skill could not be saved. Review the validation details and try again.");
                }
                setSkillVersionSaveDialog(null);
              },
            });
          }
